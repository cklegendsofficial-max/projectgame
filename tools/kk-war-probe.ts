import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const cls = process.argv[3] ?? "alp";
const out = `playtest/war-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 5 && (await page.locator(".battle .bbox.story .btn").count()); k++) {
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(250);
  }
};
let fails = 0;
const check = (ok: boolean, what: string) => {
  console.log(ok ? "OK  " : "FAIL", what);
  if (!ok) fails++;
};
await page.locator(`.ccard[data-c="${cls}"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await dismiss();

// meydan muharebesi: savaş ortası
await ev(`g.s.hero.lv = 12; g.s.hero.hp = g.maxHp(); g.s.hero.army = { spear: 40, archer: 30, horse: 25 }; g.battle("Meydan Muharebesi", { spear: 70, archer: 50, horse: 45 }, 0, () => "", null, "Gazne ordusu");`);
await page.waitForTimeout(400);
if (await page.locator(".tact").count()) await page.locator(".tact").first().click();
await page.waitForSelector(".battle .bbox.war", { timeout: 8000 });
await page.waitForTimeout(1700);
await page.screenshot({ path: `${out}-01-mid.png` });
const box = await page.locator(".battle .bbox.war").boundingBox();
check(!!box && box.height <= vp.height, `savaş kutusu ekrana sığıyor (${Math.round(box?.height ?? 0)}px)`);
check((await page.locator(".battle .orders .ord").count()) > 0, "savaş içi emirler görünüyor");
await page.locator(".battle .orders .ord").first().click().catch(() => {});
await page.waitForSelector(".battle .result .btn", { timeout: 60000 });
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}-02-end.png` });
const btn = await page.locator(".battle .result .btn").boundingBox();
check(!!btn && btn.y + btn.height <= vp.height, "Devam düğmesi görünür");
await page.locator(".battle .result .btn").click();
await dismiss();

// bildirim kuyruğu
await ev(`for (let i = 0; i < 7; i++) g.hud.toast("Deneme bildirimi " + i, "info"); g.hud.questDone({ title: "Deneme görevi", reward: { gold: 10 } });`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}-03-toasts.png` });
const shown = await page.locator(".toasts > *").count();
check(shown <= (mode === "mob" ? 2 : 3), `aynı anda en fazla ${mode === "mob" ? 2 : 3} bildirim (${shown})`);
await page.waitForTimeout(4500);
const later = await page.locator(".toasts > *").allInnerTexts();
check(later.some((t) => /Deneme (bildirimi [3-6]|görevi)/.test(t)), "kuyruktaki bildirimler sırayla geliyor");

// yan kartlar
await ev(`g.hud.notice("scroll", "Deneme kartı", "alt satır", () => g.hud.story("Deneme", "icons/scroll", "Kart açıldı", "Tamam"));`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}-04-note.png` });
await page.locator(".notes .note").last().click();
await page.waitForTimeout(300);
check((await page.locator(".battle .bbox.story").count()) > 0, "kart tıklanınca olay açılıyor");
await dismiss();

console.log("errors:", JSON.stringify(errs));
console.log(fails || errs.length ? "FAILED" : "ALL OK");
await browser.close();
process.exit(fails || errs.length ? 1 : 0);
