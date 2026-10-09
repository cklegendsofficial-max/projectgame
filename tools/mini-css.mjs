// Minyatür UI köşebentlerini (4 yön) data-URI SVG olarak üretip style.css'e ekler.
import fs from "node:fs";

const S = 46;
const art = `<g fill='none' stroke='#e2bd62' stroke-width='1.6' stroke-linecap='round'><path d='M3 34V3h31'/><path d='M8 26V8h18'/><path d='M14 8q8 0 10 6M8 14q0 8 6 10'/></g><g fill='#e2bd62'><path d='M8 8q11-3 16 6q-9-1-16-6z'/><path d='M8 8q-3 11 6 16q-1-9-6-16z'/><circle cx='34' cy='3' r='1.8'/><circle cx='3' cy='34' r='1.8'/></g><circle cx='8' cy='8' r='4.2' fill='#1d3a78' stroke='#f4dc8a' stroke-width='1.4'/><circle cx='8' cy='8' r='1.5' fill='#c8332a'/>`;
const tf = { tl: "", tr: `translate(${S},0) scale(-1,1)`, bl: `translate(0,${S}) scale(1,-1)`, br: `translate(${S},${S}) scale(-1,-1)` };
const uri = (t) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${S}' height='${S}'><g transform='${t}'>${art}</g></svg>`)}")`;
const corners = `${uri(tf.tl)} top left / ${S}px no-repeat, ${uri(tf.tr)} top right / ${S}px no-repeat, ${uri(tf.bl)} bottom left / ${S}px no-repeat, ${uri(tf.br)} bottom right / ${S}px no-repeat`;
const band = uri(""); // kullanılmıyor; köşeler yeterli
void band;

const css = `

/* Minyatür sanat yönü: altın varak köşebentler, tezhip çizgileri */
:root { --leaf: #e2bd62; --lapis: #1d3a78; --rubric: #c8332a; }
.bbox { position: relative; }
.bbox::after, .panel::after { content: ""; position: absolute; inset: 3px; pointer-events: none; border-radius: inherit; background: ${corners}; z-index: 3; }
.bbox { box-shadow: 0 10px 40px #000c, inset 0 0 0 4px #1d120a, inset 0 0 0 5px #e2bd6266, inset 0 0 0 9px #1d3a7833; }
.panel { box-shadow: 0 10px 40px #0009, inset 0 0 0 3px #1d120a, inset 0 0 0 4px #e2bd6255; }
.ph { position: relative; background: linear-gradient(#5a3a1a, #3b2614); }
.ph::after { content: ""; position: absolute; left: 10px; right: 10px; bottom: 3px; height: 5px; background: radial-gradient(circle, var(--leaf) 1.2px, transparent 1.6px) 0 0 / 9px 5px repeat-x, linear-gradient(90deg, transparent, #e2bd6299 12%, #e2bd6299 88%, transparent) 0 100% / 100% 1px no-repeat; opacity: .8; pointer-events: none; }
.bbox h2 { letter-spacing: .4px; text-shadow: 0 1px 0 #000, 0 0 14px #e2bd6244; }
.bbox h2::before, .bbox h2::after { content: ""; flex: 0 1 46px; height: 7px; background: radial-gradient(circle, var(--leaf) 1.3px, transparent 1.7px) center / 8px 7px repeat-x; opacity: .75; }
.panel h3 { position: relative; padding-bottom: 4px; }
.panel h3::after { content: ""; position: absolute; left: 0; right: 30%; bottom: 0; height: 1px; background: linear-gradient(90deg, var(--leaf), transparent); opacity: .55; }
.bbox.story .simg { border: 3px solid #e2bd62; box-shadow: 0 0 0 3px #1d3a78, 0 0 0 4px #e2bd6299, 0 6px 22px #000a; }
.btn.go, .btn.red { box-shadow: 0 2px 0 #0006, inset 0 0 0 1px #fff4, inset 0 -2px 0 #0002; }
`;
fs.appendFileSync(new URL("../next/src/style.css", import.meta.url), css);
console.log("ok", css.length);
