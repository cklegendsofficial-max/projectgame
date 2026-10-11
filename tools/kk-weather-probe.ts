import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/weather-${mode}`;
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
await ev(`for (let i = 0; i < 6; i++) { g.s.hero.xp += 999999; g.addXp(0); } const st = g.s.hero.stats; for (const k of Object.keys(st)) st[k] += 20;`);

const sp0 = await ev<number>(`return g.heroSpeed();`);
await ev(`const h = g.s.hero; g.s.storms.push({ id: 9001, kind: "kum", x: h.x, y: h.y, r: 320, vx: 0, vy: 0, age: 10, life: 200 }); g.s.storms.push({ id: 9002, kind: "yagmur", x: h.x + 700, y: h.y + 80, r: 300, vx: 0, vy: 0, age: 10, life: 200 }); g.reveal(h.x + 700, h.y + 80, 16); g.cam.flyTo(h.x + 300, h.y);`);
await page.waitForTimeout(1500);
const sp1 = await ev<number>(`return g.heroSpeed();`);
await shot("01-storms", 500);
await ev(`const h = g.s.hero; g.cam.flyTo(h.x, h.y); g.cam.zoom = 1.6;`);
await shot("02-sand-close", 900);
await ev(`const h = g.s.hero; g.cam.flyTo(h.x + 700, h.y + 80);`);
await shot("03-rain-close", 900);
await ev(`g.s.storms = []; g["stormT"] = 0;`);
await page.waitForTimeout(600);
console.log("speed", JSON.stringify({ sp0, sp1, ratio: sp1 / sp0 }));
console.log("spawned", JSON.stringify(await ev(`return g.s.storms.map(s => ({ kind: s.kind, r: Math.round(s.r) }));`)));
console.log("errors:", errs);
await browser.close();
