import { COMPANION_IDS, type CompanionId } from "./companions";
import { sagaBonus } from "./perks";
import type { GameState } from "./state";

export const MATERIALS = ["iron", "leather", "wood", "steel"] as const;
export type Material = (typeof MATERIALS)[number];
export type Mats = Record<Material, number>;

export const ITEM_TYPES = ["sword", "bow", "shield", "armor"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];
export type Slot = "weapon" | "shield" | "armor";

export const ENCHANTS = ["profit", "speed", "bounty", "power", "loot"] as const;
export type EnchId = (typeof ENCHANTS)[number];

export interface Item {
  type: ItemType;
  tier: number;
  plus: number;
  ench?: EnchId;
}

export const UNIT_TYPES = ["spear", "archer", "cavalry"] as const;
export type UnitType = (typeof UNIT_TYPES)[number];
export const BANDIT_KINDS = ["foot", "mounted", "archer"] as const;
export type BanditKind = (typeof BANDIT_KINDS)[number];
export const UNIT_UNLOCK: Record<UnitType, number> = { spear: 0, archer: 2, cavalry: 4 };
const ROUTE_BANDIT: BanditKind[] = ["foot", "mounted", "archer", "foot", "mounted", "archer", "mounted", "foot"];
const BEATS: Record<UnitType, BanditKind> = { spear: "mounted", archer: "foot", cavalry: "archer" };
const WEAK: Record<UnitType, BanditKind> = { spear: "archer", archer: "mounted", cavalry: "foot" };

export interface Mount {
  breed: number;
  plus: number;
}
export const MAX_BREED = 5;

export interface Hero {
  name: string;
  look: number;
  level: number;
  xp: number;
  gear: Partial<Record<Slot, Item>>;
}

export const HERO_LOOKS = 6;
export const MAX_TIER = 5;
export const FORGE_LEVEL = [0, 5, 10, 15, 20, 25];

export function forgeLevel(tier: number): number {
  return FORGE_LEVEL[tier] ?? 99;
}

export function maxForgeTier(level: number): number {
  let t = 0;
  for (let i = 1; i < FORGE_LEVEL.length; i++) if (level >= FORGE_LEVEL[i]) t = i;
  return t;
}

export function clampItem(it: Item | undefined, level: number): Item | undefined {
  if (!it) return undefined;
  const max = maxForgeTier(level);
  if (max <= 0) return undefined;
  return it.tier <= max ? it : { ...it, tier: max };
}

export function clampGear(s: GameState): { from: Item; to: Item | undefined }[] {
  const lv = s.hero?.level ?? 0;
  const dropped: { from: Item; to: Item | undefined }[] = [];
  const fix = (it: Item | undefined): Item | undefined => {
    const next = clampItem(it, lv);
    if (it && (!next || next.tier < it.tier)) dropped.push({ from: it, to: next });
    return next;
  };
  if (s.hero) {
    s.hero.gear.weapon = fix(s.hero.gear.weapon);
    s.hero.gear.shield = fix(s.hero.gear.shield);
    s.hero.gear.armor = fix(s.hero.gear.armor);
  }
  for (const g of Object.values(s.compGear)) {
    if (!g) continue;
    g.weapon = fix(g.weapon);
    g.shield = fix(g.shield);
    g.armor = fix(g.armor);
  }
  return dropped;
}

export function gearNam(s: GameState): number {
  const slots = [s.hero?.gear.weapon, s.hero?.gear.shield, s.hero?.gear.armor];
  return Math.round(slots.reduce((a, it) => a + (it ? forgeLevel(it.tier) : 0), 0) / 3);
}

export function threatMult(s: GameState, need: number): number {
  const gap = need - gearNam(s);
  if (gap <= 0) return 1;
  return 1 + Math.min(0.6, gap / 40);
}

export function gearIcon(it: Item): string {
  return `it_${it.type}_${it.tier}`;
}
export const MAX_PLUS = 10;
export const MAX_HERO_LEVEL = 50;
export const HERO_PROFIT_PER_LEVEL = 0.02;
export const RARITY = ["#9a9a9a", "#e8e8e8", "#5fd36a", "#4aa3ff", "#b36bff", "#ff9a2e"];

const RECIPE: Record<ItemType, Partial<Mats>> = {
  sword: { iron: 3, wood: 1 },
  bow: { wood: 3, leather: 1 },
  shield: { wood: 2, iron: 2 },
  armor: { leather: 3, iron: 1 },
};
const TIER_FACTOR = [0, 1, 3, 8, 20, 50];
const TIER_STEEL = [0, 0, 0, 1, 4, 12];
const TIER_POWER = [0, 4, 10, 22, 45, 90];
const PLUS_CHANCE = [1, 1, 1, 1, 1, 1, 1, 0.7, 0.5, 0.35, 0.25];

