export const KUT_START = 50;

export interface KutTier {
  min: number;
  name: string;
  desc: string;
}

export const KUT_TIERS: KutTier[] = [
  { min: 0, name: "Kutsuz", desc: "Halk adını lanetle anıyor. Şehirler isyana hazır, beyler sana oy vermez." },
  { min: 20, name: "Sönük Kut", desc: "Töre seni tam tanımıyor. Bağlılık ve ordu gücü zayıflıyor." },
  { min: 45, name: "Kutlu", desc: "Gök seni kabul etti. Ne fazla ne eksik." },
  { min: 70, name: "Kutlu Bey", desc: "Adın töreyle anılıyor. Şehirler bağlı, ordu yürekli." },
  { min: 90, name: "Gök Kutlu", desc: "Tengri'nin seçtiği bey. Beyler oyunu, halk canını verir." },
];

export function kutTier(k: number): KutTier {
  let t = KUT_TIERS[0];
  for (const x of KUT_TIERS) if (k >= x.min) t = x;
  return t;
}

/** Ordu gücü: kut 0 → −%6, 100 → +%6 */
export function kutArmy(k: number): number {
  return ((k - 50) / 50) * 0.06;
}

/** Şehir bağlılığı (dakika başına) */
export function kutLoy(k: number): number {
  return ((k - 50) / 50) * 0.4;
}

/** Kurultay oy şansı */
export function kutVote(k: number): number {
  return ((k - 50) / 50) * 0.12;
}

export interface ToreFx {
  kut?: number;
  gold?: number;
  renown?: number;
  food?: number;
  loy?: number;
  wanted?: number;
}

export interface ToreOpt {
  label: string;
  fx: ToreFx;
  out: string;
}

export interface ToreCase {
  id: string;
  title: string;
  icon: string;
  text: string;
  opts: ToreOpt[];
}

