import { ROUTES } from "./data";
import type { GameState } from "./state";
import type { Story } from "./stories";

export const HAN_MIN_OWNED = 25;
export const HAN_MULT = 1.5;
export const HAN_T = 0.5;

export function hanCost(i: number): number {
  return ROUTES[i].masterCost * 4;
}

export function hanWood(s: GameState): number {
  return 15 * (1 + s.hans.length);
}

export function hasHan(s: GameState, i: number): boolean {
  return s.hans.includes(i);
}

export function hanMult(s: GameState, i: number): number {
  return s.hans.includes(i) ? HAN_MULT : 1;
}

export function canBuildHan(s: GameState, i: number): boolean {
  return !hasHan(s, i) && s.routes[i].owned >= HAN_MIN_OWNED;
}

export const HAN_STORIES: Story[] = [
  {
    id: "hanGuest",
    art: "han",
    title: { tr: "Gece Yarısı Misafiri", en: "The Midnight Guest" },
    text: {
      tr: "Hanın kapısı gece yarısı çalınıyor. Yaralı bir Soğdlu tüccar, heybesini göğsüne bastırmış: \"Peşimde haramiler var. Bir gece... sadece bir gece.\"",
      en: "A knock at the han's gate at midnight. A wounded Sogdian merchant clutches his saddlebag: \"Bandits are after me. One night... just one night.\"",
    },
    choices: [
      { label: { tr: "Kapıyı aç, ona kol kanat ger", en: "Open the gate and shelter him" }, win: [{ kind: "gold", sec: 180 }], winText: { tr: "Sabah tüccar heybesinden bir kese altın çıkarıyor: \"Ahilik ölmemiş.\"", en: "At dawn the merchant hands you a purse of gold: \"Hospitality is not dead.\"" } },
      { label: { tr: "Heybesini gizlice ara", en: "Secretly search his bag" }, chance: 0.5, win: [{ kind: "steel", n: 8 }], winText: { tr: "Heybede Şam çeliği külçeler! Tüccar hiçbir şey fark etmiyor.", en: "Damascus steel ingots in the bag! The merchant notices nothing." }, lose: [{ kind: "cost", sec: 60 }], loseText: { tr: "Yakalandın. Utancını altınla kapatmak zorunda kaldın.", en: "Caught. You had to pay to cover your shame." } },
    ],
  },
  {
    id: "hanDervish",
    art: "han",
    title: { tr: "Semâ Eden Dervişler", en: "The Whirling Dervishes" },
    text: {
      tr: "Bir grup Mevlevî derviş avluda konaklamak istiyor. \"Karşılığında,\" diyor şeyhleri, \"bu gece hanında semâ edelim. Bereket getirir.\"",
      en: "A band of Mevlevi dervishes asks to stay in the courtyard. \"In return,\" says their sheikh, \"let us whirl in your han tonight. It brings blessings.\"",
    },
    choices: [
      { label: { tr: "Misafir et, semâyı izle", en: "Host them and watch" }, win: [{ kind: "boost", mult: 2, sec: 120 }], winText: { tr: "Ney sesi bütün kervanı sarhoş ediyor. Develer bile daha hızlı yürüyor.", en: "The ney's song enchants the caravan. Even the camels walk faster." } },
      { label: { tr: "Oda parası iste", en: "Charge them for rooms" }, win: [{ kind: "gold", sec: 60 }], winText: { tr: "Şeyh gülümseyip ödüyor: \"Gönlün de zengin olsun.\"", en: "The sheikh smiles and pays: \"May your heart grow rich too.\"" } },
    ],
  },
  {
    id: "hanCoins",
    art: "han",
    title: { tr: "Sahte Sikke", en: "The Counterfeit Coin" },
    text: {
      tr: "Bir sarraf fısıldıyor: \"Yarı fiyatına Bizans altını. Kimse farkı anlamaz... neredeyse.\"",
      en: "A moneychanger whispers: \"Byzantine gold at half price. No one can tell the difference... almost.\"",
    },
    choices: [
      { label: { tr: "Reddet, kadıya bildir", en: "Refuse and report him" }, win: [{ kind: "gold", sec: 40 }], winText: { tr: "Kadı sana muhbir ödülü veriyor.", en: "The judge pays you an informant's reward." } },
      { label: { tr: "Satın al, riske gir", en: "Buy and take the risk" }, chance: 0.4, win: [{ kind: "gold", sec: 400 }], winText: { tr: "Sikkeler Konya çarşısında sorunsuz geçiyor. Büyük vurgun!", en: "The coins pass without a hitch in the Konya bazaar. A huge haul!" }, lose: [{ kind: "cost", sec: 120 }], loseText: { tr: "Sikkeler kurşun çıktı. Sarraf çoktan kaybolmuş.", en: "The coins were lead. The moneychanger is long gone." } },
    ],
  },
  {
    id: "hanSmith",
    art: "han",
    title: { tr: "Demirci Kervanı", en: "The Blacksmith Caravan" },
    text: {
      tr: "Horasan'dan gelen demirciler hanında mola veriyor. Arabaları çelik külçeyle dolu, ama hanın bekçisi geçiş ücretini sormuş.",
      en: "Smiths from Khorasan rest at your han. Their carts are full of steel ingots, and your gatekeeper has asked for the toll.",
    },
    choices: [
      { label: { tr: "Çeliklerini satın al", en: "Buy their steel" }, win: [{ kind: "cost", sec: 90 }, { kind: "steel", n: 12 }], winText: { tr: "Ordunun demircisi sevinçten zıplıyor.", en: "Your army's smith jumps for joy." } },
      { label: { tr: "Geçiş ücretini al", en: "Collect the toll" }, win: [{ kind: "gold", sec: 70 }], winText: { tr: "Demirciler homurdanarak ödüyor.", en: "The smiths grumble but pay." } },
    ],
  },
  {
    id: "hanPlague",
    art: "han",
    title: { tr: "Veba Söylentisi", en: "Rumors of Plague" },
    text: {
      tr: "Bir yolcu ateşler içinde yanıyor. Han halkı panikte: \"Veba! Kapıları kapatın!\"",
      en: "A traveler burns with fever. The han is in panic: \"Plague! Shut the gates!\"",
    },
    choices: [
      { label: { tr: "Hekim çağır, karantinaya al", en: "Call a physician, quarantine" }, win: [{ kind: "cost", sec: 60 }, { kind: "boost", mult: 1.5, sec: 300 }], winText: { tr: "Sıradan bir sıtmaymış. Han'ın şöhreti yollara yayılıyor.", en: "Just a common fever. Your han's fame spreads along the roads." } },
      { label: { tr: "Yolcuyu dışarı at", en: "Throw the traveler out" }, chance: 0.6, win: [], winText: { tr: "Söylenti boş çıktı. Kimse bir şey kaybetmedi... vicdanın hariç.", en: "The rumor was empty. No one lost anything... except your conscience." }, lose: [{ kind: "lose", pct: 0.08 }], loseText: { tr: "Söylenti yayıldı, tüccarlar hanından kaçtı.", en: "The rumor spread and merchants fled your han." } },
    ],
  },
  {
    id: "hanBards",
    art: "ozan",
    title: { tr: "Ozanlar Atışması", en: "The Bards' Duel" },
    text: {
      tr: "İki ozan kopuzlarını kuşanmış, hanın ocak başında atışmaya hazırlanıyor. Kalabalık toplanıyor.",
      en: "Two bards have taken up their kopuz by the han's hearth, ready to duel in verse. A crowd gathers.",
    },
    choices: [
      { label: { tr: "Atışmayı sponsorla", en: "Sponsor the duel" }, win: [{ kind: "cost", sec: 45 }, { kind: "boost", mult: 3, sec: 60 }], winText: { tr: "Destanın her köşede söyleniyor! Tüccarlar akın ediyor.", en: "Your saga is sung on every corner! Merchants flock in." } },
      { label: { tr: "Bedavaya dinle", en: "Listen for free" }, win: [{ kind: "gold", sec: 25 }], winText: { tr: "Kalabalık bol bol yiyip içiyor; kasa doluyor.", en: "The crowd eats and drinks plenty; the till fills." } },
    ],
  },
  {
    id: "hanMap",
    art: "scroll",
    title: { tr: "Kayıp Harita", en: "The Lost Map" },
    text: {
      tr: "Yaşlı bir haritacı son nefesinde eline bir parşömen tutuşturuyor: \"Afrasiyab'ın hazinesi... Kızılkum'da...\"",
      en: "An old cartographer presses a parchment into your hand with his last breath: \"Afrasiyab's treasure... in the Kyzylkum...\"",
    },
    choices: [
      { label: { tr: "Haritayı takip et", en: "Follow the map" }, chance: 0.5, win: [{ kind: "gold", sec: 320 }, { kind: "steel", n: 5 }], winText: { tr: "Kumların altından bir sandık! Efsane gerçekmiş.", en: "A chest beneath the sands! The legend was true." }, lose: [{ kind: "cost", sec: 60 }], loseText: { tr: "Günlerce kum. Sadece kum.", en: "Days of sand. Only sand." } },
      { label: { tr: "Haritayı sat", en: "Sell the map" }, win: [{ kind: "gold", sec: 90 }], winText: { tr: "Bir maceraperest haritaya servet ödüyor.", en: "An adventurer pays a fortune for the map." } },
    ],
  },
];

export function pickHanStory(s: GameState): Story {
  const recent = new Set(s.storiesSeen.slice(-4));
  const pool = HAN_STORIES.filter((st) => !recent.has(st.id));
  const list = pool.length ? pool : HAN_STORIES;
  return list[Math.floor(Math.random() * list.length)];
}
