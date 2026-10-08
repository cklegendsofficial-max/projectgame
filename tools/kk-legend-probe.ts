import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/legend-${mode}`;
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

const base = await ev(`return { atk: g.heroAtk(), def: g.heroDef(), hp: g.maxHp(), army: g.heroBonus(), crit: g.champion().crit };`);

// guaranteed legend drops
await ev(`for (let i = 0; i < 6; i++) g.legendDrop(99);`);
await shot("01-drop-story");
await dismiss();
console.log("drops", JSON.stringify(await ev(`return g.s.hero.bag.filter(i => i.set || i.uq).map(i => [i.name, i.set ?? i.uq, i.slot, i.rar, i.tier]);`)));

// forge a full set
await ev(`const s = g.s; s.res.gold = 99999; s.mats.ruh = 99; s.mats.parsomen = 20; s.hero.cargo.yesim = 30; const c = g.targetPos({kind:"city", i: 6}); s.hero.x = c.x; s.hero.y = c.y;`);
await ev(`g.hud.openPlace({kind:"city", i: 6}); g.hud.tab = "atolye"; g.hud.render(); document.querySelector(".panel .body, .panel")?.scrollTo?.(0, 99999); for (const el of document.querySelectorAll(".panel *")) if (el.scrollHeight > el.clientHeight + 20) el.scrollTop = 99999;`);
await shot("02-forge");
for (const sl of ["silah", "zirh", "at", "tilsim"]) {
  await ev(`g.forgeSet("gokkurt", "${sl}");`);
  await page.waitForTimeout(8600);
  await dismiss();
}
await ev(`for (const it of g.s.hero.bag.filter(i => i.set === "gokkurt")) g.equip(it.id);`);
const after = await ev(`return { atk: g.heroAtk(), def: g.heroDef(), hp: g.maxHp(), army: g.heroBonus(), crit: g.champion().crit, set: g.setCount("gokkurt"), mods: g.gearMods(), codex: g.s.codex.length + "/" + g.codexMax() };`);
console.log("base", JSON.stringify(base));
console.log("after", JSON.stringify(after));
await ev(`g.hud.close(); g.hud["openHero"](); g.hud.tab = "techizat"; g.hud.render();`);
await shot("03-equip");
await ev(`for (const el of document.querySelectorAll(".panel *")) if (el.scrollHeight > el.clientHeight + 20) el.scrollTop = 99999;`);
await shot("04-codex");
console.log("errors:", errs);
await browser.close();
