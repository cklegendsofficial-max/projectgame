import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/city-${mode}`;
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
    if (!(await page.locator(".battle .bbox.story .btn, .battle .bbox.choice .btn").count())) break;
    await page.locator(".battle .bbox.story .btn, .battle .bbox.choice .btn").first().click();
    await page.waitForTimeout(200);
  }
};
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
const CITY = "bukhara";
const idx = await ev<number>(`
  g.s.beylik = true; g.s.res.gold = 50000; g.s.res.stone = 5000; g.s.res.food = 2000;
  const p = g.cityPos("${CITY}"); g.s.hero.x = p.x; g.s.hero.y = p.y + 40;
  g.s.owned["${CITY}"] = { loy: 50, gar: { spear: 20, archer: 10, horse: 5 }, coffer: 0, tax: 1, since: 1, from: "karahan" };
  return g.nearCity();`);
console.log("city idx", idx);
const r0 = await ev<number>(`return g.ownRate("${CITY}");`);
await ev(`g.buildCity("${CITY}", "pazar"); g.buildCity("${CITY}", "sur"); g.buildCity("${CITY}", "kisla"); g.buildCity("${CITY}", "ambar"); g.appointGov("${CITY}", "nasir");`);
console.log("rate", r0.toFixed(1), "->", (await ev<number>(`return g.ownRate("${CITY}");`)).toFixed(1), "def", await ev(`return g.cityDefense("${CITY}").toFixed(2);`), "cap", await ev(`return g.ownCap("${CITY}");`));
console.log("blds", await ev(`return g.s.owned["${CITY}"].blds;`), "gov", await ev(`return g.s.owned["${CITY}"].gov;`));
const gar0 = await ev<number>(`const a = g.s.owned["${CITY}"].gar; return a.spear + a.archer + a.horse;`);
await ev(`g.s.owned["${CITY}"].ev = { kind: "kitlik", until: g.dayOf().day + 2 }; g.cityDaily();`);
console.log("garrison after day", gar0, "->", await ev(`const a = g.s.owned["${CITY}"].gar; return a.spear + a.archer + a.horse;`));
await ev(`g.hud.openPlace({ kind: "city", i: ${idx} }); g.hud.tab = "kale"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel .cev").scrollIntoViewIfNeeded().catch(() => {});
await page.screenshot({ path: `${out}-1.png` });
await page.locator(".panel .cev .btn").click();
await page.waitForTimeout(300);
console.log("event after fix:", await ev(`return g.s.owned["${CITY}"].ev;`), "food", await ev(`return g.s.res.food;`));
await page.locator(".panel h3", { hasText: "Vali" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-2.png` });
let n = 0;
for (let d = 0; d < 40; d++) n += await ev<number>(`const o = g.s.owned["${CITY}"]; o.ev = null; g.s.time += 150; g.cityDaily(); return o.ev ? 1 : 0;`);
console.log("events in 40 days:", n);
console.log("errors:", errs);
await browser.close();
