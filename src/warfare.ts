import { banditStrength, companionPower, heroPower, rollLoot, soldierPower, takeCasualties, threatMult, winChance, type Material, type Mats } from "./army";
import { tk } from "./i18n";
import type { GameState } from "./state";

export interface Nemesis {
  id: number;
  epithet: number;
  name: string;
  look: number;
  route: number;
  level: number;
  wins: number;
  calm?: number;
}

export const MAX_NEMESES = 3;
export const MAX_NEMESIS_LEVEL = 10;
export const NEMESIS_LOOKS = 6;
export const NEMESIS_EPITHETS = 8;
export const NEMESIS_TAUNTS = 6;
const MALE_NAMES = ["Temür", "Sancar", "Bayram", "Yusuf", "Kutluğ", "Ilyas", "Bozdoğan", "Tokuz", "Arslan", "Kubad", "Yağıbasan", "Esen"];
const FEMALE_NAMES = ["Gülbahar", "Saba", "Zerrin", "Tomris", "Ayçiçek"];

export function nemesisName(n: Nemesis): string {
  return `${tk("nemEp_" + n.epithet)} ${n.name}`;
}

export function nemesisOn(s: GameState, route: number): Nemesis | undefined {
  return s.nemeses.find((n) => n.route === route);
}

export function nemesisById(s: GameState, id: number | undefined): Nemesis | undefined {
  return id === undefined ? undefined : s.nemeses.find((n) => n.id === id);
}

export function spawnNemesis(s: GameState, route: number): Nemesis | null {
  if (s.nemeses.length >= MAX_NEMESES || nemesisOn(s, route)) return null;
  const usedLooks = new Set(s.nemeses.map((n) => n.look));
  const looks = Array.from({ length: NEMESIS_LOOKS }, (_, k) => k).filter((k) => !usedLooks.has(k));
  const look = looks[Math.floor(Math.random() * looks.length)] ?? 0;
  const pool = look === 3 ? FEMALE_NAMES : MALE_NAMES;
  const usedNames = new Set(s.nemeses.map((n) => n.name));
  const names = pool.filter((n) => !usedNames.has(n));
  const n: Nemesis = {
    id: ++s.nemesisSeq,
    epithet: Math.floor(Math.random() * NEMESIS_EPITHETS),
    name: names[Math.floor(Math.random() * names.length)] ?? pool[0],
    look,
    route,
    level: 1 + Math.min(4, s.age),
    wins: 0,
  };
  s.nemeses.push(n);
  return n;
}

export function nemesisStrengthMult(n: Nemesis): number {
  return 2.5 + 0.6 * n.level;
}

export function nemesisStrength(s: GameState, n: Nemesis): number {
  return banditStrength(s, n.route) * nemesisStrengthMult(n);
}

export interface FortDef {
  id: string;
  route: number;
  mult: number;
  x: number;
  y: number;
}

export const FORTS: FortDef[] = [
  { id: "kizilkum", route: 1, mult: 6, x: 0.835, y: 0.585 },
  { id: "kopet", route: 3, mult: 8, x: 0.66, y: 0.8 },
  { id: "alamut", route: 5, mult: 10, x: 0.41, y: 0.66 },
  { id: "toros", route: 7, mult: 12, x: 0.275, y: 0.75 },
];
export const FORT_WAVES = 6;
export const FORT_WALLS = 4;
export const WAVE_MS = 7000;
export const FORT_PROFIT = 1.15;

export interface Siege {
  fort: string;
  troops: number;
  hero: boolean;
  walls: number;
  wave: number;
  next: number;
  log: number[];
}

export function fortDef(id: string): FortDef | undefined {
  return FORTS.find((f) => f.id === id);
}

export function fortAvailable(s: GameState, f: FortDef): boolean {
  return s.routes[f.route]?.owned > 0;
}

export function fortTaken(s: GameState, id: string): boolean {
  return s.fortsTaken.includes(id);
}

