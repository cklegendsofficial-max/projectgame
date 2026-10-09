import { CITIES, H, NAV, NW, NH, W, type World } from "../world/gen";
import { rng } from "../world/noise";
import { BANDIT_NAMES, BUILDINGS, VILLAGE_NAMES, army, type Army, type BuildingId, type NodeKind, type Res, type Unit } from "./data";
import type { Good, Item, Skill, Slot, Stat } from "./rpg";
import type { ClassId } from "./classes";
import type { SideQuest } from "./sidequests";
import type { Daily } from "./daily";
import type { Nemesis } from "./nemesis";
import type { Bird } from "./falcon";
import type { Owned } from "./conquest";
import type { Rival } from "./rivals";

export interface Village {
  name: string;
  x: number;
  y: number;
  yurt: boolean;
  rec: number;
  recAt: number;
  rep: number;
}

export interface Camp {
  name: string;
  x: number;
  y: number;
  tier: number;
  alive: boolean;
  respawnAt: number;
  garrison: Army;
}

export interface ResNode {
  kind: NodeKind;
  x: number;
  y: number;
  lv: number;
  left: number;
  max: number;
  regenAt: number;
}

export interface Ruin {
  x: number;
  y: number;
  looted: boolean;
}

export interface Kurgan {
  x: number;
  y: number;
  tier: number;
  alive: boolean;
  respawnAt: number;
  guard: Army;
  delved?: boolean;
}

export interface Hero {
  name: string;
  lv: number;
  xp: number;
  x: number;
  y: number;
  army: Army;
  path: number[] | null;
  pathI: number;
  stats: Record<Stat, number>;
  points: number;
  skills: Record<Skill, number>;
  cskill: Record<string, number>;
  spts: number;
  tal: Record<string, number>;
  tpts: number;
  hp: number;
  energy: number;
  equip: Partial<Record<Slot, Item>>;
  bag: Item[];
  cargo: Partial<Record<Good, number>>;
  paid: Partial<Record<Good, number>>;
}

export interface Bandit {
  id: number;
  camp: number;
  x: number;
  y: number;
  army: Army;
  tx: number;
  ty: number;
  wait: number;
  chase: boolean;
  tier: number;
  amb?: boolean;
  posse?: boolean;
  nem?: number;
}

export interface Caravan {
  id: number;
  from: string;
  to: string;
  fac: string;
  path: number[];
  pathI: number;
  x: number;
  y: number;
  guard: Army;
  good: Good;
  qty: number;
  raid: number;
  raidT: number;
}

export interface Storm {
  id: number;
  kind: "kum" | "yagmur";
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
}

export interface March {
  id: number;
  node: number;
  army: Army;
  phase: "go" | "gather" | "back";
  path: number[];
  pathI: number;
  x: number;
  y: number;
  until: number;
  load: number;
}

export interface TrainOrder {
  unit: Unit;
  n: number;
  done: number;
  each: number;
}

export interface Bounty {
  city: string;
  camp: number;
  gold: number;
  renown: number;
  taken: boolean;
}

export interface Counters {
  shifts: number;
  trains: number;
  profit: number;
  wins: number;
  recruits: number;
  bought: number;
  moved: number;
  camps: number;
  built: number;
  trained: number;
  marched: number;
  spent: number;
  plus: number;
  kurgans: number;
  contracts: number;
  crafted: number;
  raids: number;
  sides: number;
  robbed: number;
  rescued: number;
  floors: number;
  slain: number;
  foals: number;
  conquests: number;
}

