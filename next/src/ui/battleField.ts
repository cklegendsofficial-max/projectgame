import { UNIT_KEYS, armySize, type Army, type Unit } from "../game/data";
import type { Field, Ground, Order, Sky } from "../game/battle";
import { assetUrl } from "../render/worldView";
import { t as tr } from "../i18n";

interface Glyph {
  u: Unit;
  x: number;
  y: number;
  ph: number;
  dead: number;
  born?: number;
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
  kind: "dust" | "spark" | "blood" | "gold" | "clash";
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
const SPR = 56;
const HORIZON = 0.14;

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
  private lag = 0;
  private frozen = 0;
  private lastReal = performance.now();
  private shake = { t0: 0, amp: 0 };

  /** Vuruş duraklamasında duran sahne saati. */
  private clock(): number {
    const real = performance.now();
    if (real < this.frozen) this.lag += real - this.lastReal;
    else if (this.lastReal < this.frozen) this.lag += this.frozen - this.lastReal;
    this.lastReal = real;
    return real - this.lag;
  }

  announce(text: string, color: string, delay = 0): void {
    this.calls.push({ text, t0: this.clock() + delay, color });
  }

  hitStop(ms: number): void {
    this.clock();
    this.frozen = performance.now() + ms;
  }

  constructor(private cv: HTMLCanvasElement, a: Army, b: Army, heroSrc: string, bossSrc: string | null, private field: Field | null = null) {
    loadArt();
    this.ctx = cv.getContext("2d")!;
    this.heroImg = Object.assign(new Image(), { src: heroSrc });
    this.bossImg = bossSrc ? Object.assign(new Image(), { src: bossSrc }) : null;
    this.cur = [{ ...a }, { ...b }];
    if (bossSrc) this.calls.push({ text: "Destan savaşı!", t0: this.clock() + 150, color: "#d9a8ff" });
    else if (armySize(a) + armySize(b) >= 80) this.calls.push({ text: "Meydan muharebesi!", t0: this.clock() + 150, color: "#ffe39a" });
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
    this.t0 = this.clock() - 10000;
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
    this.end = { win, t0: this.clock() };
    if (win)
      for (let k = 0; k < 60; k++) {
        const t0 = this.end.t0 + 200 + Math.random() * 900;
        this.puffs.push({ x: 0.05 + Math.random() * 0.5, y: 0.3 + Math.random() * 0.7, vx: (Math.random() - 0.5) * 0.05, vy: -0.4 - Math.random() * 0.5, t0, life: 1200 + Math.random() * 600, kind: "gold" });
      }
    this.calls.push({ text: win ? "Zafer!" : "Bozgun", t0: this.clock(), color: win ? "#ffd56a" : "#ff7a5a" });
  }

