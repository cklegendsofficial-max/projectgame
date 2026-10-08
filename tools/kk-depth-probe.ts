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
// crafting
await ev(`g.hud.close(); const c = g.targetPos({kind:"city", i: 6}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.s.hero.path = null; g.cam.flyTo(c.x, c.y, 0.8); g.s.hero.cargo = { demir: 40, deri: 30, pamuk: 20, gumus: 10, turkuaz: 12, yesim: 6, baharat: 10, ipek: 4 }; g.s.mats.ruh = 10; g.s.res.gold = 20000;`);
await ev(`g.hud.openPlace({kind:"city", i: 6}); g.hud.tab = "atolye"; g.hud.render();`);
await shot("04-atolye");
const rars: number[] = [];
for (let k = 0; k < 6; k++) {
  await ev(`g.craftGear("silah", 2); if (g.act) g.act.t = g.act.dur;`);
  await page.waitForTimeout(150);
}
for (const id of ["merhem", "davul", "totem"]) {
  await ev(`g.craftCons("${id}"); if (g.act) g.act.t = g.act.dur;`);
  await page.waitForTimeout(150);
}
await ev(`g.refine("ruhdamit"); if (g.act) g.act.t = g.act.dur;`);
await page.waitForTimeout(150);
console.log("craft", JSON.stringify(await ev(`return { bag: g.s.hero.bag.map(i => i.name + " r" + i.rar), cons: g.s.cons, ruh: g.s.mats.ruh, zanaat: g.skill("zanaat"), cargo: g.s.hero.cargo, gold: Math.round(g.s.res.gold) };`)), rars.length);
const b0 = await ev<number>(`return g.heroBonus();`);
await ev(`g.useCons("davul"); g.useCons("totem"); g.s.hero.hp = 10; g.useCons("merhem");`);
console.log("buffs", JSON.stringify(await ev(`return { buffs: g.s.buffs, b0: ${b0}, b1: g.heroBonus(), hp: Math.round(g.s.hero.hp), cons: g.s.cons };`)));
await ev(`g.hud.tab = "atolye"; g.hud.render();`);
await shot("05-atolye-after");
await ev(`g.hud.close(); g.hud["openHero"](); g.hud.tab = "techizat"; g.hud.render();`);
await shot("06-bag");
// side quests
await ev(`g.hud.close(); g.s.sideQ = []; g.s.board = {}; const c = g.targetPos({kind:"city", i: 6}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.hud.openPlace({kind:"city", i: 6}); g.hud.tab = "han"; g.hud.render();`);
await shot("07-board");
console.log("board", JSON.stringify(await ev(`return g.sideBoard("bukhara").map(q => [q.kind, q.title, q.need, q.gold, q.xp, q.to, q.good]);`)));
await ev(`for (const q of [...g.sideBoard("bukhara")]) g.takeSide("bukhara", q.id);`);
const g0 = await ev<number>(`return g.s.res.gold;`);
await ev(`g.hud.close(); const s = g.s; for (const q of s.sideQ) { if (q.kind === "deliver") s.hero.cargo[q.good] = q.need + 1; if (q.kind === "ruh") s.mats.ruh += q.need; if (q.kind === "ruin") s.ruins[q.ruin].looted = true; if (["hunt","camp","craft","kurgan","raid"].includes(q.kind)) s.c[{hunt:"wins",camp:"camps",craft:"crafted",kurgan:"kurgans",raid:"raids"}[q.kind]] += q.need; } const c = g.targetPos({kind:"city", i: 6}); s.hero.x = c.x + 800; s.hero.y = c.y;`);
await page.waitForTimeout(600);
await shot("08-tracker");
await ev(`const c = g.targetPos({kind:"city", i: 6}); g.s.hero.x = c.x; g.s.hero.y = c.y;`);
await page.waitForTimeout(800);
for (let k = 0; k < 3; k++) {
  await ev(`const q = g.s.sideQ[0]; if (q) { const c = g.sideGoto(q); g.s.hero.x = c.x; g.s.hero.y = c.y; }`);
  await page.waitForTimeout(700);
}
console.log("sides", JSON.stringify(await ev(`return { left: g.s.sideQ.length, done: g.s.c.sides, gold: Math.round(g.s.res.gold - ${g0}) };`)));
console.log("errors:", errs);
await browser.close();
