const KEY = "kk_settings";

export interface Settings {
  music: number;
  fx: number;
  ui: number;
  eco: boolean;
  mini: boolean;
}

const DEF: Settings = { music: 0.5, fx: 0.7, ui: 1, eco: false, mini: true };

function read(): Settings {
  try {
    return { ...DEF, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Settings>) };
  } catch {
    return { ...DEF };
  }
}

export const settings: Settings = read();

export function saveSettings(): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  else void document.documentElement.requestFullscreen?.().catch(() => {});
}

export function applyUi(): void {
  document.documentElement.style.setProperty("--ui", String(settings.ui));
  document.body.classList.toggle("nomini", !settings.mini);
}
