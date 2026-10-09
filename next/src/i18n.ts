import { settings } from "./settings";

export type Lang = "tr" | "en";

export const LANGS: Record<Lang, string> = { tr: "Türkçe", en: "English" };

/** Kaynak dil Türkçe; anahtar olarak Türkçe metin kullanılır. Eksik çeviride Türkçe döner. */
const EN: Record<string, string> = {
  // ana menü
  Semerkant: "Samarkand",
  Kahraman: "Hero",
  Birliğim: "My Band",
  Ses: "Sound",
  // kahraman sekmeleri
  Karakter: "Character",
  Beceriler: "Skills",
  Yetenekler: "Talents",
  Teçhizat: "Gear",
  Birlik: "Band",
  Hedefler: "Goals",
  // ayarlar
  Müzik: "Music",
  Efektler: "Effects",
  Görüntü: "Display",
  "Arayüz boyutu": "UI scale",
  "Tam ekran": "Fullscreen",
  "Mini harita": "Minimap",
  "Pil tasarrufu": "Battery saver",
  Titreşim: "Vibration",
  Açık: "On",
  Kapalı: "Off",
  "Kayıt yuvaları": "Save slots",
  "Oyun her birkaç saniyede bir etkin yuvaya kaydedilir. Yuva değiştirince mevcut oyunun kaydedilir ve sayfa yeniden yüklenir.": "The game autosaves to the active slot every few seconds. Switching slots saves your current game and reloads the page.",
  "Dışa aktar": "Export",
  "İçe aktar": "Import",
  "Klavye kısayolları": "Keyboard shortcuts",
  "Oyun kolu": "Gamepad",
  "<kbd>Sol çubuk</kbd> Kamera / seçim · <kbd>A</kbd> Nişangâha git, seç · <kbd>B</kbd> Kapat · <kbd>Y</kbd> Birliğine dön · <kbd>X</kbd> Kuşu uçur · <kbd>LB</kbd>/<kbd>RB</kbd> Yakınlaş, sekme · <kbd>LT</kbd>/<kbd>RT</kbd> Yakınlaş · <kbd>Start</kbd> Kahraman · <kbd>Back</kbd> Menü": "<kbd>Left stick</kbd> Camera / select · <kbd>A</kbd> Go to reticle, confirm · <kbd>B</kbd> Close · <kbd>Y</kbd> Back to band · <kbd>X</kbd> Fly bird · <kbd>LB</kbd>/<kbd>RB</kbd> Zoom, tabs · <kbd>LT</kbd>/<kbd>RT</kbd> Zoom · <kbd>Start</kbd> Hero · <kbd>Back</kbd> Menu",
  // ana menü
  "Destana devam et": "Continue your saga",
  "Yeni destan": "New saga",
  "Oyuna dön": "Resume",
  Sv: "Lv",
  "Bir köle olarak başla, hakan olarak öl": "Begin as a slave, die as a khagan",
  "Yükle, yeni yuva aç, dışa/içe aktar": "Load, start a new slot, export/import",
  Ayarlar: "Settings",
  "Ses, görüntü, anlatıcı, dil": "Sound, display, storyteller, language",
  "Oyundan çık": "Quit game",
  "İlerlemen kaydedilir": "Your progress is saved",
  "İpek Yolu'nda bir köleden hakana": "From slave to khagan on the Silk Road",
  "Oyun duraklatıldı": "Game paused",
  "Bu yuvada yeni oyun başlat": "Start a new game in this slot",
  Aktif: "Active",
  Başarımlar: "Achievements",
  Miras: "Legacy",
  son: "endings",
  Yükle: "Load",
  "Yeni oyun": "New game",
  "Boş yuva": "Empty slot",
  Yuva: "Slot",
  "Dil değişikliği sayfa yenilenince tamamlanır. Hikâye metinlerinin çevirisi sürüyor.": "The language change completes after a reload. Story text translation is in progress.",
  // sınıf seçimi
  "Yolunu seç": "Choose your path",
  "Seçtiğin yol hangi silahları ve zırhları kullanabileceğini, hangi özelliklerin seni güçlendireceğini belirler. Daha sonra değiştirilemez.": "Your path decides which weapons and armor you can use and which attributes empower you. It cannot be changed later.",
  Adın: "Your name",
  "Bu yolu seç": "Choose this path",
  Kalkan: "Shield",
  Güç: "Strength",
  Çeviklik: "Agility",
  Dayanıklılık: "Endurance",
  Liderlik: "Leadership",
  Karizma: "Charisma",
  "Şövalye · Tank ve komutan": "Knight · Tank and commander",
  "Savaşçı · Yakın dövüş hasarı": "Warrior · Melee damage",
  "Ağır zırhlı, kalkanlı bozkır şövalyesi. Birliğinin önünde durur, askerlerini güçlendirir. Büyük ordularla savaşmak isteyenler için.": "A heavily armored steppe knight with a shield. Stands before the band and empowers the troops. For those who want to fight with large armies.",
  "Kalkan Duvarı: savunman %25, askerlerinin gücü %15 artar.": "Shield Wall: +25% defense, +15% troop strength.",
  "İki elli baltasıyla savaş meydanına dalan öfkeli savaşçı. Kalkan taşımaz ama vurduğunu yere serer.": "A furious warrior who charges in with a two-handed axe. Carries no shield, but fells whatever he strikes.",
  "Öfke: saldırın %20 fazla; canın yarının altına düşünce %30 daha artar.": "Rage: +20% attack; another +30% when below half health.",
  "Ninja · Kritik vuruş ve ilk darbe": "Ninja · Critical hits and first strike",
  "Gölgelerden çıkan, hançer ve yay ustası. Savaş başlamadan ilk darbeyi vurur, kritik vuruşları ölümcüldür.": "A master of dagger and bow who strikes from the shadows. Hits first before battle begins; critical hits are deadly.",
  "Gölge Darbesi: savaş başında bedava bir saldırı; %30 kritik şansı, kritikler 2,2 kat vurur.": "Shadow Strike: a free attack at battle start; 30% crit chance, crits deal 2.2x.",
  "Haydut · Kaçınma, ganimet ve ticaret": "Rogue · Evasion, loot and trade",
  "Dili tatlı, eli çabuk bir yol kurdu. Darbelerden sıyrılır, düşmanın kesesini boşaltır, pazarda herkesi kandırır.": "A sweet-tongued, quick-handed road wolf. Slips past blows, empties enemy purses and fools everyone at the bazaar.",
  "Çevik El: saldırıların %25'inden kaçarsın; %40 fazla altın ve eşya ganimeti; pazarda daha iyi fiyat.": "Nimble Hand: dodge 25% of attacks; +40% gold and item loot; better bazaar prices.",
  "Şaman · İyileştirme ve destek": "Shaman · Healing and support",
  "Gök Tengri'nin ruhlarıyla konuşan şaman. Savaşta kendini iyileştirir, düşen askerlerini hayata döndürür.": "A shaman who speaks with the spirits of Sky Tengri. Heals in battle and brings fallen soldiers back to life.",
  "Ruh Çağrısı: her tur canının %7'sini yeniler; zaferden sonra kayıp askerlerinin %25'i geri döner; askerlerin %8 güçlü.": "Spirit Call: regain 7% health each round; 25% of lost troops return after victory; troops are 8% stronger.",
  // yeni sistemler
  "Kut ve Töre": "Kut and Töre",
  Hanedan: "Dynasty",
  "Dede Korkut Boyları": "Tales of Dede Korkut",
  "Bozkır Oyunları": "Steppe Games",
  "Tamga ve Destan Defteri": "Tamga and Songbook",
  "Hikâye Anlatıcısı": "Storyteller",
  "Anlatıcı destanının temposunu belirler: işler fazla yolunda giderse bela gönderir, zor anında yardım eli uzatabilir.": "The storyteller sets the pace of your saga: when things go too well it sends trouble, in hard times it may lend a hand.",
  "Umay Ana": "Mother Umay",
  "Gök Tengri": "Sky Tengri",
  "Erlik Han": "Erlik Khan",
  "Merhametli anlatıcı. Tehditler seyrek ve hafif; zor anlarında yardım eli uzanır.": "Merciful storyteller. Threats are rare and mild; help arrives in hard times.",
  "Dengeli anlatıcı. Fırtına ile sükûnet sırayla gelir.": "Balanced storyteller. Storm and calm take turns.",
  "Acımasız anlatıcı. Belalar üst üste gelir, yardım nadirdir. Yalnızca yürekliler için.": "Ruthless storyteller. Disasters pile up, help is rare. Only for the brave.",
  Gerilim: "Tension",
  "Kabak Atma": "Kabak Shooting",
  "atlı okçuluk": "horseback archery",
  Oyna: "Play",
  Bırak: "Quit",
  Tekrar: "Again",
  Kapat: "Close",
  "Kabak Atma bitti": "Round over",
  puan: "points",
  isabet: "hits",
  "En iyi": "Best",
  "Yeni rekor!": "New record!",
  "Hedefe dokun ya da <kbd>Boşluk</kbd> · kabak 10 · kurt 20 · kartal 35 · art arda isabet çarpan verir": "Tap a target or press <kbd>Space</kbd> · gourd 10 · wolf 20 · eagle 35 · consecutive hits build a multiplier",
  Dinle: "Listen",
  Bul: "Find",
  "Yola çık": "Set out",
  Devam: "Continue",
};

const DICT: Record<Lang, Record<string, string>> = { tr: {}, en: EN };

export function lang(): Lang {
  return settings.lang ?? "tr";
}

export function t(src: string, vars?: Record<string, string | number>): string {
  let out = DICT[lang()][src] ?? src;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

export function hasT(src: string): boolean {
  return src in EN;
}

export function enKeys(): string[] {
  return Object.keys(EN);
}
