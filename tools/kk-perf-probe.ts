import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.addInitScript(() => setInterval(() => (document.querySelector(".tact.last") as HTMLElement | null)?.click(), 300));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
for (let k = 0; k < 8 && (await page.locator(".battle .bbox .btn").count()); k++) await page.locator(".battle .bbox .btn").first().click();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
for (let k = 0; k < 8 && (await page.locator(".battle .bbox .btn").count()); k++) await page.locator(".battle .bbox .btn").first().click();
await ev(`while (g.s.hero.lv < 15) { g.s.hero.xp += 2000; g.addXp(0); } g.s.explored.fill(1); g.view.fogDirty = true; g.s.beylik = true;`);
for (let k = 0; k < 8 && (await page.locator(".battle .bbox .btn").count()); k++) await page.locator(".battle .bbox .btn").first().click();
await ev(`g.cam.zoom = 0.35; const p = g.targetPos({kind:"city", i: 3}); g.goTo({kind:"point", x: p.x, y: p.y});`);
await page.waitForTimeout(2000);

const measure = async (tag: string) => {
  const r = (await page.evaluate(`new Promise((res) => {
    const ts = []; let last = performance.now(); const t0 = last;
    function f() {
      const t = performance.now(); ts.push(t - last); last = t;
      if (t - t0 < 4000) requestAnimationFrame(f);
      else { ts.sort((a, b) => a - b); res({ n: ts.length, avg: ts.reduce((a, b) => a + b, 0) / ts.length, p95: ts[Math.floor(ts.length * 0.95)], max: ts[ts.length - 1] }); }
    }
    requestAnimationFrame(f);
  })`)) as { n: number; avg: number; p95: number; max: number };
  console.log(tag, `frames ${r.n} avg ${r.avg.toFixed(1)}ms p95 ${r.p95.toFixed(1)}ms max ${r.max.toFixed(1)}ms`);
};
await measure("zoomed-out walking");
await ev(`g.cam.zoom = 1;`);
await measure("zoom 1");
await ev(`g.hud["openHero"](); g.hud.tab = "unvan"; g.hud.render();`);
await measure("panel open");
await ev(`g.hud.close(); g.cam.zoom = 0.35;`);

const cdp = await page.context().newCDPSession(page);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
await cdp.send("Profiler.start");
await page.waitForTimeout(4000);
const { profile } = (await cdp.send("Profiler.stop")) as { profile: { nodes: { id: number; callFrame: { functionName: string; url: string; lineNumber: number }; hitCount?: number }[]; samples: number[]; timeDeltas: number[] } };
const self = new Map<string, number>();
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
profile.samples.forEach((id, i) => {
  const n = byId.get(id)!;
  const cf = n.callFrame;
  const key = `${cf.functionName || "(anon)"} ${cf.url.split("/").pop()?.split("?")[0]}:${cf.lineNumber}`;
  self.set(key, (self.get(key) ?? 0) + (profile.timeDeltas[i] ?? 0));
});
const total = [...self.values()].reduce((a, b) => a + b, 0);
console.log("top self time (of", (total / 1000).toFixed(0), "ms):");
for (const [k, v] of [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22)) console.log(`  ${((v / total) * 100).toFixed(1)}%  ${k}`);
console.log("errors:", errs);
await browser.close();
