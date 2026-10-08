import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const SEASON_MS = 240_000;
const s = newGame();
[60, 30, 25, 10, 5, 3, 2, 1].forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, true, true, false, false, false, false];
s.tutorial = 99;
s.chronicle.done = 1;
s.lastSave = Date.now();
s.cityLevels = { samarkand: 3, bukhara: 2, merv: 1, kashgar: 1, nishapur: 1 };
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [name, vp] of [["desk", { width: 1366, height: 768 }], ["mob", { width: 390, height: 844 }]] as const) {
  const page = await browser.newPage({ viewport: vp, locale: "tr-TR", deviceScaleFactor: name === "mob" ? 2 : 1 });
  page.on("pageerror", (e) => console.log("pageerror:", e.message));
  await page.addInitScript((data) => {
    const w = window as unknown as { __off: number };
    w.__off = 0;
    const real = Date.now.bind(Date);
    Date.now = () => real() + w.__off;
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("caravan_tycoon_save_v1", data);
      sessionStorage.setItem("seeded", "1");
    }
  }, save);
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2000);
  const m = page.locator("#modal button").first();
  if (await m.isVisible().catch(() => false)) await m.click();
  for (let k = 0; k < 4; k++) {
    await page.evaluate(([k, S]) => {
      const w = window as unknown as { __off: number };
      const real = Date.now() - w.__off;
      const base = Math.floor(real / S / 4) * S * 4;
      w.__off = base + k * S + S / 2 - real + (k === 0 ? 0 : 4 * S);
    }, [k, SEASON_MS]);
    await page.waitForTimeout(name === "desk" ? 3500 : 2500);
    await page.screenshot({ path: `playtest/w-${name}-season${k}.png` });
    if (name === "mob") break;
  }
  await page.evaluate(() => {
    (window as unknown as { __off: number }).__off += 130_000;
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `playtest/w-${name}-order.png` });
  await page.close();
}
await browser.close();
