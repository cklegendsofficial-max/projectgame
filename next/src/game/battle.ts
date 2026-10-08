import { UNITS, UNIT_KEYS, armyPower, armySize, type Army, type Unit } from "./data";

export interface Round {
  a: Army;
  b: Army;
}

export interface BattleResult {
  rounds: Round[];
  win: boolean;
  lostA: Army;
  lostB: Army;
}

function mult(att: Unit, def: Unit): number {
  if (UNITS[att].beats === def) return 1.6;
  if (UNITS[def].beats === att) return 0.7;
  return 1;
}

function hit(from: Army, to: Army, bonus: number, hp: Record<Unit, number>): Army {
  const total = armySize(to);
  const out: Army = { ...to };
  if (total <= 0) return out;
  for (const u of UNIT_KEYS) {
    if (from[u] <= 0) continue;
    for (const v of UNIT_KEYS) {
      if (to[v] <= 0) continue;
      const share = to[v] / total;
      const dmg = from[u] * UNITS[u].atk * (1 + bonus) * mult(u, v) * share * (0.85 + Math.random() * 0.3);
      hp[v] += dmg;
    }
  }
  for (const v of UNIT_KEYS) {
    const k = Math.floor(hp[v] / UNITS[v].hp);
    if (k > 0) {
      hp[v] -= k * UNITS[v].hp;
      out[v] = Math.max(0, out[v] - k);
    }
  }
  return out;
}

export function fight(a0: Army, aBonus: number, b0: Army, bBonus = 0): BattleResult {
  let a = { ...a0 };
  let b = { ...b0 };
  const hpA = { spear: 0, archer: 0, horse: 0 };
  const hpB = { spear: 0, archer: 0, horse: 0 };
  const rounds: Round[] = [{ a: { ...a }, b: { ...b } }];
  for (let r = 0; r < 10 && armySize(a) > 0 && armySize(b) > 0; r++) {
    const nb = hit(a, b, aBonus, hpB);
    const na = hit(b, a, bBonus, hpA);
    a = na;
    b = nb;
    rounds.push({ a: { ...a }, b: { ...b } });
    if (armySize(a) < armySize(a0) * 0.25 || armySize(b) < armySize(b0) * 0.2) break;
  }
  const win = armyPower(a, aBonus) / Math.max(1, armyPower(a0, aBonus)) >= armyPower(b, bBonus) / Math.max(1, armyPower(b0, bBonus)) && armySize(a) > 0;
  if (win) b = { spear: 0, archer: 0, horse: 0 };
  else for (const u of UNIT_KEYS) a[u] = Math.floor(a[u] * 0.6);
  rounds.push({ a: { ...a }, b: { ...b } });
  const lostA = { spear: a0.spear - a.spear, archer: a0.archer - a.archer, horse: a0.horse - a.horse };
  const lostB = { spear: b0.spear - b.spear, archer: b0.archer - b.archer, horse: b0.horse - b.horse };
  return { rounds, win, lostA, lostB };
}

export function odds(a: Army, aBonus: number, b: Army): number {
  let w = 0;
  for (let k = 0; k < 40; k++) if (fight(a, aBonus, b).win) w++;
  return w / 40;
}
