export type Stat = "guc" | "cev" | "day" | "lid" | "kar";
export const STAT_KEYS: Stat[] = ["guc", "cev", "day", "lid", "kar"];
export const STAT_INFO: Record<Stat, { name: string; desc: string; icon: string }> = {
  guc: { name: "Güç", desc: "Kılıç hasarı, çalışma verimi ve taşıma kapasitesi", icon: "r_sword" },
  cev: { name: "Çeviklik", desc: "Yay hasarı ve yürüyüş hızı", icon: "r_bow" },
  day: { name: "Dayanıklılık", desc: "Can, enerji ve savunma", icon: "shield" },
  lid: { name: "Liderlik", desc: "Birlik büyüklüğü ve askerlerin saldırı gücü", icon: "tug" },
  kar: { name: "Karizma", desc: "Gönüllü sayısı, asker ücreti ve pazar fiyatları", icon: "crown" },
};

export type Skill = "kilic" | "ok" | "ticaret" | "emek";
export const SKILL_KEYS: Skill[] = ["kilic", "ok", "ticaret", "emek"];
export const SKILL_INFO: Record<Skill, { name: string; desc: string; icon: string }> = {
  kilic: { name: "Kılıç", desc: "Kılıçla verdiğin hasarı artırır. Talim meydanında ve savaşta gelişir.", icon: "it_sword_2" },
  ok: { name: "Okçuluk", desc: "Yayla verdiğin hasarı artırır. Talim meydanında ve savaşta gelişir.", icon: "it_bow_2" },
  ticaret: { name: "Ticaret", desc: "Alış-satış fiyatlarını iyileştirir. Pazarda alışveriş yaptıkça gelişir.", icon: "merchant" },
  emek: { name: "Emek", desc: "Ormanda, ocakta ve tarlada çalışma verimini artırır.", icon: "mat_wood" },
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
  kind: "kilic" | "ok" | "";
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
}

export const RARITY = [
  { name: "Sıradan", mult: 1, color: "#e8dcc0" },
  { name: "İyi", mult: 1.25, color: "#8fe07a" },
  { name: "Nadir", mult: 1.55, color: "#6ab8ff" },
  { name: "Destansı", mult: 2, color: "#d58cff" },
];

const SWORDS = ["Paslı Kılıç", "Demir Kılıç", "Çelik Pala", "Şam Kılıcı", "Hükümdar Kılıcı"];
const BOWS = ["Av Yayı", "Kompozit Yay", "Türk Yayı", "Usta Yayı", "Hakan Yayı"];
const ARMORS = ["Keçe Yelek", "Deri Zırh", "Zincir Zırh", "Lamel Zırh", "Altın Lamel"];
const SHIELDS = ["Hasır Kalkan", "Ahşap Kalkan", "Demir Kalkan", "Tolga Kalkan", "Ejder Kalkan"];
const MOUNTS = ["Katır", "Bozkır Atı", "Arap Atı"];
const CHARMS = [
  { name: "Kurt Dişi", icon: "tr_wolf" },
  { name: "Kartal Tüyü", icon: "tr_feather" },
  { name: "Yeşim Göz", icon: "tr_jadeeye" },
  { name: "Kristal Muska", icon: "tr_crystal" },
  { name: "Yıldız Taşı", icon: "tr_star" },
];

export function makeItem(id: number, slot: Slot, tier: number, rar: number, kind: "kilic" | "ok" | "" = ""): Item {
  tier = Math.max(1, Math.min(5, tier));
  const m = RARITY[rar].mult;
  const it: Item = { id, slot, kind: "", tier, rar, name: "", icon: "", atk: 0, def: 0, hp: 0, spd: 0, carry: 0, lid: 0, kar: 0 };
  const t = tier - 1;
  if (slot === "silah") {
    it.kind = kind || "kilic";
    if (it.kind === "kilic") {
      it.name = SWORDS[t];
      it.icon = `it_sword_${tier}`;
      it.atk = Math.round([4, 8, 13, 19, 27][t] * m);
    } else {
      it.name = BOWS[t];
      it.icon = `it_bow_${tier}`;
      it.atk = Math.round([5, 9, 14, 21, 30][t] * m);
    }
  } else if (slot === "zirh") {
    it.name = ARMORS[t];
    it.icon = `it_armor_${tier}`;
    it.def = Math.round([3, 6, 10, 15, 22][t] * m);
    it.hp = Math.round([5, 10, 18, 28, 40][t] * m);
  } else if (slot === "kalkan") {
    it.name = SHIELDS[t];
    it.icon = `it_shield_${tier}`;
    it.def = Math.round([2, 4, 7, 11, 16][t] * m);
  } else if (slot === "at") {
    const k = Math.min(2, Math.floor(t / 2 + 0.5));
    it.tier = k * 2 + 1;
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

export function rollItem(id: number, tier: number, luck = 0): Item {
  const slots: Slot[] = ["silah", "silah", "zirh", "zirh", "kalkan", "at", "tilsim"];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const r = Math.random() + luck;
  const rar = r > 0.97 ? 3 : r > 0.85 ? 2 : r > 0.6 ? 1 : 0;
  const t = Math.max(1, Math.min(5, tier + (Math.random() < 0.25 ? 1 : 0) - (Math.random() < 0.25 ? 1 : 0)));
  return makeItem(id, slot, t, rar, Math.random() < 0.5 ? "kilic" : "ok");
}

export function itemPrice(it: Item): number {
  return Math.round(30 * Math.pow(it.tier, 2.1) * RARITY[it.rar].mult * (it.slot === "at" ? 1.6 : 1));
}

export function itemStats(it: Item): string {
  const p: string[] = [];
  if (it.atk) p.push(`Saldırı ${it.atk}${it.kind === "ok" ? " (yay)" : ""}`);
  if (it.def) p.push(`Savunma ${it.def}`);
  if (it.hp) p.push(`Can +${it.hp}`);
  if (it.spd) p.push(`Hız +%${Math.round(it.spd * 100)}`);
  if (it.carry) p.push(`Yük +${it.carry}`);
  if (it.lid) p.push(`Liderlik +${it.lid}`);
  if (it.kar) p.push(`Karizma +${it.kar}`);
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
