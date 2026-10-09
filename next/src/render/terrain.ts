import { CanvasSource, Geometry, GlProgram, Mesh, Shader, Texture, UniformGroup } from "pixi.js";
import { GH, GW, H, W, type World } from "../world/gen";
import type { SeasonId } from "../game/seasons";

const vertex = `
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;
void main() {
  mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
  gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
  vUV = aUV;
}
`;

const fragment = `
in vec2 vUV;
uniform sampler2D uBase;
uniform sampler2D uData;
uniform sampler2D uNoise;
uniform sampler2D uSand;
uniform sampler2D uSteppe;
uniform sampler2D uGrass;
uniform sampler2D uRock;
uniform float uTime;
uniform float uDetail;
uniform vec2 uWorld;
uniform vec3 uMSand;
uniform vec3 uMSteppe;
uniform vec3 uMGrass;
uniform vec3 uMRock;
uniform vec4 uSeason; // x kar, y çiçek, z kuraklık, w güz

vec3 tile(sampler2D t, vec2 p) {
  vec3 a = texture2D(t, p).rgb;
  vec3 b = texture2D(t, p * 0.41 + vec2(0.31, 0.17)).rgb;
  return mix(a, b, 0.4);
}
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec2 wp = vUV * uWorld;
  vec4 nz = texture2D(uNoise, wp / 700.0);
  vec4 nz2 = texture2D(uNoise, wp / 110.0 + 0.5);
  vec2 warp = (nz2.rg - 0.5) * 11.0 / uWorld;
  vec3 base = texture2D(uBase, vUV).rgb;
  vec4 dat = texture2D(uData, vUV + warp);
  float h = dat.r * 2.0 - 0.8;
  float m = dat.g * 1.3;
  float vig = 1.0 - 0.35 * max(0.0, length((vUV - 0.5) * vec2(1.1, 1.3)) - 0.45);

  // kara: biyom ağırlıkları
  float mm = m + (nz.b - 0.5) * 0.14;
  float wRock = smoothstep(0.40, 0.56, h + (nz.a - 0.5) * 0.06);
  float wSand = 1.0 - smoothstep(0.19, 0.31, mm);
  float wGrass = smoothstep(0.42, 0.58, mm);
  float wSteppe = max(0.0, 1.0 - wSand - wGrass);
  float beach = 1.0 - smoothstep(0.0, 0.03, h);
  wSand = max(wSand, beach * 0.8);
  float land = 1.0 - wRock;
  wSand *= land; wSteppe *= land; wGrass *= land;
  float tot = wSand + wSteppe + wGrass + wRock;
  wSand /= tot; wSteppe /= tot; wGrass /= tot; wRock /= tot;

  vec2 tp = wp / 300.0;
  vec3 tS = tile(uSand, tp);
  vec3 tT = tile(uSteppe, tp * 1.1);
  vec3 tG = tile(uGrass, tp * 1.25);
  vec3 tR = tile(uRock, tp * 0.8);
  vec3 dn = wSand * tS / uMSand + wSteppe * tT / uMSteppe + wGrass * tG / uMGrass + wRock * tR / uMRock;
  vec3 dc = wSand * tS + wSteppe * tT + wGrass * tG + wRock * tR;
  vec3 dm = wSand * uMSand + wSteppe * uMSteppe + wGrass * uMGrass + wRock * uMRock;
  float snow = smoothstep(0.7, 0.8, h);
  float k = uDetail * (1.0 - snow * 0.6);
  vec3 col = base * mix(vec3(1.0), clamp(dn, 0.35, 1.9), k);
  vec3 tinted = dc * (lum(base) / max(0.05, lum(dm)));
  col = mix(col, tinted, 0.28 * k);
  col *= 1.0 - 0.18 * smoothstep(0.0, 0.012, h) * (1.0 - smoothstep(0.012, 0.03, h));

  // mevsimler
  float L = lum(col);
  vec3 dry = vec3(L * 1.18, L * 1.02, L * 0.62);
  col = mix(col, dry, uSeason.z * 0.35 * (wSteppe + wGrass * 0.6));
  vec3 gold = vec3(L * 1.45, L * 0.98, L * 0.42);
  col = mix(col, gold, uSeason.w * 0.55 * (wGrass + wSteppe * 0.4));
  vec4 fine = texture2D(uNoise, wp / 7.0);
  vec2 cell = floor(wp / 8.0);
  float hsh = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  float patch = smoothstep(0.3, 0.55, nz2.r);
  vec2 inC = fract(wp / 8.0) - 0.5 - (vec2(fract(hsh * 13.7), fract(hsh * 29.3)) - 0.5) * 0.4;
  float dot1 = 1.0 - smoothstep(0.14, 0.24, length(inC));
  float petal = step(1.0 - 0.6 * patch, hsh) * dot1 * uSeason.y * (wGrass + wSteppe * 0.5);
  float hue = fract(hsh * 7.31);
  vec3 flower = hue < 0.4 ? vec3(0.92, 0.25, 0.22) : hue < 0.7 ? vec3(0.98, 0.84, 0.30) : vec3(0.96, 0.94, 0.90);
  col = mix(col * (1.0 + uSeason.y * 0.06 * wGrass), flower, petal * 0.8);
  float north = 1.3 - vUV.y * 1.45;
  float cover = smoothstep(0.45, 0.62, uSeason.x * north * 0.8 + h * 0.8 + (nz2.a - 0.5) * 0.3 + (nz.b - 0.5) * 0.35 - wSand * 0.12) * uSeason.x;
  vec3 snowC = vec3(0.90, 0.93, 0.98) * (0.82 + 0.3 * clamp(lum(dc) / max(0.05, lum(dm)), 0.6, 1.4) * 0.6);
  col = mix(col, snowC, cover * 0.92);

  // su
  float hw = h + (nz2.b - 0.5) * 0.012;
  float wf = 1.0 - smoothstep(-0.004, 0.004, hw);
  float depth = clamp(-h / 0.35, 0.0, 1.0);
  vec3 wc = mix(vec3(0.23, 0.50, 0.60), vec3(0.09, 0.25, 0.38), depth);
  vec2 q = wp / 240.0;
  float w1 = texture2D(uNoise, q + vec2(uTime * 0.012, uTime * 0.007)).r;
  float w2 = texture2D(uNoise, q * 1.73 - vec2(uTime * 0.009, -uTime * 0.013)).g;
  float wave = (w1 + w2) * 0.5;
  wc += (wave - 0.5) * 0.10;
  float sp = pow(max(0.0, w1 + w2 - 1.18), 2.0) * 7.0;
  wc += vec3(1.0, 0.94, 0.78) * sp * 0.4 * (1.0 - depth * 0.5);
  float shore = smoothstep(-0.05, -0.003, hw);
  float band = 0.5 + 0.5 * sin(-h * 140.0 + uTime * 1.4 + nz.r * 7.0);
  float foam = shore * smoothstep(0.5, 0.95, band * (0.6 + wave * 0.8));
  wc = mix(wc, vec3(0.70, 0.82, 0.80), shore * 0.25);
  wc = mix(wc, vec3(0.94, 0.97, 0.96), foam * 0.55);
  float ice = uSeason.x * (1.0 - smoothstep(0.08, 0.22, depth + vUV.y * 0.25 - 0.1));
  float crack = smoothstep(0.47, 0.5, abs(fine.a - 0.5) + 0.46) * 0.25;
  wc = mix(wc, vec3(0.80, 0.88, 0.93) - crack, ice * 0.85);
  wc *= vig;
  col = mix(col, wc, wf);

  // nehir parıltısı (kışın buz)
  float blue = smoothstep(0.02, 0.12, base.b - base.r);
  col += vec3(1.0, 0.95, 0.8) * sp * 0.25 * blue * (1.0 - wf) * (1.0 - uSeason.x);
  col = mix(col, vec3(0.82, 0.9, 0.95), blue * (1.0 - wf) * uSeason.x * 0.7 * clamp(north, 0.0, 1.0));

  // bulut gölgeleri
  float cs = smoothstep(0.55, 0.78, texture2D(uNoise, wp / 2600.0 + vec2(uTime * 0.0035, uTime * 0.002)).a);
  col *= 1.0 - 0.17 * cs;

  gl_FragColor = vec4(col, 1.0);
}
`;

