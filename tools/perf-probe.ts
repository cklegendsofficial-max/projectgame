import { chromium } from "playwright-core";
import { newGame } from "../src/state";

function save(): string {
  const s = newGame();
  s.gold = 5e12;
  s.lifetimeEarned = 5e12;
  [300, 250, 200, 150, 100, 80, 50, 25].forEach((n, i) => (s.routes[i].owned = n));
  s.masters = s.routes.map(() => true);
  s.tutorial = 99;
  s.age = 3;
  s.companions = { batu: 3, ayse: 2 };
  s.soldiers = 300;
  s.barracks = 5;
  s.escorts = [30, 30, 30, 30, 30, 30, 30, 30];
  s.hero = { name: "Alp", look: 0, level: 20, xp: 0, gear: {} };
  s.mount = { breed: 3, plus: 2 };
  s.nemeses = [{ id: 1, epithet: 0, name: "Temür", look: 0, route: 1, level: 3, wins: 2 }];
  s.fallenHeroes = [{ name: "Ata", look: 1, level: 12, gen: 1, foe: "Kara Temür" }];
  s.fortsTaken = ["kizilkum"];
  s.wonders = { registan: 3, sanjar: 1 };
  const d = new Date();
  s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
  s.lastSave = Date.now();
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64");
}

const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu-rasterization"] });
for (const vp of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport: vp });
  await page.addInitScript((data) => localStorage.setItem("caravan_tycoon_save_v1", data), save());
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelector<HTMLElement>("#modal button.primary")?.click());
  await page.waitForTimeout(500);
  const res = await page.evaluate(`(async () => {
    const g = window.game;
    const t = { draw: 0, ui: 0, sig: 0, step: 0 };
    function wrap(obj, name, key) {
      const orig = obj[name].bind(obj);
      obj[name] = function (...a) {
        const s = performance.now();
        const r = orig(...a);
        t[key] += performance.now() - s;
        return r;
      };
    }
    wrap(g.map, "draw", "draw");
    wrap(g.ui, "update", "ui");
    wrap(g.ui, "structureSig", "sig");
    wrap(g, "warTick", "step");
    const proto = Object.getPrototypeOf(g.map);
    for (const k of Object.getOwnPropertyNames(proto)) {
      if (k.startsWith("draw") && k !== "draw" && typeof proto[k] === "function") { t["m_" + k] = 0; wrap(g.map, k, "m_" + k); }
    }
    let n = 0;
    const start = performance.now();
    await new Promise(function (done) {
      function tick() {
        n++;
        if (performance.now() - start < 5000) requestAnimationFrame(tick);
        else done();
      }
      requestAnimationFrame(tick);
    });
    const el = performance.now() - start;
    const parts = Object.entries(t).filter(([k, v]) => k.startsWith("m_") && v / n > 0.05).sort((a, b) => b[1] - a[1]).map(([k, v]) => k.slice(2) + ":" + (v / n).toFixed(2));
    return { fps: (n / el) * 1000, drawMs: t.draw / n, uiMs: t.ui / n, sigMs: t.sig / n, warMs: t.step / n, parts: parts.join(" ") };
  })()`);
  console.log(vp.width, JSON.stringify(res, (_, v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v)));
  await page.close();
}
await browser.close();
