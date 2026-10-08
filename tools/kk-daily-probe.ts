import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/daily-${mode}`;
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
await ev(`for (let i = 0; i < 10; i++) { g.s.hero.xp += 999999; g.addXp(0); } const st = g.s.hero.stats; for (const k of Object.keys(st)) st[k] += 20;`);

const d0 = await ev(`const d = g.daily(); return d.tasks.map(t => t.key + ":" + t.need);`);
console.log("tasks", JSON.stringify(d0));
const g0 = await ev<number>(`return g.s.res.gold;`);
await ev(`const d = g.daily(); for (const t of d.tasks) g.s.c[t.key] = (g.s.c[t.key] || 0) + t.need + 5;`);
await page.waitForTimeout(1500);
await dismiss();
await ev(`g.hud["openHero"](); g.hud.tab = "unvan"; g.hud.render();`);
await shot("01-ready");
await ev(`g.claimDaily(0); g.claimDaily(1); g.claimDaily(2);`);
console.log("claimed", JSON.stringify(await ev(`return { gold: Math.round(g.s.res.gold - ${g0}), ready: g.chestReady(), tasks: g.s.daily.tasks.map(t => t.done) };`)));
await ev(`g.s.daily.last = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); })(); g.s.daily.streak = 3;`);
await ev(`g.openChest();`);
await page.waitForTimeout(500);
await shot("02-chest");
await dismiss();
console.log("chest", JSON.stringify(await ev(`return { chest: g.s.daily.chest, streak: g.s.daily.streak, gold: Math.round(g.s.res.gold - ${g0}), claimable: g.dailyClaimable() };`)));
await ev(`g.hud["openHero"](); g.hud.tab = "unvan"; g.hud.render();`);
await shot("03-done");
console.log("errors:", errs);
await browser.close();