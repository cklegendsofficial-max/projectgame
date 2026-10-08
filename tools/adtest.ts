import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, locale: "tr-TR" });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.on("console", (m) => { if (/ad|Ad/.test(m.text())) console.log("console:", m.text().replace(/%c|background-color[^;]*;|border-radius[^;]*;|padding[^;]*;|color:[^;]*;?/g, "").slice(0, 160)); });
await page.goto("http://localhost:5173/");
await page.waitForTimeout(2500);
await page.locator("#favorBtn").click();
await page.waitForTimeout(500);
await page.screenshot({ path: "playtest/ad-1-modal.png" });
await page.locator("#modal button.primary").click();
await page.waitForTimeout(2500);
await page.screenshot({ path: "playtest/ad-2-playing.png" });
for (let i = 0; i < 30; i++) {
  await page.waitForTimeout(1000);
  if (await page.locator("#adBlocker.hidden").count()) break;
}
await page.waitForTimeout(800);
await page.screenshot({ path: "playtest/ad-3-after.png" });
console.log("buffs:", await page.locator("#buffs").innerText());
await browser.close();
