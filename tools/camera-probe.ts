import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const s = newGame();
s.gold = 2e7;
s.runEarned = 5e7;
s.lifetimeEarned = 5e7;
[120, 80, 50, 30, 12, 0, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, false, false, false, false, false, false];
s.tutorial = 99;
s.chronicle.done = 2;
s.cityLevels = { samarkand: 3, bukhara: 2, merv: 1, kashgar: 1 };
const d = new Date();
s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
s.lastSave = Date.now();
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [name, vp, mobile] of [
  ["desk", { width: 1280, height: 720 }, false],
  ["mob", { width: 390, height: 844 }, true],
] as const) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.addInitScript((data) => localStorage.setItem("caravan_tycoon_save_v1", data), save);
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `playtest/cam-${name}-1-start.png` });
  const box = (await page.locator("#map").boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 200, cy + 40, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `playtest/cam-${name}-2-drag.png` });
  await page.click(".mapctl [data-z=all]");
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `playtest/cam-${name}-3-overview.png` });
  await page.click(".mapctl [data-z=in]");
  await page.click(".mapctl [data-z=in]");
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    const g = (window as unknown as { game: { events: { list: unknown[] } } }).game;
    g.events.list.push({ id: 999, kind: "bandit", route: 0, t: 0.5, born: Date.now(), life: 20000 });
    g.events.list.push({ id: 998, kind: "merchant", route: 4, t: 0, city: "rey", born: Date.now(), life: 20000 });
  });
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 400, cy - 100, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `playtest/cam-${name}-4-indicators.png` });
  console.log(name, "errors:", errs.length, errs.slice(0, 3));
  await page.close();
}
await browser.close();
