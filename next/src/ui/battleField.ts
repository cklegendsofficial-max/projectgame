import { UNIT_KEYS, armySize, type Army, type Unit } from "../game/data";
import type { Order } from "../game/battle";

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

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t0: number;
}

const BLOCK: Record<Unit, [number, number]> = { archer: [0.05, 0.16], horse: [0.17, 0.28], spear: [0.29, 0.4] };
const ROWS = 6;
const SIDE_COLOR = ["#f0c860", "#e0563f"];

export class BattleField {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private sides: Glyph[][] = [[], []];
  private per: number[] = [1, 1];
  private arrows: Arrow[] = [];
  private dust: Dust[] = [];
  private t0 = 0;
  private dur = 1;
  private order: Order | undefined;
  private raf = 0;
  private heroImg: HTMLImageElement;
  private bossImg: HTMLImageElement | null;

  constructor(private cv: HTMLCanvasElement, a: Army, b: Army, heroSrc: string, bossSrc: string | null) {
    this.ctx = cv.getContext("2d")!;
    this.heroImg = new Image();
    this.heroImg.src = heroSrc;
    this.bossImg = bossSrc ? Object.assign(new Image(), { src: bossSrc }) : null;
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
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
  }

  round(a: Army, b: Army, order: Order | undefined, dur: number): void {
    const now = performance.now();
    this.t0 = now;
    this.dur = dur;
    this.order = order;
    [a, b].forEach((arm, s) => {
      for (const u of UNIT_KEYS) {
        const live = this.sides[s].filter((g) => g.u === u && !g.dead);
        const want = arm[u] > 0 ? Math.max(1, Math.ceil(arm[u] / this.per[s])) : 0;
        for (let k = live.length - 1; k >= want; k--) {
          const g = live.splice(Math.floor(Math.random() * live.length), 1)[0];
          g.dead = now + dur * (0.4 + Math.random() * 0.2);
        }
      }
    });
    this.arrows = this.arrows.filter((r) => r.t1 > now);
    for (let s = 0; s < 2; s++) {
      if (s === 0 && order === "ricat") continue;
      const shooters = this.sides[s].filter((g) => g.u === "archer" && !g.dead).slice(0, 14);
      const foes = this.sides[1 - s].filter((g) => !g.dead || g.dead > now);
      for (const g of shooters) {
        const f = foes[Math.floor(Math.random() * foes.length)];
        const tx = f ? f.x : s ? 0.2 : 0.8;
        const ty = f ? f.y : 0.5;
        const t0 = now + Math.random() * dur * 0.15;
        this.arrows.push({ x0: g.x, y0: g.y, x1: tx, y1: ty, t0, t1: t0 + dur * 0.38 });
      }
    }
    for (let k = 0; k < 14; k++) this.dust.push({ x: 0.5 + (Math.random() - 0.5) * 0.12, y: 0.15 + Math.random() * 0.7, vx: (Math.random() - 0.5) * 0.08, vy: -Math.random() * 0.15, t0: now + dur * 0.4 });
    this.dust = this.dust.slice(-60);
  }

  private lunge(s: number, u: Unit, p: number): number {
    const k = Math.sin(Math.PI * Math.min(1, p));
    if (s === 0 && this.order === "ricat") return -k * (u === "horse" ? 0.08 : 0.05);
    const reach = u === "horse" ? (s === 0 && this.order === "kanat" ? 0.16 : 0.1) : u === "spear" ? 0.06 : 0.01;
    return k * reach;
  }

