import { army, type Army } from "./data";
import type { Boss } from "./battle";

/** Doğudan gelen kara bulut: şehir şehir batıya ilerleyen Moğol tümeni. */

export type MongolPact = "war" | "join";

export interface MongolState {
  /** 0: henüz yok, 1: söylentiler, 2: istila sürüyor, 3: dalga kırıldı, 4: batıda tükendi */
  stage: number;
  /** ROUTE içinde sıradaki hedef */
  next: number;
  /** sıradaki şehre varış günü */
  due: number;
  /** yola çıktığı gün (harita konumu için) */
  left: number;
  /** tümenin gücü: 3 tam, 0 dağıldı */
  str: number;
  pact: MongolPact;
  /** haraçla kurtarılacak şehir */
  spared: string | null;
  fallen: { id: string; day: number }[];
  wins: number;
  loot: number;
  askDay: number;
}

export const ROUTE = ["kashgar", "samarkand", "bukhara", "merv", "nishapur", "rey", "tabriz", "konya", "constantinople"];
export const MONGOL_DAY = 45;
export const MONGOL_LV = 12;
export const RUMOR_LEAD = 6;
export const LEG_DAYS = 8;
export const RECOVER_DAYS = 12;
export const FALL_PRICE = 1.35;
export const WIN_DELAY = 4;
export const STR_MAX = 3;

export const newMongol = (): MongolState => ({ stage: 0, next: 0, due: 0, left: 0, str: STR_MAX, pact: "war", spared: null, fallen: [], wins: 0, loot: 0, askDay: -99 });

export const mongolArmy = (lv: number, str: number): Army => {
  const k = (0.55 + lv * 0.055) * (0.55 + 0.15 * str);
  return army(Math.round(14 * k), Math.round(22 * k), Math.round(30 * k));
};

export const mongolBoss = (lv: number, str: number): Boss => ({
  name: str >= STR_MAX ? "Noyan Cebe" : str === 2 ? "Noyan Sübutay" : "Tümen Başı Toku",
  icon: "heroes/boss_hakan",
  atk: Math.round(24 + lv * 0.6),
  def: Math.round(12 + lv * 0.3),
  hp: 1100 + lv * 18,
});

export const tributeCost = (next: number, lv: number): number => 900 + next * 250 + lv * 40;
export const joinLoot = (lv: number): number => 500 + lv * 30;

export const RUMORS = [
  "Kaşgarlı tüccarlar doğuda bütün obaların yerinden kalktığını anlatıyor.",
  "Bir kervancı, Tanrı Dağları'nın ötesinde gökyüzünü kaplayan toz bulutları gördüğünü söyledi.",
  "Uygur elçileri, at sırtında doğan ve ölen bir ordudan bahsediyor: 'Sayıları çekirgeden çok.'",
];

export const FALL_TEXT = [
  "Surlar bir gecede aşıldı. Ustalar ve zanaatkârlar doğuya sürüldü; geri kalanlar kılıçtan geçirildi.",
  "Kapıları açan şehir bile bağışlanmadı. Çarşı yandı, kanallar yıkıldı.",
  "Duman günlerce dinmedi. Kervanlar yolunu değiştirdi.",
];
