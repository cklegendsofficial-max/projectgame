import { ACHIEVEMENTS, achievementMult } from "./achievements";
import { isPlatformMuted } from "./audio";
import { isOpen } from "./unlocks";
import { ARTIFACTS, ART_SLOTS, canForgeArt, weatherAt, weatherEnds, HAPPY_MOOD, REGIONS, REGION_MAX, REVOLT_MOOD, TAXES, TROPHY_IDS, TROPHY_RARITY, anyRegionAction, mercPower, monthWage, provinceMult, questDone, realmNam, regionConquered, regionCost, regionVisible, trophyMult } from "./province";
import { COMPANION_IDS, COMPANION_MAX, compEffect, compLevel, compText, compUpgradeCost, type CompanionId } from "./companions";
import { CHAPTERS, chronicleGlobalMult, currentChapter, goalDone, goalValue, story, travelerName, type Chapter, type TravelerId } from "./chronicle";
import { BUILDINGS, MAX_CITY_LEVEL, cityCost, cityLevel, cityRoutes, cityUnlocked, stepMult, totalCityLevels } from "./cities";
import { CITIES, ROUTES, UPGRADES, type UpgradeDef } from "./data";
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
import type { GameState, House } from "./state";
import { seasonAt, type Order } from "./world";
import {
  AGES,
  CREST_COLORS,
  RIVALS,
  RIVAL_ROUTE_BONUS,
  WONDERS,
  WONDER_STAGES,
  ageCost,
  ageMult,
  canAdvanceAge,
  canBuildWonder,
  nextAge,
  openRoutes,
  rivalBeaten,
  rivalWealth,
  rulerTitle,
  wonderCost,
  wonderMult,
  wonderStage,
} from "./empire";
import { currentShock, marketHistory, marketMult, marketVersion } from "./market";
import {
  ALLY_NEED,
  BAZAAR_FEE,
  BAZAAR_LOTS,
  BAZAAR_MIN_OWNED,
  EXP_TICKETS,
  EXP_TICKET_MS,
  canStock,
  giftCost,
  lotCost,
  relation,
  rivalReached,
  stockValue,
  tributeOdds,
  warOdds,
  type DiploAct,
} from "./realm";
import {
  MATERIALS,
  MAX_BARRACKS,
  MAX_BREED,
  MAX_PLUS,
  MAX_TIER,
  MONUMENT_BONUS,
  MONUMENT_STEPS,
  RARITY,
  SET_POWER,
  SET_PROFIT,
  threatMult,
  UNIT_TYPES,
  UNIT_UNLOCK,
  armyProfitMult,
  banditKind,
  banditStrength,
  barracksCost,
  classMult,
  companionPower,
  craftCost,
  enchValue,
  enchantCost,
  escortPower,
  FORGE_LEVEL,
  forgeLevel,
  gearNam,
  maxForgeTier,
  hasMats,
  heroPower,
  heroXpNeed,
  idleSoldiers,
  itemPower,
  monumentStage,
  mountCost,
  mountIcon,
  mountPlusCost,
  mountPower,
  mountSpeed,
  plusChance,
  plusCost,
  recruitCost,
  setTier,
  soldierPower,
  unitBeats,
  unitUnlocked,
  winChance,
  type Item,
  type ItemType,
  type Material,
  type Mats,
  type RelicId,
  type Slot,
  RELICS,
} from "./army";
import { CONTRACT_STEEL, contractProgress, contractReady } from "./quests";
import {
  BLOOD_SHARE,
  CAMP_BONUS,
  PATHS,
  PATH_ICON,
  PERKS,
  PERK_COST,
  SPY_FOIL,
  SPY_MAX,
  SPY_SABOTAGE,
  SPY_STEEL,
  SPY_TITAN,
  campWanted,
  favorFree,
  favorPoints,
  houseDef,
  houseOffers,
  legacyBonus,
  seasonEvent,
  activeFestival,
  festivalEnds,
  nextFestival,
  type HouseId,
  type PathId,
  type PerkKind,
} from "./perks";
import {
  GUILD_TIERS,
  RAID_TICKETS,
  RAID_TICKET_MS,
  RAID_TIERS,
  SEASON_PTS,
  SEASON_STEPS,
  guildMembers,
  guildTierReady,
  raidHit,
  raidMembers,
  raidTierReady,
  raidTotal,
  seasonLeft,
  seasonStepReady,
  tradeWarActive,
} from "./saga";
import { HAN_MIN_OWNED, HAN_MULT, canBuildHan, hanCost, hanWood, hasHan } from "./caravanserai";
import {
  ARENA_GAIN,
  ARENA_STEEL,
  FORTS,
  FORT_WALLS,
  FORT_WAVES,
  MAX_TICKETS,
  TICKET_MS,
  arenaPower,
  arenaRank,
  fortAvailable,
  fortStrength,
  fortTaken,
  leaderboard,
  nemesisName,
  nemesisOn,
  nemesisStrength,
  opponents,
  routeProtected,
  seasonReward,
  siegeOdds,
  weekLeft,
} from "./warfare";

type ArmySub = "hero" | "army" | "realm" | "war" | "arena" | "guild";

export interface GameApi {
  s: GameState;
  setTax(n: number): void;
  openRevolt(): void;
  openIncursion(): void;
  openForge(): void;
  openMerchant(): void;
  openRegion(k: number): void;
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
  openQuest(): void;
  order: Order | null;
  buildCity(id: string): void;
  finishBuildAd(): void;
  upgradeCompanion(id: CompanionId): void;
  openHeroCreator(): void;
  craftItem(owner: string, type: ItemType): void;
  enhanceItem(owner: string, slot: Slot): void;
  recruit(n: number): void;
  upgradeBarracks(): void;
  assignEscort(route: number, delta: number): void;
  autoEscorts(): void;
  enchantItem(owner: string, slot: Slot): void;
  buyMount(): void;
  enhanceMount(): void;
  setEscortClass(route: number): void;
  openFort(id: string): void;
  arenaFight(tier: number): void;
  openMonument(): void;
  claimContract(i: number): void;
  claimSeasonStep(): void;
  claimGuildTier(): void;
  chooseOath(p: PathId): void;
  buyPerk(): void;
  openTradeWar(): void;
  openKurgan(): void;
  buildHan(i: number): void;
  openHan(i: number): void;
  upgradeSpies(): void;
  spyGold(): number;
  weddingCost(): number;
  marry(id: HouseId): void;
  migrateCamp(): void;
  openSaga(): void;
  raidAttack(): void;
  claimRaidTier(): void;
  openRelic(id: RelicId): void;
  openShareCard(): void;
  advanceAge(): void;
  buildWonder(id: string): void;
  openWonder(id: string): void;
  fastShip(i: number): void;
  openHouse(): void;
  buyStock(i: number): void;
  sellStock(i: number): void;
  diplo(id: string, act: DiploAct): void;
  openWar(id: string): void;
  startExpedition(): void;
  openExpedition(): void;
  openTree(): void;
}

const iconUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/icons/*.webp", { eager: true, query: "?url", import: "default" }))) {
  iconUrls[path.split("/").pop()!.replace(".webp", "")] = url;
}

export function iconUrl(name: string): string {
  return iconUrls[name];
}

export function icon(name: string, cls = "ico"): string {
  return `<img class="${cls}" src="${iconUrls[name]}" alt="" draggable="false">`;
}

export function goodsIcon(i: number, cls?: string): string {
  return icon(ROUTES[i].id, cls);
}

const portraitUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/travelers/*.webp", { eager: true, query: "?url", import: "default" }))) {
  portraitUrls[path.split("/").pop()!.replace(".webp", "")] = url;
}

export function portrait(id: TravelerId, cls = "portrait"): string {
  return `<img class="${cls}" src="${portraitUrls[id]}" alt="" draggable="false">`;
}

const cityThumbUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/cities/*.webp", { eager: true, query: "?url", import: "default" }))) {
  cityThumbUrls[path.split("/").pop()!.replace(".webp", "")] = url;
}
const buildingUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/buildings/*.webp", { eager: true, query: "?url", import: "default" }))) {
  buildingUrls[path.split("/").pop()!.replace(".webp", "")] = url;
}

export function cityThumb(id: string, cls = "ico"): string {
  return `<img class="${cls}" src="${cityThumbUrls[id]}" alt="" draggable="false">`;
}

export function buildingImg(id: string, cls = "ico"): string {
  return `<img class="${cls}" src="${buildingUrls[id]}" alt="" draggable="false">`;
}

export function stars(level: number): string {
  return `<span class="stars">${"★".repeat(level)}<i>${"★".repeat(MAX_CITY_LEVEL - level)}</i></span>`;
}

export function cityModalBody(s: GameState, id: string, now: number): string {
  const lv = cityLevel(s, id);
  const rows = BUILDINGS.map((b, k) => {
    const done = lv > k;
    const busy = s.cityBuild?.id === id && s.cityBuild.level === k + 1;
    const status = done
      ? `<b class="ok">✓ ${t("built")}</b>`
      : busy
        ? `<b>${t("building")} · ${fmtTime((s.cityBuild!.until - now) / 1000)}</b>`
        : k === lv
          ? `<b>${fmt(cityCost(id, k))}</b>`
          : `<b class="dim">${fmt(cityCost(id, k))}</b>`;
    return `<div class="brow${done ? " done" : ""}">${buildingImg(busy ? "scaffold" : b, "bimg")}<div class="btxt"><div>${tk("bld_" + b)}</div><small>${t("bldDesc", { x: stepMult(k) })}</small></div>${status}</div>`;
  }).join("");
  const routes = cityRoutes(id).filter((i) => s.routes[i].owned > 0).map((i) => goodsIcon(i, "tiny")).join("");
  return `${rows}<div class="qrow"><span>${t("cityRoutesLbl")}</span><b>${routes || "-"}</b></div>`;
}

const compUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/companions/*.webp", { eager: true, query: "?url", import: "default" }))) {
  compUrls[path.split("/").pop()!.replace(".webp", "")] = url;
}

const wonderUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/wonders/*.webp", { eager: true, query: "?url", import: "default" }))) {
  wonderUrls[path.split("/").pop()!.replace(".webp", "")] = url;
}

export function wonderUrl(id: string): string {
  return wonderUrls[id];
}

export function crestHtml(h: House, cls = "crest"): string {
  return `<div class="${cls}" style="--cc:${CREST_COLORS[h.color] ?? CREST_COLORS[0]}">${icon(h.symbol)}</div>`;
}

const heroUrls: string[] = [];
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/heroes/*.webp", { eager: true, query: "?url", import: "default" }))) {
  heroUrls[parseInt(path.match(/hero(\d+)/)![1], 10) - 1] = url;
}

export function heroUrl(look: number): string {
  return heroUrls[look] ?? heroUrls[0];
}

export function heroPortrait(look: number, cls = "portrait"): string {
  return `<img class="${cls}" src="${heroUrls[look] ?? heroUrls[0]}" alt="" draggable="false">`;
}

const nemesisUrls: string[] = [];
for (const [path, url] of Object.entries(import.meta.glob<string>("./assets/nemesis/*.webp", { eager: true, query: "?url", import: "default" }))) {
  nemesisUrls[parseInt(path.match(/nem(\d+)/)![1], 10) - 1] = url;
}

export function nemesisPortrait(look: number, cls = "portrait"): string {
  return `<img class="${cls}" src="${nemesisUrls[look] ?? nemesisUrls[0]}" alt="" draggable="false">`;
}

export function perkText(p: { kind: PerkKind; v: number }): string {
  return p.kind === "offline" ? tk("perk_offline", { n: p.v }) : tk("perk_" + p.kind, { n: Math.round(p.v * 100) });
}

export function enchText(it: Item): string {
  const v = Math.round(enchValue(it) * 1000) / 10;
  return `${tk("ench_" + it.ench)} +%${v}`;
}

export function itemName(it: Item): string {
  return `${it.plus > 0 ? `+${it.plus} ` : ""}${tk(`gear_${it.type}_${it.tier}`)}`;
}

export function matsHtml(m: Partial<Mats>): string {
  return (Object.entries(m) as [Material, number][])
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `<span class="mat">${icon("mat_" + k)}${fmt(n)}</span>`)
    .join(" ");
}

function itemBox(it: Item | undefined, fallback: ItemType): string {
  if (!it) return `<div class="itembox empty">${icon("it_" + fallback)}</div>`;
  return `<div class="itembox" style="--rar:${RARITY[it.tier]}">${icon(`it_${it.type}_${it.tier}`)}${it.plus > 0 ? `<b>+${it.plus}</b>` : ""}</div>`;
}

export function compPortrait(id: string, cls = "portrait"): string {
  return `<img class="${cls}" src="${compUrls[id]}" alt="" draggable="false">`;
}

export function achIcon(key: string): string {
  if (key.startsWith("c:")) return compPortrait(key.slice(2), "ico face");
  if (key.startsWith("w:")) return `<img class="ico" src="${wonderUrls[key.slice(2)]}" alt="" draggable="false">`;
  if (key.startsWith("b:")) return buildingImg(key.slice(2));
  if (key.startsWith("t:")) return portrait(key.slice(2) as TravelerId, "ico face");
  return icon(key);
}

export function goalText(ch: Chapter): string {
  const g = ch.goal;
  const goods = g.route !== undefined ? goodsName(g.route) : "";
  return tk("goal_" + g.kind, { n: g.kind === "earn" ? fmt(g.n) : g.n, goods });
}

export function rewardText(ch: Chapter): string {
  const r = ch.reward;
  if (r.kind === "route") return t("reward_route", { goods: goodsName(r.route!), x: r.mult! });
  if (r.kind === "all") return t("reward_all", { p: Math.round((r.mult! - 1) * 100) });
  return t("reward_offline", { h: r.hours! });
}

type Tab = "routes" | "upgrades" | "masters" | "army" | "dynasty" | "stats";

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
      return goodsIcon(u.route!);
    case "all":
      return icon("crown");
    case "bounty":
      return icon("swords");
    case "merchant":
      return icon("genie");
    case "offline":
      return icon("scroll");
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
  price: HTMLElement;
  fast: HTMLButtonElement;
}

export class UI {
  private g: GameApi;
  tab: Tab = "routes";
  dirty = true;
  private body: HTMLElement;
  private rows: (RouteRow | null)[] = [];
  private dynamic: (() => void)[] = [];
  private lastText = 0;
  private lastSig = 0;
  private sig = "";

  constructor(g: GameApi) {
    this.g = g;
    this.body = $("tabBody");
    $("favorBtn").addEventListener("click", () => g.openFavor());
    $("muteBtn").addEventListener("click", () => g.toggleMute());
    $("settingsBtn").addEventListener("click", () => g.openSettings());
    $("quest").addEventListener("click", () => g.openQuest());
    $("buffs").addEventListener("click", (e) => {
      const tgt = e.target as HTMLElement;
      if (tgt.closest(".tw")) g.openTradeWar();
      else if (tgt.closest(".camp")) g.migrateCamp();
    });
    document.querySelector("#topbar .brand")!.addEventListener("click", () => this.setTab("dynasty"));
  }

  private structureSig(): string {
    const s = this.g.s;
    return [
      this.tab,
      s.unlocked.join(","),
      s.settings.lang,
      s.settings.notation,
      s.routes.map((r) => (r.owned > 0 ? 1 : 0)).join(""),
      s.masters.map((m) => (m ? 1 : 0)).join(""),
      s.upgrades.length,
      s.chronicle.done,
      s.achievements.length,
      JSON.stringify(s.companions),
      JSON.stringify(s.cityLevels),
      s.cityBuild ? s.cityBuild.id + s.cityBuild.level : "",
      CITIES.filter((c) => cityUnlocked(s, c.id)).length,
      String(this.g.buyMode),
      s.seals,
      s.age,
      JSON.stringify(s.wonders),
      s.rivalsBeaten.length,
      s.ruler.gen,
      s.house ? s.house.name + s.house.symbol + s.house.color : "",
      this.tab === "army"
        ? JSON.stringify([this.armySub, s.hero, s.compGear, s.barracks, s.mount, s.escortClass, s.nemeses, s.fortsTaken, s.siege?.fort, s.siege?.wave, s.arena.wins + s.arena.losses, s.arena.tickets, s.wounded > 0, monumentStage(s), s.relics, s.contracts, s.season, s.fallenHeroes.length, s.spies, s.raid.claimed, s.raid.tickets, s.raid.hits, s.tax, s.revolt, s.regions.map((r) => (r.open ? r.lv : 0)), s.trophies, s.artEquip, s.artifacts, s.incursion?.k ?? -1, s.merchant?.until ?? 0, this.armySub === "guild" ? Math.floor(Date.now() / 60_000) : 0])
        : "",
      this.tab === "dynasty" ? JSON.stringify([s.allegiance, favorPoints(s), s.mats.steel >= 20, s.spouse, s.bloodline.length, s.sagaLog.length]) : "",
      this.tab === "upgrades" ? s.hans.join(",") + "/" + s.routes.map((r) => (r.owned >= HAN_MIN_OWNED ? 1 : 0)).join("") : "",
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
      ["army", t("tabArmy")],
      ["dynasty", t("tabDynasty")],
      ["stats", t("tabStats")],
    ];
    const s = this.g.s;
    if ((this.tab === "army" && !isOpen(s, "army")) || (this.tab === "dynasty" && !isOpen(s, "dynasty"))) this.tab = "routes";
    for (const [id, label] of defs) {
      if ((id === "army" && !isOpen(s, "army")) || (id === "dynasty" && !isOpen(s, "dynasty"))) continue;
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
      case "army":
        this.buildArmy();
        break;
      case "dynasty":
        this.buildEmpire();
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
          lock.innerHTML = `<div class="icon">${icon("lock")}</div><div class="mid"><div class="name">${t("lockedRoute")}</div><small>${t("lockedHint")}</small></div>`;
          this.body.appendChild(lock);
        }
        this.rows.push(null);
        continue;
      }
      const root = el("div", "route" + (r.owned === 0 ? " unopened" : ""));
      root.style.setProperty("--c", ROUTES[i].color);
      root.innerHTML = `
        <div class="icon">${goodsIcon(i)}<span class="owned"></span></div>
        <div class="mid">
          <div class="name">${goodsName(i)} <small>${routeLabel(i)}</small><span class="price"></span></div>
          <div class="bar"><div class="fill"></div><span class="barText"></span></div>
          <div class="ms"><span class="msText"></span><div class="msBar"><div class="msFill"></div></div></div>
        </div>
        <div class="btns">
          <button class="fast" style="display:none"></button>
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
        price: root.querySelector(".price")!,
        fast: root.querySelector(".fast")!,
      };
      row.fast.addEventListener("click", () => g.fastShip(i));
      row.send.addEventListener("click", () => g.send(i));
      row.buy.addEventListener("click", () => g.buyRoute(i));
      this.rows.push(row);
      this.body.appendChild(root);
    }
    this.buildBazaar();
  }

  private buildBazaar(): void {
    const g = this.g;
    const s = g.s;
    if (!isOpen(s, "bazaar")) return;
    this.body.appendChild(el("h4", "sect", `${icon("bedesten", "ico sm")} ${t("bazaarTitle")}`));
    this.body.appendChild(el("p", "muted small", t("bazaarIntro", { n: BAZAAR_MIN_OWNED, f: Math.round(BAZAAR_FEE * 100) })));
    const box = el("div", "bazaar");
    let now = Date.now();
    let income = 1;
    this.dynamic.push(() => {
      now = Date.now();
      income = Math.max(1, totalIncomePerSec(s, now, false, false));
    });
    for (let i = 0; i < ROUTES.length; i++) {
      if (s.routes[i].owned <= 0) continue;
      const row = el("div", "bzRow");
      row.innerHTML = `${goodsIcon(i)}<div class="mid"><b>${goodsName(i)}</b><svg class="spark" viewBox="0 0 96 24" preserveAspectRatio="none"><polyline points=""/></svg></div><div class="bzPrice"><b class="p"></b><small class="v"></small></div>`;
      const buy = el("button", "mini", t("bazaarBuy"));
      const sell = el("button", "mini sell", t("bazaarSell"));
      buy.addEventListener("click", () => g.buyStock(i));
      sell.addEventListener("click", () => g.sellStock(i));
      const btns = el("div", "bzBtns");
      btns.append(buy, sell);
      row.appendChild(btns);
      box.appendChild(row);
      const line = row.querySelector("polyline")!;
      const pEl = row.querySelector<HTMLElement>(".p")!;
      const vEl = row.querySelector<HTMLElement>(".v")!;
      let ver = -1;
      this.dynamic.push(() => {
        const m = marketMult(i, now);
        const pct = Math.round(m * 100);
        const pTxt = `%${pct}`;
        if (pEl.textContent !== pTxt) {
          pEl.textContent = pTxt;
          pEl.className = "p " + (m > 1.02 ? "up" : m < 0.98 ? "down" : "");
        }
        const st = s.bazaar[i];
        const locked = s.routes[i].owned < BAZAAR_MIN_OWNED;
        const val = st.units > 0 ? stockValue(s, i, now) : 0;
        const vTxt = locked ? t("bazaarLocked", { n: BAZAAR_MIN_OWNED }) : st.units > 0 ? `${t("bazaarLots", { n: Math.round(st.cost / lotCost(income)), m: BAZAAR_LOTS })} · ${fmt(val)}` : `${fmt(lotCost(income))}`;
        if (vEl.textContent !== vTxt) vEl.textContent = vTxt;
        vEl.classList.toggle("gain", st.units > 0 && val > st.cost);
        vEl.classList.toggle("loss", st.units > 0 && val < st.cost);
        buy.disabled = !canStock(s, i, income);
        sell.disabled = st.units <= 0;
        if (ver !== marketVersion()) {
          ver = marketVersion();
          const h = marketHistory(i);
          if (h.length > 1) line.setAttribute("points", h.map((p, k) => `${((k / (h.length - 1)) * 96).toFixed(1)},${(24 - ((p - 0.75) / 0.6) * 24).toFixed(1)}`).join(" "));
        }
      });
    }
    this.body.appendChild(box);
  }

  private buildUpgrades(): void {
    const g = this.g;
    const s = g.s;
    this.buildCities();
    this.buildHans();
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

  private buildHans(): void {
    const g = this.g;
    const s = g.s;
    const open = ROUTES.map((_, i) => i).filter((i) => s.routes[i].owned > 0);
    if (open.length === 0 || (s.hans.length === 0 && !open.some((i) => s.routes[i].owned >= HAN_MIN_OWNED / 2))) return;
    this.body.appendChild(el("h4", "sect", `${icon("han", "ico sm")} ${t("hansTitle")} <small>${s.hans.length}/${ROUTES.length}</small>`));
    this.body.appendChild(el("p", "muted small", t("hansIntro", { p: Math.round((HAN_MULT - 1) * 100), n: HAN_MIN_OWNED })));
    const grid = el("div", "hanGrid");
    for (const i of open) {
      const built = hasHan(s, i);
      const ok = canBuildHan(s, i);
      const cell = el("div", "hanCell" + (built ? " built" : ok ? "" : " locked"));
      cell.innerHTML = `${goodsIcon(i)}<small>${goodsName(i)}</small>`;
      if (built) cell.appendChild(el("b", "", `✔ +${Math.round((HAN_MULT - 1) * 100)}%`));
      else if (!ok) cell.appendChild(el("b", "", `${Math.min(s.routes[i].owned, HAN_MIN_OWNED)}/${HAN_MIN_OWNED}`));
      else {
        const cost = hanCost(i);
        const b = el("button", "buy", `<span>${t("hanBuild")}</span><b>${fmt(cost)}</b>`);
        b.addEventListener("click", () => g.buildHan(i));
        cell.appendChild(b);
        this.dynamic.push(() => {
          const can = s.gold >= cost && s.mats.wood >= hanWood(s);
          b.disabled = !can;
          cell.classList.toggle("ready", can);
        });
      }
      if (built) cell.addEventListener("click", () => g.openHan(i));
      grid.appendChild(cell);
    }
    this.body.appendChild(grid);
    this.body.appendChild(el("p", "muted small", t("hanWoodLine", { n: hanWood(s), have: fmt(s.mats.wood) })));
  }

  private buildCities(): void {
    const g = this.g;
    const s = g.s;
    const order = ROUTES.flatMap((r) => [r.from, r.to]).filter((id, k, a) => a.indexOf(id) === k);
    const open = order.filter((id) => cityUnlocked(s, id));
    if (open.length === 0) return;
    this.body.appendChild(el("h4", "sect", `${t("citiesTitle")}`));
    this.body.appendChild(el("p", "muted small", t("citiesHint")));
    for (const id of open) {
      const lv = cityLevel(s, id);
      const card = el("div", "card city" + (lv >= MAX_CITY_LEVEL ? " done" : ""));
      const next = BUILDINGS[lv];
      card.innerHTML = `<div class="icon">${cityThumb(id)}</div><div class="mid"><div class="name">${tk("city_" + id)} ${stars(lv)}</div><small class="cdesc"></small></div>`;
      const desc = card.querySelector<HTMLElement>(".cdesc")!;
      card.querySelector(".icon")!.addEventListener("click", () => g.buildCity(id));
      if (lv >= MAX_CITY_LEVEL) {
        desc.textContent = t("cityMaxed");
        this.body.appendChild(card);
        continue;
      }
      const btn = el("button", "buy", `<span>${tk("bld_" + next)}</span><b>${fmt(cityCost(id, lv))}</b>`);
      card.appendChild(btn);
      this.dynamic.push(() => {
        const now = Date.now();
        const busyHere = s.cityBuild?.id === id;
        if (busyHere) {
          desc.textContent = `${t("building")}: ${tk("bld_" + next)} · ${fmtTime((s.cityBuild!.until - now) / 1000)}`;
        } else {
          desc.textContent = t("bldDesc", { x: stepMult(lv) });
        }
        const ok = !s.cityBuild && s.gold >= cityCost(id, lv);
        btn.disabled = !ok && !busyHere;
        btn.classList.toggle("adFinish", busyHere);
        if (busyHere) {
          const label = `<span>▶ ${t("finishNow")}</span><b>${fmtTime((s.cityBuild!.until - now) / 1000)}</b>`;
          if (btn.dataset.html !== label) btn.innerHTML = btn.dataset.html = label;
          btn.style.display = g.canWatchAd() ? "" : "none";
        } else if (btn.dataset.html) {
          delete btn.dataset.html;
          btn.innerHTML = `<span>${tk("bld_" + next)}</span><b>${fmt(cityCost(id, lv))}</b>`;
          btn.style.display = "";
        }
        card.classList.toggle("ready", ok);
      });
      btn.onclick = () => (s.cityBuild?.id === id ? g.finishBuildAd() : g.buildCity(id));
      this.body.appendChild(card);
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
      card.innerHTML = `<div class="icon">${icon("master")}${goodsIcon(i, "mini")}</div>
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
    const lang = s.settings.lang;
    const head = el("div", "sectionHead");
    head.innerHTML = `<h3>${t("companionsTitle")}</h3><small>${t("companionsIntro")}</small>`;
    this.body.appendChild(head);
    for (const id of COMPANION_IDS) {
      const lv = compLevel(s, id);
      const txt = compText(id, lang);
      if (lv <= 0) {
        const card = el("div", "card comp locked");
        card.innerHTML = `<div class="icon"><div class="compface unknown">?</div></div><div class="mid"><div class="name">???</div><small>${t("compLocked")}</small></div>`;
        this.body.appendChild(card);
        continue;
      }
      const card = el("div", "card comp");
      card.innerHTML = `<div class="icon"><div class="compface">${compPortrait(id, "face")}</div></div>
        <div class="mid"><div class="name">${txt.name} <span class="stars">${"★".repeat(lv)}<i>${"★".repeat(COMPANION_MAX - lv)}</i></span></div>
        <small class="role">${txt.role}</small><small>${compEffect(id, lv, lang)}</small></div>`;
      if (lv >= COMPANION_MAX) {
        card.appendChild(el("div", "hired", "✔ " + t("compMax")));
      } else {
        const cost = () => compUpgradeCost(lv, totalIncomePerSec(s, Date.now(), false, false));
        card.querySelector(".mid")!.insertAdjacentHTML("beforeend", `<small class="next">${t("compNext")}: ${compEffect(id, lv + 1, lang)}</small>`);
        const btn = el("button", "buy", `<span>${t("compPromote")}</span><b></b>`);
        const b = btn.querySelector("b")!;
        btn.addEventListener("click", () => g.upgradeCompanion(id));
        card.appendChild(btn);
        this.dynamic.push(() => {
          const c = cost();
          b.textContent = fmt(c);
          const ok = s.gold >= c;
          btn.disabled = !ok;
          card.classList.toggle("ready", ok);
        });
      }
      this.body.appendChild(card);
    }
  }

  private gearRow(owner: string, slot: Slot, types: ItemType[], it: Item | undefined, label: string): HTMLElement {
    const g = this.g;
    const s = g.s;
    const row = el("div", "gear");
    const cur = it;
    const ench = cur?.ench ? ` · <i class="ench">✦ ${enchText(cur)}</i>` : "";
    row.innerHTML = `${itemBox(cur, types[0])}<div class="mid"><div class="name" style="color:${cur ? RARITY[cur.tier] : "inherit"}">${cur ? itemName(cur) : label}</div><small>${cur ? t("powerTag", { p: fmt(itemPower(cur)) }) + ench : t("slotEmpty")}</small></div>`;
    const btns = el("div", "gbtns");
    const watch = (b: HTMLButtonElement, cost: Partial<Mats>) =>
      this.dynamic.push(() => {
        const ok = hasMats(s, cost);
        b.disabled = !ok;
        b.classList.toggle("ready", ok);
      });
    const cap = maxForgeTier(s.hero?.level ?? 0);
    const offers: { ty: ItemType; tier: number }[] = [];
    if (!cur) {
      if (cap >= 1) for (const ty of types) offers.push({ ty, tier: 1 });
    } else {
      if (cur.tier < MAX_TIER) offers.push({ ty: cur.type, tier: cur.tier + 1 });
      if (slot === "weapon") {
        const other: ItemType = cur.type === "sword" ? "bow" : "sword";
        if (types.includes(other) && cap >= 1) offers.push({ ty: other, tier: Math.min(cap, cur.tier) });
      }
    }
    for (const { ty, tier } of offers) {
      const cost = craftCost(ty, tier);
      const need = forgeLevel(tier);
      const b = el("button", "craft", `<span>${icon(`it_${ty}_${tier}`)} ${tk(`gear_${ty}_${tier}`)}</span><small>${matsHtml(cost)}</small>`);
      b.addEventListener("click", () => g.craftItem(owner, ty));
      btns.appendChild(b);
      this.dynamic.push(() => {
        const locked = (s.hero?.level ?? 0) < need;
        const html = locked ? t("forgeNeed", { n: need }) : matsHtml(cost);
        const small = b.querySelector("small")!;
        if (small.dataset.h !== html) small.innerHTML = small.dataset.h = html;
        const ok = !locked && hasMats(s, cost);
        b.disabled = !ok;
        b.classList.toggle("ready", ok);
      });
    }
    if (cur && cur.plus < MAX_PLUS) {
      const cost = plusCost(cur);
      const ch = plusChance(cur.plus);
      const b = el("button", "plus", `<span>${icon("anvil")} +${cur.plus + 1}${ch < 1 ? ` <i class="risk">%${Math.round(ch * 100)}</i>` : ""}</span><small>${matsHtml(cost)}</small>`);
      b.addEventListener("click", () => g.enhanceItem(owner, slot));
      btns.appendChild(b);
      watch(b, cost);
    }
    if (cur) {
      const cost = enchantCost(cur);
      const b = el("button", "enchBtn", `<span>${icon("enchant")} ${cur.ench ? t("reEnchant") : t("enchant")}</span><small>${matsHtml(cost)}</small>`);
      b.addEventListener("click", () => g.enchantItem(owner, slot));
      btns.appendChild(b);
      watch(b, cost);
    }
    row.appendChild(btns);
    return row;
  }

  armySub: ArmySub = "hero";

  private buildArmy(): void {
    const g = this.g;
    const s = g.s;
    const subs = ([
      ["hero", t("subHero"), "it_sword"],
      ["army", t("subArmy"), "soldier"],
      ["realm", t("subRealm"), "village"],
      ["war", t("subWar"), "fortress"],
      ["arena", t("subArena"), "arena"],
      ["guild", t("subGuild"), "guild"],
    ] as [ArmySub, string, string][]).filter(([id]) => id === "hero" || id === "army" || isOpen(s, id));
    if (!subs.some(([id]) => id === this.armySub)) this.armySub = "hero";
    const bar = el("div", "subtabs");
    for (const [id, label, ic] of subs) {
      const b = el("button", "sub" + (this.armySub === id ? " active" : ""), `${icon(ic, "ico sm")}<span>${label}</span><i class="badge"></i>`);
      b.addEventListener("click", () => {
        this.armySub = id;
        this.dirty = true;
        this.body.scrollTop = 0;
      });
      const badge = b.querySelector<HTMLElement>(".badge")!;
      this.dynamic.push(() => {
        const on = id === "realm" ? anyRegionAction(s, Date.now()) : id === "war" ? !!s.siege || s.contracts.list.some((c) => contractReady(s, c)) : id === "arena" ? !!s.hero && s.arena.tickets >= MAX_TICKETS : id === "guild" ? seasonStepReady(s) || guildTierReady(s, Date.now()) || raidTierReady(s, Date.now()) || (s.raid.tickets >= RAID_TICKETS && raidTotal(s, Date.now()) < 1) : false;
        badge.style.display = on ? "block" : "none";
      });
      bar.appendChild(b);
    }
    this.body.appendChild(bar);
    if (this.armySub === "hero") this.buildHeroSub();
    else if (this.armySub === "army") this.buildTroopsSub();
    else if (this.armySub === "war") this.buildWarSub();
    else if (this.armySub === "guild") this.buildGuildSub();
    else if (this.armySub === "realm") this.buildRealmSub();
    else this.buildArenaSub();
  }

  private buildHeroSub(): void {
    const g = this.g;
    const s = g.s;
    const lang = s.settings.lang;
    const income = () => totalIncomePerSec(s, Date.now(), false, false);

    const heroBox = el("div", "heroCard");
    if (s.hero) {
      const h = s.hero;
      const need = heroXpNeed(h.level);
      const st = setTier(s);
      const setLine = st > 0 ? `<div class="setline on">✦ ${tk("set_" + st)}: ⚔ +%${Math.round(SET_POWER * st * 100)} · 💰 +%${Math.round(SET_PROFIT * st * 100)}</div>` : `<div class="setline">${t("setHint")}</div>`;
      heroBox.innerHTML = `<div class="hface">${heroPortrait(h.look, "face")}</div><div class="hinfo"><h3>${h.name.replace(/</g, "")} <small>${t("heroLevel", { n: h.level })}</small></h3>
        <div class="xpbar"><i style="width:${Math.min(100, (h.xp / need) * 100).toFixed(1)}%"></i><span>${fmt(h.xp)} / ${fmt(need)} XP</span></div>
        <div class="hstats"><span>⚔ ${fmt(heroPower(s))}</span><span>👥 ${fmt(companionPower(s))}</span><span>💰 x${armyProfitMult(s).toFixed(2)}</span></div>
        <div class="setline">${FORGE_LEVEL[maxForgeTier(h.level) + 1] ? t("namLine", { n: gearNam(s), m: FORGE_LEVEL[maxForgeTier(h.level) + 1] }) : t("namMax", { n: gearNam(s) })}</div>${setLine}</div>`;
      const edit = el("button", "mini", "✎");
      edit.addEventListener("click", () => g.openHeroCreator());
      heroBox.appendChild(edit);
    } else {
      heroBox.innerHTML = `<div class="hface unknown">?</div><div class="hinfo"><h3>${t("heroNone")}</h3><small>${t("heroNoneHint")}</small></div>`;
      const b = el("button", "mini", t("heroCreate"));
      b.addEventListener("click", () => g.openHeroCreator());
      heroBox.appendChild(b);
    }
    this.body.appendChild(heroBox);
    this.body.appendChild(this.matBar());

    if (s.hero) {
      const exp = el("div", "expCard" + (s.expedition ? " on" : ""));
      exp.innerHTML = `${icon("sefer", "ico big")}<div class="mid"><b>${t("expTitle")}</b><small>${t("expIntro")}</small><small class="nx"></small></div>`;
      const b = el("button", "buy", "");
      b.addEventListener("click", () => (s.expedition ? g.openExpedition() : g.startExpedition()));
      exp.appendChild(b);
      const nx = exp.querySelector<HTMLElement>(".nx")!;
      this.dynamic.push(() => {
        const html = s.expedition ? `<span>${t("expContinue")}</span><b>${t("expRow", { n: s.expedition.row + 1 })}</b>` : `<span>${t("expStart", { n: s.expTickets, m: EXP_TICKETS })}</span>`;
        if (b.dataset.html !== html) b.innerHTML = b.dataset.html = html;
        b.disabled = !s.expedition && s.expTickets <= 0;
        b.classList.toggle("ready", !b.disabled);
        const nTxt = s.expTickets < EXP_TICKETS ? t("expNext", { t: fmtTime(Math.max(0, s.expAt + EXP_TICKET_MS - Date.now()) / 1000) }) : "";
        if (nx.textContent !== nTxt) nx.textContent = nTxt;
      });
      this.body.appendChild(exp);
    }

    this.body.appendChild(el("h4", "sect", `${icon("r_sword", "ico sm")} ${t("relicsTitle")} <small>${s.relics.length}/${RELICS.length}</small>`));
    const relics = el("div", "relics");
    for (const r of RELICS) {
      const owned = s.relics.includes(r.id);
      const b = el("button", "relic" + (owned ? " on" : ""), `${icon(r.icon)}<small>${owned ? tk("relic_" + r.id) : "???"}</small>`);
      b.title = tk("relicD_" + r.id);
      b.addEventListener("click", () => g.openRelic(r.id));
      relics.appendChild(b);
    }
    this.body.appendChild(relics);
    if (s.fallenHeroes.length > 0) {
      const k = el("button", "kurganRow", `${icon("balbal", "ico")}<span><b>${t("kurganTitle")}</b><small>${t("kurganLine", { n: s.fallenHeroes.length, b: Math.round(legacyBonus(s) * 100) })}</small></span>`);
      k.addEventListener("click", () => g.openKurgan());
      this.body.appendChild(k);
    }

    if (s.hero) {
      this.body.appendChild(el("h4", "sect", `${icon("mount_1", "ico sm")} ${t("mountTitle")}`));
      const m = s.mount;
      const row = el("div", "gear mountRow");
      const box = m
        ? `<div class="itembox" style="--rar:${RARITY[m.breed]}">${icon(mountIcon(m.breed))}${m.plus > 0 ? `<b>+${m.plus}</b>` : ""}</div>`
        : `<div class="itembox empty">${icon("mount_1")}</div>`;
      const info = m
        ? `<div class="name" style="color:${RARITY[m.breed]}">${m.plus > 0 ? `+${m.plus} ` : ""}${tk("mount_" + m.breed)}</div><small>${t("mountStats", { sp: Math.round((mountSpeed(s) - 1) * 100), p: fmt(mountPower(s)) })}</small>`
        : `<div class="name">${t("mountNone")}</div><small>${t("mountHint")}</small>`;
      row.innerHTML = `${box}<div class="mid">${info}</div>`;
      const btns = el("div", "gbtns");
      const nextBreed = (m?.breed ?? 0) + 1;
      if (nextBreed <= MAX_BREED) {
        const b = el("button", "craft", `<span>${icon(mountIcon(nextBreed))} ${tk("mount_" + nextBreed)}</span><small class="mc"></small>`);
        b.addEventListener("click", () => g.buyMount());
        btns.appendChild(b);
        this.dynamic.push(() => {
          const c = mountCost(nextBreed, income());
          const html = `${icon("coins")}${fmt(c.gold)} ${matsHtml(c.mats)}`;
          const sm = b.querySelector<HTMLElement>(".mc")!;
          if (sm.dataset.h !== html) sm.innerHTML = sm.dataset.h = html;
          const ok = s.gold >= c.gold && hasMats(s, c.mats);
          b.disabled = !ok;
          b.classList.toggle("ready", ok);
        });
      }
      if (m && m.plus < MAX_PLUS) {
        const cost = mountPlusCost(m);
        const ch = plusChance(m.plus);
        const b = el("button", "plus", `<span>${icon("anvil")} +${m.plus + 1}${ch < 1 ? ` <i class="risk">%${Math.round(ch * 100)}</i>` : ""}</span><small>${matsHtml(cost)}</small>`);
        b.addEventListener("click", () => g.enhanceMount());
        btns.appendChild(b);
        this.dynamic.push(() => {
          const ok = hasMats(s, cost);
          b.disabled = !ok;
          b.classList.toggle("ready", ok);
        });
      }
      row.appendChild(btns);
      this.body.appendChild(row);
    }

    this.body.appendChild(el("h4", "sect", `${icon("anvil", "ico sm")} ${t("smithTitle")}`));
    this.body.appendChild(el("p", "muted small", t("smithIntro")));
    if (s.hero) {
      this.body.appendChild(this.gearRow("hero", "weapon", ["sword", "bow"], s.hero.gear.weapon, t("slotWeapon")));
      this.body.appendChild(this.gearRow("hero", "shield", ["shield"], s.hero.gear.shield, t("slotShield")));
      this.body.appendChild(this.gearRow("hero", "armor", ["armor"], s.hero.gear.armor, t("slotArmor")));
    }
    for (const id of COMPANION_IDS) {
      if (compLevel(s, id) <= 0) continue;
      const wrap = el("div", "compGear");
      wrap.innerHTML = `<div class="cg">${compPortrait(id, "face")}<b>${compText(id, lang).name}</b></div>`;
      const g = s.compGear[id];
      wrap.appendChild(this.gearRow(id, "weapon", ["sword", "bow"], g?.weapon, t("slotWeapon")));
      wrap.appendChild(this.gearRow(id, "shield", ["shield"], g?.shield, t("slotShield")));
      wrap.appendChild(this.gearRow(id, "armor", ["armor"], g?.armor, t("slotArmor")));
      this.body.appendChild(wrap);
    }
  }

  private matBar(): HTMLElement {
    const s = this.g.s;
    const mats = el("div", "matbar");
    this.dynamic.push(() => {
      const html = MATERIALS.map((m) => `<div class="mat" title="${tk("mat_" + m)}">${icon("mat_" + m)}<b>${fmt(s.mats[m])}</b><small>${tk("mat_" + m)}</small></div>`).join("");
      if (mats.dataset.html !== html) mats.innerHTML = mats.dataset.html = html;
    });
    return mats;
  }

  private buildTroopsSub(): void {
    const g = this.g;
    const s = g.s;
    const income = () => totalIncomePerSec(s, Date.now(), false, false);

    this.body.appendChild(el("p", "muted small", t("armyIntro")));
    const top = el("div", "armyTop");
    top.innerHTML = `<div class="kv"><span>${t("soldiersTotal")}</span><b class="aTot"></b></div><div class="kv"><span>${t("soldiersIdle")}</span><b class="aIdle"></b></div><div class="kv"><span>${icon("healer", "ico sm")} ${t("wounded")}</span><b class="aWnd"></b></div>${s.siege ? `<div class="kv"><span>${icon("fortress", "ico sm")} ${t("inSiege")}</span><b class="aSg"></b></div>` : ""}<div class="kv"><span>${t("soldierPower")}</span><b>${soldierPower(s).toFixed(1)}</b></div>`;
    const btnRow = el("div", "armyBtns");
    for (const n of [10, 50]) {
      const b = el("button", "buy", `<span>+${n} ${t("soldiers")}</span><b></b>`);
      b.addEventListener("click", () => g.recruit(n));
      btnRow.appendChild(b);
      this.dynamic.push(() => {
        const c = recruitCost(s, n, income());
        b.querySelector("b")!.textContent = fmt(c);
        b.disabled = s.gold < c;
      });
    }
    const auto = el("button", "secondary", t("autoAssign"));
    auto.addEventListener("click", () => g.autoEscorts());
    btnRow.appendChild(auto);
    top.appendChild(btnRow);
    if (s.barracks < MAX_BARRACKS) {
      const bb = el("button", "buy wide", `<span>${icon("barracks")} ${t("barracksUp", { n: s.barracks + 1 })}</span><b></b>`);
      bb.addEventListener("click", () => g.upgradeBarracks());
      top.appendChild(bb);
      this.dynamic.push(() => {
        const c = barracksCost(s, income());
        bb.querySelector("b")!.textContent = fmt(c);
        bb.disabled = s.gold < c;
      });
    }
    this.body.appendChild(top);
    this.dynamic.push(() => {
      top.querySelector(".aTot")!.textContent = fmt(s.soldiers);
      top.querySelector(".aIdle")!.textContent = fmt(idleSoldiers(s));
      top.querySelector(".aWnd")!.textContent = s.wounded > 0 ? `${fmt(s.wounded)} ${t("healing")}` : "0";
      const sg = top.querySelector(".aSg");
      if (sg) sg.textContent = fmt(s.siege?.troops ?? 0);
    });

    this.body.appendChild(el("h4", "sect", `${icon("u_cavalry", "ico sm")} ${t("unitsTitle")}`));
    const units = el("div", "units");
    units.innerHTML = UNIT_TYPES.map((u) => {
      const open = unitUnlocked(s, u);
      return `<div class="unit${open ? "" : " locked"}">${icon("u_" + u)}<b>${tk("unit_" + u)}</b><small>${open ? t("unitBeats", { k: tk("bk_" + unitBeats(u)) }) : t("unitLocked", { n: UNIT_UNLOCK[u] })}</small></div>`;
    }).join("");
    this.body.appendChild(units);

    this.body.appendChild(el("h4", "sect", `${icon("soldier", "ico sm")} ${t("armyTitle")}`));
    for (let i = 0; i < ROUTES.length; i++) {
      if (s.routes[i].owned <= 0) continue;
      const kind = banditKind(i);
      const cls = s.escortClass[i] ?? "spear";
      const cm = classMult(cls, kind);
      const prot = routeProtected(s, i);
      const nem = nemesisOn(s, i);
      const row = el("div", "escort");
      row.innerHTML = `<div class="icon">${goodsIcon(i)}</div><div class="mid"><div class="name">${goodsName(i)} <small>${icon("b_" + kind, "ico xs")} ${t("banditPower", { p: fmt(banditStrength(s, i)) })}</small>${prot ? ` <em class="prot">${t("protectedTag")}</em>` : ""}${nem ? ` <em class="nemTag">☠ ${nemesisName(nem)}</em>` : ""}</div><div class="sec"><i></i></div><small class="secTxt"></small></div>`;
      const ctl = el("div", "ectl");
      const ub = el("button", "unitBtn " + (cm > 1 ? "good" : cm < 1 ? "bad" : ""), `${icon("u_" + cls)}<small>x${cm}</small>`);
      ub.title = tk("unit_" + cls);
      ub.addEventListener("click", () => g.setEscortClass(i));
      const minus = el("button", "", "−");
      const cnt = el("b", "", "");
      const plus = el("button", "", "+");
      minus.addEventListener("click", (ev) => g.assignEscort(i, ev.shiftKey ? -50 : -5));
      plus.addEventListener("click", (ev) => g.assignEscort(i, ev.shiftKey ? 50 : 5));
      ctl.append(ub, minus, cnt, plus);
      row.appendChild(ctl);
      this.body.appendChild(row);
      this.dynamic.push(() => {
        cnt.textContent = fmt(s.escorts[i] ?? 0);
        const auto = winChance(escortPower(s, i), banditStrength(s, i));
        const lead = winChance(escortPower(s, i) + heroPower(s) + companionPower(s), banditStrength(s, i));
        const bar = row.querySelector<HTMLElement>(".sec i")!;
        bar.style.width = (auto * 100).toFixed(0) + "%";
        bar.style.background = auto > 0.7 ? "#5fd36a" : auto > 0.4 ? "#e8c04a" : "#e05a3a";
        row.querySelector(".secTxt")!.textContent = t("securityTxt", { a: Math.round(auto * 100), b: Math.round(lead * 100) });
      });
    }

    const st = monumentStage(s);
    const mon = el("div", "monCard");
    const next = MONUMENT_STEPS[st];
    mon.innerHTML = `${icon("monument", "ico big")}<div class="mid"><b>${t("monTitle")} ${"★".repeat(st)}</b><small>${t("monSummary", { n: fmt(s.stats.fallen), p: Math.round(st * MONUMENT_BONUS * 100) })}${next ? ` · ${t("monNext", { n: fmt(next) })}` : ""}</small></div>`;
    mon.addEventListener("click", () => g.openMonument());
    this.body.appendChild(mon);
  }

  private buildContracts(): void {
    const g = this.g;
    const s = g.s;
    this.body.appendChild(el("h4", "sect", `${icon("scroll", "ico sm")} ${t("contractsTitle")}`));
    const board = el("div", "contracts");
    board.appendChild(el("p", "muted small", s.contracts.bonus ? t("contractBonusDone") : t("contractsHint")));
    s.contracts.list.forEach((c, i) => {
      const row = el("div", "contract" + (c.claimed ? " claimed" : ""));
      row.innerHTML = `<div class="mid"><b>${tk("contract_" + c.kind, { n: c.n })}</b><div class="cbar"><i></i><span></span></div></div>`;
      const b = el("button", "buy", c.claimed ? `<span>✓ ${t("contractClaimed")}</span>` : `<span>${t("contractClaim")}</span><b>${icon("mat_steel", "ico xs")}${CONTRACT_STEEL}</b>`);
      b.addEventListener("click", () => g.claimContract(i));
      row.appendChild(b);
      const bar = row.querySelector<HTMLElement>(".cbar i")!;
      const lbl = row.querySelector<HTMLElement>(".cbar span")!;
      this.dynamic.push(() => {
        const p = contractProgress(s, c);
        bar.style.width = `${((p / c.n) * 100).toFixed(1)}%`;
        lbl.textContent = `${fmt(p)}/${fmt(c.n)}`;
        const ok = contractReady(s, c);
        b.disabled = !ok;
        b.classList.toggle("ready", ok);
      });
      board.appendChild(row);
    });
    this.body.appendChild(board);
  }

  private buildSpies(): void {
    const g = this.g;
    const s = g.s;
    const lv = s.spies;
    this.body.appendChild(el("h4", "sect", `${icon("spy", "ico sm")} ${t("spyTitle")} <small>${lv}/${SPY_MAX}</small>`));
    const card = el("div", "spyCard");
    const perks = [
      t("spyPerkFoil", { p: Math.round(SPY_FOIL * 100 * Math.max(1, lv)) }),
      t("spyPerkSab", { p: Math.round(SPY_SABOTAGE * 100 * Math.max(1, lv)) }),
      t("spyPerkTitan", { p: Math.round(SPY_TITAN * 100 * Math.max(1, lv)) }),
    ];
    card.innerHTML = `${icon("spy", "ico big")}<div class="mid"><small>${t("spyIntro")}</small><ul>${perks.map((p) => `<li class="${lv > 0 ? "got" : ""}">${p}</li>`).join("")}</ul><div class="intel"></div></div>`;
    if (lv < SPY_MAX) {
      const steel = SPY_STEEL[lv];
      const b = el("button", "buy", `<span>${lv === 0 ? t("spyHire") : t("spyUpBtn")}</span><b class="sg"></b>`);
      b.addEventListener("click", () => g.upgradeSpies());
      card.appendChild(b);
      this.dynamic.push(() => {
        const gold = g.spyGold();
        b.querySelector(".sg")!.innerHTML = `${fmt(gold)} · ${icon("mat_steel", "ico xs")}${steel}`;
        const can = s.gold >= gold && s.mats.steel >= steel;
        b.disabled = !can;
        b.classList.toggle("ready", can);
      });
    } else card.appendChild(el("div", "hired", "✔ " + t("compMax")));
    const intel = card.querySelector<HTMLElement>(".intel")!;
    this.dynamic.push(() => {
      if (lv === 0) {
        intel.textContent = "";
        return;
      }
      const now = Date.now();
      const rows = [`${icon("tradewar", "ico xs")} ${s.tradeWar && s.tradeWar.until > now ? t("spyTwNow") : t("spyTwEta", { t: fmtTime(Math.max(0, s.nextTradeWar - now) / 1000) })}`];
      if (lv >= 2) rows.push(`${icon("tepegoz", "ico xs")} ${s.titan ? t("spyTitanNow") : t("spyTitanEta", { t: fmtTime(Math.max(0, s.nextTitan - now) / 1000) })}`);
      if (lv >= 3 && s.hans.length) rows.push(`${icon("han", "ico xs")} ${t("spyHanEta", { t: fmtTime(Math.max(0, s.nextHanStory - now) / 1000) })}`);
      const html = rows.join("<br>");
      if (intel.dataset.html !== html) intel.innerHTML = intel.dataset.html = html;
    });
    this.body.appendChild(card);
  }

  private buildWarSub(): void {
    const g = this.g;
    const s = g.s;
    this.buildContracts();
    this.buildSpies();
    this.body.appendChild(el("h4", "sect", `${icon("wanted", "ico sm")} ${t("nemBoard")}`));
    this.body.appendChild(el("p", "muted small", t("nemIntro")));
    if (s.nemeses.length === 0) this.body.appendChild(el("div", "empty", t("nemNone")));
    for (const n of s.nemeses) {
      const card = el("div", "nemCard");
      const str = nemesisStrength(s, n);
      const lead = winChance(escortPower(s, n.route) + heroPower(s) + companionPower(s), str);
      card.innerHTML = `${nemesisPortrait(n.look, "nemFace")}<div class="mid"><b>${nemesisName(n)}</b><small>${t("nemLevel", { n: n.level })} · ${goodsName(n.route)} · ⚔ ${fmt(str)}</small><small>${n.wins > 0 ? t("nemBeatYou", { n: n.wins }) + " · " : ""}${t("nemChance", { p: Math.round(lead * 100) })}</small></div><div class="bounty">${icon("wanted", "ico")}<small>x${4 + n.level}</small></div>`;
      this.body.appendChild(card);
    }

    this.body.appendChild(el("h4", "sect", `${icon("fortress", "ico sm")} ${t("fortsTitle")}`));
    this.body.appendChild(el("p", "muted small", t("fortsIntro")));
    for (const f of FORTS) {
      const card = el("div", "fortCard");
      const open = fortAvailable(s, f);
      const taken = fortTaken(s, f.id);
      const sieged = s.siege?.fort === f.id;
      let status: string;
      if (!open) status = `<small>${t("fortLocked", { good: goodsName(f.route) })}</small>`;
      else if (taken) status = `<small class="ok">✓ ${t("fortOwnedShort")}</small>`;
      else if (sieged) {
        const sg = s.siege!;
        status = `<small class="siege">${t("siegeStatus", { w: sg.wave, m: FORT_WAVES, n: fmt(sg.troops) })}</small><div class="pips">${Array.from({ length: FORT_WALLS }, (_, k) => `<i class="${k < FORT_WALLS - sg.walls ? "on" : ""}"></i>`).join("")}</div>`;
      } else {
        const pen = threatMult(s, 5 + FORTS.indexOf(f) * 5);
        const hard = pen > 1 ? `<br><small class="bad">${t("underNam", { p: Math.round((pen - 1) * 100) })}</small>` : "";
        status = `<small>⚔ ${fmt(fortStrength(s, f))} · ${t("fortOddsShort", { p: Math.round(siegeOdds(s, f, idleSoldiers(s), !!s.hero) * 100), n: fmt(idleSoldiers(s)) })}</small>${hard}`;
      }
      card.className = "fortCard" + (open ? "" : " locked") + (taken ? " taken" : "") + (sieged ? " sieged" : "");
      card.innerHTML = `${icon("fortress", "ico big")}<div class="mid"><b>${tk("fort_" + f.id)}</b>${status}</div>`;
      if (open && !taken && !sieged) {
        const b = el("button", "buy", `<span>${t("siegeBtn")}</span>`);
        b.addEventListener("click", () => g.openFort(f.id));
        b.disabled = !!s.siege;
        card.appendChild(b);
      }
      this.body.appendChild(card);
    }
  }

  private buildArenaSub(): void {
    const g = this.g;
    const s = g.s;
    if (!s.hero) {
      this.body.appendChild(el("div", "empty", t("arenaNeedHero")));
      return;
    }
    const now = Date.now();
    const head = el("div", "arenaHead");
    head.innerHTML = `${icon("trophy", "ico big")}<div class="mid"><b>${t("arenaTitle")}</b><small>${t("arenaIntro")}</small><div class="arow"><span>${t("arenaRatingLbl")} <b>${Math.round(s.arena.rating)}</b></span><span>${t("arenaRank")} <b>#${arenaRank(s, now)}</b></span><span>${t("arenaTickets")} <b class="tk"></b></span></div><small class="season"></small></div>`;
    const share = el("button", "mini shareBtn", `${icon("trophy", "ico xs")} ${t("shareBtn")}`);
    share.addEventListener("click", () => g.openShareCard());
    head.appendChild(share);
    this.body.appendChild(head);
    this.dynamic.push(() => {
      const n = Date.now();
      const a = s.arena;
      const next = a.tickets < MAX_TICKETS ? ` · ${fmtTime((a.ticketAt + TICKET_MS - n) / 1000)}` : "";
      head.querySelector(".tk")!.textContent = `${a.tickets}/${MAX_TICKETS}${next}`;
      head.querySelector(".season")!.textContent = t("seasonLeft", { t: fmtTime(weekLeft(n) / 1000) });
    });

    this.body.appendChild(el("h4", "sect", `${icon("arena", "ico sm")} ${t("arenaOpp")}`));
    const my = arenaPower(s);
    opponents(s, now).forEach((o) => {
      const row = el("div", "oppRow");
      const ch = winChance(my, o.power);
      row.innerHTML = `${heroPortrait(o.look, "face")}<div class="mid"><b>${o.name}</b><small>${t("arenaRatingLbl")} ${o.rating} · ⚔ ${fmt(o.power)}</small><small>${t("arenaReward", { r: ARENA_GAIN[o.tier], n: ARENA_STEEL[o.tier] })}</small></div>`;
      const b = el("button", "buy", `<span>${t("arenaFight")}</span><b>%${Math.round(ch * 100)}</b>`);
      b.addEventListener("click", () => g.arenaFight(o.tier));
      this.dynamic.push(() => (b.disabled = s.arena.tickets <= 0));
      row.appendChild(b);
      this.body.appendChild(row);
    });

    this.body.appendChild(el("h4", "sect", `${icon("trophy", "ico sm")} ${t("arenaBoard")}`));
    const board = el("div", "lboard");
    board.innerHTML = leaderboard(s, now)
      .map((p, k) => `<div class="lrow${p.me ? " me" : ""}"><i>${k + 1}</i>${heroPortrait(p.look, "face")}<span>${p.name.replace(/</g, "")}</span><b>${p.rating}</b></div>`)
      .join("");
    this.body.appendChild(board);
    this.body.appendChild(el("p", "muted small", t("arenaSeasonInfo", { a: seasonReward(1), b: seasonReward(3), c: seasonReward(10) })));
  }

  private buildAllegiance(): void {
    const g = this.g;
    const s = g.s;
    const a = s.allegiance;
    const free = favorFree(s);
    this.body.appendChild(el("h4", "sect", `${icon(a.path ? PATH_ICON[a.path] : "f_ahi", "ico sm")} ${t("oathTitle")} <small>${t("favorLine", { n: free, m: favorPoints(s) })}</small>`));
    this.body.appendChild(el("p", "muted small", t("oathIntro")));
    const wrap = el("div", "paths");
    for (const p of PATHS) {
      const mine = a.path === p;
      const card = el("div", "pathCard" + (mine ? " on" : "") + (a.path && !mine ? " dim" : ""));
      const perks = PERKS[p]
        .map((pk, k) => {
          const got = mine && k < a.rank;
          return `<li class="${got ? "got" : mine && k === a.rank ? "next" : ""}"><i>${PERK_COST[k]}</i>${perkText(pk)}</li>`;
        })
        .join("");
      card.innerHTML = `<div class="phead">${icon(PATH_ICON[p], "ico")}<div><b>${tk("path_" + p)}</b><small>${tk("pathD_" + p)}</small></div></div><ul>${perks}</ul>`;
      if (mine) {
        if (a.rank < PERK_COST.length) {
          const b = el("button", "buy", `<span>${t("perkBuy")}</span><b>${PERK_COST[a.rank]} ✦</b>`);
          b.disabled = free < PERK_COST[a.rank];
          b.classList.toggle("ready", !b.disabled);
          b.addEventListener("click", () => g.buyPerk());
          card.appendChild(b);
        } else card.appendChild(el("div", "hired", "✔ " + t("compMax")));
      } else {
        const b = el("button", a.path ? "mini" : "buy", `<span>${a.path ? t("oathSwitch") : t("oathSwear")}</span>`);
        b.addEventListener("click", () => g.chooseOath(p as PathId));
        card.appendChild(b);
      }
      wrap.appendChild(card);
    }
    this.body.appendChild(wrap);
    this.body.appendChild(el("p", "muted small", t("favorHow")));
  }

  private buildMarriage(): void {
    const g = this.g;
    const s = g.s;
    this.body.appendChild(el("h4", "sect", `${icon("rings", "ico sm")} ${t("marriageTitle")}`));
    this.body.appendChild(el("p", "muted small", t("marriageIntro", { p: Math.round(BLOOD_SHARE * 100) })));
    if (s.spouse) {
      const h = houseDef(s.spouse);
      const card = el("div", "brideCard on");
      card.innerHTML = `${icon("rings", "ico big")}<div class="mid"><b>${h.bride}</b><small>${tk("house_" + h.id)}</small><small class="perk">${perkText(h)}</small></div>`;
      this.body.appendChild(card);
    } else {
      const wrap = el("div", "brides");
      for (const id of houseOffers(s.ruler.gen)) {
        const h = houseDef(id);
        const card = el("div", "brideCard");
        card.innerHTML = `<div class="mid"><b>${h.bride}</b><small>${tk("house_" + id)}</small><small class="perk">${perkText(h)}</small></div>`;
        const b = el("button", "buy", `<span>${t("marryBtn")}</span><b class="wc"></b>`);
        b.addEventListener("click", () => g.marry(id));
        card.appendChild(b);
        this.dynamic.push(() => {
          const cost = g.weddingCost();
          b.querySelector(".wc")!.textContent = fmt(cost);
          b.disabled = s.gold < cost;
          b.classList.toggle("ready", s.gold >= cost);
        });
        wrap.appendChild(card);
      }
      this.body.appendChild(wrap);
    }
    if (s.bloodline.length > 0) {
      const counts = new Map<HouseId, number>();
      for (const id of s.bloodline) counts.set(id, (counts.get(id) ?? 0) + 1);
      const parts = [...counts].map(([id, n]) => {
        const h = houseDef(id);
        return `<span class="blood">${tk("house_" + id)} ×${n} · ${perkText({ kind: h.kind, v: h.v * BLOOD_SHARE * n })}</span>`;
      });
      this.body.appendChild(el("div", "bloodline", `<small>${t("bloodlineLbl")}</small>${parts.join("")}`));
    }
  }

  private buildRaid(): void {
    const g = this.g;
    const s = g.s;
    const now = Date.now();
    const total = raidTotal(s, now);
    const r = s.raid;
    this.body.appendChild(el("h4", "sect", `${icon("raid", "ico sm")} ${t("raidTitle")}`));
    const box = el("div", "raidBox" + (total >= 1 ? " dead" : ""));
    box.innerHTML = `<div class="raidBoss">${icon("yelbegen", "ico")}</div><div class="mid"><b>${t("raidBoss")}</b><small>${t("raidIntro")}</small><div class="cbar big hp"><i style="width:${((1 - total) * 100).toFixed(1)}%"></i><span>${total >= 1 ? t("raidSlain") : `%${((1 - total) * 100).toFixed(1)}`}</span></div><div class="rtiers">${RAID_TIERS.map((p, k) => `<i class="${k < r.claimed ? "done" : total >= p ? "ready" : ""}">${Math.round(p * 100)}%</i>`).join("")}</div></div>`;
    this.body.appendChild(box);
    const row = el("div", "raidBtns");
    if (total < 1) {
      const atk = el("button", "primary wide", "");
      atk.addEventListener("click", () => g.raidAttack());
      row.appendChild(atk);
      this.dynamic.push(() => {
        const n = Date.now();
        const next = r.tickets < RAID_TICKETS ? ` · ${fmtTime(Math.max(0, r.ticketAt + RAID_TICKET_MS - n) / 1000)}` : "";
        const html = `${icon("raid", "ico xs")} ${t("raidAttack", { n: r.tickets, m: RAID_TICKETS })}<small>${t("raidDmg", { p: (raidHit(s) * 100).toFixed(1) })}${next}</small>`;
        if (atk.dataset.html !== html) atk.innerHTML = atk.dataset.html = html;
        atk.disabled = r.tickets <= 0;
        atk.classList.toggle("glow", r.tickets >= RAID_TICKETS);
      });
    }
    if (raidTierReady(s, now)) {
      const b = el("button", "buy ready", `<span>${t("raidClaim")}</span><b>${Math.round(RAID_TIERS[r.claimed] * 100)}%</b>`);
      b.addEventListener("click", () => g.claimRaidTier());
      row.appendChild(b);
    }
    this.body.appendChild(row);
    const board = el("div", "lboard");
    board.innerHTML = raidMembers(s, now)
      .map((m, k) => `<div class="lrow${m.me ? " me" : ""}"><i>${k + 1}</i>${heroPortrait(m.look, "face")}<span>${m.name.replace(/</g, "")}</span><b>%${(m.dmg * 100).toFixed(1)}</b></div>`)
      .join("");
    this.body.appendChild(board);
  }

  private buildRealmSub(): void {
    const g = this.g;
    const s = g.s;
    this.body.appendChild(el("p", "muted small", t("realmIntro")));
    if (s.incursion) {
      const inc = el("button", "buy danger incBtn", `<span>${icon("swords", "ico sm")} ${t("incTitle")}: ${tk("reg_" + REGIONS[s.incursion.k].id)}</span><b></b>`);
      inc.addEventListener("click", () => g.openIncursion());
      const ib = inc.querySelector("b")!;
      this.dynamic.push(() => {
        const left = s.incursion ? fmtTime(Math.max(0, s.incursion.until - Date.now()) / 1000) : "";
        if (ib.textContent !== left) ib.textContent = left;
      });
      this.body.appendChild(inc);
    }
    const wl = el("p", "weatherLine small", "");
    this.dynamic.push(() => {
      const now = Date.now();
      const w = weatherAt(now);
      const html = `${icon("w_" + w, "ico sm")} ${t("weatherLine", { w: t(("wname_" + w) as "wname_clear"), t: fmtTime((weatherEnds(now) - now) / 1000) })}`;
      if (wl.dataset.h !== html) wl.innerHTML = wl.dataset.h = html;
    });
    this.body.appendChild(wl);
    if (s.merchant) {
      const mb = el("button", "sagaBtn merchBtn", `${icon("merchant", "ico")}<span><b>${t("merchTitle")}</b><small>${tk("reg_" + REGIONS[s.merchant.k].id)}</small></span><b class="mt"></b>`);
      mb.addEventListener("click", () => g.openMerchant());
      const mt = mb.querySelector<HTMLElement>(".mt")!;
      this.dynamic.push(() => {
        const left = s.merchant ? fmtTime(Math.max(0, s.merchant.until - Date.now()) / 1000) : "";
        if (mt.textContent !== left) mt.textContent = left;
      });
      this.body.appendChild(mb);
    }
    const forge = el("button", "sagaBtn artBtn", `${icon("anvil", "ico")}<span><b>${t("artBtn")}</b><small>${s.artEquip.map((id) => tk("art_" + id)).join(" · ") || t("artHint", { n: ART_SLOTS })}</small></span>${s.artEquip.map((id) => icon(id, "ico")).join("")}`);
    forge.addEventListener("click", () => g.openForge());
    if (ARTIFACTS.some((a) => canForgeArt(s, a))) forge.classList.add("ready");
    this.body.appendChild(forge);

    const rule = el("div", "realmCard");
    rule.innerHTML = `<div class="rhead">${icon("tax", "ico")}<div><b>${t("taxTitle")}</b><small class="tm"></small></div></div><div class="taxBtns"></div><div class="moodBar"><i></i></div><small class="mood"></small>`;
    const taxBtns = rule.querySelector(".taxBtns")!;
    TAXES.forEach((tx, n) => {
      const b = el("button", "mini" + (s.tax === n ? " active" : ""), `<span>${t(("tax_" + n) as "tax_0")}</span><b>${tx.mult >= 1 ? "+" : ""}${Math.round((tx.mult - 1) * 100)}%</b>`);
      b.addEventListener("click", () => g.setTax(n));
      taxBtns.appendChild(b);
    });
    const tm = rule.querySelector<HTMLElement>(".tm")!;
    const moodFill = rule.querySelector<HTMLElement>(".moodBar i")!;
    const moodTxt = rule.querySelector<HTMLElement>(".mood")!;
    this.dynamic.push(() => {
      const m = Math.round(s.mood);
      moodFill.style.width = `${m}%`;
      moodFill.className = m >= HAPPY_MOOD ? "pos" : m < REVOLT_MOOD ? "neg" : "";
      const state = s.revolt >= 0 ? t("moodRevolt", { region: tk("reg_" + REGIONS[s.revolt].id) }) : m >= HAPPY_MOOD ? t("moodHappy") : m < REVOLT_MOOD ? t("moodAngry") : t("moodCalm");
      const txt = `${t("moodLine", { n: m, target: TAXES[s.tax].mood })} · ${state}`;
      if (moodTxt.textContent !== txt) moodTxt.textContent = txt;
      const tt = t("taxNow", { p: Math.round((provinceMult(s) - 1) * 100) });
      if (tm.textContent !== tt) tm.textContent = tt;
    });
    if (s.revolt >= 0) {
      const rb = el("button", "buy danger", `<span>${icon("revolt", "ico sm")} ${t("revoltTitle")}</span>`);
      rb.addEventListener("click", () => g.openRevolt());
      rule.appendChild(rb);
    }
    this.body.appendChild(rule);

    const merc = el("div", "realmCard");
    merc.innerHTML = `<div class="rhead">${icon("merc", "ico")}<div><b>${t("mercTitle")}</b><small class="mc"></small></div></div><small class="muted mw"></small>`;
    const mc = merc.querySelector<HTMLElement>(".mc")!;
    const mw = merc.querySelector<HTMLElement>(".mw")!;
    this.dynamic.push(() => {
      const now = Date.now();
      const income = Math.max(1, totalIncomePerSec(s, now, false, false));
      const a = t("mercLine", { n: s.mercs, p: fmt(s.mercs * mercPower(s)) });
      const b = t("mercPay", { g: fmt(monthWage(s, income)), t: fmtTime(Math.max(0, s.wageAt - now) / 1000) });
      if (mc.textContent !== a) mc.textContent = a;
      if (mw.textContent !== b) mw.textContent = b;
    });
    this.body.appendChild(merc);

    this.body.appendChild(el("h4", "sect", `${icon("village", "ico sm")} ${t("regTitle", { n: realmNam(s) })}`));
    for (let k = 0; k < REGIONS.length; k++) {
      const def = REGIONS[k];
      const rg = s.regions[k];
      const vis = regionVisible(s, k);
      const card = el("div", "regCard" + (vis ? "" : " locked") + (regionConquered(s, k) ? " conq" : "") + (s.revolt === k ? " revolt" : ""));
      const tro = def.trophies.map((id, j) => `<i class="r${j}${s.trophies[id] ? "" : " miss"}">${icon(id, "ico sm")}</i>`).join("");
      card.innerHTML = vis
        ? `<div class="rgl"><b>${tk("reg_" + def.id)}</b><small class="rs"></small></div><div class="rgt">${tro}</div>`
        : `<div class="rgl"><b>${icon("lock", "ico xs")} ${tk("reg_" + def.id)}</b><small>${t("regNeedRoute", { r: goodsName(def.route) })}</small></div><div class="rgt">${tro}</div>`;
      if (vis) {
        card.addEventListener("click", () => g.openRegion(k));
        const rs = card.querySelector<HTMLElement>(".rs")!;
        this.dynamic.push(() => {
          const now = Date.now();
          const txt = !rg.open
            ? `${t("regOpen")} · ${fmt(regionCost(k))}`
            : `${t("regLvl", { n: rg.lv, max: REGION_MAX })} · ${now >= rg.at ? t("regReady") : fmtTime((rg.at - now) / 1000)}${Math.floor(rg.youth) > 0 ? ` · ${icon("village", "ico xs")}${Math.floor(rg.youth)}` : ""}${questDone(s, k) ? " · ✦" : ""}`;
          if (rs.dataset.t !== txt) rs.innerHTML = rs.dataset.t = txt;
          card.classList.toggle("ready", rg.open && (now >= rg.at || questDone(s, k)));
        });
      }
      this.body.appendChild(card);
    }

    const owned = TROPHY_IDS.filter((id) => (s.trophies[id] ?? 0) > 0).length;
    this.body.appendChild(el("h4", "sect", `${icon("trophy", "ico sm")} ${t("codexTitle", { n: owned, max: TROPHY_IDS.length })}`));
    this.body.appendChild(el("p", "muted small", t("codexIntro", { p: Math.round((trophyMult(s) - 1) * 100) })));
    const codex = el("div", "codex");
    codex.innerHTML = TROPHY_IDS.map((id) => {
      const n = s.trophies[id] ?? 0;
      return `<div class="tro r${TROPHY_RARITY[id]}${n ? "" : " miss"}" title="${tk("tro_" + id)}">${icon(id, "ico")}<small>${n ? tk("tro_" + id) : "???"}</small>${n ? `<b>×${n}</b>` : ""}</div>`;
    }).join("");
    this.body.appendChild(codex);
  }

  private buildGuildSub(): void {
    const g = this.g;
    const s = g.s;
    const now = Date.now();
    const ev = seasonEvent(now);
    const evBox = el("div", "seasonEv");
    evBox.innerHTML = `${icon(ev.icon, "ico big")}<div class="mid"><small>${t("weekEvent")}</small><b>${tk("ev_" + ev.id)}</b><small>${tk("evD_" + ev.id)}</small><small class="left"></small></div>`;
    this.body.appendChild(evBox);
    this.dynamic.push(() => (evBox.querySelector(".left")!.textContent = t("seasonLeft", { t: fmtTime(seasonLeft(Date.now()) / 1000) })));
    const fest = activeFestival(now);
    const nf = nextFestival(now);
    const fBox = el("div", "seasonEv fest" + (fest ? " on" : ""));
    fBox.innerHTML = fest
      ? `${icon("fest_" + fest.id, "ico big")}<div class="mid"><b>${tk("fest_" + fest.id)}</b><small>${tk("festD_" + fest.id)}</small><small class="left"></small><small class="muted">${t("festNext", { name: tk("fest_" + nf.f.id), t: fmtTime((nf.at - now) / 1000) })}</small></div>`
      : `${icon("fest_" + nf.f.id, "ico big")}<div class="mid"><small>${tk("festD_" + nf.f.id)}</small><b class="left"></b></div>`;
    this.body.appendChild(fBox);
    const fLeft = fBox.querySelector<HTMLElement>(".left")!;
    this.dynamic.push(() => {
      const n = Date.now();
      const txt = fest ? t("festActive", { name: tk("fest_" + fest.id), t: fmtTime(Math.max(0, festivalEnds(fest, n) - n) / 1000) }) : t("festNext", { name: tk("fest_" + nf.f.id), t: fmtTime(Math.max(0, nf.at - n) / 1000) });
      if (fLeft.textContent !== txt) fLeft.textContent = txt;
    });

    this.body.appendChild(el("h4", "sect", `${icon("schest", "ico sm")} ${t("seasonTrack")} <small>${s.season.pts} ✦</small>`));
    const track = el("div", "strack");
    SEASON_STEPS.forEach((n, k) => {
      const done = k < s.season.claimed;
      const ready = k === s.season.claimed && s.season.pts >= n;
      const step = el("div", "sstep" + (done ? " done" : ready ? " ready" : s.season.pts >= n ? " reached" : ""), `${icon(k === SEASON_STEPS.length - 1 ? "r_banner" : "schest", "ico")}<b>${n}</b>`);
      track.appendChild(step);
    });
    this.body.appendChild(track);
    const nextN = SEASON_STEPS[s.season.claimed];
    const bar = el("div", "cbar big", `<i style="width:${nextN ? Math.min(100, (s.season.pts / nextN) * 100).toFixed(1) : 100}%"></i><span>${nextN ? `${s.season.pts} / ${nextN}` : t("seasonDone")}</span>`);
    this.body.appendChild(bar);
    if (seasonStepReady(s)) {
      const b = el("button", "primary wide glow", t("seasonClaim", { n: s.season.claimed + 1 }));
      b.addEventListener("click", () => g.claimSeasonStep());
      this.body.appendChild(b);
    }
    this.body.appendChild(el("p", "muted small", t("seasonHow", { c: SEASON_PTS.contract, ti: SEASON_PTS.titan, n: SEASON_PTS.nemesis, f: SEASON_PTS.fort, w: SEASON_PTS.tradewar })));
    this.buildRaid();

    this.body.appendChild(el("h4", "sect", `${icon("guild", "ico sm")} ${t("guildTitle")}`));
    const members = guildMembers(s, now);
    const total = members.reduce((x, m) => x + m.pts, 0);
    const gnext = GUILD_TIERS[s.season.guildClaimed];
    const ghead = el("div", "guildHead");
    ghead.innerHTML = `${icon("guild", "ico big")}<div class="mid"><b>${t("guildName")}</b><small>${t("guildIntro")}</small><div class="cbar"><i style="width:${gnext ? Math.min(100, (total / gnext) * 100).toFixed(1) : 100}%"></i><span>${gnext ? `${fmt(total)} / ${fmt(gnext)}` : t("seasonDone")}</span></div></div>`;
    if (guildTierReady(s, now)) {
      const b = el("button", "buy ready", `<span>${t("guildClaim")}</span><b>${s.season.guildClaimed + 1}/${GUILD_TIERS.length}</b>`);
      b.addEventListener("click", () => g.claimGuildTier());
      ghead.appendChild(b);
    }
    this.body.appendChild(ghead);
    const board = el("div", "lboard");
    board.innerHTML = members.map((m, k) => `<div class="lrow${m.me ? " me" : ""}"><i>${k + 1}</i>${heroPortrait(m.look, "face")}<span>${m.name.replace(/</g, "")}</span><b>${m.pts} ✦</b></div>`).join("");
    this.body.appendChild(board);
  }

  private buildEmpire(): void {
    const g = this.g;
    const s = g.s;
    const house = el("div", "house");
    const hname = s.house ? s.house.name : t("houseNone");
    house.innerHTML = `${s.house ? crestHtml(s.house, "crest big") : `<div class="crest big empty">${icon("shield")}</div>`}
      <div class="hinfo"><h3>${hname.replace(/</g, "")}</h3>
      <div class="ruler">${t("rulerLine", { ruler: rulerTitle(s, s.ruler), gen: s.ruler.gen })}</div>
      <div class="trait"><b>${tk("trait_" + s.ruler.trait)}</b> · ${tk("traitDesc_" + s.ruler.trait)}</div></div>`;
    const hb = el("button", "mini", s.house ? "✎" : t("houseCreate"));
    hb.addEventListener("click", () => g.openHouse());
    house.appendChild(hb);
    this.body.appendChild(house);
    const saga = el("button", "sagaBtn", `${icon("destan", "ico")}<span><b>${t("sagaTitle")}</b><small>${t("sagaCount", { n: s.sagaLog.length })}</small></span>`);
    saga.addEventListener("click", () => g.openSaga());
    const tree = el("button", "sagaBtn", `${icon("soyagaci", "ico")}<span><b>${t("treeBtn")}</b><small>${t("treeSub", { n: s.ruler.gen })}</small></span>`);
    tree.addEventListener("click", () => g.openTree());
    const books = el("div", "bookRow");
    books.append(saga, tree);
    this.body.appendChild(books);
    this.buildAllegiance();
    this.buildMarriage();

    const cur = AGES[s.age];
    const nx = nextAge(s);
    const ageBox = el("div", "ageBox");
    let ah = `<h4 class="sect">${t("agesTitle")}</h4><div class="ageTrack">${AGES.map((a, k) => `<div class="ageStep${k <= s.age ? " on" : ""}${k === s.age ? " cur" : ""}" title="${tk("age_" + a.id)}">${icon("age_" + a.id)}</div>`).join('<i class="ageLine"></i>')}</div>
      <div class="kv"><span>${t("ageCurrent")}</span><b>${tk("age_" + cur.id)} · x${fmt(ageMult(s))}</b></div>`;
    if (nx) {
      const rOk = openRoutes(s) >= nx.routes;
      const cOk = totalCityLevels(s) >= nx.cities;
      ah += `<div class="ageNext"><div class="kv"><span>${t("ageNext")}</span><b>${tk("age_" + nx.id)} (x${nx.mult})</b></div>
        <div class="req ${rOk ? "ok" : ""}">${rOk ? "✔" : "✖"} ${t("reqRoutes", { a: Math.min(openRoutes(s), nx.routes), b: nx.routes })}</div>
        <div class="req ${cOk ? "ok" : ""}">${cOk ? "✔" : "✖"} ${t("reqCities", { a: Math.min(totalCityLevels(s), nx.cities), b: nx.cities })}</div></div>`;
    } else ah += `<p class="muted">${t("ageMaxed")}</p>`;
    ageBox.innerHTML = ah;
    if (nx) {
      const btn = el("button", "primary ageBtn", `${t("ageAdvance")} · ${fmt(ageCost(s, nx))}`);
      btn.addEventListener("click", () => g.advanceAge());
      ageBox.appendChild(btn);
      this.dynamic.push(() => {
        const ok = canAdvanceAge(s);
        btn.disabled = !ok;
        btn.classList.toggle("glow", ok);
      });
    }
    this.body.appendChild(ageBox);

    this.body.appendChild(el("h4", "sect", `${t("wondersTitle")} <small>x${wonderMult(s).toFixed(2)}</small>`));
    this.body.appendChild(el("p", "muted small", t("wondersIntro")));
    for (const w of WONDERS) {
      const st = wonderStage(s, w.id);
      const card = el("div", "card wonder" + (st >= WONDER_STAGES ? " done" : ""));
      card.innerHTML = `<div class="icon"><img class="wthumb${st === 0 ? " ghost" : ""}" src="${wonderUrl(w.id)}" alt=""></div>
        <div class="mid"><div class="name">${tk("wonder_" + w.id)} <span class="stars">${"★".repeat(st)}<i>${"★".repeat(WONDER_STAGES - st)}</i></span></div>
        <small>${tk("city_" + w.city)} · ${s.age < w.age ? t("wonderNeedsAge", { age: tk("age_" + AGES[w.age].id) }) : t("wonderPerStageShort")}</small></div>`;
      card.querySelector(".icon")!.addEventListener("click", () => g.openWonder(w.id));
      if (st >= WONDER_STAGES) card.appendChild(el("div", "hired", "✔ " + t("compMax")));
      else if (s.age >= w.age) {
        const btn = el("button", "buy", `<span>${t("wonderBuild")}</span><b>${fmt(wonderCost(s, w))}</b>`);
        btn.addEventListener("click", () => g.buildWonder(w.id));
        card.appendChild(btn);
        this.dynamic.push(() => {
          const ok = canBuildWonder(s, w);
          btn.disabled = !ok;
          card.classList.toggle("ready", ok);
        });
      }
      this.body.appendChild(card);
    }

    this.body.appendChild(el("h4", "sect", t("rivalsTitle")));
    this.body.appendChild(el("p", "muted small", t("rivalsIntro", { x: RIVAL_ROUTE_BONUS })));
    const board = el("div", "board");
    this.body.appendChild(board);
    this.dynamic.push(() => {
      const me = s.house ? s.house.name : t("houseNone");
      const rows = [{ name: me, w: s.runEarned, color: CREST_COLORS[s.house?.color ?? 0], me: true, beaten: false, goods: "" }];
      for (const r of RIVALS) rows.push({ name: tk("rival_" + r.id), w: rivalWealth(s, r), color: r.color, me: false, beaten: rivalBeaten(s, r.id), goods: r.routes.map((i) => goodsName(i)).join(", ") });
      rows.sort((a, b) => b.w - a.w);
      const top = Math.max(...rows.map((r) => r.w), 1);
      const html = rows
        .map((r, k) => `<div class="brow${r.me ? " me" : ""}${r.beaten ? " beaten" : ""}"><span class="rank">${k + 1}</span><div class="bmid"><div class="bname">${r.name.replace(/</g, "")}${r.beaten ? ` <small>✔ ${t("rivalDefeated")}</small>` : r.goods ? ` <small>${r.goods}</small>` : ""}</div><div class="bbar"><i style="width:${((Math.log10(r.w + 1) / Math.log10(top + 1)) * 100).toFixed(1)}%;background:${r.color}"></i></div></div><b>${fmt(r.w)}</b></div>`)
        .join("");
      if (board.dataset.html !== html) board.innerHTML = board.dataset.html = html;
    });

    this.buildDiplomacy();
    this.buildDynasty();

    if (s.lineage.length > 0) {
      const lin = el("div", "lineage");
      lin.innerHTML =
        `<h4 class="sect">${t("lineageTitle")}</h4>` +
        [...s.lineage]
          .reverse()
          .slice(0, 12)
          .map((l) => `<div class="lrow"><span class="gen">${l.gen}.</span><div><b>${rulerTitle(s, l)}</b><small>${tk("trait_" + l.trait)} · ${tk("age_" + AGES[l.age].id)}</small></div><b>${fmt(l.best)}</b></div>`)
          .join("");
      this.body.appendChild(lin);
    }
  }

  private buildDiplomacy(): void {
    const g = this.g;
    const s = g.s;
    this.body.appendChild(el("h4", "sect", `${icon("ally", "ico sm")} ${t("diploTitle")}`));
    this.body.appendChild(el("p", "muted small", t("diploIntro")));
    for (const rv of RIVALS) {
      const card = el("div", "diploCard");
      card.style.setProperty("--c", rv.color);
      const name = tk("rival_" + rv.id);
      if (!rivalReached(s, rv)) {
        card.classList.add("locked");
        card.innerHTML = `<div class="dhead"><b>${name}</b><small>${t("diploLocked")}</small></div>`;
        this.body.appendChild(card);
        continue;
      }
      card.innerHTML = `<div class="dhead"><b>${name}</b><small class="rl"></small></div><div class="relBar"><i></i><em></em></div><small class="dst"></small><div class="dbtns"></div>`;
      const btns = card.querySelector(".dbtns")!;
      const mk = (act: DiploAct, label: string, ic: string) => {
        const b = el("button", "mini d_" + act, `${icon(ic, "ico xs")} <span>${label}</span><b></b>`);
        b.addEventListener("click", () => (act === "war" ? g.openWar(rv.id) : g.diplo(rv.id, act)));
        btns.appendChild(b);
        return b;
      };
      const gift = mk("gift", t("diploGift"), "chest");
      const ally = mk("ally", t("diploAlly"), "ally");
      const trib = mk("tribute", t("diploTribute"), "coins");
      const war = mk("war", t("diploWar"), "swords");
      const fill = card.querySelector<HTMLElement>(".relBar i")!;
      const rl = card.querySelector<HTMLElement>(".rl")!;
      const st = card.querySelector<HTMLElement>(".dst")!;
      this.dynamic.push(() => {
        const now = Date.now();
        const r = relation(s, rv.id, now);
        const rel = Math.round(r.rel);
        fill.style.left = rel >= 0 ? "50%" : `${50 + rel / 2}%`;
        fill.style.width = `${Math.abs(rel) / 2}%`;
        fill.className = rel >= 0 ? "pos" : "neg";
        const lbl = `${t(rel >= ALLY_NEED ? "rel_ally" : rel <= -30 ? "rel_hostile" : "rel_neutral")} · ${rel > 0 ? "+" : ""}${rel}`;
        if (rl.textContent !== lbl) rl.textContent = lbl;
        const parts: string[] = [];
        if (r.ally > now) parts.push(t("diploAllyOn", { t: fmtTime((r.ally - now) / 1000) }));
        if (r.spoils > now) parts.push(t("diploSpoilsOn", { t: fmtTime((r.spoils - now) / 1000) }));
        if (r.cd > now && r.ally <= now) parts.push(t("diploCd", { t: fmtTime((r.cd - now) / 1000) }));
        if (rel < ALLY_NEED && r.ally <= now) parts.push(t("diploNeedRel", { n: ALLY_NEED }));
        const stTxt = parts.join(" · ");
        if (st.textContent !== stTxt) st.textContent = stTxt;
        const cd = r.cd > now;
        const income = Math.max(1, totalIncomePerSec(s, now, false, false));
        const gc = giftCost(income);
        gift.querySelector("b")!.textContent = fmt(gc);
        gift.disabled = cd || s.gold < gc || rel >= 100;
        ally.disabled = cd || rel < ALLY_NEED;
        ally.classList.toggle("ready", !ally.disabled);
        trib.querySelector("b")!.textContent = `%${Math.round(tributeOdds(s, rv) * 100)}`;
        trib.disabled = cd;
        war.querySelector("b")!.textContent = `%${Math.round(warOdds(s, rv) * 100)}`;
        war.disabled = cd || idleSoldiers(s) <= 0;
      });
      this.body.appendChild(card);
    }
  }

  private buildDynasty(): void {
    const g = this.g;
    const s = g.s;
    const box = el("div", "dynasty");
    box.innerHTML = `
      <div class="crest">${icon("seal")}</div>
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
    const book = el("div", "chronicle");
    let html = `<h3>${t("chronicleTitle")}</h3><p class="muted">${t("chronicleIntro")}</p>`;
    for (let k = 0; k < s.chronicle.done && k < CHAPTERS.length; k++) {
      const ch = CHAPTERS[k];
      html += `<div class="page">${portrait(ch.traveler)}<div class="ptxt"><div class="pname">${travelerName(ch.traveler)} <small>${t("chapterN", { n: k + 1 })}</small></div><p>${story(ch).done}</p><div class="preward">${rewardText(ch)}</div></div></div>`;
    }
    if (s.chronicle.done < CHAPTERS.length) html += `<div class="page locked"><div class="portrait unknown">?</div><div class="ptxt"><p>${t("chronicleLocked")}</p></div></div>`;
    if (chronicleGlobalMult(s) > 1) html += `<div class="kv"><span>${t("chronicleBonus")}</span><b>x${chronicleGlobalMult(s).toFixed(2)}</b></div>`;
    book.innerHTML = html;
    this.body.appendChild(book);
    const medals = el("div", "medals");
    medals.innerHTML =
      `<h3>${t("achTitle")} <small>${s.achievements.length}/${ACHIEVEMENTS.length}</small></h3><p class="muted">${t("achIntro")}</p><div class="mgrid">` +
      ACHIEVEMENTS.map((a) => {
        const got = s.achievements.includes(a.id);
        return `<div class="medal${got ? " got" : ""}" title="${tk("ach_" + a.id + "_d")}"><div class="disc">${achIcon(a.icon)}</div><b>${tk("ach_" + a.id)}</b><small>${tk("ach_" + a.id + "_d")}</small></div>`;
      }).join("") +
      `</div>` +
      (s.achievements.length > 0 ? `<div class="kv"><span>${t("achBonus")}</span><b>x${achievementMult(s).toFixed(2)}</b></div>` : "");
    this.body.appendChild(medals);
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
        [t("statOrders"), fmt(s.stats.orders)],
        [t("statDynasties"), fmt(s.stats.dynasties)],
        [t("statPlay"), fmtTime(s.stats.playSeconds)],
      ];
      box.innerHTML = rows.map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join("");
    });
  }

  private updateBadges(): void {
    const s = this.g.s;
    const upg =
      UPGRADES.some((u) => !s.upgrades.includes(u.id) && s.gold >= u.cost && (u.kind !== "route" || s.routes[u.route!].owned > 0)) ||
      ROUTES.some((_, i) => canBuildHan(s, i) && s.gold >= hanCost(i) && s.mats.wood >= hanWood(s));
    const mas = ROUTES.some((d, i) => !s.masters[i] && s.routes[i].owned > 0 && s.gold >= d.masterCost);
    const oathReady = s.allegiance.path ? s.allegiance.rank < PERK_COST.length && favorFree(s) >= PERK_COST[s.allegiance.rank] : favorPoints(s) > 0;
    const dyn = claimableSeals(s) >= Math.max(1, s.seals) || canAdvanceAge(s) || WONDERS.some((w) => canBuildWonder(s, w)) || oathReady || (!s.spouse && s.tutorial >= 5 && s.gold >= this.g.weddingCost());
    const set = (tab: Tab, on: boolean) => {
      const b = document.querySelector<HTMLElement>(`.tab[data-tab="${tab}"]`);
      if (b) b.classList.toggle("has", on);
    };
    const canCraft = !!s.hero && (["weapon", "shield", "armor"] as Slot[]).some((sl) => {
      const it = s.hero!.gear[sl];
      const ty: ItemType = it ? it.type : sl === "weapon" ? "sword" : sl;
      return (!it || it.tier < MAX_TIER) && hasMats(s, craftCost(ty, it ? it.tier + 1 : 1));
    });
    set("army", canCraft || (idleSoldiers(s) > 0 && s.routes.some((r) => r.owned > 0)) || !s.hero || (!!s.hero && s.arena.tickets >= MAX_TICKETS) || s.contracts.list.some((c) => contractReady(s, c)) || seasonStepReady(s));
    set("upgrades", upg);
    set("masters", mas);
    set("dynasty", dyn);
  }

  update(nowPerf: number, highlight: { route: number; part: "send" | "buy" } | null, highlightTab: Tab | null): void {
    const g = this.g;
    const s = g.s;
    if (this.dirty || nowPerf - this.lastSig > 150) {
      this.lastSig = nowPerf;
      const sig = this.structureSig();
      if (this.dirty || sig !== this.sig) {
        this.sig = sig;
        this.dirty = false;
        this.build();
      }
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

    const brandHtml = `${s.house ? crestHtml(s.house, "crest hud") : icon("age_" + AGES[s.age].id, "ico hudAge")}`;
    const logo = document.querySelector<HTMLElement>("#topbar .logo")!;
    if (logo.dataset.html !== brandHtml) logo.innerHTML = logo.dataset.html = brandHtml;
    const sub = document.querySelector<HTMLElement>("#topbar .titles small")!;
    const subTxt = s.house ? `${s.house.name} · ${tk("age_" + AGES[s.age].id)}` : tk("age_" + AGES[s.age].id);
    if (sub.textContent !== subTxt) sub.textContent = subTxt;
    $("gold").textContent = fmt(s.gold);
    $("income").textContent = "+" + fmt(totalIncomePerSec(s, now)) + t("perSec");
    $("muteBtn").textContent = s.settings.muted || isPlatformMuted() ? "🔇" : "🔊";

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
    if (favorActive(s, now)) buffs.push(`<span class="buff favor">${icon("crown")} ${t("favorActive", { t: fmtTime((s.favorUntil - now) / 1000) })}</span>`);
    if (boostActive(s, now)) buffs.push(`<span class="buff boost">${icon("genie")} ${t("boostActive", { x: s.boostMult, t: fmtTime((s.boostUntil - now) / 1000) })}</span>`);
    if (s.seals > 0) buffs.push(`<span class="buff seals">${icon("seal")} x${sealMult(s).toFixed(2)}</span>`);
    const tw = tradeWarActive(s, now);
    if (tw) buffs.push(`<span class="buff tw ${tw.won ? "won" : "lost"}">${icon("tradewar")} ${goodsName(tw.route)} ${tw.won ? "+50%" : "−40%"} <small>${fmtTime((tw.until - now) / 1000)}</small></span>`);
    const fest = activeFestival(now);
    if (fest) buffs.push(`<span class="buff fest">${icon("fest_" + fest.id)} ${tk("fest_" + fest.id)}</span>`);
    for (const rv of RIVALS) {
      const d = s.diplo[rv.id];
      if (d && d.ally > now) buffs.push(`<span class="buff camp won">${icon("ally")} ${tk("rival_" + rv.id)} <small>${fmtTime((d.ally - now) / 1000)}</small></span>`);
      if (d && d.spoils > now) buffs.push(`<span class="buff camp won">${icon("swords")} ${tk("rival_" + rv.id)} <small>${fmtTime((d.spoils - now) / 1000)}</small></span>`);
    }
    if (s.camp) {
      const ok = s.camp === campWanted(now);
      buffs.push(`<span class="buff camp ${ok ? "won" : "lost"}">${icon(s.camp)} ${ok ? `${tk("camp_" + s.camp)} +${Math.round(CAMP_BONUS * 100)}%` : t("campMoveShort")}</span>`);
    }
    const buffsHtml = buffs.join("");
    const buffsEl = $("buffs");
    if (buffsEl.dataset.html !== buffsHtml) {
      buffsEl.dataset.html = buffsHtml;
      buffsEl.innerHTML = buffsHtml;
    }

    const se = seasonAt(now);
    const sBox = $("season");
    const sKey = se.season + s.settings.lang;
    if (sBox.dataset.k !== sKey) {
      sBox.dataset.k = sKey;
      sBox.className = se.season;
      sBox.querySelector("img")!.src = iconUrls[se.season];
      sBox.querySelector("b")!.textContent = tk("season_" + se.season);
      sBox.querySelector("small")!.textContent = tk("seasonFx_" + se.season);
    }
    sBox.querySelector(".left")!.textContent = fmtTime(se.left / 1000);

    const order = g.order;
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      if (!row) continue;
      const txt = order && order.route === i ? t("orderBadge", { a: Math.min(order.got, order.need), b: order.need }) : "";
      if ((row.root.dataset.order ?? "") !== txt) {
        if (txt) row.root.dataset.order = txt;
        else delete row.root.dataset.order;
      }
    }

    const ch = currentChapter(s);
    const qb = $("quest");
    if (ch && s.chronicle.accepted) {
      const done = goalDone(s, ch);
      const pct = Math.round((goalValue(s, ch) / ch.goal.n) * 100);
      const html = `${portrait(ch.traveler)}<div class="qtxt"><b>${travelerName(ch.traveler)}</b><small>${done ? t("questReady") : goalText(ch)}</small><div class="qbar"><i style="width:${pct}%"></i></div></div>`;
      if (qb.dataset.html !== html) {
        qb.dataset.html = html;
        qb.innerHTML = html;
      }
      qb.classList.toggle("ready", done);
      qb.classList.remove("hidden");
    } else {
      qb.classList.add("hidden");
    }

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
      const pm = marketMult(i, now);
      const pct = Math.round(pm * 100);
      const ptxt = r.owned > 0 ? `${pm > 1.03 ? "▲" : pm < 0.97 ? "▼" : "•"}${pct}%` : "";
      if (row.price.textContent !== ptxt) {
        row.price.textContent = ptxt;
        row.price.className = "price" + (pm > 1.03 ? " up" : pm < 0.97 ? " down" : "") + (pm >= 2 ? " boom" : "");
      }
      const sh = currentShock(now);
      const canFast = !!sh && sh.kind === "boom" && sh.route === i && !sh.used && r.owned > 0;
      row.fast.style.display = canFast ? "" : "none";
      if (canFast) row.fast.innerHTML = `⚡ ${t("fastShip")}<small>${fmtTime((sh!.until - now) / 1000)}</small>`;
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
  private queue: { text: string; kind: string; ms: number }[] = [];
  private live = 0;
  private recent = new Map<string, number>();

  show(text: string, kind: "info" | "gold" | "good" | "bad" = "info", ms = 2600): void {
    const now = Date.now();
    if ((this.recent.get(text) ?? 0) > now) return;
    if (this.queue.some((q) => q.text === text)) return;
    this.recent.set(text, now + 4000);
    if (this.recent.size > 40) for (const [k, v] of this.recent) if (v < now) this.recent.delete(k);
    if (kind === "info" && this.queue.length >= 2) return;
    this.queue.push({ text, kind, ms: Math.min(ms, 3200) });
    if (this.queue.length > 4) this.queue.splice(Math.max(0, this.queue.findIndex((q) => q.kind === "info")), 1);
    this.pump();
  }

  private pump(): void {
    while (this.live < 2 && this.queue.length > 0) {
      const q = this.queue.shift()!;
      const e = el("div", "toast " + q.kind, q.text);
      this.root.appendChild(e);
      this.live++;
      requestAnimationFrame(() => e.classList.add("in"));
      window.setTimeout(() => {
        e.classList.remove("in");
        window.setTimeout(() => {
          e.remove();
          this.live--;
          this.pump();
        }, 300);
      }, q.ms);
    }
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
