import { UNIT_KEYS, armySize, type Army, type Unit } from "../game/data";
import type { Field, Ground, Order } from "../game/battle";
import { assetUrl } from "../render/worldView";
import { t as tr } from "../i18n";

interface Glyph {
  u: Unit;
  x: number;
  y: number;
  ph: number;
  dead: number;
}

interface Arrow {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t0: number;
  t1: number;
}

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t0: number;
  life: number;
  kind: "dust" | "spark" | "blood";
}

interface Callout {
  text: string;
  t0: number;
  color: string;
}

interface Float {
  text: string;
  x: number;
  y: number;
  t0: number;
  color: string;
}

const BLOCK: Record<Unit, [number, number]> = { archer: [0.04, 0.15], horse: [0.16, 0.28], spear: [0.29, 0.4] };
const ROWS = 6;
const SIDE_COLOR = ["#f0c860", "#e0563f"];
const UNIT_ICON: Record<Unit, string> = { spear: "u_spear", archer: "u_archer", horse: "u_cavalry" };
const SPR = 44;

const GROUND_TEX: Record<Ground, string> = { bozkir: "tex/steppe", cayir: "tex/grass", kum: "tex/sand", dag: "tex/rock" };
const grounds: Partial<Record<Ground, HTMLImageElement>> = {};
const icons: Partial<Record<Unit, HTMLImageElement>> = {};
function loadArt(): void {
  if (grounds.bozkir) return;
  for (const k of Object.keys(GROUND_TEX) as Ground[]) grounds[k] = Object.assign(new Image(), { src: assetUrl(GROUND_TEX[k]) });
  for (const u of UNIT_KEYS) icons[u] = Object.assign(new Image(), { src: assetUrl(UNIT_ICON[u]) });
}

export class BattleField {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private sides: Glyph[][] = [[], []];
  private per: number[] = [1, 1];
  private arrows: Arrow[] = [];
  private puffs: Puff[] = [];
  private calls: Callout[] = [];
  private floats: Float[] = [];
  private cur: Army[];
  private t0 = 0;
  private dur = 1;
  private order: Order | undefined;
  private charge = false;
  private end: { win: boolean; t0: number } | null = null;
  private raf = 0;
  private heroImg: HTMLImageElement;
  private bossImg: HTMLImageElement | null;
  private sprites = new Map<string, HTMLCanvasElement>();
  private bg: HTMLCanvasElement | null = null;

