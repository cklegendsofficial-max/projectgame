import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/music-${mode}`;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1, hasTouch: mode === "mob" });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.addInitScript(`(() => {
  const spoken = (window.__spoken = []);
  const voices = [{ name: "Microsoft Tolga", lang: "tr-TR", localService: true, default: true, voiceURI: "tolga" }, { name: "Microsoft Guy Online (Natural)", lang: "en-US", localService: false, default: false, voiceURI: "guy" }];
  const fake = {
    speaking: false,
    getVoices: () => voices,
    speak(u) { spoken.push({ text: u.text, voice: u.voice && u.voice.name, rate: u.rate }); this.speaking = true; window.__cur = u; },
    cancel() { if (this.speaking) spoken.push({ cancel: true }); this.speaking = false; const u = window.__cur; window.__cur = null; u && u.onend && u.onend(); },
    addEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: fake, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
})()`);
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
await page.evaluate(`window.__mod = (f) => import(performance.getEntriesByType("resource").map((e) => e.name).filter((n) => n.includes("/src/" + f)).pop() ?? "/src/" + f)`);
const scene = () => page.evaluate<string>(`(async () => window.game.musicScene() + " -> audio " + (await window.__mod("audio.ts")).audio.currentScene)()`);
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await page.waitForTimeout(500);
console.log("story listen btn:", await page.locator(".bbox.story .listen").count());
await page.locator(".bbox.story .listen").first().click().catch(() => {});
await page.waitForTimeout(200);
console.log("spoken after click:", await page.evaluate(`JSON.stringify(window.__spoken.slice(-1)).slice(0, 160)`));
await page.screenshot({ path: `${out}-story.png` });
for (let k = 0; k < 10 && (await page.locator(".battle .bbox.story .btn.go, .battle .bbox.choice .btn").count()); k++) {
  await page.locator(".battle .bbox.story .btn.go, .battle .bbox.choice .btn").first().click();
  await page.waitForTimeout(200);
}
console.log("after dismiss:", await page.evaluate(`JSON.stringify(window.__spoken.slice(-1))`), "speaking:", await page.evaluate(`window.speechSynthesis.speaking`));

await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await page.waitForTimeout(400);
for (let k = 0; k < 6 && (await page.locator(".battle .bbox .btn.go").count()); k++) {
  await page.locator(".battle .bbox .btn.go").first().click();
  await page.waitForTimeout(200);
}
await page.waitForTimeout(800);
console.log("at capital:", await scene());
await ev(`const c = g.cityPos("merv"); g.s.hero.x = c.x + 400; g.s.hero.y = c.y + 400; g.s.bandits.forEach((b) => { b.x = -9999; b.y = -9999; });`);
await page.waitForTimeout(800);
console.log("open road:", await scene());
console.log("bandits:", await ev(`return g.s.bandits.length;`));
await ev(`const h = g.s.hero; const b = g.s.bandits.find((b) => !b.posse && !b.nem) ?? g.s.bandits[0]; window.__b = b; b.x = b.tx = h.x + 230; b.y = b.ty = h.y; b.wait = 99; b.chase = false;`);
await page.waitForTimeout(700);
console.log("bandit near:", await scene());
await ev(`const b = window.__b; b.x = b.tx = -9999; b.y = b.ty = -9999; const p = g.kipPois()[0]; g.s.hero.x = p.x + 300; g.s.hero.y = p.y + 200;`);
await page.waitForTimeout(800);
console.log("kipchak:", await scene());
await ev(`g.s.hero.army = { spear: 10, archer: 5, horse: 5 }; g.battle("Deneme", { spear: 2, archer: 0, horse: 0 }, 0, () => "");`);
await page.waitForTimeout(800);
console.log("in battle:", await scene());
for (let k = 0; k < 12; k++) {
  if (await page.locator(".battle .tact").count()) { await page.locator(".battle .tact").first().click(); await page.waitForTimeout(300); continue; }
  const b = page.locator(".battle .result .btn, .battle .bbox:not(.story) .btn.go");
  if (!(await b.count())) break;
  await b.first().click().catch(() => {});
  await page.waitForTimeout(400);
}
await page.waitForTimeout(800);
console.log("after battle:", await scene());

for (let k = 0; k < 8 && (await page.locator(".battle .bbox.story .btn.go, .battle .bbox.choice .btn").count()); k++) {
  await page.locator(".battle .bbox.story .btn.go, .battle .bbox.choice .btn").first().click();
  await page.waitForTimeout(200);
}
const n0 = await page.evaluate<number>(`window.__spoken.length`);
await page.evaluate(`(async () => { const m = await window.__mod("settings.ts"); m.settings.narrate = true; })()`);
await ev(`g.hud.story("Deneme hikâyesi", "quest", "Bozkırda rüzgâr eser. <b>+50 TP</b>", "Devam");`);
await page.waitForTimeout(700);
const sp = await page.evaluate<string>(`JSON.stringify(window.__spoken.slice(${n0}))`);
console.log("auto narrate:", sp.slice(0, 200));
await page.screenshot({ path: `${out}-auto.png` });
await page.locator(".bbox.story .btn.go").first().click();
console.log("errors:", errs);
await browser.close();
