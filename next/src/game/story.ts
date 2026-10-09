import { CITIES } from "../world/gen";
import { army } from "./data";
import type { Boss } from "./battle";
import type { Game } from "./game";
import { gen } from "./text";

export type CompId = "ayse" | "korkut" | "batu" | "leyla" | "ferhat" | "lucia";

export interface CompMods {
  atk: number;
  army: number;
  heal: number;
  xp: number;
  trade: number;
  carry: number;
  speed: number;
  sight: number;
}

export interface Companion {
  id: CompId;
  name: string;
  role: string;
  icon: string;
  desc: string;
  perk: string;
  mods: Partial<CompMods>;
  hire?: { city: string; gold: number; renown: number };
}

export const COMPANIONS: Companion[] = [
  { id: "ayse", name: "Ayşe", role: "Kız kardeşin · Şifacı", icon: "companions/ayse", desc: "Kara Tamga'nın elinden kurtardığın kız kardeşin. Annenizden öğrendiği otlarla yaraları sarar.", perk: "Savaşta her tur canının %4'ünü iyileştirir.", mods: { heal: 0.04 } },
  { id: "korkut", name: "Derviş Korkut", role: "Ozan · Bilge", icon: "companions/korkut", desc: "Buhara'nın yaşlı dervişi. Kopuzuyla eski destanları söyler, Kurgan Taşlarının sırrını bilir.", perk: "Kazandığın tecrübe %15 artar; askerlerin %4 güçlü.", mods: { xp: 0.15, army: 0.04 } },
  { id: "ferhat", name: "Ferhat", role: "İz sürücü", icon: "companions/ferhat", desc: "Bozkırda iz sürmeyi kurtlardan öğrenmiş sessiz bir avcı.", perk: "Yürüyüş hızın %12 artar, daha uzağı görürsün.", mods: { speed: 0.12, sight: 3 }, hire: { city: "merv", gold: 350, renown: 10 } },
  { id: "batu", name: "Batu", role: "Eski yüzbaşı", icon: "companions/batu", desc: "Hakan ordusundan kovulmuş yaşlı bir yüzbaşı. Hâlâ en iyi kılıç talimini o verir.", perk: "Saldırın %10, askerlerinin gücü %6 artar.", mods: { atk: 0.1, army: 0.06 }, hire: { city: "nishapur", gold: 600, renown: 30 } },
  { id: "leyla", name: "Leyla", role: "Tüccar kızı", icon: "companions/leyla", desc: "Tebriz çarşısının en keskin pazarlıkçısı. Her şehrin fiyatını ezbere bilir.", perk: "Pazarda %3 daha iyi fiyat, +30 yük.", mods: { trade: 0.03, carry: 30 }, hire: { city: "tabriz", gold: 500, renown: 20 } },
  { id: "lucia", name: "Lucia", role: "Venedikli tüccar", icon: "companions/lucia", desc: "Konstantiniyye'deki Venedik kolonisinden gelen gözü pek bir kadın. Doğu ile Batı arasında köprü kurar.", perk: "Pazarda %4 daha iyi fiyat, +40 yük.", mods: { trade: 0.04, carry: 40 }, hire: { city: "constantinople", gold: 900, renown: 50 } },
];

export const COMP_BY_ID = Object.fromEntries(COMPANIONS.map((c) => [c.id, c])) as Record<CompId, Companion>;
export const COMP_MAX = 3;

export interface Choice {
  label: string;
  why?: (g: Game) => string | null;
  run: (g: Game) => void;
}

export interface Chapter {
  title: string;
  goal: string;
  intro: string;
  img: string;
  req?: (g: Game) => string | null;
  city?: string;
  scene?: { img: string; text: (g: Game) => string; choices: Choice[] };
  auto?: (g: Game) => boolean;
  outro?: { img: string; title: string; text: (g: Game) => string };
  goto: (g: Game) => { x: number; y: number } | null;
}

