import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Tek görsellik yüksek çözünürlüklü kaynakları (portre, ikon) tam kare olarak küçültüp WebP yazar.
 * usage: tsx tools/portraits.ts <outDir> <size> <src.png>=<name> ...
 */
const [, , outDir, sizeArg, ...pairs] = process.argv;
const S = +sizeArg;
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.evaluate("window.__name = (f) => f");
for (const p of pairs) {
  const [src, name] = p.split("=");
  const url = `data:image/png;base64,${readFileSync(src).toString("base64")}`;
  const out = (await page.evaluate(`(async () => {
    const i = new Image(); i.src = ${JSON.stringify(url)}; await i.decode();
    const c = document.createElement("canvas"); c.width = c.height = ${S};
    const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(i, 0, 0, ${S}, ${S});
    return c.toDataURL("image/webp", 0.9);
  })()`)) as string;
  writeFileSync(join(outDir, name + ".webp"), Buffer.from(out.split(",")[1], "base64"));
  console.log(name);
}
await browser.close();
