import "./style.css";
import { pauseForAd, setMuted, setPlatformMuted, sfx, unlockAudio } from "./audio";
import { AD_COOLDOWN_MS, CITIES, FAVOR_DURATION_MS, FAVOR_MAX_MS, ROUTES, UPGRADE_BY_ID } from "./data";
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
  routeIncomePerSec,
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
import { acceptChapter, chapterAvailable, completeChapter, currentChapter, goalDone, goalValue, story, travelerName, type TravelerId } from "./chronicle";
import { newAchievements } from "./achievements";
import { COMPANIONS, COMPANION_IDS, COMPANION_MAX, compLevel, compMult, compText, compUpgradeCost, recruited, type CompanionId } from "./companions";
import { applyOutcomes, availableChoices, outcomeGold, pickStory, type Choice, type Story } from "./stories";
import { setMusicEnabled, setMusicSeason, startMusic } from "./music";
import { OrderManager, seasonAt, seasonBountyMult, type Order, type Season } from "./world";
import { BUILDINGS, BUILD_SECONDS, MAX_CITY_LEVEL, canBuild, cityCost, cityLevel, cityUnlocked, finishBuild, startBuild } from "./cities";
import {
  AGES,
  CREST_COLORS,
  CREST_SYMBOLS,
  RIVALS,
  RIVAL_ROUTE_BONUS,
  WONDERS,
  WONDER_DONE_MULT,
  WONDER_STAGES,
  WONDER_STAGE_MULT,
  ageCost,
  ageReqsMet,
  canAdvanceAge,
  canBuildWonder,
  heirChoices,
  nextAge,
  rivalBeaten,
  rivalForRoute,
  rivalWealth,
  rulerTitle,
  wonderCost,
  wonderStage,
  type RivalDef,
  type Ruler,
} from "./empire";
import { currentShock, marketPrices, marketTick, resetMarket, restoreMarket } from "./market";
import { JourneyController } from "./journeyCtl";
import {
  ALLY_MS,
  ALLY_MULT,
  ALLY_NEED,
  DIPLO_CD,
  EXP_HP,
  EXP_ROWS,
  EXP_TICKETS,
  GIFT_REL,
  NODE_ICON,
  SPOILS_MS,
  SPOILS_MULT,
  buyStock as stockBuy,
  canStock,
  expOdds,
  expRow,
  giftCost,
  lotCost,
  relation,
  rivalReached,
  rollExpTickets,
  sellStock as stockSell,
  tributeOdds,
  warOdds,
  type DiploAct,
} from "./realm";
import {
  HERO_LOOKS,
  MAX_BARRACKS,
  MAX_BREED,
  MAX_PLUS,
  MAX_TIER,
  MONUMENT_BONUS,
  MONUMENT_STEPS,
  RELICS,
  UNIT_TYPES,
  UNIT_UNLOCK,
  banditStrength,
  escortPower,
  barracksCost,
  bestUnit,
  craftCost,
  enchantCost,
  fight,
  clampGear,
  forgeLevel,
  gearIcon,
  maxForgeTier,
  gainXp,
  hasMats,
  healTick,
  idleSoldiers,
  monumentStage,
  mountCost,
  mountIcon,
  mountPlusCost,
  payMats,
  plusChance,
  plusCost,
  recruitCost,
  rollEnchant,
  rollRelic,
  takeCasualties,
  slotOf,
  unitUnlocked,
  winChance,
  heroPower,
  companionPower,
  threatMult,
  type BattleResult,
  type Item,
  type ItemType,
  type RelicId,
  type Slot,
} from "./army";
import { CALM_MS, CONTRACT_STEEL, LETTER_KINDS, LETTER_VARIANTS, TITAN_POS, contractReady, refreshContracts, spawnTitan, tapDamage, titanDps, type LetterKind } from "./quests";
import { openSagaCard, openShareCard } from "./share";
import {
  CAMP_BONUS,
  LEGACY_BONUS,
  MAX_BLOOD,
  OATH_BREAK_STEEL,
  PATH_ICON,
  PERKS,
  SPY_FOIL,
  SPY_MAX,
  SPY_STEEL,
  campSeasonIndex,
  campWanted,
  activeFestival,
  festivalKey,
  favorFree,
  houseDef,
  houseOffers,
  legacyBonus,
  nextPerkCost,
  seasonEvent,
  type HouseId,
  type PathId,
} from "./perks";
import { HAN_MULT, canBuildHan, hanCost, hanWood, hasHan, pickHanStory } from "./caravanserai";
import { canAfford, petitionById, pickPetition, type Decree } from "./court";
import {
  ARTIFACTS,
  ART_BY_ID,
  ART_SLOTS,
  RAID_THREAT_MS,
  artCost,
  canForgeArt,
  forgeArt,
  incursionOdds,
  isNight,
  weatherAt,
  SAND_DROP,
  RAIN_YOUTH,
  type Weather,
  NIGHT_RAID,
  nextIncursionDelay,
  CONQUER_BONUS,
  MONTH_MS,
  QUEST_STEPS,
  RAID_CD,
  REGIONS,
  REGION_MAX,
  REVOLT_MOOD,
  REVOLT_MULT,
  TAXES,
  TROPHY_BONUS,
  TROPHY_RARITY,
  hireCost,
  monthWage,
  moodTick,
  questDone,
  questReward,
  raidGoldSec,
  raidMats,
  raidOdds,
  raidLosses,
  raidPower,
  regionConquered,
  regionCost,
  regionNeed,
  regionVisible,
  revoltFoe,
  rollTrophy,
  trophyChance,
  wagePer,
  xpNeed,
  youthCap,
  youthTick,
  type Rarity,
} from "./province";
import { isOpen, pendingFeature } from "./unlocks";
import { buyOffer, buybackPrice, nextMerchantDelay, offerPrice, rollMerchant, sellTrophy, sellable } from "./merchant";
import { GATHER_MS, GOV_STEP, NODES, RUIN_MS, gatherMat, gatherYield, governorCity, governorOf, nodeOpen, nodeReady, ruinNeed } from "./frontier";
import {
  BARD_VARIANTS,
  MAX_SAGA,
  RAID_TIERS,
  raidHit,
  raidTierReady,
  raidTotal,
  rollRaid,
  SEASON_STEPS,
  TW_BONUS,
  TW_PENALTY,
  TW_RIVALS,
  TW_UNDERCUT_ODDS,
  TW_WIN_MS,
  addSeasonPts,
  guildTierReady,
  heroMayFall,
  rollSeason,
  sabotageOdds,
  seasonStepReady,
  startTradeWar,
  tradeWarActive,
  undercutCost,
  type BardEvent,
  type SeasonSource,
} from "./saga";
import {
  ARENA_GAIN,
  ARENA_LOSS,
  ARENA_STEEL,
  FORTS,
  FORT_WALLS,
  MAX_NEMESIS_LEVEL,
  NEMESIS_TAUNTS,
  arenaPower,
  arenaTickets,
  closeSeason,
  fortDef,
  fortLoot,
  fortStrength,
  fortTaken,
  nemesisById,
  nemesisName,
  nemesisOn,
  nemesisStrengthMult,
  opponents,
  protectedOrNemesisRoutes,
  routeProtected,
  siegeOdds,
  siegePower,
  siegeWave,
  spawnNemesis,
  startSiege,
  type Nemesis,
} from "./warfare";
import { perkText, achIcon, compPortrait, crestHtml, heroPortrait, itemName, matsHtml, nemesisPortrait, wonderUrl, cityModalBody, cityThumb, goalText, goodsName, icon, milestoneText, portrait, rewardText, stars, type ModalButton, modalOpen, offlineSummary, routeLabel, showModal, Toasts, UI, type GameApi } from "./ui";

class Game implements GameApi {
  s: GameState;
  buyMode: BuyMode = 1;
  map: MapView;
  ui: UI;
  toasts = new Toasts();
  events: EventManager;
  orders = new OrderManager(Date.now());
  private last = performance.now();
  private drawSkip = false;
  private paused = false;
  private saveTimer = 0;
  private tut4Since = 0;
  private trips: TripEvent[] = [];
  journey: JourneyController;

  constructor(s: GameState) {
    this.s = s;
    setLang(s.settings.lang);
    setNotation(s.settings.notation);
    setMuted(s.settings.muted);
    this.map = new MapView(document.getElementById("map") as HTMLCanvasElement);
    this.ui = new UI(this);
    this.events = new EventManager(Date.now());
    const game = this;
    this.journey = new JourneyController({
      get s() {
        return game.s;
      },
      toasts: this.toasts,
      map: this.map,
      income: () => this.income(),
      save: () => this.save(),
      dirty: () => (this.ui.dirty = true),
      canAd: () => this.canWatchAd(),
      runAd: () => this.runAd(),
    });
    restoreMarket(s.marketPrices);
    this.map.onTap = (x, y) => this.onMapClick(x, y);
    this.map.onHold = (route) => this.holdRoute(route);
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
    setMusicEnabled(s.settings.music);
    const unlock = () => {
      unlockAudio();
      startMusic();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
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
    showModal(t("welcomeBack"), body, buttons, { icon: icon("coins"), dismissable: false });
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
      const pace = now < this.hornUntil ? 2 : 1;
      if (this.whip >= 0) {
        this.whipHeat -= dt;
        if (this.whipHeat <= 0) {
          this.whip = -1;
          this.whipHeat = 0;
          this.map.whipRoute = -1;
          if (!this.hornOffered) {
            this.hornOffered = true;
            this.offerHorn();
          }
        }
      } else this.whipHeat = Math.min(5, this.whipHeat + dt * 0.45);
      step(this.s, dt, now, this.trips, pace, this.whipHeat > 0 ? this.whip : -1);
      if (this.trips.length > 0) {
        let anyCoin = false;
        for (const tr of this.trips) {
          const done = this.orders.onTrip(tr.route, tr.trips, now);
          if (done) this.completeOrder(done);
          this.map.addFloater(tr.route, tr.amount, nowPerf, !this.s.masters[tr.route]);
          if (!this.s.masters[tr.route]) anyCoin = true;
        }
        if (anyCoin) sfx.coin();
      }
      const spawned = this.events.update(this.s, now, (e) => this.onEventExpire(e), (o) => protectedOrNemesisRoutes(this.s, o));
      if (spawned) {
        const nem = spawned.kind === "bandit" ? nemesisOn(this.s, spawned.route) : undefined;
        if (nem && (nem.calm ?? 0) < now && (routeProtected(this.s, spawned.route) || Math.random() < 0.45)) {
          spawned.boss = nem.id;
          spawned.life = 18_000;
          this.toasts.show(`${nemesisPortrait(nem.look, "ico face")} ${t("nemAppears", { name: nemesisName(nem), good: goodsName(spawned.route) })}`, "bad", 4500);
        }
        sfx.event();
      }
      this.warTick(now, dt);
      this.tutorialTick(now);
      this.unlockTick();
      if (isOpen(this.s, "journey")) this.journey.tick(dt, now);
      this.chronicleTick();
      this.cityTick(now);
      this.worldTick(now);
      this.dailyTick(now);
      this.achievementTick(nowPerf);
      this.banterTick(nowPerf);
      this.empireTick(now, dt);
      this.heroTick();
      this.saveTimer += dt;
      if (this.saveTimer > 10) {
        this.saveTimer = 0;
        this.save();
      }
    }
    if (!modalOpen() || (this.drawSkip = !this.drawSkip)) this.map.draw(this.s, this.events.list, nowPerf);
    this.ui.update(nowPerf, this.tutorialHighlight(), this.tutorialTab());
    requestAnimationFrame((t) => this.frame(t));
  }

  save(): void {
    this.s.marketPrices = marketPrices();
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
    else if (hit.type === "traveler") this.openQuest();
    else if (hit.type === "city") this.openCity(hit.id);
    else if (hit.type === "wonder") this.openWonder(hit.id);
    else if (hit.type === "fort") this.openFort(hit.id);
    else if (hit.type === "monument") this.openMonument();
    else if (hit.type === "titan") this.hitTitan();
    else if (hit.type === "tradewar") this.openTradeWar();
    else if (hit.type === "kurgan") this.openKurgan();
    else if (hit.type === "han") this.openHan(hit.route);
    else if (hit.type === "camp") this.migrateCamp();
    else if (hit.type === "storm") this.catchSilk(hit.id);
    else if (hit.type === "rival") this.catchRival();
    else if (hit.type === "court") this.openCourt();
    else if (hit.type === "node") this.tapNode(hit.k);
    else if (hit.type === "region") this.openRegion(hit.k);
    else if (hit.type === "merchant") this.openMerchant();
    else if (hit.type === "journey") this.openJourney();
    else this.claimEvent(hit.id);
  }

  get order(): Order | null {
    return this.orders.order;
  }

  private nextAchCheck = 0;

  private achievementTick(nowPerf: number): void {
    if (nowPerf < this.nextAchCheck) return;
    this.nextAchCheck = nowPerf + 1000;
    const got = newAchievements(this.s);
    got.forEach((a, k) => {
      window.setTimeout(() => {
        sfx.fanfare();
        this.toasts.show(`${achIcon(a.icon)} ${t("achToast", { name: tk("ach_" + a.id) })}`, "gold", 3800);
      }, k * 900);
    });
    if (got.length > 0) {
      happytime();
      this.ui.dirty = true;
      this.save();
    }
  }

  private dailyChecked = false;

  private dailyTick(now: number): void {
    const s = this.s;
    if (this.dailyChecked || s.tutorial < 5 || modalOpen() || this.calm(now)) return;
    this.dailyChecked = true;
    const key = (t: number) => {
      const d = new Date(t);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    };
    const today = key(now);
    if (s.daily.last === today) return;
    const streak = s.daily.last === key(now - 86_400_000) ? (s.daily.streak % 7) + 1 : 1;
    const income = Math.max(totalIncomePerSec(s, now, false, false), 5);
    const gold = Math.max(500, income * 60 * streak);
    const cells = Array.from({ length: 7 }, (_, k) => {
      const n = k + 1;
      const cls = n < streak ? "done" : n === streak ? "today" : "";
      const label =
        n === 7
          ? `${icon("crown")}<small>${t("dailyFavor")} · ${icon("sefer", "ico xs")}</small>`
          : n === 5
            ? `${icon("mat_steel")}<small>x${n} · +5</small>`
            : n === 3
              ? `${icon("mat_iron")}<small>x${n} · +20</small>`
              : `${icon("coins")}<small>x${n}</small>`;
      return `<div class="dcell ${cls}"><b>${t("dailyDay", { n })}</b>${label}</div>`;
    }).join("");
    const extra = streak === 7 ? `${icon("mat_steel", "ico xs")} +10 · ${t("dailyTicket")}` : streak === 5 ? `${icon("mat_steel", "ico xs")} +5 ${t("dailySteel")}` : streak === 3 ? `+20 ${t("dailyMats")}` : "";
    showModal(t("dailyTitle"), `<p>${t("dailyDesc")}</p><div class="daily">${cells}</div><div class="bigGold">+${fmt(gold)}</div>${extra ? `<p class="boostLine">${extra}</p>` : ""}`, [
      {
        label: t("dailyClaim"),
        cls: "primary",
        onClick: () => {
          s.daily = { last: today, streak };
          earn(s, gold);
          if (streak === 7) {
            s.favorUntil = Math.max(s.favorUntil, Date.now()) + 30 * 60_000;
            s.mats.steel += 10;
            s.expTickets = Math.min(EXP_TICKETS + 1, s.expTickets + 1);
          }
          if (streak === 5) s.mats.steel += 5;
          if (streak === 3) {
            s.mats.iron += 20;
            s.mats.leather += 20;
            s.mats.wood += 20;
          }
          sfx.fanfare();
          sfx.coin();
          this.toasts.show("+" + fmt(gold), "gold");
          this.save();
        },
      },
    ], { icon: icon("crown"), dismissable: false });
  }

  private lastSeason: Season | null = null;

  private worldTick(now: number): void {
    const { season } = seasonAt(now);
    this.map.season = season;
    setMusicSeason(season);
    if (this.lastSeason && this.lastSeason !== season && this.s.tutorial >= 5) {
      sfx.event();
      this.toasts.show(t("seasonChange", { name: tk("season_" + season), fx: tk("seasonFx_" + season) }), "gold", 4000);
    }
    this.lastSeason = season;
    const r = this.orders.update(this.s, now);
    if (r.spawned) {
      const o = r.spawned;
      sfx.event();
      this.toasts.show(t("orderNew", { city: tk("city_" + o.city), goods: goodsName(o.route), n: o.need, t: fmtTime((o.deadline - now) / 1000) }), "gold", 4000);
    }
    if (r.failed) this.toasts.show(t("orderFail", { city: tk("city_" + r.failed.city) }), "info", 2200);
    this.map.order = this.orders.order;
  }

  private completeOrder(o: Order): void {
    const reward = o.reward * merchantMult(this.s);
    earn(this.s, reward);
    sfx.fanfare();
    sfx.coin();
    happytime();
    const p = this.map.eventPoint({ id: 0, kind: "merchant", route: o.route, t: 0, city: o.city, born: 0, life: 1 });
    this.map.addTextAt(p, "+" + fmt(reward), "#ffe08a", performance.now());
    this.toasts.show(t("orderDone", { city: tk("city_" + o.city), g: fmt(reward) }), "gold", 3200);
    this.s.stats.orders++;
  }

  private announcedChapter = -1;
  private doneAnnounced = -1;

  private chronicleTick(): void {
    const s = this.s;
    const ch = s.tutorial >= 5 ? chapterAvailable(s) : null;
    if (!ch) {
      this.map.traveler = null;
      return;
    }
    const done = goalDone(s, ch);
    this.map.traveler = !s.chronicle.accepted || done ? { id: ch.traveler, city: ch.city, ready: done } : null;
    if (!s.chronicle.accepted && this.announcedChapter !== s.chronicle.done) {
      this.announcedChapter = s.chronicle.done;
      sfx.event();
      this.toasts.show(t("questArrived", { name: travelerName(ch.traveler), city: tk("city_" + ch.city) }), "gold", 3500);
    }
    if (done && this.doneAnnounced !== s.chronicle.done) {
      this.doneAnnounced = s.chronicle.done;
      sfx.fanfare();
      this.toasts.show(t("questDoneToast", { name: travelerName(ch.traveler) }), "good", 3000);
    }
  }

  openQuest(): void {
    const s = this.s;
    const ch = currentChapter(s);
    if (!ch || this.paused) return;
    const name = travelerName(ch.traveler);
    const title = `${name} <small class="chap">${t("chapterN", { n: s.chronicle.done + 1 })}</small>`;
    const goalRow = `<div class="qrow"><span>${t("questGoal")}</span><b>${goalText(ch)}</b></div>`;
    const rewardRow = (gold: number) =>
      `<div class="qrow"><span>${t("questReward")}</span><b>${rewardText(ch)}${gold > 0 ? `<br>${t("rewardGold", { g: fmt(gold) })}` : ""}</b></div>`;
    const bonusGold = () => (ch.bonusSec > 0 ? Math.max(100, totalIncomePerSec(s, Date.now())) * ch.bonusSec : 0);
    const portraitHtml = portrait(ch.traveler, "portrait big");
    if (!s.chronicle.accepted) {
      showModal(title, `<p class="story">${story(ch).intro}</p>${goalRow}${rewardRow(0)}`, [
        { label: t("questLater"), cls: "secondary same" },
        {
          label: t("questAccept"),
          cls: "primary same",
          onClick: () => {
            acceptChapter(s);
            sfx.coin();
            this.save();
          },
        },
      ], { icon: portraitHtml });
      return;
    }
    if (goalDone(s, ch)) {
      const gold = bonusGold();
      showModal(title, `<p class="story">${story(ch).done}</p>${rewardRow(gold)}`, [
        {
          label: t("questClaim"),
          cls: "primary",
          onClick: () => {
            completeChapter(s);
            if (gold > 0) earn(s, gold);
            sfx.fanfare();
            sfx.coin();
            happytime();
            this.toasts.show(rewardText(ch), "gold", 3500);
            this.ui.dirty = true;
            this.save();
          },
        },
      ], { icon: portraitHtml, dismissable: false });
      return;
    }
    const pct = Math.round((goalValue(s, ch) / ch.goal.n) * 100);
    showModal(title, `<p class="story">${story(ch).intro}</p>${goalRow}<div class="qbar big"><i style="width:${pct}%"></i></div>${rewardRow(0)}`, [
      { label: t("close"), cls: "primary" },
    ], { icon: portraitHtml });
  }

