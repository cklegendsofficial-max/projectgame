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
await ev(`g.s.fallen = [{ name: "Yaralı Turgut", lv: 2, kills: 14, day: 0 }, { name: "Alp Er Kaya", lv: 1, kills: 5, day: 0 }]; g.addFoe("Kanlı Bars", "nemesis"); g.addFoe("Bey Tekin", "rival"); g.addFoe("Albastı", "boss"); g.addFoe("Albastı", "boss"); g.s.res.food = 500; g.s.res.gold = 1000; g.s.res.stone = 400;`);
const b0 = await ev<number>(`return g.heroBonus();`);
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel .btn", { hasText: "Yas tut" }).scrollIntoViewIfNeeded();
await page.locator(".panel .btn", { hasText: "Yas tut" }).click();
await page.waitForTimeout(300);
console.log("story:", (await page.locator(".battle .bbox.story").innerText()).slice(0, 90).replace(/\n/g, " "));
await dismiss();
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(200);
await page.locator(".panel .btn", { hasText: "Balbal dik" }).first().click();
await page.waitForTimeout(150);
await page.locator(".panel .btn", { hasText: "Balbal dik" }).first().click();
await page.waitForTimeout(250);
console.log("foes:", JSON.stringify(await ev(`return g.s.foes.map((f) => [f.name, !!f.raised]);`)), "buffs", await ev(`return g.s.buffs;`), "bonus", b0.toFixed(3), "->", (await ev<number>(`return g.heroBonus();`)).toFixed(3), "stone", await ev(`return g.s.res.stone;`));
await page.locator(".panel .balbals").scrollIntoViewIfNeeded();
await page.screenshot({ path: `playtest/yug-${mode}.png` });
console.log("errors:", errs);
await browser.close();
