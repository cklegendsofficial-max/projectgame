import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/weekly-${mode}`;
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
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.free = true; g.s.hero.lv = 12;`);
const w0 = await ev<string>(`const w = g.weekly(); return JSON.stringify({ id: w.id, lv: w.lv, score: g.weekScoreNow(), mods: g.compMods() });`);
console.log("week:", w0);
await ev(`const w = g.weekly(); for (const k of Object.keys(g.s.c)) g.s.c[k] += 40; g.s.c.profit += 20000;`);
console.log("score after:", await ev(`return g.weekScoreNow();`));
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
const gold0 = await ev<number>(`return g.s.res.gold;`);
const n = await page.locator(".wtier.ready .btn").count();
console.log("ready tiers:", n);
if (n) await page.locator(".wtier.ready .btn").first().click();
await page.waitForTimeout(300);
console.log("claimed:", await ev(`return g.weekly().claimed;`), "gold +", (await ev<number>(`return g.s.res.gold;`)) - gold0);
await page.locator(".wboard").scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-1.png` });
console.log("board:", await ev(`return g.weekBoardNow().map((r) => r.name + ":" + r.score + (r.me ? "*" : "")).join(", ");`));
await ev(`g.weekly().id -= 1; g.achT = 0;`);
await page.waitForTimeout(2500);
console.log("after rollover:", await ev(`const w = g.weekly(); return JSON.stringify({ id: w.id, claimed: w.claimed, hist: w.hist, score: g.weekScoreNow() });`));
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-2.png` });
console.log("errors:", errs);
await browser.close();
