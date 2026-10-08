import type { GameState } from "./state";
import { getLang } from "./i18n";

export type TravelerId = "nasreddin" | "marco" | "battuta" | "evliya";

type GoalKind = "own" | "trips" | "earn" | "bandits" | "merchants" | "master" | "dynasty";

interface Goal {
  kind: GoalKind;
  route?: number;
  n: number;
}

interface Reward {
  kind: "route" | "all" | "offline";
  route?: number;
  mult?: number;
  hours?: number;
}

interface Story {
  intro: string;
  done: string;
}

export interface Chapter {
  traveler: TravelerId;
  city: string;
  req: number;
  goal: Goal;
  reward: Reward;
  bonusSec: number;
  tr: Story;
  en: Story;
}

export const TRAVELER_NAME: Record<TravelerId, { tr: string; en: string }> = {
  nasreddin: { tr: "Nasreddin Hoca", en: "Nasreddin Hodja" },
  marco: { tr: "Marco Polo", en: "Marco Polo" },
  battuta: { tr: "İbn Battuta", en: "Ibn Battuta" },
  evliya: { tr: "Evliya Çelebi", en: "Evliya Çelebi" },
};

export const CHAPTERS: Chapter[] = [
  {
    traveler: "nasreddin",
    city: "samarkand",
    req: 0,
    goal: { kind: "own", route: 0, n: 25 },
    reward: { kind: "route", route: 0, mult: 2 },
    bonusSec: 60,
    tr: {
      intro: "Eşeğine ters binmiş bir ihtiyar çarşıya giriyor. \"Evlat, kervan dediğin bir deveyle olmaz! Bana 25 baharat devesi göster, sana bu işin sırrını vereyim.\"",
      done: "Hoca develeri tek tek sayıyor, bir tanesini iki kere. \"Bak gördün mü, 26 olmuş! Bereket işte budur.\" Baharatın değeri ikiye katlandı.",
    },
    en: {
      intro: "An old man riding his donkey backwards enters the bazaar. \"Son, one camel is not a caravan! Show me 25 spice camels and I'll tell you the secret of trade.\"",
      done: "The Hodja counts the camels, one of them twice. \"See? Twenty-six! That is what blessing looks like.\" Spice profits doubled.",
    },
  },
  {
    traveler: "nasreddin",
    city: "bukhara",
    req: 1,
    goal: { kind: "trips", route: 1, n: 40 },
    reward: { kind: "route", route: 1, mult: 2 },
    bonusSec: 90,
    tr: {
      intro: "Hoca, Buhara'da kazan ödünç almış ve \"kazan doğurdu\" diyerek iki kazan geri vermiş. \"Pamuk da doğurur evlat, yeter ki yolda olsun. 40 sefer yap, görürsün.\"",
      done: "\"Kazan doğurursa pamuk da çoğalır!\" Hoca kahkahayı basıyor. Pamuk kârı ikiye katlandı.",
    },
    en: {
      intro: "In Bukhara the Hodja borrowed a pot and returned two, saying \"the pot gave birth.\" \"Cotton multiplies too, son, as long as it travels. Make 40 trips and see.\"",
      done: "\"If a pot can give birth, cotton can multiply!\" the Hodja laughs. Cotton profits doubled.",
    },
  },
  {
    traveler: "nasreddin",
    city: "kashgar",
    req: 2,
    goal: { kind: "bandits", n: 3 },
    reward: { kind: "all", mult: 1.1 },
    bonusSec: 120,
    tr: {
      intro: "\"Haramiler eşeğimi çalmaya kalktı, ben de onlara eşeğin yerine nasihat verdim. Pek beğenmediler.\" Yollardaki 3 harami çetesini dağıt.",
      done: "Hoca eşeğini okşuyor: \"Yollar güvenli, gönüller rahat.\" Tüm kârlar kalıcı olarak %10 arttı.",
    },
    en: {
      intro: "\"Bandits tried to steal my donkey, so I gave them advice instead. They didn't like it.\" Scatter 3 bandit gangs on your roads.",
      done: "The Hodja pats his donkey: \"Safe roads, easy hearts.\" All profits permanently +10%.",
    },
  },
  {
    traveler: "marco",
    city: "kashgar",
    req: 2,
    goal: { kind: "own", route: 2, n: 25 },
    reward: { kind: "route", route: 2, mult: 2 },
    bonusSec: 120,
    tr: {
      intro: "Venedikli genç bir tüccar, yanında babası ve amcasıyla Kaşgar'a varıyor. \"Han'ın sarayına gidiyoruz. Yeşim taşına bayılır. 25 yeşim devesiyle yol açar mısın?\"",
      done: "Marco defterine yazıyor: \"Kaşgar'da gördüğüm kervanlar Venedik'in tüm donanmasından kalabalıktı.\" Yeşim kârı ikiye katlandı.",
    },
    en: {
      intro: "A young Venetian merchant arrives in Kashgar with his father and uncle. \"We go to the Khan's court. He adores jade. Will you open the way with 25 jade camels?\"",
      done: "Marco writes: \"The caravans of Kashgar outnumber all the ships of Venice.\" Jade profits doubled.",
    },
  },
  {
    traveler: "marco",
    city: "samarkand",
    req: 3,
    goal: { kind: "merchants", n: 2 },
    reward: { kind: "all", mult: 1.15 },
    bonusSec: 180,
    tr: {
      intro: "\"Doğu'nun tüccarları kâğıttan para kullanıyor, inanabiliyor musun?\" Marco gezgin tüccarlarla tanışmak istiyor. Haritada beliren 2 gezgin tüccarla anlaş.",
      done: "Marco, Venedik'e kâğıt para hikâyesini anlatınca kimse inanmayacak. Ama sen inandın. Tüm kârlar kalıcı olarak %15 arttı.",
    },
    en: {
      intro: "\"The merchants of the East pay with paper money, can you believe it?\" Marco wants to meet the wandering traders. Deal with 2 merchants on the map.",
      done: "No one in Venice will believe his paper money tale. But you did. All profits permanently +15%.",
    },
  },
  {
    traveler: "marco",
    city: "nishapur",
    req: 4,
    goal: { kind: "earn", n: 1e7 },
    reward: { kind: "route", route: 4, mult: 2 },
    bonusSec: 180,
    tr: {
      intro: "\"İpek, Han'ın hazinesinin anahtarıdır.\" Marco, Nişabur'da ipek yolunun asıl ağırlığını görmek istiyor. Bu yolculukta 10M altın kazan.",
      done: "Marco Polo ayrılırken elini sıkıyor: \"Seyahatlerimi yazdığımda adın geçecek.\" İpek kârı ikiye katlandı.",
    },
    en: {
      intro: "\"Silk is the key to the Khan's treasury.\" In Nishapur, Marco wants to see the true weight of the Silk Road. Earn 10M gold on this journey.",
      done: "Marco shakes your hand as he leaves: \"When I write of my travels, your name will be in it.\" Silk profits doubled.",
    },
  },
  {
    traveler: "battuta",
    city: "nishapur",
    req: 4,
    goal: { kind: "master", route: 4, n: 1 },
    reward: { kind: "offline", hours: 2 },
    bonusSec: 240,
    tr: {
      intro: "Tanca'dan yola çıkmış bir âlim, 29 yıldır yollarda. \"Yol, insanı sen uyurken de taşır. Nişabur ipeğine güvenilir bir kervanbaşı bul.\"",
      done: "\"Şimdi sen uyurken de kervanın yürür.\" İbn Battuta duaya duruyor. Çevrimdışı kazanç süresi kalıcı olarak +2 saat.",
    },
    en: {
      intro: "A scholar who left Tangier 29 years ago is still on the road. \"The road carries a man even while he sleeps. Find a trusted caravan master for Nishapur's silk.\"",
      done: "\"Now your caravan walks while you sleep.\" Ibn Battuta offers a prayer. Offline earnings time permanently +2 hours.",
    },
  },
  {
    traveler: "battuta",
    city: "rey",
    req: 5,
    goal: { kind: "trips", route: 5, n: 20 },
    reward: { kind: "route", route: 5, mult: 2 },
    bonusSec: 240,
    tr: {
      intro: "\"Rey'in halıları sultan saraylarını süsler.\" İbn Battuta, halıların Tebriz'e ulaştığını kendi gözüyle görmek istiyor. 20 halı seferi tamamla.",
      done: "Âlim, halının desenlerinde gezdiği şehirleri tanıyor. \"Her düğüm bir yol hikâyesi.\" Halı kârı ikiye katlandı.",
    },
    en: {
      intro: "\"The carpets of Rey adorn the palaces of sultans.\" Ibn Battuta wants to see them reach Tabriz. Complete 20 carpet trips.",
      done: "The scholar recognises cities he visited in the carpet's patterns. \"Every knot is a road story.\" Carpet profits doubled.",
    },
  },
  {
    traveler: "battuta",
    city: "tabriz",
    req: 5,
    goal: { kind: "own", route: 4, n: 100 },
    reward: { kind: "all", mult: 1.25 },
    bonusSec: 300,
    tr: {
      intro: "\"Hindistan'dan Çin'e kadar gördüm, ama yüz develik bir ipek kervanı görmedim.\" İpek yolunda 100 deveye ulaş.",
      done: "İbn Battuta Rıhle'sine yeni bir sayfa ekliyor: \"Tebriz yolunda dünyanın en büyük kervanını gördüm.\" Tüm kârlar kalıcı olarak %25 arttı.",
    },
    en: {
      intro: "\"I have seen India and China, but never a silk caravan of a hundred camels.\" Reach 100 camels on the silk route.",
      done: "Ibn Battuta adds a page to his Rihla: \"On the Tabriz road I saw the greatest caravan in the world.\" All profits permanently +25%.",
    },
  },
  {
    traveler: "evliya",
    city: "tabriz",
    req: 6,
    goal: { kind: "own", route: 6, n: 25 },
    reward: { kind: "route", route: 6, mult: 2 },
    bonusSec: 300,
    tr: {
      intro: "Rüyasında \"Şefaat ya Resulallah\" diyeceği yerde \"Seyahat ya Resulallah\" demiş bir İstanbul efendisi. \"Gümüş yolunu yazmak isterim. 25 gümüş devesi görelim.\"",
      done: "Evliya Çelebi kalemini mürekkebe batırıyor: \"Tebriz'in gümüşü ay gibi parlar.\" Gümüş kârı ikiye katlandı.",
    },
    en: {
      intro: "An Istanbul gentleman who, in a dream, asked for travel instead of intercession. \"I wish to write of the silver road. Let us see 25 silver camels.\"",
      done: "Evliya Çelebi dips his quill: \"The silver of Tabriz shines like the moon.\" Silver profits doubled.",
    },
  },
  {
    traveler: "evliya",
    city: "konya",
    req: 7,
    goal: { kind: "trips", route: 7, n: 10 },
    reward: { kind: "route", route: 7, mult: 2 },
    bonusSec: 360,
    tr: {
      intro: "\"Konya'dan Dersaadet'e Çin porseleni taşınırsa, saray mutfağı bayram eder.\" 10 porselen seferi tamamla.",
      done: "Topkapı'nın mutfaklarına ilk porselen sandıkları ulaşıyor. Evliya Seyahatname'ye not düşüyor. Porselen kârı ikiye katlandı.",
    },
    en: {
      intro: "\"If Chinese porcelain reaches Istanbul from Konya, the palace kitchens will celebrate.\" Complete 10 porcelain trips.",
      done: "The first crates reach the Topkapı kitchens. Evliya notes it in his Book of Travels. Porcelain profits doubled.",
    },
  },
  {
    traveler: "evliya",
    city: "constantinople",
    req: 7,
    goal: { kind: "dynasty", n: 1 },
    reward: { kind: "all", mult: 1.5 },
    bonusSec: 0,
    tr: {
      intro: "\"Her büyük ticaret evi bir gün işi oğluna devreder. Bir hanedan kur ki adın kervanlardan sonra da yaşasın.\" Bir hanedan kur.",
      done: "Evliya Çelebi Seyahatname'nin son sayfasını sana ayırıyor: \"Bu hanedan, İpek Yolu'nun en büyüğüdür.\" Tüm kârlar kalıcı olarak %50 arttı.",
    },
    en: {
      intro: "\"Every great trading house passes to an heir one day. Found a dynasty so your name outlives your caravans.\" Found a dynasty.",
      done: "Evliya Çelebi dedicates the last page of his Book of Travels to you: \"This is the greatest dynasty of the Silk Road.\" All profits permanently +50%.",
    },
  },
];

