import type { Counters } from "./state";
import type { CompMods } from "./story";

export const WEEK_MS = 7 * 864e5;
const EPOCH = Date.UTC(2024, 0, 1);

export const weekId = (now = Date.now()): number => Math.floor((now - EPOCH) / WEEK_MS);
export const weekEnd = (id: number): number => EPOCH + (id + 1) * WEEK_MS;
export const weekFrac = (id: number, now = Date.now()): number => Math.min(1, Math.max(0, (now - (EPOCH + id * WEEK_MS)) / WEEK_MS));

export interface WeekTheme {
  id: string;
  name: string;
  en: string;
  icon: string;
  desc: string;
  descEn: string;
  score: Partial<Record<keyof Counters, number>>;
  mods: Partial<CompMods>;
}

export const WEEK_THEMES: WeekTheme[] = [
  { id: "tuccar", name: "Tüccarlar Haftası", en: "Merchants' Week", icon: "coins", desc: "Ticaret kârı, kervan emaneti ve kurtarılan kervanlar puan getirir.", descEn: "Trade profit, consignments and rescued caravans score points.", score: { profit: 0.1, contracts: 40, rescued: 30 }, mods: { trade: 0.03 } },
  { id: "akinci", name: "Akıncılar Haftası", en: "Raiders' Week", icon: "j_bandit", desc: "Yenilen haramiler, yıkılan kamplar ve can düşmanları puan getirir.", descEn: "Defeated bandits, destroyed camps and slain sworn enemies score points.", score: { wins: 25, camps: 70, slain: 120 }, mods: { atk: 0.08, army: 0.04 } },
  { id: "ruh", name: "Ruhlar Haftası", en: "Week of Souls", icon: "ruh", desc: "Yıkılan Kurgan Taşları ve inilen derinlik katları puan getirir.", descEn: "Toppled Kurgan Stones and descended depth floors score points.", score: { kurgans: 90, floors: 30 }, mods: { heal: 0.02, xp: 0.08 } },
  { id: "usta", name: "Ustalar Haftası", en: "Artisans' Week", icon: "anvil", desc: "Üretilen eşyalar, talimler ve şehir görevleri puan getirir.", descEn: "Crafted items, training sessions and city quests score points.", score: { crafted: 35, trains: 15, sides: 45 }, mods: { xp: 0.1 } },
  { id: "fetih", name: "Fetih Haftası", en: "Week of Conquest", icon: "siege", desc: "Fethedilen şehirler, bey istekleri ve zaferler puan getirir.", descEn: "Conquered cities, beys' requests and victories score points.", score: { conquests: 400, beyq: 120, wins: 15 }, mods: { army: 0.06 } },
  { id: "yol", name: "Yolcular Haftası", en: "Travellers' Week", icon: "j_caravan", desc: "Kurtarılan kervanlar, Hazar seferleri, emanetler ve şehir görevleri puan getirir.", descEn: "Rescued caravans, Caspian voyages, consignments and city quests score points.", score: { rescued: 60, voyages: 80, sides: 40, contracts: 40 }, mods: { speed: 0.1, carry: 30 } },
];

export const weekTheme = (id: number): WeekTheme => WEEK_THEMES[((id % WEEK_THEMES.length) + WEEK_THEMES.length) % WEEK_THEMES.length];

export interface WeekRecord {
  id: number;
  score: number;
  rank: number;
}

export interface WeekState {
  id: number;
  base: Partial<Counters>;
  lv: number;
  claimed: number;
  hist: WeekRecord[];
}

export function weekScore(th: WeekTheme, now: Counters, base: Partial<Counters>): number {
  let n = 0;
  for (const [k, w] of Object.entries(th.score) as [keyof Counters, number][]) n += Math.max(0, (now[k] ?? 0) - (base[k] ?? 0)) * w;
  return Math.floor(n);
}

const TIER_BASE = [250, 800, 1800];
export const WEEK_TIERS = TIER_BASE.length;
export const weekNeed = (tier: number, lv: number): number => Math.round((TIER_BASE[tier] * (1 + lv / 12)) / 10) * 10;

export interface WeekReward {
  gold: number;
  renown: number;
  parsomen: number;
}

export const weekReward = (tier: number, lv: number): WeekReward => ({
  gold: Math.round(150 * (tier + 1) * (1 + lv / 10)),
  renown: 5 * (tier + 1) + (tier === 2 ? 5 : 0),
  parsomen: tier === 2 ? 2 : tier === 1 ? 1 : 0,
});

const RIVAL_NAMES = ["Bilge Tarkan", "Ay Hatun", "Kutlug Bey", "Tonyukuk", "Barçuk Alp", "Çağrı Bey", "Erke Hatun", "Kül Tegin", "Toktamış", "Bumin Yabgu", "Tuğrul Bey", "Alp Er Tunga", "Börte Hatun", "Sançar Bey"];

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BoardRow {
  name: string;
  score: number;
  me?: boolean;
}

/** Haftanın rakip beyleri; puanları hafta ilerledikçe büyür. Aynı hafta her oyuncuda aynıdır. */
export function weekBoard(id: number, lv: number, frac: number, me: { name: string; score: number }): BoardRow[] {
  const r = mulberry(id * 7919 + 17);
  const names = [...RIVAL_NAMES];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  names.length = 9;
  const mid = weekNeed(1, lv);
  const curve = Math.pow(frac, 0.8);
  const rows: BoardRow[] = names.map((name) => ({ name, score: Math.round(mid * (0.25 + 2.1 * Math.pow(r(), 1.6)) * curve) }));
  rows.push({ name: me.name, score: me.score, me: true });
  return rows.sort((a, b) => b.score - a.score || (a.me ? -1 : 1));
}

export const weekRank = (rows: BoardRow[]): number => rows.findIndex((x) => x.me) + 1;
