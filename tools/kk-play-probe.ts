import { chromium } from "playwright-core";

// Organik oynanış botu: köle evresi -> hürriyet -> asker toplama ve kamp basma; zamanlamaları ölçer.
const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const slaveMin = Number(process.argv[4] ?? 6);
const freeMin = Number(process.argv[5] ?? 10);
const out = `playtest/play-${mode}-${cls}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("kk_settings", JSON.stringify({ speed: 3, spoils: true, tips: true, pages: true, fires: true }));
});
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
await page.screenshot({ path: `${out}-00-title.png` });
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}-01-name.png` });
await page.locator(".cname .btn").click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}-02-intro.png` });

await ev(`
window.__bot = { log: [], lv: [], phase: "slave", t0: performance.now(), battles: [], stories: [], tips: [], stuck: 0 };
setInterval(() => {
  const g = window.game, s = g.s, h = s.hero, B = window.__bot;
  const real = () => Math.round((performance.now() - B.t0) / 1000);
  if (B.lv.length === 0 || B.lv[B.lv.length - 1].lv !== h.lv) B.lv.push({ lv: h.lv, game: Math.round(s.time), real: real() });
  const story = document.querySelector(".battle .bbox.story");
  if (story) { const t = story.querySelector("h2")?.textContent || ""; if (B.stories[B.stories.length - 1] !== t) B.stories.push(t); const ob = story.querySelector(".btn:not(.off)"); if (ob) ob.click(); else B.log.push("stuck:" + t); return; }
  const tip = document.querySelector(".tipc:not(.out)"); if (tip) { const t = tip.textContent.slice(0, 60); if (!B.tips.includes(t)) B.tips.push(t); tip.querySelector(".x").click(); }
  const lvc = document.querySelector(".lvup"); if (lvc && !lvc.classList.contains("out")) lvc.classList.add("out");
  const spk = document.querySelectorAll(".spk:not(.off)"); if (spk.length) { (spk[1] || spk[0]).click(); return; }
  const tacts = document.querySelectorAll(".tact"); if (tacts.length) { (document.querySelector(".tact.last") || tacts[0]).click(); return; }
  const dskip = document.querySelector(".dskip"); if (dskip) { dskip.click(); return; }
  const res = document.querySelector(".battle .result .btn");
  if (res) { const r = document.querySelector(".battle .result"); B.battles.push({ t: Math.round(s.time), win: !!document.querySelector(".battle .won, .result.won, .won"), txt: r.textContent.slice(0, 120) }); res.click(); return; }
  const anyBtn = document.querySelector(".battle .btn:not(.ord):not(.fast):not(.off)"); if (document.querySelector(".battle")) { if (anyBtn && !document.querySelector(".bbox.war")) { B.log.push("modal:" + (document.querySelector(".battle h2")?.textContent || "?")); anyBtn.click(); } return; }
  if (g.act) return;
  const near = (x, y) => Math.hypot(x - h.x, y - h.y);
  const go = (t, x, y) => { if (!h.path || !h.path.length) g.goTo(t); };
  if (B.phase === "slave") {
    if (s.free) { B.phase = "free"; B.log.push("free@" + Math.round(s.time) + "s/" + real()); return; }
    if (s.res.gold >= g.freedomCost()) { if (g.atCapital()) { g.buyFreedom(); } else go({ kind: "capital" }); return; }
    if (h.energy < 10) return;
    let bi = -1, bd = 1e9; s.nodes.forEach((n, i) => { const d = near(n.x, n.y); if (d < bd) { bd = d; bi = i; } });
    if (bd > 80) go({ kind: "node", i: bi }); else g.work(bi);
    return;
  }
  while (h.points > 0) { const p = h.points; g.statUp(g.cls().primary[0]); if (h.points === p) break; }
  if (g.nearCity() >= 0) for (const k of ["wood", "stone", "food"]) if (s.res[k] >= 1) g.sellRes(k, s.res[k]);
  if (!g.eq("silah")) {
    if (g.atCapital()) { const w = g.smith("samarkand").filter((it) => it.slot === "silah" && !g.canUse(it)).sort((a, b) => g.itemBuyPrice(a) - g.itemBuyPrice(b))[0]; if (w && s.res.gold >= g.itemBuyPrice(w)) { g.buyItem("samarkand", w.id); g.equip(w.id); B.log.push("weapon@" + Math.round(s.time)); return; } }
    else if (s.res.gold >= 40) { go({ kind: "capital" }); return; }
  }
  if (s.res.gold < 25 && s.res.wood + s.res.stone + s.res.food > 120) { go({ kind: "capital" }); return; }
  const size = Object.values(h.army).reduce((a, b) => a + b, 0);
  const cap = g.heroCap();
  if (h.hp < g.maxHp() * 0.45) { const ci = g.nearCity(); if (ci >= 0) { if (h.hp < g.maxHp() * 0.9) { if (!B.resting) { B.resting = 1; g.rest(); } } return; } B.resting = 0; go({ kind: "capital" }); return; }
  B.resting = 0;
  if (size < Math.min(cap, 12) && s.res.gold >= 30) {
    let vi = -1, vd = 1e9; s.villages.forEach((v, i) => { if (v.rec > 0) { const d = near(v.x, v.y); if (d < vd) { vd = d; vi = i; } } });
    if (vi >= 0) { if (vd > 70) go({ kind: "village", i: vi }); else { g.recruit(vi, cap - size); if (Object.values(h.army).reduce((a, b) => a + b, 0) === size) { const u = s.res.gold > 200 ? "archer" : "spear"; g.hire(u, Math.min(4, cap - size)); } } return; }
  }
  let ci = -1, cd = 1e9; s.camps.forEach((c, i) => { if (!c.alive) return; const o = g.odds(c.garrison, 0.1); const d = near(c.x, c.y); if (o >= 0.6 && d < cd) { cd = d; ci = i; } });
  if (ci >= 0) { if (cd > 70) go({ kind: "camp", i: ci }); else { B.battlesTried = (B.battlesTried || 0) + 1; g.attackCamp(ci); } return; }
  if (h.energy >= 10) { let bi = -1, bd = 1e9; s.nodes.forEach((n, i) => { if (n.left > 0) { const d = near(n.x, n.y); if (d < bd) { bd = d; bi = i; } } }); if (bi >= 0) { if (bd > 80) go({ kind: "node", i: bi }); else g.work(bi); } }
}, 250);
`);

const snap = async (tag: string) => {
  const st = await ev<Record<string, unknown>>(`const s = g.s, h = s.hero; return { phase: window.__bot.phase, day: g.dayOf().day, gt: Math.round(s.time), lv: h.lv, gold: Math.round(s.res.gold), army: Object.values(h.army).reduce((a, b) => a + b, 0), cap: g.heroCap(), hp: Math.round(h.hp) + "/" + g.maxHp(), energy: Math.round(h.energy), quest: s.quest, ch: s.story?.ch, renown: s.renown, kills: s.kills, camps: s.c.camps, shifts: s.c.shifts };`);
  console.log(tag, JSON.stringify(st));
};

const t0 = Date.now();
let k = 0;
while (Date.now() - t0 < slaveMin * 60000) {
  await page.waitForTimeout(30000);
  await snap(`slave+${++k * 30}s`);
  if ((await ev<string>(`return window.__bot.phase;`)) === "free") break;
  if (k % 4 === 0) await page.screenshot({ path: `${out}-1${k}-slave.png` });
}
await page.screenshot({ path: `${out}-20-freed.png` });
const t1 = Date.now();
k = 0;
while (Date.now() - t1 < freeMin * 60000) {
  await page.waitForTimeout(30000);
  await snap(`free+${++k * 30}s`);
  if (k % 4 === 0) await page.screenshot({ path: `${out}-3${String(k).padStart(2, "0")}-free.png` });
}
const bot = await ev<Record<string, unknown>>(`return window.__bot;`);
console.log("LV", JSON.stringify(bot.lv));
console.log("LOG", JSON.stringify(bot.log).slice(0, 1500));
console.log("STORIES", JSON.stringify(bot.stories));
console.log("TIPS", JSON.stringify(bot.tips));
const bs = bot.battles as { win: boolean; txt: string }[];
console.log("BATTLES", bs.length, "tried", bot.battlesTried, JSON.stringify(bs.slice(0, 6)));
console.log("errors:", errs);
await browser.close();
