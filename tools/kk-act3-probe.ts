import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const pick = process.argv[3] ?? "hurriyet";
const out = `playtest/act3-${mode}`;
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
const shot = async (n: string, w = 400) => {
  await page.waitForTimeout(w);
  await page.screenshot({ path: `${out}-${n}.png` });
};
const settle = async (snap = "", stopAt = "") => {
  for (let k = 0; k < 80; k++) {
    await page.waitForTimeout(250);
    if (await page.locator(".battle .result .btn").count()) { await page.locator(".battle .result .btn").first().click(); continue; }
    if (await page.locator(".battle .rlog").count()) continue;
    if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); continue; }
    if (stopAt && (await page.locator(".battle .bbox h2", { hasText: stopAt }).count())) return;
    if (await page.locator(".battle .bbox .btn").count()) {
      if (snap) { await shot(snap, 100); snap = ""; }
      await page.locator(".battle .bbox .btn").first().click();
      continue;
    }
    break;
  }
};
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await settle();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await settle();
await page.waitForTimeout(1200);
await settle();
await ev(`const s = g.s; s.story.done = true; s.story.ch = 5; s.act2.done = true; s.act2.ch = 5; s.hero.lv = 30; s.beylik = true;
  s.hero.army = { spear: 500, archer: 500, horse: 500 }; s.comps = ["ayse", "korkut"]; s.mats.ruh = 80;`);
console.log("chapter:", await ev(`return g.sagaLabel() + " · " + g.chapter().title;`));
const ki = await ev<number>(`const i = ${"g.s"} && 0; for (let j = 0; j < 12; j++) { const p = g.targetPos({ kind: "city", i: j }); if (!p) continue; g.s.hero.x = p.x; g.s.hero.y = p.y - 40; if (g.atCity && g.atCity("kashgar")) return j; } return -1;`);
console.log("kashgar idx", ki);
await ev(`g.hud.openPlace({ kind: "city", i: ${ki} });`);
await shot("1");
await page.locator(".saga-box .btn.go").first().click();
await settle("2");
console.log("after scene:", await ev(`return g.sagaLabel() + " · " + g.chapter().title;`));
await ev(`g.s.kurultay.held = 1; g.s.renown = 1200;`);
await page.waitForTimeout(1200);
await settle("3");
console.log("after auto:", await ev(`return [g.sagaLabel(), g.chapter().title, g.s.act3.peak];`));
await ev(`const p = g.s.act3.peak; g.s.hero.x = p.x; g.s.hero.y = p.y + 50; g.cam.flyTo(p.x, p.y, 0.8);`);
await page.waitForTimeout(800);
await ev(`g.hud.openPlace({ kind: "peak" });`);
await shot("4");
console.log("odds", await ev(`return g.peakOdds().toFixed(2);`));
await ev(`g.hud.close(); g.climbPeak();`);
await settle("", "Kut'un Sahibi");
await shot("5");
console.log("act3", await ev(`return g.s.act3;`));
if (await page.locator(".battle .bbox h2", { hasText: "Kut'un Sahibi" }).count()) {
  const idx = ["kagan", "hurriyet", "ozan", "tengri"].indexOf(pick);
  await page.locator(".battle .bbox.choice .btn").nth(idx).click();
  await page.waitForTimeout(500);
  await shot("6");
  await settle();
}
console.log("ending", await ev(`return [g.s.act3, g.chapter(), g.s.villages.slice(0, 3).map((v) => v.rep)];`));
await ev(`g.hud.openHero();`);
await shot("7");
console.log("ach ending", await ev(`return localStorage.getItem("kk_ach");`));
console.log("errors:", errs);
await browser.close();
