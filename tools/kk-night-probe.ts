import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/night-${mode}`;
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
const dismiss = async () => {
  for (let k = 0; k < 12 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await ev(`const c = g.s.camps[0]; const h = g.s.hero; h.x = c.x + 180; h.y = c.y + 60; g.reveal(c.x, c.y, 14); g.cam.flyTo(h.x - 80, h.y, 0.9); g.s.time = 150 * 0.5;`);
await page.waitForTimeout(1500);
console.log("night", await ev(`return g.isNight();`));
await page.screenshot({ path: `${out}-01.png` });
await ev(`g.s.time = 150 * 1.05;`);
await page.waitForTimeout(800);
console.log("day", await ev(`return g.isNight();`));
await page.screenshot({ path: `${out}-02.png` });
console.log("errors:", errs);
await browser.close();
