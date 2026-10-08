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

export function setMuted(m: boolean): void {
  muted = m;
}

export function pauseForAd(p: boolean): void {
  suspendedForAd = p;
  if (!ctx) return;
  if (p) void ctx.suspend();
  else void ctx.resume();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number): void {
  const c = ensure();
  if (!c || !master || muted || suspendedForAd) return;
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
  sword(): void {
    tone(2200, 0, 0.05, "sawtooth", 0.18);
    tone(660, 0.03, 0.15, "square", 0.3);
  },
};
