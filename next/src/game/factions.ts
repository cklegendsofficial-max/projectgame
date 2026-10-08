import type { Unit } from "./data";
import type { SetId } from "./legend";

export type FactionId = "karahan" | "gazne" | "selcuk" | "bizans";
export const FACTION_KEYS: FactionId[] = ["karahan", "gazne", "selcuk", "bizans"];

export interface Faction {
  name: string;
  short: string;
  color: string;
  icon: string;
  cities: string[];
  rival: FactionId;
  unit: Unit;
  gift: SetId;
  ruler: string;
  rulerGen: string;
  desc: string;
}

export const FACTIONS: Record<FactionId, Faction> = {
  karahan: {
    name: "Karahanlılar",
    short: "Karahan",
    color: "#e0b04a",
    icon: "seal",
    cities: ["kashgar", "samarkand", "bukhara"],
    rival: "gazne",
    unit: "horse",
    gift: "gokkurt",
    ruler: "Arslan Han",
    rulerGen: "Arslan Han'ın",
    desc: "Doğunun Türk hanları. Bozkır atlılarıyla ünlüdür; Gaznelilerle Maveraünnehir için kanlı bir rekabet içindedir.",
  },
  gazne: {
    name: "Gazneliler",
    short: "Gazne",
    color: "#6fbf8f",
    icon: "fortress",
    cities: ["merv", "nishapur"],
    rival: "selcuk",
    unit: "spear",
    gift: "golge",
    ruler: "Sultan Mesud",
    rulerGen: "Sultan Mesud'un",
    desc: "Horasan'ın zengin sultanlığı. Ağır piyadesi ve hazineleriyle bilinir; yükselen Selçuklulardan korkar.",
  },
  selcuk: {
    name: "Selçuklular",
    short: "Selçuk",
    color: "#5aa8ff",
    icon: "village",
    cities: ["rey", "tabriz", "konya"],
    rival: "bizans",
    unit: "archer",
    gift: "ejder",
    ruler: "Tuğrul Bey",
    rulerGen: "Tuğrul Bey'in",
    desc: "Batıya akan Oğuz boyları. Atlı okçuları durdurulamaz; gözleri Anadolu'nun ötesinde, Bizans'tadır.",
  },
  bizans: {
    name: "Bizans",
    short: "Bizans",
    color: "#c07cff",
    icon: "chest",
    cities: ["constantinople"],
    rival: "selcuk",
    unit: "spear",
    gift: "ipek",
    ruler: "İmparator",
    rulerGen: "İmparatorun",
    desc: "İpek Yolu'nun batı kapısı. Altını ve entrikası kılıcından keskindir; Selçuklu akınlarını dizginlemek ister.",
  },
};

export const REP_RANKS = [
  { name: "Yabancı", need: 0, you: "Yabancısın" },
  { name: "Tanıdık", need: 80, you: "Tanıdıksın" },
  { name: "Dost", need: 250, you: "Dostsun" },
  { name: "Müttefik", need: 600, you: "Müttefiksin" },
  { name: "Kahraman", need: 1200, you: "Kahramansın" },
];

export const HOSTILE = -150;

export const RANK_PERKS = [
  "",
  "Pazarlarında alışta ve satışta %3 avantaj",
  "Şehir görevlerinde %15 fazla ödül, özel birliklerinde %30 indirim",
  "Hükümdardan efsanevi set armağanı, pazarlarda toplam %6 avantaj",
  "Unvan ve bütün savaşlarda +%5 ordu gücü",
];

export function factionOf(city: string): FactionId {
  return FACTION_KEYS.find((f) => FACTIONS[f].cities.includes(city)) ?? "karahan";
}

export function repRank(v: number): number {
  let r = 0;
  for (let i = 0; i < REP_RANKS.length; i++) if (v >= REP_RANKS[i].need) r = i;
  return r;
}
