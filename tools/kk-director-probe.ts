import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/director-${mode}`;
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
    if (!(await page.locator(".battle .bbox .btn").count())) break;
    await page.locator(".battle .bbox .btn:not(.off)").first().click();
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
await ev(`g.s.hero.lv = 6; g.s.res.gold = 2000; const c = g.cityPos("samarkand"); g.s.hero.x = c.x + 500; g.s.hero.y = c.y + 300;`);
for (const p of ["umay", "tengri", "erlik"]) {
  await ev(`g.dir().p = "${p}"; g.dir().t = 0; g.dir().fight = 0;`);
  let threats = 0;
  for (let d = 0; d < 10; d++) {
    const n0 = await ev<number>(`return g.dir().log.length;`);
    await ev(`g.directorDaily();`);
    const log = await ev<{ bad: boolean }[]>(`return g.dir().log;`);
    if (log.length > n0 && log[0].bad) threats++;
    await dismiss();
  }
  console.log(p, "threats in 10 days:", threats, "tension", await ev(`return g.dir().t.toFixed(2);`));
  await ev(`g.dir().log = [];`);
}
const b0 = await ev<number>(`return g.s.bandits.length;`);
await ev(`g.dirThreat("pusu"); g.dirThreat("firtina");`);
console.log("bandits", b0, "->", await ev(`return g.s.bandits.length;`), "storms", await ev(`return g.s.storms.length;`));
await ev(`g.s.hero.hp = 5; g.dir().p = "umay"; g.dir().losses = 2;`);
for (let k = 0; k < 5; k++) await ev(`g.dir().t = 0; g.directorDaily();`);
console.log("hp after mercy", await ev(`return [g.s.hero.hp | 0, g.maxHp()];`), "log", await ev(`return g.dir().log.map(l => l.t);`));
await ev(`g.hud.openHero(); g.hud.tab = "ayar"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".persona").nth(2).click();
await page.waitForTimeout(200);
console.log("persona", await ev(`return g.dir().p;`));
await page.screenshot({ path: `${out}-1.png` });
console.log("errors:", errs);
await browser.close();
