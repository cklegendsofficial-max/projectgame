import { lang } from "./i18n";
import { BUILDING_BY_ID, CITY_NAME, NODE_NAME, RES_NAME, UNITS } from "./game/data";
import { GOODS, ITEM_NAMES, RARITY, SKILL_INFO, SLOT_NAME, STAT_INFO } from "./game/rpg";
import { ARMOR_NAME, CLASSES, CLASS_SKILLS, WEAPON_NAME } from "./game/classes";
import { ACHIEVEMENTS } from "./game/achievements";
import { BRANCHES, TALENT_BY_ID } from "./game/talents";
import { ORDERS, TACTICS } from "./game/battle";
import { KUT_TIERS } from "./game/kut";
import { ZONE_DESC, ZONE_NAME } from "./game/otag";
import { SEASONS } from "./game/seasons";
import { localizeStory } from "./i18n-story";

const pct = (p: number): string => `${Math.round(p * 100)}%`;

function patch<T extends object>(table: Record<string, T>, en: Record<string, Partial<T>>): void {
  for (const [k, v] of Object.entries(en)) if (table[k]) Object.assign(table[k], v);
}

function words(table: Record<string, string>, en: Record<string, string>): void {
  for (const [k, v] of Object.entries(en)) if (k in table) table[k] = v;
}

