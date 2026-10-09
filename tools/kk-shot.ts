import { chromium } from "playwright-core";

/**
 * Oyunu başlatır (köleliği atlar), ardından adımları çalıştırıp ekran görüntüsü alır.
 * usage: tsx tools/kk-shot.ts <desk|mob> <tag> "<js>@<ms>" ["<js>@<ms>" ...]
 * Her adım: js çalıştırılır (g = window.game), ms beklenir, playtest/shot-<tag>-<n>.png yazılır.
 * js "click:<selector>" ise o öğeye tıklanır.
 */
const [, , mode = "desk", tag = "x", ...steps] = process.argv;
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1600, height: 900 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 3 : 1, hasTouch: mode === "mob" });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.evaluate("window.__name = (f) => f");
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 90000 });
const ev = (fn: string) => page.evaluate(`(async () => { const g = window.game; ${fn} })()`);
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
const skip = async () => {
  for (let k = 0; k < 10 && (await page.locator(".battle .bbox .btn.go").count()); k++) {
    await page.locator(".battle .bbox .btn.go").first().click();
    await page.waitForTimeout(150);
  }
};
await skip();
await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await skip();
let n = 0;
for (const st of steps) {
  const at = st.lastIndexOf("@");
  const js = at >= 0 ? st.slice(0, at) : st;
  const ms = at >= 0 ? +st.slice(at + 1) : 800;
  try {
    if (!js) {
      /* yalnızca bekle */
    } else if (js.startsWith("click:")) await page.locator(js.slice(6)).first().click({ timeout: 5000 });
    else if (js === "skip") await skip();
    else {
      const r = await ev(js);
      if (r !== undefined) console.log(`step ${n}:`, JSON.stringify(r));
    }
  } catch (e) {
    console.log(`step ${n} error:`, (e as Error).message.split("\n")[0]);
  }
  await page.waitForTimeout(ms);
  await page.screenshot({ path: `playtest/shot-${tag}-${n++}.png` });
}
console.log("errors:", errs);
await browser.close();
