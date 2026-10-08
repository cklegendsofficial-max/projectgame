import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const s = newGame();
[60, 30, 25, 10, 5, 3, 2, 1].forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, true, true, false, false, false, false];
s.tutorial = 99;
s.lastSave = Date.now();
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [name, vp] of [["map-desktop", { width: 1366, height: 768 }], ["map-mobile", { width: 390, height: 844 }]] as const) {
  const page = await browser.newPage({ viewport: vp, locale: "tr-TR", deviceScaleFactor: name.includes("mobile") ? 2 : 1 });
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
  if (await m.isVisible().catch(() => false)) {
    if (name === "map-desktop") await page.screenshot({ path: "playtest/modal.png" });
    await m.click();
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: `playtest/${name}.png` });
  if (name === "map-desktop") {
    await page.screenshot({ path: "playtest/map-zoom.png", clip: { x: 500, y: 220, width: 300, height: 200 } });
    for (const tab of ["upgrades", "masters", "dynasty"]) {
      await page.click(`[data-tab=${tab}]`);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `playtest/tab-${tab}.png`, clip: { x: 900, y: 40, width: 466, height: 728 } });
    }
  }
  await page.close();
}
await browser.close();
