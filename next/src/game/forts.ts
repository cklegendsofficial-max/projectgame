import type { Army } from "./data";
import type { FactionId } from "./factions";

export type FortOwner = "harami" | FactionId | "me";

export interface Fort {
  name: string;
  x: number;
  y: number;
  tier: 1 | 2 | 3 | 4;
  owner: FortOwner;
  gar: Army;
  lost: number;
  coffer: number;
  wall: number;
  since: number;
  threat: { day: number; n: number; from: FortOwner } | null;
}

export interface FortTier {
  name: string;
  en: string;
  art: string;
  lv: number;
  gar: number;
  wall: number;
  income: number;
  guard: number;
}

export const FORT_TIERS: Record<1 | 2 | 3 | 4, FortTier> = {
  1: { name: "Gözetleme Kulesi", en: "Watchtower", art: "map/tower", lv: 5, gar: 22, wall: 0.1, income: 35, guard: 420 },
  2: { name: "Palanka", en: "Stockade", art: "map/tower", lv: 8, gar: 46, wall: 0.2, income: 70, guard: 520 },
  3: { name: "Kale", en: "Castle", art: "map/castle", lv: 11, gar: 80, wall: 0.3, income: 120, guard: 620 },
  4: { name: "Hisar", en: "Citadel", art: "map/castle", lv: 14, gar: 130, wall: 0.42, income: 190, guard: 720 },
};

export const FORT_NAMES = ["Akhisar", "Karahisar", "Kızılkule", "Demirkapı", "Yassıkale", "Kuşkale", "Sarıhisar", "Gökkale", "Taşkule", "Bozkale", "Kartalkaya", "Ulukale", "Alangöz", "Erkale"];

/** Kalenin seviye eşiği: önerilen seviyenin iki altına kadar kuşatılabilir. */
export const FORT_LV_SLACK = 2;
export const FORT_MIN_ARMY = 10;
export const FORT_COFFER_DAYS = 6;
export const FORT_WALL_MAX = 2;
export const FORT_WALL_COST = [
  { gold: 600, stone: 250 },
  { gold: 1400, stone: 600 },
];
export const FORT_NEAR = 120;

export function fortGarrison(tier: 1 | 2 | 3 | 4, owner: FortOwner, lost: number): Army {
  const base = FORT_TIERS[tier].gar * (owner === "harami" ? 1 : 1.15);
  const n = Math.round(base * Math.max(0.55, 1 - lost * 0.15));
  return owner === "harami"
    ? { spear: Math.round(n * 0.35), archer: Math.round(n * 0.25), horse: Math.round(n * 0.4) }
    : { spear: Math.round(n * 0.5), archer: Math.round(n * 0.32), horse: Math.round(n * 0.18) };
}

export function fortWall(f: Fort, engines: number): number {
  return Math.max(0, FORT_TIERS[f.tier].wall - 0.08 * Math.min(3, engines));
}

export function fortDefense(f: Fort): number {
  return FORT_TIERS[f.tier].wall + 0.1 * f.wall;
}

export const fortKey = (i: number) => `kale:${i}`;

export function fortIndex(id: string): number {
  return id.startsWith("kale:") ? Number(id.slice(5)) : -1;
}
