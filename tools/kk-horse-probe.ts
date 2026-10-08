import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/horse-${mode}`;
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
await ev(`for (let i = 0; i < 6; i++) { g.s.hero.xp += 999999; g.addXp(0); }`);
await dismiss();

const cityI = await ev<number>(`for (let i = 0; i < 12; i++) { const p = g.targetPos({ kind: "city", i }); if (!p) continue; g.s.hero.path = null; g.target = null; g.s.hero.x = p.x; g.s.hero.y = p.y - 40; const n = g.nearCity(); if (n >= 0 && g.s.serais && g.hud) { if (g.canStud(Object.keys(g.s.board)[0] || "")) {} } if (n === i && g.horseShop && i > 0) return i; } return 1;`);
const cid = await ev<string>(`const p = g.targetPos({ kind: "city", i: ${cityI} }); g.s.hero.x = p.x; g.s.hero.y = p.y - 40; return Object.entries(g.s.board).length ? "" : "";`);
void cid;
const city = await ev<string>(`for (const id of ["samarkand","bukhara","kashgar","merv","nishapur","rey","tabriz","konya","constantinople"]) { if (g["atCity"](id)) return id; } return "";`);
console.log("city", cityI, city);
await ev(`g.s.res.gold = 50000; g.s.serais["${city}"] = { lv: 1, coffer: 0 };`);
await ev(`g.hud.openPlace({ kind: "city", i: ${cityI} }); g.hud.tab = "han"; g.hud.render();`);
await page.waitForTimeout(300);
for (const b of await ev<string[]>(`return g.horseShop("${city}");`)) await ev(`g.buyHorse("${b}", "${city}");`);
await ev(`g.buyHorse("bozkir", "${city}");`);
await ev(`g.hud.render();`);
await page.evaluate(() => [...document.querySelectorAll(".panel h3")].find((h) => h.textContent?.includes("At pazarı"))?.scrollIntoView());
await shot("01-shop");
await page.evaluate(() => [...document.querySelectorAll(".panel h3")].find((h) => h.textContent?.includes("Ahır"))?.scrollIntoView());
await page.locator(".panel .grow .btn", { hasText: /^Seç$/ }).nth(0).click();
await page.waitForTimeout(150);
await page.locator(".panel .grow .btn", { hasText: /^Seç$/ }).nth(0).click();
await page.waitForTimeout(150);
await page.evaluate(() => [...document.querySelectorAll(".panel h3")].find((h) => h.textContent?.includes("Ahır"))?.scrollIntoView());
await shot("02-pick");
await page.locator(".panel .btn.big", { hasText: "Çiftleştir" }).click();
await page.waitForTimeout(300);
console.log("stud", JSON.stringify(await ev(`return g.s.stud && { a: g.s.stud.a.name, b: g.s.stud.b.name };`)));
await page.evaluate(() => [...document.querySelectorAll(".panel h3")].find((h) => h.textContent?.includes("Ahır"))?.scrollIntoView());
await shot("03-wait");
await ev(`g.s.stud.until = 0;`);
await page.waitForTimeout(800);
await shot("04-born");
await dismiss();
console.log("foal", JSON.stringify(await ev(`const f = g.s.hero.bag.filter(i => i.slot === "at").pop(); return { name: f.name, spd: f.spd, carry: f.carry, hp: f.hp, horse: f.horse, rar: f.rar, foals: g.s.c.foals };`)));
for (let k = 0; k < 6; k++) {
  await ev(`const hs = g.studHorses().sort((a, b) => b.spd - a.spd); g.breedHorses(hs[0].id, hs[1].id, "${city}"); g.s.stud.until = 0;`);
  await page.waitForTimeout(500);
  await dismiss();
}
console.log("gens", JSON.stringify(await ev(`return g.studHorses().map(h => [h.name, h.horse && h.horse.gen, h.spd]);`)));
console.log("errors:", errs);
await browser.close();
