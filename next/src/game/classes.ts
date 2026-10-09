import type { Stat } from "./rpg";
import { t } from "../i18n";

export type ClassId = "alp" | "bahadir" | "suikastci" | "hirsiz" | "kam";
export type WeaponKind = "kilic" | "balta" | "hancer" | "ok" | "asa";
export type ArmorKind = "agir" | "hafif";

export interface ClassMods {
  atk: number;
  def: number;
  army: number;
  crit: number;
  critMult: number;
  dodge: number;
  heal: number;
  loot: number;
  trade: number;
  revive: number;
  rage: boolean;
  firstStrike: boolean;
}

export interface ClassDef {
  id: ClassId;
  name: string;
  role: string;
  portrait: string;
  desc: string;
  primary: [Stat, Stat];
  start: Record<Stat, number>;
  weapons: WeaponKind[];
  armor: ArmorKind;
  shield: boolean;
  passive: string;
  mods: ClassMods;
  color: string;
}

const M = (m: Partial<ClassMods>): ClassMods => ({ atk: 1, def: 1, army: 0, crit: 0.05, critMult: 1.8, dodge: 0, heal: 0, loot: 1, trade: 0, revive: 0, rage: false, firstStrike: false, ...m });

export const CLASSES: ClassDef[] = [
  {
    id: "alp",
    name: "Alp",
    role: "Zırhlı süvari · Siper ve komutan",
    portrait: "heroes/cls_alp",
    desc: "Ağır zırhlı, kalkanlı bozkır alpı. Birliğinin önünde durur, askerlerini güçlendirir. Büyük ordularla savaşmak isteyenler için.",
    primary: ["day", "lid"],
    start: { guc: 2, cev: 1, day: 3, lid: 3, kar: 1 },
    weapons: ["kilic"],
    armor: "agir",
    shield: true,
    passive: "Kalkan Duvarı: savunman %25, askerlerinin gücü %15 artar.",
    mods: M({ def: 1.25, army: 0.15 }),
    color: "#6ab8ff",
  },
  {
    id: "bahadir",
    name: "Bahadır",
    role: "Savaşçı · Yakın dövüş hasarı",
    portrait: "heroes/cls_bahadir",
    desc: "İki elli baltasıyla savaş meydanına dalan öfkeli savaşçı. Kalkan taşımaz ama vurduğunu yere serer.",
    primary: ["guc", "day"],
    start: { guc: 4, cev: 1, day: 3, lid: 1, kar: 1 },
    weapons: ["balta", "kilic"],
    armor: "agir",
    shield: false,
    passive: "Öfke: saldırın %20 fazla; canın yarının altına düşünce %30 daha artar.",
    mods: M({ atk: 1.2, rage: true }),
    color: "#ff7a5a",
  },
  {
    id: "suikastci",
    name: "Suikastçı",
    role: "Fedai · Kritik vuruş ve ilk darbe",
    portrait: "heroes/cls_suikastci",
    desc: "Gölgelerden çıkan, hançer ve yay ustası. Savaş başlamadan ilk darbeyi vurur, kritik vuruşları ölümcüldür.",
    primary: ["cev", "guc"],
    start: { guc: 2, cev: 4, day: 1, lid: 1, kar: 2 },
    weapons: ["hancer", "ok"],
    armor: "hafif",
    shield: false,
    passive: "Gölge Darbesi: savaş başında bedava bir saldırı; %30 kritik şansı, kritikler 2,2 kat vurur.",
    mods: M({ crit: 0.3, critMult: 2.2, firstStrike: true }),
    color: "#d24a6a",
  },
  {
    id: "hirsiz",
    name: "Hırsız",
    role: "Yol kesen · Kaçınma, ganimet ve ticaret",
    portrait: "heroes/cls_hirsiz",
    desc: "Dili tatlı, eli çabuk bir yol kurdu. Darbelerden sıyrılır, düşmanın kesesini boşaltır, pazarda herkesi kandırır.",
    primary: ["cev", "kar"],
    start: { guc: 1, cev: 3, day: 2, lid: 1, kar: 3 },
    weapons: ["hancer", "ok"],
    armor: "hafif",
    shield: false,
    passive: "Çevik El: saldırıların %25'inden kaçarsın; %40 fazla altın ve eşya ganimeti; pazarda daha iyi fiyat.",
    mods: M({ dodge: 0.25, loot: 1.4, trade: 0.04 }),
    color: "#8fe07a",
  },
  {
    id: "kam",
    name: "Kam",
    role: "Ruh çağıran · İyileştirme ve destek",
    portrait: "heroes/cls_kam",
    desc: "Gök Tengri'nin ruhlarıyla konuşan kam. Savaşta kendini iyileştirir, düşen askerlerini hayata döndürür.",
    primary: ["kar", "day"],
    start: { guc: 1, cev: 1, day: 3, lid: 2, kar: 3 },
    weapons: ["asa"],
    armor: "hafif",
    shield: false,
    passive: "Ruh Çağrısı: her tur canının %7'sini yeniler; zaferden sonra kayıp askerlerinin %25'i geri döner; askerlerin %8 güçlü.",
    mods: M({ heal: 0.07, revive: 0.25, army: 0.08 }),
    color: "#c58cff",
  },
];