const city = (id: string) => CITIES.find((c) => c.id === id)!;

export const KASIM: Boss = { name: "Köle Tüccarı Kasım", icon: "merchant", atk: 10, def: 6, hp: 190 };
export const KARA_HAN: Boss = { name: "Kara Han", icon: "heroes/boss_karahan", atk: 46, def: 22, hp: 1600 };

export const CHAPTERS: Chapter[] = [
  {
    title: "Damgalı Geçmiş",
    goal: "Buhara'ya git ve Derviş Korkut'u bul.",
    img: "companions/korkut",
    intro: "Efendin seni azat ederken omzundaki kara damgaya baktı ve fısıldadı: <i>\"O damga Kara Tamga'nın işaretidir. Ailene ne olduysa onlar yaptı. Buhara'daki Derviş Korkut bu işaretin sırrını bilir.\"</i>",
    city: "bukhara",
    req: (g) => (g.s.free ? null : "Önce hürriyetini kazan"),
    scene: {
      img: "companions/korkut",
      text: (g) => `Ak sakallı derviş kopuzunu bıraktı ve omzundaki damgaya uzun uzun baktı.<br><br><i>"Demek sen de onlardansın, ${g.s.hero.name}. Kara Tamga… Kara Han'ın köle avcıları. Esirlerin ruhlarını eski kurganlara hapsediyor, balbalları uyandırıyorlar. Taşlar uyandıkça bozkır kararıyor."</i><br><br><i>"Ailenin izini sürmek istiyorsan önce bir Kurgan Taşını kır. İçindeki ruhlar sana yolu gösterecek. Ben de seninle geleceğim; yaşlı bir dervişin sözü bazen kılıçtan keskindir."</i>`,
      choices: [{ label: "Korkut'u yanına al", run: (g) => { g.addCompanion("korkut"); g.storyAdvance(); } }],
    },
    goto: () => city("bukhara"),
  },
  {
    title: "Uyanan Taşlar",
    goal: "Haritada mor ışıkla parlayan bir Kurgan Taşını kır.",
    img: "map/kurgan",
    intro: "Korkut haritada mor ışıkla titreyen taşları gösterdi. <i>\"Her biri bir mezar, her mezarda bir esirin ruhu. Birini kır, ruhlar konuşsun.\"</i>",
    auto: (g) => g.s.c.kurgans >= 1,
    outro: {
      img: "ruh",
      title: "Ruhların fısıltısı",
      text: () => "Taş çatlarken içinden mor bir ışık yükseldi. Işığın içinde bir kız çocuğunun sesi duydun: <i>\"Abi… Merv… zincirler…\"</i><br><br>Korkut gözlerini kapadı: <i>\"Kız kardeşin Ayşe yaşıyor. Merv'in esir pazarında satılmak üzere. Ama oraya gidecek kadar güçlü olmalısın.\"</i>",
    },
    goto: (g) => g.nearest(g.s.kurgans.filter((k) => k.alive)),
  },
  {
    title: "Merv Esir Pazarı",
    goal: "5. seviyeye ulaş, Merv'e git ve Ayşe'yi kurtar.",
    img: "companions/ayse",
    intro: "Ayşe Merv'de. Kara Tamga'nın tüccarı Kasım onu yüksek fiyata satmayı bekliyor. Ya keseni ya kılıcını konuşturacaksın.",
    city: "merv",
    req: (g) => (g.s.hero.lv >= 5 ? null : "5. seviye gerekir"),
    scene: {
      img: "companions/ayse",
      text: () => `Esir pazarının ortasında, zincire vurulmuş kızların arasında onu gördün. Saçları kısa kesilmiş, omzunda aynı kara damga… Ayşe!<br><br>Şişman tüccar Kasım sırıttı: <i>"Bu kız kıymetli, yiğit. 400 altın. Yoksa adamlarım seni de zincire vurur."</i>`,
      choices: [
        { label: "400 altın öde", why: (g) => (g.s.res.gold >= 400 ? null : "400 altın gerekir"), run: (g) => { g.pay({ gold: 400 }); g.rescueAyse(false); } },
        { label: "Zincirleri kır (savaş)", run: (g) => g.fightKasim() },
      ],
    },
    outro: {
      img: "companions/ayse",
      title: "Ayşe",
      text: (g) => `Ayşe boynuna sarıldı ve uzun süre ağladı. <i>"Seni öldü sandım ${g.s.hero.name}… Annemizi ve küçük Ertuğrul'u Kara Han'ın kalesine götürdüler. Kalenin yerini sadece çetelerin başları bilir."</i><br><br>Ayşe artık yanında. Yaralarını o saracak.`,
    },
    goto: () => city("merv"),
  },
  {
    title: "Kara Tamga'nın İzi",
    goal: "3 harami kampını yerle bir et ve 60 şöhrete ulaş. Çete başlarından biri kalenin yerini söyleyecek.",
    img: "map/camp",
    intro: "Kara Han'ın kalesi gizli. Ama haramilerin hepsi ona haraç öder. Kampları birer birer düşürürsen, çete başlarından biri mutlaka konuşur.",
    auto: (g) => g.s.c.camps >= 3 && g.s.renown >= 60,
    outro: {
      img: "map/castle",
      title: "Kalenin yeri",
      text: () => "Yaralı bir çete başı ayaklarına kapandı: <i>\"Söyleyeceğim, söyleyeceğim! Kara Tamga Kalesi batıda, kayalıkların arasında. Kara Han orada… esirlerin ruhlarıyla son taşı uyandırmaya hazırlanıyor.\"</i><br><br>Kale haritada işaretlendi. Kara Han'ın ordusu çok güçlü; birliğini büyüt, eşyalarını güçlendir.",
    },
    goto: (g) => g.nearest(g.s.camps.filter((c) => c.alive)),
  },
  {
    title: "Kara Han",
    goal: "Kara Tamga Kalesi'ne saldır ve Kara Han'ı yen.",
    img: "heroes/boss_karahan",
    intro: "Destanın son bölümü. Kara Han kalesinde seni bekliyor. Yanına güçlü bir birlik al; ordusu kalabalık ve kendisi ölümcül bir savaşçı.",
    goto: (g) => g.s.story.fort,
  },
];

