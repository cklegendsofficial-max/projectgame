import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/dynasty-${mode}`;
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
await ev(`g.s.beylik = true; g.s.res.gold = 5000; g.rivalDaily();`);
console.log("rivals", await ev(`return g.s.rivals.map(r => [r.name, r.age, r.heirs, r.status]);`));
// marriage via dialog
await ev(`const r = g.s.rivals[3]; r.rel = 45; r.status = "peace"; g.meetRival(3);`);
await page.waitForTimeout(300);
const opts = await page.locator(".battle .bbox .btn").allTextContents();
console.log("opts", opts);
await page.locator(".battle .bbox .btn", { hasText: "dünürcü" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}-1.png` });
await dismiss();
console.log("family", await ev(`return g.s.family;`), "rival", await ev(`const r = g.s.rivals[3]; return [r.status, r.rel, r.wed];`), "ally bonus", await ev(`return g.allyBonus();`));
// kids
await ev(`for (let k = 0; k < 6; k++) { g.s.family.next = 0; g.kidBorn(); }`);
await ev(`g.s.family.kids.length = Math.min(3, g.s.family.kids.length); g.s.family.kids.forEach(k => k.born = -40);`);
console.log("kids", await ev(`return g.s.family.kids;`), "famBonus", await ev(`return g.famBonus();`));
// natural death -> heir
await ev(`const r = g.s.rivals[0]; r.status = "ally"; r.rel = 70; g.succeed(r, "olum");`);
console.log("succession ally", await ev(`const r = g.s.rivals[0]; return [r.name, r.gen, r.age, r.status, r.rel, r.heirs];`));
// killed -> heir vengeance
await ev(`const r = g.s.rivals[1]; r.heirs = ["Togan"]; g.succeed(r, "kilic");`);
console.log("succession kill", await ev(`const r = g.s.rivals[1]; return [r.name, r.status, r.rel];`));
await ev(`const r = g.s.rivals[1]; r.heirs = []; g.succeed(r, "kilic");`);
console.log("line ended", await ev(`return g.s.rivals[1].status;`));
await ev(`g.hud.openHero(); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel h3", { hasText: "Hanedan" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-2.png` });
await page.locator(".panel h3", { hasText: "Beyler" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-3.png` });
console.log("errors:", errs);
await browser.close();
