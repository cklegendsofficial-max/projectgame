export type Breed = "bozkir" | "ahalteke" | "kazak" | "arap" | "tulpar";

export interface HorseInfo {
  breed: Breed;
  gen: number;
  sire: string;
  dam: string;
}

export const BREEDS: Record<Breed, { name: string; desc: string; cities: string[]; gold: number; spd: number; carry: number; hp: number; icon: string }> = {
  bozkir: { name: "Bozkır Atı", desc: "Dayanıklı, mütevazı, her yolu bilir.", cities: [], gold: 260, spd: 0.18, carry: 45, hp: 6, icon: "mount_1" },
  ahalteke: { name: "Ahal-Teke", desc: "Altın parıltılı tüyleri, rüzgâr gibi hızı. Merv ve Nişabur'un gururu.", cities: ["merv", "nishapur"], gold: 1400, spd: 0.36, carry: 40, hp: 8, icon: "mount_3" },
  kazak: { name: "Kazak Atı", desc: "Kısa boylu ama yorulmak bilmez; ağır yük taşır.", cities: ["kashgar", "samarkand", "bukhara"], gold: 1100, spd: 0.22, carry: 95, hp: 18, icon: "mount_2" },
  arap: { name: "Arap Atı", desc: "Asil ve ateşli. Savaşta korkusuzdur.", cities: ["rey", "tabriz", "konya", "constantinople"], gold: 1700, spd: 0.31, carry: 55, hp: 14, icon: "mount_3" },
  tulpar: { name: "Tulpar", desc: "Destanların kanatlı atı. Bir nesilde bir kez doğar.", cities: [], gold: 0, spd: 0.55, carry: 120, hp: 40, icon: "mount_3" },
};
export const SHOP_BREEDS: Breed[] = ["bozkir", "ahalteke", "kazak", "arap"];

const COATS = ["Kır", "Doru", "Yağız", "Al", "Kula", "Boz", "Ak", "Kara", "Demir Kırı", "Alaca"];
const HNAMES = ["Karayel", "Yıldırım", "Rüzgâr", "Tolga", "Gökbörü", "Sarıkız", "Bozok", "Akbulut", "Kamer", "Tayşan", "Yelkovan", "Kıvılcım"];

export function horseName(R: () => number = Math.random): string {
  return `${COATS[Math.floor(R() * COATS.length)]} ${HNAMES[Math.floor(R() * HNAMES.length)]}`;
}

export const BREED_TIME = 4 * 60000;
export const BREED_GOLD = 250;

export function tulparChance(gen: number, spd: number): number {
  return gen < 3 ? 0 : Math.min(0.25, 0.04 + (gen - 3) * 0.03 + Math.max(0, spd - 0.4) * 0.5);
}