export type DetailKey = "sand" | "steppe" | "grass" | "rock";
/** texprep.ts'in ölçtüğü ortalama renkler; dokuyu ortalaması 1 olacak şekilde bölmek için. */
const MEANS: Record<DetailKey, [number, number, number]> = {
  sand: [0.743, 0.606, 0.417],
  steppe: [0.504, 0.426, 0.274],
  grass: [0.347, 0.375, 0.173],
  rock: [0.428, 0.401, 0.346],
};

function repeatTex(img: CanvasImageSource & { width: number; height: number }): Texture {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  c.getContext("2d")!.drawImage(img, 0, 0);
  return new Texture({ source: new CanvasSource({ resource: c, autoGenerateMipmaps: true, addressMode: "repeat", scaleMode: "linear", mipmapFilter: "linear", maxAnisotropy: 8 }) });
}

/** Döşenebilir, 4 kanallı değer gürültüsü: r,g orta; b ince; a kaba. */
function noiseTex(): Texture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  let seed = 1337;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const layer = (cells: number) => {
    const L = new Float32Array(cells * cells).map(() => rnd());
    return (x: number, y: number) => {
      const fx = (x / S) * cells, fy = (y / S) * cells;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const at = (i: number, j: number) => L[((j + cells) % cells) * cells + ((i + cells) % cells)];
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
      const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
      return a + (b - a) * sy;
    };
  };
  const chans = [[8, 16], [8, 32], [16, 32], [4, 8]].map(([a, b]) => [layer(a), layer(b)]);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const o = (y * S + x) * 4;
      chans.forEach(([a, b], k) => (img.data[o + k] = Math.round((a(x, y) * 0.65 + b(x, y) * 0.35) * 255)));
    }
  g.putImageData(img, 0, 0);
  return new Texture({ source: new CanvasSource({ resource: c, addressMode: "repeat", scaleMode: "linear" }) });
}

