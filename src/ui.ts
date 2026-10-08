import { ROUTES, UPGRADES, type UpgradeDef } from "./data";
import {
  boostActive,
  bulkCost,
  buyCount,
  claimableSeals,
  favorActive,
  lifetimeForSeals,
  milestoneMults,
  nextMilestone,
  offlineCapHours,
  prevMilestoneN,
  profitPerTrip,
  sealMult,
  totalIncomePerSec,
  totalSealsFor,
  tripTime,
  type BuyMode,
} from "./economy";
import { fmt, fmtTime } from "./format";
import { t, tk } from "./i18n";
import type { GameState } from "./state";

export interface GameApi {
  s: GameState;
  buyMode: BuyMode;
  canWatchAd(): boolean;
  adCooldownLeft(now: number): number;
  buyRoute(i: number): void;
  send(i: number): void;
  hireMaster(i: number): void;
  buyUpgrade(id: string): void;
  foundDynasty(): void;
  openFavor(): void;
  toggleMute(): void;
  openSettings(): void;
  setBuyMode(m: BuyMode): void;
}

export const GOODS_ICON = ["🌶️", "🧶", "🐉", "💎", "🧣", "🧵", "💍", "🏺"];

type Tab = "routes" | "upgrades" | "masters" | "dynasty" | "stats";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function $(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (!e) throw new Error("Missing #" + id);
  return e;
}

export function goodsName(i: number): string {
  return tk("goods_" + ROUTES[i].id);
}

export function routeLabel(i: number): string {
  return `${tk("city_" + ROUTES[i].from)} → ${tk("city_" + ROUTES[i].to)}`;
}

export function upgradeName(u: UpgradeDef): string {
  switch (u.kind) {
    case "route":
      return t("upgradeRoute", { goods: goodsName(u.route!), x: u.mult! });
    case "all":
      return t("upgradeAll", { x: u.mult! });
    case "bounty":
      return t("upgradeBounty", { x: u.mult! });
    case "merchant":
      return t("upgradeMerchant", { x: u.mult! });
    case "offline":
      return t("upgradeOffline", { h: u.hours! });
  }
}

export function upgradeIcon(u: UpgradeDef): string {
  switch (u.kind) {
    case "route":
      return GOODS_ICON[u.route!];
    case "all":
      return "👑";
    case "bounty":
      return "⚔️";
    case "merchant":
      return "🧞";
    case "offline":
      return "📜";
  }
}

export function milestoneText(m: { speed?: number; profit?: number }): string {
  return m.speed ? t("speedX", { x: m.speed }) : t("profitX", { x: m.profit ?? 1 });
}

interface RouteRow {
  root: HTMLElement;
  owned: HTMLElement;
  fill: HTMLElement;
  barText: HTMLElement;
  ms: HTMLElement;
  msFill: HTMLElement;
  send: HTMLButtonElement;
  buy: HTMLButtonElement;
  buyLbl: HTMLElement;
  buyCost: HTMLElement;
}

export class UI {
  private g: GameApi;
  tab: Tab = "routes";
  dirty = true;
  private body: HTMLElement;
  private rows: (RouteRow | null)[] = [];
  private dynamic: (() => void)[] = [];
  private lastText = 0;
  private sig = "";

  constructor(g: GameApi) {
    this.g = g;
    this.body = $("tabBody");
    $("favorBtn").addEventListener("click", () => g.openFavor());
    $("muteBtn").addEventListener("click", () => g.toggleMute());
    $("settingsBtn").addEventListener("click", () => g.openSettings());
  }

  private structureSig(): string {
    const s = this.g.s;
    return [
      this.tab,
      s.settings.lang,
      s.settings.notation,
      s.routes.map((r) => (r.owned > 0 ? 1 : 0)).join(""),
      s.masters.map((m) => (m ? 1 : 0)).join(""),
      s.upgrades.length,
      String(this.g.buyMode),
      s.seals,
    ].join("|");
  }

  setTab(tab: Tab): void {
    this.tab = tab;
    this.dirty = true;
  }