export interface GameState {
  v: number;
  res: Res;
  resAt: number;
  buildings: Record<BuildingId, { lv: number; until: number }>;
  queue: TrainOrder[];
  garrison: Army;
  hero: Hero;
  marches: March[];
  explored: Uint8Array;
  villages: Village[];
  camps: Camp[];
  nodes: ResNode[];
  ruins: Ruin[];
  kurgans: Kurgan[];
  bandits: Bandit[];
  quest: number;
  time: number;
  kills: number;
  nextId: number;
  cls: ClassId | null;
  free: boolean;
  beylik: boolean;
  renown: number;
  c: Counters;
  markets: Record<string, Partial<Record<Good, number>>>;
  smith: Record<string, { items: Item[]; day: number }>;
  bounties: Bounty[];
  bountyDay: number;
  wageDebt: number;
  mats: { ruh: number; parsomen: number };
  story: { ch: number; fort: { x: number; y: number } | null; done: boolean; lord: boolean };
  comps: string[];
  events: MarketEvent[];
  evDay: number;
  contract: Contract | null;
  offers: Record<string, Contract & { day: number }>;
  raid: { v: number; army: Army; until: number } | null;
  raidAt: number;
  serais: Record<string, { lv: number; coffer: number }>;
  cons: Record<string, number>;
  buffs: Record<string, number>;
  sideQ: SideQuest[];
  board: Record<string, { day: number; list: SideQuest[] }>;
  codex: string[];
  rep: Record<string, number>;
  repGift: string[];
  caravans: Caravan[];
  storms: Storm[];
  titles: string[];
  title: string;
  daily: Daily | null;
  wanted: number;
  wantedT: number;
  deepBest: number;
  nemeses: Nemesis[];
  nemDay: number;
  chron: { d: number; t: string }[];
  bird: Bird | null;
  stud: { a: Item; b: Item; until: number; city: string } | null;
  owned: Record<string, Owned>;
  engines: number;
  sieged: Record<string, number>;
  counterAt: number;
  rivals: Rival[];
  rivalDay: number;
  seals: number;
  deepPerks: Record<string, number>;
  act2: { ch: number; gate: { x: number; y: number } | null; done: boolean };
}

export interface MarketEvent {
  city: string;
  good: Good;
  mult: number;
  until: number;
  text: string;
}

export interface Contract {
  from: string;
  to: string;
  gold: number;
  until: number;
  cargo: string;
}

export const CAPITAL = CITIES.find((c) => c.id === "samarkand")!;
export const SLAVE_RADIUS = 300;

function navOk(w: World, x: number, y: number): boolean {
  const nx = Math.floor(x / NAV);
  const ny = Math.floor(y / NAV);
  if (nx < 1 || ny < 1 || nx >= NW - 1 || ny >= NH - 1) return false;
  const i = ny * NW + nx;
  return w.reach[i] === 1 && w.cost[i] < 2.2;
}

function terrainAt(w: World, x: number, y: number): { h: number; m: number } {
  const gx = Math.min(1199, Math.floor((x / W) * 1200));
  const gy = Math.min(699, Math.floor((y / H) * 700));
  const i = gy * 1200 + gx;
  return { h: w.height[i], m: w.moist[i] };
}

