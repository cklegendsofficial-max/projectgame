import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const s = newGame();
[60, 30, 25, 10, 5, 3, 2, 1].forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, true, true, false, false, false, false];
s.tutorial = 99;
s.chronicle.done = 1;
s.lastSave = Date.now();
s.gold = 5e7;
s.cityLevels = { samarkand: 3, bukhara: 2, merv: 1, kashgar: 1 };
s.cityBuild = { id: "nishapur", level: 1, until: Date.now() + 20_000 };
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [name, vp] of [["desk", { width: 1366, height: 768 }], ["mob", { width: 390, height: 844 }]] as const) {
  const page = await browser.newPage({ viewport: vp, locale: "tr-TR", deviceScaleFactor: name === "mob" ? 2 : 1 });
  page.on("pageerror", (e) => console.log("pageerror:", e.message));
  await page.addInitScript((data) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("caravan_tycoon_save_v1", data);
      sessionStorage.setItem("seeded", "1");
    }
  }, save);
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2500);
  const m = page.locator("#modal button").first();
  if (await m.isVisible().catch(() => false)) await m.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `playtest/c-${name}-1-map.png` });
  if (name === "desk") await page.screenshot({ path: "playtest/c-zoom.png", clip: { x: 520, y: 200, width: 380, height: 380 } });

  const pos = await page.evaluate(() => {
    const c = document.getElementById("map")!.getBoundingClientRect();
    return { x: c.left, y: c.top, w: c.width, h: c.height };
  });
  const padX = pos.w * 0.04, padY = pos.h * 0.08;
  await page.mouse.click(pos.x + padX + 0.93 * (pos.w - padX * 2), pos.y + padY + 0.2 * (pos.h - padY * 2) - 6);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `playtest/c-${name}-2-rey.png` });
  await page.locator("#modal button").first().click();
  await page.waitForTimeout(500);
  await page.click("[data-tab=upgrades]");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `playtest/c-${name}-3-tab.png` });
  await page.close();
}
await browser.close();
