/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    CrazyGames?: any;
  }
}

const SDK_URL = "https://sdk.crazygames.com/crazygames-sdk-v3.js";

let sdk: any = null;
let env: "local" | "crazygames" | "disabled" = "disabled";

function loadScript(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const el = document.createElement("script");
    el.src = url;
    el.async = true;
    const timer = window.setTimeout(() => resolve(false), timeoutMs);
    el.onload = () => {
      window.clearTimeout(timer);
      resolve(true);
    };
    el.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    document.head.appendChild(el);
  });
}

function shouldLoad(): boolean {
  const h = location.hostname;
  if (h === "localhost" || h === "127.0.0.1") return true;
  if (h.endsWith("crazygames.com") || h.endsWith("crazygames.io")) return true;
  try {
    const ref = document.referrer ? new URL(document.referrer).hostname : "";
    return ref.includes("crazygames");
  } catch {
    return false;
  }
}

export async function initSdk(): Promise<void> {
  if (!shouldLoad()) return;
  const ok = await loadScript(SDK_URL, 4000);
  if (!ok || !window.CrazyGames?.SDK) return;
  try {
    await window.CrazyGames.SDK.init();
    sdk = window.CrazyGames.SDK;
    env = sdk.environment;
  } catch {
    sdk = null;
    env = "disabled";
  }
}

export function sdkActive(): boolean {
  return !!sdk && env !== "disabled";
}

export function adsAvailable(): boolean {
  return sdkActive();
}

export function loadingStart(): void {
  if (sdkActive()) try { sdk.game.loadingStart(); } catch { /* ignore */ }
}

export function loadingStop(): void {
  if (sdkActive()) try { sdk.game.loadingStop(); } catch { /* ignore */ }
}

export function gameplayStart(): void {
  if (sdkActive()) try { sdk.game.gameplayStart(); } catch { /* ignore */ }
}

export function gameplayStop(): void {
  if (sdkActive()) try { sdk.game.gameplayStop(); } catch { /* ignore */ }
}

export function happytime(): void {
  if (sdkActive()) try { sdk.game.happytime(); } catch { /* ignore */ }
}

export function requestRewarded(onStart: () => void): Promise<boolean> {
  return new Promise((resolve) => {
    if (!sdkActive()) return resolve(false);
    try {
      sdk.ad.requestAd("rewarded", {
        adStarted: () => onStart(),
        adFinished: () => resolve(true),
        adError: () => resolve(false),
      });
    } catch {
      resolve(false);
    }
  });
}

export function cloudGet(key: string): string | null {
  if (!sdkActive() || env !== "crazygames") return null;
  try {
    return sdk.data.getItem(key);
  } catch {
    return null;
  }
}

export function cloudSet(key: string, value: string): void {
  if (!sdkActive() || env !== "crazygames") return;
  try {
    sdk.data.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function cloudRemove(key: string): void {
  if (!sdkActive() || env !== "crazygames") return;
  try {
    sdk.data.removeItem(key);
  } catch {
    /* ignore */
  }
}
