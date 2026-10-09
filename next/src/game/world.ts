import { TACTICS, TACTIC_KEYS, type Tactic } from "./battle";
import { FACTIONS, FACTION_KEYS, type FactionId } from "./factions";

/** Dünya nabzı: oyuncudan bağımsız yaşayan devletler, doğa, ekonomi, hafıza ve çağlar. */

export type Style = "savas" | "ticaret" | "kesif" | "is" | "kusatma";
export const STYLE_KEYS: Style[] = ["savas", "ticaret", "kesif", "is", "kusatma"];
export const STYLE_NAME: Record<Style, string> = { savas: "Akıncı", ticaret: "Tüccar", kesif: "Gezgin", is: "Emekçi", kusatma: "Kuşatmacı" };

export interface War {
  a: FactionId;
  b: FactionId;
  since: number;
  /** >0 a kazanıyor, <0 b kazanıyor; ±WAR_TAKE'de şehir/kale düşer */
  score: number;
  side: FactionId | null;
  /** oyuncunun bu savaştaki katkısı */
  help: number;
  /** a'nın aldığı yer sayısı eksi b'ninki */
  takes: number;
}

export interface Deed {
  d: number;
  good: boolean;
  x: number;
  y: number;
  what: string;
  paid?: boolean;
}

export type EraId = "kurulus" | "istila" | "yikim" | "altin";

export interface WorldState {
  wars: War[];
  peaceUntil: Record<string, number>;
  occ: Record<string, FactionId>;
  /** şehir kıtlığı 0..10 (yağma, yol kesilmesi, kuraklık) */
  short: Record<string, number>;
  riotDay: Record<string, number>;
  wolves: number;
  drought: { until: number; x: number; y: number } | null;
  era: EraId;
  eraDay: number;
  deeds: Deed[];
  acts: { d: number; k: Style }[];
  surpriseDay: number;
  tac: Record<Tactic, number>;
  tacWarn: number;
  fest: string[];
  nevruz: number;
}

export function newWorld(): WorldState {
  return {
    wars: [],
    peaceUntil: {},
    occ: {},
    short: {},
    riotDay: {},
    wolves: 45,
    drought: null,
    era: "kurulus",
    eraDay: 0,
    deeds: [],
    acts: [],
    surpriseDay: 0,
    tac: { hucum: 0, duvar: 0, pusu: 0 },
    tacWarn: 0,
    fest: [],
    nevruz: -1,
  };
}

/* ---------------- Savaşlar ---------------- */

export const WAR_TAKE = 100;
export const WAR_MIN_DAY = 12;
export const WAR_CHANCE = 0.06;
export const WAR_MAX_DAYS = 45;
export const PEACE_GAP = 20;
/** Bu şehirler el değiştirmez (başkentler ve Semerkant kurultayı). */
export const SAFE_CITIES = ["samarkand", ...FACTION_KEYS.map((f) => FACTIONS[f].cities[0])];

export function warKey(a: FactionId, b: FactionId): string {
  return [a, b].sort().join("-");
}

export const WAR_PAIRS: [FactionId, FactionId][] = [
  ["karahan", "gazne"],
  ["gazne", "selcuk"],
  ["selcuk", "bizans"],
  ["karahan", "selcuk"],
];

export const WAR_CAUSES = [
  "Sınırdaki bir kervansaray yüzünden elçiler kılıç çekti.",
  "Bir şehzadenin düğününde sunulan hediye hakaret sayıldı.",
  "Su kanallarının paylaşımı kan davasına döndü.",
  "Kaçak bir vezir düşman sarayına sığındı.",
  "Sınır boylarındaki obalar birbirinin sürüsüne akın etti.",
  "Bir sikkenin üzerindeki ad, öteki hükümdarı küçük düşürdü.",
];

/* ---------------- Uyumlu düşman taktiği ---------------- */

export function counterOf(t: Tactic): Tactic {
  return TACTIC_KEYS.find((k) => TACTICS[k].beats === t) ?? "duvar";
}

export function favTactic(tac: Record<Tactic, number>): { t: Tactic; share: number; n: number } {
  const n = TACTIC_KEYS.reduce((a, k) => a + tac[k], 0);
  const t = TACTIC_KEYS.reduce((a, k) => (tac[k] > tac[a] ? k : a), "hucum" as Tactic);
  return { t, share: n ? tac[t] / n : 0, n };
}

/** Düşman, oyuncunun en sık seçtiği taktiği yenen duruşa kayar; k: 0..1 uyum gücü. */
export function adaptWeights(w: Record<Tactic, number>, tac: Record<Tactic, number>, k: number): Record<Tactic, number> {
  const f = favTactic(tac);
  if (f.n < 4 || k <= 0) return w;
  const push = Math.max(0, f.share - 0.34) * k;
  const out = { ...w };
  out[counterOf(f.t)] += push;
  const sum = TACTIC_KEYS.reduce((a, t) => a + out[t], 0);
  for (const t of TACTIC_KEYS) out[t] /= sum;
  return out;
}

