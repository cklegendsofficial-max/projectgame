import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/outlaw-${mode}`;
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
await ev(`for (let i = 0; i < 9; i++) { g.s.hero.xp += 999999; g.addXp(0); } const st = g.s.hero.stats; for (const k of Object.keys(st)) st[k] += 20;`);

await ev(`g.s.hero.army = { spear: 30, archer: 20, horse: 12 }; g.s.res.gold = 5000;`);
for (let i = 0; i < 6; i++) await ev(`g["spawnCaravan"]();`);
const cvs = await ev<{ id: number; from: string; to: string; fac: string; good: string; qty: number; n: number }[]>(`return g.s.caravans.map(c => ({ id: c.id, from: c.from, to: c.to, fac: c.fac, good: c.good, qty: c.qty, n: c.path.length / 2 }));`);
console.log("caravans", JSON.stringify(cvs));
await page.waitForTimeout(4000);
await ev(`const cv = g.s.caravans[0]; g.reveal(cv.x, cv.y, 14); g.s.hero.x = cv.x + 60; g.s.hero.y = cv.y + 30; g.cam.flyTo(cv.x, cv.y);`);
await shot("01-map", 1500);
const before = await ev(`return { gold: g.s.res.gold, rep: { ...g.s.rep }, cargo: { ...g.s.hero.cargo } };`);
await ev(`g["meetCaravan"](g.s.caravans[0]);`);
await shot("02-choice");
await page.locator(".bbox.choice .btn").nth(0).click();
await page.waitForTimeout(300);
await ev(`g["meetCaravan"](g.s.caravans[0]);`);
await page.locator(".bbox.choice .btn.bad").click();
await page.waitForSelector(".battle .result .btn", { timeout: 20000 });
await shot("03-rob");
await page.locator(".battle .result .btn").click();
await dismiss();
const after = await ev(`return { gold: g.s.res.gold, rep: { ...g.s.rep }, cargo: { ...g.s.hero.cargo }, wanted: g.s.wanted, robbed: g.s.c.robbed, cvs: g.s.caravans.length };`);
console.log("before", JSON.stringify(before));
console.log("after", JSON.stringify(after));
// posse
await ev(`g.addWanted(2); g["posseT"] = 0; const h = g.s.hero; h.x += 300; h.y += 0;`);
await page.waitForTimeout(1500);
console.log("posse", JSON.stringify(await ev(`return g.s.bandits.filter(b => b.posse).map(b => ({ n: b.army.spear + b.army.archer + b.army.horse, d: Math.round(Math.hypot(b.x - g.s.hero.x, b.y - g.s.hero.y)) }));`)));
await ev(`const b = g.s.bandits.find(b => b.posse); if (b) { g.reveal(b.x, b.y, 10); g.cam.flyTo((b.x + g.s.hero.x) / 2, (b.y + g.s.hero.y) / 2); }`);
await shot("04-posse", 1200);
// rescue
await ev(`const s = g.s; const cv = s.caravans[0]; const camp = s.camps.findIndex(c => c.alive); s.bandits.push({ id: s.nextId++, camp, tier: 1, x: cv.x, y: cv.y, army: { spear: 3, archer: 1, horse: 0 }, tx: cv.x, ty: cv.y, wait: 9, chase: false }); cv.raid = s.bandits[s.bandits.length - 1].id; cv.raidT = 30; s.wanted = 0; s.bandits = s.bandits.filter(b => !b.posse);`);
await ev(`const s = g.s; const cv = s.caravans[0]; const b = s.bandits.find(b => b.id === cv.raid); g["engageBandit"](b, false);`);
await page.waitForSelector(".battle .result .btn", { timeout: 20000 });
console.log("rescue", await page.locator(".battle .result").textContent());
await page.locator(".battle .result .btn").click();
await ev(`g.hud.close(); g.s.wanted = 3; const c = g.targetPos({kind:"city", i: 6}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.hud.openPlace({kind:"city", i: 6}); g.hud.tab = "han"; g.hud.render();`);
await shot("05-kadi");
console.log("errors:", errs);
await browser.close();
