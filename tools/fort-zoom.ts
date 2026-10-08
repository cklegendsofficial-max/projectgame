import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const s = newGame();
s.gold = 1e15;
s.lifetimeEarned = 1e15;
s.routes.forEach((r) => (r.owned = 50));
s.masters = s.routes.map(() => true);
s.tutorial = 99;
s.stats.fallen = 500;
s.hero = { name: "Alp", look: 1, level: 5, xp: 0, gear: {} };
s.mount = { breed: 5, plus: 0 };
s.fortsTaken = ["kizilkum"];
s.siege = { fort: "kopet", troops: 50, hero: true, walls: 2, wave: 3, next: Date.now() + 1e9, log: [1, 0, 1] };
s.soldiers = 100;
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
s.rivalsBeaten = [];
await page.evaluate(() => {
  const g = (window as unknown as { game: { s: { rivalsBeaten: string[] } } }).game;
  g.s.rivalsBeaten = ["sogd", "genoa", "ortoq"];
});
await page.waitForTimeout(300);
if (await page.locator("#modal button.primary").count()) await page.locator("#modal button.primary").first().click();
for (const c of ["merv", "rey", "konya", "samarkand"]) {
  await page.evaluate((c) => (window as unknown as { game: { map: { flyToCity(id: string): void } } }).game.map.flyToCity(c), c);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `playtest/fort-${c}.png` });
}
console.log("errors:", errs);
await browser.close();
