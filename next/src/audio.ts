import { settings } from "./settings";

const HICAZ = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19];
const USSAK = [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19];
const HUSEYNI = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19];
const RAST = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19];
const ROOT = 146.83;
const KEY = "kk_audio";

type Mood = { scale: number[]; root: number; tempo: number; rest: number; wind: number; drum: boolean; bell: boolean; war?: boolean; zil?: boolean; pulse?: boolean; throat?: boolean; lead?: number };
export type MusicScene = "travel" | "battle" | "city" | "danger" | "steppe";
/** Sahne müziği mevsim havasını ezer; "travel" mevsimin kendisidir. */
const SCENES: Record<Exclude<MusicScene, "travel">, Partial<Mood>> = {
  battle: { scale: HICAZ, root: 146.83, tempo: 0.6, rest: 0.35, drum: true, war: true, bell: false, lead: 1.3 },
  city: { scale: RAST, root: 164.81, tempo: 0.78, rest: 0.7, drum: true, zil: true, bell: false, lead: 1.1 },
  danger: { scale: HICAZ, root: 110, tempo: 1.3, rest: 1.5, drum: false, pulse: true, bell: false, lead: 0.8 },
  steppe: { scale: HUSEYNI, root: 110, tempo: 1.2, rest: 1.3, drum: false, throat: true, bell: false, lead: 0.9 },
};
const MOODS: Record<string, Mood> = {
  bahar: { scale: RAST, root: 146.83, tempo: 1, rest: 1, wind: 0.014, drum: false, bell: false },
  yaz: { scale: HICAZ, root: 146.83, tempo: 0.82, rest: 0.8, wind: 0.02, drum: true, bell: false },
  guz: { scale: USSAK, root: 130.81, tempo: 1.15, rest: 1.2, wind: 0.03, drum: false, bell: false },
  kis: { scale: HUSEYNI, root: 110, tempo: 1.45, rest: 1.6, wind: 0.07, drum: false, bell: true },
};

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
  private mood: Mood = MOODS.bahar;
  private moodK = "";
  private night = false;
  private cricketT = 0;
  private scene: MusicScene = "travel";
  private ducked = false;
  private pulseT = 0;
  private throatT = 0;
  muted = localStorage.getItem(KEY) === "off";

  get currentScene(): MusicScene {
    return this.scene;
  }

  setScene(sc: MusicScene): void {
    if (sc === this.scene) return;
    this.scene = sc;
    this.phrase = 0;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.nextNote = Math.min(this.nextNote, t + 0.5);
    const g = this.musicLevel();
    this.music.gain.cancelScheduledValues(t);
    this.music.gain.setTargetAtTime(g * 0.25, t, 0.15);
    this.music.gain.setTargetAtTime(g, t + 0.5, 0.4);
    if (sc === "battle") [0, 0.3, 0.6].forEach((d) => this.drum(t + 0.5 + d, true));
  }

  duck(on: boolean): void {
    this.ducked = on;
    if (this.ctx) this.music.gain.setTargetAtTime(this.musicLevel(), this.ctx.currentTime, 0.3);
  }

  private musicLevel(): number {
    return settings.music * (this.ducked ? 0.3 : 1);
  }

  private cur(): Mood {
    return this.scene === "travel" ? this.mood : { ...this.mood, ...SCENES[this.scene] };
  }

  setMood(season: string, night: boolean): void {
    this.night = night;
    if (season === this.moodK) return;
    this.moodK = season;
    this.mood = MOODS[season] ?? MOODS.bahar;
    this.step = Math.min(this.step, this.mood.scale.length - 1);
    if (this.ctx && this.windG && this.stormLv <= 0) this.windG.gain.setTargetAtTime(this.mood.wind, this.ctx.currentTime, 3);
  }

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
    this.music.gain.setTargetAtTime(this.musicLevel(), this.ctx.currentTime, 0.05);
    this.fx.gain.setTargetAtTime(settings.fx, this.ctx.currentTime, 0.05);
  }

  storm(level: number): void {
    if (!this.ctx || !this.windG || level === this.stormLv) return;
    this.stormLv = level;
    this.windG.gain.setTargetAtTime([this.mood.wind, 0.09, this.moodK === "kis" ? 0.11 : 0.06][level] ?? this.mood.wind, this.ctx.currentTime, 1.2);
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
    const m = this.cur();
    const now = ctx.currentTime;
    if (this.night && this.moodK === "yaz" && this.scene === "travel" && now > this.cricketT) {
      this.cricketT = now + 0.9 + Math.random() * 1.6;
      for (let k = 0; k < 3; k++) this.tone(4200 + Math.random() * 300, now + 0.05 + k * 0.07, 0.04, 0.012, "sine");
    }
    if (m.pulse && now > this.pulseT) {
      this.pulseT = now + 1.15;
      this.drum(now + 0.05, true, 0.06);
      this.drum(now + 0.32, true, 0.035);
    }
    if (m.throat && now > this.throatT) {
      this.throatT = now + 7 + Math.random() * 6;
      this.throat(m.root / 2, now + 0.1);
    }
    const lead = 0.11 * (m.lead ?? 1);
    while (this.nextNote < now + 0.6) {
      const t = this.nextNote;
      if (this.phrase <= 0) {
        this.phrase = 4 + Math.floor(Math.random() * 6);
        this.nextNote += (1.6 + Math.random() * 2.4) * m.rest;
        if (m.war) [0, 0.25, 0.5, 0.62, 0.75, 1].forEach((d, i) => this.drum(t + d * m.tempo * 1.4, i % 3 === 0, i % 3 === 0 ? 0.13 : 0.05));
        else if (m.drum) [0, 0.36, 0.54, 0.9].forEach((d, i) => this.drum(t + d * m.tempo, i % 2 === 0));
        continue;
      }
      this.phrase--;
      this.step = Math.max(0, Math.min(m.scale.length - 1, this.step + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)]));
      const f = m.root * 2 ** (m.scale[this.step] / 12);
      this.pluck(f, t, lead, this.music, m.bell ? 2.4 : m.war ? 0.9 : 1.4);
      if (m.war && Math.random() < 0.5) this.pluck(f * 2, t + 0.08, lead * 0.45, this.music, 0.6);
      if (m.bell && Math.random() < 0.3) this.bell(f * 4, t + 0.2);
      else if (Math.random() < 0.25) this.pluck(f, t + 0.12 * m.tempo, 0.06, this.music);
      if (m.war) this.drum(t, Math.random() < 0.5, 0.07);
      else if (m.drum && Math.random() < 0.3) this.drum(t, Math.random() < 0.4);
      if (m.zil && Math.random() < 0.22) this.zil(t + 0.05);
      this.nextNote += [0.32, 0.48, 0.48, 0.64, 0.96][Math.floor(Math.random() * 5)] * m.tempo;
    }
  }

  /** Def zili: kısa, parlak metal şıngırtısı. */
  private zil(t: number): void {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 6500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.035, t);
    g.gain.exponentialRampToValueAtTime(0.0006, t + 0.18);
    s.connect(hp).connect(g).connect(this.music);
    s.start(t, Math.random() * 0.5);
    s.stop(t + 0.2);
  }

  /** Hömey: kalın temel ses üstünde gezinen ıslıklı armonik. */
  private throat(f: number, t: number): void {
    const ctx = this.ctx!;
    const dur = 4.5;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 18;
    const harm = [6, 8, 9, 10, 12];
    bp.frequency.setValueAtTime(f * harm[0], t);
    harm.forEach((h, i) => bp.frequency.linearRampToValueAtTime(f * h, t + 0.6 + i * 0.8));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.6);
    g.gain.setValueAtTime(0.05, t + dur - 0.8);
    g.gain.linearRampToValueAtTime(0, t + dur);
    const body = ctx.createBiquadFilter();
    body.type = "lowpass";
    body.frequency.value = f * 3;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0, t);
    bg.gain.linearRampToValueAtTime(0.03, t + 0.6);
    bg.gain.setValueAtTime(0.03, t + dur - 0.8);
    bg.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(bp).connect(g).connect(this.music);
    o.connect(body).connect(bg).connect(this.music);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private drum(t: number, dum: boolean, vol?: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(dum ? 110 : 320, t);
    o.frequency.exponentialRampToValueAtTime(dum ? 55 : 180, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol ?? (dum ? 0.09 : 0.04), t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + (dum ? 0.25 : 0.1));
    o.connect(g).connect(this.music);
    o.start(t);
    o.stop(t + 0.3);
  }

  private bell(f: number, t: number): void {
    const ctx = this.ctx!;
    for (const [mul, v] of [[1, 0.03], [2.76, 0.012], [5.4, 0.006]] as const) {
      const o = ctx.createOscillator();
      o.frequency.value = f * mul;
      const g = ctx.createGain();
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.0004, t + 2.2);
      o.connect(g).connect(this.music);
      o.start(t);
      o.stop(t + 2.3);
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
