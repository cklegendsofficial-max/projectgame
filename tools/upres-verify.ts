import { chromium } from "playwright-core";
import { copyFileSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * upres çıktısını eski boyuta küçültüp eskisiyle piksel piksel karşılaştırır;
 * fark eşiğin altındaysa (--apply ile) asıl dosyanın üzerine yazar.
 * usage: tsx tools/upres-verify.ts <upresDir> <assetDir> [maxDiff=0.06] [--apply]
 */
const [, , upDir, assetDir, maxArg = "0.06", applyFlag] = process.argv;
const MAXD = +maxArg;
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const b64 = (f: string) => `data:image/webp;base64,${readFileSync(f).toString("base64")}`;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.evaluate("window.__name = (f) => f");
const rows: [string, number][] = [];
for (const f of walk(upDir).filter((n) => n.endsWith(".webp"))) {
  const rel = relative(upDir, f);
  const old = join(assetDir, rel);
  const d = (await page.evaluate(`(async () => {
    const ld = async (u) => { const i = new Image(); i.src = u; await i.decode(); return i; };
    const a = await ld(${JSON.stringify(b64(old))}), b = await ld(${JSON.stringify(b64(f))});
    const W = a.width, H = a.height;
    const px = (img) => { const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(img, 0, 0, W, H); return g.getImageData(0, 0, W, H).data; };
    const A = px(a), B = px(b); let s = 0, n = 0;
    for (let i = 0; i < A.length; i += 4) {
      const aa = A[i + 3] / 255, ba = B[i + 3] / 255;
      if (aa < 0.05 && ba < 0.05) continue;
      for (let k = 0; k < 3; k++) s += Math.abs(A[i + k] * aa - B[i + k] * ba);
      s += Math.abs(A[i + 3] - B[i + 3]); n += 4;
    }
    return n ? s / n / 255 : 1;
  })()`)) as number;
  rows.push([rel, d]);
}
rows.sort((a, b) => b[1] - a[1]);
for (const [r, d] of rows) console.log(d.toFixed(3), d < MAXD ? "ok " : "BAD", r);
if (applyFlag === "--apply") {
  let n = 0;
  for (const [r, d] of rows) if (d < MAXD) { copyFileSync(join(upDir, r), join(assetDir, r)); n++; }
  console.log("applied", n);
}
await browser.close();
