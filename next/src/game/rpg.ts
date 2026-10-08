import { WEAPON_NAME, WEAPON_STAT, type ArmorKind, type ClassDef, type WeaponKind } from "./classes";
import { SETS, modsText, type GearMods, type SetId, type Unique } from "./legend";

export type Stat = "guc" | "cev" | "day" | "lid" | "kar";
export const STAT_KEYS: Stat[] = ["guc", "cev", "day", "lid", "kar"];
export const STAT_INFO: Record<Stat, { name: string; short: string; desc: string; icon: string }> = {
  guc: { name: "Güç", short: "GÜÇ", desc: "Kılıç ve balta hasarı, çalışma verimi, taşıma kapasitesi", icon: "r_sword" },
  cev: { name: "Çeviklik", short: "ÇEV", desc: "Hançer ve yay hasarı, yürüyüş hızı", icon: "r_bow" },
  day: { name: "Dayanıklılık", short: "DAY", desc: "Can, enerji ve savunma", icon: "shield" },
  lid: { name: "Liderlik", short: "LİD", desc: "Birlik büyüklüğü ve askerlerin saldırı gücü", icon: "tug" },
  kar: { name: "Karizma", short: "KAR", desc: "Asa hasarı, gönüllü sayısı, asker ücreti ve pazar fiyatları", icon: "crown" },
};

export type Skill = "silah" | "ticaret" | "emek" | "zanaat";
export const SKILL_KEYS: Skill[] = ["silah", "ticaret", "emek", "zanaat"];
export const SKILL_INFO: Record<Skill, { name: string; desc: string; icon: string }> = {
  silah: { name: "Silah Ustalığı", desc: "Silahınla verdiğin hasarı her seviyede %6 artırır. Talim meydanında ve savaşta gelişir.", icon: "swords" },
  ticaret: { name: "Ticaret", desc: "Alış-satış fiyatlarını iyileştirir. Pazarda alışveriş yaptıkça gelişir.", icon: "merchant" },
  emek: { name: "Emek", desc: "Ormanda, ocakta ve tarlada çalışma verimini artırır.", icon: "mat_wood" },
  zanaat: { name: "Zanaat", desc: "Atölyede ürettikçe gelişir; nadir ve efsanevi eşya çıkarma şansını artırır.", icon: "anvil" },
};

export function skillLv(xp: number): number {
  return Math.min(50, Math.floor(Math.sqrt(xp / 20)));
}

export function skillNext(lv: number): number {
  return 20 * (lv + 1) * (lv + 1);
}

export type Slot = "silah" | "zirh" | "kalkan" | "at" | "tilsim";
export const SLOTS: Slot[] = ["silah", "zirh", "kalkan", "at", "tilsim"];
export const SLOT_NAME: Record<Slot, string> = { silah: "Silah", zirh: "Zırh", kalkan: "Kalkan", at: "Binek", tilsim: "Tılsım" };

export interface Item {
  id: number;
  slot: Slot;
  kind: WeaponKind | ArmorKind | "";
  tier: number;
  rar: number;
  name: string;
  icon: string;
  atk: number;
  def: number;
  hp: number;
  spd: number;
  carry: number;
  lid: number;
  kar: number;
  crit: number;
  lvReq: number;
  req: { stat: Stat; v: number } | null;
  plus?: number;
  base?: { atk: number; def: number; hp: number; name: string };
  set?: SetId;
  uq?: string;
  mods?: GearMods;
}

export function setPiece(id: number, cls: ClassDef, set: SetId, slot: Slot, tier: number): Item {
  const it = classItem(id, cls, slot, tier, 4);
  it.name = SETS[set].pieces[slot];
  it.set = set;
  return it;
}

export function uniqueItem(id: number, cls: ClassDef, u: Unique, tier: number): Item {
  const slot = u.slot === "kalkan" && !cls.shield ? "tilsim" : u.slot;
  const it = classItem(id, cls, slot, tier, 4);
  it.name = u.name;
  it.uq = u.id;
  it.mods = { ...u.mods };
  return it;
}

