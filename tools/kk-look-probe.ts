import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const tag = process.argv[3] ?? "a";
const out = `playtest/look-${tag}-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1600, height: 900 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 3 : 1, hasTouch: mode === "mob" });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
for (let k = 0; k < 10 && (await page.locator(".battle .bbox .btn.go").count()); k++) {
  await page.locator(".battle .bbox .btn.go").first().click();
  await page.waitForTimeout(150);
}
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
for (let k = 0; k < 10 && (await page.locator(".battle .bbox .btn.go").count()); k++) {
  await page.locator(".battle .bbox .btn.go").first().click();
  await page.waitForTimeout(150);
}
await ev(`g.s.explored.fill(1); if (g.view) g.view.fogDirty = true;`);
await page.addStyleTag({ content: "#hud { display: none !important; }" });
const spots: [string, string, number][] = [["samarkand", "c = g.cityPos('samarkand')", 0.7], ["samarkand", "c = g.cityPos('samarkand')", 1.6], ["desert", "c = { x: 0.61 * 4800, y: 0.56 * 2800 }", 1.4], ["mountain", "c = { x: 0.8 * 4800, y: 0.62 * 2800 }", 1.2], ["sea", "c = { x: 0.2 * 4800, y: 0.33 * 2800 }", 1.0], ["wide", "c = { x: 2400, y: 1400 }", 0.35]];
for (const [name, pos, z] of spots) {
  await ev(`let c; ${pos}; g.s.hero.x = c.x + 60; g.s.hero.y = c.y + 60; g.cam.flyTo(c.x, c.y, ${z}); g.cam.x = c.x; g.cam.y = c.y; g.cam.zoom = ${z};`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}-${name}-${z}.png` });
}
console.log("errors:", errs);
await browser.close();
