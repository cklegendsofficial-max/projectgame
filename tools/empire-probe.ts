import { chromium, type Page } from "playwright-core";
import { newGame } from "../src/state";

function save(): string {
  const s = newGame();
  s.gold = 5e10;
  s.lifetimeEarned = 5e10;
  s.runEarned = 1e7;
  [150, 100, 60, 40, 25, 10, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
  s.masters = [true, true, true, true, false, false, false, false];
  s.tutorial = 99;
  s.age = 1;
  s.wonders = { registan: 1 };
  s.cityLevels = { samarkand: 2, bukhara: 2, merv: 1, nishapur: 1 };
  s.house = { name: "Kervansaray Evi", color: 1, symbol: "crown" };
  s.ruler = { name: "Melikşah", trait: "builder", gen: 3 };
  s.lineage = [
    { name: "Selçuk", trait: "merchant", gen: 1, best: 3e8, age: 1 },
    { name: "Tuğrul", trait: "warrior", gen: 2, best: 4e10, age: 2 },
  ];
  s.chronicle.done = 3;
  s.companions = { batu: 2 };
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

type W = { game: { advanceAge(): void; foundDynasty(): void; map: { flyToCity(id: string): void }; ui: { setTab(t: string): void } } };

async function shot(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `playtest/emp-${name}.png` });
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
  await shot(page, `${tag}-1-rival`);
  await page.locator("#modal button").first().click();
  await page.evaluate(() => (window as unknown as W).game.ui.setTab("dynasty"));
  await shot(page, `${tag}-2-empire`);
  await page.evaluate(() => document.querySelector(".board")?.scrollIntoView());
  await shot(page, `${tag}-3-empire2`);
  await page.evaluate(() => (window as unknown as W).game.advanceAge());
  await shot(page, `${tag}-4-age`);
  await page.locator("#modal button").first().click();
  await page.waitForTimeout(1800);
  await shot(page, `${tag}-5-map`);
  await page.evaluate(async () => {
    const url = "/src/market.ts";
    const m = (await import(/* @vite-ignore */ url)) as typeof import("../src/market");
    const g = (window as unknown as { game: { s: unknown } }).game;
    for (let k = 0; k < 40; k++) {
      m.resetMarket(0);
      m.marketTick(g.s as never, 1e13, () => "genoa");
      const sh = m.currentShock(Date.now());
      if (sh && sh.kind === "boom" && sh.route < 4) break;
    }
    (window as unknown as W).game.ui.setTab("routes");
  });
  await shot(page, `${tag}-6-market`);
  const fast = page.locator("button.fast:visible");
  if (await fast.count()) await fast.first().click();
  await page.evaluate(() => (window as unknown as W).game.foundDynasty());
  await page.locator("#modal button.primary").click();
  await shot(page, `${tag}-7-heir`);
  await page.locator("#modal button.choice").first().click();
  await shot(page, `${tag}-8-crown`);
  const s = await page.evaluate(() => {
    const g = (window as unknown as { game: { s: { age: number; ruler: unknown; lineage: unknown[]; rivalsBeaten: string[]; stats: { booms: number } } } }).game.s;
    return { age: g.age, ruler: g.ruler, lineage: g.lineage.length, rivals: g.rivalsBeaten, booms: g.stats.booms };
  });
  console.log(tag, JSON.stringify(s), "errors:", errs);
  await page.close();
}
await browser.close();
