import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/sky-${mode}-${cls}`;
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
  for (let k = 0; k < 5 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(250);
  }
};
const check = (ok: boolean, what: string) => console.log(ok ? "OK  " : "FAIL", what);
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();

for (const [kind, label] of [["kum", "Kum fırtınası"], ["yagmur", "Sağanak"]] as const) {
  await ev(`g.s.hero.lv = 8; g.s.hero.army = {spear: 16, archer: 12, horse: 10}; g.s.hero.hp = g.maxHp(); const c = g.s.camps.filter((c) => c.alive && c.tier <= 4).sort((a, b) => b.tier - a.tier)[0]; c.garrison = {spear: 22, archer: 16, horse: 12}; const h = g.s.hero; h.x = c.x + 20; h.y = c.y; g.cam.flyTo(c.x, c.y, 0.9); g.s.storms = [{ id: 9999, kind: "${kind}", x: h.x, y: h.y, r: 500, vx: 0, vy: 0, age: 10, life: 9999 }]; g.attackCamp(g.s.camps.indexOf(c));`);
  await page.waitForSelector(".tact", { timeout: 5000 });
  const ff = await ev<{ sky: string | null } | null>(`return g.fieldHere();`);
  check(ff?.sky === kind, `fieldHere sky=${kind} (${ff?.sky})`);
  check((await page.locator(".tground .sky").textContent())?.includes(label) ?? false, `taktik kartında ${label}`);
  await page.screenshot({ path: `${out}-${kind}-01-pick.png` });
  await page.locator(".tact").nth(1).click();
  await page.waitForSelector(".bbox.war", { timeout: 4000 });
  await page.waitForTimeout(1600);
  check((await page.locator(".fground").textContent())?.includes(label) ?? false, `savaş başlığında ${label}`);
  await page.screenshot({ path: `${out}-${kind}-02-battle.png` });
  await page.waitForSelector(".battle .result .btn", { timeout: 30000 });
  await page.locator(".battle .result .btn").click();
  await dismiss();
  await ev(`g.s.storms = [];`);
}
console.log("errors:", errs);
await browser.close();

