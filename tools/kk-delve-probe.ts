import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/delve-${mode}`;
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
const dismiss = async (pick = 0) => {
  for (let k = 0; k < 20; k++) {
    if (await page.locator(".battle .rlog").count()) {
      await page.waitForTimeout(400);
      const close = page.locator(".battle .bbox:not(.story) .btn.go, .battle .bbox:not(.story) .btn.big");
      if (await close.count()) await close.first().click({ timeout: 2000 }).catch(() => {});
      continue;
    }
    const b = page.locator(".battle .bbox.story .btn:not(.off), .battle .bbox.choice .btn:not(.off)");
    const n = await b.count();
    if (!n) break;
    await b.nth(Math.min(pick, n - 1)).click({ timeout: 2000 }).catch(() => {});
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
await ev(`while (g.s.hero.lv < 10) { g.s.hero.xp += 1000; g.addXp(0); }`);
await dismiss();
const prep = `g.s.res.gold = 200; g.s.hero.hp = g.maxHp(); const cap = g.heroCap(); g.s.hero.army = { spear: Math.round(cap * 0.4), archer: Math.round(cap * 0.3), horse: Math.round(cap * 0.3) };`;
await ev(prep);

// harabe paneli
const r0 = await ev<number>(`const i = g.s.ruins.findIndex(r => !r.looted); const r = g.s.ruins[i]; g.s.hero.x = r.x + 20; g.s.hero.y = r.y; g.reveal(r.x, r.y, 4); g.hud.close(); g.hud.openPlace({kind:"ruin", i}); return i;`);
await shot("00-panel");

const run = async (i: number, rooms: string[], tag: string) => {
  await ev(`${prep} g.hud.close(); g.delveStart(${i}); g.delve.rooms = ${JSON.stringify(rooms)};`);
  await shot(`${tag}-0-intro`);
  const gold0 = await ev<number>(`return g.s.res.gold;`);
  await page.locator(".battle .bbox.choice .btn").first().click();
  for (let k = 0; k < rooms.length; k++) {
    await shot(`${tag}-${k + 1}-${rooms[k]}`, 300);
    await dismiss();
    if (!(await ev<boolean>(`return !!g.delve;`))) break;
  }
  await dismiss();
  const st = await ev<{ open: boolean; lock: boolean; looted: boolean; gold: number }>(`return { open: !!g.delve, lock: g.battleLock, looted: g.s.ruins[${i}].looted, gold: g.s.res.gold };`);
  check(!st.open && !st.lock && st.looted, `${tag}: keşif bitti, kilit açık (${rooms.join(",")})`);
  check(st.gold > gold0, `${tag}: altın arttı ${gold0} → ${st.gold}`);
};

const free = async () => ev<number>(`return g.s.ruins.findIndex((r, i) => !r.looted && i !== ${r0});`);
await run(r0, ["tuzak", "bilmece", "sunak"], "a");
await run(await free(), ["bekci", "kalinti", "cokme"], "b");
await run(await free(), ["ruh", "tuzak", "cokme"], "c");

// ganimetle çık
const i4 = await free();
await ev(`${prep} g.hud.close(); g.delveStart(${i4}); g.delve.rooms = ["kalinti", "tuzak", "tuzak"];`);
await page.locator(".battle .bbox.choice .btn").first().click();
await page.waitForTimeout(300);
await page.locator(".battle .bbox.choice .btn").first().click();
await page.waitForTimeout(300);
await page.locator(".battle .bbox.story .btn.go").first().click();
await page.waitForTimeout(300);
await shot("d-leave");
await page.locator(".battle .bbox.choice .btn").last().click();
await page.waitForTimeout(300);
check(await ev<boolean>(`return !g.delve && !g.battleLock;`), "ganimetle erken çıkış");

// vazgeç
const i5 = await free();
await ev(`g.hud.close(); g.delveStart(${i5});`);
await page.locator(".battle .bbox.choice .btn").last().click();
check(await ev<boolean>(`return !g.delve && !g.battleLock && !g.s.ruins[${i5}].looted;`), "vazgeçince harabe kalır");

// yaralıyken bekçi
const i6 = await free();
await ev(`g.hud.close(); g.s.hero.army = { spear: 0, archer: 0, horse: 0 }; g.s.hero.hp = 1; g.delveStart(${i6}); g.delve.rooms = ["bekci", "tuzak", "tuzak"];`);
await page.locator(".battle .bbox.choice .btn").first().click();
await page.waitForTimeout(300);
await page.locator(".battle .bbox.choice .btn").first().click();
await page.waitForTimeout(300);
check(await ev<boolean>(`return !g.delve && !g.battleLock;`), "yaralıyken bekçi: keşif kilitlenmez");

console.log("errors:", errs);
console.log(fails.length ? `FAILS: ${fails.join(" | ")}` : "ALL OK");
if (fails.length) process.exitCode = 1;
await browser.close();
