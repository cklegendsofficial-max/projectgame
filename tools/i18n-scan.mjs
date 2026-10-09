import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../next/src/", import.meta.url));
const dict = readFileSync(join(root, "i18n.ts"), "utf8");
const keys = new Set();
for (const m of dict.matchAll(/^\s+(?:"((?:[^"\\]|\\.)*)"|([^\s:"]+)):\s"/gm)) keys.add(m[1] ?? m[2]);

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".ts") && !p.endsWith("i18n.ts")) files.push(p);
  }
};
walk(root);

const tr = /[çğıöşüÇĞİÖŞÜ]/;
let total = 0;
let done = 0;
const per = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  let n = 0;
  let k = 0;
  for (const m of src.matchAll(/"((?:[^"\\]|\\.){3,})"/g)) {
    if (!tr.test(m[1])) continue;
    n++;
    if (keys.has(m[1])) k++;
  }
  total += n;
  done += k;
  if (n) per.push([f.slice(root.length), n, k]);
}
const missing = [];
for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (!/from "\.{1,2}\/(?:\.\.\/)*i18n"/.test(src)) continue;
  for (const m of src.matchAll(/\bt\("((?:[^"\\]|\\.)*)"/g)) if (!keys.has(m[1])) missing.push(`${f.slice(root.length)}: ${m[1]}`);
}
if (missing.length) console.log(`Sözlükte olmayan t() çağrıları:\n  ${missing.join("\n  ")}\n`);
per.sort((a, b) => b[1] - a[1]);
for (const [f, n, k] of per.slice(0, 15)) console.log(`${f.padEnd(28)} ${String(k).padStart(4)}/${n}`);
console.log(`\n${keys.size} EN anahtar · Türkçe metin ${done}/${total} çevrili (%${Math.round((done / Math.max(1, total)) * 100)}, kaba tahmin; şablon metinler sayılmaz)`);
