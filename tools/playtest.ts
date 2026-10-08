import { chromium, type Page } from "playwright-core";
import { mkdirSync } from "node:fs";

const URL = process.env.URL ?? "http://localhost:5173/";
const OUT = "playtest";
mkdirSync(OUT, { recursive: true });

async function run(name: string, viewport: { width: number; height: number }, locale: string, mobile: boolean): Promise<void> {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const ctx = await browser.newContext({ viewport, locale, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

  await page.goto(URL);
  await page.waitForTimeout(2500);
  await shot(page, name, "01-start");

  for (let i = 0; i < 6; i++) {
    await page.locator(".route .send").first().click();
    await page.waitForTimeout(1700);
  }
  await shot(page, name, "02-after-sends");

  for (let i = 0; i < 4; i++) {
    await page.locator(".route .buy").first().click().catch(() => {});
    await page.locator(".route .send").first().click().catch(() => {});
    await page.waitForTimeout(1600);
  }
  await shot(page, name, "03-bought");

  await page.evaluate(() => {
    const raw = localStorage.getItem("caravan_tycoon_save_v1");
    if (!raw) return;
    const s = JSON.parse(decodeURIComponent(escape(atob(raw))));
    s.gold = 5e6;
    localStorage.setItem("caravan_tycoon_save_v1", btoa(unescape(encodeURIComponent(JSON.stringify(s)))));
  });
  await page.reload();
  await page.waitForTimeout(2500);
  await shot(page, name, "04-reload-rich");
  const modal = page.locator("#modal button").first();
  if (await modal.isVisible().catch(() => false)) await modal.click();

  for (const tab of ["masters", "upgrades", "dynasty", "stats", "routes"]) {
    await page.locator(`.tab[data-tab="${tab}"]`).click();
    await page.waitForTimeout(500);
    await shot(page, name, `05-tab-${tab}`);
  }

  await page.waitForTimeout(40000);
  await shot(page, name, "06-event");
  await page.locator("#settingsBtn").click();
  await page.waitForTimeout(400);
  await shot(page, name, "07-settings");

  console.log(`== ${name}: ${errors.length} console issues`);
  for (const e of errors) console.log("  " + e);
  await browser.close();
}

async function shot(page: Page, name: string, step: string): Promise<void> {
  await page.screenshot({ path: `${OUT}/${name}-${step}.png` });
}

await run("desktop", { width: 1366, height: 768 }, "tr-TR", false);
await run("mobile", { width: 390, height: 844 }, "en-US", true);
