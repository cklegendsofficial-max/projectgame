import { LORD_SERAIS, type Game, type Quest, type Target } from "../game/game";
import { BUILDINGS, NODE_NAME, RES_ICON, RES_KEYS, RES_NAME, UNITS, UNIT_KEYS, armySize, buildCost, buildTime, prodPerMin, unitUnlocked, xpNeed, type Army, type Res, type Unit } from "../game/data";
import { TACTICS, TACTIC_KEYS, type BattleResult, type Boss, type Tactic } from "../game/battle";
import { GOODS, GOOD_KEYS, PLUS_CHANCE, SKILL_INFO, SKILL_KEYS, SLOTS, SLOT_NAME, STAT_INFO, STAT_KEYS, canPlus, itemStats, kindName, plusCost, skillLv, skillNext, type Item, type Slot } from "../game/rpg";
import { ARMOR_NAME, CLASSES, SKILL_MAX, WEAPON_NAME, skillPow, skillRank, type ClassId } from "../game/classes";
import { CAPITAL, kurganBoss } from "../game/state";
import { BRANCHES, BRANCH_KEYS, ROW_NEED, TALENTS, branchSpent } from "../game/talents";
import { CONSUMABLES, CONS_BY_ID, CRAFT_SLOTS, REFINES, gearCost, type Cost, type Mat } from "../game/crafting";
import { SIDE_TEXT, type SideQuest } from "../game/sidequests";
import { CITY_NAME } from "../game/data";
import { COMPANIONS, COMP_BY_ID, COMP_MAX, FORT_GUARD, KARA_HAN, type CompId } from "../game/story";
import { CITIES, H, NH, NW, W } from "../world/gen";
import { assetUrl } from "../render/worldView";
import { audio } from "../audio";
import { SETS, SET_FORGE, SET_KEYS, SET_SLOTS, UNIQUES, modsText, type SetId } from "../game/legend";
import { FACTIONS, FACTION_KEYS, HOSTILE, REP_RANKS, RANK_PERKS, factionOf } from "../game/factions";
import { NEM_TRAITS, nemName } from "../game/nemesis";
import { TITLE_CATS, titleKey, titleOf } from "../game/titles";
import { DAILY_POOL } from "../game/daily";

const WEAPON_ICON: Record<string, string> = { kilic: "it_sword_", balta: "it_axe_", hancer: "it_dagger_", ok: "it_bow_", asa: "it_staff_" };

