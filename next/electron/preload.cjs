const { contextBridge } = require("electron");

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