  round(a: Army, b: Army, order: Order | undefined, dur: number, ev: string[] = []): void {
    const now = this.clock();
    this.t0 = now;
    this.dur = dur;
    this.order = order;
    this.charge = ev.some((e) => e.startsWith("Safları"));
    if (order === "ricat") this.calls.push({ text: ev.some((e) => e.includes("yuttu")) ? "Turan taktiği: düşman peşe düştü!" : "Sahte ricat sezildi", t0: now, color: "#ffe39a" });
    else if (this.charge) this.calls.push({ text: "Dön ve vur!", t0: now, color: "#ffd56a" });
    else if (order === "kanat") this.calls.push({ text: "Kanatlar dolanıyor!", t0: now, color: "#ffe39a" });
    else if (order === "nara") this.calls.push({ text: "Nara!", t0: now, color: "#ffe39a" });
    else if (ev.includes("Kritik!")) this.calls.push({ text: "Kritik!", t0: now, color: "#fff" });
    if (ev.includes("Düşman komutanı nara attı!")) this.calls.push({ text: "Düşman komutanı nara attı!", t0: now, color: "#ff9a7a" });
    if (ev.includes("Yedekler meydana indi!")) this.calls.push({ text: "Yedekler meydana indi!", t0: now, color: "#9ad0ff" });
    if (ev.includes("Düşman bozguna uğradı!")) this.calls.push({ text: "Düşman bozguna uğradı!", t0: now + 80, color: "#ffd56a" });
    if (ev.includes("Askerlerin dağıldı!")) this.calls.push({ text: "Askerlerin dağıldı!", t0: now + 80, color: "#ff7a5a" });
    this.calls = this.calls.filter((c) => now - c.t0 < 1600);
    const prev = [this.cur[0], this.cur[1]];
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
        const [x0, x1] = BLOCK[u];
        for (let k = live.length; k < want; k++) {
          const fx = x0 + Math.random() * (x1 - x0);
          this.sides[s].push({ u, x: s ? 1 - fx : fx, y: 0.06 + Math.random() * 0.88, ph: Math.random() * 6, dead: 0, born: now + Math.random() * dur * 0.2 });
        }
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
    const lost = UNIT_KEYS.reduce((n, u) => n + Math.max(0, prev[0][u] - a[u]) + Math.max(0, prev[1][u] - b[u]), 0);
    const melee = Math.min(a.spear + a.horse, b.spear + b.horse);
    if (melee > 0)
      for (let k = 0; k < Math.min(12, 3 + Math.ceil(melee / 4)); k++)
        this.puffs.push({ x: front + (Math.random() - 0.5) * 0.08, y: 0.1 + Math.random() * 0.8, vx: 0, vy: 0, t0: now + dur * (0.38 + Math.random() * 0.2), life: 260, kind: "clash" });
    if (lost > 0) this.shake = { t0: now + dur * 0.42, amp: Math.min(7, 1.5 + lost * 0.25) };
    for (let k = 0; k < 16; k++) this.puffs.push({ x: front + (Math.random() - 0.5) * 0.14, y: 0.1 + Math.random() * 0.8, vx: (Math.random() - 0.5) * 0.08, vy: -Math.random() * 0.12, t0: now + dur * (0.3 + Math.random() * 0.2), life: 900, kind: "dust" });
    this.puffs = this.puffs.filter((p) => now - p.t0 < p.life).slice(-160);
    this.floats = this.floats.filter((f) => now - f.t0 < 1400).slice(-24);
  }