  renderStatic(): void {
    document.querySelectorAll<HTMLElement>("[data-t]").forEach((e) => {
      e.textContent = tk(e.dataset.t!);
    });
    document.title = `${t("title")}: ${t("subtitle")}`;
    const tabs = $("tabs");
    tabs.innerHTML = "";
    const defs: [Tab, string][] = [
      ["routes", t("tabRoutes")],
      ["upgrades", t("tabUpgrades")],
      ["masters", t("tabMasters")],
      ["dynasty", t("tabDynasty")],
      ["stats", t("tabStats")],
    ];
    for (const [id, label] of defs) {
      const b = el("button", "tab" + (this.tab === id ? " active" : ""));
      b.dataset.tab = id;
      b.innerHTML = `<span>${label}</span><i class="badge"></i>`;
      b.addEventListener("click", () => this.setTab(id));
      tabs.appendChild(b);
    }
  }

  private build(): void {
    this.renderStatic();
    this.body.innerHTML = "";
    this.rows = [];
    this.dynamic = [];
    switch (this.tab) {
      case "routes":
        this.buildRoutes();
        break;
      case "upgrades":
        this.buildUpgrades();
        break;
      case "masters":
        this.buildMasters();
        break;
      case "dynasty":
        this.buildDynasty();
        break;
      case "stats":
        this.buildStats();
        break;
    }
  }

  private buildRoutes(): void {
    const g = this.g;
    const s = g.s;
    const head = el("div", "buyModes");
    head.appendChild(el("span", "lbl", t("buyMode")));
    const modes: [BuyMode, string][] = [[1, "x1"], [10, "x10"], [100, "x100"], ["next", t("buyNext")], ["max", t("buyMax")]];
    for (const [m, label] of modes) {
      const b = el("button", "mode" + (g.buyMode === m ? " active" : ""), label);
      b.addEventListener("click", () => g.setBuyMode(m));
      head.appendChild(b);
    }
    this.body.appendChild(head);

    let shownLocked = false;
    for (let i = 0; i < ROUTES.length; i++) {
      const r = s.routes[i];
      const available = i === 0 || s.routes[i - 1].owned > 0;
      if (!available) {
        if (!shownLocked) {
          shownLocked = true;
          const lock = el("div", "route locked");
          lock.innerHTML = `<div class="icon">❔</div><div class="mid"><div class="name">${t("lockedRoute")}</div><small>${t("lockedHint")}</small></div>`;
          this.body.appendChild(lock);
        }
        this.rows.push(null);
        continue;
      }
      const root = el("div", "route" + (r.owned === 0 ? " unopened" : ""));
      root.style.setProperty("--c", ROUTES[i].color);
      root.innerHTML = `
        <div class="icon">${GOODS_ICON[i]}<span class="owned"></span></div>
        <div class="mid">
          <div class="name">${goodsName(i)} <small>${routeLabel(i)}</small></div>
          <div class="bar"><div class="fill"></div><span class="barText"></span></div>
          <div class="ms"><span class="msText"></span><div class="msBar"><div class="msFill"></div></div></div>
        </div>
        <div class="btns">
          <button class="send"></button>
          <button class="buy"><span class="buyLbl"></span><b class="buyCost"></b></button>
        </div>`;
      const row: RouteRow = {
        root,
        owned: root.querySelector(".owned")!,
        fill: root.querySelector(".fill")!,
        barText: root.querySelector(".barText")!,
        ms: root.querySelector(".msText")!,
        msFill: root.querySelector(".msFill")!,
        send: root.querySelector(".send")!,
        buy: root.querySelector(".buy")!,
        buyLbl: root.querySelector(".buyLbl")!,
        buyCost: root.querySelector(".buyCost")!,
      };
      row.send.addEventListener("click", () => g.send(i));
      row.buy.addEventListener("click", () => g.buyRoute(i));
      this.rows.push(row);
      this.body.appendChild(root);
    }
  }

