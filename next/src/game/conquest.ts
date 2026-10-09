import type { Army } from "./data";
import type { FactionId } from "./factions";

export interface Owned {
  loy: number;
  gar: Army;
  coffer: number;
  tax: 0 | 1 | 2;
  since: number;
  from: FactionId;
  gov?: string;
  blds?: Partial<Record<CityBld, number>>;
  ev?: { kind: string; until: number } | null;
}

export type CityBld = "sur" | "pazar" | "kisla" | "ambar";

export const TAX = [
  { name: "Hafif", mult: 0.6, loy: 2 },
  { name: "Olağan", mult: 1, loy: 0 },
  { name: "Ağır", mult: 1.6, loy: -3 },
];

const BASE_GAR: Record<FactionId, number> = { karahan: 42, gazne: 50, selcuk: 56, bizans: 95 };
const WALL: Record<FactionId, number> = { karahan: 0.2, gazne: 0.25, selcuk: 0.25, bizans: 0.4 };

export function cityGarrison(f: FactionId, losses: number): Army {
  const n = Math.round(BASE_GAR[f] * Math.max(0.55, 1 - losses * 0.15));
  return { spear: Math.round(n * 0.5), archer: Math.round(n * 0.3), horse: Math.round(n * 0.2) };
}

export function wallBonus(f: FactionId, engines: number): number {
  return Math.max(0, WALL[f] - 0.1 * Math.min(3, engines));
}

export function cityTax(city: string): number {
  return city === "constantinople" ? 30 : ["kashgar", "bukhara", "konya", "tabriz"].includes(city) ? 20 : 15;
}

export const CITY_BLD_KEYS: CityBld[] = ["sur", "pazar", "kisla", "ambar"];
export const CITY_BLDS: Record<CityBld, { name: string; icon: string; max: number; gold: number; stone: number; desc: (lv: number) => string }> = {
  sur: { name: "Surlar", icon: "fortress", max: 3, gold: 700, stone: 300, desc: (lv) => `Garnizon savunması +%${lv * 12}. Karşı saldırılar ve bey akınları zorlaşır.` },
  pazar: { name: "Çarşı", icon: "merchant", max: 3, gold: 600, stone: 150, desc: (lv) => `Vergi geliri +%${lv * 20}. Panayır olaylarının etkisi artar.` },
  kisla: { name: "Kışla", icon: "tug", max: 3, gold: 650, stone: 200, desc: (lv) => `Her gün garnizona ${lv * 2} gönüllü katılır; garnizonun bağlılığa katkısı artar.` },
  ambar: { name: "Ambar", icon: "food", max: 3, gold: 500, stone: 250, desc: (lv) => `Vergi kasası +%${lv * 50}. Kıtlıkta bağlılık kaybı %${Math.min(100, lv * 40)} azalır.` },
};

export function cityBldCost(b: CityBld, lv: number): { gold: number; stone: number } {
  return { gold: Math.round(CITY_BLDS[b].gold * (lv + 1) ** 1.3), stone: Math.round(CITY_BLDS[b].stone * (lv + 1)) };
}

export interface Governor {
  id: string;
  name: string;
  role: string;
  icon: string;
  desc: string;
  tax: number;
  loy: number;
  def: number;
  calm: number;
}

export const GOVERNORS: Governor[] = [
  { id: "nasir", name: "Hoca Nasır", role: "Tüccar vali", icon: "merchant", desc: "Vergi +%25, ama halkı biraz sıkar.", tax: 0.25, loy: -0.4, def: 0, calm: 0 },
  { id: "alper", name: "Alp Er", role: "Asker vali", icon: "heroes/cls_bahadir", desc: "Garnizon savunması +%15, kışla gönüllüleri +1.", tax: 0, loy: 0, def: 0.15, calm: 0 },
  { id: "yusuf", name: "Kadı Yusuf", role: "Adil vali", icon: "heroes/hero4", desc: "Bağlılık her dakika +0.8, vergi −%10.", tax: -0.1, loy: 0.8, def: 0, calm: 0.3 },
  { id: "tonyukuk", name: "Bilge Tonyukuk", role: "Bilge vali", icon: "companions/korkut", desc: "Kötü olaylar yarı yarıya seyrek; vergi +%10, bağlılık +0.3.", tax: 0.1, loy: 0.3, def: 0.05, calm: 0.5 },
];
export const GOV_GOLD = 500;

export interface CityEvent {
  name: string;
  icon: string;
  good: boolean;
  seasons: string[];
  tax: number;
  loy: number;
  text: string;
  fix?: { label: string; food?: number; gold?: number };
}

export const CITY_EVENTS: Record<string, CityEvent> = {
  kitlik: { name: "Kıtlık", icon: "food", good: false, seasons: ["kis"], tax: 0.6, loy: -1.6, text: "Kar yolları kapadı, ambarlar boşaldı. Halk aç.", fix: { label: "Yiyecek gönder", food: 250 } },
  kuraklik: { name: "Kuraklık", icon: "food", good: false, seasons: ["yaz"], tax: 0.5, loy: -0.8, text: "Kuyular kurudu, tarlalar yandı.", fix: { label: "Kuyu kazdır", gold: 400 } },
  sel: { name: "Sel", icon: "food", good: false, seasons: ["bahar"], tax: 0.7, loy: -0.6, text: "Eriyen karlar dereleri taşırdı; mahalleler su altında.", fix: { label: "Bent onart", gold: 350 } },
  fitne: { name: "Fitne", icon: "j_bandit", good: false, seasons: ["bahar", "yaz", "guz", "kis"], tax: 0.9, loy: -2, text: "Eski efendinin adamları halkı kışkırtıyor.", fix: { label: "Kışkırtıcıları yakala", gold: 300 } },
  panayir: { name: "Panayır", icon: "coins", good: true, seasons: ["bahar", "yaz"], tax: 1.5, loy: 0.5, text: "Uzak diyarlardan tüccarlar çarşıya akın etti." },
  hasat: { name: "Hasat Şenliği", icon: "food", good: true, seasons: ["guz"], tax: 1.3, loy: 1.2, text: "Ambarlar doldu; meydanda davullar çalıyor." },
};

export const ENGINE_GOLD = 1200;
export const FEAST_GOLD = 600;
export const SIEGE_LV = 15;
export const SIEGE_RENOWN = 200;
