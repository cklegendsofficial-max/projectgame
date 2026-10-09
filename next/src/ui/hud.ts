import { LORD_SERAIS, NEWS_GOLD, type Game, type Quest, type Target } from "../game/game";
import { BUILDINGS, DAY_SEC, NODE_NAME, RES_ICON, RES_KEYS, RES_NAME, UNITS, UNIT_KEYS, armySize, buildCost, buildTime, prodPerMin, unitUnlocked, xpNeed, type Army, type Res, type Unit } from "../game/data";
import { ORDERS, ORDER_KEYS, TACTICS, TACTIC_KEYS, type BattleResult, type Boss, type Order, type Sim, type Tactic } from "../game/battle";
import { BattleField } from "./battleField";
import { SpiritView, type Realm } from "./spirit";
import { openDestan } from "./destan";
import { GOODS, GOOD_KEYS, PLUS_CHANCE, SKILL_INFO, SKILL_KEYS, SLOTS, SLOT_NAME, STAT_INFO, STAT_KEYS, canPlus, itemStats, kindName, plusCost, skillLv, skillNext, type Item, type Slot } from "../game/rpg";
import { ARMOR_NAME, CLASSES, SKILL_MAX, WEAPON_NAME, skillPow, skillRank, type ClassId } from "../game/classes";
import { CAPITAL, SAVE_SLOTS, curSlot, exportSave, kurganBoss, slotInfo } from "../game/state";
import { applyUi, haptic, saveSettings, settings, toggleFullscreen } from "../settings";
import { ACHIEVEMENTS } from "../game/achievements";
import { BRANCHES, BRANCH_KEYS, ROW_NEED, TALENTS, branchSpent } from "../game/talents";
import { CONSUMABLES, CONS_BY_ID, CRAFT_SLOTS, REFINES, gearCost, type Cost, type Mat } from "../game/crafting";
import { SIDE_TEXT, type SideQuest } from "../game/sidequests";
import { CITY_NAME } from "../game/data";
import { COMPANIONS, COMP_BY_ID, COMP_MAX, ERLIK, FORT_GUARD, GATE_GUARD, KARA_HAN, ENDINGS, KOK_BORU, PEAK_GUARD, endingOf, type CompId } from "../game/story";
import { LEGACY_PERKS, legacy } from "../game/legacy";
import { HERD_BUY, HERD_GOLD, HERD_MAX, MOVE_FOOD, OTAG_GOLD, OTAG_WOOD, REST_FOOD, ZONE_DESC, ZONE_NAME, bestZone, zoneOf } from "../game/otag";
import { VET_LV_MAX, VET_MAX, VET_RANKS, vetBonus, vetTitle } from "../game/vets";
import { PERSONAS, PERSONA_KEYS } from "../game/director";
import { kidAge } from "../game/dynasty";
import { BOYS } from "../game/korkut";
import { Archery, type ArchMode } from "./archery";
import { Wrestle } from "./wrestle";
import { KokBoru } from "./kokboru";
import { Gamepad, type PadButton } from "./gamepad";
import { CODEX, CODEX_CATS, codexText, codexTitle, type CodexCat } from "../game/codex";
import { KUT_TIERS, kutArmy, kutTier, kutVote } from "../game/kut";
import { SING_GOLD, TAMGA_COLORS, TAMGA_DEFAULT, TAMGA_MARKS, TAMGA_SHAPES, singRenown, tamgaSvg, type Tamga } from "../game/ozan";
import { CITIES, H, NAV, NH, NW, W } from "../world/gen";
import { assetUrl } from "../render/worldView";
import { audio } from "../audio";
import { canNarrate, hush, narrate, speaking } from "../narrator";
import { LANGS, lang, t, t as tr, type Lang } from "../i18n";
import { cloudPush, cloudReady, onDeck, steam } from "../platform";
import { WEEK_TIERS, weekEnd, weekNeed, weekReward, weekTheme } from "../game/weekly";
import { loadedMods, modBridge, removeMod, storeMod, storedMods, toggleMod } from "../mods";
import { ROUTE as MONGOL_ROUTE } from "../game/mongol";
import { KIP_FOOD, KIP_GIFT, KIP_GIFT_REP, KIP_HIRE_GAP, KIP_HIRE_N, KIP_MIN_LV, KIP_STEPS, STONES, kipBoss, kipFortArmy, kipHireCost } from "../game/kipchak";

const MOD_LABEL: Record<string, string> = { atk: "saldırı", army: "ordu gücü", heal: "iyileşme", xp: "tecrübe", trade: "ticaret", speed: "hız", sight: "görüş" };
const SCORE_LABEL: Record<string, string> = {
  profit: "kâr (altın)", contracts: "emanet", rescued: "kurtarılan kervan", wins: "zafer", camps: "kamp", slain: "can düşmanı", kurgans: "Kurgan Taşı",
  floors: "derinlik katı", crafted: "eşya", trains: "talim", sides: "şehir görevi", conquests: "fetih", beyq: "bey isteği", voyages: "Hazar seferi",
};
import { SUREK_FOOD } from "../game/games";
import { GIFT_GOLD, PEACE_GOLD, SPY_MAX, SPY_OPS, TRADE_GOLD, spyCost } from "../game/spy";
import { MYCV_COST, MYCV_GUARD, MYCV_GUARD_MAX, MYCV_UPGRADE } from "../game/mycaravan";
import type { Good } from "../game/rpg";
import { BALBAL_GOLD, BALBAL_MAX, BALBAL_STONE, FOE_KIND, balbalBonus, yugCost } from "../game/yug";
import { SIEGE_ACTS, SIEGE_MAX_DAY, parleyChance, siegeGar } from "../game/siege";
import { ORIGINS, ORIGIN_BY_ID, type Origin, type OriginId } from "../game/origins";
import { BOND_LIKES, BOND_LIKES_EN, BOND_QUEST, COMP_QUESTS, SWORN_MULT, bondTier } from "../game/bonds";
import { SETS, SET_FORGE, SET_KEYS, SET_SLOTS, UNIQUES, modsText, type SetId } from "../game/legend";
import { FACTIONS, FACTION_KEYS, HOSTILE, REP_RANKS, RANK_PERKS, factionOf } from "../game/factions";
import { BRO_MODS, NEM_TRAITS, nemName } from "../game/nemesis";
import { BIRDS, birdSight, birdXpNeed } from "../game/falcon";
import { BREEDS, BREED_GOLD, BREED_TIME } from "../game/horse";
import { TITLE_CATS, titleKey, titleOf } from "../game/titles";
import { DAILY_POOL } from "../game/daily";
import { REQ_INFO, RIVAL_TRAITS, STATUS_NAME } from "../game/rivals";
import { DECREES } from "../game/kurultay";
import { ESCORT_GOLD, SHIP_CAP, SHIP_GOLD, SHIP_MAX, portOf, routesFrom } from "../game/hazar";
import { DEEP_PERKS, TOMBS, tombOf } from "../game/deep";
import { CITY_BLDS, CITY_BLD_KEYS, ENGINE_GOLD as ENGINE_GOLD_UI, FEAST_GOLD as FEAST_GOLD_UI, GOVERNORS, GOV_GOLD, TAX as TAX_UI, cityBldCost } from "../game/conquest";

const WEAPON_ICON: Record<string, string> = { kilic: "it_sword_", balta: "it_axe_", hancer: "it_dagger_", ok: "it_bow_", asa: "it_staff_" };

const ic = (k: string, cls = "ic") => `<img class="${cls}" src="${assetUrl(k)}" alt="">`;
const CAP_I = CITIES.findIndex((c) => c.id === "samarkand");
const RIVAL_CSS: Record<string, string> = { peace: "#e8d39a", ally: "#6fe07a", war: "#ff4a3a", vassal: "#ffc94a", dead: "#888" };

function fmt(n: number): string {
  n = Math.floor(n);
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "") + "M";
  if (n >= 1e4) return (n / 1e3).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

function dur(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s < 60) return `${s}sn`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}dk ${s % 60}sn`;
  return `${Math.floor(m / 60)}sa ${m % 60}dk`;
}

function costHtml(c: Partial<Res>, g: Game): string {
  return RES_KEYS.filter((k) => (c[k] ?? 0) > 0)
    .map((k) => `<span class="cost ${g.s.res[k] < (c[k] ?? 0) ? "no" : ""}">${ic(RES_ICON[k])}${fmt(c[k] ?? 0)}</span>`)
    .join("");
}

function armyHtml(a: Army, cls = ""): string {
  return `<div class="army ${cls}">${UNIT_KEYS.map((u) => `<span class="u">${ic(UNITS[u].icon)}<b>${a[u]}</b></span>`).join("")}</div>`;
}

function bar(v: number, max: number, cls = "", label = ""): string {
  return `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, (v / Math.max(1, max)) * 100))}%"></i><span>${label || `${Math.floor(v)}/${Math.floor(max)}`}</span></div>`;
}

export class Hud {
  private root = document.getElementById("hud")!;
  private top!: HTMLElement;
  private questEl!: HTMLElement;
  private sagaEl!: HTMLElement;
  private taskEl!: HTMLElement;
  private mogEl!: HTMLElement;
  private actEl!: HTMLElement;
  private panel!: HTMLElement;
  private toasts!: HTMLElement;
  private mini!: HTMLCanvasElement;
  private birdBtn!: HTMLButtonElement;
  private miniBase!: HTMLCanvasElement;
  private acts = new Map<string, () => void>();
  private actN = 0;
  private panelHtml = "";
  private htmlCache = new WeakMap<Element, string>();
  private fogRev = -1;
  private fogC?: HTMLCanvasElement;
  private place: Target | { kind: "hero" } | null = null;
  private tab = "";
  private liveT = 0;
  private miniT = 0;
  private panelT = 0;
  private holding = false;
  private sel: Army = { spear: 0, archer: 0, horse: 0 };
  battleOpen = false;
  private storyOpen = false;
  private sagaOpen = false;
  private craftTier = 1;
  private forgePick: SetId = "gokkurt";
  private allSongs = false;

  private sideEl!: HTMLElement;

  private topSide(): SideQuest | null {
    const q = this.g.s.sideQ;
    return q.find((x) => this.g.sideReady(x)) ?? q[0] ?? null;
  }

  private sideRow(q: SideQuest, right: string): string {
    const g = this.g;
    const p = Math.max(0, Math.min(q.need, g.sideProg(q)));
    const ready = p >= q.need;
    const back = ready ? `<small class="cheap">Tamamlandı — ${CITY_NAME[g.sideTurnIn(q)]} şehrine dön</small>` : q.need > 1 ? `<small>İlerleme ${p}/${q.need}</small>` : "";
    return `<div class="grow sq">${ic(SIDE_TEXT[q.kind].icon, "gimg")}<div class="bi2"><b>${q.title}</b><small class="dim">${q.giver}</small><small>${q.text}</small>${back}<small>${ic("coins")}${q.gold} · ${ic("scroll")}${q.xp} TP · ${ic("crown")}${q.renown}${q.item ? ` · ${ic("chest")}eşya` : ""}</small></div>${right}</div>`;
  }

  private boardHtml(city: string, near: boolean): string {
    const g = this.g;
    const s = g.s;
    if (!s.free) return "";
    const mine = s.sideQ.filter((q) => q.city === city || g.sideTurnIn(q) === city);
    const why = g.sideReason(city);
    return (
      `<h3>${ic("quest")} Şehir görevleri <em>${s.sideQ.length}/3</em></h3>` +
      mine.map((q) => this.sideRow(q, `<button class="btn sm" data-a="${this.act(() => g.dropSide(q.id))}">Bırak</button>`)).join("") +
      (g.sideBoard(city).map((q) => this.sideRow(q, `<button class="btn sm ${why || !near ? "off" : ""}" data-a="${this.act(() => g.takeSide(city, q.id))}">Al</button>`)).join("") || `<p class="dim">Bugünlük iş kalmadı. Yarın yeni ilanlar asılır.</p>`)
    );
  }

  private matsHtml(c: Cost): string {
    return (Object.entries(c) as [Mat, number][])
      .map(([m, v]) => {
        const icon = m === "gold" ? "coins" : m === "ruh" || m === "parsomen" ? m : GOODS[m].icon;
        const have = this.g.matHave(m);
        return `<span class="mat ${have < v ? "lack" : ""}">${ic(icon)}${m === "gold" ? v : `${have}/${v}`}</span>`;
      })
      .join(" ");
  }

