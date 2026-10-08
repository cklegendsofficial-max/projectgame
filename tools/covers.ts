import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { newGame } from "../src/state";

const URL = process.env.URL ?? "http://localhost:5173/";
const OUT = "release/covers";
mkdirSync(OUT, { recursive: true });

const s = newGame();
s.gold = 4.2e9;
s.runEarned = 6e9;
s.lifetimeEarned = 6e9;
[200, 150, 120, 100, 75, 50, 25, 10].forEach((n, i) => (s.routes[i].owned = n));
s.masters = s.masters.map(() => true);
s.tutorial = 99;
s.settings.lang = "en";
s.lastSave = Date.now();
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

type Layout = { name: string; w: number; h: number; map: [number, number, number, number]; titleTop: number; titleSize: number };
const layouts: Layout[] = [
  { name: "cover-1920x1080", w: 1920, h: 1080, map: [0, 0, 1920, 1080], titleTop: 60, titleSize: 150 },
  { name: "cover-800x1200", w: 800, h: 1200, map: [-60, 400, 920, 800], titleTop: 70, titleSize: 104 },
  { name: "cover-800x800", w: 800, h: 800, map: [-40, 250, 880, 560], titleTop: 40, titleSize: 92 },
];

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const L of layouts) {
  const page = await browser.newPage({ viewport: { width: L.w, height: L.h }, deviceScaleFactor: 1 });
  await page.addInitScript((data) => {
    localStorage.setItem("caravan_tycoon_save_v1", data);
    window.addEventListener("beforeunload", (e) => e.stopImmediatePropagation(), true);
    for (const fn of ["fillText", "strokeText"] as const) {
      const orig = CanvasRenderingContext2D.prototype[fn];
      CanvasRenderingContext2D.prototype[fn] = function (this: CanvasRenderingContext2D, text: string, ...rest: [number, number, number?]) {
        if (text.startsWith("+")) return;
        orig.call(this, text, ...rest);
      };
    }
  }, save);
  await page.goto(URL);
  await page.waitForTimeout(1500);
  await page.evaluate((L) => {
    document.querySelectorAll<HTMLElement>("#modal, #topbar, #panel, #hint, #toasts, #buffs").forEach((e) => (e.style.display = "none"));
    const wrap = document.getElementById("mapWrap")!;
    Object.assign(wrap.style, { position: "fixed", left: L.map[0] + "px", top: L.map[1] + "px", width: L.map[2] + "px", height: L.map[3] + "px", flex: "none" });
    document.body.style.background = "radial-gradient(circle at 50% 30%, #4a2e18, #1c110a)";
    window.dispatchEvent(new Event("resize"));
    const t = document.createElement("div");
    t.innerHTML = `<div style="font-size:${L.titleSize * 0.7}px;line-height:1">🐪</div>
      <div style="font:bold ${L.titleSize}px Georgia,serif;color:#ffd75e;line-height:1;text-shadow:0 6px 0 #6b3d0e,0 0 30px rgba(0,0,0,.8),0 0 4px #000;-webkit-text-stroke:3px #3a1f08;paint-order:stroke fill">Caravan Tycoon</div>
      <div style="margin-top:${L.titleSize * 0.12}px;font:bold ${L.titleSize * 0.32}px 'Trebuchet MS',sans-serif;letter-spacing:.18em;color:#fff3d6;text-shadow:0 3px 8px #000">SILK ROAD IDLE</div>`;
    Object.assign(t.style, { position: "fixed", left: "0", right: "0", top: L.titleTop + "px", textAlign: "center", zIndex: "50", pointerEvents: "none" });
    document.body.appendChild(t);
  }, L);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${L.name}.png` });
  await page.close();
}
await browser.close();
console.log("done");
