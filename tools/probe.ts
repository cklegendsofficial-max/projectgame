import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const s = newGame();
s.gold = 3e6;
s.runEarned = 5e7;
s.lifetimeEarned = 5e7;
const owned = [60, 30, 20, 8, 1, 0, 0, 0];
owned.forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, true, false, false, false, false, false];
s.tutorial = 99;
s.lastSave = Date.now();
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [name, vp] of [["mid-desktop", { width: 1366, height: 768 }], ["mid-mobile", { width: 390, height: 844 }]] as const) {
  const page = await browser.newPage({ viewport: vp, locale: "tr-TR", deviceScaleFactor: name.includes("mobile") ? 2 : 1 });
  page.on("pageerror", (e) => console.log("pageerror:", e.message));
  await page.addInitScript((data) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("caravan_tycoon_save_v1", data);
      sessionStorage.setItem("seeded", "1");
    }
  }, save);
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `playtest/${name}-1.png` });
  await page.locator(".tab[data-tab='dynasty']").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/${name}-2.png` });
  await page.close();
}
await browser.close();
