import { UNITS, UNIT_KEYS, armyPower, armySize, type Army, type Unit } from "./data";
import type { SkillKind } from "./classes";

export interface Champion {
  atk: number;
  def: number;
  hp: number;
  maxHp: number;
  crit: number;
  critMult: number;
  dodge: number;
  heal: number;
  rage: boolean;
  firstStrike: boolean;
  skills: { name: string; kind: SkillKind; pow: number }[];
}

export interface Boss {
  name: string;
  icon: string;
  atk: number;
  def: number;
  hp: number;
}

export interface Round {
  a: Army;
  b: Army;
  hp: number;
  bhp: number;
  ev: string[];
}

export interface BattleResult {
  rounds: Round[];
  win: boolean;
  lostA: Army;
  lostB: Army;
  heroHp: number;
  heroDown: boolean;
  bossDown: boolean;
}

function mult(att: Unit, def: Unit): number {
  if (UNITS[att].beats === def) return 1.6;
  if (UNITS[def].beats === att) return 0.7;
  return 1;
}

const CHAMP_WEIGHT = 3;
const BOSS_WEIGHT = 5;
const NONE: Army = { spear: 0, archer: 0, horse: 0 };

function hit(from: Army, to: Army, bonus: number, hp: Record<Unit, number>, extra: number, target: { hp: number } | null, weight: number): { out: Army; toChamp: number } {
  const total = armySize(to) + (target && target.hp > 0 ? weight : 0);
  const out: Army = { ...to };
  let toChamp = 0;
  if (total <= 0) return { out, toChamp };
  const deal = (dmgBase: (v: Unit) => number) => {
    for (const v of UNIT_KEYS) {
      if (to[v] <= 0) continue;
      hp[v] += dmgBase(v) * (to[v] / total);
    }
    if (target && target.hp > 0) toChamp += dmgBase("spear") * (weight / total);
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

function champPow(c: { atk: number } | null, hp: number): number {
  return c ? c.atk * Math.sqrt(Math.max(0, hp)) * 0.6 : 0;
}

export function fight(a0: Army, aBonus0: number, b0: Army, bBonus = 0, champ: Champion | null = null, boss0: Boss | null = null): BattleResult {
  let a = { ...a0 };
  let b = { ...b0 };
  const c = champ ? { ...champ } : null;
  const boss = boss0 ? { ...boss0 } : null;
  const hpA = { spear: 0, archer: 0, horse: 0 };
  const hpB = { spear: 0, archer: 0, horse: 0 };
  const sk = (k: SkillKind) => c?.skills.filter((s) => s.kind === k) ?? [];
  const aBonus = aBonus0 + sk("aura").reduce((t, s) => t + s.pow, 0);
  if (c) {
    for (const s of sk("fury")) c.atk *= 1 + s.pow;
    for (const s of sk("evade")) c.dodge = Math.min(0.6, c.dodge + s.pow);
  }
  const shield = sk("shield");
  const burst = sk("burst");
  const poison = sk("poison");
  const rounds: Round[] = [{ a: { ...a }, b: { ...b }, hp: c?.hp ?? 0, bhp: boss?.hp ?? 0, ev: [] }];
  const aAlive = () => armySize(a) > 0 || (!!c && c.hp > 0);
  const bAlive = () => (boss ? boss.hp > 0 : armySize(b) > 0);
  const champHit = (ev: string[]) => {
    if (!c || c.hp <= 0) return 0;
    let d = c.atk;
    if (c.rage && c.hp < c.maxHp / 2) {
      d *= 1.3;
      if (!ev.includes("Öfke")) ev.push("Öfke");
    }
    if (Math.random() < c.crit) {
      d *= c.critMult;
      ev.push("Kritik!");
    }
    return d;
  };
  const hurtBoss = (dmg: number) => {
    if (boss) boss.hp = Math.max(0, boss.hp - (dmg * 100) / (100 + boss.def * 6));
  };
  if (c?.firstStrike) {
    const ev = ["Gölge Darbesi"];
    const r = hit(NONE, b, aBonus, hpB, champHit(ev) * 1.5, boss, BOSS_WEIGHT);
    b = r.out;
    hurtBoss(r.toChamp);
    rounds.push({ a: { ...a }, b: { ...b }, hp: c.hp, bhp: boss?.hp ?? 0, ev });
  }
  const maxR = boss ? 16 : 12;
  for (let r = 0; r < maxR && aAlive() && bAlive(); r++) {
    const ev: string[] = [];
    let extra = champHit(ev) * (1 + aBonus);
    if (c && c.hp > 0) {
      if (r % 3 === 0)
        for (const s of burst) {
          extra += c.atk * s.pow;
          ev.push(s.name);
        }
      for (const s of poison) {
        extra += c.atk * s.pow;
        if (r === 0) ev.push(s.name);
      }
    }
    const inMul = r < 3 ? shield.reduce((m, s) => m * (1 - s.pow), 1) : 1;
    if (inMul < 1 && r === 0) for (const s of shield) ev.push(s.name);
    const atkB = hit(a, b, aBonus, hpB, extra, boss, BOSS_WEIGHT);
    const bossDmg = boss && boss.hp > 0 ? boss.atk * inMul : 0;
    const atkA = hit(b, a, (1 + bBonus) * inMul - 1, hpA, bossDmg, c, CHAMP_WEIGHT);
    hurtBoss(atkB.toChamp);
    if (c) {
      if (c.dodge > 0 && Math.random() < c.dodge) ev.push("Sıyrıldın");
      else c.hp = Math.max(0, c.hp - (atkA.toChamp * 100) / (100 + c.def * 6));
      if (c.heal > 0 && c.hp > 0) {
        c.hp = Math.min(c.maxHp, c.hp + c.maxHp * c.heal);
        ev.push("Ruh şifası");
      }
    }
    a = atkA.out;
    b = atkB.out;
    if (boss && boss.hp <= 0) ev.push(`${boss.name} düştü!`);
    rounds.push({ a: { ...a }, b: { ...b }, hp: c?.hp ?? 0, bhp: boss?.hp ?? 0, ev });
    if (c && c.hp <= 0) break;
    if (!boss && armySize(b) < armySize(b0) * 0.2) break;
    if (!c && armySize(a) < armySize(a0) * 0.25) break;
  }
  const heroDown = !!c && c.hp <= 0;
  let win: boolean;
  if (boss) win = boss.hp <= 0 && !heroDown && aAlive();
  else {
    const startA = armyPower(a0, aBonus) + champPow(c, champ?.hp ?? 0);
    const endA = armyPower(a, aBonus) + champPow(c, c?.hp ?? 0);
    win = !heroDown && endA / Math.max(1, startA) >= armyPower(b, bBonus) / Math.max(1, armyPower(b0, bBonus)) && aAlive();
  }
  if (win) b = { ...NONE };
  else for (const u of UNIT_KEYS) a[u] = Math.floor(a[u] * 0.6);
  rounds.push({ a: { ...a }, b: { ...b }, hp: c?.hp ?? 0, bhp: boss?.hp ?? 0, ev: [] });
  const lostA = { spear: a0.spear - a.spear, archer: a0.archer - a.archer, horse: a0.horse - a.horse };
  const lostB = { spear: b0.spear - b.spear, archer: b0.archer - b.archer, horse: b0.horse - b.horse };
  return { rounds, win, lostA, lostB, heroHp: Math.round(c?.hp ?? 0), heroDown, bossDown: !!boss && boss.hp <= 0 };
}

export function odds(a: Army, aBonus: number, b: Army, bBonus = 0, champ: Champion | null = null, boss: Boss | null = null): number {
  let w = 0;
  for (let k = 0; k < 40; k++) if (fight(a, aBonus, b, bBonus, champ, boss).win) w++;
  return w / 40;
}
