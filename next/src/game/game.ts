import { astar, CITIES, NAV, NH, NW, type World } from "../world/gen";
import type { Camera } from "../render/camera";
import type { WorldView } from "../render/worldView";
import type { Hud } from "../ui/hud";
import { fight, odds, type BattleResult, type Champion } from "./battle";
import { BUILDINGS, BUILDING_BY_ID, CITY_NAME, DAY_SEC, RES_KEYS, UNITS, UNIT_KEYS, army, armyPower, armySize, buildCost, buildTime, prodPerMin, storageCap, trainSpeed, unitUnlocked, xpNeed, type Army, type BuildingId, type Res, type Unit } from "./data";
import { CITY_TRADE, GOODS, GOOD_KEYS, goodMult, itemPrice, makeItem, rollItem, skillLv, type Good, type Item, type Skill, type Slot, type Stat } from "./rpg";
import { CAPITAL, SLAVE_RADIUS, banditArmy, campGarrison, loadGame, saveGame, type Bandit, type Bounty, type GameState } from "./state";

export type Target =
  | { kind: "village" | "camp" | "node" | "ruin" | "city" | "bandit"; i: number }
  | { kind: "capital" }
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

export class Game {
  s: GameState;
  hud!: Hud;
  act: Activity | null = null;
  target: Target | null = null;
  private repath = 0;
  private fogT = 0;
  private saveT = 0;
  private desertT = 0;
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
    return skillLv(this.s.hero.skills[k]);
  }

  eq(slot: Slot): Item | undefined {
    return this.s.hero.equip[slot];
  }

  maxHp(): number {
    const h = this.s.hero;
    return 40 + this.stat("day") * 12 + h.lv * 4 + (this.eq("zirh")?.hp ?? 0);
  }

  maxEnergy(): number {
    return 50 + this.stat("day") * 6;
  }

  heroAtk(): number {
    const w = this.eq("silah");
    if (!w) return 2 + this.stat("guc") * 1.5;
    if (w.kind === "ok") return (w.atk + this.stat("cev") * 1.5) * (1 + this.skill("ok") * 0.06);
    return (w.atk + this.stat("guc") * 1.5) * (1 + this.skill("kilic") * 0.06);
  }

  heroDef(): number {
    return (this.eq("zirh")?.def ?? 0) + (this.eq("kalkan")?.def ?? 0) + this.stat("day") * 0.6;
  }

  champion(): Champion {
    return { atk: this.heroAtk(), def: this.heroDef(), hp: this.s.hero.hp, maxHp: this.maxHp() };
  }

  heroBonus(): number {
    return 0.025 * this.stat("lid") + 0.02 * (this.s.hero.lv - 1);
  }

  heroCap(): number {
    if (!this.s.free) return 0;
    return 2 + this.stat("lid") * 3 + this.s.hero.lv + (this.s.beylik ? this.bld("saray") * 5 : 0);
  }

  carryCap(): number {
    return 10 + this.stat("guc") * 3 + (this.eq("at")?.carry ?? 0) + armySize(this.s.hero.army) * 2;
  }

  cargoUsed(): number {
    return GOOD_KEYS.reduce((a, g) => a + (this.s.hero.cargo[g] ?? 0), 0);
  }

  cap(): number {
    return this.s.beylik ? storageCap(this.bld("depo")) : 99999;
  }

  wagePerMin(): number {
    return UNIT_KEYS.reduce((a, u) => a + this.s.hero.army[u] * WAGE[u], 0);
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
      this.reveal(s.hero.x, s.hero.y, 11);
      for (const m of s.marches) this.reveal(m.x, m.y, 5);
    }
    this.quests();
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

  trainSkill(k: "kilic" | "ok"): void {
    const h = this.s.hero;
    if (this.busy()) return;
    if (this.nearCity() < 0) return this.hud.toast("Talim için bir şehirde olmalısın", "bad");
    if (h.energy < 15) return this.hud.toast("Çok yorgunsun", "bad");
    if (!this.pay({ gold: this.trainCostGold() })) return this.hud.toast("Hocaya verecek altının yok", "bad");
    h.energy -= 15;
    this.start(k === "kilic" ? "Kılıç talimi" : "Ok talimi", 6, () => {
      const before = this.skill(k);
      h.skills[k] += 30 + this.stat(k === "kilic" ? "guc" : "cev") * 3;
      this.s.c.trains++;
      const up = this.addXp(4);
      const after = this.skill(k);
      this.hud.toast(after > before ? `${k === "kilic" ? "Kılıç" : "Okçuluk"} becerin ${after}. seviyeye çıktı!` : "Talim tamamlandı", "good");
      if (up) this.hud.toast("Seviye atladın! Stat puanı kazandın.", "good");
    });
  }

  restCost(): number {
    return 2 + this.s.hero.lv * 2;
  }

  rest(): void {
    const h = this.s.hero;
    if (this.busy()) return;
    if (this.nearCity() < 0) return;
    if (!this.pay({ gold: this.restCost() })) return this.hud.toast("Han parası yok", "bad");
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
    s.hero.equip.zirh = makeItem(s.nextId++, "zirh", 1, 0);
    this.view.heroPortrait("heroes/hero1");
    this.hud.story(
      "Hürriyet!",
      "heroes/hero1",
      "Efendin akçeleri sayıp boynundaki demir halkayı çözdü. \"Git bakalım Toygar, yollar senin artık.\"<br><br>Eski bir keçe yelek ve sırtındaki yükten başka bir şeyin yok. Ama İpek Yolu cesur olanı zengin eder: demirciden bir silah al, talim yap, köylerden yoldaş topla. Bir gün kendi beyliğini kuracaksın.",
    );
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
      "Semerkant'ın ileri gelenleri adını duymuş. Eskiden köle olan Toygar şimdi şehrin dışındaki toprakların beyi. Binalarını geliştir, kışlada asker yetiştir, kaynak noktalarına toplama seferleri gönder.",
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
    return GOODS[g].base * goodMult(city, g) * wave * (1 + 0.6 * (this.market(city)[g] ?? 0));
  }

  buyFactor(): number {
    return Math.max(1.02, 1.12 - this.skill("ticaret") * 0.006 - this.stat("kar") * 0.004);
  }

  sellFactor(): number {
    return Math.min(0.98, 0.88 + this.skill("ticaret") * 0.006 + this.stat("kar") * 0.004);
  }

  buyPrice(city: string, g: Good): number {
    return Math.max(1, Math.round(this.price(city, g) * this.buyFactor()));
  }

  sellPrice(city: string, g: Good): number {
    return Math.max(1, Math.round(this.price(city, g) * this.sellFactor()));
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
      const slots: Slot[] = ["silah", "silah", "zirh", "kalkan", "at", "tilsim"];
      for (const slot of slots) {
        const t = lo + Math.floor(Math.random() * (hi - lo + 1));
        items.push(makeItem(this.s.nextId++, slot, t, Math.random() < 0.15 ? 1 : 0, items.some((x) => x.kind === "kilic") ? "ok" : "kilic"));
      }
      if (city === "samarkand") items[0] = makeItem(this.s.nextId++, "silah", 1, 0, "kilic");
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
    if (!this.s.hero.equip[it.slot]) this.equip(it.id);
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

  private drop(tier: number, chance: number): Item | null {
    if (Math.random() > chance) return null;
    const it = rollItem(this.s.nextId++, tier, Math.min(0.1, this.stat("kar") * 0.005));
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
    return best;
  }

  heroSpeed(): number {
    const n = armySize(this.s.hero.army);
    return HERO_SPEED * (1 + this.stat("cev") * 0.02 + (this.eq("at")?.spd ?? 0)) * (1 - Math.min(0.35, n / 300));
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
      b.chase = !safe && !this.act && dh < 230 && pow > heroPow * 0.75 && Math.hypot(h.x - c.x, h.y - c.y) < 700;
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
      const gold = Math.round(armyPower(b.army) * 0.9 + 8 * b.tier);
      this.gain({ gold });
      this.s.renown += b.tier * 2;
      this.s.c.wins++;
      const it = this.drop(b.tier, 0.3 + b.tier * 0.1);
      return `+${gold} altın · +${b.tier * 2} şöhret${it ? `<br>Ganimet: <b class="r${it.rar}">${it.name}</b>` : ""}`;
    });
  }

  battle(title: string, enemy: Army, enemyBonus: number, after: (win: boolean) => string): void {
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
    const champ = this.champion();
    const res: BattleResult = fight(h.army, this.heroBonus(), enemy, enemyBonus, champ);
    this.battleLock = true;
    h.path = null;
    this.target = null;
    const before = { ...h.army };
    const hpBefore = h.hp;
    h.army = { ...res.rounds[res.rounds.length - 1].a };
    h.hp = Math.max(1, res.heroHp);
    const w = this.eq("silah");
    h.skills[w?.kind === "ok" ? "ok" : "kilic"] += 6 * (res.rounds.length - 2);
    const xp = Math.round(armyPower(enemy) * (res.win ? 0.7 : 0.15)) + 3;
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
    this.hud.showBattle(title, before, enemy, res, { hpBefore, maxHp: this.maxHp() }, xp, lvUp, extra || fled, () => {
      this.battleLock = false;
      saveGame(this.s);
    });
  }

  addXp(xp: number): boolean {
    const h = this.s.hero;
    h.xp += xp;
    let up = false;
    while (h.xp >= xpNeed(h.lv)) {
      h.xp -= xpNeed(h.lv);
      h.lv++;
      h.points += 3;
      h.hp = this.maxHp();
      up = true;
    }
    return up;
  }

  odds(enemy: Army, bonus = 0): number {
    return odds(this.s.hero.army, this.heroBonus(), enemy, bonus, this.champion());
  }

  attackCamp(i: number): void {
    const c = this.s.camps[i];
    if (!c.alive) return;
    this.battle(`${c.name} kampı`, c.garrison, 0.1, (win) => {
      if (!win) return "";
      c.alive = false;
      c.respawnAt = this.now + 15 * 60000;
      this.s.bandits = this.s.bandits.filter((b) => b.camp !== i);
      const loot = { gold: 60 * c.tier * c.tier + 40, wood: 60 * c.tier, stone: 40 * c.tier };
      this.gain(loot);
      this.s.renown += c.tier * 8;
      this.s.c.camps++;
      let txt = `Kamp yerle bir edildi! +${loot.gold} altın, +${c.tier * 8} şöhret`;
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
