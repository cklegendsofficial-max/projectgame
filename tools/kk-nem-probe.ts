import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/nem-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.addInitScript(() => {
  setInterval(() => (document.querySelector(".tact.last") as HTMLElement | null)?.click(), 300);
});
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 12 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
const shot = async (n: string, w = 400) => {
  await page.waitForTimeout(w);
  await page.screenshot({ path: `${out}-${n}.png` });
};
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await ev(`for (let i = 0; i < 10; i++) { g.s.hero.xp += 999999; g.addXp(0); } const st = g.s.hero.stats; for (const k of Object.keys(st)) st[k] += 20;`);

const settle = async () => {
  for (let k = 0; k < 60; k++) {
    await page.waitForTimeout(250);
    if (await page.locator(".battle .result .btn").count()) { await page.locator(".battle .result .btn").first().click(); continue; }
    if (await page.locator(".battle .rlog").count()) continue;
    if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); continue; }
    if (await page.locator(".battle .bbox.story .btn").count()) { await page.locator(".battle .bbox.story .btn").first().click(); continue; }
    break;
  }
};
await ev(`const h = g.s.hero; h.army = { spear: 0, archer: 0, horse: 0 }; const c = g.s.camps[0]; h.x = c.x + 160; h.y = c.y + 160; g.cam.flyTo(h.x, h.y, 1);`);
await ev(`g["newNemesis"](0, "loss");`);
await shot("01-born");
await dismiss();
const spawn = `const n = g.s.nemeses[0]; const h = g.s.hero; const b = { id: g.s.nextId++, camp: 0, tier: g.s.camps[0].tier, x: h.x + 120, y: h.y, army: { spear: 1, archer: 0, horse: 0 }, tx: h.x + 120, ty: h.y, wait: 99, chase: false }; g["nemGang"](b, n); g.s.bandits.push(b); return b.id;`;
await ev(spawn);
await page.waitForTimeout(800);
await shot("02-world");
console.log("nem", JSON.stringify(await ev(`const n = g.s.nemeses[0]; const b = g.nemesisOut(n); return { n, army: b && b.army };`)));
await ev(`g.s.hero.army = { spear: 120, archer: 60, horse: 40 }; g.s.hero.hp = g.maxHp();`);
for (let r = 0; r < 6; r++) {
  const alive = await ev<boolean>(`return g.s.nemeses[0].alive;`);
  if (!alive) break;
  await ev(`const n = g.s.nemeses[0]; let b = g.nemesisOut(n); if (!b) { ${spawn.replace("return b.id;", "")} b = g.nemesisOut(n); } g["engageBandit"](b, false);`);
  await page.waitForTimeout(300);
  if (r === 0) await shot("03-fight", 200);
  await settle();
  console.log("round", r, JSON.stringify(await ev(`const n = g.s.nemeses[0]; return { alive: n.alive, lv: n.lv, scars: n.scars, name: n.epithet + " " + n.name, slain: g.s.c.slain };`)));
}
await ev(`g["newNemesis"](1, "loss"); g["newNemesis"](2, "loss");`);
await dismiss();
await ev(`g.s.nemDay = 0; g["nemTick"]();`);
await ev(`g.hud["openHero"](); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector(".grow.nem")?.scrollIntoView());
await shot("04-tab");
await ev(`g.hud.tab = "karakter"; g.hud.render();`);
await page.waitForTimeout(200);
await page.evaluate(() => document.querySelector(".chron")?.scrollIntoView());
await shot("05-chron");
console.log("chron", JSON.stringify(await ev(`return g.s.chron.map(c => c.t);`)));
console.log("errors:", errs);
await browser.close();