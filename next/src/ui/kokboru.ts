export const KB_TIME = 40;
const LANES = 3;

interface Rider {
  lane: number;
  x: number;
  v: number;
  t: number;
}

interface Pop {
  text: string;
  t: number;
  good: boolean;
}

/** Kökbörü: oğlağı kap, rakip atlılardan kaçarak kale yurduna ulaştır. */
export class KokBoru {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private raf = 0;
  private last = 0;
  private time = KB_TIME;
  private lane = 1;
  private y = 1;
  private riders: Rider[] = [];
  private spawn = 1;
  private stun = 0;
  private dist = 0;
  private pops: Pop[] = [];
  progress = 0;
  goals = 0;
  lost = 0;
  done = false;

  constructor(private cv: HTMLCanvasElement, private skill: number, private onEnd: (goals: number, lost: number) => void) {
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

  private laneY(l: number): number {
    const top = this.h * 0.38;
    const bot = this.h * 0.86;
    return top + ((bot - top) * (l + 0.5)) / LANES;
  }

  private onDown = (e: PointerEvent): void => {
    const r = this.cv.getBoundingClientRect();
    this.move(e.clientY - r.top < this.laneY(this.lane) ? -1 : 1);
  };

  move(d: number): void {
    if (this.done) return;
    this.lane = Math.max(0, Math.min(LANES - 1, this.lane + d));
  }

  /** En güvenli kulvara kaç (klavye/gamepad tek tuş) */
  dodge(): void {
    const px = this.w * 0.2;
    const near = (l: number) => Math.min(9999, ...this.riders.filter((r) => r.lane === l && r.x > px - 30).map((r) => r.x - px));
    const opts = [this.lane - 1, this.lane, this.lane + 1].filter((l) => l >= 0 && l < LANES);
    opts.sort((a, b) => near(b) - near(a));
    this.lane = opts[0];
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
    this.y += (this.lane - this.y) * Math.min(1, dt * 12);
    const speed = this.stun > 0 ? 0 : 0.11 + this.skill * 0.004;
    this.stun = Math.max(0, this.stun - dt);
    this.progress += speed * dt;
    this.dist += (this.stun > 0 ? 120 : 320) * dt;
    if (this.progress >= 1) {
      this.goals++;
      this.progress = 0;
      this.riders = [];
      this.spawn = 1.2;
      this.pops.push({ text: "Oğlak kazana! +1", t: 0, good: true });
    }
    this.spawn -= dt;
    if (this.spawn <= 0) {
      const busy = new Set(this.riders.filter((r) => r.x > this.w * 0.75).map((r) => r.lane));
      const free = [0, 1, 2].filter((l) => !busy.has(l));
      if (free.length > 1) {
        const lane = free[Math.floor(Math.random() * free.length)];
        this.riders.push({ lane, x: this.w + 40, v: 260 + Math.random() * 120 + this.goals * 25, t: 0 });
      }
      this.spawn = Math.max(0.35, 0.95 - this.goals * 0.08) * (0.7 + Math.random() * 0.6);
    }
    const px = this.w * 0.2;
    for (const r of this.riders) {
      r.t += dt;
      r.x -= (r.v + (this.stun > 0 ? 0 : 200)) * dt;
      if (this.stun <= 0 && r.lane === this.lane && Math.abs(this.y - this.lane) < 0.35 && Math.abs(r.x - px) < 34) {
        this.stun = 1;
        this.lost++;
        this.progress = Math.max(0, this.progress - 0.35);
        this.pops.push({ text: "Oğlağı kaptırdın!", t: 0, good: false });
      }
    }
    this.riders = this.riders.filter((r) => r.x > -60);
    for (const p of this.pops) p.t += dt;
    this.pops = this.pops.filter((p) => p.t < 1.1);
    if (this.time <= 0) {
      this.done = true;
      this.onEnd(this.goals, this.lost);
    }
  }

  private draw(): void {
    const c = this.ctx;
    const { w, h } = this;
    const sky = c.createLinearGradient(0, 0, 0, h * 0.38);
    sky.addColorStop(0, "#7ab0d8");
    sky.addColorStop(1, "#f0dca8");
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h * 0.38);
    c.fillStyle = "#9aa86a";
    c.fillRect(0, h * 0.3, w, h * 0.08);
    c.fillStyle = "#c8b070";
    c.fillRect(0, h * 0.38, w, h * 0.62);
    c.strokeStyle = "rgba(90,60,20,.25)";
    c.lineWidth = 2;
    for (let l = 1; l < LANES; l++) {
      const y = (this.laneY(l - 1) + this.laneY(l)) / 2;
      c.setLineDash([18, 14]);
      c.lineDashOffset = this.dist;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
    c.setLineDash([]);
    const gx = w * 0.2 + (w * 0.75) * (1 - this.progress) + 40;
    if (gx < w + 60) {
      c.fillStyle = "#f3e6c8";
      c.beginPath();
      c.arc(gx, h * 0.62, 34, Math.PI, 0);
      c.fill();
      c.fillStyle = "#8a2a1a";
      c.fillRect(gx - 34, h * 0.62, 68, 10);
    }
    const items = [...this.riders.map((r) => ({ y: this.laneY(r.lane), f: () => this.horse(r.x, this.laneY(r.lane), "#2a4a8a", -1, r.t, false) })), { y: this.laneY(this.y), f: () => this.horse(w * 0.2, this.laneY(this.y), "#8a2a1a", 1, this.dist / 60, this.stun <= 0) }];
    items.sort((a, b) => a.y - b.y).forEach((i) => i.f());
    const bw = Math.min(w * 0.7, 460);
    const bx = (w - bw) / 2;
    c.fillStyle = "#2a1606cc";
    c.fillRect(bx - 4, h * 0.05 - 4, bw + 8, 20);
    c.fillStyle = "#e8c25a";
    c.fillRect(bx, h * 0.05, bw * this.progress, 12);
    c.textAlign = "center";
    c.font = "bold 22px Georgia, serif";
    for (const p of this.pops) {
      c.globalAlpha = Math.max(0, 1 - p.t / 1.1);
      c.fillStyle = p.good ? "#ffe08a" : "#ff9a7a";
      c.strokeStyle = "#2a1606";
      c.lineWidth = 4;
      c.strokeText(p.text, w / 2, h * 0.26 - p.t * 30);
      c.fillText(p.text, w / 2, h * 0.26 - p.t * 30);
    }
    c.globalAlpha = 1;
  }

  private horse(x: number, y: number, col: string, face: number, t: number, goat: boolean): void {
    const c = this.ctx;
    const k = t * 6;
    c.fillStyle = "#00000022";
    c.beginPath();
    c.ellipse(x, y + 4, 34, 7, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#5a3418";
    c.lineWidth = 5;
    c.beginPath();
    for (const [ox, ph] of [[-20, 0], [-12, 1.6], [16, 3.1], [24, 4.7]]) {
      c.moveTo(x + ox * face, y - 16);
      c.lineTo(x + ox * face + Math.sin(k + ph) * 9 * face, y + 2);
    }
    c.stroke();
    c.fillStyle = "#6a3a1a";
    c.beginPath();
    c.ellipse(x, y - 24, 30, 12, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(x + 30 * face, y - 38, 8, 14, 0.6 * face, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = col;
    c.fillRect(x - 6, y - 56, 12, 20);
    c.fillStyle = "#e8c09a";
    c.beginPath();
    c.arc(x, y - 63, 7, 0, Math.PI * 2);
    c.fill();
    if (goat) {
      c.fillStyle = "#d8d0c0";
      c.beginPath();
      c.ellipse(x + 10, y - 40, 14, 6, -0.3, 0, Math.PI * 2);
      c.fill();
    }
  }

  hud(): { time: number; goals: number; progress: number } {
    return { time: Math.max(0, this.time), goals: this.goals, progress: this.progress };
  }
}
