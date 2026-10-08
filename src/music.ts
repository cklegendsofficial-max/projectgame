import { audioGraph, soundOn } from "./audio";
import type { Season } from "./world";

const HICAZ = [293.66, 311.13, 369.99, 392, 440, 466.16, 523.25, 587.33, 622.25, 739.99];
const BPM = 84;
const EIGHTH = 60 / BPM / 2;
const LOOKAHEAD = 0.6;

let started = false;
let enabled = true;
let season: Season = "spring";
let bus: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let ambBus: GainNode | null = null;
let nextTime = 0;
let step = 0;
let melodyPos = 4;
let phrase: (number | null)[] = [];
let neyNext = 0;
let wind: { src: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
let noiseBuf: AudioBuffer | null = null;
const plucks = new Map<number, AudioBuffer>();

export function setMusicEnabled(on: boolean): void {
  enabled = on;
}

export function setMusicSeason(s: Season): void {
  season = s;
}

function impulse(c: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

function noise(c: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  const len = c.sampleRate * 2;
  noiseBuf = c.createBuffer(1, len, c.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function pluckBuffer(c: AudioContext, freq: number): AudioBuffer {
  const key = Math.round(freq * 10);
  const cached = plucks.get(key);
  if (cached) return cached;
  const sr = c.sampleRate;
  const len = Math.floor(sr * 1.6);
  const buf = c.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const period = Math.max(2, Math.round(sr / freq));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const next = (idx + 1) % period;
    const v = 0.5 * (ring[idx] + ring[next]) * 0.994;
    d[i] = ring[idx];
    ring[idx] = v;
    idx = next;
  }
  plucks.set(key, buf);
  return buf;
}

function oud(c: AudioContext, t: number, freq: number, vol: number): void {
  const src = c.createBufferSource();
  src.buffer = pluckBuffer(c, freq);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 2400;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  src.connect(f).connect(g);
  g.connect(bus!);
  g.connect(reverb!);
  src.start(t);
  src.stop(t + 1.6);
}

function ney(c: AudioContext, t: number, freq: number, dur: number): void {
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(freq * 0.985, t);
  o.frequency.linearRampToValueAtTime(freq, t + 0.25);
  const vib = c.createOscillator();
  vib.frequency.value = 5.2;
  const vibG = c.createGain();
  vibG.gain.setValueAtTime(0, t);
  vibG.gain.linearRampToValueAtTime(freq * 0.008, t + dur * 0.5);
  vib.connect(vibG).connect(o.frequency);
  const breath = c.createBufferSource();
  breath.buffer = noise(c);
  const bf = c.createBiquadFilter();
  bf.type = "bandpass";
  bf.frequency.value = freq * 2;
  bf.Q.value = 3;
  const bg = c.createGain();
  bg.gain.value = 0.25;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.35);
  g.gain.setValueAtTime(0.09, t + dur - 0.4);
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g);
  breath.connect(bf).connect(bg).connect(g);
  g.connect(bus!);
  g.connect(reverb!);
  o.start(t);
  vib.start(t);
  breath.start(t, Math.random());
  o.stop(t + dur + 0.05);
  vib.stop(t + dur + 0.05);
  breath.stop(t + dur + 0.05);
}

function drum(c: AudioContext, t: number, low: boolean): void {
  const g = c.createGain();
  g.connect(bus!);
  if (low) {
    const o = c.createOscillator();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.18);
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.4);
  } else {
    const n = c.createBufferSource();
    n.buffer = noise(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2200;
    f.Q.value = 1.2;
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    n.connect(f).connect(g);
    n.start(t, Math.random());
    n.stop(t + 0.1);
  }
}

function makePhrase(): (number | null)[] {
  const out: (number | null)[] = [];
  let pos = melodyPos;
  for (let k = 0; k < 16; k++) {
    if (k % 8 === 7 || Math.random() < 0.22) {
      out.push(null);
      continue;
    }
    const r = Math.random();
    pos += r < 0.38 ? 1 : r < 0.76 ? -1 : r < 0.88 ? 2 : -2;
    pos = Math.max(0, Math.min(HICAZ.length - 1, pos));
    out.push(pos);
  }
  out[15] = Math.random() < 0.5 ? 0 : 4;
  melodyPos = out[15]!;
  return out;
}

