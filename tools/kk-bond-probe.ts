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
const box = ".battle .bbox.story";
const dismiss = async () => {
  for (let k = 0; k < 8 && (await page.locator(`${box} .btn`).count()); k++) {
    await page.locator(`${box} .btn`).first().click();
    await page.waitForTimeout(200);
  }
};
const toCq = () => ev(`const t = g.cqTarget(); const p = g.targetPos(t); g.s.hero.x = p.x; g.s.hero.y = p.y; return t;`);

await page.locator(`.ccard[data-c="kam"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await page.waitForTimeout(1500);
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom(); g.s.beylik = true; g.addCompanion("ayse"); g.addCompanion("batu");`);
await page.waitForTimeout(400);
await dismiss();
const heal0 = await ev<number>(`return g.compMods().heal;`);
await ev(`g.bondEvent("kilic");`);
console.log("after kilic:", await ev(`return g.s.bond;`), "toasts:", (await page.locator(".toasts > *").allInnerTexts()).slice(-2));
await ev(`g.s.bond.ayse = 60; g.bondDaily();`);
await page.waitForTimeout(300);
console.log("offer:", (await page.locator(box).innerText()).slice(0, 70).replace(/\n/g, " "));
await page.locator(`${box} .btn`, { hasText: "Yanındayım" }).click();
console.log("cq:", await ev(`return g.s.cq;`), "target:", await toCq());
await ev(`g.hud.openHero(); g.hud.tab = "ordu"; g.hud.render();`);
await page.waitForTimeout(300);
console.log("go btn:", await page.locator(".panel .cqgo").count(), "bond bars:", await page.locator(".panel .bar.bond").count());
await page.screenshot({ path: `playtest/bond-${mode}.png` });
await ev(`g.hud.close();`);
await page.waitForTimeout(1800);
console.log("step1:", (await page.locator(box).innerText()).slice(0, 60).replace(/\n/g, " "));
await dismiss();
await page.waitForTimeout(2500);
console.log("step2 btns:", await page.locator(`${box} .btn`).allInnerTexts());
await page.locator(`${box} .btn`, { hasText: "kurultay" }).click();
await page.waitForTimeout(400);
console.log("finish:", (await page.locator(box).innerText()).slice(0, 90).replace(/\n/g, " "));
await dismiss();
console.log("done:", await ev(`return [g.s.cqDone, g.s.cq, g.s.bond.ayse, g.s.res.gold];`), "heal:", heal0, "->", await ev(`return g.compMods().heal;`));
console.log("errors:", errs);
await browser.close();
