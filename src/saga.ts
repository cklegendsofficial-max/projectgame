import { banditStrength, heroPower, idleSoldiers, soldierPower, winChance } from "./army";
import { SPY_SABOTAGE, WEEK_MS, weekOf, weekProgress } from "./perks";
import type { GameState } from "./state";

export interface TradeWar {
  route: number;
  rival: number;
  until: number;
  won: boolean;
}

export const TW_RIVALS = 6;
export const TW_PENALTY = 0.6;
export const TW_BONUS = 1.5;
export const TW_MS = 6 * 60_000;
export const TW_WIN_MS = 10 * 60_000;
export const TW_UNDERCUT_ODDS = 0.7;

export function tradeWarMult(s: GameState, i: number, now: number): number {
  const w = s.tradeWar;
  if (!w || w.route !== i || w.until <= now) return 1;
  return w.won ? TW_BONUS : TW_PENALTY;
}

export function tradeWarActive(s: GameState, now: number): TradeWar | null {
  return s.tradeWar && s.tradeWar.until > now ? s.tradeWar : null;
}

export function startTradeWar(s: GameState, now: number): TradeWar | null {
  const owned = s.routes.map((r, i) => (r.owned > 0 ? i : -1)).filter((i) => i >= 0);
  if (owned.length === 0) return null;
  const route = owned[Math.floor(Math.random() * owned.length)];
  s.tradeWar = { route, rival: Math.floor(Math.random() * TW_RIVALS), until: now + TW_MS, won: false };
  return s.tradeWar;
}

export function undercutCost(income: number): number {
  return Math.max(500, income * 90);
}

export function sabotageStrength(s: GameState, route: number): number {
  return banditStrength(s, route) * 10;
}

export function sabotageOdds(s: GameState, route: number): number {
  return Math.min(0.97, winChance(idleSoldiers(s) * soldierPower(s) + (s.hero ? heroPower(s) : 0), sabotageStrength(s, route)) + SPY_SABOTAGE * s.spies);
}

export const SEASON_STEPS = [40, 100, 180, 280, 400];
export const SEASON_PTS = { contract: 10, titan: 20, nemesis: 12, fort: 25, duel: 3, bandit: 1, tradewar: 15, raid: 6, migrate: 2, han: 8, war: 12, ally: 5, expedition: 20, bazaar: 2, region: 3 } as const;
export type SeasonSource = keyof typeof SEASON_PTS;

export interface SeasonState {
  week: number;
  pts: number;
  claimed: number;
  guildClaimed: number;
}

export function freshSeason(now: number): SeasonState {
  return { week: weekOf(now), pts: 0, claimed: 0, guildClaimed: 0 };
}

export function rollSeason(s: GameState, now: number): boolean {
  const wk = weekOf(now);
  if (s.season.week === wk) return false;
  s.season = freshSeason(now);
  return true;
}

export function addSeasonPts(s: GameState, src: SeasonSource, now: number): number {
  rollSeason(s, now);
  const n = SEASON_PTS[src];
  s.season.pts += n;
  return n;
}