  private draw(): void {
    const { ctx, w, h } = this;
    if (this.cv.clientWidth && Math.abs(this.cv.clientWidth - w) > 2) this.resize();
    const now = performance.now();
    const p = (now - this.t0) / this.dur;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#6d5a33");
    g.addColorStop(1, "#4a3b20");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,240,200,0.06)";
    ctx.lineWidth = 1;
    for (let k = 0; k < 9; k++) {
      ctx.beginPath();
      ctx.moveTo(0, (k + 0.5) * (h / 9));
      ctx.lineTo(w, (k + 0.5) * (h / 9) + 6);
      ctx.stroke();
    }
    for (let s = 0; s < 2; s++) {
      const dir = s ? -1 : 1;
      for (const gl of this.sides[s]) {
        const dying = gl.dead && now >= gl.dead;
        const off = dying ? 0 : this.lunge(s, gl.u, p) * dir;
        const sweep = !dying && s === 0 && this.order === "kanat" && gl.u === "horse" ? Math.sin(Math.PI * Math.min(1, p)) * (gl.y < 0.5 ? -0.12 : 0.12) : 0;
        const x = (gl.x + off) * w;
        const y = (gl.y + sweep) * (h - 16) + 8 + (dying ? 0 : Math.sin(now / 160 + gl.ph) * 0.8);
        const a = dying ? Math.max(0.22, 1 - (now - gl.dead) / 700) : 1;
        this.glyph(gl.u, x, y, dir, SIDE_COLOR[s], a, dying ? Math.min(1, (now - gl.dead) / 250) : 0);
      }
    }
    const heroOff = this.lunge(0, "spear", p);
    this.portrait(this.heroImg, (0.45 + heroOff) * w, h / 2, 15, "#ffd56a");
    if (this.bossImg) this.portrait(this.bossImg, (0.56 - this.lunge(1, "spear", p)) * w, h / 2, 22, "#c27bff");
    ctx.strokeStyle = "#f4e7c4";
    ctx.lineWidth = 1.4;
    for (const r of this.arrows) {
      const q = (now - r.t0) / (r.t1 - r.t0);
      if (q < 0 || q > 1) continue;
      const x = (r.x0 + (r.x1 - r.x0) * q) * w;
      const y = (r.y0 + (r.y1 - r.y0) * q) * (h - 16) + 8 - Math.sin(Math.PI * q) * 30;
      const q2 = Math.max(0, q - 0.06);
      const xb = (r.x0 + (r.x1 - r.x0) * q2) * w;
      const yb = (r.y0 + (r.y1 - r.y0) * q2) * (h - 16) + 8 - Math.sin(Math.PI * q2) * 30;
      ctx.beginPath();
      ctx.moveTo(xb, yb);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    for (const d of this.dust) {
      const t = (now - d.t0) / 900;
      if (t < 0 || t > 1) continue;
      ctx.fillStyle = `rgba(214,190,140,${0.35 * (1 - t)})`;
      ctx.beginPath();
      ctx.arc((d.x + d.vx * t) * w, (d.y + d.vy * t) * h, 4 + t * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private portrait(img: HTMLImageElement, x: number, y: number, r: number, ring: string): void {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#1c120a";
    ctx.fill();
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

  private glyph(u: Unit, x: number, y: number, dir: number, color: string, alpha: number, fall: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(1.45, 1.45);
    if (fall) ctx.rotate(dir * fall * 1.4);
    ctx.fillStyle = color;
    ctx.strokeStyle = "#2a1a0c";
    ctx.lineWidth = 1;
    if (u === "horse") {
      ctx.beginPath();
      ctx.ellipse(0, 3, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(dir * 1, -3, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dir * 6, 1);
      ctx.lineTo(dir * 9, -2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, -3, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(-2.2, -0.5, 4.4, 6);
      ctx.strokeRect(-2.2, -0.5, 4.4, 6);
      ctx.strokeStyle = "#e9dcc0";
      ctx.beginPath();
      if (u === "spear") {
        ctx.moveTo(dir * 3, 6);
        ctx.lineTo(dir * 6, -9);
      } else ctx.arc(dir * 3, 1, 4.5, -Math.PI / 2, Math.PI / 2, dir < 0);
      ctx.stroke();
    }
    ctx.restore();
  }
}
