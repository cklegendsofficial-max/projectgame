import type { GameState } from "./state";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  done: (s: GameState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "free", name: "Zincir Kıran", desc: "Hürriyetini satın al.", icon: "crown", done: (s) => s.free },
  { id: "beylik", name: "Tuğ Diken", desc: "Kendi beyliğini kur.", icon: "fortress", done: (s) => s.beylik },
  { id: "camps5", name: "Harami Avcısı", desc: "5 harami kampını dağıt.", icon: "j_bandit", done: (s) => s.c.camps >= 5 },
  { id: "kills100", name: "Yüz Kılıç", desc: "100 düşman yen.", icon: "swords", done: (s) => s.kills >= 100 },
  { id: "lv10", name: "Alp", desc: "10. seviyeye ulaş.", icon: "crown", done: (s) => s.hero.lv >= 10 },
  { id: "lv25", name: "Han Kanı", desc: "25. seviyeye ulaş.", icon: "crown", done: (s) => s.hero.lv >= 25 },
  { id: "profit", name: "İpek Yolu Tüccarı", desc: "Toplam 5000 altın ticaret kârı yap.", icon: "coins", done: (s) => s.c.profit >= 5000 },
  { id: "serai3", name: "Kervansaray Ağı", desc: "3 şehirde kervansaray kur.", icon: "map/serai", done: (s) => Object.keys(s.serais).length >= 3 },
  { id: "kurgan5", name: "Kurgan Bekçisi", desc: "5 Kurgan Taşı devir.", icon: "map/kurgan", done: (s) => s.c.kurgans >= 5 },
  { id: "deep10", name: "Derinlere", desc: "Kurgan derinliklerinde 10. kata in.", icon: "map/kurgan", done: (s) => s.deepBest >= 10 },
  { id: "deep25", name: "Yeraltının Efendisi", desc: "Kurgan derinliklerinde 25. kata in.", icon: "map/kurgan", done: (s) => s.deepBest >= 25 },
  { id: "nemesis", name: "Kan Davası", desc: "Bir can düşmanını öldür.", icon: "j_bandit", done: (s) => s.c.slain >= 1 },
  { id: "bird", name: "Kuşbaz", desc: "Bir av kuşu edin.", icon: "bird_dogan", done: (s) => !!s.bird },
  { id: "foal", name: "Seyis", desc: "Bir tay yetiştir.", icon: "foal", done: (s) => s.c.foals >= 1 },
  { id: "conquer", name: "Kale Yıkan", desc: "Bir şehir fethet.", icon: "siege", done: (s) => s.c.conquests >= 1 },
  { id: "conquer5", name: "Cihangir", desc: "5 şehir fethet.", icon: "siege", done: (s) => s.c.conquests >= 5 },
  { id: "ally", name: "Kan Kardeşliği", desc: "Bir beyle ittifak kur.", icon: "lord_bey", done: (s) => s.rivals.some((r) => r.status === "ally") },
  { id: "vassal3", name: "Beyler Beyi", desc: "Aynı anda 3 tabi beyin olsun.", icon: "lord_emir", done: (s) => s.rivals.filter((r) => r.status === "vassal").length >= 3 },
  { id: "beyq5", name: "Sözünün Eri", desc: "Beylerin 5 isteğini yerine getir.", icon: "lord_bey", done: (s) => (s.c.beyq ?? 0) >= 5 },
  { id: "turan", name: "Bozkır Kurdu", desc: "Savaşta Turan taktiğini 5 kez uygula.", icon: "u_cavalry", done: (s) => (s.c.turan ?? 0) >= 5 },
  { id: "tore", name: "Töre Bekçisi", desc: "8 töre davasında hüküm ver.", icon: "scroll", done: (s) => (s.c.tore ?? 0) >= 8 },
  { id: "kut", name: "Gök Kutlu", desc: "Kutunu 90'ın üstüne çıkar.", icon: "crown", done: (s) => (s.kut ?? 0) >= 90 },
  { id: "karahan", name: "Kara Tamga", desc: "Kara Han'ı yen ve ilk destanı bitir.", icon: "heroes/boss_karahan", done: (s) => s.story.done },
  { id: "erlik", name: "Erlik'in Kapısı", desc: "Erlik Han'ı yen.", icon: "boss_erlik", done: (s) => s.act2.done },
  { id: "kagan", name: "Kağan", desc: "Kurultayda Kağan seçil.", icon: "crown", done: (s) => !!s.kagan },
  { id: "port", name: "Hazar Kaptanı", desc: "Hazar'da 5 sefer tamamla.", icon: "j_caravan", done: (s) => (s.c.voyages ?? 0) >= 5 },
  { id: "governor", name: "Vali Atayan", desc: "Fethettiğin bir şehre vali ata.", icon: "crown", done: (s) => Object.values(s.owned).some((o) => !!o.gov) },
  { id: "ending", name: "Destanın Sonu", desc: "Üçüncü perdeyi bitir ve kaderini seç.", icon: "crown", done: (s) => !!s.act3?.ending },
];

const KEY = "kk_ach";

export function unlockedSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function storeUnlocked(set: Set<string>): void {
  localStorage.setItem(KEY, JSON.stringify([...set]));
}

export function steamUnlock(id: string): void {
  const bridge = (window as unknown as { kkSteam?: { unlock: (id: string) => void } }).kkSteam;
  try {
    bridge?.unlock(id);
  } catch {
    /* steam client unavailable */
  }
}
