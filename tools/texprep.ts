import { chromium } from "playwright-core";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * 1) Dağ sprite'larının alttaki toprak diskini yumuşakça saydamlaştırır (araziye kaynaşsın).
 * 2) 2x2 doku sayfasını 4 adet dikişsiz döşenebilir 512px dokuya çevirir.
 * usage: tsx tools/texprep.ts <mtnDir> <terrainSheet.jpg> <texOutDir>
 */
const [, , mtnDir, sheet, texOut] = process.argv;
const url = (f: string) => `data:image/${f.endsWith(".webp") ? "webp" : "jpeg"};base64,${readFileSync(f).toString("base64")}`;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.evaluate("window.__name = (f) => f");

for (const f of readdirSync(mtnDir).filter((n) => n.endsWith(".webp"))) {
  const out = (await page.evaluate(`(async () => {
    const i = new Image(); i.src = ${JSON.stringify(url(join(mtnDir, f)))}; await i.decode();
    const c = document.createElement("canvas"); c.width = i.width; c.height = i.height;
    const g = c.getContext("2d"); g.drawImage(i, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height); const p = d.data;
    const W = c.width, H = c.height;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const fy = y / H, fx = Math.abs(x / W - 0.5) * 2;
      // alt %30'luk bant ve kenarlar yumuşasın; ortadaki dağ gövdesi kalsın
      let a = 1;
      if (fy > 0.7) a *= 1 - Math.min(1, (fy - 0.7) / 0.3) ** 1.4 * 0.95;
      if (fy > 0.55 && fx > 0.6) a *= 1 - Math.min(1, ((fx - 0.6) / 0.4) * ((fy - 0.55) / 0.45) * 2.2);
      const o = (y * W + x) * 4; p[o + 3] = Math.round(p[o + 3] * Math.max(0, a));
    }
    g.putImageData(d, 0, 0);
    return c.toDataURL("image/webp", 0.9);
  })()`)) as string;
  writeFileSync(join(mtnDir, f), Buffer.from(out.split(",")[1], "base64"));
}

mkdirSync(texOut, { recursive: true });
const names = ["sand", "steppe", "grass", "rock"];
const tiles = (await page.evaluate(`(async () => {
  const i = new Image(); i.src = ${JSON.stringify(url(sheet))}; await i.decode();
  const half = i.width / 2, inset = 12, S = 512, out = [];
  for (let q = 0; q < 4; q++) {
    const sx = (q % 2) * half + inset, sy = Math.floor(q / 2) * half + inset, sw = half - inset * 2;
    const a = document.createElement("canvas"); a.width = a.height = S;
    const ag = a.getContext("2d"); ag.imageSmoothingQuality = "high"; ag.drawImage(i, sx, sy, sw, sw, 0, 0, S, S);
    // yarım kaydırılmış kopya: kenarları ortadan gelir, dikişi ortada kalır
    const b = document.createElement("canvas"); b.width = b.height = S;
    const bg = b.getContext("2d");
    for (const [dx, dy] of [[0, 0], [-S, 0], [0, -S], [-S, -S]]) bg.drawImage(a, S / 2 + dx, S / 2 + dy);
    const A = ag.getImageData(0, 0, S, S).data, B = bg.getImageData(0, 0, S, S).data;
    const o = ag.createImageData(S, S); const P = o.data;
    let r = 0, gg = 0, bb = 0;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const ex = Math.min(x, S - 1 - x) / (S / 2), ey = Math.min(y, S - 1 - y) / (S / 2);
      const w = Math.min(1, Math.min(ex, ey) * 2.2);
      const k = (y * S + x) * 4;
      for (let c = 0; c < 3; c++) P[k + c] = A[k + c] * w + B[k + c] * (1 - w);
      P[k + 3] = 255; r += P[k]; gg += P[k + 1]; bb += P[k + 2];
    }
    ag.putImageData(o, 0, 0);
    const n = S * S;
    out.push({ data: a.toDataURL("image/webp", 0.88), mean: [r / n / 255, gg / n / 255, bb / n / 255] });
  }
  return out;
})()`)) as { data: string; mean: number[] }[];
tiles.forEach((t, k) => {
  writeFileSync(join(texOut, `${names[k]}.webp`), Buffer.from(t.data.split(",")[1], "base64"));
  console.log(names[k], t.mean.map((v) => v.toFixed(3)).join(","));
});
await browser.close();
