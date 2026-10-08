import { cloudGet, cloudRemove, cloudSet } from "./sdk";
import { newGame, sanitize, type GameState } from "./state";

const KEY = "caravan_tycoon_save_v1";

function encode(s: GameState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(s))));
}

function decode(str: string): GameState | null {
  try {
    const json = decodeURIComponent(escape(atob(str.trim())));
    return sanitize(JSON.parse(json));
  } catch {
    return null;
  }
}

export function loadGame(): GameState {
  const candidates: GameState[] = [];
  for (const raw of [cloudGet(KEY), safeLocalGet()]) {
    if (!raw) continue;
    const s = decode(raw);
    if (s) candidates.push(s);
  }
  if (candidates.length === 0) return newGame();
  candidates.sort((a, b) => b.lifetimeEarned - a.lifetimeEarned || b.lastSave - a.lastSave);
  return candidates[0];
}

function safeLocalGet(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveGame(s: GameState): void {
  s.lastSave = Date.now();
  const data = encode(s);
  try {
    localStorage.setItem(KEY, data);
  } catch {
    /* storage full or blocked */
  }
  cloudSet(KEY, data);
}

export function exportSave(s: GameState): string {
  return encode(s);
}

export function importSave(str: string): GameState | null {
  return decode(str);
}

export function wipeSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  cloudRemove(KEY);
}
