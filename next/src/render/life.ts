import { Container, Sprite, Texture } from "pixi.js";
import type { World } from "../world/gen";

/** Haritayı canlandıran süs hayvanları ve yolcular: sürüler, kartallar, kervanlar, ocak dumanı. */

interface Animal {
  s: Sprite;
  hx: number;
  hy: number;
  tx: number;
  ty: number;
  wait: number;
  ph: number;
}

interface Herd {
  x: number;
  y: number;
  list: Animal[];
}

interface Eagle {
  s: Sprite;
  sh: Sprite;
  cx: number;
  cy: number;
  r: number;
  a: number;
  w: number;
}

interface Caravan {
  pts: number[];
  cum: number[];
  len: number;
  d: number;
  dir: number;
  spd: number;
  beasts: Sprite[];
}

interface Smoke {
  s: Sprite;
  x: number;
  y: number;
  t: number;
}

function art(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): Texture {
  const c = document.createElement("canvas");
  c.width = w * 2;
  c.height = h * 2;
  const g = c.getContext("2d")!;
  g.scale(2, 2);
  g.lineCap = "round";
  g.lineJoin = "round";
  g.shadowColor = "rgba(30,15,0,0.9)";
  g.shadowBlur = 1.5;
  draw(g);
  return Texture.from(c);
}

