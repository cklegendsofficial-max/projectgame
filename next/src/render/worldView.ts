import { Application, Assets, Container, Graphics, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { CITIES, H, NH, NW, TW, W, type World } from "../world/gen";
import type { Camera } from "./camera";
import type { Game } from "../game/game";
import { CITY_NAME, NODE_SPRITE, armySize } from "../game/data";
import { CAPITAL, SLAVE_RADIUS } from "../game/state";

const urls: Record<string, string> = {};
for (const [p, u] of Object.entries(import.meta.glob<string>("../assets/**/*.webp", { eager: true, query: "?url", import: "default" }))) {
  const parts = p.split("/");
  urls[parts[parts.length - 2] + "/" + parts[parts.length - 1].replace(".webp", "")] = u;
}

export function assetUrl(key: string): string {
  return urls[key] ?? urls["icons/" + key] ?? "";
}

const FOG_UP = 4;
const LABEL_STYLE = { fontFamily: "Georgia, serif", fontSize: 26, fill: "#fff3d6", stroke: { color: "#2a1606", width: 6 }, fontWeight: "bold" as const };

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
  private units = new Container();
  private pathG = new Graphics();
  private fxG = new Graphics();
  private fog!: Sprite;
  private fogCanvas = document.createElement("canvas");
  private fogSmall = document.createElement("canvas");
  private night = new Graphics();
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
  private fortM: Marker | null = null;
  private seraiF = new Map<string, Sprite>();
  private compM = new Map<string, Container>();
  private trail: number[] = [];
  private cityM: Marker[] = [];
  private hero!: Container;
  private heroCount!: Text;
  private heroFlag!: Sprite;
  private heroBars!: Graphics;
  private bandits = new Map<number, Container>();
  private marchesM = new Map<number, Container>();
  private mark: { x: number; y: number; t: number } | null = null;
  private time = 0;
  private visT = 0;

  constructor(private app: Application, private world: World) {}

  async load(): Promise<void> {
    const keys = Object.keys(urls);
    await Promise.all(keys.map(async (k) => (this.tex[k] = await Assets.load<Texture>(urls[k]))));
    const terrain = new Sprite(Texture.from(this.world.canvas));
    terrain.scale.set(W / TW);
    this.layer.addChild(terrain);
    this.layer.addChild(this.pathG);
    this.buildDeco();
    this.layer.addChild(this.deco);
    this.buildPlaces();
    this.layer.addChild(this.places);
    this.layer.addChild(this.labels);
    this.layer.addChild(this.units);
    this.layer.addChild(this.fxG);
    this.buildAmbience();
    this.fogSmall.width = NW;
    this.fogSmall.height = NH;
    this.fogCanvas.width = NW * FOG_UP;
    this.fogCanvas.height = NH * FOG_UP;
    this.fog = new Sprite(Texture.from(this.fogCanvas));
    this.fog.scale.set(W / this.fogCanvas.width, H / this.fogCanvas.height);
    this.layer.addChild(this.fog);
    this.app.stage.addChild(this.layer);
    this.buildHero();
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
    this.layer.addChild(this.lights);
  }

  t(key: string): Texture {
    return this.tex[key] ?? this.tex["icons/" + key] ?? Texture.WHITE;
  }

  private buildDeco(): void {
    const atlas = makeAtlas();
    const items: { y: number; s: Sprite }[] = [];
    const tr = this.world.trees;
    const stride = Math.max(1, Math.floor(tr.length / 3 / 9000));
    for (let k = 0; k < tr.length; k += 3 * stride) {
      const s = new Sprite(atlas.trees[(tr[k + 2] ? 0 : 2) + ((k / 3) % 2)]);
      s.anchor.set(0.5, 0.9);
      s.position.set(tr[k], tr[k + 1]);
      s.scale.set(0.42 + ((k * 7) % 10) / 40);
      s.cullable = true;
      items.push({ y: tr[k + 1], s });
    }
    const pk = this.world.peaks;
    for (let k = 0; k < pk.length; k += 3) {
      const h = pk[k + 2];
      const r = ((k * 2654435761) >>> 0) / 4294967296;
      const v = h < 0.58 ? 0 : h < 0.73 + r * 0.06 ? 1 : 2;
      const s = new Sprite(atlas.peaks[v]);
      s.anchor.set(0.5, 0.94);
      s.position.set(pk[k], pk[k + 1]);
      const sc = 0.34 + Math.min(0.5, (h - 0.5) * 1.5) + r * 0.22;
      s.scale.set(sc * (r > 0.5 ? 1 : -1) * (0.85 + r * 0.3), sc);
      const tn = 225 + Math.floor(r * 30);
      s.tint = (tn << 16) | (tn << 8) | Math.min(255, tn + 6);
      s.cullable = true;
      items.push({ y: pk[k + 1], s });
    }
    items.sort((a, b) => a.y - b.y);
    for (const it of items) this.deco.addChild(it.s);
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
      this.labels.addChild(label);
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
    this.villageM = s.villages.map((v) => this.place(v.yurt ? "map/yurts" : "map/village", v.x, v.y, 74, v.name, 0.62));
    this.campM = s.camps.map((c) => this.place("map/camp", c.x, c.y, 84, c.name, 0.62));
    this.nodeM = s.nodes.map((n) => this.place("map/" + NODE_SPRITE[n.kind], n.x, n.y, 70));
    this.ruinM = s.ruins.map((r) => this.place("map/ruins", r.x, r.y, 72));
    this.kurganM = s.kurgans.map((k) => this.place("map/kurgan", k.x, k.y, 62, `Kurgan Taşı Sv ${k.tier}`, 0.62));
    for (const m of [...this.campM]) if (m.label) m.label.style.fill = "#ffb0a0";
    for (const m of this.kurganM) if (m.label) m.label.style.fill = "#e0b8ff";
    this.places.children.sort((a, b) => a.y - b.y);
    this.heroPortrait(game.face());
  }

  private ring(color: number, r: number): Graphics {
    return new Graphics().circle(0, 0, r).fill({ color: 0x1a0f06, alpha: 0.9 }).circle(0, 0, r).stroke({ color, width: 4 });
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
    c.addChild(sh, flag, p, this.heroCount, this.heroBars);
    this.heroFlag = flag;
    this.hero = c;
    this.units.addChild(this.troops);
    this.units.addChild(c);
  }

  marker(x: number, y: number): void {
    this.mark = { x, y, t: 0 };
  }

  private bandit(id: number): Container {
    let c = this.bandits.get(id);
    if (c) return c;
    c = new Container();
    const sh = new Graphics().ellipse(0, 22, 18, 6).fill({ color: 0x000000, alpha: 0.35 });
    const p = this.portrait("j_bandit", 18, 0xd2452c);
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
    const h = s.hero;
    const moving = !!h.path;
    this.hero.position.set(h.x, h.y - (moving ? Math.abs(Math.sin(this.time * 9)) * 3 : 0));
    const n = armySize(h.army);
    this.heroCount.text = n > 0 ? String(n) : "";
    const inv = Math.min(2.2, Math.max(0.7, 0.75 / cam.zoom));
    this.hero.scale.set(inv);
    this.trail.push(h.x, h.y);
    if (this.trail.length > 400) this.trail.splice(0, this.trail.length - 400);
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
    const hb = this.heroBars;
    hb.clear();
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
      const c = this.bandit(b.id);
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
      this.kurganM.forEach((m, i) => vis(m, s.kurgans[i].alive));
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
      const ls = Math.min(2.4, Math.max(0.9, 0.7 / cam.zoom));
      for (const m of [...this.villageM, ...this.campM, ...this.kurganM, ...this.cityM]) if (m.label) m.label.scale.set(ls);
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
    for (const k of s.kurgans) {
      if (!k.alive || !game.isExplored(k.x, k.y)) continue;
      const pr = (this.time * 0.6 + k.x * 0.001) % 1;
      this.fxG.circle(k.x, k.y - 8, 26 + pr * 34).stroke({ color: 0xb46aff, width: 3, alpha: 0.55 * (1 - pr) });
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

    if (this.fogDirty) {
      this.fogDirty = false;
      const sg = this.fogSmall.getContext("2d")!;
      const img = sg.createImageData(NW, NH);
      for (let i = 0; i < NW * NH; i++) {
        const o = i * 4;
        img.data[o] = 28;
        img.data[o + 1] = 20;
        img.data[o + 2] = 12;
        img.data[o + 3] = s.explored[i] ? 0 : 236;
      }
      sg.putImageData(img, 0, 0);
      const g = this.fogCanvas.getContext("2d")!;
      g.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
      g.filter = `blur(${FOG_UP * 0.9}px)`;
      g.imageSmoothingEnabled = true;
      g.drawImage(this.fogSmall, -FOG_UP, -FOG_UP, this.fogCanvas.width + FOG_UP * 2, this.fogCanvas.height + FOG_UP * 2);
      g.filter = "none";
      this.fog.texture.source.update();
    }

    const { t } = game.dayOf();
    const dark = Math.max(0, Math.cos(t * Math.PI * 2) * -1) * 0.38;
    this.night.clear();
    if (dark > 0.01) this.night.rect(0, 0, W, H).fill({ color: 0x0c1430, alpha: dark });
    this.lights.visible = dark > 0.03;
    this.lights.alpha = Math.min(0.85, dark * 2.4) * (0.92 + Math.sin(this.time * 3) * 0.08);
    for (const c of this.clouds.children) {
      c.x += dt * 9;
      c.y += dt * 2;
      if (c.x - c.width / 2 > W) c.x = -c.width / 2;
      if (c.y - c.height / 2 > H) c.y = -c.height / 2;
    }
  }
}
