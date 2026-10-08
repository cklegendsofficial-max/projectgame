import { banditStrength, companionPower, heroPower, idleSoldiers, soldierPower, threatMult, winChance, type Material } from "./army";
import { ROUTES } from "./data";
import type { GameState } from "./state";

export type Rarity = 0 | 1 | 2;

export interface Trophy {
  id: string;
  rarity: Rarity;
}

export interface RegionDef {
  id: string;
  route: number;
  x: number;
  y: number;
  mat: Material;
  trophies: [string, string, string];
}

export const REGIONS: RegionDef[] = [
  { id: "fergana", route: 0, x: 0.925, y: 0.43, mat: "wood", trophies: ["tr_mane", "tr_peach", "tr_sogdseal"] },
  { id: "karakum", route: 1, x: 0.83, y: 0.75, mat: "leather", trophies: ["tr_venom", "tr_compass", "tr_bell"] },
  { id: "tianshan", route: 2, x: 0.81, y: 0.2, mat: "iron", trophies: ["tr_leopard", "tr_feather", "tr_jadeeye"] },
  { id: "horasan", route: 3, x: 0.635, y: 0.45, mat: "leather", trophies: ["tr_beads", "tr_staff", "tr_astrolabe"] },
  { id: "elburz", route: 4, x: 0.47, y: 0.6, mat: "iron", trophies: ["tr_poison", "tr_eaglekey", "tr_dagger"] },
  { id: "aras", route: 5, x: 0.36, y: 0.32, mat: "wood", trophies: ["tr_wolf", "tr_ember", "tr_ram"] },
  { id: "kapadokya", route: 6, x: 0.33, y: 0.63, mat: "wood", trophies: ["tr_stonekey", "tr_crystal", "tr_star"] },
  { id: "trakya", route: 7, x: 0.075, y: 0.35, mat: "iron", trophies: ["tr_solidus", "tr_greekfire", "tr_crown"] },
];

export const TROPHY_RARITY: Record<string, Rarity> = {};
export const TROPHY_REGION: Record<string, number> = {};
REGIONS.forEach((r, k) => r.trophies.forEach((id, j) => ((TROPHY_RARITY[id] = j as Rarity), (TROPHY_REGION[id] = k))));
export const TROPHY_IDS = REGIONS.flatMap((r) => r.trophies);

export const REGION_MAX = 10;
export const RAID_CD = 75_000;
export const TROPHY_BONUS = [0.01, 0.03, 0.08];
export const TROPHY_STACK = 5;
export const CONQUER_BONUS = 0.05;
export const NAM_STEP = 0.01;

export interface RegionState {
  open: boolean;
  lv: number;
  xp: number;
  at: number;
  youth: number;
  raids: number;
  quest: number;
}

export function freshRegion(): RegionState {
  return { open: false, lv: 1, xp: 0, at: 0, youth: 0, raids: 0, quest: 0 };
}

export function regionVisible(s: GameState, k: number): boolean {
  return s.regions[k].open || s.routes[REGIONS[k].route].owned > 0;
}

export function regionCost(k: number): number {
  return ROUTES[REGIONS[k].route].baseCost * 60;
}

export function xpNeed(lv: number): number {
  return 3 + lv * 2;
}

export function regionNeed(k: number, lv: number): number {
  return 5 + k * 3 + Math.floor(lv / 2) * 2;
}

export function regionFoe(s: GameState, k: number): number {
  const rg = s.regions[k];
  return banditStrength(s, REGIONS[k].route) * 3 * (1 + 0.35 * (rg.lv - 1)) * threatMult(s, regionNeed(k, rg.lv));
}

export function mercPower(s: GameState): number {
  return soldierPower(s) * 1.6;
}

export function raidPower(s: GameState): number {
  return (idleSoldiers(s) * soldierPower(s) + s.mercs * mercPower(s) + (s.hero ? heroPower(s) + companionPower(s) : 0)) * (1 + artBonus(s, "raid"));
}

export function raidOdds(s: GameState, k: number): number {
  return Math.min(0.95, winChance(Math.max(1, raidPower(s)), regionFoe(s, k)));
}

export function raidMats(s: GameState, k: number): number {
  return Math.round((6 + k * 4) * (1 + 0.2 * (s.regions[k].lv - 1)));
}

export type Weather = "clear" | "sand" | "rain";
export const WEATHER_MS = 4 * 60_000;
export const SAND_DROP = 0.3;
export const RAIN_YOUTH = 0.5;
export const RAIN_MOOD = 5;

export function weatherAt(now: number): Weather {
  const p = Math.floor(now / WEATHER_MS);
  const h = Math.abs(Math.sin(p * 12.9898 + 78.233) * 43758.5453) % 1;
  return h < 0.58 ? "clear" : h < 0.79 ? "sand" : "rain";
}