export function seasonStepReady(s: GameState): boolean {
  return s.season.claimed < SEASON_STEPS.length && s.season.pts >= SEASON_STEPS[s.season.claimed];
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

const GUILD_MEMBERS = ["Ahi Evran", "Sogdian99", "MarcoP", "Nasreddin", "BilgeKağan", "Rabia_H", "Tomris", "IbnBattuta", "Kutadgu"];
export const GUILD_TIERS = [900, 1800, 2900];

export interface GuildMember {
  name: string;
  pts: number;
  look: number;
  me?: boolean;
}

export function guildMembers(s: GameState, now: number): GuildMember[] {
  const r = rng(weekOf(now) * 104729 + 7);
  const p = Math.min(1, weekProgress(now) + 0.02);
  const out: GuildMember[] = GUILD_MEMBERS.map((name) => ({ name, look: Math.floor(r() * 6), pts: Math.round((15 + r() * 40) * 7 * Math.pow(p, 0.9)) }));
  out.push({ name: s.hero?.name ?? "?", pts: s.season.pts, look: s.hero?.look ?? 0, me: true });
  return out.sort((a, b) => b.pts - a.pts);
}

export function guildTotal(s: GameState, now: number): number {
  return guildMembers(s, now).reduce((a, m) => a + m.pts, 0);
}

export function guildTierReady(s: GameState, now: number): boolean {
  return s.season.guildClaimed < GUILD_TIERS.length && guildTotal(s, now) >= GUILD_TIERS[s.season.guildClaimed];
}

export function seasonLeft(now: number): number {
  return (1 - weekProgress(now)) * WEEK_MS;
}

export interface FallenHero {
  name: string;
  look: number;
  level: number;
  gen: number;
  foe: string;
}

export const DEATH_MIN_LEVEL = 8;
export const DEATH_CHANCE = 0.08;

export function heroMayFall(s: GameState): boolean {
  return !!s.hero && s.hero.level >= DEATH_MIN_LEVEL && Math.random() < DEATH_CHANCE;
}

export const BARD_EVENTS = ["titanUp", "titanDown", "fort", "nemesis", "relic", "fallen", "age", "tradeWin", "season", "wedding", "han", "raid", "spy", "fest", "warWon", "ally", "expBoss", "decree", "conquer", "revolt", "legend", "forged"] as const;
export type BardEvent = (typeof BARD_EVENTS)[number];
export const BARD_VARIANTS = 2;

export interface SagaEntry {
  ev: BardEvent;
  v: number;
  vars: Record<string, string | number>;
  gen: number;
  at: number;
}
export const MAX_SAGA = 60;

export interface RaidState {
  week: number;
  dmg: number;
  hits: number;
  tickets: number;
  ticketAt: number;
  claimed: number;
}

export const RAID_TIERS = [0.25, 0.5, 0.75, 1];
export const RAID_TICKETS = 3;
export const RAID_TICKET_MS = 20 * 60_000;
const RAID_GHOST_SHARE = 0.62;

export function freshRaid(now: number): RaidState {
  return { week: weekOf(now), dmg: 0, hits: 0, tickets: RAID_TICKETS, ticketAt: now, claimed: 0 };
}

export function rollRaid(s: GameState, now: number): boolean {
  let changed = false;
  if (s.raid.week !== weekOf(now)) {
    s.raid = freshRaid(now);
    changed = true;
  }
  const r = s.raid;
  if (r.tickets >= RAID_TICKETS) r.ticketAt = now;
  else if (now - r.ticketAt >= RAID_TICKET_MS) {
    const n = Math.floor((now - r.ticketAt) / RAID_TICKET_MS);
    r.tickets = Math.min(RAID_TICKETS, r.tickets + n);
    r.ticketAt += n * RAID_TICKET_MS;
    changed = true;
  }
  return changed;
}

export function raidHit(s: GameState): number {
  const power = s.soldiers * soldierPower(s) + (s.hero ? heroPower(s) : 0);
  return 0.018 + Math.min(0.03, 0.0035 * Math.log10(1 + power));
}

export interface RaidMember {
  name: string;
  look: number;
  dmg: number;
  me?: boolean;
}

export function raidMembers(s: GameState, now: number): RaidMember[] {
  const r = rng(weekOf(now) * 7919 + 13);
  const w = GUILD_MEMBERS.map(() => 0.4 + r());
  const sum = w.reduce((a, b) => a + b, 0);
  const total = RAID_GHOST_SHARE * Math.pow(Math.min(1, weekProgress(now) + 0.01), 0.9);
  const out: RaidMember[] = GUILD_MEMBERS.map((name, i) => ({ name, look: Math.floor(r() * 6), dmg: (total * w[i]) / sum }));
  out.push({ name: s.hero?.name ?? "?", look: s.hero?.look ?? 0, dmg: s.raid.dmg, me: true });
  return out.sort((a, b) => b.dmg - a.dmg);
}

export function raidTotal(s: GameState, now: number): number {
  return Math.min(1, raidMembers(s, now).reduce((a, m) => a + m.dmg, 0));
}

export function raidTierReady(s: GameState, now: number): boolean {
  return s.raid.claimed < RAID_TIERS.length && raidTotal(s, now) >= RAID_TIERS[s.raid.claimed];
}
