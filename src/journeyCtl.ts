import { sfx } from "./audio";
import { ROUTES } from "./data";
import { earn } from "./economy";
import { fmt, fmtTime } from "./format";
import { tk } from "./i18n";
import {
  CITY_IDS,
  GOOD_VALUE,
  PROV_AD,
  PROV_MAX,
  STEP_MS,
  UPS,
  UP_ICON,
  UP_MAX,
  addXp,
  buildPath,
  buyPrice,
  capacity,
  cargoValue,
  decaySat,
  edgeIsShort,
  epochOf,
  fightOdds,
  fleeOdds,
  goodUnlocked,
  goodsHere,
  hasShortcut,
  knownCities,
  load,
  loseCargo,
  priceFresh,
  provLeft,
  provTick,
  rollEvent,
  sellPrice,
  shortcutAt,
  stepDanger,
  totalSteps,
  unitFor,
  upCost,
  xpNeed,
  type RoadEvent,
  type UpKind,
} from "./journey";
import type { MapView } from "./map";
import { happytime } from "./sdk";
import type { GameState } from "./state";
import { goodsIcon, goodsName, icon, modalOpen, showModal, type ModalButton, type Toasts } from "./ui";

export interface JourneyHost {
  s: GameState;
  toasts: Toasts;
  map: MapView;
  income(): number;
  save(): void;
  dirty(): void;
  canAd(): boolean;
  runAd(): Promise<boolean>;
}

const cityName = (c: number) => tk("city_" + CITY_IDS[c]);

export class JourneyController {
  private mood = 0;
  private session = 0;
  private inMarket = false;

  constructor(private h: JourneyHost) {}

  private get j() {
    return this.h.s.journey;
  }

  tick(dt: number, now: number): void {
    const j = this.j;
    provTick(j, now);
    decaySat(j, now);
    const t = j.trip;
    if (!t || modalOpen() || document.hidden) return;
    t.prog += (dt * 1000) / STEP_MS;
    if (t.prog < 1) return;
    t.prog = 0;
    t.step++;
    const short = edgeIsShort(t, t.edge);
    if (t.step >= t.steps[t.edge]) {
      t.step = 0;
      t.edge++;
      const c = t.path[t.edge];
      j.seen[c] = epochOf(now);
      if (t.edge >= t.steps.length) {
        this.arrive();
        return;
      }
      this.h.toasts.show(`${icon("j_caravan")} ${tk("j_passed", { city: cityName(c) })}`, "info", 2200);
    }
    if (Math.random() < stepDanger(j, short)) {
      let ev = rollEvent(short);
      if (ev === "peddler" && load(j) >= capacity(j)) ev = short ? "lost" : "traveler";
      this.roadEvent(ev, short);
    }
    this.h.dirty();
  }

  private ensureUnit(): void {
    const j = this.j;
    if (load(j) === 0) j.unit = unitFor(this.h.income());
  }

  private gold(v: number): number {
    return v * this.j.unit;
  }

  private provLine(now: number): string {
    const j = this.j;
    const dots = Array.from({ length: PROV_MAX }, (_, i) => `<i class="${i < j.prov ? "on" : ""}"></i>`).join("");
    const left = provLeft(j, now);
    return `<span class="jProv">${tk("j_prov")} <span class="dots">${dots}</span>${left > 0 ? ` <small>+1 ${fmtTime(left / 1000)}</small>` : ""}</span>`;
  }

  private head(now: number): string {
    const j = this.j;
    const need = xpNeed(j.lv);
    return `<div class="jHead">${icon("j_caravan", "ico big")}<div class="jInfo"><b>${cityName(j.city)}</b><small>${tk("j_level", { n: j.lv })} · <span class="jXp"><span style="width:${Math.round((100 * j.xp) / need)}%"></span></span></small><div class="jStats"><span>${icon("j_camels", "ico xs")} ${load(j)}/${capacity(j)}</span>${this.provLine(now)}</div></div></div>`;
  }

  open(): void {
    const j = this.j;
    if (j.trip) return this.openStatus();
    this.openMarket();
  }

