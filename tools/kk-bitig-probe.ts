import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
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
  for (let k = 0; k < 8 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
await page.locator(`.ccard[data-c="kam"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await page.waitForTimeout(2500);
console.log("start pages:", await ev(`return g.s.bitig;`));
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom(); g.s.c.profit = 10; g.s.c.wins = 1; g.s.beylik = true;`);
await page.waitForTimeout(2600);
await dismiss();
console.log("after:", await ev(`return g.s.bitig;`), "toasts:", await page.locator(".toasts > *").allInnerTexts());
await ev(`g.hud.openHero(); g.hud.tab = "bitig"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel .cxrow:not(.lock)").first().click();
await page.waitForTimeout(300);
console.log("open text:", (await page.locator(".panel .cxrow.open p").innerText()).slice(0, 90));
console.log("locked:", await page.locator(".panel .cxrow.lock").count(), "h3:", await page.locator(".panel h3").allInnerTexts());
await page.screenshot({ path: `playtest/bitig-${mode}.png` });
console.log("errors:", errs);
await browser.close();
