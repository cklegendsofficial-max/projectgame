import { ROUTES } from "./data";
import { totalIncomePerSec, tripTime } from "./economy";
import type { GameState } from "./state";

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];
export const SEASON_MS = 4 * 60_000;

export function seasonAt(now: number): { season: Season; left: number } {
  const k = Math.floor(now / SEASON_MS);
  return { season: SEASONS[k % 4], left: SEASON_MS - (now - k * SEASON_MS) };
}

export function seasonRouteMult(i: number, now: number): number {
  const { season } = seasonAt(now);
  if (season === "autumn" && (i === 0 || i === 1)) return 2;
  if (season === "winter" && (i === 4 || i === 5 || i === 6)) return 1.5;
  return 1;
}

export function seasonBountyMult(now: number): number {
  return seasonAt(now).season === "summer" ? 2 : 1;
}

export function seasonBanditInterval(now: number): number {
  return seasonAt(now).season === "summer" ? 0.6 : 1;
}

export function seasonMerchantInterval(now: number): number {
  return seasonAt(now).season === "spring" ? 0.5 : 1;
}

export interface Order {
  route: number;
  city: string;
  need: number;
  got: number;
  born: number;
  deadline: number;
  reward: number;
}

export class OrderManager {
  order: Order | null = null;
  private next: number;

  constructor(now: number) {
    this.next = now + 60_000;
  }

  update(s: GameState, now: number): { spawned?: Order; failed?: Order } {
    const o = this.order;
    if (o && now > o.deadline) {
      this.order = null;
      this.next = now + rand(60_000, 120_000);
      return { failed: o };
    }
    if (o || now < this.next || s.tutorial < 5 || document.hidden) return {};
    const candidates = ROUTES.map((_, i) => i).filter((i) => s.routes[i].owned > 0 && tripTime(s, i) <= 150);
    if (candidates.length === 0) return {};
    const route = candidates[Math.floor(Math.random() * candidates.length)];
    const tt = tripTime(s, route);
    const need = Math.max(1, Math.min(8, Math.round(40 / Math.max(tt, 1))));
    const seconds = Math.max(45, need * tt * 1.5 + 25);
    const reward = Math.max(300, totalIncomePerSec(s, now) * 120);
    this.order = { route, city: ROUTES[route].to, need, got: 0, born: now, deadline: now + seconds * 1000, reward };
    this.next = Infinity;
    return { spawned: this.order };
  }

  onTrip(route: number, trips: number, now: number): Order | null {
    const o = this.order;
    if (!o || o.route !== route) return null;
    o.got += trips;
    if (o.got < o.need) return null;
    this.order = null;
    this.next = now + rand(70_000, 140_000);
    return o;
  }

  clear(now: number): void {
    this.order = null;
    this.next = now + 60_000;
  }
}

function rand(a: number, b: number): number {
  return a + Math.random() * (b - a);
}
