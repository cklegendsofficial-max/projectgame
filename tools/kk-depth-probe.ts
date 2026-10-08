import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/depth-${mode}`;
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
  for (let k = 0; k < 8 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
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

// talents
await ev(`g.s.hero.xp = 0; for (let i = 0; i < 11; i++) { g.s.hero.xp += 99999; g.addXp(0); } g.s.res.gold = 9000;`);
const atk0 = await ev<number>(`return g.heroAtk();`);
await ev(`g.hud["openHero"](); g.hud.tab = "yetenek"; g.hud.render();`);
await shot("01-tree");
for (const id of ["keskin", "keskin", "keskin", "kritik", "kritik", "kritik", "nara", "taktik", "deve", "ruzgar", "efsane"]) await ev(`g.learnTalent("${id}");`);
await ev(`g.hud.render();`);
await shot("02-tree-spent");
console.log("talents", JSON.stringify(await ev(`return { lv: g.s.hero.lv, tpts: g.s.hero.tpts, tal: g.s.hero.tal, atk0: ${atk0}, atk1: g.heroAtk(), crit: g.champion().crit };`)));
await ev(`g.respecTalents();`);
console.log("respec", JSON.stringify(await ev(`return { tpts: g.s.hero.tpts, tal: g.s.hero.tal, gold: g.s.res.gold };`)));

// class skills
await ev(`for (const sk of g.classSkills()) for (let i = 0; i < 4; i++) g.learn(sk.id);`);
console.log("skills", JSON.stringify(await ev(`return g.champion().skills;`)));
const evs = await page.evaluate(`import("/src/game/battle.ts").then(m => { const g = window.game; const r = m.fight({spear: 20, archer: 10, horse: 5}, g.heroBonus(), {spear: 30, archer: 20, horse: 10}, 0, g.champion(), {name: "Test", icon: "x", atk: 30, def: 10, hp: 600}); return [...new Set(r.rounds.flatMap(x => x.ev))]; })`);
console.log("events", JSON.stringify(evs));
await ev(`g.hud["openHero"](); g.hud.tab = "beceri"; g.hud.render();`);
await shot("03-skills");
console.log("errors:", errs);
await browser.close();
