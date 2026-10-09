import { astar, CITIES, GH, GW, H, NAV, NH, NW, W, type World } from "../world/gen";
import type { Camera } from "../render/camera";
import type { WorldView } from "../render/worldView";
import type { Hud } from "../ui/hud";
import { ROW_NEED, TALENT_BY_ID, branchSpent, type Talent } from "./talents";
import { CONS_BY_ID, REFINES, gearCost, type Cost, type Mat } from "./crafting";
import { GIVERS, SIDE_TEXT, type SideKind, type SideQuest } from "./sidequests";
import { audio } from "../audio";
import { Sim, TACTICS, TACTIC_KEYS, fight, odds, stanceWeights, tacticDelta, type BattleResult, type Boss, type Champion, type Tactic } from "./battle";
import { BUILDINGS, BUILDING_BY_ID, CITY_NAME, DAY_SEC, RES_KEYS, UNITS, UNIT_KEYS, army, armyPower, armySize, buildCost, buildTime, prodPerMin, storageCap, trainSpeed, unitUnlocked, xpNeed, type Army, type BuildingId, type Res, type Unit } from "./data";
import { CITY_TRADE, GOODS, GOOD_KEYS, PLUS_CHANCE, SLOTS, STAT_INFO, canPlus, classItem, goodMult, itemPrice, itemStats, makeHorse, makeItem, plusCost, rollItem, setPiece, setPlus, skillLv, uniqueItem, type Good, type Item, type Skill, type Slot, type Stat } from "./rpg";
import { SETS, SET_FORGE, SET_KEYS, SET_SLOTS, UNIQUES, addMods, type GearMods, type SetId } from "./legend";
import { TITLE_CATS, titleKey, titleOf, titleReward } from "./titles";
import { DAILY_POOL, today, yesterday, type Daily, type DailyTask } from "./daily";
import { gen } from "./text";
import { BREEDS, BREED_GOLD, BREED_TIME, SHOP_BREEDS, tulparChance, type Breed } from "./horse";
import { BIRDS, BIRD_KEYS, BIRD_MAX, BIRD_NAMES, HUNTS, birdSight, birdXpNeed, type BirdFlight, type BirdKind } from "./falcon";
import { BRO_BETRAY, BRO_MAX, BRO_MODS, LAST_WORDS, NEM_MAX, NEM_TRAITS, REVENGE, SCAR_EPITHETS, TAUNTS, makeNemesis, nemBoss, nemName, type Nemesis } from "./nemesis";
import { REQ_GOODS, REQ_INFO, RIVAL_DEFS, RIVAL_LINES, RIVAL_TRAITS, STATUS_NAME, giftCost, oneOf, reqGold, rivalArmy, rivalBoss, rivalName, tribute, type BeyReq, type Rival } from "./rivals";
import { CITY_BLDS, CITY_EVENTS, ENGINE_GOLD, FEAST_GOLD, GOVERNORS, GOV_GOLD, SIEGE_LV, SIEGE_RENOWN, TAX, cityBldCost, cityGarrison, cityTax, wallBonus, type CityBld, type CityEvent, type Governor } from "./conquest";
import { DEEP_LORE, DEEP_PERKS, DOORS, DOOR_KEYS, RIDDLES, TOMBS, deepBoss, deepGuard, deepTier, tombOf, type DeepPerk, type DeepRun, type DoorKind } from "./deep";
import { BRIBE_GOLD, DECREES, KAGAN_RENOWN, KURULTAY_EVERY, KURULTAY_MAX, decreeOf } from "./kurultay";
import { ESCORT_GOLD, PIRATE_RISK, SHIP_CAP, SHIP_GOLD, SHIP_MAX, pirateArmy, portOf, routeDays } from "./hazar";
import { LEGACY_PERKS, hasLegacy, recordEnding } from "./legacy";
import { HERD_GOLD, HERD_BUY, HERD_MAX, MOVE_FOOD, OTAG_GOLD, OTAG_WOOD, REST_FOOD, ZONE_NAME, bestZone, pasture, zoneOf } from "./otag";
import { boyOf, type Boy, type BoyStep } from "./korkut";
import { DAUGHTER_NAMES, FAMILY_DEFAULT, KID_EVERY, KID_MAX, SON_NAMES, YEAR_DAYS, brideGold, brideOf, deathChance, kidAge, makeHeirs, pick, type Family } from "./dynasty";
import { DIR_DEFAULT, PERSONAS, pickRelief, pickThreat, struggling, tensionGain, type DirCtx, type DirState, type PersonaId, type Relief, type Threat } from "./director";
import { ROAD_CHANCE, ROAD_EVENTS, ROAD_PER_DAY, ROAD_STEP, checkChance, type RoadCtx, type RoadEvent, type RoadFx, type RoadOpt } from "./road";
import { SING_GOLD, SONG_MAX, TAMGA_DEFAULT, compose, singRenown, type SongCtx, type SongKind, type Tamga } from "./ozan";
import { TORE_CASES, kutArmy, kutLoy, kutTier, kutVote, type ToreCase } from "./kut";
import { SCARS, VET_LV_MAX, VET_MAX, VET_RANKS, VET_XP, makeVet, vetBonus, vetTitle } from "./vets";
import { ACHIEVEMENTS, steamUnlock, storeUnlocked, unlockedSet } from "./achievements";
import { CODEX, codexTitle } from "./codex";
import { ORIGIN_BY_ID, type OriginId } from "./origins";
import { SUREK_FOOD, WR_FOES } from "./games";
import { BALBAL_GOLD, BALBAL_MAX, BALBAL_STONE, YUG_LATE, balbalBonus, yugCost, type Fallen, type Foe } from "./yug";
import type { WrestleFoe } from "../ui/wrestle";
import { SIEGE_MAX_DAY, newSiege, siegeDay, siegeGar, siegeWall, type SiegeAct, type SiegeCtx, type SiegeRun } from "./siege";
import { BOND_FX, BOND_LEAVE, BOND_QUEST, BOND_START, COMP_QUESTS, SWORN_MULT, type BondEvent, type CompQuest, type CqChoice } from "./bonds";
import { t as tr } from "../i18n";
import { SEASONS, SEASON_DAYS, seasonOf, type Season, type SeasonId } from "./seasons";
import { FACTIONS, FACTION_KEYS, HOSTILE, REP_RANKS, RANK_PERKS, factionOf, repRank, type FactionId } from "./factions";
import { CLASS_BY_ID, CLASS_SKILLS, SKILL_MAX, WEAPON_NAME, WEAPON_STAT, skillPow, skillRank, type ClassDef, type ClassId, type ClassSkill, type WeaponKind } from "./classes";
import { ACT2, ACT3, CHAPTERS, COMP_BY_ID, COMP_MAX, ENDINGS, ERLIK, ERLIK_SHADE, FORT_GUARD, GATE_GUARD, KARA_HAN, KASIM, KOK_BORU, PEAK_GUARD, SHADE_GUARD, endingOf, type Chapter, type CompId, type CompMods, type Companion } from "./story";
import { CAPITAL, SLAVE_RADIUS, banditArmy, campGarrison, importSave, kurganBoss, kurganGuard, loadGame, saveGame as rawSave, useSlot, wipeGame, type Bandit, type Bounty, type Caravan, type Contract, type GameState, type Storm } from "./state";

