import {
  BASE_OFFLINE_HOURS,
  MILESTONES,
  ROUTES,
  SEAL_BONUS,
  UPGRADE_BY_ID,
  type RouteDef,
} from "./data";
import { achievementMult } from "./achievements";
import { chronicleGlobalMult, chronicleOfflineHours, chronicleRouteMult } from "./chronicle";
import { cityRouteMult } from "./cities";
import { compMult } from "./companions";
import { armyBountyMult, armyProfitMult, armySpeedMult, relicBonus } from "./army";
import { fortRouteMult } from "./warfare";
import { ageMult, rivalRouteMult, traitMult, wonderMult } from "./empire";
import { marketMult } from "./market";
import { seasonRouteMult } from "./world";
import { tradeWarMult } from "./saga";
import { diploRouteMult } from "./realm";
import { govMult } from "./frontier";
import { artSpeedMult, provinceMult } from "./province";
import { hanMult } from "./caravanserai";
import type { GameState } from "./state";

export function milestoneMults(owned: number): { speed: number; profit: number } {
  let speed = 1;
  let profit = 1;
  for (const m of MILESTONES) {
    if (owned < m.n) break;
    if (m.speed) speed *= m.speed;
    if (m.profit) profit *= m.profit;
  }
  return { speed, profit };
}

export function nextMilestone(owned: number) {
  return MILESTONES.find((m) => m.n > owned) ?? null;
}

export function prevMilestoneN(owned: number): number {
  let prev = 0;
  for (const m of MILESTONES) {
    if (m.n > owned) break;
    prev = m.n;
  }
  return prev;
}

export function hasUpgrade(s: GameState, id: string): boolean {
  return s.upgrades.includes(id);
}

export function sealMult(s: GameState): number {
  return 1 + s.seals * SEAL_BONUS;
}

export function favorActive(s: GameState, now: number): boolean {
  return s.favorUntil > now;
}

export function boostActive(s: GameState, now: number): boolean {
  return s.boostUntil > now;
}

export function globalMult(s: GameState, now: number, includeTemp = true): number {
  let m = sealMult(s) * chronicleGlobalMult(s) * achievementMult(s) * compMult.profit(s) * ageMult(s) * wonderMult(s) * traitMult.profit(s) * armyProfitMult(s) * provinceMult(s);
  for (const id of s.upgrades) {
    const u = UPGRADE_BY_ID[id];
    if (u && u.kind === "all" && u.mult) m *= u.mult;
  }
  if (includeTemp) {
    if (favorActive(s, now)) m *= 2;
    if (boostActive(s, now)) m *= s.boostMult;
  }
  return m;
}

export function routeUpgradeMult(s: GameState, i: number): number {
  let m = chronicleRouteMult(s, i) * cityRouteMult(s, i) * rivalRouteMult(s, i) * fortRouteMult(s, i) * hanMult(s, i) * govMult(s, i);
  for (const id of s.upgrades) {
    const u = UPGRADE_BY_ID[id];
    if (u && u.kind === "route" && u.route === i && u.mult) m *= u.mult;
  }
  return m;
}

export function tripTime(s: GameState, i: number): number {
  return ROUTES[i].time / milestoneMults(s.routes[i].owned).speed / compMult.speed(s) / traitMult.speed(s) / armySpeedMult(s) / artSpeedMult(s);
}

export function profitPerTrip(s: GameState, i: number, now: number, includeTemp = true): number {
  const r = s.routes[i];
  if (r.owned <= 0) return 0;
  const def = ROUTES[i];
  const season = includeTemp ? seasonRouteMult(i, now) * marketMult(i, now) * tradeWarMult(s, i, now) * diploRouteMult(s, i, now) : 1;
  return def.profit * r.owned * milestoneMults(r.owned).profit * routeUpgradeMult(s, i) * globalMult(s, now, includeTemp) * season;
}

export function routeIncomePerSec(s: GameState, i: number, now: number, includeTemp = true): number {
  if (s.routes[i].owned <= 0) return 0;
  return profitPerTrip(s, i, now, includeTemp) / tripTime(s, i);
}

export function totalIncomePerSec(s: GameState, now: number, onlyAuto = false, includeTemp = true): number {
  let sum = 0;
  for (let i = 0; i < ROUTES.length; i++) {
    if (onlyAuto && !s.masters[i]) continue;
    sum += routeIncomePerSec(s, i, now, includeTemp);
  }
  return sum;
}