export interface ChronicleState {
  done: number;
  accepted: boolean;
  base: number;
}

export function freshChronicle(): ChronicleState {
  return { done: 0, accepted: false, base: 0 };
}

export function story(ch: Chapter): Story {
  return getLang() === "tr" ? ch.tr : ch.en;
}

export function travelerName(id: TravelerId): string {
  return TRAVELER_NAME[id][getLang()];
}

export function currentChapter(s: GameState): Chapter | null {
  return CHAPTERS[s.chronicle.done] ?? null;
}

export function chapterAvailable(s: GameState): Chapter | null {
  const ch = currentChapter(s);
  if (!ch || s.routes[ch.req].owned <= 0) return null;
  return ch;
}

function rawValue(s: GameState, g: Goal): number {
  switch (g.kind) {
    case "own":
      return s.routes[g.route!].owned;
    case "trips":
      return s.routes[g.route!].trips;
    case "earn":
      return s.runEarned;
    case "bandits":
      return s.stats.bandits;
    case "merchants":
      return s.stats.merchants;
    case "master":
      return s.masters[g.route!] ? 1 : 0;
    case "dynasty":
      return s.stats.dynasties;
  }
}

function isCumulative(g: Goal): boolean {
  return g.kind !== "own" && g.kind !== "master";
}

