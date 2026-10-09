import { saveSettings, settings } from "./settings";

export interface SteamBridge {
  available: boolean;
  deck: boolean;
  name(): string;
  unlock(id: string): boolean;
  setStat(name: string, value: number): boolean;
  cloudOn(): boolean;
  cloudRead(name: string): string | null;
  cloudWrite(name: string, text: string): boolean;
  presence(key: string, value: string | null): boolean;
  overlay(url: string): boolean;
}

const bridge = (window as unknown as { kkSteam?: SteamBridge }).kkSteam;
export const steam: SteamBridge | null = bridge?.available ? bridge : null;
export const onDeck = !!bridge?.deck || /Steam ?Deck/i.test(navigator.userAgent);

const CLOUD_FILE = "kk_cloud.json";
const SAVE_PREFIX = "kervan_krallik_v3";
const LOCAL_ONLY = new Set(["kk_settings"]);
const PUSH_GAP = 60_000;

interface CloudPack {
  at: number;
  data: Record<string, string>;
}

const isSave = (k: string) => k.startsWith(SAVE_PREFIX);
const ours = (k: string) => (isSave(k) || k.startsWith("kk_")) && !LOCAL_ONLY.has(k);
const savedAt = (text: string | null): number => {
  try {
    return text ? Number((JSON.parse(text) as { savedAt?: number }).savedAt ?? 0) : 0;
  } catch {
    return 0;
  }
};

function localPack(): CloudPack {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (ours(k)) data[k] = localStorage.getItem(k) ?? "";
  }
  return { at: Date.now(), data };
}

export function cloudReady(): boolean {
  return !!steam && steam.cloudOn();
}

/** Buluttaki kayıtları yerel kayıtlarla birleştirir; daha yeni olan kazanır. Geri yüklenen anahtar sayısını döner. */
export function cloudPull(): number {
  if (!cloudReady()) return 0;
  let pack: CloudPack;
  try {
    pack = JSON.parse(steam!.cloudRead(CLOUD_FILE) ?? "null") as CloudPack;
  } catch {
    return 0;
  }
  if (!pack?.data) return 0;
  let n = 0;
  for (const [k, remote] of Object.entries(pack.data)) {
    if (!ours(k)) continue;
    const local = localStorage.getItem(k);
    if (local === remote) continue;
    let next: string | null = null;
    if (local == null) next = remote;
    else if (isSave(k)) next = savedAt(remote) > savedAt(local) ? remote : null;
    else if (k === "kk_ach") {
      try {
        const u = new Set([...(JSON.parse(local) as string[]), ...(JSON.parse(remote) as string[])]);
        next = JSON.stringify([...u]);
      } catch {
        next = null;
      }
    }
    if (next != null && next !== local) {
      localStorage.setItem(k, next);
      n++;
    }
  }
  return n;
}

let lastPush = 0;

export function cloudPush(force = false): boolean {
  if (!cloudReady()) return false;
  const now = Date.now();
  if (!force && now - lastPush < PUSH_GAP) return false;
  lastPush = now;
  return steam!.cloudWrite(CLOUD_FILE, JSON.stringify(localPack()));
}

/** Steam Deck'te ilk açılışta arayüzü 7" ekrana göre büyütür. */
export function deckDefaults(): void {
  document.body.classList.toggle("deck", onDeck);
  if (!onDeck || localStorage.getItem("kk_settings")) return;
  settings.ui = 1.15;
  settings.speed = 1;
  saveSettings();
}

export function syncAchievements(ids: Iterable<string>): void {
  if (!steam) return;
  for (const id of ids) steam.unlock(id);
}

export function steamStats(stats: Record<string, number>): void {
  if (!steam) return;
  for (const [k, v] of Object.entries(stats)) steam.setStat(k, v);
}

export function steamPresence(text: string): void {
  steam?.presence("status", text);
}
