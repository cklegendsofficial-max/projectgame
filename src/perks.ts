import type { GameState } from "./state";

export type PerkKind = "profit" | "speed" | "loot" | "offline" | "power" | "army" | "bounty" | "recruit" | "xp" | "titan" | "casualty";

export const PATHS = ["ahi", "ocak", "divan"] as const;
export type PathId = (typeof PATHS)[number];

export const PATH_ICON: Record<PathId, string> = { ahi: "f_ahi", ocak: "f_ocak", divan: "f_divan" };

export const PERKS: Record<PathId, { kind: PerkKind; v: number }[]> = {
  ahi: [
    { kind: "profit", v: 0.05 },
    { kind: "speed", v: 0.05 },
    { kind: "loot", v: 0.3 },
    { kind: "offline", v: 2 },
    { kind: "profit", v: 0.15 },
  ],
  ocak: [
    { kind: "power", v: 0.1 },
    { kind: "army", v: 0.15 },
    { kind: "bounty", v: 0.4 },
    { kind: "casualty", v: 0.3 },
    { kind: "army", v: 0.3 },
  ],
  divan: [
    { kind: "xp", v: 0.3 },
    { kind: "titan", v: 0.25 },
    { kind: "recruit", v: 0.25 },
    { kind: "offline", v: 3 },
    { kind: "titan", v: 0.5 },
  ],
};
export const PERK_COST = [1, 2, 3, 4, 5];
export const OATH_BREAK_STEEL = 20;

export interface Allegiance {
  path: PathId | null;
  rank: number;
}

export function favorPoints(s: GameState): number {
  return 2 * s.stats.dynasties + s.stats.titans + s.stats.forts + 2 * s.arena.titles + Math.floor(s.stats.nemesisSlain / 2) + Math.floor(s.stats.tradeWars / 2);
}

export function favorSpent(s: GameState): number {
  let n = 0;
  for (let k = 0; k < s.allegiance.rank; k++) n += PERK_COST[k];
  return n;
}

export function favorFree(s: GameState): number {
  return favorPoints(s) - favorSpent(s);
}

export function nextPerkCost(s: GameState): number | null {
  return s.allegiance.path && s.allegiance.rank < PERK_COST.length ? PERK_COST[s.allegiance.rank] : null;
}

export const SEASON_EVENTS = [
  { id: "silk", icon: "ev_silk", kind: "profit", v: 0.25 },
  { id: "horn", icon: "ev_horn", kind: "bounty", v: 1 },
  { id: "iron", icon: "ev_iron", kind: "loot", v: 0.5 },
  { id: "storm", icon: "ev_storm", kind: "titan", v: 0.3 },
] as const;
export type SeasonEvent = (typeof SEASON_EVENTS)[number];

export const WEEK_MS = 7 * 86_400_000;
const WEEK_EPOCH = Date.UTC(2024, 0, 1);

export function weekOf(now: number): number {
  return Math.floor((now - WEEK_EPOCH) / WEEK_MS);
}

export function weekProgress(now: number): number {
  return (now - WEEK_EPOCH) / WEEK_MS - weekOf(now);
}

export function seasonEvent(now: number): SeasonEvent {
  return SEASON_EVENTS[((weekOf(now) % SEASON_EVENTS.length) + SEASON_EVENTS.length) % SEASON_EVENTS.length];
}

export const LEGACY_BONUS = 0.02;
export const MAX_LEGACY = 15;

export function legacyBonus(s: GameState): number {
  return LEGACY_BONUS * Math.min(MAX_LEGACY, s.fallenHeroes.length);
}

export const HOUSES = [
  { id: "seljuk", kind: "profit", v: 0.12, bride: "Gevher Nesibe" },
  { id: "karakhanid", kind: "speed", v: 0.1, bride: "Ayaz Hatun" },
  { id: "byzantine", kind: "offline", v: 3, bride: "Maria Palaiologina" },
  { id: "mongol", kind: "army", v: 0.2, bride: "Börte" },
  { id: "persian", kind: "xp", v: 0.4, bride: "Şirin" },
  { id: "tang", kind: "loot", v: 0.5, bride: "Wencheng" },
  { id: "khwarazm", kind: "bounty", v: 0.5, bride: "Terken Hatun" },
  { id: "genoa", kind: "recruit", v: 0.3, bride: "Bianca" },
] as const;
export type HouseId = (typeof HOUSES)[number]["id"];
export const HOUSE_IDS = HOUSES.map((h) => h.id) as HouseId[];
export const BLOOD_SHARE = 0.25;
export const MAX_BLOOD = 12;

