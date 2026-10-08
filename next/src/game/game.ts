import { astar, CITIES, NAV, NH, NW, type World } from "../world/gen";
import type { Camera } from "../render/camera";
import type { WorldView } from "../render/worldView";
import type { Hud } from "../ui/hud";
import { ROW_NEED, TALENT_BY_ID, branchSpent, type Talent } from "./talents";
import { CONS_BY_ID, REFINES, gearCost, type Cost, type Mat } from "./crafting";
import { GIVERS, SIDE_TEXT, type SideKind, type SideQuest } from "./sidequests";
import { audio } from "../audio";
import { TACTICS, TACTIC_KEYS, fight, odds, stanceWeights, tacticDelta, type BattleResult, type Boss, type Champion, type Tactic } from "./battle";
import { BUILDINGS, BUILDING_BY_ID, CITY_NAME, DAY_SEC, RES_KEYS, UNITS, UNIT_KEYS, army, armyPower, armySize, buildCost, buildTime, prodPerMin, storageCap, trainSpeed, unitUnlocked, xpNeed, type Army, type BuildingId, type Res, type Unit } from "./data";
import { CITY_TRADE, GOODS, GOOD_KEYS, PLUS_CHANCE, STAT_INFO, canPlus, classItem, goodMult, itemPrice, makeItem, plusCost, rollItem, setPlus, skillLv, type Good, type Item, type Skill, type Slot, type Stat } from "./rpg";
import { CLASS_BY_ID, CLASS_SKILLS, SKILL_MAX, WEAPON_NAME, WEAPON_STAT, skillPow, skillRank, type ClassDef, type ClassId, type ClassSkill, type WeaponKind } from "./classes";
import { CHAPTERS, COMP_BY_ID, COMP_MAX, FORT_GUARD, KARA_HAN, KASIM, type Chapter, type CompId, type CompMods, type Companion } from "./story";
import { CAPITAL, SLAVE_RADIUS, banditArmy, campGarrison, kurganBoss, kurganGuard, loadGame, saveGame as rawSave, wipeGame, type Bandit, type Bounty, type Contract, type GameState } from "./state";

export type Target =
  | { kind: "village" | "camp" | "node" | "ruin" | "city" | "bandit" | "kurgan"; i: number }
  | { kind: "capital" }
  | { kind: "fort" }
  | { kind: "point"; x: number; y: number };

export interface Quest {
  title: string;
  text: string;
  done: (g: Game) => boolean;
  reward: Partial<Res>;
  goto?: (g: Game) => { x: number; y: number } | null;
}

export interface Activity {
  label: string;
  t: number;
  dur: number;
  done: () => void;
}

const HERO_SPEED = 32;
const BANDIT_SPEED = 21;
const MARCH_SPEED = 26;
const CAP_I = CITIES.findIndex((c) => c.id === "samarkand");
const RES_SELL: Record<keyof Res, number> = { gold: 1, wood: 3, stone: 4, food: 2 };
const WAGE: Record<Unit, number> = { spear: 0.5, archer: 0.8, horse: 1.4 };
export const LORD_SERAIS = 8;
let wiped = false;
const saveGame = (s: GameState) => wiped || rawSave(s);

export class Game {
  s: GameState;
  hud!: Hud;
  act: Activity | null = null;
  target: Target | null = null;
  private repath = 0;
  private fogT = 0;
  private saveT = 0;
  private desertT = 0;
  private ambushT = 30;
  private lastCity = -2;
  lastTactic: Tactic = "hucum";
  private spawnAt = new Map<number, number>();
  battleLock = false;

  constructor(public world: World, public view: WorldView, public cam: Camera) {
    this.s = loadGame(world);
    this.reveal(CAPITAL.x, CAPITAL.y, 16);
    this.reveal(this.s.hero.x, this.s.hero.y, 11);
    cam.zoom = 0.75;
    cam.x = this.s.hero.x;
    cam.y = this.s.hero.y;
    window.addEventListener("beforeunload", () => saveGame(this.s));
    document.addEventListener("visibilitychange", () => document.hidden && saveGame(this.s));
  }

  resetGame(): void {
    wiped = true;
    wipeGame();
    location.reload();
  }

  get now(): number {
    return Date.now();
  }

  bld(id: BuildingId): number {
    return this.s.buildings[id].lv;
  }

  stat(k: Stat): number {
    const h = this.s.hero;
    let v = h.stats[k];
    for (const it of Object.values(h.equip)) if (it) v += k === "lid" ? it.lid : k === "kar" ? it.kar : 0;
    return v;
  }

  skill(k: Skill): number {
    return skillLv(this.s.hero.skills[k] ?? 0);
  }

  eq(slot: Slot): Item | undefined {
    return this.s.hero.equip[slot];
  }

  maxHp(): number {
    const h = this.s.hero;
    return Math.round((40 + this.stat("day") * 12 + h.lv * 4 + (this.eq("zirh")?.hp ?? 0)) * (1 + 0.03 * this.tal("demirten")));
  }

  tal(id: string): number {
    return this.s.hero.tal[id] ?? 0;
  }

  talentReason(t: Talent): string | null {
    const h = this.s.hero;
    if (this.tal(t.id) >= t.max) return "Tamamlandı";
    const need = t.row * ROW_NEED;
    if (branchSpent(h.tal, t.branch) < need) return `Bu dala ${need} puan gerekir`;
    if (h.tpts <= 0) return "Yetenek puanın yok";
    return null;
  }

  learnTalent(id: string): void {
    const t = TALENT_BY_ID[id];
    if (!t || this.talentReason(t)) return;
    const h = this.s.hero;
    h.tpts--;
    h.tal[id] = this.tal(id) + 1;
    this.hud.toast(`${t.name} ${h.tal[id]}/${t.max}`, "good");
  }

  respecCost(): number {
    return 100 + this.s.hero.lv * 60;
  }

  respecTalents(): void {
    const h = this.s.hero;
    const spent = Object.values(h.tal).reduce((a, b) => a + b, 0);
    if (!spent || !this.pay({ gold: this.respecCost() })) return;
    h.tal = {};
    h.tpts += spent;
    this.hud.toast(`Yetenekler sıfırlandı: ${spent} puan geri geldi`, "good");
  }

  tdelta(t: Tactic, foe: Tactic): number {
    const r = this.tal("taktik");
    const edge = TACTICS[t].beats === foe || TACTICS[foe].beats === t ? 0.08 * r : 0;
    return tacticDelta(t, foe, this.s.hero.army, this.stat("cev")) + edge;
  }

  maxEnergy(): number {
    return 50 + this.stat("day") * 6;
  }

  cls(): ClassDef {
    return CLASS_BY_ID[this.s.cls ?? "alp"];
  }

  face(): string {
    return this.s.free ? this.cls().portrait : "heroes/slave";
  }

  chooseClass(id: ClassId, name: string): void {
    const s = this.s;
    const c = CLASS_BY_ID[id];
    s.cls = id;
    s.hero.stats = { ...c.start };
    s.hero.name = name.trim().slice(0, 16) || "Toygar";
    s.hero.hp = this.maxHp();
    s.hero.energy = this.maxEnergy();
    saveGame(s);
  }

  canUse(it: Item): string | null {
    const c = this.cls();
    if (it.slot === "silah" && !c.weapons.includes(it.kind as WeaponKind)) return `${c.name} bu silahı kullanamaz`;
    if (it.slot === "zirh" && it.kind === "agir" && c.armor !== "agir") return `${c.name} ağır zırh giyemez`;
    if (it.slot === "kalkan" && !c.shield) return `${c.name} kalkan taşıyamaz`;
    if (this.s.hero.lv < it.lvReq) return `Seviye ${it.lvReq} gerekir`;
    if (it.req && this.s.hero.stats[it.req.stat] < it.req.v) return `${STAT_INFO[it.req.stat].name} ${it.req.v} gerekir`;
    return null;
  }

  heroAtk(): number {
    const w = this.eq("silah");
    const m = this.cls().mods.atk * (1 + 0.04 * this.tal("keskin") + 0.15 * this.tal("efsane"));
    if (!w) return (2 + this.stat("guc") * 1.5) * m * (1 + this.compMods().atk);
    return (w.atk + this.stat(WEAPON_STAT[w.kind as WeaponKind] ?? "guc") * 1.5) * (1 + this.skill("silah") * 0.06) * m * (1 + this.compMods().atk);
  }

  heroDef(): number {
    return ((this.eq("zirh")?.def ?? 0) + (this.eq("kalkan")?.def ?? 0) + this.stat("day") * 0.6) * this.cls().mods.def * (1 + 0.05 * this.tal("demirten") + 0.15 * this.tal("efsane"));
  }

  champion(): Champion {
    const m = this.cls().mods;
    return {
      atk: this.heroAtk() * (this.buff("totem") ? 1.25 : 1),
      def: this.heroDef(),
      hp: this.s.hero.hp,
      maxHp: this.maxHp(),
      crit: m.crit + (this.eq("silah")?.crit ?? 0) + 0.025 * this.tal("kritik"),
      critMult: m.critMult,
      dodge: m.dodge,
      heal: m.heal + this.compMods().heal + 0.015 * this.tal("kanici") + (this.buff("tutsu") ? 0.04 : 0),
      rage: m.rage,
      firstStrike: m.firstStrike,
      skills: this.classSkills()
        .map((sk) => ({ name: sk.name, kind: sk.kind, pow: skillPow(sk, this.s.hero.cskill[sk.id] ?? 0) }))
        .filter((x) => x.pow > 0),
    };
  }

  classSkills(): ClassSkill[] {
    return CLASS_SKILLS[this.s.cls ?? "alp"];
  }

  skillLvOf(id: string): number {
    return this.s.hero.cskill[id] ?? 0;
  }

  learnReason(sk: ClassSkill): string | null {
    const h = this.s.hero;
    if (h.lv < sk.unlock) return `Seviye ${sk.unlock} gerekir`;
    if (this.skillLvOf(sk.id) >= SKILL_MAX) return "Ustalaştın";
    if (h.spts <= 0) return "Beceri puanın yok";
    return null;
  }

  learn(id: string): void {
    const sk = this.classSkills().find((x) => x.id === id);
    if (!sk || this.learnReason(sk)) return;
    const h = this.s.hero;
    h.spts--;
    h.cskill[id] = this.skillLvOf(id) + 1;
    this.hud.toast(`${sk.name} ${skillRank(h.cskill[id])}`, "good");
  }

  stealMult(): number {
    return 1 + 0.1 * this.tal("ganimet") + this.classSkills().filter((s) => s.kind === "steal").reduce((t, s) => t + skillPow(s, this.skillLvOf(s.id)), 0);
  }

  heroBonus(): number {
    return 0.025 * this.stat("lid") + 0.02 * (this.s.hero.lv - 1) + this.cls().mods.army + this.compMods().army + 0.03 * this.tal("nara") + (this.buff("davul") ? 0.15 : 0);
  }

  heroCap(): number {
    if (!this.s.free) return 0;
    return 2 + this.stat("lid") * 3 + this.s.hero.lv + (this.s.beylik ? this.bld("saray") * 5 : 0) + 3 * this.tal("komutan");
  }

  carryCap(): number {
    return 10 + this.stat("guc") * 3 + (this.eq("at")?.carry ?? 0) + armySize(this.s.hero.army) * 2 + this.compMods().carry + 15 * this.tal("deve");
  }

  cargoUsed(): number {
    return GOOD_KEYS.reduce((a, g) => a + (this.s.hero.cargo[g] ?? 0), 0);
  }

  cap(): number {
    return this.s.beylik ? storageCap(this.bld("depo")) : 99999;
  }

  wagePerMin(): number {
    return UNIT_KEYS.reduce((a, u) => a + this.s.hero.army[u] * WAGE[u], 0) * (1 - 0.1 * this.tal("kurtsurusu"));
  }

  upkeepPerMin(): number {
    return (armySize(this.s.garrison) + this.s.marches.reduce((a, m) => a + armySize(m.army), 0)) * 0.4;
  }

  ratePerMin(k: keyof Res): number {
    let r = 0;
    if (this.s.beylik) for (const b of BUILDINGS) if (b.produces === k) r += prodPerMin(b, this.bld(b.id));
    if (k === "food") r -= this.upkeepPerMin();
    if (k === "gold") r -= this.wagePerMin();
    return r;
  }

