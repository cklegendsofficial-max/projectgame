import { chromium, type Page } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/story-${mode}`;
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
await page.addInitScript(() => { setInterval(() => (document.querySelector(".tact.last") as HTMLElement | null)?.click(), 300); });
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
const log = async (tag: string) => console.log(tag, JSON.stringify(await ev(`return { ch: g.s.story.ch, done: g.s.story.done, comps: g.s.comps, lv: g.s.hero.lv, fort: g.s.story.fort, gold: Math.round(g.s.res.gold) };`)));

await page.locator('.ccard[data-c="alp"]').click();
await page.locator(".cname .btn").click();
await closeStories();
await ev(`g.s.res.gold = 200; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await shot(page, "01-freedom", 400);
await page.locator(".battle .bbox.story .btn").first().click();
await shot(page, "02-chapter1", 400);
await closeStories();
await shot(page, "03-tracker", 400);
// Bukhara
await ev(`const i = 2; const c = g.targetPos({kind:"city", i: ${"g.world ? 0 : 0"}}); const b = (window.CITIES || null);`);
await ev(`const ci = g.QUESTS && 0; const list = ["kashgar","samarkand","bukhara","merv","nishapur","rey","tabriz","konya","constantinople"]; for (let i = 0; i < 9; i++) { const p = g.targetPos({kind:"city", i}); if (g.cityName(i) === "Buhara") { g.s.hero.x = p.x; g.s.hero.y = p.y; g.cam.flyTo(p.x, p.y, 0.8); g.hud.openPlace({kind:"city", i}); } }`);
await shot(page, "04-bukhara-saga", 800);
await page.locator(".saga-box .btn").first().click();
await shot(page, "05-korkut", 500);
await closeStories();
await log("after ch1");
// kurgan auto
await ev(`g.s.c.kurgans = 1;`);
await shot(page, "06-whisper", 900);
await closeStories();
await log("after ch2");
// Merv
await ev(`g.s.hero.stats.guc = 8; g.s.hero.stats.day = 7; g.s.hero.lv = 5; g.s.hero.army = {spear: 10, archer: 4, horse: 0}; g.s.hero.hp = g.maxHp(); for (let i = 0; i < 9; i++) { const p = g.targetPos({kind:"city", i}); if (g.cityName(i) === "Merv") { g.s.hero.x = p.x; g.s.hero.y = p.y; g.cam.flyTo(p.x, p.y, 0.8); g.hud.openPlace({kind:"city", i}); } }`);
await shot(page, "07-merv-saga", 800);
await page.locator(".saga-box .btn", { hasText: "Zincirleri" }).click();
await page.waitForSelector(".battle .result .btn", { timeout: 20000 });
await shot(page, "08-kasim", 300);
await page.locator(".battle .result .btn").click();
await shot(page, "09-ayse", 500);
await closeStories();
await log("after ch3");
// Camps + renown -> fort
await ev(`g.s.c.camps = 3; g.s.renown = 80;`);
await page.waitForTimeout(600);
await closeStories();
await log("after ch4");
await ev(`const f = g.s.story.fort; g.s.hero.x = f.x + 60; g.s.hero.y = f.y + 80; g.cam.flyTo(f.x, f.y, 0.7); g.goTo({kind:"point", x: f.x + 20, y: f.y + 120});`);
await shot(page, "10-fort-map", 2500);
await ev(`g.s.hero.stats.guc = 25; g.s.hero.stats.day = 22; g.s.hero.stats.lid = 15; g.s.hero.cskill = {hucum: 8, duvar: 6}; g.s.hero.lv = 16; g.s.hero.army = {spear: 60, archer: 40, horse: 30}; g.s.hero.hp = g.maxHp(); g.s.hero.path = null; const f = g.s.story.fort; g.s.hero.x = f.x + 40; g.s.hero.y = f.y + 40; g.hud.openPlace({kind:"fort"});`);
await shot(page, "11-fort-panel", 1200);
await page.locator(".panel .btn.red").click();
await page.waitForSelector(".battle .result .btn", { timeout: 25000 });
await shot(page, "12-karahan", 300);
await page.locator(".battle .result .btn").click();
await shot(page, "13-ending", 500);
await closeStories();
await log("end");
console.log("errors:", errs);
await browser.close();