function dataTex(world: World): Texture {
  const c = document.createElement("canvas");
  c.width = GW;
  c.height = GH;
  const g = c.getContext("2d")!;
  const img = g.createImageData(GW, GH);
  for (let i = 0; i < GW * GH; i++) {
    const o = i * 4;
    img.data[o] = Math.max(0, Math.min(255, Math.round(((world.height[i] + 0.8) / 2) * 255)));
    img.data[o + 1] = Math.max(0, Math.min(255, Math.round((world.moist[i] / 1.3) * 255)));
    img.data[o + 2] = world.river[i] ? 255 : 0;
    img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return new Texture({ source: new CanvasSource({ resource: c, scaleMode: "linear" }) });
}

/** Mevsim başına shader hedefleri: kar, çiçek, kuraklık, güz. */
const SEASON_FX: Record<SeasonId, [number, number, number, number]> = {
  bahar: [0, 1, 0, 0],
  yaz: [0, 0, 1, 0],
  guz: [0, 0, 0.2, 1],
  kis: [1, 0, 0, 0.15],
};

export interface TerrainMesh {
  mesh: Mesh<Geometry, Shader>;
  tick(dt: number, season: SeasonId): void;
}

export function terrainMesh(world: World, detail: Record<DetailKey, Texture>): TerrainMesh {
  const geometry = new Geometry({
    attributes: {
      aPosition: [0, 0, W, 0, W, H, 0, H],
      aUV: [0, 0, 1, 0, 1, 1, 0, 1],
    },
    indexBuffer: [0, 1, 2, 0, 2, 3],
  });
  const base = new Texture({ source: new CanvasSource({ resource: world.canvas, autoGenerateMipmaps: true, scaleMode: "linear", mipmapFilter: "linear" }) });
  const src = (k: DetailKey) => repeatTex(detail[k].source.resource as HTMLImageElement).source;
  const u = new UniformGroup({
    uTime: { value: 0, type: "f32" },
    uDetail: { value: 0.75, type: "f32" },
    uWorld: { value: new Float32Array([W, H]), type: "vec2<f32>" },
    uMSand: { value: new Float32Array(MEANS.sand), type: "vec3<f32>" },
    uMSteppe: { value: new Float32Array(MEANS.steppe), type: "vec3<f32>" },
    uMGrass: { value: new Float32Array(MEANS.grass), type: "vec3<f32>" },
    uMRock: { value: new Float32Array(MEANS.rock), type: "vec3<f32>" },
    uSeason: { value: new Float32Array(4), type: "vec4<f32>" },
  });
  const shader = new Shader({
    glProgram: GlProgram.from({ vertex, fragment, name: "kk-terrain" }),
    resources: {
      uBase: base.source,
      uData: dataTex(world).source,
      uNoise: noiseTex().source,
      uSand: src("sand"),
      uSteppe: src("steppe"),
      uGrass: src("grass"),
      uRock: src("rock"),
      tu: u,
    },
  });
  const mesh = new Mesh({ geometry, shader });
  let time = 0;
  const cur = u.uniforms.uSeason as Float32Array;
  let first = true;
  return {
    mesh,
    tick(dt: number, season: SeasonId) {
      time = (time + dt) % 10000;
      u.uniforms.uTime = time;
      const t = SEASON_FX[season];
      const k = first ? 1 : Math.min(1, dt * 0.6);
      first = false;
      for (let i = 0; i < 4; i++) cur[i] += (t[i] - cur[i]) * k;
    },
  };
}
