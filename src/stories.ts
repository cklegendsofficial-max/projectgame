import { compMult, type CompanionId } from "./companions";
import type { GameState } from "./state";

export type Outcome =
  | { kind: "gold"; sec: number }
  | { kind: "boost"; mult: number; sec: number }
  | { kind: "recruit"; id: CompanionId }
  | { kind: "lose"; pct: number }
  | { kind: "cost"; sec: number }
  | { kind: "steel"; n: number };

type L = { tr: string; en: string };

export interface Choice {
  label: L;
  requires?: CompanionId;
  chance?: number;
  win: Outcome[];
  winText: L;
  lose?: Outcome[];
  loseText?: L;
}

export interface Story {
  id: string;
  art: string;
  recruit?: CompanionId;
  title: L;
  text: L;
  choices: Choice[];
}

export const STORIES: Story[] = [
  {
    id: "meetAyse",
    art: "c:ayse",
    recruit: "ayse",
    title: { tr: "Çarşıdaki Abaküs", en: "The Abacus in the Bazaar" },
    text: {
      tr: "Buhara çarşısında genç bir kadın, kâtibinin bir saatte yaptığı hesabı abaküsüyle bir dakikada bitiriyor. \"Defterlerinde üç hata var,\" diyor gülümseyerek. \"Birini bedava söylerim.\"",
      en: "In the Bukhara bazaar a young woman finishes on her abacus in a minute what your scribe does in an hour. \"Your ledgers have three mistakes,\" she smiles. \"I'll tell you one for free.\"",
    },
    choices: [
      { label: { tr: "Kervana katıl, Ayşe", en: "Join the caravan, Ayse" }, win: [{ kind: "recruit", id: "ayse" }], winText: { tr: "Ayşe abaküsünü omzuna atıyor: \"Önce maaşımı konuşalım. Şaka, şaka.\"", en: "Ayse slings her abacus over her shoulder: \"First, my salary. Kidding.\"" } },
      { label: { tr: "Hataları bul, ücretini öde", en: "Pay her to fix the ledgers" }, win: [{ kind: "gold", sec: 120 }], winText: { tr: "Kayıp altınlar defterin arasından çıktı!", en: "The lost gold turned up between the pages!" } },
    ],
  },
  {
    id: "meetBatu",
    art: "c:batu",
    recruit: "batu",
    title: { tr: "Bozkırın Oku", en: "Arrow of the Steppe" },
    text: {
      tr: "Haramiler kervanı sardığında bir ok yağmuru başlıyor. Tepede tek bir Moğol okçu. Haramiler kaçınca yanına gelip devene bakıyor: \"Atın yok mu? Yazık.\"",
      en: "As bandits surround the caravan, a rain of arrows begins. On the hill, a lone Mongol archer. When the bandits flee he walks over and eyes your camel: \"No horse? Pity.\"",
    },
    choices: [
      { label: { tr: "Muhafızım ol, Batu", en: "Be my guard, Batu" }, win: [{ kind: "recruit", id: "batu" }], winText: { tr: "Batu başını sallıyor. Bir daha haramiler bu kervana iki kez bakacak.", en: "Batu nods. Bandits will think twice about this caravan." } },
      { label: { tr: "Ödülünü ver, uğurla", en: "Reward him and part ways" }, win: [{ kind: "gold", sec: 90 }], winText: { tr: "Batu altını almıyor, haramilerin ganimetini sana bırakıyor.", en: "Batu refuses the gold and leaves you the bandits' loot." } },
    ],
  },
  {
    id: "meetFerhat",
    art: "c:ferhat",
    recruit: "ferhat",
    title: { tr: "Yıldızların Kılavuzu", en: "Guide of the Stars" },
    text: {
      tr: "Gece kampında bir genç usturlabını göğe doğrultmuş. \"Bu yoldan üç gün sürer,\" diyor. \"Yıldızların yolundan iki.\" Kervancılar kıkırdıyor. O ise hiç gülmüyor.",
      en: "At the night camp, a young man aims his astrolabe at the sky. \"This road takes three days,\" he says. \"The road of the stars, two.\" The drivers giggle. He doesn't.",
    },
    choices: [
      { label: { tr: "Kılavuzumuz ol, Ferhat", en: "Be our guide, Ferhat" }, win: [{ kind: "recruit", id: "ferhat" }], winText: { tr: "Ertesi sabah kervan, haritalarda olmayan bir geçitten geçiyor.", en: "Next morning the caravan passes through a gorge no map has ever shown." } },
      { label: { tr: "Sadece haritasını satın al", en: "Just buy his star chart" }, win: [{ kind: "boost", mult: 2, sec: 120 }], winText: { tr: "Kestirme yollar sayesinde kervanlar uçuyor!", en: "Thanks to the shortcuts, the caravans fly!" } },
    ],
  },
  {
    id: "meetLeyla",
    art: "c:leyla",
    recruit: "leyla",
    title: { tr: "Kervansarayda Gazel", en: "A Ghazal at the Caravanserai" },
    text: {
      tr: "Kervansarayın avlusunda bir udun sesi. Kızıl peçeli bir şair, yolların ve ayrılıkların gazelini okuyor. Yorgun deveciler bile ağlıyor.",
      en: "An oud echoes through the caravanserai courtyard. A poetess in a crimson veil sings a ghazal of roads and partings. Even the weary drivers weep.",
    },
    choices: [
      { label: { tr: "Kervanımıza şiir kat, Leyla", en: "Bring poetry to our caravan, Leyla" }, win: [{ kind: "recruit", id: "leyla" }], winText: { tr: "\"Kervan uyurken de şarkım yürür,\" diyor Leyla.", en: "\"My song walks on even when the caravan sleeps,\" says Leyla." } },
      { label: { tr: "Bir gazel daha ısmarla", en: "Request one more ghazal" }, win: [{ kind: "boost", mult: 3, sec: 60 }], winText: { tr: "Deveciler şevkle yola koyuluyor!", en: "The drivers set out with new fire!" } },
    ],
  },
  {
    id: "meetLucia",
    art: "c:lucia",
    recruit: "lucia",
    title: { tr: "Venedikli Ortak", en: "The Venetian Partner" },
    text: {
      tr: "Gemisi batmış, kervanı soyulmuş, ama sırıtması hâlâ yerinde. \"Bende Venedik pazarının bütün sırları var,\" diyor kızıl saçlı tüccar. \"Sende de develer. Anlaşalım mı?\"",
      en: "Her ship sank, her caravan was robbed, but her grin survived. \"I hold every secret of the Venetian market,\" says the red-haired merchant. \"You hold the camels. Deal?\"",
    },
    choices: [
      { label: { tr: "Ortak olalım, Lucia", en: "Partners, Lucia" }, win: [{ kind: "recruit", id: "lucia" }], winText: { tr: "Lucia defterini açıyor: \"İlk işimiz fiyatları ikiye katlamak.\"", en: "Lucia opens her ledger: \"First order of business: double the prices.\"" } },
      { label: { tr: "Mallarını ucuza al", en: "Buy her goods cheap" }, win: [{ kind: "gold", sec: 150 }], winText: { tr: "Venedik camları Semerkant'ta kapış kapış satıldı.", en: "The Venetian glass sold out in Samarkand." } },
    ],
  },
  {
    id: "meetKorkut",
    art: "c:korkut",
    recruit: "korkut",
    title: { tr: "Kopuzlu Ozan", en: "The Bard with the Kopuz" },
    text: {
      tr: "Yol kenarında kör bir ihtiyar, kopuzunu çalarak eski destanları anlatıyor. Sen yaklaşınca susuyor: \"Ayak seslerin tüccar ayak sesi. Ama yüreğin seyyah yüreği.\"",
      en: "By the roadside a blind old man plays his kopuz, telling ancient epics. As you approach he stops: \"Your steps are a merchant's. But your heart is a traveler's.\"",
    },
    choices: [
      { label: { tr: "Bizimle gel, Dede", en: "Come with us, Grandfather" }, win: [{ kind: "recruit", id: "korkut" }], winText: { tr: "\"Her kervanın bir destanı vardır,\" diyor Dede Korkut. \"Seninkini ben yazacağım.\"", en: "\"Every caravan has its epic,\" says Korkut. \"I shall tell yours.\"" } },
      { label: { tr: "Sadaka ver, hayır duası al", en: "Give alms, receive a blessing" }, win: [{ kind: "boost", mult: 2, sec: 180 }], winText: { tr: "\"Yolun açık olsun.\" Gerçekten de açık.", en: "\"May your road be open.\" And it is." } },
    ],
  },
  {
    id: "sandstorm",
    art: "summer",
    title: { tr: "Kum Fırtınası", en: "Sandstorm" },
    text: {
      tr: "Ufukta turuncu bir duvar yükseliyor. Deveciler diz çöküp dua ediyor. Fırtınaya rağmen devam edersen pazara herkesten önce varırsın. Ya da hiç varamazsın.",
      en: "An orange wall rises on the horizon. The drivers kneel and pray. Push through and you'll reach the market before anyone else. Or never reach it at all.",
    },
    choices: [
      { label: { tr: "Ferhat yolu bulsun", en: "Let Ferhat find the way" }, requires: "ferhat", win: [{ kind: "gold", sec: 300 }], winText: { tr: "Ferhat fırtınanın gözünden geçen bir yol buldu. Pazar sizin!", en: "Ferhat found a path through the eye of the storm. The market is yours!" } },
      { label: { tr: "Devam et!", en: "Push on!" }, chance: 0.55, win: [{ kind: "gold", sec: 300 }], winText: { tr: "Fırtınayı yendiniz. Pazar bomboş, fiyatlar sizin elinizde!", en: "You beat the storm. The market is empty and the prices are yours!" }, lose: [{ kind: "lose", pct: 0.06 }], loseText: { tr: "Kum, yüklerin bir kısmını yuttu.", en: "The sand swallowed part of your cargo." } },
      { label: { tr: "Sığın ve bekle", en: "Take shelter and wait" }, win: [], winText: { tr: "Fırtına geçti. Kimse kaybolmadı, kimse zengin olmadı.", en: "The storm passed. No one was lost, no one got rich." } },
    ],
  },
  {
    id: "wedding",
    art: "crown",
    title: { tr: "Semerkant'ta Düğün", en: "A Wedding in Samarkand" },
    text: {
      tr: "Bir beyin kızı evleniyor ve bütün tüccarlar davetli. Hediyesiz gitmek ayıp. Ama hediyeler pahalı.",
      en: "A lord's daughter is getting married and every merchant is invited. Arriving without a gift is shameful. But gifts are expensive.",
    },
    choices: [
      { label: { tr: "Görkemli bir hediye götür", en: "Bring a magnificent gift" }, win: [{ kind: "cost", sec: 60 }, { kind: "boost", mult: 3, sec: 120 }], winText: { tr: "Bey çok memnun. Bütün kapılar size açıldı!", en: "The lord is delighted. Every door opens for you!" } },
      { label: { tr: "Leyla bir gazel okusun", en: "Let Leyla sing a ghazal" }, requires: "leyla", win: [{ kind: "boost", mult: 4, sec: 120 }], winText: { tr: "Gelin ağladı, bey ağladı, herkes ağladı. Hediyelerin en güzeli!", en: "The bride wept, the lord wept, everyone wept. The finest gift of all!" } },
      { label: { tr: "Kibarca özür dile", en: "Politely decline" }, win: [], winText: { tr: "Yolunuza devam ettiniz.", en: "You continued on your way." } },
    ],
  },
  {
    id: "envoy",
    art: "seal",
    title: { tr: "Moğol Elçisi", en: "The Mongol Envoy" },
    text: {
      tr: "Altın paizalı bir elçi yolu kesiyor. \"Han'ın topraklarından geçen herkes vergi öder.\" Arkasındaki atlılar pek sabırlı görünmüyor.",
      en: "An envoy bearing a golden paiza blocks the road. \"All who cross the Khan's lands pay tribute.\" The riders behind him don't look patient.",
    },
    choices: [
      { label: { tr: "Batu konuşsun", en: "Let Batu talk" }, requires: "batu", win: [{ kind: "boost", mult: 2, sec: 240 }], winText: { tr: "Batu ile elçi aynı obadan çıkmış! Han'ın koruması artık sizinle.", en: "Batu and the envoy are from the same clan! The Khan's protection is now yours." } },
      { label: { tr: "Vergiyi öde", en: "Pay the tribute" }, win: [{ kind: "cost", sec: 45 }, { kind: "boost", mult: 2, sec: 150 }], winText: { tr: "Paizalı bir kervan kimseden korkmaz.", en: "A caravan under the paiza fears no one." } },
      { label: { tr: "Reddet", en: "Refuse" }, chance: 0.5, win: [], winText: { tr: "Elçi omuz silkip gitti. Şanslısınız.", en: "The envoy shrugged and rode off. Lucky you." }, lose: [{ kind: "lose", pct: 0.1 }], loseText: { tr: "Atlılar \"vergiyi\" kendileri aldı.", en: "The riders collected the \"tribute\" themselves." } },
    ],
  },
  {
    id: "treasure",
    art: "scroll",
    title: { tr: "Define Haritası", en: "The Treasure Map" },
    text: {
      tr: "Ölmek üzere olan bir derviş, eline yıpranmış bir harita tutuşturuyor. \"Merv'in harabelerinde... İskender'in hazinesi...\" Kazmak zaman alır. Haritayı satmak ise hemen para eder.",
      en: "A dying dervish presses a worn map into your hand. \"In the ruins of Merv... Alexander's treasure...\" Digging takes time. Selling the map pays now.",
    },
    choices: [
      { label: { tr: "Kaz!", en: "Dig!" }, chance: 0.4, win: [{ kind: "gold", sec: 900 }], winText: { tr: "Altın sikkeler, mücevherler... İskender'in hazinesi gerçekmiş!", en: "Gold coins, jewels... Alexander's treasure was real!" }, lose: [{ kind: "cost", sec: 30 }], loseText: { tr: "Sadece kırık testiler ve bir akrep çıktı.", en: "Only broken jars and one scorpion." } },
      { label: { tr: "Haritayı sat", en: "Sell the map" }, win: [{ kind: "gold", sec: 120 }], winText: { tr: "Saf bir tüccar haritaya servet ödedi.", en: "A gullible merchant paid a fortune for it." } },
    ],
  },
  {
    id: "spy",
    art: "silk",
    title: { tr: "İpek Böceğinin Sırrı", en: "The Secret of the Silkworm" },
    text: {
      tr: "Bastonunun içinde ipek böceği yumurtaları saklayan bir keşiş, sırrını satmak istiyor. Bu sır Çin'de ölüm cezası demek.",
      en: "A monk hiding silkworm eggs inside his walking stick wants to sell the secret. In China, this secret means death.",
    },
    choices: [
      { label: { tr: "Satın al", en: "Buy it" }, win: [{ kind: "cost", sec: 90 }, { kind: "boost", mult: 5, sec: 75 }], winText: { tr: "Kendi ipeğiniz! Pazarlar çıldırdı.", en: "Your own silk! The markets go wild." } },
      { label: { tr: "Lucia pazarlık etsin", en: "Let Lucia haggle" }, requires: "lucia", win: [{ kind: "boost", mult: 5, sec: 90 }], winText: { tr: "Lucia keşişi öyle bir ikna etti ki keşiş üste para verdi.", en: "Lucia persuaded the monk so well he paid her." } },
      { label: { tr: "Muhafızlara teslim et", en: "Turn him in" }, win: [{ kind: "gold", sec: 100 }], winText: { tr: "Bey sadakatinizi ödüllendirdi.", en: "The lord rewarded your loyalty." } },
    ],
  },
  {
    id: "hodja",
    art: "t:nasreddin",
    title: { tr: "Ters Binen Hoca", en: "The Backwards Rider" },
    text: {
      tr: "Yolda eşeğine ters binmiş bir hocayla karşılaşıyorsun. Kervancılar gülmekten yerlere yatıyor.",
      en: "On the road you meet a hodja riding his donkey backwards. Your drivers are rolling with laughter.",
    },
    choices: [
      { label: { tr: "\"Hocam neden ters bindin?\"", en: "\"Hodja, why ride backwards?\"" }, win: [{ kind: "boost", mult: 2, sec: 120 }], winText: { tr: "\"Ben ters binmedim, eşek ters duruyor!\" Kahkahalar kervanı yeniden canlandırdı.", en: "\"I'm not backwards, the donkey is!\" The laughter revives the whole caravan." } },
      { label: { tr: "Ona bir kese altın ver", en: "Give him a purse of gold" }, win: [{ kind: "cost", sec: 20 }, { kind: "gold", sec: 160 }], winText: { tr: "\"Kazan doğurdu!\" diyerek keseyi iki keseyle geri verdi.", en: "\"The pot gave birth!\" he says, returning your purse with another." } },
    ],
  },
  {
    id: "fire",
    art: "b:caravanserai",
    title: { tr: "Kervansarayda Yangın", en: "Fire at the Caravanserai" },
    text: {
      tr: "Gece yarısı ahırlardan dumanlar yükseliyor. Kendi yüklerini kurtarabilirsin. Ya da herkesle birlikte yangını söndürmeye koşabilirsin.",
      en: "At midnight smoke rises from the stables. You can save your own cargo. Or run with everyone to fight the fire.",
    },
    choices: [
      { label: { tr: "Yangını söndür", en: "Fight the fire" }, win: [{ kind: "boost", mult: 3, sec: 90 }], winText: { tr: "Bütün tüccarlar size minnettar. İndirimler yağıyor!", en: "Every merchant is grateful. Discounts pour in!" } },
      { label: { tr: "Yüklerini kurtar", en: "Save your cargo" }, win: [{ kind: "gold", sec: 80 }], winText: { tr: "Mallar sağlam. Ama bazı bakışlar soğuk.", en: "The goods are safe. Some looks are cold, though." } },
    ],
  },
  {
    id: "oasis",
    art: "genie",
    title: { tr: "Gizli Vaha", en: "The Hidden Oasis" },
    text: {
      tr: "Bir deve sürüden ayrılıp kumulların arkasına koşuyor. Peşinden gidince haritalarda olmayan bir vaha buluyorsunuz: hurmalar, serin su ve bir çeşme yazıtı.",
      en: "A camel breaks from the herd and runs behind the dunes. Following it, you find an oasis on no map: dates, cool water and an inscribed fountain.",
    },
    choices: [
      { label: { tr: "Burada dinlen", en: "Rest here" }, win: [{ kind: "boost", mult: 2, sec: 200 }], winText: { tr: "Dinlenmiş develer iki kat hızlı yürüyor.", en: "Rested camels walk twice as fast." } },
      { label: { tr: "Dede Korkut yazıtı okusun", en: "Let Korkut read the inscription" }, requires: "korkut", win: [{ kind: "gold", sec: 400 }], winText: { tr: "Yazıt bir hazinenin yerini anlatıyordu. Dede gülümsüyor: \"Gözle değil, kulakla okudum.\"", en: "The inscription told of a hidden treasure. Korkut smiles: \"I read it with my ears.\"" } },
      { label: { tr: "Hurmaları topla, sat", en: "Gather and sell the dates" }, win: [{ kind: "gold", sec: 110 }], winText: { tr: "Taze hurmalar pazarda kapışıldı.", en: "Fresh dates sold out in the market." } },
    ],
  },
];

