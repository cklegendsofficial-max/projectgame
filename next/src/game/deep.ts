import type { Boss } from "./battle";
import type { Army } from "./data";
import type { Item } from "./rpg";

export type DoorKind = "savas" | "hazine" | "pinar" | "sir" | "tuccar";

export type TombTheme = "hakan" | "saman" | "buz" | "ejder" | "alp";

export interface Tomb {
  name: string;
  desc: string;
  w: Partial<Record<DoorKind, number>>;
  foe: number;
  loot: number;
  ruh: number;
  cold: number;
  boss: { name: string; icon: string; lore: string };
  lore: string[];
}

export const TOMBS: Record<TombTheme, Tomb> = {
  hakan: {
    name: "Hakan Mezarı",
    desc: "Altınla gömülmüş bir hükümdar. Hazine bol, tuzak da bol.",
    w: { hazine: 30, savas: 34 },
    foe: 0,
    loot: 1.35,
    ruh: 1,
    cold: 0,
    boss: { name: "Mumyalanmış Hakan", icon: "heroes/boss_hakan", lore: "Altın tacı çürümüş başında hâlâ parlıyor. Mezarını soyanı dokuz kuşak lanetler." },
    lore: ["Duvarlarda altın varaklı av sahneleri; hakan kurt sürüsüyle ava çıkmış.", "Kırk kölenin kemikleri hakanın kapısında diz çökmüş.", "Bir altın kımız kâsesi, hâlâ dolu; içmeye cesaret edemedin."],
  },
  saman: {
    name: "Kam Mağarası",
    desc: "Kara kamların ruh çağırdığı mağara. Fısıltılar ve Ruh Taşı bol.",
    w: { sir: 34, savas: 30, pinar: 8 },
    foe: 0.03,
    loot: 0.9,
    ruh: 1.7,
    cold: 0,
    boss: { name: "Kara Kam", icon: "heroes/boss_kam", lore: "Davulunun her vuruşunda yerin dokuz katından bir ruh yükselir. Gözleri Erlik'in ateşiyle yanar." },
    lore: ["Tavandan kuş tüyü ve kemik çanlar sarkıyor; rüzgârsız çınlıyorlar.", "Duvara kanla çizilmiş bir hayat ağacı; kökleri aşağıya, karanlığa uzanıyor.", "Sönmüş bir ateşin başında dokuz boş kâse duruyor."],
  },
  buz: {
    name: "Buz Kurganı",
    desc: "Kuzey rüzgârının dondurduğu mezar. Her katta soğuk canını yakar; pınarlar donmuştur.",
    w: { pinar: 4, savas: 38, hazine: 22 },
    foe: 0.02,
    loot: 1.15,
    ruh: 1.1,
    cold: 0.05,
    boss: { name: "Buz Devi", icon: "heroes/boss_buz", lore: "Tengri'nin kışından kalma dev. Nefesi kılıçları kırar, bakışı kanı dondurur." },
    lore: ["Buzun içinde donmuş bir atlı; atı hâlâ şahlanmış.", "Nefesin buhar olup tavana yapışıyor.", "Duvarlarda buzdan kristaller; her birinde senin yansıman."],
  },
  ejder: {
    name: "Ejder İni",
    desc: "Yerin altındaki ejderin yuvası. Düşman çok güçlü, ganimet ve efsane şansı çok yüksek.",
    w: { savas: 44, hazine: 24, sir: 12 },
    foe: 0.1,
    loot: 1.6,
    ruh: 1.3,
    cold: 0,
    boss: { name: "Yer Ejderi", icon: "heroes/boss_ejder", lore: "Bin yıldır hazinesinin üstünde uyuyan kara pullu ejder. Uyandırana yazık." },
    lore: ["Taşlar erimiş ve yeniden donmuş; burada bir zamanlar ateş akmış.", "Kocaman pençe izleri, kılıç boyunda.", "Kemik yığınlarının arasında parıldayan altın sikkeler."],
  },
  alp: {
    name: "Alpler Kurganı",
    desc: "Savaşta ölen kırk alpin yattığı kurgan. Çok savaş, ama ruhları sana katılabilir.",
    w: { savas: 46, sir: 24, hazine: 12 },
    foe: 0.04,
    loot: 1,
    ruh: 1,
    cold: 0,
    boss: { name: "Kırkların Başbuğu", icon: "heroes/boss_karahan", lore: "Kırk alpin başbuğu, ölümde bile kılıcını bırakmadı. Seni ancak yenersen kabul eder." },
    lore: ["Kırk kalkan duvara asılı; her birinde farklı bir boyun damgası.", "Yerde kırık oklar; son savaşın izleri hâlâ taze.", "Bir tuğ, rüzgâr olmadan dalgalanıyor."],
  },
};
export const TOMB_KEYS = Object.keys(TOMBS) as TombTheme[];