/** Oyun verisi tablolarını seçilen dile çevirir. Oyun kurulmadan önce bir kez çağrılır. */
export function localizeData(): void {
  if (lang() !== "en") return;
  localizeStory();

  words(RES_NAME, { gold: "Gold", food: "Food", wood: "Timber", stone: "Stone" });
  words(NODE_NAME, { food: "Fertile Field", wood: "Forest", stone: "Quarry", gold: "Gold Mine" });
  words(CITY_NAME, { constantinople: "Constantinople", konya: "Konya", tabriz: "Tabriz", rey: "Rey", nishapur: "Nishapur", merv: "Merv", bukhara: "Bukhara", samarkand: "Samarkand", kashgar: "Kashgar" });
  patch(UNITS, { spear: { name: "Spearman" }, archer: { name: "Archer" }, horse: { name: "Horseman" } });
  patch(BUILDING_BY_ID, {
    saray: { name: "Palace", desc: "Sets the maximum level of other buildings. Raises your hero's band limit." },
    ciftlik: { name: "Farm", desc: "Produces food. Armies march on food." },
    kereste: { name: "Lumber Mill", desc: "Produces timber." },
    tasocagi: { name: "Quarry", desc: "Produces stone." },
    carsi: { name: "Bazaar", desc: "Produces gold from taxes and trade." },
    kisla: { name: "Barracks", desc: "Trains soldiers. Higher levels train faster and unlock archers and horsemen." },
    depo: { name: "Granary", desc: "Raises resource storage limit." },
    sur: { name: "Walls", desc: "Strengthens the capital's defense against raids." },
  });

  patch(STAT_INFO, {
    guc: { name: "Strength", short: "STR", desc: "Sword and axe damage, work output, carry capacity" },
    cev: { name: "Agility", short: "AGI", desc: "Dagger and bow damage, travel speed" },
    day: { name: "Endurance", short: "END", desc: "Health, energy and defense" },
    lid: { name: "Leadership", short: "LDR", desc: "Band size and troop attack power" },
    kar: { name: "Charisma", short: "CHA", desc: "Staff damage, volunteers, troop wages and market prices" },
  });
  patch(SKILL_INFO, {
    silah: { name: "Weapon Mastery", desc: "Raises your weapon damage by 6% per level. Improves at the training ground and in battle." },
    ticaret: { name: "Trade", desc: "Improves buying and selling prices. Improves as you trade at the bazaar." },
    emek: { name: "Labor", desc: "Raises work output in forests, quarries and fields." },
    zanaat: { name: "Craft", desc: "Improves as you craft at the workshop; raises the chance of rare and legendary items." },
  });
  words(SLOT_NAME, { silah: "Weapon", zirh: "Armor", kalkan: "Shield", at: "Mount", tilsim: "Charm" });
  ["Common", "Fine", "Rare", "Epic", "Legendary"].forEach((n, i) => RARITY[i] && (RARITY[i].name = n));
  patch(GOODS, {
    pamuk: { name: "Cotton" }, deri: { name: "Leather" }, demir: { name: "Iron" }, baharat: { name: "Spices" }, hali: { name: "Carpets" },
    gumus: { name: "Silver" }, turkuaz: { name: "Turquoise" }, ipek: { name: "Silk" }, porselen: { name: "Porcelain" }, yesim: { name: "Jade" },
  });
  const w = ITEM_NAMES.weapons;
  w.kilic.names.splice(0, 5, "Rusty Sword", "Iron Sword", "Steel Sabre", "Damascus Sword", "Sovereign's Sword");
  w.balta.names.splice(0, 5, "Wood Axe", "War Axe", "Double-bit Axe", "Tolga Axe", "Dragon Axe");
  w.hancer.names.splice(0, 5, "Blunt Dagger", "Iron Dagger", "Curved Dagger", "Shadow Dagger", "Fire Dagger");
  w.ok.names.splice(0, 5, "Hunting Bow", "Composite Bow", "Turkic Bow", "Master's Bow", "Khan's Bow");
  w.asa.names.splice(0, 5, "Juniper Staff", "Bone Staff", "Crystal Staff", "Tengri Staff", "Sky Wolf Staff");
  ITEM_NAMES.heavy.splice(0, 5, "Felt Vest", "Leather Armor", "Chain Mail", "Lamellar Armor", "Golden Lamellar");
  ITEM_NAMES.light.splice(0, 5, "Leather Vest", "Laced Leather", "Hardened Leather", "Night Armor", "Shadow Robe");
  ITEM_NAMES.shields.splice(0, 5, "Wicker Shield", "Wooden Shield", "Iron Shield", "Tolga Shield", "Dragon Shield");
  ITEM_NAMES.mounts.splice(0, 3, "Mule", "Steppe Horse", "Arabian Horse");
  ["Wolf Fang", "Eagle Feather", "Jade Eye", "Crystal Amulet", "Star Stone"].forEach((n, i) => ITEM_NAMES.charms[i] && (ITEM_NAMES.charms[i].name = n));
  words(WEAPON_NAME, { kilic: "Sword", balta: "Axe", hancer: "Dagger", ok: "Bow", asa: "Staff" });
  words(ARMOR_NAME, { agir: "Heavy armor", hafif: "Light armor" });

  const cls: Record<string, { name: string; role: string; desc: string; passive: string }> = {
    alp: { name: "Alp", role: "Armoured horseman · Bulwark and commander", desc: "A heavily armoured steppe alp with a shield. Stands before the band and empowers the troops. For those who want to fight with large armies.", passive: "Shield Wall: +25% defense, +15% troop strength." },
    bahadir: { name: "Bahadır", role: "Warrior · Melee damage", desc: "A furious warrior who charges in with a two-handed axe. Carries no shield, but fells whatever he strikes.", passive: "Rage: +20% attack; another +30% when below half health." },
    suikastci: { name: "Assassin", role: "Fedai · Critical hits and first strike", desc: "A master of dagger and bow who strikes from the shadows. Hits first before battle begins; critical hits are deadly.", passive: "Shadow Strike: a free attack at battle start; 30% crit chance, crits deal 2.2x." },
    hirsiz: { name: "Thief", role: "Highwayman · Evasion, loot and trade", desc: "A sweet-tongued, quick-handed road wolf. Slips past blows, empties enemy purses and fools everyone at the bazaar.", passive: "Nimble Hand: dodge 25% of attacks; +40% gold and item loot; better bazaar prices." },
    kam: { name: "Kam", role: "Spirit caller · Healing and support", desc: "A kam who speaks with the spirits of Sky Tengri. Heals in battle and brings fallen soldiers back to life.", passive: "Spirit Call: regain 7% health each round; 25% of lost troops return after victory; troops are 8% stronger." },
  };
  for (const c of CLASSES) Object.assign(c, cls[c.id] ?? {});

  const sk: Record<string, [string, (p: number) => string]> = {
    hucum: ["Shield Charge", (p) => `Every 3 rounds you charge the enemy line with your shield: area damage equal to ${pct(p)} of your attack.`],
    duvar: ["Iron Wall", (p) => `For the first 3 rounds you and your band take ${pct(p)} less damage.`],
    sancak: ["Khan's Banner", (p) => `As your banner waves your troops rally: band attack +${pct(p)} for 4 rounds.`],
    ulukalkan: ["Great Shield", (p) => `Every 4 rounds you stun the enemy with your shield: you take ${pct(p)} less damage that round.`],
    girdap: ["Blood Whirl", (p) => `Every 3 rounds you spin your axe: area damage equal to ${pct(p)} of your attack.`],
    ciglik: ["War Cry", (p) => `Your attack rises by ${pct(p)} for the whole battle.`],
    kanasusamis: ["Bloodthirsty", (p) => `${pct(p * 0.4)} of the damage you deal returns as health.`],
    ejder: ["Dragon Cleave", (p) => `${pct(p)} more damage to bosses, ${pct(p / 2)} more to armies.`],
    zehir: ["Poisoned Dagger", (p) => `Poison deals ${pct(p)} of your attack to the enemy every round.`],
    golge: ["Shadow Step", (p) => `Your dodge chance rises by ${pct(p)}.`],
    basavcisi: ["Headhunter", (p) => `You target the leaders: ${pct(p)} more damage to bosses, ${pct(p / 2)} more to armies.`],
    olumdansi: ["Dance of Death", (p) => `Every 3 rounds you dance among the shadows: damage equal to ${pct(p)} of your attack.`],
    kese: ["Cutpurse", (p) => `You steal ${pct(p)} more gold from victories.`],
    duman: ["Smoke Bomb", (p) => `For the first 3 rounds, smoke makes the enemy land ${pct(p)} fewer hits.`],
    gozboyama: ["Sleight of Hand", (p) => `Every 4 rounds you throw spice in the enemy's eyes: you take ${pct(p)} less damage that round.`],
    kalles: ["Treacherous Blade", (p) => `A blade in the back deals ${pct(p)} of your attack every round.`],
    gazap: ["Wrath of Tengri", (p) => `Every 3 rounds you call lightning from the sky: area damage equal to ${pct(p)} of your attack.`],
    kurt: ["Wolf Spirit", (p) => `The wolf spirit of your ancestors raises your band's strength by ${pct(p)}.`],
    atalar: ["Call of the Ancestors", (p) => `Ancestral spirits join the battle: band attack +${pct(p)} for 4 rounds.`],
    gokgurultu: ["Thunder", (p) => `Every 4 rounds the sky roars and the enemy cowers: you take ${pct(p)} less damage that round.`],
  };
  for (const list of Object.values(CLASS_SKILLS))
    for (const s of list) {
      const e = sk[s.id];
      if (e) [s.name, s.text] = e;
    }

  patch(BRANCHES, {
    kilic: { name: "Path of the Sword", desc: "Your hero's own might, critical hits and tactical genius" },
    kervan: { name: "Path of the Caravan", desc: "Trade, loot, caravanserais and craft" },
    bozkir: { name: "Path of the Steppe", desc: "Army, speed, scouting and Tengri's grace" },
  });
  const tl: Record<string, [string, (r: number) => string]> = {
    keskin: ["Keen Edge", (r) => `Hero attack +${pct(0.04 * r)}`],
    demirten: ["Iron Skin", (r) => `Defense +${pct(0.05 * r)}, health +${pct(0.03 * r)}`],
    kritik: ["Deadly Gaze", (r) => `Critical chance +${pct(0.025 * r)}`],
    kanici: ["Blood Drinker", (r) => `Heal ${pct(0.015 * r)} of your health every round`],
    nara: ["War Shout", (r) => `Band attack +${pct(0.03 * r)}`],
    taktik: ["Tactical Genius", (r) => `Tactic advantage +${pct(0.08 * r)}, wrong tactic penalty -${pct(0.08 * r)}`],
    efsane: ["Legendary Hero", () => "Attack and defense +15%, battle experience +20%"],
    pazarlik: ["Haggler", (r) => `${pct(0.01 * r)} discount when buying, ${pct(0.01 * r)} profit when selling`],
    deve: ["Camel Train", (r) => `Carry capacity +${15 * r}`],
    hanagasi: ["Innkeeper", (r) => `Caravanserai income +${pct(0.12 * r)}`],
    kacakci: ["Smuggler", (r) => `Consignment reward +${pct(0.1 * r)}, raider ambush -${pct(0.25 * r)}`],
    ganimet: ["Plunderer", (r) => `Battle loot gold +${pct(0.1 * r)}`],
    zanaat: ["Master Artisan", (r) => `Crafting cost -${pct(0.1 * r)}, better chance of rare items`],
    ipekhan: ["Silk Road Inn", () => "+5% on sales, caravanserai coffers fill twice as fast"],
    kartal: ["Eagle Eye", (r) => `Sight range +${2 * r}`],
    ruzgar: ["Wind Rider", (r) => `Map speed +${pct(0.04 * r)}`],
    komutan: ["Commander", (r) => `Band limit +${3 * r}`],
    gozcu: ["Scout Network", () => "You always see the enemy's tactic"],
    ruhavci: ["Soul Hunter", (r) => `Spirit Stone drop chance +${pct(0.1 * r)}`],
    kurtsurusu: ["Wolf Pack", (r) => `Troop wages -${pct(0.1 * r)}`],
    tengri: ["Tengri's Grace", () => "15% of fallen troops rise after victory, experience +10%"],
  };
  for (const [id, [n, f]] of Object.entries(tl)) {
    const x = TALENT_BY_ID[id];
    if (x) [x.name, x.text] = [n, f];
  }

  patch(ORDERS, {
    nara: { name: "War Cry", text: "Your band strikes with +25% strength for two rounds." },
    kanat: { name: "Flank Attack", text: "Horsemen ride around the flank: horseman damage ×1.8 this round." },
    ricat: { name: "Turan Tactic", text: "Feigned retreat: pull back a round; if the enemy breaks ranks, strike ×1.7 for the next two rounds. With few horsemen the enemy may not take the bait." },
  });
  patch(TACTICS, {
    hucum: { name: "Charge", text: "Horsemen in front, ride the enemy down.", foe: "will charge" },
    duvar: { name: "Shield Wall", text: "Spearmen hold the line, archers shoot from behind.", foe: "is forming a shield wall" },
    pusu: { name: "Ambush", text: "Circle around and loose the first arrow.", foe: "is setting an ambush" },
  });

  const ach: Record<string, [string, string]> = {
    free: ["Chain Breaker", "Buy your freedom."], beylik: ["Raise the Tug", "Found your own beylik."], camps5: ["Bandit Hunter", "Scatter 5 bandit camps."],
    kills100: ["Hundred Swords", "Defeat 100 enemies."], lv10: ["Alp", "Reach level 10."], lv25: ["Khan's Blood", "Reach level 25."],
    profit: ["Silk Road Merchant", "Earn 5000 gold in total trade profit."], serai3: ["Caravanserai Network", "Build caravanserais in 3 cities."],
    kurgan5: ["Kurgan Warden", "Topple 5 Kurgan Stones."], deep10: ["Into the Depths", "Reach floor 10 of the kurgan depths."],
    deep25: ["Lord of the Underworld", "Reach floor 25 of the kurgan depths."], nemesis: ["Blood Feud", "Kill a nemesis."],
    bird: ["Falconer", "Acquire a hunting bird."], foal: ["Stablemaster", "Raise a foal."], conquer: ["Wall Breaker", "Conquer a city."],
    conquer5: ["World Conqueror", "Conquer 5 cities."], ally: ["Blood Brothers", "Form an alliance with a bey."],
    vassal3: ["Bey of Beys", "Have 3 vassal beys at once."], beyq5: ["Man of His Word", "Fulfil 5 requests from beys."],
    turan: ["Steppe Wolf", "Use the Turan tactic 5 times in battle."], tore: ["Keeper of Töre", "Judge 8 töre cases."],
    okcu: ["Arrow of Mete Khan", "Score over 300 in horseback archery."], boy: ["Voice of Dede Korkut", "Complete a Dede Korkut tale."],
    kut: ["Blessed by the Sky", "Raise your kut above 90."], karahan: ["Black Tamga", "Defeat Kara Khan and finish the first saga."],
    erlik: ["Erlik's Gate", "Defeat Erlik Khan."], kagan: ["Khagan", "Be elected Khagan at the kurultai."],
    port: ["Caspian Captain", "Complete 5 voyages on the Caspian."], governor: ["Governor Maker", "Appoint a governor to a conquered city."],
    ending: ["End of the Saga", "Finish the third act and choose your fate."],
  };
  for (const a of ACHIEVEMENTS) if (ach[a.id]) [a.name, a.desc] = ach[a.id];

  const tiers: [string, string][] = [
    ["Kutless", "The people curse your name. Cities are ready to revolt, beys will not vote for you."],
    ["Dim Kut", "Töre barely knows you. Loyalty and army strength wane."],
    ["Blessed", "The sky has accepted you. No more, no less."],
    ["Blessed Bey", "Your name is spoken with töre. Cities are loyal, the army brave."],
    ["Sky-Blessed", "The bey chosen by Tengri. Beys give their vote, the people their lives."],
  ];
  KUT_TIERS.forEach((x, i) => tiers[i] && ([x.name, x.desc] = tiers[i]));
  patch(SEASONS, {
    bahar: { name: "Spring", desc: "Fields turn green: food output +25%. Showers grow frequent. Cotton and leather get cheaper.", arrive: "The snows have melted on the steppe; spring is here. The fields are greening." },
    yaz: { name: "Summer", desc: "Roads are dry and hard: travel +6%. Sandstorms grow in the deserts. Spices get dearer, silk cheaper.", arrive: "Summer presses down. The roads have dried and sand rises in the deserts." },
    guz: { name: "Autumn", desc: "Harvest season: food output +40%. Cotton and carpets get cheaper, silver dearer.", arrive: "Autumn has come; time for the harvest. The granaries are filling." },
    kis: { name: "Winter", desc: "Snow and frost: food output −40%, travel −12%. Bandits retreat to their lairs. Leather, iron and cotton get dearer.", arrive: "Winter has fallen. Snow closes the roads; watch your granaries." },
  });
  words(ZONE_NAME, { yaylak: "Summer Pasture", kislak: "Winter Pasture" });
  words(ZONE_DESC, {
    yaylak: "Cool mountain pastures of the north: lush in summer, snow-covered in winter.",
    kislak: "Sheltered plains of the south: keep the herd alive in winter, scorched in summer.",
  });
}