  private storyArt(art: string): string {
    if (art.startsWith("c:")) return compPortrait(art.slice(2), "storyart face");
    if (art.startsWith("t:")) return portrait(art.slice(2) as TravelerId, "storyart face");
    return `<div class="storyart">${achIcon(art)}</div>`;
  }

  private outcomeHint(c: Choice, income: number): string {
    const lang = this.s.settings.lang;
    const parts: string[] = [];
    for (const o of c.win) {
      if (o.kind === "gold") parts.push(`+${fmt(outcomeGold(o, this.s, income))}`);
      else if (o.kind === "cost") parts.push(`−${fmt(outcomeGold(o, this.s, income))}`);
      else if (o.kind === "boost") parts.push(`x${o.mult} ${fmtTime(o.sec * compMult.story(this.s))}`);
      else if (o.kind === "recruit") parts.push(t("hintCompanion"));
      else if (o.kind === "steel") parts.push(`+${o.n} ${t("steelShort")}`);
    }
    let h = parts.join(" · ");
    if (c.chance !== undefined) h = `%${Math.round(c.chance * 100)} · ${h || "?"}`;
    const req = c.requires ? `${compPortrait(c.requires, "ico face")} ` : "";
    const label = c.label[lang];
    return `${req}${label}${h ? `<small class="hint">${h}</small>` : ""}`;
  }

  private openStory(given?: Story): void {
    const s = this.s;
    const st = given ?? pickStory(s);
    if (!st) return;
    const lang = s.settings.lang;
    const income = Math.max(1, totalIncomePerSec(s, Date.now(), false, false));
    sfx.event();
    const choices = availableChoices(s, st);
    showModal(
      st.title[lang],
      `<div class="story">${this.storyArt(st.art)}<p>${st.text[lang]}</p></div>`,
      choices.map((c) => ({ label: this.outcomeHint(c, income), cls: "choice" + (c.requires ? " special" : ""), onClick: () => this.resolveStory(st, c, income) })),
      { dismissable: false },
    );
  }

  private resolveStory(st: Story, c: Choice, income: number): void {
    const s = this.s;
    const lang = s.settings.lang;
    const now = Date.now();
    const win = c.chance === undefined || Math.random() < c.chance;
    const list = win ? c.win : (c.lose ?? []);
    const before = s.gold;
    applyOutcomes(s, list, income, now, (n) => earn(s, n));
    s.storiesSeen.push(st.id);
    if (s.storiesSeen.length > 40) s.storiesSeen.shift();
    s.stats.stories++;
    const delta = s.gold - before;
    const lines: string[] = [];
    if (Math.abs(delta) >= 1) lines.push(`<div class="bigGold${delta < 0 ? " neg" : ""}">${delta > 0 ? "+" : "−"}${fmt(Math.abs(delta))}</div>`);
    for (const o of list) {
      if (o.kind === "boost") lines.push(`<p class="boostLine">${t("storyBoost", { x: o.mult, t: fmtTime(o.sec * compMult.story(s)) })}</p>`);
      if (o.kind === "steel") lines.push(`<p class="boostLine">${icon("mat_steel")} +${o.n}</p>`);
      if (o.kind === "recruit") lines.push(`<div class="story">${compPortrait(o.id, "storyart face")}</div><p class="boostLine">${t("compJoined", { name: compText(o.id, lang).name })}</p>`);
    }
    if (win) {
      sfx.fanfare();
      if (list.length) happytime();
    } else sfx.error();
    const text = win ? c.winText[lang] : (c.loseText?.[lang] ?? "");
    showModal(win ? st.title[lang] : t("storyFail"), `<p>${text}</p>${lines.join("")}`, [{ label: t("storyContinue"), cls: "primary" }]);
    this.ui.dirty = true;
    this.save();
  }

  private nextBanter = performance.now() + 90_000;

  private banterTick(nowPerf: number): void {
    if (nowPerf < this.nextBanter) return;
    this.nextBanter = nowPerf + 110_000 + Math.random() * 70_000;
    const list = recruited(this.s);
    if (list.length === 0 || modalOpen() || document.hidden) return;
    const id = list[Math.floor(Math.random() * list.length)];
    const txt = compText(id, this.s.settings.lang);
    const line = txt.lines[Math.floor(Math.random() * txt.lines.length)];
    this.toasts.show(`${compPortrait(id, "ico face")} <b>${txt.name.split(" ").pop()}:</b> “${line}”`, "info", 5200);
  }

  upgradeCompanion(id: CompanionId): void {
    const s = this.s;
    const lv = compLevel(s, id);
    if (lv <= 0 || lv >= COMPANION_MAX) return;
    const cost = compUpgradeCost(lv, totalIncomePerSec(s, Date.now(), false, false));
    if (s.gold < cost) {
      sfx.error();
      return;
    }
    s.gold -= cost;
    s.companions[id] = lv + 1;
    sfx.fanfare();
    this.toasts.show(`${compPortrait(id, "ico face")} ${t("compPromoted", { name: compText(id, s.settings.lang).name, n: lv + 1 })}`, "gold", 3000);
    this.ui.dirty = true;
    this.save();
  }

  private ageNotified = -1;
  private rivalsNoticed = new Set<string>();

  private empireTick(now: number, dt: number): void {
    const s = this.s;
    s.runSeconds += Math.min(dt, 1);
    const shock = marketTick(s, now, (route) => {
      const r = rivalForRoute(s, route);
      return r ? r.id : undefined;
    });
    if (shock) {
      const p = this.map.eventPoint({ id: 0, kind: "bandit", route: shock.route, t: 0.5, born: 0, life: 1 });
      const good = goodsName(shock.route);
      if (shock.kind === "boom") {
        sfx.event();
        this.map.addTextAt(p, `x${shock.mult}!`, "#7dff9a", performance.now());
        this.toasts.show(`📈 ${t("newsBoom", { city: tk("city_" + ROUTES[shock.route].to), good, x: shock.mult })}`, "gold", 5000);
        this.startSilkStorm(shock.route, now);
      } else {
        this.map.addTextAt(p, `x${shock.mult}`, "#ff7a5c", performance.now());
        const msg = shock.rival ? t("newsBustRival", { rival: tk("rival_" + shock.rival), good }) : t("newsBust", { good });
        this.toasts.show(`📉 ${msg}`, "bad", 4500);
      }
      this.ui.dirty = true;
    }
    for (const r of RIVALS) {
      if (rivalBeaten(s, r.id)) continue;
      const active = r.routes.some((i) => s.routes[i].owned > 0);
      if (!active) continue;
      if (!this.rivalsNoticed.has(r.id)) {
        this.rivalsNoticed.add(r.id);
        if (s.tutorial >= 5) this.toasts.show(`⚔ ${t("rivalNoticed", { rival: tk("rival_" + r.id) })}`, "info", 4200);
      }
      const w = rivalWealth(s, r);
      if (s.runEarned >= w) this.beatRival(r, w);
    }
    if (this.ageNotified !== s.age && canAdvanceAge(s)) {
      this.ageNotified = s.age;
      const a = nextAge(s)!;
      sfx.event();
      this.toasts.show(`${icon("age_" + a.id)} ${t("ageReady", { age: tk("age_" + a.id) })}`, "gold", 5000);
    }
  }

  private beatRival(r: RivalDef, wealth: number): void {
    const s = this.s;
    s.rivalsBeaten.push(r.id);
    const loot = wealth * 0.25;
    earn(s, loot);
    sfx.sword();
    sfx.fanfare();
    happytime();
    const goods = r.routes.map((i) => goodsName(i)).join(", ");
    showModal(
      t("rivalBeatenTitle"),
      `<div class="rivalCrest" style="--rc:${r.color}">${icon("swords")}</div><p>${t("rivalBeatenText", { rival: tk("rival_" + r.id) })}</p><div class="bigGold">+${fmt(loot)}</div><p class="boostLine">${t("rivalBonus", { goods, x: RIVAL_ROUTE_BONUS })}</p>`,
      [{ label: t("storyContinue"), cls: "primary" }],
    );
    this.ui.dirty = true;
    this.save();
  }

  advanceAge(): void {
    const s = this.s;
    const a = nextAge(s);
    if (!a) return;
    const cost = ageCost(s, a);
    if (!ageReqsMet(s, a) || s.gold < cost) {
      sfx.error();
      return;
    }
    s.gold -= cost;
    s.age++;
    sfx.fanfare();
    window.setTimeout(() => sfx.fanfare(), 450);
    happytime();
    const wrap = document.getElementById("mapWrap")!;
    wrap.classList.remove("ageflash");
    void wrap.offsetWidth;
    wrap.classList.add("ageflash");
    const w = WONDERS.find((x) => x.age === s.age);
    showModal(
      t("ageEntered", { age: tk("age_" + a.id) }),
      `<div class="ageEmblem">${icon("age_" + a.id)}</div><p class="ageQuote">${tk("ageQuote_" + a.id)}</p><p class="boostLine">${t("ageBonus", { x: a.mult })}</p>${w ? `<p class="muted">${t("ageUnlocksWonder", { w: tk("wonder_" + w.id), city: tk("city_" + w.city) })}</p>` : ""}`,
      [{ label: t("storyContinue"), cls: "primary" }],
    );
    if (w) this.map.flyToCity(w.city);
    this.bard("age", { age: tk("age_" + a.id) });
    this.ui.dirty = true;
    this.save();
  }

  buildWonder(id: string): void {
    const s = this.s;
    const w = WONDERS.find((x) => x.id === id);
    if (!w) return;
    if (!canBuildWonder(s, w)) {
      this.openWonder(id);
      return;
    }
    s.gold -= wonderCost(s, w);
    s.wonders[id] = wonderStage(s, id) + 1;
    const st = s.wonders[id];
    sfx.fanfare();
    happytime();
    this.map.celebrateCity(w.city, performance.now());
    if (st >= WONDER_STAGES) {
      showModal(
        t("wonderDone", { w: tk("wonder_" + id) }),
        `<div class="story"><img class="wonderBig" src="${wonderUrl(id)}" alt=""></div><p class="ageQuote">${tk("wonderQuote_" + id)}</p><p class="boostLine">${t("wonderDoneBonus", { x: (WONDER_STAGE_MULT ** 3 * WONDER_DONE_MULT).toFixed(2) })}</p>`,
        [{ label: t("storyContinue"), cls: "primary" }],
      );
    } else {
      this.toasts.show(t("wonderStage", { w: tk("wonder_" + id), n: st, m: WONDER_STAGES }), "gold", 3500);
    }
    this.ui.dirty = true;
    this.save();
  }

  openWonder(id: string): void {
    const s = this.s;
    const w = WONDERS.find((x) => x.id === id);
    if (!w) return;
    const st = wonderStage(s, id);
    const body = `<div class="story"><img class="wonderBig${st === 0 ? " ghost" : ""}" src="${wonderUrl(id)}" alt=""></div><p>${tk("wonderDesc_" + id)}</p><p class="boostLine">${t("wonderPerStage", { x: WONDER_STAGE_MULT, d: WONDER_DONE_MULT })}</p><p class="muted">${t("wonderProgress", { n: st, m: WONDER_STAGES })}</p>`;
    const buttons: ModalButton[] = [{ label: t("close"), cls: "secondary same" }];
    if (st < WONDER_STAGES) {
      if (s.age < w.age) buttons.push({ label: t("wonderNeedsAge", { age: tk("age_" + AGES[w.age].id) }), cls: "primary same" });
      else buttons.push({ label: `${t("wonderBuild")} · ${fmt(wonderCost(s, w))}`, cls: "primary same", onClick: () => this.buildWonder(id) });
    }
    showModal(tk("wonder_" + id), body, buttons);
  }

  fastShip(i: number): void {
    const s = this.s;
    const now = Date.now();
    const sh = currentShock(now);
    if (!sh || sh.kind !== "boom" || sh.route !== i || sh.used) return;
    sh.used = true;
    const gold = Math.max(100, routeIncomePerSec(s, i, now) * 45);
    earn(s, gold);
    s.stats.booms++;
    sfx.coin();
    sfx.fanfare();
    const p = this.map.eventPoint({ id: 0, kind: "bandit", route: i, t: 0.5, born: 0, life: 1 });
    this.map.addTextAt(p, "+" + fmt(gold), "#7dff9a", performance.now());
    this.toasts.show(t("fastShipDone", { g: fmt(gold) }), "gold", 3000);
  }

  openHouse(): void {
    const s = this.s;
    let name = s.house?.name ?? "";
    let symbol = s.house?.symbol ?? CREST_SYMBOLS[0];
    let color = s.house?.color ?? 0;
    const body = `<p>${t("houseIntro")}</p><input id="houseName" maxlength="22" placeholder="${t("housePlaceholder")}" value="${name.replace(/"/g, "")}"><div class="pick" id="pickSym">${CREST_SYMBOLS.map((k) => `<button data-v="${k}" class="${k === symbol ? "on" : ""}">${icon(k)}</button>`).join("")}</div><div class="pick" id="pickCol">${CREST_COLORS.map((c, k) => `<button data-v="${k}" class="${k === color ? "on" : ""}" style="background:${c}"></button>`).join("")}</div><div class="crestPreview" id="crestPrev"></div>`;
    showModal(t("houseTitle"), body, [
      { label: t("cancel"), cls: "secondary same" },
      {
        label: t("houseSave"),
        cls: "primary same",
        onClick: () => {
          const n = name.trim() || t("houseDefault");
          s.house = { name: n.slice(0, 22), symbol, color };
          sfx.fanfare();
          this.ui.dirty = true;
          this.save();
        },
      },
    ]);
    const root = document.getElementById("modal")!;
    const prev = root.querySelector<HTMLElement>("#crestPrev")!;
    const draw = () => (prev.innerHTML = crestHtml({ name: name || t("houseDefault"), symbol, color }, "crest big") + `<b>${(name || t("houseDefault")).replace(/</g, "")}</b>`);
    draw();
    root.querySelector<HTMLInputElement>("#houseName")!.addEventListener("input", (e) => {
      name = (e.target as HTMLInputElement).value;
      draw();
    });
    root.querySelectorAll<HTMLButtonElement>("#pickSym button").forEach((b) =>
      b.addEventListener("click", () => {
        symbol = b.dataset.v!;
        root.querySelectorAll("#pickSym button").forEach((x) => x.classList.toggle("on", x === b));
        draw();
      }),
    );
    root.querySelectorAll<HTMLButtonElement>("#pickCol button").forEach((b) =>
      b.addEventListener("click", () => {
        color = parseInt(b.dataset.v!, 10);
        root.querySelectorAll("#pickCol button").forEach((x) => x.classList.toggle("on", x === b));
        draw();
      }),
    );
  }

  private chooseHeir(n: number): void {
    const s = this.s;
    const heirs = heirChoices(s);
    showModal(
      t("heirTitle"),
      `<p>${t("heirIntro", { ruler: rulerTitle(s, s.ruler) })}</p>`,
      heirs.map((h) => ({
        label: `<b>${h.name}</b><small class="hint">${tk("trait_" + h.trait)} · ${tk("traitDesc_" + h.trait)}</small>`,
        cls: "choice",
        onClick: () => this.crown(h, n),
      })),
      { dismissable: false },
    );
  }

  private crown(heir: Ruler, n: number): void {
    const s = this.s;
    s.lineage.push({ ...s.ruler, best: s.runEarned, age: s.age, ...(s.spouse ? { spouse: s.spouse } : {}) });
    if (s.lineage.length > 40) s.lineage.shift();
    s.ruler = heir;
    resetForDynasty(s, n);
    resetMarket(Date.now());
    this.rivalsNoticed.clear();
    this.ageNotified = -1;
    this.events.clear();
    this.orders.clear(Date.now());
    this.ui.dirty = true;
    sfx.fanfare();
    happytime();
    this.save();
    showModal(
      t("crownTitle", { ruler: rulerTitle(s, heir) }),
      `<div class="ageEmblem">${s.house ? crestHtml(s.house, "crest big") : icon("seal")}</div><p class="ageQuote">${t("crownText", { gen: heir.gen })}</p><p class="boostLine">${tk("trait_" + heir.trait)}: ${tk("traitDesc_" + heir.trait)}</p>`,
      [{ label: t("storyContinue"), cls: "primary", onClick: () => (!s.house ? this.openHouse() : undefined) }],
    );
  }

