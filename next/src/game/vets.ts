import type { Unit } from "./data";

export interface Vet {
  id: number;
  name: string;
  u: Unit;
  lv: number;
  xp: number;
  kills: number;
  scar: string;
  day: number;
}

export const VET_MAX = 6;
export const VET_LV_MAX = 5;
export const VET_XP = [0, 3, 7, 12, 18];

const NAMES = ["Alpagut", "Arslan", "Bars", "Börü", "Bilge", "Çağan", "Doğan", "Ertuğ", "Ilgaz", "Kaya", "Kılıç", "Sungur", "Tarkan", "Tolga", "Toktamış", "Yağız", "Oğuz", "Karabaş", "Aybars", "Tuğrul", "Altay", "Akın", "Batu", "Erdem"];
const EPITHET: Record<Unit, string[]> = {
  spear: ["Kalkan", "Taş Duvar", "Demir Göğüs"],
  archer: ["Keskin Göz", "Kartal", "Sessiz Yay"],
  horse: ["Rüzgâr", "Yel Atlı", "Tozkoparan"],
};
export const SCARS = ["Tek Göz", "Yarık Yüz", "Demir Kol", "Topal", "Kesik Kulak"];
export const VET_RANKS = ["Er", "Onbaşı", "Yüzbaşı", "Bölükbaşı", "Alp"];

export function makeVet(id: number, u: Unit, day: number, taken: string[]): Vet {
  const free = NAMES.filter((n) => !taken.some((t) => t.startsWith(n)));
  const n = (free.length ? free : NAMES)[Math.floor(Math.random() * (free.length || NAMES.length))];
  const e = EPITHET[u][Math.floor(Math.random() * EPITHET[u].length)];
  return { id, name: `${e} ${n}`, u, lv: 1, xp: 0, kills: 0, scar: "", day };
}

export function vetTitle(v: Vet): string {
  return v.scar ? `${v.scar} ${v.name.split(" ").pop()}` : v.name;
}

export function vetBonus(vets: Vet[]): number {
  return Math.min(0.15, vets.reduce((a, v) => a + v.lv * 0.006, 0));
}
