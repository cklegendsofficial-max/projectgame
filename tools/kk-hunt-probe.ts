import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
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
const dismiss = async () => {
  for (let k = 0; k < 8 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await page.waitForTimeout(1200);
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await page.waitForTimeout(400);
await dismiss();
console.log("reason (no army):", await ev(`return g.surekReason();`));
await ev(`g.s.hero.army = { spear: 6, archer: 6, horse: 4 }; g.s.res.food = 300;`);
console.log("reason:", JSON.stringify(await ev(`return g.surekReason();`)));
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel .grow", { hasText: "Sürek Avı" }).locator(".btn").click();
await page.waitForTimeout(500);
for (let i = 0; i < 60; i++) {
  await page.keyboard.press("Space");
  await page.waitForTimeout(250);
  if (i === 20) await page.screenshot({ path: `playtest/hunt-${mode}.png` });
  if (await page.locator(".aresult.on").count()) break;
}
await page.waitForFunction(() => document.querySelector(".aresult.on"), null, { timeout: 30000 });
console.log("result:", (await page.locator(".aresult.on").innerText()).replace(/\n/g, " | "));
console.log("after:", await ev(`return [g.s.res.food, g.s.hero.cargo.deri ?? 0, g.s.buffs, g.surekReason()];`));
await page.locator(".aresult .quit").click();
console.log("errors:", errs);
await browser.close();
