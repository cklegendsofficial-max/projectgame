import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/deep-${mode}`;
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

await ev(`const h = g.s.hero; h.army = { spear: 70, archer: 40, horse: 25 }; h.hp = g.maxHp(); const k = g.s.kurgans[0]; k.alive = false; k.respawnAt = g.now + 600000; h.x = k.x + 20; h.y = k.y + 20; g.cam.flyTo(h.x, h.y);`);
await page.waitForTimeout(600);
await ev(`g.hud.openPlace({ kind: "kurgan", i: 0 });`);
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector(".panel .odds.mid")?.scrollIntoView());
await shot("01-panel");
await ev(`g.enterDeep(0);`);
await shot("02-intro");
let shots = 0;
const seen: string[] = [];
for (let step = 0; step < 160; step++) {
  await page.waitForTimeout(250);
  const st = await ev<{ floor: number; torch: number } | null>(`return g.deep ? { floor: g.deep.floor, torch: g.deep.torch } : null;`);
  if (await page.locator(".battle .result .btn").count()) { await page.locator(".battle .result .btn").first().click(); continue; }
  if (await page.locator(".battle .rlog").count()) continue;
  const ch = page.locator(".battle .bbox.story.choice");
  if (await ch.count()) {
    const title = (await ch.locator("h2").textContent()) ?? "";
    if (!seen.includes(title.replace(/\d+/g, "#"))) { seen.push(title.replace(/\d+/g, "#")); if (shots < 6) await shot(`03-c${shots++}`, 100); }
    const btns = ch.locator(".btn:not(.off)");
    const n = await btns.count();
    const leave = st && st.floor > 11 && !title.includes("geçildi");
    await btns.nth(leave ? n - 1 : 0).click();
    continue;
  }
  if (await page.locator(".battle .bbox.story .btn").count()) {
    if (!st) { await shot("04-exit", 100); await page.locator(".battle .bbox.story .btn").first().click(); break; }
    await page.locator(".battle .bbox.story .btn").first().click();
    continue;
  }
  if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); continue; }
}
console.log("seen", JSON.stringify(seen));
console.log("after", JSON.stringify(await ev(`return { deep: g.deep, best: g.s.deepBest, floors: g.s.c.floors, lock: g.battleLock, ruh: g.s.mats.ruh, bag: g.s.hero.bag.length, army: g.s.hero.army, delved: g.s.kurgans[0].delved };`)));
await ev(`g.hud.openPlace({ kind: "kurgan", i: 0 });`);
await page.evaluate(() => document.querySelector(".panel .odds.mid")?.scrollIntoView());
await shot("05-panel");
console.log("errors:", errs);
await browser.close();