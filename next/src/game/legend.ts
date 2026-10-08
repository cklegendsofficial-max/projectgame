import type { Slot } from "./rpg";

export interface GearMods {
  atk?: number;
  def?: number;
  hp?: number;
  crit?: number;
  heal?: number;
  army?: number;
  loot?: number;
  spd?: number;
  carry?: number;
  xp?: number;
}

export const MOD_TEXT: Record<keyof GearMods, (v: number) => string> = {
  atk: (v) => `Saldırı +%${Math.round(v * 100)}`,
  def: (v) => `Savunma +%${Math.round(v * 100)}`,
  hp: (v) => `Can +%${Math.round(v * 100)}`,
  crit: (v) => `Kritik +%${Math.round(v * 100)}`,
  heal: (v) => `Tur başı iyileşme +%${(v * 100).toFixed(1).replace(".0", "")}`,
  army: (v) => `Ordu gücü +%${Math.round(v * 100)}`,
  loot: (v) => `Ganimet +%${Math.round(v * 100)}`,
  spd: (v) => `Hız +%${Math.round(v * 100)}`,
  carry: (v) => `Yük +${v}`,
  xp: (v) => `Tecrübe +%${Math.round(v * 100)}`,
};

export function modsText(m: GearMods): string {
  return (Object.keys(m) as (keyof GearMods)[]).map((k) => MOD_TEXT[k](m[k]!)).join(" · ");
}

export function addMods(into: GearMods, m: GearMods, k = 1): void {
  for (const key of Object.keys(m) as (keyof GearMods)[]) into[key] = (into[key] ?? 0) + m[key]! * k;
}

export type SetId = "gokkurt" | "ejder" | "golge" | "tengri" | "ipek";
export const SET_KEYS: SetId[] = ["gokkurt", "ejder", "golge", "tengri", "ipek"];
export const SET_SLOTS: Slot[] = ["silah", "zirh", "at", "tilsim"];

export interface SetDef {
  name: string;
  color: string;
  lore: string;
  pieces: Record<string, string>;
  b2: GearMods;
  b4: GearMods;
}

export const SETS: Record<SetId, SetDef> = {
  gokkurt: {
    name: "Gök Kurt Takımı",
    color: "#7fc8ff",
    lore: "Ergenekon'dan çıkışta yol gösteren bozkurdun izinden gidenlerin takımı.",
    pieces: { silah: "Gök Kurt Pençesi", zirh: "Gök Kurt Postu", at: "Bozkurt Yeleli At", tilsim: "Gök Kurt Dişi" },
    b2: { army: 0.08 },
    b4: { atk: 0.12, crit: 0.06 },
  },
  ejder: {
    name: "Ejder Takımı",
    color: "#ff7a5c",
    lore: "Tanrı Dağları'nda uyuyan ejderin pullarından dövüldüğü söylenir.",
    pieces: { silah: "Ejder Dili", zirh: "Ejder Pulu Zırh", at: "Ateş Yeleli Küheylan", tilsim: "Ejder Yüreği" },
    b2: { def: 0.12, hp: 0.1 },
    b4: { atk: 0.1, heal: 0.03 },
  },
  golge: {
    name: "Gölge Takımı",
    color: "#b58cff",
    lore: "Kara Tamga'nın gece bekçilerinden kalma; ay ışığında bile görünmez.",
    pieces: { silah: "Gölge Kesiği", zirh: "Gece Örtüsü", at: "Kara Yel", tilsim: "Ay Tutulması" },
    b2: { crit: 0.05 },
    b4: { atk: 0.15, loot: 0.25 },
  },
  tengri: {
    name: "Tengri Takımı",
    color: "#ffe08a",
    lore: "Gök Tanrı'ya adanmış kamların kutlu emanetleri.",
    pieces: { silah: "Gök Gürlemesi", zirh: "Kutlu Cübbe", at: "Ak Boz At", tilsim: "Kut Muskası" },
    b2: { xp: 0.1, heal: 0.02 },
    b4: { army: 0.12, hp: 0.15 },
  },
  ipek: {
    name: "İpek Yolu Takımı",
    color: "#8fe07a",
    lore: "Doğu ile Batı arasında yüz kez gidip gelen ulu kervanbaşının mirası.",
    pieces: { silah: "Kervanbaşı Palası", zirh: "İpek Kaftan", at: "Bin Yol Devesi", tilsim: "Kervan Mührü" },
    b2: { carry: 60, spd: 0.06 },
    b4: { loot: 0.3, spd: 0.1 },
  },
};

export interface Unique {
  id: string;
  name: string;
  slot: Slot;
  lore: string;
  mods: GearMods;
}

export const UNIQUES: Unique[] = [
  { id: "tomris", name: "Tomris'in Kılıcı", slot: "silah", lore: "Pers kralı Kiros'u yenen Saka kraliçesinin intikam kılıcı.", mods: { atk: 0.2, crit: 0.05 } },
  { id: "dumrul", name: "Deli Dumrul'un Gürzü", slot: "silah", lore: "Köprüsünden geçen herkesten haraç alan Dumrul, Azrail'e bile meydan okudu.", mods: { atk: 0.28 } },
  { id: "kurt_hancer", name: "Kara Tamga Hançeri", slot: "silah", lore: "Destanın kara mührünü taşıyan, kanı ve altını kokusundan bulan hançer.", mods: { crit: 0.1, loot: 0.2 } },
  { id: "alper", name: "Alp Er Tunga'nın Zırhı", slot: "zirh", lore: "Turan hükümdarının zırhı; giyenin yüreğine dağ gibi sağlamlık verir.", mods: { hp: 0.2, def: 0.12 } },
  { id: "kursad", name: "Kürşad'ın Kalkanı", slot: "kalkan", lore: "Kırk yiğitle Çin sarayını basan Kürşad'ın son nefesine dek tuttuğu kalkan.", mods: { def: 0.2, heal: 0.02 } },
  { id: "bilge", name: "Bilge Kağan Mührü", slot: "tilsim", lore: "\"Türk milleti, titre ve kendine dön!\" yazılı taşın gölgesinde kazındı.", mods: { army: 0.12, xp: 0.1 } },
  { id: "umay", name: "Umay'ın Gözyaşı", slot: "tilsim", lore: "Çocukları ve savaşçıları koruyan ana tanrıçanın ışıldayan gözyaşı.", mods: { heal: 0.04, hp: 0.1 } },
  { id: "boz_at", name: "Boz Atlı Hızır'ın Atı", slot: "at", lore: "Darda kalana yetişen Hızır'ın atı; yolları kısaltır, yükü hafifletir.", mods: { spd: 0.25, carry: 80 } },
];

export const UNIQUE_BY_ID: Record<string, Unique> = Object.fromEntries(UNIQUES.map((u) => [u.id, u]));

export const SET_FORGE = { lv: 15, gold: 2500, ruh: 8, parsomen: 2, yesim: 3 };
