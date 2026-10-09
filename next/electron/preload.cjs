const { contextBridge } = require("electron");

const APP_ID = Number(process.env.KK_STEAM_APPID || 480);
let client = null;
try {
  client = require("steamworks.js").init(APP_ID);
} catch {
  client = null;
}

contextBridge.exposeInMainWorld("kkSteam", {
  available: !!client,
  unlock(id) {
    if (!client) return false;
    try {
      return client.achievement.activate(String(id).toUpperCase());
    } catch {
      return false;
    }
  },
});
