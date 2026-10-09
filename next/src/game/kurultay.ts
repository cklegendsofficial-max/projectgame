import type { RivalTrait } from "./rivals";

export interface Decree {
  id: string;
  name: string;
  icon: string;
  desc: string;
  likes: RivalTrait[];
  hates: RivalTrait[];
}

export const DECREES: Decree[] = [
  { id: "vergi", name: "Ortak Vergi Kanunu", icon: "coins", desc: "Fethettiğin şehirlerin vergisi +%15, tabi beylerin haracı +%20.", likes: ["kurnaz"], hates: ["comert"] },
  { id: "adalet", name: "Töre Fermanı", icon: "scroll", desc: "Fethettiğin şehirlerde bağlılık dakikada +0.5.", likes: ["onurlu", "comert"], hates: ["hirsli"] },
  { id: "yol", name: "Yol Güvenliği", icon: "j_caravan", desc: "Harami kampları %40 daha seyrek asker çıkarır; yollar güvenli.", likes: ["comert", "kurnaz"], hates: [] },
  { id: "sefer", name: "Ortak Ordu", icon: "swords", desc: "Müttefik ve tabi beylerin savaş bonusu iki katına çıkar.", likes: ["hirsli", "onurlu"], hates: ["comert"] },
  { id: "pazar", name: "Ortak Pazar", icon: "merchant", desc: "Bütün pazarlarda alışta %3 indirim, satışta %3 fazla.", likes: ["kurnaz", "comert"], hates: ["hirsli"] },
  { id: "baris", name: "Bozkır Barışı", icon: "lord_bey", desc: "Sana savaş açmış beyler barışa zorlanır; beyler arası çatışmalar durur.", likes: ["onurlu", "comert"], hates: ["hirsli"] },
];

export const KURULTAY_EVERY = 5;
export const KURULTAY_MAX = 2;
export const KAGAN_RENOWN = 600;
export const BRIBE_GOLD = 800;

export function decreeOf(id: string): Decree | undefined {
  return DECREES.find((d) => d.id === id);
}
