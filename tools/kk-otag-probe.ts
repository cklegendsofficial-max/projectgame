import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/otag-${mode}`;
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
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await page.waitForTimeout(1200);
await dismiss();
const spot = (north: boolean) => ev<{ x: number; y: number } | null>(`
  const c = g.cityPos("samarkand");
  for (let k = 0; k < 400; k++) {
    const x = c.x - 600 + Math.random() * 1200;
    const y = ${north ? "c.y - 500 + Math.random() * 400" : "2800 * 0.5 + Math.random() * 500"};
    g.s.hero.x = x; g.s.hero.y = y;
    if (g.cellCost(x, y) < 3 && g.nearCity(300) < 0 && Math.hypot(x - c.x, y - c.y) > 300) return { x, y };
  }
  return null;`);
await ev(`g.s.beylik = true; g.s.res.gold = 5000; g.s.res.wood = 1000; g.s.res.food = 1000;`);
const n = await spot(true);
console.log("north spot", n, "reason", await ev(`return g.otagReason();`));
await ev(`g.pitchOtag(); g.cam.flyTo(g.s.otag.x, g.s.otag.y, 0.9);`);
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}-1.png` });
await dismiss();
console.log("otag", await ev(`return [g.s.otag, g.otagYield()];`));
await ev(`g.hud.openPlace({ kind: "otag" });`);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-2.png` });
await ev(`g.hud.close(); g.s.time = 150 * 12 + 5;`);
const herd0 = await ev<number>(`return g.s.otag.herd;`);
await ev(`g.otagDaily(); g.otagDaily();`);
console.log("winter yaylak herd", herd0, "->", await ev(`return g.s.otag.herd;`), "season", await ev(`return g.season();`));
const so = await spot(false);
console.log("south spot", so, "reason", await ev(`return g.otagReason();`));
const ren0 = await ev<number>(`return g.s.renown;`);
await ev(`g.pitchOtag();`);
console.log("moved", await ev(`return [g.s.otag.x | 0, g.s.otag.y | 0, g.s.otag.fest];`), "renown", ren0, "->", await ev(`return g.s.renown;`), "yield", await ev(`return g.otagYield();`));
const gar0 = await ev<number>(`return g.s.garrison.horse;`);
await ev(`for (let k = 0; k < 4; k++) g.otagDaily();`);
console.log("kislak 4 days herd", await ev(`return g.s.otag.herd;`), "horses", gar0, "->", await ev(`return g.s.garrison.horse;`));
await ev(`g.hud.openHero(); g.hud.tab = "ordu"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel h3", { hasText: "Otağ" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-3.png` });
console.log("errors:", errs);
await browser.close();
