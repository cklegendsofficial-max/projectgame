import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
for (let k = 0; k < 6 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
  await page.locator(".battle .bbox.story .btn").first().click();
  await page.waitForTimeout(250);
}
const rate = async () => {
  const t0 = await ev<number>(`return g.s.time;`);
  await page.waitForTimeout(2000);
  return ((await ev<number>(`return g.s.time;`)) - t0) / 2;
};
console.log("1x rate:", (await rate()).toFixed(2));
await page.locator(".top [data-spd]").click();
await page.locator(".top [data-spd]").click();
await page.waitForTimeout(300);
console.log("btn:", await page.locator(".top [data-spd]").innerText());
console.log("3x rate:", (await rate()).toFixed(2));
await ev(`g.hud.openHero();`);
await page.waitForTimeout(300);
console.log("3x with panel:", (await rate()).toFixed(2));
await page.keyboard.press("Escape");
await page.keyboard.press("t");
await page.waitForTimeout(300);
console.log("after T:", await page.locator(".top [data-spd]").innerText(), (await rate()).toFixed(2));
await page.screenshot({ path: "playtest/speed-1.png" });
console.log("errors:", errs);
await browser.close();
