import "./style.css";
import { pauseForAd, setMuted, setPlatformMuted, sfx, unlockAudio } from "./audio";
import { AD_COOLDOWN_MS, FAVOR_DURATION_MS, FAVOR_MAX_MS, ROUTES, UPGRADE_BY_ID } from "./data";
import {
  bountyMult,
  bulkCost,
  buyCount,
  claimableSeals,
  earn,
  merchantMult,
  milestoneMults,
  offlineCapHours,
  offlineEarnings,
  step,
  totalIncomePerSec,
  type BuyMode,
  type TripEvent,
} from "./economy";
import { EventManager, type MapEvent } from "./events";
import { fmt, fmtTime, setNotation } from "./format";
import { setLang, t, tk } from "./i18n";
import { MapView } from "./map";
import { exportSave, importSave, loadGame, saveGame, wipeSave } from "./save";
import { adsAvailable, gameplayStart, gameplayStop, happytime, initSdk, loadingStart, loadingStop, requestRewarded, watchMuteAudio } from "./sdk";
import { newGame, resetForDynasty, type GameState } from "./state";
import { goodsName, milestoneText, modalOpen, offlineSummary, routeLabel, showModal, Toasts, UI, type GameApi } from "./ui";

class Game implements GameApi {
  s: GameState;
  buyMode: BuyMode = 1;
  map: MapView;
  ui: UI;
  toasts = new Toasts();
  events: EventManager;
  private last = performance.now();
  private paused = false;
  private saveTimer = 0;
  private tut4Since = 0;
  private trips: TripEvent[] = [];

