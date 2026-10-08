import { banditStrength, winChance } from "./army";
import { CITIES, ROUTES } from "./data";
import { raidPower } from "./province";
import type { GameState } from "./state";

export const GOOD_VALUE = [10, 14, 20, 28, 38, 50, 64, 80];
export const CITY_IDS = CITIES.map((c) => c.id);
const PRODUCER = ROUTES.map((r) => CITY_IDS.indexOf(r.from));
const ROUTE_AT = CITY_IDS.map((id) => {
  const i = ROUTES.findIndex((r) => r.from === id || r.to === id);
  return Math.max(0, i);
});

export const SHORTCUTS: [number, number, string][] = [
  [7, 5, "karakum"],
  [4, 2, "elburz"],
  [2, 0, "pontus"],
  [8, 6, "tianshan"],
];

export const EPOCH_MS = 180_000;
export const STEP_MS = 3_000;
export const MAIN_STEPS = 2;
export const SHORT_STEPS = 3;
export const MAIN_DANGER = 0.3;
export const SHORT_DANGER = 0.62;
export const PROV_MAX = 5;
export const PROV_MS = 6 * 60_000;
export const PROV_AD = 3;
export const UP_MAX = 5;
export const LV_MAX = 30;
const SAT_STEP = 0.035;
const SAT_DECAY_MS = 15_000;
const BUY_MARKUP = 1.1;

export type UpKind = "camels" | "guards" | "guide" | "haggle";
export const UPS: UpKind[] = ["camels", "guards", "guide", "haggle"];
export const UP_ICON: Record<UpKind, string> = { camels: "j_camels", guards: "j_guards", guide: "j_guide", haggle: "j_haggle" };

export interface Trip {
  path: number[];
  steps: number[];
  edge: number;
  step: number;
  prog: number;
  risky: boolean;
  mood: number;
  loot: number;
  lost: number;
  events: number;
  fights: number;
}

export interface JourneyState {
  city: number;
  cargo: number[];
  cost: number[];
  unit: number;
  trip: Trip | null;
  sat: number[][];
  satAt: number;
  seen: number[];
  prov: number;
  provAt: number;
  lv: number;
  xp: number;
  up: number[];
  trips: number;
  best: number;
  profit: number;
}

export function freshJourney(now: number): JourneyState {
  return {
    city: CITY_IDS.indexOf("samarkand"),
    cargo: ROUTES.map(() => 0),
    cost: ROUTES.map(() => 0),
    unit: 0,
    trip: null,
    sat: CITIES.map(() => ROUTES.map(() => 0)),
    satAt: now,
    seen: CITIES.map(() => -1),
    prov: PROV_MAX,
    provAt: now,
    lv: 1,
    xp: 0,
    up: UPS.map(() => 0),
    trips: 0,
    best: 0,
    profit: 0,
  };
}

export function sanitizeJourney(raw: unknown, now: number): JourneyState {
  const j = freshJourney(now);
  if (!raw || typeof raw !== "object") return j;
  const r = raw as Partial<JourneyState>;
  const n = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);
  const arr = (v: unknown, len: number, lo: number, hi: number) =>
    Array.from({ length: len }, (_, i) => Math.min(hi, Math.max(lo, n(Array.isArray(v) ? v[i] : 0, 0))));
  j.city = Math.min(CITIES.length - 1, Math.max(0, Math.floor(n(r.city, j.city))));
  j.cargo = arr(r.cargo, ROUTES.length, 0, 1e4).map(Math.floor);
  j.cost = arr(r.cost, ROUTES.length, 0, Number.MAX_VALUE);
  j.unit = Math.max(0, n(r.unit, 0));
  j.sat = CITIES.map((_, c) => arr(Array.isArray(r.sat) ? r.sat[c] : null, ROUTES.length, -40, 40));
  j.satAt = n(r.satAt, now);
  j.seen = arr(r.seen, CITIES.length, -1, Number.MAX_SAFE_INTEGER).map(Math.floor);
  j.prov = Math.min(PROV_MAX, Math.max(0, Math.floor(n(r.prov, PROV_MAX))));
  j.provAt = n(r.provAt, now);
  j.lv = Math.min(LV_MAX, Math.max(1, Math.floor(n(r.lv, 1))));
  j.xp = Math.max(0, n(r.xp, 0));
  j.up = arr(r.up, UPS.length, 0, UP_MAX).map(Math.floor);
  j.trips = Math.max(0, Math.floor(n(r.trips, 0)));
  j.best = Math.max(0, n(r.best, 0));
  j.profit = n(r.profit, 0);
  const t = r.trip as Partial<Trip> | null | undefined;
  if (t && Array.isArray(t.path) && Array.isArray(t.steps) && t.path.length >= 2 && t.steps.length === t.path.length - 1) {
    const path = t.path.map((c) => Math.floor(n(c, -1)));
    if (path.every((c) => c >= 0 && c < CITIES.length)) {
      const edge = Math.min(t.steps.length - 1, Math.max(0, Math.floor(n(t.edge, 0))));
      j.trip = {
        path,
        steps: t.steps.map((x) => Math.max(1, Math.floor(n(x, MAIN_STEPS)))),
        edge,
        step: Math.max(0, Math.floor(n(t.step, 0))),
        prog: Math.min(1, Math.max(0, n(t.prog, 0))),
        risky: !!t.risky,
        mood: n(t.mood, 0),
        loot: Math.max(0, n(t.loot, 0)),
        lost: Math.max(0, n(t.lost, 0)),
        events: Math.max(0, Math.floor(n(t.events, 0))),
        fights: Math.max(0, Math.floor(n(t.fights, 0))),
      };
    }
  }
  return j;
}

