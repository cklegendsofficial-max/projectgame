import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/saga-${mode}`;
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
  for (let k = 0; k < 14; k++) {
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
const rnd = (v: number, body: string) => `const R = Math.random; Math.random = () => ${v}; try { ${body} } finally { Math.random = R; }`;
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();
await ev(`while (g.s.hero.lv < 10) { g.s.hero.xp += 1000; g.addXp(0); }`);
await dismiss();
await ev(`g.s.res.gold = 2000; g.s.hero.hp = g.maxHp(); const cap = g.heroCap(); g.s.hero.army = { spear: Math.round(cap * 0.4), archer: Math.round(cap * 0.3), horse: Math.round(cap * 0.3) };`);

// hazine haritası
await ev(`g.hud.close(); g.mapPiece(); g.mapPiece();`);
check(await ev<number>(`return g.wd().mapBits;`) === 2, "harita parçaları 2/3");
await ev(`g.mapPiece();`);
await shot("01-map");
await dismiss();
const hoard = await ev<{ x: number; y: number } | null>(`return g.wd().hoard;`);
check(!!hoard, "define yeri açıldı");
await ev(`const h = g.wd().hoard; g.s.hero.x = h.x + 200; g.s.hero.y = h.y; g.s.hero.path = null; g.cam.flyTo ? g.cam.flyTo(h.x, h.y, 0.9) : null;`);
await page.waitForTimeout(800);
await dismiss();
await ev(`g.hud.close(); const h = g.wd().hoard; g.cam.flyTo(h.x, h.y, 0.9);`);
await shot("02-hoard-mark", 1500);
const g0 = await ev<number>(`g.s.res.gold = 500; return g.wd().hoards;`);
await ev(`const h = g.wd().hoard; g.s.hero.x = h.x; g.s.hero.y = h.y; ${rnd(0.9, "g.hoardTick();")}`);
await shot("03-dig");
await dismiss();
check((await ev<number>(`return g.wd().hoards;`)) === g0 + 1 && !(await ev<boolean>(`return !!g.wd().hoard;`)), "define kazıldı");

// esirler
await ev(`g.hud.close(); g.addCaptive({ name: "Harami başı Test", kind: "harami", from: null, value: 100 }); g.addCaptive({ name: "Emir Test", kind: "soylu", from: "gazne", value: 300 });`);
check((await ev<number>(`return g.wd().captives.length;`)) === 2, "esirler eklendi");
const gold1 = await ev<number>(`g.s.res.gold = 100; const c = g.wd().captives.find(x => x.kind === "soylu"); g.captiveAct(c.id, "ransom"); return g.s.res.gold;`);
check(gold1 >= 399, `fidye alındı (${gold1})`);
const arm0 = await ev<number>(`const a = g.s.hero.army; return a.spear + a.archer + a.horse;`);
await ev(`g.s.hero.army.spear = 0; const c = g.wd().captives.find(x => x.kind === "harami"); g.captiveAct(c.id, "recruit");`);
check((await ev<number>(`return g.wd().captives.length;`)) === 0, "esir saflara katıldı");
console.log("ordu", arm0);
await ev(`g.hud.close(); g.s.hero.army = { spear: 0, archer: 0, horse: 0 }; g.heroCaptured("Kara Toğan çetesi");`);
await shot("04-captured");
await dismiss();
check(await ev<boolean>(`return !g.battleLock;`), "esir düşme sonrası kilit açık");
await ev(`g.s.hero.hp = g.maxHp(); const cap = g.heroCap(); g.s.hero.army = { spear: Math.round(cap * 0.4), archer: Math.round(cap * 0.3), horse: Math.round(cap * 0.3) };`);

// salgın
const city = await ev<string>(`g.hud.close(); const c = "bukhara"; g.plagueStart(c); return c;`);
check((await ev<number>(`return g.plagueOf("${city}");`)) > 0, "salgın başladı");
for (let d = 0; d < 4; d++) await ev(`${rnd(0.01, `g.plagueDaily(g.dayOf().day + ${d});`)}`);
const ill = await ev<string[]>(`return Object.keys(g.wd().plague);`);
console.log("salgın şehirleri", ill);
check(ill.length >= 2, `salgın yayıldı (${ill.length})`);
await dismiss();
await ev(`g.hud.close(); const p = g.targetPos({kind:"capital"}); g.cam.flyTo(p.x, p.y, 0.6);`);
await shot("04b-plague-map", 1500);
const p0 = await ev<number>(`return g.plagueOf("${city}");`);
await ev(`g.s.res.gold = 1000; g.plagueDonate("${city}");`);
check((await ev<number>(`return g.plagueOf("${city}");`)) < p0, "bağış salgını azalttı");
const cure = await ev<boolean>(`for (let i = 0; i < 30; i++) { const q = g.worldSide("samarkand", []); if (q && q.cure) return true; } return false;`);
check(cure, "şifa kervanı görevi çıkıyor");
const price = await ev<number>(`return g.worldMult("${ill.find((c) => c !== city) ?? city}");`);
check(price > 1, `salgın fiyatı artırıyor (${price.toFixed(2)})`);

// rüya
await ev(`g.hud.close(); g.wd().dreamDay = -99; g.battleLock = false; ${rnd(0.05, "g.dreamCheck();")}`);
await shot("05-dream");
const om = await ev<number>(`return g.wd().omens.length;`);
check(om >= 0 && (await page.locator(".battle .bbox.choice").count()) > 0, "rüya göründü");
await page.locator(".battle .bbox.choice .btn").first().click();
await page.waitForTimeout(300);
await shot("06-kam");
await dismiss();
await ev(`g.wd().omens = [{ kind: "war", day: 1, a: "selcuk", b: "bizans", told: true }]; g.wd().wars = []; g.wd().peaceUntil = {}; g.omensDaily(g.dayOf().day);`);
check(await ev<boolean>(`return g.wd().wars.some(w => [w.a, w.b].includes("selcuk") && [w.a, w.b].includes("bizans"));`), "kehanet gerçekleşti: savaş");
await dismiss();

// büyük toy
const td = await ev<number>(`g.hud.close(); const w = g.wd(); w.toyYear = 0; w.toy = null; const d = 6 + 16 * Math.floor(g.dayOf().day / 16); g.toyDaily(d); return d;`);
await shot("07-toy");
await dismiss();
check(await ev<boolean>(`return !!g.wd().toy;`), "büyük toy kuruldu");
await ev(`g.toyScore("ok", 90); g.toyScore("gur", 99); g.toyScore("kb", 90); g.wd().toy.foes.forEach(f => f.pts = 50);`);
await ev(`g.toyDaily(${td} + 10);`);
await shot("08-champ");
await dismiss();
check(await ev<boolean>(`return !g.wd().toy && g.wd().champs.length === 1 && g.wd().champs[0].name === g.s.hero.name;`), "toy şampiyonluğu");

// lonca
await ev(`g.hud.close(); g.s.c.profit = 7000; g.wd().orderDay = -99; g.guildDaily(g.dayOf().day);`);
await shot("09-guild");
await dismiss();
check((await ev<number>(`return g.wd().guild;`)) === 2, "lonca rütbesi Usta");
const o = await ev<{ good: string; n: number; city: string } | null>(`return g.wd().order;`);
check(!!o, "lonca siparişi verildi");
if (o) {
  await ev(`const o = g.wd().order; g.s.hero.cargo[o.good] = o.n; g.s.hero.paid[o.good] = 100;`);
  const ok = await ev<boolean>(`for (let i = 0; i < 40; i++) { const p = g.targetPos({kind:"city", i}); if (!p) break; g.s.hero.x = p.x; g.s.hero.y = p.y; if (g.orderReady()) { g.orderDeliver(); return !g.wd().order; } } return false;`);
  check(ok, "lonca siparişi teslim edildi");
}
check((await ev<number>(`return g.buyFactor();`)) < 1.12, "lonca alış avantajı");

// panel
await ev(`g.addCaptive({ name: "Sipahsalar Test", kind: "soylu", from: "selcuk", value: 200 }); g.mapPiece(); g.plagueStart("samarkand");`);
await dismiss();
await ev(`g.wd().toyYear = 0; g.toyDaily(${td} + 16);`);
await dismiss();
await ev(`g.hud.openHero(); g.hud.tab = "ufuk"; g.hud.render();`);
await page.waitForTimeout(500);
await page.evaluate(() => document.querySelector(".panel .pb")?.scrollTo(0, 99999));
await shot("10-pulse");
const html = await page.evaluate(() => document.querySelector(".panel")?.textContent ?? "");
check(/Esirler/.test(html) && /Lonca/.test(html) && /Büyük Toy/.test(html), "Ufuk paneli yeni bölümleri gösteriyor");

// şehir pazarı
await ev(`g.hud.close(); const p = g.targetPos({kind:"capital"}); g.s.hero.x = p.x; g.s.hero.y = p.y; g.hud.openPlace({kind:"capital"});`);
await page.waitForTimeout(400);
const pz = page.locator(".tab", { hasText: /Pazar|Market/ });
if (await pz.count()) await pz.first().click();
await shot("11-city");
const ch = await page.evaluate(() => document.querySelector(".panel")?.textContent ?? "");
check(/Salgın!/.test(ch), "pazarda salgın kutusu");

// kayıt
await ev(`g.saveNow ? g.saveNow() : null;`);
const before = await ev<string>(`return JSON.stringify({ c: g.wd().captives.length, g: g.wd().guild, p: Object.keys(g.wd().plague).length });`);
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
await dismiss();
const after = await ev<string>(`return JSON.stringify({ c: g.wd().captives.length, g: g.wd().guild, p: Object.keys(g.wd().plague).length });`);
console.log("kayıt", before, after);
check(before === after, "yeni sistemler kayıtta kalıyor");

console.log("errors:", errs);
console.log(fails.length ? `FAILS: ${fails.join(" | ")}` : "ALL OK");
if (fails.length) process.exitCode = 1;
await browser.close();