export const PLUS_MAX = 9;
export const PLUS_CHANCE = [1, 0.95, 0.9, 0.8, 0.7, 0.55, 0.42, 0.3, 0.2];

export function canPlus(it: Item): boolean {
  return (it.slot === "silah" || it.slot === "zirh" || it.slot === "kalkan") && (it.plus ?? 0) < PLUS_MAX;
}

export function plusCost(it: Item): { gold: number; ruh: number } {
  const p = it.plus ?? 0;
  return { gold: Math.round(itemPrice(it) * 0.25 * (p + 1)), ruh: p >= 3 ? p - 2 : 0 };
}

export function setPlus(it: Item, p: number): void {
  it.base ??= { atk: it.atk, def: it.def, hp: it.hp, name: it.name };
  it.plus = Math.max(0, Math.min(PLUS_MAX, p));
  const m = 1 + 0.13 * it.plus;
  it.atk = Math.round(it.base.atk * m + (it.base.atk ? it.plus : 0));
  it.def = Math.round(it.base.def * m + (it.base.def ? it.plus * 0.5 : 0));
  it.hp = Math.round(it.base.hp * m);
  it.name = it.plus ? `${it.base.name} +${it.plus}` : it.base.name;
}

export const RARITY = [
  { name: "Sıradan", mult: 1, color: "#e8dcc0" },
  { name: "İyi", mult: 1.25, color: "#8fe07a" },
  { name: "Nadir", mult: 1.55, color: "#6ab8ff" },
  { name: "Destansı", mult: 2, color: "#d58cff" },
  { name: "Efsanevi", mult: 2.6, color: "#ff9a3c" },
];

const WEAPONS: Record<WeaponKind, { names: string[]; icon: string; atk: number[]; crit: number }> = {
  kilic: { names: ["Paslı Kılıç", "Demir Kılıç", "Çelik Pala", "Şam Kılıcı", "Hükümdar Kılıcı"], icon: "it_sword_", atk: [4, 8, 13, 19, 27], crit: 0 },
  balta: { names: ["Odun Baltası", "Savaş Baltası", "Çift Ağızlı Balta", "Tolga Baltası", "Ejder Baltası"], icon: "it_axe_", atk: [6, 11, 17, 25, 35], crit: 0 },
  hancer: { names: ["Kör Hançer", "Demir Hançer", "Kıvrık Hançer", "Gölge Hançeri", "Ateş Hançeri"], icon: "it_dagger_", atk: [3, 7, 11, 17, 24], crit: 0.08 },
  ok: { names: ["Av Yayı", "Kompozit Yay", "Türk Yayı", "Usta Yayı", "Hakan Yayı"], icon: "it_bow_", atk: [4, 8, 13, 19, 27], crit: 0.04 },
  asa: { names: ["Ardıç Asa", "Kemik Asa", "Kristal Asa", "Tengri Asası", "Gök Kurt Asası"], icon: "it_staff_", atk: [4, 7, 12, 18, 25], crit: 0 },
};
const HEAVY = ["Keçe Yelek", "Deri Zırh", "Zincir Zırh", "Lamel Zırh", "Altın Lamel"];
const LIGHT = ["Deri Yelek", "Bağcıklı Deri", "Sertleştirilmiş Deri", "Gece Zırhı", "Gölge Cübbesi"];
const SHIELDS = ["Hasır Kalkan", "Ahşap Kalkan", "Demir Kalkan", "Tolga Kalkan", "Ejder Kalkan"];
const MOUNTS = ["Katır", "Bozkır Atı", "Arap Atı"];
const CHARMS = [
  { name: "Kurt Dişi", icon: "tr_wolf" },
  { name: "Kartal Tüyü", icon: "tr_feather" },
  { name: "Yeşim Göz", icon: "tr_jadeeye" },
  { name: "Kristal Muska", icon: "tr_crystal" },
  { name: "Yıldız Taşı", icon: "tr_star" },
];
export const WEAPON_KINDS: WeaponKind[] = ["kilic", "balta", "hancer", "ok", "asa"];