function startDrone(c: AudioContext): void {
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 400;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoG = c.createGain();
  lfoG.gain.value = 180;
  lfo.connect(lfoG).connect(f.frequency);
  const g = c.createGain();
  g.gain.value = 0.035;
  for (const [freq, det] of [[73.42, -6], [73.42, 6], [110, 0]] as const) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    o.detune.value = det;
    o.connect(f);
    o.start();
  }
  f.connect(g);
  g.connect(bus!);
  g.connect(reverb!);
  lfo.start();
}

function startWind(c: AudioContext): void {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 500;
  filter.Q.value = 0.8;
  const gain = c.createGain();
  gain.gain.value = 0;
  src.connect(filter).connect(gain).connect(ambBus!);
  src.start();
  wind = { src, filter, gain };
}

function bird(c: AudioContext, t: number): void {
  const n = 2 + Math.floor(Math.random() * 4);
  const base = 2600 + Math.random() * 1600;
  for (let k = 0; k < n; k++) {
    const s = t + k * 0.11;
    const o = c.createOscillator();
    o.frequency.setValueAtTime(base, s);
    o.frequency.exponentialRampToValueAtTime(base * 1.4, s + 0.06);
    const g = c.createGain();
    g.gain.setValueAtTime(0, s);
    g.gain.linearRampToValueAtTime(0.04, s + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, s + 0.08);
    o.connect(g).connect(ambBus!);
    o.start(s);
    o.stop(s + 0.1);
  }
}

function schedule(): void {
  const a = audioGraph();
  if (!a || !bus || !ambBus) return;
  const { c } = a;
  const on = enabled && soundOn() && c.state === "running" && !document.hidden;
  const target = on ? 1 : 0;
  bus.gain.setTargetAtTime(target * 1.8, c.currentTime, 0.4);
  ambBus.gain.setTargetAtTime(target * 2, c.currentTime, 0.6);
  if (wind) {
    const wv = season === "winter" ? 0.09 : season === "summer" ? 0.035 : season === "autumn" ? 0.04 : 0.012;
    wind.gain.gain.setTargetAtTime(wv, c.currentTime, 2);
    wind.filter.frequency.setTargetAtTime(season === "winter" ? 700 + Math.sin(c.currentTime * 0.3) * 300 : 420, c.currentTime, 1);
  }
  if (nextTime < c.currentTime) nextTime = c.currentTime + 0.05;
  while (nextTime < c.currentTime + LOOKAHEAD) {
    const t = nextTime;
    const inBar = step % 8;
    if (on) {
      if (inBar === 0) drum(c, t, true);
      else if (inBar === 4 || inBar === 6) drum(c, t, false);
      else if (inBar === 3 && Math.random() < 0.3) drum(c, t, false);
      const cycle = step % 64;
      if (cycle === 0) phrase = makePhrase();
      if (cycle < 32 && cycle % 2 === 0) {
        const n = phrase[(cycle / 2) % 16];
        if (n !== null && n !== undefined) oud(c, t, HICAZ[n], 0.8);
      } else if (cycle >= 32 && cycle < 48 && cycle % 2 === 0 && Math.random() < 0.35) {
        oud(c, t, HICAZ[[0, 2, 4][Math.floor(Math.random() * 3)]] / 2, 0.35);
      }
      if (cycle === 32 && t > neyNext && Math.random() < 0.7) {
        const notes = [4, 5, 4, 3, 2, 1, 0];
        const start = Math.floor(Math.random() * 3);
        for (let k = 0; k < 3; k++) ney(c, t + k * EIGHTH * 4, HICAZ[notes[start + k]] * 2, EIGHTH * 4 + 0.15);
        neyNext = t + EIGHTH * 128;
      }
      if (season === "spring" && Math.random() < 0.02) bird(c, t);
    }
    nextTime += EIGHTH;
    step++;
  }
}

export function startMusic(): void {
  if (started) return;
  const a = audioGraph();
  if (!a) return;
  started = true;
  const { c, master } = a;
  bus = c.createGain();
  bus.gain.value = 0;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  bus.connect(comp).connect(master);
  reverb = c.createConvolver();
  reverb.buffer = impulse(c, 2.8);
  const wet = c.createGain();
  wet.gain.value = 0.35;
  reverb.connect(wet).connect(bus);
  ambBus = c.createGain();
  ambBus.gain.value = 0;
  ambBus.connect(master);
  startDrone(c);
  startWind(c);
  window.setInterval(schedule, 150);
}
