import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = (fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`);
await page.locator('.ccard[data-c="bahadir"]').click();
await page.locator(".cname .btn").click();
for (let k = 0; k < 4; k++) {
  const b = page.locator(".battle .bbox.story .btn");
  if (!(await b.count())) break;
  await b.first().click();
  await page.waitForTimeout(200);
}
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
for (let k = 0; k < 4; k++) {
  const b = page.locator(".battle .bbox.story .btn");
  if (!(await b.count())) break;
  await b.first().click();
  await page.waitForTimeout(200);
}
await ev(`g.s.hero.lv = 8; g.s.hero.stats.lid = 10; g.s.hero.army = {spear: 18, archer: 10, horse: 6}; g.s.comps = ["korkut", "ayse"]; g.cam.zoom = 1.1; g.goTo({kind:"city", i: 2});`);
await page.waitForTimeout(3500);
await ev(`g.cam.flyTo(g.s.hero.x, g.s.hero.y, 1.1);`);
await page.waitForTimeout(900);
await page.screenshot({ path: `playtest/visual-${mode}-day.png` });
await ev(`g.s.hero.path = null;`);
await page.waitForTimeout(800);
await page.screenshot({ path: `playtest/visual-${mode}-zoom.png`, clip: { x: vp.width / 2 - 160, y: vp.height / 2 - 120, width: 320, height: 240 } });
await ev(`g.s.time = Math.floor(g.s.time / 150) * 150 + 75; g.s.hero.path = null; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.cam.flyTo(c.x, c.y - 60, 0.6);`);
await page.waitForTimeout(1500);
await page.screenshot({ path: `playtest/visual-${mode}-night.png` });
console.log("errors:", errs);
await browser.close();
