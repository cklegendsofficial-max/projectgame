import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/spoils-${mode}-${cls}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("kk_settings", JSON.stringify({ spoils: true }));
});
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 5 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(250);
  }
};
const check = (ok: boolean, what: string) => console.log(ok ? "OK  " : "FAIL", what);
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();

const fight = async (garrison: string, shrink = false) => {
  await ev(`g.s.hero.lv = 10; g.s.hero.army = {spear: 14, archer: 10, horse: 8}; g.s.hero.hp = g.maxHp(); const c = g.s.camps.filter((c) => c.alive && c.tier <= 3)[0]; c.garrison = ${garrison}; const h = g.s.hero; h.x = c.x + 20; h.y = c.y; g.attackCamp(g.s.camps.indexOf(c));`);
  await page.waitForSelector(".tact, .bbox.war", { timeout: 5000 });
  if (await page.locator(".tact").count()) await page.locator(".tact").nth(1).click();
  await page.waitForSelector(".battle .result .btn", { timeout: 40000 });
  const note = (await page.locator(".battle .result").textContent()) ?? "";
  if (shrink) await ev(`g.s.hero.army = {spear: 4, archer: 2, horse: 2};`);
  await page.locator(".battle .result .btn").click();
  return note;
};

const note1 = await fight(`{spear: 10, archer: 8, horse: 6}`);
check(note1.includes("ganimet"), "zafer notunda ganimet");
await page.waitForSelector(".bbox.spoil", { timeout: 4000 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}-01-pick.png` });
check((await page.locator(".spk").count()) === 3, "üç ganimet kartı");
const gold0 = await ev<number>(`return g.s.res.gold;`);
await page.keyboard.press("1");
await page.waitForTimeout(900);
check((await page.locator(".bbox.spoil").count()) === 0, "seçim penceresi kapandı");
check((await ev<number>(`return g.s.res.gold;`)) > gold0, "altın seçildi");

const note2 = await fight(`{spear: 10, archer: 8, horse: 6}`);
await page.waitForSelector(".bbox.spoil", { timeout: 4000 });
const bag0 = await ev<number>(`return g.s.hero.bag.length;`);
await page.locator(".spk").nth(2).click();
await page.waitForTimeout(900);
check((await ev<number>(`return g.s.hero.bag.length;`)) === bag0 + 1, "eşya heybeye kondu");

await fight(`{spear: 8, archer: 8, horse: 8}`, true);
await page.waitForSelector(".bbox.spoil", { timeout: 4000 });
const army0 = await ev<number>(`return Object.values(g.s.hero.army).reduce((a, b) => a + b, 0);`);
await page.locator(".spk").nth(1).click();
await page.waitForTimeout(900);
const army1 = await ev<number>(`return Object.values(g.s.hero.army).reduce((a, b) => a + b, 0);`);
check(army1 > army0, `esirler katıldı (${army0} → ${army1})`);

await fight(`{spear: 4, archer: 3, horse: 2}`);
await page.waitForTimeout(800);
check((await page.locator(".bbox.spoil").count()) === 0, "küçük savaşta ganimet seçimi yok");
console.log("note2", note2.length > 0);
console.log("errors:", errs);
await browser.close();
