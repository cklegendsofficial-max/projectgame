import { astar, CITIES, NAV, NH, NW, type World } from "../world/gen";
import type { Camera } from "../render/camera";
import type { WorldView } from "../render/worldView";
import type { Hud } from "../ui/hud";
import { fight, odds, type BattleResult } from "./battle";
import {
  BUILDINGS,
  BUILDING_BY_ID,
  CITY_NAME,
  DAY_SEC,
  RES_KEYS,
  UNITS,
  UNIT_KEYS,
  army,
  armyPower,
  armySize,
  buildCost,
  buildTime,
  heroCap,
  prodPerMin,
  storageCap,
  trainSpeed,
  unitUnlocked,
  xpNeed,
  type Army,
  type BuildingId,
  type Res,
  type Unit,
} from "./data";
import { CAPITAL, banditArmy, campGarrison, loadGame, saveGame, type Bandit, type GameState } from "./state";

export type Target =
  | { kind: "village" | "camp" | "node" | "ruin" | "city" | "bandit"; i: number }
  | { kind: "capital" }
  | { kind: "point"; x: number; y: number };

export interface Quest {
  title: string;
  text: string;
  done: (g: Game) => boolean;
  reward: Partial<Res>;
  goto?: (g: Game) => { x: number; y: number } | null;
}

const HERO_SPEED = 30;
const BANDIT_SPEED = 21;
const MARCH_SPEED = 26;

export class Game {
  s: GameState;
  hud!: Hud;
  target: Target | null = null;
  private repath = 0;
  private fogT = 0;
  private saveT = 0;
  private spawnAt = new Map<number, number>();
  private flags = { moved: false, recruited: false, wonFight: false, marched: false, camp: false, built: false, trained: 0 };
  battleLock = false;

  constructor(public world: World, public view: WorldView, public cam: Camera) {
    this.s = loadGame(world);
    this.reveal(CAPITAL.x, CAPITAL.y, 16);
    this.reveal(this.s.hero.x, this.s.hero.y, 11);
    cam.zoom = 0.75;
    cam.x = this.s.hero.x;
    cam.y = this.s.hero.y;
    window.addEventListener("beforeunload", () => saveGame(this.s));
    document.addEventListener("visibilitychange", () => document.hidden && saveGame(this.s));
  }

  get now(): number {
    return Date.now();
  }

  bld(id: BuildingId): number {
    return this.s.buildings[id].lv;
  }

  heroBonus(): number {
    return 0.06 * (this.s.hero.lv - 1);
  }

  heroCap(): number {
    return heroCap(this.bld("saray"), this.s.hero.lv);
  }

  cap(): number {
    return storageCap(this.bld("depo"));
  }

  upkeepPerMin(): number {
    return (armySize(this.s.hero.army) + armySize(this.s.garrison) + this.s.marches.reduce((a, m) => a + armySize(m.army), 0)) * 0.4;
  }

  ratePerMin(k: keyof Res): number {
    let r = 0;
    for (const b of BUILDINGS) if (b.produces === k) r += prodPerMin(b, this.bld(b.id));
    if (k === "food") r -= this.upkeepPerMin();
    return r;
  }

  canAfford(c: Partial<Res>): boolean {
    return RES_KEYS.every((k) => this.s.res[k] >= (c[k] ?? 0));
  }

  pay(c: Partial<Res>): boolean {
    if (!this.canAfford(c)) return false;
    for (const k of RES_KEYS) this.s.res[k] -= c[k] ?? 0;
    return true;
  }

  gain(c: Partial<Res>): void {
    const cap = this.cap();
    for (const k of RES_KEYS) this.s.res[k] = Math.min(Math.max(cap, this.s.res[k]), this.s.res[k] + (c[k] ?? 0));
  }

  update(dt: number): void {
    const s = this.s;
    const now = this.now;
    s.time += dt;
    this.produce(now);
    this.builds(now);
    this.training(now);
    if (!this.battleLock) {
      this.moveHero(dt);
      this.bandits(dt, now);
      this.marches(dt, now);
    }
    this.fogT += dt;
    if (this.fogT > 0.25) {
      this.fogT = 0;
      this.reveal(s.hero.x, s.hero.y, 11);
      for (const m of s.marches) this.reveal(m.x, m.y, 5);
    }
    this.quests();
    this.saveT += dt;
    if (this.saveT > 8) {
      this.saveT = 0;
      saveGame(s);
    }
  }