export function weatherEnds(now: number): number {
  return (Math.floor(now / WEATHER_MS) + 1) * WEATHER_MS;
}

export const DAY_MS = 12 * 60_000;
export const NIGHT_RAID = 0.25;

export function nightAmount(now: number): number {
  const c = -Math.cos(((now % DAY_MS) / DAY_MS) * Math.PI * 2);
  return Math.min(1, Math.max(0, (c - 0.15) / 0.6));
}

export function duskAmount(now: number): number {
  const c = Math.cos(((now % DAY_MS) / DAY_MS) * Math.PI * 2);
  return Math.max(0, 1 - Math.abs(c + 0.1) / 0.3);
}

export function isNight(now: number): boolean {
  return nightAmount(now) > 0.5;
}

export function raidGoldSec(s: GameState, k: number, now = Date.now()): number {
  return 25 * (1 + 0.15 * (s.regions[k].lv - 1)) * (1 + artBonus(s, "raidGold")) * (isNight(now) ? 1 + NIGHT_RAID : 1);
}

export function trophyChance(lv: number, rarity: Rarity): number {
  if (rarity === 0) return 0.22 + 0.02 * lv;
  if (rarity === 1) return lv >= 3 ? 0.05 + 0.012 * lv : 0;
  return lv >= 6 ? 0.012 + 0.005 * lv : 0;
}

export function rollTrophy(s: GameState, k: number, rnd = Math.random): string | null {
  const lv = s.regions[k].lv;
  const m = (1 + artBonus(s, "drop")) * (weatherAt(Date.now()) === "sand" ? 1 + SAND_DROP : 1);
  for (const j of [2, 1, 0] as Rarity[]) if (rnd() < trophyChance(lv, j) * m) return REGIONS[k].trophies[j];
  return null;
}

export function trophyMult(s: GameState): number {
  let b = 0;
  for (const [id, n] of Object.entries(s.trophies)) {
    const r = TROPHY_RARITY[id];
    if (r === undefined || n <= 0) continue;
    b += TROPHY_BONUS[r] * (1 + 0.25 * (Math.min(n, TROPHY_STACK) - 1));
  }
  for (let k = 0; k < REGIONS.length; k++) if (regionConquered(s, k)) b += CONQUER_BONUS;
  return 1 + b;
}

export function regionConquered(s: GameState, k: number): boolean {
  return REGIONS[k].trophies.every((id) => (s.trophies[id] ?? 0) > 0);
}

export function realmNam(s: GameState): number {
  return s.regions.reduce((a, r) => a + (r.open ? r.lv : 0), 0);
}

export interface TaxLevel {
  mult: number;
  mood: number;
}

export const TAXES: TaxLevel[] = [
  { mult: 0.9, mood: 88 },
  { mult: 1, mood: 66 },
  { mult: 1.2, mood: 40 },
  { mult: 1.4, mood: 14 },
];

export const MONTH_MS = 5 * 60_000;
export const REVOLT_MOOD = 25;
export const HAPPY_MOOD = 70;
export const REVOLT_MULT = 0.7;
export const HAPPY_MULT = 1.05;

export function provinceMult(s: GameState): number {
  let m = (1 + NAM_STEP * realmNam(s)) * trophyMult(s) * TAXES[s.tax].mult * (1 + artBonus(s, "income"));
  if (s.revolt >= 0) m *= REVOLT_MULT;
  else if (s.mood >= HAPPY_MOOD) m *= HAPPY_MULT;
  return m;
}

export function moodTick(s: GameState, dt: number): void {
  const rain = weatherAt(Date.now()) === "rain" ? RAIN_MOOD : 0;
  const target = Math.min(100, TAXES[s.tax].mood + artBonus(s, "mood") + rain) - (s.revolt >= 0 ? 10 : 0);
  const d = target - s.mood;
  s.mood += Math.sign(d) * Math.min(Math.abs(d), dt / 6);
}

export function youthCap(s: GameState, k: number): number {
  return 4 + 2 * s.regions[k].lv;
}

export function youthRate(s: GameState): number {
  if (s.revolt >= 0) return 0;
  return ((0.4 + (s.mood / 100) * 1.2) / 45) * (1 + artBonus(s, "youth")) * (weatherAt(Date.now()) === "rain" ? 1 + RAIN_YOUTH : 1);
}

export function youthTick(s: GameState, dt: number): void {
  const r = youthRate(s) * dt;
  if (r <= 0) return;
  s.regions.forEach((rg, k) => {
    if (rg.open) rg.youth = Math.min(youthCap(s, k), rg.youth + r);
  });
}

export function hireCost(income: number, s: GameState): number {
  return Math.max(40, income * 12) * (1 + s.mercs / 200);
}