export type SkillKind = "burst" | "poison" | "evade" | "shield" | "aura" | "fury" | "steal" | "drain" | "stun" | "slayer" | "rally";

export interface ClassSkill {
  id: string;
  name: string;
  icon: string;
  kind: SkillKind;
  unlock: number;
  base: number;
  per: number;
  text: (p: number) => string;
}

export const SKILL_MAX = 10;
const pct = (p: number) => `%${Math.round(p * 100)}`;

export const CLASS_SKILLS: Record<ClassId, ClassSkill[]> = {
  alp: [
    { id: "hucum", name: "Kalkan Hücumu", icon: "sk_hucum", kind: "burst", unlock: 3, base: 1.1, per: 0.15, text: (p) => `Her 3 turda bir kalkanınla düşman safına dalarsın: saldırının ${pct(p)} kadar alan hasarı.` },
    { id: "duvar", name: "Demir Duvar", icon: "sk_duvar", kind: "shield", unlock: 6, base: 0.2, per: 0.035, text: (p) => `İlk 3 tur sen ve birliğin ${pct(p)} daha az hasar alırsınız.` },
    { id: "sancak", name: "Hakan Sancağı", icon: "tug", kind: "rally", unlock: 10, base: 0.12, per: 0.03, text: (p) => `Sancağın dalgalandıkça askerlerin coşar: 4 turda birlik saldırısı ${pct(p)} artar.` },
    { id: "ulukalkan", name: "Ulu Kalkan", icon: "it_shield_5", kind: "stun", unlock: 15, base: 0.4, per: 0.04, text: (p) => `Her 4 turda bir kalkanınla düşmanı sersemletirsin: o tur ${pct(p)} daha az hasar alırsınız.` },
  ],
  bahadir: [
    { id: "girdap", name: "Kan Girdabı", icon: "sk_girdap", kind: "burst", unlock: 3, base: 1.5, per: 0.2, text: (p) => `Her 3 turda baltanı döndürürsün: saldırının ${pct(p)} kadar alan hasarı.` },
    { id: "ciglik", name: "Savaş Çığlığı", icon: "sk_ciglik", kind: "fury", unlock: 6, base: 0.1, per: 0.03, text: (p) => `Savaş boyunca saldırın ${pct(p)} artar.` },
    { id: "kanasusamis", name: "Kana Susamış", icon: "tr_mane", kind: "drain", unlock: 10, base: 0.3, per: 0.06, text: (p) => `Verdiğin hasarın ${pct(p * 0.4)} kadarı canına döner.` },
    { id: "ejder", name: "Ejder Kesiği", icon: "it_axe_5", kind: "slayer", unlock: 15, base: 0.35, per: 0.07, text: (p) => `Boss'lara ${pct(p)}, ordulara ${pct(p / 2)} fazla hasar.` },
  ],
  suikastci: [
    { id: "zehir", name: "Zehirli Hançer", icon: "sk_zehir", kind: "poison", unlock: 3, base: 0.25, per: 0.06, text: (p) => `Zehir her tur düşmana saldırının ${pct(p)} kadar hasar verir.` },
    { id: "golge", name: "Gölge Adımı", icon: "sk_golge", kind: "evade", unlock: 6, base: 0.08, per: 0.02, text: (p) => `Kaçınma şansın ${pct(p)} artar.` },
    { id: "basavcisi", name: "Baş Avcısı", icon: "wanted", kind: "slayer", unlock: 10, base: 0.4, per: 0.08, text: (p) => `Liderleri hedef alırsın: boss'lara ${pct(p)}, ordulara ${pct(p / 2)} fazla hasar.` },
    { id: "olumdansi", name: "Ölüm Dansı", icon: "it_dagger_5", kind: "burst", unlock: 15, base: 2, per: 0.25, text: (p) => `Her 3 turda gölgeler arasında dans edersin: saldırının ${pct(p)} kadar hasar.` },
  ],
  hirsiz: [
    { id: "kese", name: "Kese Kesme", icon: "sk_kese", kind: "steal", unlock: 3, base: 0.2, per: 0.08, text: (p) => `Zaferlerden ${pct(p)} fazla altın çalarsın.` },
    { id: "duman", name: "Duman Bombası", icon: "sk_duman", kind: "shield", unlock: 6, base: 0.25, per: 0.04, text: (p) => `İlk 3 tur duman içinde düşman ${pct(p)} daha az isabet ettirir.` },
    { id: "gozboyama", name: "Göz Boyama", icon: "spices", kind: "stun", unlock: 10, base: 0.35, per: 0.05, text: (p) => `Her 4 turda düşmanın gözüne baharat savurursun: o tur ${pct(p)} daha az hasar alırsınız.` },
    { id: "kalles", name: "Kalleş Bıçak", icon: "it_dagger_4", kind: "poison", unlock: 15, base: 0.35, per: 0.07, text: (p) => `Sırttan saplanan bıçak her tur saldırının ${pct(p)} kadar hasar verir.` },
  ],
  kam: [
    { id: "gazap", name: "Tengri'nin Gazabı", icon: "sk_gazap", kind: "burst", unlock: 3, base: 1.3, per: 0.18, text: (p) => `Her 3 turda gökten yıldırım indirirsin: saldırının ${pct(p)} kadar alan hasarı.` },
    { id: "kurt", name: "Kurt Ruhu", icon: "sk_kurt", kind: "aura", unlock: 6, base: 0.06, per: 0.025, text: (p) => `Atalarının kurt ruhu birliğinin gücünü ${pct(p)} artırır.` },
    { id: "atalar", name: "Atalar Çağrısı", icon: "tr_star", kind: "rally", unlock: 10, base: 0.1, per: 0.03, text: (p) => `Ataların ruhları savaşa katılır: 4 turda birlik saldırısı ${pct(p)} artar.` },
    { id: "gokgurultu", name: "Gök Gürültüsü", icon: "tr_crystal", kind: "stun", unlock: 15, base: 0.4, per: 0.05, text: (p) => `Her 4 turda gök gürler, düşman korkuyla siner: o tur ${pct(p)} daha az hasar alırsınız.` },
  ],
};

export function skillPow(sk: ClassSkill, lv: number): number {
  return lv <= 0 ? 0 : sk.base + sk.per * (lv - 1);
}

export function skillRank(lv: number): string {
  return lv >= SKILL_MAX ? t("Usta") : lv <= 0 ? t("Kilitli") : `${t("Sv")} ${lv}`;
}

export const CLASS_BY_ID = Object.fromEntries(CLASSES.map((c) => [c.id, c])) as Record<ClassId, ClassDef>;

export const WEAPON_STAT: Record<WeaponKind, Stat> = { kilic: "guc", balta: "guc", hancer: "cev", ok: "cev", asa: "kar" };
export const WEAPON_NAME: Record<WeaponKind, string> = { kilic: "Kılıç", balta: "Balta", hancer: "Hançer", ok: "Yay", asa: "Asa" };
export const ARMOR_NAME: Record<ArmorKind, string> = { agir: "Ağır zırh", hafif: "Hafif zırh" };
