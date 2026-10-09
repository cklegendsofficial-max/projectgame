import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/pulse-${mode}`;
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
const fails: string[] = [];
const check = (ok: boolean, what: string) => {
  console.log(ok ? "OK  " : "FAIL", what);
  if (!ok) fails.push(what);
};
const dismiss = async () => {
  for (let k = 0; k < 12; k++) {
    if (await page.locator(".battle .rlog").count()) {
      await page.waitForTimeout(400);
      const close = page.locator(".battle .bbox:not(.story) .btn.go, .battle .bbox:not(.story) .btn.big");
      if (await close.count()) await close.first().click({ timeout: 2000 }).catch(() => {});
      continue;
    }
    const b = page.locator(".battle .bbox.story .btn:not(.off), .battle .bbox.choice .btn:not(.off)");
    if (!(await b.count())) break;
    await b.first().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(200);
  }
};
const shot = async (n: string, w = 400) => {
  await page.waitForTimeout(w);
  await page.screenshot({ path: `${out}-${n}.png` });
};
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await ev(`while (g.s.hero.lv < 12) { g.s.hero.xp += 1000; g.addXp(0); }`);
await dismiss();
await ev(`g.s.beylik = true; g.s.renown = 300; g.s.res.gold = 5000; g.s.res.food = 500; g.s.hero.hp = g.maxHp(); const cap = g.heroCap(); g.s.hero.army = { spear: Math.round(cap * 0.4), archer: Math.round(cap * 0.3), horse: Math.round(cap * 0.3) };`);

// savaÅŸ
await ev(`g.warStart("karahan", "gazne");`);
await shot("01-war");
await page.locator(".battle .bbox.choice .btn").first().click();
check(await ev<boolean>(`return g.wd().wars[0]?.side === "karahan";`), "savaÅŸa katÄ±lÄ±m");
const gazneForts0 = await ev<number>(`return g.s.forts.filter(f => f.owner === "gazne").length;`);
for (let i = 0; i < 6; i++) await ev(`const w = g.wd().wars[0]; if (w) { w.score = 150; g.warTake(w); }`);
const after = await ev<{ occ: Record<string, string>; gf: number; kf: number; takes: number }>(`return { occ: { ...g.wd().occ }, gf: g.s.forts.filter(f => f.owner === "gazne").length, kf: g.s.forts.filter(f => f.owner === "karahan").length, takes: g.wd().wars[0].takes };`);
console.log("after takes", JSON.stringify(after), "gazne forts", gazneForts0);
check(after.takes === 6 && (Object.keys(after.occ).length > 0 || after.gf < gazneForts0), "cephe el deÄŸiÅŸtirdi");
const g0 = await ev<number>(`g.s.res.gold = 100; return g.s.res.gold;`);
await ev(`const w = g.wd().wars[0]; w.help = 30; g.warEnd(w, g.dayOf().day);`);
await shot("02-victory");
await dismiss();
const g1 = await ev<number>(`return g.s.res.gold;`);
console.log("gold", g0, "->", g1);
check(g1 > g0 + 100 && (await ev<number>(`return g.wd().wars.length;`)) === 0, "zafer Ã¶dÃ¼lÃ¼ + barÄ±ÅŸ");

await ev(`g.s.res.gold = 5000;`);

// ekonomi zinciri
const p0 = await ev<number>(`return g.price("bukhara", "ipek");`);
await ev(`g.addShort("bukhara", 8);`);
const p1 = await ev<number>(`return g.price("bukhara", "ipek");`);
check(p1 > p0 * 1.2, `kÄ±tlÄ±k fiyatÄ± ${p0.toFixed(1)} -> ${p1.toFixed(1)}`);
await ev(`for (let i = 0; i < 9; i++) { const p = g.targetPos({ kind: "city", i }); if (!p) continue; g.s.hero.path = null; g.target = null; g.s.hero.x = p.x; g.s.hero.y = p.y - 40; if (g.atCity("bukhara")) return; }`);
await ev(`g.wd().riotDay = {}; g.econDaily(g.dayOf().day);`);
await shot("03-riot");
const food0 = await ev<number>(`return g.s.res.food;`);
await page.locator(".battle .bbox.choice .btn").first().click().catch(() => {});
await page.waitForTimeout(200);
check((await ev<number>(`return g.s.res.food;`)) < food0, "isyanda ambar aÃ§Ä±ldÄ±");
check((await ev<number>(`return g.wd().deeds.length;`)) >= 1, "hafÄ±zaya kaydedildi");

// doÄŸa
await ev(`g.hud.close(); g.wd().wolves = 90;`);
await ev(`g.wolfPack();`);
await page.waitForTimeout(1500);
await shot("04-wolves", 200);
for (let i = 0; i < 30 && (await ev<boolean>(`return g.battleLock;`)); i++) {
  await dismiss();
  await page.waitForTimeout(500);
}
await dismiss();
check((await ev<number>(`return g.wd().wolves;`)) < 90, "kurt sÃ¼rÃ¼sÃ¼ daÄŸÄ±ldÄ±");
const dead = await ev<number>(`const c = g.s.camps[3]; c.alive = false; g.wd().drought = { until: g.dayOf().day, x: c.x, y: c.y }; g.natureDaily(g.dayOf().day); return g.s.camps.filter(x => !x.alive).length;`);
check((await ev<boolean>(`return g.wd().drought === null;`)) && dead >= 0, "kuraklÄ±k â†’ gÃ¶Ã§");
await dismiss();

// hafÄ±za karÅŸÄ±lÄ±ÄŸÄ±
await ev(`for (const d of g.wd().deeds) d.d -= 10;`);
let paid = false;
for (let i = 0; i < 40 && !paid; i++) {
  await ev(`g.hud.close(); g.memoryDaily(g.dayOf().day);`);
  paid = await ev<boolean>(`return g.wd().deeds.some(d => d.paid);`);
}
await shot("05-memory");
check(paid, "iyilik geri dÃ¶ndÃ¼");
await dismiss();

// Ã¶ÄŸrenen yÃ¶netmen
await ev(`const w = g.wd(); const d = g.dayOf().day; for (let i = 0; i < 10; i++) w.acts.push({ d, k: "savas" }); w.surpriseDay = -99; g.surpriseDaily(d);`);
check((await ev<number>(`return g.wd().surpriseDay;`)) > 0, "tekrar tespit edildi â†’ sÃ¼rpriz");
console.log("dir log", JSON.stringify(await ev(`return g.dir().log.slice(0, 2);`)));

// uyumlu taktik
await ev(`g.wd().tac = { hucum: 10, duvar: 1, pusu: 0 }; g.wd().tacWarn = -99;`);
await ev(`g.battle("Deneme", { spear: 5, archer: 5, horse: 5 }, 0, () => "", null, "Haramiler");`);
await page.waitForTimeout(600);
await shot("06-adapt");
await dismiss();
await page.waitForTimeout(1500);
await dismiss();

// Ã§aÄŸ
await ev(`g.s.kagan = true; g.eraDaily(g.dayOf().day);`);
await shot("07-era");
check((await ev<string>(`return g.wd().era;`)) === "altin", "AltÄ±n Ã‡aÄŸ");
await dismiss();

// dünya görevleri
const sq = await ev<{ aid: number; war: number }>(`const w = g.wd(); w.short.merv = 6; const out = { aid: 0, war: 0 }; for (let i = 0; i < 30; i++) { const q = g.makeSide("bukhara", []); if (q?.aid) out.aid++; } g.warStart("karahan", "gazne"); w.wars[w.wars.length - 1].side = "karahan"; for (let i = 0; i < 30; i++) { const q = g.makeSide("bukhara", []); if (q?.war) out.war++; } return out;`);
console.log("world quests", JSON.stringify(sq));
check(sq.aid > 0 && sq.war > 0, "kıtlık ve cephe görevleri");
await dismiss();

// Ak Börü
await ev(`g.hud.close(); g.s.kut = 90; g.s.hero.lv = 8; g.akBoru();`);
await shot("06b-boru");
await page.locator(".battle .bbox.choice .btn").first().click().catch(() => {});
await shot("06c-boru-lead", 900);
check((await ev<number>(`return g.wd().boru;`)) > 0, "Ak Börü karşılaşması");
await dismiss();

// takvim
const cal = await page.evaluate(async () => {
  const m = await import("/src/game/world.ts");
  return { nev: m.realFest(new Date(2027, 2, 21))?.id, hid: m.realFest(new Date(2027, 4, 6))?.id, none: m.realFest(new Date(2027, 6, 1)), full: m.moonKind(m.moonPhase(new Date(Date.UTC(2026, 0, 3, 10)))) };
});
console.log("calendar", JSON.stringify(cal));
check(cal.nev === "nevruz-2027" && cal.hid === "hidrellez-2027" && cal.none === null && cal.full === "dolunay", "gerÃ§ek takvim");

// panel
await ev(`g.hud.close(); g.warStart("selcuk", "bizans");`);
await dismiss();
await ev(`g.hud.openHero(); g.hud.tab = "ufuk"; g.hud.render();`);
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector(".panel .pb")?.scrollTo(0, 99999));
await shot("08-pulse");

// kayÄ±t / yÃ¼kleme
const occ = await ev<Record<string, string>>(`return { ...g.wd().occ };`);
await ev(`g.hud.close(); g.saveNow ? g.saveNow() : null;`);
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
await dismiss();
const occ2 = await ev<Record<string, string>>(`return { ...g.wd().occ };`);
const fac = await page.evaluate(async (o) => {
  const m = await import("/src/game/factions.ts");
  return Object.keys(o).map((c) => m.factionOf(c));
}, occ2);
console.log("occ", JSON.stringify(occ), "->", JSON.stringify(occ2), fac);
check(JSON.stringify(occ) === JSON.stringify(occ2), "iÅŸgaller kayÄ±tta kaldÄ±");
console.log("errors:", errs);
console.log(fails.length ? `FAILS: ${fails.join(" | ")}` : "ALL OK");
if (fails.length) process.exitCode = 1;
await browser.close();
