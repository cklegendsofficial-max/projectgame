import type { GearMods } from "./legend";
import type { GameState } from "./state";

export interface TitleCat {
  id: string;
  icon: string;
  what: string;
  value: (s: GameState) => number;
  tiers: { need: number; name: string; mods: GearMods }[];
}

export const TITLE_CATS: TitleCat[] = [
  { id: "wins", icon: "j_bandit", what: "harami çetesi yen", value: (s) => s.c.wins, tiers: [{ need: 10, name: "Yol Bekçisi", mods: { army: 0.02 } }, { need: 50, name: "Harami Avcısı", mods: { army: 0.04 } }, { need: 200, name: "Bozkır Kılıcı", mods: { army: 0.07 } }] },
  { id: "camps", icon: "map/camp", what: "kamp yık", value: (s) => s.c.camps, tiers: [{ need: 3, name: "İn Bozan", mods: { atk: 0.03 } }, { need: 15, name: "Çete Kıran", mods: { atk: 0.06 } }, { need: 40, name: "Haramilerin Kâbusu", mods: { atk: 0.1 } }] },
  { id: "kurgans", icon: "map/kurgan", what: "Kurgan Taşı yık", value: (s) => s.c.kurgans, tiers: [{ need: 2, name: "Ruh Bekçisi", mods: { heal: 0.01 } }, { need: 10, name: "Kurgan Yıkan", mods: { heal: 0.02 } }, { need: 30, name: "Ataların Sesi", mods: { heal: 0.03 } }] },
  { id: "profit", icon: "coins", what: "altın ticaret kârı", value: (s) => s.c.profit, tiers: [{ need: 2000, name: "Çerçi", mods: { carry: 20 } }, { need: 20000, name: "Tüccar", mods: { carry: 45 } }, { need: 150000, name: "Bezirgânbaşı", mods: { carry: 80, spd: 0.05 } }] },
  { id: "crafted", icon: "anvil", what: "eşya üret", value: (s) => s.c.crafted, tiers: [{ need: 5, name: "Çırak", mods: { def: 0.03 } }, { need: 25, name: "Kalfa", mods: { def: 0.06 } }, { need: 80, name: "Usta", mods: { def: 0.1 } }] },
  { id: "sides", icon: "quest", what: "şehir görevi tamamla", value: (s) => s.c.sides, tiers: [{ need: 5, name: "Yardımsever", mods: { xp: 0.05 } }, { need: 25, name: "Halkın Yiğidi", mods: { xp: 0.1 } }, { need: 75, name: "Destan Kahramanı", mods: { xp: 0.15 } }] },
  { id: "codex", icon: "parsomen", what: "efsane eşya keşfet", value: (s) => s.codex.length, tiers: [{ need: 3, name: "Defineci", mods: { crit: 0.02 } }, { need: 10, name: "Efsane Avcısı", mods: { crit: 0.04 } }, { need: 20, name: "Destan Koleksiyoncusu", mods: { crit: 0.06 } }] },
  { id: "robbed", icon: "wanted", what: "kervan soy", value: (s) => s.c.robbed, tiers: [{ need: 1, name: "Yol Kesen", mods: { loot: 0.1 } }, { need: 10, name: "Kara Atlı", mods: { loot: 0.2 } }, { need: 30, name: "Bozkırın Belası", mods: { loot: 0.3 } }] },
  { id: "rescued", icon: "j_caravan", what: "kervan kurtar", value: (s) => s.c.rescued, tiers: [{ need: 1, name: "Kervan Dostu", mods: { hp: 0.05 } }, { need: 8, name: "Kervan Kalkanı", mods: { hp: 0.1 } }, { need: 25, name: "Yolların Koruyucusu", mods: { hp: 0.15 } }] },
  { id: "deep", icon: "ruh", what: "kat derinliğe in", value: (s) => s.deepBest, tiers: [{ need: 5, name: "Mezar Gezgini", mods: { def: 0.03, hp: 0.03 } }, { need: 15, name: "Karanlığın Yolcusu", mods: { def: 0.05, hp: 0.06 } }, { need: 30, name: "Erlik'i Gören", mods: { def: 0.08, hp: 0.1, atk: 0.04 } }] },
  { id: "lv", icon: "crown", what: "seviyeye ulaş", value: (s) => s.hero.lv, tiers: [{ need: 10, name: "Alp", mods: { spd: 0.03 } }, { need: 20, name: "Bey", mods: { spd: 0.06 } }, { need: 30, name: "Han", mods: { spd: 0.1 } }] },
];

export function titleKey(cat: string, tier: number): string {
  return `${cat}:${tier}`;
}

export function titleOf(key: string): { cat: TitleCat; tier: number; name: string; mods: GearMods } | null {
  const [id, t] = key.split(":");
  const cat = TITLE_CATS.find((c) => c.id === id);
  const tier = Number(t);
  if (!cat || !cat.tiers[tier]) return null;
  return { cat, tier, name: cat.tiers[tier].name, mods: cat.tiers[tier].mods };
}

export function titleReward(tier: number): { gold: number; renown: number } {
  return { gold: [150, 900, 4000][tier], renown: [5, 20, 60][tier] };
}
