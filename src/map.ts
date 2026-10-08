import mapUrl from "./assets/map.webp";
import { BUILD_SECONDS } from "./cities";
import { CITIES, CITY_BY_ID, ROUTES } from "./data";
import { tripTime } from "./economy";
import { WONDERS, WONDER_STAGES, wonderStage, wonderVisible, type WonderDef } from "./empire";
import { gearIcon, monumentStage, mountIcon, type Item } from "./army";
import { FORTS, FORT_WALLS, fortAvailable, fortTaken, nemesisById, nemesisName } from "./warfare";
import { TITAN_MS, TITAN_POS } from "./quests";
import { TW_BONUS, TW_PENALTY } from "./saga";
import { HAN_T } from "./caravanserai";
import { CAMP_BONUS, activeFestival, campWanted, type Camp } from "./perks";
import { REGIONS, duskAmount, nightAmount, regionConquered, regionVisible } from "./province";
import { GATHER_MS, NODES, NODE_ICON, RUIN_MS, nodeOpen, nodeReady } from "./frontier";
import type { MapEvent } from "./events";
import { fmt } from "./format";
import { t, tk } from "./i18n";
import type { GameState } from "./state";
import type { Order, Season } from "./world";

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

const WORLD_W = 1600;
const WORLD_H = 900;
const WORLD_K = 1.6;
const PARK = 0.2;

const mapImage = new Image();
mapImage.src = mapUrl;

const CAMEL_LOAD = ["jars", "textile", "chest", "chest", "textile", "chest", "chest", "jars"];

function loadImages(urls: Record<string, string>): Record<string, HTMLImageElement> {
  const out: Record<string, HTMLImageElement> = {};
  for (const [path, url] of Object.entries(urls)) {
    const img = new Image();
    img.src = url;
    out[path.split("/").pop()!.replace(".webp", "")] = img;
  }
  return out;
}

function lazyImages(urls: Record<string, string>): Record<string, HTMLImageElement> {
  const src: Record<string, string> = {};
  for (const [path, url] of Object.entries(urls)) src[path.split("/").pop()!.replace(".webp", "")] = url;
  return new Proxy({} as Record<string, HTMLImageElement>, {
    get(cache, key) {
      if (typeof key !== "string") return undefined;
      let img = cache[key];
      if (!img && src[key]) {
        img = new Image();
        img.decoding = "async";
        img.src = src[key];
        cache[key] = img;
      }
      return img;
    },
  });
}

const camelImages = loadImages(import.meta.glob<string>("./assets/camels/*.webp", { eager: true, query: "?url", import: "default" }));

const cityImages = loadImages(import.meta.glob<string>("./assets/cities/*.webp", { eager: true, query: "?url", import: "default" }));

export const travelerImages = loadImages(import.meta.glob<string>("./assets/travelers/*.webp", { eager: true, query: "?url", import: "default" }));

const iconImages = lazyImages(import.meta.glob<string>("./assets/icons/*.webp", { eager: true, query: "?url", import: "default" }));

const buildingImages = lazyImages(import.meta.glob<string>("./assets/buildings/*.webp", { eager: true, query: "?url", import: "default" }));

const ready = (img: HTMLImageElement | undefined): img is HTMLImageElement => !!img && img.complete && img.naturalWidth > 0;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  kind: Season;
}

interface Cloud {
  x: number;
  y: number;
  s: number;
  sprite: number;
}

interface Indicator {
  x: number;
  y: number;
  wx: number;
  wy: number;
}

const SEASON_TINT: Record<Season, string> = {
  spring: "rgba(255,210,230,0.06)",
  summer: "rgba(255,170,60,0.08)",
  autumn: "rgba(200,95,30,0.12)",
  winter: "rgba(225,238,255,0.3)",
};

const BUILDING_SLOTS: { id: string; dx: number; dy: number; w: number; behind: boolean }[] = [
  { id: "caravanserai", dx: -40, dy: 20, w: 34, behind: false },
  { id: "bazaar", dx: 40, dy: 22, w: 34, behind: false },
  { id: "mosque", dx: 34, dy: -8, w: 38, behind: true },
];

export type MapHit =
  | { type: "event"; id: number }
  | { type: "route"; route: number }
  | { type: "traveler" }
  | { type: "city"; id: string }
  | { type: "wonder"; id: string }
  | { type: "fort"; id: string }
  | { type: "monument" }
  | { type: "titan" }
  | { type: "tradewar" }
  | { type: "kurgan" }
  | { type: "han"; route: number }
  | { type: "camp" }
  | { type: "storm"; id: number }
  | { type: "rival" }
  | { type: "court" }
  | { type: "node"; k: number }
  | { type: "region"; k: number }
  | { type: "merchant" }
  | null;

const CAMP_POS: Record<Camp, Pt> = { yayla: { x: 0.6, y: 0.29 }, kislak: { x: 0.62, y: 0.86 } };

const nemesisImages = lazyImages(import.meta.glob<string>("./assets/nemesis/*.webp", { eager: true, query: "?url", import: "default" }));
const heroImages = lazyImages(import.meta.glob<string>("./assets/heroes/*.webp", { eager: true, query: "?url", import: "default" }));
const compImages = lazyImages(import.meta.glob<string>("./assets/companions/*.webp", { eager: true, query: "?url", import: "default" }));
const MONUMENT_OFFSET = { dx: 0.06, dy: 0.06 };
const KURGAN_POS = { x: 0.91, y: 0.46 };
const COURT_POS = { x: 0.3, y: 0.52 };
const CITIES_BY_Y = [...CITIES].sort((a, b) => a.y - b.y);

