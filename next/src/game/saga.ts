/** Esirler, salgın, rüyalar, büyük toy ve tüccar loncası için veri. */

export const CAPTIVE_MAX = 6;

export const BANDIT_CHIEFS = ["Kara Toğan", "Sarı Buğra", "Tilki Esen", "Topal Kutlu", "Çolak Sançar", "Kızıl Arslan", "Kör Tekin", "Deli Bayındır"];
export const NOBLE_NAMES = ["Emir Hüsameddin", "Sipahsalar Tekiş", "Komutan Nikeforos", "Hacib Altuntaş", "Subaşı Yınal", "Kumandan Bardas", "Atabey Ilgazi"];

export interface GuildRank {
  name: string;
  need: number;
  cut: number;
  text: string;
}

/** Ticaret kârına göre lonca rütbeleri; cut: alış/satış farkındaki iyileşme. */
export const GUILD: GuildRank[] = [
  { name: "Çırak", need: 0, cut: 0, text: "Loncanın kapısındasın; ustalar seni henüz tanımıyor." },
  { name: "Kalfa", need: 1500, cut: 0.01, text: "Lonca sana sipariş vermeye başladı. Alışta ve satışta %1 avantaj." },
  { name: "Usta", need: 6000, cut: 0.02, text: "Adın lonca defterine ustalar arasında yazıldı. Alışta ve satışta %2 avantaj." },
  { name: "Ağa", need: 20000, cut: 0.035, text: "Çarşı esnafı sana selam veriyor; sözün senet sayılıyor. Alışta ve satışta %3,5 avantaj." },
  { name: "Melikü't-Tüccar", need: 50000, cut: 0.05, text: "Tüccarların Meliki! İpek Yolu'nun bütün loncaları senin mührünü tanıyor. Alışta ve satışta %5 avantaj." },
];

export function guildRank(profit: number): number {
  let r = 0;
  for (let i = 0; i < GUILD.length; i++) if (profit >= GUILD[i].need) r = i;
  return r;
}

export const DREAMS: Record<"war" | "plague" | "drought" | "hoard" | "wolves", { text: string[]; plain: string }> = {
  war: {
    text: [
      "İki kartal aynı leşin üstüne kondu. Kanatları birbirine çarptıkça gökten kızıl tüyler yağdı.",
      "İki ırmak bir ovada buluştu; suları karışmadı, birbirini boğmaya çalıştı.",
    ],
    plain: "Kam davulunu yere bıraktı: \"Kartallar iki devlettir: {a} ile {b}. İki gün içinde kılıçlar çekilecek.\"",
  },
  plague: {
    text: [
      "Bir şehrin kuyusundan sarı bir duman yükseldi; duman kapılardan sokaklara, sokaklardan evlere süzüldü.",
      "Çarşıda herkes yüzünü örtmüştü. Bir çocuk öksürdü, ardından bütün şehir öksürdü.",
    ],
    plain: "Kam ateşe bir avuç ardıç attı: \"Sarı duman {c} üzerine çökecek. Şifacılar hazırlansın; kervanlar uzak dursun.\"",
  },
  drought: {
    text: [
      "Gökte yedi güneş doğdu. Irmak yatağı çatladı, balıklar kumda çırpındı.",
      "Bir pınarın başında durdun; avucunu uzattın, su yerine kum aktı.",
    ],
    plain: "Kam başını salladı: \"Gök kuruyacak. Ovalardan birinde kuyular dibe vuracak; obalar göçe hazırlansın.\"",
  },
  hoard: {
    text: [
      "Toprağın altında bir sandık nefes alıyordu. Kapağında senin tamganı gördün.",
      "Ölü bir tüccar elini uzattı, avucuna yırtık bir kâğıt bıraktı.",
    ],
    plain: "Kam gülümsedi: \"Ataların sana bir yol gösteriyor. Uyandığında heybende bir harita parçası bulacaksın.\"",
  },
  wolves: {
    text: [
      "Ay kızıl doğdu. Bozkırın dört yanından uluma yükseldi; gözler karanlıkta çoğaldı.",
      "Bir sürünün ortasında uyandın; koyunların hepsi kurt postu giymişti.",
    ],
    plain: "Kam davula üç kez vurdu: \"Kurtlar çoğalacak. Gece yolculuğunda yanında asker olsun.\"",
  },
};

export const TOY_DAY = 5;
export const TOY_LEN = 3;
export const TOY_CHAMPS = ["Pehlivan Kara Musa", "Okçu Ayaz", "Atlı Börte"];
