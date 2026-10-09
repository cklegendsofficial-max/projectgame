import { audio } from "../audio";

export type Realm = "ust" | "alt";

export interface SpiritOpt {
  id: string;
  name: string;
  text: string;
  off?: string | null;
}

interface Mote {
  x: number;
  y: number;
  v: number;
  r: number;
  ph: number;
}

/** Kam ayini: davul transı, Üst Dünya (Ülgen, Bay Terek) ve Alt Dünya (Erlik) sahneleri. */
export class SpiritView {
  private el: HTMLDivElement;
  private cv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private box: HTMLDivElement;
  private raf = 0;
  private realm: Realm | "drum" = "drum";
  private t0 = performance.now();
  private motes: Mote[] = [];
  private tree: [number, number, number, number, number][] = [];

  constructor(root: HTMLElement) {
    this.el = document.createElement("div");
    this.el.className = "spirit";
    this.el.innerHTML = `<canvas></canvas><div class="spbox"></div>`;
    root.appendChild(this.el);
    this.cv = this.el.querySelector("canvas")!;
    this.ctx = this.cv.getContext("2d")!;
    this.box = this.el.querySelector(".spbox")!;
    for (let i = 0; i < 120; i++) this.motes.push({ x: Math.random(), y: Math.random(), v: 0.02 + Math.random() * 0.05, r: 0.6 + Math.random() * 2, ph: Math.random() * 6 });
    this.growTree(0, 0, -Math.PI / 2, 0.34, 0);
    const loop = () => {
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Bay Terek: dokuz kat göğe uzanan kayın ağacının dalları (normalize koordinatlar). */
  private growTree(x: number, y: number, a: number, len: number, d: number): void {
    const x1 = x + Math.cos(a) * len;
    const y1 = y + Math.sin(a) * len;
    this.tree.push([x, y, x1, y1, d]);
    if (d >= 7) return;
    const n = d < 2 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * (0.5 + Math.random() * 0.25);
      this.growTree(x1, y1, a + spread, len * (0.66 + Math.random() * 0.1), d + 1);
    }
  }

  setRealm(r: Realm | "drum"): void {
    this.realm = r;
    this.t0 = performance.now();
    this.el.classList.toggle("ust", r === "ust");
    this.el.classList.toggle("alt", r === "alt");
  }

  panel(title: string, html: string, btns: { label: string; cls?: string; fn: () => void }[]): void {
    this.box.innerHTML = `<h2>${title}</h2><div class="sptext">${html}</div><div class="spbtns">${btns.map((b, i) => `<button class="btn ${b.cls ?? ""}" data-i="${i}">${b.label}</button>`).join("")}</div>`;
    this.box.classList.remove("in");
    void this.box.offsetWidth;
    this.box.classList.add("in");
    this.box.querySelectorAll<HTMLButtonElement>("button").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.classList.contains("off")) return;
        audio.play("click");
        btns[+b.dataset.i!].fn();
      }),
    );
  }

  close(): void {
    cancelAnimationFrame(this.raf);
    this.el.classList.add("out");
    setTimeout(() => this.el.remove(), 600);
  }

  private draw(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = this.cv.clientWidth;
    const h = this.cv.clientHeight;
    if (this.cv.width !== Math.round(w * dpr)) {
      this.cv.width = Math.round(w * dpr);
      this.cv.height = Math.round(h * dpr);
    }
    const g = this.ctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const now = performance.now();
    const t = (now - this.t0) / 1000;
    const T = now / 1000;
    const beat = Math.pow(Math.max(0, Math.sin(T * Math.PI * 2 * 1.1)), 12);
    const r = this.realm;
    const bg = g.createLinearGradient(0, 0, 0, h);
    if (r === "ust") {
      bg.addColorStop(0, "#050b2a");
      bg.addColorStop(0.55, "#1a3a7a");
      bg.addColorStop(1, "#7fb2d8");
    } else if (r === "alt") {
      bg.addColorStop(0, "#12020c");
      bg.addColorStop(0.6, "#3a0a24");
      bg.addColorStop(1, "#6a1a10");
    } else {
      bg.addColorStop(0, "#0a0604");
      bg.addColorStop(1, "#2a1408");
    }
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    const fade = Math.min(1, t / 1.2);
    if (r === "ust") {
      g.globalAlpha = fade;
      for (let k = 0; k < 9; k++) {
        g.strokeStyle = `rgba(200,225,255,${0.05 + 0.03 * Math.sin(T + k)})`;
        g.lineWidth = 1.5;
        g.beginPath();
        g.ellipse(w / 2, h * 0.95, w * (0.15 + k * 0.1), h * (0.08 + k * 0.1), 0, Math.PI, Math.PI * 2);
        g.stroke();
      }
      for (const m of this.motes) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(T * 1.5 + m.ph));
        g.fillStyle = `rgba(255,250,220,${tw * 0.9})`;
        g.beginPath();
        g.arc(m.x * w, (m.y * h * 0.7) % h, m.r * 0.8, 0, Math.PI * 2);
        g.fill();
      }
      const s = Math.min(w, h) * 1.15;
      const grow = Math.min(1, t / 2.2);
      g.lineCap = "round";
      for (const [x0, y0, x1, y1, d] of this.tree) {
        if (d / 8 > grow) continue;
        g.strokeStyle = d < 3 ? "#f2efe6" : `rgba(190,240,170,${0.85 - d * 0.06})`;
        g.lineWidth = Math.max(1, (8 - d) * 2.2) * (s / 900);
        g.shadowColor = "#bfe8ff";
        g.shadowBlur = 12;
        g.beginPath();
        g.moveTo(w / 2 + x0 * s, h + y0 * s);
        g.lineTo(w / 2 + x1 * s, h + y1 * s);
        g.stroke();
      }
      g.shadowBlur = 0;
      const sun = g.createRadialGradient(w / 2, h * 0.12, 0, w / 2, h * 0.12, h * 0.3);
      sun.addColorStop(0, `rgba(255,248,210,${0.8 + beat * 0.2})`);
      sun.addColorStop(1, "rgba(255,248,210,0)");
      g.fillStyle = sun;
      g.fillRect(0, 0, w, h * 0.5);
      g.globalAlpha = 1;
    } else if (r === "alt") {
      g.globalAlpha = fade;
      for (let k = 0; k < 4; k++) {
        g.fillStyle = `rgba(${20 + k * 10},${4 + k * 2},${12 + k * 4},0.9)`;
        g.beginPath();
        g.moveTo(0, h);
        for (let x = 0; x <= w; x += 30) g.lineTo(x, h * (0.55 + k * 0.12) + Math.sin(x * 0.013 + k * 2) * 40 + Math.sin(x * 0.05 + k) * 12);
        g.lineTo(w, h);
        g.fill();
        g.beginPath();
        g.moveTo(0, 0);
        for (let x = 0; x <= w; x += 26) g.lineTo(x, h * (0.08 + k * 0.05) + Math.abs(Math.sin(x * 0.021 + k)) * 60);
        g.lineTo(w, 0);
        g.fill();
      }
      for (const m of this.motes) {
        const y = (1 - ((m.y + T * m.v) % 1)) * h;
        g.fillStyle = `rgba(255,${90 + m.r * 30},40,${0.5 + 0.5 * Math.sin(T * 3 + m.ph)})`;
        g.fillRect(m.x * w + Math.sin(T + m.ph) * 8, y, m.r, m.r);
      }
      const eye = 0.55 + 0.45 * Math.sin(T * 0.9);
      for (const dx of [-1, 1]) {
        const ex = w / 2 + dx * Math.min(w, h) * 0.09;
        const ey = h * 0.36;
        const gl = g.createRadialGradient(ex, ey, 0, ex, ey, 46);
        gl.addColorStop(0, `rgba(255,60,120,${eye})`);
        gl.addColorStop(0.3, `rgba(200,20,90,${eye * 0.4})`);
        gl.addColorStop(1, "rgba(200,20,90,0)");
        g.fillStyle = gl;
        g.fillRect(ex - 46, ey - 46, 92, 92);
        g.fillStyle = `rgba(255,220,230,${eye})`;
        g.beginPath();
        g.ellipse(ex, ey, 9, 3.5, dx * 0.2, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    } else {
      const fire = g.createRadialGradient(w / 2, h * 0.75, 0, w / 2, h * 0.75, h * 0.6);
      fire.addColorStop(0, `rgba(255,150,60,${0.55 + 0.1 * Math.sin(T * 9)})`);
      fire.addColorStop(1, "rgba(255,120,40,0)");
      g.fillStyle = fire;
      g.fillRect(0, 0, w, h);
      const R = Math.min(w, h) * (0.16 + beat * 0.012);
      g.save();
      g.translate(w / 2, h * 0.42);
      g.fillStyle = "#c9a46a";
      g.strokeStyle = "#5a3a18";
      g.lineWidth = 4;
      g.beginPath();
      g.ellipse(0, 0, R, R * 1.18, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.strokeStyle = "#7a2a14";
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-R * 0.8, 0);
      g.lineTo(R * 0.8, 0);
      g.moveTo(0, -R);
      g.lineTo(0, R);
      g.stroke();
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        g.fillStyle = "#7a2a14";
        g.beginPath();
        g.arc(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.6, R * 0.09, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      g.strokeStyle = `rgba(255,220,160,${beat * 0.6})`;
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(w / 2, h * 0.42, R * (1.2 + beat * 0.4), R * 1.4 * (1.2 + beat * 0.4), 0, 0, Math.PI * 2);
      g.stroke();
    }
    const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, `rgba(0,0,0,${0.6 + beat * 0.15})`);
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
  }
}
