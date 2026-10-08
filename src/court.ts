import type { Mats } from "./army";
import type { GameState } from "./state";

type L = { tr: string; en: string };

export interface Decree {
  label: L;
  result: L;
  goldSec?: number;
  mats?: Partial<Mats>;
  steel?: number;
  boostSec?: number;
}

export interface Petition {
  id: string;
  icon: string;
  who: L;
  text: L;
  choices: [Decree, Decree];
}

export const PETITIONS: Petition[] = [
  {
    id: "harvest",
    icon: "fest_panayir",
    who: { tr: "Köy kethüdası", en: "Village steward" },
    text: {
      tr: "Kethüda secde eder. \"Han'ım, bu yılın harmanı ya ambara girer ya da ocağın aşçısına. İkisi birden olmaz.\"",
      en: "The steward bows to the carpet. \"My khan, this harvest fills either the granary or the barracks kitchen. Not both.\"",
    },
    choices: [
      { label: { tr: "Ambara koy, halk doysun", en: "Fill the granary" }, result: { tr: "Köyler duasını yollara astı. Kervanlar hafifledi.", en: "The villages hung their prayers on the roads. The caravans run lighter." }, goldSec: 80, boostSec: 90 },
      { label: { tr: "Orduya ayır", en: "Feed the army" }, result: { tr: "Kışlada kazanlar kaynadı. Çelik de geldi.", en: "The barracks kettles boiled. Steel came with the grain." }, steel: 8, mats: { iron: 20 } },
    ],
  },
  {
    id: "sword",
    icon: "anvil",
    who: { tr: "Başdemirci", en: "Master smith" },
    text: {
      tr: "Demirci örsün önünde diz çöker. \"Adına bir kılıç döveyim. Demiri sen ver, namı sana kalsın.\"",
      en: "The smith kneels by the anvil. \"Let me forge a sword in your name. You give the iron. The fame stays yours.\"",
    },
    choices: [
      { label: { tr: "Döv. Demir benden", en: "Forge it. The iron is mine" }, result: { tr: "Kılıç divan halısına kondu. Muhafızlar eğildi.", en: "The sword was laid on the court carpet. The guards bowed." }, mats: { iron: -30, steel: 6 }, goldSec: 40 },
      { label: { tr: "Örsü başkasına sat", en: "Sell the commission" }, result: { tr: "Bir bey kılıcı kapıştı. Keseler doldu, örs sustu.", en: "A bey bought the commission. The purses filled and the anvil went quiet." }, goldSec: 160 },
    ],
  },
  {
    id: "justice",
    icon: "swords",
    who: { tr: "Dul hatun", en: "A widow" },
    text: {
      tr: "Kadın kocasının kuşağını yere bırakır. \"Haramibaşı çarşıda geziyor. Adalet istiyorum, altın değil.\"",
      en: "She lays her husband's sash on the ground. \"The bandit chief walks the bazaar. I want justice, not gold.\"",
    },
    choices: [
      { label: { tr: "Yakalansın, divanda yargılansın", en: "Seize him and judge him here" }, result: { tr: "Hüküm verildi. Yollar bir gece daha güvenli.", en: "Sentence was passed. The roads are safer for one more night." }, goldSec: 50, steel: 4 },
      { label: { tr: "Diyetini öde, kan dursun", en: "Pay the blood price" }, result: { tr: "Altın kadının avucuna kondu. Kan durdu, dedikodu durmadı.", en: "Gold filled her palm. The blood stopped. The gossip did not." }, goldSec: -60, boostSec: 120 },
    ],
  },
  {
    id: "poet",
    icon: "ozan",
    who: { tr: "Bir ozan", en: "A bard" },
    text: {
      tr: "Ozan kopuzunu kılıfından çıkarmaz. \"Han'ım, adını bu gece söylersem yarın bütün bozkır söyler. Sofram açık mı?\"",
      en: "The bard does not uncase his kopuz. \"My khan, if I sing your name tonight, the whole steppe sings it tomorrow. Is your table open?\"",
    },
    choices: [
      { label: { tr: "Sofram senin. Söyle", en: "My table is yours. Sing" }, result: { tr: "Kopuz bu gece senin için çaldı. Tüccarlar adını sorarak geldi.", en: "The kopuz played for you tonight. Merchants arrived asking for your name." }, goldSec: -40, boostSec: 150 },
      { label: { tr: "Önce iş, sonra türkü", en: "Work first, songs later" }, result: { tr: "Ozan bozuldu ama divan sessiz kaldı. İşler yürüdü.", en: "The bard left sour, and the court stayed quiet. The work got done." }, mats: { wood: 15, leather: 15 } },
    ],
  },
  {
    id: "border",
    icon: "fortress",
    who: { tr: "Serhat beyi", en: "March lord" },
    text: {
      tr: "Bey tozu üstünde gelmiş. \"Sınırda burç çöktü. Kereste ve demir gönder, yoksa bahar akınında burada diz çökerim.\"",
      en: "The lord arrives still dusty. \"A tower fell on the border. Send timber and iron, or I will be kneeling here after the spring raid.\"",
    },
    choices: [
      { label: { tr: "Burcu onar", en: "Repair the tower" }, result: { tr: "Burç kalktı. Serhat bu kışı senin adınla tutacak.", en: "The tower stands. The march will hold this winter in your name." }, mats: { wood: -25, iron: -15 }, boostSec: 180 },
      { label: { tr: "Bey kendi yansın", en: "Let the lord pay" }, result: { tr: "Bey homurdandı, kesesini açtı. Sınır duruyor, gönül durmuyor.", en: "He grumbled and opened his own purse. The border holds. His heart does not." }, goldSec: 100 },
    ],
  },
  {
    id: "envoy",
    icon: "ally",
    who: { tr: "Yabancı elçi", en: "A foreign envoy" },
    text: {
      tr: "Elçi mührünü halıya koyar. \"Hanım seni ya kardeş sayar ya rakip. Bu geceki sözün, yarınki yolundur.\"",
      en: "The envoy sets a seal on the carpet. \"My lady will call you kin or rival. The word you speak tonight is the road you ride tomorrow.\"",
    },
    choices: [
      { label: { tr: "Kardeşlik kâsesini doldur", en: "Fill the cup of kinship" }, result: { tr: "Kâse doldu. Elçi eğilerek çıktı, yollar bir süre yumuşadı.", en: "The cup was filled. The envoy bowed out, and the roads softened for a while." }, goldSec: -70, boostSec: 120 },
      { label: { tr: "Mührü geri yolla", en: "Send the seal back" }, result: { tr: "Mühür sahibine döndü. Divan bu gece sadece senin.", en: "The seal went home. Tonight the court belongs only to you." }, steel: 6, mats: { leather: 20 } },
    ],
  },
];

const IDS = new Set(PETITIONS.map((p) => p.id));

export function isPetition(id: string): boolean {
  return IDS.has(id);
}

export function petitionById(id: string): Petition | null {
  return PETITIONS.find((p) => p.id === id) ?? null;
}

export function pickPetition(s: GameState): Petition {
  const recent = new Set(s.storiesSeen.slice(-3));
  const pool = PETITIONS.filter((p) => !recent.has("court_" + p.id));
  const list = pool.length ? pool : PETITIONS;
  return list[Math.floor(Math.random() * list.length)];
}

export function canAfford(s: GameState, d: Decree, income: number): boolean {
  if (d.goldSec && d.goldSec < 0 && s.gold < income * -d.goldSec) return false;
  if (d.mats) {
    for (const [k, n] of Object.entries(d.mats) as [keyof Mats, number][]) {
      if (n < 0 && s.mats[k] < -n) return false;
    }
  }
  return true;
}
