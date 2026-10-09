import type { Game } from "./game";
import { CITIES } from "../world/gen";
import { lang } from "../i18n";

export type CodexCat = "kultur" | "inanc" | "yer" | "yol";

export const CODEX_CATS: Record<CodexCat, { name: string; en: string; icon: string }> = {
  kultur: { name: "Töre ve Kültür", en: "Custom and Culture", icon: "tug" },
  inanc: { name: "Gök ve Yer", en: "Sky and Earth", icon: "ruh" },
  yer: { name: "Şehirler", en: "Cities", icon: "map/serai" },
  yol: { name: "Yolun Bilgisi", en: "Lore of the Road", icon: "j_caravan" },
};

export interface CodexEntry {
  id: string;
  cat: CodexCat;
  icon: string;
  title: string;
  text: string;
  en: [string, string];
  hint: string;
  open: (g: Game) => boolean;
}

const seen = (id: string) => (g: Game): boolean => {
  const c = CITIES.find((x) => x.id === id);
  return !!c && g.isExplored(c.x, c.y);
};

export const CODEX: CodexEntry[] = [
  { id: "kut", cat: "kultur", icon: "crown", title: "Kut", hint: "Bir beylik kur.",
    text: "Eski Türklere göre hükmetme yetkisi Gök Tengri'nin bağışladığı kuttan gelir. Kutu olan bey adil olduğu sürece hükmeder; zulmeden, yenilen ya da töreyi çiğneyen beyin kutu söner ve halk ondan yüz çevirir.",
    en: ["Kut", "To the old Turks the right to rule came from kut, a blessing granted by Sky Tengri. A bey with kut rules as long as he is just; one who oppresses, is defeated or breaks töre sees his kut fade, and the people turn away."],
    open: (g) => g.s.beylik },
  { id: "tore", cat: "kultur", icon: "scroll", title: "Töre", hint: "İlk töre davasında hüküm ver.",
    text: "Töre, yazısız bozkır yasasıdır. Hakan bile töreye bağlıdır. Kan davası, otlak kavgası, misafir hakkı ve vergi töreyle çözülür; töreyi çiğneyen hükümdar kutunu yitirir.",
    en: ["Töre", "Töre is the unwritten law of the steppe. Even the khagan is bound by it. Blood feuds, pasture quarrels, guest-right and taxes are settled by töre; a ruler who breaks it loses his kut."],
    open: (g) => (g.s.c.tore ?? 0) >= 1 },
  { id: "tamga", cat: "kultur", icon: "seal", title: "Tamga", hint: "Ozan defterinde tamganı düzenle.",
    text: "Her boyun bir tamgası vardır: atlara vurulur, sancaklara işlenir, kayalara kazınır. Tamga bir imza, bir mülkiyet işareti ve bir onurdur. Düşman tamgasını çiğnemek savaş sebebidir.",
    en: ["Tamga", "Every clan has its tamga: branded on horses, stitched on banners, carved into rock. A tamga is a signature, a mark of ownership and a matter of honor. Trampling an enemy's tamga is cause for war."],
    open: (g) => !!g.s.tamga },
  { id: "ozan", cat: "kultur", icon: "scroll", title: "Ozan ve Kopuz", hint: "Hakkında bir türkü yakılsın.",
    text: "Ozanlar kopuzlarıyla obadan obaya gezer, beylerin yiğitliğini ve korkaklığını destana döker. Bir beyin şöhreti ozanların dilinde yaşar; ozan unutursa bey de unutulur.",
    en: ["Ozan and Kopuz", "Bards travel from camp to camp with their kopuz, turning the courage and cowardice of beys into sagas. A bey's fame lives on the bard's tongue; if the bard forgets, so does the world."],
    open: (g) => (g.s.songs?.length ?? 0) >= 1 },
  { id: "otag", cat: "kultur", icon: "map/yurts", title: "Otağ, Yaylak ve Kışlak", hint: "Bir otağ kur.",
    text: "Göçebe bey sarayını sırtında taşır: otağ, keçe çadırların en büyüğüdür. Sürüler yazın kuzeyin serin yaylaklarına, kışın güneyin korunaklı kışlaklarına göçer. Göç yolunu bilmeyen, sürüsünü kışa kurban verir.",
    en: ["Otağ, Summer and Winter Pastures", "A nomad bey carries his palace on his back: the otağ, greatest of felt tents. Herds move north to cool summer pastures and south to sheltered winter grounds. Whoever does not know the migration road loses his herd to winter."],
    open: (g) => !!g.s.otag },
  { id: "kurultay", cat: "kultur", icon: "lord_bey", title: "Kurultay", hint: "Kurultaya katıl.",
    text: "Beyler büyük meselelerde kurultayda toplanır: savaş, barış ve hakan seçimi burada konuşulur. Hakan doğuştan değil, beylerin oyu ve Gök'ün kutuyla belirlenir.",
    en: ["Kurultai", "The beys gather at the kurultai for great matters: war, peace and the election of the khagan. A khagan is not born but chosen, by the votes of the beys and the kut of the Sky."],
    open: (g) => g.s.kagan || (g.s.kurultay?.held ?? 0) >= 1 },
  { id: "turan", cat: "kultur", icon: "u_cavalry", title: "Turan Taktiği", hint: "Savaşta sahte ricat uygula.",
    text: "Bozkır atlılarının en ünlü hilesi: kaçıyormuş gibi geri çekil, düşman safı bozup peşine düşünce dön ve kuşat. Mete Han'dan Malazgirt'e kadar nice ordu bu yemi yuttu.",
    en: ["The Turan Tactic", "The most famous trick of the steppe riders: pretend to flee, and when the enemy breaks ranks to give chase, turn and encircle them. From Mete Khan to Manzikert, many armies took this bait."],
    open: (g) => (g.s.c.turan ?? 0) >= 1 },
  { id: "kabak", cat: "kultur", icon: "u_archer", title: "Kabak Atma", hint: "Bir bozkır oyunu oyna.",
    text: "Bir direğin tepesine asılan kabağı dörtnala giden at üstünden vurmak, Türk atlı okçularının en eski sınavıdır. Çocuklar ata binmeyi yürümeden önce, ok atmayı konuşmadan önce öğrenirdi.",
    en: ["Kabak Shooting", "Shooting a gourd hung atop a pole from a galloping horse is the oldest test of Turkic horse archers. Children learned to ride before they walked and to shoot before they spoke."],
    open: (g) => (g.s.ok?.best ?? 0) > 0 },
  { id: "hanedan", cat: "kultur", icon: "lord_emir", title: "Kız Alıp Vermek", hint: "Bir beyle dünür ol.",
    text: "Bozkırda ittifak kanla mühürlenir: beyler kızlarını birbirine verir, dünür olan iki boy birbirine kılıç çekmez. Varis yoksa veraset kavgası en güçlü ordunun bile sonunu getirir.",
    en: ["Marriage Ties", "On the steppe, alliances are sealed in blood: beys give their daughters to one another, and two clans joined by marriage do not draw swords on each other. Without an heir, a succession war can end even the strongest army."],
    open: (g) => !!g.s.family?.spouse },

  { id: "tengri", cat: "inanc", icon: "tr_star", title: "Gök Tengri", hint: "Hürriyetini kazan.",
    text: "Mavi gök, her şeyin üstündeki Tengri'dir. Hakanlara kut verir, ant içenleri gözetir, yeminini bozanı çarpar. Türkler dağ başlarında, kutlu ağaçların altında Tengri'ye kımız saçardı.",
    en: ["Sky Tengri", "The blue sky above all things is Tengri. He grants kut to khagans, watches those who swear oaths and strikes down oath-breakers. The Turks poured kumis to Tengri on mountaintops and beneath sacred trees."],
    open: (g) => g.s.free },
  { id: "umay", cat: "inanc", icon: "healer", title: "Umay Ana", hint: "Anlatıcı ayarlarına bak.",
    text: "Umay, çocukların ve annelerin koruyucusu, bereketin anasıdır. Yeni doğanın beşiğini gözetir, yaralının başında bekler. Merhametli ama unutkan değildir.",
    en: ["Mother Umay", "Umay is the protector of children and mothers, the mother of plenty. She watches over the newborn's cradle and waits by the wounded. Merciful, but not forgetful."],
    open: (g) => g.s.free },
  { id: "erlik", cat: "inanc", icon: "boss_erlik", title: "Erlik Han", hint: "Erlik'in kapısına ulaş.",
    text: "Yeraltı dünyasının hükümdarı Erlik, ölülerin ruhlarını toplar. Kamlar onun kapısına kadar inip ruh pazarlığı yapabilir; ama geri dönemeyen kam da çoktur.",
    en: ["Erlik Khan", "Erlik, lord of the underworld, gathers the souls of the dead. Shamans may descend to his gate to bargain for souls; but many shamans never return."],
    open: (g) => g.s.story.done },
  { id: "kam", cat: "inanc", icon: "cls_kam", title: "Kam", hint: "Kam yolunu seç ya da bir kamla karşılaş.",
    text: "Kam, gök ile yer arasında aracıdır. Davulunu çalarak kendinden geçer, ruhlar âlemine yolculuk eder, hastayı iyileştirir, kayıp ruhu geri çağırır.",
    en: ["The Kam", "The kam is an intermediary between sky and earth. Drumming into trance, he journeys to the spirit world, heals the sick and calls back lost souls."],
    open: (g) => g.s.cls === "kam" || (g.s.c.tore ?? 0) >= 2 },
  { id: "kurgan", cat: "inanc", icon: "map/kurgan", title: "Kurgan ve Balbal", hint: "Bir Kurgan Taşı devir.",
    text: "Bozkır beyleri tepe biçimli kurganlara gömülür, mezarın başına yendikleri düşman sayısınca balbal taşı dikilir. Kurgan bekçileri ölülerin huzurunu bozanı affetmez.",
    en: ["Kurgan and Balbal", "Steppe lords are buried in mound-shaped kurgans, and beside the grave stand balbal stones, one for each enemy slain. Kurgan wardens do not forgive those who disturb the dead."],
    open: (g) => g.s.c.kurgans >= 1 },
  { id: "tulpar", cat: "inanc", icon: "mount_3", title: "Tulpar", hint: "Efsanevi bir at bul.",
    text: "Tulpar, kanatlı ya da rüzgâr kadar hızlı efsanevi attır. Ancak kutlu bir yiğit ona binebilir; Tulpar sahibini kendisi seçer.",
    en: ["Tulpar", "The tulpar is a legendary horse, winged or swift as the wind. Only a hero with kut may ride it; the tulpar chooses its own master."],
    open: (g) => g.s.hero.bag.some((i) => i.horse?.breed === "tulpar") || g.s.hero.equip.at?.horse?.breed === "tulpar" },
  { id: "korkut", cat: "inanc", icon: "scroll", title: "Dede Korkut", hint: "Bir hanende Dede Korkut'u dinle.",
    text: "Oğuzların bilge ozanı Dede Korkut, boy boylar soy soylar. Anlattığı on iki destan Tepegöz'den Deli Dumrul'a, Bamsı Beyrek'ten Salur Kazan'a bozkırın hafızasıdır.",
    en: ["Dede Korkut", "Dede Korkut, the wise bard of the Oghuz, recites clan and lineage. His twelve tales, from Tepegöz to Deli Dumrul, from Bamsı Beyrek to Salur Kazan, are the memory of the steppe."],
    open: (g) => !!g.s.boy || (g.s.boysDone?.length ?? 0) >= 1 },

  { id: "samarkand", cat: "yer", icon: "cities/samarkand", title: "Semerkant", hint: "Semerkant'ı gör.",
    text: "Mavi kubbeli Semerkant, İpek Yolu'nun kalbidir. Çin ipeği, Hint baharatı ve Fars halısı burada el değiştirir. Köle pazarı da şehrin en kalabalık yeridir.",
    en: ["Samarkand", "Blue-domed Samarkand is the heart of the Silk Road. Chinese silk, Indian spice and Persian carpets change hands here. The slave market is the busiest place in town."],
    open: seen("samarkand") },
  { id: "bukhara", cat: "yer", icon: "cities/bukhara", title: "Buhara", hint: "Buhara'yı gör.",
    text: "Medreseleri ve kütüphaneleriyle Buhara, ilim yolcularının uğrağıdır. Pamuk tarlaları şehri altın gibi besler.",
    en: ["Bukhara", "With its madrasas and libraries, Bukhara is a haven for seekers of knowledge. Its cotton fields feed the city like gold."],
    open: seen("bukhara") },
  { id: "kashgar", cat: "yer", icon: "cities/kashgar", title: "Kaşgar", hint: "Kaşgar'ı gör.",
    text: "Doğunun kapısı Kaşgar'da Çin'den gelen kervanlar ilk kez Türk topraklarına ayak basar. İpek, porselen ve yeşim buradan batıya akar.",
    en: ["Kashgar", "At Kashgar, gate of the east, caravans from China first set foot on Turkic land. Silk, porcelain and jade flow west from here."],
    open: seen("kashgar") },
  { id: "merv", cat: "yer", icon: "cities/merv", title: "Merv", hint: "Merv'i gör.",
    text: "Horasan'ın incisi Merv, Selçuklu sultanlarının gözdesidir. Çölün ortasında bir vahadır; su kanalları kuruyunca şehir de ölür.",
    en: ["Merv", "Merv, pearl of Khorasan, is the favorite of Seljuk sultans. An oasis in the desert; when its canals dry, the city dies."],
    open: seen("merv") },
  { id: "nishapur", cat: "yer", icon: "cities/nishapur", title: "Nişabur", hint: "Nişabur'u gör.",
    text: "Turkuaz madenleriyle ünlü Nişabur, şairlerin ve gökbilimcilerin şehridir. Ömer Hayyam'ın yıldızlara baktığı kuleler buradadır.",
    en: ["Nishapur", "Famed for its turquoise mines, Nishapur is a city of poets and astronomers. Here stand the towers where Omar Khayyam watched the stars."],
    open: seen("nishapur") },
  { id: "rey", cat: "yer", icon: "cities/rey", title: "Rey", hint: "Rey'i gör.",
    text: "Dağların eteğindeki Rey, Selçukluların ilk başkentlerinden biridir. Demirci çarşısının çekiç sesleri gece de dinmez.",
    en: ["Rey", "Rey, at the foot of the mountains, was one of the first Seljuk capitals. The hammers of its smiths' bazaar never fall silent, even at night."],
    open: seen("rey") },
  { id: "tabriz", cat: "yer", icon: "cities/tabriz", title: "Tebriz", hint: "Tebriz'i gör.",
    text: "Halı tezgâhlarının şehri Tebriz, Anadolu ile İran arasında köprüdür. Kapalı çarşısında yolunu kaybeden tüccar az değildir.",
    en: ["Tabriz", "Tabriz, city of carpet looms, is a bridge between Anatolia and Persia. Many a merchant has lost his way in its covered bazaar."],
    open: seen("tabriz") },
  { id: "konya", cat: "yer", icon: "cities/konya", title: "Konya", hint: "Konya'yı gör.",
    text: "Anadolu Selçuklularının başkenti Konya, kervansaraylarla örülü yolların düğüm noktasıdır. Bozkırdan gelen boylar burada yeni bir yurt kurdu.",
    en: ["Konya", "Konya, capital of the Anatolian Seljuks, is the knot where caravanserai-lined roads meet. Clans from the steppe built a new homeland here."],
    open: seen("konya") },
  { id: "constantinople", cat: "yer", icon: "cities/constantinople", title: "Konstantinopolis", hint: "Konstantinopolis'i gör.",
    text: "İpek Yolu'nun batı ucu, surlarıyla ünlü Bizans başkenti. Bozkır beylerinin rüyası, tüccarların cenneti, ordularin mezarı.",
    en: ["Constantinople", "The western end of the Silk Road, the Byzantine capital famed for its walls. Dream of steppe lords, paradise of merchants, grave of armies."],
    open: seen("constantinople") },

  { id: "ipekyolu", cat: "yol", icon: "silk", title: "İpek Yolu", hint: "İlk ticaret kârını yap.",
    text: "Çin'den Bizans'a uzanan yollar ağı. Bir mal doğduğu şehirde ucuz, uzak diyarlarda altın değerindedir. Mevsimler, savaşlar ve salgınlar fiyatları her gün değiştirir.",
    en: ["The Silk Road", "A web of roads stretching from China to Byzantium. Goods are cheap where they are made and worth gold in distant lands. Seasons, wars and plagues change prices every day."],
    open: (g) => g.s.c.profit > 0 },
  { id: "kervansaray", cat: "yol", icon: "map/serai", title: "Kervansaray", hint: "Bir kervansaray kur.",
    text: "Bir günlük yol arayla dikilen kervansaraylar, yolcuya üç gün bedava yatak ve yemek verir. Sahibine hem altın hem dua kazandırır.",
    en: ["Caravanserai", "Built a day's journey apart, caravanserais give travelers three days of free bed and board. They earn their owner both gold and blessings."],
    open: (g) => Object.keys(g.s.serais).length >= 1 },
  { id: "harami", cat: "yol", icon: "j_bandit", title: "Haramiler", hint: "Bir harami çetesini yen.",
    text: "Kervan yolları ne kadar zenginse, pusuya yatan haramiler de o kadar çoktur. Bazı çete başları yenilgiyi unutmaz; yaralarıyla geri döner ve intikam ister.",
    en: ["Bandits", "The richer the caravan roads, the more bandits lie in wait. Some bandit chiefs never forget a defeat; they return with their scars and demand revenge."],
    open: (g) => g.s.c.wins >= 1 },
  { id: "kus", cat: "yol", icon: "bird_sungur", title: "Av Kuşları", hint: "Bir av kuşu edin.",
    text: "Doğan, kartal ve sungur, bozkır beylerinin göğe uzanan gözleridir. İyi eğitilmiş bir kuş, düşman ordusunu sen görmeden önce görür.",
    en: ["Hunting Birds", "Falcon, eagle and gyrfalcon are the eyes of steppe lords reaching into the sky. A well-trained bird sees an enemy army long before you do."],
    open: (g) => !!g.s.bird },
  { id: "hazar", cat: "yol", icon: "j_caravan", title: "Hazar Denizi", hint: "Hazar'da bir sefere çık.",
    text: "Hazar, kervanları haftalarca süren dolambaçtan kurtarır. Ama fırtınası ve korsanı eksik olmaz; muhafızsız gemi, sahibine dönmeyebilir.",
    en: ["The Caspian Sea", "The Caspian spares caravans weeks of detours. But it never lacks storms or pirates; an unescorted ship may never return to its owner."],
    open: (g) => (g.s.c.voyages ?? 0) >= 1 },
];

export function codexTitle(e: CodexEntry): string {
  return lang() === "en" ? e.en[0] : e.title;
}

export function codexText(e: CodexEntry): string {
  return lang() === "en" ? e.en[1] : e.text;
}

export const CODEX_BY_ID: Record<string, CodexEntry> = Object.fromEntries(CODEX.map((e) => [e.id, e]));