export function slotOf(type: ItemType): Slot {
  return type === "shield" ? "shield" : type === "armor" ? "armor" : "weapon";
}

export function itemPower(it: Item | undefined): number {
  if (!it) return 0;
  return TIER_POWER[it.tier] * (1 + 0.12 * it.plus) * (it.ench === "power" ? 1 + ENCH_VALUE.power * it.tier : 1);
}

const ENCH_VALUE: Record<EnchId, number> = { profit: 0.02, speed: 0.015, bounty: 0.15, power: 0.12, loot: 0.1 };
const ENCH_STEEL = [0, 1, 1, 2, 4, 8];

export function enchValue(it: Item): number {
  return it.ench ? ENCH_VALUE[it.ench] * it.tier : 0;
}

export function enchantCost(it: Item): Partial<Mats> {
  return { steel: ENCH_STEEL[it.tier], leather: TIER_FACTOR[it.tier] * 2 };
}

export function rollEnchant(it: Item): EnchId {
  const pool = ENCHANTS.filter((e) => e !== it.ench);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function allGear(s: GameState): Item[] {
  const out: Item[] = [...Object.values(s.hero?.gear ?? {})];
  for (const g of Object.values(s.compGear)) if (g) out.push(...Object.values(g));
  return out.filter((it): it is Item => !!it);
}

export function gearBonus(s: GameState, kind: EnchId): number {
  let v = 0;
  for (const it of allGear(s)) if (it.ench === kind) v += enchValue(it);
  return v;
}

export function setTier(s: GameState): number {
  const g = s.hero?.gear;
  if (!g?.weapon || !g.shield || !g.armor) return 0;
  return Math.min(g.weapon.tier, g.shield.tier, g.armor.tier);
}

export const SET_POWER = 0.08;
export const SET_PROFIT = 0.03;

export function mountCost(breed: number, income: number): { gold: number; mats: Partial<Mats> } {
  return {
    gold: Math.max(3000, income * 120) * Math.pow(4, breed - 1),
    mats: { leather: 8 * TIER_FACTOR[breed], wood: 4 * TIER_FACTOR[breed], ...(TIER_STEEL[breed] ? { steel: TIER_STEEL[breed] } : {}) },
  };
}

export function mountPlusCost(m: Mount): Partial<Mats> {
  const out: Partial<Mats> = { leather: Math.ceil(TIER_FACTOR[m.breed] * (m.plus + 1) * 0.8) };
  if (m.plus >= 6) out.steel = Math.max(1, Math.ceil(m.breed * (m.plus - 5) * 0.5));
  return out;
}

export function mountSpeed(s: GameState): number {
  return s.mount ? 1 + 0.03 * s.mount.breed * (1 + 0.1 * s.mount.plus) : 1;
}

export function mountPower(s: GameState): number {
  return s.mount ? 6 * s.mount.breed * (1 + 0.12 * s.mount.plus) : 0;
}

export function mountIcon(breed: number): string {
  return breed >= 5 ? "mount_3" : breed >= 3 ? "mount_2" : "mount_1";
}

export const RELICS = [
  { id: "sword", icon: "r_sword", kind: "power", v: 0.25 },
  { id: "bow", icon: "r_bow", kind: "bounty", v: 0.5 },
  { id: "kopuz", icon: "r_kopuz", kind: "xp", v: 0.5 },
  { id: "banner", icon: "r_banner", kind: "profit", v: 0.1 },
  { id: "compass", icon: "r_compass", kind: "speed", v: 0.08 },
  { id: "map", icon: "r_map", kind: "offline", v: 2 },
  { id: "seal", icon: "r_seal", kind: "army", v: 0.3 },
  { id: "book", icon: "r_book", kind: "loot", v: 0.3 },
] as const;
export type RelicId = (typeof RELICS)[number]["id"];
type RelicKind = (typeof RELICS)[number]["kind"];

export function relicBonus(s: GameState, kind: RelicKind): number {
  let v = sagaBonus(s, kind);
  for (const r of RELICS) if (r.kind === kind && s.relics.includes(r.id)) v += r.v;
  return v;
}

export function rollRelic(s: GameState, chance: number): RelicId | null {
  const free = RELICS.filter((r) => !s.relics.includes(r.id));
  if (free.length === 0 || Math.random() >= chance) return null;
  const r = free[Math.floor(Math.random() * free.length)];
  s.relics.push(r.id);
  return r.id;
}

export const MONUMENT_STEPS = [25, 100, 400, 1500, 5000];
export const MONUMENT_BONUS = 0.02;

export function monumentStage(s: GameState): number {
  return MONUMENT_STEPS.filter((n) => s.stats.fallen >= n).length;
}

export function armyProfitMult(s: GameState): number {
  return heroMult(s) * (1 + gearBonus(s, "profit")) * (1 + SET_PROFIT * setTier(s)) * (1 + MONUMENT_BONUS * monumentStage(s)) * (1 + relicBonus(s, "profit"));
}

export function armySpeedMult(s: GameState): number {
  return (1 + gearBonus(s, "speed")) * mountSpeed(s) * (1 + relicBonus(s, "speed"));
}

export function armyBountyMult(s: GameState): number {
  return (1 + gearBonus(s, "bounty")) * (1 + relicBonus(s, "bounty"));
}

export function banditKind(route: number): BanditKind {
  return ROUTE_BANDIT[route % ROUTE_BANDIT.length];
}

export function unitUnlocked(s: GameState, u: UnitType): boolean {
  return s.barracks >= UNIT_UNLOCK[u];
}

export function unitBeats(u: UnitType): BanditKind {
  return BEATS[u];
}

export function classMult(u: UnitType, k: BanditKind): number {
  return BEATS[u] === k ? 1.6 : WEAK[u] === k ? 0.7 : 1;
}

export function bestUnit(s: GameState, route: number): UnitType {
  const k = banditKind(route);
  let best: UnitType = "spear";
  for (const u of UNIT_TYPES) if (unitUnlocked(s, u) && classMult(u, k) > classMult(best, k)) best = u;
  return best;
}

export function healTick(s: GameState, dt: number, acc: { v: number }): number {
  if (s.wounded <= 0) {
    acc.v = 0;
    return 0;
  }
  acc.v += (dt * (1 + 0.15 * s.barracks) * Math.max(1, s.wounded / 30)) / 20;
  const n = Math.min(s.wounded, Math.floor(acc.v));
  if (n > 0) {
    acc.v -= n;
    s.wounded -= n;
    s.soldiers += n;
  }
  return n;
}

export function takeCasualties(s: GameState, lost: number): { dead: number; wounded: number } {
  const wounded = Math.floor(lost * Math.min(0.9, 0.5 + sagaBonus(s, "casualty")));
  const dead = lost - wounded;
  s.soldiers -= lost;
  s.wounded += wounded;
  s.stats.fallen += dead;
  return { dead, wounded };
}

export function craftCost(type: ItemType, tier: number): Partial<Mats> {
  const out: Partial<Mats> = {};
  for (const [m, n] of Object.entries(RECIPE[type]) as [Material, number][]) out[m] = n * TIER_FACTOR[tier];
  if (TIER_STEEL[tier]) out.steel = TIER_STEEL[tier];
  return out;
}

export function plusCost(it: Item): Partial<Mats> {
  const main = Object.keys(RECIPE[it.type])[0] as Material;
  const out: Partial<Mats> = { [main]: Math.ceil(TIER_FACTOR[it.tier] * (it.plus + 1) * 0.6) };
  if (it.plus >= 6) out.steel = Math.max(1, Math.ceil(it.tier * (it.plus - 5) * 0.5));
  return out;
}

export function plusChance(plus: number): number {
  return PLUS_CHANCE[plus + 1] ?? 0.2;
}

export function hasMats(s: GameState, cost: Partial<Mats>): boolean {
  return (Object.entries(cost) as [Material, number][]).every(([m, n]) => s.mats[m] >= n);
}

export function payMats(s: GameState, cost: Partial<Mats>): void {
  for (const [m, n] of Object.entries(cost) as [Material, number][]) s.mats[m] -= n;
}

export function heroXpNeed(level: number): number {
  return Math.round(40 * Math.pow(1.35, level - 1));
}

export function heroMult(s: GameState): number {
  return s.hero ? 1 + HERO_PROFIT_PER_LEVEL * (s.hero.level - 1) : 1;
}

export function heroPower(s: GameState): number {
  if (!s.hero) return 8;
  const g = s.hero.gear;
  return (10 + 3 * (s.hero.level - 1) + itemPower(g.weapon) + itemPower(g.shield) + itemPower(g.armor)) * (1 + SET_POWER * setTier(s)) * (1 + relicBonus(s, "power")) + mountPower(s);
}

export function companionPower(s: GameState): number {
  let p = 0;
  for (const id of COMPANION_IDS) {
    const lv = s.companions[id] ?? 0;
    const g = s.compGear[id];
    if (lv > 0) p += 4 * lv + itemPower(g?.weapon) + itemPower(g?.shield) + itemPower(g?.armor);
  }
  return p;
}

export function soldierPower(s: GameState): number {
  return (1 + 0.3 * s.barracks) * (1 + relicBonus(s, "army"));
}

export function escortPower(s: GameState, route: number): number {
  return (s.escorts[route] ?? 0) * soldierPower(s) * classMult(s.escortClass[route] ?? "spear", banditKind(route));
}

export function banditStrength(s: GameState, route: number): number {
  return 6 * Math.pow(1.45, route) * (1 + 0.5 * s.age);
}

export function winChance(power: number, strength: number): number {
  return (power * power) / (power * power + strength * strength);
}

export function assigned(s: GameState): number {
  return s.escorts.reduce((a, b) => a + b, 0);
}

export function idleSoldiers(s: GameState): number {
  return Math.max(0, s.soldiers - assigned(s) - (s.siege?.troops ?? 0));
}

export function recruitCost(s: GameState, n: number, income: number): number {
  return Math.max(30, income * 3) * n * (1 + s.soldiers / 150) * (1 - sagaBonus(s, "recruit"));
}

export function barracksCost(s: GameState, income: number): number {
  return Math.max(2000, income * 150) * Math.pow(2.2, s.barracks);
}

export const MAX_BARRACKS = 10;

export interface BattleResult {
  win: boolean;
  lost: number;
  dead: number;
  wounded: number;
  loot: Partial<Mats>;
  xp: number;
  chest: boolean;
}

export function rollLoot(route: number, mult: number): { loot: Partial<Mats>; chest: boolean } {
  const loot: Partial<Mats> = {};
  const add = (m: Material, n: number) => (loot[m] = (loot[m] ?? 0) + n);
  const rolls = Math.max(1, Math.round((1 + route * 0.6 + Math.random() * 2) * mult));
  for (let k = 0; k < rolls; k++) {
    const r = Math.random();
    add(r < 0.36 ? "iron" : r < 0.68 ? "wood" : "leather", 1 + Math.floor(Math.random() * (1 + route / 2)));
  }
  if (Math.random() < (0.06 + route * 0.03) * mult) add("steel", 1 + Math.floor(route / 3));
  const chest = Math.random() < 0.025 * mult;
  if (chest) {
    add("iron", 6 + route * 3);
    add("wood", 6 + route * 3);
    add("leather", 6 + route * 3);
    add("steel", 2 + route);
  }
  return { loot, chest };
}

export function fight(s: GameState, route: number, withHero: boolean, strengthMult = 1, lootMult = 1): BattleResult {
  const esc = s.escorts[route] ?? 0;
  const power = escortPower(s, route) + (withHero ? heroPower(s) + companionPower(s) : 0);
  const strength = banditStrength(s, route) * strengthMult;
  const win = power > 0 && Math.random() < winChance(power, strength);
  const share = strength / (power + strength);
  const lost = Math.min(esc, Math.round(esc * (win ? 0.25 : 0.55) * share + (esc > 0 && Math.random() < share ? 1 : 0)));
  s.escorts[route] = esc - lost;
  const { dead, wounded } = takeCasualties(s, lost);
  let loot: Partial<Mats> = {};
  let chest = false;
  let xp = 0;
  if (win) {
    const r = rollLoot(route, (withHero ? 1 : 0.5) * lootMult * (1 + gearBonus(s, "loot") + relicBonus(s, "loot")));
    loot = r.loot;
    chest = r.chest;
    for (const [m, n] of Object.entries(loot) as [Material, number][]) s.mats[m] += n;
    xp = withHero ? Math.round(strength * 1.5) : 0;
  }
  return { win, lost, dead, wounded, loot, xp, chest };
}

export function gainXp(s: GameState, xp: number): number {
  const h = s.hero;
  if (!h || xp <= 0) return 0;
  h.xp += Math.round(xp * (1 + relicBonus(s, "xp")));
  let ups = 0;
  while (h.level < MAX_HERO_LEVEL && h.xp >= heroXpNeed(h.level)) {
    h.xp -= heroXpNeed(h.level);
    h.level++;
    ups++;
  }
  return ups;
}

export function bestCompanionWeapon(id: CompanionId): ItemType {
  return id === "batu" || id === "ferhat" || id === "leyla" ? "bow" : "sword";
}
