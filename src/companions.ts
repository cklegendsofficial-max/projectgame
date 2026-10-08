import type { GameState } from "./state";

export const COMPANION_IDS = ["ayse", "batu", "ferhat", "leyla", "lucia", "korkut"] as const;
export type CompanionId = (typeof COMPANION_IDS)[number];
export const COMPANION_MAX = 5;

interface Text {
  name: string;
  role: string;
  effect: string;
  lines: string[];
}

export const COMPANIONS: Record<CompanionId, { tr: Text; en: Text }> = {
  ayse: {
    tr: {
      name: "Buharalı Ayşe",
      role: "Hesap Ustası",
      effect: "Tüm kârlar +%{v}",
      lines: [
        "Kâtibin yine iki akçe kaybetmiş. Ben buldum, merak etme.",
        "Abaküsüm yalan söylemez, tüccarlar söyler.",
        "Bu fiyatlara ancak gülerim. Sonra da pazarlık ederim.",
        "Altın saymak yorucu mu? Hiç saymamak daha yorucu.",
      ],
    },
    en: {
      name: "Ayse of Bukhara",
      role: "Master of Accounts",
      effect: "All profits +{v}%",
      lines: [
        "Your scribe lost two coins again. I found them, don't worry.",
        "My abacus never lies. Merchants do.",
        "I laugh at these prices. Then I haggle.",
        "Counting gold is tiring? Not counting it is worse.",
      ],
    },
  },
  batu: {
    tr: {
      name: "Okçu Batu",
      role: "Moğol Muhafız",
      effect: "Harami ödülleri +%{v}",
      lines: [
        "Haramiler mi? Okum onlardan daha aç.",
        "Bozkırda büyüdüm. Bu dağlar bana tepe gibi gelir.",
        "Atım olmadan deveye binmek... utanç verici.",
        "Sessiz ol. Rüzgâr bir şey söylüyor.",
      ],
    },
    en: {
      name: "Batu the Archer",
      role: "Mongol Guard",
      effect: "Bandit bounties +{v}%",
      lines: [
        "Bandits? My arrows are hungrier than they are.",
        "I grew up on the steppe. These mountains are mere hills.",
        "Riding a camel instead of my horse... shameful.",
        "Quiet. The wind is saying something.",
      ],
    },
  },
  ferhat: {
    tr: {
      name: "Yıldız Okuyan Ferhat",
      role: "Kılavuz",
      effect: "Seferler %{v} daha hızlı",
      lines: [
        "Kutup yıldızı bu gece çok parlak. Kestirme yoldan gidelim.",
        "Usturlabım diyor ki... az kaldı. Hep az kalır zaten.",
        "Çölde kaybolmak imkânsız. Bana sorarsan.",
        "Gökyüzü en eski haritadır.",
      ],
    },
    en: {
      name: "Ferhat the Stargazer",
      role: "Guide",
      effect: "Trips {v}% faster",
      lines: [
        "The pole star shines bright tonight. Let's take the shortcut.",
        "My astrolabe says... almost there. It always says that.",
        "Getting lost in the desert is impossible. If you ask me.",
        "The sky is the oldest map.",
      ],
    },
  },
  leyla: {
    tr: {
      name: "Şair Leyla",
      role: "Ozan",
      effect: "Çevrimdışı kazanç süresi +{v} sa",
      lines: [
        "Kervan uyurken bile şiirim yürür.",
        "Her deve bir beyit, her yol bir gazel.",
        "Semerkant'ın kubbeleri... mavinin en uzun hâli.",
        "Bir gün bu yolları şarkılarla anacaklar.",
      ],
    },
    en: {
      name: "Leyla the Poet",
      role: "Bard",
      effect: "Offline earnings +{v}h",
      lines: [
        "Even while the caravan sleeps, my verses travel on.",
        "Every camel a couplet, every road a ghazal.",
        "The domes of Samarkand... blue at its longest.",
        "One day they will remember these roads in songs.",
      ],
    },
  },
  lucia: {
    tr: {
      name: "Venedikli Lucia",
      role: "Ortak Tüccar",
      effect: "Tüccar ve sipariş ödülleri +%{v}",
      lines: [
        "Venedik'te bu ipeğe üç kat verirler. Dört kat diyeceğim.",
        "Defterimde her borç yazılı. Seninki de, ortak.",
        "Marco Polo mu? Ondan önce de buradaydım.",
        "Pazarlık bir sanattır. Ben de sanatçıyım.",
      ],
    },
    en: {
      name: "Lucia of Venice",
      role: "Partner Merchant",
      effect: "Merchant & order rewards +{v}%",
      lines: [
        "In Venice they'd pay triple for this silk. I'll say quadruple.",
        "Every debt is in my ledger. Yours too, partner.",
        "Marco Polo? I was here before him.",
        "Haggling is an art. And I am an artist.",
      ],
    },
  },
  korkut: {
    tr: {
      name: "Dede Korkut",
      role: "Hikâyeci",
      effect: "Yol hikâyesi ödülleri +%{v}",
      lines: [
        "Gözlerim görmez ama yolun sesini duyarım.",
        "Kopuzumun teli koptu mu, hikâye bitmez.",
        "Her kervanın bir destanı vardır, evlat.",
        "Gelin olası kız... yok, o başka hikâye.",
      ],
    },
    en: {
      name: "Grandfather Korkut",
      role: "Storyteller",
      effect: "Road story rewards +{v}%",
      lines: [
        "My eyes cannot see, but I hear the road.",
        "If a string of my kopuz breaks, the story goes on.",
        "Every caravan has its epic, child.",
        "Once there was a bride... no, that's another tale.",
      ],
    },
  },
};

const PER_LEVEL: Record<CompanionId, number> = { ayse: 8, batu: 50, ferhat: 5, leyla: 1, lucia: 25, korkut: 20 };

export function compLevel(s: GameState, id: CompanionId): number {
  return s.companions[id] ?? 0;
}

export function compValue(id: CompanionId, level: number): number {
  return PER_LEVEL[id] * level;
}

export function compText(id: CompanionId, lang: "tr" | "en"): Text {
  return COMPANIONS[id][lang];
}

export function compEffect(id: CompanionId, level: number, lang: "tr" | "en"): string {
  return COMPANIONS[id][lang].effect.replace("{v}", String(compValue(id, Math.max(1, level))));
}

export function compUpgradeCost(level: number, income: number): number {
  return Math.max(500, income * 240) * Math.pow(2.4, level - 1);
}

export const compMult = {
  profit: (s: GameState) => 1 + compValue("ayse", compLevel(s, "ayse")) / 100,
  bounty: (s: GameState) => 1 + compValue("batu", compLevel(s, "batu")) / 100,
  speed: (s: GameState) => 1 + compValue("ferhat", compLevel(s, "ferhat")) / 100,
  offlineHours: (s: GameState) => compValue("leyla", compLevel(s, "leyla")),
  trade: (s: GameState) => 1 + compValue("lucia", compLevel(s, "lucia")) / 100,
  story: (s: GameState) => (1 + compValue("korkut", compLevel(s, "korkut")) / 100) * (s.ruler.trait === "pious" ? 1.5 : 1),
};

export function recruited(s: GameState): CompanionId[] {
  return COMPANION_IDS.filter((id) => compLevel(s, id) > 0);
}
