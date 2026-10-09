const { contextBridge, ipcRenderer } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const MODS = (process.argv.find((a) => a.startsWith("--kk-mods=")) || "").slice("--kk-mods=".length);

contextBridge.exposeInMainWorld("kkMods", {
  dir: MODS,
  list() {
    if (!MODS) return [];
    try {
      return fs
        .readdirSync(MODS)
        .filter((f) => f.toLowerCase().endsWith(".json"))
        .map((f) => ({ file: f, text: fs.statSync(path.join(MODS, f)).size <= 512 * 1024 ? fs.readFileSync(path.join(MODS, f), "utf8") : "{}" }));
    } catch {
      return [];
    }
  },
  open: () => ipcRenderer.invoke("kk-open-mods"),
});

const APP_ID = Number(process.env.KK_STEAM_APPID || 480);
let client = null;
try {
  client = require("steamworks.js").init(APP_ID);
} catch {
  client = null;
}

const safe = (fn, fallback) => {
  if (!client) return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
};

contextBridge.exposeInMainWorld("kkSteam", {
  available: !!client,
  deck: process.env.SteamDeck === "1" || safe(() => client.utils.isSteamRunningOnSteamDeck(), false),
  name: () => safe(() => client.localplayer.getName(), ""),
  unlock: (id) => safe(() => client.achievement.activate(String(id).toUpperCase()), false),
  setStat: (name, value) => safe(() => client.stats.setInt(String(name), Math.floor(Number(value) || 0)) && client.stats.store(), false),
  cloudOn: () => safe(() => client.cloud.isEnabledForAccount() && client.cloud.isEnabledForApp(), false),
  cloudRead: (name) => safe(() => (client.cloud.fileExists(String(name)) ? client.cloud.readFile(String(name)) : null), null),
  cloudWrite: (name, text) => safe(() => client.cloud.writeFile(String(name), String(text)), false),
  presence: (key, value) => safe(() => (client.localplayer.setRichPresence(String(key), value == null ? null : String(value)), true), false),
  overlay: (url) => safe(() => (client.overlay.activateToWebPage(String(url)), true), false),
});
