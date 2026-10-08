import { chromium, type Page } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/world-${mode}`;
const shot = async (page: Page, name: string, wait = 400) => {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}-${name}.png` });
};
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const closeStories = async () => {
  for (let k = 0; k < 6; k++) {
    const b = page.locator(".battle .bbox.story .btn");
    if (!(await b.count())) break;
    await b.first().click();
    await page.waitForTimeout(250);
  }
};
await page.locator('.ccard[data-c="kam"]').click();
await page.locator(".cname .btn").click();
await closeStories();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom(); g.s.hero.lv = 6; g.s.hero.stats.kar = 8; g.s.hero.stats.day = 6; g.s.hero.army = {spear: 14, archer: 6, horse: 2};`);
await closeStories();
// market events
await ev(`for (let i = 0; i < 4; i++) g.newMarketEvent(g.dayOf().day);`);
await ev(`g.hud.openPlace({kind:"capital"});`);
await page.locator(".tab", { hasText: "Han" }).click();
await shot(page, "01-han-rumors", 500);
await ev(`g.takeContract("samarkand");`);
await page.locator(".tab", { hasText: "Pazar" }).click();
await shot(page, "02-market", 400);
// raid
await ev(`g.hud.close(); g.s.raidAt = 1; g.s.raid = null; g.reveal(g.s.hero.x, g.s.hero.y, 60);`);
await page.waitForTimeout(400);
const raid = await ev<{ v: number } | null>(`return g.s.raid;`);
console.log("raid", JSON.stringify(raid));
if (raid) {
  await ev(`const v = g.s.villages[g.s.raid.v]; g.reveal(v.x, v.y, 8); g.s.hero.x = v.x + 20; g.s.hero.y = v.y + 30; g.cam.flyTo(v.x, v.y, 0.85); g.hud.openPlace({kind:"village", i: g.s.raid.v});`);
  await shot(page, "03-raid", 1000);
  await page.locator(".panel .btn.red").click();
  await page.waitForSelector(".battle .result .btn", { timeout: 20000 });
  await shot(page, "04-raid-end", 300);
  await page.locator(".battle .result .btn").click();
}
// contract delivery
await ev(`for (let k = 0; k < 9; k++) { const p = g.targetPos({kind:"city", i:k}); g.s.hero.x = p.x; g.s.hero.y = p.y; g.update(0.01); if (!g.s.contract) break; }`);
await shot(page, "05-delivered", 500);
console.log("contracts", await ev(`return g.s.c.contracts + " gold " + Math.round(g.s.res.gold);`));
console.log("errors:", errs);
await browser.close();