  canAfford(c: Partial<Res>): boolean {
    return RES_KEYS.every((k) => this.s.res[k] >= (c[k] ?? 0));
  }

  pay(c: Partial<Res>): boolean {
    if (!this.canAfford(c)) return false;
    for (const k of RES_KEYS) this.s.res[k] -= c[k] ?? 0;
    return true;
  }

  gain(c: Partial<Res>): void {
    const cap = this.cap();
    for (const k of RES_KEYS) this.s.res[k] = Math.min(Math.max(cap, this.s.res[k]), this.s.res[k] + (c[k] ?? 0));
  }

  nearCity(r = 150): number {
    const h = this.s.hero;
    return CITIES.findIndex((c) => Math.hypot(c.x - h.x, c.y - h.y) < r);
  }

  update(dt: number): void {
    const s = this.s;
    const now = this.now;
    s.time += dt;
    this.vitals(dt);
    this.produce(now, dt);
    this.builds(now);
    this.training(now);
    if (this.act && !this.battleLock) {
      this.act.t += dt;
      if (this.act.t >= this.act.dur) {
        const a = this.act;
        this.act = null;
        a.done();
      }
    }
    if (!this.battleLock) {
      this.moveHero(dt);
      this.bandits(dt, now);
      this.marches(dt, now);
    }
    this.fogT += dt;
    if (this.fogT > 0.25) {
      this.fogT = 0;
      this.reveal(s.hero.x, s.hero.y, 11 + this.compMods().sight + 2 * this.tal("kartal"));
      for (const m of s.marches) this.reveal(m.x, m.y, 5);
    }
    this.quests();
    this.storyTick();
    this.worldEvents(dt, now);
    this.checkContract();
    this.seraiVisit();
    this.sideTick();
    this.saveT += dt;
    if (this.saveT > 8) {
      this.saveT = 0;
      saveGame(s);
    }
  }

  private vitals(dt: number): void {
    const h = this.s.hero;
    const inTown = this.nearCity() >= 0;
    const mh = this.maxHp();
    const me = this.maxEnergy();
    h.hp = Math.min(mh, h.hp + (mh / 240) * dt * (inTown ? 3 : 1));
    h.energy = Math.min(me, h.energy + (dt / 2) * (inTown ? 2 : 1));
  }

  private produce(now: number, dt: number): void {
    const s = this.s;
    const el = Math.max(0, (now - s.resAt) / 60000);
    if (el <= 0) return;
    s.resAt = now;
    const cap = this.cap();
    for (const k of RES_KEYS) {
      const r = this.ratePerMin(k) * el;
      if (r >= 0) s.res[k] = Math.max(s.res[k], Math.min(cap, s.res[k] + r));
      else s.res[k] = Math.max(0, s.res[k] + r);
    }
    if (s.res.gold <= 0 && this.wagePerMin() > 0) {
      this.desertT += dt;
      if (this.desertT > 15) {
        this.desertT = 0;
        const u = UNIT_KEYS.filter((k) => s.hero.army[k] > 0).sort((a, b) => WAGE[b] - WAGE[a])[0];
        if (u) {
          s.hero.army[u]--;
          this.hud?.toast(`Ücreti ödenmeyen bir ${UNITS[u].name} birliği terk etti!`, "bad");
        }
      }
    } else this.desertT = 0;
    const decay = Math.exp(-el * 0.35);
    for (const m of Object.values(s.markets)) for (const g of GOOD_KEYS) if (m[g]) m[g] = m[g]! * decay;
    for (const v of s.villages) {
      if (v.rec < this.volMax(v.rep) && now >= v.recAt) {
        v.rec++;
        v.recAt = now + 45000;
      }
    }
    for (const c of s.camps) {
      if (!c.alive && now >= c.respawnAt) {
        c.alive = true;
        c.garrison = campGarrison(c.tier);
      }
    }
    for (const n of s.nodes) if (n.left < n.max && now >= n.regenAt) n.left = n.max;
    for (const [id, sr] of Object.entries(s.serais)) sr.coffer = Math.min(this.seraiCap(id), sr.coffer + this.seraiRate(id) * el);
    for (const k of s.kurgans)
      if (!k.alive && now >= k.respawnAt) {
        k.alive = true;
        k.guard = kurganGuard(k.tier);
      }
  }

  volMax(rep: number): number {
    return 3 + Math.floor(this.stat("kar") / 2) + Math.floor(rep / 15);
  }

  private builds(now: number): void {
    for (const b of BUILDINGS) {
      const st = this.s.buildings[b.id];
      if (st.until && now >= st.until) {
        st.until = 0;
        st.lv++;
        this.s.c.built++;
        this.hud?.toast(`${b.name} seviye ${st.lv} oldu!`, "good");
      }
    }
  }

  building(): BuildingId | null {
    return BUILDINGS.find((b) => this.s.buildings[b.id].until > 0)?.id ?? null;
  }

  upgradeReason(id: BuildingId): string | null {
    const lv = this.bld(id);
    if (!this.s.beylik) return "Önce beylik kur";
    if (this.building()) return "Bir inşaat sürüyor";
    if (id !== "saray" && lv >= this.bld("saray")) return "Önce Sarayı geliştir";
    if (lv >= 20) return "En yüksek seviye";
    if (!this.canAfford(buildCost(BUILDING_BY_ID[id], lv + 1))) return "Kaynak yetersiz";
    return null;
  }

  upgrade(id: BuildingId): void {
    if (this.upgradeReason(id)) return;
    const lv = this.bld(id);
    this.pay(buildCost(BUILDING_BY_ID[id], lv + 1));
    this.s.buildings[id].until = this.now + buildTime(lv + 1) * 1000;
    this.hud.toast(`${BUILDING_BY_ID[id].name} inşaatı başladı`, "info");
  }

  private training(now: number): void {
    const q = this.s.queue;
    while (q.length && now >= q[0].done) {
      const o = q.shift()!;
      this.s.garrison[o.unit] += o.n;
      this.s.c.trained += o.n;
      this.hud?.toast(`${o.n} ${UNITS[o.unit].name} eğitimi tamamlandı`, "good");
    }
  }

  trainCost(u: Unit, n: number): Res {
    const c = UNITS[u].cost;
    return { gold: (c.gold ?? 0) * n, food: (c.food ?? 0) * n, wood: (c.wood ?? 0) * n, stone: 0 };
  }

  train(u: Unit, n: number): boolean {
    if (!this.s.beylik || n <= 0 || !unitUnlocked(u, this.bld("kisla")) || this.s.queue.length >= 3 || !this.pay(this.trainCost(u, n))) return false;
    const each = (UNITS[u].time * 1000) / trainSpeed(this.bld("kisla"));
    const start = Math.max(this.now, this.s.queue.at(-1)?.done ?? 0);
    this.s.queue.push({ unit: u, n, done: start + each * n, each });
    return true;
  }

  atCapital(): boolean {
    return Math.hypot(this.s.hero.x - CAPITAL.x, this.s.hero.y - CAPITAL.y) < 170;
  }

  transfer(u: Unit, n: number): void {
    const s = this.s;
    if (!this.atCapital()) return;
    if (n > 0) {
      const room = this.heroCap() - armySize(s.hero.army);
      const k = Math.min(n, s.garrison[u], room);
      s.garrison[u] -= k;
      s.hero.army[u] += k;
    } else {
      const k = Math.min(-n, s.hero.army[u]);
      s.hero.army[u] -= k;
      s.garrison[u] += k;
    }
  }

  // ---------- activities ----------

  busy(): boolean {
    if (this.act) {
      this.hud.toast(`Şu an meşgulsün: ${this.act.label}`, "bad");
      return true;
    }
    return false;
  }

  private start(label: string, dur: number, done: () => void): void {
    this.s.hero.path = null;
    this.target = null;
    this.act = { label, t: 0, dur, done };
  }

  workGain(kind: keyof Res): number {
    const base = { wood: 10, stone: 8, food: 12, gold: 3 }[kind];
    return Math.round(base * (1 + this.stat("guc") * 0.08 + this.skill("emek") * 0.05));
  }

  slaveWage(): number {
    return 3 + Math.floor(this.stat("guc") / 2) + Math.floor(this.skill("emek") / 2);
  }

  work(i: number): void {
    const n = this.s.nodes[i];
    const h = this.s.hero;
    if (this.busy()) return;
    if (Math.hypot(n.x - h.x, n.y - h.y) > 90) return this.hud.toast("Çalışmak için oraya gitmelisin", "bad");
    if (h.energy < 10) return this.hud.toast("Çok yorgunsun. Biraz bekle ya da şehirde dinlen.", "bad");
    if (this.s.free && n.left <= 0) return this.hud.toast("Burası tükendi", "bad");
    h.energy -= 10;
    const label = { wood: "Odun kesiyorsun", stone: "Taş kırıyorsun", food: "Tarlada çalışıyorsun", gold: "Madende kazıyorsun" }[n.kind];
    this.start(label, 5, () => {
      const s = this.s;
      s.c.shifts++;
      s.hero.skills.emek += 12;
      const up = this.addXp(5);
      if (!s.free) {
        const w = this.slaveWage() + Math.floor(Math.random() * 3);
        s.res.gold += w;
        this.hud.toast(`Vardiya bitti. Efendin sana ${w} akçe verdi.${up ? " Seviye atladın!" : ""}`, "good");
      } else {
        const k = Math.min(n.left, this.workGain(n.kind));
        n.left -= k;
        if (n.left < n.max) n.regenAt = this.now + 10 * 60000;
        this.gain({ [n.kind]: k });
        this.hud.toast(`+${k} ${({ wood: "kereste", stone: "taş", food: "yiyecek", gold: "altın" } as const)[n.kind]}${up ? " · Seviye atladın!" : ""}`, "good");
      }
    });
  }

  trainCostGold(): number {
    return 4 + this.s.hero.lv * 3;
  }

  trainSkill(): void {
    const h = this.s.hero;
    if (this.busy()) return;
    if (this.nearCity() < 0) return this.hud.toast("Talim için bir şehirde olmalısın", "bad");
    if (h.energy < 15) return this.hud.toast("Çok yorgunsun", "bad");
    if (!this.pay({ gold: this.trainCostGold() })) return this.hud.toast("Hocaya verecek altının yok", "bad");
    h.energy -= 15;
    const c = this.cls();
    this.start(`${c.name} talimi`, 6, () => {
      const before = this.skill("silah");
      h.skills.silah += 30 + this.stat(c.primary[0]) * 3;
      this.s.c.trains++;
      const up = this.addXp(4);
      const after = this.skill("silah");
      this.hud.toast(after > before ? `Silah ustalığın ${after}. seviyeye çıktı!` : "Talim tamamlandı", "good");
      if (up) this.hud.toast("Seviye atladın! Stat puanı kazandın.", "good");
    });
  }

  restCost(): number {
    const ci = this.nearCity();
    if (ci >= 0 && this.s.serais[CITIES[ci].id]) return 0;
    return 2 + this.s.hero.lv * 2;
  }

  rest(): void {
    const h = this.s.hero;
    if (this.busy()) return;
    if (this.nearCity() < 0) return;
    if (this.restCost() > 0 && !this.pay({ gold: this.restCost() })) return this.hud.toast("Han parası yok", "bad");
    this.start("Handa dinleniyorsun", 3, () => {
      h.energy = this.maxEnergy();
      h.hp = this.maxHp();
      this.hud.toast("Dinlendin. Can ve enerji doldu.", "good");
    });
  }

  freedomCost(): number {
    return 80;
  }

  buyFreedom(): void {
    const s = this.s;
    if (s.free || !this.atCapital() || !this.pay({ gold: this.freedomCost() })) return;
    s.free = true;
    const c = this.cls();
    const armor = makeItem(s.nextId++, "zirh", 1, 0, c.armor);
    s.hero.equip.zirh = armor;
    this.view.heroPortrait(c.portrait);
    this.hud.story(
      "Hürriyet!",
      c.portrait,
      `Efendin akçeleri sayıp boynundaki demir halkayı çözdü. "Git bakalım ${s.hero.name}, yollar senin artık."<br><br>Sırtında eski bir ${armor.name.toLocaleLowerCase("tr")}, kalbinde bir <b>${c.name}</b> ateşi var. ${c.passive}<br><br>Demirciden ${c.weapons.map((w) => WEAPON_NAME[w].toLocaleLowerCase("tr")).join(" ya da ")} al, talim yap, köylerden yoldaş topla. Bir gün kendi beyliğini kuracaksın.`,
    );
    const ch = CHAPTERS[0];
    this.hud.story(`Kara Tamga Destanı · Bölüm 1: ${ch.title}`, ch.img, `${ch.intro}<br><br><b>Hedef:</b> ${ch.goal}`, "Yola çık");
  }