  private claimEvent(id: number): void {
    const e = this.events.remove(id);
    if (!e) return;
    if (e.kind === "story") {
      this.openStory();
      return;
    }
    const now = Date.now();
    const income = Math.max(totalIncomePerSec(this.s, now), 1);
    const p = this.map.eventPoint(e);
    if (e.kind === "bandit") {
      this.battle(e, true);
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
    if (e.kind === "bandit") this.battle(e, false);
  }

  private battle(e: MapEvent, withHero: boolean): void {
    const s = this.s;
    const now = Date.now();
    const nowPerf = performance.now();
    const p = this.map.eventPoint(e);
    const boss = nemesisById(s, e.boss);
    const res = boss ? fight(s, e.route, withHero, nemesisStrengthMult(boss), 3 + boss.level * 0.5) : fight(s, e.route, withHero);
    s.stats.battles++;
    sfx.sword();
    if (res.lost > 0) this.map.addTextAt({ x: p.x, y: p.y + 22 }, t("fallenTag", { n: res.lost }), "#ff8a6a", nowPerf);
    const lostTxt = this.casualtyText(res);
    if (res.win) {
      const income = Math.max(totalIncomePerSec(s, now), 1);
      const bounty = Math.max(25, income * 20) * bountyMult(s) * seasonBountyMult(now) * (withHero ? 1 : 0.5) * (boss ? 4 + boss.level : 1);
      earn(s, bounty);
      s.stats.bandits++;
      sfx.coin();
      this.map.addTextAt(p, "+" + fmt(bounty), "#ffd75e", nowPerf);
      if (boss) {
        const steel = 2 + boss.level;
        s.mats.steel += steel;
        res.loot.steel = (res.loot.steel ?? 0) + steel;
      }
      this.map.addLoot(p, Object.keys(res.loot).map((m) => "mat_" + m).concat(res.chest ? ["chest"] : []), nowPerf);
      const lootTxt = matsHtml(res.loot);
      if (!boss) this.seasonPts("bandit");
      if (boss) this.slayNemesis(boss, bounty, lootTxt);
      else this.toasts.show(`${t(withHero ? "battleWin" : "battleWinAuto", { g: fmt(bounty) })} ${lootTxt}${lostTxt}`, "good", 3800);
      if (res.chest) {
        sfx.fanfare();
        this.toasts.show(`${icon("chest")} ${t("chestFound")}`, "gold", 4000);
        this.dropRelic(0.08);
      }
      const ups = gainXp(s, res.xp);
      if (ups > 0 && s.hero) {
        sfx.fanfare();
        happytime();
        this.toasts.show(`${heroPortrait(s.hero.look, "ico face")} ${t("heroLevelUp", { name: s.hero.name, n: s.hero.level })}`, "gold", 4200);
      }
      if (!boss && withHero && Math.random() < 0.04) this.riseNemesis(e.route, "nemRevengeText");
    } else {
      const stolen = Math.min(s.gold, Math.max(10, routeIncomePerSec(s, e.route, now) * 20) * (boss ? 2 : 1));
      s.gold -= stolen;
      sfx.error();
      this.map.addTextAt(p, "−" + fmt(stolen), "#ff7a5c", nowPerf);
      if (boss) {
        boss.level = Math.min(MAX_NEMESIS_LEVEL, boss.level + 1);
        boss.wins++;
        const taunt = tk("nemTaunt_" + ((boss.wins + boss.look) % NEMESIS_TAUNTS));
        this.toasts.show(`${nemesisPortrait(boss.look, "ico face")} <b>${nemesisName(boss)}</b>: “${taunt}” · ${t("nemStronger", { n: boss.level })} · −${fmt(stolen)}${lostTxt}`, "bad", 5200);
        if (withHero && heroMayFall(s)) this.heroFalls(nemesisName(boss));
      } else {
        const key = withHero ? "battleLose" : (s.escorts[e.route] ?? 0) + res.lost > 0 ? "battleLoseAuto" : "battleNoGuards";
        this.toasts.show(`${t(key, { g: fmt(stolen), good: goodsName(e.route) })}${lostTxt}`, "bad", 4200);
        if (Math.random() < 0.5) this.riseNemesis(e.route, "nemRiseText");
      }
    }
    if (this.ui.tab === "army") this.ui.dirty = true;
  }

  private casualtyText(res: BattleResult): string {
    if (res.lost <= 0) return "";
    return ` · ${t("casualties", { d: res.dead, w: res.wounded })}`;
  }

  private riseNemesis(route: number, textKey: "nemRiseText" | "nemRevengeText"): void {
    const s = this.s;
    if (!s.hero || s.tutorial < 5) return;
    const n = spawnNemesis(s, route);
    if (!n) return;
    sfx.event();
    const name = nemesisName(n);
    if (modalOpen()) {
      this.toasts.show(`${nemesisPortrait(n.look, "ico face")} ${t("nemRiseToast", { name })}`, "bad", 5000);
      return;
    }
    showModal(
      t("nemRiseTitle"),
      `<div class="nemHead">${nemesisPortrait(n.look, "nemFace")}<div><h3>${name}</h3><small>${t("nemLevel", { n: n.level })} · ${goodsName(route)}</small></div></div><p>${t(textKey, { name, good: goodsName(route) })}</p><p class="ageQuote">“${tk("nemTaunt_" + (n.look % NEMESIS_TAUNTS))}”</p>`,
      [{ label: t("nemAccept"), cls: "primary", onClick: () => undefined }],
      { icon: icon("wanted") },
    );
  }

  private slayNemesis(n: Nemesis, bounty: number, lootTxt: string): void {
    const s = this.s;
    s.nemeses = s.nemeses.filter((x) => x.id !== n.id);
    s.stats.nemesisSlain++;
    this.seasonPts("nemesis");
    this.dropRelic(0.3);
    sfx.fanfare();
    happytime();
    const name = nemesisName(n);
    showModal(
      t("nemSlainTitle"),
      `<div class="nemHead slain">${nemesisPortrait(n.look, "nemFace")}<div><h3>${name}</h3><small>${t("nemLevel", { n: n.level })}</small></div></div><p>${t("nemSlainText", { name })}</p><div class="bigGold">+${fmt(bounty)}</div><p class="boostLine">${lootTxt}</p>`,
      [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }],
      { icon: icon("wanted") },
    );
    this.bard("nemesis", { name });
    this.save();
  }

  private healAcc = { v: 0 };

  private warTick(now: number, dt: number): void {
    const s = this.s;
    healTick(s, dt, this.healAcc);
    if (s.siege && now >= s.siege.next) this.siegeStep();
    if (refreshContracts(s, now)) this.ui.dirty = true;
    if (rollSeason(s, now)) this.ui.dirty = true;
    this.titanTick(now, dt);
    this.tradeWarTick(now);
    if (rollRaid(s, now) && this.ui.tab === "army") this.ui.dirty = true;
    this.campTick(now);
    this.hanTick(now);
    this.stormTick(now);
    this.rivalTick(now, dt);
    this.courtTick(now);
    this.provinceTick(now, dt);
    if (rollExpTickets(s, now) && this.ui.tab === "army") this.ui.dirty = true;
    this.festTick(now);
    if (!modalOpen()) {
      if (this.pendingRelics.length > 0) this.showRelic(this.pendingRelics.shift()!);
      else this.letterTick(now);
    }
    if (!modalOpen() && this.bardQueue.length > 0 && !this.bardShowing && Date.now() >= this.bardNext) {
      this.bardNext = Date.now() + 25_000;
      this.showBard(this.bardQueue.shift()!);
    }
    arenaTickets(s, now);
    const season = closeSeason(s, now);
    if (season) {
      sfx.fanfare();
      this.toasts.show(`${icon("trophy")} ${t("seasonEnd", { r: season.rank, n: season.steel })}`, "gold", 6000);
      this.ui.dirty = true;
    }
  }

