import { CITIES } from "../world/gen";
import { army } from "./data";
import type { Boss } from "./battle";
import type { Game } from "./game";

export type CompId = "ayse" | "korkut" | "batu" | "leyla" | "ferhat" | "lucia";

export interface CompMods {
  atk: number;
  army: number;
  heal: number;
  xp: number;
  trade: number;
  carry: number;
  speed: number;
  sight: number;
}

export interface Companion {
  id: CompId;
  name: string;
  role: string;
  icon: string;
  desc: string;
  perk: string;
  mods: Partial<CompMods>;
  hire?: { city: string; gold: number; renown: number };
}

export const COMPANIONS: Companion[] = [
  { id: "ayse", name: "Ayşe", role: "Kız kardeşin · Şifacı", icon: "companions/ayse", desc: "Kara Tamga'nın elinden kurtardığın kız kardeşin. Annenizden öğrendiği otlarla yaraları sarar.", perk: "Savaşta her tur canının %4'ünü iyileştirir.", mods: { heal: 0.04 } },
  { id: "korkut", name: "Derviş Korkut", role: "Ozan · Bilge", icon: "companions/korkut", desc: "Buhara'nın yaşlı dervişi. Kopuzuyla eski destanları söyler, Kurgan Taşlarının sırrını bilir.", perk: "Kazandığın tecrübe %15 artar; askerlerin %4 güçlü.", mods: { xp: 0.15, army: 0.04 } },
  { id: "ferhat", name: "Ferhat", role: "İz sürücü", icon: "companions/ferhat", desc: "Bozkırda iz sürmeyi kurtlardan öğrenmiş sessiz bir avcı.", perk: "Yürüyüş hızın %12 artar, daha uzağı görürsün.", mods: { speed: 0.12, sight: 3 }, hire: { city: "merv", gold: 350, renown: 10 } },
  { id: "batu", name: "Batu", role: "Eski yüzbaşı", icon: "companions/batu", desc: "Hakan ordusundan kovulmuş yaşlı bir yüzbaşı. Hâlâ en iyi kılıç talimini o verir.", perk: "Saldırın %10, askerlerinin gücü %6 artar.", mods: { atk: 0.1, army: 0.06 }, hire: { city: "nishapur", gold: 600, renown: 30 } },
  { id: "leyla", name: "Leyla", role: "Tüccar kızı", icon: "companions/leyla", desc: "Tebriz çarşısının en keskin pazarlıkçısı. Her şehrin fiyatını ezbere bilir.", perk: "Pazarda %3 daha iyi fiyat, +30 yük.", mods: { trade: 0.03, carry: 30 }, hire: { city: "tabriz", gold: 500, renown: 20 } },
  { id: "lucia", name: "Lucia", role: "Venedikli tüccar", icon: "companions/lucia", desc: "Konstantiniyye'deki Venedik kolonisinden gelen gözü pek bir kadın. Doğu ile Batı arasında köprü kurar.", perk: "Pazarda %4 daha iyi fiyat, +40 yük.", mods: { trade: 0.04, carry: 40 }, hire: { city: "constantinople", gold: 900, renown: 50 } },
];

export const COMP_BY_ID = Object.fromEntries(COMPANIONS.map((c) => [c.id, c])) as Record<CompId, Companion>;
export const COMP_MAX = 3;

export interface Choice {
  label: string;
  why?: (g: Game) => string | null;
  run: (g: Game) => void;
}

export interface Chapter {
  title: string;
  goal: string;
  intro: string;
  img: string;
  req?: (g: Game) => string | null;
  city?: string;
  scene?: { img: string; text: (g: Game) => string; choices: Choice[] };
  auto?: (g: Game) => boolean;
  outro?: { img: string; title: string; text: (g: Game) => string };
  goto: (g: Game) => { x: number; y: number } | null;
}

const city = (id: string) => CITIES.find((c) => c.id === id)!;

export const KASIM: Boss = { name: "Köle Tüccarı Kasım", icon: "merchant", atk: 10, def: 6, hp: 190 };
export const KARA_HAN: Boss = { name: "Kara Han", icon: "heroes/boss_karahan", atk: 46, def: 22, hp: 1600 };

