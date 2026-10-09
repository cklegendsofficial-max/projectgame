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
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel .grow", { hasText: "Kuşak Güreşi" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `playtest/games-${mode}-list.png` });
await page.locator(".panel .grow", { hasText: "Kuşak Güreşi" }).locator(".btn").click();
await page.waitForTimeout(500);
const gold0 = await ev<number>(`return g.s.res.gold;`);
// İbreyi izleyip ortadayken bas (kusursuz zamanlama botu)
for (let i = 0; i < 400; i++) {
  const st = await ev<{ n: number; warn: number; done: boolean } | null>(`const m = g.hud.minigame; return m ? { n: m.needle, warn: m.warn, done: m.done } : null;`);
  if (!st || st.done) break;
  if (st.warn > 0 || Math.abs(st.n - 0.5) < 0.04) await ev(`g.hud.minigame.press();`);
  await page.waitForTimeout(25);
}
await page.waitForTimeout(300);
await page.screenshot({ path: `playtest/games-${mode}-wr.png` });
console.log("wr result:", (await page.locator(".aresult.on").innerText()).replace(/\n/g, " | "), "games:", await ev(`return g.s.games;`), "gold", gold0, "->", await ev(`return g.s.res.gold;`));
await page.locator(".aresult .quit").click();
await page.waitForTimeout(200);
await ev(`g.hud.openMini("kb");`);
await page.waitForTimeout(2500);
for (let i = 0; i < 3; i++) {
  await page.keyboard.press("Space");
  await page.waitForTimeout(400);
}
await page.screenshot({ path: `playtest/games-${mode}-kb.png` });
console.log("kb hud:", await page.locator(".ahud").innerText());
await page.keyboard.press("Escape");
console.log("closed:", await ev(`return [!!g.hud.minigame, g.battleLock];`));
console.log("errors:", errs);
await browser.close();
