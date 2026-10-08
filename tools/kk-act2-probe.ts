import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/act2-${mode}`;
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
const settle = async (snap = "") => {
  for (let k = 0; k < 80; k++) {
    await page.waitForTimeout(250);
    if (await page.locator(".battle .result .btn").count()) { await page.locator(".battle .result .btn").first().click(); continue; }
    if (await page.locator(".battle .rlog").count()) continue;
    if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); continue; }
    if (await page.locator(".battle .bbox .btn").count()) {
      if (snap) { await shot(snap, 100); snap = ""; }
      await page.locator(".battle .bbox .btn").first().click();
      continue;
    }
    break;
  }
};
const chap = () => ev<string>(`const c = g.chapter(); return c ? g.sagaLabel() + " · " + c.title : "none";`);
const cityI = async (id: string) => ev<number>(`for (let i = 0; i < 12; i++) { const p = g.targetPos({ kind: "city", i }); if (!p) continue; g.s.hero.path = null; g.target = null; g.s.hero.x = p.x; g.s.hero.y = p.y - 40; if (g.atCity("${id}")) return i; } return -1;`);

await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await settle();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await settle();
await ev(`while (g.s.hero.lv < 26) { g.s.hero.xp += 5000; g.addXp(0); } const st = g.s.hero.stats; for (const k of Object.keys(st)) st[k] += 30;`);
await settle();
await ev(`g.s.story.ch = 4; g["placeFort"](); const f = g.s.story.fort; g.s.hero.x = f.x; g.s.hero.y = f.y + 30; g.s.hero.army = { spear: 200, archer: 150, horse: 120 }; g.s.hero.hp = g.maxHp();`);
await ev(`g.attackFort();`);
await settle("01-karahan");
console.log("after fort", await chap());
await shot("02-tracker");

const bi = await cityI("bukhara");
await ev(`g.hud.openPlace({ kind: "city", i: ${bi} });`);
await shot("03-korkut");
await page.locator(".panel .btn", { hasText: "Derinlere" }).click();
await settle();
console.log("ch2", await chap());
await ev(`g.s.deepBest = 10;`);
await page.waitForTimeout(800);
await settle();
console.log("ch3", await chap());
await ev(`g.s.rivals[0].status = "ally"; g.s.rivals[1].status = "vassal";`);
await page.waitForTimeout(800);
await settle();
console.log("ch4", await chap());
const ki = await cityI("kashgar");
await ev(`g.s.hero.army = { spear: 200, archer: 150, horse: 120 }; g.s.hero.hp = g.maxHp(); g.hud.openPlace({ kind: "city", i: ${ki} });`);
await shot("04-kam");
await page.locator(".panel .btn", { hasText: "Gölgeyle" }).click();
await settle("05-shade");
console.log("ch5", await chap(), JSON.stringify(await ev(`return g.s.act2;`)));
await ev(`const p = g.s.act2.gate; g.s.hero.x = p.x; g.s.hero.y = p.y + 40; g.cam.flyTo(p.x, p.y, 1); g.s.explored.fill(1);`);
await page.waitForTimeout(1000);
await shot("06-gate-map");
await ev(`g.hud.openPlace({ kind: "gate" });`);
await shot("07-gate-panel");
await ev(`g.s.hero.army = { spear: 400, archer: 300, horse: 250 }; g.s.hero.hp = g.maxHp(); g.hud.close(); g.attackGate();`);
await settle("08-erlik");
console.log("end", await chap(), JSON.stringify(await ev(`return { act2: g.s.act2, renown: g.s.renown, chron: g.s.chron.slice(-3).map(c => c.t) };`)));
await shot("09-after");
console.log("errors:", errs);
await browser.close();
