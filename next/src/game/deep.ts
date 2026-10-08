import type { Boss } from "./battle";
import type { Army } from "./data";
import type { Item } from "./rpg";

export type DoorKind = "savas" | "hazine" | "pinar" | "sir" | "tuccar";

export interface DeepRun {
  kurgan: number;
  floor: number;
  torch: number;
  gold: number;
  ruh: number;
  items: Item[];
  bless: number;
  curse: number;
  greed: number;
  doors: DoorKind[];
}

export const DOORS: Record<DoorKind, { name: string; hint: string; icon: string; w: number }> = {
  savas: { name: "Kanlı kapı", hint: "Ötede kılıç şakırtısı. Taş askerler bekliyor.", icon: "swords", w: 40 },
  hazine: { name: "Altın ışıltı", hint: "Aralıktan sarı bir parıltı sızıyor. Tuzak da olabilir.", icon: "chest", w: 18 },
  pinar: { name: "Su sesi", hint: "Taşların arasından serin bir pınar akıyor.", icon: "healer", w: 11 },
  sir: { name: "Fısıltılar", hint: "Karanlıkta biri adını söylüyor…", icon: "ruh", w: 20 },
  tuccar: { name: "Yaşlı ses", hint: "Bir fener yanıyor; yeraltının tüccarı müşteri bekliyor.", icon: "coins", w: 8 },
};
export const DOOR_KEYS = Object.keys(DOORS) as DoorKind[];

export const DEEP_BOSSES = [
  { name: "Taş Bekçi", icon: "heroes/boss_golem", lore: "Mezarın ilk kapısını bin yıldır bekleyen dev balbal. Gözlerinde kor yanıyor." },
  { name: "Albastı Ana", icon: "heroes/boss_albasti", lore: "Loğusaların korkusu, yeraltının kraliçesi. Saçları yılan gibi kıvrılıyor." },
  { name: "Erlik'in Elçisi", icon: "heroes/boss_karahan", lore: "Yeraltı hanı Erlik'in kara zırhlı elçisi. Arkasında dokuz kat karanlık var." },
];

export function deepBoss(floor: number): Boss & { lore: string } {
  const n = floor / 5;
  const b = DEEP_BOSSES[(n - 1) % DEEP_BOSSES.length];
  const t = 1.5 + floor * 0.32;
  return { name: n > 3 ? `Uyanmış ${b.name}` : b.name, icon: b.icon, lore: b.lore, hp: Math.round(130 * Math.pow(t, 1.5)), atk: Math.round(7 * Math.pow(t, 1.3)), def: 3 + Math.round(t * 3) };
}

export function deepTier(floor: number, base: number): number {
  return base * 0.5 + 0.8 + floor * 0.33;
}

export function deepGuard(floor: number, base: number, R: () => number = Math.random): Army {
  const t = deepTier(floor, base);
  const n = Math.max(3, Math.round(5 * Math.pow(1.62, t - 1) * (0.85 + R() * 0.3)));
  const a = 0.25 + R() * 0.25;
  const h = floor >= 6 ? 0.1 + R() * 0.15 : 0;
  return { spear: Math.round(n * (1 - a - h)), archer: Math.round(n * a), horse: Math.round(n * h) };
}

export const RIDDLES = [
  { q: "Bir ağacım var, on iki dalı var; her dalında otuz yaprak, yarısı ak yarısı kara.", a: "Yıl", wrong: ["Orman", "Ordu"] },
  { q: "Dili yok, ağzı yok; uzak yollardan söz taşır, söyler de susar.", a: "Mektup", wrong: ["Rüzgâr", "Ozan"] },
  { q: "Gece gelir, gündüz kaçar; ateşi görünce saklanır.", a: "Karanlık", wrong: ["Kurt", "Hırsız"] },
  { q: "Kanadı yok uçar, ayağı yok koşar; ağlar ama gözü yok.", a: "Bulut", wrong: ["Kartal", "At"] },
  { q: "Ben giderim, o gider; ben dururum, o durur. Ne önüme geçer ne arkamda kalır.", a: "Gölge", wrong: ["Yoldaş", "Ruh"] },
  { q: "Yer altında altın küp; kazan kazan, bitmez.", a: "Pınar", wrong: ["Hazine", "Maden"] },
  { q: "Bir sarayım var: kapısı yok, penceresi yok; içinde altın bir beşik.", a: "Yumurta", wrong: ["Mezar", "Kurgan"] },
];

export const DEEP_LORE = [
  "Duvarlarda Göktürk yazıları: \"Üstte mavi gök basmadıkça, altta yağız yer delinmedikçe…\"",
  "Yerde paslı bir at koşumu. Hakan bir zamanlar atıyla birlikte gömülmüş.",
  "Tavandan kökler sarkıyor. Bozkırın en yaşlı ağacı burada bile kök salmış.",
  "Bir balbal duvara dönük durmuş, sanki utancından yüzünü saklıyor.",
  "Kemikten bir kopuz. Teli kopmuş ama sen geçerken titredi.",
  "Taşa kazınmış bir kurt başı. Gözlerine kırmızı taş kakılmış.",
  "Dokuz basamak aşağı iniyor. Erlik'in yurdu dokuz kattır, derler.",
];

export const DEEP_RECORD_TIERS = [5, 10, 15, 20, 30];
