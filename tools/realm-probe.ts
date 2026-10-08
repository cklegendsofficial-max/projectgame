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
  s.soldiers = 400;
  s.barracks = 4;
  s.escorts = [20, 20, 20, 20, 10, 10, 0, 0];
  s.hero = { name: "Alp Arslan", look: 0, level: 14, xp: 30, gear: { weapon: { type: "sword", tier: 3, plus: 5 }, armor: { type: "armor", tier: 3, plus: 3 } } };
  s.house = { name: "Kayı", color: 1, symbol: "bow" };
  s.stats.dynasties = 4;
  s.ruler = { name: "Kılıç Arslan", trait: "warrior", gen: 5 };
  s.spouse = "byzantine";
  s.lineage = [
    { name: "Selçuk", trait: "merchant", gen: 1, best: 2e7, age: 1, spouse: "karakhanid" },
    { name: "Tuğrul", trait: "builder", gen: 2, best: 4e9, age: 2 },
    { name: "Alp Arslan", trait: "warrior", gen: 3, best: 8e11, age: 2, spouse: "mongol" },
    { name: "Melikşah", trait: "scholar", gen: 4, best: 3e13, age: 3, spouse: "persian" },
  ];
  s.bloodline = ["karakhanid", "mongol", "persian"];
  s.fallenHeroes = [{ name: "Çağrı Bey", look: 2, level: 11, gen: 3, foe: "Tepegöz" }];
  s.diplo = { sogd: { rel: 60, at: Date.now(), cd: 0, ally: 0, spoils: 0 } };
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
  await page.screenshot({ path: `playtest/realm-${name}.png` });
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
  await shot(page, `${tag}-01-festival`, 600);
  await closeModal(page);

  await ev(page, `g.ui.setTab("routes");`);
  await page.waitForTimeout(16_000);
  await ev(page, `g.buyStock(0); g.buyStock(0); g.buyStock(1); g.buyStock(2);`);
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector(".bazaar")?.scrollIntoView({ block: "center" }));
  await shot(page, `${tag}-02-bazaar`, 400);
  await ev(page, `g.sellStock(1);`);
  await shot(page, `${tag}-03-bazaarSold`, 300);

  await ev(page, `g.ui.setTab("dynasty");`);
  await page.waitForTimeout(300);
  await ev(page, `g.openTree();`);
  await shot(page, `${tag}-04-tree`);
  await closeModal(page);
  await ev(page, `g.diplo("sogd", "ally");`);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector(".diploCard")?.scrollIntoView({ block: "start" }));
  await shot(page, `${tag}-05-diplo`, 400);
  await ev(page, `g.openWar("genoa");`);
  await shot(page, `${tag}-06-warAsk`);
  await page.locator("#modal:not(.hidden) button.primary").first().click();
  await shot(page, `${tag}-07-warResult`, 600);
  await closeModal(page);

  await ev(page, `g.ui.setTab("army"); g.ui.armySub = "hero"; g.ui.dirty = true;`);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector(".gear")?.scrollIntoView({ block: "center" }));
  await shot(page, `${tag}-16-forge`, 300);
  await page.waitForTimeout(400);
  await shot(page, `${tag}-08-expCard`);
  await ev(page, `g.startExpedition();`);
  await shot(page, `${tag}-09-expMap`);
  for (let k = 0; k < 4; k++) {
    const n = page.locator("#modal:not(.hidden) .expNode.cur");
    if (!(await n.count())) break;
    await n.first().click();
    await page.waitForTimeout(250);
  }
  await shot(page, `${tag}-10-expMid`, 300);
  for (let k = 0; k < 8; k++) {
    const n = page.locator("#modal:not(.hidden) .expNode.cur");
    if (!(await n.count())) break;
    await n.first().click();
    await page.waitForTimeout(200);
  }
  await shot(page, `${tag}-11-expEnd`, 400);
  await closeModal(page);

  await ev(page, `g.ui.setTab("routes"); g.s.nodeAt[1] = Date.now() + 60000; g.setGovernor("samarkand", Object.keys(g.s.companions)[0]);`);
  await shot(page, `${tag}-17-nodes`, 600);
  const sp = (await page.evaluate(`(() => { const g = window.game; const p = g.map.px(0.84, 0.37); const r = document.querySelector("canvas").getBoundingClientRect(); return { x: p.x + r.left, y: p.y + r.top }; })()`)) as { x: number; y: number };
  await page.screenshot({ path: `playtest/realm-${tag}-17b-zoom.png`, clip: { x: Math.max(0, sp.x - 140), y: Math.max(0, sp.y - 110), width: 240, height: 220 } });
  await ev(page, `g.tapNode(0); g.s.routes[2].owned = Math.max(1, g.s.routes[2].owned); g.tapNode(3);`);
  await shot(page, `${tag}-18-ruin`, 400);
  await closeModal(page);
  const gv = await ev(page, `return JSON.stringify({ gov: g.s.governors, mats: g.s.mats, gathered: g.s.stats.gathered });`);
  console.log(tag, "frontier", gv);
  const pre = await ev(page, `return JSON.stringify({ gold: g.s.gold, mercs: g.s.mercs, regions: g.s.regions.length });`);
  console.log(tag, "province-pre", pre);
  await ev(page, `g.s.gold = Math.max(g.s.gold, 1e15); g.unlockRegion(0);`);
  await page.waitForTimeout(300);
  await shot(page, `${tag}-19-region`, 300);
  await ev(page, `g.hireYouth(0);`);
  await closeModal(page);
  for (let i = 0; i < 25; i++) {
    await ev(page, `g.s.regions[0].at = 0; g.raidRegion(0);`);
    await page.waitForTimeout(40);
    await closeModal(page);
  }
  await ev(page, `g.s.trophies.tr_crown = 1; g.s.trophies.tr_feather = 2; g.s.regions[7].open = true; g.s.mood = 20; g.s.wageAt = 0;`);
  await page.waitForTimeout(800);
  await closeModal(page);
  const post = await ev(page, `return JSON.stringify({ rg: g.s.regions[0], tro: g.s.trophies, mercs: g.s.mercs, mood: g.s.mood, revolt: g.s.revolt });`);
  console.log(tag, "province", post);
  await ev(page, `g.s.regions[0].at = 0; g.raidRegion(0);`);
  await page.waitForTimeout(300);
  await closeModal(page);
  await ev(page, `g.s.revolt = -1; g.s.mood = 70; g.s.regions[0].youth = 6; g.openRegion(0);`);
  await shot(page, `${tag}-20-regionOpen`, 400);
  await page.locator("#modal:not(.hidden) button.secondary").first().click();
  await page.waitForTimeout(250);
  await ev(page, `g.ui.setTab("army"); g.ui.armySub = "realm"; g.ui.dirty = true;`);
  await shot(page, `${tag}-21-realm`, 500);
  await page.evaluate(() => document.querySelector(".codex")?.scrollIntoView({ block: "center" }));
  await shot(page, `${tag}-22-codex`, 300);
  await ev(page, `g.ui.setTab("routes"); g.forceMerchant(); g.map.weather = "sand";`);
  await page.waitForTimeout(300);
  const mk = await ev(page, `const m = g.s.merchant; if (!m) return "none"; const p = g.map.px(0, 0); return JSON.stringify({ k: m.k, offers: m.offers.map((o) => o.kind + ":" + o.id) });`);
  console.log(tag, "merchant", mk, await ev(page, `return g.map.weather + "/" + g.map.lite;`));
  await shot(page, `${tag}-29-sand`, 400);
  await ev(page, `g.map.weather = "rain";`);
  await shot(page, `${tag}-30-rain`, 400);
  await ev(page, `g.map.weather = "clear"; g.s.trophies.tr_mane = 4; g.openMerchant();`);
  await shot(page, `${tag}-31-merchant`, 400);
  await ev(page, `document.querySelector('#modal [data-buy="2"]')?.click();`);
  await page.waitForTimeout(300);
  await ev(page, `document.querySelector('#modal [data-sell]')?.click();`);
  await page.waitForTimeout(300);
  const after = await ev(page, `return JSON.stringify({ sold: g.s.merchant?.offers.map((o) => o.sold), mane: g.s.trophies.tr_mane });`);
  console.log(tag, "merchant-after", after);
  await page.locator("#modal:not(.hidden) button.primary").first().click();
  await page.waitForTimeout(250);
  await shot(page, `${tag}-23-mapRegions`, 500);
  await ev(page, `g.map.dayShift = 360000 - (Date.now() % 720000);`);
  await shot(page, `${tag}-24-night`, 500);
  await ev(page, `g.map.dayShift = 0; Object.assign(g.s.trophies, { tr_mane: 5, tr_peach: 3, tr_sogdseal: 1, tr_wolf: 1 }); g.s.mats.steel = 500; g.openForge();`);
  await shot(page, `${tag}-25-forge`, 400);
  await ev(page, `g.forgeArtifact("ar_saddle");`);
  await shot(page, `${tag}-26-forged`, 500);
  await closeModal(page);
  await closeModal(page);
  await ev(page, `g.s.incursion = null; g.s.revolt = -1; g.s.nextIncursion = 0; g.s.tutorial = Math.max(g.s.tutorial, 5);`);
  await page.waitForTimeout(1200);
  const inc = await ev(page, `return JSON.stringify({ inc: g.s.incursion, art: g.s.artifacts, eq: g.s.artEquip, tro: g.s.trophies });`);
  console.log(tag, "artifacts", inc);
  await ev(page, `g.ui.setTab("army"); g.ui.armySub = "realm"; g.ui.dirty = true; g.ui.body.scrollTop = 0;`);
  await shot(page, `${tag}-27-realmTop`, 500);
  await ev(page, `g.openIncursion();`);
  await shot(page, `${tag}-28-incursion`, 400);
  await closeModal(page);
  await ev(page, `g.ui.setTab("routes");`);
  await ev(page, `g.forceCourt("sword");`);
  await shot(page, `${tag}-15-court`, 400);
  await closeModal(page);
  await ev(page, `g.debugRival(1);`);
  await shot(page, `${tag}-14-rival`, 400);
  await ev(page, `g.startSilkStorm(1);`);
  await page.waitForTimeout(700);
  for (let k = 0; k < 6; k++) await ev(page, `g.stormTapAny();`);
  await shot(page, `${tag}-13-storm`, 300);
  await ev(page, `g.ui.armySub = "guild"; g.ui.dirty = true;`);
  await shot(page, `${tag}-12-guildFest`, 500);

  const st = await page.evaluate(() => {
    const g = (window as any).game.s;
    return { bazaar: g.bazaar.slice(0, 3), gain: g.stats.bazaarGain, diplo: g.diplo, wars: g.stats.wars, exp: g.expedition, exps: g.stats.expeditions, tickets: g.expTickets, fest: g.festSeen, ach: g.achievements.slice(-6), prices: g.marketPrices.length };
  });
  console.log(tag, JSON.stringify(st), "errors:", errs);
  await page.close();
}
await browser.close();