export function tombOf(i: number): TombTheme {
  return TOMB_KEYS[(i * 7 + 3) % TOMB_KEYS.length];
}

export type DeepPerk = "mesale" | "hirsiz" | "tuzak" | "ruhavci" | "kalkan" | "umay" | "kestirme";

export const DEEP_PERKS: { id: DeepPerk; name: string; icon: string; desc: (lv: number) => string; max: number; cost: (lv: number) => number }[] = [
  { id: "mesale", name: "Meşaleci", icon: "map/kurgan", max: 3, cost: (l) => 4 + l * 4, desc: (l) => `Her inişte +${l} meşale.` },
  { id: "hirsiz", name: "Mezar Hırsızı", icon: "chest", max: 5, cost: (l) => 3 + l * 3, desc: (l) => `Zindan altını +%${l * 10}.` },
  { id: "tuzak", name: "Tuzak Gözü", icon: "wanted", max: 2, cost: (l) => 5 + l * 5, desc: (l) => (l >= 2 ? "Tuzaklara hiç düşmezsin." : `Tuzak ihtimali −%${l * 50}.`) },
  { id: "ruhavci", name: "Ruh Avcısı", icon: "ruh", max: 3, cost: (l) => 5 + l * 5, desc: (l) => `Ruh Taşı kazancı +%${l * 20}.` },
  { id: "kalkan", name: "Kalkan Duvarı", icon: "shield", max: 3, cost: (l) => 6 + l * 6, desc: (l) => `Zindan düşmanları %${l * 3} daha zayıf.` },
  { id: "umay", name: "Umay'ın Gözü", icon: "healer", max: 1, cost: () => 12, desc: () => "Her inişe Umay lütfuyla başlarsın." },
  { id: "kestirme", name: "Gizli Kestirme", icon: "scroll", max: 2, cost: (l) => 15 + l * 15, desc: (l) => `Rekoruna göre ${l * 5 + 1}. kattan başlayabilirsin.` },
];

export interface DeepRun {
  kurgan: number;
  theme: TombTheme;
  floor: number;
  torch: number;
  gold: number;
  ruh: number;
  items: Item[];
  bless: number;
  curse: number;
  greed: number;
  doors: DoorKind[];
  seals: number;
}

export const DOORS: Record<DoorKind, { name: string; hint: string; icon: string; w: number }> = {
  savas: { name: "Kanlı kapı", hint: "Ötede kılıç şakırtısı. Taş askerler bekliyor.", icon: "swords", w: 40 },
  hazine: { name: "Altın ışıltı", hint: "Aralıktan sarı bir parıltı sızıyor. Tuzak da olabilir.", icon: "chest", w: 18 },
  pinar: { name: "Su sesi", hint: "Taşların arasından serin bir pınar akıyor.", icon: "healer", w: 11 },
  sir: { name: "Fısıltılar", hint: "Karanlıkta biri adını söylüyor…", icon: "ruh", w: 20 },
  tuccar: { name: "Yaşlı ses", hint: "Bir fener yanıyor; yeraltının tüccarı müşteri bekliyor.", icon: "coins", w: 8 },
};
export const DOOR_KEYS = Object.keys(DOORS) as DoorKind[];

