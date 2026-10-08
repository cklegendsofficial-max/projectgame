import { freshChronicle, onDynastyReset, type ChronicleState } from "./chronicle";
import type { CityBuild } from "./cities";
import { COMPANION_IDS, COMPANION_MAX, type CompanionId } from "./companions";
import { CONTRACT_KINDS, type Contract, type ContractBoard, type Titan } from "./quests";
import { ENCHANTS, RELICS, type RelicId, HERO_LOOKS, ITEM_TYPES, MAX_BARRACKS, MAX_BREED, MAX_HERO_LEVEL, MAX_PLUS, MAX_TIER, UNIT_TYPES, clampGear, slotOf, type EnchId, type Hero, type Item, type ItemType, type Mats, type Mount, type Slot, type UnitType } from "./army";
import { FORTS, FORT_WALLS, FORT_WAVES, MAX_NEMESES, MAX_NEMESIS_LEVEL, NEMESIS_EPITHETS, NEMESIS_LOOKS, freshArena, type ArenaState, type Nemesis, type Siege } from "./warfare";
import { ROUTES } from "./data";
import { HOUSE_IDS, MAX_BLOOD, PATHS, PERK_COST, SPY_MAX, type Allegiance, type Camp, type HouseId, type PathId } from "./perks";
import { BARD_EVENTS, GUILD_TIERS, MAX_SAGA, RAID_TICKETS, RAID_TIERS, SEASON_STEPS, TW_RIVALS, freshRaid, freshSeason, type BardEvent, type FallenHero, type RaidState, type SagaEntry, type SeasonState, type TradeWar } from "./saga";
import { isPetition } from "./court";
import { NODES, freshNodes, isCity } from "./frontier";
import { cleanOffers, isMerchant, type Merchant } from "./merchant";
import { ARTIFACTS, ART_SLOTS, MONTH_MS, QUEST_STEPS, REGIONS, REGION_MAX, TAXES, TROPHY_IDS, freshRegion, type Incursion, type RegionState } from "./province";
import { EXP_HP, EXP_ROWS, EXP_TICKETS, freshBazaar, type Expedition, type Relation, type Stock } from "./realm";
import { AGES, CREST_COLORS, CREST_SYMBOLS, RIVALS, TRAITS, WONDERS, WONDER_STAGES, type Ruler, type TraitId } from "./empire";

export type Lang = "en" | "tr";
export type Notation = "suffix" | "sci";

export interface RouteState {
  owned: number;
  progress: number;
  running: boolean;
  trips: number;
}

export interface GameState {
  version: 1;
  gold: number;
  runEarned: number;
  lifetimeEarned: number;
  seals: number;
  routes: RouteState[];
  masters: boolean[];
  upgrades: string[];
  favorUntil: number;
  lastAdAt: number;
  boostUntil: number;
  boostMult: number;
  tutorial: number;
  chronicle: ChronicleState;
  cityLevels: Record<string, number>;
  cityBuild: CityBuild | null;
  daily: { last: string; streak: number };
  achievements: string[];
  companions: Partial<Record<CompanionId, number>>;
  storiesSeen: string[];
  age: number;
  wonders: Record<string, number>;
  ruler: Ruler;
  lineage: LineageEntry[];
  house: House | null;
  rivalsBeaten: string[];
  runSeconds: number;
  hero: Hero | null;
  mats: Mats;
  compGear: Partial<Record<CompanionId, Partial<Record<Slot, Item>>>>;
  soldiers: number;
  escorts: number[];
  escortClass: UnitType[];
  barracks: number;
  wounded: number;
  mount: Mount | null;
  nemeses: Nemesis[];
  nemesisSeq: number;
  siege: Siege | null;
  fortsTaken: string[];
  arena: ArenaState;
  relics: RelicId[];
  contracts: ContractBoard;
  titan: Titan | null;
  nextTitan: number;
  allegiance: Allegiance;
  fallenHeroes: FallenHero[];
  tradeWar: TradeWar | null;
  nextTradeWar: number;
  season: SeasonState;
  hans: number[];
  nextHanStory: number;
  spies: number;
  spouse: HouseId | null;
  bloodline: HouseId[];
  camp: Camp | null;
  campSeason: number;
  sagaLog: SagaEntry[];
  raid: RaidState;
  bazaar: Stock[];
  marketPrices: number[];
  diplo: Record<string, Relation>;
  expedition: Expedition | null;
  expTickets: number;
  expAt: number;
  festSeen: string;
  court: string | null;
  nextCourt: number;
  nodeAt: number[];
  governors: Record<string, CompanionId>;
  regions: RegionState[];
  trophies: Record<string, number>;
  mercs: number;
  wageAt: number;
  tax: number;
  mood: number;
  revolt: number;
  artifacts: string[];
  artEquip: string[];
  incursion: Incursion | null;
  nextIncursion: number;
  merchant: Merchant | null;
  nextMerchant: number;
  stats: {
    clicks: number;
    bandits: number;
    merchants: number;
    orders: number;
    dynasties: number;
    playSeconds: number;
    bestRun: number;
    stories: number;
    booms: number;
    fallen: number;
    battles: number;
    crafted: number;
    nemesisSlain: number;
    forts: number;
    enchants: number;
    plusTries: number;
    recruited: number;
    titans: number;
    contracts: number;
    tradeWars: number;
    hans: number;
    migrations: number;
    raids: number;
    foiled: number;
    wars: number;
    alliances: number;
    expeditions: number;
    bazaarGain: number;
    decrees: number;
    gathered: number;
    ruins: number;
    defends: number;
  };
  settings: {
    lang: Lang;
    notation: Notation;
    muted: boolean;
    music: boolean;
  };
  created: number;
  lastSave: number;
}

