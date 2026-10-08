import type { Army } from "./data";
import type { FactionId } from "./factions";

export interface Owned {
  loy: number;
  gar: Army;
  coffer: number;
  tax: 0 | 1 | 2;
  since: number;
  from: FactionId;
}

export const TAX = [
  { name: "Hafif", mult: 0.6, loy: 2 },
  { name: "Olağan", mult: 1, loy: 0 },
  { name: "Ağır", mult: 1.6, loy: -3 },
];

const BASE_GAR: Record<FactionId, number> = { karahan: 42, gazne: 50, selcuk: 56, bizans: 95 };
const WALL: Record<FactionId, number> = { karahan: 0.2, gazne: 0.25, selcuk: 0.25, bizans: 0.4 };

export function cityGarrison(f: FactionId, losses: number): Army {
  const n = Math.round(BASE_GAR[f] * Math.max(0.55, 1 - losses * 0.15));
  return { spear: Math.round(n * 0.5), archer: Math.round(n * 0.3), horse: Math.round(n * 0.2) };
}

export function wallBonus(f: FactionId, engines: number): number {
  return Math.max(0, WALL[f] - 0.1 * Math.min(3, engines));
}

export function cityTax(city: string): number {
  return city === "constantinople" ? 30 : ["kashgar", "bukhara", "konya", "tabriz"].includes(city) ? 20 : 15;
}

export const ENGINE_GOLD = 1200;
export const FEAST_GOLD = 600;
export const SIEGE_LV = 15;
export const SIEGE_RENOWN = 200;
