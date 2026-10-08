import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const [, , input, outDir, names, cols = "3", rows = "3", maxSize = "192", key = "green"] = process.argv;
if (!input || !outDir || !names) {
  console.log("usage: tsx tools/sprites.ts <sheet.jpg> <outDir> <name1,name2,...> [cols] [rows] [maxSize]");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const dataUrl = "data:image/jpeg;base64," + readFileSync(input).toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
const results: { name: string; data: string; w: number; h: number }[] = await page.evaluate(
  async ({ dataUrl, names, cols, rows, maxSize, magenta }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const probe = document.createElement("canvas");
    probe.width = img.width;
    probe.height = img.height;
    const pg = probe.getContext("2d")!;
    pg.drawImage(img, 0, 0);
    const bg = [0, 0, 0];
    for (const [x, y] of [[3, 3], [img.width - 4, 3], [3, img.height - 4], [img.width - 4, img.height - 4]]) {
      const px = pg.getImageData(x, y, 1, 1).data;
      for (let k = 0; k < 3; k++) bg[k] += px[k] / 4;
    }
    const cw = img.width / cols;
    const ch = img.height / rows;
    const out: { name: string; data: string; w: number; h: number }[] = [];
    names.forEach((name, idx) => {
      const cx = (idx % cols) * cw;
      const cy = Math.floor(idx / cols) * ch;
      const c = document.createElement("canvas");
      c.width = Math.round(cw);
      c.height = Math.round(ch);
      const g = c.getContext("2d")!;
      g.drawImage(img, cx, cy, cw, ch, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const r = p[i], gg = p[i + 1], b = p[i + 2];
        if (magenta) {
          const dist = Math.hypot(r - bg[0], gg - bg[1], b - bg[2]);
          const af = dist < 55 ? 0 : dist > 115 ? 1 : (dist - 55) / 60;
          if (af > 0 && af < 1) {
            for (let k = 0; k < 3; k++) p[i + k] = Math.max(0, Math.min(255, (p[i + k] - bg[k] * (1 - af)) / af));
          }
          p[i + 3] = Math.round(af * 255);
          continue;
        }
        const spill = gg - Math.max(r, b);
        let a = 255;
        if (spill > 170) a = 0;
        else if (spill > 100) a = Math.round(255 * (1 - (spill - 100) / 70));
        if (a < 255) p[i + 1] = Math.max(r, b);
        else if (spill > 60) p[i + 1] = Math.max(r, b) + 60;
        p[i + 3] = a;
      }
      const W = c.width, H = c.height;
      const label = new Int32Array(W * H);
      const sizes: number[] = [0];
      const edge: boolean[] = [false];
      for (let start = 0; start < W * H; start++) {
        if (label[start] || p[start * 4 + 3] <= 40) continue;
        const id = sizes.length;
        let n = 0;
        let touches = false;
        const stack = [start];
        label[start] = id;
        while (stack.length) {
          const k = stack.pop()!;
          n++;
          const x = k % W, y = (k / W) | 0;
          if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touches = true;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            const nk = ny * W + nx;
            if (!label[nk] && p[nk * 4 + 3] > 40) {
              label[nk] = id;
              stack.push(nk);
            }
          }
        }
        sizes.push(n);
        edge.push(touches);
      }
      const biggest = Math.max(...sizes);
      const keepSet = new Set(sizes.map((n, id) => (n === biggest || (n >= biggest * 0.03 && !edge[id]) ? id : -1)).filter((id) => id > 0));
      let minX = W, minY = H, maxX = 0, maxY = 0;
      for (let k = 0; k < W * H; k++) {
        if (!keepSet.has(label[k])) {
          if (p[k * 4 + 3] > 40 || label[k]) p[k * 4 + 3] = 0;
          continue;
        }
        const x = k % W, y = (k / W) | 0;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      g.putImageData(d, 0, 0);
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      const s = Math.min(1, maxSize / Math.max(bw, bh));
      const o = document.createElement("canvas");
      o.width = Math.round(bw * s);
      o.height = Math.round(bh * s);
      const og = o.getContext("2d")!;
      og.imageSmoothingQuality = "high";
      og.drawImage(c, minX, minY, bw, bh, 0, 0, o.width, o.height);
      out.push({ name, data: o.toDataURL("image/png"), w: o.width, h: o.height });
    });
    return out;
  },
  { dataUrl, names: names.split(","), cols: +cols, rows: +rows, maxSize: +maxSize, magenta: key === "magenta" },
);
for (const r of results) {
  writeFileSync(`${outDir}/${r.name}.png`, Buffer.from(r.data.split(",")[1], "base64"));
  console.log(`${r.name}: ${r.w}x${r.h}`);
}
await browser.close();