export function fortStrength(s: GameState, f: FortDef): number {
  return banditStrength(s, f.route) * f.mult * threatMult(s, 5 + FORTS.indexOf(f) * 5);
}

export function siegePower(s: GameState, troops: number, hero: boolean): number {
  return troops * soldierPower(s) + (hero ? heroPower(s) + companionPower(s) : 0);
}

export function routeProtected(s: GameState, route: number): boolean {
  return FORTS.some((f) => fortTaken(s, f.id) && (route === f.route || route === f.route - 1));
}

export function fortRouteMult(s: GameState, route: number): number {
  return routeProtected(s, route) ? FORT_PROFIT : 1;
}

export function siegeOdds(s: GameState, f: FortDef, troops: number, hero: boolean): number {
  const p = winChance(siegePower(s, troops, hero), fortStrength(s, f));
  let total = 0;
  const comb = (n: number, k: number) => {
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return r;
  };
  for (let k = FORT_WALLS; k <= FORT_WAVES; k++) total += comb(FORT_WAVES, k) * Math.pow(p, k) * Math.pow(1 - p, FORT_WAVES - k);
  return total;
}

export function startSiege(s: GameState, f: FortDef, troops: number, now: number): void {
  s.siege = { fort: f.id, troops, hero: !!s.hero, walls: FORT_WALLS, wave: 0, next: now + WAVE_MS, log: [] };
}

export interface WaveResult {
  hit: boolean;
  lost: number;
  done: "taken" | "failed" | null;
}

export function siegeWave(s: GameState): WaveResult | null {
  const sg = s.siege;
  const f = sg && fortDef(sg.fort);
  if (!sg || !f) return null;
  const power = siegePower(s, sg.troops, sg.hero);
  const def = fortStrength(s, f);
  const hit = power > 0 && Math.random() < winChance(power, def);
  const share = def / (power + def);
  const lost = Math.min(sg.troops, Math.round(sg.troops * 0.1 * share + (Math.random() < share ? 1 : 0)));
  sg.troops -= lost;
  takeCasualties(s, lost);
  sg.wave++;
  sg.log.push(hit ? 1 : 0);
  if (hit) sg.walls--;
  sg.next += WAVE_MS;
  let done: WaveResult["done"] = null;
  if (sg.walls <= 0) done = "taken";
  else if (sg.wave >= FORT_WAVES || sg.walls > FORT_WAVES - sg.wave || sg.troops <= 0) done = "failed";
  return { hit, lost, done };
}

export function fortLoot(s: GameState, f: FortDef): Partial<Mats> {
  const k = FORTS.indexOf(f);
  const { loot } = rollLoot(f.route, 6);
  loot.steel = (loot.steel ?? 0) + 3 + 2 * k;
  for (const [m, n] of Object.entries(loot) as [Material, number][]) s.mats[m] += n;
  return loot;
}

export interface ArenaState {
  rating: number;
  tickets: number;
  ticketAt: number;
  week: number;
  wins: number;
  losses: number;
  titles: number;
  bestRank: number;
}

export const MAX_TICKETS = 5;
export const TICKET_MS = 12 * 60_000;
const WEEK_MS = 7 * 86_400_000;
const WEEK_EPOCH = Date.UTC(2024, 0, 1);
const GHOST_NAMES = [
  "Bozkurt_34",
  "Kervancı61",
  "SilkQueen",
  "Timur1370",
  "Atabey",
  "İpekyolu_Kurdu",
  "DesertFox",
  "Han_Kubilay",
  "Leyla_K",
  "Sogdian99",
  "AltınOrda",
  "Yabgu",
  "Venedikli",
  "Kashgari",
  "BayanTegin",
  "SemerkantŞahı",
  "MarcoP",
  "Turan_Beyi",
  "Saffron",
  "Kızılbaş",
];

export function freshArena(now: number): ArenaState {
  return { rating: 1000, tickets: MAX_TICKETS, ticketAt: now, week: weekIndex(now), wins: 0, losses: 0, titles: 0, bestRank: 0 };
}

