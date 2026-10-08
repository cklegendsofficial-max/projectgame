import type { Counters } from "./state";

export interface DailyTask {
  key: keyof Counters;
  need: number;
  base: number;
  done: boolean;
}

export interface Daily {
  date: string;
  tasks: DailyTask[];
  chest: boolean;
  streak: number;
  last: string;
}

export const DAILY_POOL: { key: keyof Counters; what: string; icon: string; need: (lv: number) => number; lv?: number }[] = [
  { key: "floors", what: "kat Kurgan Derinliklerinde in", icon: "ruh", need: (lv) => 3 + Math.floor(lv / 10), lv: 8 },
  { key: "wins", what: "harami çetesi yen", icon: "j_bandit", need: (lv) => 3 + Math.floor(lv / 6) },
  { key: "camps", what: "kamp yık", icon: "map/camp", need: () => 1 },
  { key: "kurgans", what: "Kurgan Taşı yık", icon: "map/kurgan", need: () => 1 },
  { key: "crafted", what: "atölyede eşya üret", icon: "anvil", need: () => 2 },
  { key: "sides", what: "şehir görevi tamamla", icon: "quest", need: () => 2 },
  { key: "profit", what: "altın ticaret kârı yap", icon: "coins", need: (lv) => 300 + lv * 60 },
  { key: "rescued", what: "saldırıya uğrayan kervanı kurtar", icon: "j_caravan", need: () => 1 },
  { key: "trains", what: "talim yap", icon: "arena", need: () => 3 },
  { key: "contracts", what: "kervan emaneti teslim et", icon: "seal", need: () => 1 },
];

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function yesterday(): string {
  const d = new Date(Date.now() - 86400000);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
