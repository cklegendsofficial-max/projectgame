import { totalCityLevels } from "./cities";
import { SEAL_BONUS } from "./data";
import type { GameState } from "./state";

export interface AgeDef {
  id: string;
  cost: number;
  routes: number;
  cities: number;
  mult: number;
}

export const AGES: AgeDef[] = [
  { id: "nomad", cost: 0, routes: 0, cities: 0, mult: 1 },
  { id: "seljuk", cost: 2e6, routes: 4, cities: 2, mult: 1.5 },
  { id: "mongol", cost: 2e10, routes: 6, cities: 6, mult: 2 },
  { id: "timurid", cost: 2e14, routes: 7, cities: 10, mult: 2.5 },
  { id: "ottoman", cost: 1e19, routes: 8, cities: 16, mult: 3 },
];

export function ageMult(s: GameState): number {
  let m = 1;
  for (let k = 1; k <= s.age && k < AGES.length; k++) m *= AGES[k].mult;
  return m;
}

export function openRoutes(s: GameState): number {
  return s.routes.filter((r) => r.owned > 0).length;
}

export function nextAge(s: GameState): AgeDef | null {
  return AGES[s.age + 1] ?? null;
}

export function ageCost(s: GameState, a: AgeDef): number {
  return a.cost * (s.ruler.trait === "scholar" ? 0.5 : 1);
}

export function ageReqsMet(s: GameState, a: AgeDef): boolean {
  return openRoutes(s) >= a.routes && totalCityLevels(s) >= a.cities;
}

export function canAdvanceAge(s: GameState): boolean {
  const a = nextAge(s);
  return !!a && ageReqsMet(s, a) && s.gold >= ageCost(s, a);
}

export interface WonderDef {
  id: string;
  city: string;
  age: number;
  cost: number[];
  dx: number;
  dy: number;
}

export const WONDERS: WonderDef[] = [
  { id: "registan", city: "samarkand", age: 1, cost: [2e7, 2e8, 2e9], dx: -0.11, dy: -0.01 },
  { id: "sanjar", city: "merv", age: 2, cost: [5e10, 5e11, 5e12], dx: 0.09, dy: -0.03 },
  { id: "hagia", city: "constantinople", age: 3, cost: [1e15, 1e16, 1e17], dx: 0.09, dy: -0.05 },
];
export const WONDER_STAGES = 3;
export const WONDER_STAGE_MULT = 1.15;
export const WONDER_DONE_MULT = 1.3;

export function wonderStage(s: GameState, id: string): number {
  return s.wonders[id] ?? 0;
}

export function wonderCost(s: GameState, w: WonderDef): number {
  const st = wonderStage(s, w.id);
  return (w.cost[st] ?? Infinity) * (s.ruler.trait === "builder" ? 0.6 : 1);
}

export function wonderMult(s: GameState): number {
  let m = 1;
  for (const w of WONDERS) {
    const st = wonderStage(s, w.id);
    m *= Math.pow(WONDER_STAGE_MULT, st);
    if (st >= WONDER_STAGES) m *= WONDER_DONE_MULT;
  }
  return m;
}

export function wonderVisible(s: GameState, w: WonderDef): boolean {
  return s.age >= w.age || wonderStage(s, w.id) > 0;
}

export function canBuildWonder(s: GameState, w: WonderDef): boolean {
  return s.age >= w.age && wonderStage(s, w.id) < WONDER_STAGES && s.gold >= wonderCost(s, w);
}

export const TRAITS = ["merchant", "swift", "warrior", "generous", "builder", "pious", "scholar"] as const;
export type TraitId = (typeof TRAITS)[number];

export const traitMult = {
  profit: (s: GameState) => (s.ruler.trait === "merchant" ? 1.3 : 1),
  speed: (s: GameState) => (s.ruler.trait === "swift" ? 1.25 : 1),
  bounty: (s: GameState) => (s.ruler.trait === "warrior" ? 3 : 1),
  trade: (s: GameState) => (s.ruler.trait === "generous" ? 2 : 1),
  story: (s: GameState) => (s.ruler.trait === "pious" ? 1.5 : 1),
  build: (s: GameState) => (s.ruler.trait === "builder" ? 0.5 : 1),
};

const NAMES_M = ["Tuğrul", "Çağrı", "Alp Arslan", "Melikşah", "Sencer", "Kılıç Arslan", "Keykubad", "Mahmud", "Ayaz", "Turan", "Kutlu", "Bilge", "Oğuz", "Yusuf", "Timur", "Uluğ"];
const NAMES_F = ["Terken", "Gevher", "Tomris", "Aybike", "Nilüfer", "Sevinç", "Altun", "Bilge", "Ayşe", "Saray"];

export interface Ruler {
  name: string;
  trait: TraitId;
  gen: number;
}

export function randomHeir(gen: number, exclude: TraitId[] = []): Ruler {
  const pool = Math.random() < 0.6 ? NAMES_M : NAMES_F;
  const traits = TRAITS.filter((t) => !exclude.includes(t));
  return { name: pool[Math.floor(Math.random() * pool.length)], trait: traits[Math.floor(Math.random() * traits.length)], gen };
}

export function heirChoices(s: GameState): Ruler[] {
  const out: Ruler[] = [];
  const gen = s.ruler.gen + 1;
  while (out.length < 3) {
    const h = randomHeir(gen, out.map((o) => o.trait));
    if (!out.some((o) => o.name === h.name)) out.push(h);
  }
  return out;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function rulerTitle(s: GameState, r: Ruler): string {
  const prior = s.lineage.filter((l) => l.name === r.name && l.gen < r.gen).length;
  return prior > 0 ? `${ROMAN[Math.min(prior, 9)]}. ${r.name}` : r.name;
}

export const CREST_SYMBOLS = ["seal", "crown", "swords", "silk", "jade", "genie", "spices", "turquoise"];
export const CREST_COLORS = ["#8b1e1e", "#1e4f8b", "#1e6b3a", "#5a2a7a", "#a2661a", "#222222"];

export interface RivalDef {
  id: string;
  base: number;
  routes: number[];
  color: string;
}

export const RIVALS: RivalDef[] = [
  { id: "sogd", base: 3e6, routes: [0, 1], color: "#b5652a" },
  { id: "genoa", base: 2e10, routes: [2, 3, 4], color: "#2a6db5" },
  { id: "ortoq", base: 5e14, routes: [5, 6, 7], color: "#7a2ab5" },
];
export const RIVAL_ROUTE_BONUS = 1.25;

export function rivalWealth(s: GameState, r: RivalDef): number {
  const seals = Math.pow(1 + s.seals * SEAL_BONUS, 1.3);
  return r.base * seals * Math.pow(1.015, s.runSeconds / 60);
}

export function rivalBeaten(s: GameState, id: string): boolean {
  return s.rivalsBeaten.includes(id);
}

export function rivalRouteMult(s: GameState, i: number): number {
  let m = 1;
  for (const r of RIVALS) if (r.routes.includes(i) && rivalBeaten(s, r.id)) m *= RIVAL_ROUTE_BONUS;
  return m;
}

export function activeRivals(s: GameState): RivalDef[] {
  return RIVALS.filter((r) => !rivalBeaten(s, r.id) && r.routes.some((i) => s.routes[i].owned > 0));
}

export function rivalForRoute(s: GameState, i: number): RivalDef | null {
  return RIVALS.find((r) => r.routes.includes(i) && !rivalBeaten(s, r.id)) ?? null;
}