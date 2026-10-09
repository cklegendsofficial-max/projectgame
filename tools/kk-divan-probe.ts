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
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom(); g.s.beylik = true;`);
await page.waitForTimeout(400);
await dismiss();
await ev(`g.s.res.gold = 20000; g.hud.openHero(); g.hud.tab = "divan"; g.hud.render();`);
await page.waitForTimeout(300);
const card = page.locator(".panel .dipc").nth(1);
const rep0 = await ev<number>(`return g.rep("gazne");`);
await card.locator(".btn", { hasText: "Armağan" }).click();
await card.locator(".btn", { hasText: "Saldırmazlık" }).click();
await card.locator(".btn", { hasText: "Casus" }).click();
await card.locator(".btn", { hasText: "Casus" }).click();
await page.waitForTimeout(200);
console.log("gazne:", JSON.stringify(await ev(`return { rep: g.rep("gazne"), dip: g.dip("gazne"), peace: g.pact("gazne", "peace"), wall: g.siegeWall("merv") };`)), "rep0", rep0);
await page.locator(".panel .dipc").nth(1).locator(".btn.go", { hasText: "Haber topla" }).click();
await page.waitForTimeout(300);
console.log("op story:", (await page.locator(".battle .bbox.story").innerText()).slice(0, 140).replace(/\n/g, " "));
await dismiss();
console.log("after intel:", JSON.stringify(await ev(`return { intel: g.pact("gazne", "intel"), wall: g.siegeWall("merv"), reason: g.spyReason("gazne", "sabotage") };`)));
await ev(`g.hud.openHero(); g.hud.tab = "divan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.screenshot({ path: `playtest/divan-${mode}.png` });
console.log("errors:", errs);
await browser.close();
