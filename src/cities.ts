import { CITIES, ROUTES } from "./data";
import type { GameState } from "./state";

export const BUILDINGS = ["caravanserai", "bazaar", "mosque"] as const;
export type BuildingId = (typeof BUILDINGS)[number];

export const MAX_CITY_LEVEL = BUILDINGS.length;
const LEVEL_MULT = [1, 1.5, 3, 9];
const LEVEL_COST_X = [2, 60, 3000];
export const BUILD_SECONDS = [30, 120, 360];

export interface CityBuild {
  id: string;
  level: number;
  until: number;
}

export function cityRoutes(id: string): number[] {
  return ROUTES.map((r, i) => (r.from === id || r.to === id ? i : -1)).filter((i) => i >= 0);
}

export function cityUnlocked(s: GameState, id: string): boolean {
  return cityRoutes(id).some((i) => s.routes[i].owned > 0);
}

export function cityLevel(s: GameState, id: string): number {
  return s.cityLevels[id] ?? 0;
}

export function cityCost(id: string, level: number): number {
  const base = Math.min(...cityRoutes(id));
  return ROUTES[base].masterCost * LEVEL_COST_X[level];
}

export function levelMult(level: number): number {
  return LEVEL_MULT[level] ?? 1;
}

export function stepMult(level: number): number {
  return LEVEL_MULT[level + 1] / LEVEL_MULT[level];
}

export function cityRouteMult(s: GameState, i: number): number {
  return levelMult(cityLevel(s, ROUTES[i].from)) * levelMult(cityLevel(s, ROUTES[i].to));
}

export function canBuild(s: GameState, id: string): boolean {
  return !s.cityBuild && cityUnlocked(s, id) && cityLevel(s, id) < MAX_CITY_LEVEL;
}

export function startBuild(s: GameState, id: string, now: number): boolean {
  if (!canBuild(s, id)) return false;
  const level = cityLevel(s, id);
  const cost = cityCost(id, level);
  if (s.gold < cost) return false;
  s.gold -= cost;
  s.cityBuild = { id, level: level + 1, until: now + BUILD_SECONDS[level] * 1000 };
  return true;
}

export function finishBuild(s: GameState): CityBuild | null {
  const b = s.cityBuild;
  if (!b) return null;
  s.cityLevels[b.id] = b.level;
  s.cityBuild = null;
  return b;
}

export function totalCityLevels(s: GameState): number {
  return CITIES.reduce((a, c) => a + cityLevel(s, c.id), 0);
}
