import { chromium, type Page } from "playwright-core";
import { newGame } from "../src/state";

function save(): string {
  const s = newGame();
  s.gold = 5e11;
  s.lifetimeEarned = 5e11;
  s.runEarned = 1e9;
  [150, 100, 60, 40, 30, 10, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
  s.masters = [true, true, true, true, true, false, false, false];
  s.tutorial = 99;
  s.companions = { batu: 2, ayse: 1 };
  s.mats = { iron: 400, leather: 400, wood: 400, steel: 200 };
  s.soldiers = 160;
  s.barracks = 4;
  s.escorts = [20, 20, 20, 20, 10, 10, 0, 0];
  s.hero = { name: "Alp Arslan", look: 0, level: 14, xp: 30, gear: { weapon: { type: "sword", tier: 3, plus: 5 } } };
  s.house = { name: "Kayı", color: 1, symbol: "bow" };
  s.stats.dynasties = 2;
  s.ruler.gen = 3;
  s.bloodline = ["mongol", "seljuk"];
  s.sagaLog = [
    { ev: "titanDown", v: 0, vars: { hero: "Alp Arslan" }, gen: 2, at: 0 },
    { ev: "fort", v: 1, vars: { fort: "Alamut" }, gen: 2, at: 0 },
    { ev: "fallen", v: 0, vars: { name: "Tuğrul" }, gen: 3, at: 0 },
  ];
  s.nextTitan = Date.now() + 3_600_000;
  s.nextTradeWar = Date.now() + 3_600_000;
  s.nextHanStory = Date.now() + 3_600_000;
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

async function shot(page: Page, name: string, wait = 500): Promise<void> {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `playtest/epic-${name}.png` });
}
const ev = (page: Page, fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`);
async function closeModal(page: Page): Promise<void> {
  for (let k = 0; k < 3; k++) {
    const b = page.locator("#modal:not(.hidden) button.primary");
    if (!(await b.count())) break;
    await b.first().click();
    await page.waitForTimeout(250);
  }
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [tag, vp] of [
  ["desk", { width: 1280, height: 720 }],
  ["mob", { width: 390, height: 844 }],
] as const) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: tag === "mob" ? 2 : 1, locale: "tr-TR" });
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.addInitScript((data) => localStorage.setItem("caravan_tycoon_save_v1", data), save());
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2500);
  await closeModal(page);
  await page.waitForTimeout(600);
  await closeModal(page);

  await ev(page, `g.ui.setTab("upgrades");`);
  await shot(page, `${tag}-01-hans`);
  await ev(page, `g.buildHan(0); g.buildHan(2); g.buildHan(4);`);
  await shot(page, `${tag}-02-hansBuilt`, 900);
  await ev(page, `g.map.flyToRoute(0);`);
  await shot(page, `${tag}-03-hanMap`, 1500);
  await ev(page, `g.s.nextHanStory = 0;`);
  await shot(page, `${tag}-04-hanStory`, 1200);
  await page.locator("#modal:not(.hidden) button.choice").first().click().catch(() => undefined);
  await page.waitForTimeout(300);
  await closeModal(page);

  await ev(page, `g.ui.setTab("army"); g.ui.armySub = "war"; g.ui.dirty = true;`);
  await page.waitForTimeout(300);
  await ev(page, `g.upgradeSpies(); g.upgradeSpies(); g.upgradeSpies();`);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector(".spyCard")?.scrollIntoView());
  await shot(page, `${tag}-05-spies`);

  await ev(page, `g.ui.armySub = "guild"; g.ui.dirty = true;`);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector(".raidBox")?.scrollIntoView());
  await shot(page, `${tag}-06-raid`);
  await ev(page, `g.raidAttack(); g.raidAttack();`);
  await page.evaluate(() => document.querySelector(".raidBox")?.scrollIntoView());
  await shot(page, `${tag}-07-raidHit`, 300);

  await ev(page, `g.ui.setTab("dynasty");`);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector(".brides")?.scrollIntoView());
  await shot(page, `${tag}-08-marriage`);
  const offer = await page.evaluate(`(() => { const b = document.querySelector(".brides button.buy"); b && b.click(); return !!b; })()`);
  await shot(page, `${tag}-09-wedding`, 700);
  await closeModal(page);

  await ev(page, `g.openSaga();`);
  await shot(page, `${tag}-10-saga`);
  await page.locator("#modal:not(.hidden) button.primary").first().click();
  await shot(page, `${tag}-10b-sagaCard`, 1200);
  await page.locator("#modal:not(.hidden) button.secondary").last().click();
  await page.waitForTimeout(300);

  const wrong = await page.evaluate(`(() => { const g = window.game; const k = Math.floor(Date.now() / 240000) % 4; g.s.camp = k < 2 ? "kislak" : "yayla"; return g.s.camp; })()`);
  await ev(page, `g.ui.setTab("routes"); g.map.flyToNorm(0.6, 0.55);`);
  await shot(page, `${tag}-11-campWrong`, 1500);
  await ev(page, `g.migrateCamp();`);
  await shot(page, `${tag}-12-campOk`, 900);

  const st = await page.evaluate(() => {
    const g = (window as any).game.s;
    return { hans: g.hans, spies: g.spies, spouse: g.spouse, camp: g.camp, mig: g.stats.migrations, raid: g.raid, saga: g.sagaLog.length, ach: g.achievements.slice(-6) };
  });
  console.log(tag, offer, wrong, JSON.stringify(st), "errors:", errs);
  await page.close();
}
await browser.close();