export function unitCost(def: RouteDef, owned: number): number {
  return def.baseCost * Math.pow(def.growth, owned);
}

export function bulkCost(def: RouteDef, owned: number, k: number): number {
  if (k <= 0) return 0;
  const r = def.growth;
  return (def.baseCost * Math.pow(r, owned) * (Math.pow(r, k) - 1)) / (r - 1);
}

export function maxAffordable(def: RouteDef, owned: number, gold: number): number {
  const r = def.growth;
  const first = def.baseCost * Math.pow(r, owned);
  if (gold < first) return 0;
  const k = Math.floor(Math.log((gold * (r - 1)) / first + 1) / Math.log(r));
  let n = Math.max(0, k);
  while (n > 0 && bulkCost(def, owned, n) > gold) n--;
  return n;
}

export type BuyMode = 1 | 10 | 100 | "next" | "max";

export function buyCount(s: GameState, i: number, mode: BuyMode): number {
  const def = ROUTES[i];
  const owned = s.routes[i].owned;
  if (mode === "max") return Math.max(1, maxAffordable(def, owned, s.gold));
  if (mode === "next") {
    const nm = nextMilestone(owned);
    return nm ? nm.n - owned : 1;
  }
  return mode;
}

export function offlineCapHours(s: GameState): number {
  let h = BASE_OFFLINE_HOURS + chronicleOfflineHours(s) + compMult.offlineHours(s) + relicBonus(s, "offline");
  for (const id of s.upgrades) {
    const u = UPGRADE_BY_ID[id];
    if (u && u.kind === "offline" && u.hours) h += u.hours;
  }
  return h;
}

export function bountyMult(s: GameState): number {
  let m = compMult.bounty(s) * traitMult.bounty(s) * armyBountyMult(s);
  for (const id of s.upgrades) {
    const u = UPGRADE_BY_ID[id];
    if (u && u.kind === "bounty" && u.mult) m *= u.mult;
  }
  return m;
}

export function merchantMult(s: GameState): number {
  let m = compMult.trade(s) * traitMult.trade(s);
  for (const id of s.upgrades) {
    const u = UPGRADE_BY_ID[id];
    if (u && u.kind === "merchant" && u.mult) m *= u.mult;
  }
  return m;
}

export function totalSealsFor(lifetime: number): number {
  return Math.floor(10 * Math.sqrt(lifetime / 2e8));
}

export function lifetimeForSeals(total: number): number {
  return 2e8 * (total / 10) ** 2;
}

export function claimableSeals(s: GameState): number {
  return Math.max(0, totalSealsFor(s.lifetimeEarned) - s.seals);
}

export function earn(s: GameState, amount: number): void {
  if (!(amount > 0) || !Number.isFinite(amount)) return;
  s.gold += amount;
  s.runEarned += amount;
  s.lifetimeEarned += amount;
}

export interface TripEvent {
  route: number;
  amount: number;
  trips: number;
}

export function step(s: GameState, dt: number, now: number, out: TripEvent[], pace = 1, whip = -1): void {
  for (let i = 0; i < ROUTES.length; i++) {
    const r = s.routes[i];
    if (r.owned <= 0) continue;
    const auto = s.masters[i];
    if (!auto && !r.running) continue;
    const t = tripTime(s, i);
    const burst = i === whip ? 3 : 1;
    r.progress += (dt * pace * burst) / t;
    if (r.progress >= 1) {
      let trips: number;
      if (auto) {
        trips = Math.floor(r.progress);
        r.progress -= trips;
      } else {
        trips = 1;
        r.progress = 0;
        r.running = false;
      }
      const amount = profitPerTrip(s, i, now) * trips;
      earn(s, amount);
      r.trips += trips;
      out.push({ route: i, amount, trips });
    }
  }
}

export function offlineEarnings(s: GameState, seconds: number, now: number): number {
  const capped = Math.min(seconds, offlineCapHours(s) * 3600);
  if (capped <= 0) return 0;
  let total = 0;
  for (let i = 0; i < ROUTES.length; i++) {
    if (!s.masters[i]) continue;
    total += routeIncomePerSec(s, i, now, false) * capped;
  }
  const favorLeft = Math.max(0, Math.min(capped, (s.favorUntil - (now - seconds * 1000)) / 1000));
  if (favorLeft > 0 && capped > 0) total *= 1 + favorLeft / capped;
  return total;
}
