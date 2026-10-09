import { chromium } from "playwright-core";
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, extname } from "node:path";

/**
 * Oyundaki küçük WebP görsellerini, üretildikleri orijinal sprite sayfalarındaki
 * hücrelerle görünüşe göre eşleştirir ve eşleşenleri yüksek çözünürlükte yeniden keser.
 * usage: tsx tools/upres.ts <sheetDir> <assetDir> <outDir> [maxSize=512] [--apply]
 */
const [, , sheetDir, assetDir, outDir, maxArg = "512", applyFlag] = process.argv;
const MAX = +maxArg;
const apply = applyFlag === "--apply";
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const sheets = readdirSync(sheetDir).filter((n) => /\.(jpe?g|png)$/i.test(n) && !n.startsWith("c__")).map((n) => join(sheetDir, n));
const SKIP = /[\\/](mtn|flora|tex)[\\/]/;
const assets = walk(assetDir).filter((f) => f.endsWith(".webp") && !SKIP.test(f));
const capOf = (w: number, h: number) => Math.min(MAX, Math.max(2 * Math.max(w, h), 256));
const GRIDS: [number, number][] = [[1, 1], [2, 2], [3, 3], [3, 2], [2, 3], [3, 1], [4, 3], [4, 4], [4, 2], [5, 4], [6, 4], [7, 4], [5, 3], [4, 5], [6, 3], [8, 4], [6, 5]];
const S = 16;

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.setContent("<html><body></body></html>");
await page.evaluate(`(() => {
  const S = ${S};
  window.loadImg = async (url) => { const i = new Image(); i.src = url; await i.decode(); return i; };
  window.sig = (cv, x, y, w, h) => {
    const c = document.createElement("canvas"); c.width = S; c.height = S;
    const g = c.getContext("2d"); g.imageSmoothingQuality = "high";
    g.drawImage(cv, x, y, w, h, 0, 0, S, S);
    const d = g.getImageData(0, 0, S, S).data; const out = new Array(S * S * 4);
    for (let i = 0; i < S * S; i++) { const a = d[i * 4 + 3] / 255; for (let k = 0; k < 3; k++) out[i * 4 + k] = d[i * 4 + k] * a + 128 * (1 - a); out[i * 4 + 3] = d[i * 4 + 3]; }
    return out;
  };
  window.keyCell = (src, sx, sy, sw, sh, scale, magenta, bg, components) => {
    const W = Math.max(1, Math.round(sw * scale)), H = Math.max(1, Math.round(sh * scale));
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d", { willReadFrequently: true }); g.imageSmoothingQuality = "high";
    g.drawImage(src, sx, sy, sw, sh, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H); const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i], gg = p[i + 1], b = p[i + 2];
      if (magenta) {
        const dist = Math.hypot(r - bg[0], gg - bg[1], b - bg[2]);
        const af = dist < 55 ? 0 : dist > 115 ? 1 : (dist - 55) / 60;
        if (af > 0 && af < 1) for (let k = 0; k < 3; k++) p[i + k] = Math.max(0, Math.min(255, (p[i + k] - bg[k] * (1 - af)) / af));
        p[i + 3] = Math.round(af * 255);
        continue;
      }
      const spill = gg - Math.max(r, b); let a = 255;
      if (spill > 170) a = 0; else if (spill > 100) a = Math.round(255 * (1 - (spill - 100) / 70));
      if (a < 255) p[i + 1] = Math.max(r, b); else if (spill > 60) p[i + 1] = Math.max(r, b) + 60;
      p[i + 3] = a;
    }
    let minX = W, minY = H, maxX = 0, maxY = 0;
    if (components) {
      const label = new Int32Array(W * H); const sizes = [0]; const edge = [false];
      for (let st = 0; st < W * H; st++) {
        if (label[st] || p[st * 4 + 3] <= 40) continue;
        const id = sizes.length; let n = 0, touches = false; const stack = [st]; label[st] = id;
        while (stack.length) {
          const k = stack.pop(); n++; const x = k % W, y = (k / W) | 0;
          if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touches = true;
          if (x + 1 < W && !label[k + 1] && p[(k + 1) * 4 + 3] > 40) { label[k + 1] = id; stack.push(k + 1); }
          if (x > 0 && !label[k - 1] && p[(k - 1) * 4 + 3] > 40) { label[k - 1] = id; stack.push(k - 1); }
          if (y + 1 < H && !label[k + W] && p[(k + W) * 4 + 3] > 40) { label[k + W] = id; stack.push(k + W); }
          if (y > 0 && !label[k - W] && p[(k - W) * 4 + 3] > 40) { label[k - W] = id; stack.push(k - W); }
        }
        sizes.push(n); edge.push(touches);
      }
      const biggest = Math.max(...sizes);
      const keep = new Set(sizes.map((n, id) => (n === biggest || (n >= biggest * 0.03 && !edge[id]) ? id : -1)).filter((id) => id > 0));
      for (let k = 0; k < W * H; k++) {
        if (!keep.has(label[k])) { if (p[k * 4 + 3] > 40 || label[k]) p[k * 4 + 3] = 0; continue; }
        const x = k % W, y = (k / W) | 0;
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    } else {
      for (let k = 0; k < W * H; k++) {
        if (p[k * 4 + 3] <= 40) continue;
        const x = k % W, y = (k / W) | 0;
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    g.putImageData(d, 0, 0);
    if (maxX < minX) return null;
    return { c, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  };
  window.bgOf = (img) => {
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0); const bg = [0, 0, 0];
    for (const [x, y] of [[3, 3], [img.width - 4, 3], [3, img.height - 4], [img.width - 4, img.height - 4]]) { const px = g.getImageData(x, y, 1, 1).data; for (let k = 0; k < 3; k++) bg[k] += px[k] / 4; }
    return bg;
  };
})()`);

