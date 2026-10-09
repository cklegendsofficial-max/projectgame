import type { CompId, CompMods } from "./story";
import type { Skill, Stat } from "./rpg";

export type OriginId = "oba" | "tuccar" | "avci" | "beyzade" | "kam";

export interface Origin {
  id: OriginId;
  name: string;
  icon: string;
  desc: string;
  perk: string;
  en: [name: string, desc: string, perk: string];
  mods: Partial<CompMods>;
  gold?: number;
  renown?: number;
  kut?: number;
  stats?: Partial<Record<Stat, number>>;
  skills?: Partial<Record<Skill, number>>;
  bond?: Partial<Record<CompId, number>>;
  intro: string;
  introEn: string;
}

export const ORIGINS: Origin[] = [
  {
    id: "oba", name: "Oba çocuğu", icon: "icons/village",
    desc: "Sıradan bir Oğuz obasında, keçe çadırlar arasında büyüdün. Annen şifacıydı, kız kardeşin Ayşe gölgendi.",
    perk: "+1 Dayanıklılık · Ayşe ile bağ +20 · savaşta +%2 can yenileme",
    en: ["Child of the camp", "You grew up among felt tents in an ordinary Oghuz camp. Your mother was a healer; your sister Ayşe was your shadow.", "+1 Endurance · bond with Ayşe +20 · +2% healing in battle"],
    mods: { heal: 0.02 }, stats: { day: 1 }, bond: { ayse: 20 },
    intro: "Obanın dumanı hâlâ burnunda. Kara Tamga atlıları geldiğinde Ayşe'nin elini tutuyordun; sonra her şey karardı.",
    introEn: "The smoke of the camp still lingers in your nose. You were holding Ayşe's hand when the Black Tamga riders came; then everything went dark.",
  },
  {
    id: "tuccar", name: "Tüccar çırağı", icon: "icons/coins",
    desc: "Buhara'lı bir kervanbaşının yanında hesap tuttun. Efendin borca batınca seni de mal diye sattılar.",
    perk: "+4 Ticaret · +1 Karizma · pazarda %2 iyi fiyat · 25 akçe saklı birikim",
    en: ["Merchant's apprentice", "You kept the ledgers of a Bukharan caravan master. When he drowned in debt, they sold you along with the goods.", "+4 Trade · +1 Charisma · 2% better market prices · 25 coins hidden savings"],
    mods: { trade: 0.02 }, stats: { kar: 1 }, skills: { ticaret: 4 }, gold: 25, bond: { leyla: 15, lucia: 15 },
    intro: "Ayakkabının tabanına diktiğin 25 akçe hâlâ yerinde. Kervanbaşının borcu seni zincire vurdu ama hesap kitap bilen köle uzun süre köle kalmaz.",
    introEn: "The 25 coins sewn into your boot sole are still there. Your master's debt put you in chains, but a slave who can keep accounts does not stay a slave for long.",
  },
  {
    id: "avci", name: "Kıpçak avcısı", icon: "icons/r_bow",
    desc: "Deşt-i Kıpçak'ın uçsuz bozkırında kurtla, kartalla büyüdün. Bir kış avında tuzağa düşürüldün.",
    perk: "+1 Çeviklik · +2 görüş · %5 yürüyüş hızı · Ferhat ile bağ +20",
    en: ["Kipchak hunter", "You grew up with wolves and eagles on the endless Kipchak steppe. You were trapped during a winter hunt.", "+1 Agility · +2 sight · 5% walking speed · bond with Ferhat +20"],
    mods: { sight: 2, speed: 0.05 }, stats: { cev: 1 }, bond: { ferhat: 20 },
    intro: "Zincir bileklerini kesiyor ama gözlerin hâlâ bozkırın ufkunu tarıyor. Bir avcı izini kaybetmez; özgürlüğün izini de bulacaksın.",
    introEn: "The chain cuts your wrists, but your eyes still scan the steppe horizon. A hunter never loses a trail; you will find the trail to freedom too.",
  },
  {
    id: "beyzade", name: "Düşmüş beyzade", icon: "icons/lord_bey",
    desc: "Babanın tuğu bir zamanlar yüz çadırın üstünde dalgalanırdı. İhanetle düştü; sen de pazarda satıldın.",
    perk: "+1 Liderlik · +25 şöhret · +10 kut · askerlerin %3 güçlü · Batu ile bağ +15",
    en: ["Fallen noble's son", "Your father's banner once flew over a hundred tents. He fell to treachery, and you were sold at market.", "+1 Leadership · +25 renown · +10 kut · troops 3% stronger · bond with Batu +15"],
    mods: { army: 0.03 }, stats: { lid: 1 }, renown: 25, kut: 10, bond: { batu: 15 },
    intro: "Babanın adını fısıldayan köleler hâlâ önünde baş eğiyor. Tuğun düştü ama kanındaki kut sönmedi; onu yeniden kaldıracaksın.",
    introEn: "Slaves who whisper your father's name still bow before you. His banner fell, but the kut in your blood did not go out; you will raise it again.",
  },
  {
    id: "kam", name: "Kam çırağı", icon: "icons/ruh",
    desc: "Yaşlı bir kamın yanında davul çaldın, ruhların dilini dinledin. Kamın ölümünden sonra köle tüccarları seni aldı.",
    perk: "+1 Karizma · %8 fazla tecrübe · +5 kut · Korkut ile bağ +20",
    en: ["Shaman's apprentice", "You beat the drum beside an old shaman and listened to the tongue of spirits. After he died, slavers took you.", "+1 Charisma · 8% more XP · +5 kut · bond with Korkut +20"],
    mods: { xp: 0.08 }, stats: { kar: 1 }, kut: 5, bond: { korkut: 20 },
    intro: "Rüyalarında hâlâ ustanın davulunu duyuyorsun. Ruhlar sana bir şey söylüyor: zincirin geçici, yolun uzun.",
    introEn: "In your dreams you still hear your master's drum. The spirits are telling you something: the chain is temporary, the road is long.",
  },
];

export const ORIGIN_BY_ID = Object.fromEntries(ORIGINS.map((o) => [o.id, o])) as Record<OriginId, Origin>;
