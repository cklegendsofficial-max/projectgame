import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const q of ["", "?muteAudio=true"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("pageerror", (e) => console.log("pageerror:", e.message));
  await page.goto("http://localhost:5173/" + q);
  await page.waitForTimeout(2500);
  const before = await page.locator("#muteBtn").innerText();
  await page.locator("#muteBtn").click();
  await page.waitForTimeout(300);
  await page.locator("#muteBtn").click();
  await page.waitForTimeout(300);
  console.log(`${q || "(normal)"}: icon=${before} afterToggleTwice=${await page.locator("#muteBtn").innerText()}`);
  await page.close();
}
await browser.close();
