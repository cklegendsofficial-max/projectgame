import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/vets-${mode}`;
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
const stats = await ev(`
  g.s.hero.army = { spear: 40, archer: 30, horse: 30 };
  const notes = [];
  for (let k = 0; k < 40; k++) {
    const before = { ...g.s.hero.army };
    const win = k % 5 !== 4;
    const lostA = { spear: win ? 2 : 12, archer: win ? 1 : 9, horse: win ? 1 : 9 };
    const res = { win, lostA, lostB: { spear: 10, archer: 5, horse: 3 }, rounds: [], orders: [] };
    const n = g.vetsAfter(before, res, "Deneme");
    if (n) notes.push(n.replace(/<[^>]+>/g, ""));
  }
  return { vets: g.s.vets.map((v) => [v.name, v.lv, v.kills, v.scar]), notes: notes.slice(0, 12), chron: g.s.chron.filter((c) => /düştü|Alp/.test(c)).slice(0, 4), bonus: g.heroBonus().toFixed(3) };`);
console.log(JSON.stringify(stats, null, 1));
await ev(`g.hud.openHero(); g.hud.tab = "ordu"; g.hud.render();`);
await page.waitForTimeout(300);
await page.locator(".panel h3", { hasText: "Gaziler" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-1.png` });
await ev(`g.hud.close(); g.battle("Gazi testi", { spear: 20, archer: 10, horse: 5 }, 0, (w) => "ok");`);
for (let k = 0; k < 60; k++) {
  await page.waitForTimeout(300);
  if (await page.locator(".battle .result .btn").count()) break;
}
console.log("note:", await page.locator(".battle .result .loot").innerText().catch(() => ""));
await page.screenshot({ path: `${out}-2.png` });
console.log("errors:", errs);
await browser.close();