export interface LineageEntry extends Ruler {
  best: number;
  age: number;
  spouse?: HouseId;
}

export interface House {
  name: string;
  color: number;
  symbol: string;
}

function detectLang(): Lang {
  const l = (navigator.language || "en").toLowerCase();
  return l.startsWith("tr") ? "tr" : "en";
}

export function freshRoutes(): RouteState[] {
  return ROUTES.map((_, i) => ({ owned: i === 0 ? 1 : 0, progress: 0, running: false, trips: 0 }));
}

export function newGame(): GameState {
  const now = Date.now();
  return {
    version: 1,
    gold: 0,
    runEarned: 0,
    lifetimeEarned: 0,
    seals: 0,
    routes: freshRoutes(),
    masters: ROUTES.map(() => false),
    upgrades: [],
    favorUntil: 0,
    lastAdAt: 0,
    boostUntil: 0,
    boostMult: 1,
    tutorial: 0,
    chronicle: freshChronicle(),
    cityLevels: {},
    cityBuild: null,
    daily: { last: "", streak: 0 },
    achievements: [],
    companions: {},
    storiesSeen: [],
    age: 0,
    wonders: {},
    ruler: { name: "Selçuk", trait: "merchant", gen: 1 },
    lineage: [],
    house: null,
    rivalsBeaten: [],
    runSeconds: 0,
    hero: null,
    mats: { iron: 0, leather: 0, wood: 0, steel: 0 },
    compGear: {},
    soldiers: 5,
    escorts: ROUTES.map((_, i) => (i === 0 ? 5 : 0)),
    escortClass: ROUTES.map(() => "spear"),
    barracks: 0,
    wounded: 0,
    mount: null,
    nemeses: [],
    nemesisSeq: 0,
    siege: null,
    fortsTaken: [],
    arena: freshArena(now),
    relics: [],
    contracts: { day: "", list: [], bonus: false },
    titan: null,
    nextTitan: now + 8 * 60_000,
    allegiance: { path: null, rank: 0 },
    fallenHeroes: [],
    tradeWar: null,
    nextTradeWar: now + 6 * 60_000,
    season: freshSeason(now),
    hans: [],
    nextHanStory: now + 5 * 60_000,
    spies: 0,
    spouse: null,
    bloodline: [],
    camp: null,
    campSeason: -1,
    sagaLog: [],
    raid: freshRaid(now),
    bazaar: freshBazaar(),
    marketPrices: [],
    diplo: {},
    expedition: null,
    expTickets: EXP_TICKETS,
    expAt: now,
    festSeen: "",
    court: null,
    nextCourt: now + 90_000,
    nodeAt: freshNodes(),
    governors: {},
    regions: REGIONS.map(() => freshRegion()),
    trophies: {},
    mercs: 0,
    wageAt: now + MONTH_MS,
    tax: 1,
    mood: 66,
    revolt: -1,
    artifacts: [],
    artEquip: [],
    incursion: null,
    nextIncursion: now + 8 * 60_000,
    merchant: null,
    nextMerchant: now + 5 * 60_000,
    stats: {
      clicks: 0,
      bandits: 0,
      merchants: 0,
      orders: 0,
      dynasties: 0,
      playSeconds: 0,
      bestRun: 0,
      stories: 0,
      booms: 0,
      fallen: 0,
      battles: 0,
      crafted: 0,
      nemesisSlain: 0,
      forts: 0,
      enchants: 0,
      plusTries: 0,
      recruited: 0,
      titans: 0,
      contracts: 0,
      tradeWars: 0,
      hans: 0,
      migrations: 0,
      raids: 0,
      foiled: 0,
      wars: 0,
      alliances: 0,
      expeditions: 0,
      bazaarGain: 0,
      decrees: 0,
      gathered: 0,
      ruins: 0,
      defends: 0,
    },
    settings: { lang: detectLang(), notation: "suffix", muted: false, music: true },
    created: now,
    lastSave: now,
  };
}

