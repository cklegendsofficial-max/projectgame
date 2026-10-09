import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Yüksek çözünürlüklü kaynaktan, mevcut (küçük) portrenin kadrajını arayıp bulur,
 * magenta zemini eskisinin köşe rengine çevirip aynı kadrajı büyük boyutta yazar.
 * usage: tsx tools/portrait-fit.ts <size> <src.png>=<old.webp>=<out.webp> ...
 */
const [, , sizeArg, ...pairs] = process.argv;
const S = +sizeArg;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.evaluate("window.__name = (f) => f");
const url = (f: string) => `data:image/${f.endsWith(".png") ? "png" : "webp"};base64,${readFileSync(f).toString("base64")}`;
for (const p of pairs) {
  const [src, old, out] = p.split("=");
  const res = (await page.evaluate(`(async () => {
    const ld = async (u) => { const i = new Image(); i.src = u; await i.decode(); return i; };
    const big = await ld(${JSON.stringify(url(src))}), small = await ld(${JSON.stringify(url(old))});
    const oc = document.createElement("canvas"); oc.width = small.width; oc.height = small.height;
    const og = oc.getContext("2d"); og.drawImage(small, 0, 0);
    const bgc = og.getImageData(2, 2, 1, 1).data;
    // magenta zemini eski zemin rengine çevir
    const kc = document.createElement("canvas"); kc.width = big.width; kc.height = big.height;
    const kg = kc.getContext("2d"); kg.drawImage(big, 0, 0);
    const kd = kg.getImageData(0, 0, kc.width, kc.height); const p = kd.data;
    const key = kg.getImageData(4, 4, 1, 1).data;
    for (let i = 0; i < p.length; i += 4) {
      const d = Math.hypot(p[i] - key[0], p[i + 1] - key[1], p[i + 2] - key[2]);
      const a = d < 60 ? 0 : d > 130 ? 1 : (d - 60) / 70;
      for (let k = 0; k < 3; k++) {
        const fg = a > 0 ? Math.max(0, Math.min(255, (p[i + k] - key[k] * (1 - a)) / a)) : 0;
        p[i + k] = fg * a + bgc[k] * (1 - a);
      }
      const spill = Math.min(p[i], p[i + 2]) - p[i + 1];
      if (spill > 0 && a < 1) { p[i] -= spill * 0.8; p[i + 2] -= spill * 0.8; }
    }
    kg.putImageData(kd, 0, 0);
    const N = 48;
    const tgtC = document.createElement("canvas"); tgtC.width = tgtC.height = N;
    const tg = tgtC.getContext("2d"); tg.imageSmoothingQuality = "high"; tg.drawImage(small, 0, 0, N, N);
    const T = tg.getImageData(0, 0, N, N).data;
    const tc = document.createElement("canvas"); tc.width = tc.height = N;
    const cg = tc.getContext("2d", { willReadFrequently: true });
    const score = (x, y, w) => {
      cg.clearRect(0, 0, N, N); cg.drawImage(kc, x, y, w, w, 0, 0, N, N);
      const D = cg.getImageData(0, 0, N, N).data; let s = 0;
      for (let i = 0; i < D.length; i += 4) s += Math.abs(D[i] - T[i]) + Math.abs(D[i + 1] - T[i + 1]) + Math.abs(D[i + 2] - T[i + 2]);
      return s;
    };
    const W = kc.width;
    let best = { x: 0, y: 0, w: W, s: score(0, 0, W) };
    for (let f = 0.5; f <= 1.0001; f += 0.025) {
      const w = W * f;
      for (let x = 0; x <= W - w + 1; x += W / 64) for (let y = 0; y <= W - w + 1; y += W / 64) {
        const s = score(x, y, w); if (s < best.s) best = { x, y, w, s };
      }
    }
    for (let it = 0; it < 3; it++) {
      const st = W / (256 * (it + 1));
      for (let dw = -2; dw <= 2; dw++) for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
        const w = best.w + dw * st, x = best.x + dx * st, y = best.y + dy * st;
        if (w <= 0 || x < 0 || y < 0 || x + w > W || y + w > W) continue;
        const s = score(x, y, w); if (s < best.s) best = { x, y, w, s };
      }
    }
    const o = document.createElement("canvas"); o.width = o.height = ${S};
    const g = o.getContext("2d"); g.imageSmoothingQuality = "high";
    g.drawImage(kc, best.x, best.y, best.w, best.w, 0, 0, ${S}, ${S});
    return { data: o.toDataURL("image/webp", 0.9), fit: [best.x / W, best.y / W, best.w / W, best.s / (N * N * 3 * 255)] };
  })()`)) as { data: string; fit: number[] };
  writeFileSync(out, Buffer.from(res.data.split(",")[1], "base64"));
  console.log(out, res.fit.map((v) => v.toFixed(3)).join(" "));
}
await browser.close();
