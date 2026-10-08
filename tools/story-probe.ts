import { chromium } from "playwright-core";
import { newGame } from "../src/state";

function save(companions: Record<string, number>): string {
  const s = newGame();
  s.gold = 5e6;
  s.lifetimeEarned = 1e7;
  s.runEarned = 1e7;
  [60, 30, 10, 0, 0, 0, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
  s.masters = [true, true, false, false, false, false, false, false];
  s.tutorial = 99;
  s.companions = companions;
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [name, vp, comps] of [
  ["desk", { width: 1280, height: 720 }, {}],
  ["mob", { width: 390, height: 844 }, { ayse: 2, batu: 1, ferhat: 3, leyla: 1, lucia: 1, korkut: 5 }],
] as const) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: name === "mob" ? 2 : 1 });
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.addInitScript((data) => localStorage.setItem("caravan_tycoon_save_v1", data), save(comps));
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const g = (window as unknown as { game: { events: { list: unknown[] } } }).game;
    g.events.list.push({ id: 777, kind: "story", route: 0, t: 0, city: "samarkand", born: Date.now(), life: 45000 });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `playtest/story-${name}-1-map.png` });
  await page.evaluate(() => (window as unknown as { game: { claimEvent(id: number): void } }).game.claimEvent(777));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/story-${name}-2-modal.png` });
  await page.locator("#modal button.choice").first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `playtest/story-${name}-3-result.png` });
  await page.locator("#modal button").first().click();
  await page.locator("#tabs button", { hasText: /Kervanbaşı|Masters/ }).click();
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector(".sectionHead")?.scrollIntoView());
  await page.waitForTimeout(300);
  await page.screenshot({ path: `playtest/story-${name}-4-companions.png` });
  const comps2 = await page.evaluate(() => JSON.stringify((window as unknown as { game: { s: { companions: unknown } } }).game.s.companions));
  console.log(name, "companions:", comps2, "errors:", errs);
  await page.close();
}
await browser.close();
