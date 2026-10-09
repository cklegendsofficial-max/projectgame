import type { FactionId } from "./factions";

export interface DipState {
  peace?: number;
  trade?: number;
  spy?: number;
  intel?: number;
  acted?: number;
  gifts?: number;
}

export type SpyOp = "intel" | "sabotage" | "treasury";

export const GIFT_GOLD = 300;
export const PEACE_GOLD = 500;
export const PEACE_REP = 0;
export const TRADE_GOLD = 400;
export const TRADE_REP = 150;
export const PACT_DAYS = 20;
export const SPY_MAX = 3;
export const TRADE_BONUS = 0.06;
export const INTEL_WALL = 0.06;

export function spyCost(lv: number): number {
  return 300 * (lv + 1);
}

export function giftRep(gifts: number): number {
  return Math.max(10, 45 - gifts * 6);
}

export const SPY_OPS: { id: SpyOp; lv: number; risk: number; name: string; desc: string; en: [string, string] }[] = [
  { id: "intel", lv: 1, risk: 0.08, name: "Haber topla", desc: "Garnizon sayıları ve karşı saldırı planları. 5 gün boyunca kuşatmada surlar zayıf.", en: ["Gather intel", "Garrison numbers and counter-attack plans. Walls are weaker in sieges for 5 days."] },
  { id: "sabotage", lv: 2, risk: 0.2, name: "Sabotaj", desc: "Bir şehirlerinin ambarını yak; garnizon kalıcı olarak zayıflar.", en: ["Sabotage", "Burn a granary in one of their cities; its garrison is permanently weakened."] },
  { id: "treasury", lv: 3, risk: 0.3, name: "Hazineyi soy", desc: "Divan hazinesinden altın aşır. Yakalanırsan itibarın çöker.", en: ["Rob the treasury", "Skim gold from their divan treasury. If caught, your standing collapses."] },
];

export type DipMap = Partial<Record<FactionId, DipState>>;
