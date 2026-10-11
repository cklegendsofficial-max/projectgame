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
  order?: Order;
  ma?: number;
  mb?: number;
}

export type Ground = "bozkir" | "cayir" | "kum" | "dag";
export interface Field {
  ground: Ground;
  night: boolean;
}
export const GROUNDS: Record<Ground, { name: string; icon: string; mul: Partial<Record<Unit, number>>; text: string }> = {
  bozkir: { name: "Açık bozkır", icon: "u_cavalry", mul: { horse: 1.3 }, text: "Atlılar için uçsuz meydan: atlı hasarı +%30." },
  cayir: { name: "Çayır ve koru", icon: "u_spear", mul: { spear: 1.2, archer: 0.85 }, text: "Ağaçlar okları keser, mızrak safı sağlam durur: mızraklı +%20, okçu -%15." },
  kum: { name: "Kum tepeleri", icon: "u_archer", mul: { horse: 1.1, spear: 0.85 }, text: "Ayak kumda batar: mızraklı -%15, atlı +%10." },
  dag: { name: "Dağ geçidi", icon: "u_archer", mul: { archer: 1.3, horse: 0.7 }, text: "Yüksekten atılan ok ölümcül, atlar kayalıkta tökezler: okçu +%30, atlı -%30." },
};
export function fieldMul(f: Field | null): Partial<Record<Unit, number>> {
  if (!f) return {};
  const m = { ...GROUNDS[f.ground].mul };
  if (f.night) m.archer = (m.archer ?? 1) * 0.75;
  return m;
}

export interface BattleResult {
  rounds: Round[];
  win: boolean;
  lostA: Army;
  lostB: Army;
  heroHp: number;
  heroDown: boolean;
  bossDown: boolean;
  orders: Order[];
  rout: "a" | "b" | null;
}

export type Order = "nara" | "kanat" | "ricat" | "yedek";
export const ORDER_KEYS: Order[] = ["nara", "kanat", "ricat", "yedek"];
export const RESERVE_SHARE = 0.25;
export const RESERVE_MIN = 8;
export const ORDERS: Record<Order, { name: string; icon: string; text: string }> = {
  nara: { name: "Nara", icon: "u_spear", text: "İki tur boyunca birliğin +%25 güçle vurur." },
  kanat: { name: "Kanat Saldırısı", icon: "u_cavalry", text: "Atlılar yandan dolanır: bu tur atlı hasarı ×1.8." },
  ricat: { name: "Turan Taktiği", icon: "u_archer", text: "Sahte ricat: bir tur geri çekil, düşman safını bozarsa sonraki iki tur ×1.7 vur. Atlı oranın düşükse düşman yemi yutmayabilir." },
  yedek: { name: "Yedekler!", icon: "tug", text: "Tepede bekleyen taze kuvvet meydana iner: bu tur ×1.4 vurur, moral +18. Ön saf erirse kendiliğinden iner. İnmezse yenilgide kayıpsız çekilir." },
};

function mult(att: Unit, def: Unit): number {
  if (UNITS[att].beats === def) return 1.6;
  if (UNITS[def].beats === att) return 0.7;
  return 1;
}

const CHAMP_WEIGHT = 3;
const BOSS_WEIGHT = 5;
const NONE: Army = { spear: 0, archer: 0, horse: 0 };

