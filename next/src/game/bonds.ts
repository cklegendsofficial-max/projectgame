import type { CompId } from "./story";
import type { RoadFx } from "./road";
import type { Army } from "./data";

export type BondEvent = "win" | "lose" | "boss" | "conquer" | "kilic" | "feast" | "taxHeavy" | "trade" | "robbed" | "sing" | "toreFair" | "toreHarsh" | "voyage" | "rescue";

export const BOND_START = 20;
export const BOND_QUEST = 50;
export const BOND_LEAVE = -40;
export const SWORN_MULT = 1.5;

/** Yoldaşların neyi sevip neyi sevmediği. */
export const BOND_FX: Record<BondEvent, Partial<Record<CompId, number>>> = {
  win: { batu: 2, ferhat: 1 },
  lose: { batu: -3, leyla: -1 },
  boss: { batu: 4, korkut: 3, ferhat: 3, ayse: 1 },
  conquer: { batu: 5, ayse: -3, lucia: -2, leyla: 1 },
  kilic: { ayse: -12, korkut: -8, batu: 3, lucia: -6 },
  feast: { ayse: 4, korkut: 4, leyla: 2, batu: 2 },
  taxHeavy: { ayse: -2, korkut: -1, leyla: 1 },
  trade: { leyla: 2, lucia: 2 },
  robbed: { leyla: -4, lucia: -4, batu: -2 },
  sing: { korkut: 4, ayse: 1 },
  toreFair: { ayse: 4, korkut: 3, ferhat: 1 },
  toreHarsh: { ayse: -4, batu: 2, korkut: -2 },
  voyage: { lucia: 4, leyla: 2 },
  rescue: { ayse: 3, ferhat: 2, batu: 1 },
};

export const BOND_LIKES: Record<CompId, string> = {
  ayse: "Merhamet, adil hüküm, şölen",
  korkut: "Türküler, destanlar, adil töre",
  ferhat: "Boss avları, kurtarmalar, zafer",
  batu: "Savaş, fetih, sert yönetim",
  leyla: "Kârlı ticaret, düzen",
  lucia: "Deniz seferleri, ticaret",
};

export const BOND_LIKES_EN: Record<CompId, string> = {
  ayse: "Mercy, fair judgment, feasts",
  korkut: "Songs, sagas, fair töre",
  ferhat: "Boss hunts, rescues, victory",
  batu: "War, conquest, a firm hand",
  leyla: "Profitable trade, order",
  lucia: "Sea voyages, trade",
};

export function bondTier(v: number): { name: string; en: string; cls: string } {
  if (v >= 75) return { name: "Can yoldaşı", en: "Soulmate", cls: "cheap" };
  if (v >= 40) return { name: "Güvenir", en: "Trusting", cls: "cheap" };
  if (v >= 0) return { name: "Temkinli", en: "Wary", cls: "" };
  return { name: "Küskün", en: "Resentful", cls: "dear" };
}

export interface CqChoice {
  label: string;
  text: string;
  bond: number;
  fx: RoadFx;
  fight?: (lv: number) => Army;
}

export interface CqStep {
  city: string;
  text: string;
  btn?: string;
  choices?: CqChoice[];
}

export interface CompQuest {
  id: CompId;
  title: string;
  offer: string;
  steps: CqStep[];
  sworn: string;
}

const A = (s: number, a: number, h: number): Army => ({ spear: s, archer: a, horse: h });

