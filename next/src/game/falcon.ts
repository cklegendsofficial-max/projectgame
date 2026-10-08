import type { GearMods } from "./legend";

export type BirdKind = "dogan" | "sungur" | "kartal";

export interface Bird {
  kind: BirdKind;
  name: string;
  lv: number;
  xp: number;
  cd: number;
  huntT: number;
}

export interface BirdFlight {
  x: number;
  y: number;
  tx: number;
  ty: number;
  back: boolean;
}

export const BIRDS: Record<BirdKind, { name: string; desc: string; city: string; gold: number; color: number; cd: number; hunt: number; speed: number; mods: (lv: number) => GearMods }> = {
  dogan: { name: "Doğan", desc: "Hızlı ve çevik. Kısa aralıkla uçar, sık av getirir.", city: "", gold: 450, color: 0xc9a066, cd: 40, hunt: 70, speed: 260, mods: (lv) => ({ spd: 0.004 * lv }) },
  sungur: { name: "Ak Sungur", desc: "Hakanların kuşu. Uzağı görür, avı değerlidir; düşmanın zayıf yerini gösterir.", city: "bukhara", gold: 2200, color: 0xf2efe6, cd: 55, hunt: 90, speed: 230, mods: (lv) => ({ crit: 0.006 * lv, loot: 0.01 * lv }) },
  kartal: { name: "Altın Kartal", desc: "Bozkırın en güçlü yırtıcısı. Savaşta düşmanın gözünü oyar, kurtları bile avlar.", city: "kashgar", gold: 4000, color: 0x8a5a2a, cd: 70, hunt: 110, speed: 200, mods: (lv) => ({ atk: 0.008 * lv, army: 0.005 * lv }) },
};
export const BIRD_KEYS = Object.keys(BIRDS) as BirdKind[];

export const BIRD_NAMES = ["Tuğrul", "Akkuş", "Çağrı", "Togan", "Karakuş", "Sungur", "Laçin", "Itelgi", "Bürküt", "Toygun"];

export const HUNTS = [
  { what: "bir tavşan", gold: 1 },
  { what: "bir keklik", gold: 1 },
  { what: "bir tilki postu", gold: 2.5 },
  { what: "bir yaban kazı", gold: 1.6 },
  { what: "bir ceylan yavrusu", gold: 3 },
  { what: "parlak bir yüzük (bir yolcudan düşmüş)", gold: 6 },
];

export function birdXpNeed(lv: number): number {
  return 40 + lv * lv * 25;
}

export const BIRD_MAX = 10;

export function birdSight(b: Bird): number {
  return 1 + Math.floor(b.lv / 3) + (b.kind === "sungur" ? 1 : 0);
}
