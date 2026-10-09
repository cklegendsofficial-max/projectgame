export type PersonaId = "umay" | "tengri" | "erlik";

export interface Persona {
  id: PersonaId;
  name: string;
  icon: string;
  desc: string;
  /** günlük gerilim artış çarpanı */
  threat: number;
  /** tehdit eşiği */
  limit: number;
  /** zor anda yardım olasılığı */
  mercy: number;
  /** düşman güç çarpanı */
  power: number;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  umay: { id: "umay", name: "Umay Ana", icon: "healer", desc: "Merhametli anlatıcı. Tehditler seyrek ve hafif; zor anlarında yardım eli uzanır.", threat: 0.75, limit: 6, mercy: 0.7, power: 0.8 },
  tengri: { id: "tengri", name: "Gök Tengri", icon: "ruh", desc: "Dengeli anlatıcı. Fırtına ile sükûnet sırayla gelir.", threat: 1, limit: 4.5, mercy: 0.4, power: 1 },
  erlik: { id: "erlik", name: "Erlik Han", icon: "boss_erlik", desc: "Acımasız anlatıcı. Belalar üst üste gelir, yardım nadirdir. Yalnızca yürekliler için.", threat: 1.35, limit: 3.2, mercy: 0.15, power: 1.3 },
};

export const PERSONA_KEYS: PersonaId[] = ["umay", "tengri", "erlik"];

export type Threat = "pusu" | "firtina" | "baskin" | "akin" | "isyan";
export type Relief = "hediye" | "gonullu" | "sifa" | "olay";

export interface DirState {
  p: PersonaId;
  t: number;
  fight: number;
  losses: number;
  log: { d: number; t: string; bad: boolean }[];
}

export const DIR_DEFAULT: DirState = { p: "tengri", t: 0, fight: 0, losses: 0, log: [] };

export interface DirCtx {
  day: number;
  lv: number;
  gold: number;
  hpFrac: number;
  armyFill: number;
  beylik: boolean;
  owned: number;
  warRivals: number;
}

/** Günlük gerilim artışı */
export function tensionGain(st: DirState, c: DirCtx): number {
  const p = PERSONAS[st.p];
  let g = 1;
  if (c.gold > 400 + c.lv * 150) g += 0.8;
  if (c.armyFill > 0.8) g += 0.5;
  if (c.day - st.fight >= 2) g += 1;
  if (c.lv < 3) g *= 0.5;
  return g * p.threat;
}

export function struggling(st: DirState, c: DirCtx): boolean {
  return c.hpFrac < 0.4 || (c.gold < 60 && c.armyFill < 0.3) || st.losses >= 2;
}

export function pickThreat(c: DirCtx, rnd = Math.random): Threat {
  const pool: [Threat, number][] = [["pusu", 3], ["firtina", 1.5], ["baskin", c.lv >= 3 ? 1.5 : 0], ["akin", c.warRivals ? 2 : 0], ["isyan", c.owned ? 1.2 : 0]];
  const tot = pool.reduce((a, [, w]) => a + w, 0);
  let r = rnd() * tot;
  for (const [k, w] of pool) if ((r -= w) <= 0) return k;
  return "pusu";
}

export function pickRelief(c: DirCtx, rnd = Math.random): Relief {
  if (c.hpFrac < 0.4) return "sifa";
  const pool: Relief[] = c.armyFill < 0.3 ? ["gonullu", "hediye", "olay"] : ["hediye", "olay", "gonullu"];
  return pool[Math.floor(rnd() * pool.length)];
}
