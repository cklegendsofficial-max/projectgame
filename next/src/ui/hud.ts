import type { Game, Quest, Target } from "../game/game";
import { BUILDINGS, NODE_NAME, RES_ICON, RES_KEYS, RES_NAME, UNITS, UNIT_KEYS, armyPower, armySize, buildCost, buildTime, prodPerMin, unitUnlocked, xpNeed, type Army, type Res, type Unit } from "../game/data";
import type { BattleResult } from "../game/battle";
import { CAPITAL } from "../game/state";
import { CITIES, H, NH, NW, W } from "../world/gen";
import { assetUrl } from "../render/worldView";

const ic = (k: string, cls = "ic") => `<img class="${cls}" src="${assetUrl(k)}" alt="">`;

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

export class Hud {
  private root = document.getElementById("hud")!;
  private top!: HTMLElement;
  private questEl!: HTMLElement;
  private panel!: HTMLElement;
  private toasts!: HTMLElement;
  private mini!: HTMLCanvasElement;
  private miniBase!: HTMLCanvasElement;
  private acts = new Map<string, () => void>();
  private actN = 0;
  private place: Target | null = null;
  private tab = "bina";
  private liveT = 0;
  private miniT = 0;
  private panelT = 0;
  private holding = false;
  private sel: Army = { spear: 0, archer: 0, horse: 0 };
  private battleOpen = false;

