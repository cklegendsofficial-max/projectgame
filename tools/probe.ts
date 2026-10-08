import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
await page.goto("http://localhost:5173/");
await page.waitForTimeout(1500);
console.log(await page.evaluate(() => {
  const t = document.querySelector(".brand .titles")!;
  return JSON.stringify({ w: innerWidth, display: getComputedStyle(t).display, mq: matchMedia("(max-width: 700px)").matches, css: [...document.styleSheets].map((s) => { try { return [...s.cssRules].filter((r) => r.cssText.includes("700px")).map((r) => r.cssText.slice(0, 80)); } catch { return "x"; } }) });
}));
await page.screenshot({ path: "playtest/probe540.png" });
await browser.close();