const sheepTex = () =>
  art(16, 12, (g) => {
    g.strokeStyle = "#3a2a1a";
    g.lineWidth = 1.2;
    for (const x of [5, 7.5, 10, 12]) {
      g.beginPath();
      g.moveTo(x, 7);
      g.lineTo(x, 11);
      g.stroke();
    }
    g.fillStyle = "#efe6d2";
    g.strokeStyle = "#7a6a52";
    g.lineWidth = 0.8;
    g.beginPath();
    g.ellipse(8.5, 6, 5.5, 3.6, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = "#2e2218";
    g.beginPath();
    g.ellipse(14, 5, 1.8, 1.5, 0.3, 0, Math.PI * 2);
    g.fill();
  });

const horseTex = () =>
  art(20, 16, (g) => {
    g.strokeStyle = "#3a2410";
    g.lineWidth = 1.4;
    for (const x of [5, 7, 13, 15]) {
      g.beginPath();
      g.moveTo(x, 9);
      g.lineTo(x, 15);
      g.stroke();
    }
    g.fillStyle = "#8a5a2e";
    g.beginPath();
    g.ellipse(10, 8, 6.5, 3.4, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(14, 7);
    g.lineTo(17.5, 2.5);
    g.lineTo(19, 3.5);
    g.lineTo(16.5, 8);
    g.fill();
    g.strokeStyle = "#2a1808";
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(3.5, 7);
    g.quadraticCurveTo(1.5, 9, 2, 12);
    g.stroke();
  });

const camelTex = () =>
  art(22, 20, (g) => {
    g.strokeStyle = "#4a3418";
    g.lineWidth = 1.4;
    for (const x of [6, 8, 14, 16]) {
      g.beginPath();
      g.moveTo(x, 11);
      g.lineTo(x, 19);
      g.stroke();
    }
    g.fillStyle = "#c79a5c";
    g.beginPath();
    g.ellipse(11, 10.5, 6.5, 3.2, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(10, 7.5, 3.4, 3, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(16, 10);
    g.quadraticCurveTo(19, 9, 19, 4);
    g.lineTo(21.5, 4.5);
    g.lineTo(20.5, 6);
    g.quadraticCurveTo(20.5, 11, 17, 12);
    g.fill();
    g.fillStyle = "#8a2e22";
    g.fillRect(7.5, 6, 6, 3);
    g.fillStyle = "#3f6f9a";
    g.fillRect(8, 6.5, 2, 2);
  });

const eagleTex = () =>
  art(28, 10, (g) => {
    g.fillStyle = "#2a1c10";
    g.beginPath();
    g.moveTo(14, 5);
    g.quadraticCurveTo(8, 0, 0, 3);
    g.quadraticCurveTo(7, 3.5, 12, 7);
    g.lineTo(14, 9);
    g.lineTo(16, 7);
    g.quadraticCurveTo(21, 3.5, 28, 3);
    g.quadraticCurveTo(20, 0, 14, 5);
    g.fill();
  });

const rnd = (n: number) => (((n * 2654435761) ^ (n >>> 9)) >>> 0) / 4294967296;

export class Life {
  readonly ground = new Container();
  readonly air = new Container();
  private herds: Herd[] = [];
  private eagles: Eagle[] = [];
  private caravans: Caravan[] = [];
  private smoke: Smoke[] = [];

  constructor(world: World, villages: { x: number; y: number; yurt: boolean }[], glow: Texture) {
    const sheep = sheepTex();
    const horse = horseTex();
    const camel = camelTex();
    const eagle = eagleTex();
    villages.forEach((v, i) => {
      const n = 4 + Math.floor(rnd(i + 3) * 5);
      const side = rnd(i + 7) * Math.PI * 2;
      const hx = v.x + Math.cos(side) * 46;
      const hy = v.y + Math.sin(side) * 30 + 10;
      const herd: Herd = { x: hx, y: hy, list: [] };
      for (let k = 0; k < n; k++) {
        const isHorse = v.yurt && k < 2;
        const s = new Sprite(isHorse ? horse : sheep);
        s.anchor.set(0.5, 0.9);
        s.scale.set(isHorse ? 0.75 : 0.62);
        const x = hx + (rnd(i * 31 + k) - 0.5) * 34;
        const y = hy + (rnd(i * 17 + k * 5) - 0.5) * 20;
        s.position.set(x, y);
        this.ground.addChild(s);
        herd.list.push({ s, hx, hy, tx: x, ty: y, wait: rnd(i + k) * 4, ph: rnd(k + i * 3) * 6 });
      }
      this.herds.push(herd);
      for (let k = 0; k < 2; k++) {
        const p = new Sprite(glow);
        p.anchor.set(0.5);
        p.tint = 0x8a8478;
        this.air.addChild(p);
        this.smoke.push({ s: p, x: v.x + (rnd(i + 11) - 0.5) * 14, y: v.y - 14, t: k * 2.2 + rnd(i) * 2 });
      }
    });
    const pk = world.peaks;
    for (let k = 0; k < 9 && pk.length; k++) {
      const j = Math.floor(rnd(k * 97 + 5) * (pk.length / 3)) * 3;
      const s = new Sprite(eagle);
      s.anchor.set(0.5);
      s.scale.set(0.8);
      const sh = new Sprite(eagle);
      sh.anchor.set(0.5);
      sh.scale.set(0.7);
      sh.tint = 0x000000;
      sh.alpha = 0.18;
      this.ground.addChild(sh);
      this.air.addChild(s);
      this.eagles.push({ s, sh, cx: pk[j], cy: pk[j + 1] - 30, r: 60 + rnd(k + 1) * 90, a: rnd(k + 2) * 6, w: (0.25 + rnd(k + 3) * 0.2) * (k % 2 ? 1 : -1) });
    }
    const roads = world.roads.filter((r) => r.length >= 8);
    for (let k = 0; k < Math.min(10, roads.length); k++) {
      const pts = roads[(k * 7) % roads.length];
      const cum = [0];
      for (let i = 2; i < pts.length; i += 2) cum.push(cum[cum.length - 1] + Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]));
      const len = cum[cum.length - 1];
      if (len < 200) continue;
      const beasts: Sprite[] = [];
      const n = 3 + (k % 3);
      for (let b = 0; b < n; b++) {
        const s = new Sprite(b === 0 ? horse : camel);
        s.anchor.set(0.5, 0.9);
        s.scale.set(0.8);
        this.ground.addChild(s);
        beasts.push(s);
      }
      this.caravans.push({ pts, cum, len, d: rnd(k + 41) * len, dir: k % 2 ? 1 : -1, spd: 14 + rnd(k) * 8, beasts });
    }
  }

  private at(c: Caravan, d: number): [number, number, number] {
    d = Math.max(0, Math.min(c.len - 0.01, d));
    let lo = 0,
      hi = c.cum.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (c.cum[m] <= d) lo = m;
      else hi = m;
    }
    const t = (d - c.cum[lo]) / Math.max(0.001, c.cum[hi] - c.cum[lo]);
    const x0 = c.pts[lo * 2],
      y0 = c.pts[lo * 2 + 1],
      x1 = c.pts[hi * 2],
      y1 = c.pts[hi * 2 + 1];
    return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, x1 - x0];
  }

  update(dt: number, time: number, view: { x0: number; y0: number; x1: number; y1: number }, dark: number, winter: boolean, zoom: number): void {
    const pad = 120;
    const inView = (x: number, y: number) => x > view.x0 - pad && x < view.x1 + pad && y > view.y0 - pad && y < view.y1 + pad;
    // uzaktan bakınca küçük canlılar karmaşa yaratmasın
    const show = zoom > 0.45;
    this.ground.visible = show;
    this.air.visible = show;
    if (!show) return;
    for (const h of this.herds) {
      const vis = inView(h.x, h.y) && !winter;
      for (const a of h.list) {
        a.s.visible = vis;
        if (!vis) continue;
        const dx = a.tx - a.s.x,
          dy = a.ty - a.s.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.5) {
          a.wait -= dt;
          if (a.wait <= 0) {
            a.tx = a.hx + (Math.random() - 0.5) * 50;
            a.ty = a.hy + (Math.random() - 0.5) * 28;
            a.wait = 2 + Math.random() * 6;
          }
          a.s.y += Math.sin(time * 2 + a.ph) * 0.01;
        } else {
          const st = Math.min(d, dt * 5);
          a.s.x += (dx / d) * st;
          a.s.y += (dy / d) * st;
          const sx = Math.abs(a.s.scale.x);
          a.s.scale.x = dx < 0 ? -sx : sx;
        }
      }
    }
    for (const e of this.eagles) {
      const vis = inView(e.cx, e.cy) && dark < 0.25;
      e.s.visible = e.sh.visible = vis;
      if (!vis) continue;
      e.a += e.w * dt;
      const x = e.cx + Math.cos(e.a) * e.r;
      const y = e.cy + Math.sin(e.a) * e.r * 0.55;
      e.s.position.set(x, y - 50);
      e.s.rotation = e.a + (e.w > 0 ? Math.PI / 2 : -Math.PI / 2);
      e.s.scale.y = 0.8 * (0.75 + 0.25 * Math.abs(Math.sin(time * 1.6 + e.r)));
      e.sh.position.set(x + 30, y + 40);
      e.sh.rotation = e.s.rotation;
    }
    for (const c of this.caravans) {
      c.d += c.dir * c.spd * dt;
      if (c.d > c.len) {
        c.d = c.len;
        c.dir = -1;
      } else if (c.d < 0) {
        c.d = 0;
        c.dir = 1;
      }
      const [hx, hy] = this.at(c, c.d);
      const vis = inView(hx, hy);
      c.beasts.forEach((b, i) => {
        b.visible = vis;
        if (!vis) return;
        const [x, y, vx] = this.at(c, c.d - c.dir * i * 18);
        b.position.set(x, y - Math.abs(Math.sin(time * 5 + i)) * 1.2);
        const sx = Math.abs(b.scale.x);
        b.scale.x = vx * c.dir < 0 ? -sx : sx;
      });
    }
    for (const p of this.smoke) {
      const vis = inView(p.x, p.y);
      p.s.visible = vis;
      if (!vis) continue;
      p.t = (p.t + dt) % 4.4;
      const k = p.t / 4.4;
      p.s.position.set(p.x + Math.sin(time * 0.6 + p.x) * 4 + k * 10, p.y - k * 34);
      p.s.width = p.s.height = 8 + k * 22;
      p.s.alpha = (winter ? 0.5 : 0.32) * Math.sin(Math.PI * k);
    }
  }
}
