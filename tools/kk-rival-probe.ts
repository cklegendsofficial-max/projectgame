import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/rival-${mode}`;
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
await ev(`while (g.s.hero.lv < 12) { g.s.hero.xp += 1000; g.addXp(0); }`);
await dismiss();
await page.waitForTimeout(500);
console.log("rivals", JSON.stringify(await ev(`return g.s.rivals.map(r => [r.id, r.status, r.lv, Math.round(r.x), Math.round(r.y), r.rel]);`)));
await ev(`g.s.explored.fill(1); g.s.res.gold = 50000; const cap = g.heroCap(); g.s.hero.army = { spear: Math.round(cap * 0.4), archer: Math.round(cap * 0.3), horse: Math.round(cap * 0.3) }; g.s.hero.hp = g.maxHp();`);
const r0 = await ev<{ x: number; y: number }>(`const r = g.s.rivals[1]; return { x: r.x, y: r.y };`);
await ev(`g.s.hero.x = ${r0.x} + 60; g.s.hero.y = ${r0.y}; g.cam.flyTo(${r0.x}, ${r0.y}, 1);`);
await page.waitForTimeout(1200);
await shot("01-map");
await ev(`g.meetRival(1);`);
await shot("02-meet");
for (let k = 0; k < 6; k++) await ev(`g.battleLock = false; g["rivalGift"](1);`);
await page.locator(".battle .bbox.choice .btn", { hasText: "Yoluna" }).click();
await ev(`g.meetRival(1);`);
await page.locator(".battle .bbox.choice .btn", { hasText: "İttifak" }).click();
await page.waitForTimeout(300);
await shot("03-ally");
await dismiss();
console.log("ally", JSON.stringify(await ev(`return { st: g.s.rivals[1].status, rel: g.s.rivals[1].rel, bonus: g.allyBonus() };`)));
await ev(`g.s.hero.army.horse += 150; g.meetRival(0);`);
await page.locator(".battle .bbox.choice .btn", { hasText: "Savaş aç" }).click();
await page.waitForTimeout(1500);
await shot("04-battle");
for (let k = 0; k < 6 && !(await page.locator(".battle .bbox.choice .btn", { hasText: "Biat ettir" }).count()); k++) {
  if (await page.locator(".battle .rlog").count()) {
    await page.waitForTimeout(500);
    const close = page.locator(".battle .bbox:not(.story) .btn.go");
    if (await close.count()) await close.first().click().catch(() => {});
  } else if (await page.locator(".battle .bbox.story .btn").count()) await page.locator(".battle .bbox.story .btn").first().click();
  await page.waitForTimeout(400);
}
await shot("05-fate");
const fate = page.locator(".battle .bbox.choice .btn", { hasText: "Kılıçtan" });
if (await fate.count()) await fate.click();
await page.waitForTimeout(300);
await dismiss();
console.log("after fight", JSON.stringify(await ev(`return g.s.rivals.map(r => [r.id, r.status, r.defeats, Math.round(r.rel)]);`)));
await ev(`g.s.rivals[2].rel = -80; for (let d = 0; d < 6; d++) { g.s.rivalDay = 0; g["rivalDaily"](); }`);
await dismiss();
console.log("daily", JSON.stringify(await ev(`return g.s.rivals.map(r => [r.id, r.status, r.lv, Math.round(r.rel)]);`)));
await ev(`g.hud["openHero"](); g.hud.tab = "unvan"; g.hud.render();`);
await page.evaluate(() => [...document.querySelectorAll(".panel h3")].find((h) => h.textContent?.includes("Beyler"))?.scrollIntoView());
await shot("06-list");
await ev(`g.hud.close();`);
console.log("errors:", errs);
await browser.close();