  openMarket(): void {
    const s = this.h.s;
    const j = this.j;
    const now = Date.now();
    this.ensureUnit();
    j.seen[j.city] = epochOf(now);
    this.inMarket = true;
    const cap = capacity(j);
    const free = cap - load(j);
    const buy = goodsHere(s, j.city)
      .map((g) => {
        const p = this.gold(buyPrice(j, j.city, g, now));
        const ok = free > 0 && s.gold >= p;
        return `<div class="jRow">${goodsIcon(g, "ico")}<div class="am"><b>${goodsName(g)}</b><small>${tk("j_have", { n: j.cargo[g] })}</small></div><button class="mini${ok ? " ready" : ""}" data-buy="${g}" ${ok ? "" : "disabled"}>+1 · ${fmt(p)}</button><button class="mini${ok ? "" : ""}" data-fill="${g}" ${ok ? "" : "disabled"}>${tk("j_fill")}</button></div>`;
      })
      .join("");
    const carried = ROUTES.map((_, g) => g).filter((g) => j.cargo[g] > 0);
    const sell = carried
      .map((g) => {
        const p = this.gold(sellPrice(j, j.city, g, now));
        const avg = j.cost[g] / j.cargo[g];
        const cls = p > avg * 1.02 ? "up" : p < avg * 0.98 ? "down" : "";
        return `<div class="jRow">${goodsIcon(g, "ico")}<div class="am"><b>${goodsName(g)} ×${j.cargo[g]}</b><small>${tk("j_paid", { p: fmt(avg) })}</small></div><span class="jPrice ${cls}">${fmt(p)}</span><button class="mini" data-sell="${g}">${tk("j_sellAll")}</button></div>`;
      })
      .join("");
    const empty = goodsHere(s, j.city).length === 0 ? `<p class="muted small">${tk("j_nothingHere")}</p>` : "";
    const body =
      this.head(now) +
      `<h4 class="sect">${tk("j_market", { city: cityName(j.city) })}</h4>${empty}<div class="jList">${buy}</div>` +
      (sell ? `<h4 class="sect">${tk("j_cargo")}</h4><div class="jList">${sell}</div>` : "") +
      `<p class="jTip">${tk("j_tip")}</p>`;
    const buttons: ModalButton[] = [
      { label: tk("j_upgrades"), cls: "secondary", keepOpen: true, onClick: () => this.openUpgrades() },
      { label: tk("j_depart"), cls: "primary", keepOpen: true, onClick: () => this.openDestinations() },
    ];
    showModal(tk("j_title"), body, buttons, { dismissable: true });
    this.bind((b) => {
      if (b.dataset.buy) this.buy(Number(b.dataset.buy), 1);
      else if (b.dataset.fill) this.buy(Number(b.dataset.fill), capacity(this.j));
      else if (b.dataset.sell) this.sell(Number(b.dataset.sell), false);
    });
  }

