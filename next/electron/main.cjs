const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

try {
  require("steamworks.js").electronEnableSteamOverlay();
} catch {
  /* steamworks.js missing: play without Steam */
}

app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-gpu-rasterization");

function modsDir() {
  const dir = path.join(app.getPath("userData"), "mods");
  try {
    fs.mkdirSync(dir, { recursive: true });
    const sample = path.join(__dirname, "ornek-mod.json");
    const dst = path.join(dir, "ornek-mod.json.txt");
    if (fs.existsSync(sample) && !fs.existsSync(dst)) fs.copyFileSync(sample, dst);
  } catch {
    /* read-only profile */
  }
  return dir;
}

ipcMain.handle("kk-open-mods", () => shell.openPath(modsDir()));

function create() {
  const mods = modsDir();
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#1c120a",
    title: "Kervan Krallık",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: false,
      backgroundThrottling: false,
      additionalArguments: [`--kk-mods=${mods}`],
    },
  });
  Menu.setApplicationMenu(null);
  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("before-input-event", (_e, input) => {
    if (input.type === "keyDown" && input.key === "F11") win.setFullScreen(!win.isFullScreen());
  });
  const dev = process.env.KK_DEV_URL;
  if (dev) void win.loadURL(dev);
  else void win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  if (process.env.KK_SMOKE) {
    win.webContents.once("did-finish-load", () => {
      setTimeout(async () => {
        const ok = await win.webContents.executeJavaScript("!!window.game && !document.getElementById('loading')");
        console.log("KK_MODS", fs.existsSync(mods) ? fs.readdirSync(mods).join(",") : "missing");
        console.log("KK_SMOKE", ok ? "OK" : "FAIL");
        app.exit(ok ? 0 : 1);
      }, 6000);
    });
  }
}

app.whenReady().then(create);
app.on("window-all-closed", () => app.quit());
