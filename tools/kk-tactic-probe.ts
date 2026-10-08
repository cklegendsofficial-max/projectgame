import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/tactic-${mode}-${cls}`;
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
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
console.log("scan", JSON.stringify(await ev(`g.s.hero.lv = 6; const c = g.s.camps.filter((c) => c.tier <= 3).sort((a, b) => b.tier - a.tier)[0]; const r = []; for (const k of [0.4, 0.6, 0.8, 1, 1.3, 1.6]) { g.s.hero.army = {spear: Math.round(17*k), archer: Math.round(10*k), horse: Math.round(7*k)}; r.push([Math.round(34*k), g.odds(c.garrison, 0.1)]); } return { tier: c.tier, gar: c.garrison, r };`)));
await ev(`g.s.hero.lv = 6; g.s.hero.army = {spear: 12, archer: 7, horse: 5}; g.s.hero.hp = g.maxHp(); const c = g.s.camps.filter((c) => c.tier <= 3).sort((a, b) => b.tier - a.tier)[0]; g.s.hero.x = c.x + 20; g.s.hero.y = c.y; g.cam.flyTo(c.x, c.y, 0.9); g.attackCamp(g.s.camps.indexOf(c));`);
await page.waitForSelector(".tact", { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-01-pick.png` });
console.log("odds", await page.locator(".tact .odds").allTextContents(), "intel:", await page.locator(".intel").textContent());
await page.locator(".tact").nth(1).click();
await page.waitForSelector(".battle .result .btn", { timeout: 20000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-02-result.png` });
console.log("note", await page.locator(".battle .result").textContent());
await page.locator(".battle .result .btn").click();
await dismiss();
await ev(`g.s.hero.army = {spear: 10, archer: 5, horse: 5}; g.s.hero.hp = g.maxHp(); const h = g.s.hero; const v = g.s.villages.find(v => Math.hypot(v.x - g.s.hero.x, v.y - g.s.hero.y) > 600 && Math.hypot(v.x - 3800, v.y - 1230) > 600); h.x = v.x; h.y = v.y; g.cam.flyTo(v.x, v.y, 0.9); g.s.bandits.push({ id: 99998, camp: 0, tier: 4, x: v.x + 60, y: v.y, army: {spear: 30, archer: 20, horse: 10}, tx: v.x, ty: v.y, wait: 0, chase: true, amb: true }); g.s.contract = { from: "bukhara", to: "rey", gold: 100, until: g.now + 999999, cargo: "test" };`);
await page.waitForSelector(".tact", { timeout: 8000 });
await page.screenshot({ path: `${out}-03-ambush.png` });
await page.locator(".tbox .flee").click();
await page.waitForTimeout(500);
console.log("after flee", JSON.stringify(await ev(`return { army: g.s.hero.army, lock: g.battleLock, amb: g.s.bandits.filter(b => b.amb).length };`)));
await page.waitForTimeout(1500);
console.log("errors:", errs);
await browser.close();