  private buildUpgrades(): void {
    const g = this.g;
    const s = g.s;
    const avail = UPGRADES.filter((u) => !s.upgrades.includes(u.id) && (u.kind !== "route" || s.routes[u.route!].owned > 0));
    const shown = avail.slice(0, 10);
    if (shown.length === 0) {
      this.body.appendChild(el("p", "empty", t("noUpgrades")));
    }
    for (const u of shown) {
      const card = el("div", "card");
      card.innerHTML = `<div class="icon">${upgradeIcon(u)}</div><div class="mid"><div class="name">${upgradeName(u)}</div></div>`;
      const btn = el("button", "buy", `<span>${t("buy")}</span><b>${fmt(u.cost)}</b>`);
      btn.addEventListener("click", () => g.buyUpgrade(u.id));
      card.appendChild(btn);
      this.body.appendChild(card);
      this.dynamic.push(() => {
        btn.disabled = s.gold < u.cost;
        card.classList.toggle("ready", s.gold >= u.cost);
      });
    }
    if (s.upgrades.length > 0) {
      this.body.appendChild(el("p", "muted", `${t("owned")}: ${s.upgrades.length} / ${UPGRADES.length}`));
    }
  }

  private buildMasters(): void {
    const g = this.g;
    const s = g.s;
    for (let i = 0; i < ROUTES.length; i++) {
      const available = i === 0 || s.routes[i - 1].owned > 0;
      if (!available) break;
      const def = ROUTES[i];
      const card = el("div", "card" + (s.masters[i] ? " done" : ""));
      card.innerHTML = `<div class="icon">🧔🏽<span class="mini">${GOODS_ICON[i]}</span></div>
        <div class="mid"><div class="name">${t("masterName", { city: tk("city_" + def.from) })}</div>
        <small>${t("masterDesc", { route: goodsName(i) })}</small></div>`;
      if (s.masters[i]) {
        card.appendChild(el("div", "hired", "✔ " + t("hired")));
      } else {
        const btn = el("button", "buy", `<span>${t("hire")}</span><b>${fmt(def.masterCost)}</b>`);
        btn.addEventListener("click", () => g.hireMaster(i));
        card.appendChild(btn);
        this.dynamic.push(() => {
          const ok = s.gold >= def.masterCost && s.routes[i].owned > 0;
          btn.disabled = !ok;
          card.classList.toggle("ready", ok);
        });
      }
      this.body.appendChild(card);
    }
  }

  private buildDynasty(): void {
    const g = this.g;
    const s = g.s;
    const box = el("div", "dynasty");
    box.innerHTML = `
      <div class="crest">🏯</div>
      <h3>${t("dynastyTitle")}</h3>
      <p>${t("dynastyDesc")}</p>
      <div class="kv"><span>${t("sealsOwned")}</span><b id="dySeals"></b></div>
      <div class="kv"><span>${t("sealsBonus")}</span><b id="dyBonus"></b></div>
      <div class="kv"><span>${t("lifetime")}</span><b id="dyLife"></b></div>
      <div class="kv"><span>${t("nextSealAt")}</span><b id="dyNext"></b></div>
      <div class="kv big"><span>${t("sealsClaim")}</span><b id="dyClaim"></b></div>
      <button id="dyBtn" class="primary"></button>
      <p class="muted">${t("dynastyTip")}</p>`;
    this.body.appendChild(box);
    const btn = box.querySelector<HTMLButtonElement>("#dyBtn")!;
    btn.addEventListener("click", () => g.foundDynasty());
    this.dynamic.push(() => {
      const c = claimableSeals(s);
      box.querySelector("#dySeals")!.textContent = fmt(s.seals);
      box.querySelector("#dyBonus")!.textContent = "x" + sealMult(s).toFixed(2);
      box.querySelector("#dyLife")!.textContent = fmt(s.lifetimeEarned);
      box.querySelector("#dyNext")!.textContent = fmt(lifetimeForSeals(totalSealsFor(s.lifetimeEarned) + 1));
      box.querySelector("#dyClaim")!.textContent = "+" + fmt(c);
      btn.disabled = c < 1;
      btn.textContent = c < 1 ? t("dynastyNotYet") : t("dynastyBtn", { n: fmt(c) });
      btn.classList.toggle("glow", c >= Math.max(1, s.seals));
    });
  }

