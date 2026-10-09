import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/siege-${mode}`;
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
  for (let k = 0; k < 12; k++) {
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
await ev(`while (g.s.hero.lv < 15) { g.s.hero.xp += 1000; g.addXp(0); }`);
await dismiss();
await ev(`g.s.beylik = true; g.s.renown = 500; g.s.res.gold = 50000; g.s.hero.hp = g.maxHp();`);

const cityI = await ev<number>(`for (let i = 0; i < 12; i++) { const p = g.targetPos({ kind: "city", i }); if (!p) continue; g.s.hero.path = null; g.target = null; g.s.hero.x = p.x; g.s.hero.y = p.y - 40; if (g.atCity("merv")) return i; } return -1;`);
console.log("merv index", cityI);
await ev(`const cap = g.heroCap(); g.s.hero.army = { spear: Math.round(cap * 0.4), archer: Math.round(cap * 0.3), horse: Math.round(cap * 0.3) }; g.s.garrison = { spear: 20, archer: 15, horse: 10 };`);
console.log("cap", await ev(`return g.heroCap();`), "reason", await ev(`return g.siegeReason("merv");`), "odds", await ev(`return g.siegeOdds("merv");`));
await ev(`g.hud.openPlace({ kind: "city", i: ${cityI} }); g.hud.tab = "kale"; g.hud.render();`);
await shot("01-kale");
await ev(`g.buyEngine(); g.buyEngine(); g.buyEngine(); g.hud.render();`);
console.log("odds w/ engines", await ev(`return g.siegeOdds("merv");`));
await shot("02-engines");
await page.locator(".panel .btn.big", { hasText: "Kuşat" }).click();
await page.waitForTimeout(300);
const food0 = await ev<number>(`return g.s.res.food;`);
await ev(`g.s.res.food = 400;`);
for (const a of ["bombard", "sap", "sap", "starve", "raid"]) {
  if (!(await ev<boolean>(`return !!g.siegeRun;`))) break;
  await page.locator(`.siege [data-sg="${a}"]`).click();
  await page.waitForTimeout(120);
}
console.log("siege run", JSON.stringify(await ev(`const r = g.siegeRun; return r && { day: r.day, breach: Math.round(r.breach), morale: Math.round(r.morale), relief: r.relief, gar: r.gar, odds: g.siegeAssaultOdds() };`)), "food", food0, "->", await ev(`return g.s.res.food;`));
console.log("log", await page.locator(".siege .sglog li").allInnerTexts().catch(() => []));
await shot("03-siege");
if (await ev<boolean>(`return !!g.siegeRun;`)) await page.locator(`.siege [data-sg="assault"]`).click();
await page.waitForTimeout(1500);
await shot("03-battle");
await dismiss();
await page.waitForTimeout(500);
await dismiss();
console.log("owned", JSON.stringify(await ev(`return { owned: g.s.owned, hero: g.s.hero.army, gar: g.s.garrison };`)));
if (!(await ev<boolean>(`return !!g.s.owned.merv;`))) {
  await ev(`g.s.garrison.horse += 200; g.besiege("merv"); g.siegeAssault();`);
  await page.waitForTimeout(1500);
  await dismiss();
  await page.waitForTimeout(500);
  await dismiss();
}
await ev(`g.hud.openPlace({ kind: "city", i: ${cityI} }); g.hud.tab = "kale"; g.hud.render();`);
await shot("04-owned");
await ev(`g.s.owned.merv.coffer = 200; g.hud.render();`);
await page.locator(".panel .btn", { hasText: "Vergiyi topla" }).click();
await page.locator(".panel .btn", { hasText: "Ağır" }).click();
await page.locator(".panel .btn", { hasText: "+10" }).first().click();
await page.locator(".panel .btn", { hasText: "Şölen" }).click();
console.log("after manage", JSON.stringify(await ev(`const o = g.s.owned.merv; return { loy: o.loy, tax: o.tax, gar: o.gar, gold: g.s.res.gold };`)));
await shot("05-manage");
await ev(`g.hud.close();`);
await ev(`g.s.counterAt = 1;`);
await page.waitForTimeout(1500);
console.log("after counter", JSON.stringify(await ev(`return { owned: Object.keys(g.s.owned), chron: g.s.chron.slice(-3) };`)));
await dismiss();
await ev(`if (g.s.owned.merv) g.s.owned.merv.loy = 0; g.s.owned.merv && (g.s.owned.merv.tax = 2);`);
for (let k = 0; k < 20 && (await ev<boolean>(`return !!g.s.owned.merv;`)); k++) {
  await ev(`g.s.resAt -= 60000;`);
  await page.waitForTimeout(150);
}
await shot("06-revolt");
await dismiss();
console.log("after revolt", JSON.stringify(await ev(`return { owned: Object.keys(g.s.owned), conq: g.s.c.conquests, titles: g.s.titles };`)));
console.log("errors:", errs);
await browser.close();