  beylikCost(): { gold: number; renown: number } {
    return { gold: 1500, renown: 40 };
  }

  foundBeylik(): void {
    const s = this.s;
    const c = this.beylikCost();
    if (!s.free || s.beylik || !this.atCapital() || s.renown < c.renown || !this.pay({ gold: c.gold })) return;
    s.beylik = true;
    for (const b of BUILDINGS) s.buildings[b.id].lv = b.id === "sur" ? 0 : 1;
    this.gain({ wood: 400, stone: 250, food: 400 });
    this.hud.story(
      "Beylik kuruldu!",
      "cities/samarkand",
      `Semerkant'ın ileri gelenleri adını duymuş. Eskiden köle olan ${s.hero.name} şimdi şehrin dışındaki toprakların beyi. Binalarını geliştir, kışlada asker yetiştir, kaynak noktalarına toplama seferleri gönder.`,
    );
  }

  statUp(k: Stat): void {
    const h = this.s.hero;
    if (h.points <= 0) return;
    h.points--;
    h.stats[k]++;
    if (k === "day") h.hp += 12;
  }

  // ---------- trade ----------

  market(city: string): Partial<Record<Good, number>> {
    return (this.s.markets[city] ??= {});
  }

  price(city: string, g: Good): number {
    const ci = CITIES.findIndex((c) => c.id === city);
    const day = this.dayOf().day;
    const wave = 1 + 0.12 * Math.sin(day * 1.7 + ci * 2.3 + GOOD_KEYS.indexOf(g) * 1.1);
    return GOODS[g].base * goodMult(city, g) * wave * this.eventMult(city, g) * (1 + 0.6 * (this.market(city)[g] ?? 0));
  }

  buyFactor(): number {
    return Math.max(1.02, 1.12 - this.skill("ticaret") * 0.006 - this.stat("kar") * 0.004 - this.cls().mods.trade - this.compMods().trade) - 0.01 * this.tal("pazarlik");
  }

  sellFactor(): number {
    return Math.min(0.98, 0.88 + this.skill("ticaret") * 0.006 + this.stat("kar") * 0.004 + this.cls().mods.trade + this.compMods().trade) + 0.01 * this.tal("pazarlik") + 0.05 * this.tal("ipekhan");
  }

  buyPrice(city: string, g: Good): number {
    return Math.max(1, Math.round(this.price(city, g) * this.buyFactor() * (1 - 0.02 * (this.s.serais[city]?.lv ?? 0))));
  }

  sellPrice(city: string, g: Good): number {
    return Math.max(1, Math.round(this.price(city, g) * this.sellFactor() * (1 + 0.02 * (this.s.serais[city]?.lv ?? 0))));
  }

  buyGood(city: string, g: Good, n: number): void {
    const h = this.s.hero;
    let k = 0;
    let paid = 0;
    while (k < n && this.cargoUsed() < this.carryCap()) {
      const p = this.buyPrice(city, g);
      if (this.s.res.gold < p) break;
      this.s.res.gold -= p;
      paid += p;
      h.cargo[g] = (h.cargo[g] ?? 0) + 1;
      h.paid[g] = (h.paid[g] ?? 0) + p;
      const m = this.market(city);
      m[g] = Math.min(1.2, (m[g] ?? 0) + 0.035);
      k++;
    }
    if (k === 0) return this.hud.toast(this.cargoUsed() >= this.carryCap() ? "Yükün dolu" : "Altın yetersiz", "bad");
    h.skills.ticaret += Math.ceil(paid / 25);
    this.hud.toast(`${k} ${GOODS[g].name} alındı (−${paid} altın)`, "info");
  }

  sellGood(city: string, g: Good, n: number): void {
    const h = this.s.hero;
    const have = h.cargo[g] ?? 0;
    const k0 = Math.min(n, have);
    if (k0 <= 0) return;
    let got = 0;
    for (let k = 0; k < k0; k++) {
      got += this.sellPrice(city, g);
      const m = this.market(city);
      m[g] = Math.max(-0.7, (m[g] ?? 0) - 0.035);
    }
    const basis = ((h.paid[g] ?? 0) * k0) / have;
    h.paid[g] = (h.paid[g] ?? 0) - basis;
    h.cargo[g] = have - k0;
    this.s.res.gold += got;
    const profit = Math.round(got - basis);
    if (profit > 0) this.s.c.profit += profit;
    h.skills.ticaret += Math.ceil(got / 20);
    this.addXp(Math.max(0, Math.floor(profit / 15)));
    this.hud.toast(`${k0} ${GOODS[g].name} satıldı: +${got} altın (${profit >= 0 ? "kâr" : "zarar"} ${Math.abs(profit)})`, profit >= 0 ? "good" : "bad");
  }

  resPrice(k: keyof Res): number {
    return Math.max(1, Math.round(RES_SELL[k] * this.sellFactor()));
  }

  sellRes(k: keyof Res, n: number): void {
    const q = Math.min(n, Math.floor(this.s.res[k]));
    if (q <= 0 || k === "gold") return;
    this.s.res[k] -= q;
    const got = q * this.resPrice(k);
    this.s.res.gold += got;
    this.hud.toast(`${q} ${({ wood: "kereste", stone: "taş", food: "yiyecek" } as Record<string, string>)[k]} satıldı: +${got} altın`, "good");
  }

  // ---------- smith & items ----------

  smith(city: string): Item[] {
    const day = this.dayOf().day;
    let st = this.s.smith[city];
    if (!st || day - st.day >= 2) {
      const [lo, hi] = CITY_TRADE[city].tier;
      const items: Item[] = [];
      const c = this.cls();
      const slots: Slot[] = ["silah", "silah", "zirh", c.shield ? "kalkan" : "tilsim", "at", "tilsim"];
      for (const slot of slots) {
        const t = lo + Math.floor(Math.random() * (hi - lo + 1));
        items.push(classItem(this.s.nextId++, c, slot, t, Math.random() < 0.15 ? 1 : 0));
      }
      items.push(rollItem(this.s.nextId++, lo, null));
      if (city === "samarkand") items[0] = makeItem(this.s.nextId++, "silah", 1, 0, c.weapons[0]);
      st = this.s.smith[city] = { items, day };
    }
    return st.items;
  }

  itemBuyPrice(it: Item): number {
    return Math.round(itemPrice(it) * this.buyFactor());
  }

  itemSellPrice(it: Item): number {
    return Math.round(itemPrice(it) * 0.4 * this.sellFactor());
  }

  buyItem(city: string, id: number): void {
    const list = this.smith(city);
    const it = list.find((x) => x.id === id);
    if (!it) return;
    if (!this.pay({ gold: this.itemBuyPrice(it) })) return this.hud.toast("Altın yetersiz", "bad");
    list.splice(list.indexOf(it), 1);
    this.s.hero.bag.push(it);
    this.s.c.bought++;
    if (!this.s.hero.equip[it.slot] && !this.canUse(it)) this.equip(it.id);
    this.hud.toast(`${it.name} alındı`, "good");
  }

  sellItem(id: number): void {
    const h = this.s.hero;
    const it = h.bag.find((x) => x.id === id);
    if (!it || this.nearCity() < 0) return;
    h.bag = h.bag.filter((x) => x !== it);
    const g = this.itemSellPrice(it);
    this.s.res.gold += g;
    this.hud.toast(`${it.name} satıldı: +${g} altın`, "good");
  }

  equip(id: number): void {
    const h = this.s.hero;
    const it = h.bag.find((x) => x.id === id);
    if (!it) return;
    const why = this.canUse(it);
    if (why) return this.hud.toast(why, "bad");
    h.bag = h.bag.filter((x) => x !== it);
    const old = h.equip[it.slot];
    if (old) h.bag.push(old);
    h.equip[it.slot] = it;
    h.hp = Math.min(h.hp, this.maxHp());
  }

  unequip(slot: Slot): void {
    const h = this.s.hero;
    const it = h.equip[slot];
    if (!it) return;
    delete h.equip[slot];
    h.bag.push(it);
    h.hp = Math.min(h.hp, this.maxHp());
  }

  findItem(id: number): Item | undefined {
    const h = this.s.hero;
    return h.bag.find((x) => x.id === id) ?? Object.values(h.equip).find((x) => x?.id === id);
  }

  scrollPrice(): number {
    return 140;
  }

  buyScroll(): void {
    if (this.nearCity() < 0) return;
    if (!this.pay({ gold: this.scrollPrice() })) return this.hud.toast("Altın yetersiz", "bad");
    this.s.mats.parsomen++;
    this.hud.toast("Kutsal Parşömen alındı", "good");
  }

  plusReason(it: Item, protect: boolean): string | null {
    if (!canPlus(it)) return "Daha fazla güçlendirilemez";
    if (this.nearCity() < 0) return "Demirci yok";
    const c = plusCost(it);
    if (this.s.res.gold < c.gold) return "Altın yetersiz";
    if (this.s.mats.ruh < c.ruh) return `${c.ruh} Ruh Taşı gerekir`;
    if (protect && this.s.mats.parsomen < 1) return "Kutsal Parşömen gerekir";
    return null;
  }

  upgradeItem(id: number, protect: boolean): void {
    const it = this.findItem(id);
    if (!it || this.plusReason(it, protect) || this.busy()) return;
    const c = plusCost(it);
    this.pay({ gold: c.gold });
    this.s.mats.ruh -= c.ruh;
    if (protect) this.s.mats.parsomen--;
    const p = it.plus ?? 0;
    const h = this.s.hero;
    this.start(`Demirci +${p + 1} basıyor`, 2, () => {
      if (Math.random() < PLUS_CHANCE[p]) {
        setPlus(it, p + 1);
        this.s.c.plus = Math.max(this.s.c.plus, p + 1);
        h.hp = Math.min(h.hp, this.maxHp());
        this.hud.toast(`Başarılı! ${it.name}`, "good");
        if (p + 1 >= 7) this.hud.story("Usta işi!", it.icon, `Örsün başında kıvılcımlar yağdı ve ${it.name} parıldadı. Bu kadar güçlü bir eşya İpek Yolu'nda nadir görülür.`, "Harika");
        return;
      }
      if (protect || p < 4) return this.hud.toast(protect ? "Başarısız. Parşömen eşyayı korudu." : "Başarısız. Eşya zarar görmedi.", "bad");
      if (p < 7) {
        setPlus(it, p - 1);
        return this.hud.toast(`Başarısız! Eşya +${p - 1} seviyesine düştü.`, "bad");
      }
      h.bag = h.bag.filter((x) => x !== it);
      for (const sl of Object.keys(h.equip) as Slot[]) if (h.equip[sl] === it) delete h.equip[sl];
      h.hp = Math.min(h.hp, this.maxHp());
      this.hud.toast(`${it.name} örste parçalandı!`, "bad");
    });
  }

  // ---------- side quests ----------

  sideProg(q: SideQuest): number {
    const c = this.s.c;
    switch (q.kind) {
      case "hunt":
        return c.wins - q.base;
      case "camp":
        return c.camps - q.base;
      case "craft":
        return c.crafted - q.base;
      case "kurgan":
        return c.kurgans - q.base;
      case "raid":
        return c.raids - q.base;
      case "ruin":
        return this.s.ruins[q.ruin!]?.looted ? 1 : 0;
      case "deliver":
        return Math.min(q.need, this.s.hero.cargo[q.good!] ?? 0);
      case "ruh":
        return Math.min(q.need, this.s.mats.ruh);
    }
  }

  sideReady(q: SideQuest): boolean {
    return this.sideProg(q) >= q.need;
  }

  sideTurnIn(q: SideQuest): string {
    return q.kind === "deliver" ? q.to! : q.city;
  }

