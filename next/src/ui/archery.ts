export type Kind = "kabak" | "kurt" | "kartal" | "geyik" | "domuz" | "kaplan";
export type ArchMode = "kabak" | "surek";

interface Tgt {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hit: number;
  t: number;
  hp: number;
  y0: number;
}

interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Pop {
  x: number;
  y: number;
  t: number;
  text: string;
}

export const ARCH_TIME = 30;
export const ARCH_ARROWS = 24;
export const SUREK_TIME = 40;
export const SUREK_ARROWS = 32;
const PTS: Record<Kind, number> = { kabak: 10, kurt: 20, kartal: 35, geyik: 25, domuz: 30, kaplan: 120 };
const SPEED = 950;
const GRAV = 420;
const SCROLL = 230;

export class Archery {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private time = ARCH_TIME;
  private arrows = ARCH_ARROWS;
  private cd = 0;
  private spawn = 0.4;
  private tg: Tgt[] = [];
  private ar: Arrow[] = [];
  private pops: Pop[] = [];
  private raf = 0;
  private last = 0;
  private dist = 0;
  score = 0;
  hits = 0;
  combo = 0;
  done = false;
  kills: Partial<Record<Kind, number>> = {};

  constructor(private cv: HTMLCanvasElement, private onEnd: (score: number, hits: number) => void, private mode: ArchMode = "kabak") {
    if (mode === "surek") {
      this.time = SUREK_TIME;
      this.arrows = SUREK_ARROWS;
    }
    this.ctx = cv.getContext("2d")!;
    this.resize();
    cv.addEventListener("pointerdown", this.onDown);
    window.addEventListener("resize", this.resize);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
    this.cv.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("resize", this.resize);
  }

