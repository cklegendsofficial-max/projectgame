import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/nem2-${mode}`;
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
const shot = async (n: string, w = 400) => {
  await page.waitForTimeout(w);
  await page.screenshot({ path: `${out}-${n}.png` });
};
const settle = async (pick: RegExp | null, snap = "") => {
  for (let k = 0; k < 80; k++) {
    await page.waitForTimeout(250);
    if (await page.locator(".battle .result .btn").count()) { await page.locator(".battle .result .btn").first().click(); continue; }
    if (await page.locator(".battle .rlog").count()) continue;
    if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); continue; }
    const ch = page.locator(".battle .bbox.choice");
    if (await ch.count()) {
      if (snap) { await shot(snap, 100); snap = ""; }
      const b = pick ? ch.locator(".btn", { hasText: pick }) : ch.locator(".btn");
      await ((await b.count()) ? b.first() : ch.locator(".btn").first()).click();
      continue;
    }
    if (await page.locator(".battle .bbox.story .btn").count()) { await page.locator(".battle .bbox.story .btn").first().click(); continue; }
    break;
  }
};
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await settle(null);
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await settle(null);
await ev(`while (g.s.hero.lv < 14) { g.s.hero.xp += 2000; g.addXp(0); } const st = g.s.hero.stats; for (const k of Object.keys(st)) st[k] += 20;`);
await settle(null);
await ev(`const h = g.s.hero; const c = g.s.camps[0]; h.x = c.x + 160; h.y = c.y + 160; g.cam.flyTo(h.x, h.y, 1);`);

const spawnFor = (idx: number) => `const n = g.s.nemeses[${idx}]; const h = g.s.hero; let b = g.nemesisOut(n); if (!b) { b = { id: g.s.nextId++, camp: n.camp, tier: g.s.camps[n.camp].tier, x: h.x + 120, y: h.y, army: { spear: 1, archer: 0, horse: 0 }, tx: h.x + 120, ty: h.y, wait: 99, chase: false }; g["nemGang"](b, n); g.s.bandits.push(b); }`;
const beat = async (idx: number, pick: RegExp, snap: string) => {
  for (let r = 0; r < 8; r++) {
    if (!(await ev<boolean>(`return g.s.nemeses[${idx}].alive;`))) break;
    await ev(`g.s.hero.army = { spear: 150, archer: 80, horse: 60 }; g.s.hero.hp = g.maxHp(); ${spawnFor(idx)} g["engageBandit"](b, false);`);
    await settle(pick, snap);
  }
};

await ev(`g["newNemesis"](0, "loss");`);
await settle(null);
await beat(0, /Kan kardeşi/, "01-fate");
await shot("02-bro");
console.log("bro", JSON.stringify(await ev(`const n = g.s.nemeses[0]; return { bro: n.bro, alive: n.alive, trait: n.trait, mods: g.gearMods(), slain: g.s.c.slain };`)));

await ev(`g["newNemesis"](1, "loss"); g["newNemesis"](2, "loss"); g["newNemesis"](3, "loss");`);
await settle(null);
for (let k = 0; k < 40 && !(await ev<boolean>(`return g.s.nemeses.some(n => n.han);`)); k++) await ev(`g.s.nemDay = 0; const r = Math.random; g.s.nemeses.forEach(n => { if (n.bro) n.trait = "korkusuz"; }); g["nemTick"]();`);
await page.waitForTimeout(300);
await shot("03-kurultay");
await settle(null);
const hi = await ev<number>(`return g.s.nemeses.findIndex(n => n.han);`);
console.log("han", hi, JSON.stringify(await ev(`return g.s.nemeses.map(n => [n.epithet + " " + n.name, n.lv, n.alive, !!n.han, !!n.bro]);`)));
if (hi >= 0) await beat(hi, /Kılıçtan/, "04-hanfate");
console.log("after han", JSON.stringify(await ev(`return g.s.nemeses.map(n => [n.name, n.lv, n.alive, !!n.han, !!n.bro]);`)));

await ev(`g.s.nemeses[0].trait = "kurnaz"; g.s.nemDay = 0; const r = Math.random; Math.random = () => 0.001; try { g["nemTick"](); } finally { Math.random = r; }`);
await page.waitForTimeout(300);
await shot("05-betray");
await settle(null);
console.log("betray", JSON.stringify(await ev(`const n = g.s.nemeses[0]; return { bro: !!n.bro, alive: n.alive, lv: n.lv };`)));
await ev(`g.hud["openHero"](); g.hud.tab = "unvan"; g.hud.render();`);
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector(".grow.nem")?.scrollIntoView());
await shot("06-tab");
console.log("errors:", errs);
await browser.close();
