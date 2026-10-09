import { Application, Assets, Container, Graphics, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { CITIES, GH, GW, H, NH, NW, TW, W, type World } from "../world/gen";
import type { Camera } from "./camera";
import type { Game } from "../game/game";
import { CITY_NAME, NODE_SPRITE, armySize } from "../game/data";
import { CAPITAL, SLAVE_RADIUS } from "../game/state";
import { FACTIONS, citiesOf, type FactionId } from "../game/factions";
import { nemName } from "../game/nemesis";
import { TOMBS, tombOf } from "../game/deep";
import { FORT_TIERS, type FortOwner } from "../game/forts";
import { SEASONS } from "../game/seasons";
import { alongPath, seaPath } from "../game/hazar";
import { tamgaCanvas, type Tamga } from "../game/ozan";
import { boyOf } from "../game/korkut";
import { t as tr } from "../i18n";
import { settings } from "../settings";
import { terrainMesh, type TerrainMesh } from "./terrain";
import { Life } from "./life";

const urls: Record<string, string> = {};
for (const [p, u] of Object.entries(import.meta.glob<string>("../assets/**/*.webp", { eager: true, query: "?url", import: "default" }))) {
  const parts = p.split("/");
  urls[parts[parts.length - 2] + "/" + parts[parts.length - 1].replace(".webp", "")] = u;
}

export function assetUrl(key: string): string {
  return urls[key] ?? urls["icons/" + key] ?? "";
}

const FOG_UP = 4;
const RIVAL_COL: Record<string, number> = { peace: 0xe8d39a, ally: 0x6fe07a, war: 0xff4a3a, vassal: 0xffc94a, dead: 0x888888 };
const LABEL_STYLE = { fontFamily: "Georgia, serif", fontSize: 26, fill: "#fff3d6", stroke: { color: "#2a1606", width: 6 }, fontWeight: "bold" as const };

const fortColor = (o: FortOwner): string => (o === "me" ? "#ffd36a" : o === "harami" ? "#ff8a70" : FACTIONS[o].color);

function makeAtlas(): { tex: Texture; trees: Texture[]; peaks: Texture[] } {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 128;
  const g = c.getContext("2d")!;
  const pine = (ox: number, dark: string, light: string) => {
    g.fillStyle = "rgba(0,0,0,0.25)";
    g.beginPath();
    g.ellipse(ox + 32, 58, 14, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#5a3a1e";
    g.fillRect(ox + 30, 46, 5, 12);
    for (let k = 0; k < 3; k++) {
      const y = 8 + k * 12;
      const w = 10 + k * 6;
      g.fillStyle = dark;
      g.beginPath();
      g.moveTo(ox + 32, y);
      g.lineTo(ox + 32 + w, y + 20);
      g.lineTo(ox + 32 - w, y + 20);
      g.fill();
      g.fillStyle = light;
      g.beginPath();
      g.moveTo(ox + 32, y);
      g.lineTo(ox + 32 - w, y + 20);
      g.lineTo(ox + 30, y + 20);
      g.fill();
    }
  };
  const round = (ox: number, dark: string, light: string) => {
    g.fillStyle = "rgba(0,0,0,0.25)";
    g.beginPath();
    g.ellipse(ox + 32, 58, 16, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#5a3a1e";
    g.fillRect(ox + 30, 40, 5, 18);
    g.fillStyle = dark;
    g.beginPath();
    g.arc(ox + 32, 30, 17, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = light;
    g.beginPath();
    g.arc(ox + 27, 25, 10, 0, Math.PI * 2);
    g.fill();
  };
  pine(0, "#244a2a", "#3d6e3a");
  pine(64, "#2c5530", "#4a7d40");
  round(128, "#3f6b2e", "#62913f");
  round(192, "#4f6e2a", "#7a9a45");
  const peak = (ox: number, top: number, px: number, base: string, lit: string, dark: string, snow: boolean) => {
    const L = ox + 6;
    const Rr = ox + 122;
    const tx = ox + px;
    g.fillStyle = "rgba(0,0,0,0.2)";
    g.beginPath();
    g.ellipse(ox + 64, 120, 60, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = base;
    g.beginPath();
    g.moveTo(L, 120);
    g.quadraticCurveTo(tx - 30, top + 40, tx, top);
    g.quadraticCurveTo(tx + 30, top + 44, Rr, 120);
    g.fill();
    g.fillStyle = lit;
    g.beginPath();
    g.moveTo(L, 120);
    g.quadraticCurveTo(tx - 30, top + 40, tx, top);
    g.lineTo(tx - 6, top + 40);
    g.lineTo(tx + 2, top + 64);
    g.lineTo(tx - 10, 120);
    g.fill();
    g.fillStyle = dark;
    g.beginPath();
    g.moveTo(tx, top);
    g.quadraticCurveTo(tx + 30, top + 44, Rr, 120);
    g.lineTo(tx + 26, 120);
    g.lineTo(tx + 12, top + 50);
    g.fill();
    if (snow) {
      g.fillStyle = "#f2f5f8";
      g.beginPath();
      g.moveTo(tx, top);
      g.lineTo(tx + 16, top + 26);
      g.lineTo(tx + 7, top + 22);
      g.lineTo(tx + 1, top + 32);
      g.lineTo(tx - 7, top + 21);
      g.lineTo(tx - 15, top + 26);
      g.fill();
    }
  };
  peak(256, 54, 58, "#8f7a5c", "#b5a07c", "#6c5a42", false);
  peak(384, 24, 70, "#7d7266", "#a8998a", "#5a5148", false);
  peak(512, 8, 60, "#7a7068", "#a99c90", "#544c46", true);
  const tex = Texture.from(c);
  const sub = (x: number, y: number, w: number, h: number) => new Texture({ source: tex.source, frame: new Rectangle(x, y, w, h) });
  return { tex, trees: [0, 64, 128, 192].map((x) => sub(x, 0, 64, 64)), peaks: [256, 384, 512].map((x) => sub(x, 0, 128, 128)) };
}

interface Marker {
  sp: Container;
  x: number;
  y: number;
  label?: Text;
}

export class WorldView {
  layer = new Container();
  private deco = new Container();
  private places = new Container();
  private labels = new Container();
  /** Sisin üstünde kalan şehir adları; eski haritalardaki mürekkep yazılar gibi. */
  private ink = new Container();
  private units = new Container();
  private pathG = new Graphics();
  private fxG = new Graphics();
  private fog!: Sprite;
  private fogCanvas = document.createElement("canvas");
  private fogSmall = document.createElement("canvas");
  private fogPaper = document.createElement("canvas");
  private paperTex: HTMLCanvasElement | null = null;
  private night = new Graphics();
  private seasonG = new Graphics();
  private snowG = new Graphics();
  private seasonK = "";
  private clouds = new Container();
  private lights = new Container();
  private troops = new Container();
  fogDirty = true;
  private tex: Record<string, Texture> = {};
  private villageM: Marker[] = [];
  private campM: Marker[] = [];
  private nodeM: Marker[] = [];
  private ruinM: Marker[] = [];
  private kurganM: Marker[] = [];
  private kaleM: Marker[] = [];
  private kaleF: Sprite[] = [];
  private fortM: Marker | null = null;
  private gateM: Marker | null = null;
  private peakM: Marker | null = null;
  private boyM: Marker | null = null;
  private boyK = "";
  private otagM: Marker | null = null;
  private kipM: Marker[] | null = null;
  private seraiF = new Map<string, Sprite>();
  private ownF = new Map<string, Sprite>();
  private rivalsM = new Map<string, { c: Container; st: string }>();
  private compM = new Map<string, Container>();
  private trail: number[] = [];
  private cityM: Marker[] = [];
  private hero!: Container;
  private heroCount!: Text;
  private heroFlag!: Sprite;
  private heroTamga!: Sprite;
  private tamgaKey = "";
  private heroBars!: Graphics;
  private bandits = new Map<number, Container>();
  private marchesM = new Map<number, Container>();
  private caravansM = new Map<number, Container>();
  private stormC = new Container();
  private stormM = new Map<number, { glow: Sprite; g: Graphics; flash: number }>();
  private glow!: Texture;
  private terrain: TerrainMesh | null = null;
  private life: Life | null = null;
  private mark: { x: number; y: number; t: number } | null = null;
  private time = 0;
  private visT = 0;

  constructor(private app: Application, private world: World) {}

  async load(): Promise<void> {
    const keys = Object.keys(urls);
    await Promise.all(keys.map(async (k) => (this.tex[k] = await Assets.load<Texture>(urls[k]))));
    if (!settings.eco) {
      try {
        this.terrain = terrainMesh(this.world, { sand: this.tex["tex/sand"], steppe: this.tex["tex/steppe"], grass: this.tex["tex/grass"], rock: this.tex["tex/rock"] });
        this.layer.addChild(this.terrain.mesh);
      } catch (e) {
        console.warn("terrain shader", e);
        this.terrain = null;
      }
    }
    if (!this.terrain) {
      const terrain = new Sprite(Texture.from(this.world.canvas));
      terrain.scale.set(W / TW);
      this.layer.addChild(terrain);
    }
    this.layer.addChild(this.pathG);
    this.buildDeco();
    this.layer.addChild(this.deco);
    this.layer.addChild(this.seasonG);
    this.buildPlaces();
    this.layer.addChild(this.places);
    this.layer.addChild(this.labels);
    this.layer.addChild(this.units);
    this.layer.addChild(this.fxG);
    this.glow = this.glowTex();
    this.layer.addChild(this.stormC);
    this.buildAmbience();
    this.fogSmall.width = NW;
    this.fogSmall.height = NH;
    this.fogCanvas.width = this.fogPaper.width = NW * FOG_UP;
    this.fogCanvas.height = this.fogPaper.height = NH * FOG_UP;
    this.fog = new Sprite(Texture.from(this.fogCanvas));
    this.fog.scale.set(W / this.fogCanvas.width, H / this.fogCanvas.height);
    this.layer.addChild(this.fog);
    this.layer.addChild(this.ink);
    this.app.stage.addChild(this.layer);
    this.buildHero();
  }

  /** Keşfedilmemiş toprakların eski harita kâğıdı: lekeler, lifler, ince tarama. */
  private parchment(): HTMLCanvasElement {
    if (this.paperTex) return this.paperTex;
    const c = document.createElement("canvas");
    const w = (c.width = this.fogCanvas.width);
    const h = (c.height = this.fogCanvas.height);
    const g = c.getContext("2d")!;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const base = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.7);
    base.addColorStop(0, "#b8935a");
    base.addColorStop(1, "#7a5a32");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const r = 3 + rnd() ** 3 * 46;
      g.fillStyle = rnd() < 0.55 ? `rgba(70,44,18,${0.03 + rnd() * 0.05})` : `rgba(235,210,160,${0.03 + rnd() * 0.05})`;
      g.beginPath();
      g.ellipse(rnd() * w, rnd() * h, r, r * (0.5 + rnd() * 0.5), rnd() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    g.lineWidth = 0.6;
    for (let i = 0; i < 700; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const a = rnd() * Math.PI;
      const l = 3 + rnd() * 10;
      g.strokeStyle = `rgba(60,38,16,${0.08 + rnd() * 0.1})`;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
    g.strokeStyle = "rgba(60,38,16,0.07)";
    g.lineWidth = 0.8;
    for (let d = -h; d < w; d += 9) {
      g.beginPath();
      g.moveTo(d, h);
      g.lineTo(d + h, 0);
      g.stroke();
    }
    return (this.paperTex = c);
  }

  private glowTex(): Texture {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.35, "rgba(255,255,255,0.45)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return Texture.from(c);
  }

  private buildAmbience(): void {
    const glow = this.glowTex();
    for (let k = 0; k < 9; k++) {
      const s = new Sprite(glow);
      s.anchor.set(0.5);
      s.tint = 0x1a120a;
      s.alpha = 0.16;
      s.width = 700 + ((k * 337) % 500);
      s.height = s.width * 0.55;
      s.position.set(((k * 1931) % W), ((k * 787) % H));
      this.clouds.addChild(s);
    }
    this.layer.addChild(this.clouds);
    this.layer.addChild(this.snowG);
    this.layer.addChild(this.night);
    for (const c of CITIES) {
      const s = new Sprite(glow);
      s.anchor.set(0.5);
      s.tint = 0xffb050;
      s.width = s.height = c.id === CAPITAL.id ? 340 : 260;
      s.position.set(c.x, c.y - 10);
      s.blendMode = "add";
      this.lights.addChild(s);
    }
    this.torch = new Sprite(glow);
    this.torch.anchor.set(0.5);
    this.torch.tint = 0xffa040;
    this.torch.width = this.torch.height = 230;
    this.torch.blendMode = "add";
    this.lights.addChild(this.torch);
    this.layer.addChild(this.lights);
  }

  private torch!: Sprite;
  private campFires: Sprite[] = [];

  private drawStorms(game: Game, dt: number): void {
    const live = new Set<number>();
    for (const st of game.s.storms) {
      live.add(st.id);
      let m = this.stormM.get(st.id);
      if (!m) {
        const glow = new Sprite(this.glow);
        glow.anchor.set(0.5);
        glow.tint = st.kind === "kum" ? 0xd9b47a : 0x46566e;
        const g = new Graphics();
        this.stormC.addChild(glow, g);
        m = { glow, g, flash: 0 };
        this.stormM.set(st.id, m);
      }
      const k = Math.max(0, Math.min(1, st.age / 6, st.life / 6));
      const sand = st.kind === "kum";
      m.glow.position.set(st.x, st.y);
      m.glow.width = st.r * 2.6;
      m.glow.height = st.r * 2.3;
      if (!sand && m.flash <= 0 && Math.random() < dt * 0.12) m.flash = 0.25;
      m.flash -= dt;
      m.glow.tint = !sand && m.flash > 0 ? 0xb8c8ff : sand ? 0xb4823e : 0x26324a;
      m.glow.alpha = k * (sand ? 0.85 : 0.7) + (m.flash > 0 ? 0.3 : 0);
      const g = m.g;
      g.clear();
      if (sand) {
        for (let i = 0; i < 26; i++) {
          const h1 = ((i * 2654435761 + 99) >>> 0) / 4294967296;
          const h2 = ((i * 40503 + 7) >>> 0) % 1000 / 1000;
          const a = h1 * Math.PI * 2 + this.time * 0.15;
          const rr = Math.sqrt(h2) * st.r * 0.85;
          const x = st.x + Math.cos(a) * rr + Math.sin(this.time * 0.7 + i) * 18;
          const y = st.y + Math.sin(a) * rr * 0.8;
          g.circle(x, y, 26 + (i % 5) * 9);
        }
        g.fill({ color: 0xd2a660, alpha: k * 0.16 });
      }
      const n = sand ? 280 : 230;
      const wx = sand ? 1 : 0.35;
      const wy = sand ? 0.18 : 1;
      const L = st.r * 0.9;
      for (let i = 0; i < n; i++) {
        const h1 = ((i * 2654435761) >>> 0) / 4294967296;
        const h2 = ((i * 2246822519 + 13) >>> 0) / 4294967296;
        const h3 = ((i * 3266489917 + 7) >>> 0) / 4294967296;
        const a = h1 * Math.PI * 2;
        const rr = Math.sqrt(h2) * st.r;
        const shift = (((this.time * (sand ? 140 : 260) + h3 * L) % L) + L) % L - L / 2;
        const x = st.x + Math.cos(a) * rr + wx * shift;
        const y = st.y + Math.sin(a) * rr + wy * shift;
        const edge = 1 - Math.hypot(x - st.x, y - st.y) / st.r;
        if (edge <= 0) continue;
        const len = sand ? 10 + h3 * 14 : 12 + h3 * 10;
        g.moveTo(x, y).lineTo(x + wx * len, y + wy * len);
      }
      g.stroke({ color: sand ? 0xf6deaa : 0xcfe0fa, width: sand ? 2.4 : 1.6, alpha: k * (sand ? 0.8 : 0.7) });
    }
    for (const [id, m] of this.stormM) if (!live.has(id)) {
      m.glow.destroy();
      m.g.destroy();
      this.stormM.delete(id);
    }
  }

  t(key: string): Texture {
    return this.tex[key] ?? this.tex["icons/" + key] ?? Texture.WHITE;
  }

  private occF = new Map<string, Sprite>();

  private smoke(x: number, y: number, k: number, color = 0x4a4038, sc = 1): void {
    const g = this.fxG;
    for (let i = 0; i < 8; i++) {
      const ph = (this.time * 0.22 + i / 8 + x * 0.0007) % 1;
      const px = x + (Math.sin(this.time * 0.8 + i * 1.7) * 14 + ph * 40) * sc;
      g.circle(px, y - ph * 170 * sc, (14 + ph * 38) * sc).fill({ color, alpha: (1 - ph) * 0.5 * k });
    }
  }

  /** Dünyanın nabzı haritada: cepheler, işgal sancakları, kıtlık dumanı, kuraklık, kurt gözleri. */
  private drawPulse(game: Game, inv: number): void {
    const s = game.s;
    const w = s.wd;
    if (!w) return;
    const g = this.fxG;
    const col = (f: FactionId) => parseInt(FACTIONS[f].color.slice(1), 16);
    const pos = (id: string) => CITIES.find((c) => c.id === id)!;
    for (const war of w.wars) {
      const ca = citiesOf(war.a).map(pos);
      const cb = citiesOf(war.b).map(pos);
      let best: [{ x: number; y: number }, { x: number; y: number }] | null = null;
      for (const a of ca) for (const b of cb) if (!best || Math.hypot(a.x - b.x, a.y - b.y) < Math.hypot(best[0].x - best[1].x, best[0].y - best[1].y)) best = [a, b];
      if (!best) continue;
      const [A, B] = best;
      const k = 0.5 + Math.max(-0.3, Math.min(0.3, (war.score / 100) * 0.3 + war.takes * 0.04));
      const fx = A.x + (B.x - A.x) * k;
      const fy = A.y + (B.y - A.y) * k;
      if (!game.isExplored(fx, fy) && !game.isExplored(A.x, A.y) && !game.isExplored(B.x, B.y)) continue;
      for (const [P, f] of [[A, war.a], [B, war.b]] as const) {
        const d = Math.hypot(fx - P.x, fy - P.y);
        const n = Math.floor(d / 70);
        for (let i = 1; i < n; i++) {
          const ph = (i / n + this.time * 0.04) % 1;
          if (ph < 0.12) continue;
          const x = P.x + (fx - P.x) * ph;
          const y = P.y + (fy - P.y) * ph + Math.sin(this.time * 9 + i) * 1.5;
          g.circle(x, y, 10 * inv).fill({ color: 0x1a0e04, alpha: 0.55 });
          g.circle(x, y - 1, 7 * inv).fill({ color: col(f), alpha: 0.95 });
          g.rect(x - 1 * inv, y - 20 * inv, 2 * inv, 16 * inv).fill({ color: 0xe8e0d0, alpha: 0.9 });
        }
        const bx = P.x + (fx - P.x) * 0.82;
        const by = P.y + (fy - P.y) * 0.82;
        g.rect(bx - 1.5 * inv, by - 40 * inv, 3 * inv, 40 * inv).fill({ color: 0x2a1606 });
        g.poly([bx, by - 40 * inv, bx + (fx > P.x ? 22 : -22) * inv, by - 33 * inv + Math.sin(this.time * 5) * 2, bx, by - 26 * inv]).fill({ color: col(f) });
      }
      const pr = (this.time * 0.9) % 1;
      g.circle(fx, fy, 50 + pr * 90).stroke({ color: 0xff5030, width: 4, alpha: 0.6 * (1 - pr) });
      for (let i = 0; i < 9; i++) {
        const a = i * 0.7 + this.time * 3;
        const r = 18 + ((i * 37 + Math.floor(this.time * 8)) % 30);
        g.circle(fx + Math.cos(a) * r, fy - 10 + Math.sin(a) * r * 0.6, 2.5 * inv).fill({ color: 0xffd080, alpha: 0.5 + 0.5 * Math.sin(this.time * 20 + i) });
      }
      this.smoke(fx, fy - 10, 1, 0x3a3430, inv);
      const sw = 22 * inv;
      g.moveTo(fx - sw, fy - sw - 30).lineTo(fx + sw, fy + sw - 30).moveTo(fx + sw, fy - sw - 30).lineTo(fx - sw, fy + sw - 30).stroke({ color: 0xfff0d0, width: 5 * inv, alpha: 0.9 });
    }
    for (const c of CITIES) {
      const occ = w.occ[c.id];
      let f = this.occF.get(c.id);
      if (occ && !f) {
        f = new Sprite(this.t("tug"));
        f.anchor.set(0.5, 1);
        f.scale.set(96 / f.texture.height);
        f.position.set(c.x + 4, c.y - 56);
        this.places.addChild(f);
        this.occF.set(c.id, f);
      }
      if (f) {
        f.visible = !!occ && !s.owned[c.id];
        if (occ) f.tint = col(occ);
        f.rotation = Math.sin(this.time * 2 + c.x) * 0.04;
      }
      const sh = w.short[c.id] ?? 0;
      if (sh >= 3 && game.isExplored(c.x, c.y)) this.smoke(c.x - 30, c.y - 30, Math.min(1, (sh - 2) / 4), sh >= 6 ? 0x2a2420 : 0x6a5c4e, Math.min(1.8, inv));
    }
    if (w.drought && game.isExplored(w.drought.x, w.drought.y)) {
      const d = w.drought;
      const a = 0.14 + Math.sin(this.time * 1.3) * 0.03;
      g.ellipse(d.x, d.y, 720, 520).fill({ color: 0xb8701e, alpha: a });
      g.ellipse(d.x, d.y, 480, 340).fill({ color: 0xd08a2a, alpha: a });
      g.ellipse(d.x, d.y, 720, 520).stroke({ color: 0xffb040, width: 6, alpha: 0.35 });
      for (let i = 0; i < 18; i++) {
        const a0 = i * 2.39;
        const r0 = 80 + ((i * 131) % 380);
        const cx = d.x + Math.cos(a0) * r0;
        const cy = d.y + Math.sin(a0) * r0 * 0.7;
        g.moveTo(cx, cy).lineTo(cx + 18, cy + 9).lineTo(cx + 30, cy + 4).moveTo(cx + 18, cy + 9).lineTo(cx + 22, cy + 24);
      }
      g.stroke({ color: 0x5a3410, width: 3, alpha: 0.5 });
      for (let i = 0; i < 14; i++) {
        const yy = d.y - 300 + i * 46;
        const xx = d.x - 380 + ((i * 97) % 160);
        for (let j = 0; j < 6; j++) {
          const x = xx + j * 90;
          const y = yy + Math.sin(this.time * 4 + i + j) * 4;
          if (j) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
      }
      g.stroke({ color: 0xffe0a0, width: 2, alpha: 0.25 });
    }
    const t = game.dayOf().t;
    const dark = Math.max(0, -Math.cos(t * Math.PI * 2));
    if (dark > 0.4 && w.wolves >= 65) {
      const h = s.hero;
      for (let i = 0; i < 4; i++) {
        const blink = Math.sin(this.time * 0.9 + i * 2.1);
        if (blink < -0.2) continue;
        const a = i * 1.57 + Math.floor(this.time / 6 + i) * 0.9;
        const r = 260 + ((i * 53) % 120);
        const x = h.x + Math.cos(a) * r;
        const y = h.y + Math.sin(a) * r;
        const e = (blink + 0.2) * dark;
        g.circle(x - 7, y, 4 * inv).circle(x + 7, y, 4 * inv).fill({ color: 0xffe060, alpha: Math.min(0.95, e * 1.3) });
      }
    }
  }

  private buildDeco(): void {
    const items: { y: number; s: Sprite }[] = [];
    const hash = (n: number) => (((n * 2654435761) ^ (n >>> 7) * 40503) >>> 0) / 4294967296;
    const fl = (names: string[]) => names.map((n) => this.tex["flora/" + n]).filter(Boolean);
    const mt = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => this.tex["mtn/m" + n]);
    const rich = mt.every(Boolean) && fl(["pine0"]).length > 0;
    const atlas = rich ? null : makeAtlas();
    const PINE = fl(["pine0", "pine1", "pine2", "pine3", "pop0", "pine1"]);
    const BROAD = fl(["elm", "mulberry", "walnut", "pop1", "pop2", "pop3", "apricot", "elm", "walnut"]);
    const tree = (tex: Texture, x: number, y: number, hgt: number, r: number, tint = 0xffffff) => {
      const s = new Sprite(tex);
      s.anchor.set(0.5, 0.94);
      s.position.set(x, y);
      const sc = hgt / tex.height;
      s.scale.set(sc * (r > 0.5 ? 1 : -1), sc);
      s.tint = tint;
      items.push({ y, s });
    };
    const tr = this.world.trees;
    const stride = Math.max(1, Math.floor(tr.length / 3 / 9000));
    for (let k = 0; k < tr.length; k += 3 * stride) {
      const r = hash(k + 11);
      if (atlas) {
        const s = new Sprite(atlas.trees[(tr[k + 2] ? 0 : 2) + ((k / 3) % 2)]);
        s.anchor.set(0.5, 0.9);
        s.position.set(tr[k], tr[k + 1]);
        s.scale.set(0.42 + ((k * 7) % 10) / 40);
        items.push({ y: tr[k + 1], s });
        continue;
      }
      const north = tr[k + 1] < H * 0.42;
      const pool = tr[k + 2] || (north && r < 0.6) ? PINE : BROAD;
      tree(pool[Math.floor(hash(k + 5) * pool.length)], tr[k], tr[k + 1], 30 + r * 16, hash(k + 3));
    }
    if (!atlas) this.scatterDry(tree, hash);
    const pk = this.world.peaks;
    for (let k = 0; k < pk.length; k += 3) {
      const h = pk[k + 2];
      const r = ((k * 2654435761) >>> 0) / 4294967296;
      const v = h < 0.58 ? 0 : h < 0.73 + r * 0.06 ? 1 : 2;
      const sc = 0.34 + Math.min(0.5, (h - 0.5) * 1.5) + r * 0.22;
      const flip = r > 0.5 ? 1 : -1;
      let s: Sprite;
      if (atlas) {
        s = new Sprite(atlas.peaks[v]);
        s.anchor.set(0.5, 0.94);
        s.scale.set(sc * flip * (0.85 + r * 0.3), sc);
      } else {
        const r2 = hash(k + 23);
        if (r2 < 0.42 && sc < 0.75) continue;
        const tex = mt[(2 - v) * 3 + Math.floor(hash(k + 17) * 3)];
        s = new Sprite(tex);
        s.anchor.set(0.5, 0.86);
        const k2 = (128 * sc * (1.2 + r2 * 0.5)) / tex.width;
        s.scale.set(k2 * flip * (0.9 + r * 0.2), k2);
      }
      s.position.set(pk[k], pk[k + 1]);
      const tn = 225 + Math.floor(r * 30);
      s.tint = (tn << 16) | (tn << 8) | Math.min(255, tn + 6);
      items.push({ y: pk[k + 1], s });
    }
    items.sort((a, b) => a.y - b.y);
    // Chunked culling: per-sprite bounds checks on ~10k deco sprites dominated frame CPU.
    const CH = 900;
    const cols = Math.ceil(W / CH);
    const rows = Math.ceil(H / CH);
    const chunks: (Container | undefined)[] = new Array(cols * rows);
    const box: number[] = [];
    for (const it of items) {
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(it.s.x / CH)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(it.s.y / CH)));
      const i = cy * cols + cx;
      let c = chunks[i];
      if (!c) {
        c = chunks[i] = new Container();
        c.cullable = true;
        c.cullableChildren = false;
        box[i * 4] = Infinity;
        box[i * 4 + 1] = Infinity;
        box[i * 4 + 2] = -Infinity;
        box[i * 4 + 3] = -Infinity;
      }
      c.addChild(it.s);
      const r = 160 * Math.abs(it.s.scale.y) + 40;
      box[i * 4] = Math.min(box[i * 4], it.s.x - r);
      box[i * 4 + 1] = Math.min(box[i * 4 + 1], it.s.y - r * 2);
      box[i * 4 + 2] = Math.max(box[i * 4 + 2], it.s.x + r);
      box[i * 4 + 3] = Math.max(box[i * 4 + 3], it.s.y + r * 0.4);
    }
    chunks.forEach((c, i) => {
      if (!c) return;
      c.cullArea = new Rectangle(box[i * 4], box[i * 4 + 1], box[i * 4 + 2] - box[i * 4], box[i * 4 + 3] - box[i * 4 + 1]);
      this.deco.addChild(c);
    });
  }

  private scatterDry(tree: (tex: Texture, x: number, y: number, hgt: number, r: number, tint?: number) => void, hash: (n: number) => number): void {
    const { height, moist, river, road } = this.world;
    const fl = (n: string) => this.tex["flora/" + n];
    const shrub = [fl("saxaul"), fl("saxaul"), fl("tamarisk"), fl("bush")].filter(Boolean);
    const palm = fl("palm");
    if (!shrub.length) return;
    const sx = W / GW, sy = H / GH;
    const nearRiver = (x: number, y: number) => {
      for (let v = -5; v <= 5; v += 2) for (let u = -5; u <= 5; u += 2) {
        const xx = x + u, yy = y + v;
        if (xx >= 0 && yy >= 0 && xx < GW && yy < GH && river[yy * GW + xx]) return true;
      }
      return false;
    };
    for (let y = 3; y < GH - 3; y += 5) for (let x = 3; x < GW - 3; x += 5) {
      const n = y * GW + x;
      const r = hash(n * 7 + 1);
      const h = height[n], m = moist[n];
      if (h < 0.04 || h > 0.46) continue;
      const wx = (x + (hash(n + 2) - 0.5) * 4) * sx, wy = (y + (hash(n + 4) - 0.5) * 4) * sy;
      if (road[Math.floor((wy / H) * NH) * NW + Math.floor((wx / W) * NW)]) continue;
      if (CITIES.some((c) => Math.abs(c.x - wx) < 80 && Math.abs(c.y - wy) < 60)) continue;
      if (palm && m < 0.45 && r < 0.3 && nearRiver(x, y)) {
        tree(palm, wx, wy, 34 + hash(n + 9) * 12, hash(n + 6));
        continue;
      }
      if (m > 0.5 || r > (m < 0.25 ? 0.03 : 0.055)) continue;
      const sp = shrub[Math.floor(hash(n + 8) * shrub.length)];
      tree(sp, wx, wy, 13 + hash(n + 9) * 9, hash(n + 6), sp === fl("saxaul") ? 0xe0d4c0 : 0xa89878);
    }
  }

  private label(text: string, x: number, y: number, size = 1): Text {
    const t = new Text({ text, style: { ...LABEL_STYLE, fontSize: LABEL_STYLE.fontSize * size } });
    t.anchor.set(0.5, 0);
    t.position.set(x, y);
    t.resolution = 2;
    return t;
  }

  private place(key: string, x: number, y: number, w: number, name?: string, lsize = 0.8): Marker {
    const c = new Container();
    const sh = new Graphics().ellipse(0, 4, w * 0.42, w * 0.14).fill({ color: 0x000000, alpha: 0.28 });
    const s = new Sprite(this.t(key));
    s.anchor.set(0.5, 0.78);
    s.scale.set(w / Math.max(1, s.texture.width));
    c.addChild(sh, s);
    c.position.set(x, y);
    c.cullable = true;
    this.places.addChild(c);
    let label: Text | undefined;
    if (name) {
      const above = key.startsWith("cities/");
      label = this.label(name, x, above ? y - w * 0.62 : y + w * 0.18, lsize);
      if (above) label.anchor.set(0.5, 1);
      (above ? this.ink : this.labels).addChild(label);
    }
    return { sp: c, x, y, label };
  }

  private buildPlaces(): void {
    CITIES.forEach((c) => {
      const cap = c.id === CAPITAL.id;
      const m = this.place("cities/" + c.id, c.x, c.y, cap ? 210 : 170, CITY_NAME[c.id] + (cap ? " ★" : ""), cap ? 1.25 : 1.05);
      this.cityM.push(m);
    });
  }

  attachState(game: Game): void {
    const s = game.s;
    if (this.life) {
      this.life.ground.destroy({ children: true });
      this.life.air.destroy({ children: true });
    }
    this.life = new Life(this.world, s.villages, this.glow);
    this.layer.addChildAt(this.life.ground, this.layer.getChildIndex(this.deco));
    this.layer.addChildAt(this.life.air, this.layer.getChildIndex(this.units) + 1);
    this.villageM = s.villages.map((v) => this.place(v.yurt ? "map/yurts" : "map/village", v.x, v.y, 74, v.name, 0.62));
    this.campM = s.camps.map((c) => this.place("map/camp", c.x, c.y, 84, c.name, 0.62));
    this.campFires = s.camps.map((c) => {
      const f = new Sprite(this.glow);
      f.anchor.set(0.5);
      f.tint = 0xff6a2a;
      f.width = f.height = 150;
      f.position.set(c.x, c.y);
      f.blendMode = "add";
      this.lights.addChild(f);
      return f;
    });
    this.nodeM = s.nodes.map((n) => this.place("map/" + NODE_SPRITE[n.kind], n.x, n.y, 70));
    this.ruinM = s.ruins.map((r) => this.place("map/ruins", r.x, r.y, 72));
    this.kurganM = s.kurgans.map((k) => this.place("map/kurgan", k.x, k.y, 62, `Kurgan Taşı Sv ${k.tier}`, 0.62));
    this.kaleM = s.forts.map((f) => this.place(FORT_TIERS[f.tier].art, f.x, f.y, 84 + f.tier * 16, f.name, 0.72));
    this.kaleF = s.forts.map((f) => {
      const fl = new Sprite(this.t("tug"));
      fl.anchor.set(0.5, 1);
      fl.scale.set(56 / fl.texture.height);
      fl.position.set(f.x + 34 + f.tier * 8, f.y - 6);
      this.places.addChild(fl);
      return fl;
    });
    for (const m of [...this.campM]) if (m.label) m.label.style.fill = "#ffb0a0";
    for (const m of this.kurganM) if (m.label) m.label.style.fill = "#e0b8ff";
    this.places.children.sort((a, b) => a.y - b.y);
    this.heroPortrait(game.face());
  }

  private ring(color: number, r: number): Graphics {
    return new Graphics().circle(0, 0, r).fill({ color: 0x1a0f06, alpha: 0.9 }).circle(0, 0, r).stroke({ color, width: 4 });
  }

  private mongolM: Container | null = null;
  private mongolG = new Graphics();
  private burnM = new Map<string, Sprite>();

  /** Moğol tümeni: noyan portresi, çevresinde dönen atlı sürüsü; yanan şehirler kararır ve alev alır. */
  private drawMongol(game: Game, inv: number): void {
    const p = game.mongolPos();
    const g = this.mongolG;
    g.clear();
    if (p) {
      if (!this.mongolM) {
        this.mongolM = this.portrait("heroes/boss_hakan", 22, 0xc0392b);
        const t = new Text({ text: "Moğol Tümeni", style: { ...LABEL_STYLE, fontSize: 14, fill: "#ffb4a0" } });
        t.anchor.set(0.5, 0);
        t.position.set(0, 26);
        t.resolution = 2;
        this.mongolM.addChild(t);
        this.units.addChild(g, this.mongolM);
      }
      this.mongolM.visible = true;
      this.mongolM.position.set(p.x, p.y);
      this.mongolM.scale.set(inv * 1.1);
      for (let i = 0; i < 70; i++) {
        const a = i * 2.39996 + this.time * (i % 2 ? 0.1 : -0.07);
        const r = 30 + Math.sqrt(i / 70) * 62 + Math.sin(this.time * 2 + i) * 3;
        const x = p.x + Math.cos(a) * r * 1.4;
        const y = p.y + Math.sin(a) * r * 0.7 - Math.abs(Math.sin(this.time * 8 + i)) * 1.5;
        g.ellipse(x, y, 3.4, 1.8).fill({ color: 0x2a1a12, alpha: 0.85 });
        g.circle(x + (i % 2 ? 1.6 : -1.6), y - 2.2, 1.1).fill({ color: 0x3a2418 });
      }
      for (let i = 0; i < 8; i++) {
        const a = this.time * 0.5 + i * 0.8;
        g.circle(p.x - 90 + Math.cos(a) * 30 - ((this.time * 20 + i * 15) % 60), p.y + 10 + Math.sin(a * 1.3) * 14, 14 + (i % 3) * 6).fill({ color: 0xc8a878, alpha: 0.12 });
      }
    } else if (this.mongolM) this.mongolM.visible = false;
    const fallen = game.s.mongol?.fallen ?? [];
    CITIES.forEach((c, i) => {
      const burning = fallen.some((f) => f.id === c.id);
      const m = this.cityM[i];
      if (m) m.sp.tint = burning ? 0x8a6656 : 0xffffff;
      let f = this.burnM.get(c.id);
      if (burning && !f) {
        f = new Sprite(this.glow);
        f.anchor.set(0.5);
        f.tint = 0xff5a1a;
        f.blendMode = "add";
        this.units.addChildAt(f, 0);
        this.burnM.set(c.id, f);
      }
      if (f) {
        f.visible = burning;
        if (burning) {
          f.position.set(c.x, c.y - 20);
          f.width = f.height = 200 + Math.sin(this.time * 7 + i) * 18 + Math.sin(this.time * 17) * 8;
          f.alpha = 0.55;
        }
      }
    });
  }

  private portrait(key: string, r: number, color: number): Container {
    const c = new Container();
    c.addChild(this.ring(color, r + 3));
    const s = new Sprite(this.t(key));
    s.anchor.set(0.5);
    const sc = (r * 2.1) / Math.max(s.texture.width, s.texture.height);
    s.scale.set(sc);
    s.label = "face";
    const mask = new Graphics().circle(0, 0, r).fill(0xffffff);
    s.mask = mask;
    c.addChild(mask, s);
    return c;
  }

  heroPortrait(key: string): void {
    const s = this.hero.getChildByLabel("face", true) as Sprite | null;
    if (!s) return;
    s.texture = this.t(key);
    s.scale.set(44 / Math.max(s.texture.width, s.texture.height));
    this.heroFlag.visible = key !== "heroes/slave";
  }

  private syncTamga(t: Tamga | undefined): void {
    const key = t ? `${t.shape}|${t.mark}|${t.color}` : "";
    this.heroTamga.visible = this.heroFlag.visible && !!t;
    if (!t || key === this.tamgaKey) return;
    this.tamgaKey = key;
    const old = this.heroTamga.texture;
    this.heroTamga.texture = Texture.from(tamgaCanvas(t, 64));
    if (old && old !== Texture.EMPTY) old.destroy(true);
    this.heroTamga.width = this.heroTamga.height = 30;
  }

  private buildHero(): void {
    const c = new Container();
    const sh = new Graphics().ellipse(0, 26, 22, 7).fill({ color: 0x000000, alpha: 0.35 });
    const flag = new Sprite(this.t("tug"));
    flag.anchor.set(0.5, 1);
    flag.scale.set(56 / flag.texture.height);
    flag.position.set(18, -14);
    const p = this.portrait("heroes/hero1", 22, 0xffd56a);
    this.heroCount = new Text({ text: "0", style: { ...LABEL_STYLE, fontSize: 18 } });
    this.heroCount.anchor.set(0.5, 0);
    this.heroCount.position.set(0, 26);
    this.heroCount.resolution = 2;
    this.heroBars = new Graphics();
    this.heroTamga = new Sprite();
    this.heroTamga.anchor.set(0.5);
    this.heroTamga.position.set(22, -50);
    c.addChild(sh, flag, this.heroTamga, p, this.heroCount, this.heroBars);
    this.heroFlag = flag;
    this.hero = c;
    this.units.addChild(this.troops);
    this.units.addChild(c);
  }

  private birdC: Container | null = null;
  private birdKind = "";

  private drawBird(game: Game, inv: number): void {
    const b = game.s.bird;
    if (!b) {
      this.birdC?.destroy({ children: true });
      this.birdC = null;
      return;
    }
    if (!this.birdC || this.birdKind !== b.kind) {
      this.birdC?.destroy({ children: true });
      const c = new Container();
      const sh = new Graphics().ellipse(0, 0, 14, 5).fill({ color: 0x000000, alpha: 0.32 });
      sh.label = "sh";
      const sp = new Sprite(this.t("bird_" + b.kind));
      sp.anchor.set(0.5);
      sp.scale.set(48 / Math.max(sp.texture.width, sp.texture.height));
      sp.label = "sp";
      c.addChild(sh, sp);
      this.units.addChild(c);
      this.birdC = c;
      this.birdKind = b.kind;
    }
    const c = this.birdC;
    const f = game.birdFly;
    const h = game.s.hero;
    const sp = c.getChildByLabel("sp") as Sprite;
    const sh = c.getChildByLabel("sh")!;
    let x: number, y: number, lift: number;
    if (f) {
      x = f.x;
      y = f.y;
      lift = 46;
      sp.scale.x = Math.abs(sp.scale.x) * ((f.back ? h.x - f.x : f.tx - f.x) < 0 ? 1 : -1);
    } else {
      const a = this.time * 1.3;
      x = h.x + Math.cos(a) * 34;
      y = h.y + Math.sin(a) * 14;
      lift = 52 + Math.sin(this.time * 2.1) * 4;
      sp.scale.x = Math.abs(sp.scale.x) * (Math.sin(a) > 0 ? 1 : -1);
    }
    c.position.set(x, y);
    c.scale.set(inv);
    sp.y = -lift;
    sp.scale.y = Math.abs(sp.scale.x) * (1 + Math.sin(this.time * 14) * 0.08);
    sh.alpha = f ? 0.6 : 1;
    c.visible = game.isExplored(x, y);
    c.zIndex = y;
  }

  marker(x: number, y: number): void {
    this.mark = { x, y, t: 0 };
  }

  private caravan(id: number, color: number): Container {
    let c = this.caravansM.get(id);
    if (c) return c;
    c = new Container();
    const sh = new Graphics().ellipse(0, 20, 17, 5).fill({ color: 0x000000, alpha: 0.35 });
    const p = this.portrait("j_caravan", 16, color);
    const ex = new Text({ text: "⚔", style: { ...LABEL_STYLE, fontSize: 22, fill: "#ff5a3c" } });
    ex.anchor.set(0.5, 1);
    ex.position.set(0, -18);
    ex.label = "ex";
    c.addChild(sh, p, ex);
    this.units.addChild(c);
    this.caravansM.set(id, c);
    return c;
  }

  private bandit(id: number, posse = false, nem = ""): Container {
    let c = this.bandits.get(id);
    if (c) return c;
    c = new Container();
    const sh = new Graphics().ellipse(0, 22, 18, 6).fill({ color: 0x000000, alpha: 0.35 });
    const p = posse ? this.portrait("soldier", 18, 0x4a8cff) : nem ? this.portrait("j_bandit", 22, 0xa64dff) : this.portrait("j_bandit", 18, 0xd2452c);
    if (nem) {
      const glow = new Graphics().circle(0, 0, 30).fill({ color: 0xa64dff, alpha: 0.22 });
      glow.label = "glow";
      c.addChild(glow);
      const nl = new Text({ text: nem, style: { ...LABEL_STYLE, fontSize: 14, fill: "#e6c4ff" } });
      nl.anchor.set(0.5, 0);
      nl.position.set(0, 40);
      nl.resolution = 2;
      c.addChild(nl);
    }
    const t = new Text({ text: "", style: { ...LABEL_STYLE, fontSize: 16, fill: "#ffc4b4" } });
    t.anchor.set(0.5, 0);
    t.position.set(0, 21);
    t.resolution = 2;
    t.label = "count";
    const ex = new Text({ text: "!", style: { ...LABEL_STYLE, fontSize: 26, fill: "#ff5a3c" } });
    ex.anchor.set(0.5, 1);
    ex.position.set(0, -20);
    ex.label = "ex";
    c.addChild(sh, p, t, ex);
    this.units.addChild(c);
    this.bandits.set(id, c);
    return c;
  }

  private march(id: number): Container {
    let c = this.marchesM.get(id);
    if (c) return c;
    c = new Container();
    const p = this.portrait("soldier", 14, 0x7fd36a);
    const t = new Text({ text: "", style: { ...LABEL_STYLE, fontSize: 13, fill: "#d4ffc4" } });
    t.anchor.set(0.5, 0);
    t.position.set(0, 16);
    t.resolution = 2;
    t.label = "txt";
    c.addChild(p, t);
    this.units.addChild(c);
    this.marchesM.set(id, c);
    return c;
  }

  update(dt: number, game: Game, cam: Camera): void {
    const s = game.s;
    this.time += dt;
    this.terrain?.tick(dt, game.season());
    const h = s.hero;
    const moving = !!h.path;
    this.hero.position.set(h.x, h.y - (moving ? Math.abs(Math.sin(this.time * 9)) * 3 : 0));
    const n = armySize(h.army);
    this.heroCount.text = n > 0 ? String(n) : "";
    this.syncTamga(s.free ? s.tamga : undefined);
    const inv = Math.min(2.2, Math.max(0.7, 0.75 / cam.zoom));
    this.hero.scale.set(inv);
    this.trail.push(h.x, h.y);
    if (this.trail.length > 400) this.trail.splice(0, this.trail.length - 400);
    this.drawBird(game, inv);
    this.drawMongol(game, inv);
    s.comps.forEach((id, i) => {
      let c = this.compM.get(id);
      if (!c) {
        c = this.portrait("companions/" + id, 12, 0x8fe07a);
        this.units.addChildAt(c, 0);
        this.compM.set(id, c);
      }
      const back = Math.max(0, this.trail.length - 2 - (i + 1) * 18 * 2);
      const tx = this.trail[back] ?? h.x;
      const ty = this.trail[back + 1] ?? h.y;
      const fx = Math.hypot(tx - h.x, ty - h.y) < 8 ? h.x - 26 + i * 26 : tx;
      const fy = Math.hypot(tx - h.x, ty - h.y) < 8 ? h.y + 30 : ty;
      c.position.set(c.x + (fx - c.x) * Math.min(1, dt * 6), c.y + (fy - c.y) * Math.min(1, dt * 6) - (moving ? Math.abs(Math.sin(this.time * 9 + i)) * 2 : 0));
      c.scale.set(inv);
    });
    const ar = h.army;
    const tot = armySize(ar);
    const figs = Math.min(10, Math.ceil(tot / 4));
    const kinds: string[] = [];
    if (figs > 0) {
      const nh = Math.round((ar.horse / tot) * figs);
      const na = Math.round((ar.archer / tot) * figs);
      for (let k = 0; k < figs; k++) kinds.push(k < nh ? "u_cavalry" : k < nh + na ? "u_archer" : "u_spear");
    }
    while (this.troops.children.length > figs) this.troops.children[this.troops.children.length - 1].destroy();
    while (this.troops.children.length < figs) {
      const f = new Container();
      f.addChild(new Graphics().ellipse(0, 8, 8, 3).fill({ color: 0x000000, alpha: 0.3 }));
      const sp = new Sprite(this.t("u_spear"));
      sp.anchor.set(0.5, 0.85);
      sp.label = "fig";
      f.addChild(sp);
      f.position.set(h.x, h.y);
      this.troops.addChild(f);
    }
    this.troops.children.forEach((f, k) => {
      const sp = (f as Container).getChildByLabel("fig") as Sprite;
      const tx = this.t(kinds[k]);
      if (sp.texture !== tx) sp.texture = tx;
      sp.scale.set((30 / Math.max(1, tx.width)) * (kinds[k] === "u_cavalry" ? 1.2 : 1));
      const row = Math.floor(k / 3);
      const col = (k % 3) - 1;
      const back = Math.max(0, this.trail.length - 2 - (8 + row * 10) * 2);
      const bx = this.trail[back] ?? h.x;
      const by = this.trail[back + 1] ?? h.y;
      const idle = Math.hypot(bx - h.x, by - h.y) < 6;
      const ox = idle ? h.x + (col * 26 + (row % 2) * 13) * inv : bx + col * 16 * inv;
      const oy = idle ? h.y + (44 + row * 18) * inv : by + col * 7 * inv;
      f.x += (ox - f.x) * Math.min(1, dt * 5);
      f.y += (oy - f.y) * Math.min(1, dt * 5);
      sp.y = moving ? -Math.abs(Math.sin(this.time * 10 + k * 1.3)) * 2.5 : 0;
      f.scale.set(inv);
      f.visible = s.free;
    });
    if (s.story.fort && !this.fortM) {
      this.fortM = this.place("map/castle", s.story.fort.x, s.story.fort.y, 140, "Kara Tamga Kalesi", 1);
      if (this.fortM.label) this.fortM.label.style.fill = "#ff8a8a";
    }
    if (this.fortM) {
      this.fortM.sp.visible = !s.story.done;
      if (this.fortM.label) this.fortM.label.visible = !s.story.done;
    }
    if (s.act2.gate && !this.gateM) {
      this.gateM = this.place("map/erlik_gate", s.act2.gate.x, s.act2.gate.y, 150, "Erlik'in Kapısı", 1);
      if (this.gateM.label) this.gateM.label.style.fill = "#d9a3ff";
    }
    if (this.gateM) {
      this.gateM.sp.alpha = s.act2.done ? 0.45 : 1;
      if (this.gateM.label) this.gateM.label.text = s.act2.done ? "Mühürlü Kapı" : "Erlik'in Kapısı";
    }
    if (s.otag) {
      if (!this.otagM) {
        this.otagM = this.place("map/yurts", s.otag.x, s.otag.y, 110, "Ak Otağ", 0.9);
        if (this.otagM.label) this.otagM.label.style.fill = "#ffe08a";
      }
      if (this.otagM.x !== s.otag.x || this.otagM.y !== s.otag.y) {
        this.otagM.x = s.otag.x;
        this.otagM.y = s.otag.y;
        this.otagM.sp.position.set(s.otag.x, s.otag.y);
        this.otagM.label?.position.set(s.otag.x, s.otag.y + 110 * 0.18);
      }
    }
    const bk = s.boy?.at ? `${s.boy.id}|${s.boy.step}|${s.boy.at.x | 0}` : "";
    if (bk !== this.boyK) {
      this.boyK = bk;
      if (this.boyM) {
        this.boyM.sp.destroy({ children: true });
        this.boyM.label?.destroy();
        this.boyM = null;
      }
      const st = s.boy && boyOf(s.boy.id)?.steps[s.boy.step];
      if (st && s.boy?.at) {
        this.boyM = this.place(st.img, s.boy.at.x, s.boy.at.y, 120, st.place, 0.85);
        this.boyM.sp.tint = 0xffe0b0;
        if (this.boyM.label) this.boyM.label.style.fill = "#ffcf7a";
      }
    }
    if (s.act3.peak && !this.peakM) {
      this.peakM = this.place("map/ruins", s.act3.peak.x, s.act3.peak.y, 150, "Tengri Dağı", 1);
      this.peakM.sp.tint = 0xbfe4ff;
      if (this.peakM.label) this.peakM.label.style.fill = "#9fdcff";
    }
    if (s.free && !this.kipM) {
      this.kipM = game.kipPois().map((p) => {
        const [key, w, name, tint, col] = p.kind === "horde" ? ["map/yurts", 130, "Kıpçak Ordası", 0xffe0b0, "#ffcf7a"] as const : p.kind === "fort" ? ["map/castle", 130, "Kara Kıpçak Ordugâhı", 0xd09080, "#ff9a8a"] as const : ["map/kurgan", 64, "Taş Baba", 0xc8d4e0, "#d8e4ee"] as const;
        const m = this.place(key, p.x, p.y, w, tr(name), p.kind === "stone" ? 0.6 : 0.85);
        m.sp.tint = tint;
        if (m.label) m.label.style.fill = col;
        return m;
      });
    }
    if (this.kipM && s.kip) {
      const k = s.kip;
      game.kipPois().forEach((p, i) => {
        const m = this.kipM![i];
        const dim = p.kind === "fort" ? k.fort : p.kind === "stone" ? k.stones.includes(p.n) : false;
        m.sp.alpha = dim ? 0.5 : 1;
      });
    }
    const hb = this.heroBars;
    hb.clear();
    const kut = s.beylik ? s.kut ?? 50 : 50;
    if (kut >= 75 || kut <= 20) {
      const good = kut >= 75;
      const p = (this.time * 0.7) % 1;
      hb.circle(0, 4, 30 + p * 26).stroke({ color: good ? 0xffd86a : 0x5a2a6a, width: 3, alpha: (good ? 0.55 : 0.65) * (1 - p) });
      for (let i = 0; i < 6; i++) {
        const a = this.time * (good ? 1.2 : -0.8) + (i * Math.PI) / 3;
        hb.circle(Math.cos(a) * 30, 4 + Math.sin(a) * 12 - (good ? (this.time * 20 + i * 7) % 20 : 0), good ? 2.4 : 3.2).fill({ color: good ? 0xfff0a0 : 0x3a1a4a, alpha: 0.8 });
      }
    }
    const hpK = Math.max(0, Math.min(1, h.hp / game.maxHp()));
    if (hpK < 0.999) {
      hb.rect(-22, -34, 44, 5).fill({ color: 0x000000, alpha: 0.6 });
      hb.rect(-22, -34, 44 * hpK, 5).fill(hpK > 0.5 ? 0x7fd36a : hpK > 0.25 ? 0xffd56a : 0xff5a3c);
    }
    if (game.act) {
      const k = game.act.t / game.act.dur;
      hb.arc(0, 0, 31, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2).stroke({ color: 0xffe08a, width: 5 });
    }

    this.pathG.clear();
    if (h.path) {
      let px = h.x;
      let py = h.y;
      for (let k = h.pathI; k < h.path.length; k += 2) {
        const x = h.path[k];
        const y = h.path[k + 1];
        const d = Math.hypot(x - px, y - py);
        const n = Math.floor(d / 14);
        for (let j = 1; j <= n; j++) this.pathG.circle(px + ((x - px) * j) / n, py + ((y - py) * j) / n, 3.2);
        px = x;
        py = y;
      }
      this.pathG.fill({ color: 0xffe08a, alpha: 0.85 });
    }
    for (const m of s.marches) {
      if (m.phase === "gather") continue;
      for (let k = m.pathI; k < m.path.length; k += 6) this.pathG.circle(m.path[k], m.path[k + 1], 2.4);
    }
    this.pathG.fill({ color: 0x9be38a, alpha: 0.7 });

    const live = new Set<number>();
    for (const b of s.bandits) {
      live.add(b.id);
      const nm = b.nem ? s.nemeses.find((n) => n.id === b.nem) : undefined;
      const c = this.bandit(b.id, b.posse, nm ? nemName(nm) : "");
      const glow = c.getChildByLabel("glow");
      if (glow) glow.scale.set(1 + Math.sin(this.time * 4) * 0.12);
      const vis = game.isExplored(b.x, b.y);
      c.visible = vis;
      c.position.set(b.x, b.y);
      c.scale.set(inv * 0.95);
      (c.getChildByLabel("count") as Text).text = String(armySize(b.army));
      const ex = c.getChildByLabel("ex")!;
      ex.visible = b.chase;
      ex.y = -20 - Math.abs(Math.sin(this.time * 6)) * 4;
    }
    for (const [id, c] of this.bandits) if (!live.has(id)) {
      c.destroy({ children: true });
      this.bandits.delete(id);
    }
    const liveC = new Set<number>();
    for (const cv of s.caravans) {
      liveC.add(cv.id);
      const c = this.caravan(cv.id, parseInt(FACTIONS[cv.fac as FactionId].color.slice(1), 16));
      c.visible = game.isExplored(cv.x, cv.y);
      c.position.set(cv.x, cv.y + (cv.raid ? 0 : Math.sin(this.time * 5 + cv.id) * 1.2));
      c.scale.set(inv * 0.9);
      const ex = c.getChildByLabel("ex")!;
      ex.visible = !!cv.raid;
      ex.alpha = 0.6 + Math.abs(Math.sin(this.time * 8)) * 0.4;
    }
    for (const mc of s.mycv ?? []) {
      const id = 900000 + mc.id;
      liveC.add(id);
      const c = this.caravan(id, 0xffd56a);
      const p = game.myCvPos(mc);
      c.position.set(p.x, p.y + Math.sin(this.time * 5 + mc.id) * 1.2);
      c.scale.set(inv * 0.85);
      c.getChildByLabel("ex")!.visible = false;
    }
    for (const [id, c] of this.caravansM) if (!liveC.has(id)) {
      c.destroy({ children: true });
      this.caravansM.delete(id);
    }
    s.rivals.forEach((r) => {
      let e = this.rivalsM.get(r.id);
      if (e && e.st !== r.status + r.name) {
        e.c.destroy({ children: true });
        this.rivalsM.delete(r.id);
        e = undefined;
      }
      if (r.status === "dead") return;
      if (!e) {
        const col = RIVAL_COL[r.status];
        const c = new Container();
        const sh = new Graphics().ellipse(0, 26, 22, 7).fill({ color: 0x000000, alpha: 0.35 });
        const glow = new Graphics().circle(0, 0, 32).fill({ color: col, alpha: 0.18 });
        glow.label = "glow";
        const p = this.portrait(r.icon, 24, col);
        const nl = new Text({ text: `${r.name} ${r.title}`, style: { ...LABEL_STYLE, fontSize: 14, fill: "#" + col.toString(16).padStart(6, "0") } });
        nl.anchor.set(0.5, 0);
        nl.position.set(0, 30);
        nl.resolution = 2;
        const tg = new Sprite(this.t("tug"));
        tg.anchor.set(0.5, 1);
        tg.scale.set(34 / tg.texture.height);
        tg.tint = col;
        tg.position.set(20, -14);
        c.addChild(sh, glow, tg, p, nl);
        this.units.addChild(c);
        e = { c, st: r.status + r.name };
        this.rivalsM.set(r.id, e);
      }
      const c = e.c;
      c.visible = game.isExplored(r.x, r.y);
      c.position.set(r.x, r.y);
      c.scale.set(inv);
      c.zIndex = r.y;
      const glow = c.getChildByLabel("glow");
      if (glow) glow.scale.set(1 + Math.sin(this.time * (r.status === "war" ? 6 : 2)) * 0.12);
    });
    const liveM = new Set<number>();
    for (const m of s.marches) {
      liveM.add(m.id);
      const c = this.march(m.id);
      c.position.set(m.x, m.y);
      c.scale.set(inv);
      const txt = c.getChildByLabel("txt") as Text;
      txt.text = m.phase === "gather" ? `⛏ ${Math.max(0, Math.ceil((m.until - Date.now()) / 1000))}sn` : m.phase === "back" ? `↩ ${Math.round(m.load)}` : `→ ${armySize(m.army)}`;
    }
    for (const [id, c] of this.marchesM) if (!liveM.has(id)) {
      c.destroy({ children: true });
      this.marchesM.delete(id);
    }

    this.visT -= dt;
    if (this.visT <= 0) {
      this.visT = 0.4;
      const showLbl = cam.zoom > 0.42;
      const vis = (m: Marker, alive = true) => {
        const e = alive && game.isExplored(m.x, m.y);
        m.sp.visible = e;
        if (m.label) m.label.visible = e && showLbl;
      };
      this.villageM.forEach((m) => vis(m));
      this.campM.forEach((m, i) => vis(m, s.camps[i].alive));
      this.nodeM.forEach((m) => vis(m));
      this.ruinM.forEach((m, i) => vis(m, !s.ruins[i].looted));
      this.kurganM.forEach((m, i) => {
        const k = s.kurgans[i];
        vis(m);
        m.sp.alpha = k.alive ? 1 : k.delved ? 0.35 : 0.6;
        if (m.label) m.label.text = k.alive ? `Kurgan Taşı Sv ${k.tier}` : k.delved ? "Boş Mezar" : TOMBS[tombOf(i)].name;
      });
      this.kaleM.forEach((m, i) => {
        const f = s.forts[i];
        if (!f) return;
        vis(m);
        const col = fortColor(f.owner);
        if (m.label) {
          m.label.text = `${f.name} · ${tr(FORT_TIERS[f.tier].name)}`;
          m.label.style.fill = col;
        }
        const fl = this.kaleF[i];
        fl.visible = m.sp.visible;
        fl.tint = col;
        fl.alpha = f.threat ? 0.55 + 0.45 * Math.abs(Math.sin(this.time * 4)) : 1;
      });
      this.cityM.forEach((m) => {
        m.sp.visible = true;
        if (m.label) m.label.visible = true;
      });
      for (const id of Object.keys(s.serais)) {
        if (this.seraiF.has(id)) continue;
        const c = CITIES.find((x) => x.id === id)!;
        const f = new Sprite(this.t("tug"));
        f.anchor.set(0.5, 1);
        f.scale.set(60 / f.texture.height);
        f.position.set(c.x + 62, c.y - 20);
        this.places.addChild(f);
        this.seraiF.set(id, f);
      }
      for (const c of CITIES) {
        const own = !!s.owned[c.id];
        let f = this.ownF.get(c.id);
        if (own && !f) {
          f = new Sprite(this.t("tug"));
          f.anchor.set(0.5, 1);
          f.scale.set(84 / f.texture.height);
          f.tint = 0xffd36a;
          f.position.set(c.x - 66, c.y - 16);
          this.places.addChild(f);
          this.ownF.set(c.id, f);
        }
        if (f) f.visible = own;
      }
      const ls = Math.min(2.4, Math.max(0.9, 0.7 / cam.zoom));
      for (const m of [...this.villageM, ...this.campM, ...this.kurganM, ...this.kaleM, ...this.cityM]) if (m.label) m.label.scale.set(ls);
    }

    this.fxG.clear();
    if (!s.free) this.fxG.circle(CAPITAL.x, CAPITAL.y, SLAVE_RADIUS).stroke({ color: 0xff6a4a, width: 4, alpha: 0.35 + Math.sin(this.time * 2) * 0.1 });
    if (s.raid) {
      const v = s.villages[s.raid.v];
      const pr = (this.time * 1.4) % 1;
      this.fxG.circle(v.x, v.y, 30 + pr * 40).stroke({ color: 0xff3a1a, width: 4, alpha: 0.9 * (1 - pr) });
      this.fxG.circle(v.x, v.y - 10, 8 + Math.sin(this.time * 10) * 2).fill({ color: 0xff7a2a, alpha: 0.8 });
    }
    if (s.story.fort && !s.story.done) {
      const pr = (this.time * 0.5) % 1;
      this.fxG.circle(s.story.fort.x, s.story.fort.y - 20, 60 + pr * 50).stroke({ color: 0xff3a3a, width: 4, alpha: 0.6 * (1 - pr) });
    }
    if (s.act2.gate && !s.act2.done) {
      const pr = (this.time * 0.4) % 1;
      this.fxG.circle(s.act2.gate.x, s.act2.gate.y - 30, 70 + pr * 70).stroke({ color: 0xa64dff, width: 5, alpha: 0.7 * (1 - pr) });
      this.fxG.circle(s.act2.gate.x, s.act2.gate.y - 30, 26 + Math.sin(this.time * 3) * 6).fill({ color: 0xa64dff, alpha: 0.18 });
    }
    const vy = s.fleet.voyage;
    if (vy) {
      const pts = seaPath(vy.from, vy.to, W, H);
      const p = alongPath(pts, (s.time - vy.at) / vy.dur);
      const bob = Math.sin(this.time * 3) * 2;
      const n = Math.min(3, s.fleet.ships);
      for (let i = 0; i < n; i++) {
        const x = p.x - p.dx * i * 34;
        const y = p.y + bob + i * 10;
        this.fxG.poly([x - 18, y, x + 18, y, x + 12, y + 9, x - 12, y + 9]).fill({ color: 0x5a3818 });
        this.fxG.poly([x, y - 30, x, y - 2, x + 15 * p.dx, y - 6]).fill({ color: 0xf2e6c8 });
        this.fxG.rect(x - 1, y - 32, 2, 32).fill({ color: 0x3a2410 });
        this.fxG.ellipse(x, y + 10, 24, 4).stroke({ color: 0xffffff, width: 2, alpha: 0.35 });
      }
    }
    if (s.act3.peak && !s.act3.ending) {
      const pr = (this.time * 0.35) % 1;
      const p = s.act3.peak;
      this.fxG.rect(p.x - 10, p.y - 420, 20, 380).fill({ color: 0x9fdcff, alpha: 0.12 + Math.sin(this.time * 2) * 0.04 });
      this.fxG.circle(p.x, p.y - 30, 70 + pr * 80).stroke({ color: 0x7fd0ff, width: 5, alpha: 0.7 * (1 - pr) });
    }
    for (const k of s.kurgans) {
      if (!game.isExplored(k.x, k.y) || (!k.alive && k.delved)) continue;
      const pr = (this.time * 0.6 + k.x * 0.001) % 1;
      if (k.alive) this.fxG.circle(k.x, k.y - 8, 26 + pr * 34).stroke({ color: 0xb46aff, width: 3, alpha: 0.55 * (1 - pr) });
      else this.fxG.ellipse(k.x, k.y + 4, 22 + Math.sin(this.time * 3) * 3, 8).fill({ color: 0xffc860, alpha: 0.35 });
    }
    for (const f of s.forts) {
      if (f.owner !== "me") continue;
      this.fxG.circle(f.x, f.y, FORT_TIERS[f.tier].guard).stroke({ color: 0xffd36a, width: 5, alpha: 0.3 });
      if (f.threat) {
        const pr = (this.time * 0.8) % 1;
        this.fxG.circle(f.x, f.y - 20, 60 + pr * 60).stroke({ color: 0xff3a3a, width: 4, alpha: 0.7 * (1 - pr) });
      }
    }
    for (const b of s.bounties) {
      if (!b.taken) continue;
      const c = s.camps[b.camp];
      if (c.alive) this.fxG.circle(c.x, c.y, 52 + Math.sin(this.time * 4) * 4).stroke({ color: 0xffd56a, width: 4, alpha: 0.8 });
    }
    if (this.mark) {
      this.mark.t += dt;
      const k = this.mark.t / 0.8;
      if (k >= 1) this.mark = null;
      else this.fxG.circle(this.mark.x, this.mark.y, 10 + k * 24).stroke({ color: 0xffe08a, width: 3, alpha: 1 - k });
    }
    const tg = game.target;
    if (tg && tg.kind !== "point") {
      const p = game.targetPos(tg);
      if (p) this.fxG.circle(p.x, p.y, 40 + Math.sin(this.time * 5) * 4).stroke({ color: tg.kind === "bandit" || tg.kind === "camp" ? 0xff6a4a : 0xffe08a, width: 3, alpha: 0.9 });
    }
    if (s.free) this.drawPulse(game, inv);

    if (this.fogDirty) {
      this.fogDirty = false;
      const sg = this.fogSmall.getContext("2d")!;
      const img = sg.createImageData(NW, NH);
      for (let i = 0; i < NW * NH; i++) {
        const o = i * 4;
        img.data[o] = 34;
        img.data[o + 1] = 20;
        img.data[o + 2] = 8;
        img.data[o + 3] = s.explored[i] ? 0 : 255;
      }
      sg.putImageData(img, 0, 0);
      const fw = this.fogCanvas.width;
      const fh = this.fogCanvas.height;
      const stretch = (c: CanvasRenderingContext2D, blur: number) => {
        c.filter = `blur(${blur}px)`;
        c.imageSmoothingEnabled = true;
        c.drawImage(this.fogSmall, -FOG_UP, -FOG_UP, fw + FOG_UP * 2, fh + FOG_UP * 2);
        c.filter = "none";
      };
      const g = this.fogCanvas.getContext("2d")!;
      g.clearRect(0, 0, fw, fh);
      g.globalAlpha = 0.62;
      stretch(g, FOG_UP * 2.6);
      const pc = this.fogPaper.getContext("2d")!;
      pc.globalCompositeOperation = "copy";
      stretch(pc, FOG_UP * 0.9);
      pc.globalCompositeOperation = "source-in";
      pc.drawImage(this.parchment(), 0, 0);
      pc.globalCompositeOperation = "source-over";
      g.globalAlpha = 0.8;
      g.drawImage(this.fogPaper, 0, 0);
      g.globalAlpha = 1;
      this.fog.texture.source.update();
    }

    this.drawStorms(game, dt);

    const sk = game.season();
    if (sk !== this.seasonK) {
      this.seasonK = sk;
      const S = SEASONS[sk];
      this.seasonG.clear().rect(0, 0, W, H).fill({ color: S.tint, alpha: S.tintA * (this.terrain ? 0.4 : 1) });
      this.deco.tint = S.deco;
    }
    this.snowG.clear();
    if (sk === "kis") {
      const vw = cam.w / cam.zoom;
      const vh = cam.h / cam.zoom;
      const x0 = cam.x - vw / 2;
      const y0 = cam.y - vh / 2;
      const r = Math.max(1.4, 2.2 / cam.zoom);
      for (let i = 0; i < 140; i++) {
        const fx = ((i * 7919) % 1000) / 1000;
        const fy = ((i * 104729) % 1000) / 1000;
        const sp = 0.06 + ((i * 31) % 10) / 100;
        const px = x0 + (((fx + Math.sin(this.time * 0.7 + i) * 0.015 + this.time * 0.01) % 1) + 1) % 1 * vw;
        const py = y0 + ((fy + this.time * sp) % 1) * vh;
        this.snowG.circle(px, py, r * (0.7 + (i % 3) * 0.25));
      }
      this.snowG.fill({ color: 0xffffff, alpha: 0.85 });
    } else if (sk === "guz" || sk === "bahar") {
      const vw = cam.w / cam.zoom;
      const vh = cam.h / cam.zoom;
      const x0 = cam.x - vw / 2;
      const y0 = cam.y - vh / 2;
      const r = Math.max(2.2, 3.4 / cam.zoom);
      const fall = sk === "guz";
      const cols = fall ? [0xd2691e, 0xb8860b, 0x8b4513, 0xe0a030] : [0xffd0e0, 0xffffff, 0xffb6d0];
      const n = fall ? 46 : 34;
      for (let c = 0; c < cols.length; c++) {
        for (let i = c; i < n; i += cols.length) {
          const fx = ((i * 7919) % 1000) / 1000;
          const fy = ((i * 104729) % 1000) / 1000;
          const sp = 0.025 + ((i * 31) % 10) / 300;
          const px = x0 + ((((fx + this.time * (fall ? 0.03 : 0.012) + Math.sin(this.time * 1.3 + i) * 0.02) % 1) + 1) % 1) * vw;
          const py = y0 + ((fy + this.time * sp) % 1) * vh;
          const tw = Math.abs(Math.sin(this.time * 2.5 + i));
          this.snowG.ellipse(px, py, r * (0.6 + tw * 0.8), r * 0.55);
        }
        this.snowG.fill({ color: cols[c], alpha: 0.75 });
      }
    }

    const { t } = game.dayOf();
    const dark = Math.max(0, Math.cos(t * Math.PI * 2) * -1) * 0.38;
    this.night.clear();
    if (dark > 0.01) this.night.rect(0, 0, W, H).fill({ color: 0x0c1430, alpha: dark });
    {
      const k = 1 - dark * 1.15;
      const ch = (v: number) => Math.round(Math.min(1, v) * 255);
      this.fog.tint = (ch(k) << 16) | (ch(k + dark * 0.12) << 8) | ch(k + dark * 0.4);
    }
    {
      const vw = cam.w / cam.zoom / 2;
      const vh = cam.h / cam.zoom / 2;
      this.life?.update(dt, this.time, { x0: cam.x - vw, y0: cam.y - vh, x1: cam.x + vw, y1: cam.y + vh }, dark, sk === "kis", cam.zoom);
    }
    this.lights.visible = dark > 0.03;
    this.lights.alpha = Math.min(0.85, dark * 2.4) * (0.92 + Math.sin(this.time * 3) * 0.08);
    if (this.lights.visible) {
      const h = game.s.hero;
      this.torch.position.set(h.x, h.y - 6);
      this.torch.width = this.torch.height = 220 + Math.sin(this.time * 9) * 8 + Math.sin(this.time * 23) * 4;
      this.campFires.forEach((f, i) => {
        const c = game.s.camps[i];
        f.visible = c.alive && game.isExplored(c.x, c.y);
        f.width = f.height = 140 + Math.sin(this.time * 7 + i) * 10;
      });
    }
    for (const c of this.clouds.children) {
      c.x += dt * 9;
      c.y += dt * 2;
      if (c.x - c.width / 2 > W) c.x = -c.width / 2;
      if (c.y - c.height / 2 > H) c.y = -c.height / 2;
    }
  }
}