const b64 = (f: string) => `data:${extname(f) === ".png" ? "image/png" : extname(f) === ".webp" ? "image/webp" : "image/jpeg"};base64,${readFileSync(f).toString("base64")}`;

type Sig = { sig: number[]; w: number; h: number };
const assetSigs: (Sig & { file: string })[] = [];
for (const f of assets) {
  const r = (await page.evaluate(`(async () => { const i = await loadImg(${JSON.stringify(b64(f))}); return { sig: sig(i, 0, 0, i.width, i.height), w: i.width, h: i.height }; })()`)) as Sig;
  assetSigs.push({ ...r, file: f });
}
console.log(`assets: ${assetSigs.length}, sheets: ${sheets.length}`);

type Cand = Sig & { sheet: string; cols: number; rows: number; idx: number; key: "green" | "magenta" | "none" };
const cands: Cand[] = [];
for (const sh of sheets) {
  const list = (await page.evaluate(`(async () => {
    const img = await loadImg(${JSON.stringify(b64(sh))}); const bg = bgOf(img); const out = [];
    for (const [cols, rows] of ${JSON.stringify(GRIDS)}) {
      const cw = img.width / cols, ch = img.height / rows; const scale = Math.min(1, 96 / Math.min(cw, ch));
      for (let idx = 0; idx < cols * rows; idx++) {
        const sx = (idx % cols) * cw, sy = Math.floor(idx / cols) * ch;
        out.push({ cols, rows, idx, key: "none", sig: sig(img, sx, sy, cw, ch), w: cw, h: ch });
        for (const mag of [false, true]) {
          const k = keyCell(img, sx, sy, cw, ch, scale, mag, bg, true);
          if (!k) continue;
          out.push({ cols, rows, idx, key: mag ? "magenta" : "green", sig: sig(k.c, k.x, k.y, k.w, k.h), w: k.w / scale, h: k.h / scale });
        }
      }
    }
    return out;
  })()`)) as Omit<Cand, "sheet">[];
  for (const c of list) cands.push({ ...c, sheet: sh });
  process.stdout.write(".");
}
console.log(`\ncandidates: ${cands.length}`);

const dist = (a: number[], b: number[]) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length / 255;
};
const report: string[] = [];
const plan: { file: string; c: Cand; d: number; cap: number }[] = [];
for (const a of assetSigs) {
  const ar = a.w / a.h;
  let best: Cand | null = null, bd = 1;
  for (const c of cands) {
    const cr = c.w / c.h;
    if (Math.abs(Math.log(cr / ar)) > 0.12) continue;
    const d = dist(a.sig, c.sig);
    if (d < bd) { bd = d; best = c; }
  }
  const rel = relative(assetDir, a.file).replace(/\\/g, "/");
  if (!best) { report.push(`${rel}\t${a.w}x${a.h}\tNO MATCH`); continue; }
  const gain = Math.min(capOf(a.w, a.h), Math.max(best.w, best.h)) / Math.max(a.w, a.h);
  report.push(`${rel}\t${a.w}x${a.h}\t${bd.toFixed(3)}\t${relative(sheetDir, best.sheet)}\t${best.cols}x${best.rows}#${best.idx}\t${best.key}\tnative ${Math.round(best.w)}x${Math.round(best.h)}\tgain ${gain.toFixed(2)}`);
  if (bd < 0.06 && gain >= 1.25) plan.push({ file: a.file, c: best, d: bd, cap: capOf(a.w, a.h) });
}
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "report.tsv"), report.join("\n"));
console.log(`matched for upgrade: ${plan.length} / ${assetSigs.length}`);

for (const { file, c, cap } of plan) {
  const rel = relative(assetDir, file);
  const data = (await page.evaluate(`(async () => {
    const img = await loadImg(${JSON.stringify(b64(c.sheet))}); const bg = bgOf(img);
    const cw = img.width / ${c.cols}, ch = img.height / ${c.rows};
    const sx = (${c.idx} % ${c.cols}) * cw, sy = Math.floor(${c.idx} / ${c.cols}) * ch;
    let k;
    if (${JSON.stringify(c.key)} === "none") { const cv = document.createElement("canvas"); cv.width = Math.round(cw); cv.height = Math.round(ch); cv.getContext("2d").drawImage(img, sx, sy, cw, ch, 0, 0, cv.width, cv.height); k = { c: cv, x: 0, y: 0, w: cv.width, h: cv.height }; }
    else k = keyCell(img, sx, sy, cw, ch, 1, ${JSON.stringify(c.key)} === "magenta", bg, true);
    const s = Math.min(1, ${cap} / Math.max(k.w, k.h));
    const o = document.createElement("canvas"); o.width = Math.round(k.w * s); o.height = Math.round(k.h * s);
    const og = o.getContext("2d"); og.imageSmoothingQuality = "high";
    og.drawImage(k.c, k.x, k.y, k.w, k.h, 0, 0, o.width, o.height);
    return o.toDataURL("image/webp", 0.9);
  })()`)) as string;
  const dest = apply ? file : join(outDir, rel);
  mkdirSync(join(dest, ".."), { recursive: true });
  writeFileSync(dest, Buffer.from(data.split(",")[1], "base64"));
}
console.log(apply ? "applied" : `written to ${outDir}`);
await browser.close();
