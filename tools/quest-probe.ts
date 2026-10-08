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
  s.mats = { iron: 400, leather: 400, wood: 400, steel: 40 };
  s.soldiers = 160;
  s.barracks = 4;
  s.escorts = [20, 20, 20, 20, 10, 10, 0, 0];
  s.hero = { name: "Alp Arslan", look: 0, level: 12, xp: 30, gear: { weapon: { type: "sword", tier: 2, plus: 7, ench: "profit" }, armor: { type: "armor", tier: 3, plus: 0 } } };
  s.mount = { breed: 2, plus: 3 };
  s.nemeses = [{ id: 1, epithet: 0, name: "Temür", look: 0, route: 1, level: 3, wins: 2 }];
  s.nemesisSeq = 1;
  s.relics = ["sword", "kopuz", "map"];
  s.stats.nemesisSlain = 4;
  s.fortsTaken = ["kizilkum"];
  s.house = { name: "Kayı", color: 0, symbol: "crown" };
  s.nextTitan = Date.now() + 3_600_000;
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

type G = {
  s: Record<string, any>;
  ui: { setTab(t: string): void; armySub: string; dirty: boolean };
  hitTitan(): void;
  claimContract(i: number): void;
  openLetter(n: unknown, k: string): void;
  openShareCard(): void;
  dropRelic(c: number): void;
  beginSiege(id: string): void;
};

async function shot(page: Page, name: string, wait = 500): Promise<void> {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `playtest/quest-${name}.png` });
}
async function sub(page: Page, id: string): Promise<void> {
  await page.evaluate((id) => {
    const g = (window as unknown as { game: G }).game;
    g.ui.setTab("army");
    g.ui.armySub = id;
    g.ui.dirty = true;
  }, id);
}
async function closeModal(page: Page): Promise<void> {
  for (let k = 0; k < 3; k++) {
    const b = page.locator("#modal:not(.hidden) button.primary");
    if (!(await b.count())) break;
    await b.first().click();
    await page.waitForTimeout(250);
  }
}
const ev = (page: Page, fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`);

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

  await ev(page, `g.s.nextTitan = 0;`);
  await shot(page, `${tag}-01-titan`, 2200);
  for (let k = 0; k < 6; k++) {
    await ev(page, `g.hitTitan();`);
    await page.waitForTimeout(90);
  }
  await shot(page, `${tag}-02-titanHit`, 150);
  await ev(page, `g.s.titan.hp = 1; g.hitTitan();`);
  await shot(page, `${tag}-03-titanSlain`, 600);
  await closeModal(page);
  await page.waitForTimeout(800);
  await closeModal(page);

  await sub(page, "hero");
  await shot(page, `${tag}-04-relics`);
  await ev(page, `g.s.relics = g.s.relics.filter(r => r !== "seal" && r !== "book" && r !== "bow"); g.dropRelic(1);`);
  await shot(page, `${tag}-05-relicDrop`, 1200);
  await closeModal(page);

  await sub(page, "war");
  await ev(page, `const c = g.s.contracts.list[0]; c.base -= 999; g.ui.dirty = true;`);
  await shot(page, `${tag}-06-contracts`);
  await ev(page, `g.claimContract(0);`);
  await shot(page, `${tag}-07-claimed`, 400);

  await ev(page, `g.openLetter(g.s.nemeses[0], "ransom");`);
  await shot(page, `${tag}-08-letter`);
  await page.locator("#modal button.primary").first().click();
  await ev(page, `g.openLetter(g.s.nemeses[0], "challenge");`);
  await shot(page, `${tag}-09-letter2`);
  await page.locator("#modal button.secondary").first().click();

  await sub(page, "arena");
  await shot(page, `${tag}-10-arena`);
  await ev(page, `g.openShareCard();`);
  await shot(page, `${tag}-11-share`, 1500);
  await page.locator("#modal button").last().click();

  await ev(page, `g.ui.setTab("routes"); g.beginSiege("kopet");`);
  await shot(page, `${tag}-12-siegeShots`, 2600);

  const st = await page.evaluate(() => {
    const g = (window as unknown as { game: G }).game.s;
    return { relics: g.relics, contracts: g.contracts, titans: g.stats.titans, nem: g.nemeses, titan: g.titan, ach: g.achievements.slice(-6) };
  });
  console.log(tag, JSON.stringify(st), "errors:", errs);
  await page.close();
}
await browser.close();