export const FORT_GUARD = army(70, 45, 30);

export const ERLIK: Boss = { name: "Erlik Han", icon: "boss_erlik", atk: 95, def: 42, hp: 5200 };
export const ERLIK_SHADE: Boss = { name: "Erlik'in Gölgesi", icon: "boss_erlik", atk: 40, def: 18, hp: 1400 };
export const GATE_GUARD = army(120, 90, 70);
export const SHADE_GUARD = army(40, 40, 25);

export const ACT2: Chapter[] = [
  {
    title: "Kara Han'ın Mirası",
    goal: "15. seviyeye ulaş ve Buhara'da Derviş Korkut'u dinle.",
    img: "companions/korkut",
    intro: "Kara Han'ın kalesi yıkıldı ama Kurgan Taşları hâlâ mor ışıkla titriyor. Korkut seni Buhara'ya çağırıyor: <i>\"Bitmedi, evlat. Asıl olan daha başlamadı.\"</i>",
    city: "bukhara",
    req: (g) => (g.s.hero.lv >= 15 ? null : "15. seviye gerekir"),
    scene: {
      img: "companions/korkut",
      text: (g) => `Korkut kopuzunun tellerine dokunmadan oturuyordu. Gözleri kıpkırmızıydı.<br><br><i>"Kara Han bir kuldu, ${g.s.hero.name}. Efendisi yerin dokuz kat altında: <b>Erlik Han</b>. Esirlerin ruhlarıyla uyandırılan her taş, Erlik'in zincirinden bir halkayı çözüyordu. Kara Han öldü ama zincir gevşedi."</i><br><br><i>"Erlik'in kapısını bulmak için önce yerin altına inmelisin. Kurganların en derin katlarında atalarımız kapının yerini taşlara kazıdı."</i>`,
      choices: [{ label: "Derinlere ineceğim", run: (g) => g.storyAdvance() }],
    },
    goto: () => city("bukhara"),
  },
  {
    title: "Dokuz Kat Aşağı",
    goal: "Kurgan Derinliklerinde 10. kata in.",
    img: "map/kurgan",
    intro: "Ataların yazıtları derinlerde. Bir mezar kapısından in ve 10. kata kadar ilerle. Meşalelerini ve askerlerini iyi hazırla.",
    auto: (g) => g.s.deepBest >= 10,
    outro: {
      img: "ruh",
      title: "Taştaki yazıt",
      text: () => "Onuncu katın duvarında, mor ışıkla parlayan Göktürk harfleri: <i>\"Doğuda, göğün dağa değdiği yerde, Erlik'in kapısı yedi bey ve bir kamın eliyle mühürlendi. Beyler dağılırsa mühür çözülür.\"</i><br><br>Korkut fısıldadı: <i>\"Beyleri yeniden birleştirmelisin. Kılıçla ya da sözle.\"</i>",
    },
    goto: (g) => g.nearest(g.s.kurgans.filter((k) => !k.alive && !k.delved)),
  },
  {
    title: "Bozkırın Birliği",
    goal: "En az 2 beyi müttefikin ya da tabin yap.",
    img: "lord_bey",
    intro: "Erlik'e karşı tek tuğ yetmez. Bozkırın beylerini hediyeyle, antla ya da kılıçla kendi bayrağın altında topla.",
    auto: (g) => g.s.rivals.filter((r) => r.status === "ally" || r.status === "vassal").length >= 2,
    outro: {
      img: "lord_bey",
      title: "Tuğlar bir arada",
      text: (g) => `Beyler çadırında toplandı; kımız kâseleri elden ele dolaştı. <i>"${g.s.hero.name} nereye, biz oraya."</i><br><br>O gece Kaşgar'dan bir ulak geldi: Tanrı Dağları'nın eteğinde yaşayan yaşlı Umay Kam seni görmek istiyor.`,
    },
    goto: (g) => {
      const r = g.s.rivals.find((x) => x.status === "peace" || x.status === "war");
      return r ? { x: r.x, y: r.y } : null;
    },
  },
  {
    title: "Kamın Kehaneti",
    goal: "Kaşgar'a git ve Umay Kam'ın ayinine katıl.",
    img: "heroes/boss_kam",
    intro: "Umay Kam, Erlik'in kapısını açabilecek tek kişi. Ama ayin bedel ister: ya ruhlar ya kan.",
    city: "kashgar",
    req: (g) => (g.s.hero.lv >= 18 ? null : "18. seviye gerekir"),
    scene: {
      img: "heroes/boss_kam",
      text: () => `Ateşin başında kemik çanlı, kuş tüylü yaşlı bir kadın davulunu çalıyordu. Gözleri bembeyazdı.<br><br><i>"Erlik'in kapısı ancak iki yolla açılır, yiğit. Ya otuz esir ruhunu Umay'a geri verirsin, ya da Erlik'in gölgesiyle burada, ateşin içinde dövüşürsün."</i>`,
      choices: [
        { label: "Ruhları geri ver (30 Ruh Taşı, 3 Parşömen)", why: (g) => (g.s.mats.ruh >= 30 && g.s.mats.parsomen >= 3 ? null : "30 Ruh Taşı ve 3 Parşömen gerekir"), run: (g) => g.act2Ritual(false) },
        { label: "Gölgeyle dövüş", run: (g) => g.act2Ritual(true) },
      ],
    },
    goto: () => city("kashgar"),
  },
  {
    title: "Erlik Han",
    goal: "Erlik'in Kapısına git ve Yeraltı Hanı'nı yen.",
    img: "boss_erlik",
    intro: "Kapı açıldı. Yerin altından dokuz kat karanlık yükseliyor. Bozkırın bütün beyleri, kan kardeşlerin ve yoldaşların arkanda. Destanın son sayfası.",
    goto: (g) => g.s.act2.gate,
  },
];