  private buildStats(): void {
    const s = this.g.s;
    const box = el("div", "stats");
    this.body.appendChild(box);
    this.dynamic.push(() => {
      const trips = s.routes.reduce((a, r) => a + r.trips, 0);
      const rows: [string, string][] = [
        [t("statRun"), fmt(s.runEarned)],
        [t("statBest"), fmt(Math.max(s.stats.bestRun, s.runEarned))],
        [t("lifetime"), fmt(s.lifetimeEarned)],
        [t("statTrips"), fmt(trips)],
        [t("statClicks"), fmt(s.stats.clicks)],
        [t("statBandits"), fmt(s.stats.bandits)],
        [t("statMerchants"), fmt(s.stats.merchants)],
        [t("statDynasties"), fmt(s.stats.dynasties)],
        [t("statPlay"), fmtTime(s.stats.playSeconds)],
      ];
      box.innerHTML = rows.map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join("");
    });
  }

  private updateBadges(): void {
    const s = this.g.s;
    const upg = UPGRADES.some((u) => !s.upgrades.includes(u.id) && s.gold >= u.cost && (u.kind !== "route" || s.routes[u.route!].owned > 0));
    const mas = ROUTES.some((d, i) => !s.masters[i] && s.routes[i].owned > 0 && s.gold >= d.masterCost);
    const dyn = claimableSeals(s) >= Math.max(1, s.seals);
    const set = (tab: Tab, on: boolean) => {
      const b = document.querySelector<HTMLElement>(`.tab[data-tab="${tab}"]`);
      if (b) b.classList.toggle("has", on);
    };
    set("upgrades", upg);
    set("masters", mas);
    set("dynasty", dyn);
  }

  update(nowPerf: number, highlight: { route: number; part: "send" | "buy" } | null, highlightTab: Tab | null): void {
    const g = this.g;
    const s = g.s;
    const sig = this.structureSig();
    if (this.dirty || sig !== this.sig) {
      this.sig = sig;
      this.dirty = false;
      this.build();
    }

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      if (!row) continue;
      const r = s.routes[i];
      const tt = tripTime(s, i);
      const auto = s.masters[i];
      const prog = auto && tt < 0.25 ? 1 : r.owned > 0 && (auto || r.running) ? r.progress : 0;
      row.fill.style.width = (prog * 100).toFixed(1) + "%";
    }

    if (nowPerf - this.lastText < 120) return;
    this.lastText = nowPerf;
    const now = Date.now();

    $("gold").textContent = fmt(s.gold);
    $("income").textContent = "+" + fmt(totalIncomePerSec(s, now)) + t("perSec");
    $("muteBtn").textContent = s.settings.muted ? "🔇" : "🔊";

    const favorBtn = $("favorBtn") as HTMLButtonElement;
    if (!g.canWatchAd()) {
      favorBtn.style.display = favorActive(s, now) ? "" : "none";
    } else {
      favorBtn.style.display = "";
    }
    const cd = g.adCooldownLeft(now);
    favorBtn.classList.toggle("cool", cd > 0);
    favorBtn.innerHTML = favorActive(s, now)
      ? `<span class="play">▶</span>x2 <small>${fmtTime((s.favorUntil - now) / 1000)}</small>`
      : `<span class="play">▶</span>${t("favorBtn")}`;
    favorBtn.classList.toggle("on", favorActive(s, now));

