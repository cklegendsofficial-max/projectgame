export type ResKey = "gold" | "food" | "wood" | "stone";
export type Res = Record<ResKey, number>;
export const RES_KEYS: ResKey[] = ["gold", "food", "wood", "stone"];
export const RES_ICON: Record<ResKey, string> = { gold: "coins", food: "food", wood: "mat_wood", stone: "stone" };
export const RES_NAME: Record<ResKey, string> = { gold: "Altın", food: "Yiyecek", wood: "Kereste", stone: "Taş" };

export type Unit = "spear" | "archer" | "horse";
export const UNIT_KEYS: Unit[] = ["spear", "archer", "horse"];
export type Army = Record<Unit, number>;

export interface UnitDef {
  name: string;
  icon: string;
  hp: number;
  atk: number;
  beats: Unit;
  cost: Partial<Res>;
  time: number;
  load: number;
}

export const UNITS: Record<Unit, UnitDef> = {
  spear: { name: "Mızraklı", icon: "u_spear", hp: 12, atk: 2.2, beats: "horse", cost: { food: 20, wood: 12, gold: 4 }, time: 4, load: 20 },
  archer: { name: "Okçu", icon: "u_archer", hp: 8, atk: 3, beats: "spear", cost: { food: 20, wood: 28, gold: 8 }, time: 6, load: 14 },
  horse: { name: "Atlı", icon: "u_cavalry", hp: 16, atk: 3.4, beats: "archer", cost: { food: 40, wood: 6, gold: 26 }, time: 9, load: 32 },
};

export function army(spear = 0, archer = 0, horse = 0): Army {
  return { spear, archer, horse };
}

export function armySize(a: Army): number {
  return a.spear + a.archer + a.horse;
}

export function armyPower(a: Army, bonus = 0): number {
  let p = 0;
  for (const u of UNIT_KEYS) p += a[u] * UNITS[u].atk * Math.sqrt(UNITS[u].hp);
  return p * (1 + bonus);
}

export type BuildingId = "saray" | "ciftlik" | "kereste" | "tasocagi" | "carsi" | "kisla" | "depo" | "sur";

export interface BuildingDef {
  id: BuildingId;
  name: string;
  icon: string;
  desc: string;
  produces?: ResKey;
  base?: number;
  cost: Partial<Res>;
}

export const BUILDINGS: BuildingDef[] = [
  { id: "saray", name: "Saray", icon: "b_saray", desc: "Diğer binaların en yüksek seviyesini belirler. Kahramanın birlik sınırını artırır.", cost: { wood: 120, stone: 90, gold: 40 } },
  { id: "ciftlik", name: "Çiftlik", icon: "b_ciftlik", desc: "Yiyecek üretir. Ordular yiyecekle beslenir.", produces: "food", base: 40, cost: { wood: 50, stone: 20 } },
  { id: "kereste", name: "Kereste Atölyesi", icon: "b_kereste", desc: "Kereste üretir.", produces: "wood", base: 32, cost: { wood: 30, stone: 30, gold: 10 } },
  { id: "tasocagi", name: "Taş Ocağı", icon: "b_tasocagi", desc: "Taş üretir.", produces: "stone", base: 22, cost: { wood: 60, gold: 10 } },
  { id: "carsi", name: "Çarşı", icon: "b_carsi", desc: "Vergi ve ticaretle altın üretir.", produces: "gold", base: 16, cost: { wood: 70, stone: 50 } },
  { id: "kisla", name: "Kışla", icon: "b_kisla", desc: "Asker eğitir. Seviye arttıkça eğitim hızlanır ve okçu ile atlı açılır.", cost: { wood: 90, stone: 40, gold: 20 } },
  { id: "depo", name: "Ambar", icon: "b_depo", desc: "Kaynak depolama sınırını artırır.", cost: { wood: 80, stone: 60 } },
  { id: "sur", name: "Sur", icon: "b_sur", desc: "Başkentin savunmasını güçlendirir. Akınlara karşı korur.", cost: { stone: 140, wood: 40 } },
];

