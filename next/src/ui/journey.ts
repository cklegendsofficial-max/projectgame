import { t } from "../i18n";

export type Biome = "kum" | "bozkir" | "cayir" | "dag";

export interface Env {
  /** Gün kesri: 0 öğle, 0.5 gece yarısı. */
  t: number;
  season: string;
  biome: Biome;
}

type C3 = [number, number, number];

const COARSE = matchMedia("(pointer: coarse)");
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a: C3, b: C3, k: number): C3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const rgb = (c: C3, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const SKY = {
  dayTop: [78, 140, 212] as C3,
  dayHor: [238, 220, 182] as C3,
  nightTop: [6, 9, 26] as C3,
  nightHor: [30, 34, 70] as C3,
  duskTop: [92, 70, 130] as C3,
  duskHor: [246, 132, 74] as C3,
};

const GROUND: Record<Biome, C3> = {
  kum: [214, 176, 116],
  bozkir: [168, 152, 92],
  cayir: [104, 146, 72],
  dag: [134, 124, 108],
};
const SEASON_TINT: Record<string, [C3, number]> = {
  bahar: [[96, 168, 70], 0.25],
  yaz: [[214, 186, 112], 0.2],
  guz: [[186, 128, 60], 0.38],
  kis: [[236, 240, 246], 0.78],
};

export const CITY_EPITHET: Record<string, string> = {
  constantinople: "Dünyanın arzuladığı şehir",
  konya: "Selçuklu'nun taht şehri",
  tabriz: "Çarşıların en büyüğü",
  rey: "Doğunun gelini",
  nishapur: "Turkuaz ve şiir diyarı",
  merv: "Şehirlerin anası",
  bukhara: "İlmin kubbesi",
  samarkand: "Dünyanın parlayan yüzü",
  kashgar: "Çin kapısının bekçisi",
};

/** Işık: e güneş yüksekliği, day gündüz payı, dusk alacakaranlık payı. */
export function lightOf(t: number): { e: number; day: number; dusk: number } {
  const e = Math.cos(t * Math.PI * 2);
  return { e, day: clamp01((e + 0.35) / 0.75), dusk: clamp01(1 - Math.abs(e + 0.08) / 0.42) };
}

function groundCol(env: Env): C3 {
  const st = SEASON_TINT[env.season];
  return st ? mix(GROUND[env.biome], st[0], env.biome === "kum" && env.season === "kis" ? st[1] * 0.35 : st[1]) : GROUND[env.biome];
}

function ridge(x: number, seed: number, rough: number): number {
  return Math.sin(x * 0.0021 + seed) * 0.5 + Math.sin(x * 0.0057 + seed * 2.3) * 0.3 + Math.sin(x * 0.0131 + seed * 5.1) * 0.2 * rough + Math.sin(x * 0.031 + seed * 7.7) * 0.08 * rough;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  r: number;
}

/** Bozkır panoraması: gök, sıradağlar, zemin ve kervan. Hem yolculuk hem şehir girişi için. */
class Vista {
  cv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w = 0;
  h = 0;
  scale = 1;
  stars: [number, number, number][] = [];
  dust: Dust[] = [];
  flakes: [number, number, number][] = [];
  gcol: C3;
  rough: number;

  constructor(cv: HTMLCanvasElement, env: Env) {
    this.cv = cv;
    this.ctx = cv.getContext("2d")!;
    for (let i = 0; i < 140; i++) this.stars.push([Math.random(), Math.random() * 0.62, Math.random()]);
    for (let i = 0; i < 90; i++) this.flakes.push([Math.random(), Math.random(), 0.5 + Math.random()]);
    this.gcol = groundCol(env);
    this.rough = env.biome === "dag" ? 1.6 : env.biome === "kum" ? 0.2 : 0.8;
  }

  resize(): void {
    const dpr = Math.min(COARSE.matches ? 1.5 : 2, devicePixelRatio || 1);
    const w = Math.round(this.cv.clientWidth * dpr);
    const h = Math.round(this.cv.clientHeight * dpr);
    if (w === this.cv.width && h === this.cv.height) return;
    this.cv.width = w;
    this.cv.height = h;
    this.w = w;
    this.h = h;
    this.scale = h > w ? w / 700 : Math.min(w, h * 1.6) / 1000;
  }

  /** Arka plan: gök, güneş/ay, yıldızlar ve üç kat sırt. Ufuk çizgisini döndürür. */
  back(env: Env, off: number, time: number, dt: number): number {
    const { ctx, w, h } = this;
    const L = lightOf(env.t);
    const hor = h * 0.62;
    const target = groundCol(env);
    const k = Math.min(1, dt * 0.8);
    this.gcol = mix(this.gcol, target, k);
    const tr = env.biome === "dag" ? 1.6 : env.biome === "kum" ? 0.2 : 0.8;
    this.rough += (tr - this.rough) * k;
    const top = mix(mix(SKY.nightTop, SKY.dayTop, L.day), SKY.duskTop, L.dusk * 0.45);
    const horC = mix(mix(SKY.nightHor, SKY.dayHor, L.day), SKY.duskHor, L.dusk * 0.85);
    const g = ctx.createLinearGradient(0, 0, 0, hor);
    g.addColorStop(0, rgb(top));
    g.addColorStop(1, rgb(horC));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, hor + 2);
    const sa = clamp01(1 - L.day / 0.55);
    if (sa > 0) {
      for (const [sx, sy, p] of this.stars) {
        ctx.globalAlpha = sa * (0.45 + 0.55 * Math.sin(time * (1 + p * 2) + p * 40) ** 2);
        ctx.fillStyle = "#fff8e6";
        const r = (0.6 + p * 1.4) * this.scale;
        ctx.fillRect(sx * w, sy * hor, r, r);
      }
      ctx.globalAlpha = 1;
    }
    const orb = (ang: number, col: string, glow: string, r: number) => {
      const el = Math.cos(ang);
      if (el < -0.12) return;
      const x = w * (0.5 + 0.4 * Math.sin(ang));
      const y = hor - (hor * 0.78) * el;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, r * 7);
      gr.addColorStop(0, glow);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    const sunCol = rgb(mix([255, 248, 214], [255, 150, 80], L.dusk));
    orb(env.t * Math.PI * 2, sunCol, `rgba(255,${(200 - L.dusk * 70) | 0},120,${0.35 + L.dusk * 0.25})`, 26 * this.scale);
    orb(env.t * Math.PI * 2 + Math.PI, "#f2f0e2", "rgba(190,210,255,0.18)", 18 * this.scale);
    const haze = horC;
    const layers: [number, number, number, number][] = [
      [0.05, 0.3, 0.75, 11],
      [0.16, 0.2, 0.55, 23],
      [0.36, 0.11, 0.3, 37],
    ];
    layers.forEach(([par, amp, fade, seed], li) => {
      const base = mix(mix(this.gcol, [70, 60, 66], 0.55 - li * 0.12), [24, 26, 44], 1 - L.day * 0.85);
      const col = mix(base, haze, fade);
      const A = h * amp * (li === 0 ? 0.6 + this.rough * 0.4 : 0.5 + this.rough * 0.3);
      const y0 = hor + h * 0.012 * li;
      ctx.fillStyle = rgb(col);
      ctx.beginPath();
      ctx.moveTo(0, h);
      const step = Math.max(4, w / 160);
      for (let x = 0; x <= w + step; x += step) {
        const r = ridge((x + off * par) / this.scale, seed, this.rough);
        ctx.lineTo(x, y0 - A * (0.35 + 0.65 * (r * 0.5 + 0.5)) * (li === 0 ? 1 : 0.7));
      }
      ctx.lineTo(w, h);
      ctx.fill();
      if (li === 0 && (this.rough > 1 || env.season === "kis")) {
        ctx.save();
        ctx.clip();
        ctx.fillStyle = rgb(mix([240, 244, 250], haze, 0.35), 0.8);
        ctx.fillRect(0, 0, w, y0 - A * 0.78);
        ctx.restore();
      }
    });
    const gg = ctx.createLinearGradient(0, hor, 0, h);
    const kis = env.season === "kis";
    const gc = mix(this.gcol, kis ? [62, 74, 116] : [20, 22, 40], (1 - L.day) * (kis ? 0.62 : 0.78));
    gg.addColorStop(0, rgb(mix(gc, haze, 0.35)));
    gg.addColorStop(1, rgb(mix(gc, [0, 0, 0], 0.32)));
    ctx.fillStyle = gg;
    ctx.fillRect(0, hor + h * 0.03, w, h);
    return hor + h * 0.03;
  }

  /** Zemin ayrıntısı: çalı, taş ve otlar; off ile kayar. */
  tufts(env: Env, off: number, y0: number, par: number, size: number, seed: number): void {
    const { ctx, w, h } = this;
    const L = lightOf(env.t);
    const gap = 46 * this.scale * size;
    const i0 = Math.floor((off * par) / gap) - 1;
    const n = Math.ceil(w / gap) + 2;
    const dark = mix(mix(this.gcol, [40, 30, 20], 0.55), [10, 10, 20], 1 - L.day * 0.8);
    const kis = env.season === "kis";
    for (let k = 0; k < n; k++) {
      const i = i0 + k;
      const r = hash(i * 1.37 + seed);
      if (r < 0.35) continue;
      const x = i * gap - off * par + hash(i + seed * 3) * gap;
      const y = y0 + (h - y0) * (0.05 + 0.9 * hash(i * 2.1 + seed));
      const s = this.scale * size * (0.6 + r * 0.8) * (0.5 + (y - y0) / (h - y0));
      ctx.fillStyle = rgb(dark, 0.85);
      ctx.strokeStyle = rgb(dark, 0.9);
      if (r > 0.88) {
        ctx.beginPath();
        ctx.ellipse(x, y, 9 * s, 5 * s, 0, Math.PI, 0);
        ctx.fill();
        if (kis) {
          ctx.fillStyle = "rgba(245,248,252,.85)";
          ctx.beginPath();
          ctx.ellipse(x, y - 3 * s, 7 * s, 2.5 * s, 0, Math.PI, 0);
          ctx.fill();
        }
      } else if (env.biome !== "kum" || r > 0.7) {
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        for (let b = -2; b <= 2; b++) {
          ctx.moveTo(x + b * 2 * s, y);
          ctx.quadraticCurveTo(x + b * 3 * s, y - 8 * s, x + b * 5 * s, y - (10 + hash(i + b) * 6) * s);
        }
        ctx.stroke();
        if (env.season === "bahar" && r > 0.6) {
          ctx.fillStyle = r > 0.8 ? "#ffd84a" : "#e8584a";
          ctx.beginPath();
          ctx.arc(x + 4 * s, y - 13 * s, 2 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private legs(x: number, y: number, s: number, ph: number, xs: number[], top: number, len: number, w: number): void {
    const ctx = this.ctx;
    ctx.lineWidth = w * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    xs.forEach((lx, k) => {
      const sw = Math.sin(ph + (k % 2 ? Math.PI : 0) + (k > 1 ? Math.PI / 2 : 0));
      const kx = x + lx * s;
      const ky = y - top * s;
      ctx.moveTo(kx, ky);
      ctx.lineTo(kx + sw * 0.14 * s, ky + len * 0.5 * s);
      ctx.lineTo(kx + sw * 0.3 * s, y - Math.max(0, -Math.cos(ph + (k % 2 ? Math.PI : 0) + (k > 1 ? Math.PI / 2 : 0))) * 0.08 * s);
    });
    ctx.stroke();
  }

  camel(x: number, y: number, s: number, ph: number, col: string, load: [string, string]): void {
    const ctx = this.ctx;
    const bob = Math.sin(ph * 2) * 0.03 * s;
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse(x, y, 1.1 * s, 0.12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col;
    this.legs(x, y, s, ph, [-0.62, -0.42, 0.42, 0.62], 0.92, 0.9, 0.13);
    y += bob;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y - 1.08 * s, 0.86 * s, 0.36 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 0.08 * s, y - 1.38 * s, 0.42 * s, 0.32 * s, 0, Math.PI, 0);
    ctx.fill();
    ctx.lineWidth = 0.24 * s;
    ctx.beginPath();
    ctx.moveTo(x + 0.7 * s, y - 1.1 * s);
    ctx.quadraticCurveTo(x + 1.1 * s, y - 1.05 * s, x + 1.18 * s, y - 1.72 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + 1.3 * s, y - 1.76 * s, 0.24 * s, 0.11 * s, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 0.84 * s, y - 1.1 * s);
    ctx.quadraticCurveTo(x - 1.02 * s, y - 0.9 * s + Math.sin(ph) * 0.05 * s, x - 0.98 * s, y - 0.72 * s);
    ctx.lineWidth = 0.06 * s;
    ctx.stroke();
    ctx.fillStyle = load[0];
    ctx.fillRect(x - 0.62 * s, y - 1.5 * s, 0.38 * s, 0.5 * s);
    ctx.fillStyle = load[1];
    ctx.fillRect(x + 0.08 * s, y - 1.48 * s, 0.34 * s, 0.46 * s);
    ctx.fillStyle = "rgba(255,220,140,.35)";
    ctx.fillRect(x - 0.62 * s, y - 1.3 * s, 0.38 * s, 0.05 * s);
    ctx.fillRect(x + 0.08 * s, y - 1.28 * s, 0.34 * s, 0.05 * s);
  }

  rider(x: number, y: number, s: number, ph: number, col: string, flag: string, time: number): void {
    const ctx = this.ctx;
    const bob = Math.sin(ph * 2) * 0.04 * s;
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse(x, y, 0.95 * s, 0.11 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col;
    this.legs(x, y, s, ph * 1.15, [-0.5, -0.36, 0.38, 0.52], 0.78, 0.78, 0.1);
    y += bob;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y - 0.92 * s, 0.68 * s, 0.27 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 0.22 * s;
    ctx.beginPath();
    ctx.moveTo(x + 0.5 * s, y - 1.0 * s);
    ctx.lineTo(x + 0.82 * s, y - 1.42 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + 0.92 * s, y - 1.42 * s, 0.22 * s, 0.1 * s, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 0.08 * s;
    ctx.beginPath();
    ctx.moveTo(x - 0.66 * s, y - 0.98 * s);
    ctx.quadraticCurveTo(x - 0.95 * s, y - 0.8 * s + Math.sin(ph * 2) * 0.06 * s, x - 0.92 * s, y - 0.55 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 0.12 * s, y - 1.12 * s);
    ctx.lineTo(x + 0.2 * s, y - 1.12 * s);
    ctx.lineTo(x + 0.12 * s, y - 1.66 * s);
    ctx.lineTo(x - 0.1 * s, y - 1.62 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 0.02 * s, y - 1.78 * s, 0.13 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 0.14 * s, y - 1.84 * s);
    ctx.lineTo(x + 0.02 * s, y - 2.08 * s);
    ctx.lineTo(x + 0.16 * s, y - 1.84 * s);
    ctx.fill();
    ctx.lineWidth = 0.05 * s;
    ctx.beginPath();
    ctx.moveTo(x - 0.25 * s, y - 1.2 * s);
    ctx.lineTo(x - 0.25 * s, y - 2.7 * s);
    ctx.stroke();
    ctx.fillStyle = flag;
    ctx.beginPath();
    ctx.moveTo(x - 0.25 * s, y - 2.7 * s);
    for (let k = 0; k <= 6; k++) ctx.lineTo(x - 0.25 * s - k * 0.11 * s, y - 2.66 * s + Math.sin(time * 6 - k * 0.9) * 0.05 * s * k * 0.4);
    for (let k = 6; k >= 0; k--) ctx.lineTo(x - 0.25 * s - k * 0.11 * s, y - 2.4 * s + Math.sin(time * 6 - k * 0.9) * 0.05 * s * k * 0.4 + k * 0.02 * s);
    ctx.fill();
  }

  kick(x: number, y: number, s: number): void {
    if (this.dust.length > 140) return;
    this.dust.push({ x, y, vx: -(20 + Math.random() * 40) * this.scale, vy: -(6 + Math.random() * 14) * this.scale, life: 1, r: (4 + Math.random() * 6) * s * 0.06 });
  }

  fx(env: Env, dt: number, wind: number): void {
    const { ctx, w, h } = this;
    const L = lightOf(env.t);
    const dc = mix(mix(this.gcol, [255, 240, 210], 0.3), [40, 40, 60], 1 - L.day * 0.8);
    for (const d of this.dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy *= 0.97;
      d.r += dt * 9 * this.scale;
      d.life -= dt * 0.9;
    }
    this.dust = this.dust.filter((d) => d.life > 0);
    for (const d of this.dust) {
      ctx.fillStyle = rgb(dc, d.life * 0.28);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (env.season === "kis") {
      ctx.fillStyle = "rgba(250,252,255,.85)";
      for (const f of this.flakes) {
        f[1] += dt * 0.06 * f[2];
        f[0] -= dt * (0.02 + wind * 0.0004) * f[2];
        if (f[1] > 1) f[1] -= 1;
        if (f[0] < 0) f[0] += 1;
        const r = (1 + f[2] * 1.4) * this.scale;
        ctx.beginPath();
        ctx.arc(f[0] * w, f[1] * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (env.biome === "kum" && L.day > 0.5) {
      const g = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.7);
      g.addColorStop(0, "rgba(255,230,180,0)");
      g.addColorStop(0.5, `rgba(255,230,180,${0.12 * L.day})`);
      g.addColorStop(1, "rgba(255,230,180,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, h * 0.55, w, h * 0.15);
    }
    if (L.day < 0.6) {
      ctx.fillStyle = `rgba(8,10,30,${(0.6 - L.day) * 0.45})`;
      ctx.fillRect(0, 0, w, h);
    }
    const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,.55)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  silhouette(env: Env): string {
    const L = lightOf(env.t);
    return rgb(mix([18, 14, 22], mix([70, 46, 30], [120, 60, 36], L.dusk * 0.6), L.day * 0.9));
  }
}

const LOADS: [string, string][] = [
  ["#8e2a22", "#2a4a8e"],
  ["#c08a2a", "#6a2a5a"],
  ["#2a6a4a", "#a8402a"],
];

export interface JourneyHooks {
  env: () => Env;
  prog: () => number;
  clock: () => string;
  skip: () => void;
  stop: () => void;
}

/** Uzun yol ara sahnesi: bozkırda yürüyen kervan, yol günlüğü ve ilerleme. */
export class JourneyView {
  private el: HTMLDivElement;
  private vista: Vista;
  private raf = 0;
  private last = performance.now();
  private time = 0;
  private off = 0;
  private logEl: HTMLDivElement;
  private barEl: HTMLDivElement;
  private clockEl: HTMLElement;
  private hooks: JourneyHooks;
  private lines: string[] = [];
  private lineT = 0;
  closed = false;

  constructor(root: HTMLElement, from: string, to: string, hooks: JourneyHooks) {
    this.hooks = hooks;
    this.el = document.createElement("div");
    this.el.className = "journey";
    this.el.innerHTML = `<canvas></canvas>
      <div class="jtop"><b>${from}</b><span class="jarrow">⟶</span><b>${to}</b><small class="jclock"></small></div>
      <div class="jlog"></div>
      <div class="jbot"><div class="jbar"><div class="jfill"></div><i class="jcv"></i></div>
        <div class="jbtns"><button class="btn sm" data-j="skip">${t("Haritaya dön")}</button><button class="btn sm" data-j="stop">${t("Mola ver")}</button></div></div>`;
    root.appendChild(this.el);
    const cv = this.el.querySelector("canvas")!;
    this.vista = new Vista(cv, hooks.env());
    this.logEl = this.el.querySelector(".jlog")!;
    this.barEl = this.el.querySelector(".jfill")!;
    this.clockEl = this.el.querySelector(".jclock")!;
    this.el.querySelector<HTMLElement>("[data-j=skip]")!.onclick = () => hooks.skip();
    this.el.querySelector<HTMLElement>("[data-j=stop]")!.onclick = () => hooks.stop();
    const loop = () => {
      if (this.closed) return;
      this.frame();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  log(text: string): void {
    this.lines.push(text);
    if (this.lines.length === 1 && this.lineT <= 0) this.next();
  }

  private next(): void {
    const t = this.lines.shift();
    if (!t) return;
    this.lineT = 3.2;
    const p = document.createElement("p");
    p.textContent = t;
    this.logEl.appendChild(p);
    while (this.logEl.children.length > 3) this.logEl.firstElementChild!.remove();
  }

  private frame(): void {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const v = this.vista;
    v.resize();
    const env = this.hooks.env();
    const sp = 120 * v.scale;
    this.off += dt * sp;
    const y0 = v.back(env, this.off, this.time, dt);
    v.tufts(env, this.off, y0, 0.55, 0.7, 3);
    const s = 62 * v.scale;
    const gy = y0 + (v.h - y0) * 0.42;
    const col = v.silhouette(env);
    const ph = this.time * 5.2;
    const cx = v.w * 0.56;
    for (let i = 2; i >= 0; i--) {
      const x = cx - (i + 1) * 2.7 * s;
      v.camel(x, gy - i * 0.03 * s, s * 0.94, ph + i * 1.3, col, LOADS[i]);
      if (i < 2) {
        v.ctx.strokeStyle = col;
        v.ctx.lineWidth = 0.04 * s;
        v.ctx.beginPath();
        v.ctx.moveTo(x + 1.38 * s, gy - 1.74 * s);
        v.ctx.quadraticCurveTo(x + 1.95 * s, gy - 1.1 * s, x + 2.7 * s - 0.82 * s, gy - 1.12 * s);
        v.ctx.stroke();
      }
      if (Math.random() < dt * 9) v.kick(x + (Math.random() - 0.5) * s, gy, s);
    }
    v.rider(cx + 0.4 * s, gy, s, ph, col, "#b8262a", this.time);
    if (Math.random() < dt * 6) v.kick(cx + 0.3 * s, gy, s);
    v.tufts(env, this.off, gy + s * 0.15, 1.6, 1.6, 9);
    v.fx(env, dt, sp);
    const p = clamp01(this.hooks.prog());
    this.barEl.style.width = `${(p * 100).toFixed(1)}%`;
    (this.barEl.nextElementSibling as HTMLElement).style.left = `${(p * 100).toFixed(1)}%`;
    this.clockEl.textContent = this.hooks.clock();
    this.lineT -= dt;
    if (this.lineT <= 0 && this.lines.length) this.next();
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    cancelAnimationFrame(this.raf);
    this.el.classList.add("out");
    setTimeout(() => this.el.remove(), 650);
  }
}

export interface CitySceneData {
  id: string;
  name: string;
  img: string;
  env: Env;
  tag: string;
  lines: string[];
  sacked: boolean;
  first: boolean;
}

/** Şehre giriş: sıradağların önünde şehir, gün saatine göre ışık, yaklaşan kervan. */
export class CityScene {
  private el: HTMLDivElement;
  private vista: Vista;
  private raf = 0;
  private last = performance.now();
  private time = 0;
  private img = new Image();
  private lit: HTMLCanvasElement | null = null;
  private lamps: [number, number, number][] = [];
  private px = 0;
  private py = 0;
  private d: CitySceneData;
  private done: () => void;
  private timer = 0;
  private birds: [number, number, number][] = [];
  closed = false;

  constructor(root: HTMLElement, d: CitySceneData, done: () => void) {
    this.d = d;
    this.done = done;
    this.el = document.createElement("div");
    this.el.className = "cityscene" + (d.sacked ? " sacked" : "");
    this.el.innerHTML = `<canvas></canvas>
      <div class="cstitle"><small>${d.first ? t("İlk kez") : t("Yeniden")} · ${d.tag}</small><h1>${d.name}</h1><em>${t(d.sacked ? "Moğol atlarının çiğnediği şehir" : CITY_EPITHET[d.id] ?? "")}</em></div>
      <div class="csinfo">${d.lines.map((l) => `<span>${l}</span>`).join("")}</div>
      <div class="cshint">${t("Devam etmek için dokun")}</div>`;
    root.appendChild(this.el);
    this.vista = new Vista(this.el.querySelector("canvas")!, d.env);
    for (let i = 0; i < 7; i++) this.birds.push([Math.random(), 0.15 + Math.random() * 0.2, Math.random() * 6]);
    this.img.onload = () => this.bake();
    this.img.src = d.img;
    this.el.addEventListener("pointermove", (e) => {
      this.px = e.clientX / innerWidth - 0.5;
      this.py = e.clientY / innerHeight - 0.5;
    });
    this.el.addEventListener("click", () => this.close());
    this.timer = window.setTimeout(() => this.close(), 6500);
    const loop = () => {
      if (this.closed) return;
      this.frame();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Şehir resmini günün ışığına göre bir kez boyar, gece pencere ışıklarını seçer. */
  private bake(): void {
    const im = this.img;
    const c = document.createElement("canvas");
    c.width = im.naturalWidth;
    c.height = im.naturalHeight;
    const x = c.getContext("2d", { willReadFrequently: true })!;
    x.drawImage(im, 0, 0);
    const L = lightOf(this.d.env.t);
    x.globalCompositeOperation = "source-atop";
    if (L.day < 0.9) {
      x.fillStyle = `rgba(14,18,52,${(1 - L.day) * 0.62})`;
      x.fillRect(0, 0, c.width, c.height);
    }
    if (L.dusk > 0.1) {
      x.fillStyle = `rgba(255,120,50,${L.dusk * 0.22})`;
      x.fillRect(0, 0, c.width, c.height);
    }
    if (this.d.sacked) {
      x.fillStyle = "rgba(70,30,20,.38)";
      x.fillRect(0, 0, c.width, c.height);
    }
    if (L.day < 0.5 || this.d.sacked) {
      const data = x.getImageData(0, 0, c.width, c.height).data;
      for (let k = 0; k < 400 && this.lamps.length < 34; k++) {
        const px = Math.floor(c.width * (0.12 + Math.random() * 0.76));
        const py = Math.floor(c.height * (0.25 + Math.random() * 0.55));
        if (data[(py * c.width + px) * 4 + 3] > 200) this.lamps.push([px / c.width, py / c.height, Math.random() * 6]);
      }
    }
    this.lit = c;
  }

  private frame(): void {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const v = this.vista;
    v.resize();
    const { ctx, w, h } = v;
    const env = this.d.env;
    const drift = this.time * 6 * v.scale + this.px * 60 * v.scale;
    const y0 = v.back(env, drift, this.time, dt);
    const L = lightOf(env.t);
    const im = this.lit;
    if (im) {
      const zoom = 1 + Math.min(1, this.time / 6.5) * 0.06;
      const ch = Math.min(h * 0.55, w * (w < h ? 0.94 : 0.6) * (im.height / im.width)) * zoom;
      const cw = ch * (im.width / im.height);
      const cx = w * 0.5 - cw / 2 - this.px * 26 * v.scale;
      const cy = y0 + (h - y0) * 0.26 - ch * 0.82 - this.py * 14 * v.scale;
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.beginPath();
      ctx.ellipse(w * 0.5 - this.px * 26 * v.scale, cy + ch * 0.86, cw * 0.48, ch * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = Math.min(1, this.time * 2);
      ctx.drawImage(im, cx, cy, cw, ch);
      ctx.globalAlpha = 1;
      if (this.lamps.length) {
        ctx.globalCompositeOperation = "lighter";
        const fire = this.d.sacked;
        for (const [lx, ly, p] of this.lamps) {
          const a = (fire ? 0.5 : (0.5 - L.day) * 1.4) * (0.65 + 0.35 * Math.sin(this.time * (fire ? 7 : 2.3) + p));
          if (a <= 0) continue;
          const X = cx + lx * cw;
          const Y = cy + ly * ch;
          const r = (fire ? 22 : 9) * v.scale;
          const g = ctx.createRadialGradient(X, Y, 0, X, Y, r);
          g.addColorStop(0, fire ? `rgba(255,120,40,${a})` : `rgba(255,200,110,${a})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(X - r, Y - r, r * 2, r * 2);
        }
        ctx.globalCompositeOperation = "source-over";
      }
      if (this.d.sacked) {
        for (let k = 0; k < 5; k++) {
          const sx = cx + cw * (0.2 + k * 0.15);
          for (let j = 0; j < 7; j++) {
            const q = (this.time * 0.25 + j / 7 + k * 0.13) % 1;
            ctx.fillStyle = `rgba(40,34,34,${0.35 * (1 - q)})`;
            ctx.beginPath();
            ctx.arc(sx + Math.sin(q * 5 + k) * 20 * v.scale - q * 60 * v.scale, cy + ch * 0.3 - q * h * 0.4, (8 + q * 40) * v.scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    if (L.day > 0.3 && !this.d.sacked) {
      ctx.strokeStyle = "rgba(30,24,30,.7)";
      ctx.lineWidth = 1.6 * v.scale;
      for (const b of this.birds) {
        const a = this.time * 0.35 + b[2];
        const bx = w * (0.5 + Math.cos(a) * 0.22 * (0.6 + b[0] * 0.5));
        const by = h * (b[1] + Math.sin(a * 1.3) * 0.04);
        const f = Math.sin(this.time * 9 + b[2]) * 4 * v.scale;
        const s = 7 * v.scale;
        ctx.beginPath();
        ctx.moveTo(bx - s, by - f);
        ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.3, bx, by);
        ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.3, bx + s, by - f);
        ctx.stroke();
      }
    }
    const s = 46 * v.scale;
    const gy = y0 + (h - y0) * 0.78;
    const walk = Math.min(1, this.time / 4.5);
    const ease = 1 - (1 - walk) ** 2;
    const col = v.silhouette(env);
    const ph = walk < 1 ? this.time * 5.2 : 0;
    const base = -w * 0.1 + ease * w * 0.34;
    for (let i = 1; i >= 0; i--) v.camel(base - (i + 1) * 2.6 * s, gy, s * 0.94, ph + i * 1.3, col, LOADS[i]);
    v.rider(base + 0.4 * s, gy, s, ph, col, "#b8262a", this.time);
    if (walk < 1 && Math.random() < dt * 8) v.kick(base, gy, s);
    v.tufts(env, drift * 2, gy + s * 0.2, 1, 1.5, 9);
    v.fx(env, dt, 0);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.timer);
    cancelAnimationFrame(this.raf);
    this.el.classList.add("out");
    setTimeout(() => this.el.remove(), 650);
    this.done();
  }
}