export function makeItem(id: number, slot: Slot, tier: number, rar: number, kind: WeaponKind | ArmorKind | "" = ""): Item {
  tier = Math.max(1, Math.min(5, tier));
  const m = RARITY[rar].mult;
  const it: Item = { id, slot, kind: "", tier, rar, name: "", icon: "", atk: 0, def: 0, hp: 0, spd: 0, carry: 0, lid: 0, kar: 0, crit: 0, lvReq: (tier - 1) * 3 + 1, req: null };
  const t = tier - 1;
  const need = 1 + t * 3;
  if (slot === "silah") {
    const k = (WEAPON_KINDS as string[]).includes(kind) ? (kind as WeaponKind) : "kilic";
    const w = WEAPONS[k];
    it.kind = k;
    it.name = w.names[t];
    it.icon = w.icon + tier;
    it.atk = Math.round(w.atk[t] * m);
    it.crit = w.crit;
    it.req = { stat: WEAPON_STAT[k], v: need };
  } else if (slot === "zirh") {
    const heavy = kind !== "hafif";
    it.kind = heavy ? "agir" : "hafif";
    it.name = (heavy ? HEAVY : LIGHT)[t];
    it.icon = heavy ? `it_armor_${tier}` : `it_light_${tier}`;
    it.def = Math.round((heavy ? [3, 6, 10, 15, 22] : [2, 4, 7, 11, 16])[t] * m);
    it.hp = Math.round((heavy ? [5, 10, 18, 28, 40] : [4, 8, 14, 22, 32])[t] * m);
    if (heavy) it.req = { stat: "guc", v: need };
  } else if (slot === "kalkan") {
    it.name = SHIELDS[t];
    it.icon = `it_shield_${tier}`;
    it.def = Math.round([2, 4, 7, 11, 16][t] * m);
    it.req = { stat: "day", v: need };
  } else if (slot === "at") {
    const k = Math.min(2, Math.floor(t / 2 + 0.5));
    it.tier = k * 2 + 1;
    it.lvReq = k * 5 + 1;
    it.name = MOUNTS[k];
    it.icon = `mount_${k + 1}`;
    it.spd = Math.round([10, 22, 35][k] * m) / 100;
    it.carry = Math.round([30, 50, 80][k] * m);
  } else {
    it.name = CHARMS[t].name;
    it.icon = CHARMS[t].icon;
    it.lid = Math.round(tier * 0.6 * m + 0.4);
    it.kar = Math.round(tier * 0.6 * m);
  }
  if (rar > 0) it.name = `${RARITY[rar].name} ${it.name}`;
  return it;
}

export function classItem(id: number, cls: ClassDef, slot: Slot, tier: number, rar: number): Item {
  if (slot === "silah") return makeItem(id, slot, tier, rar, cls.weapons[Math.floor(Math.random() * cls.weapons.length)]);
  if (slot === "zirh") return makeItem(id, slot, tier, rar, cls.armor);
  return makeItem(id, slot, tier, rar);
}

export function rollItem(id: number, tier: number, cls: ClassDef | null, luck = 0): Item {
  const slots: Slot[] = ["silah", "silah", "zirh", "zirh", "kalkan", "at", "tilsim"];
  let slot = slots[Math.floor(Math.random() * slots.length)];
  const r = Math.random() + luck;
  const rar = r > 0.97 ? 3 : r > 0.85 ? 2 : r > 0.6 ? 1 : 0;
  const t = Math.max(1, Math.min(5, tier + (Math.random() < 0.25 ? 1 : 0) - (Math.random() < 0.25 ? 1 : 0)));
  if (cls && Math.random() < 0.65) {
    if (slot === "kalkan" && !cls.shield) slot = "zirh";
    return classItem(id, cls, slot, t, rar);
  }
  const kind = slot === "silah" ? WEAPON_KINDS[Math.floor(Math.random() * 5)] : slot === "zirh" ? (Math.random() < 0.5 ? "agir" : "hafif") : "";
  return makeItem(id, slot, t, rar, kind);
}

