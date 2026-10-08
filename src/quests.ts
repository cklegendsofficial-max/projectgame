import { companionPower, heroPower, soldierPower } from "./army";
import { sagaBonus } from "./perks";
import type { GameState } from "./state";

export const CONTRACT_KINDS = ["bandits", "merchants", "stories", "forge", "recruit", "duel", "nemesis", "titan"] as const;
export type ContractKind = (typeof CONTRACT_KINDS)[number];

export interface Contract {
  kind: ContractKind;
  n: number;
  base: number;
  claimed: boolean;
}

export interface ContractBoard {
  day: string;
  list: Contract[];
  bonus: boolean;
}

const TARGET: Record<ContractKind, number> = { bandits: 6, merchants: 2, stories: 2, forge: 3, recruit: 50, duel: 3, nemesis: 1, titan: 1 };

export function contractValue(s: GameState, k: ContractKind): number {
  switch (k) {
    case "bandits":
      return s.stats.bandits;
    case "merchants":
      return s.stats.merchants;
    case "stories":
      return s.stats.stories;
    case "forge":
      return s.stats.crafted + s.stats.enchants + s.stats.plusTries;
    case "recruit":
      return s.stats.recruited;
    case "duel":
      return s.arena.wins;
    case "nemesis":
      return s.stats.nemesisSlain;
    case "titan":
      return s.stats.titans;
  }
}

export function dayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function refreshContracts(s: GameState, now: number): boolean {
  const day = dayKey(now);
  if (s.contracts.day === day) return false;
  const pool = CONTRACT_KINDS.filter((k) => (k !== "nemesis" || s.nemeses.length > 0) && (k !== "duel" || !!s.hero) && (k !== "titan" || !!s.hero));
  const list: Contract[] = [];
  while (list.length < 3 && pool.length > 0) {
    const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    list.push({ kind: k, n: TARGET[k], base: contractValue(s, k), claimed: false });
  }
  s.contracts = { day, list, bonus: false };
  return true;
}

export function contractProgress(s: GameState, c: Contract): number {
  return Math.min(c.n, Math.max(0, contractValue(s, c.kind) - c.base));
}

export function contractReady(s: GameState, c: Contract): boolean {
  return !c.claimed && contractProgress(s, c) >= c.n;
}

export const CONTRACT_STEEL = 3;

export interface Titan {
  hp: number;
  max: number;
  until: number;
  level: number;
}

export const TITAN_MS = 45_000;
export const TITAN_POS = { x: 0.62, y: 0.3 };

export function tapDamage(s: GameState): number {
  return (heroPower(s) + companionPower(s)) * (1 + sagaBonus(s, "titan"));
}

export function titanDps(s: GameState): number {
  return s.soldiers * soldierPower(s) * 0.04 * (1 + sagaBonus(s, "titan"));
}

export function spawnTitan(s: GameState, now: number): Titan {
  const lv = s.stats.titans;
  const k = 1 + sagaBonus(s, "titan");
  const max = Math.round(((tapDamage(s) / k) * 38 + (titanDps(s) / k) * 22) * (1 + 0.15 * lv));
  s.titan = { hp: max, max, until: now + TITAN_MS, level: lv + 1 };
  return s.titan;
}

export const LETTER_KINDS = ["ransom", "challenge", "taunt"] as const;
export type LetterKind = (typeof LETTER_KINDS)[number];
export const LETTER_VARIANTS = 3;
export const CALM_MS = 15 * 60_000;
