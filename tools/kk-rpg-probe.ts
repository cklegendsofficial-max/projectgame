import { chromium, type Page } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/rpg-${mode}-${process.argv[3] ?? "suikastci"}`;
const shot = async (page: Page, name: string, wait = 400) => {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}-${name}.png` });
};
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.addInitScript(() => { setInterval(() => (document.querySelector(".tact.last") as HTMLElement | null)?.click(), 300); });
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const log = async (tag: string) => console.log(tag, JSON.stringify(await ev(`const h = g.s.hero; return { q: g.s.quest, gold: Math.round(g.s.res.gold), free: g.s.free, lv: h.lv, pts: h.points, hp: Math.round(h.hp), en: Math.round(h.energy), atk: +g.heroAtk().toFixed(1), army: h.army, bag: h.bag.map(i => i.name), eq: Object.values(h.equip).map(i => i.name), renown: g.s.renown, profit: g.s.c.profit, skills: h.skills, cls: g.s.cls, name: h.name, stats: h.stats };`)));

const cls = process.argv[3] ?? "suikastci";
await shot(page, "00-class", 900);
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname input").fill("Börü");
await shot(page, "00b-class-pick", 300);
await page.locator(".cname .btn").click();
await shot(page, "01-intro", 600);
await page.locator(".battle .btn").click();
await log("start");
// walk to work node
await ev(`const n = g.s.nodes[0]; g.goTo({kind:"node", i:0}); g.cam.flyTo(n.x, n.y, 0.8);`);
await shot(page, "02-walking", 2500);
await ev(`const n = g.s.nodes[0]; g.s.hero.x = n.x; g.s.hero.y = n.y; g.s.hero.path = null; g.target = null; g.hud.openPlace({kind:"node", i:0});`);
await shot(page, "03-node", 500);
await page.locator(".panel .btn.go.big").click();
await shot(page, "04-working", 2000);
await page.waitForTimeout(3500);
await log("after shift");
// fast forward shifts
for (let k = 0; k < 30; k++) await ev(`if (!g.act) { g.s.hero.energy = 99; g.work(0); } g.act && (g.act.t = g.act.dur);`);
await page.waitForTimeout(300);
await log("after 30 shifts");
// try escape
await ev(`g.hud.close(); g.goTo({kind:"city", i: 6});`);
await shot(page, "05-escape-blocked", 300);
// freedom
await ev(`g.s.res.gold = Math.max(g.s.res.gold, 110); const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.s.hero.path = null; g.target = null; g.hud.openPlace({kind:"capital"});`);
await shot(page, "06-master", 500);
await ev(`g.buyFreedom();`);
await shot(page, "07-freedom", 600);
for (let k = 0; k < 4 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
  await page.locator(".battle .bbox.story .btn").first().click();
  await page.waitForTimeout(250);
}
await ev(`g.s.res.gold += 120; g.hud.openPlace({kind:"capital"});`);
await page.locator(".tab", { hasText: "Demirci" }).click();
await shot(page, "08-smith", 400);
await ev(`const it = g.smith("samarkand")[0]; g.buyItem("samarkand", it.id);`);
await page.locator(".tab", { hasText: "Talim" }).click();
await page.locator(".panel .brow .btn").first().click();
await shot(page, "09-training", 1500);
await page.waitForTimeout(5000);
await log("trained");
await page.locator(".tab", { hasText: "Pazar" }).click();
await shot(page, "10-market", 400);
await ev(`g.s.res.gold += 400; g.buyGood("samarkand", "hali", 8);`);
await page.locator(".tab", { hasText: "Han" }).click();
await shot(page, "11-han", 400);
// solo bandit fight with a tier-1 bandit
await ev(`g.hud.close(); const v = g.s.villages.find(v => Math.hypot(v.x - g.s.hero.x, v.y - g.s.hero.y) > 500); g.s.bandits.push({ id: 99999, camp: 0, tier: 1, x: v.x + 30, y: v.y, army: {spear: 3, archer: 0, horse: 0}, tx: v.x + 30, ty: v.y, wait: 99, chase: false }); g.s.hero.x = v.x; g.s.hero.y = v.y; g.s.hero.path = null; g.cam.flyTo(v.x, v.y, 0.9); g.goTo({kind:"bandit", i: 99999});`);
await shot(page, "12-battle", 2500);
await page.waitForSelector(".battle .result .btn", { timeout: 15000 });
await shot(page, "13-battle-end", 300);
await page.locator(".battle .result .btn").click();
await log("after solo fight");
// item drops from camp
await ev(`g.s.hero.army = {spear: 25, archer: 10, horse: 5}; g.s.hero.hp = g.maxHp(); const c = g.s.camps[0]; g.s.hero.x = c.x + 20; g.s.hero.y = c.y; g.attackCamp(0);`);
await page.waitForSelector(".battle .result .btn", { timeout: 15000 });
await shot(page, "14-camp-loot", 300);
await page.locator(".battle .result .btn").click();
// sell carpets in Bukhara? compare prices
console.log("prices hali", JSON.stringify(await ev(`return ["samarkand","bukhara","konya","constantinople"].map(c => [c, g.buyPrice(c,"hali"), g.sellPrice(c,"hali")]);`)));
await ev(`const c = g.targetPos({kind:"city", i: 7}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.sellGood("konya", "hali", 99);`);
await ev(`g.s.hero.xp += 500; g.addXp(0); g.hud["openHero"]();`);
await ev(`g.addXp(1);`);
await shot(page, "15-hero", 1200);
for (let k = 0; k < 5 && (await page.locator(".battle .bbox .btn.go").count()); k++) {
  await page.locator(".battle .bbox .btn.go").first().click();
  await page.waitForTimeout(200);
}
await page.locator(".tab", { hasText: "Teçhizat" }).click();
await shot(page, "16-gear", 400);
await page.locator(".tab", { hasText: "Beceriler" }).click();
await ev(`g.learn(g.classSkills()[0].id); g.learn(g.classSkills()[0].id); g.learn(g.classSkills()[1].id);`);
await shot(page, "17-skills", 400);
// anvil
await ev(`g.s.mats.ruh = 20; g.s.res.gold += 3000; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.hud.close(); g.hud.openPlace({kind:"capital"});`);
await page.locator(".tab", { hasText: "Örs" }).click();
for (let k = 0; k < 5; k++) { await ev(`const w = g.s.hero.equip.silah; if (w && !g.act) g.upgradeItem(w.id, false); if (g.act) g.act.t = g.act.dur;`); await page.waitForTimeout(150); }
await shot(page, "18-anvil", 400);
// kurgan
await ev(`g.hud.close(); g.s.hero.army = {spear: 20, archer: 8, horse: 4}; g.s.hero.hp = g.maxHp(); const mt = Math.min(...g.s.kurgans.map(k => k.tier)); console.log("kurgan tiers", JSON.stringify(g.s.kurgans.map(k => k.tier))); const i = g.s.kurgans.findIndex(k => k.tier === mt); const k = g.s.kurgans[i]; g.reveal(k.x, k.y, 8); g.s.hero.x = k.x + 30; g.s.hero.y = k.y + 20; g.cam.flyTo(k.x, k.y, 0.9); g.hud.openPlace({kind:"kurgan", i});`);
await shot(page, "19-kurgan", 1200);
await page.locator(".panel .btn.red").click();
await shot(page, "20-kurgan-fight", 2500);
await page.waitForSelector(".battle .result .btn", { timeout: 20000 });
await shot(page, "21-kurgan-end", 300);
await page.locator(".battle .result .btn").click();
await log("end");
console.log("errors:", errs);
await browser.close();
