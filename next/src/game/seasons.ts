import type { Good } from "./rpg";

export type SeasonId = "bahar" | "yaz" | "guz" | "kis";

export const SEASON_DAYS = 4;
export const SEASON_KEYS: SeasonId[] = ["bahar", "yaz", "guz", "kis"];

export interface Season {
  name: string;
  icon: string;
  desc: string;
  food: number;
  speed: number;
  storm: number;
  sandBias: number;
  goods: Partial<Record<Good, number>>;
  tint: number;
  tintA: number;
  deco: number;
  arrive: string;
}

export const SEASONS: Record<SeasonId, Season> = {
  bahar: {
    name: "İlkbahar",
    icon: "🌱",
    desc: "Tarlalar yeşerir: yiyecek üretimi +%25. Sağanaklar sıklaşır. Pamuk ve deri ucuzlar.",
    food: 1.25,
    speed: 1,
    storm: 0.9,
    sandBias: -0.08,
    goods: { pamuk: 0.85, deri: 0.9 },
    tint: 0x7fd36a,
    tintA: 0.05,
    deco: 0xffffff,
    arrive: "Bozkırda karlar eridi, ilkbahar geldi. Tarlalar yeşeriyor.",
  },
  yaz: {
    name: "Yaz",
    icon: "☀️",
    desc: "Yollar kuru ve sert: yürüyüş +%6. Çöllerde kum fırtınaları artar. Baharat pahalanır, ipek ucuzlar.",
    food: 1,
    speed: 1.06,
    storm: 0.8,
    sandBias: 0.14,
    goods: { baharat: 1.15, ipek: 0.9, porselen: 0.95 },
    tint: 0xffc860,
    tintA: 0.06,
    deco: 0xfff4d8,
    arrive: "Yaz bastırdı. Yollar kurudu, çöllerde kum kalkıyor.",
  },
  guz: {
    name: "Sonbahar",
    icon: "🍂",
    desc: "Hasat mevsimi: yiyecek üretimi +%40. Pamuk ve halı ucuzlar, gümüş pahalanır.",
    food: 1.4,
    speed: 1,
    storm: 1,
    sandBias: 0,
    goods: { pamuk: 0.8, hali: 0.9, gumus: 1.1 },
    tint: 0xd8823a,
    tintA: 0.09,
    deco: 0xffdcb8,
    arrive: "Güz geldi; hasat zamanı. Ambarlar doluyor.",
  },
  kis: {
    name: "Kış",
    icon: "❄️",
    desc: "Kar ve ayaz: yiyecek üretimi −%40, yürüyüş −%12. Haramiler inlerine çekilir. Deri, demir ve pamuk pahalanır.",
    food: 0.6,
    speed: 0.88,
    storm: 1.3,
    sandBias: -0.2,
    goods: { deri: 1.3, demir: 1.12, pamuk: 1.2, turkuaz: 0.92 },
    tint: 0xe8f0ff,
    tintA: 0.26,
    deco: 0xe4eef8,
    arrive: "Kış çöktü. Kar yolları kapatıyor; ambarlarına dikkat et.",
  },
};

export function seasonOf(day: number): SeasonId {
  return SEASON_KEYS[Math.floor((day - 1) / SEASON_DAYS) % SEASON_KEYS.length];
}
