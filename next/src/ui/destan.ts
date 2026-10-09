import { audio } from "../audio";
import { shareImage } from "./photo";

export interface DestanData {
  name: string;
  title: string;
  portrait: string;
  lv: number;
  day: number;
  kills: number;
  renown: number;
  verses: { d: number; t: string }[];
}

const W = 1080;
const H = 1620;
const GOLD = ["#8a5a14", "#f6e08a", "#c99a2e", "#fff2b0", "#9a6a1a"];
const LAPIS = "#1d3a78";
const RUBRIC = "#a3241a";
const INK = "#2a1a0c";

const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim();

function gold(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): CanvasGradient {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  GOLD.forEach((c, i) => gr.addColorStop(i / (GOLD.length - 1), c));
  return gr;
}

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
}

/** Dizeleri oyunun başından sonuna yayarak seçer. */
function pickVerses(v: { d: number; t: string }[], n: number): { d: number; t: string }[] {
  if (v.length <= n) return v;
  const out: { d: number; t: string }[] = [];
  for (let i = 0; i < n; i++) out.push(v[Math.round((i / (n - 1)) * (v.length - 1))]);
  return out;
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (g.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function rosette(g: CanvasRenderingContext2D, x: number, y: number, r: number, petals = 8): void {
  g.save();
  g.translate(x, y);
  for (let k = 0; k < petals; k++) {
    g.rotate((Math.PI * 2) / petals);
    g.fillStyle = k % 2 ? LAPIS : RUBRIC;
    g.beginPath();
    g.ellipse(0, -r * 0.55, r * 0.22, r * 0.45, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = gold(g, -r, -r, r, r);
    g.lineWidth = 2;
    g.stroke();
  }
  g.fillStyle = gold(g, -r, -r, r, r);
  g.beginPath();
  g.arc(0, 0, r * 0.28, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** Lale-rumi kıvrımı: kenar bandında tekrar eden küçük altın motif. */
function tulip(g: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number): void {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.fillStyle = GOLD[2];
  g.beginPath();
  g.moveTo(0, -s);
  g.quadraticCurveTo(s * 0.7, -s * 0.4, s * 0.35, s * 0.5);
  g.lineTo(0, s * 0.2);
  g.lineTo(-s * 0.35, s * 0.5);
  g.quadraticCurveTo(-s * 0.7, -s * 0.4, 0, -s);
  g.fill();
  g.fillStyle = "#e8eef8";
  g.beginPath();
  g.arc(0, -s * 0.15, s * 0.12, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function parchment(g: CanvasRenderingContext2D): void {
  g.fillStyle = "#ecd9ae";
  g.fillRect(0, 0, W, H);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4200; i++) {
    g.fillStyle = `rgba(${120 + rnd() * 60},${80 + rnd() * 40},${30 + rnd() * 20},${rnd() * 0.08})`;
    g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 3, 1 + rnd() * 3);
  }
  for (let i = 0; i < 6; i++) {
    const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 160;
    const st = g.createRadialGradient(x, y, 0, x, y, r);
    st.addColorStop(0, "rgba(150,100,40,0.07)");
    st.addColorStop(1, "rgba(150,100,40,0)");
    g.fillStyle = st;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const v = g.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.95);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(90,50,10,0.45)");
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
}

function frame(g: CanvasRenderingContext2D): void {
  const m = 34;
  const band = 46;
  g.strokeStyle = gold(g, 0, 0, W, H);
  g.lineWidth = 6;
  g.strokeRect(m, m, W - m * 2, H - m * 2);
  g.fillStyle = LAPIS;
  g.fillRect(m + 8, m + 8, W - (m + 8) * 2, band);
  g.fillRect(m + 8, H - m - 8 - band, W - (m + 8) * 2, band);
  g.fillRect(m + 8, m + 8, band, H - (m + 8) * 2);
  g.fillRect(W - m - 8 - band, m + 8, band, H - (m + 8) * 2);
  const inner = m + 8 + band;
  g.lineWidth = 3;
  g.strokeRect(inner, inner, W - inner * 2, H - inner * 2);
  g.lineWidth = 1.5;
  g.strokeRect(inner + 8, inner + 8, W - (inner + 8) * 2, H - (inner + 8) * 2);
  const c = m + 8 + band / 2;
  for (let x = c + 60; x < W - c - 40; x += 44) {
    tulip(g, x, c, 13, Math.PI);
    tulip(g, x, H - c, 13, 0);
  }
  for (let y = c + 60; y < H - c - 40; y += 44) {
    tulip(g, c, y, 13, Math.PI / 2);
    tulip(g, W - c, y, 13, -Math.PI / 2);
  }
  for (const [x, y] of [[c, c], [W - c, c], [c, H - c], [W - c, H - c]]) rosette(g, x, y, 34, 8);
}

/** Minyatür vinyet: altın gök, katmanlı tepeler, at üstünde yiğit, kervan. */
function vignette(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  g.save();
  g.beginPath();
  g.moveTo(x, y + h);
  g.lineTo(x, y + h * 0.35);
  g.quadraticCurveTo(x + w / 2, y - h * 0.25, x + w, y + h * 0.35);
  g.lineTo(x + w, y + h);
  g.closePath();
  g.fillStyle = gold(g, x, y, x + w, y + h);
  g.fill();
  g.clip();
  const hills = ["#9fb46a", "#7d9a4e", "#c8a05a", "#a8803e"];
  hills.forEach((c, k) => {
    g.fillStyle = c;
    g.beginPath();
    g.moveTo(x, y + h);
    for (let i = 0; i <= 12; i++) {
      const px = x + (i / 12) * w;
      const py = y + h * (0.45 + k * 0.12) + Math.sin(i * 1.3 + k * 2) * 18 - (k === 0 ? Math.max(0, 60 - Math.abs(i - 4) * 20) : 0);
      g.quadraticCurveTo(px - w / 24, py - 14, px, py);
    }
    g.lineTo(x + w, y + h);
    g.fill();
    g.strokeStyle = "rgba(60,40,10,0.35)";
    g.lineWidth = 1.5;
    g.stroke();
  });
  g.fillStyle = "#fff6d0";
  g.beginPath();
  g.arc(x + w * 0.78, y + h * 0.3, 24, 0, Math.PI * 2);
  g.fill();
  const rider = (rx: number, ry: number, s: number, coat: string) => {
    g.save();
    g.translate(rx, ry);
    g.scale(s, s);
    g.fillStyle = coat;
    g.beginPath();
    g.ellipse(0, 0, 26, 11, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(20, -4);
    g.lineTo(34, -22);
    g.lineTo(40, -18);
    g.lineTo(28, 2);
    g.fill();
    g.strokeStyle = coat;
    g.lineWidth = 4;
    for (const lx of [-16, -8, 10, 18]) {
      g.beginPath();
      g.moveTo(lx, 6);
      g.lineTo(lx + (lx > 0 ? 6 : -4), 26);
      g.stroke();
    }
    g.fillStyle = RUBRIC;
    g.fillRect(-6, -30, 12, 22);
    g.fillStyle = "#f1d6a8";
    g.beginPath();
    g.arc(0, -36, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = LAPIS;
    g.beginPath();
    g.moveTo(-7, -38);
    g.lineTo(0, -50);
    g.lineTo(7, -38);
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(4, -28);
    g.lineTo(26, -60);
    g.stroke();
    g.restore();
  };
  rider(x + w * 0.32, y + h * 0.72, 1.4, "#f4efe4");
  for (let i = 0; i < 4; i++) {
    const cx = x + w * (0.58 + i * 0.08);
    const cy = y + h * 0.66;
    g.fillStyle = "#b07a3a";
    g.beginPath();
    g.ellipse(cx, cy, 16, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(cx - 2, cy - 7, 7, 6, 0, 0, Math.PI * 2);
    g.fill();
    g.fillRect(cx + 10, cy - 18, 4, 14);
  }
  g.restore();
  g.strokeStyle = gold(g, x, y, x + w, y + h);
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(x, y + h);
  g.lineTo(x, y + h * 0.35);
  g.quadraticCurveTo(x + w / 2, y - h * 0.25, x + w, y + h * 0.35);
  g.lineTo(x + w, y + h);
  g.closePath();
  g.stroke();
}

export async function renderDestan(d: DestanData): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  parchment(g);
  frame(g);
  const L = 150;
  const R = W - 150;
  g.fillStyle = LAPIS;
  g.beginPath();
  g.roundRect(L + 40, 150, R - L - 80, 96, 48);
  g.fill();
  g.strokeStyle = gold(g, L, 150, R, 246);
  g.lineWidth = 4;
  g.stroke();
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 54px Georgia, 'Times New Roman', serif";
  g.fillStyle = gold(g, 0, 160, 0, 240);
  g.fillText(`${d.name} Destanı`.toLocaleUpperCase("tr"), W / 2, 199);
  g.font = "italic 30px Georgia, serif";
  g.fillStyle = RUBRIC;
  g.fillText(d.title, W / 2, 282);
  const img = await loadImg(d.portrait);
  const mx = L + 110;
  const my = 420;
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    g.fillStyle = k % 2 ? LAPIS : RUBRIC;
    g.beginPath();
    g.arc(mx + Math.cos(a) * 104, my + Math.sin(a) * 104, 14, 0, Math.PI * 2);
    g.fill();
  }
  g.save();
  g.beginPath();
  g.arc(mx, my, 92, 0, Math.PI * 2);
  g.fillStyle = "#2a1a0c";
  g.fill();
  g.clip();
  if (img) g.drawImage(img, mx - 92, my - 92, 184, 184);
  g.restore();
  g.strokeStyle = gold(g, mx - 100, my - 100, mx + 100, my + 100);
  g.lineWidth = 7;
  g.beginPath();
  g.arc(mx, my, 92, 0, Math.PI * 2);
  g.stroke();
  g.textAlign = "left";
  g.font = "28px Georgia, serif";
  g.fillStyle = INK;
  const stats = [`Seviye ${d.lv}`, `${d.day} gün süren bir yol`, `${d.kills} düşman yere serildi`, `${d.renown} şöhret`];
  stats.forEach((s, i) => {
    g.fillStyle = i === 0 ? RUBRIC : INK;
    g.fillText(s, mx + 140, my - 66 + i * 44);
  });
  let y = 580;
  g.strokeStyle = gold(g, L, y, R, y);
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(L, y);
  g.lineTo(R, y);
  g.stroke();
  rosette(g, W / 2, y, 16, 8);
  y += 46;
  const verses = pickVerses(d.verses, 9);
  const maxY = H - 470;
  g.textBaseline = "alphabetic";
  for (let i = 0; i < verses.length && y + 70 < maxY; i++) {
    const v = verses[i];
    g.font = "bold 22px Georgia, serif";
    g.fillStyle = RUBRIC;
    g.fillText(`❧ Gün ${v.d}`, L, y);
    y += 32;
    g.font = "26px Georgia, serif";
    g.fillStyle = INK;
    let text = strip(v.t);
    if (i === 0 && text) {
      g.font = "bold 64px Georgia, serif";
      g.fillStyle = RUBRIC;
      g.fillText(text[0], L, y + 30);
      const dw = g.measureText(text[0]).width + 10;
      g.font = "26px Georgia, serif";
      g.fillStyle = INK;
      text = text.slice(1);
      const lines = wrap(g, text, R - L - dw);
      lines.forEach((ln, k) => g.fillText(ln, L + (k < 2 ? dw : 0), y + k * 34));
      y += Math.max(2, lines.length) * 34 + 18;
      continue;
    }
    const lines = wrap(g, text, R - L);
    for (const ln of lines) {
      if (y > maxY) break;
      g.fillText(ln, L, y);
      y += 34;
    }
    y += 18;
  }
  vignette(g, L + 60, H - 430, R - L - 120, 270);
  g.textAlign = "center";
  g.font = "italic 24px Georgia, serif";
  g.fillStyle = "#6a4a20";
  g.fillText("Kervan Krallık · ozanın kaleminden", W / 2, H - 128);
  return c;
}

export async function openDestan(root: HTMLElement, d: DestanData): Promise<void> {
  const el = document.createElement("div");
  el.className = "battle destan";
  el.innerHTML = `<div class="dsbox"><div class="dspage"><div class="dsload">Ozan yazıyor…</div></div><div class="row"><button class="btn go dsshare">Paylaş / Kaydet</button><button class="btn dsclose">Kapat</button></div></div>`;
  root.appendChild(el);
  audio.play("story");
  const close = () => el.remove();
  el.querySelector(".dsclose")!.addEventListener("click", close);
  el.addEventListener("click", (e) => e.target === el && close());
  const cv = await renderDestan(d);
  const page = el.querySelector(".dspage")!;
  page.innerHTML = "";
  page.appendChild(cv);
  el.querySelector(".dsshare")!.addEventListener("click", async () => {
    audio.play("click");
    const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, "image/png"));
    if (blob) await shareImage(blob, `destan-${d.name.toLowerCase()}`);
  });
}
