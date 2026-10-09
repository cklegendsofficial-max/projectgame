import type { Army } from "./data";
import type { Boss } from "./battle";
import type { RoadFx } from "./road";

export type BoyAct = "talk" | "pay" | "fight" | "choice";

export interface BoyChoice {
  label: string;
  text: string;
  fx: RoadFx;
  /** boyu burada bitirir */
  end?: boolean;
}

export interface BoyStep {
  near: string;
  place: string;
  img: string;
  text: string;
  act: BoyAct;
  btn: string;
  done: string;
  cost?: { gold?: number; food?: number };
  army?: (lv: number) => Army;
  boss?: Boss;
  bonus?: number;
  choices?: BoyChoice[];
}

export interface Boy {
  id: string;
  name: string;
  icon: string;
  lv: number;
  intro: string;
  reward: RoadFx & { legend?: boolean };
  steps: BoyStep[];
}

export interface BoyState {
  id: string;
  step: number;
  at: { x: number; y: number } | null;
}

const a = (n: number, s: number, ar: number, h: number): Army => ({ spear: Math.round(n * s), archer: Math.round(n * ar), horse: Math.round(n * h) });

export const TEPEGOZ: Boss = { name: "Tepegöz", icon: "heroes/boss_golem", hp: 2600, atk: 46, def: 22 };
export const DUMRUL: Boss = { name: "Deli Dumrul", icon: "heroes/boss_hakan", hp: 900, atk: 24, def: 12 };
export const SOKLU: Boss = { name: "Şöklü Melik", icon: "heroes/boss_karahan", hp: 3400, atk: 54, def: 26 };