export const BUILDING_BY_ID = Object.fromEntries(BUILDINGS.map((b) => [b.id, b])) as Record<BuildingId, BuildingDef>;

export function buildCost(b: BuildingDef, toLv: number): Res {
  const k = Math.pow(1.62, toLv - 2);
  return { gold: Math.round((b.cost.gold ?? 0) * k), food: Math.round((b.cost.food ?? 0) * k), wood: Math.round((b.cost.wood ?? 0) * k), stone: Math.round((b.cost.stone ?? 0) * k) };
}

export function buildTime(toLv: number): number {
  return Math.round(12 * Math.pow(1.75, toLv - 2));
}

export function prodPerMin(b: BuildingDef, lv: number): number {
  if (!b.produces || lv <= 0) return 0;
  return Math.round((b.base ?? 0) * lv * Math.pow(1.18, lv - 1));
}

export function storageCap(depoLv: number): number {
  return Math.round(1500 * Math.pow(1.7, depoLv - 1));
}

export function heroCap(sarayLv: number, heroLv: number): number {
  return 20 + sarayLv * 8 + heroLv * 6;
}

export function trainSpeed(kislaLv: number): number {
  return 1 + 0.15 * (kislaLv - 1);
}

export function unitUnlocked(u: Unit, kislaLv: number): boolean {
  return u === "spear" || (u === "archer" && kislaLv >= 2) || (u === "horse" && kislaLv >= 4);
}

export function xpNeed(lv: number): number {
  return Math.round(60 * Math.pow(1.45, lv - 1));
}

export const VILLAGE_NAMES = [
  "Kızılköy", "Akyurt", "Karasu", "Yeşilova", "Taşkent", "Altınbulak", "Kumdere", "Bozova", "Sarıkamış", "Ulupınar",
  "Kayalık", "Erdemli", "Çamlıbel", "Ağıllı", "Kargalı", "Tuzla", "Gökçeyurt", "Sögütlü", "Ilıca", "Bayındır",
  "Kurtbeli", "Ortaköy", "Elmalı", "Tepecik", "Kuyucak", "Davutlu", "Buğdaylı", "Ardıçlı", "Karaman", "Yarbaşı",
  "Kayseriye", "Develi", "Acısu", "Saray", "Eğrisu", "Kalealtı", "Kurşunlu", "Otluk", "Pınarbaşı", "Yazır",
  "Çoban", "Akpınar", "Karabağ", "Hanlı", "Burunsuz", "Çatak", "Narlı", "Kepez",
  "Ilgaz", "Sarıçay", "Kızılırmak", "Ağaçlı", "Bulgurlu", "Çiçekli", "Kayabaşı", "Dereli", "Ocaklı", "Kınık",
  "Bayat", "Avşar", "Eymür", "Çepni", "Döğer", "Yüreğir", "Alayunt", "Peçenek", "Kıpçaklı", "Salur",
  "Kazanlı", "Tekeli", "Üçoklu", "Bozoklu", "Yağmurlu", "Karlık", "Söğütçük", "Arpalık", "Kumluca", "Yalınca",
  "Tuzluca", "Kamışlı", "Bademli", "Alaca",
];

export const BANDIT_NAMES = ["Kara Çete", "Kızıl Kurtlar", "Çöl Akrepleri", "Dağ Kartalları", "Gece Atlıları", "Kum Fırtınası", "Yılan Çetesi", "Demir Pençe"];

export const CITY_NAME: Record<string, string> = {
  constantinople: "Konstantinopolis",
  konya: "Konya",
  tabriz: "Tebriz",
  rey: "Rey",
  nishapur: "Nişabur",
  merv: "Merv",
  bukhara: "Buhara",
  samarkand: "Semerkant",
  kashgar: "Kaşgar",
};

export type NodeKind = "food" | "wood" | "stone" | "gold";
export const NODE_SPRITE: Record<NodeKind, string> = { food: "farm", wood: "forest", stone: "quarry", gold: "mine" };
export const NODE_NAME: Record<NodeKind, string> = { food: "Bereketli Tarla", wood: "Orman", stone: "Taş Ocağı", gold: "Altın Madeni" };

export const DAY_SEC = 150;
