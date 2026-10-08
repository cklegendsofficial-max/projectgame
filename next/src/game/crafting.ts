import type { Good, Slot } from "./rpg";

export type Mat = Good | "ruh" | "parsomen" | "gold";
export type Cost = Partial<Record<Mat, number>>;

export interface Consumable {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: Cost;
  lv: number;
}

export const CONSUMABLES: Consumable[] = [
  { id: "merhem", name: "Şifa Merhemi", icon: "healer", desc: "Canının yarısını hemen doldurur.", cost: { pamuk: 1, baharat: 1, gold: 10 }, lv: 1 },
  { id: "kimiz", name: "Kımız Tulumu", icon: "food", desc: "Enerjini tamamen doldurur.", cost: { deri: 1, pamuk: 1, gold: 15 }, lv: 1 },
  { id: "davul", name: "Savaş Davulu", icon: "trophy", desc: "Sonraki 3 savaşta birliğin %15 güçlü vurur.", cost: { deri: 2, gumus: 1, gold: 30 }, lv: 4 },
  { id: "totem", name: "Kurt Totemi", icon: "tr_wolf", desc: "Sonraki 3 savaşta kahraman saldırısı %25 artar.", cost: { turkuaz: 1, ruh: 1, gold: 40 }, lv: 6 },
  { id: "tutsu", name: "Ruh Tütsüsü", icon: "spices", desc: "Sonraki 3 savaşta her tur %4 can yenilersin.", cost: { baharat: 2, yesim: 1, gold: 50 }, lv: 8 },
];
export const CONS_BY_ID: Record<string, Consumable> = Object.fromEntries(CONSUMABLES.map((c) => [c.id, c]));

export interface Refine {
  id: string;
  name: string;
  icon: string;
  out: "ruh" | "parsomen";
  cost: Cost;
}

export const REFINES: Refine[] = [
  { id: "ruhdamit", name: "Ruh Taşı damıt", icon: "ruh", out: "ruh", cost: { turkuaz: 3, yesim: 1, gold: 60 } },
  { id: "parsomenyaz", name: "Kutsal Parşömen yaz", icon: "parsomen", out: "parsomen", cost: { ipek: 2, ruh: 3, gold: 80 } },
];

export const CRAFT_SLOTS: Slot[] = ["silah", "zirh", "kalkan", "tilsim"];

export function gearCost(slot: Slot, t: number): Cost {
  const c: Cost = { gold: Math.round(35 * t * t) };
  if (slot === "silah") {
    c.demir = 2 * t;
    if (t >= 3) c.gumus = t - 2;
  } else if (slot === "zirh") {
    c.deri = 2 * t;
    c.demir = t;
    c.pamuk = t;
  } else if (slot === "kalkan") {
    c.demir = t + 1;
    c.deri = t;
  } else {
    c.turkuaz = t;
    if (t >= 3) c.yesim = t - 2;
  }
  if (t >= 4) c.ruh = t - 3;
  return c;
}
