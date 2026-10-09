import { H, W } from "../world/gen";
import { army, type Army } from "./data";
import type { Boss } from "./battle";
import type { RoadFx } from "./road";

/** Deşt-i Kıpçak: Hazar ve Aral'ın kuzeyindeki bozkır. */
export const KIP_BOX = { x0: 0.27 * W, x1: 0.8 * W, y0: 0, y1: 0.3 * H };
export const inKipchak = (x: number, y: number): boolean => x >= KIP_BOX.x0 && x <= KIP_BOX.x1 && y >= KIP_BOX.y0 && y <= KIP_BOX.y1;

export type KipKind = "horde" | "fort" | "stone";

export interface KipPoi {
  kind: KipKind;
  x: number;
  y: number;
  /** taş babalar için 0-4 */
  n: number;
}

export const KIP_RAW: [KipKind, number, number][] = [
  ["horde", 0.49, 0.14],
  ["fort", 0.7, 0.1],
  ["stone", 0.33, 0.12],
  ["stone", 0.42, 0.22],
  ["stone", 0.56, 0.07],
  ["stone", 0.63, 0.18],
  ["stone", 0.75, 0.22],
];

export interface KipState {
  seen: boolean;
  rep: number;
  step: number;
  stones: number[];
  fort: boolean;
  giftDay: number;
  hireDay: number;
  sellDay: number;
  ally: boolean;
}

export const newKip = (): KipState => ({ seen: false, rep: 0, step: 0, stones: [], fort: false, giftDay: -99, hireDay: -99, sellDay: -99, ally: false });

export const KIP_GIFT = 200;
export const KIP_GIFT_REP = 10;
export const KIP_HIRE_REP = 25;
export const KIP_HIRE_N = 6;
export const kipHireCost = (lv: number): number => 100 + lv * 5;
export const KIP_HIRE_GAP = 3;
export const KIP_SELL_REP = 10;
export const KIP_SELL_MULT = 1.25;
export const KIP_FOOD = 150;
export const KIP_MIN_LV = 8;

export const STONES: { tr: string; en: string }[] = [
  { tr: "Üstte mavi gök çökmedikçe, altta yağız yer delinmedikçe, ey Türk milleti, ilini ve töreni kim bozabilir?", en: "Unless the blue sky above collapses and the brown earth below gives way, O Turkish people, who could destroy your land and your töre?" },
  { tr: "Aç milleti doyurdum, çıplak milleti giydirdim, yoksul milleti zengin kıldım, az milleti çok kıldım.", en: "I fed the hungry people, I clothed the naked, I made the poor rich and the few many." },
  { tr: "Ey Türk milleti, tok iken açlığı bilmezsin; bir doyunca açlığı düşünmezsin.", en: "O Turkish people, when you are full you know no hunger; once fed, you do not think of hunger." },
  { tr: "Ebedî taşı diktim. Söyleyeceğim sözü taşa kazıdım; görün ve bilin.", en: "I raised the eternal stone. I carved my words into the stone; see them and know." },
  { tr: "İnceyi bükmek kolaydır, ince olanı koparmak kolaydır; ince kalınlaşırsa bükmek zordur.", en: "The thin is easy to bend, the slender easy to break; but when the thin grows thick, it is hard to bend." },
];
export const STONE_FX: RoadFx = { kut: 1, renown: 3 };
export const stoneXp = (lv: number): number => 40 + lv * 12;

export const kipBoss = (lv: number): Boss => ({ name: "Kara Kıpçak Başbuğu Tuğrıl", icon: "heroes/boss_hakan", atk: Math.round(18 + lv * 0.4), def: Math.round(9 + lv * 0.2), hp: 800 + lv * 10 });
export const kipFortArmy = (lv: number): Army => army(4 + Math.round(lv * 0.3), 3 + Math.round(lv * 0.3), 5 + Math.round(lv * 0.5));
export const KIP_FORT_FX: RoadFx = { gold: 500, renown: 15, kut: 2 };

export interface KipStep {
  title: string;
  en: string;
  text: string;
  textEn: string;
  rep: number;
}

export const KIP_STEPS: KipStep[] = [
  { title: "Kıtlık Kışı", en: "The Winter of Hunger", text: `Köten Han ağır bir kıştan çıktıklarını, sürülerin kırıldığını anlattı. "Obam aç. ${KIP_FOOD} yiyecek getiren yiğit, Kıpçak'ın kardeşidir."`, textEn: `Köten Han told of a hard winter that broke the herds. "My people are hungry. Whoever brings ${KIP_FOOD} food is a brother to the Kipchaks."`, rep: 20 },
  { title: "Kara Kıpçak", en: "The Black Kipchaks", text: "Köten Han'ın kardeşi Tuğrıl, kuzeydoğudaki ordugâhında Kara Kıpçakları toplayıp kervanları ve obaları yağmalıyor. Ordugâhı dağıt.", textEn: "Köten Han's brother Tuğrıl has gathered the Black Kipchaks in his war camp to the northeast and raids caravans and camps. Break the war camp.", rep: 30 },
  { title: "Ataların Sözü", en: "Words of the Ancestors", text: "Kıpçak beyleri ant içmeden önce bozkıra dikilmiş beş Taş Baba'nın sözünü bilen birini isterler. Beş taşı bul ve oku.", textEn: "Before swearing an oath, the Kipchak beys want someone who knows the words of the five Stone Fathers raised on the steppe. Find and read all five stones.", rep: 20 },
];

export const KIP_ALLY_FX: RoadFx = { gold: 600, renown: 25, kut: 5, units: { horse: 15 } };
export const KIP_ALLY_MODS = { army: 0.03, speed: 0.03 };
export const KIP_STONES_MODS = { xp: 0.05 };
