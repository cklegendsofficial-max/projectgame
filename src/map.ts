import mapUrl from "./assets/map.webp";
import { CITIES, CITY_BY_ID, ROUTES } from "./data";
import { tripTime } from "./economy";
import type { MapEvent } from "./events";
import { fmt } from "./format";
import { t, tk } from "./i18n";
import type { GameState } from "./state";

interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  born: number;
  life: number;
  big: boolean;
}

interface Pt {
  x: number;
  y: number;
}

const mapImage = new Image();
mapImage.src = mapUrl;

const cityUrls = import.meta.glob<string>("./assets/cities/*.webp", { eager: true, query: "?url", import: "default" });
const cityImages: Record<string, HTMLImageElement> = {};
for (const [path, url] of Object.entries(cityUrls)) {
  const img = new Image();
  img.src = url;
  cityImages[path.split("/").pop()!.replace(".webp", "")] = img;
}

export type MapHit = { type: "event"; id: number } | { type: "route"; route: number } | null;

function mulberry(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export class MapView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bg: HTMLCanvasElement;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private scale = 1;
  private floaters: Floater[] = [];
  private lastFloatAt: number[] = ROUTES.map(() => 0);
  private hover: MapHit = null;
  highlightRoute = -1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    this.ctx = ctx;
    this.bg = document.createElement("canvas");
    if (!mapImage.complete) mapImage.addEventListener("load", () => this.w > 0 && this.renderBackground());
    canvas.addEventListener("mousemove", (e) => {
      this.hover = this.hitTestClient(e.clientX, e.clientY, this.lastState, this.lastEvents);
      canvas.style.cursor = this.hover ? "pointer" : "default";
    });
    canvas.addEventListener("mouseleave", () => {
      this.hover = null;
    });
  }

  private lastState: GameState | null = null;
  private lastEvents: MapEvent[] = [];

  resize(): void {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    const w = Math.max(200, Math.floor(rect.width));
    const h = Math.max(150, Math.floor(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.scale = Math.min(w / 900, h / 520) * 1.0 + 0.25;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.renderBackground();
  }

  private px(x: number, y: number): Pt {
    const padX = this.w * 0.04;
    const padY = this.h * 0.08;
    return { x: padX + x * (this.w - padX * 2), y: padY + y * (this.h - padY * 2) };
  }

  private cityPt(id: string): Pt {
    const c = CITY_BY_ID[id];
    return this.px(c.x, c.y);
  }

  private routeCtrl(i: number): { a: Pt; c: Pt; b: Pt } {
    const def = ROUTES[i];
    const a = this.cityPt(def.from);
    const b = this.cityPt(def.to);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return { a, b, c: { x: mx - dy * def.bend, y: my + dx * def.bend } };
  }

  routePoint(i: number, tt: number): Pt & { dx: number } {
    const { a, b, c } = this.routeCtrl(i);
    const u = 1 - tt;
    const x = u * u * a.x + 2 * u * tt * c.x + tt * tt * b.x;
    const y = u * u * a.y + 2 * u * tt * c.y + tt * tt * b.y;
    const dx = 2 * u * (c.x - a.x) + 2 * tt * (b.x - c.x);
    return { x, y, dx };
  }

  eventPoint(e: MapEvent): Pt {
    if (e.kind === "merchant" && e.city) {
      const p = this.cityPt(e.city);
      return { x: p.x, y: p.y - 34 * this.scale };
    }
    const p = this.routePoint(e.route, e.t);
    return { x: p.x, y: p.y - 6 * this.scale };
  }

  private renderBackground(): void {
    const c = this.bg;
    c.width = this.w * this.dpr;
    c.height = this.h * this.dpr;
    const g = c.getContext("2d")!;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const W = this.w;
    const H = this.h;
    if (mapImage.complete && mapImage.naturalWidth > 0) {
      g.imageSmoothingQuality = "high";
      g.drawImage(mapImage, 0, 0, W, H);
      this.drawFrame(g, W, H);
      return;
    }
    const rnd = mulberry(1337);

    const grad = g.createRadialGradient(W * 0.5, H * 0.45, 10, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
    grad.addColorStop(0, "#f0dcae");
    grad.addColorStop(0.7, "#dfc28a");
    grad.addColorStop(1, "#b8955a");
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    for (let i = 0; i < (W * H) / 90; i++) {
      g.fillStyle = `rgba(90,60,20,${rnd() * 0.06})`;
      g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 1.5, 1 + rnd() * 1.5);
    }

    const blob = (pts: [number, number][], fill: string, stroke?: string) => {
      g.beginPath();
      const P = pts.map(([x, y]) => ({ x: x * W, y: y * H }));
      g.moveTo((P[0].x + P[P.length - 1].x) / 2, (P[0].y + P[P.length - 1].y) / 2);
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const n = P[(i + 1) % P.length];
        g.quadraticCurveTo(p.x, p.y, (p.x + n.x) / 2, (p.y + n.y) / 2);
      }
      g.closePath();
      g.fillStyle = fill;
      g.fill();
      if (stroke) {
        g.strokeStyle = stroke;
        g.lineWidth = 2;
        g.stroke();
      }
    };

    const deserts: [number, number, number, number][] = [
      [0.68, 0.76, 0.1, 0.07],
      [0.76, 0.28, 0.08, 0.06],
      [0.97, 0.45, 0.07, 0.1],
      [0.53, 0.66, 0.08, 0.06],
      [0.24, 0.72, 0.07, 0.05],
    ];
    for (const [x, y, rx, ry] of deserts) {
      const gg = g.createRadialGradient(x * W, y * H, 2, x * W, y * H, Math.max(rx * W, ry * H));
      gg.addColorStop(0, "rgba(214,170,98,0.55)");
      gg.addColorStop(1, "rgba(214,170,98,0)");
      g.fillStyle = gg;
      g.beginPath();
      g.ellipse(x * W, y * H, rx * W, ry * H, 0, 0, Math.PI * 2);
      g.fill();
      for (let k = 0; k < 40; k++) {
        const a = rnd() * Math.PI * 2;
        const r = Math.sqrt(rnd());
        g.strokeStyle = "rgba(150,105,45,0.25)";
        g.lineWidth = 1;
        const sx = x * W + Math.cos(a) * r * rx * W;
        const sy = y * H + Math.sin(a) * r * ry * H;
        g.beginPath();
        g.moveTo(sx - 4, sy);
        g.quadraticCurveTo(sx, sy - 3, sx + 4, sy);
        g.stroke();
      }
    }

    const sea = "#86b7c8";
    const seaStroke = "#4f7f92";
    blob([[0.11, 0.1], [0.2, 0.07], [0.31, 0.12], [0.29, 0.21], [0.2, 0.24], [0.12, 0.2]], sea, seaStroke);
    blob([[0.43, 0.1], [0.48, 0.12], [0.5, 0.24], [0.52, 0.36], [0.47, 0.42], [0.43, 0.3], [0.44, 0.2]], sea, seaStroke);
    blob([[0.6, 0.18], [0.65, 0.17], [0.66, 0.25], [0.61, 0.27]], sea, seaStroke);
    blob([[-0.05, 0.55], [0.08, 0.6], [0.13, 0.72], [0.1, 0.9], [0.04, 1.08], [-0.05, 1.08]], sea, seaStroke);
    blob([[0.47, 0.86], [0.55, 0.88], [0.6, 0.96], [0.62, 1.1], [0.45, 1.1]], sea, seaStroke);

    g.strokeStyle = "rgba(255,255,255,0.35)";
    g.lineWidth = 1;
    const waves: [number, number][] = [[0.2, 0.15], [0.47, 0.25], [0.04, 0.8], [0.53, 0.97], [0.15, 0.18], [0.46, 0.33]];
    for (const [x, y] of waves) {
      for (let k = 0; k < 2; k++) {
        const sx = x * W + k * 10;
        const sy = y * H + k * 7;
        g.beginPath();
        g.moveTo(sx - 6, sy);
        g.quadraticCurveTo(sx - 3, sy - 3, sx, sy);
        g.quadraticCurveTo(sx + 3, sy + 3, sx + 6, sy);
        g.stroke();
      }
    }

    const mountain = (x: number, y: number, s: number) => {
      const X = x * W;
      const Y = y * H;
      const S = s * Math.min(W, H) * 0.035;
      g.beginPath();
      g.moveTo(X - S, Y);
      g.lineTo(X, Y - S * 1.2);
      g.lineTo(X + S, Y);
      g.closePath();
      g.fillStyle = "#a07a4a";
      g.fill();
      g.beginPath();
      g.moveTo(X, Y - S * 1.2);
      g.lineTo(X + S, Y);
      g.lineTo(X + S * 0.2, Y);
      g.closePath();
      g.fillStyle = "#7d5a32";
      g.fill();
      g.beginPath();
      g.moveTo(X - S * 0.32, Y - S * 0.8);
      g.lineTo(X, Y - S * 1.2);
      g.lineTo(X + S * 0.32, Y - S * 0.8);
      g.closePath();
      g.fillStyle = "#f4ead6";
      g.fill();
    };
    const ranges: [number, number, number, number, number][] = [
      [0.27, 0.27, 0.37, 0.25, 5],
      [0.37, 0.58, 0.44, 0.8, 6],
      [0.93, 0.48, 0.95, 0.66, 4],
      [0.76, 0.7, 0.86, 0.66, 5],
      [0.12, 0.64, 0.25, 0.62, 5],
      [0.5, 0.41, 0.56, 0.4, 3],
      [0.8, 0.1, 0.86, 0.12, 3],
    ];
    for (const [x1, y1, x2, y2, n] of ranges) {
      for (let k = 0; k < n; k++) {
        const f = n === 1 ? 0 : k / (n - 1);
        mountain(x1 + (x2 - x1) * f + (rnd() - 0.5) * 0.015, y1 + (y2 - y1) * f + (rnd() - 0.5) * 0.02, 0.8 + rnd() * 0.6);
      }
    }

    this.drawFrame(g, W, H);
  }

  private drawFrame(g: CanvasRenderingContext2D, W: number, H: number): void {
    const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, "rgba(60,35,10,0)");
    vg.addColorStop(1, "rgba(60,35,10,0.45)");
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);

    g.strokeStyle = "rgba(90,55,20,0.6)";
    g.lineWidth = 3;
    g.strokeRect(6, 6, W - 12, H - 12);
    g.strokeStyle = "rgba(90,55,20,0.3)";
    g.lineWidth = 1;
    g.strokeRect(11, 11, W - 22, H - 22);

    this.drawCompass(g, W - 46, H - 50, 26);
  }

  private drawCompass(g: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    g.save();
    g.translate(x, y);
    g.globalAlpha = 0.6;
    g.strokeStyle = "#6b4a22";
    g.fillStyle = "#6b4a22";
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    g.stroke();
    for (let k = 0; k < 4; k++) {
      g.rotate(Math.PI / 2);
      g.beginPath();
      g.moveTo(0, -r);
      g.lineTo(r * 0.16, 0);
      g.lineTo(-r * 0.16, 0);
      g.closePath();
      g.fill();
    }
    g.font = `bold ${Math.round(r * 0.45)}px Georgia, serif`;
    g.textAlign = "center";
    g.fillText("N", 0, -r - 4);
    g.restore();
  }

  addFloater(route: number, amount: number, now: number, force = false): void {
    if (!force && now - this.lastFloatAt[route] < 450) return;
    this.lastFloatAt[route] = now;
    const s = this.lastState;
    const trips = s ? s.routes[route].trips : 0;
    const dest = trips % 2 === 1 ? ROUTES[route].to : ROUTES[route].from;
    const p = this.cityPt(dest);
    this.floaters.push({ x: p.x, y: p.y - 18 * this.scale, text: "+" + fmt(amount), color: "#ffd75e", born: now, life: 1300, big: false });
    if (this.floaters.length > 40) this.floaters.shift();
  }

  addTextAt(p: Pt, text: string, color: string, now: number): void {
    this.floaters.push({ x: p.x, y: p.y, text, color, born: now, life: 1800, big: true });
  }

  private cityVisible(s: GameState, id: string): number {
    let best = 0;
    for (let i = 0; i < ROUTES.length; i++) {
      const def = ROUTES[i];
      if (def.from !== id && def.to !== id) continue;
      if (s.routes[i].owned > 0) return 1;
      if (i === 0 || s.routes[i - 1].owned > 0) best = Math.max(best, 0.6);
    }
    return best || 0.28;
  }

  draw(s: GameState, events: MapEvent[], now: number): void {
    this.lastState = s;
    this.lastEvents = events;
    const g = this.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(this.bg, 0, 0);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const sc = this.scale;
    const time = now / 1000;

    for (let i = 0; i < ROUTES.length; i++) {
      const owned = s.routes[i].owned > 0;
      const next = !owned && (i === 0 || s.routes[i - 1].owned > 0);
      if (!owned && !next) continue;
      const { a, b, c } = this.routeCtrl(i);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.quadraticCurveTo(c.x, c.y, b.x, b.y);
      if (owned) {
        g.setLineDash([]);
        g.strokeStyle = "rgba(70,40,15,0.55)";
        g.lineWidth = 7 * sc;
        g.stroke();
        g.strokeStyle = "#e6cf9c";
        g.lineWidth = 4 * sc;
        g.stroke();
        g.setLineDash([7 * sc, 7 * sc]);
        g.lineDashOffset = s.masters[i] ? -time * 14 * sc : 0;
        g.strokeStyle = ROUTES[i].color;
        g.lineWidth = 2 * sc;
        g.stroke();
        g.setLineDash([]);
      } else {
        g.setLineDash([3 * sc, 6 * sc]);
        g.strokeStyle = "rgba(80,50,20,0.45)";
        g.lineWidth = 2 * sc;
        g.stroke();
        g.setLineDash([]);
      }
      if (this.highlightRoute === i) {
        g.save();
        g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 5);
        g.strokeStyle = "#fff6c8";
        g.lineWidth = 10 * sc;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.quadraticCurveTo(c.x, c.y, b.x, b.y);
        g.stroke();
        g.restore();
      }
    }

    for (const city of CITIES) {
      const p = this.px(city.x, city.y);
      this.drawCity(g, p, sc, this.cityVisible(s, city.id), city.id);
    }

    for (let i = 0; i < ROUTES.length; i++) {
      const r = s.routes[i];
      if (r.owned <= 0) continue;
      const forward = r.trips % 2 === 0;
      const tt = tripTime(s, i);
      const active = s.masters[i] || r.running;
      const tint = ROUTES[i].color;
      if (s.masters[i] && tt < 0.8) {
        const n = 6;
        for (let k = 0; k < n; k++) {
          const ph = (time / Math.max(tt * 2, 0.6) + k / n) % 1;
          const f = ph < 0.5 ? ph * 2 : 2 - ph * 2;
          const p = this.routePoint(i, f);
          this.drawCamel(g, p.x, p.y, sc * 0.85, ph < 0.5 ? p.dx >= 0 : p.dx < 0, time * 8 + k, tint);
        }
        continue;
      }
      const prog = active ? r.progress : 0;
      const count = Math.min(5, 1 + Math.floor(Math.log2(r.owned)));
      for (let k = count - 1; k >= 0; k--) {
        let f = prog - k * 0.045;
        if (f < 0) f = 0;
        const along = forward ? f : 1 - f;
        const p = this.routePoint(i, along);
        const offs = active || k === 0 ? 0 : k * 5 * sc;
        const facing = forward ? p.dx >= 0 : p.dx < 0;
        this.drawCamel(g, p.x + (facing ? -offs : offs), p.y, sc, facing, active ? time * 9 + k : 0, tint);
      }
      if (!active) {
        const p = this.routePoint(i, forward ? 0 : 1);
        this.drawSendBubble(g, p.x, p.y - 26 * sc, sc, time);
      }
    }

    for (const city of CITIES) {
      const p = this.px(city.x, city.y);
      this.drawCityLabel(g, p, sc, this.cityVisible(s, city.id), tk("city_" + city.id));
    }

    for (const e of events) {
      const p = this.eventPoint(e);
      const remain = 1 - (now - e.born) / e.life;
      const hovered = this.hover?.type === "event" && this.hover.id === e.id;
      if (e.kind === "bandit") this.drawBandit(g, p, sc, time, remain, hovered);
      else this.drawMerchant(g, p, sc, time, remain, hovered);
    }

    g.textAlign = "center";
    for (let k = this.floaters.length - 1; k >= 0; k--) {
      const f = this.floaters[k];
      const a = (now - f.born) / f.life;
      if (a >= 1) {
        this.floaters.splice(k, 1);
        continue;
      }
      const y = f.y - a * (f.big ? 40 : 28) * sc;
      g.globalAlpha = a < 0.7 ? 1 : 1 - (a - 0.7) / 0.3;
      g.font = `bold ${Math.round((f.big ? 17 : 13) * sc)}px "Trebuchet MS", sans-serif`;
      g.lineWidth = 3;
      g.strokeStyle = "rgba(40,20,5,0.9)";
      g.strokeText(f.text, f.x, y);
      g.fillStyle = f.color;
      g.fillText(f.text, f.x, y);
      g.globalAlpha = 1;
    }
  }

  private drawCity(g: CanvasRenderingContext2D, p: Pt, sc: number, alpha: number, id: string): void {
    const img = cityImages[id];
    if (img?.complete && img.naturalWidth > 0) {
      const w = 62 * sc;
      const h = (w * img.naturalHeight) / img.naturalWidth;
      g.save();
      g.globalAlpha = alpha >= 1 ? 1 : 0.55 + alpha * 0.3;
      if (alpha < 1) g.filter = "grayscale(0.85) brightness(1.05)";
      g.drawImage(img, p.x - w / 2, p.y + 14 * sc - h, w, h);
      g.restore();
      return;
    }
    g.save();
    g.globalAlpha = alpha;
    const s = 11 * sc;
    g.fillStyle = "rgba(40,25,10,0.3)";
    g.beginPath();
    g.ellipse(p.x, p.y + s * 0.95, s * 1.5, s * 0.45, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = alpha >= 1 ? "#c9955a" : "#a89a86";
    g.strokeStyle = "#5a3a1a";
    g.lineWidth = 1.5;
    g.fillRect(p.x - s * 1.2, p.y - s * 0.2, s * 2.4, s * 1.1);
    g.strokeRect(p.x - s * 1.2, p.y - s * 0.2, s * 2.4, s * 1.1);
    for (let k = 0; k < 5; k++) {
      g.fillRect(p.x - s * 1.2 + k * s * 0.55, p.y - s * 0.45, s * 0.3, s * 0.3);
    }
    g.beginPath();
    g.arc(p.x, p.y - s * 0.2, s * 0.6, Math.PI, 0);
    g.fillStyle = alpha >= 1 ? "#2f8f9d" : "#8e9aa0";
    g.fill();
    g.stroke();
    g.fillStyle = "#e7c35a";
    g.fillRect(p.x - 1, p.y - s * 1.1, 2, s * 0.35);
    g.fillStyle = "#5a3a1a";
    g.fillRect(p.x - s * 0.18, p.y + s * 0.4, s * 0.36, s * 0.5);
    g.restore();
  }

  private drawCityLabel(g: CanvasRenderingContext2D, p: Pt, sc: number, alpha: number, name: string): void {
    const s = 11 * sc;
    g.save();
    g.globalAlpha = alpha;
    g.font = `bold ${Math.round(12 * sc)}px Georgia, serif`;
    g.textAlign = "center";
    const half = g.measureText(name).width / 2 + 10;
    const x = Math.min(this.w - half, Math.max(half, p.x));
    g.lineWidth = 3;
    g.strokeStyle = "rgba(245,230,195,0.9)";
    g.strokeText(name, x, p.y + s * 2.3);
    g.fillStyle = "#3d240c";
    g.fillText(name, x, p.y + s * 2.3);
    g.restore();
  }

  private drawCamel(g: CanvasRenderingContext2D, x: number, y: number, sc: number, right: boolean, phase: number, tint: string): void {
    const s = 9.5 * sc;
    g.save();
    g.translate(x, y);
    if (!right) g.scale(-1, 1);
    g.fillStyle = "rgba(40,25,10,0.28)";
    g.beginPath();
    g.ellipse(0, s * 0.95, s * 1.2, s * 0.25, 0, 0, Math.PI * 2);
    g.fill();
    const legSwing = Math.sin(phase) * s * 0.25;
    g.strokeStyle = "#6e4a24";
    g.lineWidth = Math.max(1.2, s * 0.18);
    g.lineCap = "round";
    const legs: [number, number][] = [[-0.7, 1], [-0.4, -1], [0.45, -1], [0.75, 1]];
    for (const [lx, d] of legs) {
      g.beginPath();
      g.moveTo(lx * s, 0);
      g.lineTo(lx * s + legSwing * d, s * 0.9);
      g.stroke();
    }
    g.fillStyle = "#c8975a";
    g.beginPath();
    g.ellipse(0, -s * 0.15, s * 1.05, s * 0.45, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(-s * 0.15, -s * 0.55, s * 0.5, s * 0.4, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(s * 0.8, -s * 0.3);
    g.quadraticCurveTo(s * 1.25, -s * 0.5, s * 1.25, -s * 1.05);
    g.lineWidth = s * 0.32;
    g.strokeStyle = "#c8975a";
    g.stroke();
    g.beginPath();
    g.ellipse(s * 1.4, -s * 1.1, s * 0.32, s * 0.2, 0.2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = tint;
    g.strokeStyle = "rgba(40,20,5,0.7)";
    g.lineWidth = 1;
    g.fillRect(-s * 0.55, -s * 1.15, s * 0.8, s * 0.5);
    g.strokeRect(-s * 0.55, -s * 1.15, s * 0.8, s * 0.5);
    g.fillStyle = "#2a1a0a";
    g.beginPath();
    g.arc(s * 1.5, -s * 1.15, Math.max(0.8, s * 0.06), 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  private drawSendBubble(g: CanvasRenderingContext2D, x: number, y: number, sc: number, time: number): void {
    const bob = Math.sin(time * 5) * 3 * sc;
    const r = 10 * sc;
    g.save();
    g.translate(x, y + bob);
    g.fillStyle = "#fff4d0";
    g.strokeStyle = "#7a4b14";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(-r * 0.3, r * 0.85);
    g.lineTo(0, r * 1.5);
    g.lineTo(r * 0.3, r * 0.85);
    g.fill();
    g.fillStyle = "#b5541a";
    g.beginPath();
    g.moveTo(-r * 0.3, -r * 0.45);
    g.lineTo(r * 0.5, 0);
    g.lineTo(-r * 0.3, r * 0.45);
    g.closePath();
    g.fill();
    g.restore();
  }

  private ring(g: CanvasRenderingContext2D, p: Pt, r: number, remain: number, color: string): void {
    g.strokeStyle = "rgba(0,0,0,0.35)";
    g.lineWidth = 4;
    g.beginPath();
    g.arc(p.x, p.y, r, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = color;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(p.x, p.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, remain));
    g.stroke();
  }

  private drawBandit(g: CanvasRenderingContext2D, p: Pt, sc: number, time: number, remain: number, hovered: boolean): void {
    const r = (hovered ? 21 : 18) * sc;
    const pulse = 1 + Math.sin(time * 8) * 0.06;
    g.save();
    g.fillStyle = "rgba(170,30,20,0.25)";
    g.beginPath();
    g.arc(p.x, p.y, r * 1.5 * pulse, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#3a1d12";
    g.beginPath();
    g.arc(p.x, p.y, r, 0, Math.PI * 2);
    g.fill();
    this.ring(g, p, r + 3, remain, "#ff5a3c");
    g.strokeStyle = "#e9e3d5";
    g.lineWidth = 3 * sc;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(p.x - r * 0.55, p.y - r * 0.55);
    g.lineTo(p.x + r * 0.55, p.y + r * 0.55);
    g.moveTo(p.x + r * 0.55, p.y - r * 0.55);
    g.lineTo(p.x - r * 0.55, p.y + r * 0.55);
    g.stroke();
    g.strokeStyle = "#c79a3a";
    g.lineWidth = 4 * sc;
    g.beginPath();
    g.moveTo(p.x - r * 0.35, p.y + r * 0.2);
    g.lineTo(p.x - r * 0.15, p.y + r * 0.4);
    g.moveTo(p.x + r * 0.35, p.y + r * 0.2);
    g.lineTo(p.x + r * 0.15, p.y + r * 0.4);
    g.stroke();
    g.font = `bold ${Math.round(12 * sc)}px "Trebuchet MS", sans-serif`;
    g.textAlign = "center";
    g.lineWidth = 3;
    g.strokeStyle = "#2a0d05";
    g.strokeText(t("bandits"), p.x, p.y - r - 8);
    g.fillStyle = "#ff8a6a";
    g.fillText(t("bandits"), p.x, p.y - r - 8);
    g.restore();
  }

  private drawMerchant(g: CanvasRenderingContext2D, p: Pt, sc: number, time: number, remain: number, hovered: boolean): void {
    const r = (hovered ? 21 : 18) * sc;
    const bob = Math.sin(time * 3) * 3 * sc;
    const q = { x: p.x, y: p.y + bob };
    g.save();
    const glow = g.createRadialGradient(q.x, q.y, 2, q.x, q.y, r * 2.2);
    glow.addColorStop(0, "rgba(255,225,120,0.75)");
    glow.addColorStop(1, "rgba(255,225,120,0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(q.x, q.y, r * 2.2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#7a2f8c";
    g.beginPath();
    g.arc(q.x, q.y, r, 0, Math.PI * 2);
    g.fill();
    this.ring(g, q, r + 3, remain, "#ffd75e");
    g.fillStyle = "#f3efe6";
    g.beginPath();
    g.ellipse(q.x, q.y - r * 0.35, r * 0.55, r * 0.32, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#e1a974";
    g.beginPath();
    g.arc(q.x, q.y + r * 0.05, r * 0.32, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffd75e";
    g.beginPath();
    g.arc(q.x + r * 0.45, q.y + r * 0.45, r * 0.28, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#7a4b14";
    g.font = `bold ${Math.round(9 * sc)}px sans-serif`;
    g.textAlign = "center";
    g.fillText("$", q.x + r * 0.45, q.y + r * 0.55);
    g.font = `bold ${Math.round(12 * sc)}px "Trebuchet MS", sans-serif`;
    g.lineWidth = 3;
    g.strokeStyle = "#2a1205";
    g.strokeText(t("merchant"), q.x, q.y - r - 8);
    g.fillStyle = "#ffe08a";
    g.fillText(t("merchant"), q.x, q.y - r - 8);
    g.restore();
  }

  hitTestClient(cx: number, cy: number, s: GameState | null, events: MapEvent[]): MapHit {
    if (!s) return null;
    const rect = this.canvas.getBoundingClientRect();
    const x = cx - rect.left;
    const y = cy - rect.top;
    const sc = this.scale;
    for (const e of events) {
      const p = this.eventPoint(e);
      if (Math.hypot(p.x - x, p.y - y) < 30 * sc) return { type: "event", id: e.id };
    }
    for (let i = 0; i < ROUTES.length; i++) {
      const r = s.routes[i];
      if (r.owned <= 0 || s.masters[i] || r.running) continue;
      const p = this.routePoint(i, r.trips % 2 === 0 ? 0 : 1);
      if (Math.hypot(p.x - x, p.y - 14 * sc - y) < 28 * sc) return { type: "route", route: i };
    }
    return null;
  }
}
