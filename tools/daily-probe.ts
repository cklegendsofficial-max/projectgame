import { chromium } from "playwright-core";
import { newGame } from "../src/state";

const s = newGame();
[60, 30, 25, 10, 5, 3, 2, 1].forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, true, true, false, false, false, false];
s.tutorial = 99;
s.lastSave = Date.now();
const y = new Date(Date.now() - 86_400_000);
s.daily = { last: `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`, streak: 3 };
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: "tr-TR", deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
await page.addInitScript((data) => localStorage.setItem("caravan_tycoon_save_v1", data), save);
await page.goto("http://localhost:5173/");
await page.waitForTimeout(2500);
await page.screenshot({ path: "playtest/daily.png" });
await browser.close();