function hit(from: Army, to: Army, bonus: number, hp: Record<Unit, number>, extra: number, target: { hp: number } | null, weight: number, uMul: Partial<Record<Unit, number>> = {}): { out: Army; toChamp: number } {
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
    deal((v) => from[u] * UNITS[u].atk * (1 + bonus) * (uMul[u] ?? 1) * mult(u, v) * (0.85 + Math.random() * 0.3));
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

export class Sim {
  rounds: Round[];
  used: Order[] = [];
  private a: Army;
  private b: Army;
  private c: Champion | null;
  private boss: Boss | null;
  private hpA = { spear: 0, archer: 0, horse: 0 };
  private hpB = { spear: 0, archer: 0, horse: 0 };
  private aBonus: number;
  private r = 0;
  private maxR: number;
  private over = false;
  private nara = 0;
  private lure = 0;
  private sk: (k: SkillKind) => { name: string; kind: SkillKind; pow: number }[];
  private slay: number;
  private rally: number;
  private luckEv: string[];
  private fm: Partial<Record<Unit, number>>;
  ma = 100;
  mb = 100;
  rout: "a" | "b" | null = null;
  resv: Army = { ...NONE };
  private fresh = 0;

  constructor(private a0: Army, aBonus0: number, private b0: Army, private bBonus = 0, private champ: Champion | null = null, boss0: Boss | null = null, field: Field | null = null, reserve = false) {
    this.fm = fieldMul(field);
    this.a = { ...a0 };
    if (reserve && armySize(a0) >= RESERVE_MIN)
      for (const u of UNIT_KEYS) {
        this.resv[u] = Math.floor(a0[u] * RESERVE_SHARE);
        this.a[u] -= this.resv[u];
      }
    this.b = { ...b0 };
    const c = (this.c = champ ? { ...champ } : null);
    this.boss = boss0 ? { ...boss0 } : null;
    this.sk = (k) => c?.skills.filter((s) => s.kind === k) ?? [];
    const luck = (Math.random() + Math.random() - 1) * 0.6;
    this.aBonus = aBonus0 + this.sk("aura").reduce((t, s) => t + s.pow, 0) + luck;
    if (c) {
      for (const s of this.sk("fury")) c.atk *= 1 + s.pow;
      for (const s of this.sk("evade")) c.dodge = Math.min(0.6, c.dodge + s.pow);
    }
    this.slay = this.sk("slayer").reduce((t, s) => t + s.pow, 0);
    this.rally = this.sk("rally").reduce((t, s) => t + s.pow, 0);
    this.maxR = this.boss ? 16 : 12;
    this.luckEv = luck > 0.25 ? ["Rüzgâr arkanda"] : luck < -0.25 ? ["Talih yüz çevirdi"] : [];
    this.rounds = [{ a: { ...this.a }, b: { ...this.b }, hp: c?.hp ?? 0, bhp: this.boss?.hp ?? 0, ev: [], ma: 100, mb: 100 }];
    if (c?.firstStrike) {
      const ev = ["Gölge Darbesi"];
      const r = hit(NONE, this.b, this.aBonus, this.hpB, this.champHit(ev) * 1.5, this.boss, BOSS_WEIGHT);
      this.b = r.out;
      this.hurtBoss(r.toChamp);
      this.mb -= 8;
      this.rounds.push({ a: { ...this.a }, b: { ...this.b }, hp: c.hp, bhp: this.boss?.hp ?? 0, ev, ma: this.ma, mb: this.mb });
    }
  }

  /** Savaş başlamadan (er meydanı vb.) iki tarafın moralini ayarlar. */
  opening(ma: number, mb: number, ev: string): void {
    this.ma = ma;
    this.mb = mb;
    const r0 = this.rounds[this.rounds.length - 1];
    r0.ma = ma;
    r0.mb = mb;
    r0.ev.push(ev);
  }

  private aAlive(): boolean {
    return armySize(this.a) + armySize(this.resv) > 0 || (!!this.c && this.c.hp > 0);
  }

  private bAlive(): boolean {
    return this.boss ? this.boss.hp > 0 : armySize(this.b) > 0;
  }

  private champHit(ev: string[]): number {
    const c = this.c;
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
  }

  private hurtBoss(dmg: number): void {
    if (this.boss) this.boss.hp = Math.max(0, this.boss.hp - (dmg * 100) / (100 + this.boss.def * 6));
  }

  canOrder(o: Order): boolean {
    if (this.over || this.used.includes(o)) return false;
    if (o === "kanat") return this.a.horse > 0;
    if (o === "ricat") return armySize(this.a) > 0;
    if (o === "yedek") return armySize(this.resv) > 0;
    return true;
  }

  done(): boolean {
    return this.over;
  }

  step(order?: Order): Round | null {
    if (this.over) return null;
    const { c, boss } = this;
    const r = this.r++;
    const ev: string[] = r === 0 ? [...this.luckEv] : [];
    if (order && this.canOrder(order)) this.used.push(order);
    else order = undefined;
    let ordMul = 1;
    let inOrd = 1;
    const uMul: Partial<Record<Unit, number>> = {};
    if (!order && armySize(this.resv) > 0 && (armySize(this.a) < armySize(this.a0) * 0.3 || this.ma < 20)) {
      order = "yedek";
      this.used.push(order);
    }
    if (order === "yedek") {
      for (const u of UNIT_KEYS) this.a[u] += this.resv[u];
      this.resv = { ...NONE };
      this.fresh = 2;
      ev.push("Yedekler meydana indi!");
    }
    if (this.fresh > 0) {
      ordMul *= 1.35;
      this.fresh--;
    }
    if (order === "nara") {
      this.nara = 2;
      ev.push("Nara!");
    }
    if (order === "kanat") {
      uMul.horse = 1.8;
      ev.push("Kanat saldırısı!");
    }
    if (order === "ricat") {
      const share = this.a.horse / Math.max(1, armySize(this.a));
      const ok = Math.random() < (boss ? 0.45 : 0.35 + share * 1.6);
      ordMul = 0;
      inOrd = 0.3;
      if (ok) {
        this.lure = 2;
        ev.push("Turan taktiği: düşman yemi yuttu!");
      } else ev.push("Düşman sahte ricatı sezdi");
    } else if (this.lure > 0) {
      ordMul *= 1.7;
      this.lure--;
      ev.push("Safları bozuldu!");
    }
    if (this.nara > 0) {
      ordMul *= 1.25;
      this.nara--;
    }
    let extra = this.champHit(ev) * (1 + this.aBonus);
    if (c && c.hp > 0) {
      if (r % 3 === 0)
        for (const s of this.sk("burst")) {
          extra += c.atk * s.pow;
          ev.push(s.name);
        }
      for (const s of this.sk("poison")) {
        extra += c.atk * s.pow;
        if (r === 0) ev.push(s.name);
      }
      if (this.slay) {
        extra *= 1 + (boss ? this.slay : this.slay / 2);
        if (r === 0 && boss) for (const s of this.sk("slayer")) ev.push(s.name);
      }
      for (const s of this.sk("drain")) {
        c.hp = Math.min(c.maxHp, c.hp + extra * s.pow * 0.4);
        if (r === 0) ev.push(s.name);
      }
    }
    const shield = this.sk("shield");
    let inMul = (r < 3 ? shield.reduce((m, s) => m * (1 - s.pow), 1) : 1) * inOrd;
    if (r < 3 && shield.length && r === 0) for (const s of shield) ev.push(s.name);
    if (c && c.hp > 0 && r % 4 === 1)
      for (const s of this.sk("stun")) {
        inMul *= 1 - Math.min(0.8, s.pow);
        ev.push(s.name);
      }
    if (this.rally && r === 1) for (const s of this.sk("rally")) ev.push(s.name);
    if (armySize(this.resv) > 0) inMul *= 0.92;
    for (const u of UNIT_KEYS) if (this.fm[u]) uMul[u] = (uMul[u] ?? 1) * this.fm[u]!;
    const bonus = (1 + this.aBonus + this.rally * Math.min(1, r / 4)) * ordMul - 1;
    const prevA = armySize(this.a);
    const prevB = armySize(this.b);
    const atkB = hit(ordMul ? this.a : NONE, this.b, bonus, this.hpB, extra * ordMul, boss, BOSS_WEIGHT, uMul);
    const bossDmg = boss && boss.hp > 0 ? boss.atk * inMul : 0;
    const atkA = hit(this.b, this.a, (1 + this.bBonus) * inMul - 1, this.hpA, bossDmg, c, CHAMP_WEIGHT, this.fm);
    this.hurtBoss(atkB.toChamp);
    if (c) {
      if (c.dodge > 0 && Math.random() < c.dodge) ev.push("Sıyrıldın");
      else c.hp = Math.max(0, c.hp - (atkA.toChamp * 100) / (100 + c.def * 6));
      if (c.heal > 0 && c.hp > 0) {
        c.hp = Math.min(c.maxHp, c.hp + c.maxHp * c.heal);
        ev.push("Ruh şifası");
      }
    }
    this.a = atkA.out;
    this.b = atkB.out;
    if (boss && boss.hp <= 0) ev.push(`${boss.name} düştü!`);
    this.morale(prevA, prevB, order, ev);
    const round: Round = { a: { ...this.a }, b: { ...this.b }, hp: c?.hp ?? 0, bhp: boss?.hp ?? 0, ev, order, ma: this.ma, mb: this.mb };
    this.rounds.push(round);
    if (
      !!this.rout ||
      this.r >= this.maxR ||
      !this.aAlive() ||
      !this.bAlive() ||
      (c && c.hp <= 0) ||
      (!boss && armySize(this.b) < armySize(this.b0) * 0.2) ||
      (!c && armySize(this.a) + armySize(this.resv) < armySize(this.a0) * 0.25)
    )
      this.over = true;
    return round;
  }

  private morale(prevA: number, prevB: number, order: Order | undefined, ev: string[]): void {
    const { c, boss } = this;
    const nA0 = Math.max(1, armySize(this.a0));
    const nB0 = Math.max(1, armySize(this.b0));
    let da = 2 - ((prevA - armySize(this.a)) / nA0) * 128;
    let db = 2 - ((prevB - armySize(this.b)) / nB0) * 128;
    if (order === "nara") da += 14;
    if (order === "yedek") {
      da += 18;
      db -= 5;
    }
    if (order === "kanat") db -= 8;
    if (ev.includes("Turan taktiği: düşman yemi yuttu!")) db -= 16;
    if (ev.includes("Safları bozuldu!")) db -= 6;
    if (c) {
      if (c.hp <= 0) da -= 40;
      else if (c.hp > c.maxHp * 0.5) da += 2;
      else if (c.hp < c.maxHp * 0.3) da -= 4;
    }
    if (boss && boss.hp > 0) db = Math.max(db, 0);
    this.ma = Math.max(0, Math.min(100, this.ma + da));
    this.mb = Math.max(boss && boss.hp > 0 ? 30 : 0, Math.min(100, this.mb + db));
    if (this.mb <= 0 && !boss && armySize(this.b) > 0) {
      this.rout = "b";
      ev.push("Düşman bozguna uğradı!");
    } else if (this.ma <= 0 && armySize(this.a) > 0) {
      this.rout = "a";
      ev.push("Askerlerin dağıldı!");
    }
  }

  finish(): BattleResult {
    while (!this.over) this.step();
    const { c, boss, a0, b0, aBonus, bBonus, resv } = this;
    const alive = this.aAlive();
    this.resv = { ...NONE };
    let a = { ...this.a };
    let b = this.b;
    const heroDown = !!c && c.hp <= 0;
    let win: boolean;
    if (this.rout) win = this.rout === "b" && !heroDown;
    else if (boss) win = boss.hp <= 0 && !heroDown && alive;
    else {
      const full = { ...a };
      for (const u of UNIT_KEYS) full[u] += resv[u];
      const startA = armyPower(a0, aBonus) + champPow(c, this.champ?.hp ?? 0);
      const endA = armyPower(full, aBonus) + champPow(c, c?.hp ?? 0);
      win = !heroDown && endA / Math.max(1, startA) >= armyPower(b, bBonus) / Math.max(1, armyPower(b0, bBonus)) && alive;
    }
    if (win) b = { ...NONE };
    else for (const u of UNIT_KEYS) a[u] = Math.floor(a[u] * 0.6);
    for (const u of UNIT_KEYS) a[u] += resv[u];
    const rounds = [...this.rounds, { a: { ...a }, b: { ...b }, hp: c?.hp ?? 0, bhp: boss?.hp ?? 0, ev: [] }];
    const lostA = { spear: a0.spear - a.spear, archer: a0.archer - a.archer, horse: a0.horse - a.horse };
    const lostB = { spear: b0.spear - b.spear, archer: b0.archer - b.archer, horse: b0.horse - b.horse };
    return { rounds, win, lostA, lostB, heroHp: Math.round(c?.hp ?? 0), heroDown, bossDown: !!boss && boss.hp <= 0, orders: [...this.used], rout: this.rout };
  }
}

export function fight(a0: Army, aBonus0: number, b0: Army, bBonus = 0, champ: Champion | null = null, boss0: Boss | null = null, field: Field | null = null, reserve = false): BattleResult {
  return new Sim(a0, aBonus0, b0, bBonus, champ, boss0, field, reserve).finish();
}

export type Tactic = "hucum" | "duvar" | "pusu";
export const TACTIC_KEYS: Tactic[] = ["hucum", "duvar", "pusu"];
export const TACTICS: Record<Tactic, { name: string; icon: string; unit: Unit; beats: Tactic; text: string; foe: string }> = {
  hucum: { name: "Hücum", icon: "u_cavalry", unit: "horse", beats: "pusu", text: "Atlılar önde, düşmanı ezip geç.", foe: "hücuma kalkacak" },
  duvar: { name: "Kalkan Duvarı", icon: "u_spear", unit: "spear", beats: "hucum", text: "Mızraklılar saf tutar, okçular arkadan vurur.", foe: "kalkan duvarı kuruyor" },
  pusu: { name: "Pusu", icon: "u_archer", unit: "archer", beats: "duvar", text: "Yandan dolaş, ilk oku sen at.", foe: "pusu kuruyor" },
};

export function tacticDelta(t: Tactic, foe: Tactic, a: Army, cev: number): number {
  const n = Math.max(1, armySize(a));
  let d = TACTICS[t].beats === foe ? 0.25 : TACTICS[foe].beats === t ? -0.2 : 0;
  d += (a[TACTICS[t].unit] / n) * 0.15;
  if (t === "pusu") d += Math.min(0.1, cev * 0.008);
  return d;
}

export function stanceWeights(b: Army, boss: Boss | null): Record<Tactic, number> {
  const n = Math.max(1, armySize(b));
  const w = { hucum: b.horse / n + 0.2, duvar: b.spear / n + 0.2 + (boss ? 0.4 : 0), pusu: b.archer / n + 0.2 };
  const t = w.hucum + w.duvar + w.pusu;
  return { hucum: w.hucum / t, duvar: w.duvar / t, pusu: w.pusu / t };
}

export function odds(a: Army, aBonus: number, b: Army, bBonus = 0, champ: Champion | null = null, boss: Boss | null = null, field: Field | null = null): number {
  let w = 0;
  for (let k = 0; k < 40; k++) if (fight(a, aBonus, b, bBonus, champ, boss, field).win) w++;
  return w / 40;
}
