import { chromium, type Page } from "playwright-core";

const out = "playtest/kk";
async function shot(page: Page, name: string, wait = 400): Promise<void> {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}-${name}.png` });
}
const ev = <T = unknown>(page: Page, fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;

const browser = await chromium.launch({ channel: "msedge", headless: true, args: process.env.GPU ? ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const mode = process.argv[2] ?? "desk";
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1, locale: "tr-TR" });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => (m.type() === "error" ? errs.push(m.text()) : m.text().includes("ms") && console.log("log:", m.text())));
await page.addInitScript(() => localStorage.clear());
await page.goto("http://localhost:5174/");
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
await shot(page, `${mode}-01-start`, 1200);

const fps = await page.evaluate(`new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); })`);
console.log("fps", fps);

await ev(page, `g.cam.flyTo(2400, 1400, 0.22);`);
await shot(page, `${mode}-02-world`, 2500);
await ev(page, `g.s.explored.fill(1); g.view.fogDirty = true;`);
await shot(page, `${mode}-03-revealed`, 800);

await ev(page, `const v = g.nearest(g.s.villages); g.cam.flyTo(v.x, v.y, 0.8); g.goTo({kind:"village", i: g.s.villages.indexOf(v)});`);
await shot(page, `${mode}-04-walk`, 3000);
await ev(page, `const v = g.nearest(g.s.villages); g.s.hero.x = v.x; g.s.hero.y = v.y + 10; g.s.hero.path = null; g.hud.openPlace({kind:"village", i: g.s.villages.indexOf(v)});`);
await shot(page, `${mode}-05-village`, 600);
await ev(page, `g.hud.openPlace({kind:"capital"});`);
await shot(page, `${mode}-06-capital`, 600);
await page.locator(".tab", { hasText: "Kışla" }).click();
await shot(page, `${mode}-07-barracks`, 400);
await ev(page, `const c = g.nearest(g.s.camps); const i = g.s.camps.indexOf(c); g.s.hero.x = c.x + 30; g.s.hero.y = c.y + 30; g.cam.flyTo(c.x, c.y, 0.9); g.hud.openPlace({kind:"camp", i});`);
await shot(page, `${mode}-08-camp`, 1500);
await ev(page, `const c = g.nearest(g.s.camps); g.hud.close(); g.attackCamp(g.s.camps.indexOf(c));`);
await shot(page, `${mode}-09-battle`, 1600);
await shot(page, `${mode}-10-battleEnd`, 5000);
console.log("errors:", errs);
await browser.close();