export function resetForDynasty(s: GameState, newSeals: number): void {
  s.stats.bestRun = Math.max(s.stats.bestRun, s.runEarned);
  s.seals += newSeals;
  s.gold = 0;
  s.runEarned = 0;
  s.routes = freshRoutes();
  s.masters = ROUTES.map(() => false);
  s.upgrades = [];
  s.boostUntil = 0;
  s.boostMult = 1;
  s.stats.dynasties += 1;
  s.cityLevels = {};
  s.cityBuild = null;
  s.age = 0;
  s.rivalsBeaten = [];
  s.runSeconds = 0;
  s.fortsTaken = [];
  s.siege = null;
  s.tradeWar = null;
  s.hans = [];
  s.bazaar = freshBazaar();
  s.court = null;
  if (s.spouse) {
    s.bloodline.push(s.spouse);
    if (s.bloodline.length > MAX_BLOOD) s.bloodline.shift();
    s.spouse = null;
  }
  const guards = s.escorts.reduce((a, b) => a + b, 0);
  s.escorts = ROUTES.map((_, i) => (i === 0 ? guards : 0));
  onDynastyReset(s);
}

function num(v: unknown, d: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : d;
}

export function sanitize(raw: unknown): GameState {
  const base = newGame();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<GameState>;
  const s: GameState = {
    ...base,
    gold: Math.max(0, num(r.gold, 0)),
    runEarned: Math.max(0, num(r.runEarned, 0)),
    lifetimeEarned: Math.max(0, num(r.lifetimeEarned, 0)),
    seals: Math.max(0, Math.floor(num(r.seals, 0))),
    favorUntil: num(r.favorUntil, 0),
    lastAdAt: num(r.lastAdAt, 0),
    boostUntil: num(r.boostUntil, 0),
    boostMult: Math.max(1, num(r.boostMult, 1)),
    tutorial: Math.max(0, Math.floor(num(r.tutorial, 0))),
    created: num(r.created, base.created),
    lastSave: num(r.lastSave, base.lastSave),
    upgrades: Array.isArray(r.upgrades) ? r.upgrades.filter((u): u is string => typeof u === "string") : [],
    stats: { ...base.stats, ...(r.stats ?? {}) },
    settings: { ...base.settings, ...(r.settings ?? {}) },
  };
  s.routes = ROUTES.map((_, i) => {
    const rr = Array.isArray(r.routes) ? r.routes[i] : undefined;
    const def = base.routes[i];
    if (!rr) return def;
    return {
      owned: Math.max(0, Math.floor(num(rr.owned, def.owned))),
      progress: Math.min(1, Math.max(0, num(rr.progress, 0))),
      running: !!rr.running,
      trips: Math.max(0, Math.floor(num(rr.trips, 0))),
    };
  });
  if (s.routes[0].owned < 1) s.routes[0].owned = 1;
  s.masters = ROUTES.map((_, i) => (Array.isArray(r.masters) ? !!r.masters[i] : false));
  s.companions = {};
  if (r.companions && typeof r.companions === "object") {
    for (const id of COMPANION_IDS) {
      const lv = Math.floor(num((r.companions as Record<string, unknown>)[id], 0));
      if (lv > 0) s.companions[id] = Math.min(COMPANION_MAX, lv);
    }
  }
  s.age = Math.max(0, Math.min(AGES.length - 1, Math.floor(num(r.age, 0))));
  s.runSeconds = Math.max(0, num(r.runSeconds, 0));
  s.wonders = {};
  if (r.wonders && typeof r.wonders === "object") {
    for (const w of WONDERS) {
      const st = Math.floor(num((r.wonders as Record<string, unknown>)[w.id], 0));
      if (st > 0) s.wonders[w.id] = Math.min(WONDER_STAGES, st);
    }
  }
  const ru = (r.ruler ?? {}) as Partial<Ruler>;
  s.ruler = {
    name: typeof ru.name === "string" && ru.name ? ru.name.slice(0, 24) : base.ruler.name,
    trait: TRAITS.includes(ru.trait as TraitId) ? (ru.trait as TraitId) : base.ruler.trait,
    gen: Math.max(1, Math.floor(num(ru.gen, 1))),
  };
  s.lineage = Array.isArray(r.lineage)
    ? r.lineage
        .filter((l): l is LineageEntry => !!l && typeof l.name === "string" && TRAITS.includes(l.trait))
        .map((l) => ({ name: l.name.slice(0, 24), trait: l.trait, gen: Math.floor(num(l.gen, 1)), best: num(l.best, 0), age: Math.floor(num(l.age, 0)), ...(HOUSE_IDS.includes(l.spouse as HouseId) ? { spouse: l.spouse } : {}) }))
        .slice(-40)
    : [];
  const h = r.house as Partial<House> | null | undefined;
  s.house =
    h && typeof h.name === "string" && h.name.trim()
      ? { name: h.name.trim().slice(0, 22), color: Math.max(0, Math.min(CREST_COLORS.length - 1, Math.floor(num(h.color, 0)))), symbol: CREST_SYMBOLS.includes(h.symbol ?? "") ? h.symbol! : CREST_SYMBOLS[0] }
      : null;
  const item = (v: unknown): Item | undefined => {
    const o = v as Partial<Item> | undefined;
    if (!o || !ITEM_TYPES.includes(o.type as ItemType)) return undefined;
    const out: Item = { type: o.type as ItemType, tier: Math.max(1, Math.min(MAX_TIER, Math.floor(num(o.tier, 1)))), plus: Math.max(0, Math.min(MAX_PLUS, Math.floor(num(o.plus, 0)))) };
    if (ENCHANTS.includes(o.ench as EnchId)) out.ench = o.ench;
    return out;
  };
  const hr = r.hero as Partial<Hero> | null | undefined;
  s.hero =
    hr && typeof hr.name === "string"
      ? {
          name: hr.name.slice(0, 20) || "Kervanbaşı",
          look: Math.max(0, Math.min(HERO_LOOKS - 1, Math.floor(num(hr.look, 0)))),
          level: Math.max(1, Math.min(MAX_HERO_LEVEL, Math.floor(num(hr.level, 1)))),
          xp: Math.max(0, num(hr.xp, 0)),
          gear: { weapon: item(hr.gear?.weapon), shield: item(hr.gear?.shield), armor: item(hr.gear?.armor) },
        }
      : null;
  const m = (r.mats ?? {}) as Partial<Mats>;
  s.mats = { iron: Math.max(0, Math.floor(num(m.iron, 0))), leather: Math.max(0, Math.floor(num(m.leather, 0))), wood: Math.max(0, Math.floor(num(m.wood, 0))), steel: Math.max(0, Math.floor(num(m.steel, 0))) };
  s.compGear = {};
  if (r.compGear && typeof r.compGear === "object") {
    for (const id of COMPANION_IDS) {
      const raw = (r.compGear as Record<string, unknown>)[id];
      const single = item(raw);
      if (single) {
        s.compGear[id] = { [slotOf(single.type)]: single };
        continue;
      }
      if (!raw || typeof raw !== "object") continue;
      const bag = raw as Record<string, unknown>;
      const gear: Partial<Record<Slot, Item>> = {};
      for (const slot of ["weapon", "shield", "armor"] as const) {
        const it = item(bag[slot]);
        if (it && slotOf(it.type) === slot) gear[slot] = it;
      }
      if (gear.weapon || gear.shield || gear.armor) s.compGear[id] = gear;
    }
  }
  s.soldiers = Math.max(0, Math.floor(num(r.soldiers, base.soldiers)));
  s.escorts = ROUTES.map((_, i) => Math.max(0, Math.floor(num(Array.isArray(r.escorts) ? r.escorts[i] : base.escorts[i], 0))));
  let over = s.escorts.reduce((a, b) => a + b, 0) - s.soldiers;
  for (let i = s.escorts.length - 1; i >= 0 && over > 0; i--) {
    const cut = Math.min(over, s.escorts[i]);
    s.escorts[i] -= cut;
    over -= cut;
  }
  s.barracks = Math.max(0, Math.min(MAX_BARRACKS, Math.floor(num(r.barracks, 0))));
  s.escortClass = ROUTES.map((_, i) => {
    const u = Array.isArray(r.escortClass) ? r.escortClass[i] : undefined;
    return UNIT_TYPES.includes(u as UnitType) ? (u as UnitType) : "spear";
  });
  s.wounded = Math.max(0, Math.floor(num(r.wounded, 0)));
  const mo = r.mount as Partial<Mount> | null | undefined;
  s.mount = mo && typeof mo === "object" ? { breed: Math.max(1, Math.min(MAX_BREED, Math.floor(num(mo.breed, 1)))), plus: Math.max(0, Math.min(MAX_PLUS, Math.floor(num(mo.plus, 0)))) } : null;
  s.nemesisSeq = Math.max(0, Math.floor(num(r.nemesisSeq, 0)));
  s.nemeses = (Array.isArray(r.nemeses) ? r.nemeses : [])
    .filter((n): n is Nemesis => !!n && typeof n === "object" && typeof (n as Nemesis).name === "string")
    .map((n) => ({
      id: Math.floor(num(n.id, 0)),
      epithet: Math.max(0, Math.min(NEMESIS_EPITHETS - 1, Math.floor(num(n.epithet, 0)))),
      name: n.name.slice(0, 20),
      look: Math.max(0, Math.min(NEMESIS_LOOKS - 1, Math.floor(num(n.look, 0)))),
      route: Math.max(0, Math.min(ROUTES.length - 1, Math.floor(num(n.route, 0)))),
      level: Math.max(1, Math.min(MAX_NEMESIS_LEVEL, Math.floor(num(n.level, 1)))),
      wins: Math.max(0, Math.floor(num(n.wins, 0))),
      calm: num(n.calm, 0),
    }))
    .slice(0, MAX_NEMESES);
  for (const n of s.nemeses) s.nemesisSeq = Math.max(s.nemesisSeq, n.id);
  s.fortsTaken = Array.isArray(r.fortsTaken) ? r.fortsTaken.filter((x): x is string => FORTS.some((f) => f.id === x)) : [];
  const sg = r.siege as Partial<Siege> | null | undefined;
  s.siege =
    sg && FORTS.some((f) => f.id === sg.fort)
      ? {
          fort: sg.fort!,
          troops: Math.max(0, Math.floor(num(sg.troops, 0))),
          hero: !!sg.hero,
          walls: Math.max(0, Math.min(FORT_WALLS, Math.floor(num(sg.walls, FORT_WALLS)))),
          wave: Math.max(0, Math.min(FORT_WAVES, Math.floor(num(sg.wave, 0)))),
          next: num(sg.next, Date.now()),
          log: Array.isArray(sg.log) ? sg.log.map((x) => (x ? 1 : 0)).slice(0, FORT_WAVES) : [],
        }
      : null;
  if (s.siege) s.siege.troops = Math.min(s.siege.troops, Math.max(0, s.soldiers - s.escorts.reduce((a, b) => a + b, 0)));
  s.relics = Array.isArray(r.relics) ? RELICS.map((x) => x.id).filter((id) => (r.relics as unknown[]).includes(id)) : [];
  const cb = (r.contracts ?? {}) as Partial<ContractBoard>;
  s.contracts = {
    day: typeof cb.day === "string" ? cb.day : "",
    bonus: !!cb.bonus,
    list: (Array.isArray(cb.list) ? cb.list : [])
      .filter((c): c is Contract => !!c && CONTRACT_KINDS.includes((c as Contract).kind))
      .map((c) => ({ kind: c.kind, n: Math.max(1, Math.floor(num(c.n, 1))), base: num(c.base, 0), claimed: !!c.claimed }))
      .slice(0, 3),
  };
  const ti = r.titan as Partial<Titan> | null | undefined;
  s.titan = ti && num(ti.max, 0) > 0 ? { hp: Math.max(0, num(ti.hp, 0)), max: num(ti.max, 1), until: num(ti.until, 0), level: Math.max(1, Math.floor(num(ti.level, 1))) } : null;
  s.nextTitan = num(r.nextTitan, base.nextTitan);
  const al = (r.allegiance ?? {}) as Partial<Allegiance>;
  const path = PATHS.includes(al.path as PathId) ? (al.path as PathId) : null;
  s.allegiance = { path, rank: path ? Math.max(0, Math.min(PERK_COST.length, Math.floor(num(al.rank, 0)))) : 0 };
  s.fallenHeroes = (Array.isArray(r.fallenHeroes) ? r.fallenHeroes : [])
    .filter((f): f is FallenHero => !!f && typeof (f as FallenHero).name === "string")
    .map((f) => ({ name: f.name.slice(0, 20), look: Math.max(0, Math.min(HERO_LOOKS - 1, Math.floor(num(f.look, 0)))), level: Math.max(1, Math.floor(num(f.level, 1))), gen: Math.max(1, Math.floor(num(f.gen, 1))), foe: typeof f.foe === "string" ? f.foe.slice(0, 40) : "" }))
    .slice(-30);
  const tw = r.tradeWar as Partial<TradeWar> | null | undefined;
  s.tradeWar = tw && typeof tw === "object" ? { route: Math.max(0, Math.min(ROUTES.length - 1, Math.floor(num(tw.route, 0)))), rival: Math.max(0, Math.min(TW_RIVALS - 1, Math.floor(num(tw.rival, 0)))), until: num(tw.until, 0), won: !!tw.won } : null;
  s.nextTradeWar = num(r.nextTradeWar, base.nextTradeWar);
  const se = (r.season ?? {}) as Partial<SeasonState>;
  s.season = {
    week: Math.floor(num(se.week, base.season.week)),
    pts: Math.max(0, Math.floor(num(se.pts, 0))),
    claimed: Math.max(0, Math.min(SEASON_STEPS.length, Math.floor(num(se.claimed, 0)))),
    guildClaimed: Math.max(0, Math.min(GUILD_TIERS.length, Math.floor(num(se.guildClaimed, 0)))),
  };
  const isHouse = (x: unknown): x is HouseId => HOUSE_IDS.includes(x as HouseId);
  s.hans = Array.isArray(r.hans) ? [...new Set(r.hans.filter((i): i is number => Number.isInteger(i) && i >= 0 && i < ROUTES.length))] : [];
  s.nextHanStory = num(r.nextHanStory, base.nextHanStory);
  s.spies = Math.max(0, Math.min(SPY_MAX, Math.floor(num(r.spies, 0))));
  s.spouse = isHouse(r.spouse) ? r.spouse : null;
  s.bloodline = Array.isArray(r.bloodline) ? r.bloodline.filter(isHouse).slice(-MAX_BLOOD) : [];
  s.camp = r.camp === "yayla" || r.camp === "kislak" ? r.camp : null;
  s.campSeason = Math.floor(num(r.campSeason, -1));
  s.sagaLog = (Array.isArray(r.sagaLog) ? r.sagaLog : [])
    .filter((e): e is SagaEntry => !!e && BARD_EVENTS.includes((e as SagaEntry).ev as BardEvent))
    .map((e) => {
      const vars: Record<string, string | number> = {};
      if (e.vars && typeof e.vars === "object") for (const [k, v] of Object.entries(e.vars)) if (typeof v === "number" || typeof v === "string") vars[k] = typeof v === "string" ? v.slice(0, 40) : v;
      return { ev: e.ev, v: Math.max(0, Math.floor(num(e.v, 0))), vars, gen: Math.max(1, Math.floor(num(e.gen, 1))), at: num(e.at, 0) };
    })
    .slice(-MAX_SAGA);
  const rd = (r.raid ?? {}) as Partial<RaidState>;
  s.raid = {
    week: Math.floor(num(rd.week, base.raid.week)),
    dmg: Math.max(0, Math.min(1, num(rd.dmg, 0))),
    hits: Math.max(0, Math.floor(num(rd.hits, 0))),
    tickets: Math.max(0, Math.min(RAID_TICKETS, Math.floor(num(rd.tickets, RAID_TICKETS)))),
    ticketAt: num(rd.ticketAt, base.raid.ticketAt),
    claimed: Math.max(0, Math.min(RAID_TIERS.length, Math.floor(num(rd.claimed, 0)))),
  };
  s.bazaar = ROUTES.map((_, i) => {
    const b = Array.isArray(r.bazaar) ? (r.bazaar[i] as Partial<Stock> | undefined) : undefined;
    return { units: Math.max(0, num(b?.units, 0)), cost: Math.max(0, num(b?.cost, 0)) };
  });
  s.marketPrices = Array.isArray(r.marketPrices) ? r.marketPrices.slice(0, ROUTES.length).map((p) => Math.min(1.35, Math.max(0.75, num(p, 1)))) : [];
  s.diplo = {};
  if (r.diplo && typeof r.diplo === "object") {
    for (const [id, v] of Object.entries(r.diplo)) {
      if (!RIVALS.some((x) => x.id === id) || !v || typeof v !== "object") continue;
      const d = v as Partial<Relation>;
      s.diplo[id] = { rel: Math.max(-100, Math.min(100, num(d.rel, 0))), at: num(d.at, Date.now()), cd: num(d.cd, 0), ally: num(d.ally, 0), spoils: num(d.spoils, 0) };
    }
  }
  const ex = r.expedition as Partial<Expedition> | null | undefined;
  s.expedition =
    ex && typeof ex === "object"
      ? {
          seed: Math.floor(num(ex.seed, 1)),
          row: Math.max(0, Math.min(EXP_ROWS - 1, Math.floor(num(ex.row, 0)))),
          hp: Math.max(1, Math.min(EXP_HP, Math.floor(num(ex.hp, EXP_HP)))),
          secs: Math.max(0, num(ex.secs, 0)),
          steel: Math.max(0, Math.floor(num(ex.steel, 0))),
          xp: Math.max(0, Math.floor(num(ex.xp, 0))),
          path: Array.isArray(ex.path) ? ex.path.filter((x): x is number => Number.isInteger(x) && x >= 0 && x < 3).slice(0, EXP_ROWS) : [],
        }
      : null;
  s.expTickets = Math.max(0, Math.min(EXP_TICKETS + 1, Math.floor(num(r.expTickets, EXP_TICKETS))));
  s.expAt = num(r.expAt, base.expAt);
  s.festSeen = typeof r.festSeen === "string" ? r.festSeen.slice(0, 30) : "";
  s.court = typeof r.court === "string" && isPetition(r.court) ? r.court : null;
  s.nextCourt = num(r.nextCourt, base.nextCourt);
  s.nodeAt = NODES.map((_, k) => num(Array.isArray(r.nodeAt) ? r.nodeAt[k] : 0, 0));
  const rgs = Array.isArray(r.regions) ? (r.regions as Partial<RegionState>[]) : [];
  s.regions = REGIONS.map((_, k) => {
    const x = rgs[k] ?? {};
    return {
      open: x.open === true,
      lv: Math.min(REGION_MAX, Math.max(1, Math.floor(num(x.lv, 1)))),
      xp: Math.max(0, Math.floor(num(x.xp, 0))),
      at: num(x.at, 0),
      youth: Math.max(0, num(x.youth, 0)),
      raids: Math.max(0, Math.floor(num(x.raids, 0))),
      quest: Math.min(QUEST_STEPS.length, Math.max(0, Math.floor(num(x.quest, 0)))),
    };
  });
  s.trophies = {};
  if (r.trophies && typeof r.trophies === "object") for (const id of TROPHY_IDS) {
    const n = Math.floor(num((r.trophies as Record<string, unknown>)[id], 0));
    if (n > 0) s.trophies[id] = n;
  }
  s.mercs = Math.max(0, Math.floor(num(r.mercs, 0)));
  s.wageAt = num(r.wageAt, base.wageAt);
  s.tax = Math.min(TAXES.length - 1, Math.max(0, Math.floor(num(r.tax, 1))));
  s.mood = Math.min(100, Math.max(0, num(r.mood, 66)));
  s.revolt = Math.floor(num(r.revolt, -1));
  if (s.revolt >= REGIONS.length || (s.revolt >= 0 && !s.regions[s.revolt].open)) s.revolt = -1;
  s.artifacts = Array.isArray(r.artifacts) ? ARTIFACTS.map((a) => a.id).filter((id) => (r.artifacts as unknown[]).includes(id)) : [];
  s.artEquip = Array.isArray(r.artEquip) ? [...new Set((r.artEquip as unknown[]).filter((id): id is string => typeof id === "string" && s.artifacts.includes(id)))].slice(0, ART_SLOTS) : [];
  const inc = r.incursion as Partial<Incursion> | null | undefined;
  s.incursion =
    inc && typeof inc.k === "number" && inc.k >= 0 && inc.k < REGIONS.length && s.regions[inc.k].open && typeof inc.rival === "number" && inc.rival >= 0 && inc.rival < RIVALS.length
      ? { k: inc.k, rival: inc.rival, until: num(inc.until, 0) }
      : null;
  s.nextIncursion = num(r.nextIncursion, base.nextIncursion);
  s.merchant = isMerchant(r.merchant) && s.regions[r.merchant.k].open ? { k: r.merchant.k, until: r.merchant.until, offers: cleanOffers(r.merchant.offers) } : null;
  s.nextMerchant = num(r.nextMerchant, base.nextMerchant);
  s.governors = {};
  if (r.governors && typeof r.governors === "object") {
    const used = new Set<string>();
    for (const [city, id] of Object.entries(r.governors)) {
      if (!isCity(city) || !COMPANION_IDS.includes(id as CompanionId) || used.has(id as string) || !s.companions[id as CompanionId]) continue;
      used.add(id as string);
      s.governors[city] = id as CompanionId;
    }
  }
  const ar = (r.arena ?? {}) as Partial<ArenaState>;
  const fa = freshArena(Date.now());
  s.arena = {
    rating: Math.max(0, num(ar.rating, fa.rating)),
    tickets: Math.max(0, Math.min(fa.tickets, Math.floor(num(ar.tickets, fa.tickets)))),
    ticketAt: num(ar.ticketAt, fa.ticketAt),
    week: Math.floor(num(ar.week, fa.week)),
    wins: Math.max(0, Math.floor(num(ar.wins, 0))),
    losses: Math.max(0, Math.floor(num(ar.losses, 0))),
    titles: Math.max(0, Math.floor(num(ar.titles, 0))),
    bestRank: Math.max(0, Math.floor(num(ar.bestRank, 0))),
  };
  s.rivalsBeaten = Array.isArray(r.rivalsBeaten) ? r.rivalsBeaten.filter((x): x is string => typeof x === "string") : [];
  s.storiesSeen = Array.isArray(r.storiesSeen) ? r.storiesSeen.filter((a): a is string => typeof a === "string").slice(-40) : [];
  s.achievements = Array.isArray(r.achievements) ? r.achievements.filter((a): a is string => typeof a === "string") : [];
  const d = (r.daily ?? {}) as Partial<GameState["daily"]>;
  s.daily = { last: typeof d.last === "string" ? d.last : "", streak: Math.max(0, Math.floor(num(d.streak, 0))) };
  s.cityLevels = {};
  if (r.cityLevels && typeof r.cityLevels === "object") {
    for (const [id, lv] of Object.entries(r.cityLevels)) s.cityLevels[id] = Math.max(0, Math.min(3, Math.floor(num(lv, 0))));
  }
  const b = r.cityBuild as Partial<CityBuild> | null | undefined;
  s.cityBuild = b && typeof b.id === "string" ? { id: b.id, level: Math.max(1, Math.min(3, Math.floor(num(b.level, 1)))), until: num(b.until, 0) } : null;
  const c = (r.chronicle ?? {}) as Partial<ChronicleState>;
  s.chronicle = {
    done: Math.max(0, Math.floor(num(c.done, 0))),
    accepted: !!c.accepted,
    base: Math.max(0, num(c.base, 0)),
  };
  clampGear(s);
  if (s.settings.lang !== "en" && s.settings.lang !== "tr") s.settings.lang = base.settings.lang;
  if (s.settings.notation !== "suffix" && s.settings.notation !== "sci") s.settings.notation = "suffix";
  return s;
}
