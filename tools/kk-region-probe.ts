import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/region-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1, hasTouch: mode === "mob" });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const storyCount = () => page.locator(".battle .bbox.story").count();
const dismiss = async () => {
  for (let k = 0; k < 16; k++) {
    if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); await page.waitForTimeout(300); continue; }
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
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await ev(`g.s.hero.lv = 12; g.s.res.gold = 5000; g.s.res.food = 1000; g.s.hero.army = { spear: 20, archer: 20, horse: 20 };`);
console.log("pois:", await ev(`return JSON.stringify(g.kipPois().map((p) => [p.kind, Math.round(p.x), Math.round(p.y)]));`));

await ev(`const p = g.kipPois()[0]; g.s.hero.x = p.x + 40; g.s.hero.y = p.y; g.cam.flyTo(p.x, p.y, 0.9);`);
await page.waitForTimeout(1600);
console.log("entry story:", await storyCount(), "seen:", await ev(`return g.kip().seen;`));
await page.screenshot({ path: `${out}-1.png` });
await dismiss();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}-map.png` });

await ev(`g.hud.openPlace({ kind: "kip", i: 0 });`);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-2.png` });
await ev(`g.kipGift();`);
console.log("rep after gift:", await ev(`return g.kip().rep;`), "reason:", await ev(`return g.kipGiftReason();`));
await ev(`g.kip().rep = 30; g.s.hero.army = { spear: 5, archer: 5, horse: 5 };`);
console.log("cap lv12:", await ev(`return g.heroCap();`));
const h0 = await ev<number>(`return g.s.hero.army.horse;`);
await ev(`g.kipHire();`);
console.log("hire +", (await ev<number>(`return g.s.hero.army.horse;`)) - h0, "reason now:", await ev(`return g.kipHireReason();`));
await ev(`g.s.hero.cargo.ipek = 5;`);
const sv = await ev<number>(`return g.kipSellValue();`);
const gold0 = await ev<number>(`return g.s.res.gold;`);
await ev(`g.kipSell();`);
console.log("sell value", sv, "gold +", (await ev<number>(`return g.s.res.gold;`)) - gold0);

await ev(`g.kipStep();`);
console.log("step after food:", await ev(`return g.kip().step;`));

await ev(`g.hud.openPlace({ kind: "kip", i: 1 });`);
await page.waitForTimeout(300);
console.log("fort odds lv12:", await ev(`return g.kipFortOdds() + " " + JSON.stringify(g.s.hero.army) + " champ " + JSON.stringify(g.champion()) + " bonus " + g.heroBonus();`));
await ev(`g.s.hero.lv = 12; g.hud.openPlace({ kind: "kip", i: 1 });`);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-3.png` });
await ev(`g.s.hero.army = { spear: 300, archer: 300, horse: 300 }; g.s.hero.lv = 14; for (const k in g.s.hero.stats) g.s.hero.stats[k] += 20;`);
console.log("odds strong:", await ev(`return g.kipFortOdds();`));
await ev(`g.kipFortAttack();`);
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}-battle.png` });
await dismiss();
console.log("fort:", await ev(`return g.kip().fort;`));
await dismiss();
await ev(`g.kipStep();`);
console.log("step after fort:", await ev(`return g.kip().step;`));

const stones = await ev<number>(`return g.kipPois().filter((p) => p.kind === "stone").length;`);
for (let i = 0; i < stones; i++) {
  await ev(`const p = g.kipPois().filter((p) => p.kind === "stone")[${i}]; g.s.hero.x = p.x + 10; g.s.hero.y = p.y; g.hero && (g.hero.path = []);`);
  await page.waitForTimeout(1300);
  if (i === 0) await page.screenshot({ path: `${out}-4.png` });
  await dismiss();
}
console.log("stones:", await ev(`return JSON.stringify(g.kip().stones);`));
await ev(`g.kipStep();`);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-5.png` });
await dismiss();
console.log("ally:", await ev(`return g.kip().ally;`), "mods:", await ev(`return JSON.stringify(g.compMods());`));
await ev(`g.hud.openPlace({ kind: "kip", i: 0 });`);
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-6.png` });
console.log("errors:", errs);
await browser.close();