export const CHAPTERS: Chapter[] = [
  {
    title: "Damgalı Geçmiş",
    goal: "Buhara'ya git ve Derviş Korkut'u bul.",
    img: "companions/korkut",
    intro: "Efendin seni azat ederken omzundaki kara damgaya baktı ve fısıldadı: <i>\"O damga Kara Tamga'nın işaretidir. Ailene ne olduysa onlar yaptı. Buhara'daki Derviş Korkut bu işaretin sırrını bilir.\"</i>",
    city: "bukhara",
    req: (g) => (g.s.free ? null : "Önce hürriyetini kazan"),
    scene: {
      img: "companions/korkut",
      text: (g) => `Ak sakallı derviş kopuzunu bıraktı ve omzundaki damgaya uzun uzun baktı.<br><br><i>"Demek sen de onlardansın, ${g.s.hero.name}. Kara Tamga… Kara Han'ın köle avcıları. Esirlerin ruhlarını eski kurganlara hapsediyor, balbalları uyandırıyorlar. Taşlar uyandıkça bozkır kararıyor."</i><br><br><i>"Ailenin izini sürmek istiyorsan önce bir Kurgan Taşını kır. İçindeki ruhlar sana yolu gösterecek. Ben de seninle geleceğim; yaşlı bir dervişin sözü bazen kılıçtan keskindir."</i>`,
      choices: [{ label: "Korkut'u yanına al", run: (g) => { g.addCompanion("korkut"); g.storyAdvance(); } }],
    },
    goto: () => city("bukhara"),
  },
  {
    title: "Uyanan Taşlar",
    goal: "Haritada mor ışıkla parlayan bir Kurgan Taşını kır.",
    img: "map/kurgan",
    intro: "Korkut haritada mor ışıkla titreyen taşları gösterdi. <i>\"Her biri bir mezar, her mezarda bir esirin ruhu. Birini kır, ruhlar konuşsun.\"</i>",
    auto: (g) => g.s.c.kurgans >= 1,
    outro: {
      img: "ruh",
      title: "Ruhların fısıltısı",
      text: () => "Taş çatlarken içinden mor bir ışık yükseldi. Işığın içinde bir kız çocuğunun sesi duydun: <i>\"Abi… Merv… zincirler…\"</i><br><br>Korkut gözlerini kapadı: <i>\"Kız kardeşin Ayşe yaşıyor. Merv'in esir pazarında satılmak üzere. Ama oraya gidecek kadar güçlü olmalısın.\"</i>",
    },
    goto: (g) => g.nearest(g.s.kurgans.filter((k) => k.alive)),
  },
  {
    title: "Merv Esir Pazarı",
    goal: "5. seviyeye ulaş, Merv'e git ve Ayşe'yi kurtar.",
    img: "companions/ayse",
    intro: "Ayşe Merv'de. Kara Tamga'nın tüccarı Kasım onu yüksek fiyata satmayı bekliyor. Ya keseni ya kılıcını konuşturacaksın.",
    city: "merv",
    req: (g) => (g.s.hero.lv >= 5 ? null : "5. seviye gerekir"),
    scene: {
      img: "companions/ayse",
      text: () => `Esir pazarının ortasında, zincire vurulmuş kızların arasında onu gördün. Saçları kısa kesilmiş, omzunda aynı kara damga… Ayşe!<br><br>Şişman tüccar Kasım sırıttı: <i>"Bu kız kıymetli, yiğit. 400 altın. Yoksa adamlarım seni de zincire vurur."</i>`,
      choices: [
        { label: "400 altın öde", why: (g) => (g.s.res.gold >= 400 ? null : "400 altın gerekir"), run: (g) => { g.pay({ gold: 400 }); g.rescueAyse(false); } },
        { label: "Zincirleri kır (savaş)", run: (g) => g.fightKasim() },
      ],
    },
    outro: {
      img: "companions/ayse",
      title: "Ayşe",
      text: (g) => `Ayşe boynuna sarıldı ve uzun süre ağladı. <i>"Seni öldü sandım ${g.s.hero.name}… Annemizi ve küçük Ertuğrul'u Kara Han'ın kalesine götürdüler. Kalenin yerini sadece çetelerin başları bilir."</i><br><br>Ayşe artık yanında. Yaralarını o saracak.`,
    },
    goto: () => city("merv"),
  },
  {
    title: "Kara Tamga'nın İzi",
    goal: "3 harami kampını yerle bir et ve 60 şöhrete ulaş. Çete başlarından biri kalenin yerini söyleyecek.",
    img: "map/camp",
    intro: "Kara Han'ın kalesi gizli. Ama haramilerin hepsi ona haraç öder. Kampları birer birer düşürürsen, çete başlarından biri mutlaka konuşur.",
    auto: (g) => g.s.c.camps >= 3 && g.s.renown >= 60,
    outro: {
      img: "map/castle",
      title: "Kalenin yeri",
      text: () => "Yaralı bir çete başı ayaklarına kapandı: <i>\"Söyleyeceğim, söyleyeceğim! Kara Tamga Kalesi batıda, kayalıkların arasında. Kara Han orada… esirlerin ruhlarıyla son taşı uyandırmaya hazırlanıyor.\"</i><br><br>Kale haritada işaretlendi. Kara Han'ın ordusu çok güçlü; birliğini büyüt, eşyalarını güçlendir.",
    },
    goto: (g) => g.nearest(g.s.camps.filter((c) => c.alive)),
  },
  {
    title: "Kara Han",
    goal: "Kara Tamga Kalesi'ne saldır ve Kara Han'ı yen.",
    img: "heroes/boss_karahan",
    intro: "Destanın son bölümü. Kara Han kalesinde seni bekliyor. Yanına güçlü bir birlik al; ordusu kalabalık ve kendisi ölümcül bir savaşçı.",
    goto: (g) => g.s.story.fort,
  },
];

export const FORT_GUARD = army(70, 45, 30);
