/** Harabe keşfi: her harabe bir tür taşır; içeride oda oda ilerlenir, her odada çıkmak ya da derine inmek seçilir. */

export type RuinKind = "uygur" | "ates" | "magara" | "yazit" | "kervan" | "hun";
export type RoomKind = "tuzak" | "bilmece" | "bekci" | "sunak" | "kalinti" | "cokme" | "ruh";

export const RUIN_KINDS: Record<RuinKind, { name: string; text: string; img: string }> = {
  uygur: { name: "Ölü Uygur Şehri", text: "Kumların yuttuğu bir Uygur kenti. Duvar resimlerinde hâlâ lacivert ve altın var; sokaklarda rüzgârdan başka ses yok.", img: "map/ruins" },
  ates: { name: "Soğd Ateşgedesi", text: "Sönmüş bir ateş tapınağı. Sunak taşında yüzyıllık kurum, küllerin altında bir şey parlıyor.", img: "map/ruins" },
  magara: { name: "Mağara Manastırı", text: "Kayaya oyulmuş hücreler, tavanlarda binlerce küçük kabartma. Rahipler gideli çok olmuş; yankılar kalmış.", img: "map/ruins" },
  yazit: { name: "Yazıt Tepesi", text: "Göktürk harfleriyle kazınmış dikili taşlar. Rüzgâr çentiklerden geçerken yazıları okuyor gibi.", img: "map/kurgan" },
  kervan: { name: "Gömülü Kervansaray", text: "Bir kum fırtınasının diri diri gömdüğü kervansaray. Avlunun yarısı hâlâ kumun altında.", img: "map/serai" },
  hun: { name: "Hun Kışlağı", text: "Yıkık bir otağ çemberi, toprağa saplanmış paslı oklar. Burada bir Tanhu kışlamış, bir daha dönmemiş.", img: "map/yurts" },
};
export const RUIN_KEYS = Object.keys(RUIN_KINDS) as RuinKind[];

export function ruinKind(x: number, y: number): RuinKind {
  const h = Math.abs(Math.floor(x * 0.37 + y * 1.13)) % RUIN_KEYS.length;
  return RUIN_KEYS[h];
}

/** Türüne göre hangi odaların daha sık çıktığı. */
const ROOM_W: Record<RuinKind, Partial<Record<RoomKind, number>>> = {
  uygur: { kalinti: 3, tuzak: 2, bekci: 2, bilmece: 1, cokme: 2, sunak: 1, ruh: 1 },
  ates: { sunak: 4, tuzak: 2, bilmece: 2, bekci: 1, ruh: 2, cokme: 1, kalinti: 1 },
  magara: { bilmece: 3, ruh: 3, cokme: 2, tuzak: 1, sunak: 1, kalinti: 1, bekci: 1 },
  yazit: { bilmece: 5, ruh: 2, bekci: 1, sunak: 1, kalinti: 1, tuzak: 1, cokme: 0 },
  kervan: { kalinti: 4, cokme: 3, bekci: 2, tuzak: 1, bilmece: 1, sunak: 0, ruh: 1 },
  hun: { bekci: 4, ruh: 2, kalinti: 2, tuzak: 2, bilmece: 1, sunak: 1, cokme: 1 },
};

export function rollRooms(k: RuinKind, n: number, R: () => number = Math.random): RoomKind[] {
  const w = ROOM_W[k];
  const out: RoomKind[] = [];
  for (let i = 0; i < n; i++) {
    const keys = (Object.keys(w) as RoomKind[]).filter((r) => (w[r] ?? 0) > 0 && r !== out[i - 1]);
    let t = keys.reduce((a, r) => a + w[r]!, 0) * R();
    out.push(keys.find((r) => (t -= w[r]!) < 0) ?? keys[0]);
  }
  return out;
}