export function weekIndex(now: number): number {
  return Math.floor((now - WEEK_EPOCH) / WEEK_MS);
}

export function weekLeft(now: number): number {
  return WEEK_EPOCH + (weekIndex(now) + 1) * WEEK_MS - now;
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function arenaPower(s: GameState): number {
  return heroPower(s) + companionPower(s);
}

export interface Ghost {
  name: string;
  rating: number;
  look: number;
  me?: boolean;
}

export function leaderboard(s: GameState, now: number): Ghost[] {
  const wk = weekIndex(now);
  const r = rng(wk * 7919 + 13);
  const progress = 1 - weekLeft(now) / WEEK_MS;
  const names = [...GHOST_NAMES];
  const out: Ghost[] = [];
  for (let k = 0; k < 11; k++) {
    const name = names.splice(Math.floor(r() * names.length), 1)[0];
    const base = 950 + r() * 700;
    out.push({ name, rating: Math.round(base + progress * r() * 420), look: Math.floor(r() * 6) });
  }
  out.push({ name: s.hero?.name ?? "?", rating: Math.round(s.arena.rating), look: s.hero?.look ?? 0, me: true });
  return out.sort((a, b) => b.rating - a.rating);
}

export function arenaRank(s: GameState, now: number): number {
  return leaderboard(s, now).findIndex((g) => g.me) + 1;
}

export interface Opponent extends Ghost {
  power: number;
  tier: number;
}

const OPP_POWER = [0.72, 1, 1.32];
const OPP_RATING = [-110, 0, 140];
export const ARENA_GAIN = [14, 22, 32];
export const ARENA_LOSS = [14, 10, 6];
export const ARENA_STEEL = [1, 2, 3];

export function opponents(s: GameState, now: number): Opponent[] {
  const r = rng(weekIndex(now) * 104729 + (s.arena.wins + s.arena.losses) * 31 + 7);
  const my = arenaPower(s);
  return OPP_POWER.map((pm, tier) => ({
    name: GHOST_NAMES[Math.floor(r() * GHOST_NAMES.length)],
    rating: Math.max(800, Math.round(s.arena.rating + OPP_RATING[tier] + (r() - 0.5) * 40)),
    look: Math.floor(r() * 6),
    power: my * pm * (0.92 + r() * 0.16),
    tier,
  }));
}

export function arenaTickets(s: GameState, now: number): void {
  const a = s.arena;
  if (a.tickets >= MAX_TICKETS) {
    a.ticketAt = now;
    return;
  }
  const n = Math.floor((now - a.ticketAt) / TICKET_MS);
  if (n > 0) {
    a.tickets = Math.min(MAX_TICKETS, a.tickets + n);
    a.ticketAt += n * TICKET_MS;
  }
}

export function seasonReward(rank: number): number {
  return rank === 1 ? 25 : rank <= 3 ? 15 : rank <= 10 ? 6 : 2;
}

export function closeSeason(s: GameState, now: number): { rank: number; steel: number } | null {
  const wk = weekIndex(now);
  if (s.arena.week === wk) return null;
  const prevNow = WEEK_EPOCH + (s.arena.week + 1) * WEEK_MS - 1;
  const played = s.arena.wins + s.arena.losses > 0;
  const rank = played ? arenaRank(s, prevNow) : 0;
  s.arena.week = wk;
  s.arena.rating = 1000 + (s.arena.rating - 1000) * 0.5;
  if (!played) return null;
  if (rank === 1) s.arena.titles++;
  if (!s.arena.bestRank || rank < s.arena.bestRank) s.arena.bestRank = rank;
  const steel = seasonReward(rank);
  s.mats.steel += steel;
  return { rank, steel };
}

export function protectedOrNemesisRoutes(s: GameState, owned: number[]): number[] {
  return owned.filter((i) => !routeProtected(s, i) || nemesisOn(s, i));
}