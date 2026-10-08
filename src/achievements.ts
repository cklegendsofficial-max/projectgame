import { allGear, monumentStage, setTier } from "./army";
import { CHAPTERS } from "./chronicle";
import { cityLevel } from "./cities";
import { CITIES } from "./data";
import { TROPHY_IDS, TROPHY_RARITY } from "./province";
import type { GameState } from "./state";

export const ACHIEVEMENT_BONUS = 0.03;

export interface Achievement {
  id: string;
  icon: string;
  check: (s: GameState) => boolean;
}

const camels = (s: GameState) => s.routes.reduce((a, r) => a + r.owned, 0);
const trips = (s: GameState) => s.routes.reduce((a, r) => a + r.trips, 0);
const maxCity = (s: GameState) => Math.max(0, ...CITIES.map((c) => cityLevel(s, c.id)));
export const ACHIEVEMENTS: Achievement[] = [
  { id: "firstTrip", icon: "coins", check: (s) => trips(s) >= 1 },
  { id: "camels100", icon: "spices", check: (s) => camels(s) >= 100 },
  { id: "camels500", icon: "silk", check: (s) => camels(s) >= 500 },
  { id: "master1", icon: "master", check: (s) => s.masters.some(Boolean) },
  { id: "masterAll", icon: "crown", check: (s) => s.masters.every(Boolean) },
  { id: "allRoutes", icon: "porcelain", check: (s) => s.routes.every((r) => r.owned > 0) },
  { id: "bandits10", icon: "swords", check: (s) => s.stats.bandits >= 10 },
  { id: "bandits50", icon: "swords", check: (s) => s.stats.bandits >= 50 },
  { id: "merchants10", icon: "genie", check: (s) => s.stats.merchants >= 10 },
  { id: "orders10", icon: "scroll", check: (s) => s.stats.orders >= 10 },
  { id: "build1", icon: "b:caravanserai", check: (s) => maxCity(s) >= 1 },
  { id: "goldenAge", icon: "b:mosque", check: (s) => maxCity(s) >= 3 },
  { id: "million", icon: "coins", check: (s) => s.lifetimeEarned >= 1e6 },
  { id: "billion", icon: "silver", check: (s) => s.lifetimeEarned >= 1e9 },
  { id: "dynasty1", icon: "seal", check: (s) => s.stats.dynasties >= 1 },
  { id: "chapters4", icon: "t:nasreddin", check: (s) => s.chronicle.done >= 4 },
  { id: "firstForge", icon: "it_sword", check: (s) => s.stats.crafted >= 1 },
  { id: "plus7", icon: "anvil", check: (s) => allGear(s).some((it) => it.plus >= 7) },
  { id: "legend", icon: "mat_steel", check: (s) => allGear(s).some((it) => it.tier >= 5) },
  { id: "army100", icon: "soldier", check: (s) => s.soldiers >= 100 },
  { id: "hero10", icon: "barracks", check: (s) => (s.hero?.level ?? 0) >= 10 },
  { id: "nemesis1", icon: "wanted", check: (s) => s.stats.nemesisSlain >= 1 },
  { id: "nemesis5", icon: "wanted", check: (s) => s.stats.nemesisSlain >= 5 },
  { id: "fort1", icon: "fortress", check: (s) => s.stats.forts >= 1 },
  { id: "fortsAll", icon: "fortress", check: (s) => s.fortsTaken.length >= 4 },
  { id: "arena10", icon: "arena", check: (s) => s.arena.wins >= 10 },
  { id: "champion", icon: "trophy", check: (s) => s.arena.titles >= 1 },
  { id: "tulpar", icon: "mount_3", check: (s) => (s.mount?.breed ?? 0) >= 5 },
  { id: "enchant1", icon: "enchant", check: (s) => s.stats.enchants >= 1 },
  { id: "set3", icon: "it_armor", check: (s) => setTier(s) >= 3 },
  { id: "monument3", icon: "monument", check: (s) => monumentStage(s) >= 3 },
  { id: "relic1", icon: "r_sword", check: (s) => s.relics.length >= 1 },
  { id: "relicsAll", icon: "r_banner", check: (s) => s.relics.length >= 8 },
  { id: "titan1", icon: "tepegoz", check: (s) => s.stats.titans >= 1 },
  { id: "titan10", icon: "tepegoz", check: (s) => s.stats.titans >= 10 },
  { id: "contract10", icon: "scroll", check: (s) => s.stats.contracts >= 10 },
  { id: "oath5", icon: "f_divan", check: (s) => s.allegiance.rank >= 5 },
  { id: "trade5", icon: "tradewar", check: (s) => s.stats.tradeWars >= 5 },
  { id: "fallen1", icon: "balbal", check: (s) => s.fallenHeroes.length >= 1 },
  { id: "season5", icon: "schest", check: (s) => s.season.claimed >= 5 },
  { id: "guild3", icon: "guild", check: (s) => s.season.guildClaimed >= 3 },
  { id: "han3", icon: "han", check: (s) => s.hans.length >= 3 },
  { id: "spy5", icon: "spy", check: (s) => s.spies >= 5 },
  { id: "wed1", icon: "rings", check: (s) => !!s.spouse || s.bloodline.length > 0 },
  { id: "camp10", icon: "yayla", check: (s) => s.stats.migrations >= 10 },
  { id: "saga25", icon: "destan", check: (s) => s.sagaLog.length >= 25 },
  { id: "raid1", icon: "yelbegen", check: (s) => s.stats.raids >= 1 },
  { id: "bazaar1", icon: "bedesten", check: (s) => s.stats.bazaarGain > 0 },
  { id: "ally1", icon: "ally", check: (s) => s.stats.alliances >= 1 },
  { id: "war3", icon: "swords", check: (s) => s.stats.wars >= 3 },
  { id: "exp1", icon: "evren", check: (s) => s.stats.expeditions >= 1 },
  { id: "exp10", icon: "sefer", check: (s) => s.stats.expeditions >= 10 },
  { id: "tree5", icon: "soyagaci", check: (s) => s.lineage.filter((l) => l.spouse).length >= 5 },
  { id: "decree5", icon: "crown", check: (s) => s.stats.decrees >= 5 },
  { id: "region1", icon: "village", check: (s) => s.regions.some((r) => r.open) },
  { id: "region10", icon: "tr_crown", check: (s) => s.regions.some((r) => r.lv >= 10) },
  { id: "legend1", icon: "tr_dagger", check: (s) => TROPHY_IDS.some((id) => TROPHY_RARITY[id] === 2 && (s.trophies[id] ?? 0) > 0) },
  { id: "codex12", icon: "trophy", check: (s) => Object.keys(s.trophies).length >= 12 },
  { id: "merc50", icon: "merc", check: (s) => s.mercs >= 50 },
  { id: "defend5", icon: "swords", check: (s) => s.stats.defends >= 5 },
  { id: "art1", icon: "ar_banner", check: (s) => s.artifacts.length >= 1 },
  { id: "ageMongol", icon: "age_mongol", check: (s) => s.age >= 2 },
  { id: "ageOttoman", icon: "age_ottoman", check: (s) => s.age >= 4 },
  { id: "wonder1", icon: "w:registan", check: (s) => Object.values(s.wonders).some((v) => v >= 3) },
  { id: "wondersAll", icon: "w:hagia", check: (s) => Object.values(s.wonders).filter((v) => v >= 3).length >= 3 },
  { id: "rivalsAll", icon: "swords", check: (s) => s.rivalsBeaten.length >= 3 },
  { id: "lineage5", icon: "seal", check: (s) => s.ruler.gen >= 5 },
  { id: "boom5", icon: "coins", check: (s) => s.stats.booms >= 5 },
  { id: "comp3", icon: "c:batu", check: (s) => Object.keys(s.companions).length >= 3 },
  { id: "compAll", icon: "c:korkut", check: (s) => Object.keys(s.companions).length >= 6 },
  { id: "stories10", icon: "scroll", check: (s) => s.stats.stories >= 10 },
  { id: "chaptersAll", icon: "t:evliya", check: (s) => s.chronicle.done >= CHAPTERS.length },
];

export function achievementMult(s: GameState): number {
  return 1 + s.achievements.length * ACHIEVEMENT_BONUS;
}

export function newAchievements(s: GameState): Achievement[] {
  const out: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (s.achievements.includes(a.id) || !a.check(s)) continue;
    s.achievements.push(a.id);
    out.push(a);
  }
  return out;
}
