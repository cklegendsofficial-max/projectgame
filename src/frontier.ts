import { type Material } from "./army";
import { CITY_BY_ID, ROUTES } from "./data";
import type { CompanionId } from "./companions";
import type { GameState } from "./state";

export type NodeKind = "iron" | "wood" | "leather" | "ruin";

export interface WorldNode {
  kind: NodeKind;
  x: number;
  y: number;
  route: number;
}

export const NODES: WorldNode[] = [
  { kind: "wood", x: 0.885, y: 0.5, route: 0 },
  { kind: "iron", x: 0.735, y: 0.375, route: 0 },
  { kind: "leather", x: 0.81, y: 0.6, route: 1 },
  { kind: "ruin", x: 0.955, y: 0.33, route: 2 },
  { kind: "iron", x: 0.63, y: 0.655, route: 3 },
  { kind: "wood", x: 0.59, y: 0.55, route: 4 },
  { kind: "ruin", x: 0.44, y: 0.47, route: 5 },
  { kind: "leather", x: 0.25, y: 0.7, route: 6 },
  { kind: "iron", x: 0.2, y: 0.37, route: 7 },
  { kind: "ruin", x: 0.07, y: 0.6, route: 7 },
];

export const NODE_ICON: Record<NodeKind, string> = { iron: "mat_iron", wood: "mat_wood", leather: "mat_leather", ruin: "mystery" };
export const GATHER_MS = 3 * 60_000;
export const RUIN_MS = 12 * 60_000;

export function nodeOpen(s: GameState, k: number): boolean {
  const n = NODES[k];
  return !!n && s.routes[n.route].owned > 0;
}

export function nodeReady(s: GameState, k: number, now: number): boolean {
  return nodeOpen(s, k) && now >= (s.nodeAt[k] ?? 0);
}

export function gatherYield(s: GameState, k: number): number {
  const n = NODES[k];
  return 4 + n.route * 3 + s.age * 4;
}

export function ruinNeed(k: number): number {
  return 5 + NODES[k].route * 3;
}

export function freshNodes(): number[] {
  return NODES.map(() => 0);
}

export function gatherMat(kind: NodeKind): Material | null {
  return kind === "ruin" ? null : kind;
}

export const GOV_STEP = 0.04;

export function governorOf(s: GameState, city: string): CompanionId | null {
  return s.governors[city] ?? null;
}

export function governorCity(s: GameState, id: CompanionId): string | null {
  for (const [c, g] of Object.entries(s.governors)) if (g === id) return c;
  return null;
}

export function govMult(s: GameState, i: number): number {
  const r = ROUTES[i];
  let m = 1;
  for (const c of [r.from, r.to]) {
    const g = s.governors[c];
    if (g) m *= 1 + GOV_STEP * (s.companions[g] ?? 0);
  }
  return m;
}

export function isCity(id: string): boolean {
  return !!CITY_BY_ID[id];
}