  /** Askerin bu turdaki ileri-geri kayması (alan genişliğine oranla). */
  private lunge(s: number, u: Unit, p: number): number {
    const k = Math.sin(Math.PI * Math.min(1, p));
    if (this.end) {
      const lost = this.end.win ? 1 : 0;
      const q = Math.min(1, (this.clock() - this.end.t0) / 1400);
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
      g.fillStyle = "rgba(60,48,40,0.4)";
      for (let k = 0; k < 9; k++) {
        const x = ((k * 0.137 + 0.05) % 1) * w;
        const y = h * (0.25 + ((k * 0.31) % 0.7));
        g.beginPath();
        g.ellipse(x, y, 14 + (k % 3) * 6, 6 + (k % 2) * 3, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    if (this.field?.ground === "cayir") {
      for (let k = 0; k < 14; k++) {
        const x = ((k * 0.0731 + 0.02) % 1) * w;
        g.fillStyle = "rgba(30,60,20,0.6)";
        g.beginPath();
        g.ellipse(x, h * HORIZON + 6 + (k % 3) * 4, 16, 8, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    const hz = h * HORIZON;
    const night = !!this.field?.night;
    const sky = g.createLinearGradient(0, 0, 0, hz);
    sky.addColorStop(0, night ? "#0c1428" : "#c9b48a");
    sky.addColorStop(1, night ? "#2a3046" : "#f0d9a6");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, hz);
    const ridge = (base: number, amp: number, f: number, col: string) => {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, hz + 2);
      for (let x = 0; x <= w; x += 8) g.lineTo(x, base - amp * (0.5 + 0.3 * Math.sin(x * f) + 0.2 * Math.sin(x * f * 2.7 + 1.3)));
      g.lineTo(w, hz + 2);
      g.closePath();
      g.fill();
    };
    const far = this.field?.ground === "dag" ? 1.8 : this.field?.ground === "kum" ? 0.6 : 1;
    ridge(hz * 0.95, hz * 0.55 * far, 0.011, night ? "#3a3e56" : "#a89878");
    ridge(hz * 1.02, hz * 0.35 * far, 0.023, night ? "#262a3a" : "#7d6c4c");
    const haze = g.createLinearGradient(0, hz * 0.7, 0, hz * 1.6);
    haze.addColorStop(0, "rgba(240,220,170,0)");
    haze.addColorStop(0.45, night ? "rgba(60,70,100,0.35)" : "rgba(240,220,170,0.4)");
    haze.addColorStop(1, "rgba(240,220,170,0)");
    g.fillStyle = haze;
    g.fillRect(0, hz * 0.7, w, hz * 0.9);
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
  private sprite(u: Unit, s: number, fallen = false): HTMLCanvasElement | null {
    const key = u + s + (fallen ? "x" : "");
    const hit = this.sprites.get(key);
    if (hit) return hit;
    const img = icons[u];
    if (!img?.complete || !img.naturalWidth) return null;
    const c = document.createElement("canvas");
    c.width = c.height = SPR;
    const g = c.getContext("2d")!;
    g.translate(SPR / 2, SPR / 2);
    if (s) g.scale(-1, 1);
    if (fallen) {
      const k = (SPR - 8) / Math.max(img.naturalWidth, img.naturalHeight);
      g.drawImage(img, (-img.naturalWidth * k) / 2, (-img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = "source-atop";
      g.fillStyle = "rgba(34,26,18,0.85)";
      g.fillRect(0, 0, SPR, SPR);
      this.sprites.set(key, c);
      return c;
    }
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
    const now = this.clock();
    const p = (now - this.t0) / this.dur;
    const sk = now - this.shake.t0;
    const shk = sk > 0 && sk < 320 ? this.shake.amp * (1 - sk / 320) : 0;
    ctx.save();
    if (shk) ctx.translate((Math.random() - 0.5) * shk, (Math.random() - 0.5) * shk * 0.6);
    ctx.drawImage(this.ground(), -8, -8, w + 16, h + 16);
    const size = Math.max(18, Math.min(46, h / 6.2));
    const top = h * HORIZON;
    const Y = (y: number) => top + y * (h - top - size * 0.9) + size * 0.45;
    const depth = (y: number) => 0.72 + 0.48 * Math.max(0, Math.min(1, y));
    for (let s = 0; s < 2; s++) this.banner(s ? w - 14 : 14, SIDE_COLOR[s], now, s);
    const live: [Glyph, number][] = [];
    const dead: [Glyph, number][] = [];
    for (let s = 0; s < 2; s++)
      for (const gl of this.sides[s]) {
        if (gl.born && now < gl.born) continue;
        (gl.dead && now >= gl.dead ? dead : live).push([gl, s]);
      }
    live.sort((m, n) => m[0].y - n[0].y);
    for (const [gl, s] of dead.slice(-90)) {
      const dir = s ? -1 : 1;
      const k = (now - gl.dead) / 900;
      const sz = size * depth(gl.y) * (gl.u === "horse" ? 1.15 : 1);
      const x = gl.x * w;
      const y = Y(gl.y);
      ctx.globalAlpha = Math.min(0.22, k * 0.4);
      ctx.fillStyle = "#2e0904";
      ctx.beginPath();
      ctx.ellipse(x + dir * sz * 0.1, y + sz * 0.32, sz * 0.3 * Math.min(1, k + 0.3), sz * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      const spr = this.sprite(gl.u, s);
      const body = this.sprite(gl.u, s, true);
      if (!spr || !body) continue;
      ctx.save();
      ctx.translate(x, y + Math.min(1, k * 3.6) * sz * 0.18);
      ctx.rotate(dir * Math.min(1, (now - gl.dead) / 250) * 1.35);
      if (k < 1) {
        ctx.globalAlpha = 1 - k;
        ctx.drawImage(spr, -sz / 2, -sz / 2, sz, sz);
      }
      ctx.globalAlpha = Math.min(0.42, k * 0.6);
      ctx.drawImage(body, -sz / 2, -sz / 2, sz * 0.9, sz * 0.9);
      ctx.restore();
    }
    for (const [gl, s] of live) {
      const dir = s ? -1 : 1;
      const enter = gl.born ? 1 - Math.min(1, (now - gl.born) / 700) : 0;
      const off = this.lunge(s, gl.u, p) * dir - enter * enter * 0.35 * dir;
      const wheel = s === 0 && gl.u === "horse" && (this.order === "kanat" || this.charge) ? Math.sin(Math.PI * Math.min(1, p)) * (gl.y < 0.5 ? -0.12 : 0.12) : 0;
      const x = (gl.x + off) * w;
      const gallop = gl.u === "horse" ? Math.abs(Math.sin(now / 90 + gl.ph)) * 2.2 : Math.sin(now / 160 + gl.ph) * 0.8;
      const gy = Y(gl.y + wheel);
      const y = gy - gallop;
      const sz = size * depth(gl.y + wheel) * (gl.u === "horse" ? 1.15 : 1);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#1a0e04";
      ctx.beginPath();
      ctx.ellipse(x, gy + sz * 0.42, sz * 0.38, sz * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.82 + 0.18 * depth(gl.y);
      const spr = this.sprite(gl.u, s);
      if (spr) ctx.drawImage(spr, x - sz / 2, y - sz / 2, sz, sz);
      else this.glyph(gl.u, x, y, SIDE_COLOR[s], 1);
      ctx.fillStyle = SIDE_COLOR[s];
      ctx.fillRect(x - sz * 0.22, gy + sz * 0.5, sz * 0.44, 2);
    }
    ctx.globalAlpha = 1;
    const heroOff = this.lunge(0, "spear", p);
    this.portrait(this.heroImg, (0.45 + heroOff) * w, Y(0.5), size * 0.75, "#ffd56a");
    if (this.bossImg) this.portrait(this.bossImg, (0.56 - this.lunge(1, "spear", p)) * w, Y(0.5), size, "#c27bff");
    ctx.lineWidth = 1.4;
    for (const r of this.arrows) {
      const q = (now - r.t0) / (r.t1 - r.t0);
      if (q < 0 || q > 1) continue;
      const arc = h * 0.22;
      const pt = (t: number) => [(r.x0 + (r.x1 - r.x0) * t) * w, Y(r.y0 + (r.y1 - r.y0) * t) - Math.sin(Math.PI * t) * arc];
      const [x, y] = pt(q);
      const [xb, yb] = pt(Math.max(0, q - 0.07));
      ctx.strokeStyle = "rgba(244,231,196,0.35)";
      ctx.beginPath();
      ctx.moveTo(...pt(Math.max(0, q - 0.16)) as [number, number]);
      ctx.lineTo(xb, yb);
      ctx.stroke();
      ctx.strokeStyle = "#f4e7c4";
      ctx.beginPath();
      ctx.moveTo(xb, yb);
      ctx.lineTo(x, y);
      ctx.stroke();
      const ang = Math.atan2(y - yb, x - xb);
      ctx.fillStyle = "#f4e7c4";
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ang) * 3, y + Math.sin(ang) * 3);
      ctx.lineTo(x + Math.cos(ang + 2.5) * 3, y + Math.sin(ang + 2.5) * 3);
      ctx.lineTo(x + Math.cos(ang - 2.5) * 3, y + Math.sin(ang - 2.5) * 3);
      ctx.fill();
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
      } else if (d.kind === "gold") {
        const tw = 0.6 + 0.4 * Math.sin(now / 60 + d.x * 40);
        ctx.fillStyle = `rgba(255,${200 + Math.round(40 * tw)},110,${(1 - t) * tw})`;
        ctx.fillRect(x - 1.5, Y(d.y) + d.vy * t * h, 3, 3);
      } else if (d.kind === "clash") {
        const r = size * (0.25 + t * 0.45);
        const cy = Y(d.y);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(255,236,180,${1 - t})`;
        ctx.lineWidth = 2 * (1 - t) + 0.5;
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const ang = k * (Math.PI / 4) + d.x * 30;
          ctx.moveTo(x - Math.cos(ang) * r, cy - Math.sin(ang) * r);
          ctx.lineTo(x + Math.cos(ang) * r, cy + Math.sin(ang) * r);
        }
        ctx.stroke();
        ctx.fillStyle = `rgba(255,250,220,${0.8 * (1 - t)})`;
        ctx.beginPath();
        ctx.arc(x, cy, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = d.kind === "blood" ? `rgba(150,20,10,${1 - t})` : `rgba(255,220,140,${1 - t})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.restore();
    if (performance.now() < this.frozen) {
      ctx.fillStyle = "rgba(255,245,220,0.14)";
      ctx.fillRect(0, 0, w, h);
    }
    if (this.field?.sky) this.drawSky(this.field.sky, now);
    if (this.end && !this.end.win) {
      ctx.fillStyle = `rgba(30,6,2,${0.4 * Math.min(1, (now - this.end.t0) / 1600)})`;
      ctx.fillRect(0, 0, w, h);
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

  private sky: [number, number, number][] = Array.from({ length: 130 }, () => [Math.random(), Math.random(), 0.5 + Math.random()]);

  private drawSky(kind: Sky, now: number): void {
    const { ctx, w, h } = this;
    const t = now / 1000;
    if (kind === "kum") {
      const gr = ctx.createLinearGradient(0, 0, w, 0);
      const pulse = 0.08 * Math.sin(t * 1.3);
      gr.addColorStop(0, `rgba(196,150,80,${0.42 + pulse})`);
      gr.addColorStop(0.5, `rgba(214,170,100,${0.3 - pulse})`);
      gr.addColorStop(1, `rgba(196,150,80,${0.45 + pulse})`);
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(250,222,160,0.75)";
      ctx.lineWidth = 1.6;
    } else if (kind === "yagmur") {
      ctx.fillStyle = "rgba(40,60,90,0.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(190,210,240,0.55)";
      ctx.lineWidth = 1;
    } else {
      ctx.fillStyle = kind === "tipi" ? "rgba(220,230,245,0.2)" : "rgba(220,230,245,0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
    }
    ctx.beginPath();
    for (const [px, py, sp] of this.sky) {
      if (kind === "kum") {
        const x = ((px + t * 0.7 * sp) % 1) * (w + 80) - 40;
        const y = (py + Math.sin(t * 2 + px * 9) * 0.015) * h;
        ctx.moveTo(x, y);
        ctx.lineTo(x + 30 * sp, y + 2);
      } else if (kind === "yagmur") {
        const x = ((px + t * 0.12 * sp) % 1) * (w + 40) - 20;
        const y = ((py + t * 1.4 * sp) % 1) * h;
        ctx.moveTo(x, y);
        ctx.lineTo(x - 3, y + 9 * sp);
      } else {
        const drift = kind === "tipi" ? 0.35 : 0.06;
        const x = ((px + t * drift * sp + Math.sin(t + py * 10) * 0.01) % 1) * w;
        const y = ((py + t * 0.12 * sp) % 1) * h;
        ctx.moveTo(x + 1.6 * sp, y);
        ctx.arc(x, y, 1.6 * sp, 0, Math.PI * 2);
      }
    }
    if (kind === "kum" || kind === "yagmur") ctx.stroke();
    else ctx.fill();
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