export const BOYS: Boy[] = [
  {
    id: "dumrul",
    name: "Deli Dumrul Boyu",
    icon: "heroes/boss_hakan",
    lv: 5,
    intro: "Dede Korkut kopuzunu akortladı: \"Duha Koca oğlu Deli Dumrul, kuru bir çayın üstüne köprü kurmuş. Geçenden otuz üç akçe, geçmeyenden döve döve kırk akçe alırmış. Bir gün Azrail'e meydan okumuş...\"",
    reward: { gold: 300, renown: 25, kut: 4 },
    steps: [
      {
        near: "bukhara",
        place: "Kuru Çay Köprüsü",
        img: "map/tower",
        text: "Kupkuru bir çayın üstünde gereksiz bir köprü. Başında dev gibi bir yiğit, elinde gürz: \"Geçenden otuz üç, geçmeyenden kırk akçe!\"",
        act: "choice",
        btn: "Deli Dumrul'la konuş",
        done: "",
        choices: [
          { label: "Otuz üç akçeyi öde", text: "Dumrul kahkahayla güldü: \"Akıllı adamsın!\" Sonra gözleri karardı: \"Dün bir yiğit öldü, Azrail canını aldı dediler. Kimdir bu Azrail? Bulup canını alacağım!\"", fx: { gold: -33 } },
          { label: "\"Kuru çaya köprü olmaz\" de", text: "Dumrul'un yüzü kızardı, sonra güldü: \"Doğru söyledin, ama sözüm sözdür.\" Gözleri bozkıra daldı: \"Azrail denen o kuşu bulacağım!\"", fx: { kut: 1 } },
        ],
      },
      {
        near: "bukhara",
        place: "Dumrul'un Otağı",
        img: "map/yurts",
        text: "Dumrul döşeğinde yatıyor; Azrail göğsüne çökmüş. Karısı başucunda ağlıyor: \"Benim canım onun canına kurban olsun!\"",
        act: "choice",
        btn: "Otağa gir",
        done: "",
        choices: [
          { label: "Tanrı'ya yalvar, Dumrul'la birlikte dua et", text: "Dumrul kibrini bıraktı, ellerini göğe açtı. Gökten bir ses geldi: \"Karı koca yüz kırk yıl yaşasın!\" Dumrul sana sarıldı ve atlılarıyla sancağına katıldı.", fx: { units: { horse: 6 }, kut: 6 }, end: true },
          { label: "Dumrul'u Azrail'e karşı kışkırt", text: "Dumrul döşeğinden fırladı, kılıcını kaptı... ve kibirle sana döndü: \"Önce seni deneyeyim!\"", fx: {} },
        ],
      },
      {
        near: "bukhara",
        place: "Kuru Çay Köprüsü",
        img: "map/tower",
        text: "Deli Dumrul köprünün başında gürzünü sallıyor. \"Gel bakalım yiğit, Azrail'den önce sen!\"",
        act: "fight",
        btn: "Dumrul ile dövüş",
        done: "Dumrul yere serildi, gürzü kırıldı. Ayağa kalkınca güldü: \"Azrail'den önce sana yenildim. Ders aldım.\" Köprüyü yıktı, geçiş parasını yoksullara dağıttı.",
        army: (lv) => a(10 + lv, 0.5, 0.2, 0.3),
        boss: DUMRUL,
        bonus: 0.05,
      },
    ],
  },
  {
    id: "tepegoz",
    name: "Basat'ın Tepegöz'ü Öldürdüğü Boy",
    icon: "heroes/boss_golem",
    lv: 9,
    intro: "Dede Korkut sesini alçalttı: \"Oğuz'un başına bir bela geldi: tek gözlü, oku işlemez, kılıç kesmez Tepegöz. Her gün iki adam, beş yüz koyun ister. Basat'ın kardeşini de yedi...\"",
    reward: { renown: 60, kut: 8, legend: true },
    steps: [
      {
        near: "merv",
        place: "Oğuz Çoban Obası",
        img: "map/yurts",
        text: "Korkudan titreyen çobanlar. Ambarlar boş; her gün Tepegöz'e haraç gidiyor. \"Ey yiğit, açlıktan öleceğiz. Önce karnımızı doyur, sonra yolunu gösterelim.\"",
        act: "pay",
        btn: "Erzak dağıt",
        cost: { food: 150 },
        done: "Çobanlar doydu. Yaşlı bir kadın fısıldadı: \"Tepegöz'ün gücü gözünde. Basat şişi ateşte kızdırıp gözüne sapladı... Mağarası güneydeki kayalıklarda.\"",
      },
      {
        near: "merv",
        place: "Tepegöz'ün Mağarası",
        img: "map/ruins",
        text: "Kemik yığınları, dev bir ocak ve içeriden gelen gök gürültüsü gibi horultu. Tepegöz'ün kulları mağaranın ağzında nöbette.",
        act: "fight",
        btn: "Mağaraya gir",
        done: "Kızgın şiş Tepegöz'ün tek gözüne saplandı. Dev böğürerek mağarayı yıktı; Basat'ın öcü alındı. Oğuz obaları yeniden nefes aldı.",
        army: (lv) => a(26 + lv * 2, 0.5, 0.3, 0.2),
        boss: TEPEGOZ,
        bonus: 0.12,
      },
    ],
  },
  {
    id: "beyrek",
    name: "Bamsı Beyrek Boyu",
    icon: "u_archer",
    lv: 12,
    intro: "Dede Korkut kopuzunu göğsüne bastırdı: \"Bamsı Beyrek düğün gecesi Bayburt Hisarı'na tutsak düştü. On altı yıl zindanda kaldı. Nişanlısı Banı Çiçek onu hâlâ bekliyor...\"",
    reward: { gold: 500, renown: 45, kut: 6, units: { horse: 8 } },
    steps: [
      {
        near: "tabriz",
        place: "Bayburt Hisarı",
        img: "map/castle",
        text: "Kayalara gömülü bir hisar. Zindanında on altı yıldır bir Oğuz yiğidi çürüyor. Burçlarda Bayburt beyinin kâfir askerleri.",
        act: "fight",
        btn: "Hisara saldır",
        done: "Zindan kapısı kırıldı. Saçı sakalı ağarmış bir adam ışığa çıktı: \"Ben Bamsı Beyrek'im. Banı Çiçek'im beni bekliyor mu?\"",
        army: (lv) => a(30 + lv * 2, 0.45, 0.35, 0.2),
        bonus: 0.15,
      },
      {
        near: "rey",
        place: "Banı Çiçek'in Düğünü",
        img: "map/yurts",
        text: "Obada davullar çalıyor: Banı Çiçek zorla Yalancıoğlu'na veriliyor. Beyrek ozan kılığına girdi, kopuzunu kaptı. \"Bir yay ister,\" diyor, \"bir de dost eli.\"",
        act: "choice",
        btn: "Düğüne gir",
        done: "",
        choices: [
          { label: "Beyrek'e kendi yayını ver", text: "Beyrek yayı gerdi; kimsenin kuramadığı yay onun elinde inledi. Ok yüzüğü vurdu, Banı Çiçek onu tanıdı. Yalancıoğlu kaçtı, düğün asıl sahibine kaldı.", fx: { renown: 10, kut: 3 } },
          { label: "Yalancıoğlu'nu meydanda yüzleştir", text: "Herkesin önünde Yalancıoğlu'nun yalanını açığa çıkardın. Beyrek kılıcını çekmeden kazandı; Oğuz beyleri töreye saygını konuştu.", fx: { kut: 6 } },
        ],
      },
    ],
  },
  {
    id: "kazan",
    name: "Salur Kazan'ın Evinin Yağmalandığı Boy",
    icon: "lord_bey",
    lv: 16,
    intro: "Dede Korkut'un sesi titredi: \"Kazan Han ava çıkınca Şöklü Melik otağını basmış; anasını, karısını, oğlu Uruz'u tutsak etmiş. Kazan bir başına kalmış...\"",
    reward: { gold: 900, renown: 80, kut: 10, legend: true },
    steps: [
      {
        near: "kashgar",
        place: "Yağmalanmış Otağ",
        img: "map/camp",
        text: "Yanmış çadırlar, dağılmış sürüler. Salur Kazan bir çobanla tek başına oturuyor: \"Yiğit, dost musun düşman mı? Ailem Şöklü Melik'in elinde.\"",
        act: "talk",
        btn: "Kazan'a elini uzat",
        done: "Kazan kılıcını kuşandı: \"Öyleyse beraber yürüyelim. Melik'in kalesi doğudaki kayalıklarda.\"",
      },
      {
        near: "kashgar",
        place: "Şöklü Melik'in Kalesi",
        img: "map/castle",
        text: "Kalenin avlusunda Oğuz tutsakları zincirli. Şöklü Melik burçtan alay ediyor: \"Kazan'ın oğlunu çengele asacağım!\"",
        act: "fight",
        btn: "Kaleye saldır",
        done: "Şöklü Melik'in kellesi burçtan aşağı yuvarlandı. Uruz, Kazan'ın anası ve Burla Hatun zincirlerinden kurtuldu.",
        army: (lv) => a(40 + lv * 2.5, 0.4, 0.35, 0.25),
        boss: SOKLU,
        bonus: 0.15,
      },
      {
        near: "kashgar",
        place: "Kazan'ın Otağı",
        img: "map/yurts",
        text: "Otağ yeniden dikildi, kazanlar kaynıyor. Kazan Han ganimetin yarısını sana uzatıyor.",
        act: "choice",
        btn: "Toya katıl",
        done: "",
        choices: [
          { label: "Ganimeti Oğuz beylerine dağıt", text: "\"Ganimet beylerin hakkıdır\" dedin. Kazan Han ayağa kalktı: \"Bu yiğit töreyi benden iyi bilir!\" Bütün Oğuz senin adını andı.", fx: { kut: 8, renown: 20 } },
          { label: "Payını al", text: "Kazan Han yarısını sandıklarla gönderdi. Hazinen doldu.", fx: { gold: 800 } },
        ],
      },
    ],
  },
];

export function boyOf(id: string): Boy | undefined {
  return BOYS.find((b) => b.id === id);
}