export function noteTactic(tac: Record<Tactic, number>, t: Tactic): void {
  for (const k of TACTIC_KEYS) tac[k] *= 0.92;
  tac[t] += 1;
}

/* ---------------- Oyun tarzı / öğrenen yönetmen ---------------- */

export const ACT_WINDOW = 5;

export function styleMix(acts: { d: number; k: Style }[], day: number): { top: Style; share: number; n: number } {
  const recent = acts.filter((a) => day - a.d <= ACT_WINDOW);
  const cnt: Record<Style, number> = { savas: 0, ticaret: 0, kesif: 0, is: 0, kusatma: 0 };
  for (const a of recent) cnt[a.k]++;
  const top = STYLE_KEYS.reduce((a, k) => (cnt[k] > cnt[a] ? k : a), "savas" as Style);
  return { top, share: recent.length ? cnt[top] / recent.length : 0, n: recent.length };
}

export function lifeStyle(acts: { d: number; k: Style }[]): Style {
  const cnt: Record<Style, number> = { savas: 0, ticaret: 0, kesif: 0, is: 0, kusatma: 0 };
  for (const a of acts) cnt[a.k]++;
  return STYLE_KEYS.reduce((a, k) => (cnt[k] > cnt[a] ? k : a), "savas" as Style);
}

/* ---------------- Ekonomi zinciri ---------------- */

export const SHORT_MAX = 10;
export const RIOT_AT = 6;
export function shortMult(n: number): number {
  return 1 + 0.035 * Math.min(SHORT_MAX, n);
}

/* ---------------- Doğa ---------------- */

export const WOLF_MAX = 100;
export const WOLF_PACK_AT = 65;
export const WOLF_SACRED = 20;
export const DROUGHT_DAYS = 8;

/* ---------------- Çağlar ---------------- */

export const ERAS: Record<EraId, { name: string; text: string; price: number; respawn: number; xp: number }> = {
  kurulus: { name: "Kuruluş Çağı", text: "Devletler genç, yollar açık. Kılıcı ve kesesi olan herkes kendi destanını yazabilir.", price: 1, respawn: 1, xp: 1 },
  istila: { name: "İstila Çağı", text: "Doğudan gelen tümenler her şeyi alt üst etti. Mal kıt, korku bol; ama cesurlar için ganimet de bol.", price: 1.12, respawn: 0.7, xp: 1.15 },
  yikim: { name: "Yıkım ve Diriliş", text: "Fırtına dindi, şehirler küllerinden kalkıyor. Ustalar iş, yollar koruyucu arıyor; yağmacılar boşluğu dolduruyor.", price: 1.05, respawn: 0.8, xp: 1.1 },
  altin: { name: "Altın Çağ", text: "Yollar güvenli, pazarlar dolu. Kervanlar şarkılarla geçiyor; ozanlar senin çağını anlatıyor.", price: 0.94, respawn: 1.4, xp: 1 },
};

export function eraOf(mongolStage: number, sinceEnd: number, golden: boolean, prev: EraId): EraId {
  if (mongolStage === 2) return "istila";
  if (mongolStage >= 3) return sinceEnd < 30 || !golden ? "yikim" : "altin";
  if (golden && prev !== "istila") return "altin";
  return "kurulus";
}

/* ---------------- Gerçek takvim ---------------- */

const SYNODIC = 29.530588853;
const NEW_MOON_2000 = Date.UTC(2000, 0, 6, 18, 14);

/** 0 yeni ay, 0.5 dolunay */
export function moonPhase(d: Date): number {
  const days = (d.getTime() - NEW_MOON_2000) / 86400000;
  return (((days / SYNODIC) % 1) + 1) % 1;
}

export function moonKind(p: number): "dolunay" | "karaay" | null {
  if (Math.abs(p - 0.5) < 0.04) return "dolunay";
  if (p < 0.035 || p > 0.965) return "karaay";
  return null;
}

export interface Fest {
  id: string;
  name: string;
  text: string;
  gold: number;
  kut: number;
  food: number;
}

export function realFest(d: Date): Fest | null {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 3 && day >= 20 && day <= 22)
    return { id: `nevruz-${d.getFullYear()}`, name: "Nevruz", text: "Gerçek dünyada da bahar geldi: bozkırda Nevruz ateşleri yanıyor! Demir dövülüyor, ateşin üzerinden atlanıyor. Obalar sofralarını açtı.", gold: 150, kut: 4, food: 120 };
  if (m === 5 && (day === 5 || day === 6))
    return { id: `hidrellez-${d.getFullYear()}`, name: "Hıdrellez", text: "Hızır ile İlyas bu gece buluşuyor. Gül dallarına dilekler bağlandı; bozkıra bolluk ve şans yağıyor.", gold: 120, kut: 3, food: 80 };
  if (m === 12 && (day === 21 || day === 22))
    return { id: `nardugan-${d.getFullYear()}`, name: "Nardugan", text: "Yılın en uzun gecesi geçti, Güneş yeniden doğuyor. Ak çam süslendi, Ülgen'e saçı saçıldı.", gold: 100, kut: 3, food: 100 };
  return null;
}
