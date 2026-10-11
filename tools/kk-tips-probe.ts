import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/tips-${mode}-${cls}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("kk_settings", JSON.stringify({ tips: true }));
});
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 5 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(250);
  }
};
const check = (ok: boolean, what: string) => console.log(ok ? "OK  " : "FAIL", what);
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
check((await page.locator(".tipc").count()) === 0, "oyun başında ipucu yok");
await ev(`g.s.time = 30; g.tipGap = 0; g.s.hero.spts = 1;`);
await page.waitForSelector(".tipc", { timeout: 5000 });
await page.screenshot({ path: `${out}-01-tip.png` });
check((await page.locator(".tipc").textContent())!.includes("Beceri"), "beceri ipucu");
await page.locator(".tipc").click();
await page.waitForTimeout(500);
check((await page.locator(".tabs .tab.on").allTextContents()).some((x) => x.includes("Beceri")), "ipucu beceri sekmesini açtı");
await page.screenshot({ path: `${out}-02-open.png` });
await ev(`g.hud.close(); g.tipGap = 0; g.s.hero.hp = 5;`);
await page.waitForSelector(".tipc:not(.out)", { timeout: 5000 });
check((await page.locator(".tipc").textContent())!.includes("Yaralısın"), "yara ipucu");
await page.locator(".tipc .x").click();
await page.waitForTimeout(500);
check((await page.locator(".tipc").count()) === 0, "kapat düğmesi");
await ev(`g.tipGap = 0; g.s.hero.hp = 5;`);
await page.waitForTimeout(2500);
check((await page.locator(".tipc").count()) === 0, "aynı ipucu tekrar gelmez");
await ev(`g.s.hero.hp = g.maxHp(); g.s.hero.spts = 1; g.tipGap = 30;`);
await page.waitForTimeout(2000);
check((await page.locator(".tipc").count()) === 0, "aralık beklenir");
console.log("seen", await ev(`return g.s.tips;`));
console.log("errors:", errs);
await browser.close();
