import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const s = newGame();
s.gold = 5e11;
[150, 100, 60, 40, 30, 10, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, true, true, true, false, false, false];
s.tutorial = 99;
s.hero = { name: "Alp", look: 0, level: 5, xp: 0, gear: {} };
s.hans = [0, 1, 2, 3, 4];
s.camp = "yayla";
s.nextTitan = s.nextTradeWar = s.nextHanStory = Date.now() + 3_600_000;
const d = new Date();
s.daily = { last: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, streak: 1 };
s.lastSave = Date.now();
const data = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, locale: "tr-TR" });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.addInitScript((x) => localStorage.setItem("caravan_tycoon_save_v1", x), data);
await page.goto("http://localhost:5173/");
await page.waitForTimeout(2500);
await page.evaluate(`(() => { const m = document.querySelector("#modal:not(.hidden) button.primary"); m && m.click(); })()`);
await page.evaluate(`(() => { const g = window.game; g.map.zoomAt(window.innerWidth * 0.3, window.innerHeight * 0.5, 1.8); g.map.flyToNorm(0.72, 0.55); })()`);
await page.waitForTimeout(4500);
await page.screenshot({ path: "playtest/epic-han-zoom.png" }); const pp = await page.evaluate(`(() => { const g = window.game; const r = g.map.canvas.getBoundingClientRect(); return [0,1,2,3,4].map(i => { const p = g.map.routePoint(i, 0.36); return [Math.round(p.x + r.left), Math.round(p.y + r.top)]; }); })()`); console.log("pts", JSON.stringify(pp), await page.evaluate("JSON.stringify(window.__dbg)")); await page.evaluate(`(() => { const m = window.game.map; const orig = m.draw.bind(m); m.draw = (s, e, n) => { orig(s, e, n); const c = m.ctx; for (const i of s.hans) { const p = m.routePoint(i, 0.5); c.fillStyle = "red"; c.beginPath(); c.arc(p.x, p.y + 14, 3, 0, 7); c.fill(); } }; })()`); await page.waitForTimeout(200); await page.screenshot({ path: "playtest/epic-han-zoom2.png" }); await page.evaluate(`(() => { window.game.s.hans = []; })()`); await page.waitForTimeout(200); await page.screenshot({ path: "playtest/epic-han-zoom3.png" }); console.log(await page.evaluate(`(() => { const g = window.game; const p = g.map.routePoint(1, 0.36); const src = performance.getEntriesByType("resource").map(e => e.name).filter(n => n.includes("han.") || n.includes("yayla.")); return JSON.stringify({ src, hans: g.s.hans, p, w: g.map.w, h: g.map.h, imgs: [...document.images].filter(i => i.src.includes("han")).length }); })()`));
console.log("errors:", errs);
await browser.close();