  private produce(now: number): void {
    const s = this.s;
    const el = Math.max(0, (now - s.resAt) / 60000);
    if (el <= 0) return;
    s.resAt = now;
    const cap = this.cap();
    for (const k of RES_KEYS) {
      const r = this.ratePerMin(k) * el;
      if (r >= 0) s.res[k] = Math.max(s.res[k], Math.min(cap, s.res[k] + r));
      else s.res[k] = Math.max(0, s.res[k] + r);
    }
    for (const v of s.villages) {
      if (v.rec < 6 + Math.floor(v.rep / 10) && now >= v.recAt) {
        v.rec++;
        v.recAt = now + 40000;
      }
    }
    for (const c of s.camps) {
      if (!c.alive && now >= c.respawnAt) {
        c.alive = true;
        c.garrison = campGarrison(c.tier);
      }
    }
    for (const n of s.nodes) if (n.left < n.max && now >= n.regenAt) n.left = n.max;
  }

  private builds(now: number): void {
    for (const b of BUILDINGS) {
      const st = this.s.buildings[b.id];
      if (st.until && now >= st.until) {
        st.until = 0;
        st.lv++;
        this.flags.built = true;
        this.hud?.toast(`${b.name} seviye ${st.lv} oldu!`, "good");
      }
    }
  }

  building(): BuildingId | null {
    return BUILDINGS.find((b) => this.s.buildings[b.id].until > 0)?.id ?? null;
  }

  upgradeReason(id: BuildingId): string | null {
    const lv = this.bld(id);
    if (this.building()) return "Bir inşaat sürüyor";
    if (id !== "saray" && lv >= this.bld("saray")) return "Önce Sarayı geliştir";
    if (lv >= 20) return "En yüksek seviye";
    if (!this.canAfford(buildCost(BUILDING_BY_ID[id], lv + 1))) return "Kaynak yetersiz";
    return null;
  }

  upgrade(id: BuildingId): void {
    if (this.upgradeReason(id)) return;
    const lv = this.bld(id);
    this.pay(buildCost(BUILDING_BY_ID[id], lv + 1));
    this.s.buildings[id].until = this.now + buildTime(lv + 1) * 1000;
    this.hud.toast(`${BUILDING_BY_ID[id].name} inşaatı başladı`, "info");
  }

  private training(now: number): void {
    const q = this.s.queue;
    while (q.length && now >= q[0].done) {
      const o = q.shift()!;
      this.s.garrison[o.unit] += o.n;
      this.flags.trained += o.n;
      this.hud?.toast(`${o.n} ${UNITS[o.unit].name} eğitimi tamamlandı`, "good");
    }
  }

  trainCost(u: Unit, n: number): Res {
    const c = UNITS[u].cost;
    return { gold: (c.gold ?? 0) * n, food: (c.food ?? 0) * n, wood: (c.wood ?? 0) * n, stone: 0 };
  }

  train(u: Unit, n: number): boolean {
    if (n <= 0 || !unitUnlocked(u, this.bld("kisla")) || this.s.queue.length >= 3 || !this.pay(this.trainCost(u, n))) return false;
    const each = (UNITS[u].time * 1000) / trainSpeed(this.bld("kisla"));
    const start = Math.max(this.now, this.s.queue.at(-1)?.done ?? 0);
    this.s.queue.push({ unit: u, n, done: start + each * n, each });
    return true;
  }

  atCapital(): boolean {
    return Math.hypot(this.s.hero.x - CAPITAL.x, this.s.hero.y - CAPITAL.y) < 170;
  }

  transfer(u: Unit, n: number): void {
    const s = this.s;
    if (!this.atCapital()) return;
    if (n > 0) {
      const room = this.heroCap() - armySize(s.hero.army);
      const k = Math.min(n, s.garrison[u], room);
      s.garrison[u] -= k;
      s.hero.army[u] += k;
    } else {
      const k = Math.min(-n, s.hero.army[u]);
      s.hero.army[u] -= k;
      s.garrison[u] += k;
    }
  }

