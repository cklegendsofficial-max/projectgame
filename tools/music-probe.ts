import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
import { newGame } from "../src/state";

const s = newGame();
s.tutorial = 99;
s.lastSave = Date.now();
s.daily = { last: (() => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; })(), streak: 1 };
const save = Buffer.from(JSON.stringify(s), "utf8").toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.on("console", (m) => m.type() === "error" && console.log("console:", m.text()));
await page.addInitScript((data) => {
  localStorage.setItem("caravan_tycoon_save_v1", data);
  const orig = AudioContext.prototype.createGain;
  const w = window as unknown as { __master?: GainNode };
  AudioContext.prototype.createGain = function (this: AudioContext) {
    const g = orig.call(this);
    if (!w.__master) w.__master = g;
    return g;
  };
}, save);
await page.goto("http://localhost:5173/");
await page.waitForTimeout(1500);
await page.mouse.click(5, 5);
const seconds = 25;
const b64 = await page.evaluate(async (seconds) => {
  const w = window as unknown as { __master: GainNode };
  const master = w.__master;
  const c = master.context as AudioContext;
  await c.resume();
  const an = c.createAnalyser();
  master.connect(an);
  const dest = c.createMediaStreamDestination();
  master.connect(dest);
  const rec = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  rec.start();
  const buf = new Float32Array(an.fftSize);
  let peak = 0;
  for (let k = 0; k < seconds * 4; k++) {
    await new Promise((r) => setTimeout(r, 250));
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += v * v;
    peak = Math.max(peak, Math.sqrt(sum / buf.length));
  }
  rec.stop();
  await new Promise((r) => (rec.onstop = r));
  const blob = new Blob(chunks, { type: "audio/webm" });
  const arr = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (const x of arr) bin += String.fromCharCode(x);
  console.log("state", c.state, "peakRMS", peak.toFixed(4));
  return { data: btoa(bin), peak };
}, seconds);
console.log("peak RMS:", b64.peak.toFixed(4));
writeFileSync("playtest/music-sample.webm", Buffer.from(b64.data, "base64"));
await browser.close();
