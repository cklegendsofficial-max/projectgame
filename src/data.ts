export interface CityDef {
  id: string;
  x: number;
  y: number;
}

export interface RouteDef {
  id: string;
  from: string;
  to: string;
  color: string;
  baseCost: number;
  growth: number;
  time: number;
  profit: number;
  masterCost: number;
  bend: number;
}

export const CITIES: CityDef[] = [
  { id: "constantinople", x: 0.07, y: 0.3 },
  { id: "konya", x: 0.17, y: 0.5 },
  { id: "tabriz", x: 0.34, y: 0.36 },
  { id: "rey", x: 0.46, y: 0.52 },
  { id: "nishapur", x: 0.6, y: 0.47 },
  { id: "merv", x: 0.68, y: 0.64 },
  { id: "bukhara", x: 0.77, y: 0.47 },
  { id: "samarkand", x: 0.85, y: 0.38 },
  { id: "kashgar", x: 0.95, y: 0.22 },
];

export const CITY_BY_ID: Record<string, CityDef> = Object.fromEntries(CITIES.map((c) => [c.id, c]));

const ROUTE_COST_SCALE = [1, 2, 4, 6, 8, 6, 8, 10];
const MASTER_COST_SCALE = 3;
const UPGRADE_COST_SCALE = 4;

const BASE_ROUTES: RouteDef[] = [
  { id: "spices", from: "samarkand", to: "bukhara", color: "#d9822b", baseCost: 4, growth: 1.07, time: 1.5, profit: 1.5, masterCost: 1_000, bend: 0.12 },
  { id: "cotton", from: "bukhara", to: "merv", color: "#e8e1cf", baseCost: 60, growth: 1.15, time: 4, profit: 60, masterCost: 15_000, bend: -0.15 },
  { id: "jade", from: "kashgar", to: "samarkand", color: "#3fae6a", baseCost: 720, growth: 1.14, time: 8, profit: 540, masterCost: 100_000, bend: 0.18 },
  { id: "turquoise", from: "merv", to: "nishapur", color: "#2ec4c4", baseCost: 8_640, growth: 1.13, time: 16, profit: 4_320, masterCost: 500_000, bend: 0.14 },
  { id: "silk", from: "nishapur", to: "rey", color: "#c73e6b", baseCost: 103_680, growth: 1.12, time: 32, profit: 51_840, masterCost: 1_200_000, bend: -0.12 },
  { id: "carpets", from: "rey", to: "tabriz", color: "#8a3ffc", baseCost: 1_244_160, growth: 1.11, time: 96, profit: 622_080, masterCost: 10_000_000, bend: 0.16 },
  { id: "silver", from: "tabriz", to: "konya", color: "#b8c4d6", baseCost: 14_929_920, growth: 1.1, time: 300, profit: 7_464_960, masterCost: 111_111_111, bend: -0.1 },
  { id: "porcelain", from: "konya", to: "constantinople", color: "#5b8def", baseCost: 179_159_040, growth: 1.09, time: 900, profit: 89_579_520, masterCost: 555_555_555, bend: 0.15 },
];

export const ROUTES: RouteDef[] = BASE_ROUTES.map((r, i) => ({
  ...r,
  baseCost: r.baseCost * ROUTE_COST_SCALE[i],
  masterCost: r.masterCost * MASTER_COST_SCALE,
}));

export interface Milestone {
  n: number;
  speed?: number;
  profit?: number;
}

export const MILESTONES: Milestone[] = [
  { n: 10, profit: 2 },
  { n: 25, speed: 2 },
  { n: 50, speed: 2 },
  { n: 100, speed: 2 },
  { n: 150, profit: 3 },
  { n: 200, speed: 2 },
  { n: 300, speed: 2 },
  { n: 400, speed: 2 },
  { n: 500, profit: 4 },
  { n: 600, profit: 4 },
  { n: 700, profit: 4 },
  { n: 800, profit: 4 },
  { n: 900, profit: 4 },
  { n: 1000, profit: 5 },
];

export type UpgradeKind = "route" | "all" | "bounty" | "offline" | "merchant";

export interface UpgradeDef {
  id: string;
  kind: UpgradeKind;
  cost: number;
  route?: number;
  mult?: number;
  hours?: number;
}

function buildUpgrades(): UpgradeDef[] {
  const tierBase = [250e3, 500e3, 1e6, 5e6, 10e6, 25e6, 500e6, 1e9];
  const tierScale = [1, 1e5, 1e10, 1e15];
  const list: UpgradeDef[] = [];
  tierScale.forEach((scale, t) => {
    tierBase.forEach((base, i) => {
      list.push({ id: `r${i}_t${t}`, kind: "route", route: i, mult: 3, cost: base * scale });
    });
  });
  [1e10, 1e15, 1e20, 1e25].forEach((cost, k) => list.push({ id: `all_${k}`, kind: "all", mult: 3, cost }));
  list.push({ id: "bounty_0", kind: "bounty", mult: 2, cost: 50_000 });
  list.push({ id: "bounty_1", kind: "bounty", mult: 3, cost: 5e8 });
  list.push({ id: "merchant_0", kind: "merchant", mult: 1.5, cost: 2e6 });
  list.push({ id: "merchant_1", kind: "merchant", mult: 2, cost: 2e11 });
  list.push({ id: "offline_0", kind: "offline", hours: 4, cost: 3e7 });
  list.push({ id: "offline_1", kind: "offline", hours: 12, cost: 3e12 });
  for (const u of list) u.cost *= UPGRADE_COST_SCALE;
  return list.sort((a, b) => a.cost - b.cost);
}

export const UPGRADES: UpgradeDef[] = buildUpgrades();
export const UPGRADE_BY_ID: Record<string, UpgradeDef> = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

export const BASE_OFFLINE_HOURS = 4;
export const SEAL_BONUS = 0.05;
export const FAVOR_DURATION_MS = 4 * 3600 * 1000;
export const FAVOR_MAX_MS = 24 * 3600 * 1000;
export const AD_COOLDOWN_MS = 3 * 60 * 1000;