  constructor(private cv: HTMLCanvasElement, a: Army, b: Army, heroSrc: string, bossSrc: string | null, private field: Field | null = null) {
    loadArt();
    this.ctx = cv.getContext("2d")!;
    this.heroImg = Object.assign(new Image(), { src: heroSrc });
    this.bossImg = bossSrc ? Object.assign(new Image(), { src: bossSrc }) : null;
    this.cur = [{ ...a }, { ...b }];
    if (bossSrc) this.calls.push({ text: "Destan savaşı!", t0: performance.now() + 150, color: "#d9a8ff" });
    else if (armySize(a) + armySize(b) >= 80) this.calls.push({ text: "Meydan muharebesi!", t0: performance.now() + 150, color: "#ffe39a" });
    this.resize();
    [a, b].forEach((arm, s) => {
      const per = (this.per[s] = Math.max(1, Math.ceil(armySize(arm) / 36)));
      for (const u of UNIT_KEYS) {
        const n = Math.ceil(arm[u] / per);
        const cols = Math.max(1, Math.ceil(n / ROWS));
        const [x0, x1] = BLOCK[u];
        for (let j = 0; j < n; j++) {
          const col = Math.floor(j / ROWS);
          const row = j % ROWS;
          const fx = x0 + ((col + 0.5) / cols) * (x1 - x0) + (Math.random() - 0.5) * 0.012;
          this.sides[s].push({ u, x: s ? 1 - fx : fx, y: (row + 0.5) / ROWS + (Math.random() - 0.5) * 0.04, ph: Math.random() * 6, dead: 0 });
        }
      }
      // derinlik sırası: üstteki önce çizilsin
      this.sides[s].sort((p, q) => p.y - q.y);
    });
    this.t0 = performance.now() - 10000;
    const loop = () => {
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private resize(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = this.cv.clientWidth || 600;
    this.h = this.cv.clientHeight || 150;
    this.cv.width = Math.round(this.w * dpr);
    this.cv.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.bg = null;
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
  }

  finish(win: boolean): void {
    this.end = { win, t0: performance.now() };
    this.calls.push({ text: win ? "Zafer!" : "Bozgun", t0: performance.now(), color: win ? "#ffd56a" : "#ff7a5a" });
  }

  round(a: Army, b: Army, order: Order | undefined, dur: number, ev: string[] = []): void {
    const now = performance.now();
    this.t0 = now;
    this.dur = dur;
    this.order = order;
    this.charge = ev.some((e) => e.startsWith("Safları"));
    if (order === "ricat") this.calls.push({ text: ev.some((e) => e.includes("yuttu")) ? "Turan taktiği: düşman peşe düştü!" : "Sahte ricat sezildi", t0: now, color: "#ffe39a" });
    else if (this.charge) this.calls.push({ text: "Dön ve vur!", t0: now, color: "#ffd56a" });
    else if (order === "kanat") this.calls.push({ text: "Kanatlar dolanıyor!", t0: now, color: "#ffe39a" });
    else if (order === "nara") this.calls.push({ text: "Nara!", t0: now, color: "#ffe39a" });
    else if (ev.includes("Kritik!")) this.calls.push({ text: "Kritik!", t0: now, color: "#fff" });
    if (ev.includes("Düşman bozguna uğradı!")) this.calls.push({ text: "Düşman bozguna uğradı!", t0: now + 80, color: "#ffd56a" });
    if (ev.includes("Askerlerin dağıldı!")) this.calls.push({ text: "Askerlerin dağıldı!", t0: now + 80, color: "#ff7a5a" });
    this.calls = this.calls.filter((c) => now - c.t0 < 1600);
    [a, b].forEach((arm, s) => {
      for (const u of UNIT_KEYS) {
        const lost = this.cur[s][u] - arm[u];
        if (lost > 0) {
          const [x0, x1] = BLOCK[u];
          const fx = (x0 + x1) / 2;
          this.floats.push({ text: `-${lost}`, x: s ? 1 - fx : fx, y: 0.12 + Math.random() * 0.1, t0: now + dur * 0.45, color: s ? "#ffd56a" : "#ff8a6a" });
        }
      }
      this.cur[s] = { ...arm };
      for (const u of UNIT_KEYS) {
        const live = this.sides[s].filter((g) => g.u === u && !g.dead);
        const want = arm[u] > 0 ? Math.max(1, Math.ceil(arm[u] / this.per[s])) : 0;
        for (let k = live.length - 1; k >= want; k--) {
          const g = live.splice(Math.floor(Math.random() * live.length), 1)[0];
          g.dead = now + dur * (0.4 + Math.random() * 0.2);
          for (let q = 0; q < 5; q++) this.puffs.push({ x: g.x, y: g.y, vx: (Math.random() - 0.5) * 0.06, vy: -Math.random() * 0.25, t0: g.dead, life: 420, kind: q < 2 ? "blood" : "spark" });
        }
      }
    });
    this.arrows = this.arrows.filter((r) => r.t1 > now);
    for (let s = 0; s < 2; s++) {
      const shooters = this.sides[s].filter((g) => g.u === "archer" && !g.dead).slice(0, this.charge && !s ? 22 : 14);
      // ricatta okçular geri çekilirken de omuz üstünden atar (Part atışı)
      const foes = this.sides[1 - s].filter((g) => !g.dead || g.dead > now);
      for (const g of shooters) {
        const f = foes[Math.floor(Math.random() * foes.length)];
        const t0 = now + Math.random() * dur * 0.15;
        this.arrows.push({ x0: g.x, y0: g.y, x1: f ? f.x : s ? 0.2 : 0.8, y1: f ? f.y : 0.5, t0, t1: t0 + dur * 0.38 });
      }
    }
    const front = order === "ricat" ? 0.62 : 0.5;
    for (let k = 0; k < 16; k++) this.puffs.push({ x: front + (Math.random() - 0.5) * 0.14, y: 0.1 + Math.random() * 0.8, vx: (Math.random() - 0.5) * 0.08, vy: -Math.random() * 0.12, t0: now + dur * (0.3 + Math.random() * 0.2), life: 900, kind: "dust" });
    this.puffs = this.puffs.filter((p) => now - p.t0 < p.life).slice(-160);
    this.floats = this.floats.filter((f) => now - f.t0 < 1400).slice(-24);
  }

  /** Askerin bu turdaki ileri-geri kayması (alan genişliğine oranla). */
  private lunge(s: number, u: Unit, p: number): number {
    const k = Math.sin(Math.PI * Math.min(1, p));
    if (this.end) {
      const lost = this.end.win ? 1 : 0;
      const q = Math.min(1, (performance.now() - this.end.t0) / 1400);
      return s === lost ? -q * 0.5 : q * 0.04;
    }
    if (this.order === "ricat") {
      // sahte ricat: bizimkiler geri kaçar, düşman peşine düşüp safını açar
      if (s === 0) return -k * (u === "horse" ? 0.13 : 0.06);
      return k * (u === "horse" ? 0.12 : 0.09);
    }
    if (s === 0 && this.charge) return k * (u === "horse" ? 0.2 : u === "spear" ? 0.09 : 0.02);
    const reach = u === "horse" ? (s === 0 && this.order === "kanat" ? 0.16 : 0.1) : u === "spear" ? 0.06 : 0.01;
    return k * reach;
  }

  private ground(): HTMLCanvasElement {
    if (this.bg) return this.bg;
    const { w, h } = this;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    const ground = grounds[this.field?.ground ?? "bozkir"];
    if (ground?.complete && ground.naturalWidth) {
      g.fillStyle = g.createPattern(ground, "repeat")!;
      g.fillRect(0, 0, w, h);
    } else {
      g.fillStyle = "#6d5a33";
      g.fillRect(0, 0, w, h);
    }
    if (this.field?.ground === "dag") {
      g.fillStyle = "rgba(60,48,40,0.55)";
      for (let k = 0; k < 7; k++) {
        const x = ((k * 0.17 + 0.05) % 1) * w;
        g.beginPath();
        g.moveTo(x - 40, 0);
        g.lineTo(x, h * 0.16);
        g.lineTo(x + 46, 0);
        g.fill();
      }
    }
    if (this.field?.ground === "cayir") {
      for (let k = 0; k < 14; k++) {
        const x = ((k * 0.0731 + 0.02) % 1) * w;
        g.fillStyle = "rgba(30,60,20,0.6)";
        g.beginPath();
        g.ellipse(x, 6 + (k % 3) * 4, 16, 10, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    const sh = g.createLinearGradient(0, 0, 0, h);
    sh.addColorStop(0, "rgba(255,226,160,0.18)");
    sh.addColorStop(0.5, "rgba(0,0,0,0)");
    sh.addColorStop(1, "rgba(30,16,4,0.45)");
    g.fillStyle = sh;
    g.fillRect(0, 0, w, h);
    const v = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.6);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(20,10,2,0.55)");
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
    if (this.field?.night) {
      g.fillStyle = "rgba(10,18,48,0.5)";
      g.fillRect(0, 0, w, h);
    }
    if (ground?.complete) this.bg = c;
    return c;
  }

  /** Birlik ikonunu taraf rengiyle çerçeveli, gölgeli küçük bir sprite'a pişirir. */
  private sprite(u: Unit, s: number): HTMLCanvasElement | null {
    const key = u + s;
    const hit = this.sprites.get(key);
    if (hit) return hit;
    const img = icons[u];
    if (!img?.complete || !img.naturalWidth) return null;
    const c = document.createElement("canvas");
    c.width = c.height = SPR;
    const g = c.getContext("2d")!;
    g.translate(SPR / 2, SPR / 2);
    if (s) g.scale(-1, 1);
    g.shadowColor = SIDE_COLOR[s];
    g.shadowBlur = 5;
    const k = (SPR - 8) / Math.max(img.naturalWidth, img.naturalHeight);
    g.drawImage(img, (-img.naturalWidth * k) / 2, (-img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
    if (s) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.shadowBlur = 0;
      g.globalCompositeOperation = "source-atop";
      g.fillStyle = "rgba(150,24,14,0.38)";
      g.fillRect(0, 0, SPR, SPR);
    }
    this.sprites.set(key, c);
    return c;
  }

  private draw(): void {
    const { ctx, w, h } = this;
    if (this.cv.clientWidth && (Math.abs(this.cv.clientWidth - w) > 2 || Math.abs(this.cv.clientHeight - h) > 2)) this.resize();
    const now = performance.now();
    const p = (now - this.t0) / this.dur;
    ctx.drawImage(this.ground(), 0, 0, w, h);
    const size = Math.max(18, Math.min(36, h / 5.2));
    const Y = (y: number) => y * (h - size) + size * 0.6;
    for (let s = 0; s < 2; s++) this.banner(s ? w - 14 : 14, SIDE_COLOR[s], now, s);
    for (let s = 0; s < 2; s++) {
      const dir = s ? -1 : 1;
      for (const gl of this.sides[s]) {
        const dying = gl.dead && now >= gl.dead;
        const off = dying ? 0 : this.lunge(s, gl.u, p) * dir;
        const wheel = !dying && s === 0 && gl.u === "horse" && (this.order === "kanat" || this.charge) ? Math.sin(Math.PI * Math.min(1, p)) * (gl.y < 0.5 ? -0.12 : 0.12) : 0;
        const x = (gl.x + off) * w;
        const gallop = gl.u === "horse" ? Math.abs(Math.sin(now / 90 + gl.ph)) * 2.2 : Math.sin(now / 160 + gl.ph) * 0.8;
        const y = Y(gl.y + wheel) - (dying ? 0 : gallop);
        const a = dying ? Math.max(0, 1 - (now - gl.dead) / 900) : 1;
        if (a <= 0) continue;
        const sz = size * (gl.u === "horse" ? 1.15 : 1);
        ctx.globalAlpha = 0.35 * a;
        ctx.fillStyle = "#1a0e04";
        ctx.beginPath();
        ctx.ellipse(x, Y(gl.y + wheel) + sz * 0.42, sz * 0.38, sz * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a;
        const spr = this.sprite(gl.u, s);
        if (spr) {
          ctx.save();
          ctx.translate(x, y);
          if (dying) ctx.rotate(dir * Math.min(1, (now - gl.dead) / 250) * 1.3);
          ctx.drawImage(spr, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        } else this.glyph(gl.u, x, y, SIDE_COLOR[s], a);
        ctx.fillStyle = SIDE_COLOR[s];
        ctx.fillRect(x - sz * 0.22, Y(gl.y + wheel) + sz * 0.5, sz * 0.44, 2);
      }
    }
    ctx.globalAlpha = 1;
    const heroOff = this.lunge(0, "spear", p);
    this.portrait(this.heroImg, (0.45 + heroOff) * w, h / 2, size * 0.75, "#ffd56a");
    if (this.bossImg) this.portrait(this.bossImg, (0.56 - this.lunge(1, "spear", p)) * w, h / 2, size, "#c27bff");
    ctx.strokeStyle = "#f4e7c4";
    ctx.lineWidth = 1.3;
    for (const r of this.arrows) {
      const q = (now - r.t0) / (r.t1 - r.t0);
      if (q < 0 || q > 1) continue;
      const arc = h * 0.22;
      const pt = (t: number) => [(r.x0 + (r.x1 - r.x0) * t) * w, Y(r.y0 + (r.y1 - r.y0) * t) - Math.sin(Math.PI * t) * arc];
      const [x, y] = pt(q);
      const [xb, yb] = pt(Math.max(0, q - 0.07));
      ctx.beginPath();
      ctx.moveTo(xb, yb);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    for (const d of this.puffs) {
      const t = (now - d.t0) / d.life;
      if (t < 0 || t > 1) continue;
      const x = (d.x + d.vx * t) * w;
      const y = Y(d.y) + d.vy * t * h + (d.kind === "dust" ? 0 : t * t * 18);
      if (d.kind === "dust") {
        ctx.fillStyle = `rgba(214,190,140,${0.32 * (1 - t)})`;
        ctx.beginPath();
        ctx.arc(x, y, 4 + t * 12, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = d.kind === "blood" ? `rgba(150,20,10,${1 - t})` : `rgba(255,220,140,${1 - t})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.round(Math.max(11, Math.min(14, h / 16)))}px Georgia, serif`;
    if (!this.end)
      for (let s = 0; s < 2; s++)
        for (const u of UNIT_KEYS) {
          const n = this.cur[s][u];
          if (!n) continue;
          const [x0, x1] = BLOCK[u];
          const fx = (x0 + x1) / 2;
          const x = (s ? 1 - fx : fx) * w;
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#1a0e04";
          ctx.strokeText(`${n}`, x, 15);
          ctx.fillStyle = SIDE_COLOR[s];
          ctx.fillText(`${n}`, x, 15);
        }
    for (const f of this.floats) {
      const t = (now - f.t0) / 1400;
      if (t < 0 || t > 1) continue;
      ctx.globalAlpha = 1 - t * t;
      ctx.font = `bold ${Math.round(Math.min(20, h / 10))}px Georgia, serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#1a0e04";
      const y = f.y * h - t * 26;
      ctx.strokeText(f.text, f.x * w, y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x * w, y);
    }
    ctx.globalAlpha = 1;
    let line = 0;
    for (const c of this.calls) {
      const t = (now - c.t0) / 1500;
      if (t < 0 || t > 1) continue;
      const row = line++;
      ctx.save();
      ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - Math.max(0, (t - 0.6) / 0.4);
      ctx.font = `bold ${Math.round(Math.min(22, h / 7))}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2a1606";
      const y = h * 0.2 + row * Math.min(26, h / 6) - t * 10;
      ctx.strokeText(tr(c.text), w / 2, y);
      ctx.fillStyle = c.color;
      ctx.fillText(tr(c.text), w / 2, y);
      ctx.restore();
    }
  }

  private banner(x: number, color: string, now: number, s: number): void {
    const { ctx, h } = this;
    ctx.strokeStyle = "#3a2410";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, h - 6);
    ctx.lineTo(x, 8);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    const d = s ? -1 : 1;
    ctx.moveTo(x, 9);
    for (let k = 0; k <= 6; k++) ctx.lineTo(x + d * k * 3.4, 9 + Math.sin(now / 200 + k) * 2);
    for (let k = 6; k >= 0; k--) ctx.lineTo(x + d * k * 3.4, 23 + Math.sin(now / 200 + k + 0.6) * 2);
    ctx.closePath();
    ctx.fill();
  }

  private portrait(img: HTMLImageElement, x: number, y: number, r: number, ring: string): void {
    const { ctx } = this;
    ctx.save();
    ctx.shadowColor = ring;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#1c120a";
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (img.complete && img.naturalWidth) {
      ctx.clip();
      ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
    ctx.strokeStyle = ring;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  private glyph(u: Unit, x: number, y: number, color: string, alpha: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(1.45, 1.45);
    ctx.fillStyle = color;
    ctx.beginPath();
    if (u === "horse") ctx.ellipse(0, 3, 7, 3.5, 0, 0, Math.PI * 2);
    else ctx.arc(0, -3, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