export function pickStory(s: GameState): Story | null {
  const recent = new Set(s.storiesSeen.slice(-6));
  const recruitable = STORIES.filter((st) => st.recruit && !(s.companions[st.recruit] ?? 0));
  const normal = STORIES.filter((st) => !st.recruit && !recent.has(st.id));
  const pool = recruitable.length > 0 && (Math.random() < 0.55 || normal.length === 0) ? recruitable : normal;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function availableChoices(s: GameState, st: Story): Choice[] {
  return st.choices.filter((c) => !c.requires || (s.companions[c.requires] ?? 0) > 0);
}

export function outcomeGold(o: Outcome, s: GameState, income: number): number {
  if (o.kind === "gold") return Math.max(150, income * o.sec) * compMult.story(s);
  if (o.kind === "cost") return Math.min(s.gold, Math.max(50, income * o.sec));
  if (o.kind === "lose") return s.gold * o.pct;
  return 0;
}

export function applyOutcomes(s: GameState, list: Outcome[], income: number, now: number, earn: (n: number) => void): void {
  for (const o of list) {
    const g = outcomeGold(o, s, income);
    if (o.kind === "gold") earn(g);
    else if (o.kind === "cost" || o.kind === "lose") s.gold = Math.max(0, s.gold - g);
    else if (o.kind === "boost") {
      const until = now + o.sec * 1000 * compMult.story(s);
      if (!(s.boostUntil > now && s.boostMult > o.mult)) s.boostMult = o.mult;
      s.boostUntil = Math.max(s.boostUntil, until);
    } else if (o.kind === "recruit") s.companions[o.id] = Math.max(1, s.companions[o.id] ?? 0);
    else if (o.kind === "steel") s.mats.steel += o.n;
  }
}
