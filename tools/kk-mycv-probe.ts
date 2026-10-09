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
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await page.waitForTimeout(1200);
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await page.waitForTimeout(400);
await dismiss();
await ev(`g.s.res.gold = 5000; g.hud.openHero(); g.hud.tab = "kervan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel .btn", { hasText: "Kervan kur" }).click();
await page.waitForTimeout(300);
console.log("cv:", JSON.stringify(await ev(`const c = g.s.mycv[0]; return { from: c.from, to: c.to, go: c.go, back: c.back, days: g.myCvDays(c) };`)));
await page.locator(`.panel select[data-cv="1:to"]`).selectOption("bukhara");
await page.waitForTimeout(200);
console.log("after route:", JSON.stringify(await ev(`const c = g.s.mycv[0]; return { to: c.to, status: c.status, cargo: c.cargo, gold: g.s.res.gold };`)));
await page.locator(".panel .btn", { hasText: "Muhafız +1" }).click();
await page.waitForTimeout(200);
const gold0 = await ev<number>(`return g.s.res.gold;`);
// zamanı hızlandır: 6 gün
await ev(`for (let i = 0; i < 6 * 150 * 10; i++) { g.myCvTick(0.1); if (i % 1500 === 0) g.s.markets = {}; }`);
console.log("after 6 days:", JSON.stringify(await ev(`const c = g.s.mycv[0]; return { trips: c.trips, profit: c.profit, log: c.log, guards: c.guards };`)), "gold", gold0, "->", await ev(`return Math.round(g.s.res.gold);`));
await ev(`g.hud.render();`);
await page.waitForTimeout(300);
await page.screenshot({ path: `playtest/mycv-${mode}.png` });
console.log("errors:", errs);
await browser.close();
