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

const SEA_PATHS: Record<string, [number, number][]> = {
  "tabriz-rey": [[0.385, 0.46], [0.405, 0.5], [0.42, 0.52]],
  "rey-bukhara": [[0.42, 0.52], [0.43, 0.4], [0.435, 0.35]],
  "tabriz-bukhara": [[0.385, 0.46], [0.41, 0.38], [0.435, 0.35]],
  "tabriz-constantinople": [[0.25, 0.33], [0.17, 0.32], [0.15, 0.36]],
};

export function seaPath(from: string, to: string, w: number, h: number): { x: number; y: number }[] {
  const fwd = SEA_PATHS[`${from}-${to}`];
  const pts = fwd ?? [...(SEA_PATHS[`${to}-${from}`] ?? [])].reverse();
  return pts.map(([x, y]) => ({ x: x * w, y: y * h }));
}

export function alongPath(pts: { x: number; y: number }[], k: number): { x: number; y: number; dx: number } {
  if (pts.length < 2) return { ...(pts[0] ?? { x: 0, y: 0 }), dx: 1 };
  const lens = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  let d = Math.max(0, Math.min(1, k)) * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const t = lens[i] ? Math.min(1, d / lens[i]) : 0;
      const a = pts[i];
      const b = pts[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, dx: Math.sign(b.x - a.x) || 1 };
    }
    d -= lens[i];
  }
  return { ...pts[pts.length - 1], dx: 1 };
}

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