export function resetJourneyRun(j: JourneyState): void {
  j.cargo = ROUTES.map(() => 0);
  j.cost = ROUTES.map(() => 0);
  j.unit = 0;
  j.trip = null;
}

function hash(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function epochOf(now: number): number {
  return Math.floor(now / EPOCH_MS);
}

export function distMod(city: number, g: number): number {
  return Math.min(2.3, 0.6 + 0.21 * Math.abs(city - PRODUCER[g]));
}

export function basePrice(city: number, g: number, epoch: number): number {
  return GOOD_VALUE[g] * distMod(city, g) * (0.85 + 0.3 * hash(city, g, epoch));
}

export function expectedPrice(city: number, g: number): number {
  return GOOD_VALUE[g] * distMod(city, g);
}

function satMult(j: JourneyState, city: number, g: number): number {
  return Math.min(1.6, Math.max(0.45, 1 - SAT_STEP * j.sat[city][g]));
}

export function sellPrice(j: JourneyState, city: number, g: number, now: number): number {
  return basePrice(city, g, epochOf(now)) * satMult(j, city, g) * (1 + 0.05 * j.up[3]);
}

export function buyPrice(j: JourneyState, city: number, g: number, now: number): number {
  return basePrice(city, g, epochOf(now)) * satMult(j, city, g) * BUY_MARKUP;
}

export function priceFresh(j: JourneyState, city: number, now: number): boolean {
  return j.seen[city] === epochOf(now);
}

export function estSell(j: JourneyState, city: number, g: number, now: number): number {
  return priceFresh(j, city, now) ? sellPrice(j, city, g, now) : expectedPrice(city, g) * satMult(j, city, g) * (1 + 0.05 * j.up[3]);
}

export function goodUnlocked(s: GameState, g: number): boolean {
  return s.routes[g].owned > 0;
}

export function goodsHere(s: GameState, city: number): number[] {
  return ROUTES.map((_, g) => g).filter((g) => goodUnlocked(s, g) && Math.abs(city - PRODUCER[g]) <= 1);
}

export function knownCities(s: GameState): number[] {
  const set = new Set<number>();
  ROUTES.forEach((r, i) => {
    if (s.routes[i].owned > 0) {
      set.add(CITY_IDS.indexOf(r.from));
      set.add(CITY_IDS.indexOf(r.to));
    }
  });
  set.add(s.journey.city);
  return [...set].sort((a, b) => b - a);
}

export function capacity(j: JourneyState): number {
  return 8 + 3 * j.up[0] + (j.lv - 1);
}

export function load(j: JourneyState): number {
  return j.cargo.reduce((a, b) => a + b, 0);
}

export function cargoValue(j: JourneyState, city: number, now: number): number {
  return j.cargo.reduce((a, n, g) => a + n * estSell(j, city, g, now), 0);
}

export function unitFor(income: number): number {
  return Math.max(1, income * 3);
}

export function decaySat(j: JourneyState, now: number): void {
  const k = Math.floor((now - j.satAt) / SAT_DECAY_MS);
  if (k <= 0) return;
  j.satAt += k * SAT_DECAY_MS;
  for (const row of j.sat) for (let g = 0; g < row.length; g++) row[g] = row[g] > 0 ? Math.max(0, row[g] - k) : Math.min(0, row[g] + k);
}

export function provTick(j: JourneyState, now: number): void {
  if (j.prov >= PROV_MAX) {
    j.provAt = now;
    return;
  }
  const k = Math.floor((now - j.provAt) / PROV_MS);
  if (k <= 0) return;
  j.prov = Math.min(PROV_MAX, j.prov + k);
  j.provAt = j.prov >= PROV_MAX ? now : j.provAt + k * PROV_MS;
}

export function provLeft(j: JourneyState, now: number): number {
  return j.prov >= PROV_MAX ? 0 : Math.max(0, j.provAt + PROV_MS - now);
}

export function shortcutAt(a: number, b: number): string | null {
  for (const [x, y, id] of SHORTCUTS) if ((x === a && y === b) || (x === b && y === a)) return id;
  return null;
}

export function buildPath(from: number, to: number, risky: boolean): { path: number[]; steps: number[] } {
  const path = [from];
  const steps: number[] = [];
  let c = from;
  const dir = to > from ? 1 : -1;
  while (c !== to) {
    let next = c + dir;
    let n = MAIN_STEPS;
    if (risky) {
      for (const [x, y] of SHORTCUTS) {
        const o = x === c ? y : y === c ? x : -1;
        if (o >= 0 && (o - c) * dir === 2 && (to - o) * dir >= 0) {
          next = o;
          n = SHORT_STEPS;
        }
      }
    }
    path.push(next);
    steps.push(n);
    c = next;
  }
  return { path, steps };
}

export function hasShortcut(from: number, to: number): boolean {
  return buildPath(from, to, true).path.length !== buildPath(from, to, false).path.length;
}

export function totalSteps(steps: number[]): number {
  return steps.reduce((a, b) => a + b, 0);
}

export function stepDanger(j: JourneyState, short: boolean): number {
  return (short ? SHORT_DANGER : MAIN_DANGER) * (1 - 0.12 * j.up[2]);
}

export function edgeIsShort(t: Trip, e: number): boolean {
  return t.steps[e] === SHORT_STEPS && Math.abs(t.path[e + 1] - t.path[e]) === 2;
}

export function tripProgress(t: Trip): { a: number; b: number; f: number; done: number } {
  const total = totalSteps(t.steps);
  const before = totalSteps(t.steps.slice(0, t.edge));
  const f = Math.min(1, (t.step + t.prog) / t.steps[t.edge]);
  return { a: t.path[t.edge], b: t.path[t.edge + 1], f, done: (before + t.step + t.prog) / total };
}

export function caravanPower(s: GameState): number {
  return (6 + raidPower(s)) * (1 + 0.25 * s.journey.up[1]);
}

export function banditFoe(s: GameState, city: number, short: boolean): number {
  return banditStrength(s, ROUTE_AT[city]) * 2.2 * (short ? 1.35 : 1);
}

export function fightOdds(s: GameState, city: number, short: boolean): number {
  return Math.min(0.95, Math.max(0.05, winChance(caravanPower(s), banditFoe(s, city, short))));
}

export function fleeOdds(j: JourneyState): number {
  return Math.min(0.85, 0.45 + 0.06 * j.up[0] + 0.05 * j.up[2]);
}

export function loseCargo(j: JourneyState, frac: number): number {
  let lost = 0;
  for (let g = 0; g < j.cargo.length; g++) {
    const n = Math.min(j.cargo[g], Math.ceil(j.cargo[g] * frac));
    if (n <= 0) continue;
    j.cost[g] *= (j.cargo[g] - n) / j.cargo[g];
    j.cargo[g] -= n;
    lost += n;
  }
  return lost;
}

export interface UpCost {
  iron: number;
  leather: number;
  wood: number;
  steel: number;
  sec: number;
}

export function upCost(kind: UpKind, lv: number): UpCost {
  const k = lv + 1;
  const c: UpCost = { iron: 0, leather: 0, wood: 0, steel: 0, sec: 60 * k * k };
  if (kind === "camels") Object.assign(c, { wood: 15 * k, leather: 10 * k });
  else if (kind === "guards") Object.assign(c, { iron: 15 * k, steel: 2 * k });
  else if (kind === "guide") Object.assign(c, { leather: 12 * k, wood: 8 * k });
  else Object.assign(c, { sec: 240 * k * k, steel: lv });
  return c;
}

export function xpNeed(lv: number): number {
  return 20 + lv * 15;
}

export function addXp(j: JourneyState, xp: number): number {
  let ups = 0;
  j.xp += xp;
  while (j.lv < LV_MAX && j.xp >= xpNeed(j.lv)) {
    j.xp -= xpNeed(j.lv);
    j.lv++;
    ups++;
  }
  return ups;
}

export type RoadEvent = "bandit" | "storm" | "oasis" | "traveler" | "serai" | "peddler" | "lost";

export function rollEvent(short: boolean): RoadEvent {
  const w: [RoadEvent, number][] = short
    ? [["bandit", 5], ["storm", 3], ["oasis", 1], ["traveler", 1], ["peddler", 1], ["lost", 2]]
    : [["bandit", 3], ["storm", 1.2], ["oasis", 1.5], ["traveler", 1.3], ["serai", 1.3], ["peddler", 1.4]];
  let r = Math.random() * w.reduce((a, [, x]) => a + x, 0);
  for (const [e, x] of w) {
    r -= x;
    if (r <= 0) return e;
  }
  return w[0][0];
}
