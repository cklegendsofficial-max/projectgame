import { army, type Army } from "./data";

export interface Port {
  city: string;
  name: string;
  sea: string;
}

export const PORTS: Port[] = [
  { city: "tabriz", name: "Bakü İskelesi", sea: "Hazar" },
  { city: "rey", name: "Esterâbâd İskelesi", sea: "Hazar" },
  { city: "bukhara", name: "Mangışlak İskelesi", sea: "Hazar" },
  { city: "constantinople", name: "Haliç Limanı", sea: "Karadeniz" },
];

export const ROUTES: [string, string, number][] = [
  ["tabriz", "rey", 1],
  ["rey", "bukhara", 1.5],
  ["tabriz", "bukhara", 2],
  ["tabriz", "constantinople", 2],
];

export const SHIP_GOLD = 1500;
export const SHIP_MAX = 3;
export const SHIP_CAP = 40;
export const ESCORT_GOLD = 220;
export const PIRATE_RISK = 0.2;

export function portOf(city: string): Port | undefined {
  return PORTS.find((p) => p.city === city);
}

export function routeDays(a: string, b: string): number {
  const r = ROUTES.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return r ? r[2] : 0;
}

export function routesFrom(city: string): { to: string; days: number }[] {
  return ROUTES.filter(([a, b]) => a === city || b === city).map(([a, b, d]) => ({ to: a === city ? b : a, days: d }));
}

export function pirateArmy(lv: number): Army {
  const k = 1 + lv * 0.12;
  return army(Math.round(14 * k), Math.round(18 * k), Math.round(4 * k));
}
