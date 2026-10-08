import type { Game, Quest, Target } from "../game/game";
import { BUILDINGS, NODE_NAME, RES_ICON, RES_KEYS, RES_NAME, UNITS, UNIT_KEYS, armySize, buildCost, buildTime, prodPerMin, unitUnlocked, xpNeed, type Army, type Res, type Unit } from "../game/data";
import type { BattleResult } from "../game/battle";
import { GOODS, GOOD_KEYS, SKILL_INFO, SKILL_KEYS, SLOTS, SLOT_NAME, STAT_INFO, STAT_KEYS, itemStats, skillLv, skillNext, type Item } from "../game/rpg";
import { CAPITAL } from "../game/state";
import { CITIES, H, NH, NW, W } from "../world/gen";
import { assetUrl } from "../render/worldView";

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

  constructor(private g: Game) {
    this.root.innerHTML = `
      <div class="top"></div>
      <div class="quest"></div>
      <div class="toasts"></div>
      <div class="actbar hidden"></div>
      <div class="bottom">
        <button data-b="capital"><img class="bi" src="${assetUrl("cities/samarkand")}" alt=""><span>Semerkant</span></button>
        <button data-b="hero"><img class="bi round" src="${assetUrl("heroes/slave")}" alt=""><span>Kahraman</span></button>
        <button data-b="find">${ic("tug", "bi")}<span>Birliğim</span></button>
      </div>
      <canvas class="mini" width="220" height="128"></canvas>
      <div class="panel hidden"></div>`;
    this.top = this.root.querySelector(".top")!;
    this.questEl = this.root.querySelector(".quest")!;
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
    });
    this.root.addEventListener("click", (e) => {
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
    if (!g.s.free && g.s.c.shifts === 0 && g.s.quest === 0) {
      setTimeout(
        () =>
          this.story(
            "Kervan Krallık",
            "heroes/slave",
            "Adın Toygar. Bir baskında ailenden koparıldın ve Semerkant'ta bir tüccara köle olarak satıldın.<br><br>Efendin sana bir söz verdi: <b>80 akçe</b> biriktirirsen hürriyetini geri alabilirsin. Şehrin yakınındaki ormanda, taş ocağında ve tarlalarda çalış, her vardiyada birkaç akçe kazan.<br><br>Özgürlüğünü kazandıktan sonra İpek Yolu seni bekliyor: silah al, talim yap, ticaret yap, haramileri yen ve bir gün kendi beyliğini kur.",
            "Çalışmaya başla",
          ),
        400,
      );
    }
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
    const el = document.createElement("div");
    el.className = "toast " + kind;
    el.textContent = text;
    this.toasts.appendChild(el);
    while (this.toasts.children.length > 3) this.toasts.firstElementChild!.remove();
    setTimeout(() => el.classList.add("out"), 2800);
    setTimeout(() => el.remove(), 3300);
  }

  story(title: string, img: string, html: string, btn = "Devam"): void {
    this.storyOpen = true;
    const el = document.createElement("div");
    el.className = "battle";
    el.innerHTML = `<div class="bbox story"><img class="simg" src="${assetUrl(img)}" alt=""><h2>${title}</h2><p>${html}</p><button class="btn go big">${btn}</button></div>`;
    this.root.appendChild(el);
    el.querySelector(".btn")!.addEventListener("click", () => {
      el.remove();
      this.storyOpen = false;
    });
  }

  questDone(q: Quest): void {
    const el = document.createElement("div");
    el.className = "qdone";
    el.innerHTML = `${ic("quest", "qi")}<div><small>Görev tamamlandı</small><b>${q.title}</b><span>${costHtml(q.reward, this.g)}</span></div>`;
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
          const k = Math.min(n, v.rec, room);
          return `<button class="btn ${k <= 0 || !near || !s.free ? "off" : ""}" data-a="${this.act(() => g.recruit(t.i, k))}">${label} (${k}) ${ic("coins")}${k * cost}</button>`;
        };
        html = this.frame(v.name, v.yurt ? "Göçebe obası" : "Köy", assetUrl(v.yurt ? "map/yurts" : "map/village"), `
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
    list.push(["pazar", "Pazar"], ["demirci", "Demirci"], ["talim", "Talim"], ["han", "Han"]);
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
          const tag = rel < 0.75 ? `<em class="cheap">ucuz</em>` : rel > 1.3 ? `<em class="dear">pahalı</em>` : "";
          return `<div class="grow">${ic(GOODS[k].icon, "gimg")}<div class="bi2"><b>${GOODS[k].name} ${tag}</b><small>Al ${bp} · Sat ${sp}${have ? ` · Elinde ${have} (ort. ${avg})` : ""}</small></div>
            <div class="col2"><button class="btn sm ${off}" data-a="${this.act(() => g.buyGood(c.id, k, 1))}">Al</button><button class="btn sm ${off}" data-a="${this.act(() => g.buyGood(c.id, k, 5))}">Al 5</button><button class="btn sm ${!near || !have ? "off" : ""}" data-a="${this.act(() => g.sellGood(c.id, k, have))}">Sat</button></div></div>`;
        }).join("") +
        `<h3>Ham madde sat</h3><div class="row">${(["wood", "stone", "food"] as const).map((k) => `<button class="btn ${!near || s.res[k] < 1 ? "off" : ""}" data-a="${this.act(() => g.sellRes(k, s.res[k]))}">${ic(RES_ICON[k])} ${fmt(s.res[k])} sat · ${g.resPrice(k)}/adet</button>`).join("")}</div>`;
    } else if (this.tab === "demirci") {
      const items = g.smith(c.id);
      const row = (it: Item, right: string) => `<div class="grow">${ic(it.icon, "gimg")}<div class="bi2"><b class="r${it.rar}">${it.name}</b><small>${SLOT_NAME[it.slot]} · ${itemStats(it)}</small></div>${right}</div>`;
      body = `${nearNote}<p class="dim">Demircinin malları iki günde bir yenilenir. Uzak ve büyük şehirlerde daha iyi eşyalar bulunur.</p>
        <h3>${ic("anvil")} Satılık</h3>` +
        (items.map((it) => row(it, `<button class="btn sm ${!near || s.res.gold < g.itemBuyPrice(it) ? "off" : ""}" data-a="${this.act(() => g.buyItem(c.id, it.id))}">${ic("coins")}${g.itemBuyPrice(it)}</button>`)).join("") || "<p>Demircide mal kalmadı.</p>") +
        `<h3>${ic("schest")} Heybendeki eşyalar</h3>` +
        (s.hero.bag.map((it) => row(it, `<button class="btn sm ${off}" data-a="${this.act(() => g.sellItem(it.id))}">Sat ${ic("coins")}${g.itemSellPrice(it)}</button>`)).join("") || `<p class="dim">Heyben boş.</p>`);
    } else if (this.tab === "talim") {
      const cost = g.trainCostGold();
      const sk = (k: "kilic" | "ok") => {
        const xp = s.hero.skills[k];
        const lv = skillLv(xp);
        return `<div class="brow">${ic(SKILL_INFO[k].icon, "bimg")}<div class="bi2"><b>${SKILL_INFO[k].name} <em>Sv ${lv}</em></b>${bar(xp - 20 * lv * lv, skillNext(lv) - 20 * lv * lv, "", `${xp}/${skillNext(lv)}`)}<small>Her seviye o silahla verdiğin hasarı %6 artırır.</small></div>
          <button class="btn ${!near || !s.free || g.act ? "off" : ""}" data-a="${this.act(() => g.trainSkill(k))}">Talim<br>${ic("coins")}${cost}</button></div>`;
      };
      body = `${nearNote}${ic("arena", "banner")}<p>Talim meydanındaki ustalar parasını verene ders verir. Her talim 6 saniye sürer ve 15 enerji harcar.</p>
        ${!s.free ? `<p class="warn">Köleler talim meydanına giremez.</p>` : ""}
        ${bar(s.hero.energy, g.maxEnergy(), "en", `Enerji ${Math.floor(s.hero.energy)}/${g.maxEnergy()}`)}${sk("kilic")}${sk("ok")}`;
    } else if (this.tab === "han") {
      const room = g.heroCap() - armySize(s.hero.army);
      const hire = (u: Unit) => {
        const k = Math.min(5, room);
        return `<button class="btn ${!near || k <= 0 || !s.free ? "off" : ""}" data-a="${this.act(() => g.hire(u, k))}">${ic(UNITS[u].icon)} ${k} ${UNITS[u].name} · ${ic("coins")}${g.hireCost(u) * k}</button>`;
      };
      const bl = g.cityBounties(c.id);
      body = `${nearNote}<div class="brow">${ic("han", "bimg")}<div class="bi2"><b>Kervansaray odası</b><small>Canını ve enerjini tamamen doldurur.</small></div><button class="btn ${!near || g.act ? "off" : ""}" data-a="${this.act(() => g.rest())}">Uyu ${ic("coins")}${g.restCost()}</button></div>
        <h3>${ic("wanted")} Ödül ilanları</h3>` +
        (bl.map(({ b, i }) => {
          const cp = s.camps[b.camp];
          return `<div class="grow">${ic("j_bandit", "gimg")}<div class="bi2"><b>${cp.name} <em>Sv ${cp.tier}</em></b><small>Ödül: ${b.gold} altın · ${b.renown} şöhret</small></div>${b.taken ? `<button class="btn sm" data-a="${this.act(() => { this.close(); g.cam.flyTo(cp.x, cp.y, 0.8); })}">Göster</button>` : `<button class="btn sm ${!near || !s.free ? "off" : ""}" data-a="${this.act(() => g.takeBounty(i))}">İlanı al</button>`}</div>`;
        }).join("") || `<p class="dim">Şu an ilan yok.</p>`) +
        `<h3>${ic("merc")} Paralı askerler</h3><p class="dim">Askerlerin günlük ücret ister. Altının biterse terk ederler.</p><div class="col">${hire("spear")}${hire("archer")}${hire("horse")}</div>`;
    } else if (this.tab === "beylik") {
      const bc = g.beylikCost();
      const ok = near && s.renown >= bc.renown && s.res.gold >= bc.gold;
      body = `${ic("fortress", "banner")}<p>Yeterince ün ve servet kazandığında Semerkant'ın dışındaki topraklarda kendi beyliğini kurabilirsin. Beylik; binalar, üretim, kışla ve toplama seferlerini açar.</p>
        ${bar(s.renown, bc.renown, "", `Şöhret ${s.renown}/${bc.renown}`)}${bar(s.res.gold, bc.gold, "", `Altın ${fmt(s.res.gold)}/${bc.gold}`)}
        <button class="btn go big ${ok ? "" : "off"}" data-a="${this.act(() => g.foundBeylik())}">${ic("crown")} Beyliği kur</button>
        <p class="dim">Şöhret; haramileri yenerek, kampları yıkarak ve ödül ilanlarını tamamlayarak kazanılır.</p>`;
    } else body = this.beylikTabs();
    const sub = isCap ? (s.beylik ? `Beyliğinin merkezi · Saray Sv ${g.bld("saray")}` : !s.free ? "Efendinin şehri" : "İpek Yolu şehri") : "İpek Yolu şehri";
    return this.frame(g.cityName(ci), sub, assetUrl("cities/" + c.id), tabs + body);
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
    const tabs = this.tabs([["karakter", "Karakter"], ["techizat", `Teçhizat${h.bag.length ? ` (${h.bag.length})` : ""}`], ["ordu", "Birlik"]]);
    let body = "";
    if (this.tab === "karakter") {
      body = `${bar(h.xp, need, "", `Seviye ${h.lv} · ${h.xp}/${need} TP`)}
        ${h.points > 0 ? `<div class="odds good">Dağıtılacak <b>${h.points}</b> stat puanın var!</div>` : ""}
        <h3>Özellikler</h3>` +
        STAT_KEYS.map((k) => {
          const bonus = g.stat(k) - h.stats[k];
          return `<div class="srow">${ic(STAT_INFO[k].icon, "gimg")}<div class="bi2"><b>${STAT_INFO[k].name} <em>${h.stats[k]}${bonus ? ` +${bonus}` : ""}</em></b><small>${STAT_INFO[k].desc}</small></div><button class="btn sm plus ${h.points > 0 ? "" : "off"}" data-a="${this.act(() => g.statUp(k))}">+</button></div>`;
        }).join("") +
        `<h3>Savaş</h3><div class="stats"><div>${ic("swords")}Saldırı <b>${g.heroAtk().toFixed(1)}</b></div><div>${ic("shield")}Savunma <b>${g.heroDef().toFixed(1)}</b></div><div>Can <b>${Math.floor(h.hp)}/${g.maxHp()}</b></div><div>Enerji <b>${Math.floor(h.energy)}/${g.maxEnergy()}</b></div><div>${ic("tug")}Birlik sınırı <b>${g.heroCap()}</b></div><div>${ic("j_caravan")}Yük <b>${g.carryCap()}</b></div><div>${ic("crown")}Şöhret <b>${s.renown}</b></div></div>
        <h3>Beceriler</h3>` +
        SKILL_KEYS.map((k) => {
          const xp = h.skills[k];
          const lv = skillLv(xp);
          return `<div class="srow">${ic(SKILL_INFO[k].icon, "gimg")}<div class="bi2"><b>${SKILL_INFO[k].name} <em>Sv ${lv}</em></b>${bar(xp - 20 * lv * lv, skillNext(lv) - 20 * lv * lv, "", `${xp}/${skillNext(lv)}`)}<small>${SKILL_INFO[k].desc}</small></div></div>`;
        }).join("");
    } else if (this.tab === "techizat") {
      const inCity = g.nearCity() >= 0;
      body = `<div class="slots">` + SLOTS.map((sl) => {
        const it = h.equip[sl];
        return `<div class="slot ${it ? "r" + it.rar : ""}" ${it ? `data-a="${this.act(() => g.unequip(sl))}" title="Çıkar"` : ""}>${it ? ic(it.icon, "simg2") : `<span class="empty">${SLOT_NAME[sl]}</span>`}<small>${it ? it.name : "Boş"}</small></div>`;
      }).join("") + `</div><p class="dim">Kuşanılmış bir eşyaya dokunarak çıkarabilirsin. Eşyaları şehirlerde satabilirsin.</p><h3>${ic("schest")} Heybe</h3>` +
        (h.bag.map((it) => {
          const cur = h.equip[it.slot];
          const better = !cur || it.atk + it.def + it.hp / 3 + it.spd * 50 + it.lid + it.kar > cur.atk + cur.def + cur.hp / 3 + cur.spd * 50 + cur.lid + cur.kar;
          return `<div class="grow">${ic(it.icon, "gimg")}<div class="bi2"><b class="r${it.rar}">${it.name} ${better ? `<em class="cheap">▲</em>` : ""}</b><small>${SLOT_NAME[it.slot]} · ${itemStats(it)}</small></div><div class="col2"><button class="btn sm" data-a="${this.act(() => g.equip(it.id))}">Kuşan</button>${inCity ? `<button class="btn sm" data-a="${this.act(() => g.sellItem(it.id))}">${g.itemSellPrice(it)}</button>` : ""}</div></div>`;
        }).join("") || `<p class="dim">Heyben boş. Haramiler, kamplar ve harabeler eşya düşürür.</p>`) +
        `<h3>${ic("j_caravan")} Yük (${g.cargoUsed()}/${g.carryCap()})</h3>` +
        (GOOD_KEYS.filter((k) => (h.cargo[k] ?? 0) > 0).map((k) => `<div class="qrow">${ic(GOODS[k].icon)} ${GOODS[k].name}<span>${h.cargo[k]} adet · ort. ${Math.round((h.paid[k] ?? 0) / (h.cargo[k] ?? 1))} altın</span></div>`).join("") || `<p class="dim">Yükün boş.</p>`);
    } else {
      body = `<div class="stats"><div>${ic("tug")}Birlik: <b>${armySize(h.army)}/${g.heroCap()}</b></div><div>${ic("coins")}Ücret: <b>${g.wagePerMin().toFixed(1)}/dk</b></div><div>${ic("shield")}Toplam güç: <b>${Math.round(g.heroPower())}</b></div></div>
        ${armyHtml(h.army)}
        <p class="dim">${s.free ? "Köylerden gönüllü topla ya da şehir hanlarından paralı asker tut. Askerlerin ücretini altınla ödersin; altının biterse terk ederler. Liderlik birlik sınırını ve askerlerin gücünü artırır." : "Henüz bir kölesin. Hürriyetini kazanınca birlik kurabilirsin."}</p>
        <h3>Toplam</h3><div class="stats"><div>${ic("j_bandit")}Yenilen düşman: <b>${s.kills}</b></div><div>${ic("quest")}Görev: <b>${s.quest}/${g.QUESTS.length}</b></div><div>Ticaret kârı: <b>${s.c.profit}</b></div></div>`;
    }
    return this.frame(h.name, s.free ? `Seviye ${h.lv} · ${s.beylik ? "Bey" : "Hür yiğit"}` : `Seviye ${h.lv} · Köle`, assetUrl(s.free ? "heroes/hero1" : "heroes/slave"), tabs + body);
  }

  showBattle(title: string, before: Army, enemy: Army, res: BattleResult, hero: { hpBefore: number; maxHp: number }, xp: number, lvUp: boolean, extra: string, onClose: () => void): void {
    this.battleOpen = true;
    this.close();
    const el = document.createElement("div");
    el.className = "battle";
    const n0a = armySize(before);
    const n0b = armySize(enemy);
    const face = this.g.s.free ? "heroes/hero1" : "heroes/slave";
    el.innerHTML = `<div class="bbox">
      <h2>${ic("swords")} ${title}</h2>
      <div class="sides">
        <div class="side me">${ic(face, "bp")}<b>${this.g.s.hero.name}</b><div class="bar hero"><i></i><span></span></div>${n0a ? `<div class="bar hp"><i></i></div>` : ""}<div class="arm"></div></div>
        <div class="vs">VS</div>
        <div class="side foe">${ic("j_bandit", "bp")}<b>Haramiler</b><div class="bar hp foe"><i></i></div><div class="arm"></div></div>
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
    setSide(".me", before, n0a, hero.hpBefore);
    setSide(".foe", enemy, n0b);
    let i = 1;
    const log = el.querySelector(".rlog")!;
    const box = el.querySelector(".bbox") as HTMLElement;
    const step = () => {
      if (i < res.rounds.length - 1) {
        const r = res.rounds[i];
        const p = res.rounds[i - 1];
        setSide(".me", r.a, n0a, r.hp);
        setSide(".foe", r.b, n0b);
        box.classList.remove("shake");
        void box.offsetWidth;
        box.classList.add("shake");
        log.textContent = `${i}. tur — ${Math.round(p.hp - r.hp)} hasar aldın${n0a ? `, ${armySize(p.a) - armySize(r.a)} asker kaybın` : ""} · düşman kaybı ${armySize(p.b) - armySize(r.b)}`;
        i++;
        setTimeout(step, 480);
        return;
      }
      const last = res.rounds[res.rounds.length - 1];
      setSide(".me", last.a, n0a, last.hp);
      setSide(".foe", last.b, n0b);
      log.textContent = res.win ? "Düşman kaçıyor!" : res.heroDown ? "Yere düştün…" : "Geri çekilmek zorunda kaldın.";
      el.querySelector(".result")!.innerHTML = `
        <div class="rt ${res.win ? "win" : "lose"}">${res.win ? "ZAFER" : "YENİLGİ"}</div>
        <div class="stats"><div>Kayıpların: <b>${armySize(res.lostA)}</b></div><div>Düşman kaybı: <b>${armySize(res.lostB)}</b></div><div>${ic("scroll")}+${xp} TP${lvUp ? " · <b class='gold'>SEVİYE ATLADIN!</b>" : ""}</div></div>
        ${extra ? `<p class="loot">${extra}</p>` : ""}
        <button class="btn go big">Devam</button>`;
      el.querySelector(".result .btn")!.addEventListener("click", () => {
        el.remove();
        this.battleOpen = false;
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
       <div class="res hero">${ic(s.free ? "heroes/hero1" : "heroes/slave", "ic round")}<b>Sv ${h.lv}</b>${h.points ? `<small class="pts">+${h.points}</small>` : ""}</div>
       ${s.free ? `<div class="res">${ic("crown")}<b>${s.renown}</b></div>` : ""}
       <div class="res day">${night ? "🌙" : "☀️"}<b>Gün ${day.day}</b></div>`;
    const q = g.quest();
    this.questEl.innerHTML = q
      ? `${ic("quest", "qi")}<div><small>Görev ${s.quest + 1}/${g.QUESTS.length}</small><b>${q.title}</b><span>${q.text}</span><em>${costHtml(q.reward, g)}</em></div>`
      : `${ic("crown", "qi")}<div><b>Tüm görevler bitti</b><span>Kampları temizle, beyliğini büyüt, batıya doğru keşfet.</span></div>`;
    const bld = g.building();
    this.root.querySelector('[data-b="capital"] span')!.textContent = bld ? `⏱ ${dur(s.buildings[bld].until - g.now)}` : "Semerkant";
    const hb = this.root.querySelector('[data-b="hero"]')!;
    (hb.querySelector("img") as HTMLImageElement).src = assetUrl(s.free ? "heroes/hero1" : "heroes/slave");
    hb.classList.toggle("pulse", h.points > 0);
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