export function wagePer(s: GameState, income: number): number {
  return Math.max(4, income * 3) * (1 - artBonus(s, "wage"));
}

export function monthWage(s: GameState, income: number): number {
  return s.mercs * wagePer(s, income);
}

export function artSpeedMult(s: GameState): number {
  return 1 + artBonus(s, "speed");
}

export function revoltFoe(s: GameState): number {
  const k = Math.max(0, s.revolt);
  return regionFoe(s, k) * 0.8;
}

export interface QuestStep {
  kind: "raids" | "level" | "legend";
  n: number;
  steel: number;
}

export const QUEST_STEPS: QuestStep[] = [
  { kind: "raids", n: 3, steel: 3 },
  { kind: "level", n: 4, steel: 6 },
  { kind: "raids", n: 15, steel: 10 },
  { kind: "level", n: 7, steel: 16 },
  { kind: "legend", n: 1, steel: 30 },
];

export function questDone(s: GameState, k: number): boolean {
  const rg = s.regions[k];
  const q = QUEST_STEPS[rg.quest];
  if (!q || !rg.open) return false;
  if (q.kind === "raids") return rg.raids >= q.n;
  if (q.kind === "level") return rg.lv >= q.n;
  return (s.trophies[REGIONS[k].trophies[2]] ?? 0) > 0;
}

export function questReward(k: number, step: number): number {
  return Math.round(QUEST_STEPS[step].steel * (1 + k * 0.25));
}

export type ArtKind = "speed" | "youth" | "drop" | "mood" | "raid" | "income" | "raidGold" | "wage";

export interface ArtifactDef {
  id: string;
  region: number;
  kind: ArtKind;
  value: number;
}

export const ARTIFACTS: ArtifactDef[] = [
  { id: "ar_saddle", region: 0, kind: "speed", value: 0.15 },
  { id: "ar_compass", region: 1, kind: "youth", value: 1 },
  { id: "ar_eye", region: 2, kind: "drop", value: 0.4 },
  { id: "ar_book", region: 3, kind: "mood", value: 15 },
  { id: "ar_shadow", region: 4, kind: "raid", value: 0.3 },
  { id: "ar_banner", region: 5, kind: "income", value: 0.2 },
  { id: "ar_map", region: 6, kind: "raidGold", value: 1 },
  { id: "ar_ring", region: 7, kind: "wage", value: 0.4 },
];
export const ART_BY_ID: Record<string, ArtifactDef> = Object.fromEntries(ARTIFACTS.map((a) => [a.id, a]));
export const ART_SLOTS = 2;

export interface ArtCost {
  common: number;
  rare: number;
  steel: number;
}

export function artCost(a: ArtifactDef): ArtCost {
  return { common: 3, rare: 1, steel: 20 + a.region * 10 };
}

export function canForgeArt(s: GameState, a: ArtifactDef): boolean {
  if (s.artifacts.includes(a.id)) return false;
  const [c, r, l] = REGIONS[a.region].trophies;
  const cost = artCost(a);
  return (s.trophies[l] ?? 0) > 0 && (s.trophies[c] ?? 0) > cost.common && (s.trophies[r] ?? 0) > cost.rare && s.mats.steel >= cost.steel;
}

export function forgeArt(s: GameState, a: ArtifactDef): boolean {
  if (!canForgeArt(s, a)) return false;
  const [c, r] = REGIONS[a.region].trophies;
  const cost = artCost(a);
  s.trophies[c] -= cost.common;
  s.trophies[r] -= cost.rare;
  s.mats.steel -= cost.steel;
  s.artifacts.push(a.id);
  if (s.artEquip.length < ART_SLOTS) s.artEquip.push(a.id);
  return true;
}

export function artBonus(s: GameState, kind: ArtKind): number {
  let b = 0;
  for (const id of s.artEquip) {
    const a = ART_BY_ID[id];
    if (a && a.kind === kind) b += a.value;
  }
  return b;
}

export const RAID_THREAT_MS = 120_000;

export interface Incursion {
  k: number;
  rival: number;
  until: number;
}

export function incursionFoe(s: GameState, k: number): number {
  return regionFoe(s, k) * 1.15;
}

export function incursionOdds(s: GameState, k: number): number {
  return Math.min(0.95, winChance(Math.max(1, raidPower(s)), incursionFoe(s, k)));
}

export function nextIncursionDelay(rnd = Math.random): number {
  return (6 + rnd() * 5) * 60_000;
}

export function raidLosses(mercs: number): number {
  return Math.floor(mercs * 0.15);
}

export function anyRegionAction(s: GameState, now: number): boolean {
  return s.revolt >= 0 || !!s.incursion || ARTIFACTS.some((a) => canForgeArt(s, a)) || s.regions.some((rg, k) => rg.open && (now >= rg.at || rg.youth >= 1 || questDone(s, k)));
}
