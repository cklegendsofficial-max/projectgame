import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/i18n-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1, hasTouch: mode === "mob" });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 10; k++) {
    if (!(await page.locator(".battle .bbox.story .btn").count())) break;
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
console.log("tr class title:", await page.locator(".cbox h2").first().innerText());
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.hud.openHero(); g.hud.tab = "ayar"; g.hud.render();`);
await page.waitForTimeout(300);
await Promise.all([page.waitForEvent("load"), page.locator(".panel .setrow .btn", { hasText: "English" }).click()]);
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
await page.waitForTimeout(800);
await dismiss();
console.log("html lang:", await page.evaluate(() => document.documentElement.lang));
console.log("nav:", await page.locator(".nav button span, [data-b] span").allInnerTexts());
await ev(`g.hud.openHero(); g.hud.tab = "ayar"; g.hud.render();`);
await page.waitForTimeout(300);
console.log("tabs:", await page.locator(".panel .tabs button, .panel [data-tab]").allInnerTexts());
console.log("h3:", await page.locator(".panel h3").allInnerTexts());
await page.screenshot({ path: `${out}-1.png` });
await page.evaluate(() => localStorage.removeItem("kk_settings"));
console.log("errors:", errs);
await browser.close();