export const DEEP_BOSSES = [
  { name: "Taş Bekçi", icon: "heroes/boss_golem", lore: "Mezarın ilk kapısını bin yıldır bekleyen dev balbal. Gözlerinde kor yanıyor." },
  { name: "Albastı Ana", icon: "heroes/boss_albasti", lore: "Loğusaların korkusu, yeraltının kraliçesi. Saçları yılan gibi kıvrılıyor." },
  { name: "Erlik'in Elçisi", icon: "heroes/boss_karahan", lore: "Yeraltı hanı Erlik'in kara zırhlı elçisi. Arkasında dokuz kat karanlık var." },
];

export function deepBoss(floor: number, theme: TombTheme = "alp"): Boss & { lore: string } {
  const n = floor / 5;
  const b = n % 2 === 1 ? TOMBS[theme].boss : DEEP_BOSSES[(n / 2 - 1) % DEEP_BOSSES.length];
  const t = 1.5 + floor * 0.32;
  return { name: n > 3 ? `Uyanmış ${b.name}` : b.name, icon: b.icon, lore: b.lore, hp: Math.round(130 * Math.pow(t, 1.5)), atk: Math.round(7 * Math.pow(t, 1.3)), def: 3 + Math.round(t * 3) };
}

export function deepTier(floor: number, base: number): number {
  return base * 0.5 + 0.8 + floor * 0.33;
}

export function deepGuard(floor: number, base: number, R: () => number = Math.random): Army {
  const t = deepTier(floor, base);
  const n = Math.max(3, Math.round(5 * Math.pow(1.62, t - 1) * (0.85 + R() * 0.3)));
  const a = 0.25 + R() * 0.25;
  const h = floor >= 6 ? 0.1 + R() * 0.15 : 0;
  return { spear: Math.round(n * (1 - a - h)), archer: Math.round(n * a), horse: Math.round(n * h) };
}

export const RIDDLES = [
  { q: "Bir ağacım var, on iki dalı var; her dalında otuz yaprak, yarısı ak yarısı kara.", a: "Yıl", wrong: ["Orman", "Ordu"] },
  { q: "Dili yok, ağzı yok; uzak yollardan söz taşır, söyler de susar.", a: "Mektup", wrong: ["Rüzgâr", "Ozan"] },
  { q: "Gece gelir, gündüz kaçar; ateşi görünce saklanır.", a: "Karanlık", wrong: ["Kurt", "Hırsız"] },
  { q: "Kanadı yok uçar, ayağı yok koşar; ağlar ama gözü yok.", a: "Bulut", wrong: ["Kartal", "At"] },
  { q: "Ben giderim, o gider; ben dururum, o durur. Ne önüme geçer ne arkamda kalır.", a: "Gölge", wrong: ["Yoldaş", "Ruh"] },
  { q: "Yer altında altın küp; kazan kazan, bitmez.", a: "Pınar", wrong: ["Hazine", "Maden"] },
  { q: "Bir sarayım var: kapısı yok, penceresi yok; içinde altın bir beşik.", a: "Yumurta", wrong: ["Mezar", "Kurgan"] },
];

export const DEEP_LORE = [
  "Duvarlarda Göktürk yazıları: \"Üstte mavi gök basmadıkça, altta yağız yer delinmedikçe…\"",
  "Yerde paslı bir at koşumu. Hakan bir zamanlar atıyla birlikte gömülmüş.",
  "Tavandan kökler sarkıyor. Bozkırın en yaşlı ağacı burada bile kök salmış.",
  "Bir balbal duvara dönük durmuş, sanki utancından yüzünü saklıyor.",
  "Kemikten bir kopuz. Teli kopmuş ama sen geçerken titredi.",
  "Taşa kazınmış bir kurt başı. Gözlerine kırmızı taş kakılmış.",
  "Dokuz basamak aşağı iniyor. Erlik'in yurdu dokuz kattır, derler.",
];

export const DEEP_RECORD_TIERS = [5, 10, 15, 20, 30];
