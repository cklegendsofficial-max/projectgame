import { chromium, type Page } from "playwright-core";

async function shot(page: Page, name: string, wait = 500): Promise<void> {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `playtest/fresh-${name}.png` });
}
const ev = (page: Page, fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`);

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [tag, vp] of [
  ["desk", { width: 1280, height: 720 }],
  ["mob", { width: 390, height: 844 }],
] as const) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: tag === "mob" ? 2 : 1, locale: "tr-TR" });
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2500);
  await shot(page, `${tag}-01-start`);
  await page.locator(".route .send").first().click();
  await page.waitForTimeout(2200);
  await shot(page, `${tag}-02-firstTrip`, 100);
  const tabs = await page.evaluate(() => [...document.querySelectorAll(".tab")].map((e) => (e as HTMLElement).offsetParent ? e.textContent : null).filter(Boolean));
  console.log(tag, "tabs at start:", tabs);

  await ev(page, `const s = g.s; s.tutorial = 5; s.gold = 1e5; s.routes[0].owned = 10; s.routes[1].owned = 1; s.masters[0] = true;`);
  await page.waitForTimeout(1500);
  await shot(page, `${tag}-03-unlockEvents`, 200);
  console.log(tag, "unlocked:", await ev(page, `return g.s.unlocked.join(",");`));
  await page.locator("#modal:not(.hidden) button.primary").first().click().catch(() => {});

  await ev(page, `g.s.routes[2].owned = 1;`);
  await page.waitForTimeout(3000);
  console.log(tag, "modal during calm:", await page.evaluate(() => { const m = document.getElementById("modal")!; return m.classList.contains("hidden") ? null : m.querySelector("h2")?.textContent; }));
  await page.waitForTimeout(4500);
  await shot(page, `${tag}-04-unlockArmy`, 200);
  await page.locator("#modal:not(.hidden) button.primary").first().click().catch(() => {});
  await page.waitForTimeout(800);
  await shot(page, `${tag}-05-afterGo`, 200);
  console.log(tag, "unlocked:", await ev(page, `return g.s.unlocked.join(",");`));

  for (let i = 0; i < 6; i++) await ev(page, `g.toasts.show("test toast ${i % 3}", "info", 3000);`);
  await shot(page, `${tag}-06-toasts`, 300);
  console.log(tag, "visible toasts:", await page.evaluate(() => document.querySelectorAll("#toasts .toast").length));
  console.log(tag, "errors:", errs);
  await page.close();
}
await browser.close();
