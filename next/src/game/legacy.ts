export interface LegacyRun {
  name: string;
  ending: string;
  day: number;
  lv: number;
  at: number;
}

export interface Legacy {
  endings: string[];
  runs: LegacyRun[];
}

export const LEGACY_PERKS: Record<string, { name: string; desc: string }> = {
  kagan: { name: "Kağan Soyu", desc: "Müttefik ve tabi bey desteği +%5" },
  hurriyet: { name: "Zincirsiz Yürek", desc: "En yüksek can +%10" },
  ozan: { name: "Ozanın Kopuzu", desc: "Kazanılan tecrübe +%15" },
  tengri: { name: "Gök Mührü", desc: "Ordu gücü +%6" },
  noyan: { name: "Tümen Disiplini", desc: "Yürüyüş hızı +%6" },
};

const KEY = "kk_legacy";
let cache: Legacy | null = null;

export function legacy(): Legacy {
  if (cache) return cache;
  try {
    const r = JSON.parse(localStorage.getItem(KEY) ?? "null") as Legacy | null;
    cache = { endings: r?.endings ?? [], runs: r?.runs ?? [] };
  } catch {
    cache = { endings: [], runs: [] };
  }
  return cache;
}

export function hasLegacy(id: string): boolean {
  return legacy().endings.includes(id);
}

export function recordEnding(run: LegacyRun): boolean {
  const l = legacy();
  const fresh = !l.endings.includes(run.ending);
  if (fresh) l.endings.push(run.ending);
  l.runs = [run, ...l.runs].slice(0, 10);
  try {
    localStorage.setItem(KEY, JSON.stringify(l));
  } catch {
    /* storage full or blocked */
  }
  return fresh;
}
