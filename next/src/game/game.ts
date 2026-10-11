import { astar, CITIES, GH, GW, H, NAV, NH, NW, W, WS, type World } from "../world/gen";
import type { Camera } from "../render/camera";
import type { WorldView } from "../render/worldView";
import type { Hud } from "../ui/hud";
import type { Biome, Env } from "../ui/journey";
import { ROW_NEED, TALENT_BY_ID, branchSpent, type Talent } from "./talents";
import { CONS_BY_ID, REFINES, gearCost, type Cost, type Mat } from "./crafting";
import { GIVERS, SIDE_TEXT, type SideKind, type SideQuest } from "./sidequests";
import { audio, type MusicScene } from "../audio";
import { settings } from "../settings";
import { Sim, TACTICS, TACTIC_KEYS, fight, odds, stanceWeights, tacticDelta, type BattleResult, type Boss, type Champion, type Field, type Tactic } from "./battle";
import { BUILDINGS, BUILDING_BY_ID, CITY_NAME, DAY_SEC, RES_KEYS, UNITS, UNIT_KEYS, army, armyPower, armySize, buildCost, buildTime, prodPerMin, storageCap, trainSpeed, unitUnlocked, xpNeed, type Army, type BuildingId, type Res, type Unit } from "./data";
import { CITY_TRADE, GOODS, GOOD_KEYS, PLUS_CHANCE, RARITY, SLOTS, STAT_INFO, canPlus, classItem, goodMult, itemPrice, itemProc, itemStats, makeHorse, makeItem, plusCost, rollItem, setPiece, setPlus, skillLv, uniqueItem, type Good, type Item, type Skill, type Slot, type Stat } from "./rpg";
import { SETS, SET_FORGE, SET_KEYS, SET_SLOTS, UNIQUES, addMods, type GearMods, type SetId } from "./legend";
import { TITLE_CATS, titleKey, titleOf, titleReward } from "./titles";
import { DAILY_POOL, today, yesterday, type Daily, type DailyTask } from "./daily";
import { gen } from "./text";
import { BREEDS, BREED_GOLD, BREED_TIME, SHOP_BREEDS, tulparChance, type Breed } from "./horse";
import { BIRDS, BIRD_KEYS, BIRD_MAX, BIRD_NAMES, HUNTS, birdSight, birdXpNeed, type BirdFlight, type BirdKind } from "./falcon";
import { BRO_BETRAY, BRO_MAX, BRO_MODS, LAST_WORDS, NEM_MAX, NEM_TRAITS, REVENGE, SCAR_EPITHETS, TAUNTS, diyetCost, makeNemesis, nemBoss, nemName, type Nemesis } from "./nemesis";
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
import { GIFT_GOLD, INTEL_WALL, PACT_DAYS, PEACE_GOLD, PEACE_REP, SPY_MAX, SPY_OPS, TRADE_BONUS, TRADE_GOLD, TRADE_REP, giftRep, spyCost, type DipState, type SpyOp } from "./spy";
import { MYCV_CAP, MYCV_COST, MYCV_FEE, MYCV_GUARD, MYCV_GUARD_MAX, MYCV_NAMES, MYCV_UPGRADE, mycvDays, mycvRisk, type MyCaravan } from "./mycaravan";
import { BALBAL_GOLD, BALBAL_MAX, BALBAL_STONE, YUG_LATE, balbalBonus, yugCost, type Fallen, type Foe } from "./yug";
import type { WrestleFoe } from "../ui/wrestle";
import { SIEGE_MAX_DAY, newSiege, siegeDay, siegeGar, siegeWall, type SiegeAct, type SiegeCtx, type SiegeRun } from "./siege";
import { FORT_COFFER_DAYS, FORT_LV_SLACK, FORT_MIN_ARMY, FORT_NEAR, FORT_TIERS, FORT_WALL_COST, FORT_WALL_MAX, fortDefense, fortGarrison, fortIndex, fortKey, fortWall, type FortOwner } from "./forts";
import { BOND_FX, BOND_LEAVE, BOND_QUEST, BOND_START, CAMPFIRES, COMP_QUESTS, SWORN_MULT, type BondEvent, type CompQuest, type CqChoice } from "./bonds";
import { lang, t as tr } from "../i18n";
import { WEEK_TIERS, weekBoard, weekFrac, weekId, weekNeed, weekRank, weekReward, weekScore, weekTheme, type BoardRow, type WeekState } from "./weekly";
import { steamStats } from "../platform";
import { FALL_PRICE, FALL_TEXT, LEG_DAYS, MONGOL_DAY, MONGOL_LV, RECOVER_DAYS, ROUTE, RUMORS, RUMOR_LEAD, STR_MAX, WIN_DELAY, joinLoot, mongolArmy, mongolBoss, newMongol, tributeCost, type MongolState } from "./mongol";
import { KIP_ALLY_FX, KIP_ALLY_MODS, KIP_FOOD, KIP_FORT_FX, KIP_GIFT, KIP_GIFT_REP, KIP_HIRE_GAP, KIP_HIRE_N, KIP_HIRE_REP, KIP_RAW, KIP_SELL_MULT, KIP_SELL_REP, KIP_STEPS, KIP_STONES_MODS, STONES, STONE_FX, inKipchak, kipBoss, kipFortArmy, kipHireCost, newKip, stoneXp, type KipPoi, type KipState } from "./kipchak";
import { SEASONS, SEASON_DAYS, seasonOf, type Season, type SeasonId } from "./seasons";
import { FACTIONS, FACTION_KEYS, HOSTILE, OCCUPY, REP_RANKS, RANK_PERKS, citiesOf, factionOf, repRank, type FactionId } from "./factions";
import { BANDIT_CHIEFS, CAPTIVE_MAX, DREAMS, GUILD, NOBLE_NAMES, TOY_CHAMPS, TOY_DAY, TOY_LEN, guildRank } from "./saga";
import { RIDDLES as RUIN_RIDDLES, ROOM_INFO, RUIN_KINDS, RUIN_LETTERS, RUIN_SPIRIT_LINES, rollRooms, ruinKind, type RoomKind, type RuinKind } from "./delve";
import { BASE_TRAIT, HEIRS, RULER_TRAITS, type RulerTrait, DROUGHT_DAYS, ERAS, PEACE_GAP, RIOT_AT, SAFE_CITIES, SHORT_MAX, STYLE_NAME, WAR_CAUSES, WAR_CHANCE, WAR_MAX_DAYS, WAR_MIN_DAY, WAR_PAIRS, WAR_TAKE, WOLF_MAX, WOLF_PACK_AT, WOLF_SACRED, adaptWeights, counterOf, eraOf, favTactic, lifeStyle, moonKind, moonPhase, newWorld, noteTactic, realFest, shortMult, styleMix, warKey, type Captive, type Omen, type Style, type War, type WorldState } from "./world";
import { CLASS_BY_ID, CLASS_SKILLS, SKILL_MAX, WEAPON_NAME, WEAPON_STAT, skillPow, skillRank, type ClassDef, type ClassId, type ClassSkill, type WeaponKind } from "./classes";
import { ACT2, ACT3, CHAPTERS, COMP_BY_ID, COMP_MAX, ENDINGS, ERLIK, ERLIK_SHADE, FORT_GUARD, GATE_GUARD, KARA_HAN, KASIM, KOK_BORU, PEAK_GUARD, SHADE_GUARD, endingOf, type Chapter, type CompId, type CompMods, type Companion } from "./story";
import { CAPITAL, SLAVE_RADIUS, banditArmy, campGarrison, importSave, kurganBoss, kurganGuard, loadGame, saveGame as rawSave, useSlot, wipeGame, type Bandit, type BattleRec, type Bounty, type Caravan, type Contract, type GameState, type Storm } from "./state";

export type Target =
  | { kind: "village" | "camp" | "node" | "ruin" | "city" | "bandit" | "kurgan" | "caravan" | "rival" | "kale"; i: number }
  | { kind: "capital" }
  | { kind: "fort" }
  | { kind: "gate" }
  | { kind: "peak" }
  | { kind: "otag" }
  | { kind: "boy" }
  | { kind: "kip"; i: number }
  | { kind: "mongol" }
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
export const NEWS_GOLD = 30;
export interface Hint {
  kind: "acil" | "firsat" | "hikaye";
  icon: string;
  title: string;
  text: string;
  at?: { x: number; y: number } | null;
  open?: "hero" | "goals" | "mongol";
}

