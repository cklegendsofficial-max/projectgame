import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/settings-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1, acceptDownloads: true });
const page = await ctx.newPage();
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
page.on("dialog", (d) => void d.accept());
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
const ready = () => page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
await ready();
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 10; k++) {
    if (!(await page.locator(".battle .bbox.story .btn, .battle .bbox.choice .btn").count())) break;
    await page.locator(".battle .bbox.story .btn, .battle .bbox.choice .btn").first().click();
    await page.waitForTimeout(200);
  }
};
const shot = async (n: string, w = 400) => {
  await page.waitForTimeout(w);
  await page.screenshot({ path: `${out}-${n}.png` });
};
const openSettings = async () => {
  await page.locator('[data-b="hero"]').click();
  await page.locator('.tabs button', { hasText: "⚙" }).click();
};
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 4321; g.s.hero.lv = 7; g.saveNow();`);
await openSettings();
await shot("1-panel");
const slider = page.locator('input[data-set="music"]');
await slider.fill("20");
const music = await page.evaluate(() => JSON.parse(localStorage.getItem("kk_settings") ?? "{}").music);
console.log("music after slider:", music);
await page.locator(".setrow .btn", { hasText: "%130" }).click();
const ui = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ui"));
console.log("ui var:", ui);
await shot("2-ui130");
await page.locator(".setrow .btn", { hasText: "%100" }).click();
await page.locator(".setrow .btn", { hasText: "Açık" }).first().click();
console.log("mini hidden:", await page.evaluate(() => document.body.classList.contains("nomini")));
await page.locator(".setrow .btn", { hasText: "Kapalı" }).first().click();

const dl = page.waitForEvent("download");
await page.locator(".btn", { hasText: "Dışa aktar" }).click();
const file = await (await dl).path();
const exported = readFileSync(file!, "utf8");
console.log("export bytes:", exported.length, "v3:", JSON.parse(exported).v === 3);

const nav0 = page.waitForEvent("framenavigated");
await page.locator(".sslot .btn", { hasText: "Yeni oyun" }).first().click();
await nav0;
await ready();
console.log("slot now:", await page.evaluate(() => localStorage.getItem("kk_slot")), "class select:", await page.locator(".ccard").count());
await page.locator(`.ccard[data-c="kam"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.saveNow();`);
await openSettings();
await shot("3-slot2");
const rows = await page.locator(".sslot").allInnerTexts();
console.log("slots:", rows.map((r) => r.replace(/\s+/g, " ")));

const fc = page.waitForEvent("filechooser");
await page.locator(".btn", { hasText: "İçe aktar" }).click();
const nav = page.waitForEvent("framenavigated");
await (await fc).setFiles(file!);
await nav;
await ready();
await page.waitForTimeout(500);
console.log("after import gold/lv/cls:", await ev(`return [Math.floor(g.s.res.gold), g.s.hero.lv, g.s.cls];`));

await page.waitForTimeout(600);
await dismiss();
await openSettings();
const nav2 = page.waitForEvent("framenavigated");
await page.locator(".sslot .btn", { hasText: "Yükle" }).first().click();
await nav2;
await ready();
await page.waitForTimeout(500);
console.log("slot back:", await page.evaluate(() => localStorage.getItem("kk_slot")), await ev(`return [Math.floor(g.s.res.gold), g.s.hero.lv, g.s.cls];`));
console.log("errors:", errs);
await browser.close();