  sideGoto(q: SideQuest): { x: number; y: number } | null {
    const s = this.s;
    if (this.sideReady(q) || q.kind === "craft" || q.kind === "ruh") return CITIES.find((c) => c.id === this.sideTurnIn(q)) ?? null;
    if (q.kind === "deliver") return CITIES.find((c) => c.id === q.to) ?? null;
    if (q.kind === "ruin") return s.ruins[q.ruin!] ?? null;
    if (q.kind === "kurgan") return this.nearest(s.kurgans.filter((k) => k.alive));
    if (q.kind === "camp") return this.nearest(s.camps.filter((k) => k.alive));
    if (q.kind === "raid") return s.raid ? s.villages[s.raid.v] : null;
    return this.nearest(s.bandits.filter((b) => this.isExplored(b.x, b.y))) ?? this.nearest(s.camps.filter((k) => k.alive));
  }

  sideBoard(city: string): SideQuest[] {
    const s = this.s;
    const day = this.dayOf().day;
    let b = s.board[city];
    if (!b || b.day !== day) {
      b = s.board[city] = { day, list: [] };
      for (let k = 0; k < 3; k++) {
        const q = this.makeSide(city, b.list);
        if (q) b.list.push(q);
      }
    }
    return b.list;
  }

  private makeSide(city: string, board: SideQuest[] = []): SideQuest | null {
    const s = this.s;
    const lv = s.hero.lv;
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const taken = [...s.sideQ, ...board];
    const ruins = s.ruins.map((r, i) => ({ r, i })).filter((x) => !x.r.looted && !taken.some((q) => q.ruin === x.i));
    let kinds: SideKind[] = ["hunt", "hunt", "camp", "deliver", "deliver", "craft", "kurgan", "raid", "ruh"];
    if (ruins.length) kinds.push("ruin", "ruin");
    const fresh = kinds.filter((k) => !board.some((q) => q.kind === k));
    if (fresh.length) kinds = fresh;
    const kind = pick(kinds);
    const c = s.c;
    const q: SideQuest = { id: s.nextId++, city, kind, giver: pick(GIVERS), title: pick(SIDE_TEXT[kind].titles), text: "", need: 1, base: 0, gold: 0, xp: 0, renown: 2, item: Math.random() < 0.35 };
    let diff = 1;
    if (kind === "hunt") {
      q.need = 2 + Math.floor(Math.random() * 3);
      q.base = c.wins;
      diff = q.need * 0.5;
    } else if (kind === "camp") {
      q.need = 1 + (Math.random() < 0.3 ? 1 : 0);
      q.base = c.camps;
      diff = 1.4 * q.need;
    } else if (kind === "craft") {
      q.need = 2 + Math.floor(Math.random() * 2);
      q.base = c.crafted;
      diff = 0.9;
    } else if (kind === "kurgan") {
      q.base = c.kurgans;
      diff = 2;
    } else if (kind === "raid") {
      q.base = c.raids;
      diff = 1.5;
    } else if (kind === "ruh") {
      q.need = 2 + Math.floor(Math.random() * 3);
      diff = q.need * 0.6;
    } else if (kind === "ruin") {
      const r = pick(ruins);
      q.ruin = r.i;
      diff = 1.2;
    } else {
      const to = pick(CITIES.filter((x) => x.id !== city));
      q.to = to.id;
      q.good = pick(CITY_TRADE[to.id].dear);
      q.need = Math.min(12, 3 + Math.floor(lv / 3));
      const from = CITIES.find((x) => x.id === city)!;
      diff = 0.6 + Math.hypot(to.x - from.x, to.y - from.y) / 1500;
    }
    const extra = kind === "deliver" ? `${CITY_NAME[q.to!]} · ${GOODS[q.good!].name}` : kind === "ruin" ? "haritada işaretli" : "";
    q.text = SIDE_TEXT[kind].text(q.need, extra);
    q.gold = Math.round((40 + 22 * lv) * diff);
    q.xp = Math.round((25 + 12 * lv) * diff);
    q.renown = Math.max(2, Math.round(2 * diff));
    return q;
  }

  sideReason(): string | null {
    if (!this.s.free) return "Önce hürriyetini kazan";
    if (this.s.sideQ.length >= 3) return "En fazla 3 görev alabilirsin";
    return null;
  }

  takeSide(city: string, id: number): void {
    if (this.sideReason()) return;
    const b = this.sideBoard(city);
    const i = b.findIndex((q) => q.id === id);
    if (i < 0) return;
    const [q] = b.splice(i, 1);
    if (q.kind === "ruin") {
      const r = this.s.ruins[q.ruin!];
      this.reveal(r.x, r.y, 5);
    }
    this.s.sideQ.push(q);
    this.hud.toast(`Görev alındı: ${q.title}`, "good");
  }

  dropSide(id: number): void {
    this.s.sideQ = this.s.sideQ.filter((q) => q.id !== id);
  }

  private sideTick(): void {
    const s = this.s;
    if (!s.sideQ.length || this.battleLock) return;
    const ci = this.nearCity();
    if (ci < 0) return;
    const city = CITIES[ci].id;
    for (const q of [...s.sideQ]) {
      if (this.sideTurnIn(q) !== city || !this.sideReady(q)) continue;
      if (q.kind === "deliver") {
        s.hero.cargo[q.good!] = (s.hero.cargo[q.good!] ?? 0) - q.need;
        s.hero.paid[q.good!] = Math.max(0, (s.hero.paid[q.good!] ?? 0) * 0.5);
        if (!s.hero.cargo[q.good!]) delete s.hero.cargo[q.good!];
      }
      if (q.kind === "ruh") s.mats.ruh -= q.need;
      s.sideQ = s.sideQ.filter((x) => x.id !== q.id);
      s.res.gold += q.gold;
      s.renown += q.renown;
      s.c.sides++;
      const up = this.addXp(q.xp);
      const it = q.item ? this.drop(Math.min(5, 1 + Math.floor(s.hero.lv / 4)), 1) : null;
      this.hud.questDone({ title: q.title, text: q.text, done: () => true, reward: { gold: q.gold } });
      this.hud.toast(`${q.giver}: "Sağ ol yiğit!" +${q.xp} TP, +${q.renown} şöhret${it ? ` · ${it.name}` : ""}${up ? " · Seviye atladın!" : ""}`, "good");
    }
  }

  // ---------- crafting ----------

  matHave(m: Mat): number {
    const s = this.s;
    if (m === "gold") return Math.floor(s.res.gold);
    if (m === "ruh" || m === "parsomen") return s.mats[m];
    return s.hero.cargo[m] ?? 0;
  }

  craftCost(c: Cost): Cost {
    const k = 1 - 0.1 * this.tal("zanaat");
    const out: Cost = {};
    for (const [m, v] of Object.entries(c) as [Mat, number][]) out[m] = m === "gold" ? Math.round(v * k) : Math.max(1, Math.ceil(v * k));
    return out;
  }

  private payMats(c: Cost): void {
    const s = this.s;
    for (const [m, v] of Object.entries(c) as [Mat, number][]) {
      if (m === "gold") s.res.gold -= v;
      else if (m === "ruh" || m === "parsomen") s.mats[m] -= v;
      else {
        const have = s.hero.cargo[m] ?? 0;
        s.hero.paid[m] = Math.max(0, (s.hero.paid[m] ?? 0) * (1 - v / Math.max(1, have)));
        s.hero.cargo[m] = have - v;
        if (!s.hero.cargo[m]) delete s.hero.cargo[m];
      }
    }
  }

  craftReason(c: Cost, lv = 1): string | null {
    if (!this.s.free) return "Köleler atölyeye giremez";
    if (this.nearCity() < 0) return "Bir şehirde olmalısın";
    if (this.busy()) return "Meşgulsün";
    if (this.s.hero.lv < lv) return `Seviye ${lv} gerekir`;
    for (const [m, v] of Object.entries(this.craftCost(c)) as [Mat, number][]) if (this.matHave(m) < v) return "Malzeme eksik";
    return null;
  }

  private craftXp(n: number): void {
    const before = this.skill("zanaat");
    this.s.hero.skills.zanaat = (this.s.hero.skills.zanaat ?? 0) + n;
    if (this.skill("zanaat") > before) this.hud.toast(`Zanaat ${this.skill("zanaat")}. seviyeye çıktı`, "good");
  }

  craftGear(slot: Slot, t: number): void {
    const base = gearCost(slot, t);
    if (this.craftReason(base, (t - 1) * 3 + 1)) return;
    this.payMats(this.craftCost(base));
    this.start("Atölyede dövüyorsun", 4, () => {
      const s = this.s;
      const r = Math.random() + 0.08 + this.skill("zanaat") * 0.012 + 0.06 * this.tal("zanaat");
      const rar = r > 1.04 ? 4 : r > 0.93 ? 3 : r > 0.74 ? 2 : r > 0.42 ? 1 : 0;
      const it = classItem(s.nextId++, this.cls(), slot, t, rar);
      s.hero.bag.push(it);
      this.craftXp(12 * t + rar * 10);
      s.c.crafted++;
      this.hud.toast(`Ürettin: ${it.name}${rar >= 3 ? "!" : ""}`, rar >= 2 ? "good" : "info");
      if (rar === 4) audio.play("level");
    });
  }

  craftCons(id: string): void {
    const c = CONS_BY_ID[id];
    if (!c || this.craftReason(c.cost, c.lv)) return;
    this.payMats(this.craftCost(c.cost));
    this.start(`${c.name} hazırlıyorsun`, 2, () => {
      this.s.cons[id] = (this.s.cons[id] ?? 0) + 1;
      this.craftXp(5);
      this.hud.toast(`${c.name} hazır`, "good");
    });
  }

  refine(id: string): void {
    const r = REFINES.find((x) => x.id === id);
    if (!r || this.craftReason(r.cost)) return;
    this.payMats(this.craftCost(r.cost));
    this.start(r.name, 3, () => {
      this.s.mats[r.out]++;
      this.craftXp(8);
      this.hud.toast(`${r.out === "ruh" ? "Ruh Taşı" : "Kutsal Parşömen"} elde ettin`, "good");
    });
  }

  useCons(id: string): void {
    const s = this.s;
    const c = CONS_BY_ID[id];
    if (!c || !s.cons[id] || this.battleLock) return;
    const h = s.hero;
    if (id === "merhem") {
      if (h.hp >= this.maxHp()) return this.hud.toast("Canın zaten dolu", "info");
      h.hp = Math.min(this.maxHp(), h.hp + this.maxHp() * 0.5);
    } else if (id === "kimiz") {
      if (h.energy >= this.maxEnergy()) return this.hud.toast("Enerjin zaten dolu", "info");
      h.energy = this.maxEnergy();
    } else s.buffs[id] = 3;
    s.cons[id]--;
    this.hud.toast(`${c.name} kullanıldı`, "good");
  }

  buff(id: string): boolean {
    return (this.s.buffs[id] ?? 0) > 0;
  }

  private drop(tier: number, chance: number): Item | null {
    if (Math.random() > chance * this.cls().mods.loot) return null;
    const it = rollItem(this.s.nextId++, tier, this.cls(), Math.min(0.1, this.stat("kar") * 0.005));
    this.s.hero.bag.push(it);
    return it;
  }

  // ---------- bounties ----------

  cityBounties(city: string): { b: Bounty; i: number }[] {
    const day = this.dayOf().day;
    if (day - this.s.bountyDay >= 3 || !this.s.bounties.length) {
      this.s.bountyDay = day;
      const keep = this.s.bounties.filter((b) => b.taken && this.s.camps[b.camp].alive);
      for (const c of CITIES) {
        const used = new Set(keep.map((b) => b.camp));
        const near = this.s.camps
          .map((cp, i) => ({ cp, i, d: Math.hypot(cp.x - c.x, cp.y - c.y) }))
          .filter((x) => x.cp.alive && !used.has(x.i) && x.d < 1500)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        for (const n of near) keep.push({ city: c.id, camp: n.i, gold: 90 * n.cp.tier + 60, renown: 6 * n.cp.tier, taken: false });
      }
      this.s.bounties = keep;
    }
    return this.s.bounties.map((b, i) => ({ b, i })).filter((x) => x.b.city === city);
  }

  takeBounty(i: number): void {
    const b = this.s.bounties[i];
    if (!b) return;
    b.taken = true;
    const c = this.s.camps[b.camp];
    this.reveal(c.x, c.y, 6);
    this.hud.toast(`İlan alındı: ${c.name} kampı haritada işaretlendi`, "good");
  }

