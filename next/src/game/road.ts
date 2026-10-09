import type { Army } from "./data";
import type { Stat } from "./rpg";
import type { SeasonId } from "./seasons";

export interface RoadFx {
  gold?: number;
  food?: number;
  /** maks. canın oranı */
  hp?: number;
  /** yükün oranı kadar kayıp */
  cargo?: number;
  /** rastgele mal kazancı */
  good?: number;
  units?: Partial<Army>;
  renown?: number;
  kut?: number;
  xp?: number;
  wanted?: number;
}

export interface RoadOpt {
  label: string;
  cost?: { gold?: number; food?: number };
  check?: { stat: Stat; dc: number };
  ok: RoadFx & { text: string };
  fail?: RoadFx & { text: string };
  fight?: { army: Army; bonus: number; foe: string };
}

export interface RoadCtx {
  season: SeasonId;
  night: boolean;
  cargo: number;
  army: number;
  lv: number;
}

export interface RoadEvent {
  id: string;
  title: string;
  icon: string;
  text: string;
  when?: (c: RoadCtx) => boolean;
  opts: (c: RoadCtx) => RoadOpt[];
}

export const ROAD_STEP = 700;
export const ROAD_CHANCE = 0.4;
export const ROAD_PER_DAY = 3;

export function checkChance(stat: number, dc: number): number {
  return Math.max(0.15, Math.min(0.9, stat / (stat + dc * 0.35)));
}

const a = (spear: number, archer: number, horse: number): Army => ({ spear, archer, horse });

