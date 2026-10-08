import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/bird-${mode}`;
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

console.log("pos", JSON.stringify(await ev(`g.s.res.gold = 20000; const p = g.targetPos({ kind: "city", i: 1 }); g.s.hero.path = null; g.target = null; g.s.hero.x = p.x; g.s.hero.y = p.y - 40; return { p, near: g.nearCity() };`)));
await page.waitForTimeout(300);
console.log("near", await ev(`return [g.nearCity(), g.s.hero.x, g.s.hero.y];`));
await ev(`g.hud.openPlace({ kind: "city", i: 1 }); g.hud.tab = "han"; g.hud.render();`);
await page.waitForTimeout(300);
await page.evaluate(() => [...document.querySelectorAll(".panel h3")].find((h) => h.textContent?.includes("Kuşçu"))?.scrollIntoView());
await shot("01-shop");
await page.locator(".panel .grow", { hasText: "Doğan" }).locator(".btn").click();
await page.waitForTimeout(300);
await dismiss();
console.log("bird", JSON.stringify(await ev(`return g.s.bird;`)));
await ev(`const h = g.s.hero; h.x += 200; h.y += 200; g.cam.flyTo(h.x, h.y, 1);`);
await page.waitForTimeout(1500);
await shot("02-orbit");
await page.locator(".birdbtn").click();
await page.waitForTimeout(200);
console.log("aim", await ev(`return g.birdAim;`));
const box = await page.locator(".mini").boundingBox();
await page.mouse.click(box!.x + box!.width * 0.2, box!.y + box!.height * 0.5);
await page.waitForTimeout(1500);
console.log("fly", JSON.stringify(await ev(`return g.birdFly;`)));
await ev(`const f = g.birdFly; g.cam.flyTo(f.x, f.y, 0.8);`);
await shot("03-fly", 300);
await page.waitForTimeout(12000);
console.log("after", JSON.stringify(await ev(`return { fly: g.birdFly, bird: g.s.bird, ready: g.birdReady() };`)));
await ev(`g.s.bird.huntT = 0;`);
await page.waitForTimeout(800);
await ev(`g.s.bird.xp = 9999; g["birdXp"](1);`);
console.log("lv", JSON.stringify(await ev(`return { bird: g.s.bird, scouts: g.scouts(), mods: g.gearMods() };`)));
await ev(`g.hud["openHero"](); g.hud.tab = "ordu"; g.hud.render();`);
await page.evaluate(() => [...document.querySelectorAll(".panel h3")].find((h) => h.textContent?.includes("Av kuşu"))?.scrollIntoView());
await shot("04-tab");
console.log("errors:", errs);
await browser.close();