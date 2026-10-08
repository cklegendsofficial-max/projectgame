import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:4173/";
const browser = await chromium.launch({ channel: "msedge", headless: true });
for (const [tag, kbps, rtt] of [
  ["4g", 9000, 60],
  ["3g", 1600, 150],
] as const) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: rtt, downloadThroughput: (kbps * 1024) / 8, uploadThroughput: (kbps * 1024) / 8 });
  let bytes = 0;
  let reqs = 0;
  page.on("response", async (r) => {
    reqs++;
    const len = Number(r.headers()["content-length"] ?? 0);
    bytes += len;
  });
  const t0 = Date.now();
  await page.goto(url);
  await page.waitForFunction(() => {
    const l = document.getElementById("loading");
    return (!l || l.offsetParent === null) && !!document.querySelector(".route .send");
  }, null, { timeout: 120_000 });
  const playable = Date.now() - t0;
  const atPlay = { bytes, reqs };
  await page.waitForLoadState("networkidle");
  const idle = Date.now() - t0;
  console.log(`${tag}: oynanabilir ${playable} ms (${atPlay.reqs} istek, ${(atPlay.bytes / 1024).toFixed(0)} KB) | tam yük ${idle} ms (${reqs} istek, ${(bytes / 1024).toFixed(0)} KB)`);
  await page.close();
}
await browser.close();