  private siegeStep(): void {
    const s = this.s;
    const sg = s.siege!;
    const f = fortDef(sg.fort)!;
    const r = siegeWave(s);
    if (!r) {
      s.siege = null;
      return;
    }
    const nowPerf = performance.now();
    const p = this.map.fortPoint(f.route);
    this.map.siegeShot(f.route, true, nowPerf);
    sfx.sword();
    this.map.addTextAt(p, r.hit ? t("siegeHit") : t("siegeMiss"), r.hit ? "#ffd75e" : "#ff8a6a", nowPerf);
    if (r.lost > 0) this.map.addTextAt({ x: p.x, y: p.y + 20 }, t("fallenTag", { n: r.lost }), "#ff8a6a", nowPerf);
    if (r.done === "taken") {
      s.siege = null;
      s.fortsTaken.push(f.id);
      s.stats.forts++;
      this.seasonPts("fort");
      this.bard("fort", { fort: tk("fort_" + f.id) });
      const k = FORTS.indexOf(f);
      const gold = Math.max(1000, totalIncomePerSec(s, Date.now(), false, false) * 900 * (1 + k));
      earn(s, gold);
      const loot = fortLoot(s, f);
      this.map.addLoot(p, Object.keys(loot).map((m) => "mat_" + m), nowPerf);
      this.dropRelic(0.6);
      sfx.fanfare();
      sfx.coin();
      happytime();
      showModal(
        t("fortTakenTitle"),
        `<div class="ageEmblem">${icon("fortress", "ico big")}</div><p>${t("fortTakenText", { fort: tk("fort_" + f.id), a: goodsName(Math.max(0, f.route - 1)), b: goodsName(f.route) })}</p><div class="bigGold">+${fmt(gold)}</div><p class="boostLine">${matsHtml(loot)}</p>`,
        [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }],
      );
      this.save();
    } else if (r.done === "failed") {
      const back = sg.troops;
      s.siege = null;
      sfx.error();
      this.toasts.show(`${icon("fortress")} ${t("siegeFailed", { fort: tk("fort_" + f.id), n: back })}`, "bad", 5000);
    } else {
      this.toasts.show(`${icon("fortress")} ${t(r.hit ? "siegeWaveHit" : "siegeWaveMiss", { w: FORT_WALLS - sg.walls, m: FORT_WALLS })}`, r.hit ? "good" : "bad", 2600);
    }
    this.ui.dirty = true;
  }

  openFort(id: string): void {
    const s = this.s;
    const f = fortDef(id);
    if (!f) return;
    const name = tk("fort_" + id);
    const reward = t("fortReward", { a: goodsName(Math.max(0, f.route - 1)), b: goodsName(f.route) });
    if (fortTaken(s, id)) {
      showModal(name, `<div class="ageEmblem">${icon("fortress", "ico big")}</div><p>${t("fortOwned")}</p><p class="boostLine">${reward}</p>`, [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }]);
      return;
    }
    if (s.siege) {
      showModal(name, `<div class="ageEmblem">${icon("fortress", "ico big")}</div><p>${t("siegeBusy")}</p>`, [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }]);
      return;
    }
    const troops = idleSoldiers(s);
    const odds = siegeOdds(s, f, troops, !!s.hero);
    const body = `<div class="ageEmblem">${icon("fortress", "ico big")}</div><p>${t("fortIntro", { fort: name })}</p>
      <div class="kv"><span>${t("fortDefense")}</span><b>⚔ ${fmt(fortStrength(s, f))}</b></div>
      <div class="kv"><span>${t("fortYourPower", { n: troops })}</span><b>⚔ ${fmt(siegePower(s, troops, !!s.hero))}</b></div>
      <div class="kv big"><span>${t("fortOdds")}</span><b>%${Math.round(odds * 100)}</b></div>
      <p class="boostLine">${reward}</p><p class="muted small">${t("fortRules", { w: FORT_WALLS })}</p>`;
    const buttons: ModalButton[] = [{ label: t("cancel"), cls: "secondary", onClick: () => undefined }];
    if (troops >= 10) buttons.push({ label: t("siegeStart", { n: troops }), cls: "primary", onClick: () => this.beginSiege(id) });
    else buttons.push({ label: t("siegeNeed"), cls: "primary", onClick: () => this.ui.setTab("army") });
    showModal(name, body, buttons);
  }

  beginSiege(id: string): void {
    const s = this.s;
    const f = fortDef(id);
    const troops = idleSoldiers(s);
    if (!f || s.siege || fortTaken(s, id) || troops < 10) {
      sfx.error();
      return;
    }
    startSiege(s, f, troops, Date.now());
    sfx.sword();
    sfx.event();
    this.map.flyToRoute(f.route);
    this.toasts.show(`${icon("fortress")} ${t("siegeBegun", { fort: tk("fort_" + id), n: troops })}`, "gold", 4000);
    this.ui.dirty = true;
    this.save();
  }

  private pendingRelics: RelicId[] = [];

  private dropRelic(chance: number): void {
    const id = rollRelic(this.s, chance);
    if (id) this.pendingRelics.push(id);
  }

  private showRelic(id: RelicId): void {
    const r = RELICS.find((x) => x.id === id)!;
    sfx.fanfare();
    happytime();
    showModal(
      t("relicFound"),
      `<div class="ageEmblem relicGlow">${icon(r.icon, "ico big")}</div><h3 class="relicName">${tk("relic_" + id)}</h3><p class="ageQuote">${tk("relicL_" + id)}</p><p class="boostLine">${tk("relicD_" + id)}</p><p class="muted small">${t("relicCount", { n: this.s.relics.length, m: RELICS.length })}</p>`,
      [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }],
    );
    this.bard("relic", { relic: tk("relic_" + id) });
    this.ui.dirty = true;
    this.save();
  }

  openRelic(id: RelicId): void {
    const r = RELICS.find((x) => x.id === id)!;
    const owned = this.s.relics.includes(id);
    showModal(
      owned ? tk("relic_" + id) : "???",
      `<div class="ageEmblem${owned ? " relicGlow" : " relicLocked"}">${icon(r.icon, "ico big")}</div>${owned ? `<p class="ageQuote">${tk("relicL_" + id)}</p>` : `<p>${t("relicHint")}</p>`}<p class="boostLine">${tk("relicD_" + id)}</p>`,
      [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }],
    );
  }

  claimContract(i: number): void {
    const s = this.s;
    const c = s.contracts.list[i];
    if (!c || !contractReady(s, c)) return;
    c.claimed = true;
    s.stats.contracts++;
    this.seasonPts("contract");
    const gold = Math.max(500, totalIncomePerSec(s, Date.now(), false, false) * 300);
    earn(s, gold);
    s.mats.steel += CONTRACT_STEEL;
    gainXp(s, 60 + 10 * (s.hero?.level ?? 0));
    sfx.coin();
    sfx.fanfare();
    this.toasts.show(`${icon("scroll")} ${t("contractDone", { g: fmt(gold), n: CONTRACT_STEEL })}`, "gold", 3800);
    if (!s.contracts.bonus && s.contracts.list.every((x) => x.claimed)) {
      s.contracts.bonus = true;
      s.mats.steel += 5;
      this.toasts.show(`${icon("chest")} ${t("contractBonus")}`, "gold", 4500);
      this.dropRelic(0.35);
    }
    this.ui.dirty = true;
    this.save();
  }

  private titanTick(now: number, dt: number): void {
    const s = this.s;
    const ti = s.titan;
    if (ti) {
      ti.hp -= titanDps(s) * dt;
      if (ti.hp <= 0) this.titanSlain();
      else if (now >= ti.until) {
        s.titan = null;
        s.nextTitan = now + 20 * 60_000 * this.titanPace();
        sfx.error();
        this.toasts.show(`${icon("tepegoz", "ico")} ${t("titanEscaped")}`, "bad", 4500);
      }
      return;
    }
    if (!s.hero || s.tutorial < 5 || now < s.nextTitan || modalOpen() || document.hidden) return;
    spawnTitan(s, now);
    sfx.event();
    sfx.error();
    this.map.flyToNorm(TITAN_POS.x, TITAN_POS.y - 0.06);
    this.toasts.show(`${icon("tepegoz", "ico")} ${t("titanAppears")}`, "bad", 6000);
    this.bard("titanUp");
  }

  hitTitan(): void {
    const s = this.s;
    const ti = s.titan;
    if (!ti) return;
    const crit = Math.random() < 0.12;
    const dmg = tapDamage(s) * (0.8 + Math.random() * 0.4) * (crit ? 3 : 1);
    ti.hp -= dmg;
    sfx.sword();
    this.map.titanHit((crit ? t("crit") + " " : "") + fmt(dmg), crit, performance.now());
    if (ti.hp <= 0) this.titanSlain();
  }

  private titanSlain(): void {
    const s = this.s;
    const ti = s.titan!;
    s.titan = null;
    s.stats.titans++;
    s.nextTitan = Date.now() + (25 + Math.random() * 10) * 60_000 * this.titanPace();
    this.seasonPts("titan");
    this.bard("titanDown", { hero: s.hero?.name ?? "" });
    const gold = Math.max(2000, totalIncomePerSec(s, Date.now(), false, false) * 600);
    earn(s, gold);
    const steel = 5 + ti.level;
    const loot = { iron: 10 + ti.level * 5, leather: 10 + ti.level * 5, wood: 10 + ti.level * 5, steel };
    for (const [m, n] of Object.entries(loot) as [keyof typeof loot, number][]) s.mats[m] += n;
    gainXp(s, 150 * ti.level);
    this.map.addLoot(this.map.titanPoint(), ["mat_iron", "mat_leather", "mat_wood", "mat_steel", "chest"], performance.now());
    this.dropRelic(0.4);
    sfx.fanfare();
    sfx.coin();
    happytime();
    showModal(
      t("titanSlainTitle"),
      `<div class="ageEmblem">${icon("tepegoz", "ico big tepe")}</div><p>${t("titanSlainText")}</p><div class="bigGold">+${fmt(gold)}</div><p class="boostLine">${matsHtml(loot)}</p>`,
      [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }],
    );
    this.ui.dirty = true;
    this.save();
  }

  private nextLetter = Date.now() + 4 * 60_000;

  private letterTick(now: number): void {
    const s = this.s;
    if (now < this.nextLetter || !s.hero || s.nemeses.length === 0 || s.tutorial < 5 || document.hidden) return;
    this.nextLetter = now + (5 + Math.random() * 4) * 60_000;
    const n = s.nemeses[Math.floor(Math.random() * s.nemeses.length)];
    if (!s.routes[n.route] || s.routes[n.route].owned <= 0) return;
    this.openLetter(n, LETTER_KINDS[Math.floor(Math.random() * LETTER_KINDS.length)]);
  }

  openLetter(n: Nemesis, kind: LetterKind): void {
    const s = this.s;
    const name = nemesisName(n);
    const v = Math.floor(Math.random() * LETTER_VARIANTS);
    const tribute = Math.max(200, totalIncomePerSec(s, Date.now(), false, false) * 90);
    const vars = { name, hero: s.hero?.name ?? "", good: goodsName(n.route), g: fmt(tribute) };
    const body = `<div class="letter"><div class="lseal">${nemesisPortrait(n.look, "nemFace")}</div><p class="lto">${t("letterTo", { hero: vars.hero })}</p><p>${tk(`letter_${kind}_${v}`, vars)}</p><p class="lsign">— ${name}</p></div>`;
    const buttons: ModalButton[] = [];
    if (kind === "ransom") {
      buttons.push({
        label: t("letterRefuse"),
        cls: "secondary",
        onClick: () => {
          this.events.spawnBandit(n.route, Date.now(), n.id);
          this.map.flyToRoute(n.route);
          this.toasts.show(`${nemesisPortrait(n.look, "ico face")} ${t("nemAppears", { name, good: goodsName(n.route) })}`, "bad", 4500);
        },
      });
      buttons.push({
        label: t("letterPay", { g: fmt(tribute) }),
        cls: "primary",
        onClick: () => {
          if (s.gold < tribute) {
            this.toasts.show(t("noGold"), "bad");
            this.events.spawnBandit(n.route, Date.now(), n.id);
            return;
          }
          s.gold -= tribute;
          n.calm = Date.now() + CALM_MS;
          sfx.coin();
          this.toasts.show(`${nemesisPortrait(n.look, "ico face")} ${t("letterPaid", { name })}`, "good", 4000);
        },
      });
    } else if (kind === "challenge") {
      buttons.push({
        label: t("letterDecline"),
        cls: "secondary",
        onClick: () => {
          n.level = Math.min(MAX_NEMESIS_LEVEL, n.level + 1);
          this.toasts.show(`${nemesisPortrait(n.look, "ico face")} ${t("letterCoward", { name, n: n.level })}`, "bad", 4500);
          this.ui.dirty = true;
        },
      });
      buttons.push({
        label: t("letterAccept"),
        cls: "primary",
        onClick: () => {
          const e = this.events.spawnBandit(n.route, Date.now(), n.id);
          e.life = 30_000;
          this.map.flyToRoute(n.route);
        },
      });
    } else {
      buttons.push({ label: t("letterTear"), cls: "primary", onClick: () => sfx.sword() });
    }
    sfx.event();
    showModal(t("letterTitle"), body, buttons, { icon: icon("scroll"), dismissable: false });
  }

  openShareCard(): void {
    void openShareCard(this.s);
  }

  private titanPace(): number {
    return seasonEvent(Date.now()).id === "storm" ? 0.5 : 1;
  }

  private bardQueue: { ev: BardEvent; vars: Record<string, string | number>; v: number }[] = [];
  private bardShowing = false;
  private bardTimer = 0;
  private bardTyping = 0;

  private bard(ev: BardEvent, vars: Record<string, string | number> = {}): void {
    const s = this.s;
    const v = Math.floor(Math.random() * BARD_VARIANTS);
    s.sagaLog.push({ ev, v, vars, gen: s.ruler.gen, at: Date.now() });
    if (s.sagaLog.length > MAX_SAGA) s.sagaLog.shift();
    if (this.bardQueue.length < 1) this.bardQueue.push({ ev, vars, v });
  }
  private bardNext = 0;

  private showBard(b: { ev: BardEvent; vars: Record<string, string | number>; v: number }): void {
    let box = document.getElementById("bard");
    if (!box) {
      box = document.createElement("div");
      box.id = "bard";
      document.getElementById("mapWrap")!.appendChild(box);
      box.addEventListener("click", () => this.hideBard());
    }
    const line = tk(`bard_${b.ev}_${b.v}`, b.vars);
    box.innerHTML = `${icon("ozan", "bardFace")}<div class="btxt"><b>${t("bardName")}</b><p></p></div>`;
    void box.offsetWidth;
    box.classList.add("on");
    this.bardShowing = true;
    const p = box.querySelector("p")!;
    let i = 0;
    clearInterval(this.bardTyping);
    this.bardTyping = window.setInterval(() => {
      i += 2;
      p.textContent = line.slice(0, i);
      if (i >= line.length) clearInterval(this.bardTyping);
    }, 28);
    clearTimeout(this.bardTimer);
    this.bardTimer = window.setTimeout(() => this.hideBard(), 3000 + line.length * 30);
    sfx.kopuz();
  }

  private hideBard(): void {
    clearTimeout(this.bardTimer);
    clearInterval(this.bardTyping);
    document.getElementById("bard")?.classList.remove("on");
    window.setTimeout(() => (this.bardShowing = false), 600);
  }

  private seasonPts(src: SeasonSource): void {
    addSeasonPts(this.s, src, Date.now());
    if (this.ui.tab === "army") this.ui.dirty = true;
  }

  claimSeasonStep(): void {
    const s = this.s;
    if (!seasonStepReady(s)) return;
    const k = s.season.claimed++;
    const gold = Math.max(1000, totalIncomePerSec(s, Date.now(), false, false) * 300 * (k + 1));
    const steel = 3 + 2 * k;
    earn(s, gold);
    s.mats.steel += steel;
    sfx.fanfare();
    sfx.coin();
    this.toasts.show(`${icon("schest")} ${t("seasonStepDone", { n: k + 1, g: fmt(gold), s: steel })}`, "gold", 4200);
    if (k === SEASON_STEPS.length - 1) {
      happytime();
      if (!rollRelic(s, 0)) {
        const id = rollRelic(s, 1);
        if (id) this.pendingRelics.push(id);
        else s.mats.steel += 15;
      }
      this.bard("season");
    }
    this.ui.dirty = true;
    this.save();
  }

  claimGuildTier(): void {
    const s = this.s;
    const now = Date.now();
    if (!guildTierReady(s, now)) return;
    const k = s.season.guildClaimed++;
    const gold = Math.max(1500, totalIncomePerSec(s, now, false, false) * 400 * (k + 1));
    const mats = { iron: 20 * (k + 1), leather: 20 * (k + 1), wood: 20 * (k + 1), steel: 5 * (k + 1) };
    earn(s, gold);
    for (const [m, n] of Object.entries(mats) as [keyof typeof mats, number][]) s.mats[m] += n;
    sfx.fanfare();
    happytime();
    showModal(
      t("guildChestTitle"),
      `<div class="ageEmblem">${icon("guild", "ico big")}</div><p>${t("guildChestText", { n: k + 1 })}</p><div class="bigGold">+${fmt(gold)}</div><p class="boostLine">${matsHtml(mats)}</p>`,
      [{ label: t("storyContinue"), cls: "primary" }],
    );
    this.ui.dirty = true;
    this.save();
  }

  chooseOath(path: PathId): void {
    const s = this.s;
    const a = s.allegiance;
    if (a.path === path) return;
    const swear = () => {
      a.path = path;
      a.rank = 0;
      sfx.fanfare();
      this.toasts.show(`${icon(PATH_ICON[path])} ${t("oathSworn", { path: tk("path_" + path) })}`, "gold", 4000);
      this.ui.dirty = true;
      this.save();
    };
    if (!a.path) {
      swear();
      return;
    }
    showModal(
      t("oathBreakTitle"),
      `<div class="ageEmblem">${icon(PATH_ICON[path], "ico big")}</div><p>${t("oathBreakText", { from: tk("path_" + a.path), to: tk("path_" + path), n: OATH_BREAK_STEEL })}</p>`,
      [
        { label: t("cancel"), cls: "secondary" },
        {
          label: t("oathBreakBtn", { n: OATH_BREAK_STEEL }),
          cls: "primary",
          onClick: () => {
            if (s.mats.steel < OATH_BREAK_STEEL) {
              sfx.error();
              this.toasts.show(t("needSteel", { n: OATH_BREAK_STEEL }), "bad");
              return;
            }
            s.mats.steel -= OATH_BREAK_STEEL;
            swear();
          },
        },
      ],
    );
  }

  buyPerk(): void {
    const s = this.s;
    const cost = nextPerkCost(s);
    if (cost === null || favorFree(s) < cost) {
      sfx.error();
      return;
    }
    s.allegiance.rank++;
    sfx.fanfare();
    const perk = PERKS[s.allegiance.path!][s.allegiance.rank - 1];
    this.toasts.show(`${icon(PATH_ICON[s.allegiance.path!])} ${t("perkGained", { p: perkText(perk) })}`, "gold", 3800);
    this.ui.dirty = true;
    this.save();
  }

  private tradeWarTick(now: number): void {
    const s = this.s;
    const w = s.tradeWar;
    if (w) {
      if (w.until <= now) {
        s.tradeWar = null;
        s.nextTradeWar = now + (9 + Math.random() * 5) * 60_000;
        this.toasts.show(`${icon("tradewar")} ${t(w.won ? "twOver" : "twFaded", { rival: tk("twRival_" + w.rival), good: goodsName(w.route) })}`, w.won ? "good" : "bad", 4000);
        this.ui.dirty = true;
      }
      return;
    }
    if (now < s.nextTradeWar || !isOpen(s, "war") || document.hidden || modalOpen() || this.calm(now)) return;
    if (s.spies > 0 && Math.random() < SPY_FOIL * s.spies) {
      s.nextTradeWar = now + (9 + Math.random() * 5) * 60_000;
      s.stats.foiled++;
      const gold = Math.max(300, totalIncomePerSec(s, now, false, false) * 45);
      earn(s, gold);
      const rival = tk("twRival_" + Math.floor(Math.random() * TW_RIVALS));
      sfx.coin();
      this.toasts.show(`${icon("spy")} ${t("spyFoiled", { rival, g: fmt(gold) })}`, "gold", 5000);
      this.bard("spy", { rival });
      this.ui.dirty = true;
      return;
    }
    const nw = startTradeWar(s, now);
    if (!nw) return;
    sfx.event();
    this.map.flyToRoute(nw.route);
    this.toasts.show(`${icon("tradewar")} ${t("twStart", { rival: tk("twRival_" + nw.rival), good: goodsName(nw.route) })}`, "bad", 6000);
    this.ui.dirty = true;
  }

  openTradeWar(): void {
    const s = this.s;
    const now = Date.now();
    const w = tradeWarActive(s, now);
    if (!w) return;
    const rival = tk("twRival_" + w.rival);
    const good = goodsName(w.route);
    if (w.won) {
      showModal(t("twTitle"), `<div class="ageEmblem">${icon("tradewar", "ico big")}</div><p>${t("twWonInfo", { good, t: fmtTime((w.until - now) / 1000) })}</p>`, [{ label: t("storyContinue"), cls: "primary" }]);
      return;
    }
    const cost = undercutCost(totalIncomePerSec(s, now, false, false));
    const troops = idleSoldiers(s);
    const odds = sabotageOdds(s, w.route);
    const body = `<p>${t("twIntro", { rival, good, p: Math.round((1 - TW_PENALTY) * 100) })}</p>
      <div class="kv"><span>${t("twUndercut")}</span><b>${fmt(cost)} · %${Math.round(TW_UNDERCUT_ODDS * 100)}</b></div>
      <div class="kv"><span>${t("twSabotage", { n: troops })}</span><b>%${Math.round(odds * 100)}</b></div>
      <p class="muted small">${t("twRules", { b: Math.round((TW_BONUS - 1) * 100), m: Math.round(TW_WIN_MS / 60_000), t: fmtTime((w.until - now) / 1000) })}</p>`;
    showModal(
      t("twTitle"),
      body,
      [
        { label: t("twIgnore"), cls: "secondary" },
        { label: t("twSabotageBtn"), cls: "secondary", onClick: () => this.resolveTradeWar("sabotage") },
        { label: t("twUndercutBtn", { g: fmt(cost) }), cls: "primary", onClick: () => this.resolveTradeWar("undercut") },
      ],
      { icon: icon("tradewar") },
    );
  }

  resolveTradeWar(how: "undercut" | "sabotage"): void {
    const s = this.s;
    const now = Date.now();
    const w = tradeWarActive(s, now);
    if (!w || w.won) return;
    const rival = tk("twRival_" + w.rival);
    const good = goodsName(w.route);
    let win: boolean;
    let extra = "";
    if (how === "undercut") {
      const cost = undercutCost(totalIncomePerSec(s, now, false, false));
      if (s.gold < cost) {
        sfx.error();
        this.toasts.show(t("noGold"), "bad");
        return;
      }
      s.gold -= cost;
      win = Math.random() < TW_UNDERCUT_ODDS;
    } else {
      const troops = idleSoldiers(s);
      if (troops < 5) {
        sfx.error();
        this.toasts.show(t("twNoTroops"), "bad");
        return;
      }
      win = Math.random() < sabotageOdds(s, w.route);
      const res = takeCasualties(s, Math.max(1, Math.round(troops * (win ? 0.05 : 0.18))));
      extra = ` · ${t("casualties", { d: res.dead, w: res.wounded })}`;
    }
    sfx.sword();
    if (win) {
      w.won = true;
      w.until = now + TW_WIN_MS;
      s.stats.tradeWars++;
      this.seasonPts("tradewar");
      sfx.fanfare();
      happytime();
      this.toasts.show(`${icon("tradewar")} ${t("twWon", { rival, good, b: Math.round((TW_BONUS - 1) * 100) })}${extra}`, "gold", 5000);
      this.bard("tradeWin", { rival, good });
    } else {
      sfx.error();
      this.toasts.show(`${icon("tradewar")} ${t("twLost", { rival })}${extra}`, "bad", 4500);
    }
    this.ui.dirty = true;
    this.save();
  }

  private heroFalls(foe: string): void {
    const s = this.s;
    const h = s.hero;
    if (!h) return;
    s.fallenHeroes.push({ name: h.name, look: h.look, level: h.level, gen: s.ruler.gen, foe });
    if (s.fallenHeroes.length > 30) s.fallenHeroes.shift();
    const heir = { name: t("heirOf", { name: h.name }).slice(0, 20), look: (h.look + 1) % HERO_LOOKS, level: Math.max(1, Math.floor(h.level / 2)), xp: 0, gear: { ...h.gear } };
    s.hero = heir;
    const broken = clampGear(s);
    sfx.error();
    window.setTimeout(() => sfx.kopuz(), 300);
    const show = () =>
      showModal(
        t("heroFallTitle"),
        `<div class="nemHead slain">${heroPortrait(h.look, "nemFace")}<div><h3>${h.name}</h3><small>${t("heroLevel", { n: h.level })} · ${foe}</small></div></div><p class="ageQuote">${t("heroFallText", { name: h.name, foe })}</p><p class="boostLine">${t("heroLegacy", { b: Math.round(LEGACY_BONUS * 100), n: heir.level })}</p>${broken.map((b) => `<p class="muted small">${t("gearBroke", { item: itemName(b.from), now: b.to ? itemName(b.to) : t("slotEmpty") })}</p>`).join("")}`,
        [
          { label: t("heirRename"), cls: "secondary", onClick: () => window.setTimeout(() => this.openHeroCreator(), 50) },
          { label: t("storyContinue"), cls: "primary" },
        ],
        { icon: icon("balbal"), dismissable: false },
      );
    if (modalOpen()) window.setTimeout(show, 2500);
    else show();
    this.bard("fallen", { name: h.name });
    this.ui.dirty = true;
    this.save();
  }

  openKurgan(): void {
    const s = this.s;
    const rows = s.fallenHeroes
      .slice()
      .reverse()
      .map((f) => `<div class="lrow">${heroPortrait(f.look, "face")}<span><b>${f.name.replace(/</g, "")}</b> <small>${t("heroLevel", { n: f.level })} · ${t("genN", { n: f.gen })}</small><br><small class="muted">${t("kurganFoe", { foe: f.foe })}</small></span></div>`)
      .join("");
    showModal(
      t("kurganTitle"),
      `<div class="ageEmblem">${icon("balbal", "ico big")}</div><p class="ageQuote">${t("kurganText")}</p><div class="lboard">${rows}</div><p class="boostLine">${t("kurganBonus", { b: Math.round(legacyBonus(s) * 100) })}</p>`,
      [{ label: t("storyContinue"), cls: "primary" }],
    );
  }

  buildHan(i: number): void {
    const s = this.s;
    const cost = hanCost(i);
    const wood = hanWood(s);
    if (!canBuildHan(s, i)) return;
    if (s.gold < cost || s.mats.wood < wood) {
      sfx.error();
      this.toasts.show(t(s.gold < cost ? "noGold" : "noMats"), "bad");
      return;
    }
    s.gold -= cost;
    s.mats.wood -= wood;
    s.hans.push(i);
    s.stats.hans++;
    s.nextHanStory = Math.min(s.nextHanStory, Date.now() + 90_000);
    this.seasonPts("han");
    sfx.buy();
    sfx.fanfare();
    this.map.flyToRoute(i);
    this.toasts.show(`${icon("han")} ${t("hanBuilt", { good: goodsName(i), p: Math.round((HAN_MULT - 1) * 100) })}`, "gold", 4500);
    if (s.hans.length === 1 || s.hans.length === ROUTES.length) this.bard("han", { good: goodsName(i) });
    this.ui.dirty = true;
    this.save();
  }

  openHan(i: number): void {
    const s = this.s;
    const good = goodsName(i);
    if (hasHan(s, i)) {
      showModal(t("hanTitle", { good }), `<div class="ageEmblem">${icon("han", "ico big")}</div><p>${t("hanOwned", { good, p: Math.round((HAN_MULT - 1) * 100) })}</p><p class="muted small">${t("hanStoriesHint")}</p>`, [{ label: t("storyContinue"), cls: "primary" }]);
      return;
    }
    const cost = hanCost(i);
    const wood = hanWood(s);
    showModal(
      t("hanTitle", { good }),
      `<div class="ageEmblem">${icon("han", "ico big")}</div><p>${t("hanIntro", { good, p: Math.round((HAN_MULT - 1) * 100) })}</p><div class="kv"><span>${t("hanCost")}</span><b>${fmt(cost)} · ${icon("mat_wood")} ${wood}</b></div>`,
      [
        { label: t("cancel"), cls: "secondary" },
        { label: t("hanBuild"), cls: "primary", onClick: () => this.buildHan(i) },
      ],
    );
  }

  private hanTick(now: number): void {
    const s = this.s;
    if (s.hans.length === 0 || now < s.nextHanStory || s.tutorial < 5 || modalOpen() || document.hidden) return;
    s.nextHanStory = now + (6 + Math.random() * 4) * 60_000;
    this.openStory(pickHanStory(s));
  }

  upgradeSpies(): void {
    const s = this.s;
    const lv = s.spies;
    if (lv >= SPY_MAX) return;
    const steel = SPY_STEEL[lv];
    const gold = this.spyGold();
    if (s.gold < gold || s.mats.steel < steel) {
      sfx.error();
      this.toasts.show(s.gold < gold ? t("noGold") : t("needSteel", { n: steel }), "bad");
      return;
    }
    s.gold -= gold;
    s.mats.steel -= steel;
    s.spies++;
    sfx.fanfare();
    this.toasts.show(`${icon("spy")} ${t("spyUp", { n: s.spies })}`, "gold", 3500);
    this.ui.dirty = true;
    this.save();
  }

  spyGold(): number {
    return Math.max(1000, totalIncomePerSec(this.s, Date.now(), false, false) * 120 * (this.s.spies + 1));
  }

  weddingCost(): number {
    return Math.max(5000, totalIncomePerSec(this.s, Date.now(), false, false) * 600);
  }

  marry(id: HouseId): void {
    const s = this.s;
    if (s.spouse || !houseOffers(s.ruler.gen).includes(id)) return;
    const cost = this.weddingCost();
    if (s.gold < cost) {
      sfx.error();
      this.toasts.show(t("noGold"), "bad");
      return;
    }
    s.gold -= cost;
    s.spouse = id;
    const h = houseDef(id);
    const house = tk("house_" + id);
    sfx.fanfare();
    window.setTimeout(() => sfx.kopuz(), 400);
    happytime();
    showModal(
      t("weddingTitle"),
      `<div class="ageEmblem relicGlow">${icon("rings", "ico big")}</div><p class="ageQuote">${t("weddingText", { ruler: s.ruler.name, bride: h.bride, house })}</p><p class="boostLine">${perkText(h)}</p><p class="muted small">${t("weddingBlood", { p: 25, n: MAX_BLOOD })}</p>`,
      [{ label: t("storyContinue"), cls: "primary" }],
    );
    this.bard("wedding", { ruler: s.ruler.name, bride: h.bride });
    this.ui.dirty = true;
    this.save();
  }

  private lastCampK = -1;

  private campTick(now: number): void {
    const s = this.s;
    if (!isOpen(s, "events") || (!s.camp && this.calm(now))) return;
    const k = campSeasonIndex(now);
    if (!s.camp) {
      s.camp = campWanted(now);
      s.campSeason = k;
      this.lastCampK = k;
      this.toasts.show(`${icon(s.camp)} ${t("campUnlocked", { p: Math.round(CAMP_BONUS * 100) })}`, "gold", 6000);
      this.ui.dirty = true;
      return;
    }
    if (k === this.lastCampK) return;
    const first = this.lastCampK < 0;
    this.lastCampK = k;
    if (s.camp !== campWanted(now)) {
      if (!first) this.toasts.show(`${icon(campWanted(now))} ${t("campMove", { camp: tk("campTo_" + campWanted(now)) })}`, "bad", 5000);
      this.ui.dirty = true;
    }
  }

  migrateCamp(): void {
    const s = this.s;
    if (!s.camp) return;
    const now = Date.now();
    const wanted = campWanted(now);
    if (s.camp === wanted) {
      showModal(
        t("campTitle"),
        `<div class="ageEmblem">${icon(s.camp, "ico big")}</div><p>${t("campInfo", { camp: tk("campAt_" + s.camp), p: Math.round(CAMP_BONUS * 100) })}</p><p class="muted small">${t("campRules")}</p>`,
        [{ label: t("storyContinue"), cls: "primary" }],
      );
      return;
    }
    s.camp = wanted;
    const k = campSeasonIndex(now);
    let reward = "";
    if (s.campSeason !== k) {
      s.campSeason = k;
      s.stats.migrations++;
      this.seasonPts("migrate");
      const gold = Math.max(200, totalIncomePerSec(s, now, false, false) * 30);
      earn(s, gold);
      reward = ` +${fmt(gold)}`;
      sfx.coin();
    }
    sfx.event();
    this.map.addTextAt(this.map.campPoint(s), tk("camp_" + wanted), "#ffe08a", performance.now());
    this.toasts.show(`${icon(wanted)} ${t("campMoved", { camp: tk("campTo_" + wanted), p: Math.round(CAMP_BONUS * 100) })}${reward}`, "good", 3500);
    this.ui.dirty = true;
    this.save();
  }

  openSaga(): void {
    const s = this.s;
    const list = s.sagaLog.slice().reverse();
    let body: string;
    if (list.length === 0) body = `<div class="ageEmblem">${icon("destan", "ico big")}</div><p class="ageQuote">${t("sagaEmpty")}</p>`;
    else {
      let gen = -1;
      const parts: string[] = [];
      list.forEach((e, k) => {
        if (e.gen !== gen) {
          gen = e.gen;
          parts.push(`<h4>${t("genN", { n: gen })}</h4>`);
        }
        parts.push(`<p><b>${t("sagaVerse", { n: list.length - k })}</b> ${tk(`bard_${e.ev}_${e.v}`, e.vars)}</p>`);
      });
      body = `<div class="sagaBook">${parts.join("")}</div>`;
    }
    const buttons: ModalButton[] = [{ label: t("close"), cls: "secondary" }];
    if (list.length > 0) buttons.push({ label: t("sagaShare"), cls: "primary", onClick: () => void openSagaCard(s, list.slice(0, 6).map((e) => tk(`bard_${e.ev}_${e.v}`, e.vars))) });
    showModal(t("sagaTitle"), body, buttons, { icon: icon("destan") });
  }

  raidAttack(): void {
    const s = this.s;
    const now = Date.now();
    rollRaid(s, now);
    const r = s.raid;
    if (r.tickets <= 0 || raidTotal(s, now) >= 1) {
      sfx.error();
      return;
    }
    if (r.tickets >= 3) r.ticketAt = now;
    r.tickets--;
    const crit = Math.random() < 0.15;
    const dmg = Math.min(1 - raidTotal(s, now), raidHit(s) * (0.85 + Math.random() * 0.3) * (crit ? 2 : 1));
    r.dmg += dmg;
    r.hits++;
    this.seasonPts("raid");
    gainXp(s, 40 + 5 * (s.hero?.level ?? 0));
    sfx.sword();
    if (crit) sfx.fanfare();
    this.toasts.show(`${icon("yelbegen")} ${t(crit ? "raidCrit" : "raidHit", { p: (dmg * 100).toFixed(1) })}`, crit ? "gold" : "good", 3000);
    if (raidTotal(s, now) >= 1) {
      s.stats.raids++;
      happytime();
      this.bard("raid", { hero: s.hero?.name ?? "" });
      this.toasts.show(`${icon("yelbegen")} ${t("raidDown")}`, "gold", 6000);
    }
    const fx = document.querySelector(".raidBoss");
    fx?.classList.remove("hit");
    void (fx as HTMLElement | null)?.offsetWidth;
    fx?.classList.add("hit");
    this.ui.dirty = true;
    this.save();
  }

  claimRaidTier(): void {
    const s = this.s;
    const now = Date.now();
    if (!raidTierReady(s, now)) return;
    const k = s.raid.claimed++;
    const gold = Math.max(2000, totalIncomePerSec(s, now, false, false) * 450 * (k + 1));
    const mats = { iron: 25 * (k + 1), leather: 25 * (k + 1), wood: 25 * (k + 1), steel: 4 + 4 * k };
    earn(s, gold);
    for (const [m, n] of Object.entries(mats) as [keyof typeof mats, number][]) s.mats[m] += n;
    if (k === RAID_TIERS.length - 1) this.dropRelic(0.5);
    sfx.fanfare();
    sfx.coin();
    showModal(
      t("raidChestTitle"),
      `<div class="ageEmblem">${icon("raid", "ico big")}</div><p>${t("raidChestText", { p: Math.round(RAID_TIERS[k] * 100) })}</p><div class="bigGold">+${fmt(gold)}</div><p class="boostLine">${matsHtml(mats)}</p>`,
      [{ label: t("storyContinue"), cls: "primary" }],
    );
    this.ui.dirty = true;
    this.save();
  }

  private stormBank = 0;
  private stormOffer = 0;
  private whip = -1;
  private whipHeat = 5;
  private whipTold = false;
  private hornUntil = 0;
  private hornOffered = false;
  private rival: { route: number; t: number; name: string } | null = null;
  private nextRival = Date.now() + 40_000;
  private rivalOffer = 0;

  private holdRoute(route: number | null): void {
    this.whip = route === null ? -1 : route;
    this.map.whipRoute = this.whip;
    if (route !== null && !this.whipTold && this.s.tutorial >= 5) {
      this.whipTold = true;
      this.toasts.show(t("whipHint"), "info", 4000);
    }
  }

  private offerHorn(): void {
    if (this.s.tutorial < 5 || modalOpen() || !this.canWatchAd()) {
      this.toasts.show(t("whipHot"), "bad", 2500);
      return;
    }
    showModal(
      t("hornTitle"),
      `<div class="ageEmblem">${icon("silk", "ico big")}</div><p>${t("hornText")}</p>`,
      [
        { label: t("hornLater"), cls: "secondary" },
        { label: `▶ ${t("hornAd")}`, cls: "primary", onClick: () => void this.hornAd() },
      ],
      { icon: icon("silk") },
    );
  }

  private async hornAd(): Promise<void> {
    const ok = await this.runAd();
    if (!ok) {
      this.toasts.show(t(adsAvailable() ? "adFailed" : "adOff"), "bad");
      return;
    }
    this.hornUntil = Date.now() + 45_000;
    this.whipHeat = 5;
    sfx.fanfare();
    this.toasts.show(t("hornOn"), "gold", 3500);
    this.save();
  }

  debugRival(route = 1): void {
    const owned = this.s.routes.findIndex((r) => r.owned > 0);
    this.rival = { route: this.s.routes[route]?.owned > 0 ? route : Math.max(0, owned), t: 0.45, name: tk("rival_sogd") };
    this.map.rival = { route: this.rival.route, t: this.rival.t };
  }

  private rivalTick(now: number, dt: number): void {
    if (this.rival) {
      this.rival.t += dt / 24;
      this.map.rival = { route: this.rival.route, t: Math.min(0.98, this.rival.t) };
      if (this.rival.t >= 1) {
        const loss = this.income() * 20;
        this.s.gold = Math.max(0, this.s.gold - loss);
        this.toasts.show(`${icon("swords")} ${t("rivalFled", { name: this.rival.name, g: fmt(loss) })}`, "bad", 4000);
        sfx.error();
        this.rival = null;
        this.map.rival = null;
        this.nextRival = now + 75_000;
      }
      return;
    }
    this.map.rival = null;
    if (this.rivalOffer > 0 && !modalOpen() && !document.hidden) {
      const bank = this.rivalOffer;
      this.rivalOffer = 0;
      this.offerRival(bank);
    }
    const s = this.s;
    if (now < this.nextRival || !isOpen(s, "events") || modalOpen() || document.hidden || this.map.stormLive(now) || this.calm(now)) return;
    const owned = s.routes.map((r, i) => (r.owned > 0 ? i : -1)).filter((i) => i >= 0);
    if (owned.length === 0) return;
    const route = owned[Math.floor(Math.random() * owned.length)];
    const rv = RIVALS[Math.floor(Math.random() * RIVALS.length)];
    this.rival = { route, t: 0.04, name: tk("rival_" + rv.id) };
    this.map.rival = { route, t: 0.04 };
    sfx.event();
    this.toasts.show(`${icon("swords")} ${t("rivalSeen", { name: this.rival.name, good: goodsName(route) })}`, "bad", 4000);
  }

  private catchRival(): void {
    const rv = this.rival;
    if (!rv) return;
    const s = this.s;
    const route = rv.route;
    const name = rv.name;
    const power = escortPower(s, route) + (s.hero ? 1 : 0) * 40;
    const win = Math.random() < Math.min(0.9, winChance(Math.max(8, power), banditStrength(s, route) * 6));
    this.rival = null;
    this.map.rival = null;
    this.nextRival = Date.now() + 80_000;
    if (!win) {
      sfx.error();
      this.toasts.show(t("rivalLose", { name }), "bad", 3000);
      return;
    }
    const gold = this.income() * 80;
    earn(s, gold);
    sfx.sword();
    sfx.coin();
    this.map.addTextAt(this.map.routePoint(route, rv.t), "+" + fmt(gold), "#ffd56a", performance.now());
    if (this.canWatchAd()) this.rivalOffer = gold;
    else this.toasts.show(`${icon("chest")} ${t("rivalWin", { name, g: fmt(gold) })}`, "gold", 3500);
    this.save();
  }

  private offerRival(bank: number): void {
    showModal(
      t("rivalTitle"),
      `<div class="ageEmblem">${icon("chest", "ico big")}</div><p>${t("rivalLoot")}</p><div class="bigGold">+${fmt(bank)}</div>`,
      [
        { label: t("stormKeep"), cls: "secondary" },
        { label: `▶ ${t("stormAd")}`, cls: "primary", onClick: () => void this.stormAd(bank) },
      ],
      { icon: icon("chest"), dismissable: false },
    );
  }

  startSilkStorm(route: number, now = Date.now()): void {
    if (!isOpen(this.s, "events") || this.map.stormLive(now) || modalOpen() || this.calm(now)) return;
    this.stormBank = 0;
    this.map.beginStorm(route, now);
    sfx.event();
  }

  private catchSilk(id: number): void {
    const now = Date.now();
    const p = this.map.takeStorm(id, now);
    if (!p) return;
    const v = this.income() * 6;
    this.stormBank += v;
    earn(this.s, v);
    sfx.coin();
    this.map.addTextAt(p, "+" + fmt(v), "#ffe08a", performance.now());
  }

  stormTapAny(): boolean {
    const id = this.map.firstStorm(Date.now());
    if (!id) return false;
    this.catchSilk(id);
    return true;
  }

  private offerStorm(bank: number): void {
    const buttons: ModalButton[] = [{ label: t("stormKeep"), cls: "secondary" }];
    if (this.canWatchAd()) buttons.push({ label: `▶ ${t("stormAd")}`, cls: "primary", onClick: () => void this.stormAd(bank) });
    showModal(
      t("stormTitle"),
      `<div class="ageEmblem relicGlow">${icon("silk", "ico big")}</div><p class="ageQuote">${t("stormText")}</p><div class="bigGold">+${fmt(bank)}</div><p class="muted small">${t("stormHint")}</p>`,
      buttons,
      { icon: icon("silk"), dismissable: false },
    );
  }

  private async stormAd(bank: number): Promise<void> {
    const ok = await this.runAd();
    if (!ok) {
      this.toasts.show(t(adsAvailable() ? "adFailed" : "adOff"), "bad");
      return;
    }
    earn(this.s, bank * 2);
    sfx.fanfare();
    happytime();
    this.toasts.show("+" + fmt(bank * 2), "gold", 3500);
    this.save();
  }

  private stormTick(now: number): void {
    if (this.map.consumeStormEnd(now) && this.stormBank > 0) {
      this.stormOffer = this.stormBank;
      this.stormBank = 0;
    }
    if (this.stormOffer > 0 && !modalOpen() && !document.hidden) {
      const bank = this.stormOffer;
      this.stormOffer = 0;
      this.offerStorm(bank);
      this.save();
    }
  }

  private provinceTick(now: number, dt: number): void {
    const s = this.s;
    moodTick(s, dt);
    youthTick(s, dt);
    this.incursionTick(now);
    this.merchantTick(now);
    this.weatherTick(now);
    if (now < s.wageAt) return;
    s.wageAt = now + MONTH_MS;
    if (s.mercs > 0) {
      const wage = monthWage(s, this.income());
      if (s.gold >= wage) {
        s.gold -= wage;
        this.toasts.show(`${icon("merc")} ${t("wagePaid", { n: s.mercs, g: fmt(wage) })}`, "info", 3500);
      } else {
        const gone = Math.ceil(s.mercs / 2);
        s.mercs -= gone;
        s.mood = Math.max(0, s.mood - 12);
        sfx.error();
        this.toasts.show(`${icon("merc")} ${t("wageFail", { n: gone })}`, "bad", 5000);
      }
    }
    if (s.revolt < 0 && s.mood < REVOLT_MOOD) {
      const open = s.regions.map((r, k) => (r.open ? k : -1)).filter((k) => k >= 0);
      if (open.length > 0 && Math.random() < 0.35 + (REVOLT_MOOD - s.mood) / 50) {
        s.revolt = open[Math.floor(Math.random() * open.length)];
        sfx.event();
        this.bard("revolt", { region: tk("reg_" + REGIONS[s.revolt].id) });
        this.toasts.show(`${icon("revolt")} ${t("revoltStart", { region: tk("reg_" + REGIONS[s.revolt].id) })}`, "bad", 6000);
      }
    }
    this.ui.dirty = true;
    this.save();
  }

  private lastWeather: Weather | null = null;

  private weatherTick(now: number): void {
    const w = weatherAt(now);
    if (w === this.lastWeather) return;
    const first = this.lastWeather === null;
    this.lastWeather = w;
    this.map.weather = w;
    if (first || this.s.tutorial < 5 || !this.s.regions.some((r) => r.open)) return;
    this.toasts.show(`${icon("w_" + w)} ${t(("weather_" + w) as "weather_clear", { p: Math.round(SAND_DROP * 100), y: Math.round(RAIN_YOUTH * 100) })}`, w === "clear" ? "info" : "gold", 4500);
  }

  private merchantTick(now: number): void {
    const s = this.s;
    if (s.merchant) {
      if (now >= s.merchant.until) {
        s.merchant = null;
        this.map.merchant = -1;
        this.toasts.show(`${icon("merchant")} ${t("merchantLeft")}`, "info", 3000);
        this.save();
      } else this.map.merchant = s.merchant.k;
      return;
    }
    this.map.merchant = -1;
    if (now < s.nextMerchant || document.hidden || !isOpen(s, "realm")) return;
    s.nextMerchant = now + nextMerchantDelay();
    const m = rollMerchant(s, now);
    if (!m) return;
    s.merchant = m;
    this.map.merchant = m.k;
    sfx.event();
    this.toasts.show(`${icon("merchant")} ${t("merchantCame", { region: tk("reg_" + REGIONS[m.k].id) })}`, "gold", 5000);
    this.save();
  }

  openJourney(): void {
    if (!isOpen(this.s, "journey")) return;
    this.journey.open();
  }

  forceMerchant(): void {
    this.s.nextMerchant = 0;
    this.s.merchant = null;
    this.merchantTick(Date.now());
  }

  openMerchant(): void {
    const s = this.s;
    const m = s.merchant;
    if (!m) return;
    const income = this.income();
    const offers = m.offers
      .map((o, i) => {
        const price = offerPrice(s, o, income);
        const ic = o.kind === "trophy" ? o.id : o.kind === "mercs" ? "merc" : o.id;
        const name = o.kind === "trophy" ? tk("tro_" + o.id) : o.kind === "mercs" ? t("merchMercs") : tk(o.id);
        const rar = o.kind === "trophy" ? ` r${TROPHY_RARITY[o.id]}` : "";
        const sub = o.kind === "trophy" ? t(("rar_" + TROPHY_RARITY[o.id]) as "rar_0") : `×${o.n}`;
        const ok = !o.sold && s.gold >= price;
        return `<div class="mOffer${rar}${o.sold ? " sold" : ""}">${icon(ic, "ico")}<div class="am"><b>${name}</b><small>${sub}</small></div><button class="mini${ok ? " ready" : ""}" data-buy="${i}" ${ok ? "" : "disabled"}>${o.sold ? t("merchSold") : fmt(price)}</button></div>`;
      })
      .join("");
    const sell = sellable(s)
      .map((id) => `<div class="mOffer r${TROPHY_RARITY[id]}">${icon(id, "ico")}<div class="am"><b>${tk("tro_" + id)}</b><small>×${s.trophies[id]}</small></div><button class="mini" data-sell="${id}">+${fmt(buybackPrice(id, income))}</button></div>`)
      .join("");
    showModal(
      t("merchTitle"),
      `<p class="ageQuote">${t("merchText", { region: tk("reg_" + REGIONS[m.k].id), t: fmtTime(Math.max(0, m.until - Date.now()) / 1000) })}</p><h4 class="sect">${icon("m_crate", "ico sm")} ${t("merchBuy")}</h4><div class="artList">${offers}</div>` +
        (sell ? `<h4 class="sect">${icon("m_pouch", "ico sm")} ${t("merchSell")}</h4><p class="muted small">${t("merchSellHint")}</p><div class="artList">${sell}</div>` : ""),
      [{ label: t("close"), cls: "primary" }],
      { icon: icon("merchant"), dismissable: true },
    );
    document.querySelector<HTMLElement>("#modal .mbody")?.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("button");
      if (!b) return;
      if (b.dataset.buy) this.merchantBuy(Number(b.dataset.buy));
      else if (b.dataset.sell) this.merchantSell(b.dataset.sell);
    });
  }

  private merchantBuy(i: number): void {
    const s = this.s;
    const o = s.merchant?.offers[i];
    if (!o || !buyOffer(s, o, this.income())) {
      sfx.error();
      return;
    }
    sfx.coin();
    if (o.kind === "trophy" && TROPHY_RARITY[o.id] === 2) happytime();
    this.toasts.show(`${icon(o.kind === "trophy" ? o.id : o.kind === "mercs" ? "merc" : o.id)} ${t("merchBought")}`, "gold", 2500);
    this.ui.dirty = true;
    this.save();
    this.openMerchant();
  }

  private merchantSell(id: string): void {
    const s = this.s;
    const g = sellTrophy(s, id, this.income());
    if (g <= 0) return;
    earn(s, g);
    sfx.coin();
    this.ui.dirty = true;
    this.save();
    this.openMerchant();
  }

  private incursionTick(now: number): void {
    const s = this.s;
    const inc = s.incursion;
    if (inc) {
      if (now >= inc.until) this.loseIncursion(false);
      return;
    }
    if (now < s.nextIncursion || document.hidden || !isOpen(s, "realm")) return;
    const open = s.regions.map((r, k) => (r.open && s.revolt !== k ? k : -1)).filter((k) => k >= 0);
    s.nextIncursion = now + nextIncursionDelay();
    if (open.length === 0) return;
    const k = open[Math.floor(Math.random() * open.length)];
    s.incursion = { k, rival: Math.floor(Math.random() * RIVALS.length), until: now + RAID_THREAT_MS };
    sfx.event();
    this.toasts.show(`${icon("swords")} ${t("incStart", { rival: tk("rival_" + RIVALS[s.incursion.rival].id), region: tk("reg_" + REGIONS[k].id) })}`, "bad", 6000);
    this.ui.dirty = true;
    this.save();
  }

  openIncursion(): void {
    const s = this.s;
    const inc = s.incursion;
    if (!inc) return;
    const rival = tk("rival_" + RIVALS[inc.rival].id);
    const region = tk("reg_" + REGIONS[inc.k].id);
    const odds = incursionOdds(s, inc.k);
    showModal(
      t("incTitle"),
      `<p class="ageQuote">${t("incText", { rival, region })}</p><p class="muted small">${t("incStake", { t: fmtTime(Math.max(0, inc.until - Date.now()) / 1000) })}</p>`,
      [
        { label: t("close"), cls: "secondary" },
        { label: `${t("incDefend")} · %${Math.round(odds * 100)}`, cls: "primary", onClick: () => this.defendIncursion() },
      ],
      { icon: icon("swords"), dismissable: true },
    );
  }

  private defendIncursion(): void {
    const s = this.s;
    const inc = s.incursion;
    if (!inc) return;
    if (Math.random() >= incursionOdds(s, inc.k)) {
      this.loseIncursion(true);
      return;
    }
    const rival = tk("rival_" + RIVALS[inc.rival].id);
    const region = tk("reg_" + REGIONS[inc.k].id);
    const gold = this.income() * 90;
    earn(s, gold);
    s.mood = Math.min(100, s.mood + 6);
    s.incursion = null;
    s.stats.defends++;
    const tro = rollTrophy(s, inc.k);
    if (tro) s.trophies[tro] = (s.trophies[tro] ?? 0) + 1;
    const rel = s.diplo[RIVALS[inc.rival].id];
    if (rel) rel.rel = Math.max(-100, rel.rel - 10);
    this.seasonPts("war");
    sfx.sword();
    sfx.fanfare();
    this.bard("warWon", { rival });
    const troHtml = tro ? `<div class="troDrop r${TROPHY_RARITY[tro]}">${icon(tro, "ico big")}<b>${tk("tro_" + tro)}</b><small>${t(("rar_" + TROPHY_RARITY[tro]) as "rar_0")}</small></div>` : "";
    showModal(t("incTitle"), `<p class="ageQuote">${t("incWin", { rival, region })}</p>${troHtml}<div class="bigGold">+${fmt(gold)}</div>`, [{ label: t("storyContinue"), cls: "primary" }], { icon: icon("swords") });
    this.ui.dirty = true;
    this.save();
  }

  private loseIncursion(fought: boolean): void {
    const s = this.s;
    const inc = s.incursion;
    if (!inc) return;
    const rg = s.regions[inc.k];
    const rival = tk("rival_" + RIVALS[inc.rival].id);
    const region = tk("reg_" + REGIONS[inc.k].id);
    rg.xp = 0;
    rg.youth = 0;
    s.mood = Math.max(0, s.mood - 8);
    const lost = fought ? raidLosses(s.mercs) : 0;
    s.mercs -= lost;
    s.incursion = null;
    sfx.error();
    this.toasts.show(`${icon("swords")} ${t(fought ? "incLostFight" : "incLostIgnored", { rival, region, n: lost })}`, "bad", 6000);
    this.ui.dirty = true;
    this.save();
  }

  openForge(): void {
    const s = this.s;
    const lang = s.settings.lang;
    void lang;
    const rows = ARTIFACTS.map((a) => {
      const def = REGIONS[a.region];
      const owned = s.artifacts.includes(a.id);
      const on = s.artEquip.includes(a.id);
      const cost = artCost(a);
      const [c, r, l] = def.trophies;
      const need = owned
        ? ""
        : `<small class="need">${icon(l, "ico xs")}${s.trophies[l] ? "✓" : "✗"} ${icon(c, "ico xs")}${Math.max(0, (s.trophies[c] ?? 0) - 1)}/${cost.common} ${icon(r, "ico xs")}${Math.max(0, (s.trophies[r] ?? 0) - 1)}/${cost.rare} ${icon("mat_steel", "ico xs")}${s.mats.steel}/${cost.steel}</small>`;
      const btn = owned
        ? `<button class="mini${on ? " active" : ""}" data-eq="${a.id}">${on ? t("artOn") : t("artEquip")}</button>`
        : `<button class="mini${canForgeArt(s, a) ? " ready" : ""}" data-forge="${a.id}" ${canForgeArt(s, a) ? "" : "disabled"}>${t("artForge")}</button>`;
      return `<div class="artRow${owned ? " owned" : ""}${on ? " on" : ""}">${icon(a.id, "ico")}<div class="am"><b>${tk("art_" + a.id)}</b><small>${t(("artk_" + a.kind) as "artk_speed", { p: Math.round(a.value * 100), n: a.value })}</small>${need}</div>${btn}</div>`;
    }).join("");
    showModal(t("artTitle"), `<p class="muted small">${t("artIntro", { n: ART_SLOTS })}</p><div class="artList">${rows}</div>`, [{ label: t("close"), cls: "primary" }], { icon: icon("anvil"), dismissable: true });
    const list = document.querySelector<HTMLElement>("#modal .artList");
    list?.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("button");
      if (!b) return;
      if (b.dataset.forge) this.forgeArtifact(b.dataset.forge);
      else if (b.dataset.eq) this.toggleArtifact(b.dataset.eq);
    });
  }

  forgeArtifact(id: string): void {
    const s = this.s;
    const a = ART_BY_ID[id];
    if (!a || !forgeArt(s, a)) return;
    sfx.sword();
    sfx.fanfare();
    happytime();
    this.bard("forged", { item: tk("art_" + id) });
    showModal(
      t("artForged"),
      `<div class="troDrop r2">${icon(id, "ico big")}<b>${tk("art_" + id)}</b><small>${t(("artk_" + a.kind) as "artk_speed", { p: Math.round(a.value * 100), n: a.value })}</small></div><p class="ageQuote">${tk("artd_" + id)}</p>`,
      [{ label: t("storyContinue"), cls: "primary", onClick: () => window.setTimeout(() => this.openForge(), 40) }],
      { icon: icon("anvil") },
    );
    this.ui.dirty = true;
    this.save();
  }

  toggleArtifact(id: string): void {
    const s = this.s;
    if (!s.artifacts.includes(id)) return;
    const i = s.artEquip.indexOf(id);
    if (i >= 0) s.artEquip.splice(i, 1);
    else {
      if (s.artEquip.length >= ART_SLOTS) s.artEquip.shift();
      s.artEquip.push(id);
    }
    sfx.coin();
    this.ui.dirty = true;
    this.save();
    this.openForge();
  }

  setTax(n: number): void {
    if (n < 0 || n >= TAXES.length) return;
    this.s.tax = n;
    sfx.coin();
    this.ui.dirty = true;
    this.save();
  }

  openRegion(k: number): void {
    const s = this.s;
    const def = REGIONS[k];
    if (!def || !regionVisible(s, k)) return;
    if (s.revolt === k) {
      this.openRevolt();
      return;
    }
    if (s.incursion?.k === k) {
      this.openIncursion();
      return;
    }
    const rg = s.regions[k];
    const name = tk("reg_" + def.id);
    const income = this.income();
    const loot = def.trophies
      .map((id, j) => {
        const n = s.trophies[id] ?? 0;
        const ch = trophyChance(rg.lv, j as Rarity);
        return `<div class="tro r${j}${n ? "" : " miss"}">${icon(id, "ico")}<small>${tk("tro_" + id)}</small><em>${ch > 0 ? `%${(ch * 100).toFixed(ch < 0.1 ? 1 : 0)}` : t("regLv", { n: j === 1 ? 3 : 6 })}</em>${n ? `<b>×${n}</b>` : ""}</div>`;
      })
      .join("");
    if (!rg.open) {
      const cost = regionCost(k);
      const ok = s.gold >= cost;
      showModal(
        name,
        `<p class="ageQuote">${tk("regd_" + def.id)}</p><p>${t("regLockedText")}</p><div class="troRow">${loot}</div>`,
        [
          { label: t("close"), cls: "secondary" },
          { label: `${t("regOpen")} · ${fmt(cost)}`, cls: "primary" + (ok ? "" : " disabled"), keepOpen: !ok, onClick: () => (ok ? this.unlockRegion(k) : sfx.error()) },
        ],
        { icon: icon("village") },
      );
      return;
    }
    const now = Date.now();
    const odds = raidOdds(s, k);
    const pen = threatMult(s, regionNeed(k, rg.lv));
    const cd = rg.at > now;
    const youth = Math.floor(rg.youth);
    const hire = hireCost(income, s) * youth;
    const q = QUEST_STEPS[rg.quest];
    const qLine = q
      ? `<p class="quest${questDone(s, k) ? " done" : ""}">${icon("scroll", "ico xs")} ${t(("rq_" + q.kind) as "rq_raids", { n: q.n, have: q.kind === "raids" ? rg.raids : q.kind === "level" ? rg.lv : 0 })} · +${questReward(k, rg.quest)} ${tk("mat_steel")}</p>`
      : `<p class="quest done">${t("rqAll")}</p>`;
    const body =
      `<div class="regHead"><b>${t("regLvl", { n: rg.lv, max: REGION_MAX })}</b><div class="relBar"><i class="pos" style="left:0;width:${rg.lv >= REGION_MAX ? 100 : (rg.xp / xpNeed(rg.lv)) * 100}%"></i></div></div>` +
      `<p class="ageQuote">${tk("regd_" + def.id)}</p>` +
      `<p class="muted small">${t("regFoe", { foe: tk("regf_" + def.id) })} · ${t("ruinOdds", { p: Math.round(odds * 100) })}${pen > 1 ? "<br>" + t("underNam", { p: Math.round((pen - 1) * 100) }) : ""}</p>` +
      `<p>${t("regLoot", { n: raidMats(s, k), mat: tk("mat_" + def.mat) })}</p><div class="troRow">${loot}</div>` +
      (isNight(now) ? `<p class="boostLine">${t("nightRaid", { p: Math.round(NIGHT_RAID * 100) })}</p>` : "") +
      (weatherAt(now) !== "clear" ? `<p class="boostLine">${icon("w_" + weatherAt(now), "ico xs")} ${t(("wname_" + weatherAt(now)) as "wname_clear")}</p>` : "") +
      qLine +
      `<p class="muted small">${icon("village", "ico xs")} ${t("regYouth", { n: youth, max: youthCap(s, k) })} · ${t("mercWage", { g: fmt(wagePer(s, income)) })}</p>`;
    const buttons: ModalButton[] = [{ label: t("close"), cls: "secondary" }];
    if (q && questDone(s, k)) buttons.push({ label: `${t("rqClaim")} +${questReward(k, rg.quest)}`, cls: "primary", onClick: () => this.claimRegionQuest(k) });
    if (youth > 0) buttons.push({ label: `${t("regHire", { n: youth })} · ${fmt(hire)}`, cls: "choice" + (s.gold >= hire ? "" : " disabled"), keepOpen: s.gold < hire, onClick: () => (s.gold >= hire ? this.hireYouth(k) : sfx.error()) });
    buttons.push({
      label: cd ? t("regRest", { t: fmtTime((rg.at - now) / 1000) }) : t("regRaid"),
      cls: "primary" + (cd ? " disabled" : ""),
      keepOpen: cd,
      onClick: () => (cd ? sfx.error() : this.raidRegion(k)),
    });
    showModal(name, body, buttons, { icon: icon(def.trophies[2]) });
  }

  unlockRegion(k: number): void {
    const s = this.s;
    const cost = regionCost(k);
    if (s.regions[k].open || s.gold < cost) return;
    s.gold -= cost;
    s.regions[k].open = true;
    s.regions[k].youth = 3;
    sfx.fanfare();
    this.bard("conquer", { region: tk("reg_" + REGIONS[k].id) });
    this.toasts.show(`${icon("village")} ${t("regOpened", { region: tk("reg_" + REGIONS[k].id) })}`, "gold", 3500);
    this.ui.dirty = true;
    this.save();
    window.setTimeout(() => this.openRegion(k), 60);
  }

  raidRegion(k: number): void {
    const s = this.s;
    const rg = s.regions[k];
    const now = Date.now();
    if (!rg.open || rg.at > now || s.revolt === k) return;
    const def = REGIONS[k];
    const win = Math.random() < raidOdds(s, k);
    rg.at = now + RAID_CD;
    const p = this.map.px(def.x, def.y);
    if (!win) {
      const lostM = raidLosses(s.mercs);
      s.mercs -= lostM;
      const lostS = Math.min(idleSoldiers(s), Math.ceil(idleSoldiers(s) * 0.1));
      if (lostS > 0) takeCasualties(s, lostS);
      sfx.error();
      showModal(tk("reg_" + def.id), `<p class="ageQuote">${t("raidLose")}</p><p class="muted small">${t("raidLost", { m: lostM, s: lostS })}</p>`, [{ label: t("storyContinue"), cls: "primary" }], { icon: icon("swords") });
      this.save();
      return;
    }
    const mats = raidMats(s, k);
    const gold = this.income() * raidGoldSec(s, k);
    s.mats[def.mat] += mats;
    earn(s, gold);
    rg.raids++;
    s.mood = Math.min(100, s.mood + 1);
    let up = false;
    if (rg.lv < REGION_MAX) {
      rg.xp++;
      if (rg.xp >= xpNeed(rg.lv)) {
        rg.xp = 0;
        rg.lv++;
        up = true;
      }
    }
    const tro = rollTrophy(s, k);
    const fresh = tro ? !(s.trophies[tro] ?? 0) : false;
    if (tro) s.trophies[tro] = (s.trophies[tro] ?? 0) + 1;
    this.seasonPts("region");
    sfx.sword();
    sfx.coin();
    this.map.addTextAt(p, "+" + fmt(gold), "#ffd56a", performance.now());
    if (tro || up) {
      const rar = tro ? TROPHY_RARITY[tro] : 0;
      if (tro && rar === 2) {
        this.bard("legend", { item: tk("tro_" + tro), region: tk("reg_" + def.id) });
        happytime();
      }
      sfx.fanfare();
      const troHtml = tro ? `<div class="troDrop r${rar}">${icon(tro, "ico big")}<b>${tk("tro_" + tro)}</b><small>${t(("rar_" + rar) as "rar_0")}${fresh ? " · " + t("troNew") : " ×" + s.trophies[tro]}</small><p class="muted small">${t("troBonus", { p: Math.round(TROPHY_BONUS[rar] * 100 * (fresh ? 1 : 0.25)) })}</p></div>` : "";
      const upHtml = up ? `<p class="boostLine">${t("regUp", { region: tk("reg_" + def.id), n: rg.lv })}</p>` : "";
      const conq = tro && fresh && regionConquered(s, k) ? `<p class="boostLine">${t("regConquered", { p: Math.round(CONQUER_BONUS * 100) })}</p>` : "";
      showModal(tk("reg_" + def.id), `${troHtml}${upHtml}${conq}<p class="muted small">+${mats} ${tk("mat_" + def.mat)} · +${fmt(gold)}</p>`, [{ label: t("storyContinue"), cls: "primary" }], { icon: icon(tro ?? "village"), dismissable: true });
    } else this.toasts.show(`${icon("swords")} ${t("raidWin", { n: mats, mat: tk("mat_" + def.mat), g: fmt(gold) })}`, "gold", 2500);
    this.ui.dirty = true;
    this.save();
  }

  hireYouth(k: number): void {
    const s = this.s;
    const rg = s.regions[k];
    const n = Math.floor(rg.youth);
    const cost = hireCost(this.income(), s) * n;
    if (n <= 0 || s.gold < cost) return;
    s.gold -= cost;
    rg.youth -= n;
    s.mercs += n;
    sfx.sword();
    this.toasts.show(`${icon("merc")} ${t("mercHired", { n, region: tk("reg_" + REGIONS[k].id) })}`, "gold", 3000);
    this.ui.dirty = true;
    this.save();
    window.setTimeout(() => this.openRegion(k), 40);
  }

  claimRegionQuest(k: number): void {
    const s = this.s;
    const rg = s.regions[k];
    if (!questDone(s, k)) return;
    const steel = questReward(k, rg.quest);
    s.mats.steel += steel;
    rg.quest++;
    sfx.fanfare();
    this.toasts.show(`${icon("scroll")} ${t("rqDone", { n: steel })}`, "gold", 3000);
    this.ui.dirty = true;
    this.save();
    window.setTimeout(() => this.openRegion(k), 40);
  }

  openRevolt(): void {
    const s = this.s;
    if (s.revolt < 0) return;
    const region = tk("reg_" + REGIONS[s.revolt].id);
    const odds = Math.min(0.95, winChance(Math.max(1, raidPower(s)), revoltFoe(s)));
    const pardon = this.income() * 120;
    showModal(
      t("revoltTitle"),
      `<p class="ageQuote">${t("revoltText", { region })}</p><p class="muted small">${t("revoltEffect", { p: Math.round((1 - REVOLT_MULT) * 100) })}</p>`,
      [
        { label: t("close"), cls: "secondary" },
        { label: `${t("revoltPardon")} · ${fmt(pardon)}`, cls: "choice" + (s.gold >= pardon ? "" : " disabled"), keepOpen: s.gold < pardon, onClick: () => (s.gold >= pardon ? this.endRevolt(false, pardon) : sfx.error()) },
        { label: `${t("revoltCrush")} · %${Math.round(odds * 100)}`, cls: "primary", onClick: () => this.crushRevolt(odds) },
      ],
      { icon: icon("revolt"), dismissable: true },
    );
  }

  private crushRevolt(odds: number): void {
    const s = this.s;
    if (Math.random() < odds) {
      this.endRevolt(true, 0);
      return;
    }
    const lost = Math.min(s.mercs, Math.ceil(s.mercs * 0.25));
    s.mercs -= lost;
    s.mood = Math.max(0, s.mood - 5);
    sfx.error();
    this.toasts.show(t("revoltFail", { n: lost }), "bad", 4000);
    this.save();
  }

  private endRevolt(force: boolean, cost: number): void {
    const s = this.s;
    if (cost > 0) s.gold -= cost;
    s.revolt = -1;
    s.mood = force ? Math.max(s.mood, 30) : Math.min(100, s.mood + 25);
    sfx.fanfare();
    this.toasts.show(t(force ? "revoltCrushed" : "revoltPardoned"), "gold", 4000);
    this.ui.dirty = true;
    this.save();
  }

  tapNode(k: number): void {
    const s = this.s;
    const n = NODES[k];
    const now = Date.now();
    if (!n || !nodeOpen(s, k)) return;
    if (!nodeReady(s, k, now)) {
      this.toasts.show(t("nodeWait", { t: fmtTime((s.nodeAt[k] - now) / 1000) }), "info");
      return;
    }
    const p = this.map.px(n.x, n.y);
    const mat = gatherMat(n.kind);
    if (mat) {
      const v = gatherYield(s, k);
      s.mats[mat] += v;
      s.nodeAt[k] = now + GATHER_MS;
      s.stats.gathered++;
      sfx.coin();
      this.map.addTextAt(p, `+${v} ${tk("mat_" + mat)}`, "#c8f08a", performance.now());
      this.save();
      return;
    }
    this.openRuin(k);
  }

  private ruinOdds(k: number): number {
    const s = this.s;
    const me = heroPower(s) + companionPower(s);
    return Math.min(0.9, winChance(me, me * 0.8 * threatMult(s, ruinNeed(k))));
  }

  private openRuin(k: number): void {
    const s = this.s;
    if (!s.hero) {
      this.toasts.show(t("ruinNoHero"), "info");
      return;
    }
    const odds = this.ruinOdds(k);
    const steel = 2 + NODES[k].route;
    const pen = threatMult(s, ruinNeed(k));
    showModal(
      t("ruinTitle"),
      `<p class="ageQuote">${t("ruinText")}</p><p>${t("ruinReward", { n: steel })}</p><p class="muted small">${t("ruinOdds", { p: Math.round(odds * 100) })}${pen > 1 ? "<br>" + t("underNam", { p: Math.round((pen - 1) * 100) }) : ""}</p>`,
      [
        { label: t("close"), cls: "secondary" },
        { label: t("ruinGo"), cls: "primary", onClick: () => this.fightRuin(k) },
      ],
      { icon: icon("mystery") },
    );
  }

  private fightRuin(k: number): void {
    const s = this.s;
    const now = Date.now();
    if (!nodeReady(s, k, now) || !s.hero) return;
    const win = Math.random() < this.ruinOdds(k);
    s.nodeAt[k] = now + (win ? RUIN_MS : RUIN_MS / 3);
    const p = this.map.px(NODES[k].x, NODES[k].y);
    if (!win) {
      sfx.error();
      this.toasts.show(t("ruinLose"), "bad", 3000);
      this.save();
      return;
    }
    const steel = 2 + NODES[k].route;
    const gold = this.income() * 45;
    s.mats.steel += steel;
    earn(s, gold);
    s.stats.ruins++;
    sfx.sword();
    sfx.fanfare();
    this.map.addTextAt(p, `+${steel} ${tk("mat_steel")}`, "#9fd8ff", performance.now());
    this.toasts.show(`${icon("chest")} ${t("ruinWin", { n: steel, g: fmt(gold) })}`, "gold", 3500);
    this.ui.dirty = true;
    this.save();
  }

  private openGovernor(city: string): void {
    const s = this.s;
    const lang = s.settings.lang;
    const cur = governorOf(s, city);
    const ids = COMPANION_IDS.filter((id) => (s.companions[id] ?? 0) > 0);
    const buttons: ModalButton[] = ids.map((id) => {
      const at = governorCity(s, id);
      const pct = Math.round(GOV_STEP * (s.companions[id] ?? 0) * 100);
      const where = at && at !== city ? ` · ${tk("city_" + at)}` : "";
      return {
        label: `${id === cur ? "✓ " : ""}${COMPANIONS[id][lang].name} · +${pct}%${where}`,
        cls: "choice",
        onClick: () => this.setGovernor(city, id === cur ? null : id),
      };
    });
    buttons.push({ label: t("close"), cls: "secondary" });
    showModal(t("govTitle", { city: tk("city_" + city) }), `<p>${t("govText", { p: Math.round(GOV_STEP * 100) })}</p>`, buttons, { icon: cityThumb(city, "cityBig") });
  }

  setGovernor(city: string, id: CompanionId | null): void {
    const s = this.s;
    if (id) {
      if (!(s.companions[id] ?? 0)) return;
      const old = governorCity(s, id);
      if (old) delete s.governors[old];
      s.governors[city] = id;
      sfx.fanfare();
      this.toasts.show(t("govSet", { name: COMPANIONS[id][s.settings.lang].name, city: tk("city_" + city) }), "gold", 3000);
    } else delete s.governors[city];
    this.ui.dirty = true;
    this.save();
  }

  forceCourt(id = "harvest"): void {
    this.s.court = id;
    this.openCourt();
  }

  private courtTick(now: number): void {
    const s = this.s;
    if (!isOpen(s, "court") || s.court || now < s.nextCourt || modalOpen() || document.hidden || this.calm(now)) return;
    const p = pickPetition(s);
    s.court = p.id;
    s.storiesSeen.push("court_" + p.id);
    if (s.storiesSeen.length > 40) s.storiesSeen.shift();
    sfx.event();
    this.toasts.show(`${icon(p.icon)} ${t("courtArrived", { who: p.who[s.settings.lang] })}`, "info", 4500);
    this.save();
  }

  openCourt(): void {
    const s = this.s;
    const p = s.court ? petitionById(s.court) : null;
    if (!p) {
      showModal(
        t("courtTitle"),
        `<div class="ageEmblem">${icon("crown", "ico big")}</div><p>${t("courtEmpty", { t: fmtTime(Math.max(0, (s.nextCourt - Date.now()) / 1000)) })}</p><p class="muted small">${t("courtLaw", { n: s.stats.decrees })}</p>`,
        [{ label: t("close"), cls: "primary" }],
        { icon: icon("crown") },
      );
      return;
    }
    const lang = s.settings.lang;
    const income = this.income();
    showModal(
      p.who[lang],
      `<div class="ageEmblem">${icon(p.icon, "ico big")}</div><p class="ageQuote">${p.text[lang]}</p><p class="muted small">${t("courtAs", { ruler: rulerTitle(s, s.ruler) })}</p>`,
      p.choices.map((d) => ({ label: this.decreeLabel(d, income, lang), cls: "choice", onClick: () => this.passDecree(p.id, d) })),
      { icon: icon("crown"), dismissable: true },
    );
  }

  private decreeLabel(d: Decree, income: number, lang: "tr" | "en"): string {
    const cost = d.goldSec && d.goldSec < 0 ? ` · −${fmt(income * -d.goldSec)}` : d.goldSec && d.goldSec > 0 ? ` · +${fmt(income * d.goldSec)}` : "";
    return `${d.label[lang]}${cost}`;
  }

  private passDecree(id: string, d: Decree): void {
    const s = this.s;
    const income = this.income();
    if (!canAfford(s, d, income)) {
      sfx.error();
      this.toasts.show(t("noGold"), "bad");
      window.setTimeout(() => this.openCourt(), 30);
      return;
    }
    if (d.goldSec && d.goldSec > 0) earn(s, income * d.goldSec);
    else if (d.goldSec && d.goldSec < 0) s.gold -= income * -d.goldSec;
    if (d.mats) for (const [k, n] of Object.entries(d.mats) as [keyof typeof s.mats, number][]) s.mats[k] += n;
    if (d.steel) s.mats.steel += d.steel;
    if (d.boostSec) {
      const now = Date.now();
      s.boostUntil = Math.max(s.boostUntil, now) + d.boostSec * 1000;
      s.boostMult = Math.max(s.boostMult, 1.5);
    }
    s.court = null;
    s.nextCourt = Date.now() + (4 + Math.random() * 2) * 60_000;
    s.stats.decrees++;
    const lang = s.settings.lang;
    const who = petitionById(id)?.who[lang] ?? "";
    sfx.fanfare();
    this.bard("decree", { who });
    showModal(t("courtTitle"), `<p class="ageQuote">${d.result[lang]}</p><p class="muted small">${t("courtLaw", { n: s.stats.decrees })}</p>`, [{ label: t("storyContinue"), cls: "primary" }], { icon: icon("crown") });
    this.ui.dirty = true;
    this.save();
  }

  private income(): number {
    return Math.max(1, totalIncomePerSec(this.s, Date.now(), false, false));
  }

  buyStock(i: number): void {
    const s = this.s;
    const now = Date.now();
    const income = this.income();
    if (!canStock(s, i, income)) {
      sfx.error();
      this.toasts.show(t(s.gold < lotCost(income) ? "noGold" : "bazaarFull"), "bad");
      return;
    }
    stockBuy(s, i, now, income);
    sfx.buy();
    this.toasts.show(`${icon("bedesten")} ${t("bazaarBought", { good: goodsName(i) })}`, "good", 1800);
    this.save();
  }

  sellStock(i: number): void {
    const s = this.s;
    const { got, gain } = stockSell(s, i, Date.now());
    if (got <= 0) return;
    const profit = Math.max(0, gain);
    s.gold += got - profit;
    earn(s, profit);
    if (profit > 0) {
      s.stats.bazaarGain += profit;
      this.seasonPts("bazaar");
      sfx.coin();
    } else if (gain < 0) sfx.error();
    else sfx.coin();
    const pct = `${gain >= 0 ? "+" : "-"}${fmt(Math.abs(gain))}`;
    this.toasts.show(`${icon("bedesten")} ${t("bazaarSold", { good: goodsName(i), g: fmt(got), p: pct })}`, gain >= 0 ? "gold" : "bad", 3500);
    this.save();
  }

  diplo(id: string, act: DiploAct): void {
    const s = this.s;
    const now = Date.now();
    const rv = RIVALS.find((r) => r.id === id);
    if (!rv || !rivalReached(s, rv)) return;
    const r = relation(s, id, now);
    if (r.cd > now) {
      sfx.error();
      return;
    }
    const income = this.income();
    const name = tk("rival_" + id);
    if (act === "gift") {
      const cost = giftCost(income);
      if (s.gold < cost) {
        sfx.error();
        this.toasts.show(t("noGold"), "bad");
        return;
      }
      s.gold -= cost;
      r.rel = Math.min(100, r.rel + GIFT_REL);
      r.cd = now + 60_000;
      sfx.coin();
      this.toasts.show(`${icon("chest")} ${t("diploGiftDone", { name, n: GIFT_REL })}`, "good", 3000);
    } else if (act === "ally") {
      if (r.rel < ALLY_NEED) return;
      r.ally = now + ALLY_MS;
      r.cd = now + ALLY_MS;
      s.stats.alliances++;
      this.seasonPts("ally");
      sfx.fanfare();
      this.toasts.show(`${icon("ally")} ${t("diploAllyDone", { name, p: Math.round((ALLY_MULT - 1) * 100) })}`, "gold", 4500);
      this.bard("ally", { name });
    } else if (act === "tribute") {
      r.cd = now + DIPLO_CD;
      if (Math.random() < tributeOdds(s, rv)) {
        const gold = income * 240;
        earn(s, gold);
        r.rel = Math.max(-100, r.rel - 35);
        sfx.coin();
        this.toasts.show(`${icon("coins")} ${t("diploTribOk", { name, g: fmt(gold) })}`, "gold", 4000);
      } else {
        r.rel = Math.max(-100, r.rel - 15);
        sfx.error();
        this.toasts.show(`${icon("swords")} ${t("diploTribNo", { name })}`, "bad", 4000);
      }
    } else this.declareWar(id);
    this.ui.dirty = true;
    this.save();
  }

  openWar(id: string): void {
    const s = this.s;
    const rv = RIVALS.find((r) => r.id === id);
    if (!rv) return;
    const name = tk("rival_" + id);
    showModal(
      t("warTitle", { name }),
      `<div class="ageEmblem">${icon("swords", "ico big")}</div><p>${t("warText", { name, n: fmt(idleSoldiers(s)), p: Math.round(warOdds(s, rv) * 100) })}</p>`,
      [
        { label: t("cancel"), cls: "secondary same" },
        { label: t("diploWar"), cls: "primary same", onClick: () => this.diplo(id, "war") },
      ],
      { icon: icon("swords") },
    );
  }

  private declareWar(id: string): void {
    const s = this.s;
    const now = Date.now();
    const rv = RIVALS.find((r) => r.id === id)!;
    const r = relation(s, id, now);
    const name = tk("rival_" + id);
    const idle = idleSoldiers(s);
    const win = Math.random() < warOdds(s, rv);
    r.cd = now + DIPLO_CD * 2;
    r.ally = 0;
    const loss = takeCasualties(s, Math.floor(idle * (win ? 0.08 : 0.25)));
    const lossLine = `<p class="muted small">${t("warLost", { d: fmt(loss.dead), w: fmt(loss.wounded) })}</p>`;
    sfx.sword();
    if (win) {
      const gold = this.income() * 600;
      earn(s, gold);
      s.mats.steel += 10;
      r.spoils = now + SPOILS_MS;
      r.rel = -60;
      s.stats.wars++;
      this.seasonPts("war");
      this.dropRelic(0.15);
      sfx.fanfare();
      happytime();
      this.bard("warWon", { name });
      showModal(
        t("warWinTitle"),
        `<div class="ageEmblem relicGlow">${icon("swords", "ico big")}</div><p class="ageQuote">${t("warWin", { name, p: Math.round((SPOILS_MULT - 1) * 100), m: SPOILS_MS / 60_000 })}</p><div class="bigGold">+${fmt(gold)}</div><p class="boostLine">${icon("mat_steel", "ico xs")} +10</p>${lossLine}`,
        [{ label: t("storyContinue"), cls: "primary" }],
      );
    } else {
      r.rel = Math.max(-100, r.rel - 20);
      sfx.error();
      showModal(t("warLoseTitle"), `<div class="ageEmblem">${icon("swords", "ico big")}</div><p>${t("warLose", { name })}</p>${lossLine}`, [{ label: t("storyContinue"), cls: "primary" }]);
    }
  }

  startExpedition(): void {
    const s = this.s;
    const now = Date.now();
    if (!s.hero) return;
    if (s.expedition) {
      this.openExpedition();
      return;
    }
    rollExpTickets(s, now);
    if (s.expTickets <= 0) {
      sfx.error();
      return;
    }
    if (s.expTickets >= EXP_TICKETS) s.expAt = now;
    s.expTickets--;
    s.expedition = { seed: Math.floor(Math.random() * 1e9), row: 0, hp: EXP_HP, secs: 0, steel: 0, xp: 0, path: [] };
    sfx.event();
    this.ui.dirty = true;
    this.save();
    this.openExpedition();
  }

  openExpedition(note = "", good = true): void {
    const s = this.s;
    const e = s.expedition;
    if (!e) return;
    const income = this.income();
    const rows: string[] = [];
    for (let r = EXP_ROWS - 1; r >= 0; r--) {
      const nodes = expRow(e.seed, r)
        .map((k, j) => {
          const cur = r === e.row;
          const picked = r < e.row && e.path[r] === j;
          const fight = k === "fight" || k === "elite" || k === "boss";
          const odds = cur && fight ? `<small>%${Math.round(expOdds(s, r, k) * 100)}</small>` : "";
          const cls = cur ? "cur" : picked ? "picked" : r < e.row ? "past" : "future";
          return `<button class="expNode ${cls} k_${k}" data-k="${j}" ${cur ? "" : "disabled"}>${icon(NODE_ICON[k], "ico")}<span>${tk("expNode_" + k)}</span>${odds}</button>`;
        })
        .join("");
      rows.push(`<div class="expRow${r === e.row ? " cur" : ""}"><i>${r + 1}</i>${nodes}</div>`);
    }
    const hearts = Array.from({ length: EXP_HP }, (_, k) => `<i class="${k < e.hp ? "on" : ""}">❤</i>`).join("");
    const head = `<div class="expHead"><span class="hearts">${hearts}</span><span>${t("expLoot")}: <b>${fmt(e.secs * income)}</b>${e.steel ? ` · ${icon("mat_steel", "ico xs")}${e.steel}` : ""} · ${e.xp} XP</span></div>`;
    const noteHtml = note ? `<p class="expNote ${good ? "good" : "bad"}">${note}</p>` : "";
    showModal(t("expTitle"), `${head}${noteHtml}<div class="expMap">${rows.join("")}</div>`, [{ label: t("expRetreat"), cls: "secondary", onClick: () => this.endExpedition("retreat") }], { icon: icon("sefer"), dismissable: true });
    document.querySelectorAll<HTMLButtonElement>("#modal .expNode.cur").forEach((b) => b.addEventListener("click", () => this.expPick(Number(b.dataset.k))));
  }

  private expPick(j: number): void {
    const s = this.s;
    const e = s.expedition;
    if (!e) return;
    const kind = expRow(e.seed, e.row)[j];
    if (!kind) return;
    const income = this.income();
    const step = e.row + 1;
    let note = "";
    let good = true;
    if (kind === "fight" || kind === "elite" || kind === "boss") {
      const win = Math.random() < expOdds(s, e.row, kind);
      sfx.sword();
      if (win) {
        const secs = kind === "boss" ? 600 : kind === "elite" ? 90 * step : 40 * step;
        e.secs += secs;
        e.steel += kind === "boss" ? 10 : kind === "elite" ? 3 : 0;
        e.xp += 30 * step * (kind === "elite" ? 2 : kind === "boss" ? 4 : 1);
        note = t("expWin", { g: fmt(secs * income) });
      } else {
        e.hp--;
        good = false;
        note = kind === "boss" ? t("expBossLose") : t("expLose");
      }
      if (kind === "boss") {
        if (win) return this.endExpedition("victory");
        if (e.hp <= 0) return this.endExpedition("failed");
        return this.openExpedition(note, false);
      }
    } else if (kind === "treasure") {
      const secs = 70 * step;
      e.secs += secs;
      e.steel += 1;
      sfx.coin();
      note = t("expTreasure", { g: fmt(secs * income) });
    } else if (kind === "shrine") {
      sfx.event();
      if (e.hp < EXP_HP) {
        e.hp++;
        note = t("expShrine");
      } else {
        e.xp += 60 * step;
        note = t("expShrineXp", { n: 60 * step });
      }
    } else {
      const roll = Math.random();
      if (roll < 0.4) {
        const secs = 120 * step;
        e.secs += secs;
        sfx.coin();
        note = t("expMystGold", { g: fmt(secs * income) });
      } else if (roll < 0.7) {
        e.hp = Math.min(EXP_HP, e.hp + 1);
        sfx.event();
        note = t("expMystHeal");
      } else {
        e.hp--;
        good = false;
        sfx.error();
        note = t("expMystTrap");
      }
    }
    e.path.push(j);
    e.row++;
    if (e.hp <= 0) return this.endExpedition("failed");
    this.save();
    this.openExpedition(note, good);
  }

  private endExpedition(how: "victory" | "failed" | "retreat"): void {
    const s = this.s;
    const e = s.expedition;
    if (!e) return;
    s.expedition = null;
    const ratio = how === "failed" ? 0.5 : 1;
    const gold = e.secs * this.income() * ratio;
    const steel = Math.floor(e.steel * ratio);
    if (gold > 0) earn(s, gold);
    s.mats.steel += steel;
    if (s.hero && e.xp > 0) gainXp(s, Math.floor(e.xp * ratio));
    const hero = s.hero?.name ?? "";
    let text = t("expRetreated");
    if (how === "victory") {
      s.stats.expeditions++;
      this.seasonPts("expedition");
      this.dropRelic(0.35);
      this.bard("expBoss", { hero });
      sfx.fanfare();
      happytime();
      text = t("expVictory", { hero });
    } else if (how === "failed") {
      sfx.error();
      text = t("expFailed", { hero });
    }
    showModal(
      t("expDoneTitle"),
      `<div class="ageEmblem${how === "victory" ? " relicGlow" : ""}">${icon(how === "victory" ? "evren" : "sefer", "ico big")}</div><p class="ageQuote">${text}</p><div class="bigGold">+${fmt(gold)}</div><p class="boostLine">${steel ? `${icon("mat_steel", "ico xs")} +${steel} · ` : ""}${Math.floor(e.xp * ratio)} XP</p>`,
      [{ label: t("storyContinue"), cls: "primary" }],
      { dismissable: false },
    );
    this.ui.dirty = true;
    this.save();
  }

  private festTick(now: number): void {
    const s = this.s;
    if (!isOpen(s, "events") || modalOpen() || document.hidden || this.calm(now)) return;
    const f = activeFestival(now);
    if (!f) return;
    const key = festivalKey(f, now);
    if (s.festSeen === key) return;
    s.festSeen = key;
    const gold = this.income() * 300;
    earn(s, gold);
    s.mats.steel += 5;
    const name = tk("fest_" + f.id);
    sfx.fanfare();
    window.setTimeout(() => sfx.kopuz(), 500);
    showModal(
      name,
      `<div class="ageEmblem relicGlow">${icon("fest_" + f.id, "ico big")}</div><p class="ageQuote">${tk("festText_" + f.id)}</p><p class="boostLine">${tk("festD_" + f.id)}</p><p class="muted small">${t("festGift")}</p><div class="bigGold">+${fmt(gold)}</div><p class="boostLine">${icon("mat_steel", "ico xs")} +5</p>`,
      [{ label: t("storyContinue"), cls: "primary" }],
      { icon: icon("fest_" + f.id) },
    );
    this.bard("fest", { fest: name });
    this.ui.dirty = true;
    this.save();
  }

  openTree(): void {
    const s = this.s;
    const entries = [...s.lineage.slice(-14), { ...s.ruler, best: s.runEarned, age: s.age, spouse: s.spouse ?? undefined, now: true }];
    const nodes = entries.map((l) => {
      const fallen = s.fallenHeroes.filter((f) => f.gen === l.gen);
      const sp = l.spouse ? houseDef(l.spouse) : null;
      const spouse = sp ? `<small class="tsp">${icon("rings", "ico xs")} ${sp.bride} · ${tk("house_" + sp.id)}</small>` : `<small class="muted">${t("treeSingle")}</small>`;
      const chips = fallen.map((f) => `<small class="tfall">${icon("balbal", "ico xs")} ${t("treeFallen", { name: f.name.replace(/</g, "") })}</small>`).join("");
      const isNow = "now" in l;
      return `<div class="tnode${isNow ? " now" : ""}"><span class="tgen">${l.gen}</span><div class="tmid"><b>${rulerTitle(s, l)}</b><small>${tk("trait_" + l.trait)} · ${tk("age_" + AGES[l.age].id)}${isNow ? ` · <em>${t("treeNow")}</em>` : ""}</small>${spouse}${chips}</div><b class="tbest">${fmt(l.best)}</b></div>`;
    });
    const married = s.lineage.filter((l) => l.spouse).length + (s.spouse ? 1 : 0);
    const house = s.house ? s.house.name.replace(/</g, "") : t("houseNone");
    showModal(
      t("treeTitle", { house }),
      `<div class="treeHead">${s.house ? crestHtml(s.house, "crest") : icon("soyagaci", "ico big")}<div><p class="muted small">${t("treeIntro")}</p><b>${t("treeStats", { g: s.ruler.gen, m: married, f: s.fallenHeroes.length })}</b></div></div><div class="tree">${nodes.join('<i class="tlink"></i>')}</div>`,
      [{ label: t("close"), cls: "primary" }],
      { icon: icon("soyagaci") },
    );
    const tree = document.querySelector("#modal .tree");
    if (tree) tree.scrollTop = tree.scrollHeight;
  }

  openMonument(): void {
    const s = this.s;
    const st = monumentStage(s);
    const next = MONUMENT_STEPS[st];
    showModal(
      t("monTitle"),
      `<div class="ageEmblem">${icon("monument", "ico big")}</div><p>${t("monText")}</p><div class="kv"><span>${t("monFallen")}</span><b>${fmt(s.stats.fallen)}</b></div><div class="kv"><span>${t("monStage")}</span><b>${st} / ${MONUMENT_STEPS.length}</b></div><div class="kv"><span>${t("monBonus")}</span><b>+%${Math.round(st * MONUMENT_BONUS * 100)}</b></div>${next ? `<p class="muted small">${t("monNext", { n: fmt(next) })}</p>` : ""}`,
      [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }],
    );
  }

  enchantItem(owner: string, slot: Slot): void {
    const s = this.s;
    const it = this.ownerItem(owner, slot);
    if (!it) return;
    const cost = enchantCost(it);
    if (!hasMats(s, cost)) {
      sfx.error();
      this.toasts.show(t("noMats"), "bad");
      return;
    }
    payMats(s, cost);
    it.ench = rollEnchant(it);
    s.stats.enchants++;
    sfx.fanfare();
    this.toasts.show(`${icon("enchant")} ${t("enchanted", { item: itemName(it), e: tk("ench_" + it.ench) })}`, "gold", 3500);
    this.ui.dirty = true;
    this.save();
  }

  buyMount(): void {
    const s = this.s;
    if (!s.hero) return;
    const breed = (s.mount?.breed ?? 0) + 1;
    if (breed > MAX_BREED) return;
    const cost = mountCost(breed, totalIncomePerSec(s, Date.now(), false, false));
    if (s.gold < cost.gold || !hasMats(s, cost.mats)) {
      sfx.error();
      this.toasts.show(t(s.gold < cost.gold ? "noGold" : "noMats"), "bad");
      return;
    }
    s.gold -= cost.gold;
    payMats(s, cost.mats);
    s.mount = { breed, plus: 0 };
    sfx.fanfare();
    happytime();
    this.toasts.show(`${icon(mountIcon(breed))} ${t("mountNew", { name: tk("mount_" + breed) })}`, "gold", 4000);
    this.ui.dirty = true;
    this.save();
  }

  enhanceMount(): void {
    const s = this.s;
    const m = s.mount;
    if (!m || m.plus >= MAX_PLUS) return;
    const cost = mountPlusCost(m);
    if (!hasMats(s, cost)) {
      sfx.error();
      this.toasts.show(t("noMats"), "bad");
      return;
    }
    payMats(s, cost);
    s.stats.plusTries++;
    if (Math.random() < plusChance(m.plus)) {
      m.plus++;
      sfx.sword();
      this.toasts.show(`${icon(mountIcon(m.breed))} ${t("plusOk", { item: `+${m.plus} ${tk("mount_" + m.breed)}` })}`, m.plus >= 7 ? "gold" : "good", 3200);
    } else {
      sfx.error();
      this.toasts.show(`${icon(mountIcon(m.breed))} ${t("plusFail", { n: m.plus + 1 })}`, "bad", 3500);
    }
    this.ui.dirty = true;
    this.save();
  }

  setEscortClass(route: number): void {
    const s = this.s;
    const opts = UNIT_TYPES.filter((u) => unitUnlocked(s, u));
    const cur = opts.indexOf(s.escortClass[route] ?? "spear");
    s.escortClass[route] = opts[(cur + 1) % opts.length];
    sfx.coin();
    this.ui.dirty = true;
  }

  arenaFight(tier: number): void {
    const s = this.s;
    const now = Date.now();
    if (!s.hero || s.arena.tickets <= 0) {
      sfx.error();
      return;
    }
    const opp = opponents(s, now)[tier];
    if (!opp) return;
    const my = arenaPower(s);
    const chance = winChance(my, opp.power);
    const win = Math.random() < chance;
    if (s.arena.tickets >= 5) s.arena.ticketAt = now;
    s.arena.tickets--;
    const delta = win ? ARENA_GAIN[tier] : -ARENA_LOSS[tier];
    s.arena.rating = Math.max(0, s.arena.rating + delta);
    let reward = "";
    if (win) {
      s.arena.wins++;
      this.seasonPts("duel");
      const steel = ARENA_STEEL[tier];
      const gold = Math.max(200, totalIncomePerSec(s, now, false, false) * 60 * (tier + 1));
      s.mats.steel += steel;
      earn(s, gold);
      gainXp(s, Math.round(opp.power * 0.6));
      reward = `<div class="bigGold">+${fmt(gold)}</div><p class="boostLine">${matsHtml({ steel })}</p>`;
      sfx.fanfare();
      sfx.coin();
      happytime();
    } else {
      s.arena.losses++;
      sfx.error();
    }
    const vs = `<div class="vs"><div>${heroPortrait(s.hero.look, "face")}<b>${s.hero.name.replace(/</g, "")}</b><small>⚔ ${fmt(my)}</small></div><i>VS</i><div class="${win ? "lost" : ""}">${heroPortrait(opp.look, "face")}<b>${opp.name}</b><small>⚔ ${fmt(opp.power)}</small></div></div>`;
    showModal(
      t(win ? "arenaWin" : "arenaLose"),
      `${vs}<p>${t("arenaRating", { r: Math.round(s.arena.rating), d: (delta > 0 ? "+" : "") + delta })}</p>${reward}`,
      [{ label: t("storyContinue"), cls: "primary", onClick: () => undefined }],
      { icon: icon("arena") },
    );
    this.ui.dirty = true;
    this.save();
  }

  private heroPrompted = false;

  private heroTick(): void {
    if (this.s.hero || this.heroPrompted || !isOpen(this.s, "army") || modalOpen() || this.calm(Date.now())) return;
    this.heroPrompted = true;
    this.openHeroCreator();
  }

  openHeroCreator(): void {
    const s = this.s;
    let name = s.hero?.name ?? "";
    let look = s.hero?.look ?? 0;
    const body = `<p>${t("heroIntro")}</p><div class="heroPick">${Array.from({ length: HERO_LOOKS }, (_, k) => `<button data-v="${k}" class="${k === look ? "on" : ""}">${heroPortrait(k, "face")}</button>`).join("")}</div><input id="heroName" maxlength="20" placeholder="${t("heroPlaceholder")}" value="${name.replace(/"/g, "")}">`;
    showModal(
      t("heroTitle"),
      body,
      [
        {
          label: t("heroStart"),
          cls: "primary",
          onClick: () => {
            const n = name.trim() || t("heroDefault");
            if (s.hero) {
              s.hero.name = n.slice(0, 20);
              s.hero.look = look;
            } else s.hero = { name: n.slice(0, 20), look, level: 1, xp: 0, gear: {} };
            sfx.fanfare();
            this.toasts.show(`${heroPortrait(look, "ico face")} ${t("heroWelcome", { name: s.hero.name })}`, "gold", 4500);
            this.ui.dirty = true;
            this.save();
          },
        },
      ],
      { dismissable: !!s.hero },
    );
    const root = document.getElementById("modal")!;
    root.querySelector<HTMLInputElement>("#heroName")!.addEventListener("input", (ev) => (name = (ev.target as HTMLInputElement).value));
    root.querySelectorAll<HTMLButtonElement>(".heroPick button").forEach((b) =>
      b.addEventListener("click", () => {
        look = parseInt(b.dataset.v!, 10);
        root.querySelectorAll(".heroPick button").forEach((x) => x.classList.toggle("on", x === b));
      }),
    );
  }

  private ownerItem(owner: string, slot: Slot): Item | undefined {
    return owner === "hero" ? this.s.hero?.gear[slot] : this.s.compGear[owner as CompanionId]?.[slot];
  }

  private setOwnerItem(owner: string, slot: Slot, it: Item): void {
    if (owner === "hero") this.s.hero!.gear[slot] = it;
    else {
      const id = owner as CompanionId;
      this.s.compGear[id] = { ...this.s.compGear[id], [slot]: it };
    }
  }

  craftItem(owner: string, type: ItemType): void {
    const s = this.s;
    if (owner === "hero" && !s.hero) return;
    const slot = slotOf(type);
    const cur = this.ownerItem(owner, slot);
    const cap = maxForgeTier(s.hero?.level ?? 0);
    const tier = cur?.type === type ? cur.tier + 1 : cur && slot === "weapon" ? Math.min(cap, cur.tier) : 1;
    if (tier > MAX_TIER || tier < 1) return;
    if ((s.hero?.level ?? 0) < forgeLevel(tier)) {
      sfx.error();
      this.toasts.show(t("forgeNeed", { n: forgeLevel(tier) }), "bad");
      return;
    }
    const cost = craftCost(type, tier);
    if (!hasMats(s, cost)) {
      sfx.error();
      this.toasts.show(t("noMats"), "bad");
      return;
    }
    payMats(s, cost);
    const made: Item = { type, tier, plus: 0 };
    this.setOwnerItem(owner, slotOf(type), made);
    s.stats.crafted++;
    sfx.sword();
    sfx.fanfare();
    this.toasts.show(`${icon(gearIcon(made))} ${t("crafted", { item: itemName(made) })}`, "gold", 3500);
    this.ui.dirty = true;
    this.save();
  }

  enhanceItem(owner: string, slot: Slot): void {
    const s = this.s;
    const it = this.ownerItem(owner, slot);
    if (!it || it.plus >= MAX_PLUS) return;
    const cost = plusCost(it);
    if (!hasMats(s, cost)) {
      sfx.error();
      this.toasts.show(t("noMats"), "bad");
      return;
    }
    payMats(s, cost);
    s.stats.plusTries++;
    const chance = plusChance(it.plus);
    if (Math.random() < chance) {
      it.plus++;
      sfx.sword();
      if (it.plus >= 7) {
        sfx.fanfare();
        happytime();
      }
      this.toasts.show(`${icon("anvil")} ${t("plusOk", { item: itemName(it) })}`, it.plus >= 7 ? "gold" : "good", 3200);
    } else {
      sfx.error();
      this.toasts.show(`${icon("anvil")} ${t("plusFail", { n: it.plus + 1 })}`, "bad", 3500);
    }
    this.ui.dirty = true;
    this.save();
  }

  recruit(n: number): void {
    const s = this.s;
    const cost = recruitCost(s, n, totalIncomePerSec(s, Date.now(), false, false));
    if (s.gold < cost) {
      sfx.error();
      return;
    }
    s.gold -= cost;
    s.soldiers += n;
    s.stats.recruited += n;
    sfx.sword();
    this.ui.dirty = true;
  }

  upgradeBarracks(): void {
    const s = this.s;
    const cost = barracksCost(s, totalIncomePerSec(s, Date.now(), false, false));
    if (s.barracks >= MAX_BARRACKS || s.gold < cost) {
      sfx.error();
      return;
    }
    s.gold -= cost;
    s.barracks++;
    const unlocked = UNIT_TYPES.find((u) => UNIT_UNLOCK[u] === s.barracks);
    if (unlocked) this.toasts.show(`${icon("u_" + unlocked)} ${t("unitUnlocked", { u: tk("unit_" + unlocked) })}`, "gold", 4500);
    sfx.fanfare();
    this.ui.dirty = true;
    this.save();
  }

  assignEscort(route: number, delta: number): void {
    const s = this.s;
    const cur = s.escorts[route] ?? 0;
    const add = delta > 0 ? Math.min(delta, idleSoldiers(s)) : Math.max(delta, -cur);
    if (add === 0) return;
    s.escorts[route] = cur + add;
    this.ui.dirty = true;
  }

  autoEscorts(): void {
    const s = this.s;
    const owned = ROUTES.map((_, i) => i).filter((i) => s.routes[i].owned > 0);
    if (owned.length === 0) return;
    const weights = owned.map((i) => banditStrength(s, i) * (routeProtected(s, i) && !nemesisOn(s, i) ? 0.05 : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    const pool = s.soldiers - (s.siege?.troops ?? 0);
    s.escorts = ROUTES.map(() => 0);
    s.escortClass = ROUTES.map((_, i) => bestUnit(s, i));
    let left = pool;
    owned.forEach((i, k) => {
      const n = Math.floor((pool * weights[k]) / total);
      s.escorts[i] = n;
      left -= n;
    });
    for (let k = owned.length - 1; left > 0; k = (k - 1 + owned.length) % owned.length, left--) s.escorts[owned[k]]++;
    sfx.coin();
    this.ui.dirty = true;
  }

  private calmUntil = 0;
  private unlockShowing = false;

  private calm(now: number): boolean {
    return this.unlockShowing || now < this.calmUntil;
  }

  private unlockTick(): void {
    const s = this.s;
    const now = Date.now();
    if (this.unlockShowing && !modalOpen()) {
      this.unlockShowing = false;
      this.calmUntil = now + 15_000;
    }
    if (modalOpen() || document.hidden || now < this.calmUntil - 9_000) return;
    const f = pendingFeature(s);
    if (!f) return;
    this.unlockShowing = true;
    s.unlocked.push(f.id);
    sfx.fanfare();
    this.ui.dirty = true;
    this.ui.renderStatic();
    this.save();
    showModal(
      t("unlockTitle"),
      `<div class="unlockArt">${icon(f.icon, "ico big")}</div><h3 class="unlockName">${tk("feat_" + f.id)}</h3><p>${tk("featd_" + f.id)}</p>`,
      [
        { label: t("close"), cls: "secondary" },
        { label: t("unlockGo"), cls: "primary", onClick: () => (f.id === "journey" ? window.setTimeout(() => this.openJourney(), 50) : this.gotoFeature(f.tab, f.sub)) },
      ],
      { icon: icon("chest"), dismissable: true },
    );
  }

  private gotoFeature(tab: "army" | "dynasty" | "routes", sub?: string): void {
    if (sub) this.ui.armySub = sub as typeof this.ui.armySub;
    this.ui.setTab(tab);
  }

  private tutorialTick(now: number): void {
    const s = this.s;
    switch (s.tutorial) {
      case 0:
        if (s.routes[0].trips >= 1) {
          s.tutorial = 1;
          this.map.celebrateCity(ROUTES[0].to, performance.now());
          this.toasts.show(`${icon("coins")} ${t("firstTrip")}`, "gold", 3200);
          sfx.fanfare();
        }
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
    if (s.tutorial !== this.lastTut) {
      if (this.lastTut >= 0 && this.map.highlightRoute >= 0) this.map.flyToRoute(this.map.highlightRoute);
      this.lastTut = s.tutorial;
    }
  }
  private lastTut = -1;

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
      this.map.flyToRoute(Math.min(ROUTES.length - 1, i + 1));
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
    showModal(t("dynastyTitle"), `<p>${t("dynastyConfirm")}</p><div class="bigGold">+${fmt(n)} ${icon("seal")}</div>`, [
      { label: t("cancel"), cls: "secondary same" },
      {
        label: t("yes"),
        cls: "primary same",
        onClick: () => this.chooseHeir(n),
      },
    ], { icon: icon("seal") });
  }

  buildCity(id: string): void {
    const s = this.s;
    const now = Date.now();
    if (!cityUnlocked(s, id)) {
      this.openCity(id);
      return;
    }
    if (s.cityBuild && s.cityBuild.id !== id) {
      sfx.error();
      this.toasts.show(t("buildersBusy", { city: tk("city_" + s.cityBuild.id) }), "info");
      return;
    }
    if (s.cityBuild || cityLevel(s, id) >= MAX_CITY_LEVEL) {
      this.openCity(id);
      return;
    }
    const lv = cityLevel(s, id);
    if (!startBuild(s, id, now)) {
      sfx.error();
      return;
    }
    sfx.buy();
    this.toasts.show(t("buildStarted", { b: tk("bld_" + BUILDINGS[lv]), t: fmtTime(BUILD_SECONDS[lv]) }), "good");
    this.save();
  }

  async finishBuildAd(): Promise<void> {
    if (!this.s.cityBuild) return;
    const ok = await this.runAd();
    if (ok && this.s.cityBuild) {
      this.s.cityBuild.until = Date.now();
      this.save();
    } else if (!ok) {
      this.toasts.show(t(adsAvailable() ? "adFailed" : "adOff"), "bad");
    }
  }

  private cityTick(now: number): void {
    const s = this.s;
    if (s.cityBuild && now >= s.cityBuild.until) {
      const b = finishBuild(s)!;
      sfx.fanfare();
      happytime();
      this.map.celebrateCity(b.id, performance.now());
      this.toasts.show(t("buildDone", { b: tk("bld_" + BUILDINGS[b.level - 1]), city: tk("city_" + b.id) }), "gold", 3500);
      this.ui.dirty = true;
      this.save();
    }
    this.map.buildable.clear();
    if (!s.cityBuild && s.tutorial >= 5) {
      for (const c of CITIES) {
        if (canBuild(s, c.id) && s.gold >= cityCost(c.id, cityLevel(s, c.id))) this.map.buildable.add(c.id);
      }
    }
  }

  openCity(id: string): void {
    const s = this.s;
    const lv = cityLevel(s, id);
    const title = `${tk("city_" + id)} ${stars(lv)}`;
    if (!cityUnlocked(s, id)) {
      showModal(title, `<p>${t("cityLocked")}</p>`, [{ label: t("close"), cls: "primary" }], { icon: cityThumb(id, "cityBig") });
      return;
    }
    const buttons: ModalButton[] = [{ label: t("close"), cls: "secondary same" }];
    const busyHere = s.cityBuild?.id === id;
    if (busyHere && this.canWatchAd()) {
      buttons.push({ label: `▶ ${t("finishNow")}`, cls: "primary same", onClick: () => void this.finishBuildAd() });
    } else if (!busyHere && lv < MAX_CITY_LEVEL) {
      const cost = cityCost(id, lv);
      const ok = !s.cityBuild && s.gold >= cost;
      buttons.push({
        label: `${t("build")}: ${tk("bld_" + BUILDINGS[lv])}`,
        cls: "primary same" + (ok ? "" : " disabled"),
        keepOpen: !ok,
        onClick: () => (ok ? this.buildCity(id) : s.cityBuild ? this.toasts.show(t("buildersBusy", { city: tk("city_" + s.cityBuild.id) }), "info") : sfx.error()),
      });
    }
    if (COMPANION_IDS.some((c) => (s.companions[c] ?? 0) > 0)) {
      const g = governorOf(s, id);
      buttons.push({ label: g ? `${t("govBtn")}: ${COMPANIONS[g][s.settings.lang].name}` : t("govBtn"), cls: "secondary", onClick: () => window.setTimeout(() => this.openGovernor(id), 30) });
    }
    showModal(title, cityModalBody(s, id, Date.now()) + (lv >= MAX_CITY_LEVEL ? `<p class="story">${t("cityMaxed")}</p>` : ""), buttons, { icon: cityThumb(id, "cityBig") });
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
    showModal(t("favorTitle"), `<p>${t("favorDesc")}</p>`, [{ label: t("noThanks"), cls: "secondary same" }, watch], { icon: icon("crown") });
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
      <div class="setting"><span>${t("music")}</span><div class="seg">
        <button data-mus="on" class="${s.settings.music ? "on" : ""}">${t("on")}</button>
        <button data-mus="off" class="${!s.settings.music ? "on" : ""}">${t("off")}</button></div></div>
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
    root.querySelectorAll<HTMLButtonElement>("[data-mus]").forEach((b) =>
      b.addEventListener("click", () => {
        s.settings.music = b.dataset.mus === "on";
        setMusicEnabled(s.settings.music);
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
    setMusicEnabled(s.settings.music);
    this.events.clear();
    this.orders.clear(Date.now());
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