  private resize = (): void => {
    const r = this.cv.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.cv.width = Math.max(1, Math.round(r.width * dpr));
    this.cv.height = Math.max(1, Math.round(r.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width;
    this.h = r.height;
  };

  private ground(): number {
    return this.h * 0.78;
  }

  private rider(): { x: number; y: number } {
    return { x: this.w * 0.16, y: this.ground() - 46 + Math.abs(Math.sin(this.dist / 38)) * -6 };
  }

  private onDown = (e: PointerEvent): void => {
    const r = this.cv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const t = this.tg.filter((k) => !k.hit && Math.hypot(k.x - x, k.y - y) < k.r + 55).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (t) this.lead(t);
    else this.shootAt(x, y);
  };

  private lead(t: Tgt): void {
    const p = this.rider();
    let tx = t.x;
    let ty = t.y;
    for (let i = 0; i < 3; i++) {
      const k = Math.hypot(tx - p.x, ty - p.y) / SPEED;
      tx = t.x + (t.vx - SCROLL) * k;
      ty = t.y + (t.kind === "kartal" ? Math.cos(t.t * 3) * 40 * k : 0);
    }
    this.shootAt(tx + (Math.random() - 0.5) * 26, ty + (Math.random() - 0.5) * 26);
  }

  shootAt(tx: number, ty: number): void {
    if (this.done || this.cd > 0 || this.arrows <= 0) return;
    const p = this.rider();
    const dx = tx - p.x;
    const dy = ty - p.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    const t = d / SPEED;
    const vy = dy / t - 0.5 * GRAV * t;
    this.ar.push({ x: p.x, y: p.y, vx: dx / t, vy, life: 2 });
    this.arrows--;
    this.cd = 0.45;
  }

  /** En yakın hedefe öngörülü nişan (klavye/gamepad) */
  shootAuto(): void {
    const p = this.rider();
    const live = this.tg.filter((t) => !t.hit && t.x > p.x + 40);
    if (!live.length) return this.shootAt(p.x + 400, p.y - 40);
    live.sort((a, b) => a.x - b.x);
    this.lead(live[0]);
  }

  private add(): void {
    const g = this.ground();
    const r = Math.random();
    const x = this.w + 30;
    const T = (kind: Kind, y: number, vx: number, rad: number, hp = 1, t = 0): Tgt => ({ kind, x, y, vx, vy: 0, r: rad, hit: 0, t, hp, y0: y });
    if (this.mode === "surek") {
      const big = this.tg.some((t) => t.kind === "kaplan" && !t.hit);
      if (r < 0.38) this.tg.push(T("geyik", g - 22, 90 + Math.random() * 70, 22));
      else if (r < 0.62) this.tg.push(T("domuz", g - 12, -90 - Math.random() * 60, 18));
      else if (r < 0.86 || big) this.tg.push(T("kurt", g - 14, 60 + Math.random() * 70, 20));
      else this.tg.push(T("kaplan", g - 20, 70, 28, 3));
      return;
    }
    const kind: Kind = r < 0.55 ? "kabak" : r < 0.82 ? "kurt" : "kartal";
    if (kind === "kabak") this.tg.push(T(kind, g - 120 - Math.random() * 80, 0, 17));
    else if (kind === "kurt") this.tg.push(T(kind, g - 14, 60 + Math.random() * 70, 20));
    else this.tg.push(T(kind, this.h * (0.18 + Math.random() * 0.22), -40 - Math.random() * 60, 16, 1, Math.random() * 6));
  }

  private loop = (now: number): void => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.done) this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private step(dt: number): void {
    this.time -= dt;
    this.cd -= dt;
    this.dist += SCROLL * dt;
    this.spawn -= dt;
    if (this.spawn <= 0) {
      this.add();
      this.spawn = 0.55 + Math.random() * 0.6;
    }
    for (const t of this.tg) {
      t.t += dt;
      t.x += (t.vx - SCROLL) * dt;
      if (t.kind === "kartal") t.y += Math.sin(t.t * 3) * 40 * dt;
      if (t.kind === "geyik" && !t.hit) t.y = t.y0 - Math.abs(Math.sin(t.t * 4)) * 34;
      if (t.hit) t.hit += dt;
    }
    for (const a of this.ar) {
      a.vy += GRAV * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.life -= dt;
      for (const t of this.tg) {
        if (t.hit || Math.hypot(a.x - t.x, a.y - t.y) > t.r + 6) continue;
        a.life = 0;
        this.combo++;
        this.hits++;
        if (--t.hp > 0) {
          t.vx += 40;
          this.pops.push({ x: t.x, y: t.y - 30, t: 0, text: `${"♥".repeat(t.hp)}` });
          break;
        }
        t.hit = 0.01;
        this.kills[t.kind] = (this.kills[t.kind] ?? 0) + 1;
        const mult = 1 + Math.min(4, Math.floor(this.combo / 3)) * 0.5;
        const pts = Math.round(PTS[t.kind] * mult);
        this.score += pts;
        this.pops.push({ x: t.x, y: t.y - 20, t: 0, text: `+${pts}${mult > 1 ? ` ×${mult}` : ""}` });
        break;
      }
      if (a.life > 0 && (a.y > this.ground() + 10 || a.x > this.w + 40)) {
        a.life = 0;
        this.combo = 0;
      }
    }
    this.ar = this.ar.filter((a) => a.life > 0);
    this.tg = this.tg.filter((t) => t.x > -60 && t.hit < 0.6);
    for (const p of this.pops) p.t += dt;
    this.pops = this.pops.filter((p) => p.t < 0.9);
    if (this.time <= 0 || (this.arrows <= 0 && !this.ar.length)) {
      this.done = true;
      this.onEnd(this.score, this.hits);
    }
  }

  private draw(): void {
    const c = this.ctx;
    const { w, h } = this;
    const g = this.ground();
    const sky = c.createLinearGradient(0, 0, 0, g);
    sky.addColorStop(0, "#6aa8d8");
    sky.addColorStop(1, "#f4dca0");
    c.fillStyle = sky;
    c.fillRect(0, 0, w, g);
    c.fillStyle = "rgba(255,240,190,0.9)";
    c.beginPath();
    c.arc(w * 0.78, h * 0.16, 34, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 380 - this.dist * 0.08) % (w + 300) + w + 300) % (w + 300) - 150;
      const cy = h * (0.1 + i * 0.07);
      c.beginPath();
      c.ellipse(cx, cy, 70, 16, 0, 0, Math.PI * 2);
      c.ellipse(cx + 34, cy - 10, 40, 14, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = this.mode === "surek" ? "#5a7a4a" : "#8a9a6a";
    const off = (this.dist * 0.25) % 260;
    c.beginPath();
    c.moveTo(0, g - 40);
    for (let x = -off; x < w + 260; x += 260) {
      c.quadraticCurveTo(x + 65, g - 95, x + 130, g - 40);
      c.quadraticCurveTo(x + 195, g - 70, x + 260, g - 40);
    }
    c.lineTo(w, g);
    c.lineTo(0, g);
    c.fill();
    c.fillStyle = "#c8a466";
    c.fillRect(0, g, w, h - g);
    c.strokeStyle = "rgba(90,60,20,0.35)";
    c.lineWidth = 2;
    const goff = this.dist % 60;
    for (let x = -goff; x < w; x += 60) {
      c.beginPath();
      c.moveTo(x, g + 14);
      c.lineTo(x + 24, g + 14);
      c.stroke();
    }
    for (const t of this.tg) this.drawTarget(t);
    this.drawRider();
    c.strokeStyle = "#3a2410";
    c.lineWidth = 2.5;
    for (const a of this.ar) {
      const d = Math.hypot(a.vx, a.vy);
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(a.x - (a.vx / d) * 22, a.y - (a.vy / d) * 22);
      c.stroke();
    }
    c.textAlign = "center";
    c.font = "bold 20px Georgia, serif";
    for (const p of this.pops) {
      c.globalAlpha = 1 - p.t / 0.9;
      c.fillStyle = "#ffe08a";
      c.strokeStyle = "#2a1606";
      c.lineWidth = 4;
      c.strokeText(p.text, p.x, p.y - p.t * 40);
      c.fillText(p.text, p.x, p.y - p.t * 40);
    }
    c.globalAlpha = 1;
  }

  private drawTarget(t: Tgt): void {
    const c = this.ctx;
    const fade = t.hit ? 1 - t.hit / 0.6 : 1;
    c.globalAlpha = fade;
    if (t.kind === "kabak") {
      c.strokeStyle = "#5a3a1a";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(t.x, t.y + t.r);
      c.lineTo(t.x, this.ground());
      c.stroke();
      c.fillStyle = t.hit ? "#ff9a3a" : "#e8c25a";
      c.beginPath();
      c.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#8a5a1a";
      c.lineWidth = 2;
      c.stroke();
    } else if (t.kind === "geyik" || t.kind === "domuz" || t.kind === "kaplan") {
      this.drawBeast(t);
    } else if (t.kind === "kurt") {
      const leg = Math.sin(t.t * 18) * 6;
      c.fillStyle = "#5a5a62";
      c.beginPath();
      c.ellipse(t.x, t.y, 26, 11, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(t.x - 26, t.y - 7, 11, 7, -0.25, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(t.x - 36, t.y - 6);
      c.lineTo(t.x - 44, t.y - 2);
      c.lineTo(t.x - 34, t.y - 1);
      c.moveTo(t.x - 26, t.y - 12);
      c.lineTo(t.x - 23, t.y - 22);
      c.lineTo(t.x - 19, t.y - 11);
      c.fill();
      c.beginPath();
      c.moveTo(t.x + 24, t.y - 4);
      c.quadraticCurveTo(t.x + 40, t.y - 10 + leg * 0.5, t.x + 44, t.y + 2);
      c.quadraticCurveTo(t.x + 34, t.y - 2, t.x + 24, t.y + 2);
      c.fill();
      c.strokeStyle = "#5a5a62";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(t.x - 12, t.y + 6);
      c.lineTo(t.x - 12 + leg, t.y + 16);
      c.moveTo(t.x + 14, t.y + 6);
      c.lineTo(t.x + 14 - leg, t.y + 16);
      c.stroke();
    } else {
      const flap = Math.sin(t.t * 12) * 10;
      c.strokeStyle = "#3a2a1a";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(t.x - 22, t.y - flap);
      c.quadraticCurveTo(t.x - 8, t.y - 4, t.x, t.y);
      c.quadraticCurveTo(t.x + 8, t.y - 4, t.x + 22, t.y - flap);
      c.stroke();
      c.fillStyle = "#3a2a1a";
      c.beginPath();
      c.arc(t.x, t.y, 5, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }

  private drawBeast(t: Tgt): void {
    const c = this.ctx;
    const leg = Math.sin(t.t * 16) * 6;
    const s = t.kind === "kaplan" ? 1.35 : t.kind === "domuz" ? 0.85 : 1.1;
    const col = t.kind === "geyik" ? "#9a6a3a" : t.kind === "domuz" ? "#3a2e28" : t.hit ? "#ff9a3a" : "#d8802a";
    const dir = t.kind === "domuz" ? 1 : -1;
    c.save();
    c.translate(t.x, t.y);
    c.scale(s * dir, s);
    c.strokeStyle = col;
    c.lineWidth = 3.5;
    c.beginPath();
    c.moveTo(-14, 6);
    c.lineTo(-14 + leg, 20);
    c.moveTo(14, 6);
    c.lineTo(14 - leg, 20);
    c.stroke();
    c.fillStyle = col;
    c.beginPath();
    c.ellipse(0, 0, 24, 11, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(-24, -8, 10, 7, -0.3, 0, Math.PI * 2);
    c.fill();
    if (t.kind === "geyik") {
      c.strokeStyle = "#5a3a1a";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-24, -14);
      c.lineTo(-30, -32);
      c.lineTo(-38, -36);
      c.moveTo(-30, -32);
      c.lineTo(-26, -40);
      c.moveTo(-22, -14);
      c.lineTo(-18, -30);
      c.lineTo(-12, -34);
      c.stroke();
    } else if (t.kind === "domuz") {
      c.strokeStyle = "#f3e6c8";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-31, -4);
      c.lineTo(-36, -12);
      c.stroke();
    } else {
      c.strokeStyle = "#2a1606";
      c.lineWidth = 2.5;
      c.beginPath();
      for (const x of [-12, -4, 4, 12]) {
        c.moveTo(x, -10);
        c.lineTo(x + 3, 2);
      }
      c.moveTo(22, -2);
      c.quadraticCurveTo(36, -14, 40, -4);
      c.stroke();
    }
    c.restore();
    if (t.hp > 1) {
      c.fillStyle = "#ff3a2a";
      c.font = "bold 14px Georgia, serif";
      c.textAlign = "center";
      c.fillText("♥".repeat(t.hp), t.x, t.y - 30);
    }
  }

  private drawRider(): void {
    const c = this.ctx;
    const p = this.rider();
    const g = this.ground();
    const k = this.dist / 30;
    c.fillStyle = "#6a3a1a";
    c.beginPath();
    c.ellipse(p.x, g - 28, 34, 14, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(p.x + 34, g - 44, 9, 16, 0.6, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#6a3a1a";
    c.lineWidth = 5;
    c.beginPath();
    for (const [ox, ph] of [[-22, 0], [-14, 1.6], [18, 3.1], [26, 4.7]]) {
      const s = Math.sin(k + ph) * 10;
      c.moveTo(p.x + ox, g - 20);
      c.lineTo(p.x + ox + s, g);
    }
    c.stroke();
    c.strokeStyle = "#2a1606";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(p.x - 34, g - 30);
    c.quadraticCurveTo(p.x - 50, g - 22 + Math.sin(k) * 5, p.x - 46, g - 10);
    c.stroke();
    c.fillStyle = "#8a2a1a";
    c.fillRect(p.x - 7, p.y - 18, 14, 22);
    c.fillStyle = "#e8c09a";
    c.beginPath();
    c.arc(p.x, p.y - 26, 8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#4a3020";
    c.beginPath();
    c.moveTo(p.x - 9, p.y - 29);
    c.lineTo(p.x, p.y - 44);
    c.lineTo(p.x + 9, p.y - 29);
    c.fill();
    c.strokeStyle = "#5a3a1a";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(p.x + 12, p.y - 10, 18, -1.2, 1.2);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.7)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(p.x + 12 + Math.cos(-1.2) * 18, p.y - 10 + Math.sin(-1.2) * 18);
    c.lineTo(p.x + 12 + Math.cos(1.2) * 18, p.y - 10 + Math.sin(1.2) * 18);
    c.stroke();
  }

  hud(): { time: number; arrows: number; score: number; combo: number } {
    return { time: Math.max(0, this.time), arrows: this.arrows, score: this.score, combo: this.combo };
  }
}
