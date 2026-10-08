import type { Material } from "./army";
import { REGIONS, TROPHY_RARITY, hireCost, type Rarity } from "./province";
import type { GameState } from "./state";

export type OfferKind = "trophy" | "steel" | "mats" | "mercs";

export interface Offer {
  kind: OfferKind;
  id: string;
  n: number;
  sec: number;
  sold: boolean;
}

export interface Merchant {
  k: number;
  until: number;
  offers: Offer[];
}

export const MERCHANT_STAY = 4 * 60_000;
export const TROPHY_PRICE = [400, 1600, 9000];
export const TROPHY_BUYBACK = [70, 280, 1500];
const MATS: Material[] = ["iron", "wood", "leather"];

export function nextMerchantDelay(rnd = Math.random): number {
  return (12 + rnd() * 8) * 60_000;
}

export function rollMerchant(s: GameState, now: number, rnd = Math.random): Merchant | null {
  const open = s.regions.map((r, k) => (r.open ? k : -1)).filter((k) => k >= 0);
  if (open.length === 0) return null;
  const k = open[Math.floor(rnd() * open.length)];
  const src = open[Math.floor(rnd() * open.length)];
  const roll = rnd();
  const rar: Rarity = roll < 0.06 ? 2 : roll < 0.55 ? 1 : 0;
  const tro = REGIONS[src].trophies[rar];
  const mat = MATS[Math.floor(rnd() * MATS.length)];
  const offers: Offer[] = [
    { kind: "trophy", id: tro, n: 1, sec: TROPHY_PRICE[rar], sold: false },
    { kind: "steel", id: "mat_steel", n: 15 + Math.floor(rnd() * 3) * 5, sec: 0, sold: false },
    { kind: "mats", id: "mat_" + mat, n: 60, sec: 150, sold: false },
    { kind: "mercs", id: "merc", n: 10, sec: 0, sold: false },
  ];
  offers[1].sec = offers[1].n * 12;
  return { k, until: now + MERCHANT_STAY, offers };
}

export function offerPrice(s: GameState, o: Offer, income: number): number {
  if (o.kind === "mercs") return hireCost(income, s) * o.n * 0.75;
  return Math.max(100, income * o.sec);
}

export function buyOffer(s: GameState, o: Offer, income: number): boolean {
  const price = offerPrice(s, o, income);
  if (o.sold || s.gold < price) return false;
  s.gold -= price;
  o.sold = true;
  if (o.kind === "trophy") s.trophies[o.id] = (s.trophies[o.id] ?? 0) + o.n;
  else if (o.kind === "steel") s.mats.steel += o.n;
  else if (o.kind === "mats") s.mats[o.id.replace("mat_", "") as Material] += o.n;
  else s.mercs += o.n;
  return true;
}

export function buybackPrice(id: string, income: number): number {
  return Math.max(50, income * TROPHY_BUYBACK[TROPHY_RARITY[id] ?? 0]);
}

export function sellable(s: GameState): string[] {
  return Object.keys(s.trophies).filter((id) => (s.trophies[id] ?? 0) > 1 && TROPHY_RARITY[id] !== undefined);
}

export function sellTrophy(s: GameState, id: string, income: number): number {
  if ((s.trophies[id] ?? 0) <= 1) return 0;
  const g = buybackPrice(id, income);
  s.trophies[id]--;
  return g;
}

export function isMerchant(x: unknown): x is Merchant {
  if (!x || typeof x !== "object") return false;
  const m = x as Partial<Merchant>;
  return typeof m.k === "number" && m.k >= 0 && m.k < REGIONS.length && typeof m.until === "number" && Array.isArray(m.offers);
}

export function cleanOffers(raw: unknown[]): Offer[] {
  const kinds: OfferKind[] = ["trophy", "steel", "mats", "mercs"];
  return raw
    .filter((o): o is Offer => !!o && typeof o === "object" && kinds.includes((o as Offer).kind) && typeof (o as Offer).id === "string")
    .map((o) => ({ kind: o.kind, id: o.id, n: Math.max(1, Math.floor(Number(o.n) || 1)), sec: Math.max(0, Number(o.sec) || 0), sold: !!o.sold }))
    .filter((o) => o.kind !== "trophy" || TROPHY_RARITY[o.id] !== undefined)
    .slice(0, 6);
}
