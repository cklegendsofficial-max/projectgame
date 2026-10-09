import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/beyq-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.addInitScript(() => setInterval(() => (document.querySelector(".tact.last") as HTMLElement | null)?.click(), 300));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 14; k++) {
    if (await page.locator(".battle .rlog").count()) {
      await page.waitForTimeout(400);
      const close = page.locator(".battle .bbox:not(.story) .btn.go, .battle .bbox:not(.story) .btn.big");
      if (await close.count()) await close.first().click().catch(() => {});
      continue;
    }
    if (!(await page.locator(".battle .bbox.story .btn, .battle .bbox.choice .btn").count())) break;
    await page.locator(".battle .bbox.story .btn, .battle .bbox.choice .btn").first().click();
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
await ev(`while (g.s.hero.lv < 16) { g.s.hero.xp += 3000; g.addXp(0); } g.s.beylik = true; g.s.renown = 400; g.s.res.gold = 20000; g.s.explored.fill(1); g.view.fogDirty = true;`);
await dismiss();
await page.waitForTimeout(1200);
await dismiss();

// camp request on ally 0
const r1 = await ev<string>(`const r = g.s.rivals[0]; r.status = "ally"; r.rel = 60; const ci = g.s.camps.findIndex((c) => c.alive); r.req = { kind: "camp", camp: ci, until: g.dayOf().day + 3, gold: 200 }; return g.reqText(r);`);
console.log("camp req:", r1);
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await shot("1-list");
const gold0 = await ev<number>(`return g.s.res.gold;`);
await ev(`g.hud.close(); const r = g.s.rivals[0]; g.s.camps[r.req.camp].alive = false; g.s.camps[r.req.camp].respawnAt = Date.now() + 1e7;`);
await page.waitForTimeout(2200);
console.log("camp done:", await ev(`return [g.s.rivals[0].req ?? null, Math.round(g.s.res.gold - ${gold0}), g.s.c.beyq];`));

// goods request via meet dialog
await ev(`g.hud.close(); const r = g.s.rivals[0]; r.req = { kind: "goods", good: "deri", n: 6, until: g.dayOf().day + 3, gold: 160 }; g.s.hero.cargo.deri = 8; g.s.hero.paid.deri = 100; g.meetRival(0);`);
await shot("2-meet");
await page.locator(".battle .bbox.choice .btn", { hasText: "teslim et" }).click();
await page.waitForTimeout(400);
console.log("goods done:", await ev(`return [g.s.rivals[0].req ?? null, g.s.hero.cargo.deri, g.s.c.beyq];`));

// generated requests
const kinds = await ev<string[]>(`const out = []; const r = g.s.rivals[1]; r.status = "ally"; r.rel = 60; for (let k = 0; k < 30; k++) { delete r.req; g.reqNew(r); out.push(r.req.kind); } delete r.req; return out;`);
console.log("generated kinds:", [...new Set(kinds)].join(","), kinds.filter((k) => k === "sefer").length, "sefer/30");

// sefer: ally joins siege
const city = await ev<string>(`const r = g.s.rivals[1]; r.req = { kind: "sefer", city: "bukhara", until: g.dayOf().day + 5, gold: 900 }; return r.req.city;`);
const before = await ev<[number, number, number]>(`const a = g.siegeArmy("${city}"); const b = g.siegeArmy(); return [a.spear + a.archer + a.horse, b.spear + b.archer + b.horse, Math.round(g.siegeOdds("${city}") * 100)];`);
console.log("siege army with ally / without / odds:", before);
await ev(`const c = g.s.rivals[1]; const p = g.cityPos("${city}"); g.s.hero.x = p.x; g.s.hero.y = p.y + 60; g.s.hero.army = { spear: 80, archer: 60, horse: 60 };`);
const rArmy0 = await ev<number>(`const a = g.s.rivals[1].army; return a.spear + a.archer + a.horse;`);
await ev(`g.besiege("${city}");`);
await page.waitForTimeout(300);
await shot("3-siege");
await dismiss();
await page.waitForTimeout(2200);
await dismiss();
console.log("after siege owned:", await ev(`return [!!g.s.owned["${city}"], g.s.rivals[1].req ?? null, g.s.c.beyq];`), "ally army", rArmy0, "->", await ev(`const a = g.s.rivals[1].army; return a.spear + a.archer + a.horse;`));
console.log("hero army sane:", await ev(`return g.s.hero.army;`));
console.log("errors:", errs);
await browser.close();