export function placeWorld(w: World): Pick<GameState, "villages" | "camps" | "nodes" | "ruins" | "kurgans"> {
  const R = rng(4242);
  const taken: { x: number; y: number; r: number }[] = CITIES.map((c) => ({ x: c.x, y: c.y, r: 150 }));
  const free = (x: number, y: number, r: number) => taken.every((t) => Math.hypot(t.x - x, t.y - y) > t.r + r);
  const pick = (n: number, r: number, test: (x: number, y: number) => boolean, tries = 4000) => {
    const out: { x: number; y: number }[] = [];
    for (let k = 0; k < tries && out.length < n; k++) {
      const x = 80 + R() * (W - 160);
      const y = 80 + R() * (H - 160);
      if (!navOk(w, x, y) || !free(x, y, r) || !test(x, y)) continue;
      taken.push({ x, y, r });
      out.push({ x, y });
    }
    return out;
  };
  const nodes: ResNode[] = [];
  for (const [kind, ang] of [["wood", 0.6], ["stone", 2.4], ["food", 4.2]] as const) {
    for (let k = 0; k < 200; k++) {
      const a = ang + (R() - 0.5) * 1.6;
      const d = 170 + R() * 100;
      const x = CAPITAL.x + Math.cos(a) * d;
      const y = CAPITAL.y + Math.sin(a) * d;
      if (!navOk(w, x, y) || !free(x, y, 50)) continue;
      taken.push({ x, y, r: 50 });
      nodes.push({ kind, x, y, lv: 1, left: 1500, max: 1500, regenAt: 0 });
      break;
    }
  }
  const villages: Village[] = pick(46, 70, (x, y) => terrainAt(w, x, y).h < 0.34).map((p, i) => {
    const t = terrainAt(w, p.x, p.y);
    return { name: VILLAGE_NAMES[i % VILLAGE_NAMES.length], x: p.x, y: p.y, yurt: t.m < 0.42, rec: 4, recAt: 0, rep: 0 };
  });
  const camps: Camp[] = pick(24, 90, (x, y) => Math.hypot(x - CAPITAL.x, y - CAPITAL.y) > 650 && CITIES.every((c) => Math.hypot(c.x - x, c.y - y) > 280)).map((p, i) => {
    const d = Math.hypot(p.x - CAPITAL.x, p.y - CAPITAL.y);
    const tier = Math.min(5, 1 + Math.floor(d / 650));
    return { name: BANDIT_NAMES[i % BANDIT_NAMES.length], x: p.x, y: p.y, tier, alive: true, respawnAt: 0, garrison: campGarrison(tier, R) };
  });
  const addNodes = (kind: NodeKind, n: number, test: (h: number, m: number) => boolean) => {
    for (const p of pick(n, 55, (x, y) => {
      const t = terrainAt(w, x, y);
      return test(t.h, t.m);
    })) {
      const d = Math.hypot(p.x - CAPITAL.x, p.y - CAPITAL.y);
      const lv = Math.min(3, 1 + Math.floor(d / 1100) + (R() < 0.2 ? 1 : 0));
      const max = 1500 * lv;
      nodes.push({ kind, x: p.x, y: p.y, lv, left: max, max, regenAt: 0 });
    }
  };
  addNodes("food", 22, (h, m) => h < 0.3 && m > 0.42);
  addNodes("wood", 20, (h, m) => h < 0.4 && m > 0.55);
  addNodes("stone", 18, (h) => h > 0.26 && h < 0.5);
  addNodes("gold", 10, (h) => h > 0.3 && h < 0.55);
  const ruins: Ruin[] = pick(10, 80, () => true).map((p) => ({ x: p.x, y: p.y, looted: false }));
  const kurgans: Kurgan[] = pick(10, 90, (x, y) => Math.hypot(x - CAPITAL.x, y - CAPITAL.y) > 520).map((p) => {
    const tier = Math.min(5, 1 + Math.floor(Math.hypot(p.x - CAPITAL.x, p.y - CAPITAL.y) / 700));
    return { x: p.x, y: p.y, tier, alive: true, respawnAt: 0, guard: kurganGuard(tier) };
  });
  return { villages, camps, nodes, ruins, kurgans };
}

export function kurganGuard(tier: number): Army {
  const n = Math.round(5 * Math.pow(1.7, tier - 1));
  return army(Math.round(n * 0.6), Math.round(n * 0.4), 0);
}

export const KURGAN_BOSS = [
  { name: "Taş Muhafız", icon: "heroes/boss_golem" },
  { name: "Albastı", icon: "heroes/boss_albasti" },
];

export function kurganBoss(tier: number) {
  const b = KURGAN_BOSS[tier >= 3 ? 1 : 0];
  return { name: b.name, icon: b.icon, hp: Math.round(105 * Math.pow(tier, 1.45)), atk: Math.round(6 * Math.pow(tier, 1.3)), def: 2 + tier * 3 };
}

