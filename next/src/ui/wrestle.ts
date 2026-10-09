export interface WrestleFoe {
  name: string;
  pow: number;
  speed: number;
  window: number;
}

export const WR_TIME = 30;

interface Pop {
  text: string;
  t: number;
  good: boolean;
}

/** Kuşak güreşi: salınan ibreyi yeşil alanda yakala, rakibin hamlesine karşı koy. */
export class Wrestle {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private raf = 0;
  private last = 0;
  private time = WR_TIME;
  private needle = 0;
  private dir = 1;
  private cd = 0;
  private atk = 2.5;
  private warn = 0;
  private pops: Pop[] = [];
  private shake = 0;
  bal = 0;
  perfect = 0;
  done = false;

  constructor(private cv: HTMLCanvasElement, private foe: WrestleFoe, private str: number, private onEnd: (win: boolean, bal: number, perfect: number) => void) {
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

  private onDown = (): void => this.press();

  private zone(): number {
    return Math.min(0.32, 0.14 + this.str * 0.012);
  }

  press(): void {
    if (this.done || this.cd > 0) return;
    this.cd = 0.3;
    if (this.warn > 0) {
      this.warn = 0;
      this.atk = 1.8 + Math.random() * 2;
      this.bal = Math.min(100, this.bal + 6);
      this.pop("Karşılandı!", true);
      return;
    }
    const off = Math.abs(this.needle - 0.5);
    const z = this.zone() / 2;
    if (off <= z) {
      const acc = 1 - off / z;
      const p = 9 + acc * 14 + this.str * 0.9;
      this.bal = Math.min(100, this.bal + p);
      if (acc > 0.75) {
        this.perfect++;
        this.pop("Kusursuz çapraz!", true);
      } else this.pop("Kuşaktan çektin", true);
      this.shake = 0.15;
    } else {
      this.bal = Math.max(-100, this.bal - 8);
      this.pop("Boşa çıktı", false);
    }
    this.check();
  }

  private pop(text: string, good: boolean): void {
    this.pops.push({ text, t: 0, good });
  }

  private check(): void {
    if (this.done) return;
    if (this.bal >= 100 || this.bal <= -100 || this.time <= 0) {
      this.done = true;
      this.onEnd(this.bal > 0, Math.round(this.bal), this.perfect);
    }
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
    this.shake = Math.max(0, this.shake - dt);
    this.needle += this.dir * this.foe.speed * dt;
    if (this.needle > 1) (this.needle = 1), (this.dir = -1);
    if (this.needle < 0) (this.needle = 0), (this.dir = 1);
    this.bal = Math.max(-100, this.bal - this.foe.pow * 0.25 * dt);
    if (this.warn > 0) {
      this.warn -= dt;
      if (this.warn <= 0) {
        this.bal = Math.max(-100, this.bal - this.foe.pow);
        this.pop(`${this.foe.name} seni sarstı!`, false);
        this.shake = 0.3;
        this.atk = 1.8 + Math.random() * 2;
      }
    } else {
      this.atk -= dt;
      if (this.atk <= 0) this.warn = this.foe.window;
    }
    for (const p of this.pops) p.t += dt;
    this.pops = this.pops.filter((p) => p.t < 1);
    this.check();
  }

  private draw(): void {
    const c = this.ctx;
    const { w, h } = this;
    const bg = c.createRadialGradient(w / 2, h * 0.55, 40, w / 2, h * 0.55, Math.max(w, h));
    bg.addColorStop(0, "#e8cf96");
    bg.addColorStop(1, "#6a4a22");
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#00000022";
    c.beginPath();
    c.ellipse(w / 2, h * 0.7, Math.min(w * 0.42, 340), 50, 0, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 9; i++) {
      const x = (w / 8) * i;
      c.fillStyle = "#5a3a1a";
      c.beginPath();
      c.moveTo(x - 30, h * 0.36);
      c.lineTo(x, h * 0.22);
      c.lineTo(x + 30, h * 0.36);
      c.fill();
      c.fillStyle = "#c8a466";
      c.fillRect(x - 26, h * 0.36, 52, 26);
    }
    const sx = (this.shake > 0 ? (Math.random() - 0.5) * 8 : 0);
    const cx = w / 2 + (this.bal / 100) * Math.min(w * 0.18, 120) + sx;
    const ground = h * 0.7;
    const lean = this.bal / 400;
    const k = Math.max(1, Math.min(1.8, h / 480));
    this.drawMan(cx - 40 * k, ground, 1, "#8a2a1a", -lean, k);
    this.drawMan(cx + 40 * k, ground, -1, "#2a4a8a", -lean, k);
    if (this.warn > 0) {
      c.fillStyle = "#ff3a2a";
      c.font = "bold 46px Georgia, serif";
      c.textAlign = "center";
      c.fillText("!", cx + 40 * k, ground - 165 * k);
    }
    const mw = Math.min(w * 0.8, 520);
    const mx = (w - mw) / 2;
    const my = h * 0.84;
    c.fillStyle = "#2a1606cc";
    c.fillRect(mx - 4, my - 4, mw + 8, 30);
    c.fillStyle = "#7a2a1a";
    c.fillRect(mx, my, mw, 22);
    const z = this.zone();
    c.fillStyle = "#4a9a3a";
    c.fillRect(mx + mw * (0.5 - z / 2), my, mw * z, 22);
    c.fillStyle = "#9be08a";
    c.fillRect(mx + mw * (0.5 - z / 8), my, mw * (z / 4), 22);
    c.fillStyle = "#fff";
    c.fillRect(mx + mw * this.needle - 3, my - 6, 6, 34);
    const bw = Math.min(w * 0.8, 520);
    const bx = (w - bw) / 2;
    const by = h * 0.1;
    c.fillStyle = "#2a1606cc";
    c.fillRect(bx - 4, by - 4, bw + 8, 22);
    c.fillStyle = "#2a4a8a";
    c.fillRect(bx, by, bw, 14);
    c.fillStyle = "#c83a2a";
    c.fillRect(bx, by, bw * ((this.bal + 100) / 200), 14);
    c.fillStyle = "#fff";
    c.fillRect(bx + bw / 2 - 1, by - 3, 2, 20);
    c.textAlign = "center";
    c.font = "bold 22px Georgia, serif";
    for (const p of this.pops) {
      c.globalAlpha = 1 - p.t;
      c.fillStyle = p.good ? "#ffe08a" : "#ff9a7a";
      c.strokeStyle = "#2a1606";
      c.lineWidth = 4;
      c.strokeText(p.text, w / 2, h * 0.32 - p.t * 30);
      c.fillText(p.text, w / 2, h * 0.32 - p.t * 30);
    }
    c.globalAlpha = 1;
  }

  private drawMan(x: number, g: number, face: number, col: string, lean: number, k: number): void {
    const c = this.ctx;
    c.save();
    c.translate(x, g);
    c.scale(k, k);
    c.rotate(lean * face + face * 0.22);
    c.strokeStyle = "#e8c09a";
    c.lineWidth = 9;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8 * face, -50);
    c.lineTo(-16 * face, 0);
    c.moveTo(4 * face, -50);
    c.lineTo(10 * face, 0);
    c.stroke();
    c.fillStyle = col;
    c.fillRect(-14, -62, 28, 18);
    c.fillStyle = "#e8c09a";
    c.beginPath();
    c.ellipse(0, -88, 20, 28, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#c8a466";
    c.fillRect(-16, -66, 32, 6);
    c.fillStyle = "#d8b08a";
    c.beginPath();
    c.arc(8 * face, -126, 12, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#e8c09a";
    c.beginPath();
    c.moveTo(10 * face, -104);
    c.lineTo(34 * face, -76);
    c.stroke();
    c.restore();
  }

  hud(): { time: number; bal: number; perfect: number } {
    return { time: Math.max(0, this.time), bal: Math.round(this.bal), perfect: this.perfect };
  }
}
