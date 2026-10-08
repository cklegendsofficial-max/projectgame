export type Branch = "kilic" | "kervan" | "bozkir";
export const BRANCH_KEYS: Branch[] = ["kilic", "kervan", "bozkir"];
export const BRANCHES: Record<Branch, { name: string; icon: string; desc: string; color: string }> = {
  kilic: { name: "Kılıç Yolu", icon: "swords", desc: "Kahramanın kendi gücü, kritik vuruşlar ve taktik dehası", color: "#ff8a6a" },
  kervan: { name: "Kervan Yolu", icon: "j_caravan", desc: "Ticaret, ganimet, kervansaraylar ve zanaat", color: "#ffd56a" },
  bozkir: { name: "Bozkır Yolu", icon: "tug", desc: "Ordu, hız, keşif ve Tengri'nin lütfu", color: "#8fe07a" },
};

export interface Talent {
  id: string;
  branch: Branch;
  row: number;
  name: string;
  icon: string;
  max: number;
  text: (r: number) => string;
}

const pct = (v: number) => `%${Math.round(v * 100)}`;

export const TALENTS: Talent[] = [
  { id: "keskin", branch: "kilic", row: 0, name: "Keskin Kenar", icon: "r_sword", max: 5, text: (r) => `Kahraman saldırısı +${pct(0.04 * r)}` },
  { id: "demirten", branch: "kilic", row: 0, name: "Demir Ten", icon: "shield", max: 5, text: (r) => `Savunma +${pct(0.05 * r)}, can +${pct(0.03 * r)}` },
  { id: "kritik", branch: "kilic", row: 1, name: "Öldürücü Bakış", icon: "tr_jadeeye", max: 3, text: (r) => `Kritik şansı +${pct(0.025 * r)}` },
  { id: "kanici", branch: "kilic", row: 2, name: "Kan İçici", icon: "tr_wolf", max: 3, text: (r) => `Her tur canının ${pct(0.015 * r)}'i kadar iyileşirsin` },
  { id: "nara", branch: "kilic", row: 2, name: "Savaş Narası", icon: "trophy", max: 3, text: (r) => `Birlik saldırısı +${pct(0.03 * r)}` },
  { id: "taktik", branch: "kilic", row: 3, name: "Taktik Dehası", icon: "scroll", max: 2, text: (r) => `Taktik üstünlüğü +${pct(0.08 * r)}, yanlış taktik cezası -${pct(0.08 * r)}` },
  { id: "efsane", branch: "kilic", row: 4, name: "Efsane Kahraman", icon: "crown", max: 1, text: () => "Saldırı ve savunma +%15, savaş tecrübesi +%20" },

  { id: "pazarlik", branch: "kervan", row: 0, name: "Pazarlıkçı", icon: "merchant", max: 5, text: (r) => `Alışta ${pct(0.01 * r)} indirim, satışta ${pct(0.01 * r)} kâr` },
  { id: "deve", branch: "kervan", row: 0, name: "Deve Kervanı", icon: "j_caravan", max: 5, text: (r) => `Taşıma kapasitesi +${15 * r}` },
  { id: "hanagasi", branch: "kervan", row: 1, name: "Han Ağası", icon: "han", max: 3, text: (r) => `Kervansaray geliri +${pct(0.12 * r)}` },
  { id: "kacakci", branch: "kervan", row: 2, name: "Kaçakçı", icon: "seal", max: 3, text: (r) => `Emanet ödülü +${pct(0.1 * r)}, yağmacı pususu -${pct(0.25 * r)}` },
  { id: "ganimet", branch: "kervan", row: 2, name: "Ganimetçi", icon: "chest", max: 3, text: (r) => `Savaş ganimeti altını +${pct(0.1 * r)}` },
  { id: "zanaat", branch: "kervan", row: 3, name: "Usta Zanaatkâr", icon: "anvil", max: 3, text: (r) => `Zanaat maliyeti -${pct(0.1 * r)}, nadir eşya şansı artar` },
  { id: "ipekhan", branch: "kervan", row: 4, name: "İpek Yolu Hanı", icon: "silk", max: 1, text: () => "Satışlarda +%5, kervansaray kasası iki kat dolar" },

  { id: "kartal", branch: "bozkir", row: 0, name: "Kartal Gözü", icon: "tr_feather", max: 3, text: (r) => `Görüş alanı +${2 * r}` },
  { id: "ruzgar", branch: "bozkir", row: 0, name: "Rüzgâr Atlısı", icon: "mount_2", max: 5, text: (r) => `Haritada hız +${pct(0.04 * r)}` },
  { id: "komutan", branch: "bozkir", row: 1, name: "Komutan", icon: "u_spear", max: 5, text: (r) => `Birlik sınırı +${3 * r}` },
  { id: "gozcu", branch: "bozkir", row: 2, name: "Gözcü Ağı", icon: "tower", max: 1, text: () => "Düşmanın taktiğini her zaman görürsün" },
  { id: "ruhavci", branch: "bozkir", row: 2, name: "Ruh Avcısı", icon: "ruh", max: 3, text: (r) => `Ruh Taşı düşme şansı +${pct(0.1 * r)}` },
  { id: "kurtsurusu", branch: "bozkir", row: 3, name: "Kurt Sürüsü", icon: "tr_mane", max: 3, text: (r) => `Asker ücretleri -${pct(0.1 * r)}` },
  { id: "tengri", branch: "bozkir", row: 4, name: "Tengri'nin Lütfu", icon: "tr_star", max: 1, text: () => "Zaferden sonra düşen askerlerin %15'i ayağa kalkar, tecrübe +%10" },
];

export const TALENT_BY_ID: Record<string, Talent> = Object.fromEntries(TALENTS.map((t) => [t.id, t]));
export const ROW_NEED = 3;

export function branchSpent(tal: Record<string, number>, b: Branch): number {
  return TALENTS.filter((t) => t.branch === b).reduce((a, t) => a + (tal[t.id] ?? 0), 0);
}