export function campGarrison(tier: number, R: () => number = Math.random): Army {
  const n = Math.round(10 * Math.pow(1.75, tier - 1) * (0.85 + R() * 0.3));
  const a = 0.25 + R() * 0.25;
  const h = tier >= 2 ? 0.1 + R() * 0.2 : 0;
  return army(Math.round(n * (1 - a - h)), Math.round(n * a), Math.round(n * h));
}

export function banditArmy(tier: number): Army {
  const n = Math.max(2, Math.round(2.5 * Math.pow(1.8, tier - 1) * (0.7 + Math.random() * 0.6)));
  const r = Math.random();
  if (tier <= 1 || r < 0.4) return army(Math.round(n * 0.75), Math.round(n * 0.25), 0);
  if (r < 0.75) return army(Math.round(n * 0.3), Math.round(n * 0.6), Math.round(n * 0.1));
  return army(Math.round(n * 0.3), Math.round(n * 0.2), Math.round(n * 0.5));
}

export function newCounters(): Counters {
  return { shifts: 0, trains: 0, profit: 0, wins: 0, recruits: 0, bought: 0, moved: 0, camps: 0, built: 0, trained: 0, marched: 0, spent: 0, plus: 0, kurgans: 0, contracts: 0, crafted: 0, raids: 0, sides: 0, robbed: 0, rescued: 0, floors: 0, slain: 0, foals: 0, conquests: 0 };
}

export function newGame(w: World): GameState {
  const now = Date.now();
  const places = placeWorld(w);
  const buildings = Object.fromEntries(BUILDINGS.map((b) => [b.id, { lv: 0, until: 0 }])) as GameState["buildings"];
  return {
    v: 3,
    res: { gold: 0, food: 0, wood: 0, stone: 0 },
    resAt: now,
    buildings,
    queue: [],
    garrison: army(),
    hero: {
      name: "Toygar",
      lv: 1,
      xp: 0,
      x: CAPITAL.x + 10,
      y: CAPITAL.y + 115,
      army: army(),
      path: null,
      pathI: 0,
      stats: { guc: 2, cev: 2, day: 2, lid: 1, kar: 1 },
      points: 0,
      skills: { silah: 0, ticaret: 0, emek: 0, zanaat: 0 },
      cskill: {},
      spts: 0,
      tal: {},
      tpts: 0,
      hp: 999,
      energy: 999,
      equip: {},
      bag: [],
      cargo: {},
      paid: {},
    },
    marches: [],
    explored: new Uint8Array(NW * NH),
    ...places,
    bandits: [],
    quest: 0,
    time: 0,
    kills: 0,
    nextId: 1,
    cls: null,
    free: false,
    beylik: false,
    renown: 0,
    c: newCounters(),
    markets: {},
    smith: {},
    bounties: [],
    bountyDay: 0,
    wageDebt: 0,
    mats: { ruh: 0, parsomen: 0 },
    story: { ch: 0, fort: null, done: false, lord: false },
    comps: [],
    events: [],
    evDay: 0,
    contract: null,
    offers: {},
    raid: null,
    raidAt: 0,
    serais: {},
    cons: {},
    buffs: {},
    sideQ: [],
    board: {},
    codex: [],
    rep: {},
    repGift: [],
    caravans: [],
    storms: [],
    titles: [],
    title: "",
    daily: null,
    wanted: 0,
    wantedT: 0,
    deepBest: 0,
    nemeses: [],
    nemDay: 0,
    chron: [],
    bird: null,
    stud: null,
    owned: {},
    engines: 0,
    sieged: {},
    counterAt: 0,
    rivals: [],
    rivalDay: 0,
    seals: 0,
    deepPerks: {},
    act2: { ch: 0, gate: null, done: false },
  };
}

const KEY = "kervan_krallik_v3";

function encodeBits(a: Uint8Array): string {
  let s = "";
  for (let i = 0; i < a.length; i += 8) {
    let b = 0;
    for (let k = 0; k < 8; k++) if (a[i + k]) b |= 1 << k;
    s += String.fromCharCode(b);
  }
  return btoa(s);
}

