import { readFileSync } from "node:fs";
let bad = 0;
for (const f of process.argv.slice(2)) {
  const s = readFileSync(f, "utf8");
  const bom = s.charCodeAt(0) === 0xfeff;
  const moj = /Ã[\u0080-\u00ff]|Ä[±°Ÿž]|Å[Ÿž]|â€/.test(s);
  const fffd = s.includes("\ufffd");
  if (bom || moj || fffd) bad++;
  console.log(f, { bom, moj, fffd });
}
process.exit(bad ? 1 : 0);
