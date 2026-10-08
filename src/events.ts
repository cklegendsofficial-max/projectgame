import { ROUTES } from "./data";
import type { GameState } from "./state";

export type EventKind = "bandit" | "merchant";

export interface MapEvent {
  id: number;
  kind: EventKind;
  route: number;
  t: number;
  city?: string;
  born: number;
  life: number;
}

let nextId = 1;

function rand(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

export class EventManager {
  list: MapEvent[] = [];
  private nextBandit: number;
  private nextMerchant: number;

  constructor(now: number) {
    this.nextBandit = now + 35_000;
    this.nextMerchant = now + 110_000;
  }

  update(s: GameState, now: number, onExpire: (e: MapEvent) => void): MapEvent | null {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const e = this.list[i];
      if (now - e.born > e.life) {
        this.list.splice(i, 1);
        onExpire(e);
      }
    }
    if (document.hidden) {
      this.nextBandit = Math.max(this.nextBandit, now + 10_000);
      this.nextMerchant = Math.max(this.nextMerchant, now + 20_000);
      return null;
    }
    const owned = ROUTES.map((_, i) => i).filter((i) => s.routes[i].owned > 0);
    if (owned.length === 0) return null;
    let spawned: MapEvent | null = null;
    if (now >= this.nextBandit && !this.list.some((e) => e.kind === "bandit")) {
      const route = owned[Math.floor(Math.random() * owned.length)];
      spawned = { id: nextId++, kind: "bandit", route, t: rand(0.3, 0.7), born: now, life: 12_000 };
      this.list.push(spawned);
      this.nextBandit = now + rand(45_000, 90_000);
    } else if (now >= this.nextMerchant && !this.list.some((e) => e.kind === "merchant")) {
      const route = owned[Math.floor(Math.random() * owned.length)];
      const def = ROUTES[route];
      const city = Math.random() < 0.5 ? def.from : def.to;
      spawned = { id: nextId++, kind: "merchant", route, t: 0, city, born: now, life: 14_000 };
      this.list.push(spawned);
      this.nextMerchant = now + rand(150_000, 280_000);
    }
    return spawned;
  }

  remove(id: number): MapEvent | null {
    const i = this.list.findIndex((e) => e.id === id);
    if (i < 0) return null;
    return this.list.splice(i, 1)[0];
  }

  clear(): void {
    this.list = [];
  }
}