  constructor(private g: Game) {
    this.root.innerHTML = `
      <div class="top"></div>
      <div class="track"><div class="quest"></div><div class="quest saga hidden"></div><div class="quest task hidden"></div><div class="quest sq hidden"></div><div class="quest mog hidden"></div></div>
      <div class="toasts"></div>
      <div class="actbar hidden"></div>
      <div class="bottom">
        <button data-b="capital"><img class="bi" src="${assetUrl("cities/samarkand")}" alt=""><span>${t("Semerkant")}</span></button>
        <button data-b="hero"><img class="bi round" src="${assetUrl("heroes/slave")}" alt=""><span>${t("Kahraman")}</span></button>
        <button data-b="find">${ic("tug", "bi")}<span>${t("Birliğim")}</span></button>
        <button data-b="snd" class="snd ${audio.muted ? "off" : ""}"><b class="bi">♪</b><span>${t("Ses")}</span></button>
      </div>
      <canvas class="mini" width="220" height="128"></canvas>
      <button class="birdbtn hidden"><img alt=""><span></span></button>
      <div class="panel hidden"></div>`;
    this.top = this.root.querySelector(".top")!;
    this.top.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("[data-spd]")) this.cycleSpeed();
    });
    this.questEl = this.root.querySelector(".quest")!;
    this.sagaEl = this.root.querySelector(".saga")!;
    this.taskEl = this.root.querySelector(".task")!;
    this.sideEl = this.root.querySelector(".quest.sq")!;
    this.mogEl = this.root.querySelector(".quest.mog")!;
    this.mogEl.addEventListener("click", () => {
      const m = g.s.mongol;
      if (m?.stage === 2) g.mongolMenu();
    });
    this.sideEl.addEventListener("click", () => {
      const q = this.topSide();
      const p = q && g.sideGoto(q);
      if (p) g.cam.flyTo(p.x, p.y, Math.max(g.cam.zoom, 0.65));
    });
    this.taskEl.addEventListener("click", () => {
      const r = g.s.raid;
      const c = g.s.contract;
      const to = c?.to ?? g.s.fleet.voyage?.to;
      const p = r ? g.s.villages[r.v] : to ? CITIES.find((x) => x.id === to) : null;
      if (p) g.cam.flyTo(p.x, p.y, Math.max(g.cam.zoom, 0.65));
    });
    this.sagaEl.addEventListener("click", () => {
      const p = g.chapter()?.goto(g);
      if (p) g.cam.flyTo(p.x, p.y, Math.max(g.cam.zoom, 0.65));
    });
    this.actEl = this.root.querySelector(".actbar")!;
    this.panel = this.root.querySelector(".panel")!;
    this.toasts = this.root.querySelector(".toasts")!;
    this.mini = this.root.querySelector(".mini")!;
    this.root.querySelector(".bottom")!.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("button")?.dataset.b;
      if (b === "capital") this.openPlace({ kind: "capital" });
      if (b === "hero") this.openHero();
      if (b === "find") {
        this.close();
        g.cam.flyTo(g.s.hero.x, g.s.hero.y, Math.max(g.cam.zoom, 0.7));
      }
      if (b === "snd") this.root.querySelector(".snd")!.classList.toggle("off", audio.toggle());
    });
    window.addEventListener("pointerdown", () => audio.unlock());
    this.root.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("button")) audio.play("click");
      const el = (e.target as HTMLElement).closest("[data-a]") as HTMLElement | null;
      if (!el || el.classList.contains("off")) return;
      this.acts.get(el.dataset.a!)?.();
    });
    this.panel.addEventListener("pointerdown", () => (this.holding = true));
    window.addEventListener("pointerup", () => (this.holding = false));
    this.panel.addEventListener("change", (e) => {
      const el = e.target as HTMLSelectElement;
      const cv = el.dataset.cv;
      if (!cv) return;
      const [id, f] = cv.split(":");
      const v = el.value || null;
      g.setMyCv(Number(id), f === "to" ? { to: v! } : { [f]: v } as { go?: Good | null; back?: Good | null });
      this.render();
    });
    this.panel.addEventListener("input", (e) => {
      const el = e.target as HTMLInputElement;
      const k = el.dataset.set as "music" | "fx" | undefined;
      if (k) {
        settings[k] = Number(el.value) / 100;
        saveSettings();
        audio.volumes();
        const out = this.panel.querySelector(`[data-so="${k}"]`);
        if (out) out.textContent = el.value;
      }
      if (el.dataset.u) {
        this.sel[el.dataset.u as Unit] = Number(el.value);
        const out = this.panel.querySelector(`[data-o="${el.dataset.u}"]`);
        if (out) out.textContent = el.value;
        const ld = this.panel.querySelector("[data-load]");
        if (ld) ld.textContent = fmt(g.marchLoad(this.sel));
      }
    });
    this.questEl.addEventListener("click", () => {
      const q = g.quest();
      const p = q?.goto?.(g);
      if (p) g.cam.flyTo(p.x, p.y, Math.max(g.cam.zoom, 0.65));
    });
    this.miniBase = document.createElement("canvas");
    this.miniBase.width = 220;
    this.miniBase.height = 128;
    this.miniBase.getContext("2d")!.drawImage(g.world.canvas, 0, 0, 220, 128);
    this.mini.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      const r = this.mini.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const y = ((e.clientY - r.top) / r.height) * H;
      if (g.birdAim) g.sendBird(x, y);
      else g.cam.flyTo(x, y);
    });
    this.birdBtn = this.root.querySelector(".birdbtn")!;
    this.birdBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    this.birdBtn.addEventListener("click", () => g.aimBird());
    const PAN = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    window.addEventListener("keydown", (e) => {
      if ((e.target as HTMLElement).closest?.("input, textarea")) return;
      const k = e.key.toLowerCase();
      if (k === "escape") {
        if (this.menuOpen) return this.closeMenu();
        if (!this.panel.classList.contains("hidden")) return this.close();
        if (!this.archery && !this.minigame && !this.modal() && !g.battleLock) this.openMenu();
        return;
      }
      if (this.menuOpen) return;
      if (PAN.includes(k)) {
        g.cam.keys.add(k);
        e.preventDefault();
        return;
      }
      if (e.repeat || this.battleOpen || this.storyOpen) return;
      if (k === "h") this.place?.kind === "hero" ? this.close() : this.openHero();
      else if (k === "c") this.openPlace({ kind: "capital" });
      else if (k === " ") {
        e.preventDefault();
        g.cam.flyTo(g.s.hero.x, g.s.hero.y, Math.max(g.cam.zoom, 0.7));
      } else if (k === "b" && g.s.bird && g.s.free) g.aimBird();
      else if (k === "m") this.root.querySelector(".snd")!.classList.toggle("off", audio.toggle());
      else if (k === "t") this.cycleSpeed();
      else if (k === "p" && !this.archery && !this.minigame && !this.modal() && !g.battleLock) this.openPhoto();
      else if (k === "f" || k === "f11") {
        e.preventDefault();
        toggleFullscreen();
      } else if (k === "+" || k === "=") g.cam.zoomBy(1.2);
      else if (k === "-") g.cam.zoomBy(1 / 1.2);
    });
    window.addEventListener("keyup", (e) => g.cam.keys.delete(e.key.toLowerCase()));
    window.addEventListener("blur", () => g.cam.keys.clear());
    this.gamepad = new Gamepad(this.root, {
      scope: () => {
        const ar = this.root.querySelector<HTMLElement>(".archery");
        if (ar) return ar.querySelector<HTMLElement>(".aresult.on");
        const ov = this.root.querySelectorAll<HTMLElement>(".battle");
        if (ov.length) return ov[ov.length - 1];
        return this.panel.classList.contains("hidden") ? null : this.panel;
      },
      shooting: () => (!!this.archery || !!this.minigame) && !this.root.querySelector(".archery .aresult.on"),
      shoot: () => (this.archery ? this.archery.shootAuto() : this.minigame?.press()),
      press: (b, ui) => this.padPress(b, ui),
      pan: (x, y) => {
        g.cam.pad.x = x;
        g.cam.pad.y = y;
      },
      zoom: (f) => g.cam.zoomBy(f),
    });
    const begin = (): void => {
      if (g.s.cls === null) setTimeout(() => this.classSelect(), 300);
      else if (!g.s.free && g.s.c.shifts === 0 && g.s.quest === 0) setTimeout(() => this.intro(), 400);
    };
    if (!navigator.webdriver || location.search.includes("title")) this.openMenu(true, begin);
    else begin();
  }

  private originIntro(): string {
    const o = this.g.s.origin ? ORIGIN_BY_ID[this.g.s.origin] : null;
    return o ? `<i>${lang() === "en" ? o.introEn : o.intro}</i><br><br>` : "";
  }

  private intro(): void {
    this.story(
      "Kervan Krallık",
      "heroes/slave",
      `${this.originIntro()}Adın ${this.g.s.hero.name}, yolun ${this.g.cls().name} yolu. Ama önce: bir baskında ailenden koparıldın ve Semerkant'ta bir tüccara köle olarak satıldın.<br><br>Efendin sana bir söz verdi: <b>80 akçe</b> biriktirirsen hürriyetini geri alabilirsin. Şehrin yakınındaki ormanda, taş ocağında ve tarlalarda çalış, her vardiyada birkaç akçe kazan.<br><br>Özgürlüğünü kazandıktan sonra İpek Yolu seni bekliyor: ${this.g.cls().name} silahlarını al, talim yap, ticaret yap, haramileri yen ve bir gün kendi beyliğini kur.`,
      "Çalışmaya başla",
    );
  }

  private classSelect(): void {
    const g = this.g;
    this.storyOpen = true;
    let pick: ClassId = "alp";
    let opick: OriginId = "oba";
    const en = lang() === "en";
    const oName = (o: Origin) => (en ? o.en[0] : o.name);
    const odetail = () => {
      const o = ORIGIN_BY_ID[opick];
      return `<p>${en ? o.en[1] : o.desc}</p><small class="cheap">${en ? o.en[2] : o.perk}</small>`;
    };
    const el = document.createElement("div");
    el.className = "battle csel";
    const pips = (v: number) => "●".repeat(v) + `<i>${"●".repeat(Math.max(0, 4 - v))}</i>`;
    const detail = () => {
      const c = CLASSES.find((x) => x.id === pick)!;
      return `<img class="cbig" src="${assetUrl(c.portrait)}" alt=""><div class="cinfo">
        <h2 style="color:${c.color}">${c.name}</h2><em>${t(c.role)}</em><p>${t(c.desc)}</p>
        <div class="cstats">${STAT_KEYS.map((k) => `<div class="${c.primary.includes(k) ? "prim" : ""}"><span>${c.primary.includes(k) ? "★ " : ""}${t(STAT_INFO[k].name)}</span><b>${pips(c.start[k])}</b></div>`).join("")}</div>
        <div class="cgear">${ic("swords")} ${c.weapons.map((w) => WEAPON_NAME[w]).join(", ")} · ${ARMOR_NAME[c.armor]}${c.shield ? ` · ${t("Kalkan")}` : ""}</div>
        <div class="cpass">${t(c.passive)}</div></div>`;
    };
    el.innerHTML = `<div class="bbox cbox"><h2>${t("Yolunu seç")}</h2><p class="dim">${t("Seçtiğin yol hangi silahları ve zırhları kullanabileceğini, hangi özelliklerin seni güçlendireceğini belirler. Daha sonra değiştirilemez.")}</p>
      <div class="ccards">${CLASSES.map((c) => `<button class="ccard ${c.id === pick ? "on" : ""}" data-c="${c.id}" style="--cc:${c.color}"><img src="${assetUrl(c.portrait)}" alt=""><b>${c.name}</b><small>${t(c.role).split(" · ")[0]}</small></button>`).join("")}</div>
      <div class="cdet">${detail()}</div>
      <h3 class="otitle">${t("Kökenin")}</h3>
      <div class="origins">${ORIGINS.map((o) => `<button class="ocard ${o.id === opick ? "on" : ""}" data-o="${o.id}"><img src="${assetUrl(o.icon)}" alt=""><b>${oName(o)}</b></button>`).join("")}</div>
      <div class="odet">${odetail()}</div>
      <div class="cname"><label>${t("Adın")}</label><input maxlength="14" value="${g.s.hero.name}"><button class="btn go big">${t("Bu yolu seç")}</button></div></div>`;
    this.root.appendChild(el);
    el.querySelector(".ccards")!.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("[data-c]") as HTMLElement | null;
      if (!b) return;
      pick = b.dataset.c as ClassId;
      el.querySelectorAll(".ccard").forEach((x) => x.classList.toggle("on", x === b));
      el.querySelector(".cdet")!.innerHTML = detail();
    });
    el.querySelector(".origins")!.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("[data-o]") as HTMLElement | null;
      if (!b) return;
      opick = b.dataset.o as OriginId;
      el.querySelectorAll(".ocard").forEach((x) => x.classList.toggle("on", x === b));
      el.querySelector(".odet")!.innerHTML = odetail();
    });
    el.querySelector(".cname .btn")!.addEventListener("click", () => {
      const name = (el.querySelector(".cname input") as HTMLInputElement).value.trim().slice(0, 14) || "Toygar";
      g.chooseClass(pick, name, opick);
      el.remove();
      this.storyOpen = false;
      if (!g.s.free) this.intro();
    });
  }

  private itemRow(it: Item, right: string): string {
    const why = this.g.canUse(it);
    const req = `Sv ${it.lvReq}${it.req ? ` · ${STAT_INFO[it.req.stat].short} ${it.req.v}` : ""}`;
    return `<div class="grow ${it.set || it.uq ? "leg" : ""}">${ic(it.icon, "gimg")}<div class="bi2"><b class="r${it.rar}">${it.name}</b>${this.legendTag(it)}<small>${kindName(it)} · ${itemStats(it)}</small><small class="${why ? "why" : "dim"}">${why ?? "Gerekli: " + req}</small></div>${right}</div>`;
  }

  private legendTag(it: Item): string {
    if (it.uq) return `<small class="ltag">Destan eşyası</small>`;
    if (!it.set) return "";
    const st = SETS[it.set];
    return `<small class="ltag" style="color:${st.color}">${st.name} (${this.g.setCount(it.set)}/4)</small>`;
  }

  private forgeHtml(): string {
    const g = this.g;
    const st = SETS[this.forgePick];
    const why = g.forgeReason();
    const cl = g.cls();
    return (
      `<h3>${ic("trophy")} Efsane Ocağı</h3><p class="dim">Seviye ${SET_FORGE.lv}'ten itibaren efsanevi set parçası dövebilirsin. Aynı setten 2 ve 4 parça giyince gizli güçler uyanır.</p>` +
      `<div class="row tiers">${SET_KEYS.map((k) => `<button class="btn sm ${k === this.forgePick ? "go" : ""}" style="--sc:${SETS[k].color}" data-a="${this.act(() => (this.forgePick = k))}">${SETS[k].name.replace(" Takımı", "")}</button>`).join("")}</div>` +
      `<div class="setb" style="--sc:${st.color}"><b>${st.name}</b><small class="dim"><i>${st.lore}</i></small><small class="on">(2) ${modsText(st.b2)}</small><small class="on">(4) ${modsText(st.b4)}</small><small>${this.matsHtml(g.forgeCost())}</small>${why && why !== "Malzeme eksik" ? `<small class="why">${why}</small>` : ""}</div>` +
      SET_SLOTS.map((sl) => {
        const icon = sl === "silah" ? (WEAPON_ICON[cl.weapons[0]] ?? "it_sword_") + "5" : sl === "zirh" ? (cl.armor === "agir" ? "it_armor_5" : "it_light_5") : sl === "at" ? "mount_3" : "tr_star";
        const got = g.s.codex.includes(`set:${this.forgePick}:${sl}`);
        return `<div class="grow leg">${ic(icon, "gimg")}<div class="bi2"><b class="r4">${st.pieces[sl]}</b><small>${SLOT_NAME[sl]}${got ? " · koleksiyonda" : ""}</small></div><button class="btn sm ${why ? "off" : ""}" data-a="${this.act(() => g.forgeSet(this.forgePick, sl))}">Döv</button></div>`;
      }).join("")
    );
  }

  private deepHtml(i: number, near: boolean): string {
    const g = this.g;
    const s = g.s;
    const k = s.kurgans[i];
    const why = g.deepReason(i);
    const t: Target = { kind: "kurgan", i };
    return `<p>Taş paramparça. Kara büyü ${dur(k.respawnAt - g.now)} sonra yeniden toplanacak.</p>
      <h3>${ic("map/kurgan")} Kurgan Derinlikleri</h3>
      <p>Kırık taşın altında mezara inen bir merdiven açıldı. Kat kat aşağı in: her katta üç kapıdan birini seç. Savaş, hazine, şifa pınarı, Taş Ozan'ın bilmeceleri, Erlik'in teklifleri… Her 5 katta bir bekçi. Ne kadar derine inersen ganimet o kadar büyür.</p>
      ${this.tombHtml(i)}
      <div class="odds mid">Meşale: <b>${g.deepTorches()}</b> · En derin inişin: <b>${s.deepBest ? `${s.deepBest}. kat` : "—"}</b> · Toplam kat: <b>${s.c.floors}</b></div>
      ${why ? `<p class="dim">${why}</p>` : near ? `<div class="col">${g.deepStarts().map((f) => `<button class="btn red big" data-a="${this.act(() => { this.close(); g.enterDeep(i, f); })}">${ic("map/kurgan")} ${f === 1 ? "Derinliklere in" : `Kestirmeden ${f}. kata in`}</button>`).join("")}</div>` : this.walkBtn(t, "Mezara yürü")}
      ${this.perksHtml()}`;
  }

  private tombHtml(i: number): string {
    const tb = TOMBS[tombOf(i)];
    return `<div class="brow"><img class="bimg" src="${assetUrl(tb.boss.icon)}" alt=""><div class="bi2"><b>${tb.name}</b><small>${tb.desc}</small><small class="dim">Bekçisi: ${tb.boss.name}</small></div></div>`;
  }

  private perksHtml(): string {
    const g = this.g;
    const s = g.s;
    return `<h3>${ic("ruh")} Derinlik Sırları <em>${s.seals} Kemik Mühür</em></h3><p class="dim">Her inilen kat 1, her bekçi 3 Kemik Mühür kazandırır. Mühürlerle kalıcı zindan yetenekleri açılır.</p>` +
      DEEP_PERKS.map((p) => {
        const lv = g.dperk(p.id);
        const max = lv >= p.max;
        const cost = p.cost(lv);
        return `<div class="grow">${ic(p.icon, "gimg")}<div class="bi2"><b>${p.name} <em>${lv}/${p.max}</em></b><small>${p.desc(Math.max(1, max ? lv : lv + 1))}</small></div>${max ? `<em class="cheap">✓</em>` : `<button class="btn sm ${s.seals < cost ? "off" : ""}" data-a="${this.act(() => g.buyDeepPerk(p.id))}">Aç<br>${cost} mühür</button>`}</div>`;
      }).join("");
  }

  private dailyHtml(): string {
    const g = this.g;
    const d = g.daily();
    if (!d) return "";
    return (
      `<h3>${ic("seal")} ${tr("Günlük Fermanlar")} <em class="dim">· ${tr("seri {n} gün", { n: d.streak })}</em></h3><p class="dim">${tr("Her gün yeni üç ferman. Hepsini bitirip sandığı aç; üst üste gelirsen sandık daha cömert olur.")}</p>` +
      d.tasks
        .map((t, i) => {
          const p = DAILY_POOL.find((x) => x.key === t.key)!;
          const v = g.dailyProg(t);
          const ok = v >= t.need;
          return `<div class="grow ${t.done ? "dim" : ""}">${ic(p.icon, "gimg")}<div class="bi2"><b>${t.need} ${p.what}</b><div class="fbar" style="--fc:${ok ? "#7fd36a" : "#e0b04a"}"><i style="width:${(v / t.need) * 100}%"></i></div><small>${v}/${t.need} · ${ic("coins")}${g.dailyGold()}</small></div>${t.done ? `<em class="cheap">✓</em>` : `<button class="btn sm ${ok ? "go" : "off"}" data-a="${this.act(() => g.claimDaily(i))}">${tr("Al")}</button>`}</div>`;
        })
        .join("") +
      (d.chest ? `<div class="odds good">${tr("Bugünün sandığı açıldı. Yarın yeni fermanlar gelecek.")}</div>` : `<button class="btn big ${g.chestReady() ? "go" : "off"}" style="width:100%" data-a="${this.act(() => g.openChest())}"> ${ic("chest")} ${tr("Ferman sandığını aç")}</button>`)
    );
  }

  private kipHtml(i: number): string {
    const g = this.g;
    const s = g.s;
    const p = g.kipPois()[i];
    if (!p) return "";
    const k = g.kip();
    const en = lang() === "en";
    const near = g.kipNear(i);
    const walk = this.walkBtn({ kind: "kip", i }, tr("Oraya yürü"));
    const btn = (label: string, why: string, fn: () => void, cls = "") => `<button class="btn ${cls} ${why ? "off" : ""}" data-a="${this.act(fn)}">${label}${why ? ` <small>· ${why}</small>` : ""}</button>`;
    if (p.kind === "stone") {
      const read = k.stones.includes(p.n);
      return this.frame(tr("Taş Baba"), `${tr("Deşt-i Kıpçak")} · ${k.stones.length}/${STONES.length}`, assetUrl("map/kurgan"),
        read ? `<p><i>"${en ? STONES[p.n].en : STONES[p.n].tr}"</i></p><p class="dim">${tr("Bu taşın sözünü okudun.")}</p>`
          : `<p class="dim">${tr("Bozkırın ortasında, yüzü doğuya dönük, elinde kâse tutan bir taş heykel. Kaidesinde silik Göktürk harfleri var.")}</p>${near ? "" : walk}`);
    }
    if (p.kind === "fort") {
      if (k.fort) return this.frame(tr("Kara Kıpçak Ordugâhı"), tr("Dağıtıldı"), assetUrl("map/castle"), `<p class="dim">${tr("Yanık çadırlar ve devrilmiş bir sancak. Kara Kıpçaklar dağıldı.")}</p>`);
      const lv = s.hero.lv;
      const b = kipBoss(lv);
      const odds = Math.round(g.kipFortOdds() * 100);
      return this.frame(tr("Kara Kıpçak Ordugâhı"), `${tr("Deşt-i Kıpçak")} · ${tr("önerilen seviye")} ${KIP_MIN_LV}+`, assetUrl("map/castle"), `
        <p>${en ? KIP_STEPS[1].textEn : KIP_STEPS[1].text}</p>
        <div class="brow">${ic(b.icon, "bimg round")}<div class="bi2"><b>${tr(b.name)}</b><small>${tr("Can")} ${b.hp} · ${tr("Saldırı")} ${b.atk} · ${tr("Savunma")} ${b.def}</small></div></div>
        <h3>${tr("Düşman")}</h3>${armyHtml(kipFortArmy(lv), "enemy")}<h3>${tr("Sen ve birliğin")}</h3>${armyHtml(s.hero.army)}
        <div class="odds ${odds >= 65 ? "good" : odds >= 35 ? "mid" : "bad"}">${tr("Zafer şansı")}: <b>%${odds}</b></div>
        ${near ? btn(`${ic("swords")} ${tr("Ordugâha saldır")}`, "", () => {
          this.close();
          g.kipFortAttack();
        }, "red big") : walk}`);
    }
    const st = KIP_STEPS[k.step];
    const quest = st
      ? `<h3>${ic("quest")} ${en ? st.en : st.title} <em class="dim">${k.step + 1}/${KIP_STEPS.length}</em></h3><p>${en ? st.textEn : st.text}</p>
        ${k.step === 2 ? `<p class="dim">${tr("Taş Baba")}: ${k.stones.length}/${STONES.length}</p>` : ""}
        ${near ? btn(`${ic("seal")} ${k.step === 0 ? tr("{n} yiyecek ver", { n: KIP_FOOD }) : tr("Hana haber ver")}`, g.kipStepReady() ? "" : tr("henüz değil"), () => g.kipStep(), "go") : ""}`
      : `<div class="odds good">${tr("Kıpçak kardeşliği: ordu gücü +%3, hız +%3")}</div>`;
    return this.frame(tr("Kıpçak Ordası"), `${tr("Köten Han")} · ${tr("itibar")} ${k.rep}/100${k.ally ? ` · ${tr("Kardeş")}` : ""}`, assetUrl("map/yurts"), `
      <p class="dim">${tr("Yüzlerce keçe çadır, at sürüleri ve kımız kokusu. Kıpçaklar dışarıdan gelene temkinli ama cömerttir.")}</p>
      ${bar(k.rep, 100, "", `${tr("itibar")} ${k.rep}/100`)}
      ${quest}
      <h3>${ic("lord_bey")} ${tr("Orda pazarı")}</h3>
      ${near ? `<div class="col2">
        ${btn(`${ic("coins")} ${tr("Armağan sun")} (${KIP_GIFT}) · +${KIP_GIFT_REP}`, g.kipGiftReason(), () => g.kipGift())}
        ${btn(`${ic("u_cavalry")} ${tr("{n} Kıpçak atlısı kirala", { n: KIP_HIRE_N })} (${kipHireCost(s.hero.lv)})`, g.kipHireReason(), () => g.kipHire())}
        ${btn(`${ic("j_caravan")} ${tr("Bütün yükü sat")} (+${g.kipSellValue()})`, g.kipSellReason(), () => g.kipSell())}
      </div><p class="dim">${tr("Orda malı bozkır fiyatının %25 üstünden alır, ama günde bir kez. Atlılar {d} günde bir kiralanabilir.", { d: KIP_HIRE_GAP })}</p>` : walk}`);
  }

  private weeklyHtml(): string {
    const g = this.g;
    const w = g.weekly();
    const th = weekTheme(w.id);
    const en = lang() === "en";
    const score = g.weekScoreNow();
    const left = Math.max(0, weekEnd(w.id) - Date.now());
    const d = Math.floor(left / 864e5), h = Math.floor((left % 864e5) / 36e5);
    const mods = Object.entries(th.mods).map(([k, v]) => (k === "carry" ? `+${v} ${tr("yük")}` : `+${Math.round((v ?? 0) * 100)}% ${tr(MOD_LABEL[k] ?? k)}`)).join(" · ");
    const tiers = Array.from({ length: WEEK_TIERS }, (_, i) => {
      const need = weekNeed(i, w.lv);
      const r = weekReward(i, w.lv);
      const st = i < w.claimed ? "done" : i === w.claimed && score >= need ? "ready" : "";
      return `<div class="wtier ${st}"><b>${["I", "II", "III"][i]}</b><small>${need} ${tr("puan")}</small><small class="cheap">${ic("coins")}${r.gold} · ${ic("crown")}${r.renown}${r.parsomen ? ` · ${ic("parsomen")}${r.parsomen}` : ""}</small>${st === "ready" ? `<button class="btn sm go" data-a="${this.act(() => g.weekClaim(i))}">${tr("Al")}</button>` : st === "done" ? `<em class="good">✓</em>` : ""}</div>`;
    }).join("");
    const next = w.claimed < WEEK_TIERS ? weekNeed(w.claimed, w.lv) : weekNeed(WEEK_TIERS - 1, w.lv);
    const board = g.weekBoardNow();
    const rows = board.map((r, i) => `<div class="wrow ${r.me ? "me" : ""}"><i>${i + 1}</i><span>${r.name}</span><b>${r.score}</b></div>`).join("");
    const pts = Object.entries(th.score).map(([k, v]) => `${tr(SCORE_LABEL[k] ?? k)} ×${v}`).join(" · ");
    const hist = w.hist.length ? `<p class="dim">${tr("Geçmiş haftalar")}: ${w.hist.slice(0, 5).map((x) => `${weekTheme(x.id)[en ? "en" : "name"]} ${x.rank}. (${x.score})`).join(" · ")}</p>` : "";
    return `<h3>${ic(th.icon)} ${en ? th.en : th.name} <em class="dim">· ${tr("{d}g {h}s kaldı", { d, h })}</em></h3>
      <p class="dim">${en ? th.descEn : th.desc} ${tr("Haftanın lütfu")}: <b class="cheap">${mods}</b></p>
      <p class="dim small">${tr("Puanlama")}: ${pts}</p>
      ${bar(Math.min(score, next), next, "", `${tr("Hafta puanı")} ${score}/${next}`)}
      <div class="wtiers">${tiers}</div>
      <div class="wboard"><div class="wrow hd"><i>#</i><span>${tr("Bozkır sıralaması")}</span><b>${tr("puan")}</b></div>${rows}</div>${hist}`;
  }

  private studPick: number[] = [];

  private stableHtml(city: string, near: boolean): string {
    const g = this.g;
    const s = g.s;
    const shop =
      `<h3>${ic("mount_2")} At pazarı</h3>` +
      g
        .horseShop(city)
        .map((k) => {
          const b = BREEDS[k];
          return `<div class="grow">${ic(b.icon, "gimg")}<div class="bi2"><b>${b.name}</b><small>${b.desc}</small><small>Hız +%${Math.round(b.spd * 100)} · Yük +${b.carry} · Can +${b.hp}</small></div><button class="btn sm ${!near || !s.free || s.res.gold < b.gold ? "off" : ""}" data-a="${this.act(() => g.buyHorse(k, city))}">Al<br>${ic("coins")}${b.gold}</button></div>`;
        })
        .join("");
    if (!g.canStud(city)) return shop + `<p class="dim">Kendi ahırında at çiftleştirmek için burada bir kervansaray kur (ya da Semerkant'ta çiftleştir).</p>`;
    const st = s.stud;
    let stud = `<h3>${ic("stable")} Ahır</h3>`;
    if (st) {
      stud += `<div class="brow">${ic("foal", "bimg")}<div class="bi2"><b>${st.a.name.split(" (")[0]} × ${st.b.name.split(" (")[0]}</b>${bar(BREED_TIME - (st.until - g.now), BREED_TIME, "", `Tay ${dur(st.until - g.now)} sonra`)}<small>${CITY_NAME[st.city]} ahırında</small></div></div>`;
    } else {
      const hs = g.studHorses();
      this.studPick = this.studPick.filter((id) => hs.some((x) => x.id === id));
      stud += `<p class="dim">İki atını seç ve çiftleştir. Tay, ebeveynlerinin hızını, yük gücünü ve dayanıklılığını karışık alır; bazen ikisinden de üstün doğar. Kuşaklar ilerledikçe efsanevi <b>Tulpar</b> doğabilir.</p>` +
        (hs.length < 2
          ? `<p class="dim">En az iki atın olmalı (${hs.length}/2).</p>`
          : hs
              .map((it) => {
                const on = this.studPick.includes(it.id);
                return `<div class="grow ${on ? "pick" : ""}">${ic(it.icon, "gimg")}<div class="bi2"><b class="r${it.rar}">${it.name}</b><small>${itemStats(it)}</small></div><button class="btn sm ${on ? "go" : ""}" data-a="${this.act(() => (this.studPick = on ? this.studPick.filter((x) => x !== it.id) : [...this.studPick.slice(-1), it.id]))}">${on ? "Seçili" : "Seç"}</button></div>`;
              })
              .join("") +
            `<button class="btn big ${this.studPick.length === 2 && near && s.res.gold >= BREED_GOLD ? "go" : "off"}" style="width:100%" data-a="${this.act(() => { g.breedHorses(this.studPick[0], this.studPick[1], city); this.studPick = []; })}">${ic("foal")} Çiftleştir · ${ic("coins")}${BREED_GOLD}</button>`);
    }
    return shop + stud;
  }

  private birdShopHtml(city: string, near: boolean): string {
    const g = this.g;
    const s = g.s;
    return (
      `<h3>${ic("bird_dogan")} Kuşçu</h3>` +
      g
        .birdShop(city)
        .map((k) => {
          const d = BIRDS[k];
          const mine = s.bird?.kind === k;
          return `<div class="grow">${ic("bird_" + k, "gimg")}<div class="bi2"><b>${d.name}</b><small>${d.desc}</small><small>${modsText(d.mods(5))} (5. seviyede) · her ${d.cd} sn uçar</small></div>${mine ? `<em class="cheap">Senin</em>` : `<button class="btn sm ${!near || !s.free || s.res.gold < d.gold ? "off" : ""}" data-a="${this.act(() => g.buyBird(k, city))}">Al<br>${ic("coins")}${d.gold}</button>`}</div>`;
        })
        .join("") +
      (city !== "bukhara" && city !== "kashgar" ? `<p class="dim">Ak Sungur yalnız Buhara'da, Altın Kartal yalnız Kaşgar'da satılır.</p>` : "")
    );
  }

  private birdHtml(): string {
    const g = this.g;
    const b = g.s.bird;
    if (!b) return `<h3>${ic("bird_dogan")} Av kuşu</h3><p class="dim">Henüz bir kuşun yok. Şehirlerin hanındaki kuşçudan bir doğan alabilirsin; keşif yapar, av getirir, düşmanı gözetler.</p>`;
    const d = BIRDS[b.kind];
    const cd = g.birdReady();
    return `<h3>${ic("bird_" + b.kind)} Av kuşu</h3><div class="brow">${ic("bird_" + b.kind, "bimg")}<div class="bi2"><b>${b.name} <em>${d.name} · Sv ${b.lv}</em></b>${b.lv < 10 ? bar(b.xp, birdXpNeed(b.lv), "", `${b.xp}/${birdXpNeed(b.lv)}`) : ""}<small>${modsText(d.mods(b.lv))} · görüş +${birdSight(b)}${b.lv >= 3 ? " · düşman taktiğini haber verir" : " · 3. seviyede düşman taktiğini haber verir"}</small></div><button class="btn sm ${cd > 0 || g.birdFly ? "off" : "go"}" data-a="${this.act(() => { this.close(); g.aimBird(); })}">${g.birdFly ? "Uçuyor" : cd > 0 ? `${Math.ceil(cd)} sn` : "Uçur"}</button></div>`;
  }

  private chronAll = false;

  private newsHtml(city: string, near: boolean): string {
    const g = this.g;
    if (near) return "";
    const age = g.newsAge(city);
    const canBuy = g.nearCity() >= 0;
    const msg = age === null ? t("Bu şehrin fiyatlarından haberin yok.") : age === 0 ? t("Bugünkü haber: fiyatlar taze.") : t("Fiyatlar {n} gün önceki habere göre; değişmiş olabilir.", { n: age });
    const net = g.s.serais[city] ? ` · ${t("kervansaray ağın her gün haber taşır")}` : "";
    return `<div class="odds news ${age === null ? "bad" : age > 1 ? "mid" : "good"}">${ic("scroll")} ${msg}${net}${canBuy ? ` <button class="btn sm ${g.s.res.gold < NEWS_GOLD ? "off" : ""}" data-a="${this.act(() => g.buyNews())}">${t("Kervancılardan haber al")} (${NEWS_GOLD})</button>` : ""}</div>`;
  }

  openDestan(): void {
    const g = this.g;
    const s = g.s;
    const end = s.act3.ending ? endingOf(s.act3.ending) : null;
    const tl = s.title ? titleOf(s.title) : null;
    const title = [end?.name, s.kagan ? "Kağan" : s.beylik ? "Bey" : s.free ? "Hür yiğit" : "Köle", tl?.name].filter(Boolean).join(" · ");
    void openDestan(this.root, { name: s.hero.name, title, portrait: assetUrl(g.face()), lv: s.hero.lv, day: g.dayOf().day, kills: s.kills, renown: Math.round(s.renown), verses: s.chron });
  }

  private chronHtml(): string {
    const c = this.g.s.chron;
    if (!c.length) return "";
    const list = [...c].reverse().slice(0, this.chronAll ? 80 : 6);
    return (
      `<h3>${ic("parsomen")} Ozanın Defteri <button class="btn sm go dsbtn" data-a="${this.act(() => this.openDestan())}">${ic("scroll")} Destan Kitabı</button></h3><div class="chron">` +
      list.map((e) => `<div class="cr"><em>Gün ${e.d}</em><p>${e.t}</p></div>`).join("") +
      `</div>` +
      (c.length > 6 ? `<button class="btn sm" style="width:100%" data-a="${this.act(() => (this.chronAll = !this.chronAll))}">${this.chronAll ? "Kısalt" : `Bütün destanı oku (${c.length})`}</button>` : "")
    );
  }

  private nemesisHtml(): string {
    const g = this.g;
    const s = g.s;
    if (!s.nemeses.length) return `<h3>${ic("j_bandit")} Kan Davası</h3><p class="dim">Henüz can düşmanın yok. Seni yenen ya da kampını yaktığın harami reisleri intikam yemini eder; isim, lakap ve güç kazanıp peşine düşerler.</p>`;
    const list = [...s.nemeses].sort((a, b) => Number(b.alive) - Number(a.alive) || b.lv - a.lv);
    return (
      `<h3>${ic("j_bandit")} Kan Davası <em class="dim">· ${s.c.slain} reis öldürüldü</em></h3>` +
      list
        .map((n) => {
          const t = NEM_TRAITS[n.trait];
          const out = g.nemesisOut(n);
          const where = n.bro ? `<b class="cheap">Kan kardeşin · ${BRO_MODS[n.trait].text}</b>` : n.alive ? (out ? `<b class="dear">Bozkırda seni arıyor</b>` : `${s.camps[n.camp]?.name ?? "?"} çevresinde`) : "Öldürüldü";
          const btn = n.alive ? `<button class="btn sm" data-a="${this.act(() => { this.close(); const p = out ?? s.camps[n.camp]; g.cam.flyTo(p.x, p.y, 0.8); })}">Bul</button>` : n.bro ? `<em class="cheap">⚭</em>` : `<em class="cheap">✓</em>`;
          return `<div class="grow nem ${n.alive || n.bro ? "" : "dim dead"} ${n.han ? "han" : ""}">${ic("j_bandit", "gimg")}<div class="bi2"><b>${nemName(n)}</b> <small>Sv ${n.lv}</small><small>${t.name} · ${t.desc}</small><small>${where}${n.wins ? ` · seni ${n.wins} kez yendi` : ""}${n.scars ? ` · ${n.scars} yara izi` : ""}</small></div>${btn}</div>`;
        })
        .join("")
    );
  }

  private kurultayHtml(): string {
    const g = this.g;
    const s = g.s;
    if (!s.beylik || !s.rivals.length) return "";
    const why = g.kurultayReason();
    const kr = g.kaganReason();
    const act = s.kurultay.decrees.map((id) => DECREES.find((d) => d.id === id)).filter(Boolean);
    return `<h3>${ic("lord_bey")} Kurultay ${s.kagan ? `<em class="cheap">· ${s.hero.name} Kağan</em>` : ""}</h3>
      <p class="dim">Müttefik ve tabi beylerinle Semerkant'ta toplan, fermanları oya sun. ${s.kagan ? "" : `Yeterince güçlüysen Kağanlığını ilan ettir.`}</p>
      ${act.length ? act.map((d) => `<div class="grow">${ic(d!.icon, "gimg")}<div class="bi2"><b>${d!.name} <em class="cheap">yürürlükte</em></b><small>${d!.desc}</small></div></div>`).join("") : `<p class="dim">Yürürlükte ferman yok.</p>`}
      <div class="stats"><div>Toplanan kurultay: <b>${s.kurultay.held}</b></div><div>${ic("crown")}Kağanlık: <b>${s.kagan ? "Evet" : kr ? "Henüz değil" : "Hazır!"}</b></div></div>
      ${why ? `<p class="why">${why}</p>` : ""}
      ${!s.kagan && kr && !why ? `<p class="dim">${kr}</p>` : ""}
      <button class="btn go ${why ? "off" : ""}" data-a="${this.act(() => { this.close(); g.holdKurultay(); })}">${ic("lord_bey")} Kurultayı topla</button>`;
  }

  private rivalsHtml(): string {
    const g = this.g;
    const s = g.s;
    if (!s.rivals.length) return "";
    const own = Object.keys(s.owned);
    return (
      `<h3>${ic("lord_bey")} Beyler <em class="dim">· müttefik gücü +%${Math.round(g.allyBonus() * 100)}</em></h3>` +
      (own.length ? `<div class="odds good">${ic("siege")} Fethettiğin şehirler: <b>${own.map((c) => CITY_NAME[c]).join(", ")}</b></div>` : "") +
      s.rivals
        .map((r) => {
          const t = RIVAL_TRAITS[r.trait];
          const dead = r.status === "dead";
          const btn = dead ? `<em class="dim">✝</em>` : `<button class="btn sm" data-a="${this.act(() => { this.close(); g.cam.flyTo(r.x, r.y, 0.8); })}">Bul</button>`;
          const q = r.req;
          const p = q && g.reqGoto(r);
          const reqRow = q
            ? `<div class="grow req">${ic(REQ_INFO[q.kind].icon, "gimg")}<div class="bi2"><b>${REQ_INFO[q.kind].name} <em>· ${Math.max(0, q.until - g.dayOf().day + 1)} gün</em></b><small>${g.reqText(r)}</small><small class="cheap">Ödül: ${q.gold} altın · dostluk</small></div>${p ? `<button class="btn sm go" data-a="${this.act(() => { this.close(); g.cam.flyTo(p.x, p.y, 0.8); })}">Git</button>` : ""}</div>`
            : "";
          return `<div class="grow rival ${dead ? "dim dead" : ""}">${ic(r.icon, "gimg")}<div class="bi2"><b>${r.name} ${r.title}</b> <small style="color:${RIVAL_CSS[r.status]}">${STATUS_NAME[r.status]}</small><small>${t.name} · Sv ${r.lv} · ${armySize(r.army)} asker · ${CITY_NAME[r.home]} yöresi</small>${r.age && !dead ? `<small class="dim">${r.age} yaşında${(r.gen ?? 1) > 1 ? ` · ${r.gen}. kuşak` : ""} · varis: ${r.heirs?.length ? r.heirs.join(", ") : "yok"}${r.wed ? ` · <b class="cheap">dünürün</b>` : ""}</small>` : ""}${dead ? "" : bar(r.rel + 100, 200, r.rel < 0 ? "hp" : "", `Dostluk ${Math.round(r.rel)}`)}</div>${btn}</div>${reqRow}`;
        })
        .join("")
    );
  }

  private titlesHtml(): string {
    const g = this.g;
    const s = g.s;
    const cur = s.title ? titleOf(s.title) : null;
    return (
      `<h3>${ic("trophy")} Unvanlar</h3><div class="odds ${cur ? "good" : "mid"}">${cur ? `Aktif unvan: <b>${cur.name}</b> · ${modsText(cur.mods)}` : "Henüz aktif bir unvanın yok."}</div><p class="dim">Her başarım bir unvan ve ödül kazandırır. Kazandığın unvanlardan birini taşıyabilirsin; taşıdığın unvanın gücü sana geçer. ${s.titles.length}/${TITLE_CATS.length * 3} unvan.</p>` +
      TITLE_CATS.map((cat) => {
        const v = cat.value(s);
        const next = cat.tiers.find((t) => v < t.need);
        return `<div class="tcat"><div class="tch">${ic(cat.icon, "gimg")}<div class="bi2"><b>${next ? `${Math.min(v, next.need)}/${next.need} ${cat.what}` : `${tr("Tamamlandı")} · ${cat.what}`}</b>${next ? `<div class="fbar" style="--fc:#e0b04a"><i style="width:${Math.min(100, (v / next.need) * 100)}%"></i></div>` : ""}</div></div><div class="ttiers">${cat.tiers
          .map((t, i) => {
            const key = titleKey(cat.id, i);
            const got = s.titles.includes(key);
            const on = s.title === key;
            return `<button class="tt ${got ? "got" : ""} ${on ? "on" : ""}" ${got ? `data-a="${this.act(() => g.setTitle(on ? "" : key))}"` : ""} title="${modsText(t.mods)}"><b>${t.name}</b><small>${got ? modsText(t.mods) : `${t.need}`}</small></button>`;
          })
          .join("")}</div></div>`;
      }).join("")
    );
  }

  private repHtml(): string {
    const g = this.g;
    return (
      `<h3>${ic("seal")} İtibar</h3><p class="dim">Şehir görevleri, emanetler, köy savunmaları, kamp ve kurgan zaferleri ile kârlı ticaret, o bölgenin hükümdarı gözünde itibarını artırır. Dikkat: birine yaranmak rakibini kızdırır.</p>` +
      FACTION_KEYS.map((f) => {
        const fac = FACTIONS[f];
        const v = g.rep(f);
        const r = g.rank(f);
        const next = REP_RANKS[r + 1];
        const lo = REP_RANKS[r].need;
        const pct = next ? Math.max(0, Math.min(100, ((v - lo) / (next.need - lo)) * 100)) : 100;
        return `<div class="frep" style="--fc:${fac.color}"><div class="frh">${ic(fac.icon, "gimg")}<div class="bi2"><b>${fac.name} <em>${v <= HOSTILE ? "Düşman" : REP_RANKS[r].name}</em></b><small class="dim">${fac.ruler} · rakibi ${FACTIONS[fac.rival].short} · özel birlik: ${UNITS[fac.unit].name}</small></div><span class="rv ${v < 0 ? "dear" : ""}">${v}</span></div><div class="fbar"><i style="width:${pct}%"></i></div><small>${next ? `Sonraki (${next.name}, ${next.need}): ${RANK_PERKS[r + 1]}` : "En yüksek rütbe"}</small></div>`;
      }).join("")
    );
  }

  private setsHtml(): string {
    const g = this.g;
    const on = SET_KEYS.filter((k) => g.setCount(k) > 0);
    if (!on.length) return "";
    return (
      `<h3>${ic("trophy")} Set bonusları</h3>` +
      on
        .map((k) => {
          const st = SETS[k];
          const n = g.setCount(k);
          return `<div class="setb" style="--sc:${st.color}"><b>${st.name} <em>${n}/4</em></b><small class="${n >= 2 ? "on" : ""}">(2) ${modsText(st.b2)}</small><small class="${n >= 4 ? "on" : ""}">(4) ${modsText(st.b4)}</small></div>`;
        })
        .join("")
    );
  }

  private codexHtml(): string {
    const g = this.g;
    const s = g.s;
    const cl = g.cls();
    const pieceIcon = (sl: Slot) => (sl === "silah" ? (WEAPON_ICON[cl.weapons[0]] ?? "it_sword_") + "5" : sl === "zirh" ? (cl.armor === "agir" ? "it_armor_5" : "it_light_5") : sl === "at" ? "mount_3" : "tr_star");
    const cell = (key: string, icon: string, name: string) => `<div class="cx ${s.codex.includes(key) ? "got" : ""}" title="${s.codex.includes(key) ? name : "???"}">${ic(icon)}</div>`;
    return (
      `<h3>${ic("parsomen")} Destan Koleksiyonu ${s.codex.length}/${g.codexMax()}</h3><p class="dim">Kurgan boss'ları, güçlü kamplar, harabeler ve şehir görevleri efsane eşya düşürür. Set parçalarını Atölye'deki Efsane Ocağı'nda da dövebilirsin.</p>` +
      `<div class="codex">${UNIQUES.map((u) => cell(`uq:${u.id}`, u.slot === "silah" ? pieceIcon("silah") : u.slot === "zirh" ? pieceIcon("zirh") : u.slot === "kalkan" ? "it_shield_5" : u.slot === "at" ? "mount_3" : "tr_jadeeye", u.name)).join("")}</div>` +
      SET_KEYS.map((k) => `<div class="codex" style="--sc:${SETS[k].color}"><span class="cxn">${SETS[k].name}</span>${SET_SLOTS.map((sl) => cell(`set:${k}:${sl}`, pieceIcon(sl), SETS[k].pieces[sl])).join("")}</div>`).join("")
    );
  }

  modal(): boolean {
    return this.storyOpen || this.battleOpen || this.menuOpen || !!this.siegeEl;
  }

  private siegeEl: HTMLElement | null = null;

  openSiege(): void {
    this.close();
    this.siegeEl?.remove();
    const el = document.createElement("div");
    el.className = "battle siege";
    this.root.appendChild(el);
    this.siegeEl = el;
    this.renderSiege();
  }

  closeSiege(): void {
    this.siegeEl?.remove();
    this.siegeEl = null;
  }

  private renderSiege(): void {
    const g = this.g, r = g.siegeRun, el = this.siegeEl;
    if (!r || !el) return this.closeSiege();
    const en = lang() === "en";
    const s = g.s;
    const over = r.day > SIEGE_MAX_DAY;
    const food = g.siegeFood();
    const odds = Math.round(g.siegeAssaultOdds() * 100);
    const pc = Math.round(parleyChance(r, g.siegeCtx()) * 100);
    const run = (fn: () => void) => this.act(() => {
      fn();
      this.renderSiege();
    });
    const wallPct = Math.round(100 - r.breach);
    const towers = Array.from({ length: 7 }, (_, i) => `<i class="${(i + 0.5) / 7 * 100 < r.breach ? "down" : ""}${i === 3 && r.sap ? " sap" : ""}"></i>`).join("");
    el.innerHTML = `<div class="bbox sgbox">
      <h2>${ic("siege")} ${CITY_NAME[r.city]} ${t("kuşatması")} · ${t("Gün")} ${Math.min(r.day, SIEGE_MAX_DAY)}/${SIEGE_MAX_DAY}</h2>
      <div class="sgwall">${towers}</div>
      ${bar(wallPct, 100, "sgw", `${t("Sur sağlamlığı")} ${wallPct}%`)}
      ${bar(r.morale, 100, "sgm", `${t("Savunmacı morali")} ${Math.round(r.morale)}`)}
      <div class="sgstats">
        <span>${ic("shield")} ${t("Garnizon")}: <b>${armySize(siegeGar(r))}</b></span>
        <span>${ic("swords")} ${t("Ordun")}: <b>${armySize(g.siegeArmy(r.city))}</b></span>
        <span>${ic("food")} ${t("Erzak")}: <b class="${s.res.food < food ? "dear" : ""}">${Math.floor(s.res.food)}</b> <small>(-${food}/${t("gün")})</small></span>
        <span>${ic("tug")} ${r.relief > 0 ? `${t("Yardım ordusu")}: <b class="dear">${r.relief} ${t("gün")}</b>` : `<b>${t("Yardım ordusu geldi")}</b>`}</span>
        <span>${ic("b_tasocagi")} ${t("Lağım")}: <b>${r.sap}/3</b></span>
        <span>${ic("siege")} ${t("Mancınık")}: <b>${r.engines}</b></span>
      </div>
      <div class="sgacts">${over ? "" : SIEGE_ACTS.map((a) => `<button class="btn sgact" data-sg="${a.id}" data-a="${run(() => g.siegeAct(a.id))}">${ic(a.icon)}<b>${en ? a.en[0] : a.name}${a.id === "parley" ? ` ~%${pc}` : ""}</b><small>${en ? a.en[1] : a.desc}</small></button>`).join("")}</div>
      <div class="sgend">
        <button class="btn go big" data-sg="assault" data-a="${this.act(() => g.siegeAssault())}">${t("Hücum!")} <small>~%${odds}</small></button>
        <button class="btn bad" data-sg="retreat" data-a="${this.act(() => g.siegeRetreat())}">${t("Geri çekil")}</button>
      </div>
      <ul class="sglog">${r.log.slice(0, 6).map((l) => `<li class="${l.cls}">${l.t}</li>`).join("")}</ul>
    </div>`;
  }

  gamepad: Gamepad | null = null;

  private padPress(b: PadButton, ui: boolean): void {
    const g = this.g;
    if (this.archery || this.minigame) {
      if (b === "b") window.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", key: "Escape" }));
      else if (b === "lb" || b === "y") this.minigame?.move?.(-1);
      else if (b === "rb" || b === "x") this.minigame?.move?.(1);
      return;
    }
    if (this.menuOpen) {
      if (b === "b" || b === "back" || b === "start") this.closeMenu();
      return;
    }
    if (this.modal()) return;
    if (ui) {
      if (b === "b" || (b === "start" && this.place?.kind === "hero")) this.close();
      else if (b === "lb" || b === "rb") {
        const tabs = [...this.panel.querySelectorAll<HTMLElement>(".tabs .tab")];
        const i = tabs.findIndex((x) => x.classList.contains("on"));
        if (tabs.length) tabs[(i + (b === "rb" ? 1 : tabs.length - 1)) % tabs.length].click();
      }
      return;
    }
    if (b === "a") g.cam.onTap(g.cam.x, g.cam.y);
    else if (b === "start") this.openHero();
    else if (b === "back") this.openMenu();
    else if (b === "l3") this.cycleSpeed();
    else if (b === "y") g.cam.flyTo(g.s.hero.x, g.s.hero.y, Math.max(g.cam.zoom, 0.7));
    else if (b === "x" && g.s.bird && g.s.free) g.aimBird();
    else if (b === "lb") g.cam.zoomBy(1 / 1.25);
    else if (b === "rb") g.cam.zoomBy(1.25);
  }

  private act(fn: () => void): string {
    const id = "a" + this.actN++;
    this.acts.set(id, () => {
      fn();
      this.render();
    });
    return id;
  }

  panelOpen(): boolean {
    return !this.panel.classList.contains("hidden") || this.battleOpen || this.storyOpen || this.menuOpen || !!this.siegeEl;
  }

  speed(): number {
    if (this.g.battleLock || this.modal() || this.archery || this.minigame) return 1;
    return settings.speed ?? 1;
  }

  cycleSpeed(): void {
    settings.speed = (((settings.speed ?? 1) % 3) + 1) as 1 | 2 | 3;
    saveSettings();
    this.toast(t("Oyun hızı: {n}x", { n: settings.speed }), "info");
    this.liveT = 0;
  }

  menuOpen = false;
  photo: { open(): void; on: boolean } | null = null;
  private menuEl: HTMLElement | null = null;
  private menuDone: (() => void) | null = null;
  private menuFly = 0;
  private menuCity = 0;

  openPhoto(): void {
    if (!this.photo || this.g.s.cls === null) return;
    this.close();
    this.closeMenu();
    this.photo.open();
  }

  openMenu(title = false, done: (() => void) | null = null): void {
    const g = this.g;
    if (this.menuOpen || this.archery || this.minigame || this.battleOpen || this.storyOpen) return;
    this.close();
    g.cam.keys.clear();
    this.menuOpen = true;
    this.menuDone = done;
    this.menuFly = 0;
    const s = g.s;
    const started = s.cls !== null;
    const inf = slotInfo(curSlot());
    const cl = s.cls ? CLASSES.find((c) => c.id === s.cls) : null;
    const desktop = navigator.userAgent.includes("Electron");
    const items: [string, string, string, () => void][] = [
      [title ? (started ? t("Destana devam et") : t("Yeni destan")) : t("Oyuna dön"), started ? `${s.hero.name} · ${cl?.name ?? ""} · ${t("Sv")} ${s.hero.lv}${inf?.renown ? ` · ${ic("crown")}${inf.renown}` : ""}` : t("Bir köle olarak başla, hakan olarak öl"), "go", () => this.closeMenu()],
      [t("Kayıt yuvaları"), t("Yükle, yeni yuva aç, dışa/içe aktar"), "", () => this.menuTo("ayar")],
      ...(started ? ([[t("Bitig"), t("Bozkır ansiklopedisi · {n}/{m} sayfa", { n: s.bitig?.length ?? 0, m: CODEX.length }), "", () => this.menuTo("bitig")]] as [string, string, string, () => void][]) : []),
      [t("Ayarlar"), t("Ses, görüntü, anlatıcı, dil"), "", () => this.menuTo("ayar")],
      ...(started && !title ? ([[t("Fotoğraf modu"), t("Arayüzü gizle, süzgeç seç, anı yakala (P)"), "", () => this.openPhoto()]] as [string, string, string, () => void][]) : []),
      ...(desktop ? ([[t("Oyundan çık"), t("İlerlemen kaydedilir"), "red", () => { g.saveNow(); window.close(); }]] as [string, string, string, () => void][]) : []),
    ];
    const el = document.createElement("div");
    el.className = `battle kkmenu${title ? " title" : ""}`;
    el.innerHTML = `<div class="mwrap">
      <div class="mlogo">${tamgaSvg({ ...TAMGA_DEFAULT, ...s.tamga }, 64)}<h1>Kervan Krallık</h1><p>${t("İpek Yolu'nda bir köleden hakana")}</p></div>
      <div class="mbtns">${items.map(([label, sub, cls], i) => `<button class="mbtn ${cls}" data-m="${i}"><b>${label}</b><small>${sub}</small></button>`).join("")}</div>
      <div class="mfoot">${(Object.keys(LANGS) as Lang[]).map((l) => `<button class="btn sm ${lang() === l ? "on" : ""}" data-l="${l}">${LANGS[l]}</button>`).join("")}<span class="dim">${title ? "" : t("Oyun duraklatıldı")}</span></div>
    </div>`;
    el.addEventListener("click", (e) => {
      const tg = e.target as HTMLElement;
      const m = tg.closest("[data-m]") as HTMLElement | null;
      if (m) {
        audio.play("click");
        items[Number(m.dataset.m)][3]();
        return;
      }
      const l = (tg.closest("[data-l]") as HTMLElement | null)?.dataset.l as Lang | undefined;
      if (l && l !== lang()) {
        settings.lang = l;
        saveSettings();
        if (started) g.saveNow();
        location.reload();
      }
    });
    this.root.appendChild(el);
    this.menuEl = el;
    document.body.classList.toggle("titled", title);
  }

  closeMenu(): void {
    if (!this.menuOpen) return;
    if (this.menuEl?.classList.contains("title")) this.g.cam.flyTo(this.g.s.hero.x, this.g.s.hero.y, 0.75);
    this.menuEl?.remove();
    this.menuEl = null;
    this.menuOpen = false;
    document.body.classList.remove("titled");
    const done = this.menuDone;
    this.menuDone = null;
    done?.();
  }

  private menuTo(tab: string): void {
    this.closeMenu();
    if (this.storyOpen) return;
    this.openHero();
    this.tab = tab;
    this.render();
  }

  menuTick(dt: number): void {
    if (!this.menuEl?.classList.contains("title")) return;
    this.menuFly -= dt;
    if (this.menuFly > 0) return;
    this.menuFly = 7;
    const s = this.g.s;
    const seen = CITIES.filter((c) => s.explored[Math.floor(c.y / NAV) * NW + Math.floor(c.x / NAV)]);
    const spots = seen.length > 1 ? seen : [{ x: s.hero.x, y: s.hero.y }, ...seen];
    const c = spots[this.menuCity++ % spots.length];
    this.g.cam.flyTo(c.x, c.y, 0.62);
  }

  toast(text: string, kind: "good" | "bad" | "info" = "info"): void {
    if ([...this.toasts.children].some((c) => c.textContent === text)) return;
    if (kind === "bad") audio.play("bad");
    else if (kind === "good" && /altın|\+/.test(text)) audio.play("coin");
    const el = document.createElement("div");
    el.className = "toast " + kind;
    el.textContent = text;
    this.toasts.appendChild(el);
    while (this.toasts.children.length > 3) this.toasts.firstElementChild!.remove();
    setTimeout(() => el.classList.add("out"), 2800);
    setTimeout(() => el.remove(), 3300);
  }

  private storyQ: (() => void)[] = [];

  story(title: string, img: string, html: string, btn = "Devam"): void {
    if (this.storyOpen || this.battleOpen) {
      this.storyQ.push(() => this.story(title, img, html, btn));
      return;
    }
    this.storyOpen = true;
    this.close();
    audio.play("story");
    const el = document.createElement("div");
    el.className = "battle";
    el.innerHTML = `<div class="bbox story">${this.listenBtn()}<img class="simg" src="${assetUrl(img)}" alt=""><h2>${title}</h2><p>${html}</p><button class="btn go big">${btn}</button></div>`;
    this.root.appendChild(el);
    this.wireListen(el, title, html);
    el.querySelector(".btn.go")!.addEventListener("click", () => {
      hush();
      el.remove();
      this.storyOpen = false;
      this.nextStory();
    });
  }

  private spiritBtn(): string {
    const why = this.g.spiritWhy();
    return `<div class="sprow"><button class="btn spbtn ${why ? "off" : ""}" data-a="${this.act(() => this.spiritRite())}">${ic("ruh")} Kam ayini · ruhlar dünyası</button><small class="dim">${why ?? `${this.g.spiritCost()} Ruh Taşı · Üst ya da Alt Dünya'ya yolculuk`}</small></div>`;
  }

  spiritRite(): void {
    const g = this.g;
    const why = g.spiritWhy();
    if (why) return this.toast(why, "bad");
    if (this.storyOpen || this.battleOpen || !g.spiritBegin()) return;
    this.close();
    this.storyOpen = true;
    audio.play("story");
    const v = new SpiritView(this.root);
    const end = (after?: () => void) => {
      v.close();
      this.storyOpen = false;
      if (after) after();
      else this.nextStory();
    };
    const pick = (id: string) => {
      const r = g.spiritChoose(id);
      v.panel(r.title, r.html, [{ label: r.fight ? "Kılıcını çek" : "Davula tutunup dön", cls: r.fight ? "red" : "go", fn: () => end(r.fight ? () => g.spiritFight() : undefined) }]);
    };
    const realm = (r: Realm) => {
      v.setRealm(r);
      v.panel(
        r === "ust" ? "Üst Dünya" : "Alt Dünya",
        r === "ust" ? "Kayın ağacının dallarına tutunup dokuz kat göğe tırmandın. Yıldızlar ayağının altında, Ülgen'in ak ışığı tepende." : "Ateşin külünden yerin dibine indin. Dokuz kat aşağıda, mor sisin içinde iki göz seni izliyor.",
        g.spiritOpts(r).map((o) => ({ label: `<b>${o.name}</b><small>${o.off ?? o.text}</small>`, cls: o.off ? "off opt" : "opt", fn: () => pick(o.id) })),
      );
    };
    v.setRealm("drum");
    v.panel("Kam Ayini", `Ateş yandı, ardıç tütsüsü dumanlandı. Kam davulunu ısıtıp vurmaya başladı; her vuruşta bedenin biraz daha hafifliyor. Davul bir ata dönüştü.<br><br><small class="dim">Ruh Taşı: −${g.spiritCost()}</small>`, [
      { label: "Üst Dünya · Ülgen'in gökleri", cls: "go", fn: () => realm("ust") },
      { label: "Alt Dünya · Erlik'in katları", cls: "red", fn: () => realm("alt") },
    ]);
  }

  private listenBtn(): string {
    return canNarrate() ? `<button class="listen" title="${t("Dinle")}" aria-label="${t("Dinle")}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffd56a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#ffd56a33"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg></button>` : "";
  }

  private wireListen(el: HTMLElement, title: string, html: string): void {
    const b = el.querySelector<HTMLButtonElement>(".listen");
    if (!b) return;
    const sync = () => b.classList.toggle("on", speaking());
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (speaking()) hush();
      else narrate(title, html);
      sync();
    });
    if (settings.narrate && !audio.muted) setTimeout(() => {
      if (el.isConnected) narrate(title, html);
      sync();
    }, 350);
    const iv = setInterval(() => (el.isConnected ? sync() : clearInterval(iv)), 500);
  }

  choice(title: string, img: string, html: string, opts: { label: string; cls: string; fn: () => void }[]): void {
    if (this.storyOpen || this.battleOpen) {
      this.storyQ.push(() => this.choice(title, img, html, opts));
      return;
    }
    this.storyOpen = true;
    this.close();
    const el = document.createElement("div");
    el.className = "battle";
    el.innerHTML = `<div class="bbox story choice">${this.listenBtn()}<img class="simg" src="${assetUrl(img)}" alt=""><h2>${title}</h2><p>${html}</p>${opts.map((o, i) => `<button class="btn big ${o.cls}" data-i="${i}">${o.label}</button>`).join("")}</div>`;
    this.root.appendChild(el);
    this.wireListen(el, title, html);
    el.querySelectorAll<HTMLButtonElement>(".btn").forEach((b) =>
      b.addEventListener("click", () => {
        const o = opts[Number(b.dataset.i)];
        if (o.cls.includes("off")) return;
        hush();
        el.remove();
        this.storyOpen = false;
        o.fn();
        this.nextStory();
      }),
    );
  }

  tactics(title: string, enemy: Army, boss: Boss | null, foe: string, stance: Tactic | null, w: Record<Tactic, number>, opts: { t: Tactic; odds: number }[], last: Tactic, pick: (t: Tactic) => void, flee: string, onFlee: () => void): void {
    this.battleOpen = true;
    this.close();
    const el = document.createElement("div");
    el.className = "battle";
    const intel = stance
      ? `<div class="intel known">${ic("scroll")}<div>Gözcülerin haber getirdi: düşman <b>${TACTICS[stance].foe}</b>.</div></div>`
      : `<div class="intel">${ic("scroll")}<div>Düşmanın niyeti belirsiz. Saflarına bakılırsa: ${TACTIC_KEYS.map((t) => `${TACTICS[t].name} %${Math.round(w[t] * 100)}`).join(" · ")}<small>Çeviklik 6, Ferhat ya da Hırsız sınıfı gözcülük sağlar.</small></div></div>`;
    el.innerHTML = `<div class="bbox tbox"><h2>${ic("swords")} ${title}</h2>
      <div class="tfoe">${ic(boss?.icon ?? "j_bandit", "bp" + (boss ? " boss" : ""))}<div><b>${boss?.name ?? foe}</b>${armySize(enemy) ? armyHtml(enemy) : ""}</div></div>
      ${intel}
      <div class="tacts">${opts
        .map((o) => {
          const T = TACTICS[o.t];
          return `<button class="tact ${o.t === last ? "last" : ""}" data-t="${o.t}">${ic(T.icon, "ti")}<b>${T.name}</b><small>${T.text}</small><small class="tbeat">${TACTICS[T.beats].name} karşısında güçlü</small><span class="odds ${o.odds >= 0.7 ? "good" : o.odds >= 0.4 ? "mid" : "bad"}">%${Math.round(o.odds * 100)}</span></button>`;
        })
        .join("")}</div><button class="btn flee">${flee}</button></div>`;
    this.root.appendChild(el);
    el.querySelector(".flee")!.addEventListener("click", () => {
      el.remove();
      this.battleOpen = false;
      onFlee();
      this.nextStory();
    });
    el.querySelectorAll<HTMLButtonElement>(".tact").forEach((b) =>
      b.addEventListener("click", () => {
        el.remove();
        this.battleOpen = false;
        pick(b.dataset.t as Tactic);
      }),
    );
  }

  private nextStory(): void {
    this.storyQ.shift()?.();
  }

  questDone(q: Quest, label = "Görev tamamlandı"): void {
    audio.play("quest");
    this.root.querySelectorAll(".qdone").forEach((x) => x.remove());
    const el = document.createElement("div");
    el.className = "qdone";
    el.innerHTML = `${ic(label === "Görev tamamlandı" ? "quest" : "trophy", "qi")}<div><small>${label}</small><b>${q.title}</b><span>${costHtml(q.reward, this.g)}</span></div>`;
    this.root.appendChild(el);
    setTimeout(() => el.classList.add("out"), 3200);
    setTimeout(() => el.remove(), 3800);
  }

  close(): void {
    this.panel.classList.add("hidden");
    this.place = null;
    this.panelHtml = "";
  }

  openPlace(t: Target): void {
    const g = this.g;
    if (t.kind === "mongol") return g.mongolMenu();
    if (t.kind === "capital" || t.kind === "city") {
      const id = t.kind === "capital" ? "capital" : "city" + t.i;
      const prev = this.place && "i" in this.place ? "city" + this.place.i : this.place?.kind;
      if (prev !== id) this.tab = t.kind === "capital" ? (!g.s.free ? "efendi" : g.s.beylik ? "bina" : "pazar") : "pazar";
    }
    this.place = t;
    if (t.kind === "node") {
      const s = g.s.garrison;
      const n = Math.min(armySize(s), 20);
      this.sel = { spear: Math.min(s.spear, n), archer: 0, horse: 0 };
    }
    this.panel.classList.remove("hidden");
    this.render();
  }

  private openHero(): void {
    if (this.place?.kind !== "hero") this.tab = "karakter";
    this.place = { kind: "hero" };
    this.panel.classList.remove("hidden");
    this.render();
  }

  private frame(title: string, sub: string, img: string, body: string): string {
    return `<div class="ph"><img class="pimg" src="${img}" alt=""><div><h2>${title}</h2><small>${sub}</small></div><button class="x" data-a="${this.act(() => this.close())}">✕</button></div><div class="pb">${body}</div>`;
  }

  private tabs(list: [string, string][]): string {
    if (!list.some(([id]) => id === this.tab)) this.tab = list[0][0];
    return `<div class="tabs">${list.map(([id, n]) => `<button class="tab ${this.tab === id ? "on" : ""}" data-a="${this.act(() => (this.tab = id))}">${t(n)}</button>`).join("")}</div>`;
  }

  private walkBtn(t: Target, label: string): string {
    return `<button class="btn go" data-a="${this.act(() => {
      this.g.goTo(t);
      this.close();
    })}">${label}</button>`;
  }

  private render(): void {
    const t = this.place;
    if (!t) return;
    this.acts.clear();
    this.actN = 0;
    const g = this.g;
    const s = g.s;
    let html = "";
    switch (t.kind) {
      case "hero":
        html = this.heroHtml();
        break;
      case "capital":
        html = this.cityHtml(CAP_I);
        break;
      case "city":
        html = this.cityHtml(t.i);
        break;
      case "point":
      case "bandit":
        return this.close();
      case "village": {
        const v = s.villages[t.i];
        const room = g.heroCap() - armySize(s.hero.army);
        const near = Math.hypot(v.x - s.hero.x, v.y - s.hero.y) < 80;
        const cost = g.recruitCost();
        const btn = (n: number, label: string) => {
          const k = Math.max(0, Math.min(n, v.rec, room));
          return `<button class="btn ${k <= 0 || !near || !s.free ? "off" : ""}" data-a="${this.act(() => g.recruit(t.i, k))}">${label} (${k}) ${ic("coins")}${k * cost}</button>`;
        };
        html = this.frame(v.name, v.yurt ? "Göçebe obası" : "Köy", assetUrl(v.yurt ? "map/yurts" : "map/village"), `
          ${s.raid?.v === t.i ? `<div class="raid"><b>${ic("j_bandit")} Haramiler köyü yağmalıyor!</b><small>Kalan süre ${dur(s.raid.until - g.now)}</small>${armyHtml(s.raid.army, "enemy")}<div class="odds ${g.odds(s.raid.army) >= 0.65 ? "good" : "mid"}">Zafer şansı: <b>%${Math.round(g.odds(s.raid.army) * 100)}</b></div>${near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.defendRaid(); })}">${ic("swords")} Köyü savun!</button>` : ""}</div>` : ""}
          <p>Köylüler kervan yollarını haramilerden temizleyen bir yiğide gönüllü yazılır. Karizman ne kadar yüksekse o kadar çok genç seninle gelmek ister.</p>
          <div class="stats"><div>${ic("soldier")}Gönüllü: <b>${v.rec}</b>/${g.volMax(v.rep)}</div><div>${ic("crown")}Bağlılık: <b>${v.rep}</b>/100</div><div>${ic("tug")}Birlik: <b>${armySize(s.hero.army)}/${g.heroCap()}</b></div></div>
          ${v.rec < g.volMax(v.rep) ? `<p class="dim">Yeni gönüllü: ${dur(v.recAt - g.now)}</p>` : ""}
          ${!s.free ? `<p class="warn">Köleler asker toplayamaz. Önce hürriyetini kazan.</p>` : near ? "" : `<p class="warn">Gönüllü toplamak için birliğinle köye gitmelisin.</p>`}
          <div class="row">${btn(1, "1 al")}${btn(3, "3 al")}${btn(99, "Hepsi")}</div>
          ${near ? "" : this.walkBtn(t, "Köye yürü")}`);
        break;
      }
      case "camp": {
        const c = s.camps[t.i];
        const near = Math.hypot(c.x - s.hero.x, c.y - s.hero.y) < 90;
        const p = Math.round(g.odds(c.garrison, 0.1) * 100);
        const bounty = s.bounties.find((b) => b.camp === t.i && b.taken);
        html = this.frame(c.name, `Harami kampı · Seviye ${c.tier}`, assetUrl("map/camp"), c.alive ? `
          <p>Bu kamptan çıkan çeteler yolları ve köyleri yağmalıyor. Kampı yerle bir edersen ganimet ve şöhret kazanırsın.</p>
          ${bounty ? `<div class="odds good">${ic("wanted")} Ödül ilanı: +${bounty.gold} altın, +${bounty.renown} şöhret</div>` : ""}
          <h3>Kamp muhafızları</h3>${armyHtml(c.garrison, "enemy")}
          <h3>Sen ve birliğin</h3>${armyHtml(s.hero.army)}
          <div class="stats"><div>${ic("swords")}Saldırın: <b>${g.heroAtk().toFixed(0)}</b></div><div>${ic("shield")}Savunman: <b>${g.heroDef().toFixed(0)}</b></div><div>Can: <b>${Math.floor(s.hero.hp)}/${g.maxHp()}</b></div></div>
          <div class="odds ${p >= 65 ? "good" : p >= 35 ? "mid" : "bad"}">Zafer şansı: <b>%${p}</b></div>
          <p class="dim">Mızraklı atlıyı, okçu mızraklıyı, atlı okçuyu yener. Kamplar en az bir eşya düşürür.</p>
          ${near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.attackCamp(t.i); })}">${ic("swords")} Saldır!</button>` : this.walkBtn(t, "Kampa yürü")}` : `<p>Kamp yerle bir edildi. Haramiler ${dur(c.respawnAt - g.now)} sonra geri dönebilir.</p>`);
        break;
      }
      case "node":
        html = this.nodeHtml(t.i);
        break;
      case "fort": {
        const f = s.story.fort;
        if (!f) return this.close();
        const near = Math.hypot(f.x - s.hero.x, f.y - s.hero.y) < 100;
        const p = Math.round(g.fortOdds() * 100);
        html = this.frame("Kara Tamga Kalesi", "Kara Han'ın ini · Destanın sonu", assetUrl("map/castle"), s.story.done ? "<p>Kale yıkıldı. Zindanlar boş, esirler özgür.</p>" : `
          <p>Kayalıkların arasında, kara bayraklarla donanmış bir kale. Surların ardından zincir sesleri ve davul gümbürtüsü geliyor. Kara Han burada, esirlerin ruhlarıyla son taşı uyandırmak üzere.</p>
          <div class="brow">${ic(KARA_HAN.icon, "bimg round")}<div class="bi2"><b>${KARA_HAN.name}</b><small>Can ${KARA_HAN.hp} · Saldırı ${KARA_HAN.atk} · Savunma ${KARA_HAN.def}</small></div></div>
          <h3>Kale muhafızları</h3>${armyHtml(FORT_GUARD, "enemy")}
          <h3>Sen ve birliğin</h3>${armyHtml(s.hero.army)}
          <div class="odds ${p >= 65 ? "good" : p >= 35 ? "mid" : "bad"}">Zafer şansı: <b>%${p}</b></div>
          <p class="dim">Önerilen: 15+ seviye, 100+ asker, +5 ve üstü silah. Yoldaşların ve becerilerin büyük fark yaratır.</p>
          ${near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.attackFort(); })}">${ic("swords")} Kaleye saldır!</button>` : this.walkBtn(t, "Kaleye yürü")}`);
        break;
      }
      case "gate": {
        const f = s.act2.gate;
        if (!f) return this.close();
        const near = Math.hypot(f.x - s.hero.x, f.y - s.hero.y) < 110;
        const p = Math.round(g.gateOdds() * 100);
        html = this.frame("Erlik'in Kapısı", "Yeraltı Hanı'nın eşiği · Erlik Destanı'nın sonu", assetUrl("map/erlik_gate"), s.act2.done ? "<p>Kapı mühürlendi. Balbalların gözlerindeki mor ışık söndü.</p>" : `
          <p>İki dev balbalın arasında, kayaya oyulmuş kemerli bir kapı. İçeriden mor bir sis ve dokuz katın uğultusu yükseliyor. Erlik Han tahtında seni bekliyor.</p>
          <div class="brow">${ic(ERLIK.icon, "bimg round")}<div class="bi2"><b>${ERLIK.name}</b><small>Can ${ERLIK.hp} · Saldırı ${ERLIK.atk} · Savunma ${ERLIK.def}</small></div></div>
          <h3>Erlik'in ordusu</h3>${armyHtml(GATE_GUARD, "enemy")}
          <h3>Sen ve birliğin</h3>${armyHtml(s.hero.army)}
          <div class="odds ${p >= 65 ? "good" : p >= 35 ? "mid" : "bad"}">Zafer şansı: <b>%${p}</b> · Müttefik desteği +%${Math.round(g.allyBonus() * 100)}</div>
          <p class="dim">Önerilen: 25+ seviye, dolu birlik, efsanevi setler, müttefik beyler ve kan kardeşleri.</p>
          ${near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.attackGate(); })}">${ic("swords")} Kapıdan in!</button>` : this.walkBtn(t, "Kapıya yürü")}`);
        break;
      }
      case "peak": {
        const f = s.act3.peak;
        if (!f) return this.close();
        const near = Math.hypot(f.x - s.hero.x, f.y - s.hero.y) < 110;
        const p = Math.round(g.peakOdds() * 100);
        const end = endingOf(s.act3.ending);
        let body: string;
        if (end) body = `<p>Zirvede rüzgâr dinmiş. Kut'un yerinde bir avuç mavi buz parlıyor.</p><div class="odds good">Seçilen son: <b>${end.name}</b></div>`;
        else if (s.act3.ch >= 3) body = `<p>Kök Börü zirvenin kenarında yatıyor, gözleri sende. Buzun içinde Kut mavi bir alev gibi yanıyor.</p>${near ? `<button class="btn go big" data-a="${this.act(() => g.endingChoice())}">${ic("crown")} Kut'un kaderini seç</button>` : this.walkBtn(t, "Zirveye yürü")}`;
        else body = `<p>Karla örtülü sivri bir zirve; tepesinde gök bozkıra değiyor. Mavi bir ışık sütunu buluta karışıyor. Yamaçlarda gümüş zırhlı Gök Bekçileri nöbet tutuyor.</p>
          <div class="brow">${ic(KOK_BORU.icon, "bimg round")}<div class="bi2"><b>${KOK_BORU.name}</b><small>Can ${KOK_BORU.hp} · Saldırı ${KOK_BORU.atk} · Savunma ${KOK_BORU.def}</small></div></div>
          <h3>Gök Bekçileri</h3>${armyHtml(PEAK_GUARD, "enemy")}
          <h3>Sen ve birliğin</h3>${armyHtml(s.hero.army)}
          <div class="odds ${p >= 65 ? "good" : p >= 35 ? "mid" : "bad"}">Zafer şansı: <b>%${p}</b> · Müttefik desteği +%${Math.round(g.allyBonus() * 100)}</div>
          <p class="dim">Önerilen: 28+ seviye, dolu birlik, +7 silah, Kağanlık ve tabi beyler.</p>
          ${near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.climbPeak(); })}">${ic("swords")} Zirveye tırman!</button>` : this.walkBtn(t, "Dağa yürü")}`;
        html = this.frame("Tengri Dağı", "Göğün bozkıra değdiği yer · Gök Tengri Destanı", assetUrl("map/ruins"), body);
        break;
      }
      case "boy": {
        const x = g.boyStep();
        const at = s.boy?.at;
        if (!x || !at) return this.close();
        const { b, st, n } = x;
        const near = Math.hypot(at.x - s.hero.x, at.y - s.hero.y) < 120;
        let body = `<p>${st.text}</p>`;
        if (st.act === "fight") {
          const p = Math.round(g.boyOdds() * 100);
          body += `${st.boss ? `<div class="brow">${ic(st.boss.icon, "bimg round")}<div class="bi2"><b>${st.boss.name}</b><small>Can ${st.boss.hp} · Saldırı ${st.boss.atk} · Savunma ${st.boss.def}</small></div></div>` : ""}
            <h3>Düşman</h3>${armyHtml(st.army!(s.hero.lv), "enemy")}<h3>Sen ve birliğin</h3>${armyHtml(s.hero.army)}
            <div class="odds ${p >= 65 ? "good" : p >= 35 ? "mid" : "bad"}">Zafer şansı: <b>%${p}</b></div>`;
        }
        const cost = st.cost ? ` (${[st.cost.gold ? `${st.cost.gold} altın` : "", st.cost.food ? `${st.cost.food} yiyecek` : ""].filter(Boolean).join(", ")})` : "";
        const poor = st.cost && !g.canAfford({ gold: st.cost.gold ?? 0, food: st.cost.food ?? 0 });
        body += near ? `<button class="btn ${st.act === "fight" ? "red" : "go"} big ${poor ? "off" : ""}" data-a="${this.act(() => { if (st.act === "fight") this.close(); g.boyAct(); })}">${ic(st.act === "fight" ? "swords" : "scroll")} ${st.btn}${cost}</button>` : this.walkBtn(t, "Oraya yürü");
        html = this.frame(st.place, `Dede Korkut · ${b.name} · Adım ${n + 1}/${b.steps.length}`, assetUrl(st.img), body);
        break;
      }
      case "kip": {
        html = this.kipHtml(t.i);
        if (!html) return this.close();
        break;
      }
      case "otag": {
        const o = s.otag;
        if (!o) return this.close();
        const near = g.nearOtag();
        const z = zoneOf(o.y, H);
        const y = g.otagYield();
        const best = bestZone(g.season());
        html = this.frame("Ak Otağ", `${ZONE_NAME[z]} · ${g.sea().icon} ${g.sea().name}`, assetUrl("map/yurts"), `
          <p class="dim">${ZONE_DESC[z]}</p>
          <div class="stats"><div>${ic("foal")}Sürü: <b>${o.herd}/${HERD_MAX}</b></div><div>${ic("food")}Günlük: <b>+${y.food}</b></div><div>${ic("u_cavalry")}Atlı: <b>+${y.horses}/gün</b></div></div>
          <div class="odds ${y.q >= 1.1 ? "good" : y.q >= 0.8 ? "mid" : "bad"}">Otlak verimi: <b>%${Math.round(y.q * 100)}</b>${z === best ? " · mevsime uygun" : ` · bu mevsim <b>${ZONE_NAME[best].toLowerCase()}</b> daha bereketli`}</div>
          <p class="dim">Göç etmek için otağı istediğin yere taşı (Kahraman › Birlik › Otağ). Mevsime uygun bölgeye göç edersen şenlik yapılır.</p>
          ${near ? `<div class="row"><button class="btn go" data-a="${this.act(() => g.otagRest())}">${ic("healer")} Dinlen (${REST_FOOD} yiyecek)</button><button class="btn ${s.res.gold < HERD_GOLD || o.herd >= HERD_MAX ? "off" : ""}" data-a="${this.act(() => g.buyHerd())}">${ic("coins")} +${HERD_BUY} baş (${HERD_GOLD})</button></div>${this.spiritBtn()}` : this.walkBtn(t, "Otağa yürü")}`);
        break;
      }
      case "kurgan": {
        const k = s.kurgans[t.i];
        const b = kurganBoss(k.tier);
        const near = Math.hypot(k.x - s.hero.x, k.y - s.hero.y) < 90;
        const p = k.alive ? Math.round(g.kurganOdds(t.i) * 100) : 0;
        html = this.frame("Kurgan Taşı", `Lanetli balbal · Seviye ${k.tier}`, assetUrl("map/kurgan"), k.alive ? `
          <p>Eski bir hakanın mezarını bekleyen balbal, kara bir büyüyle uyandı. Etrafına taş askerler toplanıyor, gece olunca köylere korku salıyor. Taşı kırarsan içindeki ruhlar serbest kalır; demircilerin en çok aradığı <b>Ruh Taşları</b> geride kalır.</p>
          <div class="brow">${ic(b.icon, "bimg round")}<div class="bi2"><b>${b.name}</b><small>Can ${b.hp} · Saldırı ${b.atk} · Savunma ${b.def}</small></div></div>
          <h3>Taş askerler</h3>${armyHtml(k.guard, "enemy")}
          <h3>Sen ve birliğin</h3>${armyHtml(s.hero.army)}
          <div class="odds ${p >= 65 ? "good" : p >= 35 ? "mid" : "bad"}">Zafer şansı: <b>%${p}</b></div>
          <p class="dim">Ödül: ${2 * k.tier}+ Ruh Taşı, altın, kesin bir eşya (çoğu zaman bir kademe üstü), Kutsal Parşömen şansı.</p>
          ${near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.attackKurgan(t.i); })}">${ic("swords")} Taşa saldır!</button>` : this.walkBtn(t, "Taşa yürü")}` : this.deepHtml(t.i, near) + (near ? this.spiritBtn() : ""));
        break;
      }
      case "ruin": {
        const r = s.ruins[t.i];
        const near = Math.hypot(r.x - s.hero.x, r.y - s.hero.y) < 80;
        html = this.frame("Antik Harabe", "Unutulmuş bir kervansaray", assetUrl("map/ruins"), r.looted ? "<p>Burası çoktan yağmalanmış.</p>" : `
          <p>Yıkık duvarların arasında eski tüccarların sakladığı hazineler ve silahlar olabilir.</p>
          ${near ? `<button class="btn go big" data-a="${this.act(() => { this.toast(g.lootRuin(t.i), "good"); this.close(); })}">${ic("chest")} Harabeyi ara</button>` : this.walkBtn(t, "Harabeye yürü")}`);
        break;
      }
    }
    if (html !== this.panelHtml || !this.panel.firstChild) {
      this.panelHtml = html;
      this.panel.innerHTML = html;
    }
  }

  private nodeHtml(i: number): string {
    const g = this.g;
    const s = g.s;
    const n = s.nodes[i];
    const near = Math.hypot(n.x - s.hero.x, n.y - s.hero.y) < 90;
    const t: Target = { kind: "node", i };
    const what = { wood: "Odun kes", stone: "Taş kır", food: "Tarlada çalış", gold: "Madende kaz" }[n.kind];
    const yieldTxt = s.free ? `${ic(RES_ICON[n.kind])} +${g.workGain(n.kind)} ${RES_NAME[n.kind].toLowerCase()}` : `${ic("coins")} ${g.slaveWage()}–${g.slaveWage() + 2} akçe ücret`;
    let body = `
      <p>${s.free ? "Kendi hesabına çalış. Topladığın kereste, taş ve yiyeceği şehir pazarlarında satabilir ya da beyliğin için saklayabilirsin." : "Efendinin işçisisin. Ürünün tamamı efendine gider, sana sadece birkaç akçe ücret düşer."}</p>
      <div class="stats"><div>Vardiya: <b>5sn</b> · ⚡10 enerji</div><div>Kazanç: <b>${yieldTxt}</b></div>${s.free ? `<div>${ic(RES_ICON[n.kind])}Kalan: <b>${fmt(n.left)}</b>/${fmt(n.max)}</div>` : ""}</div>
      ${bar(s.hero.energy, g.maxEnergy(), "en", `Enerji ${Math.floor(s.hero.energy)}/${g.maxEnergy()}`)}
      ${near ? `<button class="btn go big ${g.act || s.hero.energy < 10 ? "off" : ""}" data-a="${this.act(() => g.work(i))}">${ic(RES_ICON[n.kind])} ${what}</button>` : this.walkBtn(t, "Oraya yürü")}
      <p class="dim">Emek becerin: ${g.skill("emek")} · Güç: ${g.stat("guc")}. İkisi de verimi artırır.</p>`;
    if (s.beylik) {
      const slots = g.marchSlots();
      const busy = s.marches.some((m) => m.node === i);
      const gar = s.garrison;
      const sliders = UNIT_KEYS.map((u) => `<label class="sl">${ic(UNITS[u].icon)}<input type="range" min="0" max="${gar[u]}" value="${Math.min(this.sel[u], gar[u])}" data-u="${u}"><b data-o="${u}">${Math.min(this.sel[u], gar[u])}</b><small>/${gar[u]}</small></label>`).join("");
      body += `<h3>${ic("j_caravan")} Toplama seferi (beylik garnizonu)</h3>
        <div class="stats"><div>Seferler: <b>${s.marches.length}/${slots}</b></div><div>Taşıma: <b data-load>${fmt(g.marchLoad(this.sel))}</b></div></div>
        ${n.left <= 0 ? `<p class="warn">Kaynak tükendi. ${dur(n.regenAt - g.now)} sonra yenilenir.</p>` : busy ? `<p class="warn">Bu noktaya zaten bir sefer gidiyor.</p>` : `${sliders}
        <button class="btn go ${s.marches.length >= slots ? "off" : ""}" data-a="${this.act(() => {
          if (g.sendMarch(i, { ...this.sel })) {
            this.toast("Toplama seferi yola çıktı", "good");
            this.close();
          } else this.toast("Sefer gönderilemedi: asker seç", "bad");
        })}">Sefer gönder</button>`}`;
    }
    return this.frame(NODE_NAME[n.kind], s.free ? `Seviye ${n.lv} kaynak noktası` : "Efendinin arazisi", assetUrl("map/" + ({ food: "farm", wood: "forest", stone: "quarry", gold: "mine" } as const)[n.kind]), body);
  }

  private portHtml(city: string, near: boolean): string {
    const g = this.g;
    const s = g.s;
    const p = portOf(city)!;
    const f = s.fleet;
    const v = f.voyage;
    const calm = (f.calm ?? 0) > s.time;
    let h = `<div class="stats"><div>${ic("merchant")}Gemi: <b>${f.ships}/${SHIP_MAX}</b></div><div>${ic("j_caravan")}Ambar: <b>${g.fleetCap()}</b></div><div>${ic("trophy")}Sefer: <b>${s.c.voyages}</b></div></div>
      <p class="dim">${p.name} · ${p.sea}. Gemiler heybenin sınırına takılmaz: tek seferde gemi başına ${SHIP_CAP} denk taşır ve mal varış iskelesinde kendiliğinden satılır. ${p.sea} korsanlarına dikkat.</p>`;
    if (v) {
      const k = Math.min(1, (s.time - v.at) / v.dur);
      h += `<h3>${ic("j_caravan")} Denizdeki gemiler</h3>${bar(k * 100, 100, "", `${CITY_NAME[v.from]} → ${CITY_NAME[v.to]} · ${v.qty} ${GOODS[v.good].name}${v.escort ? " · muhafızlı" : ""}`)}`;
    }
    h += `<div class="odds ${calm ? "good" : "mid"}">Korsan tehlikesi: <b>%${Math.round(g.pirateRisk(false) * 100)}</b> · muhafızla <b>%${Math.round(g.pirateRisk(true) * 100)}</b>${calm ? " · yuvaları dağıtıldı" : ""}</div>`;
    h += `<div class="row"><button class="btn ${!near || f.ships >= SHIP_MAX || s.res.gold < SHIP_GOLD ? "off" : ""}" data-a="${this.act(() => g.buyShip())}">${ic("coins")} Gemi al (${SHIP_GOLD})</button>
      <button class="btn ${!near ? "off" : ""}" data-a="${this.act(() => g.huntPirates())}">${ic("j_bandit")} Korsan yuvasına baskın</button></div>`;
    const cargo = GOOD_KEYS.filter((k) => (s.hero.cargo[k] ?? 0) > 0);
    for (const r of routesFrom(city)) {
      h += `<h3>⚓ ${CITY_NAME[r.to]} · ${r.days} gün</h3>`;
      if (!cargo.length) {
        h += `<p class="dim">Heybende mal yok. Pazardan mal alıp buradan yükle.</p>`;
        continue;
      }
      h += cargo.map((k) => {
        const have = s.hero.cargo[k] ?? 0;
        const qty = Math.min(have, g.fleetCap());
        const avg = Math.round((s.hero.paid[k] ?? 0) / have);
        const sp = g.seaPrice(r.to, k);
        const offB = !near || !!v || f.ships <= 0 ? "off" : "";
        return `<div class="grow">${ic(GOODS[k].icon, "gimg")}<div class="bi2"><b>${GOODS[k].name} × ${qty}</b><small>Maliyet ${avg} · orada ~${sp} <em class="${sp > avg ? "cheap" : "dear"}">${sp > avg ? "+" : ""}${(sp - avg) * qty}</em></small></div>
          <div class="col2"><button class="btn sm ${offB}" data-a="${this.act(() => g.sendVoyage(r.to, k, false))}">Yükle</button><button class="btn sm ${offB || s.res.gold < ESCORT_GOLD ? "off" : ""}" data-a="${this.act(() => g.sendVoyage(r.to, k, true))}">Muhafızlı · ${ESCORT_GOLD}</button></div></div>`;
      }).join("");
    }
    return h;
  }

  private cityHtml(ci: number): string {
    const g = this.g;
    const s = g.s;
    const c = CITIES[ci];
    const isCap = ci === CAP_I;
    const near = Math.hypot(c.x - s.hero.x, c.y - s.hero.y) < (isCap ? 170 : 150);
    const t: Target = isCap ? { kind: "capital" } : { kind: "city", i: ci };
    const list: [string, string][] = [];
    if (isCap && !s.free) list.push(["efendi", "Efendi"]);
    if (isCap && s.beylik) list.push(["bina", "Binalar"], ["kisla", "Kışla"], ["ordu", "Ordu"], ["sefer", "Seferler"]);
    list.push(["pazar", "Pazar"], ["demirci", "Demirci"], ["atolye", "Atölye"], ["ors", "Örs"], ["talim", "Talim"], ["han", "Han"]);
    if (isCap && s.free && !s.beylik) list.push(["beylik", "Beylik"]);
    if (!isCap && s.free) list.push(["kale", s.owned[c.id] ? "Kale ★" : "Kale"]);
    if (s.free && portOf(c.id)) list.push(["liman", "Liman ⚓"]);
    const tabs = this.tabs(list);
    let body = "";
    const off = !near ? "off" : "";
    const nearNote = near ? "" : `<p class="warn">Burada iş yapmak için şehre gitmelisin. Uzaktan yalnızca son duyduğun fiyatları bilirsin.</p>${this.walkBtn(t, "Şehre yürü")}`;
    if (this.tab === "efendi") {
      const cost = g.freedomCost();
      body = `<div class="brow">${ic("master", "bimg")}<div class="bi2"><b>Efendin Tüccar Bahadır</b><small>"Çalış, akçeni biriktir. ${cost} akçeyi getirdiğin gün özgürsün."</small></div></div>
        ${bar(s.res.gold, cost, "", `${Math.floor(s.res.gold)} / ${cost} akçe`)}
        <p class="dim">Şehrin çevresindeki orman, taş ocağı ve tarlalarda çalış. Her vardiya enerji harcar; enerjin şehirde daha hızlı dolar. Güç ve Emek arttıkça ücretin yükselir.</p>
        <button class="btn go big ${!near || s.res.gold < cost ? "off" : ""}" data-a="${this.act(() => g.buyFreedom())}">${ic("seal")} Hürriyetini satın al (${cost} akçe)</button>
        <button class="btn" data-a="${this.act(() => { const n = s.nodes[0]; this.close(); g.cam.flyTo(n.x, n.y, 0.8); })}">Çalışma yerini göster</button>`;
    } else if (this.tab === "pazar") {
      const cap = g.carryCap();
      body = `${nearNote}<div class="stats"><div>${ic("j_caravan")}Yük: <b>${g.cargoUsed()}/${cap}</b></div><div>${ic("merchant")}Ticaret: <b>${g.skill("ticaret")}</b></div><div>${ic("coins")}<b>${fmt(s.res.gold)}</b></div></div>
        <p class="dim">${tr("Malın üretildiği şehirde ucuz, talep edildiği şehirde pahalıdır. Çok alırsan fiyat yükselir, çok satarsan düşer; zamanla eski haline döner.")}</p>
        <div class="odds mid">${g.sea().icon} ${g.sea().name}: ${Object.entries(g.sea().goods).map(([k, m]) => `${GOODS[k as keyof typeof GOODS].name} <b class="${m! > 1 ? "neg" : "cheap"}">${m! > 1 ? "▲" : "▼"}%${Math.round(Math.abs(m! - 1) * 100)}</b>`).join(" · ")}</div>` +
        this.newsHtml(c.id, near) +
        GOOD_KEYS.map((k) => {
          const intel = near ? null : g.intelOf(c.id);
          const known = near || !!intel?.p[k];
          const bp = near ? g.buyPrice(c.id, k) : intel?.p[k]?.[0] ?? 0;
          const sp = near ? g.sellPrice(c.id, k) : intel?.p[k]?.[1] ?? 0;
          const have = s.hero.cargo[k] ?? 0;
          const avg = have > 0 ? Math.round((s.hero.paid[k] ?? 0) / have) : 0;
          const rel = near ? g.price(c.id, k) / GOODS[k].base : bp / g.buyFactor() / GOODS[k].base;
          const em = near ? g.eventMult(c.id, k) : 1;
          const tag = !known ? "" : em > 1.2 ? `<em class="dear">kıtlık!</em>` : em < 0.8 ? `<em class="cheap">bolluk!</em>` : rel < 0.75 ? `<em class="cheap">ucuz</em>` : rel > 1.3 ? `<em class="dear">pahalı</em>` : "";
          const pr = known ? `${near ? "" : "~"}Al ${bp} · ${near ? "" : "~"}Sat ${sp}` : `<span class="dim">${tr("Fiyat bilinmiyor")}</span>`;
          return `<div class="grow">${ic(GOODS[k].icon, "gimg")}<div class="bi2"><b>${GOODS[k].name} ${tag}</b><small>${pr}${have ? ` · Elinde ${have} (ort. ${avg})` : ""}</small></div>
            <div class="col2"><button class="btn sm ${off}" data-a="${this.act(() => g.buyGood(c.id, k, 1))}">Al</button><button class="btn sm ${off}" data-a="${this.act(() => g.buyGood(c.id, k, 5))}">Al 5</button><button class="btn sm ${!near || !have ? "off" : ""}" data-a="${this.act(() => g.sellGood(c.id, k, have))}">Sat</button></div></div>`;
        }).join("") +
        `<h3>Ham madde sat</h3><div class="row">${(["wood", "stone", "food"] as const).map((k) => `<button class="btn ${!near || s.res[k] < 1 ? "off" : ""}" data-a="${this.act(() => g.sellRes(k, s.res[k]))}">${ic(RES_ICON[k])} ${fmt(s.res[k])} sat · ${g.resPrice(k)}/adet</button>`).join("")}</div>`;
    } else if (this.tab === "liman") {
      body = nearNote + this.portHtml(c.id, near);
    } else if (this.tab === "demirci") {
      const items = g.smith(c.id);
      const row = (it: Item, right: string) => this.itemRow(it, right);
      body = `${nearNote}<p class="dim">Demircinin malları iki günde bir yenilenir. Uzak ve büyük şehirlerde daha iyi eşyalar bulunur. Demirci çoğunlukla ${g.cls().name} yoluna uygun mallar ayırır.</p>
        <h3>${ic("anvil")} Satılık</h3>` +
        (items.map((it) => row(it, `<button class="btn sm ${!near || s.res.gold < g.itemBuyPrice(it) ? "off" : ""}" data-a="${this.act(() => g.buyItem(c.id, it.id))}">${ic("coins")}${g.itemBuyPrice(it)}</button>`)).join("") || "<p>Demircide mal kalmadı.</p>") +
        `<h3>${ic("schest")} Heybendeki eşyalar</h3>` +
        (s.hero.bag.map((it) => row(it, `<button class="btn sm ${off}" data-a="${this.act(() => g.sellItem(it.id))}">Sat ${ic("coins")}${g.itemSellPrice(it)}</button>`)).join("") || `<p class="dim">${tr("Heyben boş.")}</p>`);
    } else if (this.tab === "atolye") {
      const zxp = s.hero.skills.zanaat ?? 0;
      const zl = skillLv(zxp);
      const ct = this.craftTier;
      const cl = g.cls();
      const slots = CRAFT_SLOTS.filter((sl) => sl !== "kalkan" || cl.shield);
      const slotName = (sl: Slot) => (sl === "silah" ? cl.weapons.map((w) => WEAPON_NAME[w]).join("/") : sl === "zirh" ? ARMOR_NAME[cl.armor] : SLOT_NAME[sl]);
      body =
        `${nearNote}<p class="dim">Pazardan aldığın malları burada eşyaya, iksire ve Ruh Taşı'na dönüştür. Zanaatın yükseldikçe nadir, destansı ve <b class="r4">efsanevi</b> eşya çıkarma şansın artar.</p>
        <div class="brow">${ic("anvil", "bimg")}<div class="bi2"><b>${SKILL_INFO.zanaat.name} <em>Sv ${zl}</em></b>${bar(zxp - 20 * zl * zl, skillNext(zl) - 20 * zl * zl, "", `${zxp}/${skillNext(zl)}`)}</div></div>
        <h3>${ic("swords")} Eşya dök</h3><div class="row tiers">${[1, 2, 3, 4, 5].map((t) => `<button class="btn sm ${t === ct ? "go" : ""}" data-a="${this.act(() => (this.craftTier = t))}">Kademe ${t}</button>`).join("")}</div>` +
        slots
          .map((sl) => {
            const cost = g.craftCost(gearCost(sl, ct));
            const why = g.craftReason(gearCost(sl, ct), (ct - 1) * 3 + 1);
            return `<div class="grow">${ic(sl === "silah" ? `it_sword_${ct}` : sl === "zirh" ? (cl.armor === "agir" ? `it_armor_${ct}` : `it_light_${ct}`) : sl === "kalkan" ? `it_shield_${ct}` : "tr_star", "gimg")}<div class="bi2"><b>${slotName(sl)} <em>K${ct}</em></b><small>${this.matsHtml(cost)}</small>${why && why !== "Malzeme eksik" ? `<small class="why">${why}</small>` : ""}</div><button class="btn sm ${why ? "off" : ""}" data-a="${this.act(() => g.craftGear(sl, ct))}">Dök</button></div>`;
          })
          .join("") +
        `<h3>${ic("healer")} İksir ve savaş eşyaları</h3>` +
        CONSUMABLES.map((c) => {
          const why = g.craftReason(c.cost, c.lv);
          return `<div class="grow">${ic(c.icon, "gimg")}<div class="bi2"><b>${c.name} <em>${s.cons[c.id] ?? 0} adet</em></b><small>${c.desc}</small><small>${this.matsHtml(g.craftCost(c.cost))}</small>${why && why !== "Malzeme eksik" ? `<small class="why">${why}</small>` : ""}</div><button class="btn sm ${why ? "off" : ""}" data-a="${this.act(() => g.craftCons(c.id))}">Yap</button></div>`;
        }).join("") +
        `<h3>${ic("ruh")} Simya</h3>` +
        REFINES.map((r) => {
          const why = g.craftReason(r.cost);
          return `<div class="grow">${ic(r.icon, "gimg")}<div class="bi2"><b>${r.name}</b><small>${this.matsHtml(g.craftCost(r.cost))}</small></div><button class="btn sm ${why ? "off" : ""}" data-a="${this.act(() => g.refine(r.id))}">Yap</button></div>`;
        }).join("") +
        this.forgeHtml();
    } else if (this.tab === "ors") {
      body = `${nearNote}${ic("anvil", "banner")}<p class="dim">Silah, zırh ve kalkanını +9'a kadar güçlendir. +4'ten sonra başarısızlık eşyayı bir seviye düşürür; +7'den sonra eşya parçalanabilir. Kutsal Parşömen eşyayı korur.</p>
        <div class="stats"><div>${ic("ruh")}Ruh Taşı: <b>${s.mats.ruh}</b></div><div>${ic("parsomen")}Parşömen: <b>${s.mats.parsomen}</b></div><button class="btn sm ${!near || s.res.gold < g.scrollPrice() ? "off" : ""}" data-a="${this.act(() => g.buyScroll())}">Parşömen al ${ic("coins")}${g.scrollPrice()}</button></div>` +
        ([...Object.values(s.hero.equip), ...s.hero.bag].filter((it): it is Item => !!it && canPlus(it)).map((it) => {
          const pc = plusCost(it);
          const p = it.plus ?? 0;
          const risk = p >= 7 ? "kırılabilir" : p >= 4 ? "düşebilir" : "güvenli";
          const why = g.plusReason(it, false);
          const whyP = g.plusReason(it, true);
          return `<div class="grow">${ic(it.icon, "gimg")}<div class="bi2"><b class="r${it.rar}">${it.name}</b><small>+${p} → +${p + 1} · şans %${Math.round(PLUS_CHANCE[p] * 100)} · <span class="${p >= 7 ? "why" : ""}">${risk}</span></small><small>${ic("coins")}${pc.gold}${pc.ruh ? ` · ${ic("ruh")}${pc.ruh}` : ""}</small></div><div class="col2"><button class="btn sm ${why || !near ? "off" : ""}" data-a="${this.act(() => g.upgradeItem(it.id, false))}">Bas</button><button class="btn sm ${whyP || !near ? "off" : ""}" data-a="${this.act(() => g.upgradeItem(it.id, true))}" title="Parşömenle">${ic("parsomen")}</button></div></div>`;
        }).join("") || `<p class="dim">Güçlendirilecek eşyan yok.</p>`);
    } else if (this.tab === "talim") {
      const cost = g.trainCostGold();
      const cl = g.cls();
      const sk = () => {
        const xp = s.hero.skills.silah;
        const lv = skillLv(xp);
        return `<div class="brow">${ic(cl.portrait, "bimg round")}<div class="bi2"><b>${cl.name} talimi · ${SKILL_INFO.silah.name} <em>Sv ${lv}</em></b>${bar(xp - 20 * lv * lv, skillNext(lv) - 20 * lv * lv, "", `${xp}/${skillNext(lv)}`)}<small>${cl.weapons.map((w) => WEAPON_NAME[w]).join(" ve ")} ile çalışırsın. ${STAT_INFO[cl.primary[0]].name} yüksekse daha hızlı öğrenirsin.</small></div>
          <button class="btn ${!near || !s.free || g.act ? "off" : ""}" data-a="${this.act(() => g.trainSkill())}">Talim<br>${ic("coins")}${cost}</button></div>`;
      };
      body = `${nearNote}${ic("arena", "banner")}<p>Talim meydanındaki ustalar parasını verene ders verir. Her talim 6 saniye sürer ve 15 enerji harcar.</p>
        ${!s.free ? `<p class="warn">Köleler talim meydanına giremez.</p>` : ""}
        ${bar(s.hero.energy, g.maxEnergy(), "en", `Enerji ${Math.floor(s.hero.energy)}/${g.maxEnergy()}`)}${sk()}`;
    } else if (this.tab === "han") {
      const room = g.heroCap() - armySize(s.hero.army);
      const hire = (u: Unit) => {
        const k = Math.max(0, Math.min(5, room));
        return `<button class="btn ${!near || k <= 0 || !s.free ? "off" : ""}" data-a="${this.act(() => g.hire(u, k, c.id))}">${ic(UNITS[u].icon)} ${k} ${UNITS[u].name} · ${ic("coins")}${g.eliteCost(c.id, u) * k}${g.eliteCost(c.id, u) < g.hireCost(u) ? ` <em class="cheap">−30%</em>` : ""}</button>`;
      };
      const bl = g.cityBounties(c.id);
      const off2 = g.contractOffer(c.id);
      const kadi = s.wanted
        ? `<h3>${ic("wanted")} Kadı</h3><div class="grow">${ic("wanted", "gimg")}<div class="bi2"><b class="dear">Aranıyorsun ${"★".repeat(s.wanted)}</b><small>Muhafızlar şehir dışında peşine düşer; 3 yıldızda kimse sana iş vermez. Kadıya kefaret ödersen sicilin temizlenir.</small></div><button class="btn sm ${!near || s.res.gold < g.bribeCost() ? "off" : ""}" data-a="${this.act(() => g.bribe())}">Öde ${ic("coins")}${g.bribeCost()}</button></div>`
        : "";
      const rumor = kadi + `<h3>${ic("scroll")} Söylentiler</h3>` + (s.events.map((e) => `<div class="qrow">${ic(GOODS[e.good].icon)} ${e.text}<span class="${e.mult > 1 ? "dear" : "cheap"}">×${e.mult.toFixed(1)}</span></div>`).join("") || `<p class="dim">Kervancılar bu aralar sakin günler geçtiğini söylüyor.</p>`) +
        `<h3>${ic("j_caravan")} Kervan sözleşmesi</h3>` +
        (s.contract
          ? `<div class="odds mid">Elinde bir emanet var: ${s.contract.cargo} → <b>${CITY_NAME[s.contract.to]}</b> · ${dur(s.contract.until - g.now)}</div>`
          : off2
            ? `<div class="grow">${ic("j_caravan", "gimg")}<div class="bi2"><b>${off2.cargo} → ${CITY_NAME[off2.to]}</b><small>Ödül ${off2.gold} altın · Süre ${dur(off2.until * 1000)} · Yolda yağmacılar saldırabilir</small></div><button class="btn sm ${!near || !s.free ? "off" : ""}" data-a="${this.act(() => g.takeContract(c.id))}">Kabul et</button></div>`
            : `<p class="dim">Bugünlük kervan işi kalmadı.</p>`);
      const sr = s.serais[c.id];
      const swhy = g.seraiReason(c.id);
      const serai =
        c.id === CAPITAL.id
          ? ""
          : `<h3>${ic("tug")} ${sr ? `Senin kervansarayın <em>Sv ${sr.lv}</em>` : "Kervansaray kur"}</h3>` +
            (sr
              ? `<div class="brow">${ic("map/serai", "bimg")}<div class="bi2">${bar(sr.coffer, g.seraiCap(c.id), "", `Kasa ${Math.floor(sr.coffer)}/${Math.round(g.seraiCap(c.id))}`)}<small>Dakikada ${g.seraiRate(c.id).toFixed(1)} altın · Ağında ${g.seraiCount()} kervansaray · Bedava konaklama, ticarette %${2 * sr.lv} avantaj</small>${swhy && sr.lv < 3 ? `<small class="why">${swhy}</small>` : ""}</div>${sr.lv < 3 ? `<button class="btn sm ${swhy ? "off" : ""}" data-a="${this.act(() => g.buildSerai(c.id))}">Geliştir<br>${ic("coins")}${g.seraiCost(c.id)}</button>` : ""}</div>`
              : `<div class="brow">${ic("map/serai", "bimg")}<div class="bi2"><b>${CITY_NAME[c.id]} yolunda kendi hanın</b><small>Kasası her dakika altın biriktirir, uğradığında toplarsın. Burada konaklama bedava, emanet teslimine %25 prim. Her yeni kervansaray tüm ağın gelirini %15 artırır.</small>${swhy ? `<small class="why">${swhy}</small>` : ""}</div><button class="btn sm ${swhy || !near ? "off" : ""}" data-a="${this.act(() => g.buildSerai(c.id))}">Kur<br>${ic("coins")}${g.seraiCost(c.id)}</button></div>`);
      body = `${nearNote}<div class="brow">${ic("han", "bimg")}<div class="bi2"><b>Kervansaray odası</b><small>Canını ve enerjini tamamen doldurur.</small></div><button class="btn ${!near || g.act ? "off" : ""}" data-a="${this.act(() => g.rest())}">Uyu ${g.restCost() ? `${ic("coins")}${g.restCost()}` : "· bedava"}</button></div>
        ${this.boardHtml(c.id, near)}${serai}${this.stableHtml(c.id, near)}${this.birdShopHtml(c.id, near)}${rumor}
        <h3>${ic("wanted")} Ödül ilanları</h3>` +
        (bl.map(({ b, i }) => {
          const cp = s.camps[b.camp];
          return `<div class="grow">${ic("j_bandit", "gimg")}<div class="bi2"><b>${cp.name} <em>Sv ${cp.tier}</em></b><small>Ödül: ${b.gold} altın · ${b.renown} şöhret</small></div>${b.taken ? `<button class="btn sm" data-a="${this.act(() => { this.close(); g.cam.flyTo(cp.x, cp.y, 0.8); })}">Göster</button>` : `<button class="btn sm ${!near || !s.free ? "off" : ""}" data-a="${this.act(() => g.takeBounty(i))}">İlanı al</button>`}</div>`;
        }).join("") || `<p class="dim">Şu an ilan yok.</p>`) +
        `<h3>${ic("merc")} Paralı askerler</h3><p class="dim">Askerlerin günlük ücret ister. Altının biterse terk ederler.</p><div class="col">${hire("spear")}${hire("archer")}${hire("horse")}</div>` +
        COMPANIONS.filter((cp) => cp.hire?.city === c.id).map((cp) => {
          const why = g.hireReason(cp);
          return `<h3>${ic("tug")} Handaki yolcu</h3><div class="comp ${g.hasComp(cp.id) ? "on" : ""}"><img src="${assetUrl(cp.icon)}" alt=""><div class="bi2"><b>${cp.name} <em>${cp.role}</em></b><small>${cp.desc}</small><small class="cheap">${cp.perk}</small>${why ? `<small class="why">${why}</small>` : ""}</div>${g.hasComp(cp.id) ? "" : `<button class="btn sm ${why || !near ? "off" : ""}" data-a="${this.act(() => g.hireCompanion(cp.id))}">Yanına al<br>${ic("coins")}${cp.hire!.gold}</button>`}</div>`;
        }).join("");
    } else if (this.tab === "beylik") {
      const bc = g.beylikCost();
      const ok = near && s.renown >= bc.renown && s.res.gold >= bc.gold;
      body = `${ic("fortress", "banner")}<p>Yeterince ün ve servet kazandığında Semerkant'ın dışındaki topraklarda kendi beyliğini kurabilirsin. Beylik; binalar, üretim, kışla ve toplama seferlerini açar.</p>
        ${bar(s.renown, bc.renown, "", `Şöhret ${s.renown}/${bc.renown}`)}${bar(s.res.gold, bc.gold, "", `Altın ${fmt(s.res.gold)}/${bc.gold}`)}
        <button class="btn go big ${ok ? "" : "off"}" data-a="${this.act(() => g.foundBeylik())}">${ic("crown")} Beyliği kur</button>
        <p class="dim">Şöhret; haramileri yenerek, kampları yıkarak ve ödül ilanlarını tamamlayarak kazanılır.</p>`;
    } else if (this.tab === "kale") {
      body = nearNote + this.kaleHtml(c.id, near);
    } else body = this.beylikTabs();
    const fac = FACTIONS[factionOf(c.id)];
    const facTag = s.owned[c.id]
      ? `<span class="ftag" style="--fc:#ffd36a">Senin şehrin · ${fac.name} sınırında</span>`
      : `<span class="ftag" style="--fc:${g.hostile(c.id) ? "#ff6a5a" : fac.color}">${fac.name} · ${g.hostile(c.id) ? "Düşman" : REP_RANKS[g.cityRank(c.id)].name}</span>`;
    const sub = (isCap && s.beylik ? `Beyliğinin merkezi · Saray Sv ${g.bld("saray")} · ` : isCap && !s.free ? "Efendinin şehri · " : "") + facTag;
    return this.frame(g.cityName(ci), sub, assetUrl("cities/" + c.id), this.sagaBox(c.id, near) + tabs + body);
  }

  private kaleHtml(city: string, near: boolean): string {
    const g = this.g;
    const s = g.s;
    const o = s.owned[city];
    const fac = FACTIONS[factionOf(city)];
    if (!o) {
      const why = g.siegeReason(city);
      const gar = g.cityGar(city);
      const wall = g.siegeWall(city);
      const od = g.siegeOdds(city);
      const ocls = od > 0.7 ? "good" : od > 0.4 ? "mid" : "bad";
      return `<div class="brow">${ic("siege", "bimg")}<div class="bi2"><b>${CITY_NAME[city]} surları</b><small>${fac.name} garnizonu şehri korur. Surlar savunmaya güç katar; mancınıklar bu üstünlüğü kırar. Kuşatma ${fac.name} ile aranı derinden bozar.</small></div></div>
        <div class="stats">${UNIT_KEYS.map((u) => `<div>${ic(UNITS[u].icon)}${UNITS[u].name}: <b>${gar[u]}</b></div>`).join("")}<div>${ic("fortress")}Sur: <b>+%${Math.round(wall * 100)}</b></div></div>
        <div class="grow">${ic("siege", "gimg")}<div class="bi2"><b>Mancınık <em>${s.engines}/3</em></b><small>Her biri sur bonusunu %10 düşürür. Bir kuşatmada harcanır.</small></div><button class="btn sm ${s.engines >= 3 || s.res.gold < ENGINE_GOLD_UI ? "off" : ""}" data-a="${this.act(() => g.buyEngine())}">Kur<br>${ic("coins")}${ENGINE_GOLD_UI}</button></div>
        <p class="dim">Kuşatmaya birliğinle birlikte beyliğinin kışla garnizonu da katılır: <b>${armySize(s.hero.army)}</b> + <b>${armySize(s.garrison)}</b> asker. Sağ kalanlar kışlaya döner.</p>
        ${(() => {
          const hp = g.seferHelp(city);
          return hp ? `<div class="odds good">${ic("tug")} Ortak sefer: <b>${hp.r.name} ${hp.r.title}</b> ${armySize(hp.a)} askerle yanında yürüyor!</div>` : "";
        })()}
        <div class="odds ${ocls}">Zafer ihtimali: <b>%${Math.round(od * 100)}</b></div>
        ${why ? `<p class="why">${why}</p>` : ""}
        <button class="btn go big ${why || !near ? "off" : ""}" data-a="${this.act(() => { this.close(); g.besiege(city); })}">${ic("swords")} Kuşat</button>`;
    }
    const loyCls = o.loy < 25 ? "hp" : "";
    const garRow = (u: Unit) => `<div class="grow">${ic(UNITS[u].icon, "gimg")}<div class="bi2"><b>${UNITS[u].name}</b><small>Garnizon ${o.gar[u]} · Yanında ${s.hero.army[u]}</small></div><button class="btn sm ${!near || s.hero.army[u] <= 0 ? "off" : ""}" data-a="${this.act(() => g.garMove(city, u, 10))}">+10</button><button class="btn sm ${!near || o.gar[u] <= 0 ? "off" : ""}" data-a="${this.act(() => g.garMove(city, u, -10))}">−10</button></div>`;
    return `<div class="brow">${ic("crown", "bimg")}<div class="bi2"><b>${CITY_NAME[city]} senin</b><small>${o.since}. günden beri tuğun burçlarda dalgalanıyor. Vergi kasası dolar, uğradığında toplarsın. Bağlılık düşerse halk ayaklanır; ${FACTIONS[o.from].name} şehri geri almak için ordu gönderir.</small></div></div>
      ${bar(o.loy, 100, loyCls, `Bağlılık ${Math.floor(o.loy)}/100`)}
      ${bar(o.coffer, g.ownCap(city), "", `Kasa ${Math.floor(o.coffer)}/${Math.round(g.ownCap(city))} · dakikada ${g.ownRate(city).toFixed(1)}`)}
      <button class="btn go ${!near || o.coffer < 1 ? "off" : ""}" data-a="${this.act(() => g.collectCity(city))}">${ic("coins")} Vergiyi topla</button>
      <h3>${ic("scroll")} Vergi oranı</h3><div class="row">${TAX_UI.map((t, i) => `<button class="btn sm ${o.tax === i ? "go" : ""}" data-a="${this.act(() => g.setTax(city, i as 0 | 1 | 2))}">${t.name} ×${t.mult}</button>`).join("")}</div>
      <p class="dim">Hafif vergi bağlılığı artırır, ağır vergi kasayı hızla doldurur ama halkı kızdırır. Garnizon da bağlılığı destekler.</p>
      <button class="btn ${s.res.gold < FEAST_GOLD_UI ? "off" : ""}" data-a="${this.act(() => g.feast(city))}">${ic("food")} Şölen ver (+25 bağlılık) · ${ic("coins")}${FEAST_GOLD_UI}</button>
      <h3>${ic("tug")} Garnizon <em>${armySize(o.gar)} · savunma +%${Math.round(g.cityDefense(city) * 100)}</em></h3>${UNIT_KEYS.map(garRow).join("")}
      ${this.cityMgmtHtml(city)}`;
  }

  private cityMgmtHtml(city: string): string {
    const g = this.g;
    const s = g.s;
    const o = s.owned[city]!;
    const ev = g.cityEv(city);
    const evHtml = ev
      ? `<div class="grow cev ${ev.good ? "good" : "bad"}">${ic(ev.icon, "gimg")}<div class="bi2"><b>${ev.name} <em>· ${Math.max(0, o.ev!.until - g.dayOf().day + 1)} gün</em></b><small>${ev.text}</small><small class="${ev.good ? "cheap" : "neg"}">Vergi ×${ev.tax} · bağlılık ${ev.loy > 0 ? "+" : ""}${ev.loy}/dk</small></div>${ev.fix ? `<button class="btn sm go" data-a="${this.act(() => g.fixCityEv(city))}">${ev.fix.label}<br>${ev.fix.gold ? `${ic("coins")}${ev.fix.gold}` : ""}${ev.fix.food ? `${ic("food")}${ev.fix.food}` : ""}</button>` : ""}</div>`
      : "";
    const blds = CITY_BLD_KEYS.map((b) => {
      const B = CITY_BLDS[b];
      const lv = g.cbl(city, b);
      const max = lv >= B.max;
      const c = cityBldCost(b, lv);
      const can = s.res.gold >= c.gold && s.res.stone >= c.stone;
      return `<div class="grow">${ic(B.icon, "gimg")}<div class="bi2"><b>${B.name} <em>${lv}/${B.max}</em></b><small>${B.desc(Math.max(1, lv + (max ? 0 : 1)))}</small></div>${max ? `<em class="cheap">Tamam</em>` : `<button class="btn sm ${can ? "go" : "off"}" data-a="${this.act(() => g.buildCity(city, b))}">Kur<br>${ic("coins")}${c.gold} ${ic("stone")}${c.stone}</button>`}</div>`;
    }).join("");
    const cur = g.cityGov(city);
    const govs = GOVERNORS.map((gv) => {
      const here = cur?.id === gv.id;
      const where = Object.entries(s.owned).find(([, x]) => x.gov === gv.id)?.[0];
      return `<div class="grow ${here ? "pick" : ""}">${ic(gv.icon, "gimg round")}<div class="bi2"><b>${gv.name} <em>${gv.role}</em></b><small>${gv.desc}</small>${where && !here ? `<small class="dim">Şu an ${CITY_NAME[where]} valisi</small>` : ""}</div>${here ? `<em class="cheap">Vali</em>` : `<button class="btn sm ${s.res.gold >= GOV_GOLD ? "" : "off"}" data-a="${this.act(() => g.appointGov(city, gv.id))}">Ata<br>${ic("coins")}${GOV_GOLD}</button>`}</div>`;
    }).join("");
    return `${evHtml}<h3>${ic("fortress")} Şehir yapıları</h3>${blds}<h3>${ic("crown")} Vali</h3><p class="dim">Her vali yalnızca bir şehri yönetir. Başka şehre atarsan eski görevinden ayrılır.</p>${govs}`;
  }

  private sagaBox(cityId: string, near: boolean): string {
    const g = this.g;
    const ch = g.chapter();
    if (!ch || ch.city !== cityId || !ch.scene || !g.s.free) return "";
    const why = ch.req?.(g);
    const btns = why
      ? `<p class="why">${why}</p>`
      : !near
        ? `<p class="why">Şehre gitmelisin.</p>`
        : `<div class="row">${ch.scene.choices.map((c) => {
            const w = c.why?.(g);
            return `<button class="btn ${w ? "off" : "go"}" title="${w ?? ""}" data-a="${this.act(() => c.run(g))}">${c.label}</button>`;
          }).join("")}</div>`;
    const more = why ? "" : `<button class="more" data-a="${this.act(() => (this.sagaOpen = !this.sagaOpen))}">${this.sagaOpen ? "Kısalt" : "Hikâyenin devamı…"}</button>`;
    return `<div class="saga-box ${this.sagaOpen ? "open" : ""}"><img src="${assetUrl(ch.scene.img)}" alt=""><div><h3>Destan · ${ch.title}</h3><p class="st">${why ? ch.goal : ch.scene.text(g)}</p>${more}${btns}</div></div>`;
  }

  private beylikTabs(): string {
    const g = this.g;
    const s = g.s;
    if (this.tab === "bina") {
      const cur = g.building();
      return `<p class="dim">Aynı anda tek bina geliştirilebilir. Diğer binalar Saray seviyesini geçemez.</p>` + BUILDINGS.map((b) => {
        const st = s.buildings[b.id];
        const next = st.lv + 1;
        const why = g.upgradeReason(b.id);
        const prod = b.produces ? `<small>${ic(RES_ICON[b.produces])} ${prodPerMin(b, st.lv)}/dk → ${prodPerMin(b, next)}/dk</small>` : `<small>${b.desc}</small>`;
        const whyHtml = why && !st.until && why !== "Bir inşaat sürüyor" ? `<small class="why">${why}</small>` : "";
        const right = st.until
          ? `<div class="timer">${bar(buildTime(next) * 1000 - (st.until - g.now), buildTime(next) * 1000, "", dur(st.until - g.now))}</div>`
          : `<div class="bcost">${costHtml(buildCost(b, next), g)}<small>⏱ ${dur(buildTime(next) * 1000)}</small></div><button class="btn ${why ? "off" : ""}" data-a="${this.act(() => g.upgrade(b.id))}">${st.lv === 0 ? "İnşa et" : "Geliştir"}</button>`;
        return `<div class="brow ${cur === b.id ? "busy" : ""}">${ic(b.icon, "bimg")}<div class="bi2"><b>${b.name} <em>Sv ${st.lv}</em></b>${prod}${whyHtml}</div>${right}</div>`;
      }).join("");
    }
    if (this.tab === "kisla") {
      const kl = g.bld("kisla");
      return `<div class="stats"><div>${ic("soldier")}Garnizon: <b>${armySize(s.garrison)}</b></div><div>Kuyruk: <b>${s.queue.length}/3</b></div></div>` + UNIT_KEYS.map((u) => {
        const ok = unitUnlocked(u, kl);
        const d = UNITS[u];
        const btn = (n: number) => `<button class="btn ${!ok || s.queue.length >= 3 || !g.canAfford(g.trainCost(u, n)) ? "off" : ""}" data-a="${this.act(() => g.train(u, n) && this.toast(`${n} ${d.name} eğitime başladı`, "info"))}">+${n}</button>`;
        return `<div class="brow">${ic(d.icon, "bimg")}<div class="bi2"><b>${d.name}</b><small>Can ${d.hp} · Saldırı ${d.atk} · ${UNITS[d.beats].name} karşısında güçlü</small><div class="bcost">${costHtml(g.trainCost(u, 1), g)}<small>/asker</small></div></div>${ok ? `<div class="col2">${btn(5)}${btn(10)}${btn(25)}</div>` : `<div class="lockd">${ic("lock")}Kışla Sv ${u === "archer" ? 2 : 4}</div>`}</div>`;
      }).join("") + s.queue.map((o, i) => `<div class="qrow">${ic(UNITS[o.unit].icon)} ${o.n} ${UNITS[o.unit].name}<span>${i === 0 ? dur(o.done - g.now) : "sırada"}</span></div>`).join("");
    }
    if (this.tab === "ordu") {
      const at = g.atCapital();
      const room = g.heroCap() - armySize(s.hero.army);
      return `<p class="dim">${at ? "Askerleri garnizon ile birliğin arasında aktar." : "Asker aktarmak için başkentte olmalısın."}</p>
        <div class="stats"><div>${ic("tug")}Birlik: <b>${armySize(s.hero.army)}/${g.heroCap()}</b></div><div>${ic("food")}Garnizon gideri: <b>${g.upkeepPerMin().toFixed(0)}/dk</b></div></div>` + UNIT_KEYS.map((u) => `
        <div class="brow">${ic(UNITS[u].icon, "bimg")}<div class="bi2"><b>${UNITS[u].name}</b><small>Garnizon ${s.garrison[u]} · Birlik ${s.hero.army[u]}</small></div>
        <div class="col2"><button class="btn ${!at || s.hero.army[u] <= 0 ? "off" : ""}" data-a="${this.act(() => g.transfer(u, -10))}">◀ 10</button><button class="btn ${!at || s.garrison[u] <= 0 || room <= 0 ? "off" : ""}" data-a="${this.act(() => g.transfer(u, 10))}">10 ▶</button></div></div>`).join("");
    }
    return `<div class="stats"><div>${ic("j_caravan")}Sefer hakkı: <b>${s.marches.length}/${g.marchSlots()}</b></div></div><p class="dim">Haritadaki bir kaynak noktasına dokunarak toplama seferi gönder.</p>` +
      (s.marches.map((m) => {
        const n = s.nodes[m.node];
        const st = m.phase === "go" ? "Yolda" : m.phase === "gather" ? `Topluyor · ${dur(m.until - g.now)}` : `Dönüyor · ${fmt(m.load)} yük`;
        return `<div class="qrow">${ic(RES_ICON[n.kind])} ${NODE_NAME[n.kind]} · ${armySize(m.army)} asker<span>${st}</span></div>`;
      }).join("") || `<p>Şu an sefer yok.</p>`);
  }

  private directorHtml(): string {
    const g = this.g;
    const d = g.dir();
    const p = PERSONAS[d.p];
    const cards = PERSONA_KEYS.map((k) => {
      const x = PERSONAS[k];
      return `<div class="persona ${k === d.p ? "on" : ""}" data-a="${this.act(() => g.setPersona(k))}">${ic(x.icon)}<b>${t(x.name)}</b><small>${t(x.desc)}</small></div>`;
    }).join("");
    const log = d.log.slice(0, 4).map((l) => `<li class="${l.bad ? "dear" : "cheap"}">${l.d}. gün · ${l.t}</li>`).join("");
    return `<h3>${ic(p.icon)} ${t("Hikâye Anlatıcısı")}</h3>
      <p class="dim">${t("Anlatıcı destanının temposunu belirler: işler fazla yolunda giderse bela gönderir, zor anında yardım eli uzatabilir.")}</p>
      <div class="personas">${cards}</div>
      ${bar(d.t, p.limit, "en", `${t("Gerilim")} ${d.t.toFixed(1)}/${p.limit}`)}
      ${log ? `<ul class="runs">${log}</ul>` : ""}`;
  }

  private settingsHtml(): string {
    const g = this.g;
    const cur = curSlot();
    const pct = (v: number) => Math.round(v * 100);
    const toggle = (k: "eco" | "mini" | "haptic" | "narrate" | "dynMusic", label: string, note = "") =>
      `<div class="setrow"><span>${label}</span><button class="btn sm ${settings[k] ? "on" : ""}" data-a="${this.act(() => {
        settings[k] = !settings[k];
        saveSettings();
        applyUi();
        if (note) this.toast(note, "good");
      })}">${settings[k] ? t("Açık") : t("Kapalı")}</button></div>`;
    const slots = Array.from({ length: SAVE_SLOTS }, (_, i) => {
      const inf = slotInfo(i);
      const cl = inf?.cls ? CLASSES.find((c) => c.id === inf.cls) : null;
      const when = inf?.at ? new Date(inf.at).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
      const btn = i === cur
        ? `<em class="cheap">${t("Aktif")}</em>`
        : `<button class="btn sm ${inf ? "go" : ""}" data-a="${this.act(() => g.switchSlot(i))}">${inf ? t("Yükle") : t("Yeni oyun")}</button>`;
      return `<div class="sslot ${i === cur ? "cur" : ""}">${ic("scroll")}<div><b>${t("Yuva")} ${i + 1}${inf ? ` · ${inf.name}` : ""}</b><small>${inf ? `${cl?.name ?? "Köle"} · Sv ${inf.lv} · ${ic("crown")}${inf.renown} · ${ic("coins")}${fmt(inf.gold)}${inf.owned ? ` · ${inf.owned} şehir` : ""}${when ? ` · ${when}` : ""}` : t("Boş yuva")}</small></div>${btn}</div>`;
    }).join("");
    return `${this.directorHtml()}<h3>${lang() === "tr" ? "Dil · Language" : "Language · Dil"}</h3>
      <div class="setrow">${(Object.keys(LANGS) as Lang[]).map((l) => `<button class="btn sm ${lang() === l ? "on" : ""}" data-a="${this.act(() => {
        if (lang() === l) return;
        settings.lang = l;
        saveSettings();
        g.saveNow();
        location.reload();
      })}">${LANGS[l]}</button>`).join("")}</div>
      <p class="dim">${t("Dil değişikliği sayfa yenilenince tamamlanır.")}</p>
      <h3>${t("Ses")}</h3>
      <div class="setrow"><span>${t("Müzik")}</span><input type="range" min="0" max="100" value="${pct(settings.music)}" data-set="music"><b data-so="music">${pct(settings.music)}</b></div>
      <div class="setrow"><span>${t("Efektler")}</span><input type="range" min="0" max="100" value="${pct(settings.fx)}" data-set="fx"><b data-so="fx">${pct(settings.fx)}</b></div>
      ${toggle("dynMusic", t("Dinamik müzik"))}
      <p class="dim">${t("Müzik savaşta kösle hızlanır, şehirde def ve zille çarşıya döner, harami yaklaşınca tedirgin bir nabız atar, Kıpçak bozkırında hömeye kayar.")}</p>
      ${canNarrate() ? `${toggle("narrate", t("Anlatıcı"))}<p class="dim">${t("Hikâye ekranları açılınca anlatıcı sesli okur; her ekrandaki düğmeyle tek tek de dinleyebilirsin.")}</p>` : `<div class="setrow"><span>${t("Anlatıcı")}</span><em class="dim">${t("Bu cihazda bu dil için ses yok")}</em></div>`}
      <h3>${t("Görüntü")}</h3>
      <div class="setrow"><span>${t("Arayüz boyutu")}</span>${[0.85, 1, 1.15, 1.3].map((v) => `<button class="btn sm ${settings.ui === v ? "on" : ""}" data-a="${this.act(() => {
        settings.ui = v;
        saveSettings();
        applyUi();
      })}">%${pct(v)}</button>`).join("")}</div>
      <div class="setrow"><span>${t("Tam ekran")}</span><button class="btn sm ${document.fullscreenElement ? "on" : ""}" data-a="${this.act(() => toggleFullscreen())}">${document.fullscreenElement ? t("Açık") : t("Kapalı")}</button><small class="dim">F11 / F</small></div>
      <div class="setrow"><span>${t("Fotoğraf modu")}</span><button class="btn sm" data-a="${this.act(() => this.openPhoto())}">${ic("scroll")} ${t("Aç")}</button><small class="dim">P</small></div>
      ${toggle("mini", t("Mini harita"))}
      ${toggle("eco", t("Pil tasarrufu"), "Pil tasarrufu sayfa yenilenince devreye girer (30 FPS, düşük çözünürlük).")}
      ${"vibrate" in navigator ? toggle("haptic", t("Titreşim")) : ""}
      <h3>${t("Kayıt yuvaları")}</h3>
      <p class="dim">${t("Oyun her birkaç saniyede bir etkin yuvaya kaydedilir. Yuva değiştirince mevcut oyunun kaydedilir ve sayfa yeniden yüklenir.")}</p>
      ${slots}
      <div class="setrow"><button class="btn sm" data-a="${this.act(() => this.exportFile())}">${ic("scroll")} ${t("Dışa aktar")}</button><button class="btn sm" data-a="${this.act(() => this.importFile())}">${ic("chest")} ${t("İçe aktar")}</button></div>
      ${this.steamHtml()}
      ${this.modsHtml()}
      <h3>${t("Klavye kısayolları")}</h3>
      <p class="dim keys">${t("<kbd>H</kbd> Kahraman · <kbd>C</kbd> Semerkant · <kbd>Boşluk</kbd> Birliğine dön · <kbd>B</kbd> Kuşu uçur · <kbd>M</kbd> Ses · <kbd>F</kbd> Tam ekran · <kbd>WASD</kbd>/<kbd>Oklar</kbd> Kamera · <kbd>+</kbd>/<kbd>−</kbd> Yakınlaş · <kbd>T</kbd> Oyun hızı · <kbd>P</kbd> Fotoğraf modu · <kbd>Esc</kbd> Kapat / Menü")}</p>
      <h3>${t("Oyun kolu")}</h3>
      <p class="dim keys">${t("<kbd>Sol çubuk</kbd> Kamera / seçim · <kbd>A</kbd> Nişangâha git, seç · <kbd>B</kbd> Kapat · <kbd>Y</kbd> Birliğine dön · <kbd>X</kbd> Kuşu uçur · <kbd>LB</kbd>/<kbd>RB</kbd> Yakınlaş, sekme · <kbd>LT</kbd>/<kbd>RT</kbd> Yakınlaş · <kbd>Start</kbd> Kahraman · <kbd>Back</kbd> Menü")}</p>
      ${this.achHtml()}
      ${this.legacyHtml()}
      <button class="btn sm red reset" data-a="${this.act(() => confirm("Bu yuvadaki tüm ilerlemen silinip yeni bir oyun başlayacak. Emin misin?") && g.resetGame())}">${t("Bu yuvada yeni oyun başlat")}</button>`;
  }

  private steamHtml(): string {
    if (!steam) return onDeck ? `<h3>Steam Deck</h3><p class="dim">${t("Steam Deck algılandı: arayüz büyütüldü, oyun kolu kısayolları etkin.")}</p>` : "";
    const cloud = cloudReady();
    return `<h3>${ic("seal")} Steam${onDeck ? " Deck" : ""}</h3>
      <div class="setrow"><span>${t("Hesap")}</span><b>${steam.name() || "—"}</b></div>
      <div class="setrow"><span>${t("Bulut kaydı")}</span><em class="${cloud ? "good" : "dim"}">${cloud ? t("Açık") : t("Kapalı (Steam ayarı)")}</em>${cloud ? `<button class="btn sm" data-a="${this.act(() => {
        this.g.saveNow();
        const ok = cloudPush(true);
        this.toast(ok ? t("Kayıtlar Steam Bulut'a yüklendi.") : t("Steam Bulut'a yüklenemedi."), ok ? "good" : "bad");
      })}">${t("Şimdi yedekle")}</button>` : ""}</div>
      <p class="dim">${t("Başarımlar, kayıt yuvaları ve efsane ocağı Steam Bulut ile cihazlar arasında taşınır; açılışta en yeni kayıt seçilir.")}</p>`;
  }

  bitigOpen = "";

  private bitigHtml(): string {
    const got = new Set(this.g.s.bitig ?? []);
    const cats = (Object.keys(CODEX_CATS) as CodexCat[]).map((c) => {
      const list = CODEX.filter((e) => e.cat === c);
      const rows = list.map((e) => {
        if (!got.has(e.id)) return `<div class="cxrow lock">${ic("lock", "gimg")}<div class="bi2"><b>? ? ?</b><small class="dim">${t("İpucu")}: ${e.hint}</small></div></div>`;
        const open = this.bitigOpen === e.id;
        return `<div class="cxrow ${open ? "open" : ""}" data-a="${this.act(() => (this.bitigOpen = open ? "" : e.id))}">${ic(e.icon, "gimg")}<div class="bi2"><b>${codexTitle(e)}</b>${open ? `<p>${codexText(e)}</p>` : `<small class="dim">${codexText(e).slice(0, 70)}…</small>`}</div></div>`;
      }).join("");
      const n = list.filter((e) => got.has(e.id)).length;
      const cat = CODEX_CATS[c];
      return `<h3>${ic(cat.icon)} ${lang() === "en" ? cat.en : cat.name} <em class="dim">${n}/${list.length}</em></h3>${rows}`;
    }).join("");
    return `<p class="dim">${t("Bitig, yolculuğunda öğrendiklerini kaydeder. Yeni yerler gördükçe, yeni işler yaptıkça sayfalar dolar.")} <b>${got.size}/${CODEX.length}</b></p>${cats}`;
  }

  private achHtml(): string {
    const g = this.g;
    const n = ACHIEVEMENTS.filter((a) => g.achDone(a.id)).length;
    return `<h3>${ic("trophy")} ${t("Başarımlar")} <em class="dim">${n}/${ACHIEVEMENTS.length}</em></h3><div class="achs">${ACHIEVEMENTS.map((a) => `<div class="ach ${g.achDone(a.id) ? "on" : ""}" title="${a.desc}">${ic(a.icon)}<b>${a.name}</b><small>${a.desc}</small></div>`).join("")}</div>`;
  }

  private otagHtml(): string {
    const g = this.g;
    const o = g.s.otag;
    const why = g.otagReason();
    const here = zoneOf(g.s.hero.y, H);
    const status = o ? `<div class="stats"><div>${ic("map/yurts")}${ZONE_NAME[zoneOf(o.y, H)]}</div><div>${ic("foal")}Sürü <b>${o.herd}</b></div><div>${ic("food")}+${g.otagYield().food}/gün</div></div>` : `<p class="dim">Göçebe bir otağ kur: sürün otlakta büyür, yiyecek ve atlı gönüllü verir. Yazın kuzeydeki yaylaklara, kışın güneydeki kışlaklara göç et.</p>`;
    return `<h3>${ic("map/yurts")} Otağ</h3>${status}
      <button class="btn ${why ? "off" : "go"}" title="${why}" data-a="${this.act(() => g.pitchOtag())}">${o ? `Otağı buraya göçür (${ZONE_NAME[here]} · ${MOVE_FOOD} yiyecek)` : `Otağı buraya kur (${OTAG_GOLD} altın, ${OTAG_WOOD} kereste)`}</button>${why ? `<small class="why">${why}</small>` : ""}
      ${o ? `<button class="btn sm" data-a="${this.act(() => { this.close(); g.cam.flyTo(o.x, o.y, 0.8); })}">Otağı göster</button>` : ""}`;
  }

  private divanHtml(): string {
    const g = this.g, en = lang() === "en";
    const btn = (why: string, label: string, fn: () => void, cls = "") => `<button class="btn sm ${cls} ${why ? "off" : ""}" title="${why}" data-a="${this.act(fn)}">${label}</button>`;
    const cards = FACTION_KEYS.map((f) => {
      const fac = FACTIONS[f], d = g.dip(f);
      const tags = [
        g.pact(f, "peace") ? `<span class="good">${t("Saldırmazlık")} ${g.pact(f, "peace")}${t("g")}</span>` : "",
        g.pact(f, "trade") ? `<span class="cheap">${t("Ticaret")} ${g.pact(f, "trade")}${t("g")}</span>` : "",
        g.pact(f, "intel") ? `<span class="cheap">${t("İstihbarat")} ${g.pact(f, "intel")}${t("g")}</span>` : "",
      ].filter(Boolean).join(" · ");
      const spy = d.spy ?? 0;
      return `<div class="dipc" style="--fc:${fac.color}">
        <div class="mycvh">${ic(fac.icon, "gimg")}<div class="bi2"><b>${fac.name} <em>${fac.ruler}</em></b><small>${t("İtibar")} <b>${Math.round(g.rep(f))}</b> · ${t("Casus ağı")} ${"●".repeat(spy)}<i class="dim">${"●".repeat(SPY_MAX - spy)}</i></small>${tags ? `<small>${tags}</small>` : ""}</div></div>
        <div class="row">
          ${btn(g.dipReason(f, "gift"), `${t("Armağan")} · ${GIFT_GOLD}`, () => g.sendGift(f))}
          ${btn(g.dipReason(f, "peace"), `${t("Saldırmazlık")} · ${PEACE_GOLD}`, () => g.signPact(f, "peace"))}
          ${btn(g.dipReason(f, "trade"), `${t("Ticaret anlaşması")} · ${TRADE_GOLD}`, () => g.signPact(f, "trade"))}
          ${btn(g.dipReason(f, "spy"), `${t("Casus")} +1 · ${spyCost(spy)}`, () => g.hireSpy(f))}
        </div>
        ${spy ? `<div class="row">${SPY_OPS.map((o) => btn(g.spyReason(f, o.id), en ? o.en[0] : o.name, () => g.spyOp(f, o.id), "go")).join("")}</div>` : ""}
      </div>`;
    }).join("");
    return `<h3>${ic("scroll")} ${t("Divan")}</h3><p class="dim">${t("Elçilerin hükümdarlara armağan götürür, antlaşmalar imzalar. Saldırmazlık antı o devletin karşı saldırılarını durdurur; bozarsan kutun söner. Ticaret antı pazarlarında fiyatları iyileştirir. Casusların haber toplar, ambar yakar, hazine soyar ama yakalanabilirler.")}</p>
      <div class="dipops">${SPY_OPS.map((o) => `<small><b>${en ? o.en[0] : o.name}</b> (${t("ağ")} ${o.lv}+): ${en ? o.en[1] : o.desc}</small>`).join("")}</div>${cards}`;
  }

  private myCvHtml(): string {
    const g = this.g, s = g.s;
    const list = g.myCvs();
    const ci = g.nearCity();
    const here = ci >= 0 ? CITIES[ci].id : "";
    const why = here ? g.myCvReason(here) : t("Kervan kurmak için bir şehre git");
    const total = list.reduce((a, c) => a + c.profit, 0);
    const goodOpts = (sel: Good | null, from: string, to: string) => `<option value="">${t("— boş —")}</option>` + GOOD_KEYS.map((k) => {
      const m = g.cvMargin(from, to, k);
      return `<option value="${k}" ${k === sel ? "selected" : ""}>${GOODS[k].name} (${m >= 0 ? "+" : ""}${m})</option>`;
    }).join("");
    const cards = list.map((c) => {
      const days = g.myCvDays(c);
      const a = c.dir === 1 ? c.from : c.to, b = c.dir === 1 ? c.to : c.from;
      const gd = c.dir === 1 ? c.go : c.back;
      const prog = c.status === "bekle" ? t("Yük bekliyor") : `${CITY_NAME[a]} → ${CITY_NAME[b]} · ${c.cargo ? `${c.cargo} ${gd ? GOODS[gd].name : ""}` : t("boş")}`;
      return `<div class="mycv">
        <div class="mycvh">${ic("j_caravan", "gimg")}<div class="bi2"><b>${c.name} <em>${c.trips} ${t("sefer")} · ${c.profit >= 0 ? "+" : ""}${c.profit} ${t("altın")}</em></b><small>${t("Yük")} ${c.cap} · ${t("Muhafız")} ${c.guards}/${MYCV_GUARD_MAX} · ${days.toFixed(1)} ${t("gün")}</small></div></div>
        ${bar(c.t * 100, 100, "", prog)}
        <div class="mycvr"><label>${CITY_NAME[c.from]} →</label><select data-cv="${c.id}:to">${CITIES.filter((x) => x.id !== c.from).map((x) => `<option value="${x.id}" ${x.id === c.to ? "selected" : ""}>${CITY_NAME[x.id]}</option>`).join("")}</select></div>
        <div class="mycvr"><label>${t("Gidiş yükü")}</label><select data-cv="${c.id}:go">${goodOpts(c.go, c.from, c.to)}</select></div>
        <div class="mycvr"><label>${t("Dönüş yükü")}</label><select data-cv="${c.id}:back">${goodOpts(c.back, c.to, c.from)}</select></div>
        <div class="row">
          <button class="btn sm ${c.guards >= MYCV_GUARD_MAX || s.res.gold < MYCV_GUARD ? "off" : ""}" data-a="${this.act(() => g.guardMyCv(c.id))}">${t("Muhafız")} +1 · ${MYCV_GUARD}</button>
          <button class="btn sm ${c.cap >= 48 || s.res.gold < MYCV_UPGRADE ? "off" : ""}" data-a="${this.act(() => g.upgradeMyCv(c.id))}">${t("Deve")} +10 · ${MYCV_UPGRADE}</button>
          <button class="btn sm bad" data-a="${this.act(() => g.sellMyCv(c.id))}">${t("Sat")}</button>
        </div>
        ${c.log.length ? `<ul class="cvlog">${c.log.map((l) => `<li>${l}</li>`).join("")}</ul>` : ""}
      </div>`;
    }).join("");
    return `<h3>${ic("j_caravan")} ${t("Kervan Kumpanyası")} <small class="dim">${list.length}/${g.myCvMax()} · ${total >= 0 ? "+" : ""}${total} ${t("altın")}</small></h3>
      <p class="dim">${t("Kendi kervanların iki şehir arasında kendiliğinden alıp satar. Fiyat farkı parantezde: gidişte bir malı ucuza alıp varışta pahalıya sat. Uzun ve korumasız yollar haramilere açıktır; muhafız tut. Her kervansaray bir kervan hakkı daha verir.")}</p>
      ${cards}
      <div class="grow">${ic("j_caravan", "gimg")}<div class="bi2"><b>${t("Yeni kervan")} <em>${MYCV_COST} ${t("altın")}</em></b><small class="${why ? "dim" : "cheap"}">${why || `${CITY_NAME[here]}: ${t("hazır")}`}</small></div><button class="btn sm go ${why ? "off" : ""}" data-a="${this.act(() => g.buyMyCaravan(here))}">${t("Kervan kur")}</button></div>`;
  }

  private yugHtml(): string {
    const g = this.g, s = g.s, en = lang() === "en";
    const un = g.unmourned();
    const foes = s.foes ?? [];
    const raised = foes.filter((f) => f.raised);
    if (!un.length && !foes.length && !(s.fallen ?? []).length) return `<h3>${ic("tug")} ${t("Yuğ ve Balbal")}</h3><p class="dim">${t("Savaşta düşen gaziler için yuğ töreni tutulur. Öldürdüğün can düşmanları, beyler ve efsanevi düşmanlar için kurganına balbal dikebilirsin.")}</p>`;
    const c = yugCost(un.length);
    const why = g.yugReason();
    const yug = un.length
      ? `<div class="grow">${ic("tug", "gimg")}<div class="bi2"><b>${t("Yuğ töreni")} <em>${un.length} ${t("gazi")}</em></b><small>${un.map((f) => `${f.name}${f.warned ? " ⚠" : ""}`).join(", ")}</small><small class="${why ? "dim" : "cheap"}">${why || `${c.food} ${t("yiyecek")} · ${c.gold} ${t("altın")} · ${t("3 savaş +%5 güç, kut")}`}</small></div><button class="btn sm go ${why ? "off" : ""}" data-a="${this.act(() => g.holdYug())}">${t("Yas tut")}</button></div>`
      : `<p class="dim">${t("Bütün gazilerin yası tutuldu.")} (${(s.fallen ?? []).length})</p>`;
    const stones = raised.length ? `<div class="balbals">${raised.map((f) => `<div class="balbal" title="${f.name}"><i></i><small>${f.name.split(" ").slice(-1)[0]}</small></div>`).join("")}</div>` : "";
    const rows = foes.map((f, i) => (f.raised ? "" : `<div class="grow sm">${ic(f.kind === "boss" ? "trophy" : f.kind === "rival" ? "lord_bey" : "j_bandit", "gimg")}<div class="bi2"><b>${f.name} <em>${FOE_KIND[f.kind][en ? 1 : 0]}</em></b><small class="dim">${g.balbalReason(f) || `${BALBAL_STONE} ${t("taş")} · ${BALBAL_GOLD} ${t("altın")}`}</small></div><button class="btn sm go ${g.balbalReason(f) ? "off" : ""}" data-a="${this.act(() => g.raiseBalbal(i))}">${t("Balbal dik")}</button></div>`)).join("");
    return `<h3>${ic("tug")} ${t("Yuğ ve Balbal")}</h3>${yug}
      <h3>${ic("stone")} ${t("Kurgan")} <small class="dim">${raised.length}/${BALBAL_MAX} · ${t("ordu")} +${(balbalBonus(foes) * 100).toFixed(1)}%</small></h3>${stones}${rows}`;
  }

  private kutHtml(): string {
    const s = this.g.s;
    const k = s.kut ?? 50;
    const tier = kutTier(k);
    const pct = (x: number): string => `${x >= 0 ? "+" : ""}${Math.round(x * 100)}%`;
    const left = Math.max(0, (s.tore?.next ?? 0) - this.g.dayOf().day);
    return `<h3>${ic("crown")} ${t("Kut ve Töre")} <em class="${k >= 45 ? "cheap" : "dear"}">${tier.name}</em></h3>
      ${bar(k, 100, "kut", `Kut ${Math.round(k)}/100`)}
      <p class="dim">${tier.desc}</p>
      <div class="stats"><div>${ic("tug")}Ordu <b>${pct(kutArmy(k))}</b></div><div>${ic("lord_bey")}Kurultay oyu <b>${pct(kutVote(k))}</b></div><div>${ic("scroll")}Davalar <b>${s.c.tore ?? 0}</b></div></div>
      <small class="dim">Kut; zaferle, adil hükümle, şölen ve fetihle artar. Yenilgi, soygun, ağır vergi ve kaybedilen şehirle söner. ${left ? `Sıradaki töre davası ~${left} gün sonra.` : "Yakında bir töre davası gelecek."} Kademeler: ${KUT_TIERS.map((x) => x.name).join(" · ")}</small>`;
  }

  archery: Archery | null = null;

  openArchery(mode: ArchMode = "kabak"): void {
    const g = this.g;
    if (this.archery || this.minigame || this.modal() || g.battleLock) return;
    if (mode === "surek" && !g.surekStart()) return;
    this.close();
    g.battleLock = true;
    const el = document.createElement("div");
    el.className = "archery";
    const hint = mode === "surek" ? t("Hedefe dokun ya da <kbd>Boşluk</kbd> · geyik 25 · domuz 30 · kurt 20 · kaplan 120 (3 ok) · 40 saniye") : t("Hedefe dokun ya da <kbd>Boşluk</kbd> · kabak 10 · kurt 20 · kartal 35 · art arda isabet çarpan verir");
    el.innerHTML = `<canvas></canvas><div class="ahud"></div><div class="ahint">${hint}</div><button class="btn sm aclose">${t("Bırak")}</button><div class="aresult"></div>`;
    this.root.appendChild(el);
    const hudEl = el.querySelector(".ahud") as HTMLElement;
    const res = el.querySelector(".aresult") as HTMLElement;
    let tick = 0;
    const key = (e: KeyboardEvent): void => {
      if (e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        this.archery?.shootAuto();
      } else if (e.code === "Escape") {
        e.stopImmediatePropagation();
        finish();
      }
    };
    const finish = (): void => {
      clearInterval(tick);
      window.removeEventListener("keydown", key, true);
      this.archery?.stop();
      this.archery = null;
      el.remove();
      g.battleLock = false;
    };
    const game: Archery = new Archery(el.querySelector("canvas")!, (score, hits) => {
      audio.play(score >= 150 ? "level" : "quest");
      if (mode === "surek") {
        const note = g.surekReward(score, game.kills);
        const k = game.kills;
        res.innerHTML = `<div class="bbox"><h2>${t("Sürek avı bitti")}</h2><p><b>${score}</b> ${t("puan")} · ${t("geyik")} ${k.geyik ?? 0} · ${t("domuz")} ${k.domuz ?? 0} · ${t("kurt")} ${k.kurt ?? 0} · ${t("kaplan")} ${k.kaplan ?? 0}</p><p>${note}</p><div class="row"><button class="btn go quit">${t("Kapat")}</button></div></div>`;
      } else {
        const note = g.archeryReward(score, hits);
        res.innerHTML = `<div class="bbox"><h2>${t("Kabak Atma bitti")}</h2><p><b>${score}</b> ${t("puan")} · ${hits} ${t("isabet")}<br>${t("En iyi")}: <b>${g.s.ok.best}</b></p><p>${note}</p><div class="row"><button class="btn go again">${t("Tekrar")}</button><button class="btn quit">${t("Kapat")}</button></div></div>`;
      }
      res.classList.add("on");
      res.querySelector(".again")?.addEventListener("click", () => { finish(); this.openArchery(); });
      res.querySelector(".quit")!.addEventListener("click", finish);
    }, mode);
    this.archery = game;
    tick = window.setInterval(() => {
      const h = game.hud();
      hudEl.innerHTML = `<span>${ic("u_archer")} ${h.arrows}</span><span>⏱ ${h.time.toFixed(1)}</span><span>${ic("trophy")} ${h.score}</span>${h.combo >= 3 ? `<span class="cheap">Kombo ×${1 + Math.min(4, Math.floor(h.combo / 3)) * 0.5}</span>` : ""}`;
    }, 100);
    window.addEventListener("keydown", key, true);
    el.querySelector(".aclose")!.addEventListener("click", finish);
  }

  minigame: { press(): void; stop(): void; move?(d: number): void } | null = null;

  openMini(kind: "wr" | "kb"): void {
    const g = this.g;
    if (this.archery || this.minigame || this.modal() || g.battleLock) return;
    this.close();
    g.battleLock = true;
    const el = document.createElement("div");
    el.className = `archery mini-${kind}`;
    const foe = g.wrestleFoe();
    const hint = kind === "wr"
      ? t("İbre yeşildeyken dokun ya da <kbd>Boşluk</kbd> · kırmızı ! çıkınca hemen karşı koy · rakibi sırtüstü yere ser")
      : t("Üst/alt yarıya dokun ya da <kbd>↑</kbd>/<kbd>↓</kbd> · <kbd>Boşluk</kbd> en güvenli kulvara kaçar · oğlağı kazana ulaştır");
    el.innerHTML = `<canvas></canvas><div class="ahud"></div><div class="ahint">${hint}</div><button class="btn sm aclose">${t("Bırak")}</button><div class="aresult"></div>`;
    this.root.appendChild(el);
    const hudEl = el.querySelector(".ahud") as HTMLElement;
    const res = el.querySelector(".aresult") as HTMLElement;
    let tick = 0;
    const key = (e: KeyboardEvent): void => {
      if (e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        this.minigame?.press();
      } else if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        e.stopPropagation();
        this.minigame?.move?.(-1);
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        e.stopPropagation();
        this.minigame?.move?.(1);
      } else if (e.code === "Escape") {
        e.stopImmediatePropagation();
        finish();
      }
    };
    const finish = (): void => {
      clearInterval(tick);
      window.removeEventListener("keydown", key, true);
      this.minigame?.stop();
      this.minigame = null;
      el.remove();
      g.battleLock = false;
    };
    const result = (title: string, body: string, note: string, again: boolean): void => {
      res.innerHTML = `<div class="bbox"><h2>${title}</h2><p>${body}</p><p>${note}</p><div class="row">${again ? `<button class="btn go again">${t("Devam")}</button>` : ""}<button class="btn quit">${t("Kapat")}</button></div></div>`;
      res.classList.add("on");
      res.querySelector(".again")?.addEventListener("click", () => { finish(); this.openMini(kind); });
      res.querySelector(".quit")!.addEventListener("click", finish);
    };
    const cv = el.querySelector("canvas")!;
    if (kind === "wr") {
      const open = g.wrestleOpen();
      const w = new Wrestle(cv, foe, g.stat("guc") + g.stat("day") * 0.5, (win, bal, perfect) => {
        const note = g.wrestleReward(win, perfect);
        audio.play(win ? "level" : "quest");
        const more = win && open && foe.round < 2;
        result(win ? t("Zafer!") : t("Yenildin"), `${foe.name} · ${bal > 0 ? "+" : ""}${bal} · ${t("kusursuz")} ${perfect}`, note, more);
      });
      this.minigame = w;
      tick = window.setInterval(() => {
        const h = w.hud();
        hudEl.innerHTML = `<span>${ic("trophy")} ${foe.round + 1}/3 · ${foe.name}</span><span>⏱ ${h.time.toFixed(1)}</span><span>${t("Denge")} ${h.bal > 0 ? "+" : ""}${h.bal}</span>`;
      }, 100);
    } else {
      const k = new KokBoru(cv, g.stat("cev") + g.skill("silah") * 0.5, (goals) => {
        const note = g.kokboruReward(goals);
        audio.play(goals >= 3 ? "level" : "quest");
        result(t("Kökbörü bitti"), `<b>${goals}</b> ${t("gol")} · ${t("En iyi")}: <b>${g.s.games?.kbBest ?? 0}</b>`, note, true);
      });
      this.minigame = { press: () => k.dodge(), stop: () => k.stop(), move: (d) => k.move(d) };
      tick = window.setInterval(() => {
        const h = k.hud();
        hudEl.innerHTML = `<span>${ic("trophy")} ${h.goals}</span><span>⏱ ${h.time.toFixed(1)}</span><span>${Math.round(h.progress * 100)}%</span>`;
      }, 100);
    }
    window.addEventListener("keydown", key, true);
    el.querySelector(".aclose")!.addEventListener("click", finish);
  }

  private gamesHtml(): string {
    const g = this.g;
    const paid = g.archeryPaid();
    const toy = g.toyDay();
    const foe = g.wrestleFoe();
    const wo = g.wrestleOpen(), ko = g.kokboruOpen();
    const st = (ok: boolean) => `<small class="${ok ? "cheap" : "dim"}">${ok ? t("Bugünün ödülü hazır") : t("Bugün ödül alındı · antrenman")}`;
    return `<h3>${ic("u_archer")} ${t("Bozkır Oyunları")}</h3>
      ${toy ? `<div class="odds good">${ic("tug")} <b>${t("Toy günü!")}</b> ${t("Bugün bütün oyunların ödülü iki katı.")}</div>` : `<p class="dim">${t("Her 7 günde bir Toy kurulur; o gün ödüller iki katıdır.")}</p>`}
      <div class="grow">${ic("u_cavalry", "gimg")}<div class="bi2"><b>${t("Kabak Atma")} <em>${t("atlı okçuluk")}</em></b><small>${t("Dörtnala giderken kabakları, kurtları ve kartalları vur. 30 saniye, 20 ok.")}</small>${st(paid)} · ${t("Rekor")}: ${g.s.ok?.best ?? 0}</small></div><button class="btn sm go" data-a="${this.act(() => this.openArchery())}">${t("Oyna")}</button></div>
      <div class="grow">${ic("tr_wolf", "gimg")}<div class="bi2"><b>${t("Sürek Avı")} <em>${t("ordu talimi")}</em></b><small>${t("Askerlerinle ormanı çevirip geyik, domuz, kurt ve kaplan avla. Yiyecek ve deri getirir; iyi bir av orduyu 3 savaş boyunca güçlendirir.")}</small><small class="${g.surekReason() ? "dim" : "cheap"}">${g.surekReason() || `${t("Hazır")} · ${SUREK_FOOD} ${t("yiyecek")}`}</small></div><button class="btn sm go ${g.surekReason() ? "off" : ""}" data-a="${this.act(() => this.openArchery("surek"))}">${t("Ava çık")}</button></div>
      <div class="grow">${ic("arena", "gimg")}<div class="bi2"><b>${t("Kuşak Güreşi")} <em>${t("üç pehlivan")}</em></b><small>${t("Zamanlamayla kuşaktan çek, rakibin hamlesine karşı koy. Üç pehlivanı art arda yenen baş pehlivan olur.")}</small><small class="${wo ? "cheap" : "dim"}">${wo ? `${t("Sıradaki rakip")}: ${foe.name} (${foe.round + 1}/3)` : t("Meydan bugün kapandı · antrenman")} · ${t("Baş pehlivan")}: ${g.s.games?.champ ?? 0}</small></div><button class="btn sm go" data-a="${this.act(() => this.openMini("wr"))}">${t("Oyna")}</button></div>
      <div class="grow">${ic("u_cavalry", "gimg")}<div class="bi2"><b>${t("Kökbörü")} <em>${t("oğlak kapma")}</em></b><small>${t("Oğlağı kap, rakip atlılardan sıyrılarak kazana ulaştır. 40 saniye.")}</small>${st(ko)} · ${t("Rekor")}: ${g.s.games?.kbBest ?? 0}</small></div><button class="btn sm go" data-a="${this.act(() => this.openMini("kb"))}">${t("Oyna")}</button></div>`;
  }

  private korkutHtml(): string {
    const g = this.g;
    const s = g.s;
    const cur = g.boyStep();
    const done = s.boysDone ?? [];
    const rows = BOYS.map((b) => {
      const isCur = cur?.b.id === b.id;
      const fin = done.includes(b.id);
      const why = g.boyReason(b);
      const btn = isCur
        ? `<button class="btn sm go" data-a="${this.act(() => { this.close(); const at = s.boy!.at!; g.cam.flyTo(at.x, at.y, 0.8); })}">${t("Bul")}</button>`
        : fin ? `<em class="cheap">✓</em>` : `<button class="btn sm ${why ? "off" : "go"}" title="${why}" data-a="${this.act(() => g.boyStart(b.id))}">${t("Dinle")}</button>`;
      const sub = isCur ? `<small class="cheap">Adım ${cur!.n + 1}/${b.steps.length}: ${cur!.st.place} (${CITY_NAME[cur!.st.near]} yakınları)</small>` : fin ? `<small class="dim">Destan tamamlandı</small>` : `<small class="dim">${b.lv}. seviye${why && why !== "Dede Korkut şehir hanlarında anlatır" ? ` · ${why}` : ""}</small>`;
      return `<div class="grow ${fin ? "dim" : ""}">${ic(b.icon, "gimg")}<div class="bi2"><b>${b.name}</b>${sub}</div>${btn}</div>`;
    }).join("");
    return `<h3>${ic("scroll")} ${t("Dede Korkut Boyları")} <em class="dim">${done.length}/${BOYS.length}</em></h3><p class="dim">Dede Korkut şehir hanlarında Oğuz destanlarını anlatır. Dinlediğin boyu kendi kılıcınla yeniden yaz.</p>${rows}`;
  }

  private familyHtml(): string {
    const g = this.g;
    const f = g.family();
    const day = g.dayOf().day;
    if (!f.spouse) return `<h3>${ic("lord_bey")} ${t("Hanedan")}</h3><p class="dim">Bir hanedan kur: dostluğu 40'ı geçen bir beyle karşılaşınca kızı için dünürcü gönder. Dünürün ittifakı asla bozmaz; doğan oğulların ordunda sancak taşır.</p>`;
    const from = g.s.rivals.find((r) => r.id === f.spouse!.from);
    const kids = f.kids.map((k) => `<div class="qrow">${ic(k.son ? "u_spear" : "healer")} ${k.name} <span>${k.son ? "oğul" : "kız"} · ${kidAge(k, day) || "<1"} yaşında${k.son && kidAge(k, day) >= 1 ? " · sancak taşır" : ""}</span></div>`).join("");
    return `<h3>${ic("lord_bey")} ${t("Hanedan")} <em class="cheap">+%${Math.round(g.famBonus() * 100)} ordu · +%3 müttefik</em></h3>
      <div class="grow">${ic("healer", "gimg")}<div class="bi2"><b>${f.spouse.name} Hatun</b><small>${from ? `${from.name} ${from.title} kızı · dünürün` : "Eşin"}</small></div></div>
      ${kids || `<p class="dim">Henüz çocuğun yok. Tengri bir varis bağışlasın.</p>`}`;
  }

  private ozanHtml(): string {
    const g = this.g;
    const s = g.s;
    const tg: Tamga = { ...TAMGA_DEFAULT, ...s.tamga };
    const chips = (part: keyof Tamga, opts: [string, string][]): string =>
      `<div class="tchips">${opts.map(([id, label]) => `<button class="tchip ${tg[part] === id ? "on" : ""}" data-a="${this.act(() => g.setTamga(part, id))}">${label}</button>`).join("")}</div>`;
    const songs = s.songs ?? [];
    const why = g.singReason();
    const list = songs.slice(0, this.allSongs ? songs.length : 2).map((sg) => `<div class="song"><b>${sg.title}</b> <small class="dim">${sg.d}. gün</small><i class="poem">${sg.lines.join("<br>")}</i></div>`).join("");
    return `<h3>${ic("scroll")} ${t("Tamga ve Destan Defteri")}</h3>
      <div class="tamgaed">${tamgaSvg(tg, 84)}<div>
        ${chips("shape", Object.keys(TAMGA_SHAPES).map((id) => [id, tamgaSvg({ ...tg, shape: id }, 26)]))}
        ${chips("mark", Object.entries(TAMGA_MARKS).map(([id, x]) => [id, x.name]))}
        ${chips("color", Object.keys(TAMGA_COLORS).map((id) => [id, `<span class="tdot" style="background:${TAMGA_COLORS[id]}"></span>`]))}
      </div></div>
      <p class="dim">Boyunun tamgası sancağında dalgalanır. Büyük işlerin ozanların dilinde destana dönüşür; şehir hanlarında okutursan şöhretin yayılır.</p>
      ${list || `<p class="dim">Henüz hakkında türkü yakılmadı. Bir bey yen, bir şehir fethet, bir kan davası kapat...</p>`}
      ${songs.length > 2 ? `<button class="btn sm" data-a="${this.act(() => { this.allSongs = !this.allSongs; this.render(); })}">${this.allSongs ? "Daha az" : `Bütün destanlar (${songs.length})`}</button>` : ""}
      <button class="btn ${why ? "off" : "go"}" title="${why}" data-a="${this.act(() => g.singSongs())}">Handa destanını okut (${SING_GOLD} altın · +${singRenown(songs.length)} şöhret)</button>${why ? `<small class="why">${why}</small>` : ""}`;
  }

  private vetsHtml(): string {
    const vets = this.g.s.vets ?? [];
    if (!vets.length) return `<h3>${ic("tug")} Gaziler</h3><p class="dim">Kazandığın savaşlarda saflardan yiğitler öne çıkar. Gaziler savaştıkça rütbe alır ve bütün birliğe güç verir (en fazla ${VET_MAX}).</p>`;
    const icon: Record<string, string> = { spear: "u_spear", archer: "u_archer", horse: "u_cavalry" };
    return `<h3>${ic("tug")} Gaziler (${vets.length}/${VET_MAX}) <em class="cheap">+%${Math.round(vetBonus(vets) * 100)} güç</em></h3>` +
      vets.map((v) => `<div class="grow vet">${ic(icon[v.u], "gimg")}<div class="bi2"><b>${vetTitle(v)} <em>${VET_RANKS[v.lv - 1]}</em></b><small>${"★".repeat(v.lv)}${"☆".repeat(VET_LV_MAX - v.lv)} · ${v.kills} düşman · ${v.day}. günden beri${v.scar ? " · yaralı" : ""}</small></div></div>`).join("");
  }

  private legacyHtml(): string {
    const l = legacy();
    const cards = ENDINGS.map((e) => {
      const on = l.endings.includes(e.id);
      const p = LEGACY_PERKS[e.id];
      return `<div class="ach ${on ? "on" : ""}" title="${on ? p.desc : "Henüz görülmedi"}">${ic(e.img)}<b>${on ? e.name : "???"}</b><small>${on ? `${p.name}: ${p.desc}` : "Bu sonu gör, mirası aç."}</small></div>`;
    }).join("");
    const runs = l.runs.slice(0, 5).map((r) => `<li><b>${r.name}</b> · ${endingOf(r.ending)?.name ?? r.ending} · Sv ${r.lv} · ${r.day}. gün</li>`).join("");
    return `<h3>${ic("scroll")} ${t("Miras")} <em class="dim">${l.endings.length}/${ENDINGS.length} ${t("son")}</em></h3>
      <p class="dim">Gök Tengri Destanı'nın her sonu, sonraki bütün destanlarında geçerli kalıcı bir miras açar.</p>
      <div class="achs">${cards}</div>${runs ? `<ul class="runs">${runs}</ul>` : ""}`;
  }

  private exportFile(): void {
    this.g.saveNow();
    const raw = exportSave();
    if (!raw) return this.toast("Kaydedilecek bir oyun yok.", "bad");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
    a.download = `kervan-krallik-yuva${curSlot() + 1}-${this.g.s.hero.name}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    this.toast("Kayıt dosyası indirildi.", "good");
  }

  private importFile(): void {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json,application/json";
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return;
      const text = await f.text();
      if (!confirm(`Yuva ${curSlot() + 1} içindeki oyunun yerine bu kayıt yüklenecek. Emin misin?`)) return;
      if (!this.g.importText(text)) this.toast("Bu dosya geçerli bir Kervan Krallık kaydı değil.", "bad");
    };
    inp.click();
  }

  private modFile(): void {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json,application/json";
    inp.multiple = true;
    inp.onchange = async () => {
      let ok = 0;
      for (const f of Array.from(inp.files ?? [])) {
        const err = storeMod(f.name, await f.text());
        if (err) this.toast(`${f.name}: ${tr(err)}`, "bad");
        else ok++;
      }
      if (ok) {
        this.toast(tr("{n} mod eklendi. Etkinleşmesi için oyunu yeniden yükle.", { n: ok }), "good");
        this.render();
      }
    };
    inp.click();
  }

  private modsHtml(): string {
    const local = new Set(storedMods().map((m) => m.file));
    const rows = loadedMods.map((m) => {
      const errs = m.errors.length ? `<small class="why">${m.errors.length} ${tr("uyarı")}: ${m.errors.slice(0, 3).join(" · ")}</small>` : "";
      const meta = [m.version && `v${m.version}`, m.author, m.on ? `${m.changes} ${tr("değişiklik")}` : tr("kapalı")].filter(Boolean).join(" · ");
      return `<div class="sslot ${m.on ? "cur" : ""}">${ic("scroll")}<div><b>${m.name}</b><small>${meta}</small>${errs}</div><button class="btn sm ${m.on ? "on" : ""}" data-a="${this.act(() => {
        toggleMod(m.id);
        this.toast(tr("Değişiklik oyunu yeniden yükleyince geçerli olur."), "info");
      })}">${m.on ? t("Açık") : t("Kapalı")}</button>${local.has(m.file) ? `<button class="btn sm red" data-a="${this.act(() => {
        removeMod(m.file);
        this.toast(tr("Mod kaldırıldı. Yeniden yükleyince silinir."), "info");
        this.render();
      })}">✕</button>` : ""}</div>`;
    }).join("");
    const pending = storedMods().filter((f) => !loadedMods.some((m) => m.file === f.file)).map((f) => `<div class="sslot">${ic("scroll")}<div><b>${f.file}</b><small>${tr("yeniden yükleyince etkinleşir")}</small></div></div>`).join("");
    return `<h3>${ic("scroll")} ${tr("Modlar")} <em class="dim">${loadedMods.filter((m) => m.on).length}/${loadedMods.length}</em></h3>
      <p class="dim">${tr("Modlar JSON dosyalarıdır: mal fiyatlarını, birlikleri, binaları, şehir adlarını, metinleri değiştirebilir; Bitig'e yeni sayfa ve yeni haftalık temalar ekleyebilir.")}${modBridge ? ` ${tr("Klasör")}: <code>${modBridge.dir}</code>` : ""}</p>
      ${rows}${pending}
      <div class="setrow">${modBridge ? `<button class="btn sm" data-a="${this.act(() => modBridge!.open())}">${ic("chest")} ${tr("Mod klasörünü aç")}</button>` : ""}<button class="btn sm" data-a="${this.act(() => this.modFile())}">${ic("scroll")} ${tr("Mod ekle (.json)")}</button><button class="btn sm go" data-a="${this.act(() => {
        this.g.saveNow();
        location.reload();
      })}">${tr("Yeniden yükle")}</button></div>`;
  }

  private heroHtml(): string {
    const g = this.g;
    const s = g.s;
    const h = s.hero;
    const need = xpNeed(h.lv);
    const tabs = this.tabs([["karakter", t("Karakter")], ["beceri", `${t("Beceriler")}${h.spts ? ` (${h.spts})` : ""}`], ["yetenek", `${t("Yetenekler")}${h.tpts ? ` (${h.tpts})` : ""}`], ["techizat", `${t("Teçhizat")}${h.bag.length ? ` (${h.bag.length})` : ""}`], ["ordu", t("Birlik")], ...(s.free ? ([["unvan", `${t("Hedefler")}${g.dailyClaimable() ? " ●" : ""}`], ["kervan", t("Kervanlar")], ["divan", t("Divan")]] as [string, string][]) : []), ["bitig", "Bitig"], ["ayar", "⚙"]]);
    let body = "";
    if (this.tab === "karakter") {
      const cl = g.cls();
      body = `<div class="clsrow" style="--cc:${cl.color}">${ic(cl.portrait, "gimg round")}<div class="bi2"><b>${cl.name} <em>${cl.role}</em></b><small>${cl.passive}</small><small class="dim">${cl.weapons.map((w) => WEAPON_NAME[w]).join(", ")} · ${ARMOR_NAME[cl.armor]}${cl.shield ? ` · ${t("Kalkan")}` : ""}</small>${s.origin ? `<small class="cheap">${ic(ORIGIN_BY_ID[s.origin].icon)} ${lang() === "en" ? ORIGIN_BY_ID[s.origin].en[0] : ORIGIN_BY_ID[s.origin].name}: ${lang() === "en" ? ORIGIN_BY_ID[s.origin].en[2] : ORIGIN_BY_ID[s.origin].perk}</small>` : ""}</div></div>
        ${bar(h.xp, need, "", `${t("Seviye")} ${h.lv} · ${h.xp}/${need} ${t("TP")}`)}
        ${h.points > 0 ? `<div class="odds good">${t("Dağıtılacak <b>{n}</b> stat puanın var! ★ işaretliler {c} için ana özelliklerdir.", { n: h.points, c: cl.name })}</div>` : ""}
        <h3>${t("Özellikler")}</h3>` +
        STAT_KEYS.map((k) => {
          const bonus = g.stat(k) - h.stats[k];
          const prim = cl.primary.includes(k);
          return `<div class="srow ${prim ? "prim" : ""}">${ic(STAT_INFO[k].icon, "gimg")}<div class="bi2"><b>${prim ? "★ " : ""}${STAT_INFO[k].name} <em>${h.stats[k]}${bonus ? ` +${bonus}` : ""}</em></b><small>${STAT_INFO[k].desc}</small></div><button class="btn sm plus ${h.points > 0 ? "" : "off"}" data-a="${this.act(() => g.statUp(k))}">+</button></div>`;
        }).join("") +
        `<h3>${t("Savaş")}</h3><div class="stats"><div>${ic("swords")}${t("Saldırı")} <b>${g.heroAtk().toFixed(1)}</b></div><div>${ic("shield")}${t("Savunma")} <b>${g.heroDef().toFixed(1)}</b></div><div>${t("Can")} <b>${Math.floor(h.hp)}/${g.maxHp()}</b></div><div>${t("Enerji")} <b>${Math.floor(h.energy)}/${g.maxEnergy()}</b></div><div>${ic("tug")}${t("Birlik sınırı")} <b>${g.heroCap()}</b></div><div>${ic("j_caravan")}${t("Yük")} <b>${g.carryCap()}</b></div><div>${ic("crown")}${t("Şöhret")} <b>${s.renown}</b></div></div>
        <h3>${t("Beceriler")}</h3>` +
        SKILL_KEYS.map((k) => {
          const xp = h.skills[k];
          const lv = skillLv(xp);
          return `<div class="srow">${ic(SKILL_INFO[k].icon, "gimg")}<div class="bi2"><b>${SKILL_INFO[k].name} <em>${t("Sv")} ${lv}</em></b>${bar(xp - 20 * lv * lv, skillNext(lv) - 20 * lv * lv, "", `${xp}/${skillNext(lv)}`)}<small>${SKILL_INFO[k].desc}</small></div></div>`;
        }).join("") +
        (s.free ? this.repHtml() : "") +
        this.chronHtml() +
        (g.seraiCount()
          ? `<h3>${ic("map/serai")} ${t("Kervansarayların · dakikada {n} altın", { n: g.seraiIncome().toFixed(1) })}</h3>` +
            Object.entries(s.serais)
              .map(([id, sr]) => `<div class="qrow">${CITY_NAME[id]} <em>${t("Sv")} ${sr.lv}</em><span class="cheap">${t("kasa")} ${Math.floor(sr.coffer)}/${Math.round(g.seraiCap(id))}</span></div>`)
              .join("")
          : "") +
        `<button class="btn sm red reset" data-a="${this.act(() => confirm(t("Tüm ilerlemen silinip yeni bir oyun başlayacak. Emin misin?")) && g.resetGame())}">${t("Yeni oyun başlat")}</button>`;
    } else if (this.tab === "yetenek") {
      const spentAll = Object.values(h.tal).reduce((a, b) => a + b, 0);
      body =
        `<p class="dim">${t("Her seviyede 1 yetenek puanı kazanırsın. Bir dalın alt sırasını açmak için o dala sıra başına {n} puan harcamalısın. Kendi yolunu seç: üç dalı birden bitiremezsin.", { n: ROW_NEED })}</p>
        <div class="stats"><div>${ic("scroll")}${t("Yetenek puanı")}: <b>${h.tpts}</b></div>${spentAll ? `<button class="btn sm ${s.res.gold < g.respecCost() ? "off" : ""}" data-a="${this.act(() => g.respecTalents())}">${t("Sıfırla")} ${ic("coins")}${g.respecCost()}</button>` : ""}</div><div class="tree">` +
        BRANCH_KEYS.map((b) => {
          const B = BRANCHES[b];
          const spent = branchSpent(h.tal, b);
          return `<div class="tb" style="--bc:${B.color}"><div class="tbh">${ic(B.icon)}<b>${B.name}</b><small>${spent} ${t("puan")}</small></div>${[0, 1, 2, 3, 4]
            .map((row) => {
              const open = spent >= row * ROW_NEED;
              return `<div class="trow ${open ? "" : "shut"}">${TALENTS.filter((t) => t.branch === b && t.row === row)
                .map((t) => {
                  const r = g.tal(t.id);
                  const why = g.talentReason(t);
                  const st = r >= t.max ? "max" : !open ? "lock" : why ? (r ? "own" : "idle") : "can";
                  return `<button class="tnode ${st}" data-a="${this.act(() => g.learnTalent(t.id))}">${ic(t.icon)}<b>${t.name}</b><i>${r}/${t.max}</i><small>${t.text(Math.max(1, r))}</small></button>`;
                })
                .join("")}</div>`;
            })
            .join("")}</div>`;
        }).join("") +
        `</div>`;
    } else if (this.tab === "beceri") {
      const cl = g.cls();
      body = `<p class="dim">${t("{c} becerileri savaşta kendiliğinden devreye girer. 3. seviyeden itibaren her seviyede 1 beceri puanı kazanırsın. Bir beceri en fazla {n}. seviyeye (Usta) çıkar.", { c: cl.name, n: SKILL_MAX })}</p>
        <div class="stats"><div>${ic("scroll")}${t("Beceri puanı")}: <b>${h.spts}</b></div></div>` +
        g.classSkills().map((sk) => {
          const lv = g.skillLvOf(sk.id);
          const why = g.learnReason(sk);
          const cur = lv > 0 ? sk.text(skillPow(sk, lv)) : `${t("Açılınca")}: ${sk.text(skillPow(sk, 1))}`;
          const next = lv > 0 && lv < SKILL_MAX ? `<small class="dim">${t("Sonraki seviye")}: ${sk.text(skillPow(sk, lv + 1))}</small>` : "";
          return `<div class="brow skill ${lv ? "" : "locked"}">${ic(sk.icon, "bimg")}<div class="bi2"><b>${sk.name} <em>${skillRank(lv)}</em></b><small>${cur}</small>${next}${why && why !== "Beceri puanın yok" ? `<small class="why">${why}</small>` : ""}</div><button class="btn sm plus ${why ? "off" : ""}" data-a="${this.act(() => g.learn(sk.id))}">+</button></div>`;
        }).join("");
    } else if (this.tab === "ayar") {
      body = this.settingsHtml();
    } else if (this.tab === "bitig") {
      body = this.bitigHtml();
    } else if (this.tab === "kervan") {
      body = this.myCvHtml();
    } else if (this.tab === "divan") {
      body = this.divanHtml();
    } else if (this.tab === "unvan") {
      body = (s.free ? this.weeklyHtml() : "") + this.dailyHtml() + (s.beylik ? this.kutHtml() + this.familyHtml() : "") + (s.free ? this.korkutHtml() + this.gamesHtml() + this.yugHtml() + this.ozanHtml() : "") + this.kurultayHtml() + this.rivalsHtml() + this.nemesisHtml() + this.titlesHtml();
    } else if (this.tab === "techizat") {
      const inCity = g.nearCity() >= 0;
      body = `<div class="slots">` + SLOTS.map((sl) => {
        const it = h.equip[sl];
        return `<div class="slot ${it ? "r" + it.rar : ""} ${it?.set || it?.uq ? "leg" : ""}" ${it?.set ? `style="--sc:${SETS[it.set].color}"` : ""} ${it ? `data-a="${this.act(() => g.unequip(sl))}" title="${t("Çıkar")}"` : ""}>${it ? ic(it.icon, "simg2") : `<span class="empty">${SLOT_NAME[sl]}</span>`}<small>${it ? it.name : t("Boş")}</small></div>`;
      }).join("") + `</div><p class="dim">${t("Kuşanılmış bir eşyaya dokunarak çıkarabilirsin. Eşyaları şehirlerde satabilirsin.")}</p>` + this.setsHtml() +
        (CONSUMABLES.some((c) => s.cons[c.id]) || Object.keys(s.buffs).length
          ? `<h3>${ic("healer")} ${t("Çanta")}</h3>` +
            (Object.keys(s.buffs).length ? `<div class="odds good">${t("Etkin")}: ${Object.entries(s.buffs).map(([k, n]) => `${CONS_BY_ID[k]?.name ?? (k === "surek" ? t("Sürek avı talimi") : k === "yug" ? t("Yuğ") : k)} (${n} ${t("savaş")})`).join(" · ")}</div>` : "") +
            CONSUMABLES.filter((c) => s.cons[c.id]).map((c) => `<div class="grow">${ic(c.icon, "gimg")}<div class="bi2"><b>${c.name} <em>×${s.cons[c.id]}</em></b><small>${c.desc}</small></div><button class="btn sm go" data-a="${this.act(() => g.useCons(c.id))}">${t("Kullan")}</button></div>`).join("")
          : "") +
        `<h3>${ic("schest")} ${t("Heybe")}</h3>` +
        (h.bag.map((it) => {
          const cur = h.equip[it.slot];
          const better = !cur || it.atk + it.def + it.hp / 3 + it.spd * 50 + it.lid + it.kar > cur.atk + cur.def + cur.hp / 3 + cur.spd * 50 + cur.lid + cur.kar;
          const ok = !g.canUse(it);
          return this.itemRow(it, `<div class="col2">${ok && better ? `<em class="cheap">▲</em>` : ""}<button class="btn sm ${ok ? "" : "off"}" data-a="${this.act(() => g.equip(it.id))}">${t("Kuşan")}</button>${inCity ? `<button class="btn sm" data-a="${this.act(() => g.sellItem(it.id))}">${g.itemSellPrice(it)}</button>` : ""}</div>`);
        }).join("") || `<p class="dim">${t("Heyben boş. Haramiler, kamplar ve harabeler eşya düşürür.")}</p>`) +
        `<h3>${ic("j_caravan")} ${t("Yük")} (${g.cargoUsed()}/${g.carryCap()})</h3>` +
        (GOOD_KEYS.filter((k) => (h.cargo[k] ?? 0) > 0).map((k) => `<div class="qrow">${ic(GOODS[k].icon)} ${GOODS[k].name}<span>${t("{n} adet · ort. {p} altın", { n: h.cargo[k] ?? 0, p: Math.round((h.paid[k] ?? 0) / (h.cargo[k] ?? 1)) })}</span></div>`).join("") || `<p class="dim">${t("Yükün boş.")}</p>`) +
        (s.free ? this.codexHtml() : "");
    } else {
      body = `<div class="stats"><div>${ic("tug")}${t("Birlik")}: <b>${armySize(h.army)}/${g.heroCap()}</b></div><div>${ic("coins")}${t("Ücret")}: <b>${g.wagePerMin().toFixed(1)}/${t("dk")}</b></div><div>${ic("shield")}${t("Toplam güç")}: <b>${Math.round(g.heroPower())}</b></div></div>
        ${armyHtml(h.army)}
        ${this.vetsHtml()}
        ${s.beylik ? this.otagHtml() : ""}
        ${s.free ? this.birdHtml() : ""}
        <h3>${ic("tug")} ${t("Yoldaşlar")} (${s.comps.length})</h3>${s.comps.map((id) => {
          const cp = COMP_BY_ID[id as CompId];
          if (!cp) return "";
          const bv = g.bond(cp.id), tier = bondTier(bv), en = lang() === "en";
          const q = COMP_QUESTS[cp.id], done = (s.cqDone ?? []).includes(cp.id);
          const qs = done ? `<small class="good">${t("Kan kardeşi")} · ${t("güçler")} ×${SWORN_MULT}</small>`
            : s.cq?.id === cp.id ? `<small class="cheap">${q.title}: ${CITY_NAME[q.steps[s.cq.step]?.city ?? q.steps[0].city]}</small>${g.cqTarget() ? this.walkBtn(g.cqTarget()!, t("Yola çık")).replace("btn go", "btn sm go cqgo") : ""}`
            : q ? `<small class="dim">${q.title} · ${t("bağ")} ${BOND_QUEST}+</small>` : "";
          return `<div class="comp on"><img src="${assetUrl(cp.icon)}" alt=""><div class="bi2"><b>${cp.name} <em>${cp.role}</em></b><small class="cheap">${cp.perk}</small>${bar(Math.max(0, bv + 100), 200, `bond ${tier.cls}`, `${en ? tier.en : tier.name} ${Math.round(bv)}`)}<small class="dim">${t("Sever")}: ${(en ? BOND_LIKES_EN : BOND_LIKES)[cp.id]}</small>${qs}</div></div>`;
        }).join("") || `<p class="dim">${t("Henüz yoldaşın yok. Destan seni yeni dostlarla buluşturacak; bazı şehirlerin hanlarında da yolcular bekler (en fazla {n} paralı yoldaş).", { n: COMP_MAX })}</p>`}
        <p class="dim">${s.free ? t("Köylerden gönüllü topla ya da şehir hanlarından paralı asker tut. Askerlerin ücretini altınla ödersin; altının biterse terk ederler. Liderlik birlik sınırını ve askerlerin gücünü artırır.") : t("Henüz bir kölesin. Hürriyetini kazanınca birlik kurabilirsin.")}</p>
        <h3>${t("Toplam")}</h3><div class="stats"><div>${ic("j_bandit")}${t("Yenilen düşman")}: <b>${s.kills}</b></div><div>${ic("quest")}${t("Görev")}: <b>${s.quest}/${g.QUESTS.length}</b></div><div>${t("Ticaret kârı")}: <b>${s.c.profit}</b></div></div>`;
    }
    const tl = s.title ? titleOf(s.title) : null;
    return this.frame(h.name, s.free ? `${t("Seviye")} ${h.lv} · ${s.act3.ending ? `<b class="ttl">${endingOf(s.act3.ending)!.name}</b>${tl ? ` · ${tl.name}` : ""}` : s.kagan ? `<b class="ttl">${t("Kağan")}</b>${tl ? ` · ${tl.name}` : ""}` : tl ? `<b class="ttl">${tl.name}</b>` : s.beylik ? t("Bey") : t("Hür yiğit")}` : `${t("Seviye")} ${h.lv} · ${t("Köle")}`, assetUrl(g.face()), tabs + body);
  }

  showBattle(title: string, before: Army, enemy: Army, sim: Sim, hero: { hpBefore: number; maxHp: number }, boss: Boss | null, foe: string, auto: boolean, apply: (res: BattleResult) => { xp: number; lvUp: boolean; note: string }, onClose: () => void): void {
    this.battleOpen = true;
    this.close();
    const el = document.createElement("div");
    el.className = "battle";
    const n0a = armySize(before);
    const n0b = armySize(enemy);
    const face = this.g.face();
    el.innerHTML = `<div class="bbox">
      <h2>${ic("swords")} ${title}</h2>
      <div class="sides">
        <div class="side me">${ic(face, "bp")}<b>${this.g.s.hero.name}</b><div class="bar hero"><i></i><span></span></div>${n0a ? `<div class="bar hp"><i></i></div>` : ""}<div class="arm"></div></div>
        <div class="vs">VS</div>
        <div class="side foe">${ic(boss?.icon ?? "j_bandit", "bp" + (boss ? " boss" : ""))}<b>${boss?.name ?? foe}</b>${boss ? `<div class="bar boss"><i></i><span></span></div>` : ""}${n0b ? `<div class="bar hp foe"><i></i></div>` : ""}<div class="arm"></div></div>
      </div>
      <canvas class="field"></canvas>
      <div class="orders">${ORDER_KEYS.map((o) => `<button class="btn sm ord" data-o="${o}" title="${ORDERS[o].text}">${ic(ORDERS[o].icon)} ${ORDERS[o].name}</button>`).join("")}<button class="btn sm fast" title="Hızlandır">⏩</button></div>
      <div class="rlog">Savaş başladı…</div>
      <div class="result"></div>
    </div>`;
    this.root.appendChild(el);
    const field = new BattleField(el.querySelector("canvas.field")!, before, enemy, assetUrl(face), boss ? assetUrl(boss.icon) : null);
    let pending: Order | undefined;
    let fast = auto;
    const ordBtns = [...el.querySelectorAll<HTMLButtonElement>(".ord")];
    const syncOrders = () => {
      for (const b of ordBtns) {
        const o = b.dataset.o as Order;
        b.classList.toggle("off", !sim.canOrder(o) || (!!pending && pending !== o));
        b.classList.toggle("go", pending === o);
      }
    };
    syncOrders();
    for (const b of ordBtns)
      b.addEventListener("click", () => {
        const o = b.dataset.o as Order;
        if (!sim.canOrder(o) || pending) return;
        pending = o;
        audio.play("click");
        syncOrders();
      });
    const fastBtn = el.querySelector(".fast")!;
    fastBtn.classList.toggle("go", fast);
    fastBtn.addEventListener("click", () => {
      fast = !fast;
      fastBtn.classList.toggle("go", fast);
    });
    const setSide = (sel: string, a: Army, n0: number, hp?: number) => {
      const s = el.querySelector(sel)!;
      const hpBar = s.querySelector(".hp i") as HTMLElement | null;
      if (hpBar) hpBar.style.width = `${(armySize(a) / Math.max(1, n0)) * 100}%`;
      s.querySelector(".arm")!.innerHTML = n0 ? armyHtml(a) : "";
      if (hp !== undefined) {
        (s.querySelector(".hero i") as HTMLElement).style.width = `${(hp / hero.maxHp) * 100}%`;
        s.querySelector(".hero span")!.textContent = `Can ${Math.round(hp)}`;
      }
    };
    const setBoss = (hp: number) => {
      if (!boss) return;
      (el.querySelector(".bar.boss i") as HTMLElement).style.width = `${(hp / boss.hp) * 100}%`;
      el.querySelector(".bar.boss span")!.textContent = `${Math.ceil(hp)}/${boss.hp}`;
    };
    setSide(".me", before, n0a, hero.hpBefore);
    setSide(".foe", enemy, n0b);
    setBoss(boss?.hp ?? 0);
    let i = 1;
    const log = el.querySelector(".rlog")!;
    const box = el.querySelector(".bbox") as HTMLElement;
    const step = () => {
      if (!sim.done() || i < sim.rounds.length) {
        if (i >= sim.rounds.length) {
          sim.step(pending);
          pending = undefined;
          syncOrders();
        }
        const r = sim.rounds[i];
        const p = sim.rounds[i - 1];
        setSide(".me", r.a, n0a, r.hp);
        setSide(".foe", r.b, n0b);
        setBoss(r.bhp);
        field.round(r.a, r.b, r.order, fast ? 380 : 760, r.ev);
        box.classList.remove("shake");
        void box.offsetWidth;
        box.classList.add("shake");
        audio.play("hit");
        haptic(18);
        log.textContent = `${r.ev.length ? r.ev.join(" · ") + " — " : ""}${i}. tur: ${p.hp >= r.hp ? `${Math.round(p.hp - r.hp)} hasar aldın` : `${Math.round(r.hp - p.hp)} can yeniledin`}${n0a ? `, ${armySize(p.a) - armySize(r.a)} asker kaybın` : ""} · düşman kaybı ${armySize(p.b) - armySize(r.b)}`;
        i++;
        setTimeout(step, fast ? 420 : 900);
        return;
      }
      el.querySelector(".orders")!.remove();
      const res = sim.finish();
      const { xp, lvUp, note: extra } = apply(res);
      const last = res.rounds[res.rounds.length - 1];
      field.round(last.a, last.b, undefined, 500);
      field.finish(res.win);
      setTimeout(() => field.stop(), 2400);
      setSide(".me", last.a, n0a, last.hp);
      setSide(".foe", last.b, n0b);
      setBoss(last.bhp);
      audio.play(res.win ? "win" : "lose");
      haptic(res.win ? [30, 60, 30] : 200);
      if (lvUp) setTimeout(() => audio.play("level"), 900);
      log.textContent = res.win ? (boss ? `${boss.name} yıkıldı!` : "Düşman kaçıyor!") : res.heroDown ? "Yere düştün…" : "Geri çekilmek zorunda kaldın.";
      el.querySelector(".result")!.innerHTML = `
        <div class="rt ${res.win ? "win" : "lose"}">${res.win ? "ZAFER" : "YENİLGİ"}</div>
        <div class="stats"><div>Kayıpların: <b>${armySize(res.lostA)}</b></div><div>Düşman kaybı: <b>${armySize(res.lostB)}</b></div><div>${ic("scroll")}+${xp} TP${lvUp ? " · <b class='gold'>SEVİYE ATLADIN!</b>" : ""}</div></div>
        ${extra ? `<p class="loot">${extra}</p>` : ""}
        <button class="btn go big">Devam</button>`;
      el.querySelector(".result .btn")!.addEventListener("click", () => {
        el.remove();
        this.battleOpen = false;
        this.nextStory();
        onClose();
      });
    };
    setTimeout(step, 600);
  }

  private setHtml(el: Element, html: string): void {
    if (this.htmlCache.get(el) === html) return;
    this.htmlCache.set(el, html);
    el.innerHTML = html;
  }

  update(): void {
    const g = this.g;
    const s = g.s;
    const now = performance.now();
    if (g.act) {
      this.actEl.classList.remove("hidden");
      this.setHtml(this.actEl, `<b>${g.act.label}…</b>${bar(Math.round((g.act.t / g.act.dur) * 200), 200, "", "")}`);
    } else this.actEl.classList.add("hidden");
    if (now - this.liveT < 250) return;
    this.liveT = now;
    const day = g.dayOf();
    const night = g.isNight();
    const se = g.sea();
    const h = s.hero;
    const showRes = RES_KEYS.filter((k) => k === "gold" || s.res[k] >= 1 || s.beylik);
    this.setHtml(this.top,
      showRes.map((k) => {
        const r = g.ratePerMin(k);
        return `<div class="res" title="${RES_NAME[k]}">${ic(RES_ICON[k])}<b>${fmt(s.res[k])}</b>${Math.round(r) ? `<small class="${r < 0 ? "neg" : ""}">${r >= 0 ? "+" : ""}${Math.round(r)}/dk</small>` : ""}</div>`;
      }).join("") +
      `<div class="res vit"><div class="mbar hp"><i style="width:${(h.hp / g.maxHp()) * 100}%"></i><span>❤ ${Math.floor(h.hp)}</span></div><div class="mbar en"><i style="width:${(h.energy / g.maxEnergy()) * 100}%"></i><span>⚡ ${Math.floor(h.energy)}</span></div></div>
       <div class="res hero">${ic(g.face(), "ic round")}<b>${t("Sv")} ${h.lv}</b>${h.points + h.spts + h.tpts ? `<small class="pts">+${h.points + h.spts + h.tpts}</small>` : ""}${s.wanted ? `<small class="wanted" title="Aranıyorsun">${"★".repeat(s.wanted)}</small>` : ""}</div>
       ${s.free ? `<div class="res">${ic("crown")}<b>${s.renown}</b></div>` : ""}
       <div class="res day" title="${night ? "Gece: görüş azalır, haramiler cesurlaşır, muhafızlar seni zor bulur, Kurgan Taşları güçlenir ama daha çok Ruh Taşı verir" : "Gündüz"}">${night ? "🌙" : "☀️"}<b>${t("Gün")} ${day.day}</b></div>
       <div class="res season" title="${se.name}: ${se.desc} (${t("{n} gün kaldı", { n: Math.ceil(g.seasonLeft() / DAY_SEC) })})">${se.icon}<b>${se.name}</b></div>
       <div class="res spd ${(settings.speed ?? 1) > 1 ? "fast" : ""}" data-spd title="${t("Oyun hızı (T)")}"><b>${"▶".repeat(settings.speed ?? 1)}</b></div>`);
    const q = g.quest();
    this.setHtml(this.questEl, q
      ? `${ic("quest", "qi")}<div><small>${t("Görev")} ${s.quest + 1}/${g.QUESTS.length}</small><b>${q.title}</b><span>${q.text}</span><em>${costHtml(q.reward, g)}</em></div>`
      : `${ic("crown", "qi")}<div><b>Tüm görevler bitti</b><span>Kampları temizle, beyliğini büyüt, batıya doğru keşfet.</span></div>`);
    const ch = g.chapter();
    this.questEl.classList.toggle("hidden", !q && !!ch && s.free);
    const sq = this.topSide();
    this.sideEl.classList.toggle("hidden", !sq);
    if (sq) {
      const p = Math.max(0, Math.min(sq.need, g.sideProg(sq)));
      const ready = p >= sq.need;
      const html = `${ic(SIDE_TEXT[sq.kind].icon, "qi")}<div><small>Şehir görevi${s.sideQ.length > 1 ? ` · +${s.sideQ.length - 1} daha` : ""}</small><b>${sq.title}</b><span>${ready ? `Tamamlandı! ${CITY_NAME[g.sideTurnIn(sq)]} şehrine dön.` : `${sq.text}${sq.need > 1 ? ` (${p}/${sq.need})` : ""}`}</span></div>`;
      if (this.sideEl.innerHTML !== html) this.sideEl.innerHTML = html;
      this.sideEl.classList.toggle("ready", ready);
    }
    const lordGoal = s.story.done && !s.story.lord;
    this.sagaEl.classList.toggle("hidden", !(ch && s.free) && !lordGoal);
    if (ch && s.free) {
      const why = ch.req?.(g);
      const html = `${ic(ch.img, "qi round")}<div><small>${g.sagaLabel()}</small><b>${ch.title}</b><span>${ch.goal}${why ? ` <i class="why">(${why})</i>` : ""}</span></div>`;
      if (this.sagaEl.innerHTML !== html) this.sagaEl.innerHTML = html;
    } else if (lordGoal) {
      const html = `${ic("map/serai", "qi round")}<div><small>Destan sonrası</small><b>İpek Yolu'nun Efendisi</b><span>Semerkant dışındaki ${LORD_SERAIS} şehrin hepsinde kervansaray kur (${g.seraiCount()}/${LORD_SERAIS}).</span></div>`;
      if (this.sagaEl.innerHTML !== html) this.sagaEl.innerHTML = html;
    }
    const r = s.raid;
    const ct = s.contract;
    const vy = s.fleet.voyage;
    this.taskEl.classList.toggle("hidden", !r && !ct && !vy);
    this.taskEl.classList.toggle("alert", !!r);
    if (r) this.setHtml(this.taskEl, `${ic("j_bandit", "qi")}<div><small>Baskın · ${dur(r.until - g.now)}</small><b>${s.villages[r.v].name} yağmalanıyor!</b></div>`);
    else if (ct) this.setHtml(this.taskEl, `${ic("j_caravan", "qi")}<div><small>Kervan sözleşmesi · ${dur(ct.until - g.now)}</small><b>${ct.cargo} → ${CITY_NAME[ct.to]}</b></div>`);
    else if (vy) this.setHtml(this.taskEl, `${ic(GOODS[vy.good].icon, "qi")}<div><small>⚓ Denizde · %${Math.floor(Math.min(1, (s.time - vy.at) / vy.dur) * 100)}${vy.escort ? " · muhafızlı" : ""}</small><b>${vy.qty} ${GOODS[vy.good].name} → ${CITY_NAME[vy.to]}</b></div>`);
    const mg = s.mongol;
    const mgOn = !!mg && (mg.stage === 1 || mg.stage === 2);
    this.mogEl.classList.toggle("hidden", !mgOn);
    if (mg && mgOn) {
      const left = Math.ceil(g.mongolDaysLeft());
      this.mogEl.classList.toggle("alert", mg.stage === 2 && left <= 2);
      this.setHtml(this.mogEl, mg.stage === 1
        ? `${ic("scroll", "qi")}<div><small>${t("Doğudan haberler")}</small><b>${t("Kara bulut yaklaşıyor")} · ${left} ${t("gün")}</b></div>`
        : `${ic("heroes/boss_hakan", "qi")}<div><small>${t("Moğol istilası")} · ${"◆".repeat(mg.str)}${mg.pact === "join" ? ` · ${t("müttefik")}` : ""}</small><b>${CITY_NAME[MONGOL_ROUTE[mg.next]]} · ${left} ${t("gün")}</b></div>`);
    }
    const bld = g.building();
    this.root.querySelector('[data-b="capital"] span')!.textContent = bld ? `⏱ ${dur(s.buildings[bld].until - g.now)}` : t("Semerkant");
    const hb = this.root.querySelector('[data-b="hero"]')!;
    (hb.querySelector("img") as HTMLImageElement).src = assetUrl(g.face());
    hb.classList.toggle("pulse", h.points > 0 || g.dailyClaimable());
    const bird = s.bird;
    this.birdBtn.classList.toggle("hidden", !bird || !s.free);
    if (bird) {
      const img = this.birdBtn.querySelector("img")!;
      const src = assetUrl("bird_" + bird.kind);
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      const cd = g.birdReady();
      const txt = g.birdFly ? "Uçuyor" : g.birdAim ? "Hedef seç" : cd > 0 ? `${Math.ceil(cd)} sn` : "Uçur";
      const sp = this.birdBtn.querySelector("span")!;
      if (sp.textContent !== txt) sp.textContent = txt;
      this.birdBtn.classList.toggle("ready", !g.birdFly && cd <= 0);
      this.birdBtn.classList.toggle("aim", g.birdAim);
    }
    if (this.place && !this.holding && now - this.panelT > 1000) {
      this.panelT = now;
      this.render();
    }
    if (now - this.miniT > 400) {
      this.miniT = now;
      this.drawMini();
    }
  }

  private drawMini(): void {
    const g = this.g;
    const c = this.mini.getContext("2d")!;
    const w = this.mini.width;
    const h = this.mini.height;
    if (!this.fogC || this.fogRev !== g.fogRev) {
      this.fogRev = g.fogRev;
      const fc = (this.fogC ??= document.createElement("canvas"));
      fc.width = w;
      fc.height = h;
      const f = fc.getContext("2d")!;
      f.drawImage(this.miniBase, 0, 0);
      f.fillStyle = "rgba(28,20,12,0.88)";
      const ex = g.s.explored;
      const cw = w / NW;
      const ch = h / NH;
      for (let y = 0; y < NH; y += 2)
        for (let x = 0; x < NW; x += 2) if (!ex[y * NW + x]) f.fillRect(x * cw, y * ch, cw * 2 + 0.5, ch * 2 + 0.5);
    }
    c.drawImage(this.fogC, 0, 0);
    const sx = w / W;
    const sy = h / H;
    for (const ci of CITIES) {
      const own = ci.id === CAPITAL.id || !!g.s.owned[ci.id];
      c.fillStyle = own ? "#ffd56a" : "#f2e6c8";
      c.fillRect(ci.x * sx - (own ? 3 : 2), ci.y * sy - (own ? 3 : 2), own ? 6 : 4, own ? 6 : 4);
    }
    const wanted = new Set(g.s.bounties.filter((b) => b.taken).map((b) => b.camp));
    g.s.camps.forEach((cp, i) => {
      if (!cp.alive || (!g.isExplored(cp.x, cp.y) && !wanted.has(i))) return;
      c.fillStyle = wanted.has(i) ? "#ffd56a" : "#ff5a3c";
      c.fillRect(cp.x * sx - 2, cp.y * sy - 2, wanted.has(i) ? 5 : 3, wanted.has(i) ? 5 : 3);
    });
    c.fillStyle = "#7fd36a";
    for (const m of g.s.marches) c.fillRect(m.x * sx - 1.5, m.y * sy - 1.5, 3, 3);
    for (const st of g.s.storms) {
      c.fillStyle = st.kind === "kum" ? "rgba(214,160,80,0.35)" : "rgba(90,120,170,0.35)";
      c.beginPath();
      c.arc(st.x * sx, st.y * sy, Math.max(3, st.r * sx), 0, Math.PI * 2);
      c.fill();
    }
    for (const cv of g.s.caravans) {
      if (!g.isExplored(cv.x, cv.y)) continue;
      c.fillStyle = cv.raid ? "#ff5a3c" : FACTIONS[cv.fac as keyof typeof FACTIONS].color;
      c.beginPath();
      c.moveTo(cv.x * sx, cv.y * sy - 2.5);
      c.lineTo(cv.x * sx + 2.5, cv.y * sy);
      c.lineTo(cv.x * sx, cv.y * sy + 2.5);
      c.lineTo(cv.x * sx - 2.5, cv.y * sy);
      c.fill();
    }
    for (const b of g.s.bandits) {
      if (!b.posse && !b.nem) continue;
      c.fillStyle = b.posse ? "#6aa8ff" : "#c27bff";
      c.fillRect(b.x * sx - 2, b.y * sy - 2, b.posse ? 3 : 4, b.posse ? 3 : 4);
    }
    for (const r of g.s.rivals) {
      if (r.status === "dead" || !g.isExplored(r.x, r.y)) continue;
      c.fillStyle = RIVAL_CSS[r.status];
      c.beginPath();
      c.arc(r.x * sx, r.y * sy, 3, 0, Math.PI * 2);
      c.fill();
    }
    const gt = g.s.act2.gate;
    if (gt && !g.s.act2.done) {
      c.strokeStyle = "#c27bff";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(gt.x * sx, gt.y * sy, 4 + Math.sin(performance.now() / 300), 0, Math.PI * 2);
      c.stroke();
    }
    const ot = g.s.otag;
    if (ot) {
      c.fillStyle = "#ffe08a";
      c.fillRect(ot.x * sx - 3, ot.y * sy - 3, 6, 6);
    }
    const ba = g.s.boy?.at;
    if (ba) {
      c.strokeStyle = "#ffb24a";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(ba.x * sx, ba.y * sy, 4 + Math.sin(performance.now() / 300), 0, Math.PI * 2);
      c.stroke();
    }
    const pk = g.s.act3.peak;
    if (pk && !g.s.act3.ending) {
      c.strokeStyle = "#7fd0ff";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(pk.x * sx, pk.y * sy, 4 + Math.sin(performance.now() / 300), 0, Math.PI * 2);
      c.stroke();
    }
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(g.s.hero.x * sx, g.s.hero.y * sy, 3, 0, Math.PI * 2);
    c.fill();
    const cam = g.cam;
    const vw = (cam.w / cam.zoom) * sx;
    const vh = (cam.h / cam.zoom) * sy;
    c.strokeStyle = "rgba(255,230,160,0.9)";
    c.lineWidth = 1;
    c.strokeRect(cam.x * sx - vw / 2, cam.y * sy - vh / 2, vw, vh);
  }
}