export const ROOM_INFO: Record<RoomKind, { name: string; img: string; texts: string[] }> = {
  tuzak: {
    name: "Tuzaklı Dehliz",
    img: "icons/sk_zehir",
    texts: [
      "Taban taşlarından biri ötekilerden temiz. Duvardaki deliklerde paslı ok uçları seçiliyor.",
      "Dar bir geçit; tavandan ince bir zincir sarkıyor. Zincirin ucu karanlıkta bir ağırlığa bağlı.",
      "Yerde kemikler. Hepsi aynı noktada, aynı yöne doğru düşmüş.",
    ],
  },
  bilmece: {
    name: "Konuşan Taş",
    img: "icons/scroll",
    texts: ["Kapının üstüne eski harflerle bir bilmece kazınmış. Altında üç çentikli taş düğme var."],
  },
  bekci: {
    name: "Bekçiler",
    img: "heroes/boss_golem",
    texts: [
      "Karanlıktan çıkan gölgeler meşale ışığında kılıç oluyor: harabeyi kendine yurt edinmiş mezar soyguncuları.",
      "Taş bir salonda kamp ateşi. Etrafında bıçaklarını bileyen adamlar; harabenin yeni sahipleri onlar.",
    ],
  },
  sunak: {
    name: "Unutulmuş Sunak",
    img: "icons/tr_crystal",
    texts: ["Bir sunak; üstünde göz taşları kakılı bir put, önünde eski adakların izleri. Hava burada daha soğuk."],
  },
  kalinti: {
    name: "Eski Kervan",
    img: "icons/j_caravan",
    texts: [
      "Deve iskeletleri, çürümüş denkler. Bir tüccarın kemik parmakları hâlâ bir mektup tutuyor.",
      "Duvara yaslanmış bir iskelet; kucağında kilitli bir kese ve kurumuş bir mürekkep hokkası.",
    ],
  },
  cokme: {
    name: "Çatırdayan Tavan",
    img: "icons/stone",
    texts: ["Tavan inliyor, kum ince ince akıyor. Aşağıda daha derin bir kat görünüyor; ama bu taşlar uzun dayanmayacak."],
  },
  ruh: {
    name: "Ata Ruhu",
    img: "icons/ruh",
    texts: ["Meşale birden mavi yanıyor. Karşında dumandan bir silüet: çoktan ölmüş bir bey, sana bakıyor."],
  },
};

export interface Riddle {
  q: string;
  a: string;
  wrong: [string, string];
}

export const RIDDLES: Riddle[] = [
  { q: "Suda doğar, suda büyür; suyu görünce ölür.", a: "Tuz", wrong: ["Buz", "Balık"] },
  { q: "Ağzı yok söyler, ayağı yok yol gösterir; bin yıl susar, okuyana konuşur.", a: "Yazıt", wrong: ["Rüzgâr", "Yankı"] },
  { q: "Kanatsız uçar, ağızsız uğuldar; bozkırın çobanıdır.", a: "Rüzgâr", wrong: ["Kartal", "Ok"] },
  { q: "Kirişte doğar, havada yaşar, yürekte ölür.", a: "Ok", wrong: ["Şimşek", "Kuş"] },
  { q: "Gökte bir tepsi; bir gece dolar, bir gece boşalır.", a: "Ay", wrong: ["Güneş", "Bulut"] },
  { q: "Ben yürürüm o yürür, ışık sönünce kaybolur.", a: "Gölge", wrong: ["Ruh", "Kervan"] },
  { q: "Ne ateşte yanar, ne suda batar; dilden dile geçer, bin yıl yaşar.", a: "Destan", wrong: ["Altın", "Demir"] },
  { q: "Toprakta uyur, ateşte uyanır; kılıç olur, saban olur.", a: "Demir", wrong: ["Taş", "Ağaç"] },
  { q: "Bir yurdun kırk direği, hepsinin tepesi bir.", a: "Çadır", wrong: ["Orman", "Kale"] },
  { q: "Ayağı yok koşar, eli yok tutar; bir yerde durursa ölür.", a: "Su", wrong: ["Yol", "At"] },
];

export const RUIN_LETTERS: string[] = [
  "\"Kardeşim, Kaşgar'a varamazsam ipeği Yusuf'a ver, borcumu kapatsın. Kum dinmiyor.\"",
  "\"Develer suya üç gün uzak. Kervanbaşı yolu kaybettiğini kabul etmiyor. Tanrı bizi bağışlasın.\"",
  "\"Bu satırları okuyan: kuyunun suyu zehirli. Biz öğrendiğimizde geçti.\"",
  "\"Oğlum, yeşimi doğuya değil kuzeye sat; Çinli tüccar seni kandırır. Annene selam.\"",
  "\"Haramiler gece geldi. Hazineyi duvarın içine ördüm. Benden başka bilen yok artık.\"",
  "\"Uygur hanının mührü bende. Kim bulursa şehre geri götürsün; ödülü büyüktür.\"",
];

export const RUIN_SPIRIT_LINES: string[] = [
  "\"Benim de bir kervanım, bir tuğum vardı. Kum hepsini aldı. Sen adını taşa değil, insanlara yaz.\"",
  "\"Bu yolu bin kere yürüdüm. Kuzeye bak: orada senin bilmediğin yollar var.\"",
  "\"Altın için geldin, biliyorum. Ben de öyle gelmiştim. Al, ama kibirle değil.\"",
];
