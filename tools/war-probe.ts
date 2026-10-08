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
  s.compGear = { batu: { weapon: { type: "bow", tier: 2, plus: 3, ench: "loot" } } };
  s.mats = { iron: 400, leather: 400, wood: 400, steel: 40 };
  s.soldiers = 160;
  s.barracks = 4;
  s.escorts = [20, 20, 20, 20, 10, 10, 0, 0];
  s.escortClass = ["spear", "spear", "cavalry", "spear", "spear", "cavalry", "spear", "spear"];
  s.wounded = 12;
  s.stats.fallen = 130;
  s.hero = {
    name: "Alp Arslan",
    look: 0,
    level: 12,
    xp: 30,
    gear: { weapon: { type: "sword", tier: 2, plus: 7, ench: "profit" }, shield: { type: "shield", tier: 2, plus: 2 }, armor: { type: "armor", tier: 3, plus: 0 } },
  };
  s.mount = { breed: 2, plus: 3 };
  s.nemeses = [{ id: 1, epithet: 0, name: "Temür", look: 0, route: 1, level: 3, wins: 2 }];
  s.nemesisSeq = 1;
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

type G = {
  s: Record<string, unknown> & { siege: { next: number } | null; nemeses: unknown[]; arena: unknown; mount: unknown; fortsTaken: string[]; stats: Record<string, number> };
  ui: { setTab(t: string): void; armySub: string; dirty: boolean };
  events: { spawnBandit(r: number, now: number, boss?: number): { id: number } };
  map: { flyToRoute(i: number): void };
  claimEvent(id: number): void;
  riseNemesis(r: number, k: string): void;
  beginSiege(id: string): void;
  arenaFight(t: number): void;
  enchantItem(o: string, s: string): void;
  buyMount(): void;
  setEscortClass(r: number): void;
};
const W = "window as unknown as { game: G }";
void W;

async function shot(page: Page, name: string, wait = 500): Promise<void> {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `playtest/war-${name}.png` });
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
  const b = page.locator("#modal button.primary");
  if (await b.count()) await b.first().click();
  await page.waitForTimeout(200);
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [tag, vp] of [
  ["desk", { width: 1280, height: 720 }],
  ["mob", { width: 390, height: 844 }],
] as const) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: tag === "mob" ? 2 : 1 });
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.addInitScript((data) => localStorage.setItem("caravan_tycoon_save_v1", data), save());
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2500);
  await closeModal(page);
  await shot(page, `${tag}-01-map`);

  await sub(page, "hero");
  await shot(page, `${tag}-02-hero`);
  await page.evaluate(() => {
    const g = (window as unknown as { game: G }).game;
    g.enchantItem("hero", "shield");
    g.buyMount();
  });
  await page.evaluate(() => document.querySelector(".gear:not(.mountRow)")?.scrollIntoView());
  await shot(page, `${tag}-03-smith`);

  await sub(page, "army");
  await shot(page, `${tag}-04-troops`);
  await page.evaluate(() => document.querySelector(".escort")?.scrollIntoView());
  await shot(page, `${tag}-05-escorts`);

  await sub(page, "war");
  await shot(page, `${tag}-06-war`);

  await page.evaluate(() => {
    const g = (window as unknown as { game: G }).game;
    g.ui.setTab("routes");
    g.map.flyToRoute(1);
    g.events.spawnBandit(1, Date.now(), 1);
  });
  await shot(page, `${tag}-07-boss`, 1500);
  await page.evaluate(() => {
    const g = (window as unknown as { game: G }).game;
    g.riseNemesis(3, "nemRiseText");
  });
  await shot(page, `${tag}-08-rise`);
  await closeModal(page);
  await page.evaluate(() => {
    const g = (window as unknown as { game: G }).game;
    const e = g.events.spawnBandit(1, Date.now(), 1);
    g.s.escorts = [20, 120, 0, 0, 0, 0, 0, 0] as never;
    g.claimEvent(e.id);
  });
  await shot(page, `${tag}-09-bossResult`);
  await closeModal(page);

  await page.evaluate(() => {
    const g = (window as unknown as { game: G }).game;
    g.s.escorts = [0, 0, 0, 0, 0, 0, 0, 0] as never;
    g.beginSiege("kizilkum");
  });
  await shot(page, `${tag}-10-siege`, 1800);
  await sub(page, "war");
  await shot(page, `${tag}-11-siegeTab`);
  for (let k = 0; k < 8; k++) {
    await page.evaluate(() => {
      const g = (window as unknown as { game: G }).game;
      if (g.s.siege) g.s.siege.next = 0;
    });
    await page.waitForTimeout(150);
  }
  await shot(page, `${tag}-12-siegeEnd`);
  await closeModal(page);

  await sub(page, "arena");
  await shot(page, `${tag}-13-arena`);
  await page.evaluate(() => (window as unknown as { game: G }).game.arenaFight(1));
  await shot(page, `${tag}-14-duel`);
  await closeModal(page);

  const st = await page.evaluate(() => {
    const g = (window as unknown as { game: G }).game.s;
    return { nem: g.nemeses, forts: g.fortsTaken, mount: g.mount, arena: g.arena, stats: g.stats, wounded: g.wounded, soldiers: g.soldiers };
  });
  console.log(tag, JSON.stringify(st), "errors:", errs);
  await page.close();
}
await browser.close();
