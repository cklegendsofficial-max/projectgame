import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/photo-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1, hasTouch: mode === "mob", acceptDownloads: true });
const page = await ctx.newPage();
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
await page.waitForTimeout(500);
if (mode === "mob") {
  await ev(`g.hud.openHero(); g.hud.tab = "ayar"; g.hud.render();`);
  await page.waitForTimeout(200);
  await page.locator(".setrow", { hasText: "Fotoğraf modu" }).locator(".btn").click();
} else await page.keyboard.press("p");
await page.waitForTimeout(300);
console.log("photo on:", await page.evaluate(() => document.body.classList.contains("photo")), "hud hidden:", await page.evaluate(() => getComputedStyle(document.getElementById("hud")!).display));
const t0 = await ev<number>(`return g.now ?? g.s.t ?? 0;`);
const hx0 = await ev<string>(`return JSON.stringify([g.s.hero.x, g.s.hero.y, g.s.res.food]);`);
await page.waitForTimeout(1500);
console.log("paused:", hx0 === (await ev<string>(`return JSON.stringify([g.s.hero.x, g.s.hero.y, g.s.res.food]);`)), t0 === (await ev<number>(`return g.now ?? g.s.t ?? 0;`)));
await page.locator(".photobar .btn", { hasText: "Altın saat" }).click();
await page.locator(".photobar .btn", { hasText: "Çerçeve" }).click();
await page.waitForTimeout(200);
console.log("filter:", await page.evaluate(() => document.querySelector("canvas")!.style.filter));
await page.screenshot({ path: `${out}-1.png` });
if (mode === "mob") console.log("share api:", await page.evaluate(`(() => { const ok = typeof navigator.canShare; Object.defineProperty(navigator, "canShare", { value: undefined }); return ok; })()`));
const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 10000 }), page.locator(".photobar .btn.go").click()]);
await dl.saveAs(`${out}-snap.png`);
console.log("download:", dl.suggestedFilename());
if (mode !== "mob") {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  console.log("after esc photo:", await page.evaluate(() => document.body.classList.contains("photo")), "menu open:", await ev(`return g.hud.menuOpen;`));
}
console.log("errors:", errs);
await browser.close();