export function acceptChapter(s: GameState): void {
  const ch = currentChapter(s);
  if (!ch) return;
  s.chronicle.accepted = true;
  s.chronicle.base = isCumulative(ch.goal) ? rawValue(s, ch.goal) : 0;
}

export function goalValue(s: GameState, ch: Chapter): number {
  const v = rawValue(s, ch.goal) - s.chronicle.base;
  return Math.max(0, Math.min(ch.goal.n, v));
}

export function goalDone(s: GameState, ch: Chapter): boolean {
  return s.chronicle.accepted && goalValue(s, ch) >= ch.goal.n;
}

export function completeChapter(s: GameState): void {
  s.chronicle.done += 1;
  s.chronicle.accepted = false;
  s.chronicle.base = 0;
}

export function onDynastyReset(s: GameState): void {
  const ch = currentChapter(s);
  if (!ch || !s.chronicle.accepted) return;
  if (ch.goal.kind === "trips" || ch.goal.kind === "earn") s.chronicle.base = 0;
}

function completed(s: GameState): Chapter[] {
  return CHAPTERS.slice(0, s.chronicle.done);
}

export function chronicleRouteMult(s: GameState, i: number): number {
  let m = 1;
  for (const ch of completed(s)) if (ch.reward.kind === "route" && ch.reward.route === i) m *= ch.reward.mult!;
  return m;
}

export function chronicleGlobalMult(s: GameState): number {
  let m = 1;
  for (const ch of completed(s)) if (ch.reward.kind === "all") m *= ch.reward.mult!;
  return m;
}

export function chronicleOfflineHours(s: GameState): number {
  let h = 0;
  for (const ch of completed(s)) if (ch.reward.kind === "offline") h += ch.reward.hours!;
  return h;
}