export const KOK_BORU: Boss = { name: "Kök Börü", icon: "heroes/boss_buz", atk: 120, def: 55, hp: 7200 };
export const PEAK_GUARD = army(150, 120, 100);
export const ACT3_LV = 24;
export const OTUKEN_RENOWN = 900;

export const ACT3: Chapter[] = [
  {
    title: "Göğün Çağrısı",
    goal: `${ACT3_LV}. seviyeye ulaş ve Kaşgar'da Umay Kam'ı dinle.`,
    img: "heroes/boss_kam",
    intro: "Erlik yerin dibine çekildi ama bozkırın göğü hâlâ titriyor. Geceleri yıldızlar yer değiştiriyor, kartallar güneye uçmuyor. Kaşgar'dan yeniden ulak geldi: Umay Kam seni bekliyor.",
    city: "kashgar",
    req: (g) => (g.s.hero.lv >= ACT3_LV ? null : `${ACT3_LV}. seviye gerekir`),
    scene: {
      img: "heroes/boss_kam",
      text: (g) => `Umay Kam bu kez ateş yakmamıştı. Davulunu dizlerine koymuş, göğe bakıyordu.<br><br><i>"Erlik'i yendin, ${g.s.hero.name}. Ama yeraltı boşalınca gök de sarsıldı. Tengri'nin <b>Kut</b>'u, beylere hükmetme hakkı, Ötüken'den koptu ve göğe savruldu. Kut sahipsiz kalırsa bozkır yüz yıl kardeş kanıyla yıkanır."</i><br><br><i>"Kut, beyleri tek sofrada toplayana, adı yedi iklimde anılana iner. Önce beyleri kurultayda birleştir. Sonra Tengri Dağı sana yolunu gösterecek."</i>`,
      choices: [{ label: "Kut'un peşine düşeceğim", run: (g) => g.storyAdvance() }],
    },
    goto: () => city("kashgar"),
  },
  {
    title: "Ötüken'in Kutu",
    goal: `Semerkant'ta en az bir kurultay topla ve ${OTUKEN_RENOWN} şöhrete ulaş.`,
    img: "lord_bey",
    intro: "Kut sözle de kazanılır kılıçla da, ama asla tek başına. Müttefik ve tabi beylerini Semerkant'ta kurultaya çağır; adın bozkırın dört bucağına yayılsın.",
    auto: (g) => g.s.kurultay.held >= 1 && g.s.renown >= OTUKEN_RENOWN,
    outro: {
      img: "ruh",
      title: "Gökten inen ışık",
      text: (g) => `Kurultayın son gecesi beyler otağdan çıktığında doğu göğünde bir ışık sütunu gördüler. Mavi, buz gibi, yere değmeden asılı duran bir ışık.<br><br>Korkut kopuzunu göğsüne bastırdı: <i>"Tengri Dağı… Ötüken'in kutu oraya inmiş. Zirvede Kök Börü bekler, ${g.s.hero.name}. Atalarımızı Ergenekon'dan çıkaran kurt. Kut'u ancak onu geçen alır."</i>`,
    },
    goto: () => city("samarkand"),
  },
  {
    title: "Tengri Dağı",
    goal: "Tengri Dağı'nın zirvesine çık ve Kök Börü'yü geç.",
    img: "heroes/boss_buz",
    intro: "Kaşgar'ın ardında, karla örtülü zirvede gök bozkıra değiyor. Yolu Gök Bekçileri tutuyor. Destanın son tırmanışı.",
    goto: (g) => g.s.act3.peak,
  },
  {
    title: "Kut'un Sahibi",
    goal: "Tengri Dağı'nın zirvesinde Kut'un kaderini seç.",
    img: "ruh",
    intro: "Kök Börü başını eğdi. Zirvede, buzun içinde mavi bir alev gibi Kut duruyor. Bozkırın kaderi senin elinde.",
    goto: (g) => g.s.act3.peak,
  },
];

