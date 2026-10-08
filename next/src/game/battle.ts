import { UNITS, UNIT_KEYS, armyPower, armySize, type Army, type Unit } from "./data";

export interface Champion {
  atk: number;
  def: number;
  hp: number;
  maxHp: number;
}

export interface Round {
  a: Army;
  b: Army;
  hp: number;
}

export interface BattleResult {
  rounds: Round[];
  win: boolean;
  lostA: Army;
  lostB: Army;
  heroHp: number;
  heroDown: boolean;
}

function mult(att: Unit, def: Unit): number {
  if (UNITS[att].beats === def) return 1.6;
  if (UNITS[def].beats === att) return 0.7;
  return 1;
}

const CHAMP_WEIGHT = 3;

function hit(from: Army, to: Army, bonus: number, hp: Record<Unit, number>, extra: number, champTarget: Champion | null): { out: Army; toChamp: number } {
  const total = armySize(to) + (champTarget && champTarget.hp > 0 ? CHAMP_WEIGHT : 0);
  const out: Army = { ...to };
  let toChamp = 0;
  if (total <= 0) return { out, toChamp };
  const deal = (dmgBase: (v: Unit) => number) => {
    for (const v of UNIT_KEYS) {
      if (to[v] <= 0) continue;
      hp[v] += dmgBase(v) * (to[v] / total);
    }
    if (champTarget && champTarget.hp > 0) toChamp += dmgBase("spear") * (CHAMP_WEIGHT / total);
  };
  for (const u of UNIT_KEYS) {
    if (from[u] <= 0) continue;
    deal((v) => from[u] * UNITS[u].atk * (1 + bonus) * mult(u, v) * (0.85 + Math.random() * 0.3));
  }
  if (extra > 0) deal(() => extra * (0.85 + Math.random() * 0.3));
  for (const v of UNIT_KEYS) {
    const k = Math.floor(hp[v] / UNITS[v].hp);
    if (k > 0) {
      hp[v] -= k * UNITS[v].hp;
      out[v] = Math.max(0, out[v] - k);
    }
  }
  return { out, toChamp };
}

function champPow(c: Champion | null, hp: number): number {
  return c ? c.atk * Math.sqrt(Math.max(0, hp)) * 0.6 : 0;
}

export function fight(a0: Army, aBonus: number, b0: Army, bBonus = 0, champ: Champion | null = null): BattleResult {
  let a = { ...a0 };
  let b = { ...b0 };
  const c = champ ? { ...champ } : null;
  const hpA = { spear: 0, archer: 0, horse: 0 };
  const hpB = { spear: 0, archer: 0, horse: 0 };
  const rounds: Round[] = [{ a: { ...a }, b: { ...b }, hp: c?.hp ?? 0 }];
  const aAlive = () => armySize(a) > 0 || (!!c && c.hp > 0);
  for (let r = 0; r < 12 && aAlive() && armySize(b) > 0; r++) {
    const atkB = hit(a, b, aBonus, hpB, c && c.hp > 0 ? c.atk * (1 + aBonus) : 0, null);
    const atkA = hit(b, a, bBonus, hpA, 0, c);
    if (c) c.hp = Math.max(0, c.hp - (atkA.toChamp * 100) / (100 + c.def * 6));
    a = atkA.out;
    b = atkB.out;
    rounds.push({ a: { ...a }, b: { ...b }, hp: c?.hp ?? 0 });
    if (c && c.hp <= 0) break;
    if (armySize(b) < armySize(b0) * 0.2) break;
    if (!c && armySize(a) < armySize(a0) * 0.25) break;
  }
  const startA = armyPower(a0, aBonus) + champPow(c, champ?.hp ?? 0);
  const endA = armyPower(a, aBonus) + champPow(c, c?.hp ?? 0);
  const heroDown = !!c && c.hp <= 0;
  const win = !heroDown && endA / Math.max(1, startA) >= armyPower(b, bBonus) / Math.max(1, armyPower(b0, bBonus)) && aAlive();
  if (win) b = { spear: 0, archer: 0, horse: 0 };
  else for (const u of UNIT_KEYS) a[u] = Math.floor(a[u] * 0.6);
  rounds.push({ a: { ...a }, b: { ...b }, hp: c?.hp ?? 0 });
  const lostA = { spear: a0.spear - a.spear, archer: a0.archer - a.archer, horse: a0.horse - a.horse };
  const lostB = { spear: b0.spear - b.spear, archer: b0.archer - b.archer, horse: b0.horse - b.horse };
  return { rounds, win, lostA, lostB, heroHp: Math.round(c?.hp ?? 0), heroDown };
}

export function odds(a: Army, aBonus: number, b: Army, bBonus = 0, champ: Champion | null = null): number {
  let w = 0;
  for (let k = 0; k < 40; k++) if (fight(a, aBonus, b, bBonus, champ).win) w++;
  return w / 40;
}
