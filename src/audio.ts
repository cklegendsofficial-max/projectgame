let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let suspendedForAd = false;
let lastCoin = 0;

function ensure(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended" && !suspendedForAd) void ctx.resume();
  return ctx;
}

export function unlockAudio(): void {
  ensure();
}

export function audioGraph(): { c: AudioContext; master: GainNode } | null {
  const c = ensure();
  return c && master ? { c, master } : null;
}

export function soundOn(): boolean {
  return !muted && !platformMuted && !suspendedForAd;
}

export function setMuted(m: boolean): void {
  muted = m;
}

let platformMuted = false;

export function setPlatformMuted(m: boolean): void {
  platformMuted = m;
}

export function isPlatformMuted(): boolean {
  return platformMuted;
}

export function pauseForAd(p: boolean): void {
  suspendedForAd = p;
  if (!ctx) return;
  if (p) void ctx.suspend();
  else void ctx.resume();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number): void {
  const c = ensure();
  if (!c || !master || muted || platformMuted || suspendedForAd) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g);
  g.connect(master);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.02);
}

function pluck(c: AudioContext, freq: number, at: number, dur: number): void {
  const len = Math.floor(c.sampleRate * 0.03);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const delay = c.createDelay(0.05);
  delay.delayTime.value = 1 / freq;
  const fb = c.createGain();
  fb.gain.value = 0.94;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2600;
  const out = c.createGain();
  out.gain.setValueAtTime(0.55, at);
  out.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(delay);
  delay.connect(lp);
  lp.connect(fb);
  fb.connect(delay);
  lp.connect(out);
  src.connect(out);
  out.connect(master!);
  src.start(at);
  setTimeout(() => {
    fb.disconnect();
    out.disconnect();
  }, (at - c.currentTime + dur) * 1000 + 100);
}

export const sfx = {
  coin(): void {
    const now = performance.now();
    if (now - lastCoin < 90) return;
    lastCoin = now;
    tone(1318, 0, 0.08, "square", 0.25);
    tone(1760, 0.05, 0.14, "square", 0.22);
  },
  buy(): void {
    tone(523, 0, 0.06, "triangle", 0.5);
    tone(784, 0.04, 0.1, "triangle", 0.45);
  },
  send(): void {
    tone(330, 0, 0.08, "sine", 0.6);
    tone(440, 0.05, 0.1, "sine", 0.5);
  },
  error(): void {
    tone(180, 0, 0.12, "sawtooth", 0.25);
  },
  fanfare(): void {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.25, "triangle", 0.5));
  },
  event(): void {
    tone(988, 0, 0.12, "sine", 0.5);
    tone(1319, 0.1, 0.18, "sine", 0.45);
  },
  kopuz(): void {
    const c = ensure();
    if (!c || !master || !soundOn()) return;
    const notes = [147, 175, 196, 220, 262, 294];
    const seq = [0, 2, 4, 3, 5, 4];
    seq.forEach((n, k) => pluck(c, notes[n], c.currentTime + k * 0.16, k === seq.length - 1 ? 1.6 : 0.7));
  },
  sword(): void {
    tone(2200, 0, 0.05, "sawtooth", 0.18);
    tone(660, 0.03, 0.15, "square", 0.3);
  },
};
