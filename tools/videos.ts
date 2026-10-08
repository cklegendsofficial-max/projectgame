import { chromium, type Page } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import ffmpeg from "ffmpeg-static";
import { newGame } from "../src/state";

const URL = process.env.URL ?? "http://localhost:5173/";
const OUT = "release/videos";
const RAW = "release/videos/raw";
mkdirSync(RAW, { recursive: true });

const s = newGame();
s.gold = 8e7;
s.runEarned = 6e7;
s.lifetimeEarned = 6e7;
[60, 30, 25, 10, 3, 0, 0, 0].forEach((n, i) => (s.routes[i].owned = n));
s.masters = [true, true, true, true, false, false, false, false];
s.tutorial = 99;
s.settings.lang = "en";
s.lastSave = Date.now();
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

async function spawn(page: Page, kind: "bandit" | "merchant"): Promise<void> {
  await page.evaluate((kind) => {
    const g = (window as any).game;
    g.events[kind === "bandit" ? "nextBandit" : "nextMerchant"] = 0;
    if (kind === "merchant") g.events.nextBandit = Date.now() + 60_000;
  }, kind);
}

async function clickEvent(page: Page, kind: string): Promise<void> {
  const p = await page.evaluate((kind) => {
    const g = (window as any).game;
    const e = g.events.list.find((x: any) => x.kind === kind);
    if (!e) return null;
    const pt = g.map.eventPoint(e);
    const r = document.getElementById("map")!.getBoundingClientRect();
    return { x: r.left + pt.x, y: r.top + pt.y };
  }, kind);
  if (p) await page.mouse.click(p.x, p.y);
}

async function buy(page: Page, i: number, times: number, gap = 280): Promise<void> {
  const btn = page.locator(".route").nth(i).locator(".buy");
  for (let k = 0; k < times; k++) {
    await btn.evaluate((el: HTMLElement) => el.click(), undefined, { timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(gap);
  }
}

async function record(name: string, w: number, h: number, outW: number, outH: number): Promise<void> {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: RAW, size: { width: w, height: h } } });
  await ctx.addInitScript((data) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("caravan_tycoon_save_v1", data);
      sessionStorage.setItem("seeded", "1");
    }
  }, save);
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto(URL);
  await page.waitForTimeout(2000);
  const modal = page.locator("#modal button").first();
  if (await modal.isVisible().catch(() => false)) await modal.click();
  await page.waitForTimeout(500);
  const start = (Date.now() - t0) / 1000;
  await page.locator(".mode").nth(1).click();
  await buy(page, 4, 3, 500);
  await spawn(page, "bandit");
  await page.waitForTimeout(1600);
  await clickEvent(page, "bandit");
  await page.waitForTimeout(900);
  await page.locator(".mode").nth(0).click();
  await buy(page, 5, 1);
  await page.waitForTimeout(800);
  for (let k = 0; k < 3; k++) {
    for (const i of [5, 4]) await page.locator(".route").nth(i).locator(".send").evaluate((el: HTMLElement) => el.click(), undefined, { timeout: 2000 }).catch(() => {});
    await buy(page, 5, 2, 350);
  }
  await spawn(page, "merchant");
  await page.waitForTimeout(1500);
  await clickEvent(page, "merchant");
  await page.waitForTimeout(800);
  await page.locator(".mode").nth(1).click();
  await buy(page, 3, 3, 450);
  await buy(page, 4, 2, 450);
  await page.waitForTimeout(3000);
  const end = (Date.now() - t0) / 1000;

  const video = page.video()!;
  await ctx.close();
  await browser.close();
  const raw = await video.path();
  const dur = Math.min(20, end - start);
  execFileSync(ffmpeg as unknown as string, [
    "-y", "-ss", start.toFixed(2), "-i", raw, "-t", dur.toFixed(2),
    "-vf", `scale=${outW}:${outH}:flags=lanczos,fps=30`, "-an",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart",
    `${OUT}/${name}.mp4`,
  ], { stdio: "inherit" });
  console.log(`${name}: ${dur.toFixed(1)}s`);
}

await record("video-landscape", 1280, 720, 1280, 720);
await record("video-portrait", 540, 960, 720, 1280);
for (const f of readdirSync(RAW)) rmSync(`${RAW}/${f}`);
rmSync(RAW, { recursive: true });
