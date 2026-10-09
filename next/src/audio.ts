import { settings } from "./settings";

const HICAZ = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19];
const ROOT = 146.83;
const KEY = "kk_audio";

class SoundSystem {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private fx!: GainNode;
  private noise!: AudioBuffer;
  private windG: GainNode | null = null;
  private stormLv = -1;
  private nextNote = 0;
  private step = 3;
  private phrase = 0;
  muted = localStorage.getItem(KEY) === "off";

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return;
    const ctx = (this.ctx = new C());
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(ctx.destination);
    this.music = ctx.createGain();
    this.music.gain.value = settings.music;
    this.music.connect(this.master);
    this.fx = ctx.createGain();
    this.fx.gain.value = settings.fx;
    this.fx.connect(this.master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.drone();
    this.nextNote = ctx.currentTime + 1.5;
    setInterval(() => this.schedule(), 200);
  }

  toggle(): boolean {
    this.muted = !this.muted;
    localStorage.setItem(KEY, this.muted ? "off" : "on");
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8, this.ctx.currentTime, 0.1);
    return this.muted;
  }

  volumes(): void {
    if (!this.ctx) return;
    this.music.gain.setTargetAtTime(settings.music, this.ctx.currentTime, 0.05);
    this.fx.gain.setTargetAtTime(settings.fx, this.ctx.currentTime, 0.05);
  }

  storm(level: number): void {
    if (!this.ctx || !this.windG || level === this.stormLv) return;
    this.stormLv = level;
    this.windG.gain.setTargetAtTime([0.018, 0.09, 0.06][level] ?? 0.018, this.ctx.currentTime, 1.2);
  }

  private drone(): void {
    const ctx = this.ctx!;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    lp.Q.value = 2;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    lp.connect(g).connect(this.music);
    for (const [f, det] of [[ROOT / 2, 0], [ROOT / 2, 7], [(ROOT * 3) / 4, -5]]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = det;
      o.connect(lp);
      o.start();
    }
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 0.07;
    lg.gain.value = 140;
    lfo.connect(lg).connect(lp.frequency);
    lfo.start();
    const wind = ctx.createBufferSource();
    wind.buffer = this.noise;
    wind.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 500;
    bp.Q.value = 0.6;
    const wg = (this.windG = ctx.createGain());
    wg.gain.value = 0.018;
    const wl = ctx.createOscillator();
    const wlg = ctx.createGain();
    wl.frequency.value = 0.11;
    wlg.gain.value = 300;
    wl.connect(wlg).connect(bp.frequency);
    wl.start();
    wind.connect(bp).connect(wg).connect(this.music);
    wind.start();
  }

  private schedule(): void {
    const ctx = this.ctx!;
    if (ctx.state !== "running") return;
    while (this.nextNote < ctx.currentTime + 0.6) {
      const t = this.nextNote;
      if (this.phrase <= 0) {
        this.phrase = 4 + Math.floor(Math.random() * 6);
        this.nextNote += 1.6 + Math.random() * 2.4;
        continue;
      }
      this.phrase--;
      this.step = Math.max(0, Math.min(HICAZ.length - 1, this.step + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)]));
      const f = ROOT * 2 ** (HICAZ[this.step] / 12);
      this.pluck(f, t, 0.11, this.music);
      if (Math.random() < 0.25) this.pluck(f, t + 0.12, 0.06, this.music);
      this.nextNote += [0.32, 0.48, 0.48, 0.64, 0.96][Math.floor(Math.random() * 5)];
    }
  }

  private pluck(f: number, t: number, vol: number, out: AudioNode, dur = 1.4): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o.type = "triangle";
    o2.type = "sawtooth";
    o.frequency.value = f;
    o2.frequency.value = f * 2.005;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(f * 8, t);
    lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(lp);
    o2.connect(g2).connect(lp);
    lp.connect(g).connect(out);
    o.start(t);
    o2.start(t);
    o.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  }

  private tone(f: number, t: number, dur: number, vol: number, type: OscillatorType = "sine", f2?: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g).connect(this.fx);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private burst(t: number, dur: number, vol: number, freq: number): void {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(bp).connect(g).connect(this.fx);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
  }

  play(kind: "click" | "coin" | "hit" | "win" | "lose" | "quest" | "story" | "bad" | "level"): void {
    const ctx = this.ctx;
    if (!ctx || this.muted || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.01;
    const n = (k: number) => ROOT * 2 ** (HICAZ[k] / 12);
    switch (kind) {
      case "click":
        this.tone(1800, t, 0.04, 0.06, "square", 900);
        break;
      case "coin":
        this.tone(1568, t, 0.12, 0.12);
        this.tone(2093, t + 0.07, 0.25, 0.12);
        break;
      case "hit":
        this.burst(t, 0.12, 0.35, 1800 + Math.random() * 1200);
        this.tone(140, t, 0.15, 0.25, "sine", 60);
        if (Math.random() < 0.5) this.tone(2400 + Math.random() * 800, t + 0.02, 0.18, 0.05, "triangle");
        break;
      case "win":
        [4, 6, 7, 11].forEach((k, i) => this.pluck(n(k) * 2, t + i * 0.13, 0.22, this.fx, 1.8));
        this.burst(t, 0.6, 0.08, 6000);
        break;
      case "lose":
        [7, 5, 4, 1, 0].forEach((k, i) => this.pluck(n(k), t + i * 0.2, 0.2, this.fx, 1.6));
        break;
      case "quest":
      case "level":
        [0, 2, 4, 7, 9].forEach((k, i) => this.pluck(n(k) * 2, t + i * 0.09, 0.18, this.fx, 1.4));
        break;
      case "story":
        this.tone(ROOT / 2, t, 3, 0.25, "sine");
        this.tone(ROOT * 1.5, t, 2.5, 0.08, "sine");
        this.burst(t, 1.5, 0.05, 3000);
        break;
      case "bad":
        this.tone(220, t, 0.25, 0.12, "triangle", 150);
        break;
    }
  }
}

export const audio = new SoundSystem();
