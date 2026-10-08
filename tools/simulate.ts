import { ROUTES, UPGRADES } from "../src/data";
import {
  bulkCost,
  claimableSeals,
  earn,
  routeIncomePerSec,
  step,
  totalIncomePerSec,
  type TripEvent,
} from "../src/economy";
import { newGame, resetForDynasty, type GameState } from "../src/state";
import { CITIES } from "../src/data";
import { BUILD_SECONDS, MAX_CITY_LEVEL, cityCost, cityLevel, cityUnlocked, finishBuild, startBuild } from "../src/cities";
import { AGES, RIVALS, WONDERS, ageCost, canAdvanceAge, canBuildWonder, nextAge, rivalBeaten, rivalWealth, wonderCost, wonderStage } from "../src/empire";

function fmt(n: number): string {
  if (n < 1000) return n.toFixed(0);
  const e = Math.floor(Math.log10(n));
  return (n / 10 ** e).toFixed(2) + "e" + e;
}

function mm(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h${(m % 60).toString().padStart(2, "0")}m` : `${m}m${Math.floor(sec % 60).toString().padStart(2, "0")}s`;
}

function simulate(s: GameState, maxSec: number, label: string, clickEvery = 1.0, eventsPerMin = 0.6): number {
  const dt = 0.1;
  const out: TripEvent[] = [];
  const logged = new Set<string>();
  const log = (k: string, msg: string, sec: number) => {
    if (logged.has(k)) return;
    logged.add(k);
    console.log(`[${label}] ${mm(sec).padStart(7)}  ${msg}`);
  };
  let buildDone = 0;
  let clickTimer = 0;
  let eventTimer = 0;
  for (let sec = 0; sec < maxSec; sec += dt) {
    const now = Date.now();
    clickTimer += dt;
    if (clickTimer >= clickEvery) {
      clickTimer = 0;
      for (let i = 0; i < ROUTES.length; i++) {
        const r = s.routes[i];
        if (r.owned > 0 && !s.masters[i] && !r.running) {
          r.running = true;
          r.progress = 0;
          break;
        }
      }
    }
    eventTimer += dt;
    if (eventTimer >= 60 / eventsPerMin) {
      eventTimer = 0;
      earn(s, Math.max(25, totalIncomePerSec(s, now) * 20));
    }
    out.length = 0;
    step(s, dt, now, out);

    if (!process.env.NOAGE && canAdvanceAge(s)) {
      s.gold -= ageCost(s, nextAge(s)!);
      s.age++;
      log("age" + s.age, `AGE UP -> ${AGES[s.age].id}`, sec);
    }
    if (buildDone > 0 && sec >= buildDone) {
      finishBuild(s);
      buildDone = 0;
    }
    for (const c of CITIES) {
      const lv = cityLevel(s, c.id);
      if (process.env.NOCITY || s.cityBuild || !cityUnlocked(s, c.id) || lv >= MAX_CITY_LEVEL) continue;
      const cost = cityCost(c.id, lv);
      if (cost < s.gold * 0.2 && startBuild(s, c.id, now)) {
        buildDone = sec + BUILD_SECONDS[lv] + 20;
        break;
      }
    }
    for (const w of WONDERS) {
      if (canBuildWonder(s, w) && wonderCost(s, w) < s.gold * 0.3) {
        s.gold -= wonderCost(s, w);
        s.wonders[w.id] = wonderStage(s, w.id) + 1;
        log("w" + w.id + s.wonders[w.id], `wonder ${w.id} stage ${s.wonders[w.id]}`, sec);
      }
    }
    for (const r of RIVALS) {
      if (!process.env.NOAGE && !rivalBeaten(s, r.id) && s.runEarned >= rivalWealth(s, r)) {
        s.rivalsBeaten.push(r.id);
        log("rv" + r.id, `rival beaten: ${r.id}`, sec);
      }
    }
    s.runSeconds += dt;
    for (let guard = 0; guard < 50; guard++) {
      let best: { kind: string; i: number; cost: number; score: number } | null = null;
      for (let i = 0; i < ROUTES.length; i++) {
        if (!s.masters[i] && s.routes[i].owned > 0 && s.gold >= ROUTES[i].masterCost) {
          best = { kind: "master", i, cost: ROUTES[i].masterCost, score: Infinity };
          break;
        }
      }
      if (!best) {
        for (const u of UPGRADES) {
          if (s.upgrades.includes(u.id) || s.gold < u.cost) continue;
          if (u.kind === "route" && s.routes[u.route!].owned === 0) continue;
          best = { kind: "upgrade", i: UPGRADES.indexOf(u), cost: u.cost, score: Infinity };
          break;
        }
      }
      if (!best) {
        for (let i = 0; i < ROUTES.length; i++) {
          if (i > 0 && s.routes[i - 1].owned === 0) break;
          const r = s.routes[i];
          const cost = bulkCost(ROUTES[i], r.owned, 1);
          if (cost > s.gold) continue;
          const before = routeIncomePerSec(s, i, now) || 0.0001;
          r.owned++;
          const after = routeIncomePerSec(s, i, now);
          r.owned--;
          const score = (after - before) / cost;
          if (!best || score > best.score) best = { kind: "route", i, cost, score };
        }
      }
      if (!best) break;
      s.gold -= best.cost;
      if (best.kind === "master") {
        s.masters[best.i] = true;
        log("m" + best.i, `master hired: ${ROUTES[best.i].id}`, sec);
      } else if (best.kind === "upgrade") {
        s.upgrades.push(UPGRADES[best.i].id);
      } else {
        const was = s.routes[best.i].owned;
        s.routes[best.i].owned++;
        if (was === 0) log("r" + best.i, `route opened: ${ROUTES[best.i].id}`, sec);
      }
    }
    for (const n of [1e6, 1e9, 1e12, 1e15]) if (s.runEarned >= n) log("e" + n, `run earned ${fmt(n)}  income ${fmt(totalIncomePerSec(s, now))}/s  seals claimable ${claimableSeals(s)}`, sec);
    if (!process.env.LONG && claimableSeals(s) >= Math.max(10, s.seals)) {
      log("seal", `seals worth resetting: ${claimableSeals(s)} (own ${s.seals})`, sec);
      return sec;
    }
  }
  console.log(`[${label}] end at ${mm(maxSec)} run ${fmt(s.runEarned)} income ${fmt(totalIncomePerSec(s, Date.now()))}/s claimable ${claimableSeals(s)}`);
  return maxSec;
}

const s = newGame();
let total = 0;
for (let run = 1; run <= 4; run++) {
  const t = simulate(s, 6 * 3600, "run" + run);
  total += t;
  console.log(`--- run ${run} took ${mm(t)} (total ${mm(total)}), resetting with +${claimableSeals(s)} seals`);
  resetForDynasty(s, claimableSeals(s));
}