  reveal(x: number, y: number, r: number): void {
    const cx = Math.floor(x / NAV);
    const cy = Math.floor(y / NAV);
    let changed = false;
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= NW || ny >= NH) continue;
        const i = ny * NW + nx;
        if (!this.s.explored[i]) {
          this.s.explored[i] = 1;
          changed = true;
        }
      }
    if (changed) this.view.fogDirty = true;
  }

  isExplored(x: number, y: number): boolean {
    const nx = Math.floor(x / NAV);
    const ny = Math.floor(y / NAV);
    return nx >= 0 && ny >= 0 && nx < NW && ny < NH && this.s.explored[ny * NW + nx] === 1;
  }

  cellCost(x: number, y: number): number {
    const nx = Math.max(0, Math.min(NW - 1, Math.floor(x / NAV)));
    const ny = Math.max(0, Math.min(NH - 1, Math.floor(y / NAV)));
    return this.world.cost[ny * NW + nx];
  }

  findPath(x0: number, y0: number, x1: number, y1: number): number[] | null {
    const sx = Math.floor(x0 / NAV);
    const sy = Math.floor(y0 / NAV);
    let tx = Math.floor(x1 / NAV);
    let ty = Math.floor(y1 / NAV);
    if (this.world.cost[ty * NW + tx] === Infinity) {
      let best = -1;
      let bd = Infinity;
      for (let dy = -4; dy <= 4; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (nx < 0 || ny < 0 || nx >= NW || ny >= NH) continue;
          const j = ny * NW + nx;
          if (this.world.cost[j] === Infinity || !this.world.reach[j]) continue;
          const d = dx * dx + dy * dy;
          if (d < bd) {
            bd = d;
            best = j;
          }
        }
      if (best < 0) return null;
      tx = best % NW;
      ty = Math.floor(best / NW);
      x1 = tx * NAV + NAV / 2;
      y1 = ty * NAV + NAV / 2;
    }
    const cells = astar(this.world.cost, sx, sy, tx, ty);
    if (!cells) return null;
    const pts: number[] = [];
    for (let k = 2; k < cells.length - 2; k += 2) pts.push(cells[k] * NAV + NAV / 2, cells[k + 1] * NAV + NAV / 2);
    pts.push(x1, y1);
    return pts;
  }

  targetPos(t: Target): { x: number; y: number } | null {
    const s = this.s;
    switch (t.kind) {
      case "point":
        return { x: t.x, y: t.y };
      case "capital":
        return { x: CAPITAL.x + 10, y: CAPITAL.y + 115 };
      case "city":
        return { x: CITIES[t.i].x + 10, y: CITIES[t.i].y + 100 };
      case "village":
        return s.villages[t.i];
      case "camp":
        return s.camps[t.i];
      case "node":
        return s.nodes[t.i];
      case "ruin":
        return s.ruins[t.i];
      case "bandit":
        return s.bandits.find((b) => b.id === t.i) ?? null;
    }
  }

  goTo(t: Target): void {
    const p = this.targetPos(t);
    if (!p) return;
    const path = this.findPath(this.s.hero.x, this.s.hero.y, p.x, p.y);
    if (!path) {
      this.hud.toast("Oraya yol yok", "bad");
      return;
    }
    this.target = t;
    this.s.hero.path = path;
    this.s.hero.pathI = 0;
    this.flags.moved = true;
    this.view.marker(p.x, p.y);
  }

  tap(x: number, y: number): void {
    if (this.battleLock || this.hud.panelOpen()) return;
    const hit = this.pick(x, y);
    if (hit) {
      const p = this.targetPos(hit)!;
      if (hit.kind !== "bandit" && Math.hypot(p.x - this.s.hero.x, p.y - this.s.hero.y) < 60) {
        this.s.hero.path = null;
        this.target = null;
        this.hud.openPlace(hit);
        return;
      }
      this.goTo(hit);
      return;
    }
    if (this.cellCost(x, y) === Infinity) {
      this.hud.toast("Buradan geçilmez", "bad");
      return;
    }
    this.goTo({ kind: "point", x, y });
  }

  pick(x: number, y: number): Target | null {
    const s = this.s;
    const r = 34 / Math.min(1, this.cam.zoom);
    let best: Target | null = null;
    let bd = r;
    const test = (t: Target, px: number, py: number, rr = 1) => {
      const d = Math.hypot(px - x, py - y) / rr;
      if (d < bd && this.isExplored(px, py)) {
        bd = d;
        best = t;
      }
    };
    for (const b of s.bandits) test({ kind: "bandit", i: b.id }, b.x, b.y, 1.3);
    if (Math.hypot(CAPITAL.x - x, CAPITAL.y - y) < r * 2.2) return { kind: "capital" };
    CITIES.forEach((c, i) => c.id !== "samarkand" && test({ kind: "city", i }, c.x, c.y, 2));
    s.villages.forEach((v, i) => test({ kind: "village", i }, v.x, v.y, 1.3));
    s.camps.forEach((c, i) => c.alive && test({ kind: "camp", i }, c.x, c.y, 1.3));
    s.nodes.forEach((n, i) => test({ kind: "node", i }, n.x, n.y));
    s.ruins.forEach((n, i) => !n.looted && test({ kind: "ruin", i }, n.x, n.y));
    return best;
  }

  heroSpeed(): number {
    const n = armySize(this.s.hero.army);
    return HERO_SPEED * (1 - Math.min(0.35, n / 500));
  }

  private moveHero(dt: number): void {
    const h = this.s.hero;
    const t = this.target;
    if (t?.kind === "bandit") {
      this.repath -= dt;
      const b = this.s.bandits.find((x) => x.id === t.i);
      if (!b) {
        this.target = null;
        h.path = null;
      } else if (Math.hypot(b.x - h.x, b.y - h.y) < 30) {
        h.path = null;
        this.target = null;
        this.engageBandit(b, false);
        return;
      } else if (this.repath <= 0) {
        this.repath = 0.8;
        const p = this.findPath(h.x, h.y, b.x, b.y);
        if (p) {
          h.path = p;
          h.pathI = 0;
        }
      }
    }
    if (!h.path) return;
    let move = (this.heroSpeed() * dt) / Math.max(0.55, this.cellCost(h.x, h.y) === Infinity ? 1 : this.cellCost(h.x, h.y));
    while (move > 0 && h.path && h.pathI < h.path.length) {
      const tx = h.path[h.pathI];
      const ty = h.path[h.pathI + 1];
      const d = Math.hypot(tx - h.x, ty - h.y);
      if (d <= move) {
        h.x = tx;
        h.y = ty;
        move -= d;
        h.pathI += 2;
      } else {
        h.x += ((tx - h.x) / d) * move;
        h.y += ((ty - h.y) / d) * move;
        move = 0;
      }
    }
    if (h.path && h.pathI >= h.path.length) {
      h.path = null;
      const tg = this.target;
      this.target = null;
      if (tg && tg.kind !== "point" && tg.kind !== "bandit") this.hud.openPlace(tg);
    }
  }

  private bandits(dt: number, now: number): void {
    const s = this.s;
    const h = s.hero;
    const heroPow = armyPower(h.army, this.heroBonus());
    s.camps.forEach((c, i) => {
      if (!c.alive) return;
      const mine = s.bandits.filter((b) => b.camp === i).length;
      const max = 1 + Math.floor(c.tier / 2);
      const at = this.spawnAt.get(i) ?? 0;
      if (mine < max && now >= at) {
        this.spawnAt.set(i, now + 90000 + Math.random() * 60000);
        s.bandits.push({ id: s.nextId++, camp: i, x: c.x + (Math.random() - 0.5) * 40, y: c.y + (Math.random() - 0.5) * 40, army: banditArmy(c.tier), tx: c.x, ty: c.y, wait: 1, chase: false });
      }
    });
    for (const b of s.bandits) {
      const c = s.camps[b.camp];
      const dh = Math.hypot(h.x - b.x, h.y - b.y);
      const pow = armyPower(b.army);
      b.chase = dh < 230 && pow > heroPow * 0.75 && Math.hypot(h.x - c.x, h.y - c.y) < 700 && !this.atCapital();
      const flee = dh < 200 && pow < heroPow * 0.45;
      let tx = b.tx;
      let ty = b.ty;
      if (b.chase) {
        tx = h.x;
        ty = h.y;
      } else if (flee) {
        tx = b.x + (b.x - h.x);
        ty = b.y + (b.y - h.y);
      } else {
        b.wait -= dt;
        if (b.wait <= 0 && Math.hypot(b.tx - b.x, b.ty - b.y) < 8) {
          for (let k = 0; k < 8; k++) {
            const a = Math.random() * Math.PI * 2;
            const r = 60 + Math.random() * 260;
            const x = c.x + Math.cos(a) * r;
            const y = c.y + Math.sin(a) * r;
            if (this.cellCost(x, y) < 2.5) {
              b.tx = x;
              b.ty = y;
              break;
            }
          }
          b.wait = 2 + Math.random() * 5;
        }
      }
      const d = Math.hypot(tx - b.x, ty - b.y);
      if (d > 1) {
        const sp = (BANDIT_SPEED * (b.chase ? 1.15 : 1) * dt) / Math.max(0.6, Math.min(3, this.cellCost(b.x, b.y)));
        const nx = b.x + ((tx - b.x) / d) * Math.min(sp, d);
        const ny = b.y + ((ty - b.y) / d) * Math.min(sp, d);
        if (this.cellCost(nx, ny) !== Infinity) {
          b.x = nx;
          b.y = ny;
        } else {
          b.tx = b.x;
          b.ty = b.y;
        }
      }
      if (b.chase && dh < 24 && !this.battleLock) {
        this.engageBandit(b, true);
        return;
      }
    }
  }

  private engageBandit(b: Bandit, ambush: boolean): void {
    const c = this.s.camps[b.camp];
    this.battle(ambush ? `${c.name} pusu kurdu!` : `${c.name} çetesi`, b.army, 0, (win) => {
      this.s.bandits = this.s.bandits.filter((x) => x.id !== b.id);
      if (win) {
        const gold = Math.round(armyPower(b.army) * 1.4 + 20);
        this.gain({ gold, food: Math.round(gold * 0.6) });
        this.s.hero.trophies += 1;
        this.flags.wonFight = true;
        return `+${gold} altın, +${Math.round(gold * 0.6)} yiyecek, 1 ganimet`;
      }
      return "";
    });
  }

  battle(title: string, enemy: Army, enemyBonus: number, after: (win: boolean) => string): void {
    const h = this.s.hero;
    if (armySize(h.army) === 0) {
      this.hud.toast("Birliğinde asker yok! Başkentten ya da köylerden asker al.", "bad");
      return;
    }
    const res: BattleResult = fight(h.army, this.heroBonus(), enemy, enemyBonus);
    this.battleLock = true;
    h.path = null;
    this.target = null;
    const before = { ...h.army };
    h.army = { ...res.rounds[res.rounds.length - 1].a };
    const xp = Math.round(armyPower(enemy) * (res.win ? 0.6 : 0.15));
    const lvUp = this.addXp(xp);
    this.s.kills += armySize(res.lostB);
    const extra = after(res.win);
    if (!res.win) {
      h.x = CAPITAL.x + 10;
      h.y = CAPITAL.y + 115;
      this.cam.flyTo(h.x, h.y);
    }
    this.hud.showBattle(title, before, enemy, res, xp, lvUp, extra, () => {
      this.battleLock = false;
      saveGame(this.s);
    });
  }

  addXp(xp: number): boolean {
    const h = this.s.hero;
    h.xp += xp;
    let up = false;
    while (h.xp >= xpNeed(h.lv)) {
      h.xp -= xpNeed(h.lv);
      h.lv++;
      up = true;
    }
    return up;
  }

  odds(enemy: Army, bonus = 0): number {
    return odds(this.s.hero.army, this.heroBonus(), enemy) * (bonus ? 0.9 : 1);
  }

  attackCamp(i: number): void {
    const c = this.s.camps[i];
    if (!c.alive) return;
    this.battle(`${c.name} kampı`, c.garrison, 0.1, (win) => {
      if (!win) return "";
      c.alive = false;
      c.respawnAt = this.now + 15 * 60000;
      this.s.bandits = this.s.bandits.filter((b) => b.camp !== i);
      const loot = { gold: 120 * c.tier * c.tier, food: 200 * c.tier, wood: 150 * c.tier, stone: 80 * c.tier };
      this.gain(loot);
      this.s.hero.trophies += c.tier * 2;
      this.flags.camp = true;
      return `Kamp yerle bir edildi! +${loot.gold} altın, +${loot.food} yiyecek, +${loot.wood} kereste, +${loot.stone} taş, ${c.tier * 2} ganimet`;
    });
  }

  recruit(i: number, n: number): void {
    const v = this.s.villages[i];
    const room = this.heroCap() - armySize(this.s.hero.army);
    const k = Math.min(n, v.rec, room);
    if (k <= 0) return;
    if (!this.pay({ gold: k * 6 })) {
      this.hud.toast("Altın yetersiz", "bad");
      return;
    }
    v.rec -= k;
    v.rep = Math.min(100, v.rep + k);
    if (v.recAt < this.now) v.recAt = this.now + 40000;
    this.s.hero.army.spear += k;
    this.flags.recruited = true;
    this.hud.toast(`${k} gönüllü birliğine katıldı`, "good");
  }

  hireCost(u: Unit): number {
    return u === "horse" ? 45 : u === "archer" ? 18 : 10;
  }

  hire(u: Unit, n: number): void {
    const room = this.heroCap() - armySize(this.s.hero.army);
    const k = Math.min(n, room);
    if (k <= 0) return;
    if (!this.pay({ gold: this.hireCost(u) * k })) {
      this.hud.toast("Altın yetersiz", "bad");
      return;
    }
    this.s.hero.army[u] += k;
    this.hud.toast(`${k} paralı ${UNITS[u].name} tutuldu`, "good");
  }

  sellTrophies(): number {
    const n = this.s.hero.trophies;
    const g = n * 45;
    this.s.hero.trophies = 0;
    this.gain({ gold: g });
    return g;
  }

  lootRuin(i: number): string {
    const r = this.s.ruins[i];
    if (r.looted) return "";
    r.looted = true;
    const gold = 150 + Math.round(Math.random() * 250);
    const xp = 40;
    this.gain({ gold, stone: 120 });
    const up = this.addXp(xp);
    return `Harabelerde eski bir hazine buldun: +${gold} altın, +120 taş, +${xp} TP${up ? " — Seviye atladın!" : ""}`;
  }

  marchLoad(a: Army): number {
    return UNIT_KEYS.reduce((t, u) => t + a[u] * UNITS[u].load, 0);
  }

  sendMarch(node: number, a: Army): boolean {
    const s = this.s;
    if (armySize(a) <= 0 || s.marches.length >= this.marchSlots()) return false;
    for (const u of UNIT_KEYS) if (s.garrison[u] < a[u]) return false;
    const n = s.nodes[node];
    const path = this.findPath(CAPITAL.x, CAPITAL.y, n.x, n.y);
    if (!path) return false;
    for (const u of UNIT_KEYS) s.garrison[u] -= a[u];
    s.marches.push({ id: s.nextId++, node, army: { ...a }, phase: "go", path, pathI: 0, x: CAPITAL.x, y: CAPITAL.y, until: 0, load: 0 });
    this.flags.marched = true;
    return true;
  }

  marchSlots(): number {
    return 1 + Math.floor(this.bld("saray") / 3);
  }

  private marches(dt: number, now: number): void {
    const s = this.s;
    for (const m of [...s.marches]) {
      const n = s.nodes[m.node];
      if (m.phase === "gather") {
        if (now >= m.until) {
          m.phase = "back";
          m.path = this.findPath(m.x, m.y, CAPITAL.x, CAPITAL.y) ?? [CAPITAL.x, CAPITAL.y];
          m.pathI = 0;
        }
        continue;
      }
      let move = (MARCH_SPEED * dt) / Math.max(0.55, Math.min(3, this.cellCost(m.x, m.y)));
      while (move > 0 && m.pathI < m.path.length) {
        const tx = m.path[m.pathI];
        const ty = m.path[m.pathI + 1];
        const d = Math.hypot(tx - m.x, ty - m.y);
        if (d <= move) {
          m.x = tx;
          m.y = ty;
          move -= d;
          m.pathI += 2;
        } else {
          m.x += ((tx - m.x) / d) * move;
          m.y += ((ty - m.y) / d) * move;
          move = 0;
        }
      }
      if (m.pathI < m.path.length) continue;
      if (m.phase === "go") {
        const take = Math.min(n.left, this.marchLoad(m.army));
        const rate = 1.5 + armySize(m.army) * 0.12;
        m.load = take;
        n.left -= take;
        if (n.left < n.max) n.regenAt = now + 10 * 60000;
        m.phase = "gather";
        m.until = now + (take / rate) * 1000;
      } else {
        for (const u of UNIT_KEYS) s.garrison[u] += m.army[u];
        this.gain({ [n.kind]: m.load });
        this.hud.toast(`Toplama seferi döndü: +${Math.round(m.load)} ${({ food: "yiyecek", wood: "kereste", stone: "taş", gold: "altın" } as const)[n.kind]}`, "good");
        s.marches = s.marches.filter((x) => x !== m);
      }
    }
  }

  dayOf(): { day: number; t: number } {
    const t = this.s.time / DAY_SEC;
    return { day: Math.floor(t) + 1, t: t % 1 };
  }

  readonly QUESTS: Quest[] = [
    { title: "İlk adım", text: "Haritada bir yere dokunarak birliğini yürüt.", done: (g) => g.flags.moved, reward: { gold: 50 } },
    { title: "Gönüllüler", text: "Yakındaki bir köye git ve gönüllü topla.", done: (g) => g.flags.recruited, reward: { gold: 100, food: 100 }, goto: (g) => g.nearest(g.s.villages) },
    { title: "Yolları temizle", text: "Gezen bir harami çetesini yen.", done: (g) => g.flags.wonFight, reward: { gold: 150, wood: 150 }, goto: (g) => g.nearest(g.s.bandits.filter((b) => g.isExplored(b.x, b.y))) },
    { title: "Başkenti büyüt", text: "Başkentte (Semerkant) bir binayı geliştir.", done: (g) => g.flags.built, reward: { wood: 200, stone: 200 }, goto: () => ({ x: CAPITAL.x, y: CAPITAL.y }) },
    { title: "Ordu kur", text: "Kışlada 10 asker eğit.", done: (g) => g.flags.trained >= 10, reward: { food: 300, gold: 100 }, goto: () => ({ x: CAPITAL.x, y: CAPITAL.y }) },
    { title: "Kaynak seferi", text: "Başkentten bir kaynak noktasına toplama seferi gönder.", done: (g) => g.flags.marched, reward: { food: 300, wood: 300 }, goto: (g) => g.nearest(g.s.nodes) },
    { title: "Kampı yok et", text: "Bir harami kampına saldır ve yerle bir et.", done: (g) => g.flags.camp, reward: { gold: 400, stone: 300 }, goto: (g) => g.nearest(g.s.camps.filter((c) => c.alive)) },
    { title: "Buhara yolu", text: "Batıya git ve Buhara şehrine ulaş.", done: (g) => Math.hypot(g.s.hero.x - CITIES[6].x, g.s.hero.y - CITIES[6].y) < 120, reward: { gold: 500 }, goto: () => CITIES[6] },
  ];

  nearest<T extends { x: number; y: number }>(list: T[]): T | null {
    const h = this.s.hero;
    let best: T | null = null;
    let bd = Infinity;
    for (const p of list) {
      const d = Math.hypot(p.x - h.x, p.y - h.y);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    return best;
  }

  quest(): Quest | null {
    return this.QUESTS[this.s.quest] ?? null;
  }

  private quests(): void {
    const q = this.quest();
    if (q && q.done(this)) {
      this.gain(q.reward);
      this.s.quest++;
      this.hud.questDone(q);
      saveGame(this.s);
    }
  }

  cityName(i: number): string {
    return CITY_NAME[CITIES[i].id];
  }

  fresh(): Army {
    return army();
  }
}
