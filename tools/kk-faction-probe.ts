import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/faction-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.addInitScript(() => {
  setInterval(() => (document.querySelector(".tact.last") as HTMLElement | null)?.click(), 300);
});
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 12 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
const shot = async (n: string, w = 400) => {
  await page.waitForTimeout(w);
  await page.screenshot({ path: `${out}-${n}.png` });
};
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await ev(`for (let i = 0; i < 17; i++) { g.s.hero.xp += 999999; g.addXp(0); } const st = g.s.hero.stats; for (const k of Object.keys(st)) st[k] += 20;`);

const p0 = await ev(`return { buy: g.buyPrice("bukhara", "ipek"), sell: g.sellPrice("bukhara", "ipek"), horse: g.eliteCost("bukhara", "horse"), bonus: g.heroBonus() };`);
await ev(`g.addRep("karahan", 300, "test");`);
await page.waitForTimeout(300);
await ev(`g.addRep("karahan", 400, "test");`);
await shot("01-gift");
await dismiss();
await ev(`g.addRep("karahan", 700, "test"); g.addRep("selcuk", 120, "test");`);
await dismiss();
const p1 = await ev(`return { rep: g.s.rep, ranks: ["karahan","gazne","selcuk","bizans"].map(f => g.rank(f)), buy: g.buyPrice("bukhara", "ipek"), sell: g.sellPrice("bukhara", "ipek"), horse: g.eliteCost("bukhara", "horse"), bonus: g.heroBonus(), gift: g.s.hero.bag.filter(i => i.set).map(i => i.name) };`);
console.log("before", JSON.stringify(p0));
console.log("after", JSON.stringify(p1));
await ev(`g.hud["openHero"](); g.hud.tab = "karakter"; g.hud.render(); `);
await page.waitForTimeout(300);
console.log("frep", await ev(`const e = document.querySelectorAll(".frep"); e[0]?.scrollIntoView(); return e.length;`));
await shot("02-rep");
await ev(`g.hud.close(); const c = g.targetPos({kind:"city", i: 6}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.hud.openPlace({kind:"city", i: 6}); g.hud.tab = "han"; g.hud.render();`);
await shot("03-city");
console.log("errors:", errs);
await browser.close();