  constructor(private g: Game) {
    this.root.innerHTML = `
      <div class="top"></div>
      <div class="quest"></div>
      <div class="toasts"></div>
      <div class="bottom">
        <button data-b="capital">${ic("castle_btn", "bi")}<span>Başkent</span></button>
        <button data-b="hero">${ic("heroes/hero1", "bi round")}<span>Kahraman</span></button>
        <button data-b="find">${ic("tug", "bi")}<span>Birliğim</span></button>
      </div>
      <canvas class="mini" width="220" height="128"></canvas>
      <div class="panel hidden"></div>`;
    this.top = this.root.querySelector(".top")!;
    this.questEl = this.root.querySelector(".quest")!;
    this.panel = this.root.querySelector(".panel")!;
    this.toasts = this.root.querySelector(".toasts")!;
    this.mini = this.root.querySelector(".mini")!;
    (this.root.querySelector('[data-b="capital"] img') as HTMLImageElement).src = assetUrl("cities/samarkand");
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
    const miniGo = (e: PointerEvent) => {
      const r = this.mini.getBoundingClientRect();
      g.cam.flyTo(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
    };
    this.mini.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      miniGo(e);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
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
    return !this.panel.classList.contains("hidden") || this.battleOpen;
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
    if (this.place?.kind !== t.kind) this.tab = "bina";
    this.place = t;
    this.sel = { spear: 0, archer: 0, horse: 0 };
    if (t.kind === "node") {
      const s = this.g.s.garrison;
      const n = Math.min(armySize(s), 20);
      this.sel = { spear: Math.min(s.spear, n), archer: 0, horse: 0 };
    }
    this.panel.classList.remove("hidden");
    this.render();
  }

  private openHero(): void {
    this.place = { kind: "point", x: -1, y: -1 };
    this.panel.classList.remove("hidden");
    this.render();
  }

  private frame(title: string, sub: string, img: string, body: string): string {
    return `<div class="ph"><img class="pimg" src="${img}" alt=""><div><h2>${title}</h2><small>${sub}</small></div><button class="x" data-a="${this.act(() => this.close())}">✕</button></div><div class="pb">${body}</div>`;
  }

  private render(): void {
    const t = this.place;
    if (!t) return;
    this.acts.clear();
    const g = this.g;
    const s = g.s;
    let html = "";
    switch (t.kind) {
      case "point":
        html = this.heroHtml();
        break;
      case "capital":
        html = this.capitalHtml();
        break;
      case "village": {
        const v = s.villages[t.i];
        const room = g.heroCap() - armySize(s.hero.army);
        const near = Math.hypot(v.x - s.hero.x, v.y - s.hero.y) < 80;
        const btn = (n: number, label: string) => {
          const k = Math.min(n, v.rec, room);
          return `<button class="btn ${k <= 0 || !near ? "off" : ""}" data-a="${this.act(() => g.recruit(t.i, k))}">${label} (${k}) ${ic("coins")}${k * 6}</button>`;
        };
        html = this.frame(v.name, v.yurt ? "Göçebe obası" : "Köy", assetUrl(v.yurt ? "map/yurts" : "map/village"), `
          <p>Köylüler kervan yollarını haramilerden temizleyen bir beye gönüllü yazılır. Ne kadar çok asker alırsan köyün sana bağlılığı o kadar artar.</p>
          <div class="stats"><div>${ic("soldier")}Gönüllü: <b>${v.rec}</b></div><div>${ic("crown")}Bağlılık: <b>${v.rep}</b>/100</div><div>${ic("tug")}Birlik: <b>${armySize(s.hero.army)}/${g.heroCap()}</b></div></div>
          ${v.rec < 6 + Math.floor(v.rep / 10) ? `<p class="dim">Yeni gönüllü: ${dur(v.recAt - g.now)}</p>` : ""}
          ${near ? "" : `<p class="warn">Gönüllü toplamak için birliğinle köye gitmelisin.</p>`}
          <div class="row">${btn(1, "1 al")}${btn(5, "5 al")}${btn(99, "Hepsi")}</div>
          ${near ? "" : `<button class="btn go" data-a="${this.act(() => { g.goTo(t); this.close(); })}">Köye yürü</button>`}`);
        break;
      }
      case "city": {
        const c = CITIES[t.i];
        const near = Math.hypot(c.x - s.hero.x, c.y - s.hero.y) < 140;
        const room = g.heroCap() - armySize(s.hero.army);
        const hire = (u: Unit) => {
          const k = Math.min(5, room);
          return `<button class="btn ${!near || k <= 0 ? "off" : ""}" data-a="${this.act(() => g.hire(u, k))}">${ic(UNITS[u].icon)} ${k} ${UNITS[u].name} · ${ic("coins")}${g.hireCost(u) * k}</button>`;
        };
        html = this.frame(g.cityName(t.i), "İpek Yolu şehri", assetUrl("cities/" + c.id), `
          <p>Şehrin hanlarında paralı askerler iş bekliyor. Pazarda haramilerden aldığın ganimetleri satabilirsin.</p>
          ${near ? "" : `<p class="warn">Şehirde iş yapmak için birliğinle şehre gitmelisin.</p>`}
          <h3>${ic("merc")} Paralı asker</h3>
          <div class="col">${hire("spear")}${hire("archer")}${hire("horse")}</div>
          <h3>${ic("trophy")} Ganimet pazarı</h3>
          <button class="btn ${!near || s.hero.trophies <= 0 ? "off" : ""}" data-a="${this.act(() => this.toast(`Ganimetler satıldı: +${g.sellTrophies()} altın`, "good"))}">${s.hero.trophies} ganimet sat · ${ic("coins")}${s.hero.trophies * 45}</button>
          ${near ? "" : `<button class="btn go" data-a="${this.act(() => { g.goTo(t); this.close(); })}">Şehre yürü</button>`}`);
        break;
      }
      case "camp": {
        const c = s.camps[t.i];
        const near = Math.hypot(c.x - s.hero.x, c.y - s.hero.y) < 90;
        const p = Math.round(g.odds(c.garrison, 0.1) * 100);
        html = this.frame(c.name, `Harami kampı · Seviye ${c.tier}`, assetUrl("map/camp"), c.alive ? `
          <p>Bu kamptan çıkan çeteler yolları ve köyleri yağmalıyor. Kampı yerle bir edersen bölge bir süre güvende olur.</p>
          <h3>Kamp muhafızları</h3>${armyHtml(c.garrison, "enemy")}
          <h3>Senin birliğin</h3>${armyHtml(s.hero.army)}
          <div class="odds ${p >= 65 ? "good" : p >= 35 ? "mid" : "bad"}">Zafer şansı: <b>%${p}</b></div>
          <p class="dim">Mızraklı atlıyı, okçu mızraklıyı, atlı okçuyu yener.</p>
          ${near ? `<button class="btn red big" data-a="${this.act(() => { this.close(); g.attackCamp(t.i); })}">${ic("swords")} Saldır!</button>` : `<button class="btn go" data-a="${this.act(() => { g.goTo(t); this.close(); })}">Kampa yürü</button>`}` : `<p>Kamp yerle bir edildi. Haramiler ${dur(c.respawnAt - g.now)} sonra geri dönebilir.</p>`);
        break;
      }
      case "node": {
        const n = s.nodes[t.i];
        const slots = g.marchSlots();
        const busy = s.marches.some((m) => m.node === t.i);
        const gar = s.garrison;
        const sliders = UNIT_KEYS.map((u) => `<label class="sl">${ic(UNITS[u].icon)}<input type="range" min="0" max="${gar[u]}" value="${Math.min(this.sel[u], gar[u])}" data-u="${u}"><b data-o="${u}">${Math.min(this.sel[u], gar[u])}</b><small>/${gar[u]}</small></label>`).join("");
        html = this.frame(NODE_NAME[n.kind], `Seviye ${n.lv} kaynak noktası`, assetUrl("map/" + ({ food: "farm", wood: "forest", stone: "quarry", gold: "mine" } as const)[n.kind]), `
          <p>Başkentteki garnizondan bir toplama seferi gönder. Askerler yürüyerek gelir, kaynağı toplar ve geri taşır. Her asker türü farklı yük taşır.</p>
          <div class="stats"><div>${ic(RES_ICON[n.kind])}Kalan: <b>${fmt(n.left)}</b>/${fmt(n.max)}</div><div>${ic("j_caravan")}Seferler: <b>${s.marches.length}/${slots}</b></div></div>
          ${n.left <= 0 ? `<p class="warn">Kaynak tükendi. ${dur(n.regenAt - g.now)} sonra yenilenir.</p>` : busy ? `<p class="warn">Bu noktaya zaten bir sefer gidiyor.</p>` : `
          <h3>Sefer birliği (başkent garnizonu)</h3>${sliders}
          <div class="stats"><div>Taşıma kapasitesi: <b data-load>${fmt(g.marchLoad(this.sel))}</b></div></div>
          <button class="btn go big ${s.marches.length >= slots ? "off" : ""}" data-a="${this.act(() => {
            if (g.sendMarch(t.i, { ...this.sel })) {
              this.toast("Toplama seferi yola çıktı", "good");
              this.close();
            } else this.toast("Sefer gönderilemedi: asker seç", "bad");
          })}">${ic("j_caravan")} Sefer gönder</button>`}`);
        break;
      }
      case "ruin": {
        const r = s.ruins[t.i];
        const near = Math.hypot(r.x - s.hero.x, r.y - s.hero.y) < 80;
        html = this.frame("Antik Harabe", "Unutulmuş bir kervansaray", assetUrl("map/ruins"), r.looted ? "<p>Burası çoktan yağmalanmış.</p>" : `
          <p>Yıkık duvarların arasında eski tüccarların sakladığı hazineler olabilir.</p>
          ${near ? `<button class="btn go big" data-a="${this.act(() => { this.toast(g.lootRuin(t.i), "good"); this.close(); })}">${ic("chest")} Harabeyi ara</button>` : `<button class="btn go" data-a="${this.act(() => { g.goTo(t); this.close(); })}">Harabeye yürü</button>`}`);
        break;
      }
    }
    this.panel.innerHTML = html;
  }

  private heroHtml(): string {
    const g = this.g;
    const h = g.s.hero;
    const need = xpNeed(h.lv);
    return this.frame(h.name, `Seviye ${h.lv} kahraman`, assetUrl("heroes/hero1"), `
      <div class="bar"><i style="width:${(h.xp / need) * 100}%"></i><span>${h.xp}/${need} TP</span></div>
      <div class="stats"><div>${ic("swords")}Saldırı bonusu: <b>+%${Math.round(g.heroBonus() * 100)}</b></div><div>${ic("tug")}Birlik: <b>${armySize(h.army)}/${g.heroCap()}</b></div><div>${ic("shield")}Güç: <b>${Math.round(armyPower(h.army, g.heroBonus()))}</b></div><div>${ic("trophy")}Ganimet: <b>${h.trophies}</b></div></div>
      <h3>Birlik</h3>${armyHtml(h.army)}
      <p class="dim">Kahramanın savaştıkça seviye atlar. Her seviye birliğin gücünü ve taşıyabileceği asker sayısını artırır. Asker kaybını köylerden gönüllü toplayarak, şehirlerden paralı asker tutarak ya da başkentte eğiterek telafi et.</p>
      <h3>Toplam</h3><div class="stats"><div>${ic("j_bandit")}Yenilen düşman: <b>${g.s.kills}</b></div><div>${ic("quest")}Görev: <b>${g.s.quest}/${g.QUESTS.length}</b></div></div>`);
  }

  private capitalHtml(): string {
    const g = this.g;
    const s = g.s;
    const tabs = [["bina", "Binalar"], ["egit", "Kışla"], ["ordu", "Ordu"], ["sefer", "Seferler"]]
      .map(([id, n]) => `<button class="tab ${this.tab === id ? "on" : ""}" data-a="${this.act(() => (this.tab = id))}">${n}</button>`)
      .join("");
    let body = "";
    if (this.tab === "bina") {
      const cur = g.building();
      body = BUILDINGS.map((b) => {
        const st = s.buildings[b.id];
        const next = st.lv + 1;
        const why = g.upgradeReason(b.id);
        const prod = b.produces ? `<small>${ic(RES_ICON[b.produces])} ${prodPerMin(b, st.lv)}/dk → ${prodPerMin(b, next)}/dk</small>` : `<small>${b.desc}</small>`;
        const right = st.until
          ? `<div class="timer"><div class="bar"><i style="width:${100 - ((st.until - g.now) / (buildTime(next) * 1000)) * 100}%"></i><span>${dur(st.until - g.now)}</span></div></div>`
          : `<div class="bcost">${costHtml(buildCost(b, next), g)}<small>⏱ ${dur(buildTime(next) * 1000)}</small></div><button class="btn ${why ? "off" : ""}" title="${why ?? ""}" data-a="${this.act(() => g.upgrade(b.id))}">${st.lv === 0 ? "İnşa et" : "Geliştir"}</button>`;
        const whyHtml = why && !st.until && why !== "Bir inşaat sürüyor" ? `<small class="why">${why}</small>` : "";
        return `<div class="brow ${cur === b.id ? "busy" : ""}">${ic(b.icon, "bimg")}<div class="bi2"><b>${b.name} <em>Sv ${st.lv}</em></b>${prod}${whyHtml}</div>${right}</div>`;
      }).join("");
      body = `<p class="dim">Aynı anda tek bina geliştirilebilir. Diğer binalar Saray seviyesini geçemez.</p>${body}`;
    } else if (this.tab === "egit") {
      const kl = g.bld("kisla");
      body = `<div class="stats"><div>${ic("soldier")}Garnizon: <b>${armySize(s.garrison)}</b></div><div>Kuyruk: <b>${s.queue.length}/3</b></div></div>` + UNIT_KEYS.map((u) => {
        const ok = unitUnlocked(u, kl);
        const d = UNITS[u];
        const btn = (n: number) => `<button class="btn ${!ok || s.queue.length >= 3 || !g.canAfford(g.trainCost(u, n)) ? "off" : ""}" data-a="${this.act(() => g.train(u, n) && this.toast(`${n} ${d.name} eğitime başladı`, "info"))}">+${n}</button>`;
        return `<div class="brow">${ic(d.icon, "bimg")}<div class="bi2"><b>${d.name}</b><small>Can ${d.hp} · Saldırı ${d.atk} · Yük ${d.load} · ${UNITS[d.beats].name} karşısında güçlü</small><div class="bcost">${costHtml(g.trainCost(u, 1), g)}<small>/asker</small></div></div>${ok ? `<div class="col2">${btn(5)}${btn(10)}${btn(25)}</div>` : `<div class="lockd">${ic("lock")}Kışla Sv ${u === "archer" ? 2 : 4}</div>`}</div>`;
      }).join("") + s.queue.map((o, i) => `<div class="qrow">${ic(UNITS[o.unit].icon)} ${o.n} ${UNITS[o.unit].name}<span>${i === 0 ? dur(o.done - g.now) : "sırada"}</span></div>`).join("");
    } else if (this.tab === "ordu") {
      const at = g.atCapital();
      const room = g.heroCap() - armySize(s.hero.army);
      body = `<p class="dim">${at ? "Askerleri garnizon ile kahramanın birliği arasında aktar." : "Asker aktarmak için kahramanın başkentte olmalı."}</p>
        <div class="stats"><div>${ic("tug")}Birlik: <b>${armySize(s.hero.army)}/${g.heroCap()}</b></div><div>${ic("food")}Asker gideri: <b>${g.upkeepPerMin().toFixed(0)}/dk</b></div></div>` + UNIT_KEYS.map((u) => `
        <div class="brow">${ic(UNITS[u].icon, "bimg")}<div class="bi2"><b>${UNITS[u].name}</b><small>Garnizon ${s.garrison[u]} · Birlik ${s.hero.army[u]}</small></div>
        <div class="col2"><button class="btn ${!at || s.hero.army[u] <= 0 ? "off" : ""}" data-a="${this.act(() => g.transfer(u, -10))}">◀ 10</button><button class="btn ${!at || s.garrison[u] <= 0 || room <= 0 ? "off" : ""}" data-a="${this.act(() => g.transfer(u, 10))}">10 ▶</button></div></div>`).join("") +
        (at ? "" : `<button class="btn go" data-a="${this.act(() => { g.goTo({ kind: "capital" }); this.close(); })}">Başkente dön</button>`);
    } else {
      body = `<div class="stats"><div>${ic("j_caravan")}Sefer hakkı: <b>${s.marches.length}/${g.marchSlots()}</b></div></div><p class="dim">Haritadaki bir kaynak noktasına (tarla, orman, taş ocağı, maden) dokunarak toplama seferi gönder. Saray her 3 seviyede bir sefer hakkı verir.</p>` +
        (s.marches.map((m) => {
          const n = s.nodes[m.node];
          const st = m.phase === "go" ? "Yolda" : m.phase === "gather" ? `Topluyor · ${dur(m.until - g.now)}` : `Dönüyor · ${fmt(m.load)} yük`;
          return `<div class="qrow">${ic(RES_ICON[n.kind])} ${NODE_NAME[n.kind]} · ${armySize(m.army)} asker<span>${st}</span><button class="btn sm" data-a="${this.act(() => { this.close(); g.cam.flyTo(m.x, m.y, 0.8); })}">Göster</button></div>`;
        }).join("") || `<p>Şu an sefer yok.</p>`) +
        `<button class="btn go" data-a="${this.act(() => { const n = g.nearest(g.s.nodes.filter((x) => g.isExplored(x.x, x.y))); if (n) { this.close(); g.cam.flyTo(n.x, n.y, 0.8); } })}">En yakın kaynağı göster</button>`;
    }
    return this.frame("Semerkant", `Başkent · Saray Sv ${g.bld("saray")}`, assetUrl("cities/samarkand"), `<div class="tabs">${tabs}</div>${body}`);
  }

  showBattle(title: string, before: Army, enemy: Army, res: BattleResult, xp: number, lvUp: boolean, extra: string, onClose: () => void): void {
    this.battleOpen = true;
    this.close();
    const el = document.createElement("div");
    el.className = "battle";
    const n0a = armySize(before);
    const n0b = armySize(enemy);
    el.innerHTML = `<div class="bbox">
      <h2>${ic("swords")} ${title}</h2>
      <div class="sides">
        <div class="side me">${ic("heroes/hero1", "bp")}<b>${this.g.s.hero.name}</b><div class="bar hp"><i></i></div><div class="arm"></div></div>
        <div class="vs">VS</div>
        <div class="side foe">${ic("j_bandit", "bp")}<b>Haramiler</b><div class="bar hp foe"><i></i></div><div class="arm"></div></div>
      </div>
      <div class="rlog">Savaş başladı…</div>
      <div class="result"></div>
    </div>`;
    this.root.appendChild(el);
    const setSide = (sel: string, a: Army, n0: number) => {
      const s = el.querySelector(sel)!;
      (s.querySelector(".hp i") as HTMLElement).style.width = `${(armySize(a) / Math.max(1, n0)) * 100}%`;
      s.querySelector(".arm")!.innerHTML = armyHtml(a);
    };
    setSide(".me", before, n0a);
    setSide(".foe", enemy, n0b);
    let i = 1;
    const log = el.querySelector(".rlog")!;
    const step = () => {
      if (i < res.rounds.length - 1) {
        const r = res.rounds[i];
        setSide(".me", r.a, n0a);
        setSide(".foe", r.b, n0b);
        el.querySelector(".bbox")!.classList.remove("shake");
        void (el.querySelector(".bbox") as HTMLElement).offsetWidth;
        el.querySelector(".bbox")!.classList.add("shake");
        log.textContent = `${i}. tur — kaybın ${armySize(res.rounds[i - 1].a) - armySize(r.a)}, düşman kaybı ${armySize(res.rounds[i - 1].b) - armySize(r.b)}`;
        i++;
        setTimeout(step, 520);
        return;
      }
      const last = res.rounds[res.rounds.length - 1];
      setSide(".me", last.a, n0a);
      setSide(".foe", last.b, n0b);
      log.textContent = res.win ? "Düşman kaçıyor!" : "Birliğin dağıldı, kalanlar başkente çekiliyor.";
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
    if (now - this.liveT < 250) return;
    this.liveT = now;
    const cap = g.cap();
    const day = g.dayOf();
    const night = Math.cos(day.t * Math.PI * 2) < -0.3;
    this.top.innerHTML =
      RES_KEYS.map((k) => {
        const r = g.ratePerMin(k);
        return `<div class="res ${s.res[k] >= cap ? "full" : ""}" title="${RES_NAME[k]}">${ic(RES_ICON[k])}<b>${fmt(s.res[k])}</b><small class="${r < 0 ? "neg" : ""}">${r >= 0 ? "+" : ""}${Math.round(r)}/dk</small></div>`;
      }).join("") +
      `<div class="res hero">${ic("heroes/hero1", "ic round")}<b>Sv ${s.hero.lv}</b><small>${armySize(s.hero.army)}/${g.heroCap()} asker</small></div>
       <div class="res day">${night ? "🌙" : "☀️"}<b>Gün ${day.day}</b></div>`;
    const q = g.quest();
    this.questEl.innerHTML = q
      ? `${ic("quest", "qi")}<div><small>Görev ${s.quest + 1}/${g.QUESTS.length}</small><b>${q.title}</b><span>${q.text}</span><em>${costHtml(q.reward, g)}</em></div>`
      : `${ic("crown", "qi")}<div><b>Tüm görevler bitti</b><span>Kampları temizle, başkenti büyüt, batıya doğru keşfet.</span></div>`;
    const bld = g.building();
    const btn = this.root.querySelector('[data-b="capital"] span')!;
    btn.textContent = bld ? `⏱ ${dur(s.buildings[bld].until - g.now)}` : "Başkent";
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
    c.fillStyle = "#ff5a3c";
    for (const cp of g.s.camps) if (cp.alive && g.isExplored(cp.x, cp.y)) c.fillRect(cp.x * sx - 1.5, cp.y * sy - 1.5, 3, 3);
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
