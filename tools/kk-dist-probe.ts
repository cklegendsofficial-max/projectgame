import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:4174/";
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
const t0 = Date.now();
await page.goto(url);
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
console.log("ready ms", Date.now() - t0);
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await page.waitForTimeout(800);
await page.screenshot({ path: "playtest/dist.png" });
console.log("errors:", errs);
await browser.close();