export const ROAD_EVENTS: RoadEvent[] = [
  {
    id: "teker",
    title: "Kırık Dingil",
    icon: "j_caravan",
    text: "Taşlı bir yokuşta arabanın dingili çatırdayarak kırıldı. Yükler yola saçıldı, develer huysuzlanıyor.",
    when: (c) => c.cargo > 0,
    opts: () => [
      { label: "Dingili kendin onar", check: { stat: "guc", dc: 9 }, ok: { text: "Kollarını sıvadın, kırık dingili sırımla sardın. Kervan yoluna devam ediyor.", xp: 15 }, fail: { text: "Dingil elinde ikiye ayrıldı. Yükün bir kısmını yol kenarında bırakmak zorunda kaldın.", cargo: 0.25 } },
      { label: "Yükü hafiflet", ok: { text: "En ağır balyaları bıraktın. Kervan hafifledi ama keselerin de.", cargo: 0.15 } },
    ],
  },
  {
    id: "kuyu",
    title: "Kuyu Başında Yolcu",
    icon: "map/oasis",
    text: "Kurumuş bir kuyunun başında yaşlı bir yolcu, dudakları çatlamış, sana bakıyor.",
    opts: () => [
      { label: "Azığını paylaş", cost: { food: 15 }, ok: { text: "Yaşlı adam suyu içti, gözleri doldu: \"Tengri yolunu açık etsin.\" Kervandakiler bu cömertliği konuşuyor.", renown: 3, kut: 2, xp: 10 } },
      { label: "Yoluna devam et", ok: { text: "Arkana bakmadan yürüdün. Rüzgâr bir süre boyunca sessiz kaldı." } },
    ],
  },
  {
    id: "kum",
    title: "Kum Duvarı",
    icon: "map/oasis",
    text: "Ufukta kızıl bir duvar yükseliyor. Kum fırtınası birkaç dakika içinde kervanı yutacak.",
    when: (c) => c.season === "yaz" || c.season === "guz",
    opts: () => [
      { label: "Hızla geç", check: { stat: "cev", dc: 9 }, ok: { text: "Atları kamçıladın; fırtınanın kuyruğundan sıyrılıp kurtuldun.", xp: 15 }, fail: { text: "Fırtına yakaladı. Gözler kum dolu, birkaç çuval savruldu.", hp: -0.2, food: -25 } },
      { label: "Develeri çöktür, siper al", ok: { text: "Develerin arkasına sığındınız. Fırtına uğuldayarak geçti; hepiniz yorgun ama sağsınız.", hp: -0.08 } },
    ],
  },
  {
    id: "kurt",
    title: "Kurt Sürüsü",
    icon: "j_bandit",
    text: "Karanlıkta yeşil gözler parladı. Aç bir kurt sürüsü kervanın etrafında daire çiziyor.",
    when: (c) => c.night || c.season === "kis",
    opts: () => [
      { label: "Kılıcını çek", check: { stat: "guc", dc: 10 }, ok: { text: "Sürü başını yere serdin; ötekiler karanlığa dağıldı. Postları değerli.", good: 2, xp: 25, renown: 2 }, fail: { text: "Kurtlar saldırdı. Onları kovdun ama kolunda derin dişler var.", hp: -0.22 } },
      { label: "Ateş yak, bekle", cost: { food: 20 }, ok: { text: "Bütün gece ateşi besledin. Şafakla birlikte sürü çekildi." } },
      { label: "Kurt Tengri'nin elçisidir, et at", cost: { food: 30 }, ok: { text: "Sürüye bir koyun bıraktın. Yaşlı dişi kurt başını eğip uzaklaştı. Kam olsa \"iyi alamet\" derdi.", kut: 3 } },
    ],
  },
  {
    id: "yarali",
    title: "Yaralı Atlı",
    icon: "u_cavalry",
    text: "Yol kenarında oku kanayan bir atlı yatıyor. Atı başında bekliyor. \"Haramiler...\" diye fısıldıyor.",
    opts: () => [
      { label: "Yarasını sar", cost: { food: 10 }, check: { stat: "kar", dc: 7 }, ok: { text: "Atlı ayağa kalktı, kılıcını sana uzattı: \"Bu can senin.\" Birliğine katıldı.", units: { horse: 1 }, kut: 1 }, fail: { text: "Elinden geleni yaptın ama atlı şafak sökmeden göçtü. Atını ve adını yanına aldın.", renown: 2 } },
      { label: "Atını ve kesesini al", ok: { text: "Kesede bir avuç gümüş vardı. Kervandakiler gözlerini kaçırıyor.", gold: 45, kut: -3 } },
      { label: "Geç", ok: { text: "Yolun kenarında bir kartal dönüp duruyor." } },
    ],
  },
  {
    id: "harac",
    title: "Yol Haracı",
    icon: "j_bandit",
    text: "Dar bir geçitte silahlı adamlar yolu kesti. \"Bu yol bizim beyimizin, geçmek isteyen haraç öder.\"",
    when: (c) => c.cargo > 0 || c.army > 0,
    opts: (c) => {
      const fee = 40 + c.lv * 8;
      const n = 4 + Math.round(c.lv * 0.7);
      return [
        { label: `Haracı öde`, cost: { gold: fee }, ok: { text: "Altınları saydın, adamlar kenara çekildi. Bir gün bu yol senin olacak." } },
        { label: "Pazarlık et", check: { stat: "kar", dc: 9 }, ok: { text: "Beylerinin adını sordun, kendi tuğunu anlattın. Haraççılar eğilip yolu açtı, bir kuruş almadan.", renown: 2 }, fail: { text: "Sözlerin işe yaramadı; iki katını ödedin.", gold: -fee * 2 } },
        { label: "Kılıçla geç", fight: { army: a(Math.ceil(n * 0.5), Math.ceil(n * 0.3), Math.ceil(n * 0.2)), bonus: 0, foe: "Haraççılar" }, ok: { text: "Geçit artık açık. Haraççıların kesesi de senin.", gold: fee, renown: 3 }, fail: { text: "Geri püskürtüldün." } },
      ];
    },
  },
  {
    id: "dervis",
    title: "Gezgin Derviş",
    icon: "healer",
    text: "Eski hırkalı bir derviş ateşinin başına davet ediyor. \"Yol uzun, söz kısa; otur da dinle.\"",
    opts: () => [
      { label: "Otur, dinle", ok: { text: "Derviş gece boyu Horasan erenlerini, Yesevi'nin hikmetlerini anlattı. Sabah zihnin berrak.", xp: 40 } },
      { label: "Sadaka ver", cost: { gold: 25 }, ok: { text: "Derviş elini başına koydu, dua etti. Yorgunluğun bir anda geçti.", hp: 0.5, kut: 2 } },
    ],
  },
  {
    id: "terk",
    title: "Terk Edilmiş Kervan",
    icon: "j_caravan",
    text: "Yağmalanmış bir kervanın enkazı. Develer ölmüş, ama bazı balyalar hâlâ sağlam görünüyor.",
    opts: () => [
      { label: "Balyaları topla", check: { stat: "cev", dc: 8 }, ok: { text: "Haramiler acele etmiş; geride değerli mallar kalmış.", good: 3 }, fail: { text: "Haramiler pusudaymış! Ok yağmurunun altında birkaç balya kapıp kaçtın.", good: 1, hp: -0.15 } },
      { label: "Kervancıları göm", ok: { text: "Ölüleri töreye uygun gömdün, kurganlarına birer taş koydun. Adın kervan yollarında hayırla anılacak.", renown: 3, kut: 2 } },
    ],
  },
  {
    id: "kacak",
    title: "Kaçak Köleler",
    icon: "foal",
    text: "Sazlıkta saklanan bir avuç kaçak köle. Zincir izleri bileklerinde taze. Peşlerinde köle tacirlerinin atlıları var.",
    opts: () => [
      { label: "Onları sakla, birliğine al", cost: { food: 20 }, ok: { text: "Bir zamanlar senin de bileklerinde zincir vardı. Kaçaklar sana yemin etti.", units: { spear: 3 }, kut: 3 } },
      { label: "Tacirlere teslim et", ok: { text: "Tacirler kese dolusu altın saydı. Kaçakların bakışı uzun süre aklından çıkmayacak.", gold: 90, kut: -5 } },
      { label: "Görmezden gel", ok: { text: "Sazlığın yanından sessizce geçtin." } },
    ],
  },
  {
    id: "senlik",
    title: "Yayla Şenliği",
    icon: "map/yurts",
    text: "Bir obada şenlik var: güreş, at yarışı, kımız. Bey çağırıyor: \"Misafir, bir güreş tutmaz mısın?\"",
    when: (c) => c.season === "bahar" || c.season === "yaz",
    opts: () => [
      { label: "Kispeti giy, güreş", check: { stat: "guc", dc: 10 }, ok: { text: "Obanın pehlivanını sırtüstü yere serdin! Bey ödülünü ve bir kese altın verdi.", gold: 70, renown: 5, xp: 20 }, fail: { text: "Pehlivan seni bir çırpıda yere serdi. Gülüşmeler arasında kalkıp elini sıktın.", hp: -0.1, renown: 1 } },
      { label: "At yarışına gir", check: { stat: "cev", dc: 10 }, ok: { text: "Atın rüzgâr gibi uçtu, ilk sen vardın. Ödül: iki tay ve şan.", units: { horse: 2 }, renown: 3 }, fail: { text: "Sonuncu geldin ama obanın kızları sana el salladı.", renown: 1 } },
      { label: "Kımız iç, dinlen", ok: { text: "Gece boyu kopuz çaldı, kımız aktı. Sabah dinç uyandın.", hp: 0.35, food: 30 } },
    ],
  },
  {
    id: "zar",
    title: "Kervansaray Kumarı",
    icon: "coins",
    text: "Bir kervansarayın avlusunda tüccarlar aşık kemiğiyle oynuyor. \"Gel yiğit, şansını dene!\"",
    opts: () => [
      { label: "60 altın koy", cost: { gold: 60 }, check: { stat: "cev", dc: 12 }, ok: { text: "Aşıklar \"at\" geldi! Tüccarlar homurdanarak keseyi uzattı.", gold: 150 }, fail: { text: "Aşık \"tava\" düştü. Altınlar başka keseye gitti." } },
      { label: "Seyret", ok: { text: "Kimin hile yaptığını izledin. Bir dahakine sen de bilirsin.", xp: 8 } },
    ],
  },
  {
    id: "elci",
    title: "Han Elçisi",
    icon: "lord_bey",
    text: "Atı köpüklenmiş bir ulak yolunu kesti. \"Beyim, efendim haber yolladı: yolda gördüklerini anlatırsan ödülü büyük.\"",
    when: (c) => c.lv >= 4,
    opts: () => [
      { label: "Bildiklerini anlat", check: { stat: "kar", dc: 10 }, ok: { text: "Hanın ulağı her sözünü yazdı. Kesesini uzatırken: \"Efendim bu adı unutmayacak.\"", gold: 80, renown: 4 }, fail: { text: "Ulak sözlerine pek inanmadı ama bir avuç gümüş bıraktı.", gold: 20 } },
      { label: "Sırrını sakla", ok: { text: "\"Bozkırda dil kılıçtan keskindir.\" Ulak omuz silkip gitti.", kut: 1 } },
    ],
  },
];
