import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/sea-${mode}`;
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
await page.waitForTimeout(1200);
await dismiss();
const idx = await ev<number>(`g.s.res.gold = 20000; g.s.hero.lv = 10; g.s.hero.army = { spear: 30, archer: 30, horse: 10 };
  const p = g.cityPos("tabriz"); g.s.hero.x = p.x; g.s.hero.y = p.y + 40; return g.nearCity();`);
console.log("near", idx, "port", await ev(`return g.portHere();`));
await ev(`g.buyShip(); g.buyShip(); g.buyGood("tabriz", "hali", 30);`);
console.log("fleet", await ev(`return [g.s.fleet.ships, g.fleetCap(), g.s.hero.cargo.hali];`));
await ev(`g.hud.openPlace({ kind: "city", i: ${idx} }); g.hud.tab = "liman"; g.hud.render();`);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-1.png` });
await page.locator(".panel .grow .btn", { hasText: "Muhafızlı" }).last().click();
await page.waitForTimeout(200);
console.log("voyage", await ev(`return g.s.fleet.voyage;`), "cargo", await ev(`return g.s.hero.cargo.hali;`));
await ev(`g.hud.render();`);
await page.waitForTimeout(200);
await page.screenshot({ path: `${out}-2.png` });
const gold0 = await ev<number>(`return g.s.res.gold;`);
await ev(`g.hud.close(); g.s.time += g.s.fleet.voyage.dur + 1;`);
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}-3.png` });
await dismiss();
console.log("after voyage gold", gold0, "->", await ev(`return g.s.res.gold;`), "voyages", await ev(`return g.s.c.voyages;`));
let lost = 0;
for (let k = 0; k < 200; k++) lost += await ev<number>(`return Math.random() < g.pirateRisk(false) ? 1 : 0;`);
console.log("risk", await ev(`return [g.pirateRisk(false), g.pirateRisk(true)];`), "sim hits/200", lost);
await ev(`g.huntPirates();`);
let shot = true;
for (let k = 0; k < 80; k++) {
  await page.waitForTimeout(250);
  if (await page.locator(".battle .result .btn").count()) {
    if (shot) await page.screenshot({ path: `${out}-4.png` });
    shot = false;
    await page.locator(".battle .result .btn").first().click();
    continue;
  }
  if (await page.locator(".battle .rlog").count()) continue;
  if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); continue; }
  if (await page.locator(".battle .bbox .btn").count()) { await page.locator(".battle .bbox .btn").first().click(); continue; }
  break;
}
console.log("calm until", await ev(`return [g.s.fleet.calm ?? 0, g.s.time, g.pirateRisk(false)];`));
console.log("errors:", errs);
await browser.close();