export const COMP_QUESTS: Record<CompId, CompQuest> = {
  ayse: {
    id: "ayse",
    title: "Annemizin Mezarı",
    offer: "Ayşe bir gece ateşin başında sessizce konuştu: \"Annemizi Kara Tamga baskınında Buhara yolunda gömdüler. Mezarı başında dua bile edemedik. Benimle gelir misin?\"",
    steps: [
      { city: "bukhara", text: "Buhara'nın yaşlı mezarcısı hatırladı: \"O baskında ölenleri şehrin dışına, kervan yolunun kenarına gömdük. Ama şimdi o tarlayı bir bey sahiplenmiş, mezar taşlarını sökmüş.\"", btn: "Beyin konağına git" },
      { city: "bukhara", text: "Bey, sökülen taşlarla ahırını örmüş. Ayşe titriyor: \"Ne yapacağız?\"", choices: [
        { label: "Taşları satın al (300 altın)", text: "Bey parayı aldı, taşlar yerine kondu. Ayşe annesinin başında saatlerce ağladı, sonra ilk kez gülümsedi.", bond: 25, fx: { gold: -300, renown: 3 } },
        { label: "Beyi kurultaya şikâyet et", text: "Töre açıktı: ölünün taşına dokunulmaz. Bey taşları yerine koymak ve ceza ödemek zorunda kaldı.", bond: 20, fx: { kut: 4, renown: 5 } },
        { label: "Taşları zorla geri al", text: "Beyin adamlarını dağıttın ve taşları geri dikti. Ayşe minnettar ama şiddetten ürktü.", bond: 10, fx: { renown: 6 }, fight: (lv) => A(6 + lv, 3 + lv, 2 + Math.floor(lv / 2)) },
      ] },
    ],
    sworn: "Ayşe artık yalnızca kız kardeşin değil, ruhunun yarısı. Şifası iki kat güçlü.",
  },
  korkut: {
    id: "korkut",
    title: "Kayıp Kopuz",
    offer: "Derviş Korkut kopuzunun tellerini okşadı: \"Bu kopuz ustamındı. Onun ustasınınki ise Merv'de bir hazine avcısının elinde. O kopuzla söylenen destan, ölüleri bile ağlatır derler.\"",
    steps: [
      { city: "merv", text: "Merv çarşısında hazine avcısı Tahir bulundu. \"Kopuz mu? Onu Nişabur'daki bir tüccara sattım, gümüş tellerini sökmüş olmasın!\"", btn: "Nişabur'a yola çık" },
      { city: "nishapur", text: "Tüccar kopuzu duvarına asmış, satmaya niyeti yok. Korkut'un gözleri dolu.", choices: [
        { label: "Bir türkü yarışı teklif et", text: "Korkut kopuzuyla öyle bir destan söyledi ki tüccar ağladı ve kopuzu kendi eliyle verdi.", bond: 25, fx: { renown: 8, xp: 120 } },
        { label: "Kopuzu satın al (450 altın)", text: "Tüccar pazarlığı sevdi ama sonunda razı oldu. Korkut kopuzu göğsüne bastırdı.", bond: 20, fx: { gold: -450, renown: 4 } },
      ] },
    ],
    sworn: "Ustasının kopuzuyla Korkut'un sözleri artık daha derine işliyor. Tecrübe ve ordu bonusu %50 arttı.",
  },
  ferhat: {
    id: "ferhat",
    title: "Ak Bozkurt",
    offer: "Ferhat yere çömelip bir iz gösterdi: \"Bu, kurtlar arasında büyüdüğüm sürünün başbuğu Ak Bozkurt'un izi. Peşinde avcılar var. Onu kurtarmalıyım.\"",
    steps: [
      { city: "kashgar", text: "Kaşgar'da avcıların, beyaz bir kurt postu için yüz altın ödül koyan bir tüccara çalıştığını öğrendin. Avcılar dağ yolunda kamp kurmuş.", btn: "Avcıların izini sür" },
      { city: "kashgar", text: "Kamp önünde: kafeste yaralı Ak Bozkurt, çevresinde silahlı avcılar.", choices: [
        { label: "Kampa saldır", text: "Avcıları dağıttın. Ferhat kafesi açtı; Ak Bozkurt ona baktı, uludu ve dağlara koştu.", bond: 25, fx: { renown: 8, xp: 160 }, fight: (lv) => A(4 + lv, 8 + lv, 3 + Math.floor(lv / 2)) },
        { label: "Avcılara ödülden fazlasını öde (250 altın)", text: "Avcılar parayı alıp gitti. Ferhat kurdu serbest bıraktı; kan dökülmediği için sessizce teşekkür etti.", bond: 18, fx: { gold: -250, kut: 2 } },
      ] },
    ],
    sworn: "Ferhat'ın izciliği artık bir kurt sürüsünün gözleriyle bakıyor. Hız ve görüş %50 arttı.",
  },
  batu: {
    id: "batu",
    title: "Sancağın Lekesi",
    offer: "Batu kılıcını bileyledi: \"Beni ordudan korkaklıkla suçlayarak kovdular. Asıl kaçan, beni suçlayan Togan Tarkan'dı. Şimdi Rey'de muhafız başı. Adımı temize çıkarmak istiyorum.\"",
    steps: [
      { city: "rey", text: "Rey'de eski askerlerden biri konuştu: \"O gün Togan kaçtı, Batu geride kalıp yaralıları taşıdı. Ama kimse Togan'a karşı tanıklık etmeye cesaret edemez.\"", btn: "Togan'la yüzleş" },
      { city: "rey", text: "Togan Tarkan muhafızlarıyla karşında. Batu dişlerini sıkıyor.", choices: [
        { label: "Teke tek dövüş iste", text: "Batu, Togan'ı herkesin önünde yere serdi ama canını bağışladı. Askerler onun adını yeniden saygıyla anıyor.", bond: 25, fx: { renown: 10, xp: 180 }, fight: (lv) => A(10 + lv * 2, 4 + lv, 4 + lv) },
        { label: "Tanıkları kurultaya götür", text: "Tanıklar konuştu, Togan rütbesini yitirdi. Batu kılıcını kınına soktu: \"Adalet kılıçtan keskin.\"", bond: 15, fx: { kut: 4, renown: 6 } },
      ] },
    ],
    sworn: "Batu'nun onuru geri döndü; savaşta yanında olmak askerlerine yürek veriyor. Saldırı ve ordu bonusu %50 arttı.",
  },
  leyla: {
    id: "leyla",
    title: "Babamın Borcu",
    offer: "Leyla defterini kapattı: \"Babamın dükkânını borç yüzünden Tebriz'in tefecisi aldı. Ama o borç sahte senetle yazıldı. Kanıtı Konya'daki ortağında.\"",
    steps: [
      { city: "konya", text: "Konya'da babasının eski ortağı titrek elleriyle gerçek senedi çıkardı: \"Korktum, kimseye gösteremedim.\"", btn: "Senedi Tebriz'e götür" },
      { city: "tabriz", text: "Tefeci kadı huzurunda. Elinde sahte senet, yanında kiralık adamları.", choices: [
        { label: "Senedi kadıya sun", text: "Kadı sahteliği gördü; dükkân Leyla'ya döndü, tefeci zindanı boyladı. Leyla ilk kez babasının tezgâhında durdu.", bond: 25, fx: { gold: 200, renown: 6, kut: 2 } },
        { label: "Tefecinin adamlarını dağıt", text: "Kiralık kılıçlar kaçtı, tefeci dükkânın anahtarını kendi eliyle verdi. Leyla memnun ama çarşıda dedikodu başladı.", bond: 15, fx: { gold: 300, wanted: 1 }, fight: (lv) => A(8 + lv, 4 + lv, 2) },
      ] },
    ],
    sworn: "Leyla'nın dükkânı artık senin kervanlarının da ambarı. Ticaret ve yük bonusu %50 arttı.",
  },
  lucia: {
    id: "lucia",
    title: "Venedik Mührü",
    offer: "Lucia altın bir mühür gösterdi: \"Bu, Venedik konseyinin mührü. Onu Konstantiniyye'ye ulaştırırsam Doğu'da serbest ticaret izni alacağız. Ama Ceneviz casusları peşimde.\"",
    steps: [
      { city: "tabriz", text: "Tebriz hanında Cenevizli casus seni bekliyordu: \"Mührü bize ver, iki katını öderiz.\" Lucia başını iki yana salladı.", btn: "Yola devam" },
      { city: "constantinople", text: "Galata kapısında Ceneviz muhafızları yolu kesti.", choices: [
        { label: "Kapıyı zorla geç", text: "Muhafızları dağıttın, mühür konseye ulaştı. Lucia seni Venedik'in fahri tüccarı ilan ettirdi.", bond: 25, fx: { renown: 10, gold: 400 }, fight: (lv) => A(8 + lv * 2, 6 + lv, 2 + lv) },
        { label: "Bizans muhafızlarına rüşvet ver (300 altın)", text: "Gizli bir kapıdan geçtiniz. Lucia mührü teslim etti ve sana göz kırptı: \"Doğu'yu iyi biliyorsun.\"", bond: 20, fx: { gold: -300, renown: 6 } },
      ] },
    ],
    sworn: "Venedik ticaret izniyle Lucia'nın bağlantıları artık senin de. Ticaret ve yük bonusu %50 arttı.",
  },
};
