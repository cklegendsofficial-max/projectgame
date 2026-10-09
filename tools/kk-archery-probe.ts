import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/archery-${mode}`;
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
  for (let k = 0; k < 10; k++) {
    if (!(await page.locator(".battle .bbox.story .btn").count())) break;
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await page.waitForTimeout(1200);
await dismiss();
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel .grow", { hasText: "Kabak Atma" }).locator(".btn").click();
await page.waitForTimeout(500);
console.log("open", await page.locator(".archery canvas").count(), "lock", await ev(`return g.battleLock;`));
const t0 = Date.now();
let shot = false;
while (Date.now() - t0 < 34000) {
  if (await page.locator(".archery .aresult.on").count()) break;
  if (mode === "mob") {
    const box = await page.locator(".archery canvas").boundingBox();
    await page.touchscreen.tap(box!.width * (0.4 + Math.random() * 0.5), box!.height * (0.3 + Math.random() * 0.4));
  } else await page.keyboard.press("Space");
  await page.waitForTimeout(380);
  if (!shot && Date.now() - t0 > 6000) {
    await page.screenshot({ path: `${out}-1.png` });
    shot = true;
  }
}
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}-2.png` });
console.log("result", await page.locator(".archery .aresult").innerText(), "best", await ev(`return g.s.ok;`), "gold", await ev(`return g.s.res.gold | 0;`));
await page.locator(".archery .aresult .quit").click();
await page.waitForTimeout(200);
console.log("closed", await page.locator(".archery").count(), "lock", await ev(`return g.battleLock;`));
console.log("errors:", errs);
await browser.close();