function decodeBits(s: string, n: number): Uint8Array {
  const out = new Uint8Array(n);
  try {
    const raw = atob(s);
    for (let i = 0; i < raw.length; i++) {
      const b = raw.charCodeAt(i);
      for (let k = 0; k < 8; k++) if (b & (1 << k) && i * 8 + k < n) out[i * 8 + k] = 1;
    }
  } catch {
    /* corrupt fog data: start unexplored */
  }
  return out;
}

export const SAVE_SLOTS = 3;
const SLOT_KEY = "kk_slot";

export function curSlot(): number {
  const n = Number(localStorage.getItem(SLOT_KEY) ?? 0);
  return n >= 0 && n < SAVE_SLOTS ? Math.floor(n) : 0;
}

const slotKey = (i: number) => (i === 0 ? KEY : `${KEY}_s${i}`);

export interface SlotInfo {
  name: string;
  cls: ClassId | null;
  lv: number;
  renown: number;
  gold: number;
  owned: number;
  at: number;
}

export function slotInfo(i: number): SlotInfo | null {
  try {
    const raw = localStorage.getItem(slotKey(i));
    if (!raw) return null;
    const r = JSON.parse(raw) as GameState & { savedAt?: number };
    return { name: r.hero?.name ?? "?", cls: r.cls ?? null, lv: r.hero?.lv ?? 1, renown: r.renown ?? 0, gold: Math.floor(r.res?.gold ?? 0), owned: Object.keys(r.owned ?? {}).length, at: r.savedAt ?? 0 };
  } catch {
    return null;
  }
}

export function useSlot(i: number): void {
  localStorage.setItem(SLOT_KEY, String(i));
}

export function exportSave(): string | null {
  return localStorage.getItem(slotKey(curSlot()));
}

export function importSave(text: string): boolean {
  try {
    const r = JSON.parse(text) as { v?: number; hero?: unknown; res?: unknown };
    if (r.v !== 3 || !r.hero || !r.res) return false;
    localStorage.setItem(slotKey(curSlot()), text);
    return true;
  } catch {
    return false;
  }
}

export function saveGame(s: GameState): void {
  try {
    localStorage.setItem(slotKey(curSlot()), JSON.stringify({ ...s, explored: encodeBits(s.explored), bandits: [], caravans: [], storms: [], savedAt: Date.now() }));
  } catch {
    /* storage full or blocked */
  }
}

export function loadGame(w: World): GameState {
  const fresh = newGame(w);
  try {
    const raw = localStorage.getItem(slotKey(curSlot()));
    if (!raw) return fresh;
    const r = JSON.parse(raw) as Partial<GameState> & { explored?: string };
    if (r.v !== 3) return fresh;
    return {
      ...fresh,
      ...r,
      buildings: { ...fresh.buildings, ...(r.buildings ?? {}) },
      hero: { ...fresh.hero, ...(r.hero ?? {}), ...(r.hero && r.hero.tal === undefined ? { tal: {}, tpts: Math.max(0, (r.hero.lv ?? 1) - 1) } : {}), skills: { ...fresh.hero.skills, ...(r.hero?.skills ?? {}) }, path: null, pathI: 0 },
      c: { ...fresh.c, ...(r.c ?? {}) },
      mats: { ...fresh.mats, ...(r.mats ?? {}) },
      story: { ...fresh.story, ...(r.story ?? {}) },
      explored: typeof r.explored === "string" ? decodeBits(r.explored, NW * NH) : fresh.explored,
      bandits: [],
      caravans: [],
      storms: [],
      marches: Array.isArray(r.marches) ? r.marches : [],
    } as GameState;
  } catch {
    return fresh;
  }
}

export function wipeGame(): void {
  localStorage.removeItem(slotKey(curSlot()));
}
