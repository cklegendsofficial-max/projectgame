import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/wound-${mode}-${cls}`;
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
  for (let k = 0; k < 5 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(250);
  }
};
const check = (ok: boolean, what: string) => console.log(ok ? "OK  " : "FAIL", what);
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();

await ev(`g.s.hero.lv = 6; g.s.hero.army = {spear: 14, archer: 8, horse: 4}; g.s.hero.hp = g.maxHp(); const c = g.s.camps.filter((c) => c.alive && c.tier <= 4).sort((a, b) => b.tier - a.tier)[0]; c.garrison = {spear: 70, archer: 50, horse: 40}; const h = g.s.hero; h.x = c.x + 20; h.y = c.y; g.attackCamp(g.s.camps.indexOf(c));`);
await page.waitForSelector(".tact", { timeout: 5000 });
await page.locator(".tact").nth(1).click();
await page.waitForSelector(".battle .result .btn", { timeout: 40000 });
const note = (await page.locator(".battle .result").textContent()) ?? "";
check(note.includes("yaralı"), "yenilgi notunda yaralılar");
await page.locator(".battle .result .btn").click();
await dismiss();
const sc = await ev<{ x: number; y: number; w?: Record<string, number> }[]>(`return g.s.scars;`);
const ws = sc.find((c) => c.w);
check(!!ws, "savaş izinde bekleyen yaralı var");
const want = ws ? Object.values(ws.w!).reduce((a, b) => a + b, 0) : 0;
console.log("yaralı", want, ws?.w);
await ev(`const c = g.s.scars.find((c) => c.w); g.s.hero.x = c.x + 220; g.s.hero.y = c.y + 40; g.cam.flyTo(c.x + 60, c.y, 1.6);`);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}-01-flag.png` });
const before = await ev<number>(`return Object.values(g.s.hero.army).reduce((a, b) => a + b, 0);`);
await ev(`const c = g.s.scars.find((c) => c.w); g.s.hero.x = c.x + 10; g.s.hero.y = c.y;`);
await page.waitForTimeout(800);
const after = await ev<number>(`return Object.values(g.s.hero.army).reduce((a, b) => a + b, 0);`);
check(after > before, `yaralılar katıldı (${before} → ${after})`);
check((await ev<number>(`return g.s.scars.filter((c) => c.w).length;`)) === 0, "bayrak kalktı");
await page.screenshot({ path: `${out}-02-joined.png` });
console.log("errors:", errs);
await browser.close();