export const TORE_CASES: ToreCase[] = [
  {
    id: "kan",
    title: "Kan Davası",
    icon: "swords",
    text: "İki oba arasında kan döküldü. Ölenin kardeşi, katilin başını istiyor; katilin obası kan bedeli önermeye hazır.",
    opts: [
      { label: "Töreye göre kan bedeli (200 altın)", fx: { kut: 6, gold: -200, loy: 3 }, out: "Kan bedelini hazineden ödedin, iki oba barıştı. Aksakallar \"töre yerini buldu\" dedi." },
      { label: "Katili sürgün et", fx: { kut: 2 }, out: "Katil bozkıra sürüldü. Kimse tam hoşnut değil ama kan durdu." },
      { label: "Görmezden gel", fx: { kut: -6, loy: -4 }, out: "Davayı dinlemedin. İki oba birbirine girdi; halk \"bey adalet dağıtmıyor\" diye söyleniyor." },
    ],
  },
  {
    id: "tuccar",
    title: "Hileli Terazi",
    icon: "merchant",
    text: "Pazarda bir tüccarın terazisinin hileli olduğu ortaya çıktı. Tüccar, susman için sana kese dolusu altın uzatıyor.",
    opts: [
      { label: "Malına el koy, meydanda teşhir et", fx: { kut: 5, gold: 120, loy: 2 }, out: "Hileli terazi meydanda kırıldı, malları halka dağıtıldı. Pazarda dürüstlük yeniden başladı." },
      { label: "Rüşveti al (+300 altın)", fx: { kut: -8, gold: 300 }, out: "Kese hazineye girdi. Ama pazarda herkes neyin döndüğünü biliyor." },
    ],
  },
  {
    id: "kul",
    title: "Kaçak Kul",
    icon: "foal",
    text: "Bir bey'in kaçak kulu otağına sığındı. Bey kulunu geri istiyor; kul ise sen de bir zamanlar köleydin diye yalvarıyor.",
    opts: [
      { label: "Kulu azat et (bey'e 150 altın öde)", fx: { kut: 8, gold: -150, renown: 4 }, out: "Kulun zincirini kendi elinle çözdün. Bozkırda \"köleyken bey olan, kul azat eder\" diye anlatılıyor." },
      { label: "Töreye uy, kulu geri ver", fx: { kut: 1 }, out: "Kul sahibine döndü. Töre işledi ama gözlerindeki bakışı unutamadın." },
      { label: "Kulu kendi birliğine al", fx: { kut: -4, renown: 2 }, out: "Kul artık senin askerin. Bey sana diş biliyor." },
    ],
  },
  {
    id: "otlak",
    title: "Sınır Otlağı",
    icon: "map/farm",
    text: "İki boy aynı otlağı sahipleniyor. Biri eski tamgasını taşa kazımış, öteki otlağı yıllardır kullanıyor.",
    opts: [
      { label: "Otlağı paylaştır", fx: { kut: 4, loy: 2 }, out: "Otlak ortadan ikiye bölündü. İki boy da biraz homurdandı ama kılıçlar kında kaldı." },
      { label: "Otlağı kendi sürüne kat", fx: { kut: -5, food: 120 }, out: "Otlak artık bey sürüsünün. İki boy da sana küs." },
      { label: "Eski tamgaya hak ver", fx: { kut: 3, renown: 2 }, out: "Taşa kazınmış tamga töredir dedin. Aksakallar başını salladı." },
    ],
  },
  {
    id: "kitlik",
    title: "Kıtlık Yılı",
    icon: "food",
    text: "Kuzey obalarında kış uzun sürdü, çocuklar aç. Ambarların dolu; ama sefer için ayırdığın erzak bu.",
    opts: [
      { label: "Ambarları aç (200 yiyecek)", fx: { kut: 9, food: -200, loy: 5 }, out: "Ambarlar açıldı, obalar kışı atlattı. Analar çocuklarına senin adını veriyor." },
      { label: "Erzakı sefere sakla", fx: { kut: -5, loy: -3 }, out: "Ambarlar kapalı kaldı. Kuzeyden acı haberler geliyor." },
    ],
  },
  {
    id: "oglan",
    title: "Bey Oğlunun Suçu",
    icon: "lord_bey",
    text: "Müttefik bir beyin oğlu, pazarda bir çobanı sarhoş kafayla öldürdü. Beyin dostluğu sana gerekli.",
    opts: [
      { label: "Töre herkese eşittir: cezalandır", fx: { kut: 10, renown: 5, gold: -100 }, out: "Bey oğlu da olsa töre önünde eğildi. Beyin öfkesini hediyelerle yatıştırdın; halk ise seni yere göğe sığdıramıyor." },
      { label: "Kan bedeliyle kapat", fx: { kut: -2, gold: -80 }, out: "Çobanın ailesine kan bedeli ödendi. Bey memnun, halk sessiz." },
      { label: "Örtbas et", fx: { kut: -9 }, out: "Olay kapandı. Ama çobanın anası her gün otağının önünde ağlıyor." },
    ],
  },
  {
    id: "kam",
    title: "Kam'ın Kehaneti",
    icon: "ruh",
    text: "Yaşlı bir kam, ateşte kara bir kurt gördüğünü söylüyor: \"Bey Tengri'ye kurban vermezse kut göçer.\"",
    opts: [
      { label: "Kurban ver, şölen kur (150 altın, 60 yiyecek)", fx: { kut: 7, gold: -150, food: -60 }, out: "Ak bir at Tengri'ye adandı, davullar sabaha dek çaldı. Kam gülümsedi: \"Kut yerinde.\"" },
      { label: "Kehanete kulak asma", fx: { kut: -3 }, out: "Kam başını iki yana salladı ve bozkıra yürüdü. Obalarda fısıltılar başladı." },
    ],
  },
  {
    id: "vergi",
    title: "Vergi Şikâyeti",
    icon: "coins",
    text: "Köy ihtiyarları otağına geldi: vergi tahsildarların atlarını ve tohumluk buğdaylarını da almış.",
    opts: [
      { label: "Alınanı geri ver (180 altın)", fx: { kut: 6, gold: -180, loy: 4 }, out: "Tohumluklar köylere döndü, tahsildar azarlandı. İhtiyarlar duayla ayrıldı." },
      { label: "Tahsildarı ödüllendir", fx: { kut: -7, gold: 120, loy: -4 }, out: "Hazine doldu, köyler boşaldı. Yollarda sana dönük bakışlar sertleşti." },
    ],
  },
];

export function toreCase(id: string): ToreCase | undefined {
  return TORE_CASES.find((c) => c.id === id);
}
