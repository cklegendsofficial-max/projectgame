import { ROUTES } from "./data";
import type { GameState } from "./state";

export interface Shock {
  route: number;
  mult: number;
  until: number;
  kind: "boom" | "bust";
  used: boolean;
  rival?: string;
}

const price: number[] = ROUTES.map(() => 1);
const trend: number[] = ROUTES.map(() => 0);
const HIST = 24;
const history: number[][] = ROUTES.map(() => []);
let histVer = 0;
let shock: Shock | null = null;
let nextDrift = 0;
let nextShock = Date.now() + 100_000;

function gauss(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
}

export function marketPrice(i: number): number {
  return price[i];
}

export function marketTrend(i: number): number {
  return trend[i];
}

export function currentShock(now: number): Shock | null {
  return shock && shock.until > now ? shock : null;
}

export function marketMult(i: number, now: number): number {
  const sh = currentShock(now);
  return price[i] * (sh && sh.route === i ? sh.mult : 1);
}

export function marketTick(s: GameState, now: number, pickRival: (route: number) => string | undefined): Shock | null {
  if (now >= nextDrift) {
    nextDrift = now + 15_000;
    for (let i = 0; i < price.length; i++) {
      const before = price[i];
      price[i] = Math.min(1.35, Math.max(0.75, price[i] + (1 - price[i]) * 0.15 + gauss() * 0.07));
      trend[i] = price[i] - before;
      history[i].push(price[i]);
      if (history[i].length > HIST) history[i].shift();
    }
    histVer++;
  }
  if (shock && shock.until <= now) shock = null;
  if (shock || now < nextShock || s.tutorial < 5 || document.hidden) return null;
  const owned = ROUTES.map((_, i) => i).filter((i) => s.routes[i].owned > 0);
  if (owned.length === 0) return null;
  const route = owned[Math.floor(Math.random() * owned.length)];
  const boom = Math.random() < 0.65;
  const rival = boom ? undefined : pickRival(route);
  shock = boom
    ? { route, mult: 2.5, until: now + 75_000, kind: "boom", used: false }
    : { route, mult: 0.5, until: now + 50_000, kind: "bust", used: false, rival };
  nextShock = now + 120_000 + Math.random() * 120_000;
  return shock;
}

export function marketHistory(i: number): readonly number[] {
  return history[i];
}

export function marketVersion(): number {
  return histVer;
}

export function marketPrices(): number[] {
  return price.slice();
}

export function restoreMarket(saved: number[]): void {
  saved.forEach((p, i) => {
    if (i < price.length) {
      price[i] = p;
      history[i] = [p];
    }
  });
  histVer++;
}

export function resetMarket(now: number): void {
  for (let i = 0; i < price.length; i++) {
    price[i] = 1;
    trend[i] = 0;
    history[i] = [];
  }
  histVer++;
  shock = null;
  nextShock = now + 100_000;
}