const TRIP_MIN = 600;
const TELL_TRUE = 0.7;
const DUEL_MIN = 25;
/** Yenilgide düşen askerlerin savaş yerinde kurtarılmayı bekleyen payı. */
const WOUNDED_SHARE = 0.3;
/** Ganimet seçimi için en az düşman sayısı ve esirlerden saflara geçen pay. */
const SPOIL_MIN = 20;
export const VAKIF = [
  { name: "Çeşme", cost: 500, renown: 15, kut: 3, perk: "Bu şehirde konaklama bedava." },
  { name: "İmaret", cost: 2000, renown: 30, kut: 4, perk: "Bu şehirde paralı asker %15 ucuz." },
  { name: "Medrese", cost: 6000, renown: 60, kut: 5, perk: "Her gün +2 şöhret." },
];
const SPOIL_CAPTIVE = 0.12;
const DUEL_FOES = ["Kara Buğa", "Demir Kıyak", "Bars Tegin", "Tolun Er", "Aybars", "Kılıç Arslan", "Böri Han", "Yağmur Alp"];
const HAGGLE = [
  { label: "Nazikçe iste", gain: 0.04, base: 0.7, loss: 0.02 },
  { label: "Sıkı pazarlık", gain: 0.08, base: 0.42, loss: 0.04 },
  { label: "Yüzsüzce dayat", gain: 0.14, base: 0.2, loss: 0.08 },
];
const TACTIC_TELLS: Record<Tactic, string[]> = {
  hucum: ["Toynak sesleri yaklaşıyor; atlılar ön safta toplanıyor.", "Düşman başı kılıcını havaya kaldırdı; adamları mahmuzlamaya hazır.", "Toz bulutu büyüyor: üstüne doğru at sürüyorlar."],
  duvar: ["Kalkanlar birbirine kenetleniyor; mızrak uçları güneşte parlıyor.", "Düşman tepenin üstünde sık saf tuttu, kımıldamıyor.", "Davullar ağır ağır vuruyor; kimse saftan çıkmıyor."],
  pusu: ["Sazlıkta kıpırtı var; birkaç okçu gözden kayboldu.", "Düşmanın yarısı ortalıkta yok; yamaçta kuşlar ürktü.", "Fazla sessizler. Kayalıkların ardında yay gerilme sesi mi?"],
};
const TRIP_BIOME: Record<Biome, string[]> = {
  kum: ["Kum tepeleri başladı; develer ağırlaştı, su tulumları sayılıyor.", "Çöl başladı. Kılavuz yıldızlara ve rüzgârın izine bakıyor."],
  bozkir: ["Uçsuz bucaksız bozkır açıldı; rüzgâr otları dalgalandırıyor.", "Bozkıra çıkıldı. Uzakta bir tarla kuşu ötüyor."],
  cayir: ["Yeşil çayırlara inildi; atlar otlamak için başını eğiyor.", "Sulak ovalar başladı. Dereler kervanın yanında akıyor."],
  dag: ["Dağ geçidine tırmanılıyor; develer taşlı yolda dikkatle basıyor.", "Sarp yamaçlar başladı. Kartallar kervanın üstünde süzülüyor."],
};
const TRIP_NIGHT = ["Gece çöktü. Kervan yıldızlarla yön buluyor.", "Güneş battı; çıngırakların sesi karanlıkta yankılanıyor.", "Gece oldu. Kılavuz Demir Kazık'ı gösterdi."];
const TRIP_DAWN = ["Şafak söktü. Develer homurdanarak doğruldu.", "Gün ağardı; ufuk pembeye kesti.", "Sabah oldu. Kervanbaşı yola koyulma emrini verdi."];
const TRIP_SEASON: Record<string, string[]> = {
  bahar: ["Bahar yağmuru toprağı kokuttu; lale tarlaları göz alıyor.", "Kuzulu sürüler yolun kıyısında meliyor.", "Kervancılar bir türkü tutturdu."],
  yaz: ["Güneş tepede kavuruyor; tulumlardan su paylaştırıldı.", "Sıcak hava ufku titretiyor; serap mı, vaha mı?", "Çıngıraklar ağır ağır çalıyor; yol uzun."],
  guz: ["Güz rüzgârı sararmış yaprakları savuruyor.", "Göçmen kuşlar güneye doğru uçuyor.", "Kervancılar kış hazırlığını konuşuyor."],
  kis: ["Kar diz boyu; develer buhar soluyor.", "Ayaz yüzleri kesiyor; keçeler sıkıca sarıldı.", "Donmuş bir derenin üstünden dikkatle geçildi."],
};
const CAP_I = CITIES.findIndex((c) => c.id === "samarkand");
const RES_SELL: Record<keyof Res, number> = { gold: 1, wood: 3, stone: 4, food: 2 };
/** Bir şehrin günlük ham madde pazarı: RES_SAT adette fiyat tabana (RES_SAT_MIN) iner. */
const RES_SAT = 600;
const RES_SAT_MIN = 0.3;
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
  private trip: { to: number; cum: number[]; total: number; t: number; night: boolean; biome: Biome; half: boolean; seen: Set<number>; storm: boolean; flavor: number } | null = null;
  private sceneDay: Record<string, number> = {};
  private readEdge = false;
  lastTactic: Tactic = "hucum";
  reserve = false;
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
  private moon: "dolunay" | "karaay" | null = moonKind(moonPhase(new Date()));
  delve: { i: number; kind: RuinKind; tier: number; rooms: RoomKind[]; at: number; gold: number; xp: number; riddle: boolean; notes: string[] } | null = null;

  constructor(public world: World, public view: WorldView, public cam: Camera) {
    this.s = loadGame(world);
    this.s.wd = { ...newWorld(), ...this.s.wd };
    Object.assign(OCCUPY, this.s.wd.occ);
    for (const [f, r] of Object.entries(this.s.wd.rulers) as [FactionId, { name: string; gen: string }][]) {
      FACTIONS[f].ruler = r.name;
      FACTIONS[f].rulerGen = r.gen;
    }
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
      heal: m.heal + this.compMods().heal + 0.015 * this.tal("kanici") + (this.buff("tutsu") ? 0.04 : 0) + (this.buff("umay") ? 0.04 : 0) + (gm.heal ?? 0),
      rage: m.rage,
      firstStrike: m.firstStrike,
      skills: [
        ...this.classSkills()
          .map((sk) => ({ name: sk.name, kind: sk.kind, pow: skillPow(sk, this.s.hero.cskill[sk.id] ?? 0) }))
          .filter((x) => x.pow > 0),
        ...Object.values(this.s.hero.equip).flatMap((it) => (it ? [itemProc(it)].filter((p) => !!p) : [])).map((p) => ({ ...p!, name: tr(p!.name) })),
      ],
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
    return 0.025 * this.stat("lid") + 0.02 * (this.s.hero.lv - 1) + this.cls().mods.army + this.compMods().army + 0.03 * this.tal("nara") + (this.buff("davul") ? 0.15 : 0) + (this.buff("ziyafet") ? 0.1 : 0) + (this.buff("surek") ? 0.08 : 0) + (this.buff("yug") ? 0.05 : 0) + (this.buff("ulgen") ? 0.12 : 0) + (this.buff("ata") ? 0.05 : 0) + balbalBonus(this.s.foes ?? []) + (this.gearMods().army ?? 0) + this.heroRankBonus() + this.allyBonus() + (hasLegacy("tengri") ? 0.06 : 0) + vetBonus(this.s.vets ?? []) + (this.s.beylik ? kutArmy(this.s.kut ?? 50) : 0) + this.famBonus() + this.moonBonus();
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
    const wd = this.wd();
    if (this.isNight() && !wd.boruSlain && s.hero.lv >= 5 && day - wd.boru >= 12 && (this.moon === "dolunay" || wd.wolves >= 80) && Math.random() < 0.2) {
      s.road.n++;
      return this.akBoru();
    }
    if (this.isNight() && wd.wolves >= WOLF_PACK_AT && day > wd.boruPeace && Math.random() < (this.moon === "dolunay" ? 0.45 : 0.25)) {
      s.road.n++;
      return this.wolfPack();
    }
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
    const day = this.dayOf().day;
    const last = (s.evSeen ??= {});
    const fresh = ok.filter((e) => !s.road.seen.includes(e.id) && day - (last[e.id] ?? -99) >= 4);
    if (!id && !fresh.length) return false;
    const ev = id ? ROAD_EVENTS.find((e) => e.id === id) : fresh[Math.floor(Math.random() * fresh.length)];
    if (!ev) return false;
    last[ev.id] = day;
    s.road.n++;
    s.road.seen = [ev.id, ...s.road.seen.filter((x) => x !== ev.id)].slice(0, 10);
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
    if (r.kut) this.remember(r.kut > 0, `${tr(ev.title)}: ${tr(o.label)}`);
    this.note("kesif");
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
      this.hoardTick();
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
        if (night) this.dreamCheck();
        if (s.free) this.hud.toast(night ? `Gece çöktü. Haramiler cesurlaştı; Kurgan Taşları güçlendi ama daha çok Ruh Taşı verir.${this.nightEyes() ? " Gözlerin karanlığa alışkın." : ""}` : "Şafak söktü. Yollar yeniden canlanıyor.", "info");
      }
      this.stormTick(dt);
      this.seasonTick();
      this.marches(dt, now);
    }
    this.musicTick(dt);
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
    this.myCvTick(dt);
    this.kipTick(dt);
    this.mongolTick(dt);
    this.intelTick(dt);
    this.tripTick(dt);
    this.storyTick();
    this.worldEvents(dt, now);
    this.checkContract();
    this.seraiVisit();
    this.sideTick();
    this.tipTick(dt);
    this.campfireTick(dt);
    this.lvTick();
    this.woundTick();
    this.saveT += dt;
    if (this.saveT > 8) {
      this.saveT = 0;
      saveGame(s);
    }
  }

  private tipT = 0;
  private tipGap = 20;
  private chSeen: { key: string; t: number } | null = null;

  /** Her biri bir kez gösterilen bağlamsal ipuçları; iki ipucu arasında en az 45 sn. */
  private tipTick(dt: number): void {
    this.tipT += dt;
    if (this.tipT < 1.5) return;
    this.tipGap -= this.tipT;
    this.tipT = 0;
    if (!settings.tips || this.tipGap > 0 || this.battleLock || this.hud.battleOpen || this.s.time < 25) return;
    const s = this.s;
    const h = s.hero;
    const seen = (s.tips ??= []);
    const tips: [string, () => boolean, string, string, (() => void) | null][] = [
      ["beceri", () => h.spts > 0, "scroll", "Beceri puanın var! Kahraman panelinden güç, çeviklik ya da liderliğe harca.", () => this.hud.menuTo("beceri")],
      ["yetenek", () => h.tpts > 0, "tr_star", "Yetenek puanı kazandın. Yetenek ağacından sınıfına uygun bir dal seç.", () => this.hud.menuTo("yetenek")],
      ["yara", () => h.hp < this.maxHp() * 0.4, "healer", "Yaralısın. Şehirlerde can üç kat hızlı dolar; yaralıyken savaşa girme.", null],
      ["enerji", () => h.energy < this.maxEnergy() * 0.2, "food", "Enerjin tükeniyor. Şehirde beklersen enerji iki kat hızlı yenilenir.", null],
      ["asker", () => s.free && armySize(h.army) === 0 && s.res.gold >= 80, "u_spear", "Yollar tek başına tehlikeli. Köylerden gönüllü topla ya da şehir hanlarından paralı asker tut.", () => this.hud.menuTo("ordu")],
      ["ticaret", () => s.free && s.c.bought === 0 && s.res.gold >= 150 && this.nearCity() >= 0, "coins", "Çarşıda bir malı ucuza al, onu arayan başka bir şehirde pahalıya sat. Kervan ticareti servetin en hızlı yoludur.", null],
      ["harami", () => s.free && s.bandits.some((b) => !b.amb && Math.hypot(b.x - h.x, b.y - h.y) < 320 && armyPower(b.army) > this.heroPower() * 0.8), "j_bandit", "Yakında güçlü haramiler dolaşıyor. Üzerlerine dokunup güçlerine bak; senden güçlüyse yolunu değiştir ya da bir şehre sığın.", null],
      ["moral", () => s.kills > 0, "tug", "Savaşta mavi çubuk moraldir: sıfırlanan taraf bozguna uğrar. Nara, kanat saldırısı ve yedek kuvvet dengeyi değiştirir.", null],
      ["arazi", () => s.kills >= 15, "u_cavalry", "Savaş yeri önemlidir: bozkırda atlılar, dağda okçular, çayırda mızraklılar güçlenir. Geceleri oklar şaşar.", null],
    ];
    const next = tips.find(([id, cond]) => !seen.includes(id) && cond());
    if (!next) {
      const ch = s.free ? this.chapter() : null;
      const key = ch ? `destan:${this.sagaLabel()}` : "";
      if (!ch) return;
      if (this.chSeen?.key !== key) this.chSeen = { key, t: s.time };
      if (s.time - this.chSeen.t < DAY_SEC * 2) return;
      const day = this.dayOf().day;
      if (seen.includes(key) && day - (s.sagaCall ?? -99) < 3) return;
      if (!seen.includes(key)) seen.push(key);
      s.sagaCall = day;
      this.tipGap = 45;
      this.hud.tip(ch.img, `<b>${tr("Destan seni bekliyor")}: ${tr(ch.title)}</b><br>${tr(ch.goal)}`, () => {
        const p = ch.goto(this);
        if (p) this.cam.flyTo(p.x, p.y, Math.max(this.cam.zoom, 0.65));
      });
      return;
    }
    const [id, , icon, text, open] = next;
    seen.push(id);
    this.tipGap = 45;
    this.hud.tip(icon, tr(text), open);
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
    const wage = this.wagePerMin();
    for (const k of RES_KEYS) {
      const r = k === "gold" ? (this.ratePerMin(k) + wage) * el - (wage * dt) / 60 : this.ratePerMin(k) * el;
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
      if (!c.alive && now >= c.respawnAt && this.fortGuard(c.x, c.y)) c.respawnAt = now + 60000;
      else if (!c.alive && now >= c.respawnAt) {
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
    return 2 + Math.floor(this.stat("guc") / 3) + Math.floor(this.skill("emek") / 3);
  }

  work(i: number): void {
    const n = this.s.nodes[i];
    const h = this.s.hero;
    if (this.busy()) return;
    if (Math.hypot(n.x - h.x, n.y - h.y) > 90) return this.hud.toast("Çalışmak için oraya gitmelisin", "bad");
    if (h.energy < 10) return this.hud.toast("Çok yorgunsun. Biraz bekle ya da şehirde dinlen.", "bad");
    if (this.s.free && n.left <= 0) return this.hud.toast("Burası tükendi", "bad");
    h.energy -= 10;
    this.note("is");
    const label = { wood: "Odun kesiyorsun", stone: "Taş kırıyorsun", food: "Tarlada çalışıyorsun", gold: "Madende kazıyorsun" }[n.kind];
    this.start(label, 5, () => {
      const s = this.s;
      s.c.shifts++;
      s.hero.skills.emek += 12;
      const up = this.addXp(5);
      if (!s.free) {
        const w = this.slaveWage() + Math.floor(Math.random() * 2);
        s.res.gold += w;
        this.hud.toast(`Vardiya bitti. Efendin sana ${w} akçe verdi.${up ? " Seviye atladın!" : ""}`, "good");
        this.slaveEvent();
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
    if (ci >= 0 && (this.s.serais[CITIES[ci].id] || this.s.owned[CITIES[ci].id] || this.vakifLv(CITIES[ci].id) >= 1)) return 0;
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

  /** Ufuk: şu an en anlamlı acil iş, fırsat ve hikâye adımı. */
  horizon(): Hint[] {
    const s = this.s;
    const h = s.hero;
    const out: Hint[] = [];
    const nearest = <T extends { x: number; y: number }>(l: T[]) => l.reduce<T | null>((a, b) => (!a || Math.hypot(b.x - h.x, b.y - h.y) < Math.hypot(a.x - h.x, a.y - h.y) ? b : a), null);
    if (s.raid) {
      const v = s.villages[s.raid.v];
      out.push({ kind: "acil", icon: "j_bandit", title: tr("{v} yağmalanıyor", { v: v.name }), text: tr("Haramiler köyü basıyor. Yetişirsen köy sana bağlanır."), at: v });
    }
    const mg = s.mongol;
    if (mg?.stage === 2) {
      const left = Math.ceil(this.mongolDaysLeft());
      if (left <= 4) out.push({ kind: "acil", icon: "heroes/boss_hakan", title: tr("Moğollar {c} kapısında", { c: CITY_NAME[ROUTE[mg.next]] }), text: tr("{n} gün sonra şehir düşebilir. Haraç, ittifak ya da savaş: kararını ver.", { n: left }), open: "mongol" });
    }
    if (s.free && h.hp < this.maxHp() * 0.35) {
      const c = nearest(CITIES);
      out.push({ kind: "acil", icon: "healer", title: tr("Ağır yaralısın"), text: tr("Bir handa dinlenmeden yeni bir savaşa girme."), at: c });
    }
    if (s.free && h.lv >= 2 && armySize(h.army) === 0) out.push({ kind: "acil", icon: "u_spear", title: tr("Ordun yok"), text: tr("Tek başına bozkır affetmez. Bir köyden gönüllü topla."), at: nearest(s.villages) });
    if (s.wanted >= 2) out.push({ kind: "acil", icon: "wanted", title: tr("Aranıyorsun"), text: tr("Muhafızlar peşinde. Şehirlerden uzak dur ya da zamanla unutulmayı bekle.") });
    s.forts.forEach((f, i) => {
      if (f.owner === "me" && f.threat) out.push({ kind: "acil", icon: "icons/fortress", title: tr("{k} tehlikede", { k: this.fortTitle(i) }), text: tr("{w} ~{n} askerle geliyor. Yetişirsen surlarda sen de savaşırsın.", { w: this.fortOwnerName(f.threat.from), n: f.threat.n }), at: f });
    });
    const pts = h.points + h.spts + h.tpts;
    if (pts) out.push({ kind: "firsat", icon: "crown", title: tr("{n} dağıtılmamış puan", { n: pts }), text: tr("Kahraman ekranında güç, beceri ve yeteneklerine dağıt."), open: "hero" });
    if (s.free) {
      const rich = s.forts.map((f, i) => ({ f, i })).filter((x) => x.f.owner === "me" && x.f.coffer >= FORT_TIERS[x.f.tier].income * 2).sort((a, b) => b.f.coffer - a.f.coffer)[0];
      if (rich) out.push({ kind: "firsat", icon: "icons/fortress", title: tr("{k} kasası doldu", { k: this.fortTitle(rich.i) }), text: tr("Kasada {n} altın birikti. Uğrayıp al.", { n: Math.floor(rich.f.coffer) }), at: rich.f });
      const prey = s.forts
        .map((f, i) => ({ f, i, d: Math.hypot(f.x - h.x, f.y - h.y) }))
        .filter((x) => x.f.owner !== "me" && this.isExplored(x.f.x, x.f.y) && !this.fortReason(x.i, true))
        .sort((a, b) => a.d - b.d)[0];
      if (prey) out.push({ kind: "firsat", icon: FORT_TIERS[prey.f.tier].art, title: tr("Kuşatılabilir: {k}", { k: this.fortTitle(prey.i) }), text: tr("{w} elinde, ~{n} muhafız. Alırsan çevredeki haramiler dağılır ve kale her gün vergi toplar.", { w: this.fortOwnerName(prey.f.owner), n: armySize(prey.f.gar) }), at: prey.f });
    }
    if (s.free) {
      const today = this.dayOf().day;
      const evs = s.events.filter((e) => CITY_NAME[e.city] && !this.hostile(e.city));
      const short = evs.find((e) => e.mult > 1 && (h.cargo[e.good] ?? 0) > 0);
      const glut = evs.find((e) => e.mult < 1);
      const ev = short ?? glut;
      if (ev) {
        const left = Math.max(1, ev.until - today + 1);
        out.push({
          kind: "firsat",
          icon: GOODS[ev.good].icon,
          title: tr(ev === short ? "Sıcak fırsat: {c} çarşısında {g} kıtlığı" : "Sıcak fırsat: {c} çarşısında {g} bolluğu", { c: CITY_NAME[ev.city], g: GOODS[ev.good].name }),
          text: ev === short ? tr("Elindeki {n} {g} orada çok pahalıya gider. {d} gün içinde yetiş.", { n: h.cargo[ev.good] ?? 0, g: GOODS[ev.good].name, d: left }) : tr("Ucuza al, başka bir şehirde sat. Fırsat {d} gün sürer.", { d: left }),
          at: CITIES.find((c) => c.id === ev.city),
        });
      }
      const ci = this.nearCity();
      const known = (id: string): Partial<Record<Good, [number, number]>> | undefined =>
        ci >= 0 && CITIES[ci].id === id ? Object.fromEntries(GOOD_KEYS.map((k) => [k, [this.buyPrice(id, k), this.sellPrice(id, k)]])) : s.intel?.[id]?.p;
      let best: { a: string; b: string; k: Good; buy: number; sell: number } | null = null;
      for (const a of CITIES) {
        const pa = known(a.id);
        if (!pa || this.hostile(a.id)) continue;
        for (const b of CITIES) {
          if (a === b) continue;
          const pb = known(b.id);
          if (!pb) continue;
          for (const k of GOOD_KEYS) {
            const buy = pa[k]?.[0];
            const sell = pb[k]?.[1];
            if (!buy || !sell || sell < buy * 1.25) continue;
            if (!best || sell - buy > best.sell - best.buy) best = { a: a.id, b: b.id, k, buy, sell };
          }
        }
      }
      if (best) out.push({ kind: "firsat", icon: GOODS[best.k].icon, title: `${CITY_NAME[best.a]} → ${CITY_NAME[best.b]}: ${GOODS[best.k].name}`, text: tr("~{a} al, ~{b} sat. Birim başı ~{p} kâr (son duyduğun fiyatlarla).", { a: best.buy, b: best.sell, p: best.sell - best.buy }), at: CITIES.find((c) => c.id === best!.a) });
      const coffer = Object.entries(s.serais).filter(([, v]) => v.coffer >= 80).sort((x, y) => y[1].coffer - x[1].coffer)[0];
      if (coffer) out.push({ kind: "firsat", icon: "map/serai", title: tr("{c} kervansarayı", { c: CITY_NAME[coffer[0]] }), text: tr("Kasada {n} altın birikti. Uğrayıp al.", { n: Math.floor(coffer[1].coffer) }), at: CITIES.find((c) => c.id === coffer[0]) });
      if (this.dailyClaimable()) out.push({ kind: "firsat", icon: "chest", title: tr("Günlük ödül hazır"), text: tr("Hedefler sekmesinden al."), open: "goals" });
    }
    if (s.free && s.wd) {
      for (const war of s.wd.wars) {
        if (!war.side) continue;
        const foe = war.side === war.a ? war.b : war.a;
        const front = s.forts.map((f, i) => ({ f, i })).filter((x) => x.f.owner === foe).sort((a, b) => Math.hypot(a.f.x - h.x, a.f.y - h.y) - Math.hypot(b.f.x - h.x, b.f.y - h.y))[0];
        const lead = war.side === war.a ? war.takes : -war.takes;
        out.push({ kind: "firsat", icon: "icons/swords", title: tr("Cephe: {f} savaşı", { f: FACTIONS[foe].short }), text: front ? tr("{k} düşman elinde. Alırsan cephe senin lehine döner. Durum: {l}", { k: this.fortTitle(front.i), l: lead > 0 ? tr("öndeyiz") : lead < 0 ? tr("geride kalıyoruz") : tr("başa baş") }) : tr("{f} kervanlarını vur, şehirlerini kuşat.", { f: FACTIONS[foe].short }), at: front?.f ?? null });
      }
      const sc = CITIES.filter((c) => (s.wd!.short[c.id] ?? 0) >= 4 && !this.hostile(c.id)).sort((a, b) => (s.wd!.short[b.id] ?? 0) - (s.wd!.short[a.id] ?? 0))[0];
      if (sc) out.push({ kind: "firsat", icon: "icons/merchant", title: tr("{c} çarşısında kıtlık", { c: CITY_NAME[sc.id] }), text: tr("Fiyatlar %{p} yukarıda. Mal götüren kazanır; kıtlık sürerse isyan çıkar.", { p: Math.round((shortMult(s.wd.short[sc.id] ?? 0) - 1) * 100) }), at: sc });
    }
    const ch = s.free ? this.chapter() : null;
    if (ch) out.push({ kind: "hikaye", icon: ch.img, title: ch.title, text: ch.goal, at: ch.goto(this) });
    const q = this.quest();
    if (q) out.push({ kind: "hikaye", icon: "quest", title: q.title, text: q.text, at: q.goto?.(this) ?? null });
    const pick = (k: Hint["kind"], n: number) => out.filter((x) => x.kind === k).slice(0, n);
    return [...pick("acil", 2), ...pick("firsat", 2), ...pick("hikaye", 2)];
  }

  /** Kölelik yıllarının seçimli anları; her biri bir kez, belli vardiyalarda. */
  private slaveEvent(): void {
    const s = this.s;
    const t = s.time;
    const n = s.c.shifts;
    const done = (s.slaveEv ??= []);
    const once = (id: string) => !done.includes(id) && done.push(id) > 0;
    const say = (t: string, k: "good" | "bad" | "info" = "info") => this.hud.toast(t, k);
    if (n >= 2 && once("kahya")) {
      this.hud.choice("Kâhyanın hilesi", "master", `Kâhya Sencer akçelerini sayarken ikisini kendi kesesine attı. "Efendinin hesabı böyle," dedi, gözünü kırpmadan.`, [
        { label: "Boyun eğ", cls: "", fn: () => {
          s.res.gold = Math.max(0, s.res.gold - 2);
          say("Sustun. İki akçe gitti ama başın dertte değil.");
        } },
        { label: "Efendiye şikâyet et · şans %55", cls: "", fn: () => {
          if (Math.random() < 0.55) {
            s.res.gold += 8;
            say("Efendin kâhyayı herkesin önünde azarladı, sana fazladan 8 akçe verdi.", "good");
          } else {
            s.res.gold = Math.max(0, s.res.gold - 4);
            s.hero.hp = Math.max(1, s.hero.hp - this.maxHp() * 0.25);
            say("Kâhya yalan yere yemin etti; sopayı sen yedin, 4 akçe de ceza.", "bad");
          }
        } },
        { label: "Hesabını tut, bir gün ödeşirsiniz", cls: "", fn: () => {
          s.hero.skills.emek += 25;
          say("Her akçeyi aklına yazdın. Emek +25", "good");
        } },
      ]);
    } else if (n >= 5 && t >= 120 && once("ayse")) {
      const k = CITIES.find((c) => c.id === "kashgar")!;
      this.hud.choice("Ayşe'nin izi", "scroll", `Tarlada yanına düşen yaşlı bir köle fısıldadı: "Senin obandan bir kız gördüm… Ayşe. Kara Tamga atlıları onu doğuya, Kaşgar yoluna götürdü."`, [
        { label: "Ekmeğini onunla paylaş · 3 akçe", cls: s.res.gold < 3 ? "off" : "", fn: () => {
          s.res.gold -= 3;
          this.addKut(2);
          say("Yaşlı adam dua etti: \"Tengri yolunu açsın.\" Kut +2", "good");
        } },
        { label: "Daha çok sor", cls: "", fn: () => {
          this.reveal(k.x, k.y, 9);
          this.chron(`${s.hero.name}, Ayşe'nin Kaşgar yoluna götürüldüğünü bir köleden öğrendi.`);
          say("Kaşgar yolunu aklına kazıdın. Haritada Kaşgar açıldı.", "good");
        } },
        { label: "Sus, başını belaya sokma", cls: "", fn: () => say("Başını öne eğip çalışmaya döndün.") },
      ]);
    } else if (n >= 8 && t >= 200 && once("oglan")) {
      this.hud.choice("Efendinin oğlu", "u_spear", `Efendinin oğlu Timur avluda tahta kılıçla talim ediyordu. Seni görünce güldü: "Köle, gel de bir el dövüşelim. Yenersen bir akçe senin."`, [
        { label: "Dövüş, gerçekten yenmeye çalış · Güç", cls: "", fn: () => {
          if (Math.random() < 0.35 + this.stat("guc") * 0.05) {
            s.res.gold += 6;
            s.hero.skills.silah += 40;
            this.addXp(10);
            say("Timur toz içinde kaldı. Sözünü tuttu, üstüne 5 akçe ekledi. Silah ustalığı +40", "good");
          } else {
            s.hero.hp = Math.max(1, s.hero.hp - this.maxHp() * 0.2);
            s.hero.skills.silah += 20;
            say("Tahta kılıç kaburgana indi. Yine de bir şey öğrendin. Silah ustalığı +20", "info");
          }
        } },
        { label: "Bilerek yenil, gönlünü kazan", cls: "", fn: () => {
          s.res.gold += 3;
          this.addKut(-1);
          say("Timur keyiflendi, sana 3 akçe attı. Ama içinde bir şey kırıldı. Kut -1", "info");
        } },
        { label: "Reddet: \"Kölenin elinde kılıç olmaz.\"", cls: "", fn: () => {
          s.hero.skills.emek += 20;
          say("Timur omuz silkti. Sen de tarlaya döndün. Emek +20");
        } },
      ]);
    } else if (n >= 11 && t >= 280 && once("pazar")) {
      this.hud.choice("Pazar günü", "merchant", `Efendin seni pazara yük taşımaya gönderdi. Bir tüccar sana göz kırptı: "Şu çuvalı benim tezgâha bırakırsan sana 6 akçe veririm. Efendin bir çuval eksik saysa ne olur?"`, [
        { label: "Çuvalı sat · 6 akçe, yakalanırsan sopa", cls: "bad", fn: () => {
          if (Math.random() < 0.6) {
            s.res.gold += 6;
            say("Kimse fark etmedi. Kesende 6 akçe şıngırdıyor.", "good");
          } else {
            s.res.gold = Math.max(0, s.res.gold - 10);
            s.hero.hp = Math.max(1, s.hero.hp - this.maxHp() * 0.3);
            say("Kâhya saydı, eksik çıktı. 10 akçe ceza ve sopa.", "bad");
          }
        } },
        { label: "Tüccarla pazarlık öğren", cls: "", fn: () => {
          s.hero.skills.ticaret += 35;
          say("Tüccar ticaretin inceliklerini anlattı. Ticaret +35", "good");
        } },
        { label: "Yükü dürüstçe teslim et", cls: "", fn: () => {
          s.res.gold += 2;
          this.addKut(1);
          say("Efendin yükü tam bulunca 2 akçe bahşiş verdi. Kut +1", "good");
        } },
      ]);
    } else if (n >= 13 && t >= 330 && s.res.gold >= 15 && once("birikim")) {
      this.hud.choice("Gizli birikim", "coins", `Kâhya Sencer koğuşları arıyor; kölelerin sakladığı akçeleri "efendinin malı" diye topluyor. Senin kesende ${Math.floor(s.res.gold)} akçe var.`, [
        { label: "Duvardaki taşın ardına sakla · Çeviklik", cls: "", fn: () => {
          if (Math.random() < 0.5 + this.stat("cev") * 0.05) say("Sencer taşın önünden geçti, fark etmedi. Birikimin güvende.", "good");
          else {
            const lost = Math.floor(s.res.gold * 0.4);
            s.res.gold -= lost;
            say(`Taş oynaktı, Sencer buldu. ${lost} akçe gitti.`, "bad");
          }
        } },
        { label: "Yaşlı köleye emanet et", cls: "", fn: () => {
          this.addKut(1);
          say("Yaşlı adam akçeleri yamalı hırkasına dikti. \"Hürriyet günü geri alırsın.\" Kut +1", "good");
        } },
        { label: "Sencer'e 5 akçe rüşvet ver", cls: "", fn: () => {
          s.res.gold -= 5;
          say("Sencer akçeyi cebine attı, senin yatağına bakmadı bile.", "info");
        } },
      ]);
    } else if (n >= 15 && t >= DAY_SEC * 2.5 && s.res.gold < this.freedomCost() && once("kacis")) {
      this.hud.choice("Gece kaçışı", "master", `Gece ahırda Oğuz adlı bir köle yanına sokuldu: "Surun kuzeyinde bir gedik var. Bu gece gidiyorum. Gel benimle; 100 akçeyi beklersen yaşlanırsın."`, [
        { label: "Kaçışa katıl · aranırsın, Karahanlılar küser", cls: "bad", fn: () => {
          this.freeHero(true);
          s.wanted = Math.max(s.wanted, 2);
          this.addRep(factionOf("samarkand"), -15, "kaçak köle");
        } },
        { label: "Planı efendiye ihbar et · +20 akçe", cls: "", fn: () => {
          s.res.gold += 20;
          this.addKut(-3);
          this.chron(`${s.hero.name}, kaçmak isteyen Oğuz'u efendisine ele verdi.`);
          say("Efendin 20 akçe verdi. Oğuz'un çığlıkları gece boyu sürdü. Kut -3", "bad");
        } },
        { label: "Reddet ama sırrını tut", cls: "", fn: () => {
          this.addKut(1);
          say("Oğuz'a yolun açık olsun dedin. Sabah yatağı boştu. Kut +1", "info");
        } },
      ]);
    }
  }

  freedomCost(): number {
    return 100;
  }

  buyFreedom(): void {
    const s = this.s;
    if (s.free || !this.atCapital() || !this.pay({ gold: this.freedomCost() })) return;
    this.freeHero(false);
  }

  private freeHero(escaped: boolean): void {
    const s = this.s;
    s.free = true;
    const c = this.cls();
    const armor = makeItem(s.nextId++, "zirh", 1, 0, c.armor);
    s.hero.equip.zirh = armor;
    this.view.heroPortrait(c.portrait);
    const tail = `Sırtında eski bir ${armor.name.toLocaleLowerCase("tr")}, kalbinde bir <b>${c.name}</b> ateşi var. ${c.passive}<br><br>Demirciden ${c.weapons.map((w) => WEAPON_NAME[w].toLocaleLowerCase("tr")).join(" ya da ")} al, talim yap, köylerden yoldaş topla. Bir gün kendi beyliğini kuracaksın.`;
    if (escaped) {
      this.chron(`${s.hero.name} bir gece yarısı Semerkant surlarını aştı; kaçak bir köle olarak bozkıra karıştı.`);
      this.hud.story("Kaçış!", c.portrait, `Ay bulutların ardına girdiğinde surun gediğinden sıyrıldınız. Arkanızda köpekler havladı, meşaleler yandı; ama bozkır sizi yuttu.<br><br><b class="dear">Efendinin adamları seni arıyor (aranma 2). Karahanlılar sana soğuk bakacak.</b><br><br>${tail}`);
    } else {
      this.chron(`Semerkant'ta demir halka çözüldü; ${s.hero.name} köle doğdu, hür bir ${c.name} olarak yola düştü.`);
      this.hud.story("Hürriyet!", c.portrait, `Efendin akçeleri sayıp boynundaki demir halkayı çözdü. "Git bakalım ${s.hero.name}, yollar senin artık."<br><br>${tail}`);
    }
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
    return GOODS[g].base * goodMult(city, g) * wave * (this.sea().goods[g] ?? 1) * this.eventMult(city, g) * (1 + 0.6 * (this.market(city)[g] ?? 0)) * (this.sacked(city) ? FALL_PRICE : 1) * this.worldMult(city);
  }

  buyFactor(): number {
    return Math.max(1.02, 1.12 - this.skill("ticaret") * 0.006 - this.stat("kar") * 0.004 - this.cls().mods.trade - this.compMods().trade) - 0.01 * this.tal("pazarlik") - (this.decree("pazar") ? 0.03 : 0) - this.guildCut();
  }

  sellFactor(): number {
    return Math.min(0.98, 0.88 + this.skill("ticaret") * 0.006 + this.stat("kar") * 0.004 + this.cls().mods.trade + this.compMods().trade) + 0.01 * this.tal("pazarlik") + 0.05 * this.tal("ipekhan") + (this.decree("pazar") ? 0.03 : 0) + this.guildCut();
  }

  buyPrice(city: string, g: Good): number {
    return Math.max(1, Math.round(this.price(city, g) * this.buyFactor() * (1 - 0.02 * (this.s.serais[city]?.lv ?? 0) - this.repTrade(city) - this.haggleMod(city))));
  }

  sellPrice(city: string, g: Good): number {
    return Math.max(1, Math.round(this.price(city, g) * this.sellFactor() * (1 + 0.02 * (this.s.serais[city]?.lv ?? 0) + this.repTrade(city) + this.haggleMod(city))));
  }

  haggleMod(city: string): number {
    const h = this.s.haggle?.[city];
    return h && h.day === this.dayOf().day ? h.m : 0;
  }

  haggleDone(city: string): boolean {
    return this.s.haggle?.[city]?.day === this.dayOf().day;
  }

  haggleChance(i: number): number {
    return Math.min(0.95, HAGGLE[i].base + this.stat("kar") * 0.025 + this.skill("ticaret") * 0.02 + 0.05 * this.tal("pazarlik"));
  }

  haggleMenu(city: string): void {
    const s = this.s;
    if (!s.free || !this.atCity(city) || this.haggleDone(city)) return;
    const pct = (x: number) => Math.round(x * 100);
    const opts = HAGGLE.map((o, i) => ({
      label: `${tr(o.label)} · ${tr("fiyatlar %{n} lehine", { n: pct(o.gain) })} · ${tr("şans")} %${pct(this.haggleChance(i))}`,
      cls: "",
      fn: () => this.haggle(city, i),
    }));
    opts.push({ label: tr("Vazgeç"), cls: "", fn: () => {} });
    this.hud.choice(tr("Pazarlık"), "merchant", tr("Çarşının en eski tüccarı tespihini çekerek seni süzüyor. \"Bugün mal az, yolcu çok,\" diyor. Bir gün boyunca bu şehirdeki alış ve satış fiyatların bu pazarlığa bağlı. Başaramazsan tüccar alınır, fiyatlar aleyhine döner.<br><br><small>Şansı karizma, ticaret becerisi ve Pazarlık yeteneği artırır.</small>"), opts);
  }

  private haggle(city: string, i: number): void {
    const s = this.s;
    const o = HAGGLE[i];
    const day = this.dayOf().day;
    const won = Math.random() < this.haggleChance(i);
    (s.haggle ??= {})[city] = { day, m: won ? o.gain : -o.loss };
    if (!won) {
      audio.play("bad");
      this.hud.toast(tr("Tüccar kaşlarını çattı: bugün fiyatlar %{n} aleyhine.", { n: Math.round(o.loss * 100) }), "bad");
      return;
    }
    s.hero.skills.ticaret += 6 + i * 6;
    audio.play("coin");
    const tip = this.hotTip(city);
    this.hud.toast(tr("El sıkıştınız! Bugün {c} çarşısında fiyatlar %{n} lehine.", { c: CITY_NAME[city], n: Math.round(o.gain * 100) }), "good");
    if (tip) this.hud.story(tr("Tüccarın fısıltısı"), "merchant", tip, tr("Aklımda"));
  }

  /** Başarılı pazarlığın ardından tüccarın verdiği tüyo: elindeki ya da buranın ucuz malı için en iyi alıcı şehir. */
  private hotTip(city: string): string | null {
    const h = this.s.hero;
    const carried = GOOD_KEYS.filter((k) => (h.cargo[k] ?? 0) > 0);
    const pool = carried.length ? carried : GOOD_KEYS.filter((k) => this.price(city, k) < GOODS[k].base * 0.9);
    let best: { to: string; k: Good; sell: number; gain: number } | null = null;
    for (const k of pool) {
      const here = carried.length ? Math.round((h.paid[k] ?? 0) / Math.max(1, h.cargo[k] ?? 1)) : this.buyPrice(city, k);
      for (const c of CITIES) {
        if (c.id === city || this.hostile(c.id)) continue;
        const sell = this.sellPrice(c.id, k);
        if (!best || sell - here > best.gain) best = { to: c.id, k, sell, gain: sell - here };
      }
    }
    if (!best || best.gain <= 0) return null;
    this.noteIntel(best.to);
    const ev = this.s.events.find((e) => e.city === best!.to && e.good === best!.k && e.mult > 1);
    return tr("\"Sana bir sır vereyim, yiğit: {c} çarşısında {g} şu an ~{p} altına alıcı buluyor{w}. Kimseye söyleme.\"<br><br><small>{c} çarşısının güncel fiyatlarını artık biliyorsun.</small>", {
      c: CITY_NAME[best.to],
      g: GOODS[best.k].name,
      p: best.sell,
      w: ev ? tr(" (kıtlık var)") : "",
    });
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
    return [0, 0.03, 0.03, 0.06, 0.06][this.cityRank(city)] + (this.pact(factionOf(city), "trade") ? TRADE_BONUS : 0);
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
    return Math.round(this.hireCost(u) * (f.unit === u && this.cityRank(city) >= 2 ? 0.7 : 1) * ((this.s.vakif?.[city] ?? 0) >= 2 ? 0.85 : 1));
  }

  // ---------- altın harcama yerleri ----------

  feastCost(): number {
    return 20 + 4 * armySize(this.s.hero.army);
  }

  /** Şehirde orduya şölen: sonraki üç savaşta +%10 güç. */
  armyFeast(): void {
    const s = this.s;
    if (!s.free || this.nearCity() < 0 || armySize(s.hero.army) < 1) return;
    if (this.buff("ziyafet")) return this.hud.toast(tr("Askerlerin hâlâ son şölenin tadını çıkarıyor."), "info");
    if (!this.pay({ gold: this.feastCost() })) return this.hud.toast(tr("Altın yetersiz"), "bad");
    s.buffs.ziyafet = 3;
    this.bondEvent("win");
    audio.play("coin");
    this.hud.toast(tr("Kazanlar kaynadı, kımız aktı. Ordun sonraki üç savaşta +%10 güçlü."), "good");
  }

  vakifLv(city: string): number {
    return this.s.vakif?.[city] ?? 0;
  }

  /** Bir şehirde imaret/vakıf: her basamak katlanarak pahalı, şöhret + kut ve kalıcı yerel fayda verir. */
  endow(city: string): void {
    const s = this.s;
    const lv = this.vakifLv(city);
    const v = VAKIF[lv];
    if (!v || !s.free || this.nearCity() < 0 || CITIES[this.nearCity()].id !== city) return;
    if (!this.pay({ gold: v.cost })) return this.hud.toast(tr("Altın yetersiz"), "bad");
    (s.vakif ??= {})[city] = lv + 1;
    s.renown += v.renown;
    this.addKut(v.kut);
    this.addRep(factionOf(city), 5 + 5 * lv, tr("vakıf"));
    this.chron(`${s.hero.name}, ${CITY_NAME[city]} şehrinde ${v.name.toLocaleLowerCase("tr")} yaptırdı.`);
    audio.play("quest");
    this.hud.toast(`${tr(v.name)}: +${v.renown} ${tr("şöhret")}, kut +${v.kut} · ${tr(v.perk)}`, "good");
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
    this.note("ticaret");
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
    this.note("ticaret");
    if (this.shortage(city) >= 3) this.addShort(city, -Math.min(2, k0 / 10));
    this.addXp(Math.max(0, Math.floor(profit / 15)));
    this.hud.toast(`${k0} ${GOODS[g].name} satıldı: +${got} altın (${profit >= 0 ? "kâr" : "zarar"} ${Math.abs(profit)})`, profit >= 0 ? "good" : "bad");
  }

  /** Bugün bu şehre satılan ham madde; pazar doydukça fiyat düşer. */
  private resSold(): Record<string, number> {
    const s = this.s, day = this.dayOf().day;
    if (!s.resMkt || s.resMkt.day !== day) s.resMkt = { day, sold: {} };
    return s.resMkt.sold;
  }

  private resSat(sold: number): number {
    return Math.max(RES_SAT_MIN, 1 - sold / RES_SAT);
  }

  resPrice(k: keyof Res): number {
    const ci = this.nearCity();
    const sat = ci >= 0 ? this.resSat(this.resSold()[CITIES[ci].id] ?? 0) : 1;
    return Math.max(1, Math.round(RES_SELL[k] * this.sellFactor() * sat * 10) / 10);
  }

  sellRes(k: keyof Res, n: number): void {
    const q = Math.min(n, Math.floor(this.s.res[k]));
    const ci = this.nearCity();
    if (q <= 0 || k === "gold" || ci < 0) return;
    const sold = this.resSold();
    const id = CITIES[ci].id;
    const s0 = sold[id] ?? 0;
    const sat = (this.resSat(s0) + this.resSat(s0 + q)) / 2;
    sold[id] = s0 + q;
    this.s.res[k] -= q;
    const got = Math.max(1, Math.round(q * RES_SELL[k] * this.sellFactor() * sat));
    this.s.res.gold += got;
    this.hud.toast(`${q} ${({ wood: "kereste", stone: "taş", food: "yiyecek" } as Record<string, string>)[k]} satıldı: +${got} altın${sat < 0.9 ? ` · ${tr("pazar doydu, fiyat düştü")}` : ""}`, "good");
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
    audio.play("anvil");
    setTimeout(() => audio.play("anvil"), 600);
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
    const world = this.worldSide(city, taken);
    if (world) return world;
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

  /** Dünyanın durumundan doğan görevler: kıtlık yardımı, cephe erzakı. */
  private worldSide(city: string, taken: SideQuest[]): SideQuest | null {
    const s = this.s;
    const w = s.wd;
    if (!w || Math.random() < 0.45) return null;
    const lv = s.hero.lv;
    const from = CITIES.find((x) => x.id === city)!;
    const base = (diff: number) => ({ gold: Math.round((40 + 22 * lv) * diff), xp: Math.round((25 + 12 * lv) * diff), renown: Math.max(3, Math.round(2.5 * diff)) });
    const war = w.wars.find((x) => x.side && factionOf(city) === x.side);
    if (war && !taken.some((q) => q.war)) {
      const foe = war.side === war.a ? war.b : war.a;
      const front = citiesOf(war.side!).filter((c) => c !== city).map((c) => CITIES.find((x) => x.id === c)!).sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0];
      if (front) {
        const good: Good = Math.random() < 0.6 ? "demir" : "deri";
        const diff = 1.6 + Math.hypot(front.x - from.x, front.y - from.y) / 1800;
        return { id: s.nextId++, city, kind: "deliver", giver: tr("Ordu kâhyası"), title: tr("Cephe erzakı"), text: tr("{c} cephesine {n} {g} götür. Ordunun kılıcı keskin, atı tok olsun.", { c: CITY_NAME[front.id], n: 6, g: GOODS[good].name }), need: 6, base: 0, to: front.id, good, item: true, war: foe, ...base(diff) };
      }
    }
    const sick = CITIES.filter((c) => c.id !== city && (w.plague?.[c.id] ?? 0) >= 1.5 && !this.hostile(c.id) && !taken.some((q) => q.cure && q.to === c.id))[0];
    if (sick) {
      const diff = 1.5 + Math.hypot(sick.x - from.x, sick.y - from.y) / 1800;
      const n = Math.min(8, 3 + Math.floor(lv / 5));
      return { id: s.nextId++, city, kind: "deliver", giver: tr("Şifacı Lokman"), title: tr("Şifa kervanı"), text: tr("{c} salgınla boğuşuyor. Şifacılara {n} {g} götür; ilaç kaynatacaklar.", { c: CITY_NAME[sick.id], n, g: GOODS.baharat.name }), need: n, base: 0, to: sick.id, good: "baharat", item: true, aid: true, cure: true, ...base(diff) };
    }
    const hungry = CITIES.filter((c) => c.id !== city && (w.short[c.id] ?? 0) >= 3 && !this.hostile(c.id) && !taken.some((q) => q.aid && q.to === c.id)).sort((a, b) => (w.short[b.id] ?? 0) - (w.short[a.id] ?? 0))[0];
    if (hungry) {
      const good: Good = oneOf(["pamuk", "deri", "baharat"] as Good[]);
      const diff = 1.3 + Math.hypot(hungry.x - from.x, hungry.y - from.y) / 1800;
      const n = Math.min(10, 4 + Math.floor(lv / 4));
      return { id: s.nextId++, city, kind: "deliver", giver: oneOf(GIVERS), title: tr("Kıtlık yardımı"), text: tr("{c} aç kaldı. Oraya {n} {g} götür; halk seni unutmaz.", { c: CITY_NAME[hungry.id], n, g: GOODS[good].name }), need: n, base: 0, to: hungry.id, good, item: Math.random() < 0.5, aid: true, ...base(diff) };
    }
    return null;
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
      if (q.cure && q.to && this.s.wd?.plague[q.to]) {
        this.s.wd.plague[q.to] = Math.max(0.1, this.s.wd.plague[q.to] - 3);
        this.hud.toast(tr("Şifalı otlar kaynatıldı; {c} nefes aldı.", { c: CITY_NAME[q.to] }), "good");
      }
      if (q.aid && q.to) {
        this.addShort(q.to, -5);
        this.addKut(2);
        this.remember(true, tr("{c} kıtlığında erzak getirdin", { c: CITY_NAME[q.to] }));
      }
      if (q.war) {
        this.warHit(q.war, 18);
        this.hud.toast(tr("Erzak cepheye ulaştı; ordu ileri atıldı."), "good");
      }
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
    [0, 700, 1400].forEach((ms) => setTimeout(() => audio.play("anvil"), ms));
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
          .filter((x) => x.cp.alive && !used.has(x.i) && x.d < 1500 * WS)
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
      case "kale":
        return s.forts[t.i] ?? null;
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
      case "kip":
        return this.kipPois()[t.i] ?? null;
      case "mongol":
        return this.mongolPos();
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
    if (this.trip) this.tripEnd();
    if ((t.kind === "city" || t.kind === "capital") && this.s.free && settings.cine) this.tripStart(t.kind === "city" ? t.i : CAP_I, path);
  }

  biomeAt(x: number, y: number): Biome {
    const i = Math.min(GH - 1, Math.max(0, Math.floor((y / H) * GH))) * GW + Math.min(GW - 1, Math.max(0, Math.floor((x / W) * GW)));
    const h = this.world.height[i] ?? 0.2;
    const m = this.world.moist[i] ?? 0.4;
    return h > 0.46 ? "dag" : m < 0.26 ? "kum" : m > 0.5 ? "cayir" : "bozkir";
  }

  tripEnv(): Env {
    const h = this.s.hero;
    return { t: this.dayOf().t, season: this.season(), biome: this.biomeAt(h.x, h.y) };
  }

  tripClock(): string {
    const { day, t } = this.dayOf();
    const hr = (12 + t * 24) % 24;
    return `${tr("Gün")} ${day} · ${String(Math.floor(hr)).padStart(2, "0")}:${String(Math.floor((hr % 1) * 60)).padStart(2, "0")}`;
  }

  tripProg(): number {
    const tp = this.trip;
    const h = this.s.hero;
    if (!tp || !h.path) return tp ? 1 : 0;
    const j = h.pathI / 2;
    const left = j < h.path.length / 2 ? Math.hypot(h.path[h.pathI] - h.x, h.path[h.pathI + 1] - h.y) : 0;
    return (tp.cum[Math.min(tp.cum.length - 1, j + 1)] - left) / tp.total;
  }

  private tripStart(to: number, path: number[]): void {
    const h = this.s.hero;
    const cum = [0];
    let px = h.x;
    let py = h.y;
    for (let k = 0; k < path.length; k += 2) {
      cum.push(cum[cum.length - 1] + Math.hypot(path[k] - px, path[k + 1] - py));
      px = path[k];
      py = path[k + 1];
    }
    const total = cum[cum.length - 1];
    if (total < TRIP_MIN || this.nearCity() === to) return;
    const from = this.nearCity(420);
    const biome = this.biomeAt(h.x, h.y);
    this.trip = { to, cum, total, t: 0, night: this.isNight(), biome, half: false, seen: new Set(), storm: false, flavor: 4 };
    this.hud.journeyOpen(from >= 0 && from !== to ? this.cityName(from) : tr("Bozkır"), this.cityName(to));
    const days = total / (this.heroSpeed() * DAY_SEC);
    this.hud.journeyLog(`${tr("Kervan yola çıktı.")} ${CITY_NAME[CITIES[to].id]}: ${days < 0.5 ? tr("yarım günlük yol") : `${Math.max(1, Math.round(days))} ${tr("günlük yol")}`}.`);
  }

  tripEnd(stop = false): void {
    if (!this.trip) return;
    this.trip = null;
    this.hud.journeyClose();
    if (stop) {
      this.s.hero.path = null;
      this.target = null;
      this.hud.toast(tr("Kervan mola verdi."), "info");
    }
  }

  private tripTick(dt: number): void {
    const tp = this.trip;
    if (!tp) return;
    const h = this.s.hero;
    const tg = this.target;
    if (this.nearCity() === tp.to) return this.tripEnd();
    if (!h.path || !tg || (tg.kind !== "city" && tg.kind !== "capital") || this.battleLock || this.hud.modal() || (tp.t > 0.5 && this.hud.panelOpen())) return this.tripEnd();
    tp.t += dt;
    const log = (s: string) => this.hud.journeyLog(s);
    const se = this.season();
    const b = this.biomeAt(h.x, h.y);
    if (b !== tp.biome) {
      tp.biome = b;
      log(tr(oneOf(TRIP_BIOME[b])));
    }
    const night = this.isNight();
    if (night !== tp.night) {
      tp.night = night;
      log(tr(oneOf(night ? TRIP_NIGHT : TRIP_DAWN)));
    }
    if (!tp.half && this.tripProg() > 0.5) {
      tp.half = true;
      log(tr("Yolun yarısı geride kaldı."));
    }
    const st = !!this.heroStorm();
    if (st && !tp.storm) log(tr("Fırtına! Develer çöktü, yüzler sarıldı; kervan ağır ağır ilerliyor."));
    tp.storm = st;
    this.s.villages.forEach((v, i) => {
      if (!tp.seen.has(i) && Math.hypot(v.x - h.x, v.y - h.y) < 170) {
        tp.seen.add(i);
        log(`${v.name} ${v.yurt ? tr("obasının çadırları yolun kıyısında tütüyor.") : tr("köyünün yanından geçildi.")}`);
      }
    });
    tp.flavor -= dt;
    if (tp.flavor <= 0) {
      tp.flavor = 9 + Math.random() * 6;
      log(tr(oneOf(TRIP_SEASON[se] ?? TRIP_SEASON.yaz)));
    }
  }

  private cityArrive(ci: number): void {
    const s = this.s;
    if (!s.free || !settings.cine || this.battleLock || this.hud.modal()) return;
    const id = CITIES[ci].id;
    if (this.trip && this.trip.to !== ci) {
      this.hud.journeyLog(`${CITY_NAME[id]} ${tr("surlarının dibinden geçildi; kervan durmadan yoluna devam ediyor.")}`);
      return;
    }
    const day = this.dayOf().day;
    const last = this.sceneDay[id];
    if (last !== undefined && day - last < 3) return;
    const vis = (s.visited ??= []);
    const first = !vis.includes(id);
    const tg = this.target;
    const aimed = (tg?.kind === "city" && tg.i === ci) || (tg?.kind === "capital" && ci === CAP_I);
    if (!first && !aimed) return;
    this.sceneDay[id] = day;
    if (first) vis.push(id);
    const lines: string[] = [];
    const fac = FACTIONS[factionOf(id)];
    lines.push(s.owned[id] ? tr("Senin şehrin") : `${fac.name} · ${this.hostile(id) ? tr("Düşman") : REP_RANKS[this.cityRank(id)].name}`);
    const rel = GOOD_KEYS.map((k) => ({ k, b: this.buyPrice(id, k) / GOODS[k].base, sl: this.sellPrice(id, k) / GOODS[k].base }));
    const cheap = [...rel].sort((a, b) => a.b - b.b).slice(0, 2).map((r) => GOODS[r.k].name);
    const dear = [...rel].sort((a, b) => b.sl - a.sl).slice(0, 2).map((r) => GOODS[r.k].name);
    lines.push(`${tr("Ucuz")}: ${cheap.join(", ")}`, `${tr("Kârlı satış")}: ${dear.join(", ")}`);
    if (this.sacked(id)) lines.push(tr("Moğol yağması: fiyatlar yüksek"));
    const ev = this.cityEv(id);
    if (ev) lines.push(ev.name);
    if (s.serais[id]) lines.push(tr("Kervansarayın burada"));
    this.hud.cityScene({ id, name: CITY_NAME[id], env: this.tripEnv(), tag: s.owned[id] ? tr("Beyliğinin şehri") : fac.short, lines, sacked: this.sacked(id), first });
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
    s.forts.forEach((f, i) => test({ kind: "kale", i }, f.x, f.y, 1.4 + f.tier * 0.15));
    if (s.story.fort && !s.story.done) test({ kind: "fort" }, s.story.fort.x, s.story.fort.y, 2);
    if (s.act2.gate && !s.act2.done) test({ kind: "gate" }, s.act2.gate.x, s.act2.gate.y, 2.2);
    if (s.act3.peak) test({ kind: "peak" }, s.act3.peak.x, s.act3.peak.y, 2.2);
    if (s.otag) test({ kind: "otag" }, s.otag.x, s.otag.y, 1.8);
    if (s.boy?.at) test({ kind: "boy" }, s.boy.at.x, s.boy.at.y, 2);
    if (s.free) this.kipPois().forEach((p, i) => test({ kind: "kip", i }, p.x, p.y, p.kind === "stone" ? 1.3 : 2));
    const mp = this.mongolPos();
    if (mp) test({ kind: "mongol" }, mp.x, mp.y, 2.4);
    return best;
  }

  heroSpeed(): number {
    const n = armySize(this.s.hero.army);
    return HERO_SPEED * (1 + this.stat("cev") * 0.02 + (this.eq("at")?.spd ?? 0) + this.compMods().speed + 0.04 * this.tal("ruzgar") + (this.gearMods().spd ?? 0) + (hasLegacy("noyan") ? 0.06 : 0)) * (1 - Math.min(0.35, n / 300)) * this.stormSlow(this.s.hero.x, this.s.hero.y) * this.sea().speed;
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
        if (armySize(this.s.hero.army) === 0 && this.s.free && Math.random() < 0.5) this.afterBattle = () => this.heroCaptured(c.name);
        return "";
      }
      if (b.tier >= 2 && Math.random() < 0.2) this.addCaptive({ name: tr("Harami başı {n}", { n: oneOf(BANDIT_CHIEFS) }), kind: "harami", from: null, value: 40 + 30 * b.tier });
      const saved = cv ? this.rescueCaravan(cv) : "";
      const gold = Math.round((armyPower(b.army) * 0.7 + 8 * b.tier) * this.cls().mods.loot * this.stealMult());
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
    const day = this.dayOf().day;
    if (day - (s.nemAt ?? -99) < (why === "camp" ? 4 : 2)) return;
    s.nemAt = day;
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
          this.addShort(cv.to, 1);
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
      this.addShort(cv.to, 2);
      this.warHit(fac, 8);
      this.remember(false, tr("{f} kervanını soydun", { f: FACTIONS[fac].short }));
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
    this.addShort(cv.to, -1);
    this.remember(true, tr("{f} kervanını haramilerden kurtardın", { f: FACTIONS[fac].short }));
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
    const wd = this.wd();
    const w = adaptWeights(stanceWeights(enemy, boss), wd.tac, boss ? 0.9 : 0.35 + Math.min(0.4, this.s.renown / 1500));
    const fav = favTactic(wd.tac);
    const day = this.dayOf().day;
    if (fav.n >= 6 && fav.share >= 0.6 && day - wd.tacWarn >= 3) {
      wd.tacWarn = day;
      this.hud.toast(tr("Düşmanlar senin {t} alışkanlığını öğrendi; artık {c} ile karşılıyorlar. Taktiğini değiştir!", { t: tr(TACTICS[fav.t].name), c: tr(TACTICS[counterOf(fav.t)].name) }), "bad");
    }
    let r = Math.random();
    const stance = TACTIC_KEYS.find((t) => (r -= w[t]) < 0) ?? "duvar";
    const known = this.scouts();
    const champ = this.champion();
    const field = this.fieldHere();
    this.lair = null;
    const opts = TACTIC_KEYS.map((t) => {
      const d = known ? this.tdelta(t, stance) : TACTIC_KEYS.reduce((a, f) => a + w[f] * this.tdelta(t, f), 0);
      return { t, odds: odds(h.army, this.heroBonus() + d, enemy, enemyBonus, champ, boss, field) };
    });
    const go = (t: Tactic, auto: boolean) => this.resolveBattle(title, enemy, enemyBonus, after, boss, foe, t, stance, auto, field, !auto && this.reserve);
    const best = opts.reduce((a, b) => (b.odds > a.odds ? b : a));
    if (!boss && best.odds >= 0.98) return go(best.t, true);
    const chased = this.s.bandits.some((b) => Math.hypot(b.x - h.x, b.y - h.y) < 80);
    const flee = chased ? (armySize(h.army) ? "Kaç · askerlerin %20'si geride kalır" : "Kaç · altınının %15'ini bırakırsın") : "Geri çekil";
    const told = Math.random() < TELL_TRUE ? stance : oneOf(TACTIC_KEYS.filter((k) => k !== stance));
    const tell = known ? null : tr(oneOf(TACTIC_TELLS[told]));
    this.hud.tactics(title, enemy, boss, foe, known ? stance : null, w, opts, this.lastTactic, (t) => go(t, false), flee, () => this.retreat(), tell, field);
  }

  fieldHere(): Field | null {
    if (this.deep || this.delve) return null;
    const h = this.s.hero;
    const hs = this.heroStorm();
    const winter = this.season() === "kis";
    const sky = hs ? (hs.kind === "kum" ? "kum" : winter ? "tipi" : "yagmur") : winter ? "kar" : null;
    const f: Field = { ground: this.biomeAt(h.x, h.y), night: this.isNight(), sky };
    const lair = this.lair;
    if (lair) {
      if (lair.ground) f.ground = lair.ground;
      if (lair.night) f.night = true;
      if (lair.sky) f.sky = lair.sky;
      f.note = lair.note;
    }
    return f;
  }

  /** Kampa saldırırken o çetenin yuvasına özgü savaş koşulu. */
  private lair: { ground?: Field["ground"]; night?: boolean; sky?: Field["sky"]; bonus: number; note: string } | null = null;

  private static LAIRS: Record<string, { ground?: Field["ground"]; night?: boolean; sky?: Field["sky"]; bonus: number; note: string }> = {
    "Dağ Kartalları": { ground: "dag", bonus: 0.05, note: "Sarp yamaç: okçuları yukarıda" },
    "Çöl Akrepleri": { ground: "kum", bonus: 0, note: "Kum tepeleri arasında" },
    "Gece Atlıları": { night: true, bonus: 0.05, note: "Gece baskını bekliyorlar" },
    "Kum Fırtınası": { sky: "kum", bonus: 0, note: "Fırtınanın içinden saldırıyorlar" },
    "Demir Pençe": { bonus: 0.15, note: "Kazıklı çit: savunmaları güçlü" },
    "Yılan Çetesi": { bonus: 0.1, note: "Dar geçitte pusu kurmuşlar" },
    "Kızıl Kurtlar": { ground: "bozkir", bonus: 0.05, note: "Açık bozkır: atlıları hızlı" },
    "Kara Çete": { bonus: 0, note: "Dağınık bir haramî obası" },
  };

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

  private resolveBattle(title: string, enemy: Army, enemyBonus: number, after: (win: boolean) => string, boss: Boss | null, foe: string, t: Tactic, stance: Tactic, auto: boolean, field: Field | null, reserve: boolean): void {
    const h = this.s.hero;
    this.lastTactic = auto ? this.lastTactic : t;
    if (!auto) noteTactic(this.wd().tac, t);
    this.note("savas");
    const champ = this.champion();
    const sim = new Sim(h.army, this.heroBonus() + this.tdelta(t, stance), enemy, enemyBonus, champ, boss, field, reserve);
    this.readEdge = !auto && TACTICS[t].beats === stance;
    const edge = auto ? "" : this.readEdge ? ` — <b class="cheap">${tr("düşmanı okudun! +%25 TP")}</b>` : TACTICS[stance].beats === t ? ` — <b class="dear">${tr("düşman seni okudu!")}</b>` : "";
    for (const k of Object.keys(this.s.buffs)) if (--this.s.buffs[k] <= 0) delete this.s.buffs[k];
    const tline = auto ? `${tr("Kolay av: taktiğe gerek kalmadı")} · ${tr("Düşman")}: ${TACTICS[stance].name}` : `Taktik: ${TACTICS[t].name} · Düşman: ${TACTICS[stance].name}${edge}`;
    const before = { ...h.army };
    const hpBefore = h.hp;
    const show = () =>
      this.hud.showBattle(title, before, enemy, sim, { hpBefore, maxHp: this.maxHp() }, boss, foe, auto, field, (res) => this.applyBattle(res, enemy, boss, after, tline, before, title), () => {
        this.battleLock = false;
        saveGame(this.s);
        const f = this.afterBattle;
        this.afterBattle = null;
        const sp = this.spoilQ;
        this.spoilQ = null;
        if (sp) this.offerSpoils(sp.title, sp.n, sp.enemy, () => f?.());
        else f?.();
      });
    if (!settings.duel || auto || boss || !field || armySize(enemy) < DUEL_MIN || armySize(h.army) < 10 || Math.random() > 0.6) return show();
    const zone = Math.max(0.08, Math.min(0.24, 0.15 + this.stat("cev") * 0.008 - Math.min(0.05, armySize(enemy) / 2000)));
    this.hud.duel(title, oneOf(DUEL_FOES), "j_bandit", zone, (hits) => {
      if (hits >= 0) this.battleRec().duelTry++;
      if (hits >= 2) {
        sim.opening(100, hits === 3 ? 55 : 68, "Er meydanını kazandın!");
        this.s.c.duels = (this.s.c.duels ?? 0) + 1;
      } else if (hits >= 0) sim.opening(hits === 1 ? 88 : 78, 100, "Erin yere serildi");
      show();
    });
  }

  private applyBattle(res: BattleResult, enemy: Army, boss: Boss | null, after: (win: boolean) => string, tline: string, before: Army, title: string): { xp: number; lvUp: boolean; note: string } {
    const h = this.s.hero;
    if (res.orders.includes("ricat")) this.s.c.turan = (this.s.c.turan ?? 0) + 1;
    const dead = armySize(res.lostA) + armySize(res.lostB);
    let woundNote = "";
    if (!this.deep && !this.delve && dead >= 4) {
      const sc = (this.s.scars ??= []);
      const w = Object.fromEntries(UNIT_KEYS.map((u) => [u, Math.floor(res.lostA[u] * WOUNDED_SHARE)])) as Army;
      const keep = !res.win && armySize(w) >= 2;
      sc.push({ x: Math.round(h.x), y: Math.round(h.y), t: this.s.time, n: dead, ...(keep ? { w } : {}) });
      if (sc.length > 12) sc.shift();
      if (keep) woundNote = tr("{n} yaralı yiğidin savaş yerinde bekliyor; üç gün içinde dönüp onları kurtar.", { n: armySize(w) });
    }
    const rec = this.battleRec();
    rec.fights++;
    if (res.win) rec.wins++;
    if (res.rout === "b") rec.routs++;
    if (res.rout === "a") rec.routed++;
    if (res.win && armySize(enemy) > (rec.best?.n ?? 0)) rec.best = { n: armySize(enemy), title, day: this.dayOf().day };
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
    const xp = Math.round((armyPower(enemy) + (boss ? boss.atk * Math.sqrt(boss.hp) * 0.8 : 0)) * (res.win ? 0.7 : 0.15) * (this.readEdge ? 1.25 : 1) * (res.win && res.rout === "b" ? 1.15 : 1) * this.eraXp()) + 3;
    if (this.readEdge) this.s.c.reads = (this.s.c.reads ?? 0) + 1;
    this.readEdge = false;
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
    let routNote = "";
    if (res.win && res.rout === "b") {
      const loot = Math.round(armySize(enemy) * 1.5) + 5;
      this.s.res.gold += loot;
      routNote = tr("Bozgun: kaçanları kovaladın, +{g} altın ve +%15 TP", { g: loot });
    }
    let spoilNote = "";
    const n = armySize(enemy);
    if (res.win && !boss && !this.deep && !this.delve && n >= SPOIL_MIN) {
      if (settings.spoils) {
        this.spoilQ = { title, n, enemy: { ...enemy } };
        spoilNote = tr("Meydanda ganimet bekliyor: pencereyi kapatınca seç.");
      } else {
        const gold = this.spoilGold(n);
        this.s.res.gold += gold;
        spoilNote = tr("Ganimet payı: +{g} altın", { g: gold });
      }
    }
    const note = [tline, extra || fled, woundNote, routNote, spoilNote, revived ? `Ruh Çağrısı: ${revived} asker hayata döndü` : "", vetNote].filter(Boolean).join("<br>");
    return { xp, lvUp, note };
  }

  private spoilQ: { title: string; n: number; enemy: Army } | null = null;

  private spoilGold(n: number): number {
    return Math.round((n * 3 + 30) * this.cls().mods.loot);
  }

  /** Büyük zaferden sonra üç ganimetten biri: altın, esir asker ya da silah yığınından bir eşya. */
  private offerSpoils(title: string, n: number, enemy: Army, then: () => void): void {
    const h = this.s.hero;
    const gold = this.spoilGold(n);
    const room = Math.max(0, this.heroCap() - armySize(h.army));
    const want = Math.max(1, Math.round(n * SPOIL_CAPTIVE));
    const take = Math.min(room, want);
    const total = Math.max(1, armySize(enemy));
    const recruits = Object.fromEntries(UNIT_KEYS.map((u) => [u, 0])) as Army;
    let left = take;
    for (const u of [...UNIT_KEYS].sort((a, b) => enemy[b] - enemy[a])) {
      const k = Math.min(left, Math.round((take * enemy[u]) / total));
      recruits[u] += k;
      left -= k;
    }
    recruits[UNIT_KEYS.reduce((a, b) => (enemy[a] >= enemy[b] ? a : b))] += left;
    const it = rollItem(this.s.nextId++, Math.min(5, 1 + Math.floor(n / 25)), this.cls(), 0.15);
    const unitTxt = UNIT_KEYS.filter((u) => recruits[u]).map((u) => `${recruits[u]} ${UNITS[u].name}`).join(", ");
    this.hud.spoils(
      title,
      [
        { icon: "coins", name: `+${gold} ${tr("altın")}`, desc: tr("Düşmanın keseleri ve sandıkları.") },
        { icon: "tug", name: `+${take || want} ${tr("asker")}`, desc: `${tr("Esirler safına geçer")}: ${unitTxt}`, off: take ? undefined : tr("Birliğinde yer yok") },
        { icon: it.icon, name: it.name, desc: `${RARITY[it.rar].name} · ${itemStats(it)}`, cls: `r${it.rar}` },
      ],
      (i) => {
        if (i === 0) {
          this.s.res.gold += gold;
          this.hud.toast(tr("Ganimet payı: +{g} altın", { g: gold }), "good");
        } else if (i === 1) {
          for (const u of UNIT_KEYS) h.army[u] += recruits[u];
          this.hud.toast(tr("{n} esir saflarına katıldı.", { n: take }), "good");
        } else {
          h.bag.push(it);
          this.hud.toast(`${tr("Heybene kondu")}: ${it.name}`, "good");
        }
        saveGame(this.s);
        then();
      },
    );
  }

  battleRec(): BattleRec {
    return (this.s.rec ??= { fights: 0, wins: 0, routs: 0, routed: 0, duelTry: 0, best: null });
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
    const lv0 = h.lv;
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
    if (up) this.lvQ ??= lv0;
    return up;
  }

  /** Yenilgi yerine dönen kahraman orada bekleyen yaralıları toplar. */
  private woundTick(): void {
    const s = this.s, h = s.hero;
    if (this.battleLock || this.deep || this.delve) return;
    for (const c of s.scars ?? []) {
      if (!c.w || Math.hypot(c.x - h.x, c.y - h.y) > 60) continue;
      let room = Math.max(0, this.heroCap() - armySize(h.army));
      let got = 0;
      for (const u of UNIT_KEYS) {
        const k = Math.min(room, c.w[u]);
        h.army[u] += k;
        room -= k;
        got += k;
      }
      const left = armySize(c.w) - got;
      delete c.w;
      this.hud.toast(got ? tr("Savaş yerinde yaralı yiğitlerini buldun: {n} asker yeniden saflarında.", { n: got }) + (left ? " " + tr("{n} kişiye yer yoktu, köylerine döndüler.", { n: left }) : "") : tr("Yaralıların seni bekliyordu ama birliğinde yer yok; köylerine döndüler."), got ? "good" : "info");
      if (got) audio.play("quest");
    }
  }

  private lvQ: number | null = null;

  /** Seviye atlama sunumu: savaş ekranı kapanınca altın sütun + başlık kartı. */
  private lvTick(): void {
    if (this.lvQ === null || this.battleLock || this.hud.covered) return;
    const h = this.s.hero, n = h.lv - this.lvQ;
    this.lvQ = null;
    const gains = [`+${3 * n} ${tr("stat puanı")}`, `+${n} ${tr("yetenek puanı")}`];
    const sp = Array.from({ length: n }, (_, k) => h.lv - k).filter((l) => l >= 3).length;
    if (sp) gains.push(`+${sp} ${tr("beceri puanı")}`);
    gains.push(tr("Can tamamen doldu"));
    const opened = this.classSkills().filter((k) => k.unlock > h.lv - n && k.unlock <= h.lv).map((k) => tr(k.name));
    if (opened.length) gains.push(`${tr("Yeni beceri")}: ${opened.join(", ")}`);
    this.view.levelUpFx();
    this.hud.levelUp(h.lv, gains, () => this.hud.menuTo("beceri"));
  }

  odds(enemy: Army, bonus = 0, boss: Boss | null = null): number {
    return odds(this.s.hero.army, this.heroBonus(), enemy, bonus, this.champion(), boss);
  }

  attackCamp(i: number): void {
    const c = this.s.camps[i];
    if (!c.alive) return;
    const lair = Game.LAIRS[c.name] ?? null;
    this.lair = lair;
    this.battle(`${c.name} kampı`, c.garrison, 0.1 + (lair?.bonus ?? 0), (win) => {
      this.lair = null;
      if (!win) return "";
      c.alive = false;
      c.respawnAt = this.now + 15 * 60000 * ERAS[this.wd().era].respawn;
      this.s.bandits = this.s.bandits.filter((b) => b.camp !== i);
      const thin = Math.max(0.35, Math.pow(0.7, c.clears ?? 0));
      c.clears = (c.clears ?? 0) + 1;
      const loot = { gold: Math.round((45 * c.tier * c.tier + 30) * thin * this.cls().mods.loot * this.stealMult()), wood: Math.round(40 * c.tier * thin), stone: Math.round(25 * c.tier * thin) };
      this.gain(loot);
      this.s.renown += c.tier * 8;
      this.s.c.camps++;
      this.s.mats.ruh += c.tier;
      if (c.clears % 3 === 1 && !this.s.nemeses.some((n) => n.alive && n.camp === i)) this.newNemesis(i, "camp");
      this.repNear(c.x, c.y, 5 * c.tier, "haramileri temizledin");
      let txt = `Kamp yerle bir edildi! +${loot.gold} altın, +${c.tier * 8} şöhret, +${c.tier} Ruh Taşı`;
      if (thin < 1) txt += `<br><small>${tr("Bu kamp daha önce yağmalanmıştı; sandıkları yarı boş.")}</small>`;
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
    if (city && fortIndex(city) >= 0) return { ...h };
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
    return Math.max(0, wallBonus(factionOf(city), this.s.engines) - (this.pact(factionOf(city), "intel") ? INTEL_WALL : 0));
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
    const f = factionOf(city);
    if (this.pact(f, "peace")) {
      this.dip(f).peace = 0;
      s.rep[f] = Math.max(-500, this.rep(f) - 200);
      this.addKut(-4, "ant bozuldu");
      this.chron(`${s.hero.name}, ${FACTIONS[f].ruler} ile yaptığı antı bozup ${CITY_NAME[city]} surlarına yürüdü.`);
    }
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
      const fi = fortIndex(r.city);
      if (fi >= 0) this.captureFort(fi, true);
      else this.conquerCity(r.city, true);
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
    const f = this.s.forts[fortIndex(r.city)];
    if (r.day === 1) this.s.engines = r.engines;
    else if (f) f.gar = { ...r.gar };
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
    const fi = fortIndex(r.city);
    if (fi >= 0) this.fortAssault(fi, siegeGar(r), siegeWall(r), r.engines);
    else this.assault(r.city, siegeGar(r), siegeWall(r), r.engines);
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
    this.warHit(f, 60);
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

  // ---------- kaleler ----------

  fortTitle(i: number): string {
    const f = this.s.forts[i];
    return f ? `${f.name} ${tr(FORT_TIERS[f.tier].name)}` : "?";
  }

  siegeName(id: string): string {
    const i = fortIndex(id);
    return i >= 0 ? this.fortTitle(i) : CITY_NAME[id] ?? id;
  }

  fortOwnerName(o: FortOwner): string {
    return o === "me" ? tr("Senin tuğun") : o === "harami" ? tr("Haramiler") : FACTIONS[o].name;
  }

  fortNear(i: number): boolean {
    const f = this.s.forts[i];
    return !!f && Math.hypot(f.x - this.s.hero.x, f.y - this.s.hero.y) < FORT_NEAR;
  }

  fortReason(i: number, ignoreNear = false): string {
    const s = this.s;
    const f = s.forts[i];
    if (!f) return "?";
    if (f.owner === "me") return tr("Bu kale zaten senin.");
    if (!s.free) return tr("Önce özgürlüğünü kazan.");
    const need = FORT_TIERS[f.tier].lv - FORT_LV_SLACK;
    if (s.hero.lv < need) return tr("Bu surlara en az {n}. seviyede yürünür.", { n: need });
    if (this.siegeRun) return tr("Zaten bir kuşatmadasın.");
    if (armySize(s.hero.army) < FORT_MIN_ARMY) return tr("Kuşatma için birliğinde en az {n} asker olmalı.", { n: FORT_MIN_ARMY });
    if (!ignoreNear && !this.fortNear(i)) return tr("Önce kalenin önüne git.");
    return "";
  }

  kaleOdds(i: number): number {
    const f = this.s.forts[i];
    return f ? odds(this.s.hero.army, this.heroBonus(), f.gar, fortWall(f, this.s.engines), this.champion(), null) : 0;
  }

  besiegeFort(i: number): void {
    if (this.fortReason(i)) return;
    const s = this.s;
    const f = s.forts[i];
    if (f.owner !== "harami" && f.owner !== "me") {
      const fac = f.owner;
      s.rep[fac] = Math.max(-500, this.rep(fac) - 60);
      if (this.pact(fac, "peace")) {
        this.dip(fac).peace = 0;
        this.addKut(-3, "ant bozuldu");
      }
    }
    this.note("kusatma");
    this.siegeRun = newSiege(fortKey(i), fortWall(f, s.engines), f.gar, s.engines, Math.random);
    this.siegeRun.relief = f.owner === "harami" ? 99 : 5 + Math.floor(Math.random() * 3);
    s.engines = 0;
    this.siegeRun.log.unshift({ t: f.owner === "harami" ? tr("Haramiler kapıları sürgüledi; burçlardan ok yağıyor. Bunlara yardım gelmez.") : tr("Ordun kalenin önüne çadır kurdu. Burçlarda {f} sancağı dalgalanıyor.", { f: this.fortOwnerName(f.owner) }), cls: "" });
    audio.play("quest");
    this.hud.openSiege();
  }

  private fortAssault(i: number, gar: Army, wall: number, used: number): void {
    const f = this.s.forts[i];
    const name = this.fortTitle(i);
    this.battle(tr("{n} kuşatması", { n: name }), gar, wall, (win) => {
      if (!win) {
        f.lost++;
        f.gar = fortGarrison(f.tier, f.owner, f.lost);
        return `<p class="warn">${tr("{n} surları dayandı.", { n: name })} ${used ? tr("Mancınıkların yakıldı.") : ""} ${tr("Garnizon kayıp verdi; bir dahaki kuşatmada daha zayıf olacak.")}</p>`;
      }
      return this.captureFort(i, false);
    }, null, f.owner === "harami" ? tr("Kale haramileri") : tr("{f} garnizonu", { f: FACTIONS[f.owner as FactionId].short }));
  }

  private fortClear(i: number): number {
    const s = this.s;
    const f = s.forts[i];
    const r = FORT_TIERS[f.tier].guard;
    let n = 0;
    s.camps.forEach((c, ci) => {
      if (!c.alive || Math.hypot(c.x - f.x, c.y - f.y) > r) return;
      c.alive = false;
      c.respawnAt = this.now + DAY_SEC * 1000;
      s.bandits = s.bandits.filter((b) => b.camp !== ci);
      n++;
    });
    return n;
  }

  fortGuard(x: number, y: number): boolean {
    return this.s.forts.some((f) => f.owner === "me" && Math.hypot(f.x - x, f.y - y) < FORT_TIERS[f.tier].guard);
  }

  private captureFort(i: number, peaceful: boolean): string {
    const s = this.s;
    const f = s.forts[i];
    const name = this.fortTitle(i);
    const prev = f.owner;
    if (prev !== "harami" && prev !== "me") {
      s.rep[prev] = Math.max(-500, this.rep(prev) - (peaceful ? 40 : 80));
      this.warHit(prev, 20 + 8 * f.tier);
    }
    f.owner = "me";
    f.lost = 0;
    f.since = this.dayOf().day;
    f.coffer = 0;
    f.threat = null;
    f.gar = { spear: 3 * f.tier, archer: 2 * f.tier, horse: f.tier };
    const gold = Math.round((160 * f.tier * f.tier + 120) * this.stealMult() * (prev === "harami" ? 1.25 : 1));
    this.gain({ gold, stone: 80 * f.tier });
    const ren = 12 * f.tier + (peaceful ? 4 : 0);
    s.renown += ren;
    s.mats.ruh += f.tier;
    s.c.forts = (s.c.forts ?? 0) + 1;
    const xp = 90 * f.tier * f.tier;
    this.addXp(xp);
    const cleared = this.fortClear(i);
    if (!peaceful && prev !== "harami" && prev !== "me" && Math.random() < 0.45) this.addCaptive({ name: oneOf(NOBLE_NAMES), kind: "soylu", from: prev, value: 120 + 80 * f.tier });
    this.addKut(1 + f.tier, `${name} alındı`);
    this.repNear(f.x, f.y, 4 * f.tier, "yolları güvene aldın");
    this.chron(peaceful ? `${name} kan dökülmeden ${gen(s.hero.name)} tuğuna boyun eğdi.` : `${name} burçlarına ${gen(s.hero.name)} tuğu dikildi.`);
    audio.play("quest");
    let txt = tr("{n} senin! +{g} altın, +{r} şöhret, +{x} TP", { n: name, g: gold, r: ren, x: xp });
    if (cleared) txt += `<br>${tr("Çevredeki {n} harami kampı dağıldı; bu yollar artık senin korumanda.", { n: cleared })}`;
    const it = this.drop(Math.min(5, f.tier + 1), f.tier >= 3 ? 1 : 0.6);
    if (it) txt += `<br>${tr("Ganimet")}: <b class="r${it.rar}">${it.name}</b>`;
    txt += `<br>${tr("Kale her gün {n} altın vergi toplar. Garnizonu güçlendir; komşular onu geri almak isteyecek.", { n: FORT_TIERS[f.tier].income })}`;
    if (peaceful) this.hud.story(tr("{n} teslim oldu!", { n: name }), "icons/fortress", tr("Kapılar açıldı, muhafızlar silahlarını bıraktı.") + "<br><br>" + txt, tr("Kaleye gir"));
    saveGame(s);
    return `<p class="good">${txt}</p>`;
  }

  fortCollect(i: number): void {
    const f = this.s.forts[i];
    if (!f || f.owner !== "me" || f.coffer < 1 || !this.fortNear(i)) return;
    const n = Math.floor(f.coffer);
    f.coffer = 0;
    this.gain({ gold: n });
    audio.play("coin");
    this.hud.toast(tr("{k} kasasından {n} altın aldın.", { k: this.fortTitle(i), n }), "good");
  }

  fortMove(i: number, put: boolean): void {
    const s = this.s;
    const f = s.forts[i];
    if (!f || f.owner !== "me" || !this.fortNear(i)) return;
    const [from, to] = put ? [s.hero.army, f.gar] : [f.gar, s.hero.army];
    let moved = 0;
    for (const u of UNIT_KEYS) {
      const n = Math.min(from[u], put ? 5 : from[u]);
      from[u] -= n;
      to[u] += n;
      moved += n;
    }
    if (moved) this.hud.toast(put ? tr("Garnizona {n} asker bıraktın.", { n: moved }) : tr("Garnizondan {n} asker birliğine katıldı.", { n: moved }), "good");
  }

  fortWallCost(i: number): { gold: number; stone: number } | null {
    const f = this.s.forts[i];
    return f && f.wall < FORT_WALL_MAX ? FORT_WALL_COST[f.wall] : null;
  }

  fortBuild(i: number): void {
    const f = this.s.forts[i];
    const cost = this.fortWallCost(i);
    if (!f || f.owner !== "me" || !cost || !this.fortNear(i)) return;
    if (!this.pay(cost)) {
      this.hud.toast(tr("Bunun için yeterli kaynağın yok."), "bad");
      return;
    }
    f.wall++;
    audio.play("quest");
    this.hud.toast(tr("{k} surları yükseldi (savunma +%10).", { k: this.fortTitle(i) }), "good");
    saveGame(this.s);
  }

  fortDefenseOdds(i: number): number {
    const f = this.s.forts[i];
    if (!f?.threat) return 0;
    const foe = this.fortFoe(f.tier, f.threat.n, f.threat.from);
    const near = this.fortNear(i) || Math.hypot(f.x - this.s.hero.x, f.y - this.s.hero.y) < FORT_NEAR * 3;
    const mine = near ? this.addArmy(this.s.hero.army, f.gar) : f.gar;
    return odds(mine, near ? this.heroBonus() : 0, foe, -fortDefense(f), near ? this.champion() : null, null);
  }

  private addArmy(a: Army, b: Army): Army {
    return { spear: a.spear + b.spear, archer: a.archer + b.archer, horse: a.horse + b.horse };
  }

  private fortFoe(tier: number, n: number, from: FortOwner): Army {
    void tier;
    return from === "harami" ? { spear: Math.round(n * 0.3), archer: Math.round(n * 0.25), horse: Math.round(n * 0.45) } : { spear: Math.round(n * 0.5), archer: Math.round(n * 0.3), horse: Math.round(n * 0.2) };
  }

  private fortDaily(day: number): void {
    const s = this.s;
    s.forts.forEach((f, i) => {
      if (f.owner !== "me") {
        if (f.lost > 0 && Math.random() < 0.12) f.lost--;
        const full = fortGarrison(f.tier, f.owner, f.lost);
        for (const u of UNIT_KEYS) f.gar[u] = Math.min(full[u], f.gar[u] + Math.ceil(full[u] * 0.1));
        return;
      }
      const T = FORT_TIERS[f.tier];
      f.coffer = Math.min(T.income * FORT_COFFER_DAYS, f.coffer + T.income);
      if (f.threat && day >= f.threat.day) {
        if (Math.hypot(f.x - s.hero.x, f.y - s.hero.y) < FORT_NEAR * 3 && !this.battleLock && !this.siegeRun) this.fortAlarm(i);
        else this.fortAuto(i);
        return;
      }
      if (f.threat || day - f.since < 3 || Math.random() > 0.05 + 0.025 * f.tier) return;
      const near = CITIES.reduce((a, c) => (Math.hypot(c.x - f.x, c.y - f.y) < Math.hypot(a.x - f.x, a.y - f.y) ? c : a));
      const from: FortOwner = Math.random() < 0.5 ? "harami" : factionOf(near.id);
      const n = Math.round(T.gar * (0.55 + Math.min(0.65, (day - f.since) * 0.02)));
      f.threat = { day: day + 2, n, from };
      const who = this.fortOwnerName(from);
      this.chron(`${who}, ${this.fortTitle(i)} üzerine yürüyor.`);
      audio.play("lose");
      this.hud.toast(tr("{w} {k} üzerine yürüyor! 2 gün içinde surlara varacaklar (~{n} asker).", { w: who, k: this.fortTitle(i), n }), "bad");
    });
  }

  private fortAuto(i: number): void {
    const s = this.s;
    const f = s.forts[i];
    const th = f.threat!;
    f.threat = null;
    const res = fight(f.gar, fortDefense(f), this.fortFoe(f.tier, th.n, th.from), 0);
    const name = this.fortTitle(i);
    if (res.win) {
      f.gar = { ...res.rounds[res.rounds.length - 1].a };
      s.renown += 2 * f.tier;
      audio.play("quest");
      this.hud.toast(tr("{k} garnizonu saldırıyı püskürttü!", { k: name }), "good");
    } else this.loseFort(i, th.from);
  }

  private fortAlarm(i: number): void {
    const f = this.s.forts[i];
    const th = f.threat!;
    const p = Math.round(this.fortDefenseOdds(i) * 100);
    this.hud.choice(tr("{k} kuşatıldı!", { k: this.fortTitle(i) }), "icons/fortress", tr("{w} ordusu (~{n} asker) surların önünde. Yakındasın: burçlara çıkıp garnizonla birlikte savaşabilirsin.", { w: this.fortOwnerName(th.from), n: th.n }), [
      { label: tr("Surlara çık · şans %{p}", { p }), cls: "", fn: () => this.defendFort(i) },
      { label: tr("Garnizona güven"), cls: "", fn: () => this.fortAuto(i) },
    ]);
  }

  private defendFort(i: number): void {
    const s = this.s;
    const f = s.forts[i];
    const th = f.threat;
    if (!th) return;
    const g0 = { ...f.gar };
    const tot = this.addArmy(s.hero.army, g0);
    s.hero.army = { ...tot };
    f.gar = army();
    this.retreatHook = () => {
      for (const u of UNIT_KEYS) s.hero.army[u] -= g0[u];
      f.gar = g0;
      this.fortAuto(i);
    };
    this.battle(tr("{k} savunması", { k: this.fortTitle(i) }), this.fortFoe(f.tier, th.n, th.from), -fortDefense(f), (win) => {
      this.retreatHook = null;
      for (const u of UNIT_KEYS) {
        const left = s.hero.army[u];
        const back = tot[u] ? Math.min(left, Math.round((g0[u] * left) / tot[u])) : 0;
        s.hero.army[u] -= back;
        f.gar[u] += back;
      }
      f.threat = null;
      if (!win) {
        this.loseFort(i, th.from, true);
        return `<p class="warn">${tr("Surlar düştü.")}</p>`;
      }
      s.renown += 5 * f.tier;
      this.addKut(2, "kale savunması");
      this.chron(`${this.fortTitle(i)} surlarında ${s.hero.name} düşmanı geri püskürttü.`);
      return `<p class="good">${tr("Saldırı püskürtüldü! +{r} şöhret", { r: 5 * f.tier })}</p>`;
    }, null, this.fortOwnerName(th.from));
  }

  private loseFort(i: number, to: FortOwner, quiet = false): void {
    const f = this.s.forts[i];
    const name = this.fortTitle(i);
    f.owner = to === "me" ? "harami" : to;
    f.lost = 1;
    f.wall = Math.max(0, f.wall - 1);
    f.coffer = 0;
    f.threat = null;
    f.gar = fortGarrison(f.tier, f.owner, 1);
    this.addKut(-3, `${name} düştü`);
    audio.play("lose");
    this.chron(`${name}, ${this.fortOwnerName(f.owner)} eline geçti.`);
    if (!quiet) this.hud.story(tr("{k} kaybedildi", { k: name }), "icons/fortress", tr("{w} surları aştı; garnizonun kılıçtan geçirildi. Kaleyi yeniden almak için kuşatman gerekecek.", { w: this.fortOwnerName(f.owner) }), tr("Acı haber"));
    saveGame(this.s);
  }

  // ---------- yaşayan dünya ----------

  wd(): WorldState {
    return (this.s.wd ??= newWorld());
  }

  /** Oyuncunun ne yaptığını kaydeder; yönetmen tekrarı fark edip sürpriz çıkarır. */
  note(k: Style): void {
    const w = this.wd();
    w.acts.push({ d: this.dayOf().day, k });
    if (w.acts.length > 60) w.acts.splice(0, w.acts.length - 60);
  }

  /** Dünya hafızası: iyilik de kötülük de bir gün geri döner. */
  remember(good: boolean, what: string): void {
    const w = this.wd();
    const h = this.s.hero;
    w.deeds.push({ d: this.dayOf().day, good, x: h.x, y: h.y, what });
    if (w.deeds.length > 24) w.deeds.shift();
  }

  playStyle(): { now: string; life: string } {
    const w = this.wd();
    return { now: STYLE_NAME[styleMix(w.acts, this.dayOf().day).top], life: STYLE_NAME[lifeStyle(w.acts)] };
  }

  warOf(f: FactionId): War | undefined {
    return this.wd().wars.find((x) => x.a === f || x.b === f);
  }

  shortage(city: string): number {
    return this.s.wd?.short[city] ?? 0;
  }

  addShort(city: string, n: number): void {
    const w = this.wd();
    w.short[city] = Math.max(0, Math.min(SHORT_MAX, (w.short[city] ?? 0) + n));
  }

  /** Şehir fiyatlarına dünya etkisi: kıtlık, çağ, savaş. */
  worldMult(city: string): number {
    const w = this.s.wd;
    if (!w) return 1;
    return shortMult(w.short[city] ?? 0) * ERAS[w.era].price * (this.warOf(factionOf(city)) ? 1.05 : 1) * (1 + 0.03 * (w.plague?.[city] ?? 0));
  }

  eraXp(): number {
    return ERAS[this.s.wd?.era ?? "kurulus"].xp;
  }

  moonBonus(): number {
    return this.moon === "dolunay" && this.isNight() ? 0.05 : 0;
  }

  /** Oyuncunun bir devlete karşı yaptığı her şey cepheye yansır. */
  warHit(f: FactionId, n: number): void {
    const war = this.warOf(f);
    if (!war) return;
    war.score += f === war.a ? -n : n;
    if (war.side && war.side !== f) war.help += n;
  }

  private worldDaily(day: number): void {
    if (!this.s.free) return;
    this.moon = moonKind(moonPhase(new Date()));
    this.warDaily(day);
    this.econDaily(day);
    this.natureDaily(day);
    this.eraDaily(day);
    this.memoryDaily(day);
    this.surpriseDaily(day);
    this.festDaily();
    this.omensDaily(day);
    this.plagueDaily(day);
    this.captiveDaily();
    this.toyDaily(day);
    this.guildDaily(day);
  }

  private facPower(f: FactionId): number {
    return citiesOf(f).length * 10 + this.s.forts.filter((x) => x.owner === f).length * 3 + 5;
  }

  private warDaily(day: number): void {
    const w = this.wd();
    for (const war of [...w.wars]) {
      const pa = this.facPower(war.a);
      const pb = this.facPower(war.b);
      const lean = war.side ? (war.side === war.a ? 4 : -4) : 0;
      war.score += ((pa - pb) / (pa + pb)) * 14 + lean + (Math.random() - 0.5) * 34;
      if (Math.abs(war.score) >= WAR_TAKE) this.warTake(war);
      if (day - war.since > WAR_MAX_DAYS || (day - war.since > 14 && Math.random() < 0.05)) this.warEnd(war, day);
    }
    if (day < WAR_MIN_DAY || w.wars.length >= 2 || this.s.mongol?.stage === 2) return;
    const busy = (f: FactionId) => w.wars.some((x) => x.a === f || x.b === f);
    const pairs = WAR_PAIRS.filter(([a, b]) => !busy(a) && !busy(b) && (w.peaceUntil[warKey(a, b)] ?? 0) <= day);
    if (!pairs.length) return;
    const [a, b] = oneOf(pairs);
    if (Math.random() > WAR_CHANCE * Math.sqrt(RULER_TRAITS[this.rulerTrait(a)].war * RULER_TRAITS[this.rulerTrait(b)].war)) return;
    this.warStart(a, b, day);
  }

  rulerTrait(f: FactionId): RulerTrait {
    return this.s.wd?.rulers[f]?.trait ?? BASE_TRAIT[f];
  }

  /** Hükümdarlar ölür, tahta yenileri geçer; yeni hükümdar seni eskisi kadar tanımaz. */
  private successions(day: number): void {
    const s = this.s;
    const w = this.wd();
    for (const f of FACTION_KEYS) {
      const lost = w.wars.some((x) => (x.a === f && x.takes < -1) || (x.b === f && x.takes > 1));
      if (Math.random() > (lost ? 0.3 : 0.12)) continue;
      const old = FACTIONS[f].ruler;
      const pool = HEIRS[f].filter(([n]) => n !== old);
      const [name, g] = oneOf(pool);
      const trait = oneOf(Object.keys(RULER_TRAITS) as RulerTrait[]);
      w.rulers[f] = { name, gen: g, trait, since: day };
      FACTIONS[f].ruler = name;
      FACTIONS[f].rulerGen = g;
      const r0 = this.rep(f);
      s.rep[f] = Math.round(r0 > 0 ? r0 * 0.7 : r0 * 0.5);
      const T = RULER_TRAITS[trait];
      this.chron(`${old} öldü; ${FACTIONS[f].name} tahtına ${name} geçti (${T.name}).`);
      audio.play("story");
      this.hud.notice(FACTIONS[f].icon, tr("{f} tahtında yeni hükümdar", { f: FACTIONS[f].name }), name, () =>
        this.hud.story(tr("{f} tahtında yeni hükümdar", { f: FACTIONS[f].name }), `icons/${FACTIONS[f].icon}`, tr("{o} göçtü. Davullar dövüldü, hutbe yeni adla okundu: {n}.", { o: old, n: name }) + `<br><br><b>${tr(T.name)}</b> · ${tr(T.text)}<br><br><span class="dim">${tr("Yeni hükümdar seni eskisi kadar tanımıyor: itibarın biraz soğudu.")}</span>`, tr("Tahtı kutlu olsun")));
      return;
    }
  }

  /** Her yılın başında ozanlar geçen yılı anlatır. */
  private yearTale(day: number): void {
    const s = this.s;
    const w = this.wd();
    const year = Math.floor((day - 1) / YEAR_DAYS) + 1;
    if (year <= w.year) return;
    const from = (w.year - 1) * YEAR_DAYS + 1;
    w.year = year;
    const lines = s.chron.filter((c) => c.d >= from && c.d < day).slice(-7).map((c) => `<li>${c.d}. ${tr("gün")} · ${c.t}</li>`).join("");
    if (!lines) return;
    const ren = 5 + Math.min(20, s.chron.filter((c) => c.d >= from).length);
    s.renown += ren;
    this.hud.notice("scroll", tr("{y}. Yılın Destanı", { y: year - 1 }), `+${ren} ${tr("şöhret")}`, () =>
      this.hud.story(tr("{y}. Yılın Destanı", { y: year - 1 }), "icons/scroll", `${tr("Nevruz ateşinin başında ozan kopuzunu aldı ve geçen yılı anlattı:")}<ul class="runs">${lines}</ul><b class="cheap">+${ren} ${tr("şöhret")}</b> · ${tr("Çağ")}: <b>${tr(ERAS[w.era].name)}</b>`, tr("Yeni yıl kutlu olsun")));
  }

  warStart(a: FactionId, b: FactionId, day = this.dayOf().day): void {
    const w = this.wd();
    const war: War = { a, b, since: day, score: 0, side: null, help: 0, takes: 0 };
    w.wars.push(war);
    const cause = oneOf(WAR_CAUSES);
    this.chron(`${FACTIONS[a].name} ile ${FACTIONS[b].name} arasında savaş başladı. ${cause}`);
    audio.play("lose");
    const text = `${tr(cause)}<br><br>${tr("{a} ile {b} artık savaşta. Sınır kaleleri ve şehirler el değiştirebilir; savaşan devletlerin pazarlarında fiyatlar kıpırdanacak.", { a: FACTIONS[a].name, b: FACTIONS[b].name })}<br><br>${tr("Bir tarafa katılırsan, onların düşmanının kalelerini almak, kervanlarını vurmak cepheyi senin lehine çevirir. Savaş kazanılırsa hükümdar seni ödüllendirir.")}`;
    const live = () => this.wd().wars.includes(war) && !war.side;
    this.hud.notice("swords", tr("Savaş ilanı!"), `${FACTIONS[a].name} ⚔ ${FACTIONS[b].name}`, () => {
      if (!live()) return this.hud.toast(tr("Bu savaşta artık karar verilemez."), "info");
      this.hud.choice(tr("Savaş ilanı!"), "icons/swords", text, [
        { label: tr("{f} safına katıl", { f: FACTIONS[a].name }), cls: "", fn: () => live() && this.warJoin(war, a) },
        { label: tr("{f} safına katıl", { f: FACTIONS[b].name }), cls: "", fn: () => live() && this.warJoin(war, b) },
        { label: tr("Tarafsız kal"), cls: "", fn: () => {} },
      ]);
    }, 0, live);
  }

  warJoin(war: War, f: FactionId): void {
    const s = this.s;
    const foe = f === war.a ? war.b : war.a;
    war.side = f;
    s.rep[f] = this.rep(f) + 40;
    s.rep[foe] = Math.max(-500, this.rep(foe) - 80);
    this.chron(`${s.hero.name}, ${FACTIONS[f].name} safında ${FACTIONS[foe].name} savaşına katıldı.`);
    this.hud.toast(tr("{f} sancağı altındasın. {e} kalelerini al, kervanlarını vur: cephe senin elinde.", { f: FACTIONS[f].short, e: FACTIONS[foe].short }), "good");
    saveGame(s);
  }

  private warTake(war: War): void {
    const s = this.s;
    const w = this.wd();
    const win = war.score > 0 ? war.a : war.b;
    const lose = win === war.a ? war.b : war.a;
    war.score = 0;
    war.takes += win === war.a ? 1 : -1;
    const cap = CITIES.find((c) => c.id === FACTIONS[win].cities[0])!;
    const dist = (p: { x: number; y: number }) => Math.hypot(p.x - cap.x, p.y - cap.y);
    const city = citiesOf(lose)
      .filter((c) => !SAFE_CITIES.includes(c) && !s.owned[c] && citiesOf(lose).length > 1)
      .map((c) => CITIES.find((x) => x.id === c)!)
      .sort((x, y) => dist(x) - dist(y))[0];
    if (city && Math.random() < 0.5) {
      const home = FACTION_KEYS.find((f) => FACTIONS[f].cities.includes(city.id));
      if (home === win) {
        delete w.occ[city.id];
        delete OCCUPY[city.id];
      } else {
        w.occ[city.id] = win;
        OCCUPY[city.id] = win;
      }
      delete s.sieged[city.id];
      this.addShort(city.id, 3);
      this.chron(`${CITY_NAME[city.id]} düştü; şehrin burçlarında artık ${FACTIONS[win].name} sancağı dalgalanıyor.`);
      audio.play("story");
      this.hud.toast(tr("Cepheden haber: {c} {w} eline geçti! Çarşıda kıtlık başladı.", { c: CITY_NAME[city.id], w: FACTIONS[win].name }), "info");
      return;
    }
    const fort = s.forts
      .map((f, i) => ({ f, i }))
      .filter((x) => x.f.owner === lose)
      .sort((x, y) => dist(x.f) - dist(y.f))[0];
    if (fort) {
      fort.f.owner = win;
      fort.f.lost = 1;
      fort.f.gar = fortGarrison(fort.f.tier, win, 1);
      this.chron(`${this.fortTitle(fort.i)}, ${FACTIONS[win].name} eline geçti.`);
      this.hud.toast(tr("Cepheden haber: {k} {w} eline geçti.", { k: this.fortTitle(fort.i), w: FACTIONS[win].name }), "info");
      return;
    }
    this.hud.toast(tr("Cepheden haber: {w}, {l} ordusunu meydan savaşında bozguna uğrattı.", { w: FACTIONS[win].name, l: FACTIONS[lose].name }), "info");
  }

  private warEnd(war: War, day: number): void {
    const s = this.s;
    const w = this.wd();
    w.wars = w.wars.filter((x) => x !== war);
    w.peaceUntil[warKey(war.a, war.b)] = day + PEACE_GAP;
    const win = war.takes > 0 ? war.a : war.takes < 0 ? war.b : null;
    this.chron(win ? `${FACTIONS[war.a].name} ile ${FACTIONS[war.b].name} barış yaptı; savaşı ${FACTIONS[win].name} kazandı.` : `${FACTIONS[war.a].name} ile ${FACTIONS[war.b].name} yorgun düştü; kimse kazanamadan barış imzalandı.`);
    if (!war.side) {
      this.hud.toast(tr("{a} ile {b} barış imzaladı.", { a: FACTIONS[war.a].name, b: FACTIONS[war.b].name }), "info");
      return;
    }
    const f = war.side;
    if (win === f || (!win && war.help >= 20)) {
      const gold = Math.round((200 + war.help * 12) * (this.rulerTrait(f) === "comert" ? 1.3 : 1));
      this.gain({ gold });
      s.rep[f] = this.rep(f) + 60 + Math.round(war.help);
      s.renown += 10 + Math.round(war.help / 4);
      this.addKut(3, "zafer");
      this.sing("zafer", { place: FACTIONS[f].name });
      audio.play("quest");
      this.hud.story(tr("Zafer!"), "icons/crown", tr("{r} seni divanına çağırdı: \"Bu savaşı senin kılıcın kazandı.\" Hazineden +{g} altın, itibar ve şöhret.", { r: FACTIONS[f].ruler, g: gold }), tr("Ne mutlu"));
    } else this.hud.toast(tr("Savaş bitti. Desteklediğin {f} istediğini alamadı.", { f: FACTIONS[f].name }), "bad");
  }

  private econDaily(day: number): void {
    const s = this.s;
    const w = this.wd();
    for (const c of CITIES) {
      const amb = s.owned[c.id] ? this.cbl(c.id, "ambar") * 0.3 : 0;
      const war = this.warOf(factionOf(c.id)) && !SAFE_CITIES.includes(c.id) ? 0.35 : 0;
      w.short[c.id] = Math.max(0, Math.min(SHORT_MAX, (w.short[c.id] ?? 0) - 0.5 - amb + war));
      if ((w.short[c.id] ?? 0) < RIOT_AT || day - (w.riotDay[c.id] ?? -99) < 6) continue;
      w.riotDay[c.id] = day;
      this.riot(c.id);
    }
  }

  private riot(city: string): void {
    const s = this.s;
    const name = CITY_NAME[city];
    this.chron(`${name} çarşısında ekmek isyanı çıktı.`);
    const o = s.owned[city];
    if (o) o.loy = Math.max(0, o.loy - 10);
    const here = this.nearCity(260);
    if (here < 0 || CITIES[here].id !== city || this.battleLock || this.hud.modal()) {
      this.hud.toast(tr("{c} çarşısında kıtlık isyanı! Fiyatlar uçtu; oraya mal götüren köşeyi döner.", { c: name }), "bad");
      return;
    }
    const food = 80;
    const f = factionOf(city);
    this.hud.choice(tr("{c} isyanı", { c: name }), "icons/merchant", tr("Yollar kesildi, ambarlar boşaldı. Aç kalabalık çarşıyı sardı; muhafızlar ne yapacağını bilmiyor. Herkesin gözü senin kervanında."), [
      { label: tr("Ambarını aç · {n} yiyecek", { n: food }), cls: s.res.food >= food ? "go" : "off", fn: () => {
        if (!this.pay({ food })) return;
        this.addShort(city, -4);
        this.addRep(f, 40, "aç halkı doyurdun");
        this.addKut(3, "aç halkı doyurdun");
        this.remember(true, tr("{c} kıtlığında halkı doyurdun", { c: name }));
        this.hud.toast(tr("Kazanlar kaynadı, kalabalık dağıldı. {c} adını dualarla anıyor.", { c: name }), "good");
      } },
      { label: tr("Kargaşadan faydalan: çarşıyı yağmala"), cls: "bad", fn: () => {
        const gold = Math.round((120 + s.hero.lv * 20) * this.stealMult());
        this.gain({ gold });
        s.rep[f] = Math.max(-500, this.rep(f) - 90);
        this.addWanted(1);
        this.addKut(-4, "yağma");
        this.addShort(city, 2);
        this.remember(false, tr("{c} isyanında çarşıyı yağmaladın", { c: name }));
        this.hud.toast(tr("Kepenkleri kırıp kasaları boşalttın: +{g} altın. Bu şehir seni unutmayacak.", { g: gold }), "bad");
      } },
      { label: tr("Uzak dur"), cls: "", fn: () => {} },
    ]);
  }

  private natureDaily(day: number): void {
    const s = this.s;
    const w = this.wd();
    const se = this.season();
    w.wolves = Math.min(WOLF_MAX, w.wolves + 2 + (se === "kis" ? 2 : 0) + (this.moon === "dolunay" ? 1 : 0));
    if (w.wolves >= WOLF_PACK_AT && Math.random() < 0.25) {
      const v = oneOf(s.villages);
      v.rec = Math.max(0, v.rec - 2);
      this.hud.toast(tr("Kurtlar {v} ağıllarına indi; köylüler sürülerini kaybetti.", { v: v.name }), "info");
    }
    if (w.drought && day >= w.drought.until) {
      const d = w.drought;
      w.drought = null;
      this.droughtMigrate(d);
    } else if (w.drought) {
      const c = CITIES.reduce((a, b) => (Math.hypot(b.x - w.drought!.x, b.y - w.drought!.y) < Math.hypot(a.x - w.drought!.x, a.y - w.drought!.y) ? b : a));
      this.addShort(c.id, 1);
    } else if (se === "yaz" && Math.random() < 0.12) {
      const c = oneOf(CITIES.filter((x) => x.id !== "samarkand"));
      w.drought = { until: day + DROUGHT_DAYS, x: c.x, y: c.y };
      this.chron(`${CITY_NAME[c.id]} ovasında kuraklık başladı.`);
      this.hud.toast(tr("{c} ovasında kuraklık! Kuyular kurudu; çarşıda yiyecek ve mal kıtlaşacak, aç obalar yola düşebilir.", { c: CITY_NAME[c.id] }), "bad");
    }
  }

  private droughtMigrate(d: { x: number; y: number }): void {
    const s = this.s;
    const dist = (p: { x: number; y: number }) => Math.hypot(p.x - d.x, p.y - d.y);
    const dead = s.camps.filter((c) => !c.alive && !this.fortGuard(c.x, c.y)).sort((a, b) => dist(a) - dist(b))[0];
    const camp = dead ?? s.camps.filter((c) => c.alive).sort((a, b) => dist(a) - dist(b))[0];
    if (!camp) return;
    camp.alive = true;
    camp.garrison = campGarrison(Math.min(5, camp.tier + (dead ? 0 : 1)));
    this.chron(`Kuraklıktan kaçan aç obalar ${camp.name} çevresinde yol kesmeye başladı.`);
    this.hud.toast(tr("Kuraklık bitti ama aç kalan obalar harami oldu: {c} kampı yeniden doldu.", { c: camp.name }), "bad");
  }

  wolfPack(): void {
    const s = this.s;
    const w = this.wd();
    const n = Math.round(4 + s.hero.lv * 0.9 + (w.wolves - WOLF_PACK_AT) * 0.15);
    this.battle(tr("Kurt sürüsü"), { spear: 0, archer: 0, horse: n }, -0.25, (win) => {
      if (!win) return `<p class="warn">${tr("Sürü yükünü dağıttı, yaralarını sarıp yola düştün.")}</p>`;
      w.wolves = Math.max(0, w.wolves - 18);
      const k = Math.min(2 + Math.floor(Math.random() * 3), Math.max(0, this.carryCap() - this.cargoUsed()));
      if (k) s.hero.cargo.deri = (s.hero.cargo.deri ?? 0) + k;
      let out = `<p class="good">${tr("Sürü dağıldı.")}${k ? ` +${k} ${GOODS.deri.name}` : ""}</p>`;
      if (w.wolves < WOLF_SACRED) {
        this.addKut(-3, "Börü soyu");
        out += `<p class="warn">${tr("Bozkırda kurt kalmadı. Yaşlılar söyleniyor: \"Börü atamızın soyunu kurutan kutunu da kurutur.\"")}</p>`;
      }
      return out;
    }, null, tr("Kurtlar"));
  }

  /** Efsanevi Ak Börü: dolunayda ya da kurtlar çoğalınca bozkırda belirir. */
  akBoru(): void {
    const s = this.s;
    const w = this.wd();
    const h = s.hero;
    const day = this.dayOf().day;
    w.boru = day;
    this.chron(`${s.hero.name} ay ışığında Ak Börü'yü gördü.`);
    audio.play("story");
    const lead = (): void => {
      const spots = [...s.ruins.filter((r) => !r.looted), ...s.kurgans.filter((k) => k.alive)];
      const far = spots.filter((p) => !this.isExplored(p.x, p.y));
      const pool = far.length ? far : spots;
      const to = pool.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
      h.hp = this.maxHp();
      this.addKut(4, "Ak Börü yol gösterdi");
      this.remember(true, tr("Ak Börü'nün izini sürdün"));
      if (to) {
        this.reveal(to.x, to.y, 7);
        this.view.marker(to.x, to.y);
        this.cam.flyTo(to.x, to.y, Math.max(this.cam.zoom, 0.6));
      }
      this.hud.story(tr("Ak Börü'nün izi"), "icons/tr_wolf", tr("Beyaz kurt dönüp dönüp sana baktı, sonra sisin içine yürüdü. Peşinden gittiğinde ayak izleri unutulmuş bir yere çıktı; ardından yaraların kendiliğinden kapandı.") + (to ? `<br><br><b class="cheap">${tr("Haritada gizli bir yer belirdi.")}</b>` : ""), tr("Atam Börü"));
    };
    const hunt = (): void => {
      const boss: Boss = { name: tr("Ak Börü"), icon: "icons/tr_wolf", atk: 14 + h.lv * 3, def: 6 + h.lv, hp: 220 + h.lv * 40 };
      this.battle(tr("Ak Börü"), { spear: 0, archer: 0, horse: Math.round(6 + h.lv * 0.8) }, 0.1, (win) => {
        if (!win) return `<p class="warn">${tr("Ak Börü uludu; sürü seni bozkıra savurdu. Bazı şeyler avlanmak için değildir.")}</p>`;
        w.boruSlain = true;
        w.wolves = Math.max(0, w.wolves - 35);
        this.addKut(-10, "Ak Börü'yü öldürdün");
        this.remember(false, tr("Ak Börü'yü öldürdün"));
        s.renown += 25;
        this.chron(`${s.hero.name}, Ak Börü'yü öldürdü. Yaşlılar o günden beri onun adını anarken yere tükürüyor.`);
        const it = this.legendDrop(1) ?? this.drop(5, 1);
        return `<p class="good">${tr("Beyaz post senin. +25 şöhret")}${it ? ` · <b class="r${it.rar}">${it.name}</b>` : ""}</p><p class="warn">${tr("Gök sustu. Bozkırın atası öldü; kutun karardı.")}</p>`;
      }, boss, tr("Ak Börü"));
    };
    this.hud.choice(tr("Ak Börü"), "icons/tr_wolf", tr("Ay ışığında, tepenin üstünde bembeyaz bir kurt duruyor. Ne saldırıyor ne kaçıyor; sadece bakıyor. Atalar, Ak Börü'nün yolunu kaybedenlere yol gösterdiğini anlatır."), [
      { label: tr("İzini sür"), cls: "go", fn: lead },
      { label: tr("Başını eğ · kurtlar 5 gün saldırmaz"), cls: "", fn: () => {
        w.boruPeace = day + 5;
        this.addKut(2);
        this.hud.toast(tr("Ak Börü başını salladı ve karanlığa karıştı. Sürüler yolundan çekilecek."), "good");
      } },
      { label: tr("Avla · efsanevi ganimet, kut −10"), cls: "bad", fn: hunt },
    ]);
  }

  private eraDaily(day: number): void {
    const s = this.s;
    const w = this.wd();
    const golden = s.kagan || Object.keys(s.owned).length >= 3 || s.renown >= 800;
    const stage = s.mongol?.stage ?? 0;
    if (stage >= 3 && w.era === "istila") w.eraDay = day;
    const next = eraOf(stage, day - w.eraDay, golden, w.era);
    if (next === w.era) return;
    w.era = next;
    if (next !== "yikim") w.eraDay = day;
    const E = ERAS[next];
    this.chron(`${E.name} başladı.`);
    audio.play("story");
    this.hud.notice("scroll", tr("Yeni bir çağ: {e}", { e: tr(E.name) }), tr("Dünya değişiyor"), () => this.hud.story(tr("Yeni bir çağ: {e}", { e: tr(E.name) }), "icons/scroll", tr(E.text), tr("Çağın içine yürü")));
  }

  private memoryDaily(day: number): void {
    const s = this.s;
    const w = this.wd();
    if (this.battleLock || this.hud.modal() || Math.random() > 0.2) return;
    const d = w.deeds.find((x) => !x.paid && day - x.d >= 6);
    if (!d) return;
    d.paid = true;
    const h = s.hero;
    if (d.good) {
      const roll = Math.random();
      let gift: string;
      if (roll < 0.4) {
        const gold = 80 + h.lv * 20;
        this.gain({ gold });
        gift = tr("+{g} altın", { g: gold });
      } else if (roll < 0.75) {
        const room = Math.max(0, this.heroCap() - armySize(h.army));
        const n = Math.min(room, 3 + Math.round(h.lv / 3));
        h.army.horse += n;
        gift = n ? tr("{n} atlı sancağına katıldı", { n }) : tr("yoluna dua okundu");
      } else {
        h.hp = this.maxHp();
        this.addKut(2);
        gift = tr("yaraların sarıldı, kutun parladı");
      }
      this.hud.notice("scroll", tr("Unutulmayan iyilik"), gift, () => this.hud.story(tr("Unutulmayan iyilik"), "icons/scroll", tr("Bir yolcu yanına yaklaştı: \"Beni tanımadın mı? {d} — o gün yaptığını hiç unutmadık.\"", { d: d.what }) + `<br><br><b class="cheap">${gift}</b>`, tr("Yola devam")));
      return;
    }
    const tier = Math.min(5, Math.max(1, Math.round(h.lv / 3)));
    const a = Math.random() * Math.PI * 2;
    for (let i = 0; i < 8; i++) {
      const x = h.x + Math.cos(a + i) * 360;
      const y = h.y + Math.sin(a + i) * 360;
      if (this.cellCost(x, y) >= 3) continue;
      const army0 = banditArmy(tier);
      for (const u of UNIT_KEYS) army0[u] = Math.round(army0[u] * 1.2);
      const camp = s.camps.indexOf(this.nearest(s.camps) ?? s.camps[0]);
      s.bandits.push({ id: s.nextId++, camp, tier, x, y, army: army0, tx: x, ty: y, wait: 4, chase: true, amb: true });
      this.hud.toast(tr("İntikam! \"{d}\" — o günün hesabını sormaya gelenler izini sürüyor.", { d: d.what }), "bad");
      return;
    }
  }

  private surpriseDaily(day: number): void {
    const s = this.s;
    const w = this.wd();
    const mix = styleMix(w.acts, day);
    if (mix.n < 6 || mix.share < 0.7 || day - w.surpriseDay < 4 || this.battleLock || this.hud.modal()) return;
    w.surpriseDay = day;
    const d = this.dir();
    const p = PERSONAS[d.p];
    if (mix.top === "savas" || mix.top === "kusatma") {
      const have = GOOD_KEYS.filter((g) => (s.hero.cargo[g] ?? 0) > 0);
      const good = have.length ? oneOf(have) : oneOf(GOOD_KEYS);
      const ci = oneOf(CITIES.filter((c) => !this.hostile(c.id)));
      if (!ci) return;
      s.events.push({ city: ci.id, good, mult: 2, until: day + 4, text: `${CITY_NAME[ci.id]}: ${GOODS[good].name}` });
      this.hud.toast(tr("{p}: Kılıcın dinlensin. {c} çarşısında {g} iki katına satılıyor; 4 gün içinde yetiş.", { p: p.name, c: CITY_NAME[ci.id], g: GOODS[good].name }), "good");
      this.dirLog(tr("Tarzını okudu: {s} → ticaret fırsatı", { s: tr(STYLE_NAME[mix.top]) }), false);
    } else if (mix.top === "ticaret" || mix.top === "is") {
      const camp = s.camps.filter((c) => c.alive).sort((a, b) => Math.hypot(a.x - s.hero.x, a.y - s.hero.y) - Math.hypot(b.x - s.hero.x, b.y - s.hero.y))[0];
      if (camp) this.reveal(camp.x, camp.y, 6);
      this.addShort(oneOf(CITIES).id, 3);
      this.hud.toast(tr("{p}: Pazarlar fazla sakin… {c} çetesi yolları kesti; kampı haritada belirdi. Vurursan kıtlık da biter.", { p: p.name, c: camp?.name ?? "" }), "bad");
      this.dirLog(tr("Tarzını okudu: {s} → yol kesen çete", { s: tr(STYLE_NAME[mix.top]) }), true);
    } else {
      this.roadEvent();
      this.dirLog(tr("Tarzını okudu: {s} → yol karşılaşması", { s: tr(STYLE_NAME[mix.top]) }), false);
    }
  }

  private festDaily(): void {
    const w = this.wd();
    const f = realFest(new Date());
    if (!f || w.fest.includes(f.id) || this.battleLock || this.hud.modal()) return;
    w.fest.push(f.id);
    if (w.fest.length > 12) w.fest.shift();
    this.gain({ gold: f.gold, food: f.food });
    this.addKut(f.kut);
    this.chron(`${f.name} kutlandı.`);
    audio.play("quest");
    this.hud.notice("crown", tr(f.name), `+${f.gold} ${tr("altın")}`, () => this.hud.story(tr(f.name), "icons/crown", `${tr(f.text)}<br><br><b class="cheap">+${f.gold} ${tr("altın")}, +${f.food} ${tr("yiyecek")}, ${tr("kut")} +${f.kut}</b>`, tr("Bayramın kutlu olsun")));
  }

  private gameNevruz(): void {
    const s = this.s;
    const w = this.wd();
    const day = this.dayOf().day;
    if (w.nevruz === day) return;
    w.nevruz = day;
    this.gain({ food: 40 });
    this.addKut(1);
    for (const c of CITIES) w.short[c.id] = Math.max(0, (w.short[c.id] ?? 0) - 2);
    if (!s.free) return;
    this.hud.toast(tr("Bozkırda Nevruz! Ateşler yakıldı, kıtlıklar hafifledi. +40 yiyecek"), "good");
    this.successions(day);
    this.yearTale(day);
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
    this.fortDaily(day);
    this.worldDaily(day);
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
    const open = list.filter((c) => !this.pact(s.owned[c].from, "peace"));
    if (!open.length) return;
    const city = open[Math.floor(Math.random() * open.length)];
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
    this.toyScore("ok", Math.round(score / 4));
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

  dip(f: FactionId): DipState {
    return ((this.s.dip ??= {})[f] ??= {});
  }

  pact(f: FactionId, k: "peace" | "trade" | "intel"): number {
    return Math.max(0, (this.dip(f)[k] ?? 0) - this.dayOf().day);
  }

  dipReason(f: FactionId, act: "gift" | "peace" | "trade" | "spy"): string {
    const s = this.s, d = this.dip(f);
    if (!s.free) return tr("Önce hürriyetini kazan");
    if (act === "gift") return s.res.gold < GIFT_GOLD ? `${GIFT_GOLD} ${tr("altın")}` : "";
    if (act === "peace") {
      if (!s.beylik) return tr("Önce beyliğini kur");
      if (this.pact(f, "peace")) return `${tr("Antlaşma sürüyor")}: ${this.pact(f, "peace")} ${tr("gün")}`;
      if (this.rep(f) < PEACE_REP) return tr("Önce gönüllerini kazan (itibar 0+)");
      return s.res.gold < PEACE_GOLD ? `${PEACE_GOLD} ${tr("altın")}` : "";
    }
    if (act === "trade") {
      if (this.pact(f, "trade")) return `${tr("Antlaşma sürüyor")}: ${this.pact(f, "trade")} ${tr("gün")}`;
      if (this.rep(f) < TRADE_REP) return `${tr("İtibar")} ${TRADE_REP}+`;
      return s.res.gold < TRADE_GOLD ? `${TRADE_GOLD} ${tr("altın")}` : "";
    }
    if ((d.spy ?? 0) >= SPY_MAX) return tr("Ağ tam");
    return s.res.gold < spyCost(d.spy ?? 0) ? `${spyCost(d.spy ?? 0)} ${tr("altın")}` : "";
  }

  sendGift(f: FactionId): void {
    if (this.dipReason(f, "gift")) return;
    const d = this.dip(f);
    this.s.res.gold -= GIFT_GOLD;
    const n = giftRep(d.gifts ?? 0);
    d.gifts = (d.gifts ?? 0) + 1;
    this.s.rep[f] = Math.min(2000, this.rep(f) + n);
    this.hud.toast(`${FACTIONS[f].ruler} ${tr("armağanı kabul etti")}: +${n} ${tr("itibar")}`, "good");
    saveGame(this.s);
  }

  signPact(f: FactionId, k: "peace" | "trade"): void {
    if (this.dipReason(f, k)) return;
    const s = this.s;
    s.res.gold -= k === "peace" ? PEACE_GOLD : TRADE_GOLD;
    this.dip(f)[k] = this.dayOf().day + PACT_DAYS;
    this.chron(`${FACTIONS[f].ruler} ile ${k === "peace" ? "saldırmazlık" : "ticaret"} antlaşması imzalandı.`);
    audio.play("quest");
    this.hud.toast(k === "peace" ? `${FACTIONS[f].short}: ${tr("20 gün saldırmazlık")}` : `${FACTIONS[f].short}: ${tr("20 gün ticaret ayrıcalığı")}`, "good");
    saveGame(s);
  }

  hireSpy(f: FactionId): void {
    if (this.dipReason(f, "spy")) return;
    const d = this.dip(f);
    this.s.res.gold -= spyCost(d.spy ?? 0);
    d.spy = (d.spy ?? 0) + 1;
    this.hud.toast(`${FACTIONS[f].short}: ${tr("casus ağı")} ${d.spy}/${SPY_MAX}`, "good");
    saveGame(this.s);
  }

  spyReason(f: FactionId, op: SpyOp): string {
    const d = this.dip(f);
    const o = SPY_OPS.find((x) => x.id === op)!;
    if ((d.spy ?? 0) < o.lv) return `${tr("Ağ seviyesi")} ${o.lv}`;
    if ((d.acted ?? -1) === this.dayOf().day) return tr("Casuslar bugün iş gördü");
    return "";
  }

  spyOp(f: FactionId, op: SpyOp): void {
    if (this.spyReason(f, op)) return;
    const s = this.s, d = this.dip(f), fac = FACTIONS[f];
    const o = SPY_OPS.find((x) => x.id === op)!;
    d.acted = this.dayOf().day;
    const risk = o.risk * (1 - 0.1 * this.tal("kacakci")) * (1 - (d.spy ?? 0) * 0.08);
    if (Math.random() < risk) {
      d.spy = Math.max(0, (d.spy ?? 1) - 1);
      s.rep[f] = Math.max(-500, this.rep(f) - 60 - 40 * o.lv);
      if (this.pact(f, "peace")) d.peace = 0;
      audio.play("bad");
      this.chron(`${fac.name} divanında bir casus yakalandı; ${fac.ruler} öfkeyle elçileri kovdu.`);
      this.hud.story(tr("Casus yakalandı!"), "icons/wanted", `${fac.ruler}'ın adamları casusunu yakaladı. Ağın bir halkası koptu, itibarın düştü${this.pact(f, "peace") ? "" : " ve varsa antlaşma bozuldu"}.`, tr("Kahretsin"));
      saveGame(s);
      return;
    }
    let html = "";
    if (op === "intel") {
      d.intel = this.dayOf().day + 5;
      const rows = citiesOf(f).filter((c) => !s.owned[c]).map((c) => `${CITY_NAME[c]}: <b>${armySize(this.cityGar(c))}</b> ${tr("asker")}`).join("<br>");
      const ownedFrom = Object.values(s.owned).some((x) => x.from === f);
      const eta = s.counterAt && ownedFrom ? Math.max(0, Math.ceil((s.counterAt - this.now) / (DAY_SEC * 1000))) : -1;
      html = `${rows || tr("Şehirlerinin hepsi artık senin.")}<br><br>${eta >= 0 ? `<b class="dear">${tr("Karşı saldırı hazırlığı")}: ~${eta} ${tr("gün")}</b>` : tr("Yakında bir saldırı hazırlığı yok.")}<br><br><b class="cheap">${tr("5 gün boyunca kuşatmalarda surları zayıf")}</b>`;
    } else if (op === "sabotage") {
      const list = citiesOf(f).filter((c) => !s.owned[c]);
      const c = list[Math.floor(Math.random() * list.length)];
      if (c) s.sieged[c] = Math.min(3, (s.sieged[c] ?? 0) + 1);
      html = c ? `${CITY_NAME[c]} ${tr("ambarı gece yandı. Garnizonu zayıfladı")}: <b>${armySize(this.cityGar(c))}</b>` : tr("Yakılacak ambar kalmadı.");
    } else {
      const gold = 200 + Math.floor(Math.random() * 250) + 60 * (d.spy ?? 0);
      this.gain({ gold });
      html = `${tr("Hazineden altın aşırıldı")}: <b>+${gold}</b>`;
    }
    audio.play("quest");
    this.hud.story(`${fac.short} · ${tr(o.name)}`, "icons/scroll", html, tr("Güzel"));
    saveGame(s);
  }

  myCvs(): MyCaravan[] {
    return (this.s.mycv ??= []);
  }

  myCvMax(): number {
    return 1 + Math.min(3, Object.keys(this.s.serais).length);
  }

  myCvReason(city: string): string {
    const s = this.s;
    if (!s.free) return tr("Önce hürriyetini kazan");
    if (!this.canStud(city)) return tr("Kervan ancak yurdunda, kervansarayında ya da şehrinde kurulur");
    if (this.myCvs().length >= this.myCvMax()) return tr("Daha fazla kervan için kervansaray kur");
    if (s.res.gold < MYCV_COST) return `${MYCV_COST} ${tr("altın")} ${tr("gerekir")}`;
    return "";
  }

  cvMargin(from: string, to: string, g: Good): number {
    return Math.round(this.sellPrice(to, g) * MYCV_FEE - this.buyPrice(from, g));
  }

  bestGood(from: string, to: string): Good | null {
    let best: Good | null = null;
    let m = 2;
    for (const g of GOOD_KEYS) {
      const v = this.cvMargin(from, to, g);
      if (v > m) (m = v), (best = g);
    }
    return best;
  }

  buyMyCaravan(city: string): void {
    if (this.myCvReason(city)) return;
    const s = this.s;
    const here = CITIES.find((c) => c.id === city)!;
    const to = CITIES.filter((c) => c.id !== city).sort((a, b) => Math.hypot(a.x - here.x, a.y - here.y) - Math.hypot(b.x - here.x, b.y - here.y))[0].id;
    s.res.gold -= MYCV_COST;
    const id = (this.myCvs().reduce((a, c) => Math.max(a, c.id), 0) || 0) + 1;
    this.myCvs().push({ id, name: MYCV_NAMES[(id - 1) % MYCV_NAMES.length], from: city, to, go: this.bestGood(city, to), back: this.bestGood(to, city), cap: MYCV_CAP, guards: 0, dir: 1, t: 0, cargo: 0, paid: 0, trips: 0, profit: 0, status: "bekle", log: [] });
    this.hud.toast(tr("Kervan kuruldu! Rotasını Kervanlar sekmesinden ayarla."), "good");
    audio.play("coin");
    saveGame(s);
  }

  setMyCv(id: number, patch: Partial<Pick<MyCaravan, "to" | "go" | "back">>): void {
    const c = this.myCvs().find((x) => x.id === id);
    if (!c) return;
    Object.assign(c, patch);
    if (patch.to && c.cargo === 0) {
      c.dir = 1;
      c.t = 0;
      c.status = "bekle";
    }
    saveGame(this.s);
  }

  guardMyCv(id: number): void {
    const c = this.myCvs().find((x) => x.id === id);
    if (!c || c.guards >= MYCV_GUARD_MAX || this.s.res.gold < MYCV_GUARD) return;
    this.s.res.gold -= MYCV_GUARD;
    c.guards++;
    saveGame(this.s);
  }

  upgradeMyCv(id: number): void {
    const c = this.myCvs().find((x) => x.id === id);
    if (!c || c.cap >= 48 || this.s.res.gold < MYCV_UPGRADE) return;
    this.s.res.gold -= MYCV_UPGRADE;
    c.cap += 10;
    saveGame(this.s);
  }

  sellMyCv(id: number): void {
    const s = this.s;
    s.mycv = this.myCvs().filter((x) => x.id !== id);
    s.res.gold += Math.round(MYCV_COST * 0.4);
    saveGame(s);
  }

  private cvCity(id: string): { x: number; y: number } {
    return CITIES.find((c) => c.id === id)!;
  }

  myCvDays(c: MyCaravan): number {
    const a = this.cvCity(c.from), b = this.cvCity(c.to);
    return mycvDays(Math.hypot(a.x - b.x, a.y - b.y));
  }

  myCvPos(c: MyCaravan): { x: number; y: number } {
    const a = this.cvCity(c.dir === 1 ? c.from : c.to), b = this.cvCity(c.dir === 1 ? c.to : c.from);
    const k = c.status === "bekle" ? 0 : c.t;
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k + 18 };
  }

  private cvLog(c: MyCaravan, t: string): void {
    c.log.unshift(`${this.dayOf().day}. ${tr("gün")}: ${t}`);
    c.log.length = Math.min(c.log.length, 5);
  }

  private cvLoad(c: MyCaravan): void {
    const at = c.dir === 1 ? c.from : c.to;
    const g = c.dir === 1 ? c.go : c.back;
    c.status = "yol";
    c.t = 0;
    if (!g) return;
    const dest = c.dir === 1 ? c.to : c.from;
    const sell0 = this.sellPrice(dest, g) * MYCV_FEE;
    let cost = 0;
    let n = 0;
    while (n < c.cap) {
      const p = this.buyPrice(at, g);
      if (this.s.res.gold - cost - p < 100) break;
      if (p >= sell0 * (1 - 0.03 * n) * 0.97) break;
      cost += p;
      n++;
      const m = this.market(at);
      m[g] = Math.min(0.7, (m[g] ?? 0) + 0.02);
    }
    if (!n) {
      this.cvLog(c, this.s.res.gold < 200 ? tr("altın yetmedi, boş yola çıktı") : `${GOODS[g].name}: ${tr("kâr yok, boş yola çıktı")}`);
      return;
    }
    this.s.res.gold -= cost;
    c.cargo = n;
    c.paid = cost;
  }

  private cvArrive(c: MyCaravan): void {
    const at = c.dir === 1 ? c.to : c.from;
    const g = c.dir === 1 ? c.go : c.back;
    const a = this.cvCity(c.from), b = this.cvCity(c.to);
    const safe = (x: string) => this.canStud(x) ? 0.03 : 0;
    const danger = Math.hypot(a.x - b.x, a.y - b.y) / 4000 * 0.12 - safe(c.from) - safe(c.to);
    if (c.cargo && g) {
      if (Math.random() < mycvRisk(c, danger)) {
        this.cvLog(c, `${tr("haramiler yükü yağmaladı")} (-${c.paid} ${tr("altın")})`);
        this.hud.toast(`${c.name}: ${tr("haramiler yükü yağmaladı")}!`, "bad");
        c.profit -= c.paid;
      } else {
        let got = 0;
        for (let k = 0; k < c.cargo; k++) {
          got += this.sellPrice(at, g) * MYCV_FEE;
          const m = this.market(at);
          m[g] = Math.max(-0.7, (m[g] ?? 0) - 0.03);
        }
        got = Math.round(got);
        const pr = got - c.paid;
        this.s.res.gold += got;
        this.s.c.profit += Math.max(0, pr);
        c.profit += pr;
        this.cvLog(c, `${c.cargo} ${GOODS[g].name} → ${CITY_NAME[at]}: ${pr >= 0 ? "+" : ""}${pr} ${tr("altın")}`);
      }
    }
    c.cargo = 0;
    c.paid = 0;
    c.trips++;
    c.dir = c.dir === 1 ? -1 : 1;
    this.cvLoad(c);
  }

  private myCvTick(dt: number): void {
    for (const c of this.s.mycv ?? []) {
      if (c.status === "bekle") {
        this.cvLoad(c);
        continue;
      }
      c.t += dt / (this.myCvDays(c) * DAY_SEC);
      if (c.t >= 1) this.cvArrive(c);
    }
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

  weekly(): WeekState {
    const s = this.s;
    if (!s.weekly) s.weekly = { id: weekId(), base: { ...s.c }, lv: s.hero.lv, claimed: 0, hist: [] };
    return s.weekly;
  }

  weekScoreNow(): number {
    const w = this.weekly();
    return weekScore(weekTheme(w.id), this.s.c, w.base);
  }

  weekBoardNow(frac = weekFrac(this.weekly().id)): BoardRow[] {
    const w = this.weekly();
    return weekBoard(w.id, w.lv, frac, { name: this.s.hero.name, score: this.weekScoreNow() });
  }

  weekClaim(tier: number): boolean {
    const s = this.s;
    const w = this.weekly();
    if (!s.free || tier !== w.claimed || tier >= WEEK_TIERS || this.weekScoreNow() < weekNeed(tier, w.lv)) return false;
    const r = weekReward(tier, w.lv);
    s.res.gold += r.gold;
    s.renown += r.renown;
    s.mats.parsomen += r.parsomen;
    w.claimed = tier + 1;
    audio.play("coin");
    this.hud.toast(`${tr("Haftalık ödül")}: +${r.gold} ${tr("altın")}, +${r.renown} ${tr("şöhret")}${r.parsomen ? `, +${r.parsomen} ${tr("Parşömen")}` : ""}`, "good");
    return true;
  }

  // ---------- Kam ayini: ruhlar dünyası ----------

  spiritCost(): number {
    return this.s.cls === "kam" ? 1 : 3;
  }

  spiritWhy(): string | null {
    const s = this.s;
    const sp = s.spirit;
    const day = this.dayOf().day;
    if (sp && day - sp.day < 3) return `Ruhlar yorgun. ${3 - (day - sp.day)} gün sonra yeniden davul çalınabilir.`;
    if (s.mats.ruh < this.spiritCost()) return `${this.spiritCost()} Ruh Taşı gerekir.`;
    return null;
  }

  spiritBegin(): boolean {
    const s = this.s;
    if (this.spiritWhy() || this.battleLock) return false;
    s.mats.ruh -= this.spiritCost();
    const sp = (s.spirit ??= { day: 0, n: 0, met: [] });
    sp.day = this.dayOf().day;
    sp.n++;
    if (sp.n === 1) this.chron(`${s.hero.name} ilk kez davulun sesine binip ruhlar dünyasına yolculuk etti.`);
    saveGame(s);
    return true;
  }

  private spiritAncestor(): { name: string; lv: number } | null {
    const met = this.s.spirit?.met ?? [];
    const f = (this.s.fallen ?? []).filter((x) => !met.includes(x.name)).sort((a, b) => b.day - a.day)[0];
    return f ? { name: f.name, lv: f.lv } : null;
  }

  spiritOpts(realm: "ust" | "alt"): { id: string; name: string; text: string; off?: string | null }[] {
    const s = this.s;
    const lv = s.hero.lv;
    if (realm === "ust") {
      const anc = this.spiritAncestor();
      return [
        { id: "ulgen", name: "Ülgen'in kutsaması", text: "Dokuzuncu kat gökte Ülgen'e saçı sun. Sonraki 3 savaşta ordu gücü +%12, +3 kut." },
        { id: "ata", name: anc ? `${anc.name} ile konuş` : "Ataların sesi", text: anc ? `Düşen yoldaşın ${anc.name} ateşin başında seni bekliyor. Bilgeliği tecrübeye dönüşür.` : "Atalarının gölgeleri yol gösterir: bol tecrübe." },
        { id: "umay", name: "Umay Ana'nın şifası", text: "Can ve enerji tamamen dolar; sonraki 3 savaşta can yenileme artar." },
      ];
    }
    return [
      { id: "erlik", name: "Erlik'le pazarlık", text: `Erlik altın sever, ruh ister. +${150 + lv * 60} altın, −5 kut.` },
      { id: "yek", name: "Kara ruhlarla dövüş", text: "Erlik'in yekleri yolunu kesiyor. Yenersen bol Ruh Taşı ve bir eşya." },
      { id: "kurtar", name: "Kayıp bir ruhu kurtar", text: "Yolunu şaşırmış bir ruhu göğe çıkar (2 Ruh Taşı). +4 kut, +15 şöhret, sonraki 3 savaşta ordu +%5.", off: s.mats.ruh < 2 ? "2 Ruh Taşı gerekir" : null },
    ];
  }

  spiritChoose(id: string): { title: string; html: string; fight?: boolean } {
    const s = this.s;
    const h = s.hero;
    const lv = h.lv;
    const sp = (s.spirit ??= { day: 0, n: 0, met: [] });
    switch (id) {
      case "ulgen":
        s.buffs.ulgen = 3;
        this.addKut(3, "Ülgen'in kutsaması");
        return { title: "Ülgen'in Kutsaması", html: `Ak Ülgen altın tahtından baktı ve elini başına koydu. "Yolun açık olsun, yiğit."<br><br><b class="cheap">Sonraki 3 savaşta ordu gücü +%12 · +3 kut</b>` };
      case "ata": {
        const anc = this.spiritAncestor();
        const xp = 200 + lv * 30 + (anc ? anc.lv * 15 : 0);
        this.addXp(xp);
        if (anc) {
          sp.met.push(anc.name);
          const f = s.fallen?.find((x) => x.name === anc.name);
          if (f) f.mourned = true;
          this.chron(`${h.name}, ruhlar dünyasında düşen yoldaşı ${anc.name} ile konuştu.`);
        }
        return { title: anc ? anc.name : "Ataların Sesi", html: anc ? `${anc.name} ateşin karşısında oturuyordu, yaraları kapanmış, yüzü aydınlık. "Beni unutmadın. Dinle: düşmanın sağ kanadı hep zayıftır, atını güneşe karşı sürme."<br><br><b class="cheap">+${xp} TP</b>` : `Gölgeler bir halka oldu. Alp Er Tunga'nın sesi rüzgârda: "Kurt sürüsünden ayrılınca ölür."<br><br><b class="cheap">+${xp} TP</b>` };
      }
      case "umay":
        h.hp = this.maxHp();
        h.energy = this.maxEnergy();
        s.buffs.umay = 3;
        return { title: "Umay Ana", html: `Ak saçlı ana, kayın ağacının dibinde ellerini yaralarına sürdü. Bedenin hafifledi.<br><br><b class="cheap">Can ve enerji doldu · sonraki 3 savaşta can yenileme +%4</b>` };
      case "erlik": {
        const gold = 150 + lv * 60;
        s.res.gold += gold;
        this.addKut(-5, "Erlik'le pazarlık");
        this.chron(`${h.name} Alt Dünya'da Erlik Han ile pazarlık etti.`);
        return { title: "Erlik'in Altını", html: `Erlik güldü; sesi dokuz katı titretti. "Altın senin, gölgenin bir parçası benim."<br><br><b class="cheap">+${gold} altın</b> · <b class="neg">−5 kut</b>` };
      }
      case "yek":
        return { title: "Kara Ruhlar", html: "Kara kanatlı yekler çığlıklarla üzerine çullanıyor! Ruhunu kılıcına bağla.", fight: true };
      case "kurtar":
        s.mats.ruh = Math.max(0, s.mats.ruh - 2);
        this.addKut(4, "kayıp bir ruhu kurtardın");
        s.renown += 15;
        s.buffs.ata = 3;
        return { title: "Kurtarılan Ruh", html: `Ağlayan bir kız çocuğunun ruhunu elinden tutup kayın ağacının köklerine kadar çıkardın. Bir ak kuş olup göğe uçtu.<br><br><b class="cheap">+4 kut · +15 şöhret · sonraki 3 savaşta ordu +%5</b>` };
    }
    return { title: "", html: "" };
  }

  spiritFight(): void {
    const s = this.s;
    const lv = s.hero.lv;
    const boss: Boss = { name: "Erlik'in Yeği Kara Kuş", icon: "heroes/boss_kam", atk: Math.round(14 + lv * 0.5), def: Math.round(7 + lv * 0.25), hp: 500 + lv * 14 };
    this.battle("Alt Dünya", army(Math.round(lv * 0.4), Math.round(lv * 0.3), Math.round(lv * 0.2)), 0, (win) => {
      if (!win) return "Yekler ruhunu sarstı. Davulun sesine tutunup dünyaya döndün.";
      const ruh = 5 + Math.floor(lv / 3);
      s.mats.ruh += ruh;
      s.renown += 10;
      const it = this.drop(this.legendTier(), 1);
      return `Yekler dağıldı! <b class="cheap">+${ruh} Ruh Taşı · +10 şöhret</b>${it ? ` · <b class="r${it.rar}">${it.name}</b>` : ""}`;
    }, boss, "Kara Ruhlar");
  }

  mongol(): MongolState {
    return (this.s.mongol ??= newMongol());
  }

  sacked(city: string): boolean {
    return !!this.s.mongol?.fallen.some((f) => f.id === city);
  }

  /** Tümenin haritadaki yeri: önceki durağından sıradaki şehre doğru yürür. */
  mongolPos(): { x: number; y: number } | null {
    const m = this.s.mongol;
    if (!m || m.stage !== 2) return null;
    const to = this.cityPos(ROUTE[m.next]);
    const from = m.next === 0 ? { x: W - 80, y: to.y - 140 } : this.cityPos(ROUTE[m.next - 1]);
    const { day, t } = this.dayOf();
    const k = Math.max(0, Math.min(1, (day + t - m.left) / Math.max(1, m.due - m.left)));
    return { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k + 95 };
  }

  mongolDaysLeft(): number {
    const m = this.s.mongol;
    if (!m) return 0;
    const { day, t } = this.dayOf();
    return Math.max(0, m.due - day - t);
  }

  private mongT = 2;
  private mongBusy = false;

  private mongolTick(dt: number): void {
    this.mongT -= dt;
    if (this.mongT > 0 || this.battleLock || this.mongBusy) return;
    this.mongT = 2;
    const s = this.s;
    if (!s.free) return;
    const m = this.mongol();
    const day = this.dayOf().day;
    if (m.fallen.length)
      m.fallen = m.fallen.filter((f) => {
        if (day - f.day < RECOVER_DAYS) return true;
        this.hud.toast(`${CITY_NAME[f.id]} küllerinden doğuyor; çarşı yeniden açıldı.`, "good");
        return false;
      });
    if (m.stage === 0) {
      if (day < MONGOL_DAY - RUMOR_LEAD || s.hero.lv < MONGOL_LV - 2) return;
      m.stage = 1;
      m.due = day + RUMOR_LEAD;
      this.chron("Doğudan, Tanrı Dağları'nın ardından kara haberler gelmeye başladı.");
      this.hud.story("Doğudan Haberler", "icons/scroll", `${RUMORS.map((r) => `<i>"${r}"</i>`).join("<br><br>")}<br><br><b class="neg">Bozkırın doğusunda bir fırtına toplanıyor.</b> Ordunu güçlendir, beylerle bağ kur.`, "Kulak kabart");
      saveGame(s);
      return;
    }
    if (m.stage === 1) {
      if (day < m.due) return;
      m.stage = 2;
      m.next = 0;
      m.left = day;
      m.due = day + LEG_DAYS;
      this.chron("Moğol tümenleri Tanrı Dağları'nı aştı. Kara bulut batıya yürüyor.");
      audio.play("story");
      this.hud.choice("Kara Bulut", "heroes/boss_hakan", `Ufuk tozla kapandı. Cengiz'in noyanları <b>${CITY_NAME[ROUTE[0]]}</b> üzerine yürüyor; ardından Semerkant, Buhara ve bütün İpek Yolu gelecek.<br><br>Önünde üç yol var: <b>kılıç</b> (tümeni üç kez yenersen dalga kırılır), <b>haraç</b> (bir şehri altınla kurtarırsın) ya da <b>boyun eğmek</b> (yağmadan pay alırsın, ama töre seni unutmaz).<br><br><small class="dim">Tümen her ${LEG_DAYS} günde bir şehre varır. Haritada izleyebilir, takip kartından emir verebilirsin.</small>`, [
        { label: "Kılıcımı kuşanırım", cls: "red", fn: () => this.chron(`${s.hero.name}, Moğol'a karşı kılıç kuşandı.`) },
        { label: "Seçenekleri gör", cls: "go", fn: () => this.mongolMenu() },
      ]);
      saveGame(s);
      return;
    }
    if (m.stage !== 2) return;
    if (day >= m.due) this.mongolArrive();
    else if (m.due - day <= 2 && m.askDay !== m.next) {
      m.askDay = m.next;
      this.hud.toast(`Moğol öncüleri ${CITY_NAME[ROUTE[m.next]]} kapılarına iki gün uzaklıkta!`, "bad");
    }
  }

  mongolNear(): boolean {
    const p = this.mongolPos();
    return !!p && Math.hypot(p.x - this.s.hero.x, p.y - this.s.hero.y) < 150;
  }

  mongolMenu(): void {
    const s = this.s;
    const m = this.mongol();
    if (m.stage !== 2) return;
    const id = ROUTE[m.next];
    const lv = s.hero.lv;
    const cost = tributeCost(m.next, lv);
    const last = m.str === 1 && m.pact === "war";
    const pct = Math.round(this.odds(mongolArmy(lv, m.str), 0.05 - (last ? this.finalAid().aid : 0), mongolBoss(lv, m.str)) * 100);
    const opts: { label: string; cls: string; fn: () => void }[] = [];
    if (this.mongolNear()) opts.push({ label: m.pact === "join" ? "İhanet et: arkadan vur" : last ? `Son Savaş: tümene saldır (%${pct})` : `Tümene saldır (%${pct})`, cls: "red", fn: () => this.mongolAttack() });
    else opts.push({ label: "Tümene yürü", cls: "go", fn: () => this.goTo({ kind: "mongol" }) });
    if (m.pact === "war" && m.spared !== id) opts.push({ label: `Haraç: ${CITY_NAME[id]} bağışlansın (${cost} altın)`, cls: s.res.gold >= cost ? "" : "off", fn: () => this.mongolTribute() });
    if (m.pact === "war") opts.push({ label: "Moğol'a boyun eğ", cls: "", fn: () => this.mongolJoin() });
    opts.push({ label: "Kapat", cls: "", fn: () => {} });
    const fallen = m.fallen.map((f) => CITY_NAME[f.id]).join(", ");
    this.hud.choice("Moğol Tümeni", "heroes/boss_hakan", `<b>${mongolBoss(lv, m.str).name}</b> komutasındaki tümen <b>${CITY_NAME[id]}</b> üzerine yürüyor: <b>${Math.ceil(this.mongolDaysLeft())} gün</b>.<br>Tümenin gücü: <b>${"◆".repeat(m.str)}${"◇".repeat(STR_MAX - m.str)}</b> · zafer şansın <b>%${pct}</b>${m.spared ? `<br>Haraç ödendi: <b class="cheap">${CITY_NAME[m.spared]}</b> bağışlanacak.` : ""}${fallen ? `<br>Yanan şehirler: <b class="neg">${fallen}</b>` : ""}<br><br>${m.pact === "join" ? `Moğol'a boyun eğdin. Yağmadan payın: <b>${m.loot}</b> altın.` : "Tümen bir şehre vardığında yakınındaysan şehri savunabilirsin; surlar sana güç verir."}`, opts);
  }

  mongolTribute(): void {
    const s = this.s;
    const m = this.mongol();
    const id = ROUTE[m.next];
    const cost = tributeCost(m.next, s.hero.lv);
    if (s.res.gold < cost) return this.hud.toast("Haraç için altının yetmiyor", "bad");
    s.res.gold -= cost;
    m.spared = id;
    this.addKut(-2, "Moğol'a haraç verdin");
    this.chron(`${s.hero.name}, ${CITY_NAME[id]} bağışlansın diye noyana ${cost} altın haraç gönderdi.`);
    this.hud.toast(`Elçi döndü: ${CITY_NAME[id]} bu sefer bağışlanacak.`, "good");
    saveGame(s);
  }

  mongolJoin(): void {
    const s = this.s;
    const m = this.mongol();
    this.hud.choice("Boyun Eğmek", "heroes/boss_hakan", `Noyan sana bir tuğ ve altın kemer uzatıyor: "Gök Tanrı yeryüzünü Han'a verdi. Bize katılan yaşar, direnen ölür."<br><br>Katılırsan senin şehirlerin bağışlanır ve her yağmadan <b>${joinLoot(s.hero.lv)}</b> altın pay alırsın. Ama kutun ağır yara alır, halk seni hain bilir.`, [
      {
        label: "Tuğu al",
        cls: "red",
        fn: () => {
          m.pact = "join";
          this.addKut(-20, "Moğol'a boyun eğdin");
          this.chron(`${s.hero.name} Moğol'a boyun eğdi ve noyanın tuğunu aldı.`);
          this.hud.toast("Artık Moğol tümeniyle birliktesin.", "bad");
          saveGame(s);
        },
      },
      { label: "Reddet", cls: "go", fn: () => {} },
    ]);
  }

  private mongolWin(m: MongolState): string {
    const s = this.s;
    m.wins++;
    m.str--;
    s.renown += 40;
    s.hero.xp += 300 + s.hero.lv * 20;
    this.addKut(4, "Moğol'u durdurdun");
    if (m.str > 0) {
      m.due += WIN_DELAY;
      this.chron(`${s.hero.name}, Moğol tümenini ${CITY_NAME[ROUTE[m.next]]} önünde geri püskürttü.`);
      return `Tümen dağılıp geri çekildi! ${CITY_NAME[ROUTE[m.next]]} için <b>${WIN_DELAY} gün</b> kazandın. Tümenin gücü kırılıyor (${m.str}/${STR_MAX}). +40 şöhret`;
    }
    m.stage = 3;
    s.res.gold += 3000;
    s.renown += 150;
    this.addKut(15, "Moğol dalgasını kırdın");
    this.chron(`${s.hero.name} Moğol dalgasını kırdı. Noyanlar doğuya döndü; İpek Yolu kurtuldu.`);
    setTimeout(() => this.hud.story("Dalga Kırıldı", "icons/trophy", `Üçüncü yenilgiden sonra noyanlar atlarını doğuya çevirdi. Ozanlar yüz yıl boyunca bu savaşı anlatacak: <b>Kara Bulut'u durduran yiğit</b>.<br><br><b class="cheap">+3000 altın · +150 şöhret · +15 kut</b>`, "Destan yazıldı"), 600);
    return "Moğol tümeni bozguna uğradı!";
  }

  /** Son savaşta yanına gelenler: müttefik beyler, şehir garnizonları, yoldaşlar. Düşman gücünden düşülür. */
  finalAid(): { lines: string[]; aid: number } {
    const s = this.s;
    const lines: string[] = [];
    let aid = 0;
    for (const r of s.rivals) {
      if (r.status !== "ally" && r.status !== "vassal") continue;
      lines.push(`${r.name} ${r.title} tuğuyla geldi`);
      aid += 0.04;
    }
    const owned = Object.keys(s.owned).length;
    if (owned) {
      lines.push(`${owned} şehrinin garnizonu yürüdü`);
      aid += 0.02 * owned;
    }
    for (const c of s.comps) {
      lines.push(`${COMP_BY_ID[c as CompId].name} yanında`);
      aid += 0.02;
    }
    if (s.kagan) {
      lines.push("Kurultayın bütün boyları at bindi");
      aid += 0.06;
    }
    if (s.c.rescued >= 10) {
      lines.push(`Zincirden kurtardığın ${s.c.rescued} esir kılıç kuşandı`);
      aid += 0.03;
    }
    return { lines, aid: Math.min(0.3, aid) };
  }

  mongolAttack(ready = false): void {
    const s = this.s;
    const m = this.mongol();
    if (m.stage !== 2) return;
    const lv = s.hero.lv;
    const betray = m.pact === "join";
    const last = m.str === 1 && !betray;
    if (last && !ready) {
      const { lines, aid } = this.finalAid();
      const who = lines.length ? `<ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul><b class="cheap">Tümenin gücü %${Math.round(aid * 100)} kırıldı.</b>` : `<i>Yanında kimse yok. Bozkır, yalnız yiğidin cesaretini de yalnızlığını da unutmaz.</i>`;
      this.hud.choice("Son Savaş", "heroes/boss_hakan", `İki yenilgiden sonra noyanlar son tümenlerini topladı. Bu savaş İpek Yolu'nun kaderini belirleyecek: kazanırsan dalga kırılır, kaybedersen yol yanar.<br><br>Kurduğun her dostluk bu sabah karşılığını veriyor:${who}`, [
        { label: "Tuğu kaldır: saldır!", cls: "red", fn: () => this.mongolAttack(true) },
        { label: "Henüz değil", cls: "", fn: () => {} },
      ]);
      return;
    }
    if (betray) {
      m.pact = "war";
      this.chron(`${s.hero.name} Moğol'a verdiği sözü bozdu ve tümene arkadan vurdu.`);
    }
    const aid = last ? this.finalAid().aid : 0;
    if (last) this.chron(`${s.hero.name} Moğol'un son tümeninin karşısına dikildi.`);
    this.battle(last ? "Son Savaş" : "Moğol Tümeni", mongolArmy(lv, m.str), (betray ? -0.1 : 0.05) - aid, (win) => (win ? this.mongolWin(m) : "Moğol okları gökyüzünü kararttı. Geri çekilmek zorunda kaldın."), mongolBoss(lv, m.str), "Moğol Tümeni");
  }

  private mongolAdvance(m: MongolState): void {
    const day = this.dayOf().day;
    m.next++;
    if (m.next >= ROUTE.length) {
      m.stage = 4;
      this.chron("Moğol tümeni batının denizine ulaştı ve doğuya döndü. Ardında küller kaldı.");
      this.hud.story("Kara Bulut Dağıldı", "map/ruins", "Tümen batı denizine varınca atlarını doğuya çevirdi. Yollar yeniden açılıyor, ama yanan şehirlerin yarası kolay kapanmayacak.", "Devam");
      return;
    }
    m.left = day;
    m.due = day + LEG_DAYS;
  }

  private mongolArrive(): void {
    const s = this.s;
    const m = this.mongol();
    const id = ROUTE[m.next];
    const c = this.cityPos(id);
    const lv = s.hero.lv;
    const near = Math.hypot(c.x - s.hero.x, c.y - s.hero.y) < 280;
    const mine = !!s.owned[id] || (id === CAPITAL.id && s.beylik);
    if (m.pact === "war" && m.spared !== id && (near || mine)) {
      this.mongBusy = true;
      this.hud.toast(`Moğollar ${CITY_NAME[id]} surlarına dayandı!`, "bad");
      this.battle(`${CITY_NAME[id]} Savunması`, mongolArmy(lv, m.str), -0.08 - (m.str === 1 ? this.finalAid().aid : 0), (win) => {
        this.mongBusy = false;
        if (win) {
          const txt = this.mongolWin(m);
          if (m.stage === 2) this.mongolAdvance(m);
          return `${CITY_NAME[id]} surları dayandı! ${txt}`;
        }
        this.mongolFall(id);
        return `${CITY_NAME[id]} düştü.`;
      }, mongolBoss(lv, m.str), "Moğol Tümeni");
      return;
    }
    this.mongolFall(id);
  }

  private mongolFall(id: string): void {
    const s = this.s;
    const m = this.mongol();
    const name = CITY_NAME[id];
    const mine = !!s.owned[id] || (id === CAPITAL.id && s.beylik);
    if (m.spared === id || (m.pact === "join" && mine)) {
      m.spared = null;
      this.chron(`${name} kapılarını açtı; Moğol tümeni şehre dokunmadan geçti.`);
      this.hud.toast(`${name} bağışlandı. Tümen batıya yürüyor.`, "good");
      this.mongolAdvance(m);
      saveGame(s);
      return;
    }
    m.fallen.push({ id, day: this.dayOf().day });
    const sr = s.serais[id];
    if (sr) {
      sr.coffer = 0;
      sr.lv = Math.max(1, sr.lv - 1);
    }
    let extra = "";
    if (m.pact === "join") {
      const g = joinLoot(s.hero.lv);
      s.res.gold += g;
      m.loot += g;
      this.addKut(-3, "yağmaya ortak oldun");
      extra = `<br><br>Yağmadan payın: <b class="cheap">+${g} altın</b>. Kutun kararıyor.`;
    } else if (mine) {
      if (id === CAPITAL.id) {
        const lost = Math.round(s.res.gold * 0.25);
        s.res.gold -= lost;
        this.addKut(-8, "başkentin yağmalandı");
        extra = `<br><br><b class="neg">Hazinenin dörtte biri (${lost} altın) yağmalandı.</b>`;
      } else {
        delete s.owned[id];
        this.addKut(-5, `${name} elinden çıktı`);
        extra = `<br><br><b class="neg">${name} artık senin değil.</b>`;
      }
    }
    this.chron(`${name} Moğol tümenine düştü ve yağmalandı.`);
    audio.play("lose");
    this.hud.story(`${name} Düştü`, "cities/" + id, `${FALL_TEXT[m.next % FALL_TEXT.length]}<br><br>Çarşı ${RECOVER_DAYS} gün boyunca harabe: fiyatlar <b class="neg">%${Math.round((FALL_PRICE - 1) * 100)} pahalı</b>, kervansaray kasası yağmalandı.${extra}`, "Devam");
    this.mongolAdvance(m);
    saveGame(s);
  }

  private kipCache: KipPoi[] | null = null;

  kip(): KipState {
    return (this.s.kip ??= newKip());
  }

  /** Bölge noktaları; geçilebilir ve ulaşılabilir en yakın hücreye oturtulur. */
  kipPois(): KipPoi[] {
    if (this.kipCache) return this.kipCache;
    const w = this.world;
    const ok = (x: number, y: number) => {
      const nx = Math.floor(x / NAV), ny = Math.floor(y / NAV);
      if (nx < 1 || ny < 1 || nx >= NW - 1 || ny >= NH - 1) return false;
      const i = ny * NW + nx;
      return w.reach[i] === 1 && w.cost[i] < 2.2;
    };
    let n = 0;
    this.kipCache = KIP_RAW.map(([kind, fx, fy]) => {
      let x = fx * W, y = fy * H;
      search: for (let r = 0; r < 400; r += NAV)
        for (let a = 0; a < 16; a++) {
          const px = x + Math.cos((a / 16) * Math.PI * 2) * r, py = y + Math.sin((a / 16) * Math.PI * 2) * r;
          if (ok(px, py)) {
            x = px;
            y = py;
            break search;
          }
        }
      return { kind, x, y, n: kind === "stone" ? n++ : 0 };
    });
    return this.kipCache;
  }

  kipNear(i: number, r = 110): boolean {
    const p = this.kipPois()[i];
    return !!p && Math.hypot(p.x - this.s.hero.x, p.y - this.s.hero.y) < r;
  }

  private kipT = 1;

  private kipTick(dt: number): void {
    this.kipT -= dt;
    if (this.kipT > 0) return;
    this.kipT = 1;
    const s = this.s;
    if (!s.free || !inKipchak(s.hero.x, s.hero.y)) return;
    const k = this.kip();
    if (!k.seen) {
      k.seen = true;
      this.chron(tr("Deşt-i Kıpçak'a, Kıpçak bozkırına ayak bastın."));
      const en = lang() === "en";
      this.hud.story(tr("Deşt-i Kıpçak"), "map/yurts", en
        ? "Beyond the Caspian and the Aral the grass reaches a horse's belly and the sky has no edge. This is the Desht-i Kipchak: the land of Köten Han's horde, of the Black Kipchak raiders and of the Stone Fathers raised by the ancestors. <br><br><b class=\"cheap\">Find the Kipchak Horde, read the five Stone Fathers and break the Black Kipchak war camp.</b>"
        : "Hazar'ın ve Aral'ın ötesinde otlar atın karnına değer, gökyüzünün kıyısı yoktur. Burası Deşt-i Kıpçak: Köten Han'ın ordası, Kara Kıpçak akıncıları ve ataların diktiği Taş Babalar'ın yurdu.<br><br><b class=\"cheap\">Kıpçak Ordası'nı bul, beş Taş Baba'yı oku ve Kara Kıpçak ordugâhını dağıt.</b>", tr("Devam"));
      saveGame(s);
    }
    this.kipPois().forEach((p, i) => {
      if (p.kind === "stone" && !k.stones.includes(p.n) && this.kipNear(i, 90)) this.readStone(p.n);
    });
  }

  private readStone(n: number): void {
    const s = this.s;
    const k = this.kip();
    if (k.stones.includes(n)) return;
    k.stones.push(n);
    s.hero.xp += stoneXp(s.hero.lv);
    const fx = this.roadFx(STONE_FX);
    const st = STONES[n];
    const all = k.stones.length >= STONES.length;
    audio.play("story");
    this.hud.story(`${tr("Taş Baba")} ${k.stones.length}/${STONES.length}`, "map/kurgan", `<i>"${lang() === "en" ? st.en : st.tr}"</i><br><br>+${stoneXp(s.hero.lv)} ${tr("TP")}${fx ? `<br>${fx}` : ""}${all ? `<br><br><b class="good">${tr("Beş taşın sözünü de okudun. Ataların sözü yolunu aydınlatıyor: tecrübe +%5.")}</b>` : ""}`, tr("Devam"));
    if (all) this.chron(tr("Beş Taş Baba'nın sözünü okudun."));
    saveGame(s);
  }

  kipGiftReason(): string {
    const k = this.kip();
    if (!this.s.free) return tr("Önce hürriyetini kazan");
    if (this.s.res.gold < KIP_GIFT) return `${KIP_GIFT} ${tr("altın gerekir")}`;
    if (k.giftDay === this.dayOf().day) return tr("Bugün armağan sundun");
    if (k.rep >= 100) return tr("Han zaten kardeşin");
    return "";
  }

  kipGift(): void {
    if (this.kipGiftReason()) return;
    const k = this.kip();
    this.s.res.gold -= KIP_GIFT;
    k.giftDay = this.dayOf().day;
    k.rep = Math.min(100, k.rep + KIP_GIFT_REP);
    audio.play("coin");
    this.hud.toast(`${tr("Köten Han armağanı kabul etti")} · ${tr("itibar")} ${k.rep}`, "good");
  }

  kipHireReason(): string {
    const k = this.kip();
    if (k.rep < KIP_HIRE_REP) return `${tr("itibar")} ${KIP_HIRE_REP}+`;
    const left = k.hireDay + KIP_HIRE_GAP - this.dayOf().day;
    if (left > 0) return `${left} ${tr("gün")}`;
    if (this.s.res.gold < kipHireCost(this.s.hero.lv)) return `${kipHireCost(this.s.hero.lv)} ${tr("altın gerekir")}`;
    if (armySize(this.s.hero.army) + KIP_HIRE_N > this.heroCap()) return tr("Birlik sınırı dolu");
    return "";
  }

  kipHire(): void {
    if (this.kipHireReason()) return;
    const k = this.kip();
    this.s.res.gold -= kipHireCost(this.s.hero.lv);
    this.s.hero.army.horse += KIP_HIRE_N;
    k.hireDay = this.dayOf().day;
    audio.play("coin");
    this.hud.toast(tr("{n} Kıpçak atlısı sancağına katıldı.", { n: KIP_HIRE_N }), "good");
  }

  kipSellValue(): number {
    const h = this.s.hero;
    return GOOD_KEYS.reduce((a, g) => a + Math.round(GOODS[g].base * KIP_SELL_MULT) * (h.cargo[g] ?? 0), 0);
  }

  kipSellReason(): string {
    const k = this.kip();
    if (k.rep < KIP_SELL_REP) return `${tr("itibar")} ${KIP_SELL_REP}+`;
    if (k.sellDay === this.dayOf().day) return tr("Orda bugün alışverişini yaptı");
    if (this.kipSellValue() <= 0) return tr("Yükün boş.");
    return "";
  }

  kipSell(): void {
    if (this.kipSellReason()) return;
    const s = this.s;
    const h = s.hero;
    const v = this.kipSellValue();
    let paid = 0;
    for (const g of GOOD_KEYS) {
      paid += h.paid[g] ?? 0;
      h.cargo[g] = 0;
      h.paid[g] = 0;
    }
    s.res.gold += v;
    s.c.profit += Math.max(0, v - paid);
    this.kip().sellDay = this.dayOf().day;
    audio.play("coin");
    this.hud.toast(`${tr("Orda bütün yükünü aldı")}: +${v} ${tr("altın")}`, "good");
  }

  kipStepReady(): boolean {
    const k = this.kip();
    if (k.step === 0) return this.s.res.food >= KIP_FOOD;
    if (k.step === 1) return k.fort;
    if (k.step === 2) return k.stones.length >= STONES.length;
    return false;
  }

  kipStep(): void {
    const s = this.s;
    const k = this.kip();
    if (k.step >= KIP_STEPS.length || !this.kipStepReady()) return;
    if (k.step === 0) s.res.food -= KIP_FOOD;
    const st = KIP_STEPS[k.step];
    k.rep = Math.min(100, k.rep + st.rep);
    k.step++;
    audio.play("quest");
    if (k.step < KIP_STEPS.length) {
      this.hud.toast(`${lang() === "en" ? st.en : st.title} · ${tr("tamamlandı")} · ${tr("itibar")} ${k.rep}`, "good");
      return;
    }
    k.ally = true;
    k.rep = 100;
    const fx = this.roadFx(KIP_ALLY_FX);
    this.chron(tr("Köten Han ile ant içtin; Kıpçak ordası artık kardeşin."));
    this.hud.story(tr("Kıpçak Andı"), "lord_bey", `${tr("Köten Han kımız kâsesini kaldırdı: \"Kıpçak'ın atı senin atın, yolu senin yolundur.\" Beyler ant içti.")}<br><br>${fx}<br><b class="good">${tr("Kıpçak kardeşliği: ordu gücü +%3, hız +%3")}</b>`, tr("Devam"));
    saveGame(s);
  }

  kipFortOdds(): number {
    return this.odds(kipFortArmy(this.s.hero.lv), 0, kipBoss(this.s.hero.lv));
  }

  kipFortAttack(): void {
    const s = this.s;
    const k = this.kip();
    if (k.fort || !s.free) return;
    const lv = s.hero.lv;
    const boss = { ...kipBoss(lv), name: tr(kipBoss(lv).name) };
    this.battle(tr("Kara Kıpçak Ordugâhı"), kipFortArmy(lv), 0, (win) => {
      if (!win) return `<p class="warn">${tr("Kara Kıpçaklar seni püskürttü. Birliğini güçlendirip yeniden gel.")}</p>`;
      k.fort = true;
      const fx = this.roadFx(KIP_FORT_FX);
      this.addFoe(boss.name, "boss");
      this.chron(tr("Kara Kıpçak ordugâhını dağıttın; Tuğrıl'ın sancağı devrildi."));
      return `<p class="good">${tr("Ordugâh dağıldı! Tuğrıl'ın sancağı devrildi.")}</p><p>${fx}</p>`;
    }, boss, tr("Kara Kıpçaklar"));
  }

  private weekCheck(): void {
    const s = this.s;
    const w = this.weekly();
    const now = weekId();
    if (now === w.id) return;
    const score = this.weekScoreNow();
    const rank = weekRank(this.weekBoardNow(1));
    if (s.free) while (w.claimed < WEEK_TIERS && score >= weekNeed(w.claimed, w.lv)) this.weekClaim(w.claimed);
    const hist = [{ id: w.id, score, rank }, ...w.hist].slice(0, 8);
    s.weekly = { id: now, base: { ...s.c }, lv: s.hero.lv, claimed: 0, hist };
    steamStats({ weekly_best: Math.max(...hist.map((h) => h.score)) });
    if (score > 0) {
      if (rank === 1) this.addKut(3, tr("Haftanın birincisi"));
      this.hud.toast(tr("Hafta kapandı: {r}. sıra, {n} puan. Yeni hafta: {t}", { r: rank, n: score, t: lang() === "en" ? weekTheme(now).en : weekTheme(now).name }), rank <= 3 ? "good" : "info");
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
    if (win) this.toyScore("gur", (r + 1) * 33);
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
    this.toyScore("kb", goals * 15);
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
        const owns = Object.keys(s.owned).some((c) => Math.hypot(this.cityPos(c).x - this.cityPos(r.home).x, this.cityPos(c).y - this.cityPos(r.home).y) < 1400 * WS);
        const hostage = s.wd?.captives.some((c) => c.rival === s.rivals.indexOf(r));
        if (!hostage && (r.rel <= -40 || (owns && r.trait === "hirsli" && r.rel < 10)) && Math.random() < 0.2 * tr.war) this.rivalWar(r, false);
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
    this.rivalAmbition(live);
  }

  /** Rakip beyler de kale alır, senin kalelerine göz diker. */
  private rivalAmbition(live: Rival[]): void {
    const s = this.s;
    const day = this.dayOf().day;
    for (const r of live) {
      if (r.lv < 8 || Math.random() > 0.07) continue;
      const home = this.cityPos(r.home);
      const fac = factionOf(r.home);
      const d = (p: { x: number; y: number }) => Math.hypot(p.x - home.x, p.y - home.y);
      if (r.status === "war") {
        const mine = s.forts.map((f, i) => ({ f, i })).filter((x) => x.f.owner === "me" && !x.f.threat).sort((a, b) => d(a.f) - d(b.f))[0];
        if (!mine) continue;
        const n = Math.round(armySize(r.army) * 0.8);
        mine.f.threat = { day: day + 2, n, from: fac };
        this.chron(`${rivalName(r)}, ${this.fortTitle(mine.i)} üzerine yürüyor.`);
        this.hud.toast(tr("{r} {k} üzerine yürüyor! 2 gün içinde surlara varacak (~{n} asker).", { r: rivalName(r), k: this.fortTitle(mine.i), n }), "bad");
        return;
      }
      if (r.status !== "peace" && r.status !== "ally") continue;
      const prey = s.forts.map((f, i) => ({ f, i })).filter((x) => x.f.owner === "harami" && d(x.f) < 1600 * WS).sort((a, b) => d(a.f) - d(b.f))[0];
      if (!prey || this.rivalPower(r) < armyPower(prey.f.gar) * 1.2) continue;
      prey.f.owner = fac;
      prey.f.lost = 1;
      prey.f.gar = fortGarrison(prey.f.tier, fac, 1);
      for (const u of UNIT_KEYS) r.army[u] = Math.floor(r.army[u] * 0.8);
      r.lv = Math.min(30, r.lv + 1);
      this.chron(`${rivalName(r)}, ${this.fortTitle(prey.i)} haramilerini kılıçtan geçirip kaleyi ${FACTIONS[fac].name} adına aldı.`);
      this.hud.toast(tr("Söylenti: {r} {k} kalesini haramilerden aldı. Adı bozkırda büyüyor.", { r: rivalName(r), k: this.fortTitle(prey.i) }), "info");
      return;
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
        { label: tr("Oğlunu rehin al · fidye ya da biat için"), cls: "", fn: () => {
          r.status = "peace";
          r.rel = Math.min(r.rel, -20);
          this.addCaptive({ name: tr("{r} oğlu", { r: rivalName(r) }), kind: "bey", from: null, rival: i, value: tribute(r) * 8 });
          this.chron(`${rivalName(r)} canını oğlunu rehin vererek kurtardı.`);
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
    const camps = s.camps.map((c, i) => ({ c, i, d: Math.hypot(c.x - home.x, c.y - home.y) })).filter((x) => x.c.alive && x.d < 1600 * WS).sort((a, b) => a.d - b.d);
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

  upkeepCost(): { gear: number; tax: number } {
    const gear = armySize(this.s.hero.army) * 4;
    const tax = Math.round(Math.max(0, this.s.res.gold - 2000) * 0.06);
    return { gear, tax };
  }

  /** Haftada bir: ordunun teçhizat yenilemesi ve büyük hazinelere düşen han payı. */
  private weeklyUpkeep(): void {
    const { gear, tax } = this.upkeepCost();
    if (gear + tax <= 0) return;
    this.s.res.gold = Math.max(0, this.s.res.gold - gear - tax);
    this.hud.toast(tr("Haftalık hesap: teçhizat {g} altın{t}", { g: gear, t: tax ? tr(", hanın payı {n} altın", { n: tax }) : "" }), "info");
  }

  private worldEvents(dt: number, now: number): void {
    const s = this.s;
    const day = this.dayOf().day;
    if (day !== s.evDay) {
      s.evDay = day;
      const imaret = Object.values(s.vakif ?? {}).filter((l) => l >= 3).length;
      if (imaret) s.renown += 2 * imaret;
      if (s.free && day % 7 === 0) this.weeklyUpkeep();
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
        const sc = CITIES.find((c) => s.serais[c.id] && Math.hypot(c.x - v.x, c.y - v.y) < 700 * WS);
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
      const cand = s.villages.map((v, i) => ({ v, i, d: Math.hypot(v.x - h.x, v.y - h.y) })).filter((x) => x.d > 200 && x.d < 1300 * WS && this.isExplored(x.v.x, x.v.y) && Math.hypot(x.v.x - CAPITAL.x, x.v.y - CAPITAL.y) > 260);
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

  /** Töre: kan bedeli ödeyip davayı kan dökmeden kapat. */
  payDiyet(id: number): void {
    const s = this.s;
    const n = s.nemeses.find((x) => x.id === id);
    if (!n || !n.alive || n.han) return;
    const cost = diyetCost(n.lv);
    if (s.res.gold < cost) return this.hud.toast("Diyet için altının yetmiyor", "bad");
    s.res.gold -= cost;
    n.alive = false;
    n.peace = true;
    this.addKut(3, "töreye göre diyet ödedin");
    this.chron(`${s.hero.name}, ${nemName(n)} ile aksakallar önünde diyet ödeyip barıştı. Kan davası töreyle kapandı.`);
    this.hud.story("Diyet", "icons/seal", `Aksakallar halka oldu. ${nemName(n)} kılıcını yere koydu, sen <b>${cost}</b> altın kan bedelini önüne bıraktın. Bir kâse kımız paylaşıldı.<br><br>"Töre kandan büyüktür."<br><br><b class="cheap">Kan davası kapandı · +3 kut</b>`, "Barış olsun");
    saveGame(s);
  }

  // ---------- söylenti ve haber hızı ----------

  intelOf(city: string): { day: number; p: Partial<Record<Good, [number, number]>> } | null {
    return this.s.intel?.[city] ?? null;
  }

  private noteIntel(city: string, day = this.dayOf().day): void {
    const p: Partial<Record<Good, [number, number]>> = {};
    for (const k of GOOD_KEYS) p[k] = [this.buyPrice(city, k), this.sellPrice(city, k)];
    (this.s.intel ??= {})[city] = { day, p };
  }

  /** Haberin kahramana ulaşma süresi (saniye): uzaklıkla artar, kervansaray ağı kısaltır. */
  newsDelay(city: string): number {
    const c = this.cityPos(city);
    const h = this.s.hero;
    const d = Math.hypot(c.x - h.x, c.y - h.y);
    if (d < 200) return 0;
    const net = this.s.serais[city] ? 0.35 : 1;
    return Math.min(DAY_SEC * 1.2, (d / W) * DAY_SEC * 2.2) * net;
  }

  newsAge(city: string): number | null {
    const it = this.intelOf(city);
    return it ? Math.max(0, this.dayOf().day - it.day) : null;
  }

  buyNews(): void {
    const s = this.s;
    if (s.res.gold < NEWS_GOLD) return this.hud.toast("Kervancılar bedava konuşmaz", "bad");
    s.res.gold -= NEWS_GOLD;
    const day = this.dayOf().day;
    for (const c of CITIES) this.noteIntel(c.id, day - Math.round(this.newsDelay(c.id) / DAY_SEC));
    this.hud.toast("Kervancılar bütün şehirlerin fiyatlarını anlattı (uzaktakiler eski haber).", "good");
  }

  private intelT = 0;
  private intelDay = 0;

  private intelTick(dt: number): void {
    this.intelT -= dt;
    if (this.intelT > 0) return;
    this.intelT = 2;
    const s = this.s;
    const ci = this.nearCity(220);
    if (ci >= 0) this.noteIntel(CITIES[ci].id);
    const day = this.dayOf().day;
    if (day !== this.intelDay) {
      this.intelDay = day;
      for (const id of Object.keys(s.serais)) this.noteIntel(id);
    }
    if (s.news?.length) {
      const due = s.news.filter((n) => n.at <= s.time);
      if (due.length) {
        s.news = s.news.filter((n) => n.at > s.time);
        for (const n of due) this.hud.toast(`Söylenti: ${n.text.replace(/<[^>]+>/g, "")}`, "info");
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
    const late = this.newsDelay(ci.id);
    if (late < 5) this.hud?.toast(`Söylenti: ${text}`, "info");
    else (this.s.news ??= []).push({ at: this.s.time + late, text: `${text} (${late > DAY_SEC * 0.6 ? "bir günlük" : "taze"} haber)` });
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
    const prev = this.lastCity;
    this.lastCity = ci;
    if (ci < 0) return;
    if (prev !== -2) this.cityArrive(ci);
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
        return { label: why ? `${e.label} (${why})` : e.label, cls: why ? "off" : e.id === "tengri" || e.id === "noyan" ? "red" : "go", fn: () => this.chooseEnding(e.id) };
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
    } else if (id === "noyan") {
      for (const r of s.rivals) if (r.status === "war" || r.status === "peace") r.status = "vassal";
      for (const v of s.villages) v.rep = Math.max(0, v.rep - 30);
      for (const o of Object.values(s.owned)) if (o) o.loy = Math.max(0, o.loy - 20);
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
    const m = s.mongol;
    if (m && m.stage >= 2) {
      const burnt = m.fallen.length;
      lines.push(
        m.stage === 3
          ? `Kara Bulut'u durdurdu; ${ROUTE.length - burnt} şehir onun sayesinde ayakta kaldı.`
          : m.pact === "join"
            ? `Moğol tuğunu taşıdı; ${burnt} şehrin külleri adını fısıltıyla anar.`
            : m.stage === 4
              ? `Moğol dalgası ${burnt} şehri yaktı; o, küllerin üstüne yeni bir yurt kurdu.`
              : `Kara Bulut hâlâ batıya yürüyor; ${burnt} şehir şimdiden düştü.`,
      );
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
    const xp = Math.max((act3 ? 300 : act2 ? 120 : 40) * n, Math.round(xpNeed(this.s.hero.lv) * 0.5));
    this.addXp(xp);
    const it = rollItem(this.s.nextId++, this.legendTier(), this.cls(), 0.45);
    this.s.hero.bag.push(it);
    this.hud.toast(tr("Destan ilerledi: +{n} tecrübe", { n: xp }) + ` · ${it.name}`, "good");
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
    if (this.s.free) {
      const wm = weekTheme(this.weekly().id).mods;
      for (const k of Object.keys(wm) as (keyof CompMods)[]) m[k] += wm[k] ?? 0;
    }
    const kp = this.s.kip;
    if (kp?.ally) for (const [k, v] of Object.entries(KIP_ALLY_MODS) as [keyof CompMods, number][]) m[k] += v;
    if ((kp?.stones.length ?? 0) >= STONES.length) for (const [k, v] of Object.entries(KIP_STONES_MODS) as [keyof CompMods, number][]) m[k] += v;
    return m;
  }

  bond(id: CompId): number {
    return this.s.bond?.[id] ?? BOND_START;
  }

  private fireT = 0;

  /** Gece duraklayan ordu ateş başında toplanır; iki yoldaş arasında kısa bir konuşma geçer. */
  private campfireTick(dt: number): void {
    const s = this.s;
    this.fireT += dt;
    if (this.fireT < 3) return;
    this.fireT = 0;
    if (!settings.fires || !s.free || !this.isNight() || this.battleLock || this.hud.covered || this.act || s.hero.path?.length || s.comps.length < 2) return;
    const day = this.dayOf().day;
    if (day - (s.fireDay ?? -99) < 2) return;
    const seen = (s.fires ??= []);
    const pool = CAMPFIRES.filter((f) => this.hasComp(f.a) && this.hasComp(f.b));
    const f = pool.find((x) => !seen.includes(x.id)) ?? (pool.length && seen.length >= CAMPFIRES.length ? pool[Math.floor(Math.random() * pool.length)] : null);
    if (!f) return;
    s.fireDay = day;
    if (!seen.includes(f.id)) seen.push(f.id);
    const A = COMP_BY_ID[f.a], B = COMP_BY_ID[f.b];
    const text = f.lines.map(([who, line]) => `<b>${COMP_BY_ID[who].name}:</b> <i>"${line}"</i>`).join("<br><br>");
    this.hud.choice(tr("Kamp ateşi"), A.icon, text, [
      { label: f.sideA, cls: "", fn: () => { this.bondAdd(f.a, 4); this.bondAdd(f.b, -2); } },
      { label: f.sideB, cls: "", fn: () => { this.bondAdd(f.b, 4); this.bondAdd(f.a, -2); } },
      { label: tr("Sessizce ateşi izle"), cls: "", fn: () => { this.bondAdd(f.a, 1); this.bondAdd(f.b, 1); this.hud.toast(tr("{a} ile {b} gece boyu konuştu; ateş sönerken gülüşüyorlardı.", { a: A.name, b: B.name }), "good"); } },
    ]);
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

  // ---------- harabe keşfi ----------

  ruinTier(i: number): number {
    const r = this.s.ruins[i];
    return Math.min(5, 1 + Math.floor(Math.hypot(r.x - CAPITAL.x, r.y - CAPITAL.y) / 800));
  }

  delveStart(i: number): void {
    const s = this.s;
    const r = s.ruins[i];
    if (!r || r.looted || this.delve) return;
    r.looted = true;
    const kind = ruinKind(r.x, r.y);
    const tier = this.ruinTier(i);
    this.delve = { i, kind, tier, rooms: rollRooms(kind, 3), at: 0, gold: 0, xp: 0, riddle: false, notes: [] };
    this.battleLock = true;
    this.note("kesif");
    const K = RUIN_KINDS[kind];
    this.hud.choice(tr(K.name), K.img, `${tr(K.text)}<br><br><span class="dim">${tr("Üç oda ve en dipte hazine. Her odada ganimetinle çıkabilir ya da derine inebilirsin; ölürsen ya da yenilirsen bulduğunun yarısını kaybedersin.")}</span>`, [
      { label: tr("Meşaleyi yak, içeri gir"), cls: "go", fn: () => this.delveRoom() },
      { label: tr("Vazgeç"), cls: "", fn: () => { r.looted = false; this.delve = null; this.battleLock = false; } },
    ]);
  }

  private delveLeave(): { label: string; cls: string; fn: () => void } {
    const d = this.delve!;
    return { label: tr("Ganimetle çık · {g} altın", { g: d.gold }), cls: "", fn: () => this.delveExit(false) };
  }

  private delveNext(): void {
    const d = this.delve;
    if (!d) return;
    d.at++;
    this.battleLock = true;
    this.delveRoom();
  }

  private delveRoom(): void {
    const d = this.delve;
    if (!d) return;
    if (d.at >= d.rooms.length) return this.delveTreasure();
    const s = this.s;
    const h = s.hero;
    const room = d.rooms[d.at];
    const R = ROOM_INFO[room];
    const head = `<span class="dim">${tr("{n}. oda", { n: d.at + 1 })} / ${d.rooms.length} · ${tr("Ganimet")}: <b>${d.gold}</b> ${tr("altın")}</span><br><br>`;
    const body = head + tr(oneOf(R.texts));
    const title = tr(R.name);
    const base = 25 + d.tier * 20;
    const hurt = (k: number) => { h.hp = Math.max(1, Math.round(h.hp - this.maxHp() * k)); };
    const odds = (st: Stat) => Math.min(0.92, 0.45 + this.stat(st) * 0.04 + this.tal("golge") * 0.02);
    const pc = (p: number) => `%${Math.round(p * 100)}`;
    const ok = (t: string) => { d.notes.push(t); this.hud.toast(t, "good"); this.delveNext(); };
    const bad = (t: string, end = false) => { d.notes.push(t); this.hud.toast(t, "bad"); if (end) this.delveExit(true); else this.delveNext(); };
    const opts: { label: string; cls: string; fn: () => void }[] = [];
    switch (room) {
      case "tuzak": {
        const pC = odds("cev");
        const pD = odds("day");
        opts.push({ label: `${tr("Çevikçe atla")} (ÇEV · ${pc(pC)})`, cls: "go", fn: () => (Math.random() < pC ? ok(tr("Tuzağı çevikçe atlattın.")) : (hurt(0.2), bad(tr("Oklar sıyırdı geçti: canın azaldı.")))) });
        opts.push({ label: `${tr("Kalkanla göğüsle")} (DAY · ${pc(pD)})`, cls: "", fn: () => (Math.random() < pD ? ok(tr("Kalkanın okları yuttu.")) : (hurt(0.15), bad(tr("Bir ok zırhını deldi: canın azaldı.")))) });
        break;
      }
      case "bilmece": {
        const q = oneOf(RUIN_RIDDLES);
        const ans = [q.a, ...q.wrong].sort(() => Math.random() - 0.5);
        for (const a of ans)
          opts.push({ label: tr(a), cls: "", fn: () => {
            if (a === q.a) {
              d.riddle = true;
              d.xp += base;
              this.addKut(2);
              ok(tr("Taş kapı gıcırdayarak açıldı. Atalarının bilgisi seninle."));
            } else bad(tr("Taş düğme çöktü; kapı açılmadı, yan geçitten dolaşmak zorunda kaldın."));
          } });
        return this.hud.choice(title, R.img, `${body}<br><br><i>"${tr(q.q)}"</i>`, [...opts, this.delveLeave()]);
      }
      case "bekci": {
        const foe = kurganGuard(Math.max(1, d.tier - 1));
        const n = armySize(foe);
        const pS = Math.min(0.85, 0.3 + this.stat("cev") * 0.04 + this.tal("golge") * 0.03);
        const fight = (extra: number) => {
          this.battleLock = false;
          this.battle(tr("Harabe bekçileri"), foe, 0.02 * d.tier + extra, (win) => {
            if (win) {
              const g = base * 2;
              d.gold += g;
              this.afterBattle = () => this.delveNext();
              return `<p class="good">${tr("Bekçiler dağıldı; kamplarında {g} altın vardı.", { g })}</p>`;
            }
            d.gold = Math.floor(d.gold / 2);
            this.afterBattle = () => this.delveExit(true);
            return `<p class="warn">${tr("Harabeden zor kaçtın; ganimetin yarısı geride kaldı.")}</p>`;
          }, null, tr("Mezar soyguncuları"));
          if (!this.battleLock) this.delveExit(true);
        };
        opts.push({ label: `${tr("Saldır")} · ~${n} ${tr("asker")}`, cls: "bad", fn: () => fight(0) });
        opts.push({ label: `${tr("Gölgelerden süzül")} (ÇEV · ${pc(pS)})`, cls: "", fn: () => (Math.random() < pS ? ok(tr("Bekçiler seni fark etmedi.")) : (this.hud.toast(tr("Bir taş yuvarlandı; bekçiler uyandı!"), "bad"), fight(0.1))) });
        break;
      }
      case "sunak": {
        const cost = 20 + d.tier * 15;
        opts.push({ label: tr("Adak sun · {c} altın (kut, ata kutsaması)", { c: cost }), cls: s.res.gold >= cost ? "go" : "off", fn: () => {
          if (!this.pay({ gold: cost })) return this.delveNext();
          this.addKut(4, tr("sunağa adak"));
          s.buffs.ata = (s.buffs.ata ?? 0) + 3;
          ok(tr("Putun gözleri bir an parladı. Ataların kutsaması 3 savaş boyunca seninle."));
        } });
        opts.push({ label: tr("Putu sök al · +{g} altın (kut düşer)", { g: base * 3 }), cls: "bad", fn: () => {
          d.gold += base * 3;
          this.addKut(-5, tr("putu yağmaladın"));
          if (Math.random() < 0.35) {
            hurt(0.25);
            bad(tr("Put yerinden kalkınca soğuk bir el göğsüne değdi: lanetlendin, canın azaldı."));
          } else ok(tr("Putu heybene koydun. Arkanda bir fısıltı kaldı."));
        } });
        opts.push({ label: tr("Dokunma, geç"), cls: "", fn: () => this.delveNext() });
        break;
      }
      case "kalinti": {
        const g = Math.round(base * (0.8 + Math.random() * 0.6));
        const letter = oneOf(RUIN_LETTERS);
        opts.push({ label: tr("Keseyi al, mektubu oku · +{g} altın", { g }), cls: "go", fn: () => {
          d.gold += g;
          d.xp += Math.round(base * 0.5);
          this.chron(`${gen(h.name)} bir harabede ölü bir tüccarın son mektubunu buldu: <i>${letter}</i>`);
          this.hud.story(tr("Son Mektup"), "icons/scroll", `<i>${tr(letter)}</i><br><br><b class="cheap">+${g} ${tr("altın")}</b>`, tr("Ruhu şad olsun"));
          if (Math.random() < 0.45) this.mapPiece();
          this.delveNext();
        } });
        break;
      }
      case "cokme": {
        const pD = Math.min(0.9, 0.4 + this.stat("day") * 0.04);
        opts.push({ label: `${tr("Aşağı atla, derine dal")} (DAY · ${pc(pD)})`, cls: "bad", fn: () => {
          if (Math.random() < pD) {
            d.gold += base * 2;
            d.xp += base;
            ok(tr("Toz bulutundan sıyrıldın; alt katta el değmemiş bir oda buldun."));
          } else {
            d.gold = Math.floor(d.gold / 2);
            hurt(0.2);
            bad(tr("Tavan çöktü! Molozların altından zor çıktın; ganimetin yarısı gömüldü."));
          }
        } });
        opts.push({ label: tr("Dolaş, sağlam taşlara bas"), cls: "", fn: () => ok(tr("Yavaş ama güvenle geçtin.")) });
        break;
      }
      case "ruh": {
        const line = oneOf(RUIN_SPIRIT_LINES);
        opts.push({ label: tr("Saygıyla eğil · +1 Ruh Taşı"), cls: "go", fn: () => {
          s.mats.ruh += 1;
          this.addKut(2);
          ok(tr("Ruh başını eğdi ve dağıldı; yerinde bir Ruh Taşı kaldı."));
        } });
        opts.push({ label: tr("Yolları sor · haritada çevre açılır"), cls: "", fn: () => {
          const r = s.ruins[d.i];
          this.reveal(r.x, r.y, 9);
          d.xp += base;
          ok(tr("Ruh sana unutulmuş yolları gösterdi; haritan genişledi."));
        } });
        return this.hud.choice(title, R.img, `${body}<br><br><i>${tr(line)}</i>`, [...opts, this.delveLeave()]);
      }
    }
    this.hud.choice(title, R.img, body, [...opts, this.delveLeave()]);
  }

  private delveTreasure(): void {
    const d = this.delve!;
    const g = Math.round((60 * d.tier + Math.random() * 60 * d.tier) * (d.riddle ? 1.3 : 1));
    d.gold += g;
    d.xp += 30 * d.tier;
    const it = this.legendDrop(0.05 * d.tier + (d.riddle ? 0.05 : 0)) ?? this.drop(d.tier, 0.95);
    if (it) d.notes.push(it.name);
    if (Math.random() < 0.35) this.mapPiece();
    this.chron(`${gen(this.s.hero.name)} ${tr(RUIN_KINDS[d.kind].name)} harabesinin en dibine indi ve hazine odasını buldu.`);
    this.hud.choice(tr("Hazine Odası"), "icons/schest", `${tr("Son kapının ardında yüzyıllardır kimsenin dokunmadığı sandıklar.")}${d.riddle ? `<br><span class="cheap">${tr("Bilmeceyi çözdüğün için gizli bölme de açıldı (+%30).")}</span>` : ""}<br><br><b class="cheap">+${g} ${tr("altın")}</b>${it ? ` · <b class="r4">${it.name}</b>` : ""}`, [
      { label: tr("Heybeni doldur, gün ışığına çık"), cls: "go", fn: () => this.delveExit(false) },
    ]);
  }

  private delveExit(lost: boolean): void {
    const d = this.delve;
    if (!d) return;
    this.delve = null;
    this.battleLock = false;
    const s = this.s;
    const room = s.res.gold;
    this.gain({ gold: d.gold });
    const got = s.res.gold - room;
    const up = d.xp ? this.addXp(d.xp) : false;
    audio.play(lost ? "bad" : "quest");
    this.hud.toast(`${tr(RUIN_KINDS[d.kind].name)}: +${got} ${tr("altın")}${d.xp ? `, +${d.xp} TP` : ""}${up ? ` — ${tr("Seviye atladın!")}` : ""}`, lost ? "bad" : "good");
    saveGame(s);
  }

  // ---------- hazine haritaları ----------

  /** Yön ve en yakın şehirle tarif: "Semerkant'ın kuzeydoğusunda". */
  where(x: number, y: number): string {
    const c = CITIES.reduce((a, b) => (Math.hypot(b.x - x, b.y - y) < Math.hypot(a.x - x, a.y - y) ? b : a));
    const a = Math.atan2(y - c.y, x - c.x);
    const dirs = ["doğusunda", "güneydoğusunda", "güneyinde", "güneybatısında", "batısında", "kuzeybatısında", "kuzeyinde", "kuzeydoğusunda"];
    const k = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
    return lang() === "en" ? `${tr(dirs[k])} of ${tr(CITY_NAME[c.id])}` : `${gen(CITY_NAME[c.id])} ${dirs[k]}`;
  }

  mapPiece(): void {
    const w = this.wd();
    if (w.hoard) return;
    w.mapBits = Math.min(3, w.mapBits + 1);
    audio.play("quest");
    if (w.mapBits < 3) {
      this.hud.toast(tr("Yırtık bir harita parçası buldun ({n}/3). Üçü birleşince bir define yerini gösterecek.", { n: w.mapBits }), "good");
      return;
    }
    const s = this.s;
    const h = s.hero;
    const far = s.ruins.filter((r) => Math.hypot(r.x - h.x, r.y - h.y) > 900);
    const r = oneOf(far.length ? far : s.ruins);
    const near = this.where(r.x, r.y);
    w.mapBits = 0;
    w.hoard = { x: r.x + 30, y: r.y + 30, near };
    this.reveal(r.x, r.y, 4);
    this.chron(`${gen(h.name)} üç yırtık parçayı birleştirdi; harita ${near} bir define gösteriyor.`);
    this.hud.story(tr("Harita Tamamlandı"), "icons/parsomen", tr("Üç parça yan yana gelince mürekkep çizgileri birleşti: bir kuru dere, iki tepe ve kırmızı bir çarpı. Define {w}.", { w: `<b>${near}</b>` }) + `<br><br><span class="dim">${tr("Haritada kırmızı çarpıyla işaretlendi. Oraya git ve kaz.")}</span>`, tr("Yola düş"));
  }

  private hoardTick(): void {
    const w = this.s.wd;
    const h = this.s.hero;
    if (!w?.hoard || this.hud.modal() || Math.hypot(w.hoard.x - h.x, w.hoard.y - h.y) > 70) return;
    const spot = w.hoard;
    w.hoard = null;
    const dig = () => {
      const s = this.s;
      const gold = 300 + s.hero.lv * 60;
      const room = s.res.gold;
      this.gain({ gold });
      const it = this.legendDrop(0.6) ?? this.drop(this.legendTier(), 1);
      w.hoards++;
      s.renown += 25;
      this.addKut(3);
      this.chron(`${gen(s.hero.name)} ${spot.near} eski bir defineyi topraktan çıkardı.`);
      this.hud.story(tr("Define!"), "icons/schest", `${tr("Kürek bir sandık kapağına çarptı. Paslı kilidin ardında yüzyılların altını ve bir efsane yatıyordu.")}<br><br><b class="cheap">+${s.res.gold - room} ${tr("altın")}</b> · +25 ${tr("şöhret")}${it ? ` · <b class="r4">${it.name}</b>` : ""}`, tr("Heybeye"));
    };
    if (Math.random() < 0.4) {
      const foe = banditArmy(Math.max(1, Math.min(5, Math.ceil(h.lv / 4))));
      this.hud.choice(tr("Defineciler"), "icons/wanted", tr("Çarpının yanında bir ateş yanıyor: başka biri de haritanın peşindeymiş. Kazmalarını bırakıp kılıçlarına uzandılar."), [
        { label: tr("Saldır") + ` · ~${armySize(foe)} ${tr("asker")}`, cls: "bad", fn: () => this.battle(tr("Defineciler"), foe, 0.05, (win) => {
          if (win) { this.afterBattle = dig; return `<p class="good">${tr("Defineciler kaçtı; kazı sana kaldı.")}</p>`; }
          w.hoard = spot;
          return `<p class="warn">${tr("Geri çekildin; define hâlâ orada.")}</p>`;
        }, null, tr("Defineciler")) },
        { label: tr("Payı bölüş · altının yarısı"), cls: "", fn: () => {
          const s = this.s;
          const half = 150 + s.hero.lv * 30;
          this.gain({ gold: half });
          w.hoards++;
          this.hud.toast(tr("Defineyi bölüştünüz: +{g} altın", { g: half }), "good");
        } },
      ]);
      return;
    }
    dig();
  }

  // ---------- esirler ----------

  addCaptive(c: Omit<Captive, "id" | "day">): boolean {
    const w = this.wd();
    if (w.captives.length >= CAPTIVE_MAX) {
      this.hud.toast(tr("Esir çadırın dolu; {n} serbest bırakıldı.", { n: c.name }), "info");
      return false;
    }
    w.captives.push({ ...c, id: this.s.nextId++, day: this.dayOf().day });
    audio.play("quest");
    this.hud.toast(tr("{n} esir alındı. Ufuk sekmesinden kaderini belirle.", { n: c.name }), "good");
    return true;
  }

  captiveAct(id: number, act: "ransom" | "free" | "recruit" | "sell"): void {
    const s = this.s;
    const w = this.wd();
    const i = w.captives.findIndex((c) => c.id === id);
    if (i < 0) return;
    const c = w.captives[i];
    const r = c.rival !== undefined ? s.rivals[c.rival] : undefined;
    if (act === "recruit" && c.kind === "soylu") return;
    w.captives.splice(i, 1);
    if (act === "ransom") {
      this.gain({ gold: c.value });
      if (r) r.rel = Math.max(-100, r.rel - 10);
      if (c.from && c.kind === "soylu") s.rep[c.from] = this.rep(c.from) - 5;
      this.chron(`${c.name} fidyesi ödenerek ${gen(s.hero.name)} çadırından salındı.`);
      this.hud.toast(tr("{n} için {g} altın fidye geldi.", { n: c.name, g: c.value }), "good");
    } else if (act === "free") {
      this.addKut(3, tr("esiri karşılıksız saldın"));
      this.remember(true, tr("bir esiri karşılıksız saldın"));
      if (r) r.rel = Math.min(100, r.rel + 25);
      if (c.from) this.addRep(c.from, 20, tr("esiri saldın"));
      this.hud.toast(tr("{n} serbest bırakıldı. Cömertliğin dilden dile dolaşacak.", { n: c.name }), "good");
    } else if (act === "recruit") {
      if (c.kind === "bey" && r) {
        r.status = "vassal";
        r.rel = 0;
        this.chron(`${rivalName(r)}, oğlunu kurtarmak için ${gen(s.hero.name)} tuğuna biat etti.`);
        this.hud.toast(tr("{r} oğlunun hayatı için biat etti.", { r: rivalName(r) }), "good");
      } else {
        const h = s.hero;
        const room = Math.max(0, this.heroCap() - armySize(h.army));
        const n = Math.min(room, 4 + Math.floor(h.lv / 3));
        h.army.horse += Math.ceil(n / 2);
        h.army.archer += Math.floor(n / 2);
        this.hud.toast(tr("{n} adamlarıyla saflarına katıldı: +{k} asker.", { n: c.name, k: n }), "good");
      }
    } else {
      const g = Math.round(c.value * 0.7);
      this.gain({ gold: g });
      this.addKut(-8, tr("esir sattın"));
      this.remember(false, tr("bir esiri pazarda sattın"));
      this.chron(`${gen(s.hero.name)} zincirin ne olduğunu bilirdi; yine de ${c.name} esir pazarında satıldı.`);
      this.hud.toast(tr("{n} esir pazarında satıldı: +{g} altın. Bozkır bunu unutmayacak.", { n: c.name, g }), "bad");
    }
    saveGame(s);
  }

  private captiveDaily(): void {
    const s = this.s;
    const w = this.wd();
    for (const c of [...w.captives]) {
      if (Math.random() < (s.beylik ? 0.02 : 0.05)) {
        w.captives = w.captives.filter((x) => x !== c);
        this.hud.toast(tr("{n} gece ipini kemirip kaçtı!", { n: c.name }), "bad");
        continue;
      }
    }
    const offer = w.captives.filter((c) => c.kind !== "harami");
    if (offer.length && Math.random() < 0.15) {
      const c = oneOf(offer);
      const g = Math.round(c.value * 1.3);
      this.hud.notice("seal", tr("Fidye elçisi"), `${c.name} · +${g} ${tr("altın")}`, () => this.hud.choice(tr("Fidye elçisi"), "icons/seal", tr("Bir elçi çadırının önünde diz çöktü: \"{n} için {g} altın getirdim. Efendim onu sağ salim geri istiyor.\"", { n: c.name, g }), [
        { label: tr("Kabul et · +{g} altın", { g }), cls: "go", fn: () => {
          if (!w.captives.includes(c)) return this.hud.toast(tr("Esir artık elinde değil."), "bad");
          w.captives = w.captives.filter((x) => x !== c);
          this.gain({ gold: g });
          this.hud.toast(tr("{n} fidyesi alındı.", { n: c.name }), "good");
        } },
        { label: tr("Geri çevir"), cls: "", fn: () => {} },
      ]), 90000, () => w.captives.includes(c));
    }
  }

  private heroCaptured(by: string): void {
    const s = this.s;
    const h = s.hero;
    const ransom = Math.max(30, Math.round(s.res.gold * 0.25));
    const pC = Math.min(0.85, 0.35 + this.stat("cev") * 0.04);
    this.battleLock = true;
    const done = () => { this.battleLock = false; saveGame(s); };
    this.hud.choice(tr("Esir düştün"), "icons/j_bandit", tr("{b} seni bağlayıp kampına sürükledi. Ellerin bağlı, kılıcın onların elinde. Zinciri tanıyorsun; bir kez kırdın.", { b: by }), [
      { label: tr("Fidyeni öde · {g} altın", { g: ransom }), cls: "go", fn: () => {
        s.res.gold = Math.max(0, s.res.gold - ransom);
        done();
        this.hud.toast(tr("Fidyeni ödedin; atını ve kılıcını geri verdiler."), "info");
      } },
      { label: `${tr("Gece kaç")} (ÇEV · %${Math.round(pC * 100)})`, cls: "bad", fn: () => {
        if (Math.random() < pC) {
          s.renown += 10;
          this.chron(`${s.hero.name} ${by} kampından gece yarısı kaçtı.`);
          this.hud.toast(tr("İpleri kestin ve karanlığa karıştın! +10 şöhret"), "good");
        } else {
          s.res.gold = Math.max(0, s.res.gold - ransom * 2);
          for (const k of Object.keys(h.cargo)) h.cargo[k as Good] = 0;
          h.hp = Math.max(1, Math.round(h.hp * 0.5));
          this.hud.toast(tr("Yakalandın! Dövüldün, yükün ve fidyenin iki katı alındı."), "bad");
        }
        done();
      } },
    ]);
  }

  // ---------- salgın ----------

  plagueOf(city: string): number {
    return this.s.wd?.plague[city] ?? 0;
  }

  plagueStart(city: string): void {
    const w = this.wd();
    const day = this.dayOf().day;
    if (w.plague[city] || (w.plagueImm[city] ?? -1) > day) return;
    w.plague[city] = 1;
    w.plagueAt[city] = day;
    this.chron(`${CITY_NAME[city]} şehrinde salgın başladı.`);
    this.hud.toast(tr("{c} şehrinde salgın! Sarı humma kervan yollarıyla yayılabilir.", { c: CITY_NAME[city] }), "bad");
  }

  private plagueDaily(day: number): void {
    const s = this.s;
    const w = this.wd();
    const ill = Object.keys(w.plague);
    if (!ill.length && day >= 10 && Math.random() < 0.015 + (this.season() === "yaz" ? 0.015 : 0) + (w.wars.length ? 0.01 : 0)) {
      const c = oneOf(CITIES.filter((x) => (w.plagueImm[x.id] ?? -1) <= day));
      if (c) this.plagueStart(c.id);
    }
    for (const c of ill) {
      const age = day - (w.plagueAt[c] ?? day);
      w.plague[c] = Math.max(0, Math.min(5, w.plague[c] + (age < 5 ? 0.9 : -0.8)));
      const p = w.plague[c];
      if (p <= 0.05) {
        delete w.plague[c];
        delete w.plagueAt[c];
        delete w.quarantine[c];
        w.plagueImm[c] = day + 20;
        this.chron(`${CITY_NAME[c]} şehrinde salgın dindi.`);
        this.hud.toast(tr("{c} şehrinde salgın dindi.", { c: CITY_NAME[c] }), "good");
        continue;
      }
      if (p >= 3) this.addShort(c, 0.5);
      const o = s.owned[c];
      if (o) o.loy = Math.max(0, o.loy - p * 0.5);
      if ((w.quarantine[c] ?? -1) >= day || p < 2) continue;
      const P = CITIES.find((x) => x.id === c)!;
      const nb = CITIES.filter((x) => x.id !== c && !w.plague[x.id] && (w.plagueImm[x.id] ?? -1) <= day).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y)).slice(0, 2);
      for (const n of nb) if (Math.random() < 0.03 * p / 2.5) this.plagueStart(n.id);
    }
    const ci = this.nearCity();
    if (ci >= 0 && this.plagueOf(CITIES[ci].id) >= 3 && Math.random() < 0.25) {
      s.hero.hp = Math.max(1, Math.round(s.hero.hp - this.maxHp() * 0.25));
      this.hud.toast(tr("Sarı hummaya yakalandın: canın azaldı. Salgından uzak dur ya da şifacılara bağış yap."), "bad");
    }
  }

  plagueDonate(city: string): void {
    const p = this.plagueOf(city);
    if (!p) return;
    const cost = Math.round(80 + 40 * p);
    if (!this.pay({ gold: cost })) return this.hud.toast(tr("Altın yetersiz"), "bad");
    const w = this.wd();
    w.plague[city] = Math.max(0.1, p - 2);
    this.addKut(3, tr("şifacılara bağış"));
    this.addRep(factionOf(city), 25, tr("salgında yardım"));
    this.remember(true, tr("salgında şifacılara bağış yaptın"));
    this.hud.toast(tr("Şifacılar ilaç kaynattı; salgın geriliyor."), "good");
  }

  plagueQuarantine(city: string): void {
    const w = this.wd();
    if (!this.s.owned[city] || !w.plague[city]) return;
    w.quarantine[city] = this.dayOf().day + 5;
    this.addShort(city, 1);
    this.hud.toast(tr("{c} kapıları kapandı: 5 gün karantina. Salgın yayılmaz ama çarşı daralır.", { c: CITY_NAME[city] }), "info");
  }

  // ---------- rüyalar ve kehanetler ----------

  private dreamCheck(): void {
    const s = this.s;
    const w = this.wd();
    const day = this.dayOf().day;
    if (!s.free || day - w.dreamDay < 3 || this.battleLock || this.hud.modal() || Math.random() > 0.35) return;
    w.dreamDay = day;
    const at = (a: FactionId, b: FactionId) => w.wars.some((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    const pairs = WAR_PAIRS.filter(([a, b]) => !at(a, b) && (w.peaceUntil[warKey(a, b)] ?? -1) <= day + 2);
    const healthy = CITIES.filter((c) => !w.plague[c.id] && (w.plagueImm[c.id] ?? -1) <= day + 2);
    const kinds: Omen["kind"][] = ["hoard", "wolves"];
    if (pairs.length && day >= WAR_MIN_DAY - 2) kinds.push("war", "war");
    if (healthy.length && day >= 8) kinds.push("plague");
    if (!w.drought && this.season() !== "kis") kinds.push("drought");
    const kind = oneOf(kinds);
    const o: Omen = { kind, day: day + 2, told: false };
    if (kind === "war") [o.a, o.b] = oneOf(pairs);
    if (kind === "plague") o.city = oneOf(healthy).id;
    w.omens.push(o);
    const D = DREAMS[kind];
    const plain = tr(D.plain, { a: o.a ? FACTIONS[o.a].name : "", b: o.b ? FACTIONS[o.b].name : "", c: o.city ? CITY_NAME[o.city] : "" });
    const cost = 30;
    const text = tr(oneOf(D.text));
    this.hud.notice("ruh", tr("Bir Rüya"), tr("Ter içinde uyandın..."), () => this.hud.choice(tr("Bir Rüya"), "icons/ruh", `<i>${text}</i><br><br><span class="dim">${tr("Ter içinde uyandın. Rüya hâlâ gözlerinin önünde.")}</span>`, [
      { label: tr("Kam'a yorumlat · {g} altın", { g: cost }), cls: s.res.gold >= cost ? "go" : "off", fn: () => {
        if (!w.omens.includes(o)) return this.hud.toast(tr("Rüya çoktan gerçek oldu."), "info");
        if (!this.pay({ gold: cost })) return;
        o.told = true;
        if (kind === "hoard") {
          w.omens = w.omens.filter((x) => x !== o);
          this.mapPiece();
        }
        this.hud.story(tr("Kam'ın Yorumu"), "icons/ruh", plain, tr("Anladım"));
      } },
      { label: tr("Rüyayı unut"), cls: "", fn: () => {} },
    ]), 120000, () => w.omens.includes(o));
  }

  private omensDaily(day: number): void {
    const w = this.wd();
    for (const o of [...w.omens]) {
      if (o.day > day) continue;
      w.omens = w.omens.filter((x) => x !== o);
      const told = o.told ? tr("Rüyan gerçek oldu: ") : "";
      if (o.kind === "war" && o.a && o.b && !w.wars.some((x) => [x.a, x.b].includes(o.a!) && [x.a, x.b].includes(o.b!))) this.warStart(o.a, o.b, day);
      else if (o.kind === "plague" && o.city) this.plagueStart(o.city);
      else if (o.kind === "drought" && !w.drought) {
        const c = oneOf(CITIES.filter((x) => x.id !== "samarkand"));
        w.drought = { until: day + DROUGHT_DAYS, x: c.x, y: c.y };
        this.chron(`${CITY_NAME[c.id]} ovasında kuraklık başladı.`);
        this.hud.toast(`${told}${tr("{c} ovasında kuraklık başladı.", { c: CITY_NAME[c.id] })}`, "bad");
      } else if (o.kind === "wolves") {
        w.wolves = Math.min(WOLF_MAX, w.wolves + 30);
        this.hud.toast(`${told}${tr("Bozkırda kurtlar çoğaldı; geceleri yalnız yolculuk tehlikeli.")}`, "bad");
      } else if (o.kind === "hoard") this.mapPiece();
      if (o.told && (o.kind === "war" || o.kind === "plague")) this.hud.toast(tr("Rüyan gerçek oldu!"), "info");
    }
  }

  // ---------- büyük toy ----------

  private toyDaily(day: number): void {
    const s = this.s;
    const w = this.wd();
    const year = Math.floor((day - 1) / YEAR_DAYS) + 1;
    const yd = (day - 1) % YEAR_DAYS;
    if (w.toy && day > w.toy.to) return this.toyEnd();
    if (w.toy) {
      for (const f of w.toy.foes) f.pts += 20 + Math.round(Math.random() * 45);
      return;
    }
    if (yd !== TOY_DAY || w.toyYear >= year || s.hero.lv < 4) return;
    w.toyYear = year;
    const live = s.rivals.map((r, i) => ({ r, i })).filter((x) => x.r.status !== "dead").slice(0, 3);
    const foes = [...live.map(({ r, i }) => ({ name: rivalName(r), rival: i, pts: 0 })), ...TOY_CHAMPS.map((name) => ({ name: tr(name), pts: 0 }))];
    for (const f of foes) f.pts = 20 + Math.round(Math.random() * 40);
    w.toy = { y: year, to: day + TOY_LEN - 1, pts: { ok: 0, gur: 0, kb: 0 }, foes };
    this.chron(`${year}. yılın Büyük Toyu kuruldu; beyler ve pehlivanlar meydana çıktı.`);
    this.hud.notice("trophy", tr("Büyük Toy Kuruldu"), tr("{n} gün sürecek", { n: TOY_LEN }), () => this.hud.story(tr("Büyük Toy Kuruldu"), "icons/trophy", `${tr("Davullar üç gün boyunca susmayacak! Okçuluk, kuşak güreşi ve kökbörüde en yüksek puanı toplayan Bozkır Pehlivanı ilan edilecek.")}<br><br>${tr("Rakipler")}: <b>${foes.map((f) => f.name).join(", ")}</b><br><br><span class="dim">${tr("Ufuk sekmesinden yarışlara katıl. Her dalda en iyi sonucun sayılır.")}</span>`, tr("Meydana!")));
  }

  toyScore(k: "ok" | "gur" | "kb", pts: number): void {
    const t = this.s.wd?.toy;
    if (!t || pts <= t.pts[k]) return;
    t.pts[k] = pts;
    this.hud.toast(tr("Büyük Toy puanın: {p}", { p: this.toyTotal() }), "info");
  }

  toyTotal(): number {
    const t = this.s.wd?.toy;
    return t ? t.pts.ok + t.pts.gur + t.pts.kb : 0;
  }

  private toyEnd(): void {
    const s = this.s;
    const w = this.wd();
    const t = w.toy!;
    w.toy = null;
    const me = t.pts.ok + t.pts.gur + t.pts.kb;
    const best = [...t.foes].sort((a, b) => b.pts - a.pts)[0];
    if (me > best.pts) {
      const gold = 300 + s.hero.lv * 40;
      this.gain({ gold });
      s.renown += 60;
      this.addKut(5, tr("Bozkır Pehlivanı"));
      for (const f of FACTION_KEYS) this.addRep(f, 15);
      const it = this.legendDrop(0.35) ?? this.drop(this.legendTier(), 1);
      w.champs.push({ y: t.y, name: s.hero.name });
      this.chron(`${s.hero.name} ${t.y}. yılın Büyük Toyunda Bozkır Pehlivanı ilan edildi.`);
      this.sing("biat", { foe: best.name });
      this.hud.story(tr("Bozkır Pehlivanı!"), "icons/trophy", `${tr("Han kendi elleriyle omzuna kaftan giydirdi. Ozanlar adını yeni türkülere kattı.")}<br><br>${tr("Puanın")}: <b>${me}</b> · ${best.name}: ${best.pts}<br><b class="cheap">+${gold} ${tr("altın")} · +60 ${tr("şöhret")}</b>${it ? ` · <b class="r4">${it.name}</b>` : ""}`, tr("Tuğum yüksek"));
    } else {
      w.champs.push({ y: t.y, name: best.name });
      if (best.rival !== undefined) {
        const r = s.rivals[best.rival];
        if (r) r.lv = Math.min(30, r.lv + 1);
      }
      this.chron(`${best.name} ${t.y}. yılın Büyük Toyunu kazandı.`);
      this.hud.toast(tr("Büyük Toy bitti: {n} şampiyon oldu ({p} puan). Senin puanın {m}.", { n: best.name, p: best.pts, m: me }), "info");
    }
  }

  // ---------- tüccar loncası ----------

  guildCut(): number {
    return GUILD[this.s.wd?.guild ?? 0].cut;
  }

  private guildDaily(day: number): void {
    const s = this.s;
    const w = this.wd();
    const r = guildRank(s.c.profit);
    if (r > w.guild) {
      w.guild = r;
      const G = GUILD[r];
      audio.play("level");
      this.addKut(2);
      this.chron(`${s.hero.name} tüccar loncasında ${G.name} rütbesine yükseldi.`);
      this.hud.notice("merchant", tr("Lonca: {r}", { r: tr(G.name) }), tr("Yeni rütbe"), () => this.hud.story(tr("Lonca: {r}", { r: tr(G.name) }), "icons/merchant", tr(G.text), tr("Mührümü bas")));
    }
    if (w.order && day > w.order.until) {
      this.hud.toast(tr("Lonca siparişinin süresi doldu."), "bad");
      w.order = null;
      w.orderDay = day;
    }
    if (!w.order && w.guild >= 1 && day - w.orderDay >= 3) {
      const ci = this.nearCity();
      const cities = CITIES.filter((c, i) => i !== ci && !this.hostile(c.id));
      if (!cities.length) return;
      const city = oneOf(cities).id;
      const good = oneOf(GOOD_KEYS.filter((g) => goodMult(city, g) >= 1));
      const n = 4 + w.guild * 2;
      const gold = Math.round(n * GOODS[good].base * 1.7 + 80 * w.guild);
      w.order = { good, n, city, until: day + 6, gold };
      this.hud.toast(tr("Lonca siparişi: {n} {g} → {c}, {d} gün içinde · {p} altın", { n, g: GOODS[good].name, c: CITY_NAME[city], d: 6, p: gold }), "info");
    }
  }

  orderReady(): boolean {
    const o = this.s.wd?.order;
    if (!o) return false;
    return this.atCity(o.city) && (this.s.hero.cargo[o.good as Good] ?? 0) >= o.n;
  }

  orderDeliver(): void {
    const w = this.wd();
    const o = w.order;
    if (!o || !this.orderReady()) return;
    const h = this.s.hero;
    const g = o.good as Good;
    const had = h.cargo[g] ?? 0;
    h.cargo[g] = had - o.n;
    h.paid[g] = Math.round((h.paid[g] ?? 0) * ((had - o.n) / had));
    this.gain({ gold: o.gold });
    this.s.c.profit += Math.round(o.gold * 0.5);
    w.order = null;
    w.orderDay = this.dayOf().day;
    audio.play("quest");
    this.hud.toast(tr("Lonca siparişi teslim edildi: +{g} altın", { g: o.gold }), "good");
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
    this.weekCheck();
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
    const fresh: string[] = [];
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
      fresh.push(codexTitle(e));
    }
    if (fresh.length === 1) this.hud.toast(`📜 ${tr("Bitig'e yeni sayfa")}: ${fresh[0]}`, "info");
    else if (fresh.length > 1) this.hud.toast(`📜 ${tr("Bitig'e {n} yeni sayfa", { n: fresh.length })}: ${fresh.slice(0, 3).join(", ")}${fresh.length > 3 ? "…" : ""}`, "info");
  }

  achDone(id: string): boolean {
    return this.ach.has(id);
  }

  private musicT = 0;

  private musicTick(dt: number): void {
    this.musicT -= dt;
    if (this.musicT > 0) return;
    this.musicT = 0.5;
    audio.setScene(settings.dynMusic ? this.musicScene() : "travel");
  }

  musicScene(): MusicScene {
    const s = this.s;
    const h = s.hero;
    if (this.battleLock || this.hud.battleOpen) return "battle";
    if (s.free && s.bandits.some((b) => Math.hypot(b.x - h.x, b.y - h.y) < 280)) return "danger";
    if (this.nearCity(170) >= 0) return "city";
    if (inKipchak(h.x, h.y)) return "steppe";
    return "travel";
  }

  private seasonTick(): void {
    const se = this.season();
    audio.setMood(se, this.isNight());
    if (se === this.lastSeason) return;
    const first = this.lastSeason === null;
    this.lastSeason = se;
    if (first || !this.s.free) return;
    if (se === "bahar") this.gameNevruz();
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
    { title: "Hürriyet bedeli", text: "100 akçe biriktir, Semerkant'a dön ve efendinden hürriyetini satın al.", done: (g) => g.s.free, reward: { gold: 20 }, goto: () => ({ x: CAPITAL.x, y: CAPITAL.y }) },
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

  questsDone(): number {
    return this.s.qdone?.length ?? this.s.quest;
  }

  /** Öğretici görevler sırasız tamamlanabilir; her tikte en çok bir ödül verilir, takipçi ilk bitmemiş görevi gösterir. */
  private quests(): void {
    const s = this.s;
    const done = (s.qdone ??= Array.from({ length: s.quest }, (_, i) => i));
    const i = this.QUESTS.findIndex((q, k) => !done.includes(k) && q.done(this));
    if (i >= 0) {
      const q = this.QUESTS[i];
      this.gain(q.reward);
      done.push(i);
      this.hud.questDone(q);
      saveGame(s);
    }
    let first = 0;
    while (first < this.QUESTS.length && done.includes(first)) first++;
    s.quest = first;
  }

  cityName(i: number): string {
    return CITY_NAME[CITIES[i].id];
  }

  fresh(): Army {
    return army();
  }
}
