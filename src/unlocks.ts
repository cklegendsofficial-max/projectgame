import type { GameState } from "./state";

export type Feature = "journey" | "events" | "army" | "court" | "war" | "realm" | "dynasty" | "bazaar" | "arena" | "guild";

export interface FeatureDef {
  id: Feature;
  icon: string;
  routes: number;
  tab: "army" | "dynasty" | "routes";
  sub?: "hero" | "realm" | "war" | "arena" | "guild";
}

export const FEATURES: FeatureDef[] = [
  { id: "journey", icon: "j_caravan", routes: 2, tab: "routes" },
  { id: "events", icon: "ev_storm", routes: 2, tab: "routes" },
  { id: "army", icon: "it_sword_1", routes: 3, tab: "army", sub: "hero" },
  { id: "court", icon: "crown", routes: 3, tab: "routes" },
  { id: "realm", icon: "village", routes: 4, tab: "army", sub: "realm" },
  { id: "dynasty", icon: "soyagaci", routes: 4, tab: "dynasty" },
  { id: "war", icon: "fortress", routes: 5, tab: "army", sub: "war" },
  { id: "bazaar", icon: "bedesten", routes: 5, tab: "routes" },
  { id: "arena", icon: "arena", routes: 6, tab: "army", sub: "arena" },
  { id: "guild", icon: "guild", routes: 6, tab: "army", sub: "guild" },
];

export const FEATURE_IDS = FEATURES.map((f) => f.id);

export function routesOpen(s: GameState): number {
  return s.routes.filter((r) => r.owned > 0).length;
}

export function featureReady(s: GameState, f: FeatureDef): boolean {
  return s.tutorial >= 5 && routesOpen(s) >= f.routes;
}

export function isOpen(s: GameState, id: Feature): boolean {
  return s.unlocked.includes(id);
}

export function pendingFeature(s: GameState): FeatureDef | null {
  return FEATURES.find((f) => !s.unlocked.includes(f.id) && featureReady(s, f)) ?? null;
}

export function migrateUnlocks(s: GameState, raw: unknown): Feature[] {
  if (Array.isArray(raw)) return FEATURE_IDS.filter((id) => raw.includes(id));
  if (s.stats.dynasties >= 1 || s.age > 0) return [...FEATURE_IDS];
  return FEATURES.filter((f) => featureReady(s, f)).map((f) => f.id);
}
