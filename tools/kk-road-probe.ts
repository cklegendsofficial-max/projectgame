import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/road-${mode}`;
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
await ev(`g.s.res.gold = 1000; g.s.res.food = 500; g.s.hero.cargo.ipek = 10; g.s.hero.paid.ipek = 500;`);
// natural trigger: walk far from city
const walk = await ev(`let best = 0, bd = 0; for (let i = 0; i < 30; i++) { let p; try { p = g.targetPos({ kind: "city", i }); } catch { break; } if (!p) continue; const d = Math.hypot(p.x - g.s.hero.x, p.y - g.s.hero.y); if (d > bd && d < 2500) { bd = d; best = i; } } g.goTo({ kind: "city", i: best }); g.s.hero.army = { spear: 30, archer: 20, horse: 10 }; return [best, bd | 0, !!g.s.hero.path];`);
console.log("walking", walk);
let fired = false;
for (let k = 0; k < 40 && !fired; k++) {
  await ev(`g.roadD = Math.max(g.roadD, 690);`);
  await page.waitForTimeout(500);
  fired = (await page.locator(".battle .bbox .btn").count()) > 0;
}
console.log("natural event fired", fired, await ev(`return g.s.road;`));
await dismiss();
if (await page.locator(".battle .bbox .btn").count()) await page.locator(".battle .bbox .btn").first().click();
await dismiss();
for (const id of ["teker", "kacak", "senlik", "harac"]) {
  await ev(`g.s.time = 150 * 1 + 10; g.roadEvent("${id}");`);
  await page.waitForTimeout(300);
  if (id === "senlik") await page.screenshot({ path: `${out}-1.png` });
  const opts = await page.locator(".battle .bbox .btn").allTextContents();
  console.log(id, opts);
  const before = await ev(`return [g.s.res.gold, g.s.hero.cargo.ipek, g.s.hero.army.spear, g.s.hero.army.horse, g.s.renown];`);
  await page.locator(".battle .bbox .btn:not(.off)").first().click();
  await page.waitForTimeout(400);
  if (id === "senlik") await page.screenshot({ path: `${out}-2.png` });
  await dismiss();
  console.log("  ", before, "->", await ev(`return [g.s.res.gold, g.s.hero.cargo.ipek, g.s.hero.army.spear, g.s.hero.army.horse, g.s.renown];`));
}
console.log("errors:", errs);
await browser.close();
