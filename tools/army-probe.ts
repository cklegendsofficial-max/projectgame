import { chromium, type Page } from "playwright-core";
import { newGame } from "../src/state";

function save(withHero: boolean): string {
  const s = newGame();
  s.gold = 5e7;
  s.lifetimeEarned = 5e7;
  s.runEarned = 1e6;
  [120, 80, 40, 20, 0, 0, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
  s.masters = [true, true, false, false, false, false, false, false];
  s.tutorial = 99;
  s.companions = { batu: 2, ayse: 1 };
  s.mats = { iron: 60, leather: 30, wood: 40, steel: 3 };
  s.soldiers = 40;
  s.escorts = [15, 10, 5, 0, 0, 0, 0, 0];
  if (withHero) s.hero = { name: "Alp Arslan", look: 2, level: 4, xp: 20, gear: { weapon: { type: "sword", tier: 2, plus: 6 } } };
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

type G = {
  s: { hero: unknown; mats: unknown; soldiers: number; escorts: number[]; stats: { battles: number; fallen: number; crafted: number } };
  ui: { setTab(t: string): void };
  battle(e: unknown, withHero: boolean): void;
  craftItem(o: string, t: string): void;
  enhanceItem(o: string, slot: string): void;
  recruit(n: number): void;
  autoEscorts(): void;
  openHeroCreator(): void;
};
type W = { game: G };

async function shot(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `playtest/army-${name}.png` });
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

  await page.addInitScript((data) => localStorage.setItem("caravan_tycoon_save_v1", data), save(false));
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2500);
  await page.evaluate(() => (window as unknown as W).game.openHeroCreator());
  await page.locator(".heroPick button").nth(3).click();
  await page.locator("#heroName").fill("Kara Murat");
  await shot(page, `${tag}-1-creator`);
  await page.locator("#modal button.primary").click();
  await page.evaluate(() => (window as unknown as W).game.ui.setTab("army"));
  await shot(page, `${tag}-2-armyNew`);

  await page.evaluate(() => localStorage.clear());
  await page.close();

  const p2 = await browser.newPage({ viewport: vp, deviceScaleFactor: tag === "mob" ? 2 : 1 });
  p2.on("pageerror", (e) => errs.push(e.message));
  p2.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p2.addInitScript((data) => localStorage.setItem("caravan_tycoon_save_v1", data), save(true));
  await p2.goto("http://localhost:5173/");
  await p2.waitForTimeout(2500);
  await p2.evaluate(() => {
    const g = (window as unknown as W).game;
    g.craftItem("hero", "shield");
    g.craftItem("batu", "bow");
    for (let k = 0; k < 3; k++) g.enhanceItem("hero", "weapon");
    g.recruit(10);
    g.ui.setTab("army");
  });
  await shot(p2, `${tag}-3-army`);
  await p2.evaluate(() => document.querySelector(".escort")?.scrollIntoView());
  await shot(p2, `${tag}-4-escorts`);
  await p2.evaluate(() => {
    const g = (window as unknown as W).game;
    g.autoEscorts();
    for (let k = 0; k < 4; k++) g.battle({ id: 900 + k, kind: "bandit", route: k % 3, t: 0.4 + k * 0.1, born: 0, life: 1 }, k % 2 === 0);
    g.ui.setTab("routes");
  });
  await p2.waitForTimeout(250);
  await shot(p2, `${tag}-5-battle`);
  const s = await p2.evaluate(() => {
    const g = (window as unknown as W).game.s;
    return { hero: g.hero, mats: g.mats, soldiers: g.soldiers, escorts: g.escorts, stats: { b: g.stats.battles, f: g.stats.fallen, c: g.stats.crafted } };
  });
  console.log(tag, JSON.stringify(s), "errors:", errs);
  await p2.close();
}
await browser.close();