    const buffs: string[] = [];
    if (favorActive(s, now)) buffs.push(`<span class="buff favor">👑 ${t("favorActive", { t: fmtTime((s.favorUntil - now) / 1000) })}</span>`);
    if (boostActive(s, now)) buffs.push(`<span class="buff boost">🧞 ${t("boostActive", { x: s.boostMult, t: fmtTime((s.boostUntil - now) / 1000) })}</span>`);
    if (s.seals > 0) buffs.push(`<span class="buff seals">🏯 x${sealMult(s).toFixed(2)}</span>`);
    $("buffs").innerHTML = buffs.join("");

    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      if (!row) continue;
      const r = s.routes[i];
      const def = ROUTES[i];
      const auto = s.masters[i];
      const tt = tripTime(s, i);
      row.owned.textContent = r.owned > 0 ? fmt(r.owned) : "";
      if (r.owned > 0) {
        const per = profitPerTrip(s, i, now);
        const left = auto || r.running ? (1 - r.progress) * tt : tt;
        row.barText.textContent = `+${fmt(per)}  •  ${fmtTime(left)}`;
      } else {
        row.barText.textContent = `${fmtTime(def.time)}`;
      }
      const nm = nextMilestone(r.owned);
      if (nm) {
        const prev = prevMilestoneN(r.owned);
        row.ms.textContent = t("nextMilestone", { n: nm.n, bonus: milestoneText(nm) });
        row.msFill.style.width = (((r.owned - prev) / (nm.n - prev)) * 100).toFixed(1) + "%";
      } else {
        row.ms.textContent = t("allMilestones");
        row.msFill.style.width = "100%";
      }
      if (r.owned === 0) {
        row.send.style.display = "none";
      } else if (auto) {
        row.send.style.display = "";
        row.send.disabled = true;
        row.send.className = "send auto";
        row.send.textContent = "⚙ " + t("auto");
      } else {
        row.send.style.display = "";
        row.send.disabled = r.running;
        row.send.className = "send" + (r.running ? "" : " ready");
        row.send.textContent = r.running ? t("sending") : "▶ " + t("send");
      }
      const k = r.owned === 0 ? 1 : buyCount(s, i, g.buyMode);
      const cost = bulkCost(def, r.owned, k);
      row.buyLbl.textContent = r.owned === 0 ? t("openRoute") : `${t("buy")} x${fmt(k)}`;
      row.buyCost.textContent = fmt(cost);
      row.buy.disabled = s.gold < cost;
      row.buy.classList.toggle("ready", s.gold >= cost);
      row.root.classList.toggle("hl-send", !!highlight && highlight.route === i && highlight.part === "send");
      row.root.classList.toggle("hl-buy", !!highlight && highlight.route === i && highlight.part === "buy");
      row.root.classList.toggle("boosted", milestoneMults(r.owned).speed > 1 && auto);
    }

    for (const fn of this.dynamic) fn();
    this.updateBadges();
    document.querySelectorAll<HTMLElement>(".tab").forEach((b) => b.classList.toggle("pulse", b.dataset.tab === highlightTab && this.tab !== highlightTab));
  }
}

export function offlineSummary(s: GameState, seconds: number): { time: string; capped: boolean; capH: number } {
  const capH = offlineCapHours(s);
  return { time: fmtTime(Math.min(seconds, capH * 3600)), capped: seconds > capH * 3600, capH };
}

export function sealsPreview(s: GameState): number {
  return totalSealsFor(s.lifetimeEarned);
}

export class Toasts {
  private root: HTMLElement;
  constructor() {
    this.root = $("toasts");
  }
  show(text: string, kind: "info" | "gold" | "good" | "bad" = "info", ms = 2600): void {
    const e = el("div", "toast " + kind, text);
    this.root.appendChild(e);
    while (this.root.children.length > 4) this.root.firstElementChild?.remove();
    requestAnimationFrame(() => e.classList.add("in"));
    window.setTimeout(() => {
      e.classList.remove("in");
      window.setTimeout(() => e.remove(), 300);
    }, ms);
  }
}

export interface ModalButton {
  label: string;
  cls?: string;
  onClick?: () => void;
  keepOpen?: boolean;
}

export function showModal(title: string, bodyHtml: string, buttons: ModalButton[], opts: { icon?: string; dismissable?: boolean } = {}): () => void {
  const root = $("modal");
  root.innerHTML = "";
  root.classList.remove("hidden");
  const box = el("div", "box");
  box.innerHTML = `${opts.icon ? `<div class="micon">${opts.icon}</div>` : ""}<h2>${title}</h2><div class="mbody">${bodyHtml}</div>`;
  const btns = el("div", "mbtns");
  const close = () => {
    root.classList.add("hidden");
    root.innerHTML = "";
  };
  for (const b of buttons) {
    const be = el("button", b.cls ?? "", b.label);
    be.addEventListener("click", () => {
      if (!b.keepOpen) close();
      b.onClick?.();
    });
    btns.appendChild(be);
  }
  box.appendChild(btns);
  root.appendChild(box);
  root.onclick = (e) => {
    if (e.target === root && opts.dismissable !== false) close();
  };
  return close;
}

export function modalOpen(): boolean {
  return !document.getElementById("modal")!.classList.contains("hidden");
}
