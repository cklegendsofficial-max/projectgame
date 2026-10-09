import { appendFileSync, readFileSync } from "node:fs";

const file = new URL("../next/src/style.css", import.meta.url);
if (readFileSync(file, "utf8").includes("Yolculuk ara sahnesi")) process.exit(0);
appendFileSync(
  file,
  `
/* Yolculuk ara sahnesi ve şehre giriş */
.journey, .cityscene { position: absolute; inset: 0; z-index: 21; background: #000; animation: spfade .7s ease; transition: opacity .6s; overflow: hidden; }
.journey.out, .cityscene.out { opacity: 0; pointer-events: none; }
.journey canvas, .cityscene canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.jtop { position: absolute; top: max(14px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%); display: flex; align-items: baseline; gap: 12px; padding: 8px 22px; background: linear-gradient(#1a0f06e0, #0d0804d0); border: 1px solid #c9a24a; border-radius: 30px; color: #ffe2a0; font: bold 20px Georgia, serif; white-space: nowrap; box-shadow: 0 6px 24px #0008, inset 0 0 0 2px #0006; }
.jtop .jarrow { color: #c9a24a; }
.jtop .jclock { font: 13px Georgia, serif; color: #d8c08a; margin-left: 6px; }
.jlog { position: absolute; left: 50%; transform: translateX(-50%); bottom: 118px; width: min(640px, 90vw); text-align: center; pointer-events: none; }
.jlog p { margin: 4px 0; color: #fff1d0; font: italic 17px Georgia, serif; text-shadow: 0 2px 6px #000, 0 0 2px #000; animation: jline .9s ease; }
.jlog p:not(:last-child) { opacity: .45; font-size: 14px; }
@keyframes jline { from { opacity: 0; transform: translateY(10px); } }
.jbot { position: absolute; left: 50%; transform: translateX(-50%); bottom: max(18px, env(safe-area-inset-bottom)); width: min(560px, 90vw); display: flex; flex-direction: column; gap: 10px; align-items: center; }
.jbar { position: relative; width: 100%; height: 8px; border-radius: 6px; background: #0009; border: 1px solid #c9a24a88; }
.jfill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, #8a5a1a, #ffd36a); }
.jcv { position: absolute; top: 50%; width: 16px; height: 16px; border-radius: 50%; transform: translate(-50%, -50%); background: radial-gradient(#fff6d0, #e0a030); box-shadow: 0 0 10px #ffd36a; }
.jbtns { display: flex; gap: 10px; }
.cityscene { cursor: pointer; }
.cstitle { position: absolute; top: 7%; left: 50%; transform: translateX(-50%); text-align: center; color: #ffe2a0; pointer-events: none; animation: csin 1.4s cubic-bezier(.2, .9, .3, 1); }
.cstitle small { display: block; font: 13px Georgia, serif; letter-spacing: 3px; text-transform: uppercase; color: #e8cf98; text-shadow: 0 1px 4px #000; }
.cstitle h1 { margin: 4px 0; font: bold clamp(34px, 7vw, 68px) Georgia, serif; letter-spacing: 2px; color: #ffd56a; text-shadow: 0 3px 0 #5a3410, 0 0 30px #000c, 0 0 2px #000; }
.cstitle em { display: block; font: italic 18px Georgia, serif; color: #fff1d0; text-shadow: 0 2px 6px #000; }
.cstitle h1::after { content: ""; display: block; height: 10px; margin: 6px auto 0; width: min(70%, 280px); background: radial-gradient(circle, #ffd36a 0 3px, transparent 4px) center/14px 10px repeat-x; opacity: .8; }
.cityscene.sacked .cstitle h1 { color: #ff9a6a; }
.csinfo { position: absolute; left: 50%; bottom: calc(max(16px, env(safe-area-inset-bottom)) + 26px); transform: translateX(-50%); display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; width: min(720px, 92vw); pointer-events: none; animation: csin 1.8s ease; }
.csinfo span { padding: 5px 12px; border-radius: 16px; background: #120a04d0; border: 1px solid #c9a24a99; color: #f4e7c4; font-size: 13px; }
.cshint { position: absolute; bottom: max(10px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); color: #e8d8b0aa; font: italic 13px Georgia, serif; animation: cshint 2s ease-in-out infinite; }
@keyframes csin { from { opacity: 0; transform: translate(-50%, 16px); } }
@keyframes cshint { 50% { opacity: .35; } }
@media (max-width: 640px) { .jtop { font-size: 15px; padding: 6px 14px; } .jlog { bottom: 104px; } .jlog p { font-size: 15px; } .cstitle { width: 94vw; } .cstitle small { letter-spacing: 1.5px; font-size: 11px; } }
`,
  "utf8",
);
