import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/season-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.addInitScript(() => setInterval(() => (document.querySelector(".tact.last") as HTMLElement | null)?.click(), 300));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 10; k++) {
    if (!(await page.locator(".battle .bbox.story .btn, .battle .bbox.choice .btn").count())) break;
    await page.locator(".battle .bbox.story .btn, .battle .bbox.choice .btn").first().click();
    await page.waitForTimeout(200);
  }
};
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await ev(`g.s.beylik = true; g.s.explored.fill(1); g.view.fogDirty = true; g.cam.zoom = 0.8;`);
for (const [i, k] of ["bahar", "yaz", "guz", "kis"].entries()) {
  await ev(`g.s.time = ${i * 4} * 150 + 20;`);
  await page.waitForTimeout(900);
  await dismiss();
  const r = await ev<[string, number, number, number, number]>(`return [g.season(), Math.round(g.heroSpeed()*100)/100, Math.round(g.ratePerMin("food")*10)/10, g.price("samarkand","deri"), g.price("samarkand","baharat")];`);
  const toasts = await page.locator(".toast").allInnerTexts();
  console.log(k, r, toasts.slice(-1));
  await page.screenshot({ path: `${out}-${i}-${k}.png` });
}
await ev(`g.hud.openPlace({kind:"city", i: 1});`);
await page.waitForTimeout(400);
console.log("market season line:", await page.locator(".panel .odds.mid").first().innerText().catch(() => "-"));
await page.screenshot({ path: `${out}-market.png` });
await ev(`g.hud.close(); g.s.garrison = { spear: 30, archer: 10, horse: 10 }; g.s.res.food = 0; g.starveT = 19.5;`);
await page.waitForTimeout(1500);
console.log("starve garrison:", await ev(`return g.s.garrison;`), (await page.locator(".toast").allInnerTexts()).filter((t) => t.includes("Ambarlar")));
console.log("errors:", errs);
await browser.close();