export type Target =
  | { kind: "village" | "camp" | "node" | "ruin" | "city" | "bandit" | "kurgan" | "caravan" | "rival"; i: number }
  | { kind: "capital" }
  | { kind: "fort" }
  | { kind: "gate" }
  | { kind: "peak" }
  | { kind: "otag" }
  | { kind: "boy" }
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
  private cvT = 2;
  private titleT = 1;
  private stormT = 45;
  private inStorm = 0;
  private posseT = 20;
  private fogT = 0;
  private saveT = 0;
  private desertT = 0;
  private ambushT = 30;
  private lastCity = -2;
  lastTactic: Tactic = "hucum";
  private spawnAt = new Map<number, number>();
  battleLock = false;
  private roadD = 0;
  private roadAt = { x: 0, y: 0 };
  deep: DeepRun | null = null;
  birdFly: BirdFlight | null = null;
  birdAim = false;
  fogRev = 0;
  private lastSeason: SeasonId | null = null;
  private reqT = 2;
  private starveT = 0;
  private achT = 3;
  private ach = unlockedSet();
  private wasNight = false;
  private deepBest0 = 0;
  private afterBattle: (() => void) | null = null;
  private songLater = false;
  private retreatHook: (() => void) | null = null;
  private kurAnn = -1;

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

  saveNow(): void {
    saveGame(this.s);
  }

  switchSlot(i: number): void {
    saveGame(this.s);
    wiped = true;
    useSlot(i);
    location.reload();
  }

  importText(text: string): boolean {
    if (!importSave(text)) return false;
    wiped = true;
    location.reload();
    return true;
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
    return Math.round((40 + this.stat("day") * 12 + h.lv * 4 + (this.eq("zirh")?.hp ?? 0)) * (1 + 0.03 * this.tal("demirten") + (this.gearMods().hp ?? 0) + (hasLegacy("hurriyet") ? 0.1 : 0)));
  }

  setCount(id: SetId): number {
    return SLOTS.filter((sl) => this.eq(sl)?.set === id).length;
  }

  gearMods(): GearMods {
    const m: GearMods = {};
    for (const sl of SLOTS) {
      const it = this.eq(sl);
      if (it?.mods) addMods(m, it.mods);
    }
    for (const k of SET_KEYS) {
      const n = this.setCount(k);
      if (n >= 2) addMods(m, SETS[k].b2);
      if (n >= 4) addMods(m, SETS[k].b4);
    }
    const t = this.s.title ? titleOf(this.s.title) : null;
    if (t) addMods(m, t.mods);
    const b = this.s.bird;
    if (b) addMods(m, BIRDS[b.kind].mods(b.lv));
    for (const n of this.s.nemeses) {
      if (!n.bro) continue;
      const { text: _t, ...bm } = BRO_MODS[n.trait];
      addMods(m, bm);
    }
    return m;
  }

  // ---------- horse breeding ----------

  horseShop(city: string): Breed[] {
    return SHOP_BREEDS.filter((b) => !BREEDS[b].cities.length || BREEDS[b].cities.includes(city));
  }

  private atCity(city: string): boolean {
    const ci = this.nearCity();
    return ci >= 0 && CITIES[ci].id === city;
  }

  buyHorse(breed: Breed, city: string): void {
    const s = this.s;
    const b = BREEDS[breed];
    if (!s.free || !this.atCity(city) || !this.horseShop(city).includes(breed) || !this.pay({ gold: b.gold })) return;
    const j = () => 0.92 + Math.random() * 0.16;
    const it = makeHorse(s.nextId++, breed, { breed, gen: 1, sire: "", dam: "" }, { spd: b.spd * j(), carry: b.carry * j(), hp: b.hp * j() });
    s.hero.bag.push(it);
    audio.play("quest");
    this.hud.toast(`${it.name} artık senin. Teçhizat sekmesinden bin.`, "good");
  }

  canStud(city: string): boolean {
    return city === CAPITAL.id || !!this.s.serais[city] || !!this.s.owned[city];
  }

  studHorses(): Item[] {
    const h = this.s.hero;
    return [...(h.equip.at ? [h.equip.at] : []), ...h.bag.filter((it) => it.slot === "at")];
  }

  breedHorses(aId: number, bId: number, city: string): void {
    const s = this.s;
    const h = s.hero;
    if (s.stud || aId === bId || !this.atCity(city) || !this.canStud(city)) return;
    const all = this.studHorses();
    const a = all.find((x) => x.id === aId);
    const b = all.find((x) => x.id === bId);
    if (!a || !b || !this.pay({ gold: BREED_GOLD })) return;
    for (const x of [a, b]) {
      if (h.equip.at?.id === x.id) delete h.equip.at;
      else h.bag = h.bag.filter((y) => y.id !== x.id);
    }
    s.stud = { a, b, until: this.now + BREED_TIME, city };
    this.hud.toast(`${a.name.split(" (")[0]} ile ${b.name.split(" (")[0]} ahıra alındı. Tay ${Math.round(BREED_TIME / 60000)} dakika sonra doğacak.`, "good");
  }

  private studTick(): void {
    const s = this.s;
    const st = s.stud;
    if (!st || this.now < st.until || this.battleLock) return;
    s.stud = null;
    const ia = st.a.horse ?? { breed: "bozkir" as Breed, gen: 1, sire: "", dam: "" };
    const ib = st.b.horse ?? { breed: "bozkir" as Breed, gen: 1, sire: "", dam: "" };
    const gen = Math.max(ia.gen, ib.gen) + 1;
    const mix = (x: number, y: number) => ((x + y) / 2) * (0.94 + Math.random() * 0.2) + (Math.random() < 0.5 ? Math.max(x, y) - (x + y) / 2 : 0) * 0.5;
    let spd = mix(st.a.spd, st.b.spd);
    let carry = mix(st.a.carry, st.b.carry);
    let hp = mix(st.a.hp, st.b.hp);
    const tul = Math.random() < tulparChance(gen, Math.max(st.a.spd, st.b.spd)) || ia.breed === "tulpar" && ib.breed === "tulpar";
    let breed: Breed = ia.breed === ib.breed ? ia.breed : Math.random() < 0.5 ? ia.breed : ib.breed;
    if (tul) {
      breed = "tulpar";
      const t = BREEDS.tulpar;
      spd = Math.max(spd, t.spd);
      carry = Math.max(carry, t.carry);
      hp = Math.max(hp, t.hp);
    }
    const sire = st.a.name.split(" (")[0];
    const dam = st.b.name.split(" (")[0];
    const foal = makeHorse(s.nextId++, breed, { breed, gen, sire, dam }, { spd, carry, hp });
    s.hero.bag.push(st.a, st.b, foal);
    s.c.foals++;
    audio.play("level");
    if (tul) {
      this.chron(`${CITY_NAME[st.city]} ahırında gök gürledi: ${sire} ile ${dam} bir Tulpar doğurdu. Ozanlar yüz yıldır böyle bir at görmemişti.`);
      this.sing("tulpar", { place: CITY_NAME[st.city] });
    }
    this.hud.story(
      tul ? "Bir Tulpar doğdu!" : "Tay doğdu!",
      "icons/foal",
      `${tul ? "Ahırın çatısından mavi bir ışık süzüldü; tayın sırtında tüyden kanat izleri var. Seyisler diz çöktü." : `${CITY_NAME[st.city]} ahırında, saman kokusu arasında titrek bacaklarıyla ayağa kalktı.`}<br><br><b class="r${foal.rar}">${foal.name}</b><br>${itemStats(foal)}<br><br><i>${sire} × ${dam} · ${gen}. kuşak</i>${!tul && gen >= 2 ? `<br><small class="dim">Kuşaklar ilerledikçe ve hızlı atlar çiftleştikçe Tulpar doğma şansı artar (${Math.round(tulparChance(gen + 1, Math.max(foal.spd, st.a.spd)) * 100)}%).</small>` : ""}`,
      "Adını yaz",
    );
  }

  // ---------- falconry ----------

  birdShop(city: string): BirdKind[] {
    return BIRD_KEYS.filter((k) => !BIRDS[k].city || BIRDS[k].city === city);
  }

  buyBird(kind: BirdKind, city: string): void {
    const s = this.s;
    const d = BIRDS[kind];
    const ci = this.nearCity();
    if (!s.free || ci < 0 || CITIES[ci].id !== city || !this.birdShop(city).includes(kind) || (s.bird && s.bird.kind === kind) || !this.pay({ gold: d.gold })) return;
    const old = s.bird;
    const name = BIRD_NAMES[Math.floor(Math.random() * BIRD_NAMES.length)];
    s.bird = { kind, name, lv: old ? Math.max(1, old.lv - 2) : 1, xp: 0, cd: 0, huntT: d.hunt };
    audio.play("quest");
    if (!old) this.chron(`${gen(s.hero.name)} koluna ilk kez bir ${d.name} kondu. Adını ${name} koydu.`);
    this.hud.story(`${d.name}: ${name}`, `icons/bird_${kind}`, `Kuşçu deri eldiveni koluna geçirdi, ${d.name.toLocaleLowerCase("tr")} kanatlarını açıp bileğine kondu.<br><br><i>${d.desc}</i><br><br><b>Uçur</b> düğmesiyle haritada bir yere gönder; gittiği yolu ve çevresini sana gösterir. Boş kaldığında kendiliğinden ava çıkar. Seviyesi arttıkça görüşün genişler; <b>3. seviyede</b> düşmanın taktiğini önceden haber verir.${old ? `<br><br>Eski kuşun ${old.name} kuşçuya kaldı; tecrübesinin bir kısmını yeni kuşa aktardı.` : ""}`, "Uç, " + name + "!");
  }

  birdReady(): number {
    const b = this.s.bird;
    return b ? Math.max(0, (b.cd - this.now) / 1000) : Infinity;
  }

  aimBird(): void {
    if (!this.s.bird || this.birdReady() > 0 || this.birdFly) return;
    this.birdAim = !this.birdAim;
    if (this.birdAim) this.hud.toast(`${this.s.bird.name} kolunda bekliyor. Haritada bir yere dokun.`, "info");
  }

  sendBird(x: number, y: number): void {
    const s = this.s;
    const b = s.bird;
    this.birdAim = false;
    if (!b || this.birdReady() > 0 || this.birdFly) return;
    const d = BIRDS[b.kind];
    const h = s.hero;
    const far = 700 + b.lv * 90;
    const dist = Math.hypot(x - h.x, y - h.y);
    if (dist > far) {
      x = h.x + ((x - h.x) / dist) * far;
      y = h.y + ((y - h.y) / dist) * far;
    }
    x = Math.max(20, Math.min(W - 20, x));
    y = Math.max(20, Math.min(H - 20, y));
    this.birdFly = { x: h.x, y: h.y, tx: x, ty: y, back: false };
    b.cd = this.now + d.cd * 1000 * (1 - b.lv * 0.03);
    audio.play("story");
  }

  private birdXp(n: number): void {
    const b = this.s.bird;
    if (!b || b.lv >= BIRD_MAX) return;
    b.xp += n;
    while (b.lv < BIRD_MAX && b.xp >= birdXpNeed(b.lv)) {
      b.xp -= birdXpNeed(b.lv);
      b.lv++;
      this.hud.toast(`${b.name} güçlendi! ${BIRDS[b.kind].name} seviye ${b.lv}${b.lv === 3 ? " · artık düşman taktiğini haber veriyor" : ""}`, "good");
    }
  }

  private birdTick(dt: number): void {
    const s = this.s;
    const b = s.bird;
    if (!b) return;
    const f = this.birdFly;
    if (f) {
      const tx = f.back ? s.hero.x : f.tx;
      const ty = f.back ? s.hero.y : f.ty;
      const d = Math.hypot(tx - f.x, ty - f.y);
      const sp = BIRDS[b.kind].speed * dt;
      if (d <= sp) {
        f.x = tx;
        f.y = ty;
        if (f.back) {
          this.birdFly = null;
          this.birdXp(10);
        } else f.back = true;
      } else {
        f.x += ((tx - f.x) / d) * sp;
        f.y += ((ty - f.y) / d) * sp;
      }
      this.reveal(f.x, f.y, 5 + Math.floor(b.lv / 2));
      return;
    }
    if (this.battleLock || !s.free || this.nearCity() >= 0 || this.deep) return;
    b.huntT -= dt;
    if (b.huntT > 0) return;
    const d = BIRDS[b.kind];
    b.huntT = d.hunt - b.lv * 3 + Math.random() * 20;
    const hunt = HUNTS[Math.floor(Math.random() * HUNTS.length)];
    const gold = Math.round(hunt.gold * (8 + b.lv * 4) * (b.kind === "sungur" ? 1.5 : b.kind === "kartal" ? 1.3 : 1));
    this.gain({ gold });
    this.birdXp(6);
    this.hud.toast(`${b.name} ${hunt.what} getirdi · +${gold} altın`, "info");
  }

  daily(): Daily | null {
    const s = this.s;
    if (!s.free) return null;
    const d = today();
    if (!s.daily || s.daily.date !== d) {
      const pool = DAILY_POOL.filter((p) => s.hero.lv >= (p.lv ?? 0)).sort(() => Math.random() - 0.5).slice(0, 3);
      s.daily = { date: d, tasks: pool.map((p) => ({ key: p.key, need: p.need(s.hero.lv), base: s.c[p.key], done: false })), chest: false, streak: s.daily?.streak ?? 0, last: s.daily?.last ?? "" };
    }
    return s.daily;
  }

  dailyProg(t: DailyTask): number {
    return Math.max(0, Math.min(t.need, this.s.c[t.key] - t.base));
  }

  dailyGold(): number {
    return 80 + this.s.hero.lv * 25;
  }

  claimDaily(i: number): void {
    const d = this.daily();
    const t = d?.tasks[i];
    if (!d || !t || t.done || this.dailyProg(t) < t.need) return;
    t.done = true;
    const s = this.s;
    const gold = this.dailyGold();
    s.res.gold += gold;
    const bonus = [() => ((s.mats.ruh += 2), "+2 Ruh Taşı"), () => ((s.mats.parsomen += 1), "+1 Parşömen"), () => ((s.cons.merhem = (s.cons.merhem ?? 0) + 2), "+2 Şifa Merhemi")][i % 3]();
    this.addXp(30 + s.hero.lv * 8);
    this.hud.toast(`Ferman tamamlandı: +${gold} altın, ${bonus}`, "good");
  }

  dailyClaimable(): boolean {
    const d = this.daily();
    return !!d && (this.chestReady() || d.tasks.some((t) => !t.done && this.dailyProg(t) >= t.need));
  }

  chestReady(): boolean {
    const d = this.daily();
    return !!d && !d.chest && d.tasks.every((t) => t.done);
  }

  openChest(): void {
    const d = this.daily();
    if (!d || !this.chestReady()) return;
    const s = this.s;
    d.chest = true;
    d.streak = d.last === yesterday() ? d.streak + 1 : 1;
    d.last = d.date;
    const gold = 300 + s.hero.lv * 40 + d.streak * 150;
    s.res.gold += gold;
    s.mats.ruh += 3 + d.streak;
    const lg = this.legendDrop(Math.min(0.4, 0.12 + d.streak * 0.04));
    const it = lg ?? rollItem(s.nextId++, this.legendTier(), this.cls(), 0.2);
    if (!lg) s.hero.bag.push(it);
    this.hud.story("Hakan'ın Fermanı", "icons/chest", `Bugünün bütün fermanlarını yerine getirdin. Ulaklar mühürlü bir sandık getirdi.<br><br><b>+${gold} altın · +${3 + d.streak} Ruh Taşı</b><br>Sandıktan çıkan: <b class="r${it.rar}">${it.name}</b><br><br>Seri: <b>${d.streak} gün</b> ${d.streak > 1 ? "— her gün sandık daha cömert!" : "— yarın da gel, seri bonusu birikir."}`, "Teşekkürler");
  }

  setTitle(key: string): void {
    if (key && !this.s.titles.includes(key)) return;
    this.s.title = key;
    const t = titleOf(key);
    if (t) this.hud.toast(`Unvan: ${t.name}`, "good");
  }

  private titleTick(dt: number): void {
    this.titleT -= dt;
    if (this.titleT > 0 || !this.s.free) return;
    this.titleT = 1;
    const s = this.s;
    const got: string[] = [];
    let gold = 0;
    let renown = 0;
    for (const cat of TITLE_CATS) {
      const v = cat.value(s);
      cat.tiers.forEach((t, i) => {
        const key = titleKey(cat.id, i);
        if (v < t.need || s.titles.includes(key)) return;
        s.titles.push(key);
        const r = titleReward(i);
        gold += r.gold;
        renown += r.renown;
        got.push(t.name);
        if (!s.title || (titleOf(s.title)?.tier ?? -1) < i) s.title = key;
      });
    }
    if (!got.length) return;
    s.res.gold += gold;
    s.renown += renown;
    this.hud.questDone({ title: got.length === 1 ? got[0] : `${got.length} yeni unvan`, text: "", done: () => true, reward: { gold } }, "Unvan kazandın");
    this.hud.toast(`${got.join(", ")} · +${renown} şöhret`, "good");
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

  chooseClass(id: ClassId, name: string, origin: OriginId = "oba"): void {
    const s = this.s;
    const c = CLASS_BY_ID[id];
    const o = ORIGIN_BY_ID[origin];
    s.cls = id;
    s.origin = origin;
    s.hero.stats = { ...c.start };
    for (const [k, v] of Object.entries(o.stats ?? {})) s.hero.stats[k as Stat] += v;
    for (const [k, v] of Object.entries(o.skills ?? {})) s.hero.skills[k as Skill] += v;
    for (const [k, v] of Object.entries(o.bond ?? {})) (s.bond ??= {})[k] = BOND_START + v;
    s.res.gold += o.gold ?? 0;
    s.renown += o.renown ?? 0;
    s.kut = Math.min(100, (s.kut ?? 50) + (o.kut ?? 0));
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
    const m = this.cls().mods.atk * (1 + 0.04 * this.tal("keskin") + 0.15 * this.tal("efsane") + (this.gearMods().atk ?? 0));
    if (!w) return (2 + this.stat("guc") * 1.5) * m * (1 + this.compMods().atk);
    return (w.atk + this.stat(WEAPON_STAT[w.kind as WeaponKind] ?? "guc") * 1.5) * (1 + this.skill("silah") * 0.06) * m * (1 + this.compMods().atk);
  }

  heroDef(): number {
    return ((this.eq("zirh")?.def ?? 0) + (this.eq("kalkan")?.def ?? 0) + this.stat("day") * 0.6) * this.cls().mods.def * (1 + 0.05 * this.tal("demirten") + 0.15 * this.tal("efsane") + (this.gearMods().def ?? 0));
  }

  champion(): Champion {
    const m = this.cls().mods;
    const gm = this.gearMods();
    return {
      atk: this.heroAtk() * (this.buff("totem") ? 1.25 : 1),
      def: this.heroDef(),
      hp: this.s.hero.hp,
      maxHp: this.maxHp(),
      crit: m.crit + (this.eq("silah")?.crit ?? 0) + 0.025 * this.tal("kritik") + (gm.crit ?? 0),
      critMult: m.critMult,
      dodge: m.dodge,
      heal: m.heal + this.compMods().heal + 0.015 * this.tal("kanici") + (this.buff("tutsu") ? 0.04 : 0) + (gm.heal ?? 0),
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
    return 1 + 0.1 * this.tal("ganimet") + (this.gearMods().loot ?? 0) + this.classSkills().filter((s) => s.kind === "steal").reduce((t, s) => t + skillPow(s, this.skillLvOf(s.id)), 0);
  }

  heroBonus(): number {
    return 0.025 * this.stat("lid") + 0.02 * (this.s.hero.lv - 1) + this.cls().mods.army + this.compMods().army + 0.03 * this.tal("nara") + (this.buff("davul") ? 0.15 : 0) + (this.buff("surek") ? 0.08 : 0) + (this.buff("yug") ? 0.05 : 0) + balbalBonus(this.s.foes ?? []) + (this.gearMods().army ?? 0) + this.heroRankBonus() + this.allyBonus() + (hasLegacy("tengri") ? 0.06 : 0) + vetBonus(this.s.vets ?? []) + (this.s.beylik ? kutArmy(this.s.kut ?? 50) : 0) + this.famBonus();
  }

  addKut(n: number, why = ""): void {
    const s = this.s;
    if (!s.beylik || !n) return;
    const k0 = s.kut ?? 50;
    s.kut = Math.max(0, Math.min(100, k0 + n));
    const t0 = kutTier(k0);
    const t1 = kutTier(s.kut);
    if (t0 !== t1) {
      const up = s.kut > k0;
      this.chron(up ? `${gen(s.hero.name)} kutu parladı: artık ${t1.name} olarak anılıyor.` : `${gen(s.hero.name)} kutu söndü: halk onu ${t1.name} diye anıyor.`);
      this.hud.toast(`Kut: ${t1.name}! ${t1.desc}`, up ? "good" : "bad");
    } else if (why && Math.abs(n) >= 3) this.hud.toast(`Kut ${n > 0 ? "+" : ""}${n} · ${why}`, n > 0 ? "good" : "bad");
  }

  sing(k: SongKind, c: Partial<SongCtx> = {}): void {
    const s = this.s;
    s.songs ??= [];
    const song = compose(k, { name: s.hero.name, ...c }, this.dayOf().day);
    s.songs.unshift(song);
    if (s.songs.length > SONG_MAX) s.songs.length = SONG_MAX;
    this.hud.toast(`Ozanlar yeni bir destan yaktı: "${song.title}"`, "good");
  }

  singReason(): string {
    const s = this.s;
    if (!s.songs?.length) return "Henüz hakkında yakılmış bir destan yok";
    if (this.nearCity() < 0) return "Ozanlar şehir hanlarında çalar";
    if (s.ozanDay === this.dayOf().day) return "Bugün destanın zaten okundu";
    if (s.res.gold < SING_GOLD) return `${SING_GOLD} altın gerek`;
    return "";
  }

  singSongs(): void {
    if (this.singReason()) return;
    const s = this.s;
    const city = CITIES[this.nearCity()].id;
    s.res.gold -= SING_GOLD;
    s.ozanDay = this.dayOf().day;
    const r = singRenown(s.songs.length);
    s.renown += r;
    this.addRep(factionOf(city), 5, "ozan destanını okudu");
    this.addKut(1);
    this.bondEvent("sing");
    const song = s.songs[Math.floor(Math.random() * Math.min(5, s.songs.length))];
    audio.play("quest");
    this.hud.story(`${CITY_NAME[city]} hanında ozan`, "icons/scroll", `Ozan kopuzunu akortladı, han sustu:<br><br><i class="poem">${song.lines.join("<br>")}</i><br><br><b class="cheap">+${r} şöhret</b> · ${FACTIONS[factionOf(city)].short} itibarı +5`, "Kopuzun dilli olsun");
    saveGame(s);
  }

  setTamga(part: keyof Tamga, v: string): void {
    const s = this.s;
    s.tamga = { ...TAMGA_DEFAULT, ...s.tamga, [part]: v };
    saveGame(s);
  }

  dir(): DirState {
    const s = this.s;
    s.dir = { ...DIR_DEFAULT, ...s.dir, log: s.dir?.log ?? [] };
    return s.dir;
  }

  setPersona(p: PersonaId): void {
    const d = this.dir();
    d.p = p;
    d.t = Math.min(d.t, PERSONAS[p].limit - 1);
    this.hud.toast(`Hikâyeni artık ${PERSONAS[p].name} anlatıyor.`, "info");
    saveGame(this.s);
  }

  dirCtx(): DirCtx {
    const s = this.s;
    return {
      day: this.dayOf().day,
      lv: s.hero.lv,
      gold: s.res.gold,
      hpFrac: s.hero.hp / this.maxHp(),
      armyFill: armySize(s.hero.army) / Math.max(1, this.heroCap()),
      beylik: s.beylik,
      owned: Object.keys(s.owned).length,
      warRivals: s.rivals.filter((r) => r.status === "war").length,
    };
  }

  private directorDaily(): void {
    const s = this.s;
    if (!s.free || this.battleLock) return;
    const d = this.dir();
    const c = this.dirCtx();
    const p = PERSONAS[d.p];
    d.t += tensionGain(d, c);
    if (d.t >= p.limit) {
      d.t = Math.max(0, d.t - p.limit - 0.5);
      this.dirThreat(pickThreat(c));
    } else if (struggling(d, c) && Math.random() < p.mercy) {
      d.losses = 0;
      this.dirRelief(pickRelief(c));
    }
  }

  private dirLog(t: string, bad: boolean): void {
    const d = this.dir();
    d.log.unshift({ d: this.dayOf().day, t, bad });
    if (d.log.length > 8) d.log.length = 8;
  }

  dirThreat(k: Threat): void {
    const s = this.s;
    const h = s.hero;
    const p = PERSONAS[this.dir().p];
    const tier = Math.min(5, Math.max(1, Math.round(h.lv / 3)));
    if (k === "pusu") {
      const a = Math.random() * Math.PI * 2;
      for (let i = 0; i < 8; i++) {
        const x = h.x + Math.cos(a + i) * 380;
        const y = h.y + Math.sin(a + i) * 380;
        if (this.cellCost(x, y) >= 3) continue;
        const army0 = banditArmy(tier);
        for (const u of UNIT_KEYS) army0[u] = Math.max(1, Math.round(army0[u] * p.power));
        const camp = s.camps.indexOf(this.nearest(s.camps) ?? s.camps[0]);
        s.bandits.push({ id: s.nextId++, camp, tier, x, y, army: army0, tx: x, ty: y, wait: 4, chase: true, amb: true });
        this.hud.toast(`${p.name}: Ufukta toz bulutu… bir harami çetesi izini sürüyor!`, "bad");
        this.dirLog("Harami pususu gönderdi", true);
        return;
      }
    }
    if (k === "firtina") {
      const a = Math.random() * Math.PI * 2;
      const x = Math.max(200, Math.min(W - 200, h.x + Math.cos(a) * 500));
      const y = Math.max(200, Math.min(H - 200, h.y + Math.sin(a) * 500));
      const sp = 14;
      s.storms.push({ id: s.nextId++, kind: this.season() === "kis" ? "yagmur" : "kum", x, y, r: 300 * p.power, vx: -Math.cos(a) * sp, vy: -Math.sin(a) * sp, age: 0, life: 150 });
      this.hud.toast(`${p.name}: Gök karardı, üzerine bir fırtına yürüyor!`, "bad");
      this.dirLog("Fırtına gönderdi", true);
      return;
    }
    if (k === "baskin") {
      s.raidAt = this.now;
      this.dirLog("Köylere harami baskını saldı", true);
      return;
    }
    if (k === "akin") {
      const r = s.rivals.find((x) => x.status === "war");
      if (r) {
        this.rivalRaid(r);
        this.dirLog(`${rivalName(r)} akına kaldırdı`, true);
        return;
      }
    }
    if (k === "isyan") {
      const list = this.ownedList();
      if (list.length) {
        const city = list[Math.floor(Math.random() * list.length)];
        s.owned[city].loy = Math.max(0, s.owned[city].loy - Math.round(15 * p.power));
        this.hud.toast(`${p.name}: ${CITY_NAME[city]} çarşısında kışkırtıcılar halkı galeyana getiriyor! (bağlılık düştü)`, "bad");
        this.dirLog(`${CITY_NAME[city]} halkını kışkırttı`, true);
        return;
      }
    }
    this.dirThreat("pusu");
  }

  dirRelief(k: Relief): void {
    const s = this.s;
    const h = s.hero;
    const p = PERSONAS[this.dir().p];
    if (k === "sifa") {
      h.hp = this.maxHp();
      this.hud.toast(`${p.name}: Yolda bir şifacı kadın yaralarını sardı. Canın tazelendi.`, "good");
      this.dirLog("Şifacı gönderdi", false);
    } else if (k === "gonullu") {
      const room = Math.max(0, this.heroCap() - armySize(h.army));
      const n = Math.min(room, 3 + Math.round(h.lv / 2));
      h.army.spear += Math.ceil(n / 2);
      h.army.archer += Math.floor(n / 2);
      this.hud.toast(`${p.name}: Adını duyan ${n} yiğit sancağının altına koştu.`, "good");
      this.dirLog(`${n} gönüllü gönderdi`, false);
    } else if (k === "olay" && !this.hud.modal()) {
      const ids = ["dervis", "kuyu", "senlik", "elci"];
      this.roadEvent(ids[Math.floor(Math.random() * ids.length)]);
      this.dirLog("Yoluna bir karşılaşma çıkardı", false);
    } else {
      const gold = 50 + h.lv * 15;
      this.gain({ gold, food: 40 });
      this.hud.toast(`${p.name}: Geçen bir kervanbaşı sana hediye bıraktı: +${gold} altın, +40 yiyecek.`, "good");
      this.dirLog("Kervan hediyesi gönderdi", false);
    }
  }

  private roadTick(): void {
    const s = this.s;
    const h = s.hero;
    const d = Math.hypot(h.x - this.roadAt.x, h.y - this.roadAt.y);
    this.roadAt = { x: h.x, y: h.y };
    if (!s.free || !h.path || d > 200 || this.hud.modal() || this.nearCity(260) >= 0) return;
    this.roadD += d;
    if (this.roadD < ROAD_STEP) return;
    this.roadD = 0;
    s.road ??= { day: -1, n: 0, seen: [] };
    const day = this.dayOf().day;
    if (s.road.day !== day) s.road = { ...s.road, day, n: 0 };
    if (s.road.n >= ROAD_PER_DAY || Math.random() > ROAD_CHANCE) return;
    this.roadEvent();
  }

  roadCtx(): RoadCtx {
    const s = this.s;
    return { season: this.season(), night: this.isNight(), cargo: this.cargoUsed(), army: armySize(s.hero.army), lv: s.hero.lv };
  }

  roadEvent(id?: string): boolean {
    const s = this.s;
    s.road ??= { day: -1, n: 0, seen: [] };
    const ctx = this.roadCtx();
    const ok = ROAD_EVENTS.filter((e) => !e.when || e.when(ctx));
    const fresh = ok.filter((e) => !s.road.seen.includes(e.id));
    const ev = id ? ROAD_EVENTS.find((e) => e.id === id) : (fresh.length ? fresh : ok)[Math.floor(Math.random() * (fresh.length || ok.length))];
    if (!ev) return false;
    s.road.n++;
    s.road.seen = [ev.id, ...s.road.seen.filter((x) => x !== ev.id)].slice(0, 6);
    const h = s.hero;
    const saved = { path: h.path, pathI: h.pathI, target: this.target };
    h.path = null;
    this.target = null;
    const resume = (): void => {
      if (h.path || !saved.path || this.battleLock) return;
      h.path = saved.path;
      h.pathI = saved.pathI;
      this.target = saved.target;
    };
    const opts = ev.opts(ctx);
    this.hud.choice(
      ev.title,
      ev.icon,
      ev.text,
      opts.map((o) => {
        const poor = (o.cost?.gold ?? 0) > s.res.gold || (o.cost?.food ?? 0) > s.res.food;
        const cost = [o.cost?.gold ? `${o.cost.gold} altın` : "", o.cost?.food ? `${o.cost.food} yiyecek` : ""].filter(Boolean).join(", ");
        const odds = o.check ? ` · ${STAT_INFO[o.check.stat].short} %${Math.round(checkChance(this.stat(o.check.stat), o.check.dc) * 100)}` : o.fight ? ` · savaş %${Math.round(this.odds(o.fight.army, o.fight.bonus) * 100)}` : "";
        return { label: `${o.label}${cost ? ` (${cost})` : ""}${odds}`, cls: poor ? "off" : o.fight ? "bad" : "", fn: () => this.roadPick(ev, o, resume) };
      }),
    );
    return true;
  }

  private roadPick(ev: RoadEvent, o: RoadOpt, resume: () => void): void {
    const s = this.s;
    if (o.cost && !this.pay({ gold: o.cost.gold ?? 0, food: o.cost.food ?? 0 })) return;
    if (o.fight) {
      const f = o.fight;
      this.battle(f.foe, f.army, f.bonus, (win) => {
        const r = win ? o.ok : o.fail ?? { text: "" };
        return `${r.text}${this.roadFx(r)}`;
      }, null, f.foe);
      return;
    }
    const pass = !o.check || Math.random() < checkChance(this.stat(o.check.stat), o.check.dc);
    const r = pass ? o.ok : o.fail ?? o.ok;
    const fx = this.roadFx(r);
    const roll = o.check ? `<small class="${pass ? "cheap" : "dear"}">${STAT_INFO[o.check.stat].name} sınaması: ${pass ? "başarılı" : "başarısız"}</small><br>` : "";
    this.hud.story(ev.title, ev.icon, `${roll}${r.text}${fx}`, "Yola devam");
    resume();
    saveGame(s);
  }

  private roadFx(f: RoadFx): string {
    const s = this.s;
    const h = s.hero;
    const out: string[] = [];
    if (f.gold) {
      const g = f.gold > 0 ? f.gold : -Math.min(s.res.gold, -f.gold);
      s.res.gold += g;
      out.push(`${g > 0 ? "+" : ""}${g} altın`);
    }
    if (f.food) {
      const g = f.food > 0 ? f.food : -Math.min(s.res.food, -f.food);
      if (g > 0) this.gain({ food: g });
      else s.res.food += g;
      out.push(`${g > 0 ? "+" : ""}${g} yiyecek`);
    }
    if (f.hp) {
      const mx = this.maxHp();
      const hp0 = h.hp;
      h.hp = Math.max(1, Math.min(mx, h.hp + f.hp * mx));
      out.push(`can ${h.hp >= hp0 ? "+" : ""}${Math.round(h.hp - hp0)}`);
    }
    if (f.cargo) {
      let lost = 0;
      for (const g of GOOD_KEYS) {
        const n = h.cargo[g] ?? 0;
        if (!n) continue;
        const k = Math.ceil(n * f.cargo);
        h.paid[g] = Math.round(((h.paid[g] ?? 0) * (n - k)) / n);
        h.cargo[g] = n - k;
        lost += k;
      }
      if (lost) out.push(`−${lost} mal`);
    }
    if (f.good) {
      const room = Math.max(0, this.carryCap() - this.cargoUsed());
      const g = GOOD_KEYS[Math.floor(Math.random() * 6)];
      const k = Math.min(room, f.good + Math.floor(Math.random() * 2));
      if (k) {
        h.cargo[g] = (h.cargo[g] ?? 0) + k;
        out.push(`+${k} ${GOODS[g].name}`);
      }
    }
    if (f.units) {
      let room = Math.max(0, this.heroCap() - armySize(h.army));
      for (const u of UNIT_KEYS) {
        const k = Math.min(room, f.units[u] ?? 0);
        if (!k) continue;
        h.army[u] += k;
        room -= k;
        out.push(`+${k} ${UNITS[u].name}`);
      }
    }
    if (f.renown) {
      s.renown += f.renown;
      out.push(`+${f.renown} şöhret`);
    }
    if (f.kut && s.beylik) {
      this.addKut(f.kut);
      out.push(`kut ${f.kut > 0 ? "+" : ""}${f.kut}`);
    }
    if (f.xp) {
      this.addXp(f.xp);
      out.push(`+${f.xp} tecrübe`);
    }
    if (f.wanted) this.addWanted(f.wanted);
    return out.length ? `<br><br><b>${out.join(" · ")}</b>` : "";
  }

  private toreTick(day: number): void {
    const s = this.s;
    s.tore ??= { next: 0, seen: [] };
    if (!s.beylik || this.battleLock) return;
    if (!s.tore.next) s.tore.next = day + 2;
    if (day < s.tore.next) return;
    s.tore.next = day + 3 + Math.floor(Math.random() * 3);
    let pool = TORE_CASES.filter((c) => !s.tore.seen.includes(c.id));
    if (!pool.length) {
      s.tore.seen = [];
      pool = TORE_CASES;
    }
    this.toreOpen(pool[Math.floor(Math.random() * pool.length)]);
  }

  toreOpen(c: ToreCase): void {
    const s = this.s;
    s.tore.seen.push(c.id);
    const fx = (o: ToreCase["opts"][number]): string => {
      const f = o.fx;
      return [f.gold ? `${f.gold > 0 ? "+" : ""}${f.gold} altın` : "", f.food ? `${f.food > 0 ? "+" : ""}${f.food} yiyecek` : ""].filter(Boolean).join(", ");
    };
    this.hud.choice(
      `Töre Davası · ${c.title}`,
      c.icon,
      `${c.text}<br><br><small class="dim">Kut: <b>${Math.round(s.kut)}</b> · ${kutTier(s.kut).name}</small>`,
      c.opts.map((o) => {
        const poor = (o.fx.gold ?? 0) < 0 && s.res.gold < -(o.fx.gold ?? 0) || (o.fx.food ?? 0) < 0 && s.res.food < -(o.fx.food ?? 0);
        const cost = fx(o);
        return { label: `${o.label}${cost && !o.label.includes("(") ? ` (${cost})` : ""}`, cls: poor ? "off" : (o.fx.kut ?? 0) > 0 ? "go" : "", fn: () => this.toreJudge(c, o) };
      }),
    );
  }

  private toreJudge(c: ToreCase, o: ToreCase["opts"][number]): void {
    const s = this.s;
    const f = o.fx;
    if (f.gold && f.gold < 0 && !this.pay({ gold: -f.gold })) return;
    if (f.food && f.food < 0 && !this.pay({ food: -f.food })) return;
    this.gain({ gold: Math.max(0, f.gold ?? 0), food: Math.max(0, f.food ?? 0) });
    if (f.renown) s.renown += f.renown;
    if (f.loy) for (const ow of Object.values(s.owned)) ow.loy = Math.max(0, Math.min(100, ow.loy + f.loy));
    s.c.tore = (s.c.tore ?? 0) + 1;
    this.addKut(f.kut ?? 0);
    const k = f.kut ?? 0;
    this.bondEvent(k >= 0 ? "toreFair" : "toreHarsh");
    this.chron(`Töre davası (${c.title}): ${o.out}`);
    if (k >= 8) this.sing("tore", { foe: c.title });
    this.hud.story(c.title, c.icon, `${o.out}<br><br><b class="${k >= 0 ? "cheap" : "dear"}">Kut ${k >= 0 ? "+" : ""}${k}</b> → ${Math.round(s.kut)} · ${kutTier(s.kut).name}${f.loy ? `<br>Şehir bağlılığı ${f.loy > 0 ? "+" : ""}${f.loy}` : ""}${f.renown ? `<br>Şöhret +${f.renown}` : ""}`, "Hüküm verildi");
    saveGame(s);
  }

  allyBonus(): number {
    const s = this.s;
    const base = s.rivals.filter((r) => r.status === "ally").length * 0.07 + s.rivals.filter((r) => r.status === "vassal").length * 0.04;
    const ordu = this.decree("sefer");
    return Math.min(ordu ? 0.35 : 0.2, base * (ordu ? 2 : 1)) + (s.kagan ? 0.05 : 0) + (base > 0 && hasLegacy("kagan") ? 0.05 : 0) + (s.family?.spouse ? 0.03 : 0);
  }

  decree(id: string): boolean {
    return this.s.kurultay.decrees.includes(id);
  }

  kurultayReason(): string {
    const s = this.s;
    if (!s.beylik) return "Kurultay için önce beyliğini kur.";
    if (s.rivals.filter((r) => r.status === "ally" || r.status === "vassal").length < 2) return "Kurultay için en az 2 müttefik ya da tabi bey gerek.";
    const day = this.dayOf().day;
    if (day < s.kurultay.next) return `Beyler ${s.kurultay.next}. gün yeniden toplanır.`;
    const c = this.cityPos(CAPITAL.id);
    if (Math.hypot(s.hero.x - c.x, s.hero.y - c.y) > 200) return "Kurultay Semerkant'ta toplanır.";
    return "";
  }

  kaganReason(): string {
    const s = this.s;
    if (s.kagan) return "Zaten Kağansın.";
    if (s.kurultay.held < 2) return "Kağanlık için önce iki kurultay topla.";
    if (s.renown < KAGAN_RENOWN) return `Kağanlık için ${KAGAN_RENOWN} şöhret gerek.`;
    const live = s.rivals.filter((r) => r.status !== "dead");
    const sup = live.filter((r) => r.status === "ally" || r.status === "vassal").length;
    if (sup < Math.max(3, Math.ceil(live.length / 2))) return "Beylerin yarısından fazlası (en az 3) müttefikin ya da tabin olmalı.";
    return "";
  }

  holdKurultay(): void {
    if (this.kurultayReason()) return;
    const s = this.s;
    const pool = DECREES.filter((d) => !s.kurultay.decrees.includes(d.id)).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts: { label: string; cls: string; fn: () => void }[] = pool.map((d) => ({ label: `${d.name}: ${d.desc}`, cls: "", fn: () => this.kurultayBribe(d.id) }));
    const kr = this.kaganReason();
    opts.push({ label: kr ? `Kağanlık (${kr})` : "Kağanlığını oya sun!", cls: kr ? "off" : "go", fn: () => (kr ? this.hud.toast(kr, "bad") : this.kurultayBribe("kagan")) });
    opts.push({ label: "Kurultayı dağıt", cls: "", fn: () => {} });
    const att = s.rivals.filter((r) => r.status !== "dead" && r.status !== "war");
    this.hud.choice(
      "Kurultay toplandı",
      "icons/lord_bey",
      `Semerkant'ın otağında ${att.map((r) => rivalName(r)).join(", ")} kımız kâselerini kaldırdı. Tuğlar yan yana dikildi; söz senin.<br><br>Oya sunacağın fermanı seç. Geçen fermanlar sonraki iki kurultaya dek yürürlükte kalır (en fazla ${KURULTAY_MAX}).`,
      opts,
    );
  }

  private kurultayBribe(id: string): void {
    const s = this.s;
    const name = id === "kagan" ? "Kağanlık" : decreeOf(id)!.name;
    this.hud.choice(name, "icons/lord_bey", "Beylerin gönlünü oylamadan önce armağanlarla yumuşatabilirsin. Her bey evet demeye daha yatkın olur.", [
      { label: `Armağan dağıt ve oya sun · ${BRIBE_GOLD} altın`, cls: s.res.gold >= BRIBE_GOLD ? "go" : "off", fn: () => (this.pay({ gold: BRIBE_GOLD }) ? this.kurultayVote(id, true) : this.kurultayVote(id, false)) },
      { label: "Doğrudan oya sun", cls: "", fn: () => this.kurultayVote(id, false) },
    ]);
  }

  voteChance(r: Rival, id: string, bribe: boolean): number {
    let p = r.status === "vassal" ? 0.75 : r.status === "ally" ? 0.55 + r.rel / 200 : 0.2 + r.rel / 250;
    const d = decreeOf(id);
    if (d?.likes.includes(r.trait)) p += 0.2;
    if (d?.hates.includes(r.trait)) p -= 0.3;
    if (id === "kagan") p -= r.trait === "hirsli" ? 0.3 : r.trait === "onurlu" ? 0.05 : 0.12;
    if (bribe) p += r.trait === "kurnaz" ? 0.25 : 0.15;
    p += kutVote(this.s.kut ?? 50);
    return Math.max(0.05, Math.min(0.95, p));
  }

  private kurultayVote(id: string, bribe: boolean): void {
    const s = this.s;
    const att = s.rivals.filter((r) => r.status !== "dead" && r.status !== "war");
    const votes = att.map((r) => ({ r, yes: Math.random() < this.voteChance(r, id, bribe) }));
    const yes = votes.filter((v) => v.yes).length + 2;
    const no = votes.length - (yes - 2);
    const pass = yes > no;
    for (const v of votes) v.r.rel = Math.max(-100, Math.min(100, v.r.rel + (v.yes ? 3 : id === "kagan" ? -8 : -4)));
    s.kurultay.next = this.dayOf().day + KURULTAY_EVERY;
    s.kurultay.held++;
    const list = votes.map((v) => `${rivalName(v.r)}: <b class="${v.yes ? "cheap" : "neg"}">${v.yes ? "Evet" : "Hayır"}</b>`).join("<br>");
    const name = id === "kagan" ? "Kağanlık" : decreeOf(id)!.name;
    if (pass) {
      audio.play("win");
      if (id === "kagan") {
        s.kagan = true;
        s.renown += 200;
        this.chron(`Kurultay ${gen(s.hero.name)} adını göğe haykırdı: Bozkırın Kağanı!`);
        this.sing("kagan");
        this.addKut(15, "kağanlık");
        this.hud.story("Kağan seçildin!", "icons/crown", `Beyler keçeye oturtup seni üç kez göğe kaldırdı. Artık <b>${s.hero.name} Kağan</b>sın.<br><br>${list}<br><br>Tabi beylerin haracı %50 artar, ordunun gücü +%5. Adın destanlara yazıldı. +200 şöhret`, "Tengri yar olsun");
      } else {
        s.kurultay.decrees.push(id);
        while (s.kurultay.decrees.length > KURULTAY_MAX) s.kurultay.decrees.shift();
        if (id === "baris") for (const r of s.rivals) if (r.status === "war") {
          r.status = "peace";
          r.rel = Math.max(r.rel, -20);
        }
        this.chron(`Kurultay "${name}" fermanını kabul etti.`);
        this.hud.story(`Ferman kabul edildi: ${name}`, "icons/scroll", `${decreeOf(id)!.desc}<br><br>${list}<br><b>Sen: Evet (2 oy)</b>`, "Ferman yürürlükte");
      }
    } else {
      audio.play("lose");
      this.hud.story(`${name} reddedildi`, "icons/lord_bey", `Beyler başlarını iki yana salladı.<br><br>${list}<br><b>Sen: Evet (2 oy)</b><br><br>Bir dahaki kurultaya kadar dostluklarını artır.`, "Bekleyelim");
    }
    saveGame(s);
  }

  heroCap(): number {
    if (!this.s.free) return 0;
    return 2 + this.stat("lid") * 3 + this.s.hero.lv + (this.s.beylik ? this.bld("saray") * 5 : 0) + 3 * this.tal("komutan");
  }

  carryCap(): number {
    return 10 + this.stat("guc") * 3 + (this.eq("at")?.carry ?? 0) + armySize(this.s.hero.army) * 2 + this.compMods().carry + 15 * this.tal("deve") + (this.gearMods().carry ?? 0);
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
    if (k === "food") r = r * this.sea().food - this.upkeepPerMin();
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
      this.roadTick();
      this.bandits(dt, now);
      this.caravanTick(dt);
      this.wantedTick(dt);
      this.nemTick();
      this.rivalTick(dt);
      this.birdTick(dt);
      this.studTick();
      const night = this.isNight();
      if (night !== this.wasNight) {
        this.wasNight = night;
        if (s.free) this.hud.toast(night ? `Gece çöktü. Haramiler cesurlaştı; Kurgan Taşları güçlendi ama daha çok Ruh Taşı verir.${this.nightEyes() ? " Gözlerin karanlığa alışkın." : ""}` : "Şafak söktü. Yollar yeniden canlanıyor.", "info");
      }
      this.stormTick(dt);
      this.seasonTick();
      this.marches(dt, now);
    }
    this.fogT += dt;
    if (this.fogT > 0.25) {
      this.fogT = 0;
      const hs = this.heroStorm();
      this.reveal(s.hero.x, s.hero.y, 11 + this.compMods().sight + 2 * this.tal("kartal") + (s.bird ? birdSight(s.bird) : 0) - (this.isNight() && !this.nightEyes() ? 2 : 0) - (hs ? (hs.kind === "kum" ? 6 : 3) : 0));
      for (const m of s.marches) this.reveal(m.x, m.y, 5);
    }
    this.quests();
    this.titleTick(dt);
    this.achTick(dt);
    this.cqTick(dt);
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
    if (s.res.food <= 0 && this.upkeepPerMin() > 0 && armySize(s.garrison) > 0) {
      this.starveT += dt;
      if (this.starveT > 20) {
        this.starveT = 0;
        const u = UNIT_KEYS.filter((k) => s.garrison[k] > 0).sort((a, b) => s.garrison[b] - s.garrison[a])[0];
        if (u) {
          const n = Math.max(1, Math.round(s.garrison[u] * 0.04));
          s.garrison[u] -= n;
          this.hud?.toast(`Ambarlar boş! Aç kalan ${n} ${UNITS[u].name} kışladan kaçtı. Çiftlik kur ya da yiyecek getir.`, "bad");
        }
      }
    } else this.starveT = 0;
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
    this.ownTick(el);
    for (const k of s.kurgans)
      if (!k.alive && now >= k.respawnAt) {
        k.alive = true;
        k.delved = false;
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
    if (ci >= 0 && (this.s.serais[CITIES[ci].id] || this.s.owned[CITIES[ci].id])) return 0;
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
    this.chron(`Semerkant'ta demir halka çözüldü; ${s.hero.name} köle doğdu, hür bir ${c.name} olarak yola düştü.`);
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
    return GOODS[g].base * goodMult(city, g) * wave * (this.sea().goods[g] ?? 1) * this.eventMult(city, g) * (1 + 0.6 * (this.market(city)[g] ?? 0));
  }

  buyFactor(): number {
    return Math.max(1.02, 1.12 - this.skill("ticaret") * 0.006 - this.stat("kar") * 0.004 - this.cls().mods.trade - this.compMods().trade) - 0.01 * this.tal("pazarlik") - (this.decree("pazar") ? 0.03 : 0);
  }

  sellFactor(): number {
    return Math.min(0.98, 0.88 + this.skill("ticaret") * 0.006 + this.stat("kar") * 0.004 + this.cls().mods.trade + this.compMods().trade) + 0.01 * this.tal("pazarlik") + 0.05 * this.tal("ipekhan") + (this.decree("pazar") ? 0.03 : 0);
  }

  buyPrice(city: string, g: Good): number {
    return Math.max(1, Math.round(this.price(city, g) * this.buyFactor() * (1 - 0.02 * (this.s.serais[city]?.lv ?? 0) - this.repTrade(city))));
  }

  sellPrice(city: string, g: Good): number {
    return Math.max(1, Math.round(this.price(city, g) * this.sellFactor() * (1 + 0.02 * (this.s.serais[city]?.lv ?? 0) + this.repTrade(city))));
  }

  // ---------- factions ----------

  rep(f: FactionId): number {
    return this.s.rep[f] ?? 0;
  }

  rank(f: FactionId): number {
    return repRank(this.rep(f));
  }

  cityRank(city: string): number {
    if (this.s.owned[city]) return 4;
    return this.rank(factionOf(city));
  }

  hostile(city: string): boolean {
    if (this.s.owned[city]) return false;
    return this.rep(factionOf(city)) <= HOSTILE;
  }

  repTrade(city: string): number {
    if (this.s.owned[city]) return 0.1;
    if (this.hostile(city)) return -0.08;
    return [0, 0.03, 0.03, 0.06, 0.06][this.cityRank(city)];
  }

  heroRankBonus(): number {
    return FACTION_KEYS.filter((f) => this.rank(f) >= 4).length * 0.05;
  }

  addRep(f: FactionId, n: number, why = ""): void {
    const s = this.s;
    if (!s.free || n <= 0) return;
    const r0 = this.rank(f);
    s.rep[f] = Math.min(2000, this.rep(f) + n);
    const rv = FACTIONS[f].rival;
    const wasHostile = this.rep(rv) <= HOSTILE;
    s.rep[rv] = Math.max(-500, this.rep(rv) - Math.ceil(n * 0.25));
    if (!wasHostile && this.rep(rv) <= HOSTILE) this.hud.toast(`${FACTIONS[rv].name} seni artık düşman sayıyor! Pazarları pahalı, görev panoları kapalı.`, "bad");
    const r1 = this.rank(f);
    if (r1 <= r0) return;
    const fac = FACTIONS[f];
    audio.play("quest");
    this.hud.toast(`${fac.name} gözünde artık ${REP_RANKS[r1].you}${why ? ` (${why})` : ""}`, "good");
    if (r1 >= 3) this.chron(`${fac.ruler} ${s.hero.name} için "${REP_RANKS[r1].name}" dedi; ${fac.name} kapıları ardına kadar açıldı.`);
    if (r1 >= 3 && !s.repGift.includes(f)) {
      s.repGift.push(f);
      const it = setPiece(s.nextId++, this.cls(), fac.gift, "tilsim", this.legendTier());
      this.hud.story(
        `${fac.rulerGen} armağanı`,
        "icons/seal",
        `${fac.name} sarayına çağrıldın. ${fac.ruler} tahtından kalkıp seni kucakladı: "Adını yollarda, hanlarda, savaş meydanlarında duydum. Bundan böyle ${fac.name} senin de yurdundur."<br><br>Elçiler önüne kadife bir kese koydu.<br><br><b>${RANK_PERKS[3]}</b>`,
        "Armağanı al",
      );
      this.gainLegend(it);
    } else if (r1 >= 4) {
      this.hud.story(`${fac.name} Kahramanı`, "icons/trophy", `${fac.name} şehirlerinde artık adın türkülerde geçiyor. Çocuklar oyunlarında seni oynuyor, beyler sofrasında yer açıyor.<br><br><b>${RANK_PERKS[4]}</b>`, "Devam");
    }
  }

  repNear(x: number, y: number, n: number, why: string): void {
    const c = CITIES.map((c) => ({ c, d: Math.hypot(c.x - x, c.y - y) })).sort((a, b) => a.d - b.d)[0];
    this.addRep(factionOf(c.c.id), n, why);
  }

  eliteCost(city: string, u: Unit): number {
    const f = FACTIONS[factionOf(city)];
    return Math.round(this.hireCost(u) * (f.unit === u && this.cityRank(city) >= 2 ? 0.7 : 1));
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
    if (profit >= 120) this.addRep(factionOf(city), Math.floor(profit / 120), "ticaret");
    if (profit >= 150) this.bondEvent("trade");
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

  sideReason(city = ""): string | null {
    if (!this.s.free) return "Önce hürriyetini kazan";
    if (city && this.hostile(city)) return `${FACTIONS[factionOf(city)].name} sana iş vermiyor`;
    if (this.s.wanted >= 3) return "Aranan birine kimse iş vermez";
    if (this.s.sideQ.length >= 3) return "En fazla 3 görev alabilirsin";
    return null;
  }

  takeSide(city: string, id: number): void {
    if (this.sideReason(city)) return;
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
      s.res.gold += Math.round(q.gold * (this.cityRank(city) >= 2 ? 1.15 : 1));
      this.addRep(factionOf(city), 12 + q.renown * 3, "şehir görevi");
      s.renown += q.renown;
      s.c.sides++;
      const up = this.addXp(q.xp);
      const it = q.item ? (this.legendDrop(0.06) ?? this.drop(Math.min(5, 1 + Math.floor(s.hero.lv / 4)), 1)) : null;
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

  // ---------- legendary gear ----------

  legendTier(): number {
    return Math.max(2, Math.min(5, 1 + Math.floor(this.s.hero.lv / 4)));
  }

  legendDrop(chance: number): Item | null {
    const s = this.s;
    if (!s.free || Math.random() > chance * this.stealMult()) return null;
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    let it: Item;
    if (Math.random() < 0.35) {
      const fresh = UNIQUES.filter((u) => !s.codex.includes(`uq:${u.id}`));
      it = uniqueItem(s.nextId++, this.cls(), pick(fresh.length ? fresh : UNIQUES), this.legendTier());
    } else {
      it = setPiece(s.nextId++, this.cls(), pick(SET_KEYS), pick(SET_SLOTS), this.legendTier());
    }
    this.gainLegend(it);
    return it;
  }

  private gainLegend(it: Item): void {
    const s = this.s;
    s.hero.bag.push(it);
    const key = it.uq ? `uq:${it.uq}` : `set:${it.set}:${it.slot}`;
    const first = !s.codex.includes(key);
    if (first) s.codex.push(key);
    if (first && it.uq) this.chron(`Yüzyıllardır kayıp olan <b class="r4">${it.name}</b> ${gen(s.hero.name)} eline geçti.`);
    audio.play("level");
    const lore = it.uq ? UNIQUES.find((u) => u.id === it.uq)!.lore : SETS[it.set!].lore;
    const tag = it.set ? `${SETS[it.set].name} parçası` : "Destan eşyası";
    if (first) this.hud.story(`${tag}: ${it.name}`, it.icon, `<i>${lore}</i><br><br><b class="r4">${it.name}</b><br>Destan Koleksiyonu: <b>${s.codex.length}/${this.codexMax()}</b>`, "Kuşan beni");
    else this.hud.toast(`${tag}: ${it.name}`, "good");
  }

  codexMax(): number {
    return UNIQUES.length + SET_KEYS.length * SET_SLOTS.length;
  }

  forgeCost(): Cost {
    return this.craftCost({ gold: SET_FORGE.gold, ruh: SET_FORGE.ruh, parsomen: SET_FORGE.parsomen, yesim: SET_FORGE.yesim });
  }

  forgeReason(): string | null {
    return this.craftReason({ gold: SET_FORGE.gold, ruh: SET_FORGE.ruh, parsomen: SET_FORGE.parsomen, yesim: SET_FORGE.yesim }, SET_FORGE.lv);
  }

  forgeSet(set: SetId, slot: Slot): void {
    if (this.forgeReason()) return;
    this.payMats(this.forgeCost());
    this.start("Efsane Ocağı'nda dövüyorsun", 8, () => {
      const it = setPiece(this.s.nextId++, this.cls(), set, slot, this.legendTier());
      this.s.c.crafted++;
      this.craftXp(60);
      this.gainLegend(it);
    });
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
    if (changed) {
      this.view.fogDirty = true;
      this.fogRev++;
    }
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
      case "gate":
        return s.act2.gate;
      case "peak":
        return s.act3.peak;
      case "otag":
        return s.otag;
      case "boy":
        return s.boy?.at ?? null;
      case "bandit":
        return s.bandits.find((b) => b.id === t.i) ?? null;
      case "caravan":
        return s.caravans.find((b) => b.id === t.i) ?? null;
      case "rival":
        return s.rivals[t.i] ?? null;
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
    if (this.birdAim) return this.sendBird(x, y);
    const hit = this.pick(x, y);
    if (hit) {
      const p = this.targetPos(hit)!;
      if (hit.kind !== "bandit" && hit.kind !== "caravan" && hit.kind !== "rival" && Math.hypot(p.x - this.s.hero.x, p.y - this.s.hero.y) < 60) {
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
    for (const cv of s.caravans) test({ kind: "caravan", i: cv.id }, cv.x, cv.y, 1.3);
    s.rivals.forEach((r, i) => r.status !== "dead" && test({ kind: "rival", i }, r.x, r.y, 1.5));
    if (Math.hypot(CAPITAL.x - x, CAPITAL.y - y) < r * 2.2) return { kind: "capital" };
    CITIES.forEach((c, i) => i !== CAP_I && test({ kind: "city", i }, c.x, c.y, 2));
    s.villages.forEach((v, i) => test({ kind: "village", i }, v.x, v.y, 1.3));
    s.camps.forEach((c, i) => c.alive && test({ kind: "camp", i }, c.x, c.y, 1.3));
    s.nodes.forEach((n, i) => test({ kind: "node", i }, n.x, n.y));
    s.ruins.forEach((n, i) => !n.looted && test({ kind: "ruin", i }, n.x, n.y));
    s.kurgans.forEach((k, i) => test({ kind: "kurgan", i }, k.x, k.y, 1.3));
    if (s.story.fort && !s.story.done) test({ kind: "fort" }, s.story.fort.x, s.story.fort.y, 2);
    if (s.act2.gate && !s.act2.done) test({ kind: "gate" }, s.act2.gate.x, s.act2.gate.y, 2.2);
    if (s.act3.peak) test({ kind: "peak" }, s.act3.peak.x, s.act3.peak.y, 2.2);
    if (s.otag) test({ kind: "otag" }, s.otag.x, s.otag.y, 1.8);
    if (s.boy?.at) test({ kind: "boy" }, s.boy.at.x, s.boy.at.y, 2);
    return best;
  }

  heroSpeed(): number {
    const n = armySize(this.s.hero.army);
    return HERO_SPEED * (1 + this.stat("cev") * 0.02 + (this.eq("at")?.spd ?? 0) + this.compMods().speed + 0.04 * this.tal("ruzgar") + (this.gearMods().spd ?? 0)) * (1 - Math.min(0.35, n / 300)) * this.stormSlow(this.s.hero.x, this.s.hero.y) * this.sea().speed;
  }

  stormSlow(x: number, y: number): number {
    const st = this.stormAt(x, y);
    return !st ? 1 : st.kind === "kum" ? 0.65 : 0.82;
  }

  private moveHero(dt: number): void {
    const h = this.s.hero;
    const t = this.target;
    if (t?.kind === "bandit" || t?.kind === "caravan" || t?.kind === "rival") {
      this.repath -= dt;
      const b = t.kind === "bandit" ? this.s.bandits.find((x) => x.id === t.i) : t.kind === "rival" ? this.s.rivals[t.i] : this.s.caravans.find((x) => x.id === t.i);
      if (!b || (t.kind === "rival" && (b as Rival).status === "dead")) {
        this.target = null;
        h.path = null;
      } else if (Math.hypot(b.x - h.x, b.y - h.y) < 30) {
        h.path = null;
        this.target = null;
        if (t.kind === "bandit") this.engageBandit(b as Bandit, false);
        else if (t.kind === "rival") this.meetRival(t.i);
        else this.meetCaravan(b as Caravan);
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
      if (tg && tg.kind !== "point" && tg.kind !== "bandit" && tg.kind !== "caravan" && tg.kind !== "rival") this.hud.openPlace(tg);
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
        this.spawnAt.set(i, now + (90000 + Math.random() * 60000) * (this.season() === "kis" ? 1.6 : 1) * (this.decree("yol") ? 1.4 : 1));
        const nb: Bandit = { id: s.nextId++, camp: i, tier: c.tier, x: c.x + (Math.random() - 0.5) * 40, y: c.y + (Math.random() - 0.5) * 40, army: banditArmy(c.tier), tx: c.x, ty: c.y, wait: 1, chase: false };
        const nm = s.nemeses.find((n) => n.alive && n.camp === i && !s.bandits.some((x) => x.nem === n.id));
        if (nm && Math.random() < 0.6) this.nemGang(nb, nm);
        s.bandits.push(nb);
      }
    });
    for (const b of s.bandits) {
      const dh = Math.hypot(h.x - b.x, h.y - b.y);
      if (b.posse) {
        b.chase = s.wanted > 0 && this.nearCity() < 0 && dh < (this.isNight() ? 420 : 900) && this.heroStorm()?.kind !== "kum";
        if (!s.wanted || dh > 1400) b.army = { spear: 0, archer: 0, horse: 0 };
        const d = Math.hypot(h.x - b.x, h.y - b.y);
        if (b.chase && d > 1) {
          const sp = (BANDIT_SPEED * 1.25 * dt) / Math.max(0.6, Math.min(3, this.cellCost(b.x, b.y)));
          const nx = b.x + ((h.x - b.x) / d) * Math.min(sp, d);
          const ny = b.y + ((h.y - b.y) / d) * Math.min(sp, d);
          if (this.cellCost(nx, ny) !== Infinity) {
            b.x = nx;
            b.y = ny;
          }
        }
        if (b.chase && dh < 24 && !this.battleLock) {
          this.engageBandit(b, true);
          return;
        }
        continue;
      }
      const c = s.camps[b.camp];
      const pow = armyPower(b.army);
      const raiding = s.caravans.some((cv) => cv.raid === b.id);
      const nm = b.nem ? s.nemeses.find((n) => n.id === b.nem) : undefined;
      b.chase = b.amb ? !safe && dh < 450 : nm ? !raiding && !safe && dh < (nm.trait === "kurnaz" ? 440 : 320) && Math.hypot(h.x - c.x, h.y - c.y) < 1100 : !raiding && !safe && !this.act && dh < (this.isNight() ? (s.cls === "hirsiz" ? 170 : 300) : 230) && pow > heroPow * (this.isNight() ? 0.6 : 0.75) && Math.hypot(h.x - c.x, h.y - c.y) < 700;
      if (b.amb && dh > 600) b.army = { spear: 0, archer: 0, horse: 0 };
      const flee = !nm && !raiding && dh < 200 && pow < heroPow * 0.45;
      let tx = b.tx;
      let ty = b.ty;
      const prey = !b.chase && !flee && !raiding && !b.amb ? s.caravans.find((cv) => !cv.raid && Math.hypot(cv.x - b.x, cv.y - b.y) < 220 && Math.hypot(cv.x - c.x, cv.y - c.y) < 900) : undefined;
      if (raiding) {
        tx = b.x;
        ty = b.y;
      } else if (prey) {
        tx = prey.x;
        ty = prey.y;
        if (Math.hypot(prey.x - b.x, prey.y - b.y) < 16) {
          prey.raid = b.id;
          prey.raidT = 30;
          if (this.isExplored(prey.x, prey.y)) this.hud.toast(`${FACTIONS[prey.fac as FactionId].name} kervanı saldırı altında! Yetişirsen kurtarabilirsin.`, "bad");
        }
      } else if (b.chase) {
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
        const sp = (BANDIT_SPEED * (b.chase ? 1.15 : 1) * (nm?.trait === "akinci" ? 1.3 : 1) * dt) / Math.max(0.6, Math.min(3, this.cellCost(b.x, b.y)));
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
    if (b.posse) return this.fightPosse(b);
    const nm = b.nem ? this.s.nemeses.find((n) => n.id === b.nem && n.alive) : undefined;
    if (nm) return this.fightNemesis(b, nm);
    const c = this.s.camps[b.camp];
    this.battle(ambush ? `${c.name} pusu kurdu!` : `${c.name} çetesi`, b.army, 0, (win) => {
      this.s.bandits = this.s.bandits.filter((x) => x.id !== b.id);
      const cv = this.s.caravans.find((x) => x.raid === b.id);
      if (cv) cv.raid = 0;
      if (!win) {
        this.newNemesis(b.camp, "loss");
        return "";
      }
      const saved = cv ? this.rescueCaravan(cv) : "";
      const gold = Math.round((armyPower(b.army) * 0.9 + 8 * b.tier) * this.cls().mods.loot * this.stealMult());
      this.gain({ gold });
      this.s.renown += b.tier * 2;
      this.s.c.wins++;
      const it = this.drop(b.tier, 0.3 + b.tier * 0.1);
      const ruh = Math.random() < 0.15 + b.tier * 0.05 + 0.1 * this.tal("ruhavci") ? 1 : 0;
      this.s.mats.ruh += ruh;
      return `+${gold} altın · +${b.tier * 2} şöhret${ruh ? " · +1 Ruh Taşı" : ""}${it ? `<br>Ganimet: <b class="r${it.rar}">${it.name}</b>` : ""}${saved}`;
    });
  }

  // ---------- nemesis ----------

  private nemGang(b: Bandit, n: Nemesis): void {
    b.nem = n.id;
    const a = banditArmy(b.tier);
    const m = (1.3 + n.lv * 0.3) * (n.han ? 1.8 : 1);
    let sp = Math.round(a.spear * m);
    let ar = Math.round(a.archer * m);
    let ho = Math.round(a.horse * m) + n.lv;
    if (n.trait === "okcu") [sp, ar] = [Math.round(sp * 0.4), ar + Math.round(sp * 0.6)];
    if (n.trait === "akinci") [sp, ho] = [Math.round(sp * 0.4), ho + Math.round(sp * 0.6)];
    b.army = { spear: sp, archer: ar, horse: ho };
  }

  nemesisOut(n: Nemesis): Bandit | undefined {
    return this.s.bandits.find((b) => b.nem === n.id);
  }

  private newNemesis(camp: number, why: "loss" | "camp"): void {
    const s = this.s;
    if (!s.free || s.hero.lv < 3 || camp < 0 || s.nemeses.filter((n) => n.alive).length >= NEM_MAX) return;
    if (why === "camp" && Math.random() > 0.35) return;
    const n = makeNemesis(s.nextId++, camp, why, s.nemeses.map((x) => x.name));
    if (why === "loss") n.wins = 1;
    s.nemeses.push(n);
    s.nemDay = Math.max(s.nemDay, this.dayOf().day);
    this.chron(`${nemName(n)} ${why === "loss" ? `${gen(s.hero.name)} kanını yere döktü` : "yanan kampından kaçtı"} ve kan davası yemini etti.`);
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const line = (why === "loss" ? pick(TAUNTS) : pick(REVENGE)).replace("{hero}", s.hero.name);
    const t = NEM_TRAITS[n.trait];
    this.hud.story(
      `Kan Davası: ${nemName(n)}`,
      "icons/j_bandit",
      `${why === "loss" ? "Çetenin başındaki adam, yere düşmüş sana tepeden baktı ve tükürdü:" : "Yanan kampın dumanları arasından bir atlı kaçtı. Uzaktan sesi yankılandı:"}<br><br><i>"${line}"</i><br><br><b class="dear">${nemName(n)}</b> artık senin can düşmanın. <b>${t.name}</b>: ${t.desc}<br>${s.camps[camp].name} çevresinde dolaşıyor. Her geçen gün güçlenecek; seni gördüğü yerde saldıracak.`,
      "Hesaplaşacağız",
    );
  }

  private fightNemesis(b: Bandit, n: Nemesis): void {
    const s = this.s;
    const boss = nemBoss(n, b.tier);
    const t = NEM_TRAITS[n.trait];
    this.battle(`Kan Davası · ${nemName(n)}`, b.army, t.bonus + n.lv * 0.03, (win) => {
      s.bandits = s.bandits.filter((x) => x.id !== b.id);
      const cv = s.caravans.find((x) => x.raid === b.id);
      if (cv) cv.raid = 0;
      const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
      if (!win) {
        n.wins++;
        n.lv = Math.min(15, n.lv + 1);
        let stole = 0;
        if (n.trait === "yagmaci") {
          stole = Math.round(s.res.gold * 0.1);
          s.res.gold -= stole;
        }
        this.hud.story(`${nemName(n)} güldü`, "icons/j_bandit", `<i>"${pick(TAUNTS).replace("{hero}", s.hero.name)}"</i><br><br>${nemName(n)} seni ${n.wins}. kez yendi ve güçlendi (seviye ${n.lv}).${stole ? `<br>Kesenden <b class="dear">${stole} altın</b> aldı.` : ""}`, "İntikam alacağım");
        return "";
      }
      const escape = n.trait === "korkusuz" ? 0 : n.scars >= 2 ? 0.1 : 0.3;
      const gold = Math.round((120 + 90 * n.lv) * b.tier * this.stealMult());
      if (Math.random() < escape) {
        n.scars++;
        n.lv = Math.min(15, n.lv + 1);
        n.epithet = SCAR_EPITHETS[Math.min(SCAR_EPITHETS.length - 1, n.scars - 1)];
        this.gain({ gold: Math.round(gold * 0.4) });
        s.renown += 3 * n.lv;
        return `<b class="dear">${n.name} son anda atına atlayıp kaçtı!</b> Yüzünde senin kılıcının izi kaldı; artık ona <b>${nemName(n)}</b> diyorlar.<br>+${Math.round(gold * 0.4)} altın · +${3 * n.lv} şöhret`;
      }
      n.alive = false;
      s.c.wins++;
      this.gain({ gold });
      const it = rollItem(s.nextId++, Math.min(5, b.tier + 1), this.cls(), 0.2 + 0.03 * n.lv);
      s.hero.bag.push(it);
      const loot = `<b>+${gold} altın</b> · Ganimet: <b class="r${it.rar}">${it.name}</b>`;
      const bros = s.nemeses.filter((x) => x.bro).length;
      const bm = BRO_MODS[n.trait];
      const kill = () => {
        s.c.slain++;
        const wasHan = n.han;
        this.chron(`${n.wins ? `${n.wins} kez galip gelen ` : ""}${nemName(n)}, ${s.hero.name} karşısında son nefesini verdi. Kan davası kapandı.`);
        this.sing("kan", { foe: nemName(n) });
        this.addFoe(nemName(n), "nemesis");
        const renown = 10 + 8 * n.lv + (wasHan ? 60 : 0);
        s.renown += renown;
        this.repNear(b.x, b.y, 15 + 5 * n.lv, `${nemName(n)} öldürüldü`);
        const lg = this.legendDrop(0.08 + 0.04 * n.lv + (wasHan ? 0.3 : 0));
        let fled = "";
        if (wasHan) {
          for (const o of s.nemeses) {
            if (!o.alive) continue;
            o.lv = Math.max(1, o.lv - 2);
            if (Math.random() < 0.3) {
              o.alive = false;
              fled += `<br>${nemName(o)} korkudan bozkırın ötesine kaçtı.`;
            }
          }
          this.chron(`Harami Kurultayı ${nemName(n)} ile birlikte çöktü. Bozkır yolları bir süre nefes aldı.`);
        }
        this.hud.story(`${nemName(n)} öldü`, "icons/trophy", `Son sözleri:<br><br><i>${pick(LAST_WORDS)}</i><br><br>Bozkırda adın bir kez daha duyuldu. <b>+${renown} şöhret</b>${lg ? `<br>Efsane: <b class="r4">${lg.name}</b>` : ""}${wasHan ? `<br><br><b class="cheap">Kurultay dağıldı!</b> Diğer reisler zayıfladı.${fled}` : ""}`, "Kan davası bitti");
      };
      const brother = () => {
        n.bro = true;
        n.han = false;
        const room = Math.max(0, this.heroCap() - armySize(s.hero.army));
        const k = Math.min(room, 2 + n.lv * 2);
        s.hero.army.horse += k;
        this.chron(`${nemName(n)} ile ${s.hero.name} kılıçlarının üstünde kan karıştırdı. Dünün can düşmanı, bugünün kan kardeşi.`);
        audio.play("quest");
        this.hud.story("Kan kardeşliği", "icons/j_bandit", `Bıçağı avucunda gezdirdin; ${n.name} da aynısını yaptı. Kanlarınız toprağa birlikte damladı.<br><br><i>"Bundan sonra senin düşmanın benim düşmanım, ${s.hero.name}."</i><br><br><b class="cheap">${bm.text}</b>${k ? `<br>Çetesinden <b>${k} atlı</b> birliğine katıldı.` : ""}<br><span class="dim">Kurnaz ve yağmacı kardeşler bir gün ihanet edebilir.</span>`, "Kardeşim");
      };
      this.afterBattle = () =>
        this.hud.choice(`${nemName(n)} dizlerinin üstünde`, "icons/j_bandit", `Can düşmanın kılıcını yere attı. Kanlar içinde sana bakıyor; gözlerinde korku yok.<br><br>${loot}<br><br>Onu öldürebilir ya da kılıcını kendi tuğunun altına alabilirsin.`, [
          { label: "Kılıçtan geçir · şöhret ve efsane şansı", cls: "bad", fn: kill },
          { label: bros < BRO_MAX ? `Kan kardeşi yap · ${bm.text}` : `Kan kardeşi yap · en fazla ${BRO_MAX} kardeş`, cls: bros < BRO_MAX ? "go" : "off", fn: bros < BRO_MAX ? brother : kill },
        ]);
      return `<b class="cheap">${nemName(n)} yere serildi!</b>`;
    }, boss, nemName(n));
  }

  private nemTick(): void {
    const s = this.s;
    const day = this.dayOf().day;
    if (day <= s.nemDay) return;
    s.nemDay = day;
    let rumor: Nemesis | null = null;
    for (const n of s.nemeses) {
      if (!n.alive) continue;
      if (!s.camps[n.camp]?.alive) {
        const alive = s.camps.map((c, i) => ({ c, i })).filter((x) => x.c.alive);
        if (alive.length) n.camp = alive[Math.floor(Math.random() * alive.length)].i;
      }
      if (n.lv < 12 && Math.random() < 0.3) {
        n.lv++;
        rumor = n;
      }
    }
    if (rumor) this.hud.toast(`Söylenti: ${nemName(rumor)} yeni adamlar topladı (seviye ${rumor.lv}).`, "bad");
    const alive = s.nemeses.filter((n) => n.alive);
    for (const n of s.nemeses) {
      if (!n.bro || Math.random() >= BRO_BETRAY[n.trait]) continue;
      const camps = s.camps.map((c, i) => ({ c, i })).filter((x) => x.c.alive);
      if (!camps.length || alive.length >= NEM_MAX) continue;
      n.bro = false;
      n.alive = true;
      n.lv = Math.min(15, n.lv + 2);
      n.camp = camps[Math.floor(Math.random() * camps.length)].i;
      this.chron(`Kan kardeşi ${nemName(n)} bir gece ${gen(s.hero.name)} çadırından sessizce çıktı ve eski yoluna döndü. İhanet bozkırın en eski hikâyesidir.`);
      this.hud.story("İhanet!", "icons/j_bandit", `Sabah uyandığında ${nemName(n)} yoktu. Yanında birkaç atın ve kesenin bir kısmı da gitmişti.<br><br>Bir kazığa çakılmış not: <i>"Kurt köpek olmaz, kardeşim."</i><br><br><b class="dear">${nemName(n)} yeniden can düşmanın</b> (seviye ${n.lv}).`, "Hain!");
      s.res.gold = Math.round(s.res.gold * 0.92);
      return;
    }
    if (alive.length >= 3 && s.hero.lv >= 10 && !alive.some((n) => n.han) && Math.random() < 0.25) {
      const han = alive.reduce((a, b) => (b.lv > a.lv ? b : a));
      han.han = true;
      han.lv = Math.min(15, han.lv + 2);
      for (const o of alive) if (o !== han) o.lv = Math.min(15, o.lv + 1);
      for (const b of s.bandits) if (b.nem === han.id) this.nemGang(b, han);
      this.chron(`Harami reisleri bir dağ başında kurultay topladı ve ${nemName(han)} adını haykırdı.`);
      audio.play("story");
      this.hud.story("Harami Kurultayı", "icons/j_bandit", `Bozkırda kara bir haber yayıldı: can düşmanların bir dağ başında toplandı, at kanı içip tek bir tuğ altında birleşti.<br><br>Yeni hanları <b class="dear">${nemName(han)}</b> (seviye ${han.lv}). Çetesi iki kat büyük, diğer reisler de güçlendi.<br><br>Hanı öldürürsen kurultay çöker: diğer reisler zayıflar, bazıları korkudan kaçar.`, "Kurultayı dağıtacağım");
    }
  }

  // ---------- weather ----------

  stormAt(x: number, y: number): Storm | null {
    return this.s.storms.find((st) => st.age > 4 && Math.hypot(st.x - x, st.y - y) < st.r) ?? null;
  }

  heroStorm(): Storm | null {
    return this.stormAt(this.s.hero.x, this.s.hero.y);
  }

  private stormTick(dt: number): void {
    const s = this.s;
    this.stormT -= dt;
    if (this.stormT <= 0 && s.free && s.storms.length < 2) {
      const se = this.sea();
      this.stormT = (70 + Math.random() * 80) / se.storm;
      const h = s.hero;
      const a = Math.random() * Math.PI * 2;
      const d = 520 + Math.random() * 380;
      const x = Math.max(200, Math.min(W - 200, h.x + Math.cos(a) * d));
      const y = Math.max(200, Math.min(H - 200, h.y + Math.sin(a) * d));
      const m = this.world.moist[Math.floor((y / H) * GH) * GW + Math.floor((x / W) * GW)] ?? 0.5;
      const kind = m < 0.32 + se.sandBias ? "kum" : "yagmur";
      const sp = 10 + Math.random() * 8;
      const back = a + Math.PI + (Math.random() - 0.5) * 1.2;
      s.storms.push({ id: s.nextId++, kind, x, y, r: 240 + Math.random() * 180, vx: Math.cos(back) * sp, vy: Math.sin(back) * sp, age: 0, life: 120 + Math.random() * 90 });
      if (this.isExplored(x, y) || d < 700) this.hud.toast(kind === "kum" ? "Ufukta bir kum fırtınası yükseliyor…" : this.season() === "kis" ? "Kuzeyden bir tipi geliyor…" : "Gökyüzü karardı, sağanak yaklaşıyor…", "info");
    }
    for (const st of s.storms) {
      st.age += dt;
      st.life -= dt;
      st.x += st.vx * dt;
      st.y += st.vy * dt;
    }
    if (s.storms.some((st) => st.life <= 0)) s.storms = s.storms.filter((st) => st.life > 0);
    const hs = this.heroStorm();
    audio.storm(!hs ? 0 : hs.kind === "kum" ? 1 : 2);
    const id = hs?.id ?? 0;
    if (id !== this.inStorm) {
      this.inStorm = id;
      if (hs) this.hud.toast(hs.kind === "kum" ? "Kum fırtınasına girdin: yavaşladın, görüşün daraldı. Muhafızlar izini kaybeder." : this.season() === "kis" ? "Tipiye yakalandın: kar dizlere vuruyor, yürüyüş yavaşladı." : "Sağanak altındasın: yollar çamur, yürüyüş yavaşladı.", "info");
    }
  }

  // ---------- caravans & outlawry ----------

  caravanValue(cv: Caravan): number {
    return Math.round(GOODS[cv.good].base * cv.qty);
  }

  private caravanTick(dt: number): void {
    const s = this.s;
    if (!s.free) return;
    this.cvT -= dt;
    if (this.cvT <= 0 && s.caravans.length < 7) {
      this.cvT = 14 + Math.random() * 14;
      this.spawnCaravan();
    }
    for (const cv of [...s.caravans]) {
      if (cv.raid) {
        const b = s.bandits.find((x) => x.id === cv.raid);
        if (!b) {
          cv.raid = 0;
          continue;
        }
        cv.raidT -= dt;
        if (cv.raidT <= 0) {
          s.caravans = s.caravans.filter((x) => x.id !== cv.id);
          b.army.spear += 2;
          const m = this.market(cv.to);
          m[cv.good] = Math.min(1.2, (m[cv.good] ?? 0) + 0.15);
          if (this.isExplored(cv.x, cv.y)) this.hud.toast(`Bir ${FACTIONS[cv.fac as FactionId].short} kervanı yağmalandı. ${CITY_NAME[cv.to]} pazarında ${GOODS[cv.good].name} pahalanacak.`, "info");
        }
        continue;
      }
      let move = HERO_SPEED * 0.62 * dt * this.stormSlow(cv.x, cv.y) * (this.isNight() ? 0.4 : 1);
      while (move > 0 && cv.pathI < cv.path.length) {
        const tx = cv.path[cv.pathI];
        const ty = cv.path[cv.pathI + 1];
        const d = Math.hypot(tx - cv.x, ty - cv.y);
        if (d <= move) {
          cv.x = tx;
          cv.y = ty;
          move -= d;
          cv.pathI += 2;
        } else {
          cv.x += ((tx - cv.x) / d) * move;
          cv.y += ((ty - cv.y) / d) * move;
          move = 0;
        }
      }
      if (cv.pathI >= cv.path.length) {
        s.caravans = s.caravans.filter((x) => x.id !== cv.id);
        const m = this.market(cv.to);
        m[cv.good] = Math.max(-0.7, (m[cv.good] ?? 0) - 0.12);
      }
    }
  }

  private spawnCaravan(): void {
    const s = this.s;
    const from = CITIES[Math.floor(Math.random() * CITIES.length)];
    const near = CITIES.filter((c) => c.id !== from.id)
      .map((c) => ({ c, d: Math.hypot(c.x - from.x, c.y - from.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    const to = near[Math.floor(Math.random() * near.length)].c;
    const path = this.findPath(from.x + 10, from.y + 100, to.x + 10, to.y + 100);
    if (!path) return;
    const cheap = CITY_TRADE[from.id].cheap;
    const good = cheap[Math.floor(Math.random() * cheap.length)];
    const tier = Math.max(1, Math.min(5, Math.round(s.hero.lv / 4)));
    const n = Math.round(4 + tier * 3 + Math.random() * 4);
    s.caravans.push({ id: s.nextId++, from: from.id, to: to.id, fac: factionOf(from.id), path, pathI: 0, x: from.x + 10, y: from.y + 100, guard: army(Math.round(n * 0.6), Math.round(n * 0.3), Math.round(n * 0.1)), good, qty: 8 + tier * 4 + Math.floor(Math.random() * 6), raid: 0, raidT: 0 });
  }

  caravanBuyPrice(cv: Caravan): number {
    return Math.max(1, Math.round(this.price(cv.from, cv.good) * 0.92 * this.buyFactor()));
  }

  private meetCaravan(cv: Caravan): void {
    const fac = FACTIONS[cv.fac as FactionId];
    const p = this.caravanBuyPrice(cv);
    const room = Math.max(0, this.carryCap() - this.cargoUsed());
    const k = Math.min(5, cv.qty, room);
    const pow = Math.round(armyPower(cv.guard));
    this.battleLock = true;
    const done = (f: () => void) => () => {
      this.battleLock = false;
      f();
    };
    this.hud.choice(
      `${fac.name} kervanı`,
      "icons/j_caravan",
      `${CITY_NAME[cv.from]} → ${CITY_NAME[cv.to]} · ${cv.qty} ${GOODS[cv.good].name} taşıyor (değeri ~${this.caravanValue(cv)} altın).<br>Muhafız: ${armySize(cv.guard)} asker (güç ${pow}).${cv.raid ? `<br><b class="dear">Haramiler kervana saldırıyor!</b>` : ""}`,
      [
        { label: `${k} ${GOODS[cv.good].name} al · ${p * k} altın`, cls: k > 0 && this.s.res.gold >= p * k ? "go" : "off", fn: done(() => this.buyFromCaravan(cv, k)) },
        { label: `Kervanı soy · ${fac.short} itibarı düşer, aranırsın`, cls: "bad", fn: done(() => this.robCaravan(cv)) },
        { label: "Yoluna devam et", cls: "", fn: done(() => {}) },
      ],
    );
  }

  private buyFromCaravan(cv: Caravan, k: number): void {
    const p = this.caravanBuyPrice(cv);
    if (k <= 0 || !this.pay({ gold: p * k })) return;
    const h = this.s.hero;
    h.cargo[cv.good] = (h.cargo[cv.good] ?? 0) + k;
    h.paid[cv.good] = (h.paid[cv.good] ?? 0) + p * k;
    cv.qty -= k;
    h.skills.ticaret += Math.ceil((p * k) / 25);
    this.hud.toast(`Kervandan ${k} ${GOODS[cv.good].name} aldın (−${p * k} altın)`, "info");
  }

  private robCaravan(cv: Caravan): void {
    const fac = cv.fac as FactionId;
    this.battle(`${FACTIONS[fac].name} kervanı`, cv.guard, 0.05, (win) => {
      const s = this.s;
      this.addWanted(win ? 2 : 1);
      s.rep[fac] = this.rep(fac) - (win ? 60 : 25);
      if (!win) return `Muhafızlar seni püskürttü. ${FACTIONS[fac].name} adını kara listeye yazdı.`;
      s.caravans = s.caravans.filter((x) => x.id !== cv.id);
      const room = Math.max(0, this.carryCap() - this.cargoUsed());
      const k = Math.min(cv.qty, room);
      s.hero.cargo[cv.good] = (s.hero.cargo[cv.good] ?? 0) + k;
      const gold = Math.round(this.caravanValue(cv) * 0.25 * this.stealMult());
      this.gain({ gold });
      s.c.robbed++;
      this.addKut(-4, "kervan soygunu töreye aykırı");
      this.bondEvent("robbed");
      if (s.c.robbed === 1) this.chron(`${FACTIONS[fac].name} kervanı yolda soyuldu. O günden beri hanlarda ${gen(s.hero.name)} adı fısıltıyla anılıyor.`);
      const lg = this.legendDrop(0.03);
      return `Kervan senin! +${k} ${GOODS[cv.good].name}${k < cv.qty ? ` (yükün doldu, ${cv.qty - k} adet geride kaldı)` : ""}, +${gold} altın.<br><b class="dear">Aranıyorsun (${"★".repeat(s.wanted)}) · ${FACTIONS[fac].name} itibarı −60</b>${lg ? `<br>Efsane: <b class="r4">${lg.name}</b>` : ""}`;
    }, null, `${FACTIONS[fac].short} muhafızları`);
  }

  private rescueCaravan(cv: Caravan): string {
    const fac = cv.fac as FactionId;
    const gold = Math.round(this.caravanValue(cv) * 0.2);
    this.s.res.gold += gold;
    this.s.c.rescued++;
    this.addRep(fac, 25, "kervanı kurtardın");
    this.addKut(2);
    this.bondEvent("rescue");
    const k = Math.min(3, cv.qty, Math.max(0, this.carryCap() - this.cargoUsed()));
    if (k) {
      this.s.hero.cargo[cv.good] = (this.s.hero.cargo[cv.good] ?? 0) + k;
      cv.qty -= k;
    }
    return `<br><b class="cheap">Kervanı kurtardın!</b> Kervanbaşı minnettar: +${gold} altın${k ? `, +${k} ${GOODS[cv.good].name} hediye` : ""}, ${FACTIONS[fac].short} itibarı +25`;
  }

  addWanted(n: number): void {
    const s = this.s;
    s.wanted = Math.min(5, s.wanted + n);
    s.wantedT = 150;
  }

  private wantedTick(dt: number): void {
    const s = this.s;
    if (s.wanted <= 0) return;
    s.wantedT -= dt;
    if (s.wantedT <= 0) {
      s.wanted--;
      s.wantedT = 150;
      this.hud.toast(s.wanted ? `Aranma azaldı: ${"★".repeat(s.wanted)}` : "Artık aranmıyorsun", "info");
    }
    if (s.wanted >= 2 && this.nearCity() < 0 && !s.bandits.some((b) => b.posse)) {
      this.posseT -= dt;
      if (this.posseT <= 0) {
        this.posseT = 50;
        const h = s.hero;
        const c = CITIES.map((c) => ({ c, d: Math.hypot(c.x - h.x, c.y - h.y) })).sort((a, b) => a.d - b.d)[0].c;
        const ang = Math.atan2(c.y - h.y, c.x - h.x);
        const x = h.x + Math.cos(ang) * 420;
        const y = h.y + Math.sin(ang) * 420;
        const w = s.wanted;
        const n = Math.round((6 + h.lv * 0.8) * (0.6 + w * 0.3));
        s.bandits.push({ id: s.nextId++, camp: -1, tier: w, x, y, army: army(Math.round(n * 0.5), Math.round(n * 0.3), Math.round(n * 0.2)), tx: x, ty: y, wait: 0, chase: true, posse: true });
        this.hud.toast(`${CITY_NAME[c.id]} muhafızları peşinde! (${"★".repeat(w)})`, "bad");
      }
    }
  }

  private fightPosse(b: Bandit): void {
    this.battle("Muhafızlar seni yakaladı!", b.army, 0.1, (win) => {
      const s = this.s;
      s.bandits = s.bandits.filter((x) => x.id !== b.id);
      if (win) {
        s.wantedT = 150;
        this.addWanted(1);
        const c = CITIES.map((c) => ({ c, d: Math.hypot(c.x - s.hero.x, c.y - s.hero.y) })).sort((a, b) => a.d - b.d)[0].c;
        const f = factionOf(c.id);
        s.rep[f] = this.rep(f) - 30;
        return `Muhafızları dağıttın, ama bu adını daha da kirletti. Aranma: ${"★".repeat(s.wanted)}`;
      }
      const fine = Math.round(s.res.gold * 0.25);
      s.res.gold -= fine;
      s.wanted = 0;
      return `Zincire vurulup kadının önüne çıkarıldın. ${fine} altın ceza ödedin; aranman kalktı.`;
    }, null, "Şehir muhafızları");
  }

  bribeCost(): number {
    return Math.round(this.s.wanted * (120 + this.s.hero.lv * 25));
  }

  bribe(): void {
    if (!this.s.wanted || !this.pay({ gold: this.bribeCost() })) return;
    this.s.wanted = 0;
    this.s.bandits = this.s.bandits.filter((b) => !b.posse);
    this.hud.toast("Kadıya kefaret ödedin. Sicilin temiz.", "good");
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
    const rh = this.retreatHook;
    this.retreatHook = null;
    if (rh) return rh();
    if (this.deep) return this.deepFlee();
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
    return this.stat("cev") >= 6 || this.hasComp("ferhat") || this.s.cls === "hirsiz" || this.tal("gozcu") > 0 || (this.s.bird?.lv ?? 0) >= 3;
  }

  private resolveBattle(title: string, enemy: Army, enemyBonus: number, after: (win: boolean) => string, boss: Boss | null, foe: string, t: Tactic, stance: Tactic, auto: boolean): void {
    const h = this.s.hero;
    this.lastTactic = auto ? this.lastTactic : t;
    const champ = this.champion();
    const sim = new Sim(h.army, this.heroBonus() + this.tdelta(t, stance), enemy, enemyBonus, champ, boss);
    const edge = TACTICS[t].beats === stance ? " — <b class=\"cheap\">üstünlük senin!</b>" : TACTICS[stance].beats === t ? " — <b class=\"dear\">düşman seni okudu!</b>" : "";
    for (const k of Object.keys(this.s.buffs)) if (--this.s.buffs[k] <= 0) delete this.s.buffs[k];
    const tline = `Taktik: ${TACTICS[t].name}${auto ? " (otomatik)" : ""} · Düşman: ${TACTICS[stance].name}${edge}`;
    const before = { ...h.army };
    const hpBefore = h.hp;
    this.hud.showBattle(title, before, enemy, sim, { hpBefore, maxHp: this.maxHp() }, boss, foe, auto, (res) => this.applyBattle(res, enemy, boss, after, tline, before, title), () => {
      this.battleLock = false;
      saveGame(this.s);
      const f = this.afterBattle;
      this.afterBattle = null;
      f?.();
    });
  }

  private applyBattle(res: BattleResult, enemy: Army, boss: Boss | null, after: (win: boolean) => string, tline: string, before: Army, title: string): { xp: number; lvUp: boolean; note: string } {
    const h = this.s.hero;
    if (res.orders.includes("ricat")) this.s.c.turan = (this.s.c.turan ?? 0) + 1;
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
    const songs0 = this.s.songs?.length ?? 0;
    const extra = after(res.win);
    this.addKut(res.win ? (boss ? 3 : 1) : -2);
    this.bondEvent(res.win ? (boss ? "boss" : "win") : "lose");
    if (res.win && boss) this.addFoe(boss.name, "boss");
    const dir = this.dir();
    dir.fight = this.dayOf().day;
    dir.losses = res.win ? 0 : dir.losses + 1;
    if (res.win && boss && !this.songLater && (this.s.songs?.length ?? 0) === songs0) this.sing("zafer", { foe: boss.name });
    this.songLater = false;
    let fled = "";
    if (!res.win) {
      const near = CITIES.map((c, i) => ({ i, d: Math.hypot(c.x - h.x, c.y - h.y) })).sort((a, b) => a.d - b.d)[0];
      const c = CITIES[near.i];
      h.x = c.x + 10;
      h.y = c.y + 100;
      this.cam.flyTo(h.x, h.y);
      fled = `${res.heroDown ? "Ağır yaralandın. " : ""}Kalanlar seni ${CITY_NAME[c.id]} şehrine taşıdı.`;
    }
    const vetNote = this.vetsAfter(before, res, title);
    const note = [tline, extra || fled, revived ? `Ruh Çağrısı: ${revived} asker hayata döndü` : "", vetNote].filter(Boolean).join("<br>");
    return { xp, lvUp, note };
  }

  private vetsAfter(before: Army, res: BattleResult, title: string): string {
    const s = this.s;
    s.vets ??= [];
    const out: string[] = [];
    const day = this.dayOf().day;
    for (const v of [...s.vets]) {
      const had = before[v.u];
      const lost = res.lostA[v.u];
      if (had <= 0) continue;
      const risk = (lost / had) * (res.win ? 0.35 : 0.6) * (1 - v.lv * 0.08);
      if (Math.random() < risk || s.hero.army[v.u] <= 0) {
        s.vets = s.vets.filter((x) => x.id !== v.id);
        (s.fallen ??= []).push({ name: vetTitle(v), lv: v.lv, kills: v.kills, day });
        this.chron(`${VET_RANKS[v.lv - 1]} ${vetTitle(v)}, ${title.replace(/<[^>]+>/g, "")} savaşında düştü. ${v.kills} düşman götürdü yanında.`);
        out.push(`<b class="dear">${vetTitle(v)} şehit düştü.</b>`);
        if (v.lv >= 2) this.sing("gazi", { foe: vetTitle(v) });
        continue;
      }
      if (lost / had > 0.3 && !v.scar && Math.random() < 0.3) {
        v.scar = SCARS[Math.floor(Math.random() * SCARS.length)];
        out.push(`${v.name} yaralandı; artık ona <b>${vetTitle(v)}</b> diyorlar.`);
      }
      v.kills += Math.round(armySize(res.lostB) / Math.max(1, armySize(before)) * (2 + v.lv));
      if (res.win && v.lv < VET_LV_MAX && ++v.xp >= VET_XP[v.lv]) {
        v.lv++;
        out.push(`${vetTitle(v)} ${VET_RANKS[v.lv - 1]} oldu!`);
        if (v.lv === VET_LV_MAX) this.chron(`${vetTitle(v)} sayısız savaştan sağ çıktı; ordu ona "Alp" diyor.`);
      }
    }
    if (res.win && s.vets.length < VET_MAX && armySize(s.hero.army) >= 10 && Math.random() < 0.3) {
      const pool = UNIT_KEYS.filter((u) => s.hero.army[u] > 0);
      const u = pool[Math.floor(Math.random() * pool.length)];
      const v = makeVet(s.nextId++, u, day, s.vets.map((x) => x.name.split(" ").pop()!));
      s.vets.push(v);
      out.push(`<b class="cheap">Saflardan biri öne çıktı: ${v.name}.</b> Artık gazilerin arasında.`);
    }
    return out.join("<br>");
  }

  addXp(xp: number): boolean {
    const h = this.s.hero;
    xp = Math.round(xp * (1 + this.compMods().xp + 0.2 * this.tal("efsane") + 0.1 * this.tal("tengri") + (this.gearMods().xp ?? 0) + (hasLegacy("ozan") ? 0.15 : 0)));
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
      if (h.lv % 10 === 0) this.chron(`${h.lv}. baharını gören kılıç: ${h.name} artık ${h.lv >= 30 ? "hanlara denk" : h.lv >= 20 ? "beylere denk" : "alplara denk"} sayılıyor.`);
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
      if (!this.s.nemeses.some((n) => n.alive && n.camp === i)) this.newNemesis(i, "camp");
      this.repNear(c.x, c.y, 5 * c.tier, "haramileri temizledin");
      let txt = `Kamp yerle bir edildi! +${loot.gold} altın, +${c.tier * 8} şöhret, +${c.tier} Ruh Taşı`;
      for (const b of this.s.bounties.filter((x) => x.camp === i && x.taken)) {
        this.s.res.gold += b.gold;
        this.s.renown += b.renown;
        txt += `<br>Ödül ilanı (${CITY_NAME[b.city]}): +${b.gold} altın, +${b.renown} şöhret`;
      }
      this.s.bounties = this.s.bounties.filter((x) => x.camp !== i);
      const items = [this.drop(c.tier, 1), this.drop(c.tier, 0.5)].filter((x): x is Item => !!x);
      for (const it of items) txt += `<br>Ganimet: <b class="r${it.rar}">${it.name}</b>`;
      const lg = c.tier >= 3 ? this.legendDrop(0.03 * c.tier) : null;
      if (lg) txt += `<br>Efsane: <b class="r4">${lg.name}</b>`;
      return txt;
    });
  }

  attackKurgan(i: number): void {
    const k = this.s.kurgans[i];
    if (!k.alive) return;
    const boss = kurganBoss(k.tier);
    const night = this.isNight();
    this.battle(`Kurgan Taşı · ${boss.name}${night ? " (gece)" : ""}`, k.guard, 0.1 * k.tier + (night ? 0.1 : 0), (win) => {
      if (!win) return "Lanetli taş seni geri püskürttü. Daha güçlü dön.";
      k.alive = false;
      k.respawnAt = this.now + 20 * 60000;
      this.s.c.kurgans++;
      if (this.s.c.kurgans === 1) this.chron(`İlk Kurgan Taşı çatladı; mor ışık içinde ruhlar göğe yükseldi. ${this.s.hero.name} ataların sesini duydu.`);
      this.repNear(k.x, k.y, 3 * k.tier, "ruhları özgür bıraktın");
      const ruh = Math.round((2 * k.tier + Math.floor(Math.random() * 3)) * (night ? 1.5 : 1));
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
      const lg = this.legendDrop(0.1 + 0.05 * k.tier);
      if (lg) txt += `<br>Efsane: <b class="r4">${lg.name}</b>`;
      return txt;
    }, boss, boss.name);
  }

  kurganOdds(i: number): number {
    const k = this.s.kurgans[i];
    return this.odds(k.guard, 0.1 * k.tier + (this.isNight() ? 0.1 : 0), kurganBoss(k.tier));
  }

  chron(t: string): void {
    const s = this.s;
    s.chron.push({ d: this.dayOf().day, t });
    if (s.chron.length > 80) s.chron.splice(1, s.chron.length - 80);
  }

  // ---------- conquest ----------

  siegeReason(city: string): string {
    const s = this.s;
    if (city === CAPITAL.id) return "Semerkant senin yurdun.";
    if (s.owned[city]) return "Bu şehir zaten senin.";
    if (!s.beylik) return "Şehir kuşatmak için önce beyliğini kur.";
    if (s.hero.lv < SIEGE_LV) return `Kuşatma için en az ${SIEGE_LV}. seviye ol.`;
    if (s.renown < SIEGE_RENOWN) return `Ordular senin ardından yürümez: en az ${SIEGE_RENOWN} şöhret gerek.`;
    if (armySize(this.siegeArmy(city)) < 25) return "Surlara en az 25 askerle yürünür (birliğin + beylik garnizonu).";
    return "";
  }

  siegeArmy(city?: string): Army {
    const h = this.s.hero.army;
    const g = this.s.garrison;
    const a = (city && this.seferHelp(city)?.a) || army();
    return { spear: h.spear + g.spear + a.spear, archer: h.archer + g.archer + a.archer, horse: h.horse + g.horse + a.horse };
  }

  seferHelp(city: string): { r: Rival; a: Army } | null {
    const r = this.s.rivals.find((x) => x.status === "ally" && x.req?.kind === "sefer" && x.req.city === city);
    if (!r) return null;
    return { r, a: { spear: Math.floor(r.army.spear / 2), archer: Math.floor(r.army.archer / 2), horse: Math.floor(r.army.horse / 2) } };
  }

  cityGar(city: string): Army {
    return cityGarrison(factionOf(city), this.s.sieged[city] ?? 0);
  }

  siegeWall(city: string): number {
    return wallBonus(factionOf(city), this.s.engines);
  }

  siegeOdds(city: string): number {
    return odds(this.siegeArmy(city), this.heroBonus(), this.cityGar(city), this.siegeWall(city), this.champion(), null);
  }

  buyEngine(): void {
    const s = this.s;
    if (s.res.gold < ENGINE_GOLD || s.engines >= 3) return;
    s.res.gold -= ENGINE_GOLD;
    s.engines++;
    audio.play("quest");
    this.hud.toast(`Mancınık kuruldu (${s.engines}/3). Surların koruması zayıflayacak.`, "good");
    saveGame(this.s);
  }

  siegeRun: SiegeRun | null = null;

  besiege(city: string): void {
    if (this.siegeReason(city)) return;
    const s = this.s;
    this.siegeRun = newSiege(city, this.siegeWall(city), this.cityGar(city), s.engines, Math.random);
    s.engines = 0;
    this.siegeRun.log.unshift({ t: tr("Ordun surların önüne çadır kurdu. Davullar çalıyor."), cls: "" });
    audio.play("quest");
    this.hud.openSiege();
  }

  siegeFood(): number {
    return Math.ceil(armySize(this.siegeArmy(this.siegeRun?.city)) / 8);
  }

  siegeCtx(): SiegeCtx {
    return { kar: this.stat("kar"), renown: this.s.renown, armyN: armySize(this.siegeArmy(this.siegeRun?.city)), rnd: Math.random };
  }

  siegeAct(act: SiegeAct): void {
    const r = this.siegeRun;
    if (!r || r.day > SIEGE_MAX_DAY) return;
    const s = this.s;
    const food = this.siegeFood();
    let loss = 0;
    if (s.res.food >= food) s.res.food -= food;
    else {
      s.res.food = 0;
      loss += Math.max(1, Math.round(armySize(s.hero.army) * 0.06));
      r.log.unshift({ t: tr("Erzak bitti! Askerlerin aç; bir kısmı gece kaçtı."), cls: "bad" });
    }
    const out = siegeDay(r, act, this.siegeCtx());
    loss += out.loss;
    this.siegeLoss(loss);
    if (out.surrender) {
      this.siegeRun = null;
      this.hud.closeSiege();
      this.conquerCity(r.city, true);
      return;
    }
    if (r.day > SIEGE_MAX_DAY) r.log.unshift({ t: tr("Askerler kuşatmadan bıktı: ya hücum et ya çekil."), cls: "bad" });
    saveGame(s);
  }

  private siegeLoss(n: number): void {
    const s = this.s;
    for (const pool of [s.hero.army, s.garrison]) {
      for (const u of UNIT_KEYS) {
        const d = Math.min(pool[u], Math.ceil(n / 3));
        pool[u] -= d;
        n -= d;
        if (n <= 0) return;
      }
    }
  }

  siegeRetreat(): void {
    const r = this.siegeRun;
    if (!r) return;
    if (r.day === 1) this.s.engines = r.engines;
    else this.s.sieged[r.city] = (this.s.sieged[r.city] ?? 0) + (r.gar0 - armySize(r.gar) > r.gar0 * 0.15 ? 1 : 0);
    this.siegeRun = null;
    this.hud.closeSiege();
    this.hud.toast(tr("Kuşatmadan vazgeçtin; ordu kışlaya döndü."));
  }

  siegeAssault(): void {
    const r = this.siegeRun;
    if (!r) return;
    this.siegeRun = null;
    this.hud.closeSiege();
    this.assault(r.city, siegeGar(r), siegeWall(r), r.engines);
  }

  siegeAssaultOdds(): number {
    const r = this.siegeRun;
    return r ? odds(this.siegeArmy(r.city), this.heroBonus(), siegeGar(r), siegeWall(r), this.champion(), null) : 0;
  }

  private assault(city: string, gar: Army, wall: number, used: number): void {
    const s = this.s;
    const f = factionOf(city);
    const fac = FACTIONS[f];
    const name = CITY_NAME[city];
    const g0 = { ...s.garrison };
    const help = this.seferHelp(city);
    const a0 = help?.a ?? army();
    const tot = this.siegeArmy(city);
    s.hero.army = { ...tot };
    s.garrison = army();
    this.retreatHook = () => {
      for (const u of UNIT_KEYS) s.hero.army[u] -= g0[u] + a0[u];
      s.garrison = g0;
      this.hud.toast("Hücumdan vazgeçtin; ordu kışlaya döndü.");
    };
    this.battle(`${name} kuşatması${help ? ` · ${rivalName(help.r)} yanında` : ""}`, gar, wall, (win) => {
      this.retreatHook = null;
      for (const u of UNIT_KEYS) {
        const left = s.hero.army[u];
        const back = tot[u] ? Math.min(left, Math.round((g0[u] * left) / tot[u])) : 0;
        const ally = tot[u] ? Math.min(left - back, Math.round((a0[u] * left) / tot[u])) : 0;
        s.hero.army[u] -= back + ally;
        s.garrison[u] += back;
        if (help) help.r.army[u] = Math.max(0, help.r.army[u] - a0[u] + ally);
      }
      if (!win) {
        s.rep[f] = Math.max(-500, this.rep(f) - 150);
        s.sieged[city] = (s.sieged[city] ?? 0) + 1;
        return `<p class="warn">${name} surları dayandı. ${used ? "Mancınıkların yakıldı. " : ""}Garnizon kayıp verdi; bir dahaki kuşatmada daha zayıf olacak.</p>`;
      }
      this.conquerCity(city, false);
      return `<p class="good">${name} fethedildi! +60 şöhret</p>`;
    }, null, `${fac.short} garnizonu`);
  }

  private conquerCity(city: string, peaceful: boolean): void {
    const s = this.s;
    const f = factionOf(city);
    const fac = FACTIONS[f];
    const name = CITY_NAME[city];
    s.rep[f] = Math.max(-500, this.rep(f) - (peaceful ? 200 : 400));
    delete s.sieged[city];
    s.owned[city] = { loy: peaceful ? 55 : 35, gar: army(10, 6, 4), coffer: 0, tax: 1, since: this.dayOf().day, from: f };
    s.c.conquests = (s.c.conquests ?? 0) + 1;
    s.renown += 60;
    this.addKut(peaceful ? 7 : 5, `${name} fethi`);
    this.bondEvent(peaceful ? "toreFair" : "conquer");
    this.sing("fetih", { place: name });
    if (!s.counterAt) s.counterAt = this.now + 8 * DAY_SEC * 1000;
    this.chron(peaceful ? `${name} kan dökülmeden ${gen(s.hero.name)} tuğuna boyun eğdi.` : `${name} surlarına ${gen(s.hero.name)} tuğu dikildi. ${fac.ruler} bu hakareti unutmayacak.`);
    audio.play("quest");
    this.hud.story(
      `${name} düştü!`,
      "icons/siege",
      `${peaceful ? "Kapılar içeriden açıldı; şehrin ileri gelenleri anahtarları elçine teslim etti. Kan dökülmediği için halk sana daha sıcak bakıyor." : `Kapılar kırıldı, ${fac.name} sancağı burçlardan indirildi. Şehrin ileri gelenleri anahtarları önüne koydu.`}<br><br>Artık <b>${name}</b> senin. Vergi toplar, garnizon kurar, halkı hoşnut tutarsın. Ama ${fac.ruler} şehri geri almak için ordu gönderecek; halk da ağır vergiye isyanla karşılık verir.<br><br><b>Kale</b> sekmesinden şehri yönet.`,
      "Şehre gir",
    );
    saveGame(s);
  }

  ownedList(): string[] {
    return Object.keys(this.s.owned);
  }

  ownRate(city: string): number {
    const o = this.s.owned[city];
    if (!o) return 0;
    const ev = this.cityEv(city);
    const gov = this.cityGov(city);
    const fair = ev?.good && ev.tax > 1 ? 1 + 0.25 * this.cbl(city, "pazar") : 1;
    return cityTax(city) * TAX[o.tax].mult * (0.4 + o.loy / 100) * (1 + 0.2 * this.cbl(city, "pazar")) * (1 + (gov?.tax ?? 0)) * (ev ? ev.tax * fair : 1) * (this.s.kurultay.decrees.includes("vergi") ? 1.15 : 1);
  }

  ownCap(city: string): number {
    return cityTax(city) * 25 * (1 + 0.5 * this.cbl(city, "ambar"));
  }

  cbl(city: string, b: CityBld): number {
    return this.s.owned[city]?.blds?.[b] ?? 0;
  }

  cityGov(city: string): Governor | null {
    const id = this.s.owned[city]?.gov;
    return id ? GOVERNORS.find((g) => g.id === id) ?? null : null;
  }

  cityEv(city: string): CityEvent | null {
    const e = this.s.owned[city]?.ev;
    return e && e.until >= this.dayOf().day ? CITY_EVENTS[e.kind] ?? null : null;
  }

  cityDefense(city: string): number {
    const o = this.s.owned[city];
    if (!o) return 0;
    return wallBonus(o.from, 0) + 0.1 + 0.12 * this.cbl(city, "sur") + (this.cityGov(city)?.def ?? 0);
  }

  // ---------- otag ----------

  otagReason(): string {
    const s = this.s;
    const h = s.hero;
    if (!s.beylik) return "Otağ kurmak için önce beyliğini kur.";
    if (this.nearCity(260) >= 0) return "Otağ şehirlerden uzakta, açık bozkırda kurulur.";
    if (this.cellCost(h.x, h.y) >= 3) return "Burası otağ için uygun değil.";
    if (s.otag && Math.hypot(s.otag.x - h.x, s.otag.y - h.y) < 300) return "Otağın zaten yakında.";
    if (!s.otag && (s.res.gold < OTAG_GOLD || s.res.wood < OTAG_WOOD)) return `Otağ için ${OTAG_GOLD} altın ve ${OTAG_WOOD} kereste gerek.`;
    if (s.otag && s.res.food < MOVE_FOOD) return `Göç için ${MOVE_FOOD} yiyecek gerek.`;
    return "";
  }

  pitchOtag(): void {
    const s = this.s;
    const h = s.hero;
    const why = this.otagReason();
    if (why) return this.hud.toast(why, "bad");
    const first = !s.otag;
    if (first) this.pay({ gold: OTAG_GOLD, wood: OTAG_WOOD });
    else this.pay({ food: MOVE_FOOD });
    const o = (s.otag ??= { x: h.x, y: h.y, herd: 60, fest: "" });
    o.x = h.x;
    o.y = h.y;
    const z = zoneOf(o.y, H);
    const se = this.season();
    const key = String(Math.floor((this.dayOf().day - 1) / SEASON_DAYS));
    audio.play("quest");
    if (first) {
      this.chron(`${h.name} bozkırın ortasında ak otağını dikti; ${ZONE_NAME[z].toLowerCase()} otlakları sürüyle doldu.`);
      this.hud.story("Ak Otağ", "map/yurts", `Keçeler gerildi, tuğ otağın önüne dikildi. Artık bir şehre bağlı değilsin: bozkır senin yurdun.<br><br><b>Sürün</b> otlakta büyür; yiyecek ve atlı gönüllü verir. Mevsime göre <b>yaylak</b> (kuzey) ile <b>kışlak</b> (güney) arasında göç et: kışı yaylakta geçiren sürü kırılır.`, "Tuğu dik");
    } else if (z === bestZone(se) && o.fest !== key) {
      o.fest = key;
      s.renown += 5;
      this.gain({ food: 60 });
      this.hud.toast(`Göç şenliği! Obalar ${ZONE_NAME[z].toLowerCase()} otlağına vardı: +5 şöhret, +60 yiyecek`, "good");
    } else this.hud.toast(`Otağ ${ZONE_NAME[z].toLowerCase()} otlağına göçtü`, "info");
  }

  nearOtag(r = 110): boolean {
    const o = this.s.otag;
    return !!o && Math.hypot(o.x - this.s.hero.x, o.y - this.s.hero.y) < r;
  }

  otagRest(): void {
    const h = this.s.hero;
    if (!this.nearOtag() || !this.pay({ food: REST_FOOD })) return this.hud.toast(`Dinlenmek için otağda olmalı ve ${REST_FOOD} yiyeceğin olmalı`, "bad");
    h.hp = this.maxHp();
    this.hud.toast("Otağda kımız içip dinlendin: can doldu", "good");
  }

  buyHerd(): void {
    const o = this.s.otag;
    if (!o || !this.nearOtag()) return;
    if (o.herd >= HERD_MAX) return this.hud.toast("Otlak daha fazla sürü kaldırmaz", "bad");
    if (!this.pay({ gold: HERD_GOLD })) return this.hud.toast("Altın yetersiz", "bad");
    o.herd = Math.min(HERD_MAX, o.herd + HERD_BUY);
    this.hud.toast(`Sürüye ${HERD_BUY} baş katıldı (${o.herd})`, "good");
  }

  otagYield(): { q: number; food: number; horses: number } {
    const o = this.s.otag;
    if (!o) return { q: 0, food: 0, horses: 0 };
    const q = pasture(zoneOf(o.y, H), this.season());
    return { q, food: Math.round(o.herd * 0.35 * q), horses: Math.floor((o.herd / 150) * q) };
  }

  private otagDaily(): void {
    const s = this.s;
    const o = s.otag;
    if (!o) return;
    const { q, food, horses } = this.otagYield();
    if (q >= 0.8) o.herd = Math.min(HERD_MAX, o.herd + Math.ceil(o.herd * 0.08 * q) + 2);
    else {
      const lost = Math.ceil(o.herd * (q < 0.4 ? 0.15 : 0.05));
      o.herd = Math.max(0, o.herd - lost);
      if (lost) this.hud.toast(`${q < 0.4 ? "Kara kış! " : "Otlak kurudu: "}sürüden ${lost} baş kırıldı. Otağı ${ZONE_NAME[bestZone(this.season())].toLowerCase()} bölgesine göçür.`, "bad");
    }
    if (food) this.gain({ food });
    if (horses) s.garrison.horse += horses;
  }

  // ---------- hazar ----------

  portHere(): string | null {
    const ci = this.nearCity();
    if (ci < 0) return null;
    const id = CITIES[ci].id;
    return portOf(id) ? id : null;
  }

  buyShip(): void {
    const s = this.s;
    if (!this.portHere()) return this.hud.toast("Gemi ancak bir iskelede alınır", "bad");
    if (s.fleet.ships >= SHIP_MAX) return this.hud.toast(`En fazla ${SHIP_MAX} gemi`, "bad");
    if (s.res.gold < SHIP_GOLD) return this.hud.toast("Altın yetersiz", "bad");
    s.res.gold -= SHIP_GOLD;
    s.fleet.ships++;
    audio.play("coin");
    this.hud.toast(`Yeni bir gemi denize indirildi (${s.fleet.ships}/${SHIP_MAX})`, "good");
  }

  pirateRisk(escort: boolean): number {
    const calm = (this.s.fleet.calm ?? 0) > this.s.time;
    return PIRATE_RISK * (escort ? 0.3 : 1) * (this.decree("yol") ? 0.6 : 1) * (calm ? 0.35 : 1) * (this.s.kagan ? 0.8 : 1);
  }

  seaPrice(city: string, g: Good): number {
    return Math.round(this.sellPrice(city, g) * 1.08);
  }

  fleetCap(): number {
    return this.s.fleet.ships * SHIP_CAP;
  }

  sendVoyage(to: string, g: Good, escort: boolean): void {
    const s = this.s;
    const h = s.hero;
    const from = this.portHere();
    if (!from) return this.hud.toast("Bir iskelede olmalısın", "bad");
    if (s.fleet.voyage) return this.hud.toast("Gemilerin zaten denizde", "bad");
    if (s.fleet.ships <= 0) return this.hud.toast("Önce bir gemi al", "bad");
    const days = routeDays(from, to);
    if (!days) return;
    const have = h.cargo[g] ?? 0;
    const qty = Math.min(have, this.fleetCap());
    if (qty <= 0) return this.hud.toast(`Yükünde ${GOODS[g].name} yok`, "bad");
    if (escort && s.res.gold < ESCORT_GOLD) return this.hud.toast("Muhafız için altın yetersiz", "bad");
    if (escort) s.res.gold -= ESCORT_GOLD;
    const paid = ((h.paid[g] ?? 0) * qty) / have;
    h.paid[g] = (h.paid[g] ?? 0) - paid;
    h.cargo[g] = have - qty;
    s.fleet.voyage = { from, to, good: g, qty, paid, at: s.time, dur: days * DAY_SEC, escort: escort ? 1 : 0 };
    audio.play("quest");
    this.hud.toast(`${qty} ${GOODS[g].name} ${CITY_NAME[to]} yolunda (${days} gün)`, "info");
  }

  private voyageTick(): void {
    const s = this.s;
    const v = s.fleet.voyage;
    if (!v || s.time < v.at + v.dur) return;
    s.fleet.voyage = null;
    const port = portOf(v.to)!;
    let qty = v.qty;
    let note = "";
    if (Math.random() < this.pirateRisk(!!v.escort)) {
      if (v.escort) {
        const lost = Math.ceil(qty * 0.1);
        qty -= lost;
        note = `Korsan kadırgaları ufukta belirdi ama kiralık muhafızlar onları oklarla geri püskürttü. Yalnızca ${lost} denk suya düştü.<br><br>`;
      } else {
        const lost = Math.ceil(qty * (0.4 + Math.random() * 0.3));
        qty -= lost;
        const sunk = s.fleet.ships > 1 && Math.random() < 0.25;
        if (sunk) s.fleet.ships--;
        note = `<b>Korsan baskını!</b> ${port.sea} korsanları gemilere çengel attı; ${lost} denk ${GOODS[v.good].name} yağmalandı${sunk ? ", bir gemin de alevler içinde battı" : ""}.<br><br>`;
        audio.play("bad");
      }
    }
    let got = 0;
    for (let k = 0; k < qty; k++) {
      got += this.seaPrice(v.to, v.good);
      const m = this.market(v.to);
      m[v.good] = Math.max(-0.7, (m[v.good] ?? 0) - 0.03);
    }
    const paid = Math.round((v.paid * qty) / v.qty);
    s.res.gold += got;
    const profit = Math.round(got - v.paid);
    if (profit > 0) s.c.profit += profit;
    s.c.voyages++;
    this.bondEvent("voyage");
    s.hero.skills.ticaret += Math.ceil(got / 20);
    this.addXp(Math.max(0, Math.floor(profit / 15)));
    if (profit >= 120) this.addRep(factionOf(v.to), Math.floor(profit / 120), "deniz ticareti");
    this.hud.story(
      `${port.name}`,
      "icons/merchant",
      `${note}Gemilerin ${CITY_NAME[v.to]} iskelesine yanaştı. Tellallar ${qty} denk ${GOODS[v.good].name} için yarıştı.<br><br>Satış: <b>+${got} altın</b> · maliyet ${paid} · <b>${profit >= 0 ? "kâr" : "zarar"} ${Math.abs(profit)}</b>`,
      "Kasaya koy",
    );
  }

  huntPirates(): void {
    const s = this.s;
    const from = this.portHere();
    if (!from) return;
    if (armySize(s.hero.army) < 10) return this.hud.toast("Korsan avı için en az 10 asker gerek", "bad");
    this.battle(`${portOf(from)!.sea} korsanları`, pirateArmy(s.hero.lv), 0.05, (win) => {
      if (!win) return "Korsanlar kayıklarına atlayıp kaçtı; askerlerin kıyıda yaralarını sarıyor.";
      const gold = 260 + s.hero.lv * 25;
      s.res.gold += gold;
      s.renown += 8;
      s.fleet.calm = s.time + 6 * DAY_SEC;
      this.chron(`${s.hero.name} ${portOf(from)!.name} açıklarında korsan yuvasını dağıttı.`);
      return `Korsan yuvası yakıldı! +${gold} altın, +8 şöhret. Altı gün boyunca deniz yolları daha güvenli.`;
    }, null, "Korsanlar");
  }

  buildCity(city: string, b: CityBld): void {
    const o = this.s.owned[city];
    if (!o) return;
    const lv = this.cbl(city, b);
    if (lv >= CITY_BLDS[b].max) return;
    const c = cityBldCost(b, lv);
    if (!this.pay(c)) {
      this.hud.toast(`Yetersiz kaynak: ${c.gold} altın, ${c.stone} taş gerekli.`, "bad");
      return;
    }
    o.blds = { ...(o.blds ?? {}), [b]: lv + 1 };
    audio.play("quest");
    this.hud.toast(`${CITY_NAME[city]}: ${CITY_BLDS[b].name} ${lv + 1}. seviye tamamlandı.`, "good");
    saveGame(this.s);
  }

  appointGov(city: string, id: string): void {
    const s = this.s;
    const o = s.owned[city];
    if (!o || o.gov === id) return;
    if (!this.pay({ gold: GOV_GOLD })) return;
    for (const x of Object.values(s.owned)) if (x.gov === id) delete x.gov;
    o.gov = id;
    const gv = GOVERNORS.find((g) => g.id === id)!;
    audio.play("quest");
    this.chron(`${gv.name}, ${CITY_NAME[city]} valiliğine atandı.`);
    this.hud.toast(`${gv.name} artık ${CITY_NAME[city]} valisi.`, "good");
  }

  fixCityEv(city: string): void {
    const o = this.s.owned[city];
    const ev = this.cityEv(city);
    if (!o || !ev?.fix) return;
    const cost = { gold: ev.fix.gold ?? 0, food: ev.fix.food ?? 0 };
    if (!this.pay(cost)) {
      this.hud.toast("Bunun için yeterli kaynağın yok.", "bad");
      return;
    }
    o.ev = null;
    o.loy = Math.min(100, o.loy + 10);
    audio.play("quest");
    this.hud.toast(`${CITY_NAME[city]}: ${ev.name} sona erdi. Halk minnettar (+10 bağlılık).`, "good");
  }

  private cityDaily(): void {
    const s = this.s;
    const day = this.dayOf().day;
    const se = this.season();
    this.otagDaily();
    this.toreTick(day);
    this.directorDaily();
    for (const o of Object.values(s.owned)) this.addKut(o.tax === 2 ? -1 : o.tax === 0 ? 0.5 : 0);
    if (Object.values(s.owned).some((o) => o.tax === 2)) this.bondEvent("taxHeavy");
    this.bondDaily();
    this.yugDaily(day);
    if (this.kurAnn !== s.kurultay.held && /Semerkant|^$/.test(this.kurultayReason())) {
      this.kurAnn = s.kurultay.held;
      this.hud.toast("Beyler Semerkant'ta kurultaya hazır. Hedefler sekmesinden topla.", "good");
    }
    for (const [city, o] of Object.entries(s.owned)) {
      const k = this.cbl(city, "kisla");
      const gov = this.cityGov(city);
      const vol = k * 2 + (gov?.id === "alper" && k ? 1 : 0);
      if (vol) {
        o.gar.spear += Math.ceil(vol / 2);
        o.gar.archer += Math.floor(vol / 2);
      }
      if (o.ev && o.ev.until < day) o.ev = null;
      if (o.ev) continue;
      const pool = Object.entries(CITY_EVENTS).filter(([, e]) => e.seasons.includes(se));
      const calm = gov?.calm ?? 0;
      if (!pool.length || Math.random() > 0.22) continue;
      const [kind, e] = pool[Math.floor(Math.random() * pool.length)];
      if (!e.good && Math.random() < calm) continue;
      o.ev = { kind, until: day + 2 };
      this.chron(`${CITY_NAME[city]}: ${e.name}. ${e.text}`);
      this.hud.toast(`${CITY_NAME[city]}: ${e.name}! ${e.text}`, e.good ? "good" : "bad");
    }
  }

  private ownTick(el: number): void {
    const s = this.s;
    for (const [city, o] of Object.entries(s.owned)) {
      o.coffer = Math.min(this.ownCap(city), o.coffer + this.ownRate(city) * el);
      const garLoy = Math.min(3, armySize(o.gar) / 20) * (1 + 0.25 * this.cbl(city, "kisla"));
      const ev = this.cityEv(city);
      const evLoy = ev ? (ev.loy < 0 && ev === CITY_EVENTS.kitlik ? ev.loy * (1 - Math.min(1, 0.4 * this.cbl(city, "ambar"))) : ev.loy) : 0;
      const decree = s.kurultay.decrees.includes("adalet") ? 0.5 : 0;
      o.loy = Math.max(0, Math.min(100, o.loy + (TAX[o.tax].loy + garLoy - 1 + (this.cityGov(city)?.loy ?? 0) + evLoy + decree + kutLoy(s.kut ?? 50)) * el));
      if (o.loy < 15 && Math.random() < 0.12 * el) this.loseCity(city, "isyan");
    }
    if (this.battleLock || !s.counterAt || this.now < s.counterAt) return;
    const list = this.ownedList();
    if (!list.length) {
      s.counterAt = 0;
      return;
    }
    s.counterAt = this.now + (6 + Math.random() * 5) * DAY_SEC * 1000;
    const city = list[Math.floor(Math.random() * list.length)];
    const o = s.owned[city];
    const days = this.dayOf().day - o.since;
    const base = cityGarrison(o.from, 0);
    const k = Math.min(1.3, 0.55 + days * 0.03);
    const foe: Army = { spear: Math.round(base.spear * k), archer: Math.round(base.archer * k), horse: Math.round(base.horse * k) };
    const res = fight(o.gar, this.cityDefense(city), foe, 0);
    if (res.win) {
      o.gar = { ...res.rounds[res.rounds.length - 1].a };
      o.loy = Math.min(100, o.loy + 8);
      audio.play("quest");
      this.hud.toast(`${FACTIONS[o.from].name} ${CITY_NAME[city]} surlarına saldırdı ama garnizonun püskürttü!`, "good");
    } else this.loseCity(city, "kuşatma");
  }

  private loseCity(city: string, why: "isyan" | "kuşatma"): void {
    const s = this.s;
    const o = s.owned[city];
    if (!o) return;
    delete s.owned[city];
    this.addKut(why === "isyan" ? -10 : -6);
    const name = CITY_NAME[city];
    audio.play("lose");
    const t = why === "isyan" ? `${name} halkı ağır yüke dayanamadı ve ayaklandı. Valin kaçtı, garnizonun dağıldı.` : `${FACTIONS[o.from].name} ordusu ${name} surlarını aştı. Garnizonun kılıçtan geçirildi.`;
    this.chron(t);
    this.hud.story(`${name} kaybedildi`, "icons/siege", `${t}<br><br>Şehri yeniden almak için tekrar kuşatman gerekecek.`, "Acı haber");
    saveGame(this.s);
  }

  // ---------- rival lords ----------

  private cityPos(id: string): { x: number; y: number } {
    const c = CITIES.find((x) => x.id === id) ?? CAPITAL;
    return { x: c.x, y: c.y };
  }

  private rivalSpot(r: Rival, rad: number): { x: number; y: number } {
    const home = this.cityPos(r.home);
    for (let k = 0; k < 12; k++) {
      const a = Math.random() * Math.PI * 2;
      const d = 160 + Math.random() * rad;
      const x = home.x + Math.cos(a) * d;
      const y = home.y + Math.sin(a) * d;
      if (x > 40 && y > 40 && x < W - 40 && y < H - 40 && this.cellCost(x, y) < 3) return { x, y };
    }
    return { x: home.x, y: home.y + 140 };
  }

  private rivalInit(): void {
    const s = this.s;
    for (const d of RIVAL_DEFS) {
      const lv = 3 + Math.floor(Math.random() * 3);
      const r: Rival = { ...d, x: 0, y: 0, tx: 0, ty: 0, army: rivalArmy(lv), lv, rel: d.trait === "comert" ? 15 : d.trait === "hirsli" ? -10 : 0, status: "peace", defeats: 0, wait: 0 };
      const p = this.rivalSpot(r, 300);
      r.x = r.tx = p.x;
      r.y = r.ty = p.y;
      s.rivals.push(r);
    }
    s.rivalDay = this.dayOf().day;
  }

  rivalPower(r: Rival): number {
    const b = rivalBoss(r);
    return armyPower(r.army, 0.05 + r.lv * 0.005) + b.atk * Math.sqrt(b.hp) * 0.8;
  }

  private rivalTick(dt: number): void {
    const s = this.s;
    if (!s.free) return;
    if (!s.rivals.length) this.rivalInit();
    const day = this.dayOf().day;
    if (day > s.rivalDay) {
      s.rivalDay = day;
      this.rivalDaily();
      this.cityDaily();
    }
    this.voyageTick();
    this.reqT -= dt;
    if (this.reqT <= 0) {
      this.reqT = 1.5;
      this.reqTick();
    }
    const h = s.hero;
    const heroPow = this.heroPower();
    const safe = this.nearCity() >= 0 || Math.hypot(h.x - CAPITAL.x, h.y - CAPITAL.y) < 450;
    s.rivals.forEach((r, i) => {
      if (r.status === "dead") return;
      const dh = Math.hypot(h.x - r.x, h.y - r.y);
      const hunt = r.status === "war" && !safe && dh < (this.isNight() ? 260 : 520) && this.rivalPower(r) > heroPow * 0.7 && armySize(r.army) > 0;
      if (hunt) {
        r.tx = h.x;
        r.ty = h.y;
        r.wait = 0;
        if (dh < 26 && !this.battleLock) {
          this.hud.toast(`${rivalName(r)} sana saldırdı!`, "bad");
          this.fightRival(i, true);
          return;
        }
      }
      if (r.wait > 0) {
        r.wait -= dt;
        return;
      }
      const d = Math.hypot(r.tx - r.x, r.ty - r.y);
      if (d < 6) {
        if (r.status === "war") this.rivalRaid(r);
        const p = this.rivalSpot(r, r.status === "war" ? 700 : 420);
        r.tx = p.x;
        r.ty = p.y;
        r.wait = 4 + Math.random() * 8;
        return;
      }
      const sp = ((hunt ? 24 : 15) * dt) / Math.max(0.6, Math.min(3, this.cellCost(r.x, r.y)));
      const nx = r.x + ((r.tx - r.x) / d) * Math.min(sp, d);
      const ny = r.y + ((r.ty - r.y) / d) * Math.min(sp, d);
      if (this.cellCost(nx, ny) === Infinity) {
        const p = this.rivalSpot(r, 420);
        r.tx = p.x;
        r.ty = p.y;
      } else {
        r.x = nx;
        r.y = ny;
      }
    });
  }

  private rivalRaid(r: Rival): void {
    const s = this.s;
    if (armySize(r.army) < 5) return;
    for (const [city, o] of Object.entries(s.owned)) {
      const p = this.cityPos(city);
      if (Math.hypot(p.x - r.x, p.y - r.y) > 260) continue;
      const res = fight(o.gar, this.cityDefense(city), r.army, 0.05);
      r.army = { ...res.rounds[res.rounds.length - 1].b };
      if (res.win) {
        o.gar = { ...res.rounds[res.rounds.length - 1].a };
        this.hud.toast(`${rivalName(r)} ${CITY_NAME[city]} surlarına saldırdı, garnizonun püskürttü!`, "good");
      } else this.loseCity(city, "kuşatma");
      return;
    }
    for (const [city, sr] of Object.entries(s.serais)) {
      const p = this.cityPos(city);
      if (Math.hypot(p.x - r.x, p.y - r.y) > 300 || sr.coffer < 5) continue;
      this.hud.toast(`${rivalName(r)} ${CITY_NAME[city]} kervansarayının kasasını yağmaladı (−${Math.floor(sr.coffer)} altın)!`, "bad");
      sr.coffer = 0;
      return;
    }
  }

  archeryPaid(): boolean {
    return (this.s.ok?.day ?? -1) !== this.dayOf().day;
  }

  archeryReward(score: number, hits: number): string {
    const s = this.s;
    s.ok ??= { day: -1, best: 0 };
    const best = score > s.ok.best;
    if (best) s.ok.best = score;
    if (!this.archeryPaid()) {
      saveGame(s);
      return `${best ? "<b class=\"cheap\">Yeni rekor!</b> " : ""}Bugünün ödülünü zaten aldın; bu bir antrenmandı.`;
    }
    s.ok.day = this.dayOf().day;
    const gold = Math.round(score * (0.8 + this.s.hero.lv * 0.05));
    const renown = Math.floor(score / 40);
    const xp = Math.round(score * 0.6);
    this.gain({ gold });
    s.renown += renown;
    this.addXp(xp);
    if (hits >= 12) this.addKut(1);
    if (best && score >= 300) this.chron(`${s.hero.name} at üstünde ${hits} kabak vurdu; ihtiyarlar Mete Han'dan beri böylesini görmediklerini söyledi.`);
    saveGame(s);
    return `${best ? "<b class=\"cheap\">Yeni rekor!</b><br>" : ""}+${gold} altın · +${renown} şöhret · +${xp} tecrübe`;
  }

  addFoe(name: string, kind: Foe["kind"]): void {
    const foes = (this.s.foes ??= []);
    if (foes.some((f) => f.name === name)) return;
    foes.push({ name, kind, day: this.dayOf().day });
  }

  unmourned(): Fallen[] {
    return (this.s.fallen ?? []).filter((f) => !f.mourned);
  }

  yugReason(): string {
    const n = this.unmourned().length;
    if (!n) return tr("Yas tutulacak gazi yok");
    const c = yugCost(n);
    if (this.s.res.food < c.food || this.s.res.gold < c.gold) return `${c.food} ${tr("yiyecek")}, ${c.gold} ${tr("altın")} ${tr("gerekir")}`;
    return "";
  }

  holdYug(): void {
    if (this.yugReason()) return;
    const s = this.s;
    const list = this.unmourned();
    const c = yugCost(list.length);
    s.res.food -= c.food;
    s.res.gold -= c.gold;
    const late = list.filter((f) => f.warned).length;
    for (const f of list) f.mourned = true;
    const kut = Math.min(6, list.length * 2 - late);
    this.addKut(kut, "yuğ");
    s.renown += 4 * list.length;
    s.buffs.yug = 3;
    for (const v of s.vets ?? []) v.xp += 20;
    this.bondEvent("feast");
    const names = list.map((f) => f.name).join(", ");
    this.chron(`${names} için yuğ töreni yapıldı; ağıtlar yakıldı, atları kurgana gömüldü.`);
    audio.play("quest");
    this.hud.story(tr("Yuğ"), "icons/tug", `Kurganın başında ateşler yakıldı. Ozanlar <b>${names}</b> için ağıt yaktı; yiğitlerin atlarının yeleleri kesildi, kımız toprağa döküldü.<br><br>Ordunun yüreği hafifledi: <b class="cheap">sonraki 3 savaşta +%5 güç</b>, gazilere tecrübe.${kut > 0 ? ` +${kut} kut.` : ""}`, tr("Ruhları şad olsun"));
    saveGame(s);
  }

  balbalReason(f: Foe): string {
    const s = this.s;
    if (f.raised) return tr("Dikildi");
    if (!s.beylik) return tr("Önce beyliğini kur");
    if ((s.foes ?? []).filter((x) => x.raised).length >= BALBAL_MAX) return tr("Kurgan dolu");
    if (s.res.stone < BALBAL_STONE || s.res.gold < BALBAL_GOLD) return `${BALBAL_STONE} ${tr("taş")}, ${BALBAL_GOLD} ${tr("altın")}`;
    return "";
  }

  raiseBalbal(i: number): void {
    const s = this.s;
    const f = s.foes?.[i];
    if (!f || this.balbalReason(f)) return;
    s.res.stone -= BALBAL_STONE;
    s.res.gold -= BALBAL_GOLD;
    f.raised = true;
    s.renown += 5;
    this.chron(`Kurgana ${f.name} için bir balbal dikildi; öbür dünyada ${s.hero.name}'e kul olacak.`);
    this.hud.toast(`${tr("Balbal dikildi")}: ${f.name}`, "good");
    audio.play("quest");
    saveGame(s);
  }

  private yugDaily(day: number): void {
    for (const f of this.unmourned()) {
      if (f.warned || day - f.day < YUG_LATE) continue;
      f.warned = true;
      this.addKut(-1, `${f.name} için yuğ tutulmadı`);
    }
  }

  surekReason(): string {
    const s = this.s;
    if (!s.free) return tr("Önce hürriyetini kazan");
    if (armySize(s.hero.army) < 10) return tr("Sürek avı için en az 10 askerin olmalı");
    if (s.res.food < SUREK_FOOD) return `${SUREK_FOOD} ${tr("yiyecek gerekir")}`;
    const left = (s.surekDay ?? -99) + 3 - this.dayOf().day;
    if (left > 0) return `${tr("Av yorgunluğu")}: ${left} ${tr("gün")}`;
    return "";
  }

  surekStart(): boolean {
    if (this.surekReason()) return false;
    this.s.res.food -= SUREK_FOOD;
    this.s.surekDay = this.dayOf().day;
    saveGame(this.s);
    return true;
  }

  surekReward(score: number, kills: Partial<Record<string, number>>): string {
    const s = this.s;
    const n = (k: string) => kills[k] ?? 0;
    const all = Object.values(kills).reduce((a: number, b) => a + (b ?? 0), 0);
    const food = n("geyik") * 35 + n("domuz") * 25 + n("kurt") * 8 + n("kaplan") * 40;
    const hides = Math.min(n("geyik") + n("domuz") + n("kaplan") * 2, Math.max(0, Math.floor(this.carryCap() - this.cargoUsed())));
    const renown = Math.floor(score / 30) + n("kaplan") * 10;
    this.gain({ food });
    if (hides) s.hero.cargo.deri = (s.hero.cargo.deri ?? 0) + hides;
    s.renown += renown;
    this.addXp(Math.round(score * 0.7));
    const lines = [`+${food} ${tr("yiyecek")}`, `+${renown} ${tr("şöhret")}`];
    if (hides) lines.push(`+${hides} ${tr("deri")}`);
    if (score >= 150) {
      s.buffs.surek = 3;
      lines.push(`<b class="cheap">${tr("Ordun avda pişti: sonraki 3 savaşta +%8 güç")}</b>`);
    }
    if (n("kaplan")) {
      this.addKut(2, "kaplan avı");
      this.chron(`${s.hero.name} sürek avında bir Turan kaplanı vurdu; postu otağın girişine serildi.`);
    }
    if (all >= 8) this.bondEvent("hunt");
    saveGame(s);
    return lines.join(" · ");
  }

  toyDay(): boolean {
    return this.dayOf().day % 7 === 0;
  }

  private gm(): NonNullable<GameState["games"]> {
    return (this.s.games ??= { wrDay: -1, wrRound: 0, kbDay: -1, kbBest: 0, champ: 0 });
  }

  wrestleFoe(): WrestleFoe & { round: number } {
    const r = Math.min(2, this.gm().wrRound);
    return { ...WR_FOES[r], round: r };
  }

  wrestleOpen(): boolean {
    return this.gm().wrDay !== this.dayOf().day;
  }

  wrestleReward(win: boolean, perfect: number): string {
    const s = this.s;
    const m = this.gm();
    const r = Math.min(2, m.wrRound);
    const k = this.toyDay() ? 2 : 1;
    if (!this.wrestleOpen()) return tr("Bugün güreş meydanı kapandı; bu bir antrenmandı.");
    if (!win) {
      m.wrDay = this.dayOf().day;
      m.wrRound = 0;
      saveGame(s);
      return `${WR_FOES[r].name} ${tr("seni sırtüstü yere serdi. Yarın yeniden meydana çık.")}`;
    }
    const gold = Math.round((40 + 30 * r + s.hero.lv * 4) * k);
    const renown = (3 + 3 * r + Math.min(3, perfect)) * k;
    this.gain({ gold });
    s.renown += renown;
    this.addXp((60 + 40 * r) * k);
    let extra = "";
    if (r >= 2) {
      m.champ++;
      m.wrDay = this.dayOf().day;
      m.wrRound = 0;
      s.renown += 20 * k;
      this.addKut(2, "baş pehlivan");
      this.chron(`${s.hero.name} güreş meydanında bütün pehlivanları yendi; ${m.champ}. kez baş pehlivan ilan edildi.`);
      audio.play("level");
      extra = `<br><b class="cheap">${tr("Baş pehlivan!")}</b> +${20 * k} ${tr("şöhret")}`;
    } else m.wrRound = r + 1;
    saveGame(s);
    return `+${gold} ${tr("altın")} · +${renown} ${tr("şöhret")}${extra}`;
  }

  kokboruOpen(): boolean {
    return this.gm().kbDay !== this.dayOf().day;
  }

  kokboruReward(goals: number): string {
    const s = this.s;
    const m = this.gm();
    const best = goals > m.kbBest;
    if (best) m.kbBest = goals;
    if (!this.kokboruOpen()) {
      saveGame(s);
      return `${best ? `<b class="cheap">${tr("Yeni rekor!")}</b> ` : ""}${tr("Bugünün ödülünü zaten aldın; bu bir antrenmandı.")}`;
    }
    m.kbDay = this.dayOf().day;
    const k = this.toyDay() ? 2 : 1;
    const gold = Math.round((goals * 55 + s.hero.lv * 5) * k);
    const renown = goals * 3 * k;
    this.gain({ gold });
    s.renown += renown;
    this.addXp(goals * 45 * k);
    if (goals >= 4) this.addKut(1);
    if (best && goals >= 6) this.chron(`${s.hero.name} kökbörüde oğlağı ${goals} kez kazana attı; bozkır bu yiğidi konuşuyor.`);
    saveGame(s);
    return `${best ? `<b class="cheap">${tr("Yeni rekor!")}</b><br>` : ""}+${gold} ${tr("altın")} · +${renown} ${tr("şöhret")}`;
  }

  boyReason(b: Boy): string {
    const s = this.s;
    if (!s.free) return "Önce hürriyetini kazan";
    if ((s.boysDone ?? []).includes(b.id)) return "Bu boy anlatıldı";
    if (s.boy) return "Önce başladığın boyu bitir";
    if (s.hero.lv < b.lv) return `${b.lv}. seviye gerek`;
    if (this.nearCity() < 0) return "Dede Korkut şehir hanlarında anlatır";
    return "";
  }

  private boySpot(city: string): { x: number; y: number } {
    const c = this.cityPos(city);
    for (let i = 0; i < 80; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 260 + Math.random() * 260;
      const x = c.x + Math.cos(a) * d;
      const y = c.y + Math.sin(a) * d;
      if (x > 80 && y > 80 && x < W - 80 && y < H - 80 && this.cellCost(x, y) < 3 && this.nearCity(200) < 0 && CITIES.every((k) => Math.hypot(k.x - x, k.y - y) > 200)) return { x, y };
    }
    return { x: c.x + 160, y: c.y + 160 };
  }

  boyStart(id: string): void {
    const b = boyOf(id);
    if (!b || this.boyReason(b)) return;
    const s = this.s;
    const at = this.boySpot(b.steps[0].near);
    s.boy = { id, step: 0, at };
    this.reveal(at.x, at.y, 6);
    this.chron(`Dede Korkut ${CITY_NAME[CITIES[this.nearCity()].id]} hanında "${b.name}"nu anlattı.`);
    this.hud.story(`Dede Korkut · ${b.name}`, b.icon, `<i>${b.intro}</i><br><br><b>Hedef:</b> ${b.steps[0].place} (${CITY_NAME[b.steps[0].near]} yakınları)`, "Yola çık");
    saveGame(s);
  }

  boyStep(): { b: Boy; st: BoyStep; n: number } | null {
    const bs = this.s.boy;
    const b = bs && boyOf(bs.id);
    if (!bs || !b) return null;
    return { b, st: b.steps[bs.step], n: bs.step };
  }

  boyOdds(): number {
    const x = this.boyStep();
    if (!x?.st.army) return 1;
    return this.odds(x.st.army(this.s.hero.lv), x.st.bonus ?? 0, x.st.boss ?? null);
  }

  boyAct(): void {
    const x = this.boyStep();
    const s = this.s;
    if (!x || !s.boy?.at) return;
    const { b, st } = x;
    if (Math.hypot(s.boy.at.x - s.hero.x, s.boy.at.y - s.hero.y) > 120) return;
    if (st.act === "talk") return this.boyNext(st.done);
    if (st.act === "pay") {
      if (!this.pay({ gold: st.cost?.gold ?? 0, food: st.cost?.food ?? 0 })) return this.hud.toast("Yetersiz kaynak", "bad");
      return this.boyNext(st.done);
    }
    if (st.act === "fight") {
      this.battle(`${b.name} · ${st.place}`, st.army!(s.hero.lv), st.bonus ?? 0, (win) => {
        if (!win) return `<p class="warn">Geri çekilmek zorunda kaldın. ${st.place} seni bekliyor.</p>`;
        if (s.boy && s.boy.step >= b.steps.length - 1) this.songLater = true;
        this.afterBattle = () => this.boyNext(st.done);
        return `<p class="good">${st.boss ? `${st.boss.name} yenildi!` : "Zafer!"}</p>`;
      }, st.boss ?? null, st.boss?.name ?? st.place);
      return;
    }
    this.hud.choice(st.place, st.img, st.text, (st.choices ?? []).map((c) => {
      const poor = (c.fx.gold ?? 0) < 0 && s.res.gold < -(c.fx.gold ?? 0);
      return { label: c.label, cls: poor ? "off" : "go", fn: () => {
        const fx = this.roadFx(c.fx);
        this.boyNext(`${c.text}${fx}`, c.end);
      } };
    }));
  }

  private boyNext(text: string, end = false): void {
    const s = this.s;
    const bs = s.boy;
    const b = bs && boyOf(bs.id);
    if (!bs || !b) return;
    const last = end || bs.step >= b.steps.length - 1;
    if (last) {
      s.boy = null;
      s.boysDone = [...(s.boysDone ?? []), b.id];
      const fx = this.roadFx(b.reward);
      const lg = b.reward.legend ? this.legendDrop(1) : null;
      this.sing("destan", { foe: b.name.replace(/ Boyu$/, "") });
      this.chron(`${s.hero.name}, Dede Korkut'un "${b.name}"nu kendi kılıcıyla yeniden yazdı.`);
      this.hud.story(`${b.name} tamamlandı`, b.icon, `${text ? `${text}<br><br>` : ""}<i>Dede Korkut gelip boy boyladı, soy soyladı: "Bu destanı ${gen(s.hero.name)} adıyla anlatsınlar."</i>${fx}${lg ? `<br>Efsane: <b class="r4">${lg.name}</b>` : ""}`, "Kopuzun dilli olsun");
    } else {
      bs.step++;
      const nx = b.steps[bs.step];
      bs.at = nx.near === b.steps[bs.step - 1].near && nx.place === b.steps[bs.step - 1].place ? bs.at : this.boySpot(nx.near);
      this.reveal(bs.at!.x, bs.at!.y, 6);
      this.hud.story(b.name, nx.img, `${text ? `${text}<br><br>` : ""}<b>Sıradaki:</b> ${nx.place} (${CITY_NAME[nx.near]} yakınları)`, "Devam");
    }
    saveGame(s);
  }

  family(): Family {
    const s = this.s;
    s.family = { ...FAMILY_DEFAULT, ...s.family, kids: s.family?.kids ?? [] };
    return s.family;
  }

  private dynInit(r: Rival): void {
    if (r.age !== undefined) return;
    r.age = 34 + Math.floor(Math.random() * 24);
    r.heirs = makeHeirs([r.name]);
    r.gen = 1;
  }

  private dynastyDaily(day: number): void {
    const s = this.s;
    for (const r of s.rivals) {
      if (r.status === "dead") continue;
      this.dynInit(r);
      if (day % YEAR_DAYS === 0) {
        r.age = (r.age ?? 40) + 1;
        if (Math.random() < deathChance(r.age)) this.succeed(r, "olum");
      }
    }
    const f = this.family();
    if (f.spouse && f.kids.length < KID_MAX && day >= f.next) {
      f.next = day + KID_EVERY;
      if (Math.random() < 0.6) this.kidBorn();
    }
  }

  kidBorn(): void {
    const s = this.s;
    const f = this.family();
    const son = Math.random() < 0.55;
    const name = pick(son ? SON_NAMES : DAUGHTER_NAMES, f.kids.map((k) => k.name));
    f.kids.push({ name, born: this.dayOf().day, son });
    this.addKut(3, "hanedan büyüyor");
    s.renown += 5;
    this.chron(`${gen(s.hero.name)} otağında bir ${son ? "oğul" : "kız"} doğdu: ${name}. ${f.spouse!.name} Hatun beşiği Tengri'ye gösterdi.`);
    this.hud.toast(`Otağında bir ${son ? "oğul" : "kız"} doğdu: ${name}! Hanedanın büyüyor.`, "good");
  }

  succeed(r: Rival, why: "olum" | "kilic"): void {
    const s = this.s;
    this.dynInit(r);
    const old = rivalName(r);
    const heirs = r.heirs ?? [];
    if (!heirs.length) {
      r.status = "dead";
      if (why === "olum") {
        this.chron(`${old} yaşlılıktan öldü; ardında varis kalmadı. Soyu kurudu, obası dağıldı.`);
        this.hud.toast(`${old} varissiz öldü; tuğu devrildi.`, "info");
      }
      return;
    }
    const heir = heirs.shift()!;
    const crisis = heirs.length > 0 && (r.trait === "hirsli" || r.trait === "kurnaz") && Math.random() < 0.4;
    const st0 = r.status;
    r.name = heir;
    r.gen = (r.gen ?? 1) + 1;
    r.age = 20 + Math.floor(Math.random() * 12);
    r.heirs = crisis ? [] : Math.random() < 0.6 ? makeHeirs([heir]).slice(0, 1) : [];
    r.lv = Math.max(1, r.lv - 3);
    if (Math.random() < 0.3) r.trait = oneOf(["hirsli", "onurlu", "kurnaz", "comert"] as const);
    for (const u of UNIT_KEYS) r.army[u] = Math.floor(r.army[u] * (crisis ? 0.3 : 0.6));
    r.req = undefined;
    let note: string;
    if (why === "kilic") {
      r.status = "war";
      r.rel = -70;
      note = `${old} ${gen(s.hero.name)} kılıcıyla öldü ama oğlu ${heir} babasının tuğunu kaldırdı ve kan davası yemini etti!`;
    } else if (st0 === "ally") {
      r.status = r.wed ? "ally" : "peace";
      r.rel = r.wed ? Math.max(60, r.rel) : Math.round(r.rel * 0.5);
      note = `${old} öldü; tuğu oğlu ${heir}'e geçti. ${r.wed ? "Dünür bağı sürüyor; ittifak yerinde." : "Yeni bey babasının antını yenilemedi."}`;
    } else if (st0 === "vassal") {
      const stay = r.trait === "onurlu" || Math.random() < 0.5;
      r.status = stay ? "vassal" : "peace";
      r.rel = stay ? r.rel : 0;
      note = `${old} öldü; yerine oğlu ${heir} geçti. ${stay ? "Yeni bey biatını tazeledi." : "Yeni bey haracı kesti ve bağımsızlığını ilan etti!"}`;
    } else if (st0 === "war") {
      const bury = Math.random() < 0.5;
      r.status = bury ? "peace" : "war";
      r.rel = bury ? -20 : r.rel;
      note = `${old} öldü; oğlu ${heir} tuğu devraldı. ${bury ? "Babasının kinini toprağa gömdü." : "Babasının kinini de devraldı."}`;
    } else {
      r.rel = Math.round(r.rel * 0.5);
      note = `${old} öldü; tuğu oğlu ${heir}'e geçti.`;
    }
    if (crisis) note += ` Kardeşleri tahta razı olmadı; taht kavgası ordusunu dağıttı.`;
    this.chron(note);
    this.hud.toast(note, why === "kilic" || r.status === "war" ? "bad" : "info");
  }

  marryReason(r: Rival): string {
    const s = this.s;
    this.dynInit(r);
    if (!s.beylik) return "Önce beyliğini kur";
    if (this.family().spouse) return "Zaten evlisin";
    if (r.status !== "peace" && r.status !== "ally") return "Yalnızca barıştaki beylerle dünür olunur";
    if (r.rel < 40) return `Dostluk en az 40 olmalı (${Math.round(r.rel)})`;
    if (s.res.gold < brideGold(r.lv)) return `${brideGold(r.lv)} altın başlık gerek`;
    return "";
  }

  marry(i: number): void {
    const s = this.s;
    const r = s.rivals[i];
    if (!r || this.marryReason(r)) return;
    s.res.gold -= brideGold(r.lv);
    const bride = brideOf(r.id);
    const f = this.family();
    f.spouse = { name: bride, from: r.id };
    f.next = this.dayOf().day + 6;
    r.wed = true;
    r.status = "ally";
    r.rel = 100;
    this.addKut(5, "düğün");
    s.renown += 20;
    audio.play("quest");
    this.chron(`${gen(s.hero.name)} ${rivalName(r)} kızı ${bride} ile evlendi. Kırk gün kırk gece düğün yapıldı.`);
    this.hud.story(
      "Kırk Gün Kırk Gece",
      `icons/${r.icon}`,
      `Davullar çalındı, at yarışları koşuldu, kazanlar kaynadı. ${rivalName(r)} kızı <b>${bride}</b>'yi gelin olarak otağına gönderdi.<br><br>Artık dünürsünüz: <b>${r.name}</b> sonsuza dek müttefikin, ittifak asla bozulmaz.<br>${bride} Hatun otağını yönetir: <b>müttefik gücü +%3</b>. Zamanla çocukların olacak; oğulların ordunda sancak taşır.<br><br>+20 şöhret`,
      "Toyunuz kutlu olsun",
    );
    saveGame(s);
  }

  famBonus(): number {
    const f = this.s.family;
    if (!f?.spouse) return 0;
    const day = this.dayOf().day;
    return f.kids.filter((k) => k.son && kidAge(k, day) >= 1).length * 0.015;
  }

  private rivalDaily(): void {
    const s = this.s;
    this.dynastyDaily(this.dayOf().day);
    const live = s.rivals.filter((r) => r.status !== "dead");
    for (const r of live) {
      if (r.lv < 30 && Math.random() < 0.3) r.lv++;
      const full = rivalArmy(r.lv);
      for (const u of UNIT_KEYS) r.army[u] = Math.min(full[u], r.army[u] + Math.ceil((full[u] - r.army[u]) * 0.3));
      const tr = RIVAL_TRAITS[r.trait];
      if (r.status === "peace") {
        r.rel += r.rel > 0 ? -1 : r.rel < 0 ? 1 : 0;
        const owns = Object.keys(s.owned).some((c) => Math.hypot(this.cityPos(c).x - this.cityPos(r.home).x, this.cityPos(c).y - this.cityPos(r.home).y) < 1400);
        if ((r.rel <= -40 || (owns && r.trait === "hirsli" && r.rel < 10)) && Math.random() < 0.2 * tr.war) this.rivalWar(r, false);
      } else if (r.status === "war") {
        if (r.defeats > 0 && Math.random() < 0.15 / tr.war) {
          r.status = "peace";
          r.rel = -20;
          this.hud.toast(`${rivalName(r)} barış elçisi yolladı; tuğlar indirildi.`, "good");
        }
      } else if (r.status === "ally") {
        if (r.rel < 0 && r.trait !== "onurlu" && !r.wed) {
          r.status = "peace";
          this.hud.toast(`${rivalName(r)} ittifakı bozdu; artık sana güvenmiyor.`, "bad");
          continue;
        }
        if (r.trait === "comert" ? Math.random() < 0.35 : Math.random() < 0.12) {
          const g = 60 + r.lv * 12;
          s.res.gold += g;
          this.hud.toast(`Müttefikin ${rivalName(r)} armağan yolladı: +${g} altın`, "good");
        }
      } else if (r.status === "vassal") {
        const g = Math.round(tribute(r) * (this.decree("vergi") ? 1.2 : 1) * (s.kagan ? 1.5 : 1));
        s.res.gold += g;
        this.hud.toast(`${rivalName(r)} haracını gönderdi: +${g} altın`, "good");
        if (r.trait !== "onurlu" && r.lv > s.hero.lv + 4 && Math.random() < 0.1) {
          r.status = "war";
          r.rel = -50;
          this.chron(`${rivalName(r)} biat zincirini kırdı ve ${gen(s.hero.name)} tuğuna kılıç çekti.`);
          this.hud.toast(`${rivalName(r)} isyan etti! Haraç kesildi.`, "bad");
        }
      }
    }
    const asks = live.filter((r) => (r.status === "ally" || r.status === "vassal") && !r.req);
    if (asks.length && Math.random() < 0.55) this.reqNew(oneOf(asks));
    const fight2 = live.filter((r) => r.status === "peace" || r.status === "war");
    if (fight2.length >= 2 && !this.decree("baris") && Math.random() < 0.3) {
      const a = fight2[Math.floor(Math.random() * fight2.length)];
      const b = fight2.filter((x) => x !== a)[Math.floor(Math.random() * (fight2.length - 1))];
      const win = this.rivalPower(a) * (0.7 + Math.random() * 0.6) > this.rivalPower(b) ? a : b;
      const lose = win === a ? b : a;
      for (const u of UNIT_KEYS) lose.army[u] = Math.floor(lose.army[u] * 0.6);
      this.hud.toast(`Söylenti: ${rivalName(win)} ile ${rivalName(lose)} çarpıştı; ${win.name} galip geldi.`, "info");
    }
  }

  private rivalWar(r: Rival, mine: boolean): void {
    r.status = "war";
    r.rel = Math.min(r.rel, -50);
    this.chron(mine ? `${gen(this.s.hero.name)} tuğu ${rivalName(r)} üzerine kalktı.` : `${rivalName(r)} ${gen(this.s.hero.name)} topraklarına savaş ilan etti.`);
    if (!mine) this.hud.story(`${rivalName(r)} savaş açtı!`, `icons/${r.icon}`, `Bir ulak çadırına kanlı bir ok bıraktı: <i>"${oneOf(RIVAL_LINES.war)}"</i><br><br>${rivalName(r)} artık haritada senin peşinde; şehirlerine ve kervansaraylarına akın edecek. Ordusunu yen, ya biat ettir ya kılıçtan geçir.`, "Kılıcını kuşan");
    for (const o of this.s.rivals) if (o !== r && o.trait === "onurlu" && mine) o.rel -= 8;
  }

  meetRival(i: number): void {
    const s = this.s;
    const r = s.rivals[i];
    if (!r || r.status === "dead") return;
    const tr = RIVAL_TRAITS[r.trait];
    const ratio = this.heroPower() / Math.max(1, this.rivalPower(r));
    const cost = giftCost(r);
    this.battleLock = true;
    const done = (f: () => void) => () => {
      this.battleLock = false;
      f();
    };
    const opts: { label: string; cls: string; fn: () => void }[] = [];
    const q = r.req;
    if (q?.kind === "goods") {
      const ok = (s.hero.cargo[q.good!] ?? 0) >= q.n!;
      opts.push({ label: `${q.n} ${GOODS[q.good!].name} teslim et · +${q.gold} altın`, cls: ok ? "go" : "off", fn: done(() => this.deliverReq(i)) });
    }
    if (q) opts.push({ label: `İsteği geri çevir (${REQ_INFO[q.kind].name})`, cls: "", fn: done(() => this.dropReq(i)) });
    if (r.status === "peace" || r.status === "ally")
      opts.push({ label: `Hediye gönder · ${cost} altın`, cls: s.res.gold >= cost ? "go" : "off", fn: done(() => this.rivalGift(i)) });
    if ((r.status === "peace" || r.status === "ally") && s.beylik && !this.family().spouse) {
      const why = this.marryReason(r);
      opts.push({ label: `Kızı ${brideOf(r.id)} için dünürcü gönder · ${brideGold(r.lv)} altın${why ? ` · ${why}` : ""}`, cls: why ? "off" : "go", fn: done(() => this.marry(i)) });
    }
    if (r.status === "peace") {
      opts.push({ label: `İttifak öner${r.rel < 50 ? ` · dostluk ${Math.round(r.rel)}/50` : ""}`, cls: r.rel >= 50 ? "go" : "", fn: done(() => this.rivalAlly(i)) });
      opts.push({ label: `Biat iste · güç oranı ×${ratio.toFixed(1)}`, cls: ratio >= 2 ? "go" : "", fn: done(() => this.rivalDemand(i)) });
      opts.push({ label: "Savaş aç ve saldır", cls: "bad", fn: done(() => { this.rivalWar(r, true); this.fightRival(i, false); }) });
    } else if (r.status === "ally") {
      opts.push({ label: "İttifakı boz", cls: "bad", fn: done(() => { r.status = "peace"; r.rel = 0; this.hud.toast(`${rivalName(r)} ile ittifak bozuldu.`, "bad"); }) });
    } else if (r.status === "war") {
      opts.push({ label: "Saldır!", cls: "bad", fn: done(() => this.fightRival(i, false)) });
      opts.push({ label: `Barış öner · ${cost * 3} altın`, cls: s.res.gold >= cost * 3 ? "" : "off", fn: done(() => this.rivalPeace(i)) });
    } else if (r.status === "vassal") {
      opts.push({ label: "Biatından azat et (dostluk kazanırsın)", cls: "", fn: done(() => { r.status = "peace"; r.rel = 40; this.hud.toast(`${rivalName(r)} azat edildi; sana minnettar.`, "good"); }) });
    }
    opts.push({ label: "Yoluna devam et", cls: "", fn: done(() => {}) });
    const line = r.status === "war" ? oneOf(RIVAL_LINES.war) : r.status === "vassal" ? "Haracın her gün yolda, beyim." : r.status === "ally" ? "Kardeşim! Tuğlarımız yan yana dalgalansın." : oneOf(RIVAL_LINES.hello);
    this.hud.choice(
      rivalName(r),
      `icons/${r.icon}`,
      `<i>"${q ? REQ_INFO[q.kind].line : line}"</i><br><br><b>${tr.name}</b> · ${tr.desc}<br>Durum: <b>${STATUS_NAME[r.status]}</b> · Dostluk: <b>${Math.round(r.rel)}</b> · Seviye ${r.lv} · ${armySize(r.army)} asker${q ? `<br><br><b>İstek:</b> ${this.reqText(r)} · ödül ${q.gold} altın · son gün ${q.until}` : ""}`,
      opts,
    );
  }

  private rivalGift(i: number): void {
    const r = this.s.rivals[i];
    const cost = giftCost(r);
    if (!this.pay({ gold: cost })) return;
    r.rel = Math.min(100, r.rel + 15 * RIVAL_TRAITS[r.trait].gift);
    this.hud.toast(`${rivalName(r)}: "${oneOf(RIVAL_LINES.gift)}" (dostluk ${Math.round(r.rel)})`, "good");
  }

  private rivalAlly(i: number): void {
    const r = this.s.rivals[i];
    if (r.rel < 50) {
      this.hud.toast(`${rivalName(r)}: "${oneOf(RIVAL_LINES.refuse)}"`, "bad");
      return;
    }
    r.status = "ally";
    audio.play("quest");
    this.chron(`${gen(this.s.hero.name)} ve ${rivalName(r)} kımız içip ant içti; tuğları artık yan yana.`);
    this.hud.story("Ant içildi", `icons/${r.icon}`, `${rivalName(r)} ile kanınızı bir kâseye damlatıp içtiniz. Artık müttefiksiniz.<br><br><b>Savaşlarda +%7 ordu gücü</b>${r.trait === "comert" ? ", sık sık armağan" : ""}. Müttefiklerin düşmanlarına karşı yanında durur.`, "Kardeşim");
  }

  private rivalDemand(i: number): void {
    const r = this.s.rivals[i];
    const ratio = this.heroPower() / Math.max(1, this.rivalPower(r));
    if (ratio >= 2 && (r.trait !== "onurlu" || ratio >= 3)) {
      r.status = "vassal";
      audio.play("quest");
      this.chron(`${rivalName(r)} kılıç çekmeden ${gen(this.s.hero.name)} tuğuna eğildi.`);
      this.hud.toast(`${rivalName(r)} biat etti! Her gün ${tribute(r)} altın haraç.`, "good");
      return;
    }
    r.rel -= 25;
    this.hud.toast(`${rivalName(r)} öfkeyle güldü: "Önce beni yen!" (dostluk ${Math.round(r.rel)})`, "bad");
  }

  private rivalPeace(i: number): void {
    const r = this.s.rivals[i];
    const cost = giftCost(r) * 3;
    const ok = r.defeats > 0 || r.trait === "kurnaz" || Math.random() < 0.5 / RIVAL_TRAITS[r.trait].war;
    if (!ok) {
      this.hud.toast(`${rivalName(r)} altınını geri yolladı: "Kan kanla yıkanır!"`, "bad");
      return;
    }
    if (!this.pay({ gold: cost })) return;
    r.status = "peace";
    r.rel = -10;
    this.hud.toast(`${rivalName(r)} ile barış yapıldı.`, "good");
  }

  fightRival(i: number, ambush: boolean): void {
    const s = this.s;
    const r = s.rivals[i];
    if (armySize(r.army) === 0) r.army = { spear: 2, archer: 2, horse: 2 };
    const boss = rivalBoss(r);
    this.battle(`${rivalName(r)} ordusu`, r.army, 0.05 + r.lv * 0.005 + (ambush ? 0.05 : 0), (win) => {
      if (!win) {
        r.rel -= 5;
        for (const u of UNIT_KEYS) r.army[u] = Math.max(1, Math.floor(r.army[u] * 0.7));
        return `<p class="warn">${rivalName(r)} meydanı tuttu.</p>`;
      }
      r.army = army();
      r.defeats++;
      s.renown += 15;
      const loot = 120 + r.lv * 30;
      s.res.gold += loot;
      this.afterBattle = () => this.rivalFate(i);
      return `<p class="good">${rivalName(r)} yere serildi! +${loot} altın, +15 şöhret</p>`;
    }, boss, rivalName(r));
  }

  private rivalFate(i: number): void {
    const s = this.s;
    const r = s.rivals[i];
    this.hud.choice(
      `${rivalName(r)} dizlerinin üstünde`,
      `icons/${r.icon}`,
      `<i>"${oneOf(RIVAL_LINES.yield)}"</i><br><br>Kaderini sen belirle. Biat ettirirsen her gün haraç öder ve savaşlarda yanında olur. Öldürürsen adın korkuyla anılır ama diğer beyler sana kin besler.`,
      [
        { label: `Biat ettir · günde ${tribute(r)} altın`, cls: "go", fn: () => {
          r.status = "vassal";
          r.rel = 10;
          this.chron(`${rivalName(r)} savaş meydanında ${gen(s.hero.name)} tuğuna biat etti.`);
          this.sing("biat", { foe: rivalName(r) });
          this.hud.toast(`${rivalName(r)} artık tabin.`, "good");
        } },
        { label: "Kılıçtan geçir", cls: "bad", fn: () => {
          const dead = rivalName(r);
          s.renown += 80;
          s.mats.ruh += 3;
          for (const o of s.rivals) if (o !== r && o.status !== "dead") o.rel -= o.trait === "onurlu" ? 25 : 12;
          if (r.wed) this.addKut(-12, "dünürünü öldürdün");
          this.chron(`${dead} ${gen(s.hero.name)} kılıcıyla can verdi. Bozkırda bir tuğ daha devrildi.`);
          this.addFoe(dead, "rival");
          this.sing("biat", { foe: dead });
          this.hud.toast(`${dead} öldü. +80 şöhret, +3 Ruh Taşı. Diğer beyler tedirgin.`, "bad");
          this.succeed(r, "kilic");
          this.bondEvent("kilic");
        } },
        { label: "Serbest bırak (dostluk +30)", cls: "", fn: () => {
          r.status = "peace";
          r.rel = Math.max(r.rel, 0) + 30;
          this.hud.toast(`${rivalName(r)} cömertliğini unutmayacak.`, "good");
        } },
      ],
    );
  }

  // ---------- bey requests ----------

  reqText(r: Rival): string {
    const q = r.req;
    if (!q) return "";
    const s = this.s;
    if (q.kind === "camp") return `${s.camps[q.camp!]?.name ?? "Harami"} kampını dağıt`;
    if (q.kind === "goods") return `${q.n} ${GOODS[q.good!].name} getir (yükünde ${s.hero.cargo[q.good!] ?? 0})`;
    if (q.kind === "foe") {
      const f = s.rivals.find((x) => x.id === q.foe);
      return `${f ? rivalName(f) : "Düşman"} ordusunu yen`;
    }
    return `${CITY_NAME[q.city!]} şehrini birlikte fethet (ordusunun yarısı kuşatmana katılır)`;
  }

  reqGoto(r: Rival): { x: number; y: number } | null {
    const q = r.req;
    if (!q) return null;
    if (q.kind === "camp") return this.s.camps[q.camp!] ?? null;
    if (q.kind === "foe") return this.s.rivals.find((x) => x.id === q.foe) ?? null;
    if (q.kind === "sefer") return this.cityPos(q.city!);
    return r;
  }

  private reqDone(r: Rival): boolean {
    const q = r.req!;
    const s = this.s;
    if (q.kind === "camp") return !s.camps[q.camp!]?.alive;
    if (q.kind === "foe") {
      const f = s.rivals.find((x) => x.id === q.foe);
      return !f || f.status === "dead" || f.defeats > (q.base ?? 0);
    }
    if (q.kind === "sefer") return !!s.owned[q.city!];
    return false;
  }

  private reqNew(r: Rival): void {
    const s = this.s;
    const home = this.cityPos(r.home);
    const day = this.dayOf().day;
    const opts: BeyReq[] = [];
    const camps = s.camps.map((c, i) => ({ c, i, d: Math.hypot(c.x - home.x, c.y - home.y) })).filter((x) => x.c.alive && x.d < 1600).sort((a, b) => a.d - b.d);
    if (camps.length) opts.push({ kind: "camp", camp: camps[0].i, until: day + REQ_INFO.camp.days, gold: reqGold("camp", r.lv) });
    const good = oneOf(REQ_GOODS);
    const n = 5 + Math.floor(r.lv / 3);
    opts.push({ kind: "goods", good, n, until: day + REQ_INFO.goods.days, gold: Math.round(GOODS[good].base * n * 1.7) });
    const foes = s.rivals.filter((x) => x !== r && (x.status === "peace" || x.status === "war"));
    if (foes.length) {
      const f = oneOf(foes);
      opts.push({ kind: "foe", foe: f.id, base: f.defeats, until: day + REQ_INFO.foe.days, gold: reqGold("foe", r.lv) });
    }
    if (r.status === "ally" && s.beylik && s.hero.lv >= SIEGE_LV) {
      const cities = CITIES.filter((c) => c.id !== CAPITAL.id && !s.owned[c.id]).sort((a, b) => Math.hypot(a.x - home.x, a.y - home.y) - Math.hypot(b.x - home.x, b.y - home.y));
      if (cities.length) opts.push({ kind: "sefer", city: cities[0].id, until: day + REQ_INFO.sefer.days, gold: reqGold("sefer", r.lv) });
    }
    const q = opts.find((o) => o.kind === "sefer" && Math.random() < 0.3) ?? oneOf(opts.filter((o) => o.kind !== "sefer"));
    r.req = q;
    this.hud.toast(`${rivalName(r)} ulak yolladı: ${REQ_INFO[q.kind].name}. (Hedefler → Beyler)`, "info");
  }

  private reqTick(): void {
    const s = this.s;
    const day = this.dayOf().day;
    for (const r of s.rivals) {
      const q = r.req;
      if (!q) continue;
      if (r.status !== "ally" && r.status !== "vassal") {
        delete r.req;
        continue;
      }
      if (this.reqDone(r)) this.reqReward(r);
      else if (day > q.until) {
        delete r.req;
        r.rel -= r.status === "vassal" ? 8 : 12;
        this.hud.toast(`${rivalName(r)} isteğini yerine getirmedin; kırgın (dostluk ${Math.round(r.rel)}).`, "bad");
      }
    }
  }

  private reqReward(r: Rival): void {
    const q = r.req!;
    const s = this.s;
    delete r.req;
    s.res.gold += q.gold;
    r.rel = Math.min(100, r.rel + (q.kind === "sefer" ? 25 : 15));
    s.renown += q.kind === "sefer" ? 40 : 15;
    s.c.beyq = (s.c.beyq ?? 0) + 1;
    audio.play("quest");
    this.chron(`${gen(s.hero.name)} ${rivalName(r)} için verdiği sözü tuttu: ${REQ_INFO[q.kind].name.toLowerCase()}.`);
    this.hud.toast(`${rivalName(r)}: "Sözünü tuttun!" +${q.gold} altın, +${q.kind === "sefer" ? 40 : 15} şöhret, dostluk ${Math.round(r.rel)}`, "good");
    if (q.kind !== "goods") {
      const it = this.legendDrop(q.kind === "sefer" ? 0.4 : 0.1);
      if (it) this.hud.toast(`${rivalName(r)} hazinesinden bir armağan: ${it.name}`, "good");
    }
    saveGame(s);
  }

  deliverReq(i: number): void {
    const s = this.s;
    const r = s.rivals[i];
    const q = r?.req;
    if (!q || q.kind !== "goods" || (s.hero.cargo[q.good!] ?? 0) < q.n!) return;
    const paid = s.hero.paid[q.good!] ?? 0;
    const have = s.hero.cargo[q.good!]!;
    s.hero.paid[q.good!] = paid * ((have - q.n!) / have);
    s.hero.cargo[q.good!] = have - q.n!;
    this.reqReward(r);
  }

  dropReq(i: number): void {
    const r = this.s.rivals[i];
    if (!r?.req) return;
    delete r.req;
    r.rel -= 6;
    this.hud.toast(`${rivalName(r)} isteğini geri çevirdin (dostluk ${Math.round(r.rel)}).`, "bad");
  }

  collectCity(city: string): void {
    const o = this.s.owned[city];
    if (!o || o.coffer < 1 || this.nearCity() < 0 || CITIES[this.nearCity()].id !== city) return;
    const g = Math.floor(o.coffer);
    o.coffer -= g;
    this.s.res.gold += g;
    audio.play("coin");
    this.hud.toast(`${CITY_NAME[city]} vergisi: +${g} altın`, "good");
    saveGame(this.s);
  }

  setTax(city: string, t: 0 | 1 | 2): void {
    const o = this.s.owned[city];
    if (o) o.tax = t;
  }

  feast(city: string): void {
    const o = this.s.owned[city];
    if (!o || this.s.res.gold < FEAST_GOLD) return;
    this.s.res.gold -= FEAST_GOLD;
    o.loy = Math.min(100, o.loy + 25);
    this.addKut(3, "şölen");
    this.bondEvent("feast");
    audio.play("quest");
    this.hud.toast(`${CITY_NAME[city]} meydanında şölen! Halk adını anıyor (+25 bağlılık).`, "good");
    saveGame(this.s);
  }

  garMove(city: string, u: Unit, n: number): void {
    const o = this.s.owned[city];
    const h = this.s.hero;
    if (!o) return;
    if (n > 0) {
      const k = Math.min(n, h.army[u]);
      h.army[u] -= k;
      o.gar[u] += k;
    } else {
      const k = Math.min(-n, o.gar[u], Math.max(0, this.heroCap() - armySize(h.army)));
      o.gar[u] -= k;
      h.army[u] += k;
    }
  }

  // ---------- kurgan depths ----------

  deepTorches(): number {
    return 6 + Math.floor(this.stat("cev") / 4) + (this.s.cls === "hirsiz" ? 2 : 0) + (this.hasComp("ferhat") ? 1 : 0) + this.dperk("mesale");
  }

  dperk(id: DeepPerk): number {
    return this.s.deepPerks[id] ?? 0;
  }

  buyDeepPerk(id: DeepPerk): void {
    const p = DEEP_PERKS.find((x) => x.id === id);
    const lv = this.dperk(id);
    if (!p || lv >= p.max || this.s.seals < p.cost(lv)) return;
    this.s.seals -= p.cost(lv);
    this.s.deepPerks[id] = lv + 1;
    audio.play("level");
    this.hud.toast(`${p.name} ${lv + 1}. derece: ${p.desc(lv + 1)}`, "good");
    saveGame(this.s);
  }

  deepStarts(): number[] {
    const k = this.dperk("kestirme");
    return [1, 6, 11].filter((f, i) => i <= k && this.s.deepBest >= f);
  }

  private dGold(x: number): number {
    const r = this.deep!;
    return Math.round(x * TOMBS[r.theme].loot * (1 + 0.1 * this.dperk("hirsiz")));
  }

  private dRuh(x: number): number {
    const r = this.deep!;
    return x ? Math.max(1, Math.round(x * TOMBS[r.theme].ruh * (1 + 0.2 * this.dperk("ruhavci")))) : 0;
  }

  deepReason(i: number): string {
    const k = this.s.kurgans[i];
    if (k.alive) return "Önce taşı kır.";
    if (k.delved) return "Bu mezar boşaltıldı. Taş yeniden toplanınca kapı yine açılır.";
    if (this.s.hero.lv < 6) return "Derinliklere inmek için en az 6. seviye ol.";
    if (armySize(this.s.hero.army) < 5) return "Yanına en az 5 asker al.";
    return "";
  }

  enterDeep(i: number, start = 1): void {
    if (this.deepReason(i) || this.deep) return;
    if (!this.deepStarts().includes(start)) start = 1;
    const k = this.s.kurgans[i];
    k.delved = true;
    this.deepBest0 = this.s.deepBest;
    const theme = tombOf(i);
    const tb = TOMBS[theme];
    this.deep = { kurgan: i, theme, floor: start, torch: this.deepTorches(), gold: 0, ruh: 0, items: [], bless: this.dperk("umay"), curse: 0, greed: 1, doors: [], seals: 0 };
    this.battleLock = true;
    this.target = null;
    this.s.hero.path = null;
    audio.play("story");
    this.hud.story(
      tb.name,
      "map/kurgan",
      `Kırık taşın altında, toprağın içine inen dar bir merdiven buldun. Aşağıdan soğuk bir nefes yükseliyor.<br><br><b>${tb.name}</b>: ${tb.desc}${start > 1 ? `<br>Gizli kestirmeden doğrudan <b>${start}. kata</b> indin.` : ""}<br><br>Her kapı bir meşale yakar. Meşalen biterse karanlık seni yukarı kusar. Her <b>5. katta</b> bir bekçi seni bekler. İstediğin an ganimetinle yukarı çıkabilirsin; ama yenilirsen topladığın altının ve Ruh Taşlarının yarısını, bütün eşyaları kaybedersin.<br><br>Yanında <b>${this.deep.torch} meşale</b> var. En derin inişin: <b>${this.s.deepBest ? `${this.s.deepBest}. kat` : "henüz yok"}</b>.`,
      "Aşağı in",
    );
    this.deepRoom();
  }

  private deepStatus(): string {
    const r = this.deep!;
    const mods = [r.bless ? `<b class="cheap">Umay lütfu ×${r.bless}</b>` : "", r.curse ? `<b class="dear">Erlik laneti ×${r.curse}</b>` : "", r.greed > 1 ? `ganimet ×${r.greed.toFixed(1)}` : ""].filter(Boolean).join(" · ");
    return `<small class="dim">${TOMBS[r.theme].name}</small><br><b>${r.torch}</b> meşale · <b>${r.gold}</b> altın · <b>${r.ruh}</b> Ruh Taşı · <b>${r.items.length}</b> eşya · <b>${r.seals}</b> Kemik Mühür<br>Can ${Math.round(this.s.hero.hp)}/${this.maxHp()} · ${armySize(this.s.hero.army)} asker${mods ? `<br>${mods}` : ""}`;
  }

  private deepRoom(): void {
    const r = this.deep;
    if (!r) return;
    if (r.torch <= 0) return this.deepExit("Son meşalen de söndü. Karanlıkta duvarları yoklayarak yukarı çıktın.");
    const tl = TOMBS[r.theme].lore;
    const lore = r.floor % 2 ? tl[(r.floor + r.kurgan) % tl.length] : DEEP_LORE[(r.floor * 7 + r.kurgan) % DEEP_LORE.length];
    const exit = { label: `Yukarı çık · ganimetin seninle`, cls: "", fn: () => this.deepExit("Ganimetini sırtlayıp gün ışığına çıktın.") };
    if (r.floor % 5 === 0) {
      const b = deepBoss(r.floor, r.theme);
      this.hud.choice(`${r.floor}. Kat · Bekçi`, b.icon, `<i>${b.lore}</i><br><br>${this.deepStatus()}`, [
        { label: `${b.name} ile dövüş · %${Math.round(this.deepOdds(true) * 100)}`, cls: "red", fn: () => this.deepFight(true) },
        exit,
      ]);
      return;
    }
    const pool = DOOR_KEYS.filter((d) => d !== "tuccar" || r.floor >= 3);
    const doors: DoorKind[] = [];
    const tw = TOMBS[r.theme].w;
    const dw = (d: DoorKind) => tw[d] ?? DOORS[d].w;
    while (doors.length < 3) {
      let x = Math.random() * pool.reduce((a, d) => a + dw(d), 0);
      const d = pool.find((k) => (x -= dw(k)) < 0) ?? "savas";
      if (!doors.includes(d)) doors.push(d);
    }
    r.doors = doors;
    this.hud.choice(`${r.floor}. Kat`, "map/kurgan", `<i class="dim">${lore}</i><br><br>${this.deepStatus()}`, [
      ...doors.map((d) => ({ label: `<span>${DOORS[d].name}</span><small>${DOORS[d].hint}</small>`, cls: `door ${d === "savas" ? "red" : "go"}`, fn: () => this.deepDoor(d) })),
      exit,
    ]);
  }

  deepOdds(boss: boolean): number {
    const r = this.deep!;
    const base = this.s.kurgans[r.kurgan].tier;
    return this.odds(deepGuard(r.floor, base, () => 0.5), this.deepBonus(), boss ? deepBoss(r.floor, r.theme) : null);
  }

  private deepBonus(): number {
    const r = this.deep!;
    return 0.04 * r.floor + 0.08 * r.curse - 0.06 * r.bless + TOMBS[r.theme].foe - 0.03 * this.dperk("kalkan");
  }

  private deepNext(txt: string, icon = "map/kurgan"): void {
    const r = this.deep;
    if (!r) return;
    r.floor++;
    r.seals++;
    this.s.c.floors++;
    if (r.floor - 1 > this.s.deepBest) this.s.deepBest = r.floor - 1;
    const cold = TOMBS[r.theme].cold;
    if (cold) {
      const dmg = Math.round(this.maxHp() * cold);
      this.s.hero.hp = Math.max(1, this.s.hero.hp - dmg);
      txt += `<br><span class="dear">Dondurucu soğuk iliklerine işledi: −${dmg} can.</span>`;
    }
    this.hud.choice(`${r.floor - 1}. Kat geçildi`, icon, `${txt}<br><br>${this.deepStatus()}`, [{ label: "Daha derine", cls: "go", fn: () => this.deepRoom() }]);
  }

  private deepDoor(d: DoorKind): void {
    const r = this.deep;
    if (!r) return;
    r.torch--;
    const h = this.s.hero;
    const t = deepTier(r.floor, this.s.kurgans[r.kurgan].tier);
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    if (d === "savas") return this.deepFight(false);
    if (d === "hazine") {
      if (Math.random() < 0.2 * (1 - 0.5 * this.dperk("tuzak")) * (r.theme === "hakan" ? 1.5 : 1)) {
        const dmg = Math.round(this.maxHp() * 0.22);
        h.hp = Math.max(1, h.hp - dmg);
        const torch = Math.random() < 0.5 && r.torch > 0;
        if (torch) r.torch--;
        return this.deepNext(`<b class="dear">Tuzak!</b> Sandığı açınca tavandan zehirli oklar yağdı. −${dmg} can${torch ? ", bir meşale de söndü" : ""}.`, "icons/chest");
      }
      const gold = this.dGold(30 * t * t * r.greed * this.stealMult());
      const ruh = this.dRuh(Math.random() < 0.5 ? 1 + Math.floor(t / 2) : 0);
      r.gold += gold;
      r.ruh += ruh;
      let txt = `Hakanın mezar hazinesi! +${gold} altın${ruh ? `, +${ruh} Ruh Taşı` : ""}.`;
      if (Math.random() < 0.35) {
        const it = rollItem(this.s.nextId++, Math.min(5, Math.max(1, Math.round(t))), this.cls(), 0.15);
        r.items.push(it);
        txt += `<br>Sandığın dibinde: <b class="r${it.rar}">${it.name}</b>`;
      }
      if (Math.random() < 0.25) {
        r.torch++;
        txt += "<br>Bir de yağlı meşale buldun (+1).";
      }
      return this.deepNext(txt, "icons/chest");
    }
    if (d === "pinar") {
      const heal = this.maxHp() - h.hp;
      h.hp = this.maxHp();
      r.torch++;
      return this.deepNext(`Buz gibi suyu avuçlayıp içtin; yaraların kapandı. +${Math.round(heal)} can, meşalelerini kuruttun (+1).`, "icons/healer");
    }
    if (d === "tuccar") {
      const tp = 60 + r.floor * 15;
      const ip = 4 + Math.floor(r.floor / 3);
      const nx = () => this.deepNext("Tüccar fenerini kısıp karanlığa karıştı.", "icons/coins");
      this.hud.choice("Yeraltı Tüccarı", "icons/coins", `Yüzü görünmeyen, sesi taş gibi bir yaşlı: "Ölüler altın harcamaz, yolcu. Sen harcarsın."<br><br>${this.deepStatus()}`, [
        { label: `2 meşale · ${tp} altın (ganimetten)`, cls: r.gold >= tp ? "go" : "off", fn: () => ((r.gold -= tp), (r.torch += 2), nx()) },
        { label: `Mühürlü sandık · ${ip} Ruh Taşı`, cls: r.ruh >= ip ? "go" : "off", fn: () => {
          r.ruh -= ip;
          const it = rollItem(this.s.nextId++, Math.min(5, Math.round(t) + 1), this.cls(), 0.35);
          r.items.push(it);
          this.deepNext(`Sandıktan <b class="r${it.rar}">${it.name}</b> çıktı.`, "icons/coins");
        } },
        { label: "Umay'ın duası · 1 meşale", cls: r.torch >= 2 ? "go" : "off", fn: () => ((r.torch -= 1), r.bless++, nx()) },
        { label: "Geç", cls: "", fn: nx },
      ]);
      return;
    }
    const roll = r.theme === "saman" ? Math.random() * 0.7 : r.theme === "alp" ? 0.35 + Math.random() * 0.65 : Math.random();
    if (roll < 0.34) {
      const q = pick(RIDDLES);
      const opts = [q.a, ...q.wrong].sort(() => Math.random() - 0.5);
      this.hud.choice("Taş Ozan", "icons/ruh", `Kemik kopuzlu bir hayalet yolunu kesti: "Bilirsen geçersin, bilemezsen bedel ödersin."<br><br><i>"${q.q}"</i>`, opts.map((o) => ({
        label: o,
        cls: "go",
        fn: () => {
          if (o === q.a) {
            const ruh = this.dRuh(2 + Math.floor(r.floor / 3));
            r.ruh += ruh;
            r.bless++;
            this.deepNext(`"Doğru, ${o}." Ozan kopuzunu çalıp kayboldu. <b class="cheap">Umay'ın lütfu</b> üstünde. +${ruh} Ruh Taşı.`, "icons/ruh");
          } else {
            r.curse++;
            this.deepNext(`"Yanlış. Cevap ${q.a} idi." Hayalet çığlık atarak içine girdi. <b class="dear">Erlik laneti</b>: düşmanlar daha güçlü.`, "icons/ruh");
          }
        },
      })));
      return;
    }
    if (roll < 0.58) {
      this.hud.choice("Erlik'in Teklifi", "icons/ruh", `Kara bir duman şekillendi: "Altın mı istiyorsun, yolcu? Al. Ama karşılığında askerlerin biraz daha çok kanayacak."`, [
        { label: "Kabul et · ganimet ×1.4, Erlik laneti", cls: "bad", fn: () => ((r.greed = +(r.greed + 0.4).toFixed(1)), r.curse++, this.deepNext("Duman ciğerlerine doldu. Gözlerin altın rengine döndü.", "icons/ruh")) },
        { label: "Reddet", cls: "", fn: () => this.deepNext("\"Akıllı yolcu…\" Duman dağıldı.", "icons/ruh") },
      ]);
      return;
    }
    if (roll < 0.78) {
      const cost = Math.round(this.maxHp() * 0.3);
      this.hud.choice("Kanlı Sunak", "icons/ruh", `Kurt başlı bir sunak. Üstünde kurumuş kan. Yazıt: "Kanını veren, Umay'ın kanadı altına girer."`, [
        { label: `Kanını ver · −${cost} can, Umay lütfu`, cls: h.hp > cost + 5 ? "go" : "off", fn: () => ((h.hp -= cost), r.bless++, this.deepNext("Sunak kanını içti; sıcak bir el omzuna dokundu.", "icons/ruh")) },
        { label: "Geç", cls: "", fn: () => this.deepNext("Sunağın önünden başını eğerek geçtin.", "icons/ruh") },
      ]);
      return;
    }
    const u = pick(UNIT_KEYS);
    const n = 2 + Math.floor(Math.random() * (2 + r.floor / 2));
    h.army[u] += n;
    this.deepNext(`Duvara zincirli ölü alplerin ruhları uyandı: "Bizi buradan çıkar, kılıcımız senindir." <b class="cheap">+${n} ${UNITS[u].name}</b> birliğine katıldı.`, "icons/soldier");
  }

  private deepFight(boss: boolean): void {
    const r = this.deep!;
    const base = this.s.kurgans[r.kurgan].tier;
    const guard = deepGuard(r.floor, base);
    const b = boss ? deepBoss(r.floor, r.theme) : null;
    const t = deepTier(r.floor, base);
    const h = this.s.hero;
    if (armySize(h.army) === 0 && h.hp < this.maxHp() * 0.15) return this.deepExit("Kılıcını kaldıracak gücün kalmadı. Duvarlara tutuna tutuna yukarı çıktın.");
    let won = false;
    let txt = "";
    this.afterBattle = () => {
      if (!this.deep) return;
      if (won) this.deepNext(txt, b?.icon ?? "icons/swords");
      else this.deepExit("", true);
    };
    this.battle(`${r.floor}. Kat · ${b ? b.name : "Taş askerler"}`, guard, this.deepBonus(), (win) => {
      won = win;
      if (!win) return "";
      const gold = this.dGold((boss ? 90 : 18) * t * t * r.greed * this.stealMult());
      const ruh = this.dRuh((boss ? 4 + r.floor / 2 : Math.random() < 0.45 ? 1 + t / 3 : 0) | 0);
      if (boss) r.seals += 3;
      r.gold += gold;
      r.ruh += ruh;
      txt = `${b ? `<b>${b.name}</b> yere yığıldı!` : "Taş askerler toza dönüştü."} +${gold} altın${ruh ? `, +${ruh} Ruh Taşı` : ""}.`;
      if (Math.random() < (boss ? 1 : 0.22)) {
        const it = rollItem(this.s.nextId++, Math.min(5, Math.max(1, Math.round(t) + (boss ? 1 : 0))), this.cls(), boss ? 0.4 : 0.1);
        r.items.push(it);
        txt += `<br>Ganimet: <b class="r${it.rar}">${it.name}</b>`;
      }
      if (boss) {
        r.torch += 3;
        this.s.mats.parsomen++;
        txt += "<br>+1 Kutsal Parşömen · bekçinin kandilinden +3 meşale";
      }
      const lg = this.legendDrop((boss ? 0.12 + r.floor * 0.012 : 0.006 * r.floor) * (r.theme === "ejder" ? 2 : 1));
      if (lg) txt += `<br>Efsane: <b class="r4">${lg.name}</b>`;
      return txt;
    }, b, "Taş askerler");
  }

  private deepFlee(): void {
    const r = this.deep;
    if (!r) return;
    r.gold = Math.round(r.gold * 0.7);
    this.deepExit("Kılıçlar çekilmeden geri döndün ve merdivenlere koştun. Kaçarken altının bir kısmı döküldü.");
  }

  private deepExit(txt: string, lost = false): void {
    const r = this.deep;
    if (!r) return;
    this.deep = null;
    this.afterBattle = null;
    const s = this.s;
    const floors = r.floor - 1;
    if (lost) {
      r.gold = Math.floor(r.gold / 2);
      r.ruh = Math.floor(r.ruh / 2);
      r.seals = Math.floor(r.seals / 2);
      r.items = [];
    }
    this.gain({ gold: r.gold });
    s.mats.ruh += r.ruh;
    s.seals += r.seals;
    s.hero.bag.push(...r.items);
    const renown = Math.floor(floors * 1.5);
    s.renown += renown;
    this.battleLock = false;
    saveGame(s);
    const best = floors > this.deepBest0;
    if (best && floors >= 5 && Math.floor(floors / 5) > Math.floor(this.deepBest0 / 5)) this.chron(`${s.hero.name} Kurgan Derinliklerinde ${floors}. kata indi${lost ? " ve karanlık onu geri kustu" : ", gün ışığına ganimetle döndü"}. Bu kadar derine inen az görülmüştür.`);
    this.hud.story(
      lost ? "Derinlikler seni yuttu" : "Gün ışığı",
      lost ? "icons/ruh" : "map/kurgan",
      `${lost ? `${r.floor}. katta yenildin. Yoldaşların seni yukarı sürükledi; eşyalar karanlıkta kaldı.` : txt}<br><br>İndiğin kat: <b>${floors}</b>${best ? ` <b class="cheap">· yeni rekor!</b>` : ` · rekorun ${s.deepBest}`}<br>Getirdiğin: <b>+${r.gold} altın · +${r.ruh} Ruh Taşı · +${r.seals} Kemik Mühür · ${r.items.length} eşya · +${renown} şöhret</b>${r.items.map((it) => `<br><b class="r${it.rar}">${it.name}</b>`).join("")}`,
      "Devam",
    );
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
    this.addRep(factionOf(c.to), 10, "emanet");
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
      this.repNear(v.x, v.y, 15, "köy savunması");
      const gold = Math.round((30 + armyPower(r.army)) * this.stealMult());
      this.gain({ gold, food: 80 });
      this.s.renown += 6;
      return `Köy kurtarıldı! Köylüler sana minnettar: +20 bağlılık, gönüllüler hazır, +${gold} altın, +80 yiyecek, +6 şöhret`;
    });
  }

  // ---------- story & companions ----------

  chapter(): Chapter | null {
    const s = this.s;
    if (!s.story.done) return CHAPTERS[s.story.ch] ?? null;
    if (!s.act2.done) return ACT2[s.act2.ch] ?? null;
    return s.act3.ending ? null : (ACT3[s.act3.ch] ?? null);
  }

  sagaLabel(): string {
    const s = this.s;
    if (s.act2.done) return `Gök Tengri Destanı · Bölüm ${s.act3.ch + 1}/${ACT3.length}`;
    return s.story.done ? `Erlik Destanı · Bölüm ${s.act2.ch + 1}/${ACT2.length}` : `Kara Tamga Destanı · Bölüm ${s.story.ch + 1}/${CHAPTERS.length}`;
  }

  private placePeak(): void {
    const s = this.s;
    if (s.act3.peak) return;
    const k = this.cityPos("kashgar");
    let spot = { x: k.x - 120, y: k.y - 300 };
    for (let i = 0; i < 60; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const d = 300 + Math.random() * 260;
      const x = k.x + Math.cos(a) * d;
      const y = k.y + Math.sin(a) * d;
      if (x > 80 && y > 80 && x < W - 80 && y < H - 80 && this.cellCost(x, y) < 3 && (!s.act2.gate || Math.hypot(x - s.act2.gate.x, y - s.act2.gate.y) > 250)) {
        spot = { x, y };
        break;
      }
    }
    s.act3.peak = spot;
    this.reveal(spot.x, spot.y, 8);
  }

  peakOdds(): number {
    return this.odds(PEAK_GUARD, 0.4, KOK_BORU);
  }

  climbPeak(): void {
    const s = this.s;
    if (!s.act3.peak || s.act3.ch !== 2) return;
    this.battle("Tengri Dağı · Gök Bekçileri", PEAK_GUARD, 0.4, (win) => {
      if (!win) return "Kök Börü'nün ulumasıyla çığ koptu; ordun eteklere savruldu. Güçlen ve yeniden tırman.";
      s.act3.ch = 3;
      s.renown += 200;
      this.addXp(2500);
      this.chron(`${s.hero.name} Tengri Dağı'nın zirvesinde Kök Börü'nün karşısında durdu; kurt başını eğdi.`);
      this.endingChoice();
      return "Kök Börü başını eğdi. Zirvede Kut seni bekliyor!";
    }, KOK_BORU, "Gök Bekçileri");
  }

  endingChoice(): void {
    const s = this.s;
    if (s.act3.ch !== 3 || s.act3.ending) return;
    this.hud.choice(
      "Kut'un Sahibi",
      "ruh",
      `Zirvede rüzgâr sustu. Buzun içinde mavi bir alev gibi Kut duruyor; içinde bozkırın bütün sesleri: at kişnemeleri, ninniler, kılıç şakırtıları.<br><br>Korkut arkandan fısıldadı: <i>"Ne seçersen seç, ${s.hero.name}, ozanlar bunu bin yıl söyleyecek."</i>`,
      ENDINGS.map((e) => {
        const why = e.why?.(this);
        return { label: why ? `${e.label} (${why})` : e.label, cls: why ? "off" : e.id === "tengri" ? "red" : "go", fn: () => this.chooseEnding(e.id) };
      }).concat([{ label: "Henüz değil, düşüneceğim", cls: "", fn: () => {} }]),
    );
  }

  chooseEnding(id: string): void {
    const s = this.s;
    const e = endingOf(id);
    if (!e || s.act3.ch !== 3 || s.act3.ending || e.why?.(this)) return;
    s.act3.ending = id;
    s.act3.ch = ACT3.length;
    s.renown += 500;
    this.gain({ gold: 25000 });
    if (id === "kagan") {
      for (const r of s.rivals) if (r.status === "ally" || r.status === "peace") r.status = "vassal";
    } else if (id === "hurriyet") {
      for (const v of s.villages) v.rep = 100;
      for (const o of Object.values(s.owned)) if (o) o.loy = 100;
    } else if (id === "ozan") {
      for (const f of FACTION_KEYS) s.rep[f] = Math.min(2000, this.rep(f) + 300);
      for (const r of s.rivals) if (r.status === "war") r.status = "peace";
    } else if (id === "tengri") {
      s.mats.ruh -= 50;
      s.hero.points += 20;
      for (const r of s.rivals) if (r.status !== "dead" && r.status !== "vassal") r.status = "war";
    }
    const it = uniqueItem(s.nextId++, this.cls(), UNIQUES[Math.floor(Math.random() * UNIQUES.length)], 5);
    this.chron(`${s.hero.name} Tengri Dağı'nda Kut'un kaderini seçti: ${e.name}.`);
    this.sing("son", { foe: e.name });
    audio.play("level");
    const fresh = recordEnding({ name: s.hero.name, ending: id, day: this.dayOf().day, lv: s.hero.lv, at: Date.now() });
    const perk = LEGACY_PERKS[id];
    const legacyNote = fresh ? `<br><br>Miras açıldı: <b>${perk.name}</b> (${perk.desc}). Bundan sonraki bütün destanlarında geçerli.` : "";
    this.hud.story(`Son · ${e.name}`, e.img, `${e.text(this)}<br><br>${this.epilogue()}<br><br><b>+25000 altın · +500 şöhret · Destan ganimeti: ${it.name}</b>${legacyNote}`, "Efsane sürüyor");
    this.gainLegend(it);
    saveGame(s);
  }

  epilogue(): string {
    const s = this.s;
    const lines: string[] = [];
    const owned = Object.keys(s.owned).length;
    if (owned) lines.push(`${owned} şehir ${gen(s.hero.name)} tuğu altında.`);
    if (s.kagan) lines.push("Kurultay onu Kağan seçti.");
    if (s.c.voyages) lines.push(`Gemileri Hazar'da ${s.c.voyages} sefer yaptı.`);
    if (s.comps.length) lines.push(`Yoldaşları: ${s.comps.map((c) => COMP_BY_ID[c as CompId].name).join(", ")}.`);
    if (s.c.rescued) lines.push(`${s.c.rescued} esiri zincirden kurtardı.`);
    const fam = s.family;
    if (fam?.spouse) {
      const heir = fam.kids.find((k) => k.son) ?? fam.kids[0];
      lines.push(`${fam.spouse.name} Hatun ile kurduğu hanedan ${fam.kids.length ? `${fam.kids.length} çocukla büyüdü; tuğu ${heir.name} devraldı.` : "varissiz kaldı."}`);
    }
    if (s.songs?.length) lines.push(`Ozanlar onun için ${s.songs.length} destan yaktı.`);
    lines.push(`Destan ${this.dayOf().day}. günde tamamlandı.`);
    return `<i>${lines.join(" ")}</i>`;
  }

  act2Ritual(fight: boolean): void {
    const s = this.s;
    if (!s.story.done || s.act2.ch !== 3) return;
    if (!fight) {
      if (s.mats.ruh < 30 || s.mats.parsomen < 3) return;
      s.mats.ruh -= 30;
      s.mats.parsomen -= 3;
      this.chron(`${s.hero.name} otuz esir ruhunu Umay'a geri verdi. Kaşgar'ın göğünde bir gece boyunca mor yıldızlar kaydı.`);
      this.storyAdvance();
      return;
    }
    this.battle("Umay Kam'ın ateşi", SHADE_GUARD, 0.15, (win) => {
      if (!win) return "Gölge seni ateşten dışarı fırlattı. Güçlenip yeniden dene.";
      this.chron(`${s.hero.name} Kaşgar'da, kamın ateşinin içinde Erlik'in gölgesini parçaladı.`);
      this.storyAdvance();
      return "Erlik'in gölgesi dumana döndü!";
    }, ERLIK_SHADE, "Gölge ruhlar");
  }

  private placeGate(): void {
    const s = this.s;
    if (s.act2.gate) return;
    const k = this.cityPos("kashgar");
    let spot = { x: k.x, y: k.y + 260 };
    for (let i = 0; i < 40; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const d = 380 + Math.random() * 320;
      const x = k.x + Math.cos(a) * d;
      const y = k.y + Math.sin(a) * d;
      if (x > 80 && y > 80 && x < W - 80 && y < H - 80 && this.cellCost(x, y) < 3) {
        spot = { x, y };
        break;
      }
    }
    s.act2.gate = spot;
    this.reveal(spot.x, spot.y, 8);
  }

  gateOdds(): number {
    return this.odds(GATE_GUARD, 0.35, ERLIK);
  }

  attackGate(): void {
    const s = this.s;
    if (!s.act2.gate || s.act2.done) return;
    this.battle("Erlik'in Kapısı", GATE_GUARD, 0.35, (win) => {
      if (!win) return "Erlik'in karanlığı seni yukarı kustu. Beylerini, kardeşlerini ve ordunu topla; yeniden in.";
      s.act2.done = true;
      s.act2.ch = ACT2.length;
      s.renown += 300;
      s.mats.ruh += 60;
      s.mats.parsomen += 8;
      this.gain({ gold: 15000 });
      const u = UNIQUES[Math.floor(Math.random() * UNIQUES.length)];
      const it = uniqueItem(s.nextId++, this.cls(), u, 5);
      this.gainLegend(it);
      for (const k of s.kurgans) k.respawnAt = Math.min(k.respawnAt, this.now + 1000);
      this.chron(`Yerin dokuz kat altında ${s.hero.name}, Erlik Han'ı kendi tahtında yendi. Zincir yeniden kenetlendi; bozkırın üstünde gök bir kez daha mavi.`);
      this.sing("destan", { foe: "Erlik Han" });
      this.hud.story(
        "Erlik Destanı tamamlandı",
        this.face(),
        `Erlik Han'ın kara tahtı çatırdayarak yarıldı. Dokuz kat karanlık bir çığlıkla yerin dibine çekildi; zincirler yeniden kenetlendi.<br><br>Yukarı çıktığında bütün beyler kapının önünde diz çökmüştü. Korkut kopuzunu aldı ve ilk kez senin destanını söyledi:<br><br><i>"Bir köle doğdu Semerkant'ta, demir halka boynunda… Erlik'i tahtından indirdi, bozkıra göğü geri verdi."</i><br><br><b>${s.hero.name}, Gök Tuğlu Han</b>.<br><br>Ama bozkır hiç uyumaz: beyler, reisler, kervanlar ve derinlikler seni bekliyor. Destanın bitti; efsanen sürüyor.`,
        "Efsane sürüyor",
      );
      const a0 = ACT3[0];
      this.hud.story(`Gök Tengri Destanı · Bölüm 1: ${a0.title}`, a0.img, `${a0.intro}<br><br><b>Hedef:</b> ${a0.goal}`, "Yola çık");
      return `Erlik Han yenildi! +15000 altın, +300 şöhret, +60 Ruh Taşı, +8 Parşömen<br>Destan ganimeti: <b class="r4">${it.name}</b>`;
    }, ERLIK, "Erlik'in ordusu");
  }

  chapterReady(): boolean {
    const ch = this.chapter();
    return !!ch && this.s.free && !ch.req?.(this);
  }

  storyAdvance(): void {
    const ch = this.chapter();
    if (!ch) return;
    if (ch.outro) this.hud.story(ch.outro.title, ch.outro.img, ch.outro.text(this), "Devam");
    const act2 = this.s.story.done;
    const act3 = this.s.act2.done;
    if (act3) {
      this.s.act3.ch++;
      if (this.s.act3.ch === 2) this.placePeak();
    } else if (act2) {
      this.s.act2.ch++;
      if (this.s.act2.ch === 4) this.placeGate();
    } else {
      this.s.story.ch++;
      if (this.s.story.ch === 4) this.placeFort();
    }
    const n = act3 ? this.s.act3.ch : act2 ? this.s.act2.ch : this.s.story.ch;
    const next = this.chapter();
    if (next) this.hud.story(`${act3 ? "Gök Tengri Destanı · " : act2 ? "Erlik Destanı · " : ""}Bölüm ${n + 1}: ${next.title}`, next.img, `${next.intro}<br><br><b>Hedef:</b> ${next.goal}`, "Yola çık");
    this.addXp((act3 ? 300 : act2 ? 120 : 40) * n);
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
      const it = uniqueItem(s.nextId++, this.cls(), UNIQUES[0], 5);
      this.gainLegend(it);
      this.chron(`Kara Tamga Kalesi düştü. Kara Han'ın kılıcı kırıldı, esirlerin ruhları göğe ağdı. Ozanlar o gün ${gen(s.hero.name)} adını ilk kez türküye kattı.`);
      this.sing("destan", { foe: "Kara Han" });
      this.hud.story(
        "Destan tamamlandı: Kara Tamga yıkıldı",
        this.face(),
        `Kara Han'ın kılıcı elinden düştü. Kalenin zindanlarında annenle küçük Ertuğrul'u buldun; zincirlerini kendi ellerinle kırdın. Esirlerin ruhları mor bir ışık selinde göğe yükseldi ve bozkırdaki bütün Kurgan Taşları bir an için sustu.<br><br>Ozanlar artık senin adını söylüyor: <b>${s.hero.name}, İpek Yolu'nun Kurtarıcısı</b>.<br><br>Ama Kara Han'ın kılıcını alan herkes bilir: bozkırda boşalan taht uzun süre boş kalmaz. Yolların, beyliğin ve ordun seni bekliyor.<br><br><b>Yeni hedef:</b> İpek Yolu'nun ${LORD_SERAIS} şehrinde kervansaray kurarak yolun efendisi ol.`,
        "Yola devam",
      );
      const a0 = ACT2[0];
      this.hud.story(`Erlik Destanı · Bölüm 1: ${a0.title}`, a0.img, `${a0.intro}<br><br><b>Hedef:</b> ${a0.goal}`, "Yola çık");
      return `Kara Han yenildi! +5000 altın, +100 şöhret, +25 Ruh Taşı, +3 Parşömen<br>Destan ganimeti: <b class="r4">${it.name}</b>`;
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
    const done = this.s.cqDone ?? [];
    for (const id of this.s.comps) {
      const c = COMP_BY_ID[id as CompId];
      const k2 = done.includes(id) ? SWORN_MULT : 1;
      if (c) for (const k of Object.keys(c.mods) as (keyof CompMods)[]) m[k] += (c.mods[k] ?? 0) * k2;
    }
    const om = this.s.origin ? ORIGIN_BY_ID[this.s.origin]?.mods : null;
    if (om) for (const k of Object.keys(om) as (keyof CompMods)[]) m[k] += om[k] ?? 0;
    return m;
  }

  bond(id: CompId): number {
    return this.s.bond?.[id] ?? BOND_START;
  }

  bondEvent(k: BondEvent): void {
    for (const id of [...this.s.comps] as CompId[]) {
      const d = BOND_FX[k][id];
      if (d) this.bondAdd(id, d);
    }
  }

  private bondAdd(id: CompId, d: number): void {
    const b = (this.s.bond ??= {});
    const v = Math.max(-100, Math.min(100, this.bond(id) + d));
    b[id] = v;
    const c = COMP_BY_ID[id];
    if (Math.abs(d) >= 3) this.hud.toast(`${c.name}: ${d > 0 ? tr("bunu sevdi") : tr("bundan hoşlanmadı")} (${d > 0 ? "+" : ""}${d})`, d > 0 ? "good" : "bad");
    if (v <= BOND_LEAVE && c.hire && this.hasComp(id)) {
      this.s.comps = this.s.comps.filter((x) => x !== id);
      this.chron(`${c.name}, ${this.s.hero.name}'in yolundan ayrıldı.`);
      this.hud.story(`${c.name} ayrıldı`, c.icon, `${c.name} eşyalarını topladı: "Senin yolun benim yolum değil artık." Arkasına bakmadan gitti.`, "Hoşça kal");
    }
  }

  private cqWait = 0;

  private bondDaily(): void {
    const s = this.s;
    if (s.cq || !s.free) return;
    const day = this.dayOf().day;
    for (const id of s.comps as CompId[]) {
      const q = COMP_QUESTS[id];
      if (!q || (s.cqDone ?? []).includes(id) || this.bond(id) < BOND_QUEST || (s.cqAsk?.[id] ?? -1) > day) continue;
      const c = COMP_BY_ID[id];
      this.hud.choice(q.title, c.icon, `${q.offer}<br><br><small class="dim">${tr("Kişisel görev")} · ${CITY_NAME[q.steps[0].city]}</small>`, [
        { label: tr("Yanındayım"), cls: "go", fn: () => {
          s.cq = { id, step: 0 };
          this.hud.toast(`${q.title}: ${CITY_NAME[q.steps[0].city]}`, "info");
        } },
        { label: tr("Şimdi olmaz"), cls: "", fn: () => {
          (s.cqAsk ??= {})[id] = day + 3;
          this.bondAdd(id, -2);
        } },
      ]);
      return;
    }
  }

  cqTarget(): Target | null {
    const cq = this.s.cq;
    const st = cq && COMP_QUESTS[cq.id]?.steps[cq.step];
    if (!st) return null;
    const i = CITIES.findIndex((c) => c.id === st.city);
    return i < 0 ? null : i === CAP_I ? { kind: "capital" } : { kind: "city", i };
  }

  private cqTick(dt: number): void {
    const s = this.s;
    if (!s.cq) return;
    this.cqWait -= dt;
    if (this.cqWait > 0 || this.battleLock || this.hud.modal()) return;
    this.cqWait = 1;
    const q = COMP_QUESTS[s.cq.id];
    const st = q?.steps[s.cq.step];
    if (!q || !st || !this.hasComp(q.id)) {
      s.cq = null;
      return;
    }
    const ci = CITIES.findIndex((c) => c.id === st.city);
    if (this.nearCity() !== ci) return;
    this.cqWait = 25;
    const c = COMP_BY_ID[q.id];
    if (!st.choices) {
      this.hud.story(q.title, c.icon, st.text, st.btn ?? tr("Devam"));
      s.cq.step++;
      const nx = q.steps[s.cq.step];
      if (nx && nx.city === st.city) this.cqWait = 1.5;
      return;
    }
    this.hud.choice(q.title, c.icon, st.text, st.choices.map((ch) => {
      const poor = (ch.fx.gold ?? 0) < 0 && s.res.gold < -(ch.fx.gold ?? 0);
      return { label: ch.label, cls: poor ? "off" : "go", fn: () => {
        if (!ch.fight) return this.cqFinish(q, ch);
        this.battle(q.title, ch.fight(s.hero.lv), 0, (win) => {
          if (!win) return `<p class="warn">${tr("Geri çekildin. Yoldaşın seni bekliyor.")}</p>`;
          this.afterBattle = () => this.cqFinish(q, ch);
          return `<p class="good">${tr("Zafer!")}</p>`;
        }, null, CITY_NAME[st.city]);
      } };
    }));
  }

  private cqFinish(q: CompQuest, ch: CqChoice): void {
    const s = this.s;
    const fx = this.roadFx(ch.fx);
    this.bondAdd(q.id, ch.bond);
    s.cqDone = [...(s.cqDone ?? []), q.id];
    s.cq = null;
    const c = COMP_BY_ID[q.id];
    this.chron(`${c.name} ile "${q.title}" yolculuğu tamamlandı; artık kan kardeşi.`);
    this.hud.story(`${q.title} · ${tr("tamamlandı")}`, c.icon, `${ch.text}${fx}<br><br><b class="cheap">${tr("Kan kardeşi")}:</b> ${q.sworn}`, tr("Devam"));
    saveGame(s);
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

  hire(u: Unit, n: number, city = ""): void {
    if (!this.s.free) return;
    const room = this.heroCap() - armySize(this.s.hero.army);
    const k = Math.min(n, room);
    if (k <= 0) return;
    if (!this.pay({ gold: (city ? this.eliteCost(city, u) : this.hireCost(u)) * k })) {
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
    const it = this.legendDrop(0.03 * tier) ?? this.drop(tier, 0.7);
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

  isNight(): boolean {
    const { t } = this.dayOf();
    return t > 0.32 && t < 0.68;
  }

  season(): SeasonId {
    return seasonOf(this.dayOf().day);
  }

  sea(): Season {
    return SEASONS[this.season()];
  }

  seasonLeft(): number {
    const t = this.s.time / DAY_SEC;
    return (SEASON_DAYS - (t % SEASON_DAYS)) * DAY_SEC;
  }

  private achTick(dt: number): void {
    this.achT -= dt;
    if (this.achT > 0) return;
    this.achT = 2;
    for (const a of ACHIEVEMENTS) {
      if (this.ach.has(a.id)) continue;
      let ok = false;
      try {
        ok = a.done(this.s);
      } catch {
        ok = false;
      }
      if (!ok) continue;
      this.ach.add(a.id);
      storeUnlocked(this.ach);
      steamUnlock(a.id);
      audio.play("level");
      this.hud.toast(`🏆 Başarım: ${a.name} · ${a.desc}`, "good");
    }
    const cx = (this.s.bitig ??= []);
    for (const e of CODEX) {
      if (cx.includes(e.id)) continue;
      let ok = false;
      try {
        ok = e.open(this);
      } catch {
        ok = false;
      }
      if (!ok) continue;
      cx.push(e.id);
      this.hud.toast(`📜 ${tr("Bitig'e yeni sayfa")}: ${codexTitle(e)}`, "info");
    }
  }

  achDone(id: string): boolean {
    return this.ach.has(id);
  }

  private seasonTick(): void {
    const se = this.season();
    audio.setMood(se, this.isNight());
    if (se === this.lastSeason) return;
    const first = this.lastSeason === null;
    this.lastSeason = se;
    if (first || !this.s.free) return;
    const S = SEASONS[se];
    this.chron(`${S.name} başladı.`);
    this.hud.toast(`${S.icon} ${S.arrive}`, "info");
    audio.play("story");
  }

  nightEyes(): boolean {
    return this.s.cls === "hirsiz" || this.s.cls === "kam" || (this.s.bird?.kind === "sungur" && this.s.bird.lv >= 5);
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
