import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const s = newGame();
s.gold = 1e9;
s.lifetimeEarned = 1e9;
[150, 100, 60, 40, 25, 10, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, true, true, true, true, false, false];
s.tutorial = 99;
s.age = 3;
s.wonders = { registan: 3, sanjar: 2, hagia: 0 };
s.rivalsBeaten = ["sogd", "genoa"];
const d = new Date();
s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
s.lastSave = Date.now();
const data = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.addInitScript((v) => localStorage.setItem("caravan_tycoon_save_v1", v), data);
await page.goto("http://localhost:5173/");
await page.waitForTimeout(2500);
for (const city of ["samarkand", "merv", "constantinople"]) {
  await page.evaluate((c) => (window as unknown as { game: { map: { flyToCity(id: string): void } } }).game.map.flyToCity(c), city);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `playtest/wz-${city}.png` });
}
console.log("errors:", errs);
await browser.close();
