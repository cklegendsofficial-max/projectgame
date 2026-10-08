import { CITIES, H, NAV, NH, NW, W, type World } from "../world/gen";
import { rng } from "../world/noise";
import { BANDIT_NAMES, BUILDINGS, VILLAGE_NAMES, army, type Army, type BuildingId, type NodeKind, type Res, type Unit } from "./data";

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

export interface Hero {
  name: string;
  portrait: number;
  lv: number;
  xp: number;
  x: number;
  y: number;
  army: Army;
  path: number[] | null;
  pathI: number;
  trophies: number;
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
  bandits: Bandit[];
  quest: number;
  time: number;
  kills: number;
  nextId: number;
}

export const CAPITAL = CITIES.find((c) => c.id === "samarkand")!;

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

export function placeWorld(w: World): Pick<GameState, "villages" | "camps" | "nodes" | "ruins"> {
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
  const villages: Village[] = pick(46, 70, (x, y) => terrainAt(w, x, y).h < 0.34).map((p, i) => {
    const t = terrainAt(w, p.x, p.y);
    return { name: VILLAGE_NAMES[i % VILLAGE_NAMES.length], x: p.x, y: p.y, yurt: t.m < 0.42, rec: 8, recAt: 0, rep: 0 };
  });
  const camps: Camp[] = pick(22, 90, (x, y) => Math.hypot(x - CAPITAL.x, y - CAPITAL.y) > 380 && CITIES.every((c) => Math.hypot(c.x - x, c.y - y) > 300)).map((p, i) => {
    const d = Math.hypot(p.x - CAPITAL.x, p.y - CAPITAL.y);
    const tier = Math.min(5, 1 + Math.floor(d / 700));
    return { name: BANDIT_NAMES[i % BANDIT_NAMES.length], x: p.x, y: p.y, tier, alive: true, respawnAt: 0, garrison: campGarrison(tier, R) };
  });
  const nodes: ResNode[] = [];
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
  return { villages, camps, nodes, ruins };
}

export function campGarrison(tier: number, R: () => number = Math.random): Army {
  const n = Math.round(14 * Math.pow(1.7, tier - 1) * (0.85 + R() * 0.3));
  const a = 0.25 + R() * 0.25;
  const h = tier >= 2 ? 0.1 + R() * 0.2 : 0;
  return army(Math.round(n * (1 - a - h)), Math.round(n * a), Math.round(n * h));
}

export function banditArmy(tier: number): Army {
  const n = Math.round(6 * Math.pow(1.65, tier - 1) * (0.7 + Math.random() * 0.6));
  const r = Math.random();
  if (r < 0.4) return army(Math.round(n * 0.7), Math.round(n * 0.3), 0);
  if (r < 0.75) return army(Math.round(n * 0.3), Math.round(n * 0.6), Math.round(n * 0.1));
  return army(Math.round(n * 0.3), Math.round(n * 0.2), Math.round(n * 0.5));
}

export function newGame(w: World): GameState {
  const now = Date.now();
  const places = placeWorld(w);
  const buildings = Object.fromEntries(BUILDINGS.map((b) => [b.id, { lv: b.id === "sur" ? 0 : 1, until: 0 }])) as GameState["buildings"];
  return {
    v: 1,
    res: { gold: 300, food: 600, wood: 500, stone: 300 },
    resAt: now,
    buildings,
    queue: [],
    garrison: army(10, 0, 0),
    hero: { name: "Alp Er Tunga", portrait: 1, lv: 1, xp: 0, x: CAPITAL.x + 10, y: CAPITAL.y + 115, army: army(12, 4, 0), path: null, pathI: 0, trophies: 0 },
    marches: [],
    explored: new Uint8Array(NW * NH),
    ...places,
    bandits: [],
    quest: 0,
    time: 0,
    kills: 0,
    nextId: 1,
  };
}

const KEY = "kervan_krallik_v1";

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

export function saveGame(s: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...s, explored: encodeBits(s.explored), bandits: [] }));
  } catch {
    /* storage full or blocked */
  }
}

export function loadGame(w: World): GameState {
  const fresh = newGame(w);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh;
    const r = JSON.parse(raw) as Partial<GameState> & { explored?: string };
    if (r.v !== 1) return fresh;
    return {
      ...fresh,
      ...r,
      buildings: { ...fresh.buildings, ...(r.buildings ?? {}) },
      hero: { ...fresh.hero, ...(r.hero ?? {}), path: null, pathI: 0 },
      explored: typeof r.explored === "string" ? decodeBits(r.explored, NW * NH) : fresh.explored,
      bandits: [],
      marches: Array.isArray(r.marches) ? r.marches : [],
    } as GameState;
  } catch {
    return fresh;
  }
}

export function wipeGame(): void {
  localStorage.removeItem(KEY);
}