export function houseDef(id: HouseId) {
  return HOUSES.find((h) => h.id === id)!;
}

export function houseOffers(gen: number): HouseId[] {
  const ids = HOUSE_IDS.slice();
  let a = (gen * 2654435761) >>> 0;
  for (let i = ids.length - 1; i > 0; i--) {
    a = (Math.imul(a ^ (a >>> 13), 1274126177) + 0x9e3779b9) >>> 0;
    const j = a % (i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 3);
}

export function marriageBonus(s: GameState, kind: PerkKind): number {
  let v = 0;
  if (s.spouse) {
    const h = houseDef(s.spouse);
    if (h.kind === kind) v += h.v;
  }
  for (const id of s.bloodline) {
    const h = houseDef(id);
    if (h.kind === kind) v += h.v * BLOOD_SHARE;
  }
  return v;
}

export type Camp = "yayla" | "kislak";
export const CAMP_BONUS = 0.15;
// Must match world.ts SEASON_MS and season order (spring, summer, autumn, winter).
const CAMP_SEASON_MS = 4 * 60_000;

export function campSeasonIndex(now: number): number {
  return Math.floor(now / CAMP_SEASON_MS);
}

export function campWanted(now: number): Camp {
  return campSeasonIndex(now) % 4 < 2 ? "yayla" : "kislak";
}

export function campBonus(s: GameState, now: number): number {
  return s.camp && s.camp === campWanted(now) ? CAMP_BONUS : 0;
}

export const SPY_STEEL = [5, 10, 20, 30, 45];
export const SPY_MAX = SPY_STEEL.length;
export const SPY_FOIL = 0.12;
export const SPY_SABOTAGE = 0.05;
export const SPY_TITAN = 0.04;

export function sagaBonus(s: GameState, kind: PerkKind): number {
  let v = marriageBonus(s, kind);
  if (kind === "titan") v += SPY_TITAN * s.spies;
  const a = s.allegiance;
  if (a.path) {
    const list = PERKS[a.path];
    for (let k = 0; k < a.rank && k < list.length; k++) if (list[k].kind === kind) v += list[k].v;
  }
  const now = Date.now();
  const ev = seasonEvent(now);
  if (ev.kind === kind) v += ev.v;
  const fest = activeFestival(now);
  if (fest && fest.kind === kind) v += fest.v;
  if (kind === "profit") v += legacyBonus(s) + campBonus(s, now);
  return v;
}

export type FestKind = Extract<PerkKind, "profit" | "loot" | "bounty" | "speed" | "offline">;

export const FESTIVALS: { id: string; m: number; d: number; len: number; kind: FestKind; v: number }[] = [  { id: "nevruz", m: 3, d: 20, len: 4, kind: "profit", v: 0.5 },
  { id: "hidrellez", m: 5, d: 5, len: 3, kind: "loot", v: 1 },
  { id: "kirkpinar", m: 7, d: 1, len: 7, kind: "bounty", v: 1 },
  { id: "panayir", m: 10, d: 1, len: 10, kind: "speed", v: 0.2 },
  { id: "yelda", m: 12, d: 20, len: 4, kind: "offline", v: 3 },
];
export type Festival = (typeof FESTIVALS)[number];

function festStart(f: Festival, year: number): number {
  return new Date(year, f.m - 1, f.d).getTime();
}

export function activeFestival(now: number): Festival | null {
  const y = new Date(now).getFullYear();
  for (const f of FESTIVALS) {
    const a = festStart(f, y);
    if (now >= a && now < a + f.len * 86_400_000) return f;
  }
  return null;
}

export function festivalEnds(f: Festival, now: number): number {
  return festStart(f, new Date(now).getFullYear()) + f.len * 86_400_000;
}

export function nextFestival(now: number): { f: Festival; at: number } {
  const y = new Date(now).getFullYear();
  let best: { f: Festival; at: number } | null = null;
  for (const f of FESTIVALS) {
    for (const yy of [y, y + 1]) {
      const at = festStart(f, yy);
      if (at > now && (!best || at < best.at)) best = { f, at };
    }
  }
  return best!;
}

export function festivalKey(f: Festival, now: number): string {
  return `${f.id}-${new Date(now).getFullYear()}`;
}