  constructor(s: GameState) {
    this.s = s;
    setLang(s.settings.lang);
    setNotation(s.settings.notation);
    setMuted(s.settings.muted);
    this.map = new MapView(document.getElementById("map") as HTMLCanvasElement);
    this.ui = new UI(this);
    this.events = new EventManager(Date.now());
    const canvas = document.getElementById("map") as HTMLCanvasElement;
    canvas.addEventListener("pointerdown", (e) => this.onMapClick(e.clientX, e.clientY));
    window.addEventListener("resize", () => this.map.resize());
    new ResizeObserver(() => this.map.resize()).observe(document.getElementById("mapWrap")!);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.save();
        gameplayStop();
      } else {
        this.last = performance.now();
        gameplayStart();
      }
    });
    window.addEventListener("beforeunload", () => this.save());
    window.addEventListener("pointerdown", () => unlockAudio(), { once: true });
    window.addEventListener("keydown", (e) => this.onKey(e));
    this.map.resize();
  }

  start(): void {
    this.applyOffline();
    requestAnimationFrame((t) => this.frame(t));
  }

  private applyOffline(): void {
    const now = Date.now();
    const seconds = Math.max(0, (now - this.s.lastSave) / 1000);
    if (seconds < 60) return;
    const amount = offlineEarnings(this.s, seconds, now);
    if (amount <= 0) return;
    const sum = offlineSummary(this.s, seconds);
    const body = `<p>${t("offlineMsg", { t: sum.time })}</p><div class="bigGold">+${fmt(amount)}</div>${sum.capped ? `<p class="muted">${t("offlineCap", { h: sum.capH })}</p>` : ""}`;
    const buttons = [{ label: t("collect"), cls: "secondary same", onClick: () => this.collectOffline(amount, 1) }];
    if (this.canWatchAd()) {
      buttons.push({ label: `▶ ${t("collect2x")}`, cls: "primary same", onClick: () => this.collectOfflineAd(amount) });
    }
    showModal(t("welcomeBack"), body, buttons, { icon: "🐪", dismissable: false });
  }

  private collectOffline(amount: number, mult: number): void {
    earn(this.s, amount * mult);
    sfx.coin();
    this.toasts.show("+" + fmt(amount * mult), "gold");
    this.save();
  }

  private async collectOfflineAd(amount: number): Promise<void> {
    const ok = await this.runAd();
    this.collectOffline(amount, ok ? 2 : 1);
    if (!ok) this.toasts.show(t(adsAvailable() ? "adFailed" : "adOff"), "bad");
  }

  private frame(nowPerf: number): void {
    const dtRaw = (nowPerf - this.last) / 1000;
    this.last = nowPerf;
    const now = Date.now();
    if (!this.paused) {
      const dt = Math.min(Math.max(dtRaw, 0), offlineCapHours(this.s) * 3600);
      this.s.stats.playSeconds += Math.min(dt, 1);
      this.trips.length = 0;
      step(this.s, dt, now, this.trips);
      if (this.trips.length > 0) {
        let anyCoin = false;
        for (const tr of this.trips) {
          this.map.addFloater(tr.route, tr.amount, nowPerf, !this.s.masters[tr.route]);
          if (!this.s.masters[tr.route]) anyCoin = true;
        }
        if (anyCoin) sfx.coin();
      }
      const spawned = this.events.update(this.s, now, (e) => this.onEventExpire(e));
      if (spawned) sfx.event();
      this.tutorialTick(now);
      this.saveTimer += dt;
      if (this.saveTimer > 10) {
        this.saveTimer = 0;
        this.save();
      }
    }
    this.map.draw(this.s, this.events.list, nowPerf);
    this.ui.update(nowPerf, this.tutorialHighlight(), this.tutorialTab());
    requestAnimationFrame((t) => this.frame(t));
  }

  save(): void {
    saveGame(this.s);
  }

  private onKey(e: KeyboardEvent): void {
    if (modalOpen()) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= ROUTES.length) {
      this.send(n - 1);
    }
  }

  private onMapClick(cx: number, cy: number): void {
    if (this.paused) return;
    const hit = this.map.hitTestClient(cx, cy, this.s, this.events.list);
    if (!hit) return;
    if (hit.type === "route") this.send(hit.route);
    else this.claimEvent(hit.id);
  }

  private claimEvent(id: number): void {
    const e = this.events.remove(id);
    if (!e) return;
    const now = Date.now();
    const income = Math.max(totalIncomePerSec(this.s, now), 1);
    const p = this.map.eventPoint(e);
    if (e.kind === "bandit") {
      const bounty = Math.max(25, income * 20) * bountyMult(this.s);
      earn(this.s, bounty);
      this.s.stats.bandits++;
      sfx.sword();
      sfx.coin();
      this.map.addTextAt(p, "+" + fmt(bounty), "#ffd75e", performance.now());
      this.toasts.show(t("banditToast", { g: fmt(bounty) }), "good");
    } else {
      this.s.stats.merchants++;
      sfx.fanfare();
      if (Math.random() < 0.6) {
        const mult = Math.round(5 * merchantMult(this.s));
        this.s.boostMult = mult;
        this.s.boostUntil = now + 30_000;
        this.map.addTextAt(p, `x${mult}!`, "#ffe08a", performance.now());
        this.toasts.show(t("merchantBoost", { x: mult, s: 30 }), "gold", 3500);
      } else {
        const gold = Math.max(100, Math.min(this.s.gold * 0.15, income * 900) + income * 60) * merchantMult(this.s);
        earn(this.s, gold);
        this.map.addTextAt(p, "+" + fmt(gold), "#ffe08a", performance.now());
        this.toasts.show(t("merchantGold", { g: fmt(gold) }), "gold", 3500);
      }
      happytime();
    }
  }

  private onEventExpire(e: MapEvent): void {
    if (e.kind === "bandit") this.toasts.show(t("banditEscaped"), "info", 1800);
  }

  private tutorialTick(now: number): void {
    const s = this.s;
    switch (s.tutorial) {
      case 0:
        if (s.routes[0].trips >= 1) s.tutorial = 1;
        break;
      case 1:
        if (s.routes[0].owned >= 5) s.tutorial = 2;
        break;
      case 2:
        if (s.routes[1].owned >= 1) s.tutorial = 3;
        break;
      case 3:
        if (s.masters[0]) {
          s.tutorial = 4;
          this.tut4Since = now;
        }
        break;
      case 4:
        if (!this.tut4Since) this.tut4Since = now;
        if (now - this.tut4Since > 20_000) s.tutorial = 5;
        break;
    }
    const hint = document.getElementById("hint")!;
    if (s.tutorial < 5) {
      const key = (["tut0", "tut1", "tut2", "tut3", "tut4"] as const)[s.tutorial];
      const text = t(key);
      if (hint.textContent !== text) hint.textContent = text;
      hint.classList.add("show");
    } else {
      hint.classList.remove("show");
    }
    this.map.highlightRoute = s.tutorial === 0 ? 0 : s.tutorial === 2 ? 1 : -1;
  }

  private tutorialHighlight(): { route: number; part: "send" | "buy" } | null {
    switch (this.s.tutorial) {
      case 0:
        return { route: 0, part: "send" };
      case 1:
        return { route: 0, part: "buy" };
      case 2:
        return { route: 1, part: "buy" };
      default:
        return null;
    }
  }

  private tutorialTab(): "masters" | null {
    return this.s.tutorial === 3 ? "masters" : null;
  }

  setBuyMode(m: BuyMode): void {
    this.buyMode = m;
  }

  buyRoute(i: number): void {
    const s = this.s;
    const def = ROUTES[i];
    const r = s.routes[i];
    if (i > 0 && s.routes[i - 1].owned <= 0) return;
    const k = r.owned === 0 ? 1 : buyCount(s, i, this.buyMode);
    const cost = bulkCost(def, r.owned, k);
    if (s.gold < cost || k <= 0) {
      sfx.error();
      return;
    }
    const before = r.owned;
    const msBefore = milestoneMults(before);
    s.gold -= cost;
    r.owned += k;
    sfx.buy();
    if (before === 0) {
      this.toasts.show(t("newRouteUnlocked", { route: `${goodsName(i)} (${routeLabel(i)})` }), "good", 3200);
      sfx.fanfare();
      happytime();
      this.save();
      return;
    }
    const msAfter = milestoneMults(r.owned);
    if (msAfter.speed !== msBefore.speed || msAfter.profit !== msBefore.profit) {
      const speed = msAfter.speed / msBefore.speed;
      const profit = msAfter.profit / msBefore.profit;
      const parts: string[] = [];
      if (speed > 1) parts.push(milestoneText({ speed }));
      if (profit > 1) parts.push(milestoneText({ profit }));
      this.toasts.show(t("milestoneReached", { goods: goodsName(i), bonus: parts.join(", ") }), "gold");
      sfx.fanfare();
    }
  }

  send(i: number): void {
    const r = this.s.routes[i];
    if (!r || r.owned <= 0 || r.running || this.s.masters[i]) return;
    r.running = true;
    r.progress = 0;
    this.s.stats.clicks++;
    sfx.send();
  }

  hireMaster(i: number): void {
    const s = this.s;
    const cost = ROUTES[i].masterCost;
    if (s.masters[i] || s.gold < cost || s.routes[i].owned <= 0) {
      sfx.error();
      return;
    }
    s.gold -= cost;
    s.masters[i] = true;
    if (!s.routes[i].running) s.routes[i].progress = 0;
    s.routes[i].running = false;
    sfx.fanfare();
    this.toasts.show(`✔ ${t("masterName", { city: tk("city_" + ROUTES[i].from) })}`, "good");
    this.save();
  }

  buyUpgrade(id: string): void {
    const s = this.s;
    const u = UPGRADE_BY_ID[id];
    if (!u || s.upgrades.includes(id) || s.gold < u.cost) {
      sfx.error();
      return;
    }
    s.gold -= u.cost;
    s.upgrades.push(id);
    sfx.buy();
    this.save();
  }

  foundDynasty(): void {
    const n = claimableSeals(this.s);
    if (n < 1) return;
    showModal(t("dynastyTitle"), `<p>${t("dynastyConfirm")}</p><div class="bigGold">+${fmt(n)} 🏯</div>`, [
      { label: t("cancel"), cls: "secondary same" },
      {
        label: t("yes"),
        cls: "primary same",
        onClick: () => {
          resetForDynasty(this.s, n);
          this.events.clear();
          this.ui.dirty = true;
          sfx.fanfare();
          happytime();
          this.save();
        },
      },
    ], { icon: "🏯" });
  }

  canWatchAd(): boolean {
    return adsAvailable();
  }

  adCooldownLeft(now: number): number {
    void now;
    return Math.max(0, this.s.lastAdAt + AD_COOLDOWN_MS - Date.now());
  }

  private async runAd(): Promise<boolean> {
    const blocker = document.getElementById("adBlocker")!;
    blocker.classList.remove("hidden");
    this.paused = true;
    gameplayStop();
    const ok = await requestRewarded(() => pauseForAd(true));
    pauseForAd(false);
    blocker.classList.add("hidden");
    this.paused = false;
    this.last = performance.now();
    gameplayStart();
    if (ok) this.s.lastAdAt = Date.now();
    return ok;
  }

  openFavor(): void {
    const now = Date.now();
    const cd = this.adCooldownLeft(now);
    const watch = cd > 0
      ? { label: t("favorCooldown", { t: fmtTime(cd / 1000) }), cls: "primary same", keepOpen: true }
      : {
          label: `▶ ${t("watchAd")}`,
          cls: "primary same",
          onClick: async () => {
            const ok = await this.runAd();
            if (ok) {
              const base = Math.max(this.s.favorUntil, Date.now());
              this.s.favorUntil = Math.min(base + FAVOR_DURATION_MS, Date.now() + FAVOR_MAX_MS);
              this.toasts.show(t("adThanks"), "gold");
              sfx.fanfare();
              this.save();
            } else {
              this.toasts.show(t(adsAvailable() ? "adFailed" : "adOff"), "bad");
            }
          },
        };
    showModal(t("favorTitle"), `<p>${t("favorDesc")}</p>`, [{ label: t("noThanks"), cls: "secondary same" }, watch], { icon: "👑" });
  }

  toggleMute(): void {
    this.s.settings.muted = !this.s.settings.muted;
    setMuted(this.s.settings.muted);
    this.save();
  }

  openSettings(): void {
    const s = this.s;
    const body = `
      <div class="setting"><span>${t("language")}</span><div class="seg">
        <button data-lang="en" class="${s.settings.lang === "en" ? "on" : ""}">English</button>
        <button data-lang="tr" class="${s.settings.lang === "tr" ? "on" : ""}">Türkçe</button></div></div>
      <div class="setting"><span>${t("notationLbl")}</span><div class="seg">
        <button data-not="suffix" class="${s.settings.notation === "suffix" ? "on" : ""}">${t("notationSuffix")}</button>
        <button data-not="sci" class="${s.settings.notation === "sci" ? "on" : ""}">${t("notationSci")}</button></div></div>
      <div class="setting"><span>${t("sound")}</span><div class="seg">
        <button data-snd="on" class="${!s.settings.muted ? "on" : ""}">${t("on")}</button>
        <button data-snd="off" class="${s.settings.muted ? "on" : ""}">${t("off")}</button></div></div>
      <div class="setting col">
        <button id="exportBtn" class="secondary">${t("exportSave")}</button>
        <button id="importBtn" class="secondary">${t("importSave")}</button>
        <button id="wipeBtn" class="danger">${t("hardReset")}</button>
      </div>`;
    showModal(t("settings"), body, [{ label: t("close"), cls: "primary" }], { icon: "⚙️" });
    const root = document.getElementById("modal")!;
    root.querySelectorAll<HTMLButtonElement>("[data-lang]").forEach((b) =>
      b.addEventListener("click", () => {
        s.settings.lang = b.dataset.lang as "en" | "tr";
        setLang(s.settings.lang);
        this.ui.dirty = true;
        this.save();
        this.openSettings();
      }),
    );
    root.querySelectorAll<HTMLButtonElement>("[data-not]").forEach((b) =>
      b.addEventListener("click", () => {
        s.settings.notation = b.dataset.not as "suffix" | "sci";
        setNotation(s.settings.notation);
        this.ui.dirty = true;
        this.save();
        this.openSettings();
      }),
    );
    root.querySelectorAll<HTMLButtonElement>("[data-snd]").forEach((b) =>
      b.addEventListener("click", () => {
        s.settings.muted = b.dataset.snd === "off";
        setMuted(s.settings.muted);
        this.save();
        this.openSettings();
      }),
    );
    root.querySelector("#exportBtn")!.addEventListener("click", async () => {
      this.save();
      const code = exportSave(s);
      try {
        await navigator.clipboard.writeText(code);
        this.toasts.show(t("exported"), "good");
      } catch {
        window.prompt(t("exportSave"), code);
      }
    });
    root.querySelector("#importBtn")!.addEventListener("click", () => {
      const code = window.prompt(t("importPrompt"));
      if (!code) return;
      const loaded = importSave(code);
      if (!loaded) {
        this.toasts.show(t("importBad"), "bad");
        return;
      }
      this.replaceState(loaded);
    });
    root.querySelector("#wipeBtn")!.addEventListener("click", () => {
      if (!window.confirm(t("hardResetConfirm"))) return;
      wipeSave();
      this.replaceState(newGame());
    });
  }

  private replaceState(s: GameState): void {
    s.lastSave = Date.now();
    this.s = s;
    setLang(s.settings.lang);
    setNotation(s.settings.notation);
    setMuted(s.settings.muted);
    this.events.clear();
    this.ui.dirty = true;
    document.getElementById("modal")!.classList.add("hidden");
    this.save();
  }
}

async function boot(): Promise<void> {
  await initSdk();
  watchMuteAudio(setPlatformMuted);
  loadingStart();
  const state = loadGame();
  const game = new Game(state);
  (window as unknown as { game: Game }).game = game;
  loadingStop();
  document.getElementById("loading")?.remove();
  gameplayStart();
  game.start();
}

void boot();
