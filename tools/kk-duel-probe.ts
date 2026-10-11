import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/duel-${mode}-${cls}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("kk_settings", JSON.stringify({ duel: true }));
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
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();

const fightOnce = async (aim: boolean) => {
  await ev(`g.s.hero.lv = 8; g.s.hero.army = {spear: 16, archer: 12, horse: 10}; g.s.hero.hp = g.maxHp(); const c = g.s.camps.filter((c) => c.tier <= 4).sort((a, b) => b.tier - a.tier)[${aim ? 0 : 1}]; c.garrison = {spear: 22, archer: 16, horse: 12}; g.s.hero.x = c.x + 20; g.s.hero.y = c.y; g.cam.flyTo(c.x, c.y, 0.9); g.attackCamp(g.s.camps.indexOf(c));`);
  await page.waitForSelector(".tact", { timeout: 5000 }).catch(async (e) => {
    console.log("no tact", await ev(`return { lock: g.battleLock, open: g.hud.battleOpen, html: document.querySelector(".battle")?.textContent?.slice(0, 200) };`));
    throw e;
  });
  await page.evaluate(() => {
    const w = window as unknown as { __r: () => number };
    w.__r = Math.random;
    Math.random = () => 0.1;
  });
  await page.locator(".tact").nth(0).click();
  await page.evaluate(() => {
    Math.random = (window as unknown as { __r: () => number }).__r;
  });
  await page.waitForSelector(".bbox.duel", { timeout: 4000 });
  if (aim) await page.screenshot({ path: `${out}-01-duel.png` });
  for (let k = 0; k < 3; k++) {
    await page.waitForFunction(() => !document.querySelector(".dhit")?.classList.contains("off"), null, { timeout: 4000 });
    if (aim)
      await page.evaluate(`new Promise((res) => {
        function loop() {
          const z = document.querySelector(".dzone").getBoundingClientRect();
          const n = document.querySelector(".dneedle").getBoundingClientRect();
          const x = n.left + n.width / 2;
          if (x > z.left + z.width * 0.3 && x < z.right - z.width * 0.3) { document.querySelector(".dhit").click(); return res(); }
          requestAnimationFrame(loop);
        }
        loop();
      })`);
    else await page.locator(".dhit").click();
    await page.waitForTimeout(900);
  }
  const msg = await page.locator(".dmsg").textContent();
  if (aim) await page.screenshot({ path: `${out}-02-won.png` });
  await page.locator(".dhit").click();
  await page.waitForSelector(".bbox.war", { timeout: 4000 });
  await page.waitForTimeout(1200);
  const mor = await page.locator(".bbox.war .bar.mor span").allTextContents();
  if (aim) await page.screenshot({ path: `${out}-03-battle.png` });
  await page.waitForSelector(".battle .result .btn", { timeout: 30000 });
  await page.locator(".battle .result .btn").click();
  await dismiss();
  return { msg, mor };
};

console.log("aimed", JSON.stringify(await fightOnce(true)));
console.log("duels", await ev(`return g.s.c.duels;`));
console.log("blind", JSON.stringify(await fightOnce(false)));
console.log("errors:", errs);
await browser.close();