export interface Ending {
  id: string;
  name: string;
  label: string;
  img: string;
  why?: (g: Game) => string | null;
  text: (g: Game) => string;
}

export const ENDINGS: Ending[] = [
  {
    id: "kagan",
    name: "Gök Kağan",
    label: "Kut'u başına koy: bozkırı tek tuğ altında yönet",
    img: "lord_bey",
    why: (g) => (g.s.kagan ? null : "Önce kurultayda Kağan seçilmelisin"),
    text: (g) => `Kut'u avuçlarına aldığında mavi alev başının üstünde bir taç gibi yandı. Zirveden indiğinde bütün beyler Tengri Dağı'nın eteğinde tuğlarını yere sapladı.<br><br><i>"Gök Kağan ${g.s.hero.name}!"</i><br><br>Semerkant'tan Kaşgar'a kadar bozkır artık tek sofradır. Tabi beyler haraçlarını Kağan'ın otağına getirir; kardeş kanı dökülmez. Bir zamanlar efendisinin ocağında taş taşıyan çocuk, göğün tahtına oturdu.`,
  },
  {
    id: "hurriyet",
    name: "Zincir Kıran",
    label: "Kut'un gücüyle bozkırdaki bütün zincirleri kır",
    img: "companions/ayse",
    text: (g) => `Kut'u göğe kaldırdın ve bir dilek tuttun: <b>bir daha hiçbir çocuk zincire vurulmasın</b>.<br><br>O gece Merv'den Konstantinopolis'e kadar bütün esir pazarlarında kilitler kendiliğinden açıldı. Demir halkalar paslanıp toza döndü.${g.hasComp("ayse") ? " Ayşe omzundaki kara damgaya baktı: damga yoktu." : ""}<br><br>Köylüler adını ocak başlarında dua gibi anar. Senin tuğun bir hanedanın değil, hürriyetin bayrağı oldu.`,
  },
  {
    id: "ozan",
    name: "Korkut'un Yolu",
    label: "Kut'u Ötüken'e geri göm, kopuzu al ve yola düş",
    img: "companions/korkut",
    text: (g) => `Kut'u almadın. Onu ellerinle Ötüken'in kara toprağına, atalarının yanına gömdün. <i>"Kut kimsenin değil, bozkırındır."</i><br><br>${g.hasComp("korkut") ? "Korkut gözyaşlarını silmeden kopuzunu sana uzattı" : "Yaşlı bir ozan kopuzunu sana uzattı"}: <i>"Artık destanı sen söyleyeceksin."</i><br><br>Bütün devletler seni hakem bilir; beyler kavgalarını senin çadırına getirir. Hükmetmedin ama her sözün ferman sayıldı.`,
  },
  {
    id: "tengri",
    name: "Göğe Meydan Okuyan",
    label: "Kut'u kendi ruhuna mühürle (50 Ruh Taşı)",
    img: "boss_erlik",
    why: (g) => (g.s.mats.ruh >= 50 ? null : "50 Ruh Taşı gerekir"),
    text: (g) => `Elli esir ruhunu Kut'un alevine fırlattın ve alevi kendi göğsüne çektin. Gök gürledi, Kök Börü uludu, Umay Kam'ın davulu yarıldı.<br><br>Artık yaşlanmıyorsun. Kılıcın göğün ağırlığını taşıyor. Ama beyler senden korkuyor; korku sadakat değildir. Yeni bir Erlik doğdu mu, yoksa Erlik'i yenen tek kişi mi göğün yerini aldı? Bunu ${gen(g.s.hero.name)} kılıcı yazacak.`,
  },
];

export const endingOf = (id: string): Ending | undefined => ENDINGS.find((e) => e.id === id);
