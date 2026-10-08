import { chromium, type Page } from "playwright-core";
import { newGame } from "../src/state";
import { FEATURE_IDS } from "../src/unlocks";

function save(): string {
  const s = newGame();
  s.gold = 5e6;
  s.lifetimeEarned = 5e6;
  [60, 30, 10, 5, 0, 0, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
  s.masters = [true, true, false, false, false, false, false, false];
  s.tutorial = 99;
  s.unlocked = [...FEATURE_IDS];
  s.mats = { iron: 80, leather: 80, wood: 80, steel: 10 };
  s.soldiers = 20;
  s.festSeen = "x";
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.nextCourt = Date.now() + 3_600_000;
  s.nextTradeWar = Date.now() + 3_600_000;
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

const ev = (page: Page, fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`);
const modalTitle = (page: Page) => page.evaluate(() => { const m = document.getElementById("modal")!; return m.classList.contains("hidden") ? null : m.querySelector("h2")?.textContent ?? ""; });

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
  for (let k = 0; k < 4 && (await modalTitle(page)); k++) {
    await page.locator("#modal button").last().click();
    await page.waitForTimeout(300);
  }
  await ev(page, `g.ui.setTab("routes");`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/journey-${tag}-01-card.png` });

  await ev(page, `g.openJourney();`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/journey-${tag}-02-market.png` });
  await page.locator('#modal [data-fill]').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/journey-${tag}-03-filled.png` });
  console.log(tag, "cargo", await ev(page, `return JSON.stringify(g.s.journey.cargo) + " gold " + Math.round(g.s.gold);`));

  await page.locator("#modal button.primary").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/journey-${tag}-04-dest.png` });
  const risky = page.locator('#modal [data-risky="1"]');
  if (await risky.count()) await risky.first().click();
  else await page.locator("#modal [data-go]").last().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `playtest/journey-${tag}-05-road.png` });

  let evShot = false;
  let arrived = false;
  for (let k = 0; k < 160 && !arrived; k++) {
    await page.waitForTimeout(500);
    const title = await modalTitle(page);
    if (!title) continue;
    if (title === "Varış!") {
      arrived = true;
      break;
    }
    if (!evShot) {
      evShot = true;
      await page.screenshot({ path: `playtest/journey-${tag}-06-event.png` });
    }
    console.log(tag, "event:", title);
    await page.locator("#modal button").first().click();
    await page.waitForTimeout(400);
    const res = await modalTitle(page);
    if (res && res !== "Varış!") {
      console.log(tag, "  ->", res);
      await page.locator("#modal button").first().click();
    }
  }
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/journey-${tag}-07-arrival.png` });
  const sellAll = page.locator("#modal button.primary");
  if (arrived && (await sellAll.count())) {
    await sellAll.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `playtest/journey-${tag}-08-sold.png` });
  }
  console.log(tag, "after", await ev(page, `const j = g.s.journey; return JSON.stringify({ city: j.city, trips: j.trips, lv: j.lv, xp: j.xp, profit: Math.round(j.profit), gold: Math.round(g.s.gold), prov: j.prov });`));
  await ev(page, `g.journey.openUpgrades();`);
  await page.waitForTimeout(400);
  await page.locator("#modal [data-up]").first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/journey-${tag}-09-upgrades.png` });
  console.log(tag, "arrived:", arrived, "errors:", errs);
  await page.close();
}
await browser.close();
