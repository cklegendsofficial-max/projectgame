import { chromium } from "playwright-core";

// İnceleme turu: orta oyun durumu kurup eşya, atölye, demirci, ufuk ve harita ekranlarını çeker.
const mode = process.argv[2] ?? "desk";
const out = `playtest/review-${mode}`;
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
  for (let k = 0; k < 8 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
await page.screenshot({ path: `${out}-01-title.png` });
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
console.log("setup", JSON.stringify(await ev(`
  const s = g.s, h = s.hero;
  h.lv = 12; h.points = 0; s.res.gold = 6000; s.mats.ruh = 30; s.mats.parsomen = 4;
  for (let k = 0; k < 8; k++) g.drop(2 + (k % 4), 1);
  const best = {};
  for (const it of h.bag) if (g.canUse(it) && (!best[it.slot] || it.rar > best[it.slot].rar)) best[it.slot] = it;
  for (const it of Object.values(best)) g.equip(it.id);
  return { bag: h.bag.length, eq: Object.keys(h.equip), names: h.bag.map((i) => i.name + "/" + i.rar) };
`)));
await dismiss();
await ev(`g.hud.menuTo("techizat");`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}-02-gear.png` });
await ev(`g.hud.closeMenu?.(); g.hud.close?.(); g.hud.openPlace({kind:"capital"}); g.hud.tab = "atolye"; g.hud.render();`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}-03-craft.png` });
await ev(`g.hud.tab = "demirci"; g.hud.render();`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}-04-smith.png` });
await ev(`g.hud.close?.(); g.hud.menuTo("ufuk");`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}-05-ufuk.png` });
await ev(`g.hud.closeMenu?.(); g.hud.close?.(); for (let x = 0; x < 6000; x += 300) for (let y = 0; y < 3000; y += 300) g.reveal(x, y, 12); g.cam.flyTo(2600, 1300, 0.3);`);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}-06-world.png` });
await ev(`const c = g.targetPos({kind:"capital"}); g.cam.flyTo(c.x, c.y, 1.2);`);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}-07-city.png` });
console.log("errors:", errs);
await browser.close();
