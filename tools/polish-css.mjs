import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../next/src/style.css", import.meta.url);
const GUARD = "/* Oyuncu gözü cilası */";
const css = readFileSync(file, "utf8");
if (css.includes(GUARD)) {
  console.log("polish-css: zaten ekli");
  process.exit(0);
}

const add = `
${GUARD}
.tab { position: relative; }
.tab.new::after { content: ""; position: absolute; top: 3px; right: 4px; width: 8px; height: 8px; border-radius: 50%; background: #ffd56a; box-shadow: 0 0 6px #ffd56a; animation: tabnew 1.4s ease-in-out infinite; }
@keyframes tabnew { 50% { transform: scale(.6); opacity: .55; } }
.intel .tell { display: block; font-style: italic; color: #ffe2a8; margin: 3px 0 2px; }
.qmore { display: none; }
.bbox ul { display: inline-block; text-align: left; margin: 6px 0 8px; padding-left: 20px; }
.quest.fold { display: none; }
.bottom .ufukbtn b.bi { display: flex; align-items: center; justify-content: center; font-size: 30px; color: #ffd56a; text-shadow: 0 0 8px #ffb24a88; }
.bottom .ufukbtn.hidden { display: none; }
.bottom .ufukbtn.hot { border-color: #ff7a5a; }
.bottom .ufukbtn.hot b.bi { color: #ff9a7a; animation: tabnew 1.1s ease-in-out infinite; }
.ufk { display: flex; gap: 10px; align-items: center; padding: 8px 10px; margin-bottom: 6px; border-radius: 10px; background: #0004; border: 1px solid #5a3a1a; border-left-width: 4px; }
.ufk .bi2 { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ufk small { font-size: 10px; letter-spacing: .6px; text-transform: uppercase; opacity: .8; }
.ufk span { font-size: 12.5px; opacity: .88; line-height: 1.3; }
.ufk.acil { border-left-color: #ff6a4a; background: #3a120a55; }
.ufk.acil small { color: #ff9a7a; }
.ufk.firsat { border-left-color: #ffd56a; background: #3a2a0a44; }
.ufk.firsat small { color: #ffd56a; }
.ufk.hikaye { border-left-color: #c27bff; background: #2a124044; }
.ufk.hikaye small { color: #d6a8ff; }
@media (max-width: 760px) {
  .qmore { display: block; align-self: flex-start; padding: 3px 10px; border-radius: 12px; font: 700 12px "Segoe UI", sans-serif; color: #ffe7a8; background: #2e1d0fe8; border: 1px solid #8a5d2a; cursor: pointer; }
  .qmore.hidden { display: none; }
  .quest.slim { padding: 6px 8px; gap: 6px; }
  .quest.slim span, .quest.slim em { display: none; }
  .quest.slim b { font-size: 13px; }
  .bottom .ufukbtn { width: 58px; }
  .bottom .ufukbtn b.bi { font-size: 24px; }
}
`;
writeFileSync(file, css + add, "utf8");
console.log("polish-css: eklendi");
