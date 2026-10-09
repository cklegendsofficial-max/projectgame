import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

/** usage: tsx tools/cmp-crop.ts <orig> <hires> <out.png> <fx> <fy> <fw> <fh>  (fractions of the image) */
const [, , orig, hi, out, fx, fy, fw, fh] = process.argv;
const url = (f: string) => `data:image/${f.endsWith(".png") ? "png" : "jpeg"};base64,${readFileSync(f).toString("base64")}`;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.evaluate("window.__name = (f) => f");
const data = (await page.evaluate(
  async ({ a, b, r }) => {
    const load = async (u: string) => {
      const i = new Image();
      i.src = u;
      await i.decode();
      return i;
    };
    const [A, B] = [await load(a), await load(b)];
    const W = 640;
    const crop = (img: HTMLImageElement) => [img.width * r[0], img.height * r[1], img.width * r[2], img.height * r[3]] as const;
    const H = Math.round((W * (A.height * r[3])) / (A.width * r[2]));
    const c = document.createElement("canvas");
    c.width = W * 2 + 8;
    c.height = H;
    const g = c.getContext("2d")!;
    g.fillStyle = "#222";
    g.fillRect(0, 0, c.width, c.height);
    g.imageSmoothingQuality = "high";
    g.drawImage(A, ...crop(A), 0, 0, W, H);
    g.drawImage(B, ...crop(B), W + 8, 0, W, H);
    return c.toDataURL("image/png");
  },
  { a: url(orig), b: url(hi), r: [+fx, +fy, +fw, +fh] },
)) as string;
writeFileSync(out, Buffer.from(data.split(",")[1], "base64"));
await browser.close();