  private bind(fn: (b: HTMLElement) => void): void {
    document.querySelector<HTMLElement>("#modal .mbody")?.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("button");
      if (b && !b.hasAttribute("disabled")) fn(b);
    });
  }

  private buy(g: number, n: number): void {
    const s = this.h.s;
    const j = this.j;
    const now = Date.now();
    let bought = 0;
    while (bought < n && load(j) < capacity(j)) {
      const p = this.gold(buyPrice(j, j.city, g, now));
      if (s.gold < p) break;
      s.gold -= p;
      j.cargo[g]++;
      j.cost[g] += p;
      j.sat[j.city][g] -= 1;
      bought++;
    }
    if (bought === 0) sfx.error();
    else sfx.buy();
    this.h.dirty();
    this.openMarket();
  }

  private sell(g: number, arrival: boolean): number {
    const s = this.h.s;
    const j = this.j;
    const now = Date.now();
    let got = 0;
    const n = j.cargo[g];
    for (let k = 0; k < n; k++) {
      got += this.gold(sellPrice(j, j.city, g, now)) * (arrival ? 1 + this.mood : 1);
      j.sat[j.city][g] += 1;
    }
    const profit = got - j.cost[g];
    j.cargo[g] = 0;
    j.cost[g] = 0;
    earn(s, got);
    j.profit += profit;
    this.session += profit;
    if (n > 0) {
      sfx.coin();
      this.h.toasts.show(`${goodsIcon(g)} +${fmt(got)} <small>(${profit >= 0 ? "+" : ""}${fmt(profit)})</small>`, profit >= 0 ? "gold" : "bad", 2400);
    }
    this.h.dirty();
    this.h.save();
    if (!arrival) this.openMarket();
    return got;
  }

  openDestinations(): void {
    const s = this.h.s;
    const j = this.j;
    const now = Date.now();
    this.inMarket = false;
    const paid = j.cost.reduce((a, b) => a + b, 0);
    const rows = knownCities(s)
      .filter((c) => c !== j.city)
      .map((c) => {
        const safe = buildPath(j.city, c, false);
        const fresh = priceFresh(j, c, now);
        const est = this.gold(cargoValue(j, c, now));
        const diff = est - paid;
        const estTxt = load(j) > 0 ? `<span class="jPrice ${diff >= 0 ? "up" : "down"}">${fresh ? "" : "~"}${diff >= 0 ? "+" : ""}${fmt(diff)}</span>` : "";
        const fr = load(j) > 0 ? `<small class="${fresh ? "fresh" : "stale"}">${tk(fresh ? "j_fresh" : "j_stale")}</small>` : "";
        const ok = j.prov > 0;
        let btns = `<button class="mini${ok ? " ready" : ""}" data-go="${c}" data-risky="0" ${ok ? "" : "disabled"}>${tk("j_safe", { n: totalSteps(safe.steps) })}</button>`;
        if (hasShortcut(j.city, c)) {
          const r = buildPath(j.city, c, true);
          const via = r.path.map((x, i) => (i > 0 ? shortcutAt(r.path[i - 1], x) : null)).find((x) => x);
          btns += `<button class="mini risky" data-go="${c}" data-risky="1" ${ok ? "" : "disabled"} title="${tk("sc_" + via)}">⚠ ${tk("j_short", { n: totalSteps(r.steps) })}</button>`;
        }
        return `<div class="jRow dest"><div class="am"><b>${cityName(c)}</b>${fr}</div>${estTxt}<div class="jBtns">${btns}</div></div>`;
      })
      .join("");
    const adBtn = j.prov <= 0 && this.h.canAd() ? `<button class="mini ready" data-ad="1">▶ ${tk("j_adProv", { n: PROV_AD })}</button>` : "";
    const body =
      this.head(now) +
      (load(j) === 0 ? `<p class="jWarn">${tk("j_emptyWarn")}</p>` : "") +
      `<h4 class="sect">${tk("j_where")}</h4><div class="jList">${rows}</div>` +
      (j.prov <= 0 ? `<p class="jWarn">${tk("j_noProv")} ${adBtn}</p>` : "") +
      `<p class="jTip">${tk("j_routeTip")}</p>`;
    showModal(tk("j_title"), body, [{ label: tk("j_back"), cls: "secondary", keepOpen: true, onClick: () => this.openMarket() }], { dismissable: true });
    this.bind((b) => {
      if (b.dataset.go) this.depart(Number(b.dataset.go), b.dataset.risky === "1");
      else if (b.dataset.ad) void this.adProv();
    });
  }

  private async adProv(): Promise<void> {
    const ok = await this.h.runAd();
    if (ok) {
      this.j.prov = Math.min(PROV_MAX, this.j.prov + PROV_AD);
      sfx.fanfare();
      this.h.save();
    }
    this.openDestinations();
  }

  private depart(c: number, risky: boolean): void {
    const j = this.j;
    if (j.prov <= 0 || j.trip) return sfx.error();
    const { path, steps } = buildPath(j.city, c, risky);
    if (j.prov >= PROV_MAX) j.provAt = Date.now();
    j.prov--;
    j.trip = { path, steps, edge: 0, step: 0, prog: 0, risky, mood: 0, loot: 0, lost: 0, events: 0, fights: 0 };
    this.mood = 0;
    this.session = 0;
    document.getElementById("modal")?.classList.add("hidden");
    const m = document.getElementById("modal");
    if (m) m.innerHTML = "";
    this.h.map.flyToCities(path.map((x) => CITY_IDS[x]));
    sfx.send();
    this.h.toasts.show(`${icon("j_caravan")} ${tk("j_departed", { city: cityName(c) })}`, "good", 2600);
    this.h.dirty();
    this.h.save();
  }

  openStatus(): void {
    const j = this.j;
    const t = j.trip;
    if (!t) return;
    const now = Date.now();
    const dest = t.path[t.path.length - 1];
    const done = (totalSteps(t.steps.slice(0, t.edge)) + t.step + t.prog) / totalSteps(t.steps);
    const body =
      this.head(now) +
      `<p class="ageQuote">${tk("j_onRoad", { city: cityName(dest) })}</p><div class="jBar"><span style="width:${Math.round(done * 100)}%"></span></div>` +
      `<p class="muted small">${tk("j_tripStats", { e: t.events, l: t.lost, g: fmt(t.loot) })}</p>`;
    showModal(tk("j_title"), body, [{ label: tk("j_continue"), cls: "primary" }], { dismissable: true });
  }

  private result(title: string, text: string, ic: string, good: boolean): void {
    if (good) sfx.fanfare();
    else sfx.error();
    showModal(title, `<div class="jEvArt">${icon(ic, "ico big")}</div><p class="jResult ${good ? "good" : "bad"}">${text}</p>`, [{ label: tk("j_continue"), cls: "primary" }], {});
    this.h.dirty();
    this.h.save();
  }

  private roadEvent(ev: RoadEvent, short: boolean): void {
    const s = this.h.s;
    const j = this.j;
    const t = j.trip!;
    t.events++;
    const city = t.path[t.edge + 1];
    const value = cargoValue(j, city, Date.now());
    const opts: { label: string; cls?: string; run: () => void }[] = [];
    let text = tk("ev_j_" + ev + "_t");
    const ic = "j_" + ev;
    sfx.event();
    const lose = (frac: number) => {
      const n = loseCargo(j, frac);
      t.lost += n;
      return n;
    };
    switch (ev) {
      case "bandit": {
        const odds = fightOdds(s, city, short);
        const flee = fleeOdds(j);
        const toll = this.gold(Math.max(8, value * 0.15));
        opts.push({
          label: tk("j_fight", { p: Math.round(odds * 100) }),
          cls: "primary",
          run: () => {
            t.fights++;
            if (Math.random() < odds) {
              const loot = this.gold(4 + load(j) * 0.5) * (short ? 1.4 : 1);
              const mats = 3 + Math.floor(city / 2);
              earn(s, loot);
              t.loot += loot;
              s.mats.iron += mats;
              s.mats.leather += mats;
              addXp(j, 6);
              this.result(tk("j_won"), tk("j_wonT", { g: fmt(loot), m: mats }), "swords", true);
            } else {
              const n = lose(0.35);
              t.mood -= 0.05;
              this.result(tk("j_lost"), tk("j_lostT", { n }), "j_bandit", false);
            }
          },
        });
        opts.push({
          label: tk("j_toll", { g: fmt(toll) }),
          run: () => {
            if (s.gold >= toll) {
              s.gold -= toll;
              this.result(tk("j_paidT"), tk("j_paidD", { g: fmt(toll) }), "coins", true);
            } else {
              const n = lose(0.25);
              this.result(tk("j_lost"), tk("j_lostT", { n }), "j_bandit", false);
            }
          },
        });
        opts.push({
          label: tk("j_flee", { p: Math.round(flee * 100) }),
          run: () => {
            if (Math.random() < flee) this.result(tk("j_fled"), tk("j_fledT"), "j_camels", true);
            else {
              const n = lose(0.2);
              this.result(tk("j_lost"), tk("j_lostT", { n }), "j_bandit", false);
            }
          },
        });
        break;
      }
      case "storm":
        opts.push({
          label: tk("j_shelter"),
          run: () => {
            t.steps[t.edge] += 1;
            this.result(tk("j_safeT"), tk("j_shelterT"), "j_oasis", true);
          },
        });
        opts.push({
          label: tk("j_push"),
          cls: "primary",
          run: () => {
            if (Math.random() < 0.5) {
              t.step = Math.min(t.steps[t.edge] - 1, t.step + 1);
              this.result(tk("j_safeT"), tk("j_pushOk"), "j_storm", true);
            } else {
              const n = lose(0.15);
              this.result(tk("j_lost"), tk("j_stormLost", { n }), "j_storm", false);
            }
          },
        });
        break;
      case "oasis":
        opts.push({
          label: tk("j_rest"),
          cls: "primary",
          run: () => {
            t.mood += 0.08;
            this.result(tk("j_safeT"), tk("j_restT", { p: 8 }), "j_oasis", true);
          },
        });
        opts.push({
          label: tk("j_barter"),
          run: () => {
            const have = ROUTES.map((_, g) => g).filter((g) => j.cargo[g] >= 2);
            const better = ROUTES.map((_, g) => g).filter((g) => goodUnlocked(s, g));
            if (have.length === 0) {
              const g = this.gold(10);
              earn(s, g);
              return this.result(tk("j_safeT"), tk("j_barterGold", { g: fmt(g) }), "coins", true);
            }
            const from = have.reduce((a, b) => (GOOD_VALUE[a] < GOOD_VALUE[b] ? a : b));
            const to = better.reduce((a, b) => (GOOD_VALUE[a] > GOOD_VALUE[b] ? a : b));
            const moved = j.cost[from] * (2 / j.cargo[from]);
            j.cargo[from] -= 2;
            j.cost[from] -= moved;
            j.cargo[to] += 2;
            j.cost[to] += moved;
            this.result(tk("j_safeT"), tk("j_barterT", { a: goodsName(from), b: goodsName(to) }), "j_oasis", true);
          },
        });
        break;
      case "traveler": {
        const cost = this.gold(5);
        opts.push({
          label: tk("j_help", { g: fmt(cost) }),
          cls: "primary",
          run: () => {
            s.gold = Math.max(0, s.gold - cost);
            const r = Math.random();
            if (r < 0.55) {
              t.mood += 0.15;
              this.result(tk("j_safeT"), tk("j_helpTip", { p: 15 }), "j_traveler", true);
            } else if (r < 0.8) {
              s.mats.steel += 2;
              this.result(tk("j_safeT"), tk("j_helpGift"), "mat_steel", true);
            } else {
              const n = lose(0.1);
              this.result(tk("j_lost"), tk("j_helpThief", { n }), "j_bandit", false);
            }
          },
        });
        opts.push({ label: tk("j_ignore"), run: () => this.h.dirty() });
        break;
      }
      case "serai": {
        const cost = this.gold(6);
        opts.push({
          label: tk("j_stay", { g: fmt(cost) }),
          cls: "primary",
          run: () => {
            if (s.gold < cost) return this.result(tk("j_lost"), tk("j_noGold"), "j_serai", false);
            s.gold -= cost;
            const e = epochOf(Date.now());
            for (const c of knownCities(s)) j.seen[c] = e;
            t.mood += 0.04;
            this.result(tk("j_safeT"), tk("j_stayT"), "j_serai", true);
          },
        });
        opts.push({ label: tk("j_ignore"), run: () => this.h.dirty() });
        break;
      }
      case "peddler": {
        const pool = ROUTES.map((_, g) => g).filter((g) => goodUnlocked(s, g));
        const g = pool[Math.floor(Math.random() * pool.length)];
        const n = Math.min(3, capacity(j) - load(j));
        const price = this.gold(GOOD_VALUE[g] * 0.5) * n;
        text = tk("ev_j_peddler_t", { n, good: goodsName(g) });
        if (n > 0)
          opts.push({
            label: tk("j_buyDeal", { g: fmt(price) }),
            cls: "primary",
            run: () => {
              if (s.gold < price) return this.result(tk("j_lost"), tk("j_noGold"), "j_peddler", false);
              s.gold -= price;
              j.cargo[g] += n;
              j.cost[g] += price;
              this.result(tk("j_safeT"), tk("j_dealT", { n, good: goodsName(g) }), "j_peddler", true);
            },
          });
        opts.push({ label: tk("j_ignore"), run: () => this.h.dirty() });
        break;
      }
      case "lost": {
        const p = Math.min(0.9, 0.5 + 0.1 * j.up[2]);
        opts.push({
          label: tk("j_guideGo", { p: Math.round(p * 100) }),
          cls: "primary",
          run: () => {
            if (Math.random() < p) {
              t.step = Math.min(t.steps[t.edge] - 1, t.step + 1);
              addXp(j, 4);
              this.result(tk("j_safeT"), tk("j_guideOk"), "j_guide", true);
            } else {
              t.steps[t.edge] += 2;
              const n = lose(0.05);
              this.result(tk("j_lost"), tk("j_guideBad", { n }), "j_lost", false);
            }
          },
        });
        opts.push({
          label: tk("j_ownWay"),
          run: () => {
            t.steps[t.edge] += 1;
            this.result(tk("j_safeT"), tk("j_ownWayT"), "j_lost", true);
          },
        });
        break;
      }
    }
    showModal(
      tk("ev_j_" + ev),
      `<div class="jEvArt">${icon(ic, "ico big")}</div><p class="ageQuote">${text}</p>`,
      opts.map((o) => ({ label: o.label, cls: o.cls ?? "secondary", onClick: o.run })),
      { dismissable: false },
    );
  }

  private arrive(): void {
    const s = this.h.s;
    const j = this.j;
    const t = j.trip!;
    const dest = t.path[t.path.length - 1];
    j.city = dest;
    j.trip = null;
    j.trips++;
    s.stats.journeys++;
    this.mood = Math.max(-0.2, t.mood);
    this.session = t.loot;
    const ups = addXp(j, totalSteps(t.steps) * 2 + t.events * 3);
    this.h.map.flyToCity(CITY_IDS[dest]);
    sfx.fanfare();
    if (ups > 0) this.h.toasts.show(`${icon("j_caravan")} ${tk("j_levelUp", { n: j.lv })}`, "gold", 3200);
    this.openArrival(t.events, t.lost, t.loot);
  }

  private openArrival(events: number, lost: number, loot: number): void {
    const j = this.j;
    const now = Date.now();
    j.seen[j.city] = epochOf(now);
    const carried = ROUTES.map((_, g) => g).filter((g) => j.cargo[g] > 0);
    const rows = carried
      .map((g) => {
        const p = this.gold(sellPrice(j, j.city, g, now)) * (1 + this.mood);
        const avg = j.cost[g] / j.cargo[g];
        const cls = p > avg ? "up" : "down";
        return `<div class="jRow">${goodsIcon(g, "ico")}<div class="am"><b>${goodsName(g)} ×${j.cargo[g]}</b><small>${tk("j_paid", { p: fmt(avg) })}</small></div><span class="jPrice ${cls}">${fmt(p)}</span><button class="mini ready" data-sell="${g}">${tk("j_sellAll")}</button></div>`;
      })
      .join("");
    const moodTxt = this.mood !== 0 ? `<p class="boostLine">${tk(this.mood > 0 ? "j_moodUp" : "j_moodDown", { p: Math.round(Math.abs(this.mood) * 100) })}</p>` : "";
    const body =
      `<div class="jEvArt">${icon("j_caravan", "ico big")}</div><p class="ageQuote">${tk("j_arrivedT", { city: cityName(j.city) })}</p>` +
      `<p class="muted small">${tk("j_tripStats", { e: events, l: lost, g: fmt(loot) })}</p>${moodTxt}` +
      (rows ? `<div class="jList">${rows}</div>` : `<p class="muted">${tk("j_noCargo")}</p>`) +
      `<div class="jSession ${this.session >= 0 ? "up" : "down"}">${tk("j_session")} <b>${this.session >= 0 ? "+" : ""}${fmt(this.session)}</b></div>`;
    const buttons: ModalButton[] = [];
    if (carried.length > 0)
      buttons.push({
        label: tk("j_sellEverything"),
        cls: "primary",
        keepOpen: true,
        onClick: () => {
          for (const g of carried) this.sell(g, true);
          this.finishSession();
          this.openArrival(events, lost, loot);
        },
      });
    buttons.push({ label: tk("j_toMarket"), cls: carried.length ? "secondary" : "primary", keepOpen: true, onClick: () => { this.finishSession(); this.mood = 0; this.openMarket(); } });
    showModal(tk("j_arrived"), body, buttons, { dismissable: true });
    this.bind((b) => {
      if (b.dataset.sell) {
        this.sell(Number(b.dataset.sell), true);
        this.finishSession();
        this.openArrival(events, lost, loot);
      }
    });
  }

  private finishSession(): void {
    const j = this.j;
    if (this.session > j.best) {
      j.best = this.session;
      if (this.session > this.h.income() * 120) happytime();
    }
  }

  openUpgrades(): void {
    const s = this.h.s;
    const j = this.j;
    const inc = this.h.income();
    const rows = UPS.map((k, i) => {
      const lv = j.up[i];
      const max = lv >= UP_MAX;
      const c = upCost(k, lv);
      const gold = c.sec * inc;
      const ok = !max && this.canPay(k, inc);
      const parts = [
        c.iron ? `${icon("mat_iron", "ico xs")}${c.iron}` : "",
        c.leather ? `${icon("mat_leather", "ico xs")}${c.leather}` : "",
        c.wood ? `${icon("mat_wood", "ico xs")}${c.wood}` : "",
        c.steel ? `${icon("mat_steel", "ico xs")}${c.steel}` : "",
        `${icon("coins", "ico xs")}${fmt(gold)}`,
      ]
        .filter(Boolean)
        .join(" ");
      return `<div class="jRow up">${icon(UP_ICON[k], "ico")}<div class="am"><b>${tk("jup_" + k)} <small>${lv}/${UP_MAX}</small></b><small>${tk("jupd_" + k)}</small>${max ? "" : `<small class="jCost">${parts}</small>`}</div><button class="mini${ok ? " ready" : ""}" data-up="${i}" ${ok ? "" : "disabled"}>${max ? tk("j_max") : tk("j_build")}</button></div>`;
    }).join("");
    const body = `<p class="muted small">${tk("j_upHint")}</p><div class="mats">${["iron", "leather", "wood", "steel"].map((m) => `<span>${icon("mat_" + m, "ico xs")} ${fmt(s.mats[m as "iron"])}</span>`).join("")}</div><div class="jList">${rows}</div>`;
    showModal(tk("j_upgrades"), body, [{ label: tk("j_back"), cls: "secondary", keepOpen: true, onClick: () => (j.trip ? this.openStatus() : this.openMarket()) }], { icon: icon("j_camels"), dismissable: true });
    this.bind((b) => {
      if (b.dataset.up) this.upgrade(Number(b.dataset.up));
    });
  }

  private canPay(k: UpKind, inc: number): boolean {
    const s = this.h.s;
    const c = upCost(k, this.j.up[UPS.indexOf(k)]);
    return s.mats.iron >= c.iron && s.mats.leather >= c.leather && s.mats.wood >= c.wood && s.mats.steel >= c.steel && s.gold >= c.sec * inc;
  }

  private upgrade(i: number): void {
    const s = this.h.s;
    const j = this.j;
    const k = UPS[i];
    const inc = this.h.income();
    if (j.up[i] >= UP_MAX || !this.canPay(k, inc)) return sfx.error();
    const c = upCost(k, j.up[i]);
    s.mats.iron -= c.iron;
    s.mats.leather -= c.leather;
    s.mats.wood -= c.wood;
    s.mats.steel -= c.steel;
    s.gold -= c.sec * inc;
    j.up[i]++;
    sfx.fanfare();
    this.h.toasts.show(`${icon(UP_ICON[k])} ${tk("jup_" + k)} ${j.up[i]}/${UP_MAX}`, "gold", 2400);
    this.h.dirty();
    this.h.save();
    this.openUpgrades();
  }

  get marketOpen(): boolean {
    return this.inMarket && modalOpen();
  }
}
