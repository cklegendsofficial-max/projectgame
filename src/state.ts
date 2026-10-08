import { ROUTES } from "./data";

export type Lang = "en" | "tr";
export type Notation = "suffix" | "sci";

export interface RouteState {
  owned: number;
  progress: number;
  running: boolean;
  trips: number;
}

export interface GameState {
  version: 1;
  gold: number;
  runEarned: number;
  lifetimeEarned: number;
  seals: number;
  routes: RouteState[];
  masters: boolean[];
  upgrades: string[];
  favorUntil: number;
  lastAdAt: number;
  boostUntil: number;
  boostMult: number;
  tutorial: number;
  stats: {
    clicks: number;
    bandits: number;
    merchants: number;
    dynasties: number;
    playSeconds: number;
    bestRun: number;
  };
  settings: {
    lang: Lang;
    notation: Notation;
    muted: boolean;
  };
  created: number;
  lastSave: number;
}

function detectLang(): Lang {
  const l = (navigator.language || "en").toLowerCase();
  return l.startsWith("tr") ? "tr" : "en";
}

export function freshRoutes(): RouteState[] {
  return ROUTES.map((_, i) => ({ owned: i === 0 ? 1 : 0, progress: 0, running: false, trips: 0 }));
}

export function newGame(): GameState {
  const now = Date.now();
  return {
    version: 1,
    gold: 0,
    runEarned: 0,
    lifetimeEarned: 0,
    seals: 0,
    routes: freshRoutes(),
    masters: ROUTES.map(() => false),
    upgrades: [],
    favorUntil: 0,
    lastAdAt: 0,
    boostUntil: 0,
    boostMult: 1,
    tutorial: 0,
    stats: { clicks: 0, bandits: 0, merchants: 0, dynasties: 0, playSeconds: 0, bestRun: 0 },
    settings: { lang: detectLang(), notation: "suffix", muted: false },
    created: now,
    lastSave: now,
  };
}

export function resetForDynasty(s: GameState, newSeals: number): void {
  s.stats.bestRun = Math.max(s.stats.bestRun, s.runEarned);
  s.seals += newSeals;
  s.gold = 0;
  s.runEarned = 0;
  s.routes = freshRoutes();
  s.masters = ROUTES.map(() => false);
  s.upgrades = [];
  s.boostUntil = 0;
  s.boostMult = 1;
  s.stats.dynasties += 1;
}

function num(v: unknown, d: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : d;
}

export function sanitize(raw: unknown): GameState {
  const base = newGame();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<GameState>;
  const s: GameState = {
    ...base,
    gold: Math.max(0, num(r.gold, 0)),
    runEarned: Math.max(0, num(r.runEarned, 0)),
    lifetimeEarned: Math.max(0, num(r.lifetimeEarned, 0)),
    seals: Math.max(0, Math.floor(num(r.seals, 0))),
    favorUntil: num(r.favorUntil, 0),
    lastAdAt: num(r.lastAdAt, 0),
    boostUntil: num(r.boostUntil, 0),
    boostMult: Math.max(1, num(r.boostMult, 1)),
    tutorial: Math.max(0, Math.floor(num(r.tutorial, 0))),
    created: num(r.created, base.created),
    lastSave: num(r.lastSave, base.lastSave),
    upgrades: Array.isArray(r.upgrades) ? r.upgrades.filter((u): u is string => typeof u === "string") : [],
    stats: { ...base.stats, ...(r.stats ?? {}) },
    settings: { ...base.settings, ...(r.settings ?? {}) },
  };
  s.routes = ROUTES.map((_, i) => {
    const rr = Array.isArray(r.routes) ? r.routes[i] : undefined;
    const def = base.routes[i];
    if (!rr) return def;
    return {
      owned: Math.max(0, Math.floor(num(rr.owned, def.owned))),
      progress: Math.min(1, Math.max(0, num(rr.progress, 0))),
      running: !!rr.running,
      trips: Math.max(0, Math.floor(num(rr.trips, 0))),
    };
  });
  if (s.routes[0].owned < 1) s.routes[0].owned = 1;
  s.masters = ROUTES.map((_, i) => (Array.isArray(r.masters) ? !!r.masters[i] : false));
  if (s.settings.lang !== "en" && s.settings.lang !== "tr") s.settings.lang = base.settings.lang;
  if (s.settings.notation !== "suffix" && s.settings.notation !== "sci") s.settings.notation = "suffix";
  return s;
}