export function itemPrice(it: Item): number {
  return Math.round(30 * Math.pow(it.tier, 2.1) * RARITY[it.rar].mult * (it.slot === "at" ? 1.6 : 1) * (1 + 0.3 * (it.plus ?? 0)) * (it.set || it.uq ? 2.5 : 1));
}

export function kindName(it: Item): string {
  if (it.slot === "silah") return WEAPON_NAME[it.kind as WeaponKind];
  if (it.slot === "zirh") return it.kind === "agir" ? "Ağır zırh" : "Hafif zırh";
  return SLOT_NAME[it.slot];
}

export function itemStats(it: Item): string {
  const p: string[] = [];
  if (it.atk) p.push(`Saldırı ${it.atk}`);
  if (it.crit) p.push(`Kritik +%${Math.round(it.crit * 100)}`);
  if (it.def) p.push(`Savunma ${it.def}`);
  if (it.hp) p.push(`Can +${it.hp}`);
  if (it.spd) p.push(`Hız +%${Math.round(it.spd * 100)}`);
  if (it.carry) p.push(`Yük +${it.carry}`);
  if (it.lid) p.push(`Liderlik +${it.lid}`);
  if (it.kar) p.push(`Karizma +${it.kar}`);
  if (it.mods) p.push(modsText(it.mods));
  return p.join(" · ");
}

export type Good = "pamuk" | "deri" | "demir" | "baharat" | "hali" | "ipek" | "porselen" | "turkuaz" | "yesim" | "gumus";
export const GOOD_KEYS: Good[] = ["pamuk", "deri", "demir", "baharat", "hali", "gumus", "turkuaz", "ipek", "porselen", "yesim"];
export const GOODS: Record<Good, { name: string; icon: string; base: number }> = {
  pamuk: { name: "Pamuk", icon: "cotton", base: 12 },
  deri: { name: "Deri", icon: "mat_leather", base: 16 },
  demir: { name: "Demir", icon: "mat_iron", base: 22 },
  baharat: { name: "Baharat", icon: "spices", base: 40 },
  hali: { name: "Halı", icon: "carpets", base: 52 },
  gumus: { name: "Gümüş", icon: "silver", base: 48 },
  turkuaz: { name: "Turkuaz", icon: "turquoise", base: 60 },
  ipek: { name: "İpek", icon: "silk", base: 70 },
  porselen: { name: "Porselen", icon: "porcelain", base: 85 },
  yesim: { name: "Yeşim", icon: "jade", base: 95 },
};

export const CITY_TRADE: Record<string, { cheap: Good[]; dear: Good[]; tier: [number, number] }> = {
  kashgar: { cheap: ["ipek", "porselen", "yesim"], dear: ["gumus", "hali", "demir"], tier: [2, 4] },
  samarkand: { cheap: ["pamuk", "hali"], dear: ["porselen", "baharat"], tier: [1, 2] },
  bukhara: { cheap: ["pamuk", "deri"], dear: ["ipek", "yesim"], tier: [1, 2] },
  merv: { cheap: ["deri", "turkuaz"], dear: ["pamuk", "porselen"], tier: [1, 3] },
  nishapur: { cheap: ["turkuaz", "demir"], dear: ["ipek", "deri"], tier: [2, 3] },
  rey: { cheap: ["baharat", "demir"], dear: ["turkuaz", "yesim"], tier: [2, 4] },
  tabriz: { cheap: ["hali", "gumus"], dear: ["baharat", "ipek"], tier: [3, 4] },
  konya: { cheap: ["gumus", "deri"], dear: ["hali", "porselen"], tier: [3, 5] },
  constantinople: { cheap: ["gumus", "demir"], dear: ["ipek", "baharat", "porselen", "yesim"], tier: [4, 5] },
};

export function goodMult(city: string, g: Good): number {
  const t = CITY_TRADE[city];
  if (t.cheap.includes(g)) return 0.6;
  if (t.dear.includes(g)) return 1.55;
  return 1;
}