const wonderImages: Record<string, HTMLImageElement> = {};
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/wonders/*.webp", { eager: true, query: "?url", import: "default" }))) {
  const img = new Image();
  img.src = url;
  wonderImages[path.split("/").pop()!.replace(".webp", "")] = img;
}

function makeCloudSprite(seed: number, shadow: boolean): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 320;
  c.height = 160;
  const g = c.getContext("2d")!;
  let r = seed;
  const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 14; k++) {
    const x = 60 + rnd() * 200;
    const y = 60 + rnd() * 50 - Math.abs(x - 160) * 0.15;
    const rad = 26 + rnd() * 34;
    const gr = g.createRadialGradient(x - rad * 0.25, y - rad * 0.35, rad * 0.1, x, y, rad);
    if (shadow) {
      gr.addColorStop(0, "rgba(20,25,40,0.5)");
      gr.addColorStop(1, "rgba(20,25,40,0)");
    } else {
      gr.addColorStop(0, "rgba(255,255,255,0.95)");
      gr.addColorStop(0.6, "rgba(240,236,232,0.8)");
      gr.addColorStop(1, "rgba(200,200,215,0)");
    }
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

export class MapView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private scale = 1;
  private ui = 1;
  private camX = WORLD_W / 2;
  private camY = WORLD_H / 2;
  private zoom = 1;
  private camInit = false;
  private fly: { x: number; y: number; z: number } | null = null;
  private vel = { x: 0, y: 0 };
  private pointers = new Map<number, Pt>();
  private drag: { x: number; y: number; camX: number; camY: number; moved: boolean; lastX: number; lastY: number; lastT: number } | null = null;
  private pinch: { dist: number; zoom: number; wx: number; wy: number } | null = null;
  private pinched = false;
  private floaters: Floater[] = [];
  private lastFloatAt: number[] = ROUTES.map(() => 0);
  private hover: MapHit = null;
  private indicators: Indicator[] = [];
  private clouds: Cloud[] = [];
  private cloudSprites: HTMLCanvasElement[] = [];
  private cloudShadows: HTMLCanvasElement[] = [];
  private water: { mask: HTMLCanvasElement; noise: HTMLCanvasElement; work: HTMLCanvasElement } | null = null;
  private backdrop: HTMLCanvasElement | null = null;
  highlightRoute = -1;
  traveler: { id: string; city: string; ready: boolean } | null = null;
  buildable = new Set<string>();
  season: Season = "spring";
  order: Order | null = null;
  onTap: (cx: number, cy: number) => void = () => {};
  onHold: (route: number | null) => void = () => {};
  rival: { route: number; t: number } | null = null;
  whipRoute = -1;
  private holding = false;
  private particles: Particle[] = [];
  private dust: { x: number; y: number; born: number }[] = [];
  private ripples: { x: number; y: number; born: number }[] = [];
  private flocks: { x: number; y: number; vx: number; vy: number; n: number; seed: number }[] = [];
  private lastDraw = 0;
  private celebrate: { id: string; born: number } | null = null;
  private stormUntil = 0;
  private stormRoute = 0;
  private stormBolts: { id: number; t: number; born: number }[] = [];

  celebrateCity(id: string, now: number): void {
    this.celebrate = { id, born: now };
    const p = this.cityPt(id);
    this.addTextAt({ x: p.x, y: p.y - 40 * this.scale }, "★", "#ffd75e", now);
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    this.ctx = ctx;
    for (let k = 0; k < 3; k++) {
      this.cloudSprites.push(makeCloudSprite(1234 + k * 977, false));
      this.cloudShadows.push(makeCloudSprite(1234 + k * 977, true));
    }
    for (let k = 0; k < 5; k++) {
      this.clouds.push({ x: (k / 5) * (WORLD_W + 600) - 300, y: 80 + ((k * 337) % 700), s: 0.8 + ((k * 53) % 10) / 14, sprite: k % 3 });
    }
    if (mapImage.complete && mapImage.naturalWidth > 0) this.prepareTerrain();
    else mapImage.addEventListener("load", () => this.prepareTerrain());
    canvas.addEventListener("pointerdown", (e) => this.onDown(e));
    canvas.addEventListener("pointermove", (e) => this.onMove(e));
    canvas.addEventListener("pointerup", (e) => this.onUp(e));
    canvas.addEventListener("pointercancel", (e) => this.onUp(e, true));
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.fly = null;
        this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015));
      },
      { passive: false },
    );
    canvas.addEventListener("mouseleave", () => {
      this.hover = null;
    });
    const ctl = document.createElement("div");
    ctl.className = "mapctl";
    ctl.innerHTML = `<button data-z="in" aria-label="Zoom in">+</button><button data-z="out" aria-label="Zoom out">−</button><button data-z="all" aria-label="Overview">⤢</button>`;
    ctl.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
      if (!b) return;
      if (b.dataset.z === "all") this.flyOverview();
      else this.fly = { x: this.camX, y: this.camY, z: Math.min(this.maxZoom(), Math.max(this.minZoom(), this.zoom * (b.dataset.z === "in" ? 1.4 : 1 / 1.4))) };
    });
    canvas.parentElement!.appendChild(ctl);
  }

  private prepareTerrain(): void {
    const MW = 480;
    const MH = 270;
    const src = document.createElement("canvas");
    src.width = MW;
    src.height = MH;
    const sg = src.getContext("2d", { willReadFrequently: true })!;
    sg.drawImage(mapImage, 0, 0, MW, MH);
    const data = sg.getImageData(0, 0, MW, MH);
    const mask = document.createElement("canvas");
    mask.width = MW;
    mask.height = MH;
    const mg = mask.getContext("2d")!;
    const md = mg.createImageData(MW, MH);
    for (let i = 0; i < data.data.length; i += 4) {
      const r = data.data[i];
      const gg = data.data[i + 1];
      const b = data.data[i + 2];
      const water = b > r + 45 && b > gg - 10;
      md.data[i] = md.data[i + 1] = md.data[i + 2] = 255;
      md.data[i + 3] = water ? 255 : 0;
    }
    mg.putImageData(md, 0, 0);
    const noise = document.createElement("canvas");
    noise.width = MW;
    noise.height = MH;
    const ng = noise.getContext("2d")!;
    for (let k = 0; k < 1400; k++) {
      ng.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.75})`;
      ng.fillRect(Math.random() * MW, Math.random() * MH, 1 + Math.random() * 2, 1);
    }
    const work = document.createElement("canvas");
    work.width = MW;
    work.height = MH;
    this.water = { mask, noise, work };
    const bd = document.createElement("canvas");
    bd.width = 64;
    bd.height = 36;
    const bg = bd.getContext("2d")!;
    bg.drawImage(mapImage, 0, 0, 64, 36);
    bg.fillStyle = "rgba(20,12,6,0.55)";
    bg.fillRect(0, 0, 64, 36);
    this.backdrop = bd;
  }

  private lastState: GameState | null = null;
  private lastEvents: MapEvent[] = [];

  resize(): void {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    const w = Math.max(200, Math.floor(rect.width));
    const h = Math.max(150, Math.floor(rect.height));
    const dpr = Math.min(this.lite ? 1.25 : 2, window.devicePixelRatio || 1);
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    if (this.camInit) {
      this.zoom = Math.min(this.maxZoom(), Math.max(this.minZoom(), this.zoom));
      this.clampCam();
    }
    this.updateScales();
  }

  private minZoom(): number {
    return Math.min(this.w / WORLD_W, this.h / WORLD_H);
  }

  private maxZoom(): number {
    return Math.max(this.w / WORLD_W, this.h / WORLD_H) * 2.4;
  }

  private updateScales(): void {
    this.scale = this.zoom * WORLD_K;
    this.ui = Math.min(1.3, Math.max(0.85, 0.75 + this.scale * 0.25));
  }

  private clampCam(): void {
    const vw = this.w / this.zoom;
    const vh = this.h / this.zoom;
    this.camX = vw >= WORLD_W ? WORLD_W / 2 : Math.min(WORLD_W - vw / 2, Math.max(vw / 2, this.camX));
    this.camY = vh >= WORLD_H ? WORLD_H / 2 : Math.min(WORLD_H - vh / 2, Math.max(vh / 2, this.camY));
  }

  private toScreen(wx: number, wy: number): Pt {
    return { x: (wx - this.camX) * this.zoom + this.w / 2, y: (wy - this.camY) * this.zoom + this.h / 2 };
  }

  private toWorld(sx: number, sy: number): Pt {
    return { x: (sx - this.w / 2) / this.zoom + this.camX, y: (sy - this.h / 2) / this.zoom + this.camY };
  }

  private cityWorld(id: string): Pt {
    const c = CITY_BY_ID[id];
    return { x: (0.04 + c.x * 0.92) * WORLD_W, y: (0.08 + c.y * 0.84) * WORLD_H };
  }

  px(x: number, y: number): Pt {
    return this.toScreen((0.04 + x * 0.92) * WORLD_W, (0.08 + y * 0.84) * WORLD_H);
  }

  private cityPt(id: string): Pt {
    const c = CITY_BY_ID[id];
    return this.px(c.x, c.y);
  }

  private fitTarget(ids: string[], pad = 150): { x: number; y: number; z: number } {
    const pts = ids.map((id) => this.cityWorld(id));
    const minX = Math.min(...pts.map((p) => p.x)) - pad;
    const maxX = Math.max(...pts.map((p) => p.x)) + pad;
    const minY = Math.min(...pts.map((p) => p.y)) - pad * 1.1;
    const maxY = Math.max(...pts.map((p) => p.y)) + pad * 0.8;
    const cover = Math.max(this.w / WORLD_W, this.h / WORLD_H);
    const z = Math.min(this.maxZoom() * 0.62, Math.max(cover, Math.min(this.w / (maxX - minX), this.h / (maxY - minY))));
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z };
  }

  private frontierCities(s: GameState): string[] {
    const ids = new Set<string>();
    for (let i = 0; i < ROUTES.length; i++) {
      const owned = s.routes[i].owned > 0;
      if (owned || i === 0 || s.routes[i - 1].owned > 0) {
        ids.add(ROUTES[i].from);
        ids.add(ROUTES[i].to);
      }
    }
    return [...ids];
  }

  flyToCity(id: string): void {
    this.fly = this.fitTarget([id], 260);
  }

  flyToNorm(x: number, y: number): void {
    const cover = Math.max(this.w / WORLD_W, this.h / WORLD_H);
    this.fly = { x: (0.04 + x * 0.92) * WORLD_W, y: (0.08 + y * 0.84) * WORLD_H, z: Math.max(cover, Math.min(this.maxZoom() * 0.62, this.w / 560)) };
  }

  private shots: { sx: number; sy: number; ex: number; ey: number; born: number; dur: number; hit: boolean }[] = [];
  private blasts: { x: number; y: number; born: number; big: boolean }[] = [];
  private nextAmbientShot = 0;
  private titanHitAt = 0;

  siegeShot(route: number, hit: boolean, now: number): void {
    const f = this.fortPoint(route);
    const end = this.toWorld(f.x, f.y - 24 * this.scale);
    this.shots.push({ sx: end.x - 150 * WORLD_K * 0.5, sy: end.y + 55, ex: end.x + (Math.random() - 0.5) * 16, ey: end.y + (Math.random() - 0.5) * 10, born: now, dur: 900, hit });
  }

  titanHit(dmg: string, crit: boolean, now: number): void {
    this.titanHitAt = now;
    const p = this.titanPoint();
    const w = this.toWorld(p.x + (Math.random() - 0.5) * 60 * this.ui, p.y - this.titanHeight() * (0.45 + Math.random() * 0.3));
    this.floaters.push({ x: w.x + (Math.random() - 0.5) * 40, y: w.y - 30, text: dmg, color: crit ? "#ff5a3c" : "#ffe08a", born: now, life: 900, big: crit });
    this.blasts.push({ x: w.x, y: w.y, born: now, big: crit });
  }

  private titanHeight(): number {
    return Math.min(190 * this.scale, this.h * 0.36);
  }

  titanPoint(): Pt {
    return this.px(TITAN_POS.x, TITAN_POS.y);
  }

  private drawTitan(g: CanvasRenderingContext2D, s: GameState, sc: number, u: number, time: number, now: number): void {
    const ti = s.titan;
    const img = iconImages.tepegoz;
    if (!ti || !ready(img)) return;
    const p = this.titanPoint();
    const h = this.titanHeight();
    const w = (h * img.naturalWidth) / img.naturalHeight;
    const sway = Math.sin(time * 1.6) * 0.035;
    const flash = Math.max(0, 1 - (now - this.titanHitAt) / 160);
    g.save();
    const glow = g.createRadialGradient(p.x, p.y - h * 0.4, h * 0.1, p.x, p.y - h * 0.4, h * 0.85);
    glow.addColorStop(0, "rgba(255,120,40,0.35)");
    glow.addColorStop(1, "rgba(255,120,40,0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(p.x, p.y - h * 0.4, h * 0.85, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(0,0,0,0.3)";
    g.beginPath();
    g.ellipse(p.x, p.y, w * 0.45, 9 * sc, 0, 0, Math.PI * 2);
    g.fill();
    g.translate(p.x, p.y);
    g.rotate(sway);
    if (flash > 0) g.filter = `brightness(${1 + flash * 1.4}) saturate(${1 - flash * 0.5})`;
    g.drawImage(img, -w / 2 + (flash > 0 ? (Math.random() - 0.5) * 6 * sc : 0), -h, w, h);
    g.restore();
    const bw = 150 * u;
    const bx = p.x - bw / 2;
    const by = p.y + 30 * u;
    const frac = ti.hp / ti.max;
    const remain = Math.max(0, (ti.until - Date.now()) / TITAN_MS);
    g.save();
    g.fillStyle = "rgba(20,8,4,0.85)";
    g.fillRect(bx - 2, by - 2, bw + 4, 16 * u + 4);
    g.fillStyle = "#5a1208";
    g.fillRect(bx, by, bw, 16 * u);
    const grad = g.createLinearGradient(bx, 0, bx + bw, 0);
    grad.addColorStop(0, "#ff3a2a");
    grad.addColorStop(1, "#ffb03a");
    g.fillStyle = grad;
    g.fillRect(bx, by, bw * frac, 16 * u);
    g.fillStyle = "#ffd75e";
    g.fillRect(bx, by + 16 * u + 3, bw * remain, 3 * u);
    g.font = `bold ${Math.round(11 * u)}px "Trebuchet MS", sans-serif`;
    g.textAlign = "center";
    g.fillStyle = "#fff";
    g.fillText(`${fmt(ti.hp)} / ${fmt(ti.max)}`, p.x, by + 12 * u);
    g.font = `bold ${Math.round(15 * u)}px Georgia, serif`;
    g.lineWidth = 3.5;
    g.strokeStyle = "#2a0d05";
    const label = `${t("titanName")} · ${t("nemLevel", { n: ti.level })}`;
    g.strokeText(label, p.x, by - 8 * u);
    g.fillStyle = "#ff9b6a";
    g.fillText(label, p.x, by - 8 * u);
    const pulse = 0.6 + 0.4 * Math.sin(time * 6);
    g.font = `bold ${Math.round(13 * u)}px "Trebuchet MS", sans-serif`;
    g.globalAlpha = pulse;
    g.strokeText(t("titanTap"), p.x, by + 40 * u);
    g.fillStyle = "#ffe08a";
    g.fillText(t("titanTap"), p.x, by + 40 * u);
    g.restore();
  }

  private drawShots(g: CanvasRenderingContext2D, s: GameState, now: number): void {
    if (s.siege && now >= this.nextAmbientShot) {
      const f = FORTS.find((x) => x.id === s.siege!.fort);
      if (f) this.siegeShot(f.route, Math.random() < 0.3, now);
      this.nextAmbientShot = now + 1100 + Math.random() * 900;
    }
    for (let k = this.shots.length - 1; k >= 0; k--) {
      const sh = this.shots[k];
      const a = (now - sh.born) / sh.dur;
      if (a >= 1) {
        this.blasts.push({ x: sh.ex, y: sh.ey, born: now, big: sh.hit });
        this.shots.splice(k, 1);
        continue;
      }
      const wx = sh.sx + (sh.ex - sh.sx) * a;
      const wy = sh.sy + (sh.ey - sh.sy) * a - Math.sin(a * Math.PI) * 90;
      const p = this.toScreen(wx, wy);
      for (let tr = 1; tr <= 5; tr++) {
        const ta = Math.max(0, a - tr * 0.035);
        const tp = this.toScreen(sh.sx + (sh.ex - sh.sx) * ta, sh.sy + (sh.ey - sh.sy) * ta - Math.sin(ta * Math.PI) * 90);
        g.fillStyle = `rgba(255,${140 - tr * 15},40,${0.5 - tr * 0.08})`;
        g.beginPath();
        g.arc(tp.x, tp.y, (6 - tr * 0.8) * this.scale + 1, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = "#3a2a1a";
      g.beginPath();
      g.arc(p.x, p.y, 7 * this.scale + 2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,170,60,0.95)";
      g.beginPath();
      g.arc(p.x, p.y, 4 * this.scale + 1, 0, Math.PI * 2);
      g.fill();
    }
    if (s.siege) {
      const f = FORTS.find((x) => x.id === s.siege!.fort);
      if (f) this.drawCatapult(g, f.route, now);
    }
    for (let k = this.blasts.length - 1; k >= 0; k--) {
      const b = this.blasts[k];
      const a = (now - b.born) / (b.big ? 700 : 450);
      if (a >= 1) {
        this.blasts.splice(k, 1);
        continue;
      }
      const p = this.toScreen(b.x, b.y);
      const r = (b.big ? 46 : 24) * this.scale * (0.4 + a);
      g.globalAlpha = 1 - a;
      const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      gr.addColorStop(0, "rgba(255,240,180,1)");
      gr.addColorStop(0.4, "rgba(255,140,40,0.9)");
      gr.addColorStop(1, "rgba(120,40,10,0)");
      g.fillStyle = gr;
      g.beginPath();
      g.arc(p.x, p.y, r, 0, Math.PI * 2);
      g.fill();
      if (b.big) {
        g.fillStyle = "#5a4636";
        for (let d = 0; d < 6; d++) {
          const ang = (d / 6) * Math.PI * 2 + b.born;
          g.fillRect(p.x + Math.cos(ang) * r * 1.1, p.y + Math.sin(ang) * r * 1.1 - a * 10, 3 * this.scale + 1, 3 * this.scale + 1);
        }
      }
      g.globalAlpha = 1;
    }
  }

  private drawCatapult(g: CanvasRenderingContext2D, route: number, now: number): void {
    const f = this.fortPoint(route);
    const end = this.toWorld(f.x, f.y - 24 * this.scale);
    const p = this.toScreen(end.x - 150 * WORLD_K * 0.5, end.y + 55);
    const k = this.scale;
    const last = this.shots.length ? this.shots[this.shots.length - 1].born : -1e9;
    const swing = Math.max(0, 1 - (now - last) / 350);
    const arm = -0.35 - swing * 1.1;
    g.save();
    g.translate(p.x, p.y);
    g.fillStyle = "rgba(0,0,0,0.3)";
    g.beginPath();
    g.ellipse(0, 6 * k, 20 * k, 4 * k, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#4a2e16";
    g.lineWidth = 3.5 * k;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(-16 * k, 2 * k);
    g.lineTo(16 * k, 2 * k);
    g.moveTo(-8 * k, 2 * k);
    g.lineTo(0, -12 * k);
    g.lineTo(8 * k, 2 * k);
    g.stroke();
    g.fillStyle = "#2a1a0c";
    for (const wx of [-11, 11]) {
      g.beginPath();
      g.arc(wx * k, 4 * k, 4 * k, 0, Math.PI * 2);
      g.fill();
    }
    g.translate(0, -12 * k);
    g.rotate(arm);
    g.strokeStyle = "#6b4422";
    g.lineWidth = 2.5 * k;
    g.beginPath();
    g.moveTo(-10 * k, 0);
    g.lineTo(22 * k, 0);
    g.stroke();
    g.fillStyle = "#6b4422";
    g.beginPath();
    g.arc(22 * k, -2 * k, 3.5 * k, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  flyToRoute(i: number): void {
    const s = this.lastState;
    const ids = s ? this.frontierCities(s) : [ROUTES[i].from, ROUTES[i].to];
    this.fly = this.fitTarget(ids.length > 4 ? [ROUTES[i].from, ROUTES[i].to, ...ids.slice(-2)] : ids);
  }

  flyOverview(): void {
    this.fly = { x: WORLD_W / 2, y: WORLD_H / 2, z: this.minZoom() };
  }

  private zoomAt(cx: number, cy: number, f: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const sx = cx - rect.left;
    const sy = cy - rect.top;
    const before = this.toWorld(sx, sy);
    this.zoom = Math.min(this.maxZoom(), Math.max(this.minZoom(), this.zoom * f));
    const after = this.toWorld(sx, sy);
    this.camX += before.x - after.x;
    this.camY += before.y - after.y;
    this.clampCam();
    this.updateScales();
  }

  private onDown(e: PointerEvent): void {
    this.canvas.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.vel = { x: 0, y: 0 };
    if (this.pointers.size === 1) {
      this.pinched = false;
      this.drag = { x: e.clientX, y: e.clientY, camX: this.camX, camY: this.camY, moved: false, lastX: e.clientX, lastY: e.clientY, lastT: performance.now() };
      this.tryHold(e.clientX, e.clientY);
    } else if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const rect = this.canvas.getBoundingClientRect();
      const mid = this.toWorld((a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
      this.pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: this.zoom, wx: mid.x, wy: mid.y };
      this.pinched = true;
      this.drag = null;
      this.fly = null;
    }
  }

  private onMove(e: PointerEvent): void {
    if (!this.pointers.has(e.pointerId)) {
      if (e.pointerType === "mouse") {
        this.hover = this.hitTestClient(e.clientX, e.clientY, this.lastState, this.lastEvents);
        this.canvas.style.cursor = this.hover ? "pointer" : "grab";
      }
      return;
    }
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pinch && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const rect = this.canvas.getBoundingClientRect();
      this.zoom = Math.min(this.maxZoom(), Math.max(this.minZoom(), (this.pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / Math.max(1, this.pinch.dist)));
      const mx = (a.x + b.x) / 2 - rect.left;
      const my = (a.y + b.y) / 2 - rect.top;
      this.camX = this.pinch.wx - (mx - this.w / 2) / this.zoom;
      this.camY = this.pinch.wy - (my - this.h / 2) / this.zoom;
      this.clampCam();
      this.updateScales();
      return;
    }
    const d = this.drag;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) > 8) {
      d.moved = true;
      this.fly = null;
      if (this.holding) {
        this.holding = false;
        this.onHold(null);
      }
      this.canvas.style.cursor = "grabbing";
    }
    if (!d.moved) return;
    const now = performance.now();
    const dtm = Math.max(1, now - d.lastT) / 1000;
    this.vel = { x: (-(e.clientX - d.lastX) / this.zoom / dtm) * 0.5 + this.vel.x * 0.5, y: (-(e.clientY - d.lastY) / this.zoom / dtm) * 0.5 + this.vel.y * 0.5 };
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    d.lastT = now;
    this.camX = d.camX - dx / this.zoom;
    this.camY = d.camY - dy / this.zoom;
    this.clampCam();
  }

  private onUp(e: PointerEvent, cancel = false): void {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    const d = this.drag;
    if (this.pointers.size === 0) {
      this.pinch = null;
      this.drag = null;
      this.canvas.style.cursor = "grab";
      if (this.holding) {
        this.holding = false;
        this.onHold(null);
      }
      if (d && !d.moved && !this.pinched && !cancel) this.tap(e.clientX, e.clientY);
      if (!d || !d.moved || performance.now() - d.lastT > 80) this.vel = { x: 0, y: 0 };
    } else if (this.pointers.size === 1) {
      this.pinch = null;
    }
  }

  private tap(cx: number, cy: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = cx - rect.left;
    const y = cy - rect.top;
    const w = this.toWorld(x, y);
    this.ripples.push({ x: w.x, y: w.y, born: performance.now() });
    if (this.ripples.length > 6) this.ripples.shift();
    for (const ind of this.indicators) {
      if (Math.hypot(ind.x - x, ind.y - y) < 24) {
        this.fly = { x: ind.wx, y: ind.wy, z: Math.max(this.zoom, this.fitTarget([CITIES[0].id]).z * 0.7) };
        return;
      }
    }
    this.onTap(cx, cy);
  }

  private updateCamera(dt: number): void {
    if (!this.camInit && this.lastState && this.w > 0) {
      this.camInit = true;
      const f = this.fitTarget(this.frontierCities(this.lastState));
      if (this.lastState.lifetimeEarned <= 0) {
        this.camX = WORLD_W / 2;
        this.camY = WORLD_H / 2;
        this.zoom = this.minZoom();
        this.fly = f;
      } else {
        this.camX = f.x;
        this.camY = f.y;
        this.zoom = f.z;
      }
    }
    if (this.fly) {
      const k = 1 - Math.exp(-dt * 3.2);
      this.camX += (this.fly.x - this.camX) * k;
      this.camY += (this.fly.y - this.camY) * k;
      this.zoom += (this.fly.z - this.zoom) * k;
      if (Math.abs(this.fly.x - this.camX) < 1 && Math.abs(this.fly.y - this.camY) < 1 && Math.abs(this.fly.z - this.zoom) < 0.002) this.fly = null;
    } else if (this.pointers.size === 0 && (this.vel.x || this.vel.y)) {
      this.camX += this.vel.x * dt;
      this.camY += this.vel.y * dt;
      const decay = Math.exp(-dt * 5);
      this.vel.x *= decay;
      this.vel.y *= decay;
      if (Math.hypot(this.vel.x, this.vel.y) < 4) this.vel = { x: 0, y: 0 };
    }
    this.zoom = Math.min(this.maxZoom(), Math.max(this.minZoom(), this.zoom));
    this.clampCam();
    this.updateScales();
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
    if (e.city) {
      const p = this.cityPt(e.city);
      return { x: p.x + (e.kind === "story" ? -28 * this.scale : 0), y: p.y - 40 * this.scale };
    }
    const p = this.routePoint(e.route, e.t);
    return { x: p.x, y: p.y - 6 * this.scale };
  }

  addFloater(route: number, amount: number, now: number, force = false): void {
    if (!force && now - this.lastFloatAt[route] < 450) return;
    this.lastFloatAt[route] = now;
    const s = this.lastState;
    const trips = s ? s.routes[route].trips : 0;
    const dest = trips % 2 === 1 ? ROUTES[route].to : ROUTES[route].from;
    const p = this.cityWorld(dest);
    this.floaters.push({ x: p.x, y: p.y - 12 * WORLD_K, text: "+" + fmt(amount), color: "#ffd75e", born: now, life: 1300, big: false });
    if (this.floaters.length > 40) this.floaters.shift();
  }

  addTextAt(p: Pt, text: string, color: string, now: number): void {
    const w = this.toWorld(p.x, p.y);
    this.floaters.push({ x: w.x, y: w.y, text, color, born: now, life: 1800, big: true });
  }

  private loot: { x: number; y: number; key: string; born: number; dx: number }[] = [];

  addLoot(p: Pt, keys: string[], now: number): void {
    const w = this.toWorld(p.x, p.y);
    keys.forEach((key, k) => this.loot.push({ x: w.x, y: w.y, key, born: now + k * 120, dx: (k - (keys.length - 1) / 2) * 26 }));
  }

  private drawLoot(g: CanvasRenderingContext2D, now: number): void {
    for (let k = this.loot.length - 1; k >= 0; k--) {
      const l = this.loot[k];
      const a = (now - l.born) / 1600;
      if (a >= 1) {
        this.loot.splice(k, 1);
        continue;
      }
      if (a < 0) continue;
      const img = iconImages[l.key];
      if (!ready(img)) continue;
      const p = this.toScreen(l.x, l.y);
      const pop = a < 0.2 ? a / 0.2 : 1;
      const size = 30 * this.ui * (0.6 + 0.4 * pop);
      const x = p.x + l.dx * this.ui * pop;
      const y = p.y - 20 * this.ui - Math.sin(Math.min(a * 2, 1) * Math.PI * 0.5) * 34 * this.ui;
      g.globalAlpha = a > 0.75 ? (1 - a) / 0.25 : 1;
      g.save();
      g.shadowColor = "rgba(255,230,140,0.9)";
      g.shadowBlur = 10;
      g.drawImage(img, x - size / 2, y - size / 2, size, size);
      g.restore();
      g.globalAlpha = 1;
    }
  }

  fortPoint(route: number): Pt {
    const f = FORTS.find((x) => x.route === route);
    return f ? this.px(f.x, f.y) : this.routePoint(route, 0.5);
  }

  private monumentPt(): Pt {
    const c = CITY_BY_ID[ROUTES[0].from];
    return this.px(c.x + MONUMENT_OFFSET.dx, c.y + MONUMENT_OFFSET.dy);
  }

  private drawForts(g: CanvasRenderingContext2D, s: GameState, sc: number, u: number, time: number): void {
    const img = iconImages.fortress;
    if (!ready(img)) return;
    for (const f of FORTS) {
      if (!fortAvailable(s, f)) continue;
      const p = this.fortPoint(f.route);
      const w = 62 * sc;
      const h = (w * img.naturalHeight) / img.naturalWidth;
      if (p.x < -w || p.x > this.w + w || p.y < -h * 1.5 || p.y > this.h + h) continue;
      const taken = fortTaken(s, f.id);
      const sieged = s.siege?.fort === f.id;
      const hovered = this.hover?.type === "fort" && this.hover.id === f.id;
      g.save();
      g.fillStyle = "rgba(0,0,0,0.25)";
      g.beginPath();
      g.ellipse(p.x, p.y + 2 * sc, w * 0.45, 6 * sc, 0, 0, Math.PI * 2);
      g.fill();
      if (hovered) {
        g.shadowColor = "rgba(255,220,120,0.9)";
        g.shadowBlur = 14;
      }
      g.drawImage(taken ? this.filtered("fort_taken", img, "saturate(0.5) brightness(1.05)") : img, p.x - w / 2, p.y - h, w, h);
      g.shadowBlur = 0;
      if (taken) {
        const fx = p.x + w * 0.12;
        const fy = p.y - h * 1.02;
        g.strokeStyle = "#3a2410";
        g.lineWidth = 2 * sc;
        g.beginPath();
        g.moveTo(fx, fy);
        g.lineTo(fx, fy - 20 * sc);
        g.stroke();
        const wave = Math.sin(time * 5) * 2 * sc;
        g.fillStyle = s.house ? "#2f8a3a" : "#c9932e";
        g.beginPath();
        g.moveTo(fx, fy - 20 * sc);
        g.quadraticCurveTo(fx + 8 * sc, fy - 18 * sc + wave, fx + 15 * sc, fy - 15 * sc);
        g.lineTo(fx, fy - 10 * sc);
        g.fill();
      }
      if (sieged) {
        for (let k = 0; k < 5; k++) {
          const ph = (time * 0.6 + k / 5) % 1;
          const sx = p.x + Math.sin(k * 2.3) * w * 0.3 + Math.sin(time + k) * 4 * sc;
          const sy = p.y - h * 0.5 - ph * 40 * sc;
          g.globalAlpha = (1 - ph) * 0.55;
          g.fillStyle = "#4a4038";
          g.beginPath();
          g.arc(sx, sy, (6 + ph * 12) * sc, 0, Math.PI * 2);
          g.fill();
        }
        g.globalAlpha = 1;
        for (let k = 0; k < 4; k++) {
          const fl = 0.6 + 0.4 * Math.sin(time * 14 + k * 1.7);
          g.fillStyle = `rgba(255,${120 + k * 30},40,${0.75 * fl})`;
          g.beginPath();
          g.arc(p.x - w * 0.3 + k * w * 0.2, p.y - h * 0.35, 4.5 * sc * fl, 0, Math.PI * 2);
          g.fill();
        }
        const sg = s.siege!;
        const pip = 7 * u;
        for (let k = 0; k < FORT_WALLS; k++) {
          const x = p.x + (k - (FORT_WALLS - 1) / 2) * pip * 1.6;
          const y = p.y - h - 12 * u;
          g.fillStyle = k < FORT_WALLS - sg.walls ? "#ffd75e" : "rgba(30,15,5,0.85)";
          g.strokeStyle = "#ffd75e";
          g.lineWidth = 1.5;
          g.beginPath();
          g.arc(x, y, pip / 2, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        }
      }
      g.font = `bold ${Math.round(11 * u)}px Georgia, serif`;
      g.textAlign = "center";
      const label = `${tk("fort_" + f.id)}${taken ? " ✓" : ""}`;
      g.lineWidth = 3;
      g.strokeStyle = "rgba(30,15,5,0.9)";
      g.strokeText(label, p.x, p.y + 13 * sc);
      g.fillStyle = taken ? "#9dffaa" : sieged ? "#ffd75e" : "#ffb39a";
      g.fillText(label, p.x, p.y + 13 * sc);
      g.restore();
    }
  }

  private drawMonument(g: CanvasRenderingContext2D, s: GameState, sc: number, u: number): void {
    const st = monumentStage(s);
    if (st <= 0) return;
    const img = iconImages.monument;
    if (!ready(img)) return;
    const p = this.monumentPt();
    const w = (26 + st * 7) * sc;
    const h = (w * img.naturalHeight) / img.naturalWidth;
    const hovered = this.hover?.type === "monument";
    g.save();
    if (hovered) {
      g.shadowColor = "rgba(255,220,120,0.9)";
      g.shadowBlur = 12;
    }
    g.drawImage(img, p.x - w / 2, p.y - h, w, h);
    g.shadowBlur = 0;
    g.font = `bold ${Math.round(10 * u)}px Georgia, serif`;
    g.textAlign = "center";
    const label = `${t("monShort")} ${"★".repeat(st)}`;
    g.lineWidth = 3;
    g.strokeStyle = "rgba(30,15,5,0.9)";
    g.strokeText(label, p.x, p.y + 11 * sc);
    g.fillStyle = "#f3e2bd";
    g.fillText(label, p.x, p.y + 11 * sc);
    g.restore();
  }

  private kurganPt(): Pt {
    return this.px(KURGAN_POS.x, KURGAN_POS.y);
  }

  private drawKurgan(g: CanvasRenderingContext2D, s: GameState, sc: number, u: number): void {
    const n = Math.min(5, s.fallenHeroes.length);
    const img = iconImages.balbal;
    if (n <= 0 || !ready(img)) return;
    const p = this.kurganPt();
    const h = 30 * sc;
    const w = (h * img.naturalWidth) / img.naturalHeight;
    g.save();
    if (this.hover?.type === "kurgan") {
      g.shadowColor = "rgba(255,220,120,0.9)";
      g.shadowBlur = 12;
    }
    g.fillStyle = "rgba(60,40,20,0.35)";
    g.beginPath();
    g.ellipse(p.x, p.y, (n * 0.55 + 0.6) * w, 7 * sc, 0, 0, Math.PI * 2);
    g.fill();
    for (let k = 0; k < n; k++) {
      const ox = (k - (n - 1) / 2) * w * 0.85;
      const kh = h * (k % 2 ? 0.86 : 1);
      g.drawImage(img, p.x + ox - (w * kh) / h / 2, p.y - kh, (w * kh) / h, kh);
    }
    g.shadowBlur = 0;
    g.font = `bold ${Math.round(10 * u)}px Georgia, serif`;
    g.textAlign = "center";
    const label = t("kurganShort");
    g.lineWidth = 3;
    g.strokeStyle = "rgba(30,15,5,0.9)";
    g.strokeText(label, p.x, p.y + 11 * sc);
    g.fillStyle = "#e8d8b8";
    g.fillText(label, p.x, p.y + 11 * sc);
    g.restore();
  }

  private drawHans(g: CanvasRenderingContext2D, s: GameState, sc: number, u: number): void {
    const img = iconImages.han;
    if (s.hans.length === 0 || !ready(img)) return;
    const h = 34 * sc;
    const w = (h * img.naturalWidth) / img.naturalHeight;
    for (const i of s.hans) {
      const p = this.routePoint(i, HAN_T);
      if (p.x < -60 || p.x > this.w + 60 || p.y < -60 || p.y > this.h + 60) continue;
      const hov = this.hover?.type === "han" && this.hover.route === i;
      g.fillStyle = "rgba(50,30,12,0.45)";
      g.beginPath();
      g.ellipse(p.x, p.y + 2 * sc, w * 0.6, 7 * sc, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,215,94,0.85)";
      g.lineWidth = 1.5 * sc;
      g.stroke();
      if (hov) g.globalAlpha = 0.85;
      g.drawImage(img, p.x - w / 2, p.y - h + 4 * sc, w, h);
      g.globalAlpha = 1;
    }
    void u;
  }

  campPoint(s: GameState): Pt {
    const c = CAMP_POS[s.camp ?? "yayla"];
    return this.px(c.x, c.y);
  }

  private drawCamp(g: CanvasRenderingContext2D, s: GameState, u: number, time: number): void {
    if (!s.camp) return;
    const wanted = campWanted(Date.now());
    const ok = s.camp === wanted;
    if (!ok) {
      const q = this.px(CAMP_POS[wanted].x, CAMP_POS[wanted].y);
      g.save();
      g.setLineDash([4 * u, 4 * u]);
      g.lineDashOffset = -time * 12;
      g.strokeStyle = "rgba(255,230,150,0.85)";
      g.lineWidth = 2 * u;
      g.beginPath();
      g.arc(q.x, q.y, 16 * u, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }
    const img = iconImages[s.camp];
    if (!ready(img)) return;
    const p = this.campPoint(s);
    const r = (ok ? 17 : 17 * (1 + 0.08 * Math.sin(time * 6))) * u;
    g.save();
    g.beginPath();
    g.arc(p.x, p.y, r, 0, Math.PI * 2);
    g.closePath();
    g.save();
    g.clip();
    g.drawImage(img, p.x - r * 1.15, p.y - r * 1.15, r * 2.3, r * 2.3);
    g.restore();
    g.lineWidth = 2.5 * u;
    g.strokeStyle = ok ? "#ffd75e" : "#ff6a4a";
    g.stroke();
    g.font = `bold ${Math.round(10 * u)}px Georgia, serif`;
    g.textAlign = "center";
    const label = ok ? `${tk("camp_" + s.camp)} +${Math.round(CAMP_BONUS * 100)}%` : t("campMoveShort");
    g.lineWidth = 3;
    g.strokeStyle = "rgba(30,15,5,0.9)";
    g.strokeText(label, p.x, p.y + r + 12 * u);
    g.fillStyle = ok ? "#ffe08a" : "#ffb09a";
    g.fillText(label, p.x, p.y + r + 12 * u);
    if (!ok) {
      g.beginPath();
      g.arc(p.x + r * 0.8, p.y - r * 0.8, 7 * u, 0, Math.PI * 2);
      g.fillStyle = "#e0402a";
      g.fill();
      g.fillStyle = "#fff";
      g.font = `bold ${Math.round(10 * u)}px sans-serif`;
      g.textBaseline = "middle";
      g.fillText("!", p.x + r * 0.8, p.y - r * 0.8 + 0.5);
    }
    g.restore();
  }

  tradeWarPoint(route: number): Pt {
    return this.routePoint(route, 0.58);
  }

  private drawTradeWar(g: CanvasRenderingContext2D, s: GameState, u: number, time: number, now: number): void {
    const w = s.tradeWar;
    const img = iconImages.tradewar;
    if (!w || w.until <= now || !ready(img)) return;
    const p = this.tradeWarPoint(w.route);
    const y = p.y - 34 * u;
    const r = 17 * u;
    const pulse = 1 + 0.12 * Math.sin(time * 5);
    g.save();
    g.beginPath();
    g.arc(p.x, y, r * pulse, 0, Math.PI * 2);
    g.fillStyle = w.won ? "rgba(30,90,40,0.85)" : "rgba(110,20,14,0.85)";
    g.fill();
    g.lineWidth = 2.5 * u;
    g.strokeStyle = w.won ? "#9dffaa" : "#ff7a5c";
    g.stroke();
    g.drawImage(img, p.x - r * 0.75, y - r * 0.75, r * 1.5, r * 1.5);
    g.font = `bold ${Math.round(11 * u)}px "Trebuchet MS", sans-serif`;
    g.textAlign = "center";
    const label = w.won ? `+${Math.round((TW_BONUS - 1) * 100)}%` : `−${Math.round((1 - TW_PENALTY) * 100)}%`;
    g.lineWidth = 3;
    g.strokeStyle = "rgba(20,8,4,0.9)";
    g.strokeText(label, p.x, y + r + 12 * u);
    g.fillStyle = w.won ? "#9dffaa" : "#ffb09a";
    g.fillText(label, p.x, y + r + 12 * u);
    if (!w.won) {
      g.beginPath();
      g.moveTo(p.x, y - r - 2 * u);
      g.lineTo(p.x, y - r - 14 * u);
      g.strokeStyle = "#3a2410";
      g.lineWidth = 2 * u;
      g.stroke();
      g.fillStyle = "#c0392b";
      g.beginPath();
      const fy = y - r - 14 * u;
      g.moveTo(p.x, fy);
      g.lineTo(p.x + 11 * u + Math.sin(time * 6) * 2 * u, fy + 3 * u);
      g.lineTo(p.x, fy + 7 * u);
      g.fill();
    }
    g.restore();
  }

  private drawHeroRider(g: CanvasRenderingContext2D, s: GameState, sc: number, time: number): void {
    if (!s.hero || !s.mount) return;
    let route = 0;
    for (let i = 0; i < ROUTES.length; i++) if (s.routes[i].owned > 0) route = i;
    const horse = iconImages[mountIcon(s.mount.breed)];
    const face = heroImages["hero" + (s.hero.look + 1)];
    if (!ready(horse)) return;
    const ph = (time / 46) % 1;
    const f = 0.12 + 0.76 * (ph < 0.5 ? ph * 2 : 2 - ph * 2);
    const p = this.routePoint(route, f);
    const right = ph < 0.5 ? p.dx >= 0 : p.dx < 0;
    const h = 30 * sc;
    const w = (h * horse.naturalWidth) / horse.naturalHeight;
    const bob = Math.abs(Math.sin(time * 7)) * 2 * sc;
    const y = p.y - 14 * sc - bob;
    g.save();
    if (s.mount.breed >= 5) {
      g.shadowColor = "rgba(255,215,90,0.9)";
      g.shadowBlur = 14;
    }
    g.translate(p.x, y);
    if (!right) g.scale(-1, 1);
    g.drawImage(horse, -w / 2, -h, w, h);
    g.restore();
    const held = (it: Item | undefined, dx: number) => {
      if (!it) return;
      const img = iconImages[gearIcon(it)];
      if (!ready(img)) return;
      const ih = 20 * sc;
      const iw = (ih * img.naturalWidth) / img.naturalHeight;
      const side = right ? 1 : -1;
      g.drawImage(img, p.x + side * dx * sc - (side < 0 ? iw : 0), y - h * 0.45, iw, ih);
    };
    held(s.hero.gear.weapon, 14);
    held(s.hero.gear.shield, -16);
    if (ready(face)) {
      const r = 10 * sc;
      const cx = p.x;
      const cy = y - h - r * 0.6;
      g.save();
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fillStyle = "#2a1a0e";
      g.fill();
      g.clip();
      g.drawImage(face, cx - r, cy - r * 0.9, r * 2, (r * 2 * face.naturalHeight) / face.naturalWidth);
      g.restore();
      g.strokeStyle = "#ffd75e";
      g.lineWidth = 2 * sc;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    }
  }

  private drawEscorts(g: CanvasRenderingContext2D, s: GameState, i: number, along: number, forward: boolean, sc: number, time: number): void {
    const n = s.escorts[i] ?? 0;
    if (n <= 0) return;
    const img = iconImages["u_" + (s.escortClass[i] ?? "spear")] ?? iconImages.soldier;
    if (!ready(img)) return;
    const count = Math.min(3, 1 + Math.floor(Math.log10(n)));
    const h = 16 * sc;
    const w = (h * img.naturalWidth) / img.naturalHeight;
    for (let k = 0; k < count; k++) {
      const f = Math.min(0.99, Math.max(0.01, along + (forward ? 1 : -1) * (0.03 + k * 0.025)));
      const p = this.routePoint(i, f);
      const bob = Math.abs(Math.sin(time * 8 + k)) * 1.5 * sc;
      const side = (k % 2 === 0 ? 1 : -1) * 7 * sc;
      g.drawImage(img, p.x - w / 2 + side * 0.4, p.y - h - bob + side * 0.3, w, h);
    }
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

  private drawTerrain(g: CanvasRenderingContext2D, time: number): void {
    const tl = this.toScreen(0, 0);
    const W = WORLD_W * this.zoom;
    const H = WORLD_H * this.zoom;
    if (tl.x > 0 || tl.y > 0 || tl.x + W < this.w || tl.y + H < this.h) {
      if (this.backdrop) {
        g.imageSmoothingEnabled = true;
        g.drawImage(this.backdrop, tl.x - W * 0.3, tl.y - H * 0.3, W * 1.6, H * 1.6);
      } else {
        g.fillStyle = "#2a1c12";
        g.fillRect(0, 0, this.w, this.h);
      }
    }
    if (ready(mapImage)) {
      g.imageSmoothingQuality = "high";
      g.drawImage(mapImage, tl.x, tl.y, W, H);
    } else {
      g.fillStyle = "#d9b77e";
      g.fillRect(tl.x, tl.y, W, H);
    }
    if (this.water) {
      const { mask, noise, work } = this.water;
      const wg = work.getContext("2d")!;
      const MW = work.width;
      const MH = work.height;
      if (this.frameNo % (this.lite ? 4 : 2) === 0) {
      wg.globalCompositeOperation = "source-over";
      wg.clearRect(0, 0, MW, MH);
      const ox = (time * 6) % MW;
      const oy = (time * 2.5) % MH;
      wg.globalAlpha = 0.5 + 0.5 * Math.sin(time * 1.7);
      wg.drawImage(noise, ox, oy);
      wg.drawImage(noise, ox - MW, oy);
      wg.drawImage(noise, ox, oy - MH);
      wg.drawImage(noise, ox - MW, oy - MH);
      wg.globalAlpha = 0.5 + 0.5 * Math.cos(time * 1.3);
      wg.drawImage(noise, -ox, -oy * 0.7);
      wg.drawImage(noise, MW - ox, -oy * 0.7);
      wg.drawImage(noise, -ox, MH - oy * 0.7);
      wg.drawImage(noise, MW - ox, MH - oy * 0.7);
      wg.globalAlpha = 1;
      wg.globalCompositeOperation = "destination-in";
      wg.drawImage(mask, 0, 0);
      }
      g.save();
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.35;
      g.drawImage(work, tl.x, tl.y, W, H);
      g.restore();
    }
    g.fillStyle = SEASON_TINT[this.season];
    g.fillRect(tl.x, tl.y, W, H);
    const edge = 70 * this.zoom;
    const fog = (x0: number, y0: number, x1: number, y1: number) => {
      const gr = g.createLinearGradient(x0, y0, x1, y1);
      gr.addColorStop(0, "rgba(28,18,10,0.85)");
      gr.addColorStop(1, "rgba(28,18,10,0)");
      return gr;
    };
    g.fillStyle = fog(tl.x, 0, tl.x + edge, 0);
    g.fillRect(tl.x, tl.y, edge, H);
    g.fillStyle = fog(tl.x + W, 0, tl.x + W - edge, 0);
    g.fillRect(tl.x + W - edge, tl.y, edge, H);
    g.fillStyle = fog(0, tl.y, 0, tl.y + edge);
    g.fillRect(tl.x, tl.y, W, edge);
    g.fillStyle = fog(0, tl.y + H, 0, tl.y + H - edge);
    g.fillRect(tl.x, tl.y + H - edge, W, edge);
  }

  private drawClouds(g: CanvasRenderingContext2D, dt: number, shadow: boolean): void {
    const z = this.zoom;
    for (const c of this.clouds) {
      if (shadow) {
        c.x += dt * 9;
        if (c.x > WORLD_W + 320) c.x = -320;
      }
      const sw = 320 * c.s * z;
      const sh = 160 * c.s * z;
      if (shadow) {
        const p = this.toScreen(c.x + 60, c.y + 90);
        g.globalAlpha = 0.55;
        g.drawImage(this.cloudShadows[c.sprite], p.x - sw / 2, p.y - sh / 2, sw, sh);
      } else {
        const par = 1.18;
        const x = (c.x - this.camX) * z * par + this.w / 2;
        const y = (c.y - this.camY) * z * par + this.h / 2;
        const zoomFade = Math.min(1, Math.max(0.25, 1.35 - this.scale * 0.35));
        g.globalAlpha = 0.42 * zoomFade;
        g.drawImage(this.cloudSprites[c.sprite], x - (sw * par) / 2, y - (sh * par) / 2, sw * par, sh * par);
      }
    }
    g.globalAlpha = 1;
  }

  private drawFlocks(g: CanvasRenderingContext2D, dt: number, time: number): void {
    while (this.flocks.length < 2) {
      const left = Math.random() < 0.5;
      this.flocks.push({
        x: left ? -100 : WORLD_W + 100,
        y: 100 + Math.random() * 600,
        vx: (left ? 1 : -1) * (28 + Math.random() * 14),
        vy: (Math.random() - 0.5) * 10,
        n: 4 + Math.floor(Math.random() * 4),
        seed: Math.random() * 10,
      });
    }
    const z = this.zoom;
    for (let k = this.flocks.length - 1; k >= 0; k--) {
      const f = this.flocks[k];
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.x < -200 || f.x > WORLD_W + 200) {
        this.flocks.splice(k, 1);
        continue;
      }
      const dir = Math.sign(f.vx);
      for (let b = 0; b < f.n; b++) {
        const row = Math.ceil(b / 2);
        const side = b % 2 === 0 ? 1 : -1;
        const bx = f.x - dir * row * 14;
        const by = f.y + (b === 0 ? 0 : side * row * 9);
        const flap = Math.sin(time * 9 + f.seed + b * 0.8);
        const size = 5.5 * z;
        for (const shadow of [true, false]) {
          const p = shadow ? this.toScreen(bx + 50, by + 80) : { x: (bx - this.camX) * z * 1.25 + this.w / 2, y: (by - this.camY) * z * 1.25 + this.h / 2 };
          if (p.x < -20 || p.x > this.w + 20 || p.y < -20 || p.y > this.h + 20) continue;
          g.strokeStyle = shadow ? "rgba(20,15,10,0.18)" : "rgba(35,25,20,0.85)";
          g.lineWidth = Math.max(1, 1.4 * z);
          g.beginPath();
          g.moveTo(p.x - size, p.y - flap * size * 0.6);
          g.quadraticCurveTo(p.x - size * 0.4, p.y - size * 0.3, p.x, p.y);
          g.quadraticCurveTo(p.x + size * 0.4, p.y - size * 0.3, p.x + size, p.y - flap * size * 0.6);
          g.stroke();
        }
      }
    }
  }

  private drawDust(g: CanvasRenderingContext2D, now: number): void {
    for (let k = this.dust.length - 1; k >= 0; k--) {
      const d = this.dust[k];
      const a = (now - d.born) / 900;
      if (a >= 1) {
        this.dust.splice(k, 1);
        continue;
      }
      const p = this.toScreen(d.x, d.y - a * 6);
      g.globalAlpha = 0.35 * (1 - a);
      g.fillStyle = "rgb(222,196,150)";
      g.beginPath();
      g.arc(p.x, p.y, (2 + a * 6) * this.scale, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }

  private drawRipples(g: CanvasRenderingContext2D, now: number): void {
    for (let k = this.ripples.length - 1; k >= 0; k--) {
      const r = this.ripples[k];
      const a = (now - r.born) / 500;
      if (a >= 1) {
        this.ripples.splice(k, 1);
        continue;
      }
      const p = this.toScreen(r.x, r.y);
      g.strokeStyle = `rgba(255,235,170,${0.8 * (1 - a)})`;
      g.lineWidth = 2.5 * (1 - a) + 0.5;
      g.beginPath();
      g.ellipse(p.x, p.y, 6 + a * 26, (6 + a * 26) * 0.6, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }

  dayShift = 0;
  weather: "clear" | "sand" | "rain" = "clear";
  merchant = -1;

  private merchantPos(u: number): Pt | null {
    const def = REGIONS[this.merchant];
    if (!def) return null;
    const p = this.px(def.x, def.y);
    return { x: p.x + 34 * u, y: p.y - 22 * u };
  }

  private drawWanderer(g: CanvasRenderingContext2D, u: number, time: number): void {
    const p = this.merchantPos(u);
    if (!p) return;
    const tent = iconImages["m_tent"];
    const face = iconImages["merchant"];
    g.save();
    const glow = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 34 * u);
    glow.addColorStop(0, `rgba(255,200,90,${0.45 + 0.15 * Math.sin(time * 3)})`);
    glow.addColorStop(1, "rgba(255,160,40,0)");
    g.fillStyle = glow;
    g.fillRect(p.x - 34 * u, p.y - 34 * u, 68 * u, 68 * u);
    if (ready(tent)) {
      const h = 40 * u;
      const w = (h * tent.naturalWidth) / tent.naturalHeight;
      g.drawImage(tent, p.x - w / 2, p.y - h / 2, w, h);
    }
    if (ready(face)) {
      const bob = Math.sin(time * 2.4) * 2 * u;
      const h = 24 * u;
      const w = (h * face.naturalWidth) / face.naturalHeight;
      g.drawImage(face, p.x + 8 * u, p.y - 30 * u + bob, w, h);
    }
    g.restore();
  }

  private drawWeather(g: CanvasRenderingContext2D, u: number, time: number): void {
    if (this.weather === "clear") return;
    const w = this.w;
    const h = this.h;
    const n = this.lite ? 40 : 90;
    g.save();
    if (this.weather === "sand") {
      g.fillStyle = "rgba(200,130,50,0.24)";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        const cx = (((i * 0.31 + time * 0.05) % 1.4) - 0.2) * w;
        const cy = (0.2 + i * 0.2) * h;
        const r = 160 * u;
        const dust = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        dust.addColorStop(0, "rgba(225,165,90,0.35)");
        dust.addColorStop(1, "rgba(225,165,90,0)");
        g.fillStyle = dust;
        g.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      g.strokeStyle = "rgba(255,238,200,0.85)";
      g.lineWidth = 2.2 * u;
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const sx = (i * 0.6180339) % 1;
        const sy = (i * 0.4142135) % 1;
        const sp = 0.25 + ((i * 0.7548776) % 1) * 0.35;
        const x = ((sx + time * sp) % 1.2) * w - 0.1 * w;
        const y = sy * h + Math.sin(time * 2 + i) * 6 * u;
        const len = (18 + (i % 5) * 8) * u;
        g.moveTo(x, y);
        g.lineTo(x + len, y + len * 0.12);
      }
      g.stroke();
    } else {
      g.fillStyle = "rgba(30,50,85,0.22)";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(200,225,255,0.7)";
      g.lineWidth = 1.5 * u;
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const sx = (i * 0.6180339) % 1;
        const sy = (i * 0.4142135) % 1;
        const sp = 0.9 + ((i * 0.7548776) % 1) * 0.6;
        const y = ((sy + time * sp) % 1.1) * h - 0.05 * h;
        const x = sx * w - y * 0.18;
        g.moveTo(x, y);
        g.lineTo(x - 3 * u, y + 14 * u);
      }
      g.stroke();
    }
    g.restore();
  }

  private drawDayNight(g: CanvasRenderingContext2D, s: GameState, sc: number, now: number): void {
    const dusk = duskAmount(now);
    if (dusk > 0.01) {
      g.fillStyle = `rgba(255,120,40,${0.12 * dusk})`;
      g.fillRect(0, 0, this.w, this.h);
    }
    const n = nightAmount(now);
    if (n <= 0.01) return;
    g.fillStyle = `rgba(12,20,56,${0.45 * n})`;
    g.fillRect(0, 0, this.w, this.h);
    g.save();
    g.globalCompositeOperation = "lighter";
    for (const city of CITIES) {
      if (!this.cityVisible(s, city.id)) continue;
      const p = this.px(city.x, city.y);
      const r = 52 * sc;
      if (p.x < -r || p.x > this.w + r || p.y < -r || p.y > this.h + r) continue;
      const glow = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      const flick = 0.9 + 0.1 * Math.sin(now / 180 + city.x * 40);
      glow.addColorStop(0, `rgba(255,170,70,${0.42 * n * flick})`);
      glow.addColorStop(1, "rgba(255,120,30,0)");
      g.fillStyle = glow;
      g.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    }
    g.restore();
  }

  private drawAtmosphere(g: CanvasRenderingContext2D): void {
    const haze = g.createLinearGradient(0, 0, 0, this.h * 0.35);
    haze.addColorStop(0, "rgba(255,236,200,0.22)");
    haze.addColorStop(1, "rgba(255,236,200,0)");
    g.fillStyle = haze;
    g.fillRect(0, 0, this.w, this.h * 0.35);
    const vg = g.createRadialGradient(this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.4, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.8);
    vg.addColorStop(0, "rgba(20,10,4,0)");
    vg.addColorStop(1, "rgba(20,10,4,0.45)");
    g.fillStyle = vg;
    g.fillRect(0, 0, this.w, this.h);
  }

  private camelBaked: Record<string, HTMLCanvasElement> = {};
  lite = false;
  private frameNo = 0;
  private frameEma = 1 / 60;
  private slowSince = 0;
  private fastSince = 0;

  private adaptQuality(rawDt: number, now: number): void {
    if (rawDt <= 0 || rawDt > 0.25) return;
    this.frameEma += (rawDt - this.frameEma) * 0.05;
    if (!this.lite) {
      if (this.frameEma > 1 / 42) {
        if (!this.slowSince) this.slowSince = now;
        else if (now - this.slowSince > 3000) this.setLite(true);
      } else this.slowSince = 0;
    } else if (this.frameEma < 1 / 58) {
      if (!this.fastSince) this.fastSince = now;
      else if (now - this.fastSince > 15000) this.setLite(false);
    } else this.fastSince = 0;
  }

  private setLite(on: boolean): void {
    this.lite = on;
    this.slowSince = 0;
    this.fastSince = 0;
    this.dpr = 0;
    this.resize();
  }

  draw(s: GameState, events: MapEvent[], now: number): void {
    this.lastState = s;
    this.lastEvents = events;
    const g = this.ctx;
    const time = now / 1000;
    const rawDt = Math.max(0, (now - this.lastDraw) / 1000);
    const dt = Math.min(0.05, rawDt);
    this.lastDraw = now;
    this.adaptQuality(rawDt, now);
    this.frameNo++;
    this.updateCamera(dt);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const sc = this.scale;
    const u = this.ui;
    this.drawTerrain(g, time);
    if (!this.lite) this.drawClouds(g, dt, true);

    for (let i = 0; i < ROUTES.length; i++) {
      const owned = s.routes[i].owned > 0;
      const next = !owned && (i === 0 || s.routes[i - 1].owned > 0);
      if (!owned && !next) continue;
      const { a, b, c } = this.routeCtrl(i);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.quadraticCurveTo(c.x, c.y, b.x, b.y);
      g.lineCap = "round";
      if (owned) {
        const age = s.age;
        g.setLineDash([]);
        if (age >= 3) {
          g.strokeStyle = "rgba(255,210,90,0.22)";
          g.lineWidth = (age >= 4 ? 19 : 16) * sc;
          g.stroke();
          g.strokeStyle = "rgba(255,215,110,0.5)";
          g.lineWidth = (age >= 4 ? 11 : 9) * sc;
          g.stroke();
        }
        g.strokeStyle = age >= 1 ? "rgba(70,45,25,0.6)" : "rgba(60,35,15,0.45)";
        g.lineWidth = (7 + age * 0.9) * sc;
        g.stroke();
        if (age >= 2) {
          g.strokeStyle = "#d9a640";
          g.lineWidth = (5.6 + age * 0.6) * sc;
          g.stroke();
        }
        g.strokeStyle = age >= 1 ? "rgba(214,196,160,0.98)" : "rgba(232,208,158,0.95)";
        g.lineWidth = (4.2 + age * 0.5) * sc;
        g.stroke();
        g.setLineDash([5 * sc, 6 * sc]);
        g.lineDashOffset = s.masters[i] ? -time * 14 * sc : 0;
        g.strokeStyle = ROUTES[i].color;
        g.lineWidth = 1.6 * sc;
        g.stroke();
        g.setLineDash([]);
      } else {
        g.setLineDash([3 * sc, 6 * sc]);
        g.strokeStyle = "rgba(255,240,210,0.7)";
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

    for (const city of CITIES_BY_Y) {
      const p = this.px(city.x, city.y);
      if (p.x < -120 * sc || p.x > this.w + 120 * sc || p.y < -120 * sc || p.y > this.h + 120 * sc) continue;
      const alpha = this.cityVisible(s, city.id);
      if (this.celebrate?.id === city.id) this.drawCelebration(g, p, sc, (now - this.celebrate.born) / 1600);
      this.drawBuildings(g, s, p, sc, city.id, true);
      this.drawCity(g, p, sc, alpha, city.id);
      this.drawBuildings(g, s, p, sc, city.id, false);
    }

    for (const w of WONDERS) if (wonderVisible(s, w)) this.drawWonder(g, s, w, sc, u, time);
    this.drawMonument(g, s, sc, u);
    this.drawKurgan(g, s, sc, u);
    this.drawForts(g, s, sc, u, time);
    this.drawCamp(g, s, u, time);

    this.drawDust(g, now);
    for (let i = 0; i < ROUTES.length; i++) {
      const r = s.routes[i];
      if (r.owned <= 0) continue;
      const forward = r.trips % 2 === 0;
      const tt = tripTime(s, i);
      const active = s.masters[i] || r.running;
      if (s.masters[i] && tt < 0.8) {
        const n = 6;
        for (let k = 0; k < n; k++) {
          const ph = (time / Math.max(tt * 2, 0.6) + k / n) % 1;
          const f = ph < 0.5 ? ph * 2 : 2 - ph * 2;
          const p = this.routePoint(i, f);
          this.drawCamel(g, p.x, p.y, sc * 0.85, ph < 0.5 ? p.dx >= 0 : p.dx < 0, time * 8 + k, k === 0 ? "rider" : CAMEL_LOAD[i]);
        }
        const ph0 = (time / Math.max(tt * 2, 0.6)) % 1;
        this.drawEscorts(g, s, i, ph0 < 0.5 ? ph0 * 2 : 2 - ph0 * 2, ph0 < 0.5, sc, time);
        continue;
      }
      const count = Math.min(5, 1 + Math.floor(Math.log2(r.owned)));
      for (let k = count - 1; k >= 0; k--) {
        const f = active ? Math.max(0, r.progress - k * 0.045) : Math.max(0.03, PARK - k * 0.035);
        const along = forward ? f : 1 - f;
        const p = this.routePoint(i, along);
        const facing = forward ? p.dx >= 0 : p.dx < 0;
        this.drawCamel(g, p.x, p.y, sc, facing, active ? time * 9 + k : 0, k === 0 && s.masters[i] ? "rider" : CAMEL_LOAD[i]);
        if (i === this.whipRoute && k === 0) this.drawWhip(g, p.x, p.y, sc, time);
      }
      const leadF = active ? r.progress : PARK;
      this.drawEscorts(g, s, i, forward ? leadF : 1 - leadF, forward, sc, active ? time : 0);
      if (!active) {
        const p = this.routePoint(i, forward ? PARK : 1 - PARK);
        this.drawSendBubble(g, p.x, p.y - 30 * sc, u, time);
      }
    }

    this.drawRival(g, sc, time);
    this.drawHeroRider(g, s, sc, time);
    this.drawShots(g, s, now);
    this.drawTitan(g, s, sc, u, time, now);
    if (!this.lite) this.drawFlocks(g, dt, time);
    this.drawClouds(g, dt, false);
    this.drawHans(g, s, sc, u);
    this.drawCourt(g, s, u, time);
    this.drawNodes(g, s, u, time, Date.now());
    this.drawRegions(g, s, u, time, Date.now());
    this.drawWanderer(g, u, time);
    this.drawAtmosphere(g);
    this.drawWeather(g, u, time);
    this.drawDayNight(g, s, sc, Date.now() + this.dayShift);

    for (const city of CITIES) {
      const p = this.px(city.x, city.y);
      if (p.x < -100 || p.x > this.w + 100 || p.y < -60 || p.y > this.h + 80) continue;
      this.drawCityLabel(g, p, sc, u, this.cityVisible(s, city.id), tk("city_" + city.id), s.cityLevels[city.id] ?? 0);
      if (this.buildable.has(city.id)) this.drawBuildBadge(g, p, sc, u, time);
    }

    this.drawGovernors(g, s, sc, u);
    this.drawFestival(g, u, time, Date.now());
    this.drawTradeWar(g, s, u, time, Date.now());
    this.drawStorm(g, u, time, Date.now());
    this.drawParticles(g, u, dt);
    if (this.order) this.drawOrder(g, sc, u, time, this.order);
    if (this.traveler) this.drawTraveler(g, u, time);

    for (const e of events) {
      const p = this.eventPoint(e);
      const remain = 1 - (now - e.born) / e.life;
      const hovered = this.hover?.type === "event" && this.hover.id === e.id;
      const boss = e.kind === "bandit" ? nemesisById(s, e.boss) : undefined;
      if (boss) this.drawBoss(g, p, u, time, remain, hovered, boss.look, `${nemesisName(boss)} · ${t("nemLevel", { n: boss.level })}`);
      else if (e.kind === "bandit") this.drawBandit(g, p, u, time, remain, hovered);
      else if (e.kind === "story") this.drawStory(g, p, u, time, remain, hovered);
      else this.drawMerchant(g, p, u, time, remain, hovered);
    }

    g.textAlign = "center";
    for (let k = this.floaters.length - 1; k >= 0; k--) {
      const f = this.floaters[k];
      const a = (now - f.born) / f.life;
      if (a >= 1) {
        this.floaters.splice(k, 1);
        continue;
      }
      const p = this.toScreen(f.x, f.y);
      const y = p.y - a * (f.big ? 40 : 28) * u;
      g.globalAlpha = a < 0.7 ? 1 : 1 - (a - 0.7) / 0.3;
      g.font = `bold ${Math.round((f.big ? 18 : 14) * u)}px "Trebuchet MS", sans-serif`;
      g.lineWidth = 3.5;
      g.strokeStyle = "rgba(40,20,5,0.9)";
      g.strokeText(f.text, p.x, y);
      g.fillStyle = f.color;
      g.fillText(f.text, p.x, y);
      g.globalAlpha = 1;
    }

    this.drawLoot(g, now);
    this.drawRipples(g, now);
    this.drawIndicators(g, events, time);
  }

  private drawIndicators(g: CanvasRenderingContext2D, events: MapEvent[], time: number): void {
    this.indicators = [];
    const items: { p: Pt; color: string; glyph: string }[] = [];
    for (const e of events) items.push({ p: this.eventPoint(e), color: e.kind === "bandit" ? "#d63a24" : e.kind === "story" ? "#8a5cd6" : "#c99a2e", glyph: e.kind === "bandit" ? "⚔" : e.kind === "story" ? "✦" : "$" });
    if (this.traveler) {
      const c = this.cityPt(this.traveler.city);
      items.push({ p: { x: c.x, y: c.y - 50 * this.scale }, color: this.traveler.ready ? "#3f9b4f" : "#2f6fb0", glyph: this.traveler.ready ? "✓" : "!" });
    }
    if (this.order) items.push({ p: this.cityPt(this.order.city), color: "#8a5a20", glyph: "✉" });
    const m = 22;
    for (const it of items) {
      const { p } = it;
      if (p.x >= 0 && p.x <= this.w && p.y >= 0 && p.y <= this.h) continue;
      const x = Math.min(this.w - m, Math.max(m, p.x));
      const y = Math.min(this.h - m, Math.max(m, p.y));
      const ang = Math.atan2(p.y - y, p.x - x);
      const w = this.toWorld(p.x, p.y);
      this.indicators.push({ x, y, wx: w.x, wy: w.y });
      const pulse = 1 + Math.sin(time * 5) * 0.08;
      g.save();
      g.translate(x, y);
      g.save();
      g.rotate(ang);
      g.fillStyle = it.color;
      g.beginPath();
      g.moveTo(22 * pulse, 0);
      g.lineTo(10, -8);
      g.lineTo(10, 8);
      g.closePath();
      g.fill();
      g.restore();
      g.fillStyle = "rgba(25,14,6,0.85)";
      g.strokeStyle = it.color;
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(0, 0, 13 * pulse, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = "#fff3d0";
      g.font = 'bold 13px "Trebuchet MS", sans-serif';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(it.glyph, 0, 1);
      g.restore();
    }
  }

  private drawCity(g: CanvasRenderingContext2D, p: Pt, sc: number, alpha: number, id: string): void {
    const img = cityImages[id];
    if (!ready(img)) return;
    const w = 70 * sc;
    const h = (w * img.naturalHeight) / img.naturalWidth;
    g.save();
    g.fillStyle = "rgba(25,15,5,0.28)";
    g.beginPath();
    g.ellipse(p.x + 4 * sc, p.y + 12 * sc, w * 0.5, w * 0.17, 0, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = alpha >= 1 ? 1 : 0.6 + alpha * 0.3;
    g.drawImage(alpha < 1 ? this.filtered("c_" + id, img, "grayscale(0.8) brightness(0.95)") : img, p.x - w / 2, p.y + 16 * sc - h, w, h);
    g.restore();
  }

  private drawBuildings(g: CanvasRenderingContext2D, s: GameState, p: Pt, sc: number, id: string, behind: boolean): void {
    const lv = s.cityLevels[id] ?? 0;
    const b = s.cityBuild?.id === id ? s.cityBuild : null;
    BUILDING_SLOTS.forEach((slot, k) => {
      if (slot.behind !== behind) return;
      const building = b && b.level === k + 1;
      if (lv < k + 1 && !building) return;
      const img = buildingImages[building ? "scaffold" : slot.id];
      if (!ready(img)) return;
      const w = slot.w * sc;
      const h = (w * img.naturalHeight) / img.naturalWidth;
      const x = p.x + slot.dx * sc;
      const y = p.y + slot.dy * sc;
      g.drawImage(img, x - w / 2, y - h, w, h);
      if (building) {
        const total = BUILD_SECONDS[k] * 1000;
        const f = Math.min(1, Math.max(0, 1 - (b.until - Date.now()) / total));
        const bw = 28 * sc;
        g.fillStyle = "rgba(30,18,8,0.85)";
        g.fillRect(x - bw / 2 - 1, y + 3 * sc - 1, bw + 2, 4 * sc + 2);
        g.fillStyle = "#ffd75e";
        g.fillRect(x - bw / 2, y + 3 * sc, bw * f, 4 * sc);
      }
    });
  }

  private spawnParticle(fresh: boolean): Omit<Particle, "kind"> {
    const W = this.w;
    const H = this.h;
    const sc = this.ui;
    const r = Math.random;
    switch (this.season) {
      case "spring":
        return { x: r() * W, y: fresh ? r() * H : -10, vx: 12 + r() * 14, vy: 16 + r() * 14, rot: r() * 6, vr: (r() - 0.5) * 4, size: (2.5 + r() * 2) * sc, color: r() < 0.5 ? "#f7b7c8" : "#fde3ea" };
      case "summer":
        return { x: fresh ? r() * W : -20, y: r() * H, vx: 70 + r() * 60, vy: (r() - 0.5) * 8, rot: 0, vr: 0, size: (8 + r() * 16) * sc, color: "rgba(214,160,80,0.35)" };
      case "autumn":
        return { x: r() * W, y: fresh ? r() * H : -10, vx: -8 + r() * 24, vy: 20 + r() * 18, rot: r() * 6, vr: (r() - 0.5) * 5, size: (3 + r() * 2.5) * sc, color: ["#c8501e", "#e08a2c", "#a8321a", "#d9a441"][Math.floor(r() * 4)] };
      case "winter":
        return { x: r() * W, y: fresh ? r() * H : -6, vx: -6 + r() * 12, vy: 18 + r() * 22, rot: 0, vr: 0, size: (1.2 + r() * 2) * sc, color: "rgba(255,255,255,0.9)" };
    }
  }

  private drawParticles(g: CanvasRenderingContext2D, sc: number, dt: number): void {
    const want = { spring: 34, summer: 26, autumn: 30, winter: 90 }[this.season];
    const initial = this.particles.length === 0;
    let born = 0;
    while (this.particles.length < want && (initial || born < 2)) {
      this.particles.push({ ...this.spawnParticle(initial), kind: this.season });
      born++;
    }
    g.save();
    for (let k = this.particles.length - 1; k >= 0; k--) {
      const p = this.particles[k];
      p.x += (p.vx + Math.sin(p.rot) * 8) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const kind = p.kind;
      if (p.y > this.h + 12 || p.x > this.w + 30 || p.x < -30 || (kind !== this.season && Math.random() < 0.03)) {
        this.particles.splice(k, 1);
        continue;
      }
      g.fillStyle = p.color;
      if (kind === "summer") {
        g.fillRect(p.x, p.y, p.size, 1.2 * sc);
      } else if (kind === "winter") {
        g.beginPath();
        g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        g.fill();
      } else {
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.beginPath();
        g.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
    }
    g.restore();
  }

  private drawOrder(g: CanvasRenderingContext2D, sc: number, u: number, time: number, o: Order): void {
    const p = this.cityPt(o.city);
    const x = p.x + 36 * sc;
    const y = p.y - 48 * sc + Math.sin(time * 3) * 2 * u;
    const w = 46 * u;
    const h = 30 * u;
    const remain = Math.max(0, (o.deadline - Date.now()) / (o.deadline - o.born));
    g.save();
    g.fillStyle = "rgba(40,22,8,0.35)";
    g.beginPath();
    g.roundRect(x - w / 2 + 2, y - h / 2 + 3, w, h, 9 * u);
    g.fill();
    g.fillStyle = "#f6e7c1";
    g.strokeStyle = remain < 0.25 ? "#c0392b" : "#8a5a20";
    g.lineWidth = 2 * u;
    g.beginPath();
    g.roundRect(x - w / 2, y - h / 2, w, h, 9 * u);
    g.moveTo(x - 10 * u, y + h / 2);
    g.lineTo(x - 16 * u, y + h / 2 + 8 * u);
    g.lineTo(x - 3 * u, y + h / 2);
    g.fill();
    g.stroke();
    g.fillStyle = "#c9932e";
    g.fillRect(x - w / 2 + 4 * u, y + h / 2 - 5 * u, (w - 8 * u) * remain, 2.5 * u);
    const img = iconImages[ROUTES[o.route].id];
    if (ready(img)) {
      const s = 21 * u;
      g.drawImage(img, x - w / 2 + 3 * u, y - s / 2 - 2 * u, s, s);
    }
    g.fillStyle = "#3d240c";
    g.font = `bold ${Math.round(11 * u)}px "Trebuchet MS", sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(`${Math.min(o.got, o.need)}/${o.need}`, x + 11 * u, y - 2 * u);
    g.restore();
  }

  private drawBuildBadge(g: CanvasRenderingContext2D, p: Pt, sc: number, u: number, time: number): void {
    const x = p.x - 34 * sc;
    const y = p.y - 34 * sc + Math.sin(time * 4) * 2 * u;
    const r = 9 * u;
    g.save();
    g.fillStyle = "#3f9b4f";
    g.strokeStyle = "#fff3c4";
    g.lineWidth = 1.5 * u;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(x, y - r * 0.6);
    g.lineTo(x + r * 0.5, y);
    g.lineTo(x + r * 0.2, y);
    g.lineTo(x + r * 0.2, y + r * 0.55);
    g.lineTo(x - r * 0.2, y + r * 0.55);
    g.lineTo(x - r * 0.2, y);
    g.lineTo(x - r * 0.5, y);
    g.closePath();
    g.fill();
    g.restore();
  }

  private drawCelebration(g: CanvasRenderingContext2D, p: Pt, sc: number, a: number): void {
    if (a >= 1) {
      this.celebrate = null;
      return;
    }
    g.save();
    g.globalAlpha = 1 - a;
    const r = (20 + a * 70) * sc;
    const glow = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    glow.addColorStop(0, "rgba(255,230,140,0.9)");
    glow.addColorStop(1, "rgba(255,230,140,0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(p.x, p.y, r, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffd75e";
    for (let k = 0; k < 14; k++) {
      const ang = (k / 14) * Math.PI * 2;
      const d = (10 + a * 60) * sc;
      g.beginPath();
      g.arc(p.x + Math.cos(ang) * d, p.y - 10 * sc + Math.sin(ang) * d * 0.7, 2.2 * sc, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  private drawCityLabel(g: CanvasRenderingContext2D, p: Pt, sc: number, u: number, alpha: number, name: string, level = 0): void {
    const y = p.y + 24 * sc + 8 * u;
    if (p.x < -80 || p.x > this.w + 80 || y < -30 || y > this.h + 30) return;
    g.save();
    g.globalAlpha = alpha >= 1 ? 1 : 0.55 + alpha * 0.3;
    g.font = `bold ${Math.round(12 * u)}px Georgia, serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const tw = g.measureText(name).width;
    const pw = tw + 18 * u;
    const ph = 19 * u;
    g.fillStyle = "rgba(28,16,6,0.82)";
    g.strokeStyle = alpha >= 1 ? "#c9932e" : "rgba(180,160,130,0.7)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.roundRect(p.x - pw / 2, y - ph / 2, pw, ph, ph / 2);
    g.fill();
    g.stroke();
    g.fillStyle = alpha >= 1 ? "#ffe9b0" : "#d8ccb8";
    g.fillText(name, p.x, y + 0.5);
    if (level > 0) {
      g.font = `bold ${Math.round(11 * u)}px Georgia, serif`;
      g.lineWidth = 3;
      g.strokeStyle = "rgba(28,16,6,0.9)";
      const stars = "★".repeat(level);
      g.strokeText(stars, p.x, y + ph * 0.95);
      g.fillStyle = "#ffd75e";
      g.fillText(stars, p.x, y + ph * 0.95);
    }
    g.restore();
  }

  private camelSprite(kind: string): HTMLCanvasElement | null {
    const cached = this.camelBaked[kind];
    if (cached) return cached;
    const img = camelImages[kind];
    if (!ready(img)) return null;
    const pad = 6;
    const k = Math.min(1, 96 / img.naturalWidth);
    const w = Math.round(img.naturalWidth * k);
    const h = Math.round(img.naturalHeight * k);
    const c = document.createElement("canvas");
    c.width = w + pad * 2;
    c.height = h + pad * 2;
    const cg = c.getContext("2d")!;
    cg.fillStyle = "rgba(30,18,6,0.32)";
    cg.beginPath();
    cg.ellipse(c.width / 2 + w * 0.066, pad + h - 1, w * 0.36, w * 0.09, 0, 0, Math.PI * 2);
    cg.fill();
    cg.shadowColor = "rgba(20,10,0,0.75)";
    cg.shadowBlur = Math.max(2, w / 12);
    cg.drawImage(img, pad, pad, w, h);
    this.camelBaked[kind] = c;
    return c;
  }

  private drawCamel(g: CanvasRenderingContext2D, x: number, y: number, sc: number, right: boolean, phase: number, kind: string): void {
    const m = 40 * sc;
    if (x < -m || x > this.w + m || y < -m || y > this.h + m) return;
    const spr = this.camelSprite(kind);
    if (!spr) return;
    if (phase && !this.lite && this.dust.length < 80 && Math.random() < 0.05) {
      const wp = this.toWorld(x + (right ? -8 : 8) * sc, y + 3 * sc);
      this.dust.push({ x: wp.x, y: wp.y, born: performance.now() });
    }
    const pad = 6;
    const w = 30 * sc;
    const ratio = w / (spr.width - pad * 2);
    const h = (spr.height - pad * 2) * ratio;
    g.save();
    g.translate(x, y);
    if (!right) g.scale(-1, 1);
    if (phase) g.rotate(Math.sin(phase) * 0.035);
    g.drawImage(spr, -w / 2 - pad * ratio, 4 * sc - h - pad * ratio - (phase ? Math.abs(Math.sin(phase)) * 1.2 * sc : 0), spr.width * ratio, spr.height * ratio);
    g.restore();
  }

  private drawSendBubble(g: CanvasRenderingContext2D, x: number, y: number, u: number, time: number): void {
    const bob = Math.sin(time * 5) * 3 * u;
    const r = 11 * u;
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

  private drawBoss(g: CanvasRenderingContext2D, p: Pt, sc: number, time: number, remain: number, hovered: boolean, look: number, label: string): void {
    const r = (hovered ? 27 : 24) * sc;
    const pulse = 1 + Math.sin(time * 6) * 0.08;
    const img = nemesisImages["nem" + (look + 1)];
    g.save();
    const glow = g.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, r * 2 * pulse);
    glow.addColorStop(0, "rgba(220,30,20,0.6)");
    glow.addColorStop(1, "rgba(220,30,20,0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(p.x, p.y, r * 2 * pulse, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2a0d08";
    g.beginPath();
    g.arc(p.x, p.y, r, 0, Math.PI * 2);
    g.fill();
    if (ready(img)) {
      g.save();
      g.beginPath();
      g.arc(p.x, p.y, r - 2, 0, Math.PI * 2);
      g.clip();
      const w = r * 2.1;
      g.drawImage(img, p.x - w / 2, p.y - r * 1.02, w, (w * img.naturalHeight) / img.naturalWidth);
      g.restore();
    }
    this.ring(g, p, r + 3, remain, "#ff3a2a");
    g.strokeStyle = "#ffd75e";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(p.x, p.y, r, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#ffd75e";
    g.font = `bold ${Math.round(15 * sc)}px sans-serif`;
    g.textAlign = "center";
    g.fillText("☠", p.x, p.y - r - 2);
    g.font = `bold ${Math.round(12 * sc)}px "Trebuchet MS", sans-serif`;
    g.lineWidth = 3;
    g.strokeStyle = "#2a0d05";
    g.strokeText(label, p.x, p.y + r + 16 * sc);
    g.fillStyle = "#ff8a6a";
    g.fillText(label, p.x, p.y + r + 16 * sc);
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

  private ghosts: Record<string, HTMLCanvasElement> = {};

  private filtered(key: string, img: HTMLImageElement, filter: string): HTMLCanvasElement {
    let c = this.ghosts[key];
    if (c) return c;
    c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const cg = c.getContext("2d")!;
    cg.filter = filter;
    cg.drawImage(img, 0, 0);
    this.ghosts[key] = c;
    return c;
  }

  private wonderGhost(id: string, img: HTMLImageElement): HTMLCanvasElement {
    return this.filtered("w_" + id, img, "sepia(0.8) brightness(1.1) contrast(0.8)");
  }

  private wonderPt(w: WonderDef): Pt {
    const c = CITY_BY_ID[w.city];
    return this.px(c.x + w.dx, c.y + w.dy);
  }

  private drawWonder(g: CanvasRenderingContext2D, s: GameState, w: WonderDef, sc: number, u: number, time: number): void {
    const img = wonderImages[w.id];
    if (!ready(img)) return;
    const p = this.wonderPt(w);
    const st = wonderStage(s, w.id);
    const dw = 118 * sc;
    const dh = (dw * img.naturalHeight) / img.naturalWidth;
    const x = p.x - dw / 2;
    const y = p.y - dh * 0.8;
    if (x > this.w || x + dw < 0 || y > this.h || y + dh < 0) return;
    const hovered = this.hover?.type === "wonder" && this.hover.id === w.id;
    g.save();
    if (st < WONDER_STAGES) {
      g.globalAlpha = hovered ? 0.7 : 0.5;
      g.drawImage(this.wonderGhost(w.id, img), x, y, dw, dh);
      g.globalAlpha = 1;
    }
    if (st > 0) {
      const frac = st / WONDER_STAGES;
      const top = y + dh * (1 - frac) * 0.9;
      g.save();
      g.beginPath();
      g.rect(x - 4, top, dw + 8, y + dh - top + 4);
      g.clip();
      g.drawImage(img, x, y, dw, dh);
      g.restore();
      if (st < WONDER_STAGES) {
        g.strokeStyle = "rgba(120,80,40,0.9)";
        g.lineWidth = 1.4 * sc;
        for (let k = 0; k <= 6; k++) {
          const xx = x + dw * (0.15 + k * 0.12);
          g.beginPath();
          g.moveTo(xx, top - 8 * sc);
          g.lineTo(xx, top + 14 * sc);
          g.stroke();
        }
        g.beginPath();
        g.moveTo(x + dw * 0.12, top - 2 * sc);
        g.lineTo(x + dw * 0.88, top - 2 * sc);
        g.stroke();
      }
    }
    if (st === 0 && s.age >= w.age) {
      const b = 1 + Math.sin(time * 4) * 0.1;
      g.fillStyle = "rgba(25,14,6,0.85)";
      g.strokeStyle = "#ffd75e";
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(p.x, y + dh * 0.4, 14 * u * b, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = "#ffd75e";
      g.font = `bold ${Math.round(16 * u)}px "Trebuchet MS", sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("⚒", p.x, y + dh * 0.4 + 1);
      g.textBaseline = "alphabetic";
    }
    g.font = `bold ${Math.round(11 * u)}px Georgia, serif`;
    g.textAlign = "center";
    const label = `${tk("wonder_" + w.id)} ${st >= WONDER_STAGES ? "★" : `${st}/${WONDER_STAGES}`}`;
    g.lineWidth = 3;
    g.strokeStyle = "rgba(30,15,5,0.9)";
    g.strokeText(label, p.x, p.y + 16 * sc);
    g.fillStyle = st >= WONDER_STAGES ? "#ffd75e" : "#f3e2bd";
    g.fillText(label, p.x, p.y + 16 * sc);
    g.restore();
  }

  private drawStory(g: CanvasRenderingContext2D, p: Pt, u: number, time: number, remain: number, hovered: boolean): void {
    const r = (hovered ? 21 : 18) * u;
    const q = { x: p.x, y: p.y + Math.sin(time * 2.6) * 3 * u };
    g.save();
    const glow = g.createRadialGradient(q.x, q.y, 2, q.x, q.y, r * 2.4);
    glow.addColorStop(0, `rgba(190,150,255,${0.55 + 0.25 * Math.sin(time * 4)})`);
    glow.addColorStop(1, "rgba(190,150,255,0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(q.x, q.y, r * 2.4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2a1838";
    g.beginPath();
    g.arc(q.x, q.y, r, 0, Math.PI * 2);
    g.fill();
    this.ring(g, q, r + 3, remain, "#c9a6ff");
    const img = iconImages.scroll;
    if (ready(img)) {
      const s = r * 1.5;
      g.drawImage(img, q.x - s / 2, q.y - s / 2, s, (s * img.naturalHeight) / img.naturalWidth);
    }
    g.font = `bold ${Math.round(12 * u)}px "Trebuchet MS", sans-serif`;
    g.textAlign = "center";
    g.lineWidth = 3;
    g.strokeStyle = "#1a0d24";
    g.strokeText(t("storyLabel"), q.x, q.y - r - 8);
    g.fillStyle = "#e4d2ff";
    g.fillText(t("storyLabel"), q.x, q.y - r - 8);
    g.restore();
  }

  private travelerPoint(u: number, time: number): Pt {
    const p = this.cityPt(this.traveler!.city);
    return { x: p.x, y: p.y - 50 * this.scale - 6 * u + Math.sin(time * 2.2) * 2.5 * u };
  }

  private drawTraveler(g: CanvasRenderingContext2D, u: number, time: number): void {
    const tv = this.traveler!;
    const q = this.travelerPoint(u, time);
    const r = (this.hover?.type === "traveler" ? 22 : 19) * u;
    g.save();
    const pulse = 0.5 + 0.5 * Math.sin(time * 4);
    const glow = g.createRadialGradient(q.x, q.y, r * 0.6, q.x, q.y, r * 2.1);
    glow.addColorStop(0, `rgba(255,220,120,${0.55 + pulse * 0.3})`);
    glow.addColorStop(1, "rgba(255,220,120,0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(q.x, q.y, r * 2.1, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f3e2b8";
    g.beginPath();
    g.arc(q.x, q.y, r, 0, Math.PI * 2);
    g.fill();
    const img = travelerImages[tv.id];
    if (ready(img)) {
      g.save();
      g.beginPath();
      g.arc(q.x, q.y, r - 1, 0, Math.PI * 2);
      g.clip();
      const w = r * 2.1;
      const h = (w * img.naturalHeight) / img.naturalWidth;
      g.drawImage(img, q.x - w / 2, q.y - r * 0.95, w, h);
      g.restore();
    }
    g.lineWidth = 3 * u;
    g.strokeStyle = "#c9932e";
    g.beginPath();
    g.arc(q.x, q.y, r, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 1;
    g.strokeStyle = "#5a3510";
    g.stroke();
    const bx = q.x + r * 0.75;
    const by = q.y - r * 0.75;
    const br = 8 * u * (1 + pulse * 0.12);
    g.fillStyle = tv.ready ? "#3f9b4f" : "#c0392b";
    g.beginPath();
    g.arc(bx, by, br, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#fff3c4";
    g.lineWidth = 1.5 * u;
    g.stroke();
    g.fillStyle = "#fff";
    g.font = `bold ${Math.round(11 * u)}px "Trebuchet MS", sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(tv.ready ? "✓" : "!", bx, by + 0.5);
    g.restore();
  }

  beginStorm(route: number, now: number): void {
    this.stormRoute = route;
    this.stormUntil = now + 12_000;
    this.stormBolts = Array.from({ length: 18 }, (_, i) => ({
      id: now + i + 1,
      t: Math.min(0.92, 0.08 + ((i % 9) + 0.35) / 10 + (i >= 9 ? 0.04 : 0)),
      born: now + (i % 9) * 220,
    }));
  }

  stormLive(now: number): boolean {
    return now < this.stormUntil;
  }

  firstStorm(now: number): number {
    return this.stormBolts.find((b) => b.born <= now)?.id ?? 0;
  }

  takeStorm(id: number, now: number): Pt | null {
    const i = this.stormBolts.findIndex((b) => b.id === id && b.born <= now);
    if (i < 0) return null;
    const p = this.stormPoint(this.stormBolts[i], now);
    this.stormBolts.splice(i, 1);
    if (this.stormBolts.length === 0) this.stormUntil = now;
    return p;
  }

  consumeStormEnd(now: number): boolean {
    if (!this.stormUntil || now < this.stormUntil) return false;
    this.stormUntil = 0;
    this.stormBolts = [];
    return true;
  }

  private stormPoint(b: { t: number; born: number; id: number }, now: number): Pt {
    const p = this.routePoint(this.stormRoute, b.t);
    const drop = Math.min(1, Math.max(0, now - b.born) / 600);
    return { x: p.x + Math.sin(b.id) * 6 * this.ui, y: p.y - (1 - drop) * 70 * this.ui };
  }

  private drawStorm(g: CanvasRenderingContext2D, u: number, time: number, now: number): void {
    if (!this.stormLive(now)) return;
    const live = this.stormBolts.filter((b) => b.born <= now);
    for (const b of live) {
      const p = this.stormPoint(b, now);
      const r = (12 + Math.sin(time * 8 + b.id) * 1.5) * u;
      g.beginPath();
      g.fillStyle = "#f2c14e";
      g.strokeStyle = "#fff6d0";
      g.lineWidth = 2 * u;
      g.arc(p.x, p.y, r, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = "#6a3a08";
      g.font = `bold ${Math.round(12 * u)}px "Trebuchet MS", sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("✦", p.x, p.y + 0.5);
    }
    if (live.length === 0) return;
    const anchor = this.routePoint(this.stormRoute, 0.5);
    const label = `${t("stormBanner")} ${Math.ceil((this.stormUntil - now) / 1000)}`;
    g.font = `bold ${Math.round(13 * u)}px "Trebuchet MS", sans-serif`;
    const w = g.measureText(label).width + 18 * u;
    g.fillStyle = "rgba(42,24,8,0.88)";
    g.strokeStyle = "#f2c14e";
    g.lineWidth = 1.5 * u;
    g.beginPath();
    g.roundRect(anchor.x - w / 2, anchor.y - 58 * u, w, 20 * u, 8 * u);
    g.fill();
    g.stroke();
    g.fillStyle = "#ffe7a8";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, anchor.x, anchor.y - 48 * u);
  }

  private tryHold(cx: number, cy: number): void {
    const hit = this.hitTestClient(cx, cy, this.lastState, this.lastEvents);
    if (hit?.type === "route") {
      this.holding = true;
      this.onHold(hit.route);
    }
  }

  private drawWhip(g: CanvasRenderingContext2D, x: number, y: number, sc: number, time: number): void {
    g.save();
    g.strokeStyle = "rgba(255, 220, 120, 0.9)";
    g.lineWidth = 2 * sc;
    for (let k = 0; k < 3; k++) {
      const o = (k - 1) * 7 * sc;
      g.beginPath();
      g.moveTo(x + o, y - 34 * sc);
      g.lineTo(x + o + Math.sin(time * 18 + k) * 4 * sc, y - 48 * sc);
      g.stroke();
    }
    g.restore();
  }

  private drawRival(g: CanvasRenderingContext2D, sc: number, time: number): void {
    const rv = this.rival;
    if (!rv) return;
    for (let k = 2; k >= 0; k--) {
      const f = Math.max(0.02, Math.min(0.98, rv.t - k * 0.045));
      const p = this.routePoint(rv.route, f);
      this.drawCamel(g, p.x, p.y - 8 * sc, sc * 0.82, p.dx >= 0, time * 9 + k, k === 0 ? "rider" : CAMEL_LOAD[rv.route]);
      if (k === 0) {
        g.fillStyle = "#c0392b";
        g.strokeStyle = "#fff3c4";
        g.lineWidth = 1.5 * sc;
        g.beginPath();
        g.arc(p.x, p.y - 46 * sc, 7 * sc, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
    }
  }

  private drawNodes(g: CanvasRenderingContext2D, s: GameState, u: number, time: number, now: number): void {
    if (s.tutorial < 5) return;
    for (let k = 0; k < NODES.length; k++) {
      if (!nodeOpen(s, k)) continue;
      const n = NODES[k];
      const p = this.px(n.x, n.y);
      if (p.x < -30 || p.x > this.w + 30 || p.y < -30 || p.y > this.h + 30) continue;
      const live = nodeReady(s, k, now);
      const r = 14 * u;
      g.save();
      if (live) {
        const ph = (time * 0.8 + k * 0.37) % 1;
        g.strokeStyle = `rgba(255,213,106,${0.7 * (1 - ph)})`;
        g.lineWidth = 2.5 * u;
        g.beginPath();
        g.arc(p.x, p.y, r + ph * 12 * u, 0, Math.PI * 2);
        g.stroke();
      }
      g.globalAlpha = live ? 1 : 0.55;
      g.fillStyle = n.kind === "ruin" ? "rgba(60,30,80,0.85)" : "rgba(40,26,14,0.82)";
      g.strokeStyle = live ? "#ffd56a" : "rgba(200,170,110,0.6)";
      g.lineWidth = 2 * u;
      g.beginPath();
      g.arc(p.x, p.y, r, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      if (!live) {
        const total = n.kind === "ruin" ? RUIN_MS : GATHER_MS;
        const left = Math.max(0, (s.nodeAt[k] ?? 0) - now) / total;
        g.strokeStyle = "rgba(255,213,106,0.85)";
        g.beginPath();
        g.arc(p.x, p.y, r + 2 * u, -Math.PI / 2, -Math.PI / 2 + (1 - left) * Math.PI * 2);
        g.stroke();
      }
      const img = iconImages[NODE_ICON[n.kind]];
      if (ready(img)) {
        const bob = live ? Math.sin(time * 3 + k) * 1.5 * u : 0;
        const h = 18 * u;
        const w = (h * img.naturalWidth) / img.naturalHeight;
        g.drawImage(img, p.x - w / 2, p.y - h / 2 + bob, w, h);
      }
      g.restore();
    }
  }

  private drawRegions(g: CanvasRenderingContext2D, s: GameState, u: number, time: number, now: number): void {
    if (s.tutorial < 5) return;
    for (let k = 0; k < REGIONS.length; k++) {
      if (!regionVisible(s, k)) continue;
      const def = REGIONS[k];
      const rg = s.regions[k];
      const p = this.px(def.x, def.y);
      if (p.x < -40 || p.x > this.w + 40 || p.y < -40 || p.y > this.h + 40) continue;
      const revolt = s.revolt === k || s.incursion?.k === k;
      const live = rg.open && now >= rg.at;
      const conq = regionConquered(s, k);
      const r = 21 * u;
      g.save();
      if (revolt || live) {
        const ph = (time * 0.7 + k * 0.29) % 1;
        g.strokeStyle = revolt ? `rgba(255,80,40,${0.8 * (1 - ph)})` : `rgba(255,213,106,${0.65 * (1 - ph)})`;
        g.lineWidth = 3 * u;
        g.beginPath();
        g.arc(p.x, p.y, r + ph * 14 * u, 0, Math.PI * 2);
        g.stroke();
      }
      g.globalAlpha = rg.open ? 1 : 0.7;
      const grad = g.createRadialGradient(p.x, p.y - r * 0.4, r * 0.2, p.x, p.y, r);
      grad.addColorStop(0, revolt ? "#7a2414" : conq ? "#6b4a10" : "#3c2a18");
      grad.addColorStop(1, revolt ? "#3a0c06" : "#1c120a");
      g.fillStyle = grad;
      g.strokeStyle = revolt ? "#ff6a3d" : conq ? "#ffd56a" : rg.open ? "#d9b26a" : "#8a7a60";
      g.lineWidth = 2.5 * u;
      g.beginPath();
      g.arc(p.x, p.y, r, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      const img = iconImages[s.incursion?.k === k ? "swords" : revolt ? "revolt" : rg.open ? "village" : "lock"];
      if (ready(img)) {
        const h = (rg.open ? 30 : 20) * u;
        const w = (h * img.naturalWidth) / img.naturalHeight;
        g.drawImage(img, p.x - w / 2, p.y - h / 2, w, h);
      }
      g.globalAlpha = 1;
      g.font = `700 ${11.5 * u}px Cinzel, Georgia, serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      const label = tk("reg_" + def.id) + (rg.open ? ` · ${rg.lv}` : "");
      const tw = g.measureText(label).width + 12 * u;
      g.fillStyle = "rgba(20,12,6,0.82)";
      g.fillRect(p.x - tw / 2, p.y + r + 2 * u, tw, 16 * u);
      g.fillStyle = conq ? "#ffd56a" : "#f3e4c0";
      g.fillText(label, p.x, p.y + r + 10 * u);
      if (s.incursion?.k === k) {
        const left = Math.max(0, Math.ceil((s.incursion.until - now) / 1000));
        const txt = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
        g.font = `800 ${12 * u}px sans-serif`;
        const w2 = g.measureText(txt).width + 10 * u;
        g.fillStyle = "#a8200f";
        g.fillRect(p.x - w2 / 2, p.y - r - 18 * u, w2, 15 * u);
        g.fillStyle = "#fff";
        g.fillText(txt, p.x, p.y - r - 10.5 * u);
      }
      const youth = Math.floor(rg.youth);
      if (rg.open && youth > 0 && !revolt) {
        g.fillStyle = "#3f8f3a";
        g.beginPath();
        g.arc(p.x + r * 0.8, p.y - r * 0.8, 7 * u, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#fff";
        g.font = `700 ${9 * u}px sans-serif`;
        g.fillText(String(youth), p.x + r * 0.8, p.y - r * 0.8 + 0.5 * u);
      }
      g.restore();
    }
  }

  private drawGovernors(g: CanvasRenderingContext2D, s: GameState, sc: number, u: number): void {
    for (const [city, id] of Object.entries(s.governors)) {
      const c = CITY_BY_ID[city];
      const img = compImages[id];
      if (!c || !ready(img)) continue;
      const p = this.px(c.x, c.y);
      const r = 11 * u;
      const cx = p.x + 26 * sc + 8 * u;
      const cy = p.y - 16 * sc;
      g.save();
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fillStyle = "#2a1a0e";
      g.fill();
      g.clip();
      g.drawImage(img, cx - r, cy - r * 0.9, r * 2, (r * 2 * img.naturalHeight) / img.naturalWidth);
      g.restore();
      g.strokeStyle = "#7fd6ff";
      g.lineWidth = 2 * u;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    }
  }

  private drawCourt(g: CanvasRenderingContext2D, s: GameState, u: number, time: number): void {
    if (s.tutorial < 5) return;
    const p = this.px(COURT_POS.x, COURT_POS.y);
    if (p.x < -40 || p.x > this.w + 40 || p.y < -40 || p.y > this.h + 40) return;
    const waiting = !!s.court;
    g.save();
    g.fillStyle = waiting ? "rgba(120, 24, 24, 0.92)" : "rgba(70, 28, 18, 0.75)";
    g.strokeStyle = waiting ? "#ffd56a" : "rgba(212, 168, 84, 0.7)";
    g.lineWidth = 2 * u;
    g.beginPath();
    g.roundRect(p.x - 16 * u, p.y - 10 * u, 32 * u, 18 * u, 3 * u);
    g.fill();
    g.stroke();
    const img = iconImages[waiting ? "crown" : "seal"];
    if (ready(img)) {
      const bob = waiting ? Math.sin(time * 4) * 2 * u : 0;
      const h = 22 * u;
      const w = (h * img.naturalWidth) / img.naturalHeight;
      g.drawImage(img, p.x - w / 2, p.y - h - 6 * u + bob, w, h);
    }
    g.font = `bold ${Math.round(10 * u)}px Georgia, serif`;
    g.textAlign = "center";
    g.lineWidth = 3;
    g.strokeStyle = "rgba(20,10,4,0.9)";
    g.strokeText(t("courtShort"), p.x, p.y + 16 * u);
    g.fillStyle = "#f3e2bc";
    g.fillText(t("courtShort"), p.x, p.y + 16 * u);
    g.restore();
  }

  private drawFestival(g: CanvasRenderingContext2D, u: number, time: number, now: number): void {
    const f = activeFestival(now);
    if (!f) return;
    if (f.id === "panayir") {
      for (const c of CITIES) {
        const p = this.px(c.x + 0.025, c.y + 0.035);
        g.fillStyle = "#9b2c2c";
        g.fillRect(p.x - 10 * u, p.y - 16 * u, 22 * u, 6 * u);
        g.fillStyle = "#e6c15a";
        g.fillRect(p.x - 8 * u, p.y - 10 * u, 18 * u, 10 * u);
      }
    } else if (f.id === "nevruz") {
      for (const c of [CITIES[1], CITIES[3], CITIES[6]]) {
        const p = this.px(c.x, c.y);
        const h = (14 + Math.sin(time * 7 + c.x * 10) * 5) * u;
        g.fillStyle = "rgba(255,140,40,0.9)";
        g.beginPath();
        g.moveTo(p.x, p.y - 22 * u - h);
        g.lineTo(p.x - 7 * u, p.y - 16 * u);
        g.lineTo(p.x + 7 * u, p.y - 16 * u);
        g.fill();
      }
    } else if (f.id === "yelda") {
      g.fillStyle = "rgba(255,214,130,0.92)";
      for (let i = 0; i < 10; i++) {
        const x = ((i * 97 + time * 14) % (this.w + 30)) - 10;
        const y = 24 * u + (i % 5) * 22 * u;
        g.beginPath();
        g.arc(x, y, 3.5 * u, 0, Math.PI * 2);
        g.fill();
      }
    } else if (f.id === "hidrellez") {
      g.strokeStyle = "#3faf55";
      g.lineWidth = 2 * u;
      for (let i = 0; i < 7; i++) {
        const p = this.px(0.15 + i * 0.11, 0.12 + (i % 3) * 0.06);
        g.beginPath();
        g.moveTo(p.x, p.y);
        g.quadraticCurveTo(p.x + 12 * u, p.y + 16 * u, p.x + Math.sin(time + i) * 4 * u, p.y + 34 * u);
        g.stroke();
      }
    }
  }

  hitTestClient(cx: number, cy: number, s: GameState | null, events: MapEvent[]): MapHit {
    if (!s) return null;
    const rect = this.canvas.getBoundingClientRect();
    const x = cx - rect.left;
    const y = cy - rect.top;
    const sc = this.scale;
    const u = this.ui;
    if (this.traveler) {
      const q = this.travelerPoint(u, performance.now() / 1000);
      if (Math.hypot(q.x - x, q.y - y) < 28 * u) return { type: "traveler" };
    }
    if (s && s.tutorial >= 5) {
      if (this.merchant >= 0) {
        const m = this.merchantPos(u);
        if (m && Math.hypot(m.x - x, m.y - y) < 24 * u) return { type: "merchant" };
      }
      for (let k = 0; k < REGIONS.length; k++) {
        if (!regionVisible(s, k)) continue;
        const p = this.px(REGIONS[k].x, REGIONS[k].y);
        if (Math.hypot(p.x - x, p.y - y) < 24 * u) return { type: "region", k };
      }
      for (let k = 0; k < NODES.length; k++) {
        if (!nodeOpen(s, k)) continue;
        const p = this.px(NODES[k].x, NODES[k].y);
        if (Math.hypot(p.x - x, p.y - y) < 20 * u) return { type: "node", k };
      }
    }
    if (s && s.tutorial >= 5) {
      const p = this.px(COURT_POS.x, COURT_POS.y);
      if (Math.hypot(p.x - x, p.y - y) < 28 * u) return { type: "court" };
    }
    if (this.rival) {
      const p = this.routePoint(this.rival.route, Math.min(0.98, this.rival.t));
      if (Math.hypot(p.x - x, p.y - 20 * u - y) < 28 * u) return { type: "rival" };
    }
    if (s) {
      for (let i = 0; i < ROUTES.length; i++) {
        const r = s.routes[i];
        if (r.owned <= 0 || (!r.running && !s.masters[i])) continue;
        const forward = r.trips % 2 === 0;
        const p = this.routePoint(i, forward ? r.progress : 1 - r.progress);
        if (Math.hypot(p.x - x, p.y - 16 * u - y) < 26 * u) return { type: "route", route: i };
      }
    }
    if (this.stormLive(Date.now())) {
      for (const b of this.stormBolts) {
        if (b.born > Date.now()) continue;
        const p = this.stormPoint(b, Date.now());
        if (Math.hypot(p.x - x, p.y - y) < 24 * u) return { type: "storm", id: b.id };
      }
    }
    if (s.titan) {
      const p = this.titanPoint();
      const th = this.titanHeight();
      if (Math.abs(p.x - x) < th * 0.4 + 20 && y < p.y + 80 * u && y > p.y - th * 1.05) return { type: "titan" };
    }
    if (s.tradeWar && s.tradeWar.until > Date.now()) {
      const p = this.tradeWarPoint(s.tradeWar.route);
      if (Math.hypot(p.x - x, p.y - 34 * u - y) < 26 * u) return { type: "tradewar" };
    }
    for (const e of events) {
      const p = this.eventPoint(e);
      if (Math.hypot(p.x - x, p.y - y) < 30 * u) return { type: "event", id: e.id };
    }
    for (let i = 0; i < ROUTES.length; i++) {
      const r = s.routes[i];
      if (r.owned <= 0 || s.masters[i] || r.running) continue;
      const p = this.routePoint(i, r.trips % 2 === 0 ? PARK : 1 - PARK);
      if (Math.hypot(p.x - x, p.y - 30 * sc - y) < 22 * u + 6) return { type: "route", route: i };
      if (Math.hypot(p.x - x, p.y - 10 * sc - y) < 18 * sc) return { type: "route", route: i };
    }
    for (const w of WONDERS) {
      if (!wonderVisible(s, w)) continue;
      const p = this.wonderPt(w);
      if (Math.abs(p.x - x) < 52 * sc && y < p.y + 12 * sc && y > p.y - 95 * sc) return { type: "wonder", id: w.id };
    }
    for (const f of FORTS) {
      if (!fortAvailable(s, f)) continue;
      const p = this.fortPoint(f.route);
      if (Math.abs(p.x - x) < 32 * sc && y < p.y + 14 * sc && y > p.y - 55 * sc) return { type: "fort", id: f.id };
    }
    if (monumentStage(s) > 0) {
      const p = this.monumentPt();
      if (Math.abs(p.x - x) < 22 * sc && y < p.y + 12 * sc && y > p.y - 50 * sc) return { type: "monument" };
    }
    if (s.fallenHeroes.length > 0) {
      const p = this.kurganPt();
      if (Math.abs(p.x - x) < 40 * sc && y < p.y + 14 * sc && y > p.y - 36 * sc) return { type: "kurgan" };
    }
    if (s.camp) {
      for (const c of [CAMP_POS.yayla, CAMP_POS.kislak]) {
        const p = this.px(c.x, c.y);
        if (Math.hypot(p.x - x, p.y - y) < 24 * u) return { type: "camp" };
      }
    }
    for (const i of s.hans) {
      const p = this.routePoint(i, HAN_T);
      if (Math.abs(p.x - x) < 22 * sc && y < p.y + 8 * sc && y > p.y - 34 * sc) return { type: "han", route: i };
    }
    let best: MapHit = null;
    let bestD = Math.max(24, 40 * sc);
    for (const city of CITIES) {
      const p = this.px(city.x, city.y);
      const d = Math.hypot(p.x - x, p.y - 10 * sc - y);
      if (d < bestD) {
        bestD = d;
        best = { type: "city", id: city.id };
      }
    }
    return best;
  }
}