const ic = (k: string, cls = "ic") => `<img class="${cls}" src="${assetUrl(k)}" alt="">`;
const CAP_I = CITIES.findIndex((c) => c.id === "samarkand");

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
  private actEl!: HTMLElement;
  private panel!: HTMLElement;
  private toasts!: HTMLElement;
  private mini!: HTMLCanvasElement;
  private miniBase!: HTMLCanvasElement;
  private acts = new Map<string, () => void>();
  private actN = 0;
  private place: Target | { kind: "hero" } | null = null;
  private tab = "";
  private liveT = 0;
  private miniT = 0;
  private panelT = 0;
  private holding = false;
  private sel: Army = { spear: 0, archer: 0, horse: 0 };
  private battleOpen = false;
  private storyOpen = false;
  private sagaOpen = false;
  private craftTier = 1;
  private forgePick: SetId = "gokkurt";

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
      <div class="track"><div class="quest"></div><div class="quest saga hidden"></div><div class="quest task hidden"></div><div class="quest sq hidden"></div></div>
      <div class="toasts"></div>
      <div class="actbar hidden"></div>
      <div class="bottom">
        <button data-b="capital"><img class="bi" src="${assetUrl("cities/samarkand")}" alt=""><span>Semerkant</span></button>
        <button data-b="hero"><img class="bi round" src="${assetUrl("heroes/slave")}" alt=""><span>Kahraman</span></button>
        <button data-b="find">${ic("tug", "bi")}<span>Birliğim</span></button>
        <button data-b="snd" class="snd ${audio.muted ? "off" : ""}"><b class="bi">♪</b><span>Ses</span></button>
      </div>
      <canvas class="mini" width="220" height="128"></canvas>
      <div class="panel hidden"></div>`;
    this.top = this.root.querySelector(".top")!;
    this.questEl = this.root.querySelector(".quest")!;
    this.sagaEl = this.root.querySelector(".saga")!;
    this.taskEl = this.root.querySelector(".task")!;
    this.sideEl = this.root.querySelector(".quest.sq")!;
    this.sideEl.addEventListener("click", () => {
      const q = this.topSide();
      const p = q && g.sideGoto(q);
      if (p) g.cam.flyTo(p.x, p.y, Math.max(g.cam.zoom, 0.65));
    });
    this.taskEl.addEventListener("click", () => {
      const r = g.s.raid;
      const c = g.s.contract;
      const p = r ? g.s.villages[r.v] : c ? CITIES.find((x) => x.id === c.to) : null;
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
    this.panel.addEventListener("input", (e) => {
      const el = e.target as HTMLInputElement;
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
      g.cam.flyTo(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
    if (g.s.cls === null) setTimeout(() => this.classSelect(), 300);
    else if (!g.s.free && g.s.c.shifts === 0 && g.s.quest === 0) setTimeout(() => this.intro(), 400);
  }

  private intro(): void {
    this.story(
      "Kervan Krallık",
      "heroes/slave",
      `Adın ${this.g.s.hero.name}, yolun ${this.g.cls().name} yolu. Ama önce: bir baskında ailenden koparıldın ve Semerkant'ta bir tüccara köle olarak satıldın.<br><br>Efendin sana bir söz verdi: <b>80 akçe</b> biriktirirsen hürriyetini geri alabilirsin. Şehrin yakınındaki ormanda, taş ocağında ve tarlalarda çalış, her vardiyada birkaç akçe kazan.<br><br>Özgürlüğünü kazandıktan sonra İpek Yolu seni bekliyor: ${this.g.cls().name} silahlarını al, talim yap, ticaret yap, haramileri yen ve bir gün kendi beyliğini kur.`,
      "Çalışmaya başla",
    );
  }

  private classSelect(): void {
    const g = this.g;
    this.storyOpen = true;
    let pick: ClassId = "alp";
    const el = document.createElement("div");
    el.className = "battle csel";
    const pips = (v: number) => "●".repeat(v) + `<i>${"●".repeat(Math.max(0, 4 - v))}</i>`;
    const detail = () => {
      const c = CLASSES.find((x) => x.id === pick)!;
      return `<img class="cbig" src="${assetUrl(c.portrait)}" alt=""><div class="cinfo">
        <h2 style="color:${c.color}">${c.name}</h2><em>${c.role}</em><p>${c.desc}</p>
        <div class="cstats">${STAT_KEYS.map((k) => `<div class="${c.primary.includes(k) ? "prim" : ""}"><span>${c.primary.includes(k) ? "★ " : ""}${STAT_INFO[k].name}</span><b>${pips(c.start[k])}</b></div>`).join("")}</div>
        <div class="cgear">${ic("swords")} ${c.weapons.map((w) => WEAPON_NAME[w]).join(", ")} · ${ARMOR_NAME[c.armor]}${c.shield ? " · Kalkan" : ""}</div>
        <div class="cpass">${c.passive}</div></div>`;
    };
    el.innerHTML = `<div class="bbox cbox"><h2>Yolunu seç</h2><p class="dim">Seçtiğin yol hangi silahları ve zırhları kullanabileceğini, hangi özelliklerin seni güçlendireceğini belirler. Daha sonra değiştirilemez.</p>
      <div class="ccards">${CLASSES.map((c) => `<button class="ccard ${c.id === pick ? "on" : ""}" data-c="${c.id}" style="--cc:${c.color}"><img src="${assetUrl(c.portrait)}" alt=""><b>${c.name}</b><small>${c.role.split(" · ")[0]}</small></button>`).join("")}</div>
      <div class="cdet">${detail()}</div>
      <div class="cname"><label>Adın</label><input maxlength="14" value="${g.s.hero.name}"><button class="btn go big">Bu yolu seç</button></div></div>`;
    this.root.appendChild(el);
    el.querySelector(".ccards")!.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("[data-c]") as HTMLElement | null;
      if (!b) return;
      pick = b.dataset.c as ClassId;
      el.querySelectorAll(".ccard").forEach((x) => x.classList.toggle("on", x === b));
      el.querySelector(".cdet")!.innerHTML = detail();
    });
    el.querySelector(".cname .btn")!.addEventListener("click", () => {
      const name = (el.querySelector(".cname input") as HTMLInputElement).value.trim().slice(0, 14) || "Toygar";
      g.chooseClass(pick, name);
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
      <div class="odds mid">Meşale: <b>${g.deepTorches()}</b> · En derin inişin: <b>${s.deepBest ? `${s.deepBest}. kat` : "—"}</b> · Toplam kat: <b>${s.c.floors}</b></div>
      ${why ? `<p class="dim">${why}</p>` : near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.enterDeep(i); })}">${ic("map/kurgan")} Derinliklere in</button>` : this.walkBtn(t, "Mezara yürü")}`;
  }

  private dailyHtml(): string {
    const g = this.g;
    const d = g.daily();
    if (!d) return "";
    return (
      `<h3>${ic("seal")} Günlük Fermanlar <em class="dim">· seri ${d.streak} gün</em></h3><p class="dim">Her gün yeni üç ferman. Hepsini bitirip sandığı aç; üst üste gelirsen sandık daha cömert olur.</p>` +
      d.tasks
        .map((t, i) => {
          const p = DAILY_POOL.find((x) => x.key === t.key)!;
          const v = g.dailyProg(t);
          const ok = v >= t.need;
          return `<div class="grow ${t.done ? "dim" : ""}">${ic(p.icon, "gimg")}<div class="bi2"><b>${t.need} ${p.what}</b><div class="fbar" style="--fc:${ok ? "#7fd36a" : "#e0b04a"}"><i style="width:${(v / t.need) * 100}%"></i></div><small>${v}/${t.need} · ${ic("coins")}${g.dailyGold()}</small></div>${t.done ? `<em class="cheap">✓</em>` : `<button class="btn sm ${ok ? "go" : "off"}" data-a="${this.act(() => g.claimDaily(i))}">Al</button>`}</div>`;
        })
        .join("") +
      (d.chest ? `<div class="odds good">Bugünün sandığı açıldı. Yarın yeni fermanlar gelecek.</div>` : `<button class="btn big ${g.chestReady() ? "go" : "off"}" style="width:100%" data-a="${this.act(() => g.openChest())}"> ${ic("chest")} Ferman sandığını aç</button>`)
    );
  }

  private chronAll = false;

  private chronHtml(): string {
    const c = this.g.s.chron;
    if (!c.length) return "";
    const list = [...c].reverse().slice(0, this.chronAll ? 80 : 6);
    return (
      `<h3>${ic("parsomen")} Ozanın Defteri</h3><div class="chron">` +
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
          const where = n.alive ? (out ? `<b class="dear">Bozkırda seni arıyor</b>` : `${s.camps[n.camp]?.name ?? "?"} çevresinde`) : "Öldürüldü";
          const btn = n.alive ? `<button class="btn sm" data-a="${this.act(() => { this.close(); const p = out ?? s.camps[n.camp]; g.cam.flyTo(p.x, p.y, 0.8); })}">Bul</button>` : `<em class="cheap">✓</em>`;
          return `<div class="grow nem ${n.alive ? "" : "dim dead"}">${ic("j_bandit", "gimg")}<div class="bi2"><b>${nemName(n)}</b> <small>Sv ${n.lv}</small><small>${t.name} · ${t.desc}</small><small>${where}${n.wins ? ` · seni ${n.wins} kez yendi` : ""}${n.scars ? ` · ${n.scars} yara izi` : ""}</small></div>${btn}</div>`;
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
        return `<div class="tcat"><div class="tch">${ic(cat.icon, "gimg")}<div class="bi2"><b>${next ? `${Math.min(v, next.need)}/${next.need} ${cat.what}` : `Tamamlandı · ${cat.what}`}</b>${next ? `<div class="fbar" style="--fc:#e0b04a"><i style="width:${Math.min(100, (v / next.need) * 100)}%"></i></div>` : ""}</div></div><div class="ttiers">${cat.tiers
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

  private act(fn: () => void): string {
    const id = "a" + this.actN++;
    this.acts.set(id, () => {
      fn();
      this.render();
    });
    return id;
  }

  panelOpen(): boolean {
    return !this.panel.classList.contains("hidden") || this.battleOpen || this.storyOpen;
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
    el.innerHTML = `<div class="bbox story"><img class="simg" src="${assetUrl(img)}" alt=""><h2>${title}</h2><p>${html}</p><button class="btn go big">${btn}</button></div>`;
    this.root.appendChild(el);
    el.querySelector(".btn")!.addEventListener("click", () => {
      el.remove();
      this.storyOpen = false;
      this.nextStory();
    });
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
    el.innerHTML = `<div class="bbox story choice"><img class="simg" src="${assetUrl(img)}" alt=""><h2>${title}</h2><p>${html}</p>${opts.map((o, i) => `<button class="btn big ${o.cls}" data-i="${i}">${o.label}</button>`).join("")}</div>`;
    this.root.appendChild(el);
    el.querySelectorAll<HTMLButtonElement>(".btn").forEach((b) =>
      b.addEventListener("click", () => {
        const o = opts[Number(b.dataset.i)];
        if (o.cls.includes("off")) return;
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
  }

  openPlace(t: Target): void {
    const g = this.g;
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
    return `<div class="tabs">${list.map(([id, n]) => `<button class="tab ${this.tab === id ? "on" : ""}" data-a="${this.act(() => (this.tab = id))}">${n}</button>`).join("")}</div>`;
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
          ${near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.attackKurgan(t.i); })}">${ic("swords")} Taşa saldır!</button>` : this.walkBtn(t, "Taşa yürü")}` : this.deepHtml(t.i, near));
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
    this.panel.innerHTML = html;
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
    const tabs = this.tabs(list);
    let body = "";
    const off = !near ? "off" : "";
    const nearNote = near ? "" : `<p class="warn">Burada iş yapmak için şehre gitmelisin. Fiyatları uzaktan görebilirsin.</p>${this.walkBtn(t, "Şehre yürü")}`;
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
        <p class="dim">Malın üretildiği şehirde ucuz, talep edildiği şehirde pahalıdır. Çok alırsan fiyat yükselir, çok satarsan düşer; zamanla eski haline döner.</p>` +
        GOOD_KEYS.map((k) => {
          const bp = g.buyPrice(c.id, k);
          const sp = g.sellPrice(c.id, k);
          const have = s.hero.cargo[k] ?? 0;
          const avg = have > 0 ? Math.round((s.hero.paid[k] ?? 0) / have) : 0;
          const rel = g.price(c.id, k) / GOODS[k].base;
          const em = g.eventMult(c.id, k);
          const tag = em > 1.2 ? `<em class="dear">kıtlık!</em>` : em < 0.8 ? `<em class="cheap">bolluk!</em>` : rel < 0.75 ? `<em class="cheap">ucuz</em>` : rel > 1.3 ? `<em class="dear">pahalı</em>` : "";
          return `<div class="grow">${ic(GOODS[k].icon, "gimg")}<div class="bi2"><b>${GOODS[k].name} ${tag}</b><small>Al ${bp} · Sat ${sp}${have ? ` · Elinde ${have} (ort. ${avg})` : ""}</small></div>
            <div class="col2"><button class="btn sm ${off}" data-a="${this.act(() => g.buyGood(c.id, k, 1))}">Al</button><button class="btn sm ${off}" data-a="${this.act(() => g.buyGood(c.id, k, 5))}">Al 5</button><button class="btn sm ${!near || !have ? "off" : ""}" data-a="${this.act(() => g.sellGood(c.id, k, have))}">Sat</button></div></div>`;
        }).join("") +
        `<h3>Ham madde sat</h3><div class="row">${(["wood", "stone", "food"] as const).map((k) => `<button class="btn ${!near || s.res[k] < 1 ? "off" : ""}" data-a="${this.act(() => g.sellRes(k, s.res[k]))}">${ic(RES_ICON[k])} ${fmt(s.res[k])} sat · ${g.resPrice(k)}/adet</button>`).join("")}</div>`;
    } else if (this.tab === "demirci") {
      const items = g.smith(c.id);
      const row = (it: Item, right: string) => this.itemRow(it, right);
      body = `${nearNote}<p class="dim">Demircinin malları iki günde bir yenilenir. Uzak ve büyük şehirlerde daha iyi eşyalar bulunur. Demirci çoğunlukla ${g.cls().name} yoluna uygun mallar ayırır.</p>
        <h3>${ic("anvil")} Satılık</h3>` +
        (items.map((it) => row(it, `<button class="btn sm ${!near || s.res.gold < g.itemBuyPrice(it) ? "off" : ""}" data-a="${this.act(() => g.buyItem(c.id, it.id))}">${ic("coins")}${g.itemBuyPrice(it)}</button>`)).join("") || "<p>Demircide mal kalmadı.</p>") +
        `<h3>${ic("schest")} Heybendeki eşyalar</h3>` +
        (s.hero.bag.map((it) => row(it, `<button class="btn sm ${off}" data-a="${this.act(() => g.sellItem(it.id))}">Sat ${ic("coins")}${g.itemSellPrice(it)}</button>`)).join("") || `<p class="dim">Heyben boş.</p>`);
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
        ${this.boardHtml(c.id, near)}${serai}${rumor}
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
    } else body = this.beylikTabs();
    const fac = FACTIONS[factionOf(c.id)];
    const facTag = `<span class="ftag" style="--fc:${g.hostile(c.id) ? "#ff6a5a" : fac.color}">${fac.name} · ${g.hostile(c.id) ? "Düşman" : REP_RANKS[g.cityRank(c.id)].name}</span>`;
    const sub = (isCap && s.beylik ? `Beyliğinin merkezi · Saray Sv ${g.bld("saray")} · ` : isCap && !s.free ? "Efendinin şehri · " : "") + facTag;
    return this.frame(g.cityName(ci), sub, assetUrl("cities/" + c.id), this.sagaBox(c.id, near) + tabs + body);
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

  private heroHtml(): string {
    const g = this.g;
    const s = g.s;
    const h = s.hero;
    const need = xpNeed(h.lv);
    const tabs = this.tabs([["karakter", "Karakter"], ["beceri", `Beceriler${h.spts ? ` (${h.spts})` : ""}`], ["yetenek", `Yetenekler${h.tpts ? ` (${h.tpts})` : ""}`], ["techizat", `Teçhizat${h.bag.length ? ` (${h.bag.length})` : ""}`], ["ordu", "Birlik"], ...(s.free ? ([["unvan", `Hedefler${g.dailyClaimable() ? " ●" : ""}`]] as [string, string][]) : [])]);
    let body = "";
    if (this.tab === "karakter") {
      const cl = g.cls();
      body = `<div class="clsrow" style="--cc:${cl.color}">${ic(cl.portrait, "gimg round")}<div class="bi2"><b>${cl.name} <em>${cl.role}</em></b><small>${cl.passive}</small><small class="dim">${cl.weapons.map((w) => WEAPON_NAME[w]).join(", ")} · ${ARMOR_NAME[cl.armor]}${cl.shield ? " · Kalkan" : ""}</small></div></div>
        ${bar(h.xp, need, "", `Seviye ${h.lv} · ${h.xp}/${need} TP`)}
        ${h.points > 0 ? `<div class="odds good">Dağıtılacak <b>${h.points}</b> stat puanın var! ★ işaretliler ${cl.name} için ana özelliklerdir.</div>` : ""}
        <h3>Özellikler</h3>` +
        STAT_KEYS.map((k) => {
          const bonus = g.stat(k) - h.stats[k];
          const prim = cl.primary.includes(k);
          return `<div class="srow ${prim ? "prim" : ""}">${ic(STAT_INFO[k].icon, "gimg")}<div class="bi2"><b>${prim ? "★ " : ""}${STAT_INFO[k].name} <em>${h.stats[k]}${bonus ? ` +${bonus}` : ""}</em></b><small>${STAT_INFO[k].desc}</small></div><button class="btn sm plus ${h.points > 0 ? "" : "off"}" data-a="${this.act(() => g.statUp(k))}">+</button></div>`;
        }).join("") +
        `<h3>Savaş</h3><div class="stats"><div>${ic("swords")}Saldırı <b>${g.heroAtk().toFixed(1)}</b></div><div>${ic("shield")}Savunma <b>${g.heroDef().toFixed(1)}</b></div><div>Can <b>${Math.floor(h.hp)}/${g.maxHp()}</b></div><div>Enerji <b>${Math.floor(h.energy)}/${g.maxEnergy()}</b></div><div>${ic("tug")}Birlik sınırı <b>${g.heroCap()}</b></div><div>${ic("j_caravan")}Yük <b>${g.carryCap()}</b></div><div>${ic("crown")}Şöhret <b>${s.renown}</b></div></div>
        <h3>Beceriler</h3>` +
        SKILL_KEYS.map((k) => {
          const xp = h.skills[k];
          const lv = skillLv(xp);
          return `<div class="srow">${ic(SKILL_INFO[k].icon, "gimg")}<div class="bi2"><b>${SKILL_INFO[k].name} <em>Sv ${lv}</em></b>${bar(xp - 20 * lv * lv, skillNext(lv) - 20 * lv * lv, "", `${xp}/${skillNext(lv)}`)}<small>${SKILL_INFO[k].desc}</small></div></div>`;
        }).join("") +
        (s.free ? this.repHtml() : "") +
        this.chronHtml() +
        (g.seraiCount()
          ? `<h3>${ic("map/serai")} Kervansarayların · dakikada ${g.seraiIncome().toFixed(1)} altın</h3>` +
            Object.entries(s.serais)
              .map(([id, sr]) => `<div class="qrow">${CITY_NAME[id]} <em>Sv ${sr.lv}</em><span class="cheap">kasa ${Math.floor(sr.coffer)}/${Math.round(g.seraiCap(id))}</span></div>`)
              .join("")
          : "") +
        `<button class="btn sm red reset" data-a="${this.act(() => confirm("Tüm ilerlemen silinip yeni bir oyun başlayacak. Emin misin?") && g.resetGame())}">Yeni oyun başlat</button>`;
    } else if (this.tab === "yetenek") {
      const spentAll = Object.values(h.tal).reduce((a, b) => a + b, 0);
      body =
        `<p class="dim">Her seviyede 1 yetenek puanı kazanırsın. Bir dalın alt sırasını açmak için o dala sıra başına ${ROW_NEED} puan harcamalısın. Kendi yolunu seç: üç dalı birden bitiremezsin.</p>
        <div class="stats"><div>${ic("scroll")}Yetenek puanı: <b>${h.tpts}</b></div>${spentAll ? `<button class="btn sm ${s.res.gold < g.respecCost() ? "off" : ""}" data-a="${this.act(() => g.respecTalents())}">Sıfırla ${ic("coins")}${g.respecCost()}</button>` : ""}</div><div class="tree">` +
        BRANCH_KEYS.map((b) => {
          const B = BRANCHES[b];
          const spent = branchSpent(h.tal, b);
          return `<div class="tb" style="--bc:${B.color}"><div class="tbh">${ic(B.icon)}<b>${B.name}</b><small>${spent} puan</small></div>${[0, 1, 2, 3, 4]
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
      body = `<p class="dim">${cl.name} becerileri savaşta kendiliğinden devreye girer. 3. seviyeden itibaren her seviyede 1 beceri puanı kazanırsın. Bir beceri en fazla ${SKILL_MAX}. seviyeye (Usta) çıkar.</p>
        <div class="stats"><div>${ic("scroll")}Beceri puanı: <b>${h.spts}</b></div></div>` +
        g.classSkills().map((sk) => {
          const lv = g.skillLvOf(sk.id);
          const why = g.learnReason(sk);
          const cur = lv > 0 ? sk.text(skillPow(sk, lv)) : `Açılınca: ${sk.text(skillPow(sk, 1))}`;
          const next = lv > 0 && lv < SKILL_MAX ? `<small class="dim">Sonraki seviye: ${sk.text(skillPow(sk, lv + 1))}</small>` : "";
          return `<div class="brow skill ${lv ? "" : "locked"}">${ic(sk.icon, "bimg")}<div class="bi2"><b>${sk.name} <em>${skillRank(lv)}</em></b><small>${cur}</small>${next}${why && why !== "Beceri puanın yok" ? `<small class="why">${why}</small>` : ""}</div><button class="btn sm plus ${why ? "off" : ""}" data-a="${this.act(() => g.learn(sk.id))}">+</button></div>`;
        }).join("");
    } else if (this.tab === "unvan") {
      body = this.dailyHtml() + this.nemesisHtml() + this.titlesHtml();
    } else if (this.tab === "techizat") {
      const inCity = g.nearCity() >= 0;
      body = `<div class="slots">` + SLOTS.map((sl) => {
        const it = h.equip[sl];
        return `<div class="slot ${it ? "r" + it.rar : ""} ${it?.set || it?.uq ? "leg" : ""}" ${it?.set ? `style="--sc:${SETS[it.set].color}"` : ""} ${it ? `data-a="${this.act(() => g.unequip(sl))}" title="Çıkar"` : ""}>${it ? ic(it.icon, "simg2") : `<span class="empty">${SLOT_NAME[sl]}</span>`}<small>${it ? it.name : "Boş"}</small></div>`;
      }).join("") + `</div><p class="dim">Kuşanılmış bir eşyaya dokunarak çıkarabilirsin. Eşyaları şehirlerde satabilirsin.</p>` + this.setsHtml() +
        (CONSUMABLES.some((c) => s.cons[c.id]) || Object.keys(s.buffs).length
          ? `<h3>${ic("healer")} Çanta</h3>` +
            (Object.keys(s.buffs).length ? `<div class="odds good">Etkin: ${Object.entries(s.buffs).map(([k, n]) => `${CONS_BY_ID[k]?.name ?? k} (${n} savaş)`).join(" · ")}</div>` : "") +
            CONSUMABLES.filter((c) => s.cons[c.id]).map((c) => `<div class="grow">${ic(c.icon, "gimg")}<div class="bi2"><b>${c.name} <em>×${s.cons[c.id]}</em></b><small>${c.desc}</small></div><button class="btn sm go" data-a="${this.act(() => g.useCons(c.id))}">Kullan</button></div>`).join("")
          : "") +
        `<h3>${ic("schest")} Heybe</h3>` +
        (h.bag.map((it) => {
          const cur = h.equip[it.slot];
          const better = !cur || it.atk + it.def + it.hp / 3 + it.spd * 50 + it.lid + it.kar > cur.atk + cur.def + cur.hp / 3 + cur.spd * 50 + cur.lid + cur.kar;
          const ok = !g.canUse(it);
          return this.itemRow(it, `<div class="col2">${ok && better ? `<em class="cheap">▲</em>` : ""}<button class="btn sm ${ok ? "" : "off"}" data-a="${this.act(() => g.equip(it.id))}">Kuşan</button>${inCity ? `<button class="btn sm" data-a="${this.act(() => g.sellItem(it.id))}">${g.itemSellPrice(it)}</button>` : ""}</div>`);
        }).join("") || `<p class="dim">Heyben boş. Haramiler, kamplar ve harabeler eşya düşürür.</p>`) +
        `<h3>${ic("j_caravan")} Yük (${g.cargoUsed()}/${g.carryCap()})</h3>` +
        (GOOD_KEYS.filter((k) => (h.cargo[k] ?? 0) > 0).map((k) => `<div class="qrow">${ic(GOODS[k].icon)} ${GOODS[k].name}<span>${h.cargo[k]} adet · ort. ${Math.round((h.paid[k] ?? 0) / (h.cargo[k] ?? 1))} altın</span></div>`).join("") || `<p class="dim">Yükün boş.</p>`) +
        (s.free ? this.codexHtml() : "");
    } else {
      body = `<div class="stats"><div>${ic("tug")}Birlik: <b>${armySize(h.army)}/${g.heroCap()}</b></div><div>${ic("coins")}Ücret: <b>${g.wagePerMin().toFixed(1)}/dk</b></div><div>${ic("shield")}Toplam güç: <b>${Math.round(g.heroPower())}</b></div></div>
        ${armyHtml(h.army)}
        <h3>${ic("tug")} Yoldaşlar (${s.comps.length})</h3>${s.comps.map((id) => {
          const cp = COMP_BY_ID[id as CompId];
          return cp ? `<div class="comp on"><img src="${assetUrl(cp.icon)}" alt=""><div class="bi2"><b>${cp.name} <em>${cp.role}</em></b><small class="cheap">${cp.perk}</small></div></div>` : "";
        }).join("") || `<p class="dim">Henüz yoldaşın yok. Destan seni yeni dostlarla buluşturacak; bazı şehirlerin hanlarında da yolcular bekler (en fazla ${COMP_MAX} paralı yoldaş).</p>`}
        <p class="dim">${s.free ? "Köylerden gönüllü topla ya da şehir hanlarından paralı asker tut. Askerlerin ücretini altınla ödersin; altının biterse terk ederler. Liderlik birlik sınırını ve askerlerin gücünü artırır." : "Henüz bir kölesin. Hürriyetini kazanınca birlik kurabilirsin."}</p>
        <h3>Toplam</h3><div class="stats"><div>${ic("j_bandit")}Yenilen düşman: <b>${s.kills}</b></div><div>${ic("quest")}Görev: <b>${s.quest}/${g.QUESTS.length}</b></div><div>Ticaret kârı: <b>${s.c.profit}</b></div></div>`;
    }
    const tl = s.title ? titleOf(s.title) : null;
    return this.frame(h.name, s.free ? `Seviye ${h.lv} · ${tl ? `<b class="ttl">${tl.name}</b>` : s.beylik ? "Bey" : "Hür yiğit"}` : `Seviye ${h.lv} · Köle`, assetUrl(g.face()), tabs + body);
  }

  showBattle(title: string, before: Army, enemy: Army, res: BattleResult, hero: { hpBefore: number; maxHp: number }, xp: number, lvUp: boolean, extra: string, boss: Boss | null, foe: string, onClose: () => void): void {
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
      <div class="rlog">Savaş başladı…</div>
      <div class="result"></div>
    </div>`;
    this.root.appendChild(el);
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
      if (i < res.rounds.length - 1) {
        const r = res.rounds[i];
        const p = res.rounds[i - 1];
        setSide(".me", r.a, n0a, r.hp);
        setSide(".foe", r.b, n0b);
        setBoss(r.bhp);
        box.classList.remove("shake");
        void box.offsetWidth;
        box.classList.add("shake");
        audio.play("hit");
        log.textContent = `${r.ev.length ? r.ev.join(" · ") + " — " : ""}${i}. tur: ${p.hp >= r.hp ? `${Math.round(p.hp - r.hp)} hasar aldın` : `${Math.round(r.hp - p.hp)} can yeniledin`}${n0a ? `, ${armySize(p.a) - armySize(r.a)} asker kaybın` : ""} · düşman kaybı ${armySize(p.b) - armySize(r.b)}`;
        i++;
        setTimeout(step, 480);
        return;
      }
      const last = res.rounds[res.rounds.length - 1];
      setSide(".me", last.a, n0a, last.hp);
      setSide(".foe", last.b, n0b);
      setBoss(last.bhp);
      audio.play(res.win ? "win" : "lose");
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

  update(): void {
    const g = this.g;
    const s = g.s;
    const now = performance.now();
    if (g.act) {
      this.actEl.classList.remove("hidden");
      this.actEl.innerHTML = `<b>${g.act.label}…</b>${bar(g.act.t, g.act.dur, "", "")}`;
    } else this.actEl.classList.add("hidden");
    if (now - this.liveT < 250) return;
    this.liveT = now;
    const day = g.dayOf();
    const night = Math.cos(day.t * Math.PI * 2) < -0.3;
    const h = s.hero;
    const showRes = RES_KEYS.filter((k) => k === "gold" || s.res[k] >= 1 || s.beylik);
    this.top.innerHTML =
      showRes.map((k) => {
        const r = g.ratePerMin(k);
        return `<div class="res" title="${RES_NAME[k]}">${ic(RES_ICON[k])}<b>${fmt(s.res[k])}</b>${Math.round(r) ? `<small class="${r < 0 ? "neg" : ""}">${r >= 0 ? "+" : ""}${Math.round(r)}/dk</small>` : ""}</div>`;
      }).join("") +
      `<div class="res vit"><div class="mbar hp"><i style="width:${(h.hp / g.maxHp()) * 100}%"></i><span>❤ ${Math.floor(h.hp)}</span></div><div class="mbar en"><i style="width:${(h.energy / g.maxEnergy()) * 100}%"></i><span>⚡ ${Math.floor(h.energy)}</span></div></div>
       <div class="res hero">${ic(g.face(), "ic round")}<b>Sv ${h.lv}</b>${h.points + h.spts + h.tpts ? `<small class="pts">+${h.points + h.spts + h.tpts}</small>` : ""}${s.wanted ? `<small class="wanted" title="Aranıyorsun">${"★".repeat(s.wanted)}</small>` : ""}</div>
       ${s.free ? `<div class="res">${ic("crown")}<b>${s.renown}</b></div>` : ""}
       <div class="res day">${night ? "🌙" : "☀️"}<b>Gün ${day.day}</b></div>`;
    const q = g.quest();
    this.questEl.innerHTML = q
      ? `${ic("quest", "qi")}<div><small>Görev ${s.quest + 1}/${g.QUESTS.length}</small><b>${q.title}</b><span>${q.text}</span><em>${costHtml(q.reward, g)}</em></div>`
      : `${ic("crown", "qi")}<div><b>Tüm görevler bitti</b><span>Kampları temizle, beyliğini büyüt, batıya doğru keşfet.</span></div>`;
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
      const html = `${ic(ch.img, "qi round")}<div><small>Kara Tamga Destanı · Bölüm ${s.story.ch + 1}/5</small><b>${ch.title}</b><span>${ch.goal}${why ? ` <i class="why">(${why})</i>` : ""}</span></div>`;
      if (this.sagaEl.innerHTML !== html) this.sagaEl.innerHTML = html;
    } else if (lordGoal) {
      const html = `${ic("map/serai", "qi round")}<div><small>Destan sonrası</small><b>İpek Yolu'nun Efendisi</b><span>Semerkant dışındaki ${LORD_SERAIS} şehrin hepsinde kervansaray kur (${g.seraiCount()}/${LORD_SERAIS}).</span></div>`;
      if (this.sagaEl.innerHTML !== html) this.sagaEl.innerHTML = html;
    }
    const r = s.raid;
    const ct = s.contract;
    this.taskEl.classList.toggle("hidden", !r && !ct);
    this.taskEl.classList.toggle("alert", !!r);
    if (r) this.taskEl.innerHTML = `${ic("j_bandit", "qi")}<div><small>Baskın · ${dur(r.until - g.now)}</small><b>${s.villages[r.v].name} yağmalanıyor!</b></div>`;
    else if (ct) this.taskEl.innerHTML = `${ic("j_caravan", "qi")}<div><small>Kervan sözleşmesi · ${dur(ct.until - g.now)}</small><b>${ct.cargo} → ${CITY_NAME[ct.to]}</b></div>`;
    const bld = g.building();
    this.root.querySelector('[data-b="capital"] span')!.textContent = bld ? `⏱ ${dur(s.buildings[bld].until - g.now)}` : "Semerkant";
    const hb = this.root.querySelector('[data-b="hero"]')!;
    (hb.querySelector("img") as HTMLImageElement).src = assetUrl(g.face());
    hb.classList.toggle("pulse", h.points > 0 || g.dailyClaimable());
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
    c.drawImage(this.miniBase, 0, 0);
    c.fillStyle = "rgba(28,20,12,0.88)";
    const ex = g.s.explored;
    const cw = w / NW;
    const ch = h / NH;
    for (let y = 0; y < NH; y += 2)
      for (let x = 0; x < NW; x += 2) if (!ex[y * NW + x]) c.fillRect(x * cw, y * ch, cw * 2 + 0.5, ch * 2 + 0.5);
    const sx = w / W;
    const sy = h / H;
    for (const ci of CITIES) {
      c.fillStyle = ci.id === CAPITAL.id ? "#ffd56a" : "#f2e6c8";
      c.fillRect(ci.x * sx - 2, ci.y * sy - 2, 4, 4);
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
