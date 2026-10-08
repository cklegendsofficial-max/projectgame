import { chromium, type Page } from "playwright-core";
import { newGame } from "../src/state";

function save(): string {
  const s = newGame();
  s.gold = 5e9;
  s.lifetimeEarned = 5e9;
  s.runEarned = 1e8;
  [150, 100, 60, 40, 25, 10, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
  s.masters = [true, true, true, true, false, false, false, false];
  s.tutorial = 99;
  s.companions = { batu: 2, ayse: 1 };
  s.mats = { iron: 400, leather: 400, wood: 400, steel: 60 };
  s.soldiers = 160;
  s.barracks = 4;
  s.escorts = [20, 20, 20, 20, 10, 10, 0, 0];
  s.hero = { name: "Alp Arslan", look: 0, level: 14, xp: 30, gear: { weapon: { type: "sword", tier: 3, plus: 5 } } };
  s.mount = { breed: 2, plus: 1 };
  s.nemeses = [{ id: 1, epithet: 0, name: "Temür", look: 0, route: 1, level: 3, wins: 2 }];
  s.nemesisSeq = 1;
  s.stats.dynasties = 2;
  s.stats.titans = 3;
  s.stats.forts = 2;
  s.stats.nemesisSlain = 4;
  s.season.pts = 120;
  s.nextTitan = Date.now() + 3_600_000;
  s.nextTradeWar = Date.now() + 3_600_000;
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

async function shot(page: Page, name: string, wait = 500): Promise<void> {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `playtest/saga-${name}.png` });
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

  await ev(page, `g.ui.setTab("dynasty");`);
  await shot(page, `${tag}-01-oath`);
  await ev(page, `g.chooseOath("ocak"); g.buyPerk(); g.buyPerk();`);
  await page.evaluate(() => document.querySelector(".paths")?.scrollIntoView());
  await shot(page, `${tag}-02-oathRanks`);

  await ev(page, `g.ui.setTab("army"); g.ui.armySub = "guild"; g.ui.dirty = true;`);
  await shot(page, `${tag}-03-guild`);
  await ev(page, `g.claimSeasonStep(); g.claimSeasonStep();`);
  await page.waitForTimeout(300);
  await closeModal(page);

  await ev(page, `g.ui.setTab("routes"); g.s.nextTradeWar = 0;`);
  await shot(page, `${tag}-04-tradeWar`, 2200);
  await ev(page, `g.openTradeWar();`);
  await shot(page, `${tag}-05-twModal`);
  await ev(page, `Math.random = () => 0.01;`);
  await page.locator("#modal button.primary").first().click();
  await shot(page, `${tag}-06-twWon`, 900);
  await closeModal(page);

  await ev(page, `g.heroFalls("Kara Temür");`);
  await shot(page, `${tag}-07-heroFall`, 600);
  await closeModal(page);
  await shot(page, `${tag}-08-bard`, 1800);
  await ev(page, `g.map.flyToNorm(0.9, 0.44);`);
  await shot(page, `${tag}-09-kurgan`, 1600);
  await ev(page, `g.openKurgan();`);
  await shot(page, `${tag}-10-kurganModal`);
  await closeModal(page);

  await ev(page, `g.ui.setTab("army"); g.ui.armySub = "hero"; g.ui.dirty = true;`);
  await page.evaluate(() => document.querySelector(".kurganRow")?.scrollIntoView());
  await shot(page, `${tag}-11-heroSub`);

  const st = await page.evaluate(() => {
    const g = (window as any).game.s;
    return { oath: g.allegiance, season: g.season, tw: g.tradeWar, fallen: g.fallenHeroes.length, hero: g.hero && [g.hero.name, g.hero.level], ach: g.achievements.slice(-5) };
  });
  console.log(tag, JSON.stringify(st), "errors:", errs);
  await page.close();
}
await browser.close();
