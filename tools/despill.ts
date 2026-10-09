import { chromium } from "playwright-core";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Magenta anahtar arka plandan kalan pembe saçakları temizler:
 * kenara yakın piksellerin rengini içerideki komşulardan alır, en dış halkayı inceltir.
 * usage: tsx tools/despill.ts <dir> [<dir>...]
 */
const dirs = process.argv.slice(2);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.evaluate("window.__name = (f) => f");

for (const dir of dirs) for (const f of readdirSync(dir).filter((n) => n.endsWith(".webp"))) {
  const src = `data:image/webp;base64,${readFileSync(join(dir, f)).toString("base64")}`;
  const out = (await page.evaluate(`(async () => {
    const i = new Image(); i.src = ${JSON.stringify(src)}; await i.decode();
    const c = document.createElement("canvas"); const W = c.width = i.width, H = c.height = i.height;
    const g = c.getContext("2d"); g.drawImage(i, 0, 0);
    const d = g.getImageData(0, 0, W, H); const p = d.data;
    for (let o = 0; o < p.length; o += 4) {
      const m = Math.min(p[o], p[o + 2]) - p[o + 1];
      if (m <= 12) continue;
      p[o] -= m; p[o + 2] -= m;
      p[o + 3] = Math.round(p[o + 3] * Math.max(0, 1 - (m - 12) / 35));
    }
    const D = 4, dist = new Uint8Array(W * H).fill(D);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (p[(y * W + x) * 4 + 3] < 60) { dist[y * W + x] = 0; continue; }
    }
    for (let pass = 1; pass < D; pass++) {
      const prev = dist.slice();
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const k = y * W + x; if (prev[k] < D) continue;
        let near = false;
        for (let v = -1; v <= 1 && !near; v++) for (let u = -1; u <= 1; u++) {
          const xx = x + u, yy = y + v;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H || prev[yy * W + xx] === pass - 1) { near = true; break; }
        }
        if (near) dist[k] = pass;
      }
    }
    const src = new Uint8ClampedArray(p);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = y * W + x, dk = dist[k]; if (dk === 0 || dk >= D) continue;
      let r = 0, gg = 0, b = 0, n = 0;
      for (let v = -4; v <= 4; v++) for (let u = -4; u <= 4; u++) {
        const xx = x + u, yy = y + v; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = yy * W + xx; if (dist[q] < D) continue;
        const o = q * 4; r += src[o]; gg += src[o + 1]; b += src[o + 2]; n++;
      }
      const o = k * 4;
      const pink = Math.max(0, Math.min(src[o], src[o + 2]) - src[o + 1]) + Math.max(0, src[o] - src[o + 1] - 25) * 0.5;
      if (n) {
        const w = Math.min(1, 0.45 + pink / 50);
        p[o] = src[o] * (1 - w) + (r / n) * w;
        p[o + 1] = src[o + 1] * (1 - w) + (gg / n) * w;
        p[o + 2] = src[o + 2] * (1 - w) + (b / n) * w;
      } else {
        const m = Math.min(src[o], src[o + 2]) - src[o + 1];
        if (m > 0) { p[o] -= m; p[o + 2] -= m; }
      }
      if (dk === 1) p[o + 3] = Math.round(p[o + 3] * 0.45);
    }
    g.putImageData(d, 0, 0);
    return c.toDataURL("image/webp", 0.9);
  })()`)) as string;
  writeFileSync(join(dir, f), Buffer.from(out.split(",")[1], "base64"));
  console.log(dir, f);
}
await browser.close();
