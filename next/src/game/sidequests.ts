import type { Good } from "./rpg";
import type { FactionId } from "./factions";

export type SideKind = "hunt" | "camp" | "deliver" | "craft" | "kurgan" | "ruin" | "raid" | "ruh";

export interface SideQuest {
  id: number;
  city: string;
  kind: SideKind;
  giver: string;
  title: string;
  text: string;
  need: number;
  base: number;
  good?: Good;
  to?: string;
  ruin?: number;
  gold: number;
  xp: number;
  renown: number;
  item: boolean;
  done?: boolean;
  /** kıtlık çeken şehre yardım */
  aid?: boolean;
  /** cephe erzakı: bu devlete karşı savaşa katkı */
  war?: FactionId;
}

export const GIVERS = ["Han sahibi Yusuf", "Tüccar Sevinç", "Yaşlı ozan Dede Kayı", "Bey'in kâhyası", "Dul kadın Gülbahar", "Kervanbaşı Temür", "Demirci Usta Arslan", "Kadı Efendi", "Çoban Oğuz", "Sarraf İshak"];

export const SIDE_TEXT: Record<SideKind, { titles: string[]; text: (n: number, extra: string) => string; icon: string }> = {
  hunt: { titles: ["Yol kesenleri temizle", "Haramilerin kökünü kazı", "Kervan yolunu güvene al"], text: (n) => `Yollarda kol gezen ${n} harami çetesini yen.`, icon: "j_bandit" },
  camp: { titles: ["İni yerle bir et", "Çete yuvasını dağıt"], text: (n) => `${n} harami kampını yerle bir et.`, icon: "map/camp" },
  deliver: { titles: ["Acil sipariş", "Uzak diyara mal", "Saray mutfağına erzak"], text: (n, x) => `${x} şehrine ${n} adet mal götür.`, icon: "j_caravan" },
  craft: { titles: ["Ustalık sınavı", "Ordu için silah", "Lonca siparişi"], text: (n) => `Atölyede ${n} eşya üret.`, icon: "anvil" },
  kurgan: { titles: ["Uyanan taşı sustur", "Ruhları özgür bırak"], text: (n) => `${n} Kurgan Taşı'nı yık.`, icon: "map/kurgan" },
  ruin: { titles: ["Kayıp hazine", "Eski bir harita", "Ataların mirası"], text: (_n, x) => `Haritası çizilen harabeyi keşfet (${x}).`, icon: "map/ruins" },
  raid: { titles: ["Köylüleri koru", "Bozkırın kalkanı ol"], text: (n) => `${n} köy baskınını püskürt.`, icon: "village" },
  ruh: { titles: ["Kamın isteği", "Ruh Taşı arayışı"], text: (n) => `${n} Ruh Taşı getir.`, icon: "ruh" },
};