  // ---------- world ----------

  reveal(x: number, y: number, r: number): void {
    const cx = Math.floor(x / NAV);
    const cy = Math.floor(y / NAV);
    let changed = false;
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= NW || ny >= NH) continue;
        const i = ny * NW + nx;
        if (!this.s.explored[i]) {
          this.s.explored[i] = 1;
          changed = true;
        }
      }
    if (changed) this.view.fogDirty = true;
  }

  isExplored(x: number, y: number): boolean {
    const nx = Math.floor(x / NAV);
    const ny = Math.floor(y / NAV);
    return nx >= 0 && ny >= 0 && nx < NW && ny < NH && this.s.explored[ny * NW + nx] === 1;
  }

  cellCost(x: number, y: number): number {
    const nx = Math.max(0, Math.min(NW - 1, Math.floor(x / NAV)));
    const ny = Math.max(0, Math.min(NH - 1, Math.floor(y / NAV)));
    return this.world.cost[ny * NW + nx];
  }

  findPath(x0: number, y0: number, x1: number, y1: number): number[] | null {
    const sx = Math.floor(x0 / NAV);
    const sy = Math.floor(y0 / NAV);
    let tx = Math.floor(x1 / NAV);
    let ty = Math.floor(y1 / NAV);
    if (this.world.cost[ty * NW + tx] === Infinity) {
      let best = -1;
      let bd = Infinity;
      for (let dy = -4; dy <= 4; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (nx < 0 || ny < 0 || nx >= NW || ny >= NH) continue;
          const j = ny * NW + nx;
          if (this.world.cost[j] === Infinity || !this.world.reach[j]) continue;
          const d = dx * dx + dy * dy;
          if (d < bd) {
            bd = d;
            best = j;
          }
        }
      if (best < 0) return null;
      tx = best % NW;
      ty = Math.floor(best / NW);
      x1 = tx * NAV + NAV / 2;
      y1 = ty * NAV + NAV / 2;
    }
    const cells = astar(this.world.cost, sx, sy, tx, ty);
    if (!cells) return null;
    const pts: number[] = [];
    for (let k = 2; k < cells.length - 2; k += 2) pts.push(cells[k] * NAV + NAV / 2, cells[k + 1] * NAV + NAV / 2);
    pts.push(x1, y1);
    return pts;
  }

  targetPos(t: Target): { x: number; y: number } | null {
    const s = this.s;
    switch (t.kind) {
      case "point":
        return { x: t.x, y: t.y };
      case "capital":
        return { x: CAPITAL.x + 10, y: CAPITAL.y + 115 };
      case "city":
        return { x: CITIES[t.i].x + 10, y: CITIES[t.i].y + 100 };
      case "village":
        return s.villages[t.i];
      case "camp":
        return s.camps[t.i];
      case "node":
        return s.nodes[t.i];
      case "ruin":
        return s.ruins[t.i];
      case "kurgan":
        return s.kurgans[t.i];
      case "fort":
        return s.story.fort;
      case "bandit":
        return s.bandits.find((b) => b.id === t.i) ?? null;
    }
  }

  goTo(t: Target): void {
    const p = this.targetPos(t);
    if (!p) return;
    if (this.act) {
      this.hud.toast(`Önce işini bitir: ${this.act.label}`, "bad");
      return;
    }
    if (!this.s.free && Math.hypot(p.x - CAPITAL.x, p.y - CAPITAL.y) > SLAVE_RADIUS) {
      this.hud.toast("Efendinin bekçileri seni geri çevirir. Önce hürriyetini satın al!", "bad");
      return;
    }
    const path = this.findPath(this.s.hero.x, this.s.hero.y, p.x, p.y);
    if (!path) {
      this.hud.toast("Oraya yol yok", "bad");
      return;
    }
    this.target = t;
    this.s.hero.path = path;
    this.s.hero.pathI = 0;
    this.s.c.moved++;
    this.view.marker(p.x, p.y);
  }

  tap(x: number, y: number): void {
    if (this.battleLock || this.hud.panelOpen()) return;
    const hit = this.pick(x, y);
    if (hit) {
      const p = this.targetPos(hit)!;
      if (hit.kind !== "bandit" && Math.hypot(p.x - this.s.hero.x, p.y - this.s.hero.y) < 60) {
        this.s.hero.path = null;
        this.target = null;
        this.hud.openPlace(hit);
        return;
      }
      this.goTo(hit);
      return;
    }
    if (this.cellCost(x, y) === Infinity) {
      this.hud.toast("Buradan geçilmez", "bad");
      return;
    }
    this.goTo({ kind: "point", x, y });
  }

  pick(x: number, y: number): Target | null {
    const s = this.s;
    const r = 34 / Math.min(1, this.cam.zoom);
    let best: Target | null = null;
    let bd = r;
    const test = (t: Target, px: number, py: number, rr = 1) => {
      const d = Math.hypot(px - x, py - y) / rr;
      if (d < bd && this.isExplored(px, py)) {
        bd = d;
        best = t;
      }
    };
    for (const b of s.bandits) test({ kind: "bandit", i: b.id }, b.x, b.y, 1.3);
    if (Math.hypot(CAPITAL.x - x, CAPITAL.y - y) < r * 2.2) return { kind: "capital" };
    CITIES.forEach((c, i) => i !== CAP_I && test({ kind: "city", i }, c.x, c.y, 2));
    s.villages.forEach((v, i) => test({ kind: "village", i }, v.x, v.y, 1.3));
    s.camps.forEach((c, i) => c.alive && test({ kind: "camp", i }, c.x, c.y, 1.3));
    s.nodes.forEach((n, i) => test({ kind: "node", i }, n.x, n.y));
    s.ruins.forEach((n, i) => !n.looted && test({ kind: "ruin", i }, n.x, n.y));
    s.kurgans.forEach((k, i) => k.alive && test({ kind: "kurgan", i }, k.x, k.y, 1.3));
    if (s.story.fort && !s.story.done) test({ kind: "fort" }, s.story.fort.x, s.story.fort.y, 2);
    return best;
  }

  heroSpeed(): number {
    const n = armySize(this.s.hero.army);
    return HERO_SPEED * (1 + this.stat("cev") * 0.02 + (this.eq("at")?.spd ?? 0) + this.compMods().speed + 0.04 * this.tal("ruzgar")) * (1 - Math.min(0.35, n / 300));
  }

  private moveHero(dt: number): void {
    const h = this.s.hero;
    const t = this.target;
    if (t?.kind === "bandit") {
      this.repath -= dt;
      const b = this.s.bandits.find((x) => x.id === t.i);
      if (!b) {
        this.target = null;
        h.path = null;
      } else if (Math.hypot(b.x - h.x, b.y - h.y) < 30) {
        h.path = null;
        this.target = null;
        this.engageBandit(b, false);
        return;
      } else if (this.repath <= 0) {
        this.repath = 0.8;
        const p = this.findPath(h.x, h.y, b.x, b.y);
        if (p) {
          h.path = p;
          h.pathI = 0;
        }
      }
    }
    if (!h.path) return;
    const cc = this.cellCost(h.x, h.y);
    let move = (this.heroSpeed() * dt) / Math.max(0.55, cc === Infinity ? 1 : cc);
    while (move > 0 && h.path && h.pathI < h.path.length) {
      const tx = h.path[h.pathI];
      const ty = h.path[h.pathI + 1];
      const d = Math.hypot(tx - h.x, ty - h.y);
      if (d <= move) {
        h.x = tx;
        h.y = ty;
        move -= d;
        h.pathI += 2;
      } else {
        h.x += ((tx - h.x) / d) * move;
        h.y += ((ty - h.y) / d) * move;
        move = 0;
      }
    }
    if (h.path && h.pathI >= h.path.length) {
      h.path = null;
      const tg = this.target;
      this.target = null;
      if (tg && tg.kind !== "point" && tg.kind !== "bandit") this.hud.openPlace(tg);
    }
  }

  heroPower(): number {
    const c = this.champion();
    return armyPower(this.s.hero.army, this.heroBonus()) + c.atk * Math.sqrt(Math.max(1, c.hp)) * 0.6;
  }

  private bandits(dt: number, now: number): void {
    const s = this.s;
    const h = s.hero;
    const heroPow = this.heroPower();
    const safe = !s.free || Math.hypot(h.x - CAPITAL.x, h.y - CAPITAL.y) < 450 || this.nearCity() >= 0;
    if (s.bandits.some((b) => armySize(b.army) === 0)) s.bandits = s.bandits.filter((b) => armySize(b.army) > 0);
    s.camps.forEach((c, i) => {
      if (!c.alive) return;
      const mine = s.bandits.filter((b) => b.camp === i).length;
      const max = 1 + Math.floor(c.tier / 2);
      const at = this.spawnAt.get(i) ?? 0;
      if (mine < max && now >= at) {
        this.spawnAt.set(i, now + 90000 + Math.random() * 60000);
        s.bandits.push({ id: s.nextId++, camp: i, tier: c.tier, x: c.x + (Math.random() - 0.5) * 40, y: c.y + (Math.random() - 0.5) * 40, army: banditArmy(c.tier), tx: c.x, ty: c.y, wait: 1, chase: false });
      }
    });
    for (const b of s.bandits) {
      const c = s.camps[b.camp];
      const dh = Math.hypot(h.x - b.x, h.y - b.y);
      const pow = armyPower(b.army);
      b.chase = b.amb ? !safe && dh < 450 : !safe && !this.act && dh < 230 && pow > heroPow * 0.75 && Math.hypot(h.x - c.x, h.y - c.y) < 700;
      if (b.amb && dh > 600) b.army = { spear: 0, archer: 0, horse: 0 };
      const flee = dh < 200 && pow < heroPow * 0.45;
      let tx = b.tx;
      let ty = b.ty;
      if (b.chase) {
        tx = h.x;
        ty = h.y;
      } else if (flee) {
        tx = b.x + (b.x - h.x);
        ty = b.y + (b.y - h.y);
      } else {
        b.wait -= dt;
        if (b.wait <= 0 && Math.hypot(b.tx - b.x, b.ty - b.y) < 8) {
          for (let k = 0; k < 8; k++) {
            const a = Math.random() * Math.PI * 2;
            const r = 60 + Math.random() * 260;
            const x = c.x + Math.cos(a) * r;
            const y = c.y + Math.sin(a) * r;
            if (this.cellCost(x, y) < 2.5 && Math.hypot(x - CAPITAL.x, y - CAPITAL.y) > SLAVE_RADIUS) {
              b.tx = x;
              b.ty = y;
              break;
            }
          }
          b.wait = 2 + Math.random() * 5;
        }
      }
      const d = Math.hypot(tx - b.x, ty - b.y);
      if (d > 1) {
        const sp = (BANDIT_SPEED * (b.chase ? 1.15 : 1) * dt) / Math.max(0.6, Math.min(3, this.cellCost(b.x, b.y)));
        const nx = b.x + ((tx - b.x) / d) * Math.min(sp, d);
        const ny = b.y + ((ty - b.y) / d) * Math.min(sp, d);
        if (this.cellCost(nx, ny) !== Infinity) {
          b.x = nx;
          b.y = ny;
        } else {
          b.tx = b.x;
          b.ty = b.y;
        }
      }
      if (b.chase && dh < 24 && !this.battleLock) {
        this.engageBandit(b, true);
        return;
      }
    }
  }

  private engageBandit(b: Bandit, ambush: boolean): void {
    const c = this.s.camps[b.camp];
    this.battle(ambush ? `${c.name} pusu kurdu!` : `${c.name} çetesi`, b.army, 0, (win) => {
      this.s.bandits = this.s.bandits.filter((x) => x.id !== b.id);
      if (!win) return "";
      const gold = Math.round((armyPower(b.army) * 0.9 + 8 * b.tier) * this.cls().mods.loot * this.stealMult());
      this.gain({ gold });
      this.s.renown += b.tier * 2;
      this.s.c.wins++;
      const it = this.drop(b.tier, 0.3 + b.tier * 0.1);
      const ruh = Math.random() < 0.15 + b.tier * 0.05 + 0.1 * this.tal("ruhavci") ? 1 : 0;
      this.s.mats.ruh += ruh;
      return `+${gold} altın · +${b.tier * 2} şöhret${ruh ? " · +1 Ruh Taşı" : ""}${it ? `<br>Ganimet: <b class="r${it.rar}">${it.name}</b>` : ""}`;
    });
  }

  battle(title: string, enemy: Army, enemyBonus: number, after: (win: boolean) => string, boss: Boss | null = null, foe = "Haramiler"): void {
    const h = this.s.hero;
    if (this.act) this.act = null;
    if (armySize(h.army) === 0 && h.hp < this.maxHp() * 0.15) {
      if (this.s.bandits.some((b) => b.chase)) {
        h.hp = Math.max(h.hp, 1);
      } else {
        this.hud.toast("Savaşamayacak kadar yaralısın. Bir şehirde dinlen.", "bad");
        return;
      }
    }
    this.battleLock = true;
    h.path = null;
    this.target = null;
    const w = stanceWeights(enemy, boss);
    let r = Math.random();
    const stance = TACTIC_KEYS.find((t) => (r -= w[t]) < 0) ?? "duvar";
    const known = this.scouts();
    const champ = this.champion();
    const opts = TACTIC_KEYS.map((t) => {
      const d = known ? this.tdelta(t, stance) : TACTIC_KEYS.reduce((a, f) => a + w[f] * this.tdelta(t, f), 0);
      return { t, odds: odds(h.army, this.heroBonus() + d, enemy, enemyBonus, champ, boss) };
    });
    const go = (t: Tactic, auto: boolean) => this.resolveBattle(title, enemy, enemyBonus, after, boss, foe, t, stance, auto);
    const best = opts.reduce((a, b) => (b.odds > a.odds ? b : a));
    if (!boss && best.odds >= 0.98) return go(best.t, true);
    const chased = this.s.bandits.some((b) => Math.hypot(b.x - h.x, b.y - h.y) < 80);
    const flee = chased ? (armySize(h.army) ? "Kaç · askerlerin %20'si geride kalır" : "Kaç · altınının %15'ini bırakırsın") : "Geri çekil";
    this.hud.tactics(title, enemy, boss, foe, known ? stance : null, w, opts, this.lastTactic, (t) => go(t, false), flee, () => this.retreat());
  }

  private retreat(): void {
    const s = this.s;
    const h = s.hero;
    this.battleLock = false;
    const near = s.bandits.filter((b) => Math.hypot(b.x - h.x, b.y - h.y) < 80);
    if (!near.length) return;
    let lost = 0;
    for (const u of UNIT_KEYS) {
      const k = Math.ceil(h.army[u] * 0.2);
      h.army[u] -= k;
      lost += k;
    }
    const gold = lost ? 0 : Math.round(s.res.gold * 0.15);
    s.res.gold -= gold;
    for (const b of near) {
      if (b.amb) {
        b.army = { spear: 0, archer: 0, horse: 0 };
        continue;
      }
      const a0 = Math.atan2(b.y - h.y, b.x - h.x);
      const spot = [0, 0.6, -0.6, 1.2, -1.2, Math.PI].map((da) => ({ x: h.x + Math.cos(a0 + da) * 280, y: h.y + Math.sin(a0 + da) * 280 })).find((p) => this.cellCost(p.x, p.y) < 3);
      if (!spot) {
        b.army = { spear: 0, archer: 0, horse: 0 };
        continue;
      }
      b.x = b.tx = spot.x;
      b.y = b.ty = spot.y;
      b.wait = 8;
    }
    this.hud.toast(lost ? `Kaçtın ama ${lost} asker geride kaldı.` : `Kaçarken ${gold} altın düşürdün.`, "bad");
  }

  scouts(): boolean {
    return this.stat("cev") >= 6 || this.hasComp("ferhat") || this.s.cls === "hirsiz" || this.tal("gozcu") > 0;
  }

  private resolveBattle(title: string, enemy: Army, enemyBonus: number, after: (win: boolean) => string, boss: Boss | null, foe: string, t: Tactic, stance: Tactic, auto: boolean): void {
    const h = this.s.hero;
    this.lastTactic = auto ? this.lastTactic : t;
    const champ = this.champion();
    const res: BattleResult = fight(h.army, this.heroBonus() + this.tdelta(t, stance), enemy, enemyBonus, champ, boss);
    const edge = TACTICS[t].beats === stance ? " — <b class=\"cheap\">üstünlük senin!</b>" : TACTICS[stance].beats === t ? " — <b class=\"dear\">düşman seni okudu!</b>" : "";
    for (const k of Object.keys(this.s.buffs)) if (--this.s.buffs[k] <= 0) delete this.s.buffs[k];
    const tline = `Taktik: ${TACTICS[t].name}${auto ? " (otomatik)" : ""} · Düşman: ${TACTICS[stance].name}${edge}`;
    const before = { ...h.army };
    const hpBefore = h.hp;
    h.army = { ...res.rounds[res.rounds.length - 1].a };
    h.hp = Math.max(1, res.heroHp);
    h.skills.silah += 6 * (res.rounds.length - 2);
    const rev = this.cls().mods.revive + 0.15 * this.tal("tengri");
    let revived = 0;
    if (res.win && rev > 0)
      for (const u of UNIT_KEYS) {
        const k = Math.floor(res.lostA[u] * rev);
        h.army[u] += k;
        revived += k;
      }
    const xp = Math.round((armyPower(enemy) + (boss ? boss.atk * Math.sqrt(boss.hp) * 0.8 : 0)) * (res.win ? 0.7 : 0.15)) + 3;
    const lvUp = this.addXp(xp);
    this.s.kills += armySize(res.lostB);
    const extra = after(res.win);
    let fled = "";
    if (!res.win) {
      const near = CITIES.map((c, i) => ({ i, d: Math.hypot(c.x - h.x, c.y - h.y) })).sort((a, b) => a.d - b.d)[0];
      const c = CITIES[near.i];
      h.x = c.x + 10;
      h.y = c.y + 100;
      this.cam.flyTo(h.x, h.y);
      fled = `${res.heroDown ? "Ağır yaralandın. " : ""}Kalanlar seni ${CITY_NAME[c.id]} şehrine taşıdı.`;
    }
    const note = [tline, extra || fled, revived ? `Ruh Çağrısı: ${revived} asker hayata döndü` : ""].filter(Boolean).join("<br>");
    this.hud.showBattle(title, before, enemy, res, { hpBefore, maxHp: this.maxHp() }, xp, lvUp, note, boss, foe, () => {
      this.battleLock = false;
      saveGame(this.s);
    });
  }

  addXp(xp: number): boolean {
    const h = this.s.hero;
    xp = Math.round(xp * (1 + this.compMods().xp + 0.2 * this.tal("efsane") + 0.1 * this.tal("tengri")));
    h.xp += xp;
    let up = false;
    while (h.xp >= xpNeed(h.lv)) {
      h.xp -= xpNeed(h.lv);
      h.lv++;
      h.points += 3;
      if (h.lv >= 3) h.spts++;
      h.tpts++;
      h.hp = this.maxHp();
      up = true;
    }
    return up;
  }

  odds(enemy: Army, bonus = 0, boss: Boss | null = null): number {
    return odds(this.s.hero.army, this.heroBonus(), enemy, bonus, this.champion(), boss);
  }

  attackCamp(i: number): void {
    const c = this.s.camps[i];
    if (!c.alive) return;
    this.battle(`${c.name} kampı`, c.garrison, 0.1, (win) => {
      if (!win) return "";
      c.alive = false;
      c.respawnAt = this.now + 15 * 60000;
      this.s.bandits = this.s.bandits.filter((b) => b.camp !== i);
      const loot = { gold: Math.round((60 * c.tier * c.tier + 40) * this.cls().mods.loot * this.stealMult()), wood: 60 * c.tier, stone: 40 * c.tier };
      this.gain(loot);
      this.s.renown += c.tier * 8;
      this.s.c.camps++;
      this.s.mats.ruh += c.tier;
      let txt = `Kamp yerle bir edildi! +${loot.gold} altın, +${c.tier * 8} şöhret, +${c.tier} Ruh Taşı`;
      for (const b of this.s.bounties.filter((x) => x.camp === i && x.taken)) {
        this.s.res.gold += b.gold;
        this.s.renown += b.renown;
        txt += `<br>Ödül ilanı (${CITY_NAME[b.city]}): +${b.gold} altın, +${b.renown} şöhret`;
      }
      this.s.bounties = this.s.bounties.filter((x) => x.camp !== i);
      const items = [this.drop(c.tier, 1), this.drop(c.tier, 0.5)].filter((x): x is Item => !!x);
      for (const it of items) txt += `<br>Ganimet: <b class="r${it.rar}">${it.name}</b>`;
      return txt;
    });
  }

  attackKurgan(i: number): void {
    const k = this.s.kurgans[i];
    if (!k.alive) return;
    const boss = kurganBoss(k.tier);
    this.battle(`Kurgan Taşı · ${boss.name}`, k.guard, 0.1 * k.tier, (win) => {
      if (!win) return "Lanetli taş seni geri püskürttü. Daha güçlü dön.";
      k.alive = false;
      k.respawnAt = this.now + 20 * 60000;
      this.s.c.kurgans++;
      const ruh = 2 * k.tier + Math.floor(Math.random() * 3);
      const gold = Math.round((50 * k.tier * k.tier + 30) * this.stealMult());
      this.s.mats.ruh += ruh;
      this.gain({ gold });
      this.s.renown += k.tier * 5;
      let txt = `Taş çatladı, ruhlar serbest kaldı! +${ruh} Ruh Taşı, +${gold} altın, +${k.tier * 5} şöhret`;
      if (Math.random() < 0.25 + k.tier * 0.05) {
        this.s.mats.parsomen++;
        txt += "<br>+1 Kutsal Parşömen";
      }
      const it = rollItem(this.s.nextId++, Math.min(5, k.tier + 1), this.cls(), 0.25);
      this.s.hero.bag.push(it);
      txt += `<br>Ganimet: <b class="r${it.rar}">${it.name}</b>`;
      return txt;
    }, boss, boss.name);
  }

  kurganOdds(i: number): number {
    const k = this.s.kurgans[i];
    return this.odds(k.guard, 0.1 * k.tier, kurganBoss(k.tier));
  }

  // ---------- living world ----------

  private worldEvents(dt: number, now: number): void {
    const s = this.s;
    const day = this.dayOf().day;
    if (day !== s.evDay) {
      s.evDay = day;
      s.events = s.events.filter((e) => e.until >= day);
      if (s.events.length < 3 && Math.random() < 0.75) this.newMarketEvent(day);
    }
    if (s.contract && now > s.contract.until) {
      this.hud.toast(`Kervan sözleşmesi zaman aşımına uğradı (${CITY_NAME[s.contract.to]})`, "bad");
      s.renown = Math.max(0, s.renown - 3);
      s.contract = null;
    }
    this.ambushT -= dt;
    if (s.contract && this.ambushT <= 0 && !this.battleLock) {
      this.ambushT = 30;
      const h = s.hero;
      const safe = this.nearCity(400) >= 0 || Math.hypot(h.x - CAPITAL.x, h.y - CAPITAL.y) < 450;
      if (!safe && Math.random() < 0.35 * (1 - 0.25 * this.tal("kacakci"))) {
        const tier = Math.min(5, 1 + Math.floor(Math.hypot(h.x - CAPITAL.x, h.y - CAPITAL.y) / 700));
        const a = Math.random() * Math.PI * 2;
        const x = h.x + Math.cos(a) * 200;
        const y = h.y + Math.sin(a) * 200;
        if (this.cellCost(x, y) < 3) {
          const camp = s.camps.indexOf(this.nearest(s.camps) ?? s.camps[0]);
          s.bandits.push({ id: s.nextId++, camp, tier, x, y, army: banditArmy(tier), tx: x, ty: y, wait: 9, chase: true, amb: true });
          this.hud.toast("Kervan yağmacıları peşinde! Emanet yükü korumak için savaş ya da kaç.", "bad");
        }
      }
    }
    if (!s.raidAt || !s.free) s.raidAt = Math.max(s.raidAt, now + 240000);
    if (s.raid) {
      const v = s.villages[s.raid.v];
      if (now > s.raid.until) {
        v.rep = Math.max(0, v.rep - 15);
        v.rec = 0;
        this.hud.toast(`${v.name} yağmalandı! Köylüler sana küstü.`, "bad");
        const sc = CITIES.find((c) => s.serais[c.id] && Math.hypot(c.x - v.x, c.y - v.y) < 700);
        if (sc && s.serais[sc.id].coffer > 0) {
          s.serais[sc.id].coffer = 0;
          this.hud.toast(`Haramiler ${CITY_NAME[sc.id]} kervansarayının kasasını da boşalttı!`, "bad");
        }
        s.raid = null;
        s.raidAt = now + 180000;
      }
    } else if (s.free && now > s.raidAt && !this.battleLock) {
      s.raidAt = now + 200000 + Math.random() * 160000;
      const h = s.hero;
      const cand = s.villages.map((v, i) => ({ v, i, d: Math.hypot(v.x - h.x, v.y - h.y) })).filter((x) => x.d > 200 && x.d < 1300 && this.isExplored(x.v.x, x.v.y) && Math.hypot(x.v.x - CAPITAL.x, x.v.y - CAPITAL.y) > 260);
      if (cand.length) {
        const c = cand[Math.floor(Math.random() * cand.length)];
        const tier = Math.min(5, Math.max(1, Math.round(h.lv / 3)));
        const a = banditArmy(tier);
        for (const u of UNIT_KEYS) a[u] = Math.round(a[u] * 1.4);
        s.raid = { v: c.i, army: a, until: now + 150000 };
        this.hud.toast(`${c.v.name} köyüne harami baskını! Yardıma koş.`, "bad");
      }
    }
  }

  private newMarketEvent(day: number): void {
    const good = GOOD_KEYS[Math.floor(Math.random() * GOOD_KEYS.length)];
    const ci = CITIES[Math.floor(Math.random() * CITIES.length)];
    if (this.s.events.some((e) => e.city === ci.id && e.good === good)) return;
    const short = Math.random() < 0.55;
    const why = short ? ["kuraklık vurdu", "kervanlar baskına uğradı", "saray büyük bir düğün hazırlıyor", "yollar karla kapandı", "salgın korkusu yayıldı"] : ["büyük bir kervan geldi", "hasat bereketli geçti", "tüccarlar mallarını elden çıkarıyor", "depolar ağzına kadar dolu"];
    const mult = short ? 1.6 + Math.random() * 0.5 : 0.45 + Math.random() * 0.15;
    const text = `${CITY_NAME[ci.id]}: ${why[Math.floor(Math.random() * why.length)]}. ${GOODS[good].name} ${short ? "çok pahalı" : "çok ucuz"}!`;
    this.s.events.push({ city: ci.id, good, mult, until: day + 2, text });
    this.hud?.toast(`Söylenti: ${text}`, "info");
  }

  eventMult(city: string, g: Good): number {
    return this.s.events.filter((e) => e.city === city && e.good === g).reduce((m, e) => m * e.mult, 1);
  }

  contractOffer(city: string): (Contract & { day: number }) | null {
    const day = this.dayOf().day;
    let o = this.s.offers[city];
    if (!o || day - o.day >= 2) {
      const from = CITIES.find((c) => c.id === city)!;
      const others = CITIES.filter((c) => c.id !== city).sort(() => Math.random() - 0.5);
      const to = others[0];
      const d = Math.hypot(to.x - from.x, to.y - from.y);
      const cargo = ["ipek balyaları", "mühürlü bir sandık", "baharat çuvalları", "bir elçinin mektupları", "değerli halılar", "yeşim heykeller"][Math.floor(Math.random() * 6)];
      o = this.s.offers[city] = { from: city, to: to.id, gold: Math.round(60 + d * 0.12), until: Math.round((d / HERO_SPEED) * 2.2 + 90), cargo, day };
    }
    return o.day < 0 ? null : o;
  }

  takeContract(city: string): void {
    const o = this.contractOffer(city);
    if (!o || this.s.contract || !this.s.free) return;
    this.s.contract = { ...o, until: this.now + o.until * 1000 };
    o.day = -1;
    this.hud.toast(`Sözleşme: ${o.cargo} → ${CITY_NAME[o.to]}`, "good");
  }

  private checkContract(): void {
    const c = this.s.contract;
    if (!c) return;
    const ci = CITIES.findIndex((x) => x.id === c.to);
    if (this.nearCity() !== ci) return;
    const gold = Math.round(c.gold * (this.s.serais[c.to] ? 1.25 : 1) * (1 + 0.1 * this.tal("kacakci")));
    this.s.res.gold += gold;
    this.s.renown += 4;
    this.s.c.contracts++;
    const up = this.addXp(Math.round(c.gold / 3));
    this.hud.toast(`Emanet teslim edildi: +${gold} altın, +4 şöhret${this.s.serais[c.to] ? " (kervansaray primi)" : ""}${up ? " · Seviye atladın!" : ""}`, "good");
    this.s.contract = null;
  }

  // ---------- caravanserai network ----------

  seraiCount(): number {
    return Object.keys(this.s.serais).length;
  }

  seraiCost(city: string): number {
    const sr = this.s.serais[city];
    return sr ? 450 + sr.lv * 550 : 500 + 350 * this.seraiCount();
  }

  seraiReason(city: string): string | null {
    const s = this.s;
    const sr = s.serais[city];
    if (!s.free) return "Önce hürriyetini kazan";
    if (city === CAPITAL.id) return "Semerkant hanları efendinin elinde";
    if (sr && sr.lv >= 3) return "En yüksek seviye";
    const need = sr ? 30 * sr.lv : 15;
    if (s.renown < need) return `${need} şöhret gerekli`;
    if (s.res.gold < this.seraiCost(city)) return "Altın yetersiz";
    return null;
  }

  buildSerai(city: string): void {
    if (this.seraiReason(city)) return;
    const s = this.s;
    s.res.gold -= this.seraiCost(city);
    const sr = (s.serais[city] ??= { lv: 0, coffer: 0 });
    sr.lv++;
    const c = CITIES.find((x) => x.id === city)!;
    this.reveal(c.x, c.y, 16);
    if (sr.lv === 1) {
      s.renown += 5;
      const n = this.seraiCount();
      this.hud.story(
        `${CITY_NAME[city]} Kervansarayı`,
        "map/serai",
        `Ustalar avluyu taşla döşedi, kapının üstüne senin tamganı kazıdılar. Artık ${CITY_NAME[city]} yolundaki kervanlar senin çatının altında konaklıyor.<br><br>• Kasa her dakika gelir biriktirir; şehre uğradığında toplanır.<br>• Burada konaklamak bedava, ticarette %2 avantaj.<br>• Buraya teslim edilen emanetlere %25 prim.<br>• Ağındaki her yeni kervansaray, tümünün gelirini artırır (şu an <b>${n}</b>).<br><br>Dikkat: yakındaki köyler yağmalanırsa haramiler kasayı da boşaltır.`,
      );
    } else this.hud.toast(`${CITY_NAME[city]} kervansarayı ${sr.lv}. seviyeye çıktı`, "good");
  }

  seraiRate(city: string): number {
    const sr = this.s.serais[city];
    if (!sr) return 0;
    return sr.lv * 5 * (1 + 0.15 * (this.seraiCount() - 1)) * (1 + 0.12 * this.tal("hanagasi"));
  }

  seraiCap(city: string): number {
    return this.seraiRate(city) * 12 * (this.tal("ipekhan") ? 2 : 1);
  }

  seraiIncome(): number {
    return Object.keys(this.s.serais).reduce((a, id) => a + this.seraiRate(id), 0);
  }

  private seraiVisit(): void {
    const ci = this.nearCity();
    if (ci === this.lastCity) return;
    this.lastCity = ci;
    if (ci < 0) return;
    const sr = this.s.serais[CITIES[ci].id];
    if (!sr || sr.coffer < 1) return;
    const g = Math.floor(sr.coffer);
    sr.coffer -= g;
    this.s.res.gold += g;
    this.hud.toast(`Kervansaray kasası: +${g} altın`, "good");
  }

  defendRaid(): void {
    const r = this.s.raid;
    if (!r) return;
    const v = this.s.villages[r.v];
    this.battle(`${v.name} baskını`, r.army, 0, (win) => {
      if (!win) return "Haramiler köyü yağmalamaya devam ediyor…";
      this.s.raid = null;
      this.s.raidAt = this.now + 240000;
      v.rep = Math.min(100, v.rep + 20);
      v.rec = this.volMax(v.rep);
      this.s.c.raids++;
      const gold = Math.round((30 + armyPower(r.army)) * this.stealMult());
      this.gain({ gold, food: 80 });
      this.s.renown += 6;
      return `Köy kurtarıldı! Köylüler sana minnettar: +20 bağlılık, gönüllüler hazır, +${gold} altın, +80 yiyecek, +6 şöhret`;
    });
  }

  // ---------- story & companions ----------

  chapter(): Chapter | null {
    return this.s.story.done ? null : (CHAPTERS[this.s.story.ch] ?? null);
  }

  chapterReady(): boolean {
    const ch = this.chapter();
    return !!ch && this.s.free && !ch.req?.(this);
  }

  storyAdvance(): void {
    const ch = this.chapter();
    if (!ch) return;
    if (ch.outro) this.hud.story(ch.outro.title, ch.outro.img, ch.outro.text(this), "Devam");
    this.s.story.ch++;
    if (this.s.story.ch === 4) this.placeFort();
    const next = this.chapter();
    if (next) this.hud.story(`Bölüm ${this.s.story.ch + 1}: ${next.title}`, next.img, `${next.intro}<br><br><b>Hedef:</b> ${next.goal}`, "Yola çık");
    this.addXp(40 * this.s.story.ch);
    saveGame(this.s);
  }

  private storyTick(): void {
    const ch = this.chapter();
    if (ch?.auto && this.chapterReady() && !this.battleLock && ch.auto(this)) this.storyAdvance();
    const s = this.s;
    if (s.story.done && !s.story.lord && this.seraiCount() >= LORD_SERAIS && !this.battleLock) {
      s.story.lord = true;
      s.renown += 100;
      this.gain({ gold: 5000 });
      this.hud.story(
        "İpek Yolu'nun Efendisi",
        "map/serai",
        `Konstantinopolis'ten Kaşgar'a kadar her kervan senin tamganın altında konaklıyor. Tüccarlar adını dualarına katıyor, hanlar senin ekmeğini yiyor.<br><br>Bir zamanlar boynunda demir halka taşıyan ${s.hero.name}, artık bozkırın değil, yolun kendisinin sahibi.<br><br><b>+5000 altın · +100 şöhret · Unvan: İpek Yolu'nun Efendisi</b>`,
        "Yol hiç bitmez",
      );
    }
  }

  private placeFort(): void {
    const s = this.s;
    let best = 0;
    s.camps.forEach((c, i) => {
      if (Math.hypot(c.x - CAPITAL.x, c.y - CAPITAL.y) > Math.hypot(s.camps[best].x - CAPITAL.x, s.camps[best].y - CAPITAL.y)) best = i;
    });
    const c = s.camps[best];
    c.alive = false;
    c.respawnAt = 9e15;
    s.bandits = s.bandits.filter((b) => b.camp !== best);
    s.story.fort = { x: c.x, y: c.y };
    this.reveal(c.x, c.y, 8);
  }

  fortOdds(): number {
    return this.odds(FORT_GUARD, 0.3, KARA_HAN);
  }

  attackFort(): void {
    if (!this.s.story.fort || this.s.story.done) return;
    this.battle("Kara Tamga Kalesi", FORT_GUARD, 0.3, (win) => {
      if (!win) return "Kara Han'ın ordusu seni püskürttü. Birliğini büyüt, eşyalarını güçlendir ve tekrar dene.";
      const s = this.s;
      s.story.done = true;
      s.story.ch = CHAPTERS.length;
      s.renown += 100;
      s.mats.ruh += 25;
      s.mats.parsomen += 3;
      this.gain({ gold: 5000 });
      const it = classItem(s.nextId++, this.cls(), "silah", 5, 3);
      s.hero.bag.push(it);
      this.hud.story(
        "Destan tamamlandı: Kara Tamga yıkıldı",
        this.face(),
        `Kara Han'ın kılıcı elinden düştü. Kalenin zindanlarında annenle küçük Ertuğrul'u buldun; zincirlerini kendi ellerinle kırdın. Esirlerin ruhları mor bir ışık selinde göğe yükseldi ve bozkırdaki bütün Kurgan Taşları bir an için sustu.<br><br>Ozanlar artık senin adını söylüyor: <b>${s.hero.name}, İpek Yolu'nun Kurtarıcısı</b>.<br><br>Ama Kara Han'ın kılıcını alan herkes bilir: bozkırda boşalan taht uzun süre boş kalmaz. Yolların, beyliğin ve ordun seni bekliyor.<br><br><b>Yeni hedef:</b> İpek Yolu'nun ${LORD_SERAIS} şehrinde kervansaray kurarak yolun efendisi ol.`,
        "Yola devam",
      );
      return `Kara Han yenildi! +5000 altın, +100 şöhret, +25 Ruh Taşı, +3 Parşömen<br>Efsanevi ganimet: <b class="r3">${it.name}</b>`;
    }, KARA_HAN, "Kara Tamga ordusu");
  }

  fightKasim(): void {
    this.battle("Merv esir pazarı", army(8, 4, 0), 0.1, (win) => {
      if (!win) return "Kasım'ın adamları seni pazardan attı. Güçlenip geri dön.";
      this.rescueAyse(true);
      return "Kasım yere serildi, zincirler kırıldı!";
    }, KASIM, "Kasım'ın adamları");
  }

  rescueAyse(fought: boolean): void {
    this.addCompanion("ayse");
    if (fought) this.s.renown += 10;
    this.storyAdvance();
  }

  hasComp(id: CompId): boolean {
    return this.s.comps.includes(id);
  }

  addCompanion(id: CompId): void {
    if (this.hasComp(id)) return;
    this.s.comps.push(id);
    this.hud.toast(`${COMP_BY_ID[id].name} yoldaşın oldu!`, "good");
  }

  hiredCount(): number {
    return this.s.comps.filter((c) => COMP_BY_ID[c as CompId]?.hire).length;
  }

  hireReason(c: Companion): string | null {
    if (!c.hire) return "";
    if (this.hasComp(c.id)) return "Zaten yanında";
    if (this.hiredCount() >= COMP_MAX) return `En fazla ${COMP_MAX} paralı yoldaş`;
    if (this.s.renown < c.hire.renown) return `${c.hire.renown} şöhret gerekir`;
    if (this.s.res.gold < c.hire.gold) return "Altın yetersiz";
    return null;
  }

  hireCompanion(id: CompId): void {
    const c = COMP_BY_ID[id];
    if (this.hireReason(c) || !c.hire || this.nearCity() < 0) return;
    this.pay({ gold: c.hire.gold });
    this.addCompanion(id);
  }

  compMods(): CompMods {
    const m: CompMods = { atk: 0, army: 0, heal: 0, xp: 0, trade: 0, carry: 0, speed: 0, sight: 0 };
    for (const id of this.s.comps) {
      const c = COMP_BY_ID[id as CompId];
      if (c) for (const k of Object.keys(c.mods) as (keyof CompMods)[]) m[k] += c.mods[k] ?? 0;
    }
    return m;
  }

  recruitCost(): number {
    return Math.max(3, Math.round(8 - this.stat("kar") * 0.5));
  }

  recruit(i: number, n: number): void {
    if (!this.s.free) return;
    const v = this.s.villages[i];
    const room = this.heroCap() - armySize(this.s.hero.army);
    const k = Math.min(n, v.rec, room);
    if (k <= 0) return;
    if (!this.pay({ gold: k * this.recruitCost() })) {
      this.hud.toast("Altın yetersiz", "bad");
      return;
    }
    v.rec -= k;
    v.rep = Math.min(100, v.rep + k * 2);
    if (v.recAt < this.now) v.recAt = this.now + 45000;
    this.s.hero.army.spear += k;
    this.s.c.recruits += k;
    this.hud.toast(`${k} gönüllü birliğine katıldı`, "good");
  }

  hireCost(u: Unit): number {
    const base = u === "horse" ? 45 : u === "archer" ? 18 : 10;
    return Math.round(base * (1 - Math.min(0.3, this.stat("kar") * 0.02)));
  }

  hire(u: Unit, n: number): void {
    if (!this.s.free) return;
    const room = this.heroCap() - armySize(this.s.hero.army);
    const k = Math.min(n, room);
    if (k <= 0) return;
    if (!this.pay({ gold: this.hireCost(u) * k })) {
      this.hud.toast("Altın yetersiz", "bad");
      return;
    }
    this.s.hero.army[u] += k;
    this.hud.toast(`${k} paralı ${UNITS[u].name} tutuldu`, "good");
  }

  lootRuin(i: number): string {
    const r = this.s.ruins[i];
    if (r.looted) return "";
    r.looted = true;
    const tier = Math.min(5, 1 + Math.floor(Math.hypot(r.x - CAPITAL.x, r.y - CAPITAL.y) / 800));
    const gold = 40 * tier + Math.round(Math.random() * 60 * tier);
    this.gain({ gold });
    const up = this.addXp(20 * tier);
    const it = this.drop(tier, 0.7);
    return `Harabelerde eski bir hazine buldun: +${gold} altın, +${20 * tier} TP${it ? ` · ${it.name}` : ""}${up ? " — Seviye atladın!" : ""}`;
  }

  marchLoad(a: Army): number {
    return UNIT_KEYS.reduce((t, u) => t + a[u] * UNITS[u].load, 0);
  }

  sendMarch(node: number, a: Army): boolean {
    const s = this.s;
    if (!s.beylik || armySize(a) <= 0 || s.marches.length >= this.marchSlots()) return false;
    for (const u of UNIT_KEYS) if (s.garrison[u] < a[u]) return false;
    const n = s.nodes[node];
    const path = this.findPath(CAPITAL.x, CAPITAL.y, n.x, n.y);
    if (!path) return false;
    for (const u of UNIT_KEYS) s.garrison[u] -= a[u];
    s.marches.push({ id: s.nextId++, node, army: { ...a }, phase: "go", path, pathI: 0, x: CAPITAL.x, y: CAPITAL.y, until: 0, load: 0 });
    s.c.marched++;
    return true;
  }

  marchSlots(): number {
    return 1 + Math.floor(this.bld("saray") / 3);
  }

  private marches(dt: number, now: number): void {
    const s = this.s;
    for (const m of [...s.marches]) {
      const n = s.nodes[m.node];
      if (m.phase === "gather") {
        if (now >= m.until) {
          m.phase = "back";
          m.path = this.findPath(m.x, m.y, CAPITAL.x, CAPITAL.y) ?? [CAPITAL.x, CAPITAL.y];
          m.pathI = 0;
        }
        continue;
      }
      let move = (MARCH_SPEED * dt) / Math.max(0.55, Math.min(3, this.cellCost(m.x, m.y)));
      while (move > 0 && m.pathI < m.path.length) {
        const tx = m.path[m.pathI];
        const ty = m.path[m.pathI + 1];
        const d = Math.hypot(tx - m.x, ty - m.y);
        if (d <= move) {
          m.x = tx;
          m.y = ty;
          move -= d;
          m.pathI += 2;
        } else {
          m.x += ((tx - m.x) / d) * move;
          m.y += ((ty - m.y) / d) * move;
          move = 0;
        }
      }
      if (m.pathI < m.path.length) continue;
      if (m.phase === "go") {
        const take = Math.min(n.left, this.marchLoad(m.army));
        const rate = 1.5 + armySize(m.army) * 0.12;
        m.load = take;
        n.left -= take;
        if (n.left < n.max) n.regenAt = now + 10 * 60000;
        m.phase = "gather";
        m.until = now + (take / rate) * 1000;
      } else {
        for (const u of UNIT_KEYS) s.garrison[u] += m.army[u];
        this.gain({ [n.kind]: m.load });
        this.hud.toast(`Toplama seferi döndü: +${Math.round(m.load)} ${({ food: "yiyecek", wood: "kereste", stone: "taş", gold: "altın" } as const)[n.kind]}`, "good");
        s.marches = s.marches.filter((x) => x !== m);
      }
    }
  }

  dayOf(): { day: number; t: number } {
    const t = this.s.time / DAY_SEC;
    return { day: Math.floor(t) + 1, t: t % 1 };
  }

  readonly QUESTS: Quest[] = [
    { title: "Efendinin ocakları", text: "Semerkant yakınındaki ormana, taş ocağına ya da tarlaya git ve 3 vardiya çalış.", done: (g) => g.s.c.shifts >= 3, reward: { gold: 5 }, goto: (g) => g.s.nodes[0] },
    { title: "Hürriyet bedeli", text: "80 akçe biriktir, Semerkant'a dön ve efendinden hürriyetini satın al.", done: (g) => g.s.free, reward: { gold: 20 }, goto: () => ({ x: CAPITAL.x, y: CAPITAL.y }) },
    { title: "İlk silah", text: "Semerkant demircisinden bir silah al ve kuşan.", done: (g) => !!g.eq("silah"), reward: { gold: 15 }, goto: () => ({ x: CAPITAL.x, y: CAPITAL.y }) },
    { title: "Talim", text: "Bir şehrin talim meydanında kılıç ya da ok talimi yap.", done: (g) => g.s.c.trains >= 1, reward: { gold: 20 }, goto: () => ({ x: CAPITAL.x, y: CAPITAL.y }) },
    { title: "Yoldaşlar", text: "Bir köye git ve en az 3 gönüllü topla.", done: (g) => g.s.c.recruits >= 3, reward: { gold: 30 }, goto: (g) => g.nearest(g.s.villages) },
    { title: "Yol kesenler", text: "Semerkant topraklarının dışına çık ve bir harami çetesini yen.", done: (g) => g.s.c.wins >= 1, reward: { gold: 40 }, goto: (g) => g.nearest(g.s.bandits.filter((b) => g.isExplored(b.x, b.y))) ?? g.nearest(g.s.camps) },
    { title: "Güçlen", text: "3. seviyeye ulaş ve stat puanlarını Kahraman ekranından dağıt.", done: (g) => g.s.hero.lv >= 3 && g.s.hero.points === 0, reward: { gold: 40 } },
    { title: "İpek Yolu tüccarı", text: "Bir şehirde ucuz mal al, başka şehirde pahalıya sat. Toplam 150 altın kâr et.", done: (g) => g.s.c.profit >= 150, reward: { gold: 60 }, goto: () => CITIES[6] },
    { title: "Ödül avcısı", text: "Bir handan ödül ilanı al ve bir harami kampını yerle bir et.", done: (g) => g.s.c.camps >= 1, reward: { gold: 100 }, goto: (g) => g.nearest(g.s.camps.filter((c) => c.alive)) },
    { title: "Kendi hanın", text: "Semerkant dışında bir şehrin hanında kendi kervansarayını kur. Kasası sen yoldayken altın biriktirir.", done: (g) => g.seraiCount() >= 1, reward: { gold: 120 }, goto: () => CITIES[6] },
    { title: "Beylik", text: "40 şöhret ve 1500 altın topla, Semerkant'ta kendi beyliğini kur.", done: (g) => g.s.beylik, reward: { wood: 200, stone: 200 }, goto: () => ({ x: CAPITAL.x, y: CAPITAL.y }) },
    { title: "Başkenti büyüt", text: "Sarayı 2. seviyeye çıkar.", done: (g) => g.bld("saray") >= 2, reward: { gold: 200 }, goto: () => ({ x: CAPITAL.x, y: CAPITAL.y }) },
    { title: "Kaynak seferi", text: "Başkent garnizonundan bir kaynak noktasına toplama seferi gönder.", done: (g) => g.s.c.marched >= 1, reward: { food: 300, wood: 300 }, goto: (g) => g.nearest(g.s.nodes) },
  ];

  nearest<T extends { x: number; y: number }>(list: T[]): T | null {
    const h = this.s.hero;
    let best: T | null = null;
    let bd = Infinity;
    for (const p of list) {
      const d = Math.hypot(p.x - h.x, p.y - h.y);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    return best;
  }

  quest(): Quest | null {
    return this.QUESTS[this.s.quest] ?? null;
  }

  private quests(): void {
    const q = this.quest();
    if (q && q.done(this)) {
      this.gain(q.reward);
      this.s.quest++;
      this.hud.questDone(q);
      saveGame(this.s);
    }
  }

  cityName(i: number): string {
    return CITY_NAME[CITIES[i].id];
  }

  fresh(): Army {
    return army();
  }
}
