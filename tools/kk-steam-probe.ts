import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/steam-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 800 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.addInitScript(`
  var log = JSON.parse(sessionStorage.getItem("fake_log") || "[]");
  var cloud = JSON.parse(sessionStorage.getItem("fake_cloud") || "{}");
  function put() {
    sessionStorage.setItem("fake_log", JSON.stringify(log));
    sessionStorage.setItem("fake_cloud", JSON.stringify(cloud));
  }
  window.kkSteam = {
    available: true,
    deck: true,
    name: function () { return "TestOyuncu"; },
    unlock: function (id) { log.push("ach:" + id); put(); return true; },
    setStat: function (k, v) { log.push("stat:" + k + "=" + v); put(); return true; },
    cloudOn: function () { return true; },
    cloudRead: function (n) { return cloud[n] || null; },
    cloudWrite: function (n, t) { cloud[n] = t; log.push("cloud:" + n); put(); return true; },
    presence: function (k, v) { log.push("rp:" + k + "=" + v); put(); return true; },
    overlay: function () { return true; },
  };
`);
await page.goto("http://localhost:5174/");
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 10; k++) {
    if (!(await page.locator(".battle .bbox.story .btn").count())) break;
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
console.log("bridge:", await page.evaluate(() => typeof (window as unknown as { kkSteam?: unknown }).kkSteam));
console.log("deck ui:", await page.evaluate(() => [getComputedStyle(document.documentElement).getPropertyValue("--ui"), document.body.classList.contains("deck")].join(" ")));
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname input").fill("BulutAlp");
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.res.gold = 777; g.saveNow();`);
await ev(`g.hud.openHero(); g.hud.tab = "ayar"; g.hud.render();`);
await page.waitForTimeout(300);
console.log("steam row:", (await page.locator(".panel .pb").innerText()).split("Steam")[1]?.replace(/\s+/g, " ").slice(0, 220));
await page.locator(".panel .btn", { hasText: "Şimdi yedekle" }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}-1.png` });
const cloudLen = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("fake_cloud") ?? "{}")["kk_cloud.json"] ?? "").length);
console.log("cloud bytes:", cloudLen);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
await page.waitForTimeout(500);
console.log("restored:", await ev(`return [g.s.hero.name, g.s.res.gold, g.s.cls].join(" | ");`));
const log = await page.evaluate(() => JSON.parse(sessionStorage.getItem("fake_log") ?? "[]") as string[]);
console.log("log:", log.filter((l) => !l.startsWith("cloud")).slice(0, 12), "cloud writes:", log.filter((l) => l.startsWith("cloud")).length);
console.log("errors:", errs);
await browser.close();
