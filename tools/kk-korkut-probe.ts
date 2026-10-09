import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/korkut-${mode}`;
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
  for (let k = 0; k < 10; k++) {
    if (!(await page.locator(".battle .bbox.story .btn").count())) break;
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
const settle = async () => {
  for (let k = 0; k < 120; k++) {
    await page.waitForTimeout(250);
    if (await page.locator(".battle .result .btn").count()) { await page.locator(".battle .result .btn").first().click(); continue; }
    if (await page.locator(".battle .rlog").count()) continue;
    if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); continue; }
    if (await page.locator(".battle .bbox .btn").count()) { await page.locator(".battle .bbox .btn").first().click(); continue; }
    break;
  }
};
const goSpot = () => ev(`const a = g.s.boy.at; g.s.hero.x = a.x + 20; g.s.hero.y = a.y; g.cam.flyTo(a.x, a.y, 0.9);`);
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await page.waitForTimeout(1200);
await dismiss();
await ev(`g.s.hero.lv = 10; g.s.res.gold = 3000; g.s.res.food = 1000; g.s.hero.army = { spear: 60, archer: 50, horse: 40 }; const c = g.cityPos("bukhara"); g.s.hero.x = c.x; g.s.hero.y = c.y;`);
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel h3", { hasText: "Dede Korkut" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-1.png` });
await page.locator(".panel .grow", { hasText: "Deli Dumrul" }).locator(".btn").click();
await page.waitForTimeout(300);
await dismiss();
console.log("boy", await ev(`return g.s.boy;`));
await goSpot();
await ev(`g.hud.openPlace({ kind: "boy" });`);
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}-2.png` });
await page.locator(".panel .btn.big").click();
await page.waitForTimeout(300);
await page.locator(".battle .bbox .btn").first().click();
await page.waitForTimeout(300);
await dismiss();
console.log("after step1", await ev(`return [g.s.boy.step, g.s.res.gold];`));
await goSpot();
await ev(`g.boyAct();`);
await page.waitForTimeout(300);
await page.locator(".battle .bbox .btn").nth(1).click();
await page.waitForTimeout(300);
await dismiss();
console.log("after step2 (provoke)", await ev(`return g.s.boy.step;`), "odds", await ev(`return g.boyOdds();`));
await goSpot();
await ev(`g.boyAct();`);
await settle();
await dismiss();
console.log("done", await ev(`return [g.s.boy, g.s.boysDone, g.s.songs.map(s => s.title)];`));
// tepegöz
await ev(`g.s.hero.lv = 14; const c = g.cityPos("merv"); g.s.hero.x = c.x; g.s.hero.y = c.y; g.boyStart("tepegoz");`);
await dismiss();
await goSpot();
await ev(`g.boyAct();`);
await dismiss();
console.log("tepegoz step", await ev(`return [g.s.boy.step, g.s.res.food];`));
await goSpot();
await page.waitForTimeout(900);
await ev(`g.hud.openPlace({ kind: "boy" });`);
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}-3.png` });
await ev(`g.hud.close(); g.s.hero.army = { spear: 200, archer: 200, horse: 200 }; g.boyAct();`);
await settle();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-4.png` });
await dismiss();
console.log("tepegoz", await ev(`return [g.s.boy, g.s.boysDone, g.s.hero.bag.filter(i => i.rar === 4).map(i => i.name)];`));
console.log("errors:", errs);
await browser.close();
