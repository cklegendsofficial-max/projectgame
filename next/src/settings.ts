const KEY = "kk_settings";

export interface Settings {
  music: number;
  fx: number;
  ui: number;
  eco: boolean;
  mini: boolean;
  haptic: boolean;
  lang: "tr" | "en";
  speed: 1 | 2 | 3;
  narrate: boolean;
  dynMusic: boolean;
  cine: boolean;
  duel: boolean;
}

const DEF: Settings = { music: 0.5, fx: 0.7, ui: 1, eco: false, mini: true, haptic: true, lang: "tr", speed: 1, narrate: false, dynMusic: true, cine: true, duel: !navigator.webdriver };

export function weakDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const touch = matchMedia("(pointer: coarse)").matches;
  return touch && ((nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4);
}

function read(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEF, eco: weakDevice() };
    return { ...DEF, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return { ...DEF };
  }
}

export const settings: Settings = read();

export function saveSettings(): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function haptic(ms: number | number[]): void {
  if (settings.haptic) navigator.vibrate?.(ms);
}

export function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  else void document.documentElement.requestFullscreen?.().catch(() => {});
}

export function applyUi(): void {
  document.documentElement.style.setProperty("--ui", String(settings.ui));
  document.body.classList.toggle("nomini", !settings.mini);
}
