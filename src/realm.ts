import { banditStrength, companionPower, heroPower, idleSoldiers, soldierPower, threatMult, winChance } from "./army";
import { ROUTES } from "./data";
import { RIVALS, type RivalDef } from "./empire";
import { marketMult } from "./market";
import { mercPower } from "./province";
import type { GameState } from "./state";

export interface Stock {
  units: number;
  cost: number;
}

export const BAZAAR_LOTS = 10;
export const BAZAAR_FEE = 0.03;
export const BAZAAR_MIN_OWNED = 10;

export function lotCost(income: number): number {
  return Math.max(200, income * 60);
}

export function stockValue(s: GameState, i: number, now: number): number {
  return s.bazaar[i].units * marketMult(i, now) * (1 - BAZAAR_FEE);
}

export function stockLots(s: GameState, i: number, income: number): number {
  return Math.round(s.bazaar[i].cost / lotCost(income));
}

export function canStock(s: GameState, i: number, income: number): boolean {
  return s.routes[i].owned >= BAZAAR_MIN_OWNED && s.bazaar[i].cost + lotCost(income) * 0.5 <= lotCost(income) * BAZAAR_LOTS && s.gold >= lotCost(income);
}

export function buyStock(s: GameState, i: number, now: number, income: number): number {
  if (!canStock(s, i, income)) return 0;
  const lot = lotCost(income);
  s.gold -= lot;
  s.bazaar[i].units += lot / marketMult(i, now);
  s.bazaar[i].cost += lot;
  return lot;
}

export function sellStock(s: GameState, i: number, now: number): { got: number; gain: number } {
  const st = s.bazaar[i];
  if (st.units <= 0) return { got: 0, gain: 0 };
  const got = stockValue(s, i, now);
  const gain = got - st.cost;
  s.bazaar[i] = { units: 0, cost: 0 };
  return { got, gain };
}

export function freshBazaar(): Stock[] {
  return ROUTES.map(() => ({ units: 0, cost: 0 }));
}

export interface Relation {
  rel: number;
  at: number;
  cd: number;
  ally: number;
  spoils: number;
}

export type DiploAct = "gift" | "ally" | "tribute" | "war";
export const DIPLO_CD = 3 * 60_000;
export const ALLY_MS = 20 * 60_000;
export const SPOILS_MS = 20 * 60_000;
export const ALLY_MULT = 1.2;
export const SPOILS_MULT = 1.3;
export const ALLY_NEED = 50;
export const GIFT_REL = 25;

export function freshRelation(now: number): Relation {
  return { rel: 0, at: now, cd: 0, ally: 0, spoils: 0 };
}

export function relation(s: GameState, id: string, now: number): Relation {
  let r = s.diplo[id];
  if (!r) r = s.diplo[id] = freshRelation(now);
  const mins = (now - r.at) / 60_000;
  if (mins > 0) {
    const mag = Math.max(0, Math.abs(r.rel) - mins);
    r.rel = Math.sign(r.rel) * mag;
    r.at = now;
  }
  return r;
}

export function diploRouteMult(s: GameState, i: number, now: number): number {
  let m = 1;
  for (const rv of RIVALS) {
    if (!rv.routes.includes(i)) continue;
    const r = s.diplo[rv.id];
    if (!r) continue;
    if (r.ally > now) m *= ALLY_MULT;
    if (r.spoils > now) m *= SPOILS_MULT;
  }
  return m;
}

export function rivalReached(s: GameState, rv: RivalDef): boolean {
  return rv.routes.some((i) => s.routes[i].owned > 0);
}

export function rivalArmy(s: GameState, rv: RivalDef): number {
  return banditStrength(s, rv.routes[rv.routes.length - 1]) * 12;
}

export function myArmy(s: GameState): number {
  return idleSoldiers(s) * soldierPower(s) + s.mercs * mercPower(s) + (s.hero ? heroPower(s) : 0) + companionPower(s);
}

export function idleArmyCount(s: GameState): number {
  return idleSoldiers(s);
}

export function tributeOdds(s: GameState, rv: RivalDef): number {
  return Math.min(0.95, winChance(myArmy(s), rivalArmy(s, rv)));
}

export function warOdds(s: GameState, rv: RivalDef): number {
  return Math.min(0.95, winChance(myArmy(s), rivalArmy(s, rv) * 1.5));
}

export function giftCost(income: number): number {
  return Math.max(1000, income * 120);
}

export type NodeKind = "fight" | "elite" | "treasure" | "shrine" | "mystery" | "boss";
export const NODE_ICON: Record<NodeKind, string> = { fight: "swords", elite: "wanted", treasure: "chest", shrine: "shrine", mystery: "mystery", boss: "evren" };
export const EXP_ROWS = 7;
export const EXP_HP = 3;
export const EXP_TICKETS = 2;
export const EXP_TICKET_MS = 30 * 60_000;

export interface Expedition {
  seed: number;
  row: number;
  hp: number;
  secs: number;
  steel: number;
  xp: number;
  path: number[];
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROW_POOL: NodeKind[] = ["fight", "fight", "fight", "elite", "treasure", "shrine", "mystery", "mystery"];

export function expRow(seed: number, row: number): NodeKind[] {
  if (row >= EXP_ROWS - 1) return ["boss"];
  const r = rng(seed * 31 + row * 977);
  const out: NodeKind[] = [];
  while (out.length < 3) {
    const k = ROW_POOL[Math.floor(r() * ROW_POOL.length)];
    if (row === 0 && (k === "elite" || k === "shrine")) continue;
    if (!out.includes(k) || k === "fight") out.push(k);
  }
  if (!out.includes("fight") && !out.includes("elite")) out[0] = "fight";
  return out;
}

export function expFoe(s: GameState, row: number, kind: NodeKind): number {
  const base = (heroPower(s) + companionPower(s)) * (0.5 + row * 0.11);
  const kindMult = kind === "elite" ? 1.45 : kind === "boss" ? 1.35 : 1;
  const need = kind === "fight" ? 0 : 5 + row * 3;
  return base * kindMult * threatMult(s, need);
}

export function expOdds(s: GameState, row: number, kind: NodeKind): number {
  return Math.min(0.95, winChance(heroPower(s) + companionPower(s), expFoe(s, row, kind)));
}

export function rollExpTickets(s: GameState, now: number): boolean {
  if (s.expTickets >= EXP_TICKETS) {
    s.expAt = now;
    return false;
  }
  if (now - s.expAt < EXP_TICKET_MS) return false;
  const n = Math.floor((now - s.expAt) / EXP_TICKET_MS);
  s.expTickets = Math.min(EXP_TICKETS, s.expTickets + n);
  s.expAt += n * EXP_TICKET_MS;
  return true;
}
