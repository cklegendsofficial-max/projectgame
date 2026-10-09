import type { Game } from "../game/game";
import { xpNeed } from "../game/data";

/** Geliştirme hilesi paneli; yalnızca `npm run dev` altında yüklenir (F9). */

const KEY = "kk_admin";
type Flags = { gold: boolean; god: boolean; energy: boolean };

const CSS = `
.adm-btn { position: fixed; left: 8px; bottom: 8px; z-index: 9999; padding: 4px 9px; border-radius: 8px; font: 700 11px "Segoe UI", sans-serif; color: #ffd56a; background: #2a0e0ecc; border: 1px solid #ff6a4a; cursor: pointer; }
.adm { position: fixed; left: 8px; bottom: 40px; z-index: 9999; width: 290px; max-height: 80vh; overflow-y: auto; padding: 10px; border-radius: 12px; font: 12px "Segoe UI", sans-serif; color: #fff3d6; background: #1a0c06f2; border: 1px solid #ff6a4a; box-shadow: 0 8px 30px #000a; }
.adm.hidden { display: none; }
.adm h4 { margin: 8px 0 4px; font-size: 11px; color: #ff9a7a; text-transform: uppercase; letter-spacing: .6px; }
.adm h4:first-child { margin-top: 0; }
.adm .r { display: flex; flex-wrap: wrap; gap: 4px; }
.adm button { flex: 1 1 auto; padding: 5px 6px; border-radius: 6px; font: 600 11px "Segoe UI", sans-serif; color: #fff3d6; background: #4a2a14; border: 1px solid #8a5d2a; cursor: pointer; }
.adm button:hover { background: #6a3a1a; }
.adm button.on { background: #2f6a2a; border-color: #7fd36a; }
.adm .st { margin-top: 6px; opacity: .7; font-size: 11px; }
`;

export function mountAdmin(g: Game): void {
  const flags: Flags = { gold: false, god: false, energy: false, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  const save = () => localStorage.setItem(KEY, JSON.stringify(flags));
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  const btn = document.createElement("button");
  btn.className = "adm-btn";
  btn.textContent = "ADMIN (F9)";
  const box = document.createElement("div");
  box.className = "adm hidden";
  document.body.append(btn, box);

  const s = () => g.s;
  const day = (n: number) => {
    s().time += n * 150;
    g.hud.toast(`${n} gün ileri: ${g.dayOf().day}. gün`, "info");
  };
  const levels = (n: number) => {
    const h = s().hero;
    const to = h.lv + n;
    for (let k = 0; k < 50 && h.lv < to; k++) g.addXp(Math.max(1, xpNeed(h.lv) - h.xp));
  };
  const acts: Record<string, () => void> = {
    gold: () => (flags.gold = !flags.gold),
    god: () => (flags.god = !flags.god),
    energy: () => (flags.energy = !flags.energy),
    g10k: () => (s().res.gold += 10000),
    res: () => {
      const r = s().res;
      r.wood += 5000;
      r.stone += 5000;
      r.food += 5000;
    },
    mats: () => {
      s().mats.ruh += 50;
      s().mats.parsomen += 10;
    },
    lv1: () => levels(1),
    lv5: () => levels(5),
    pts: () => {
      const h = s().hero;
      h.points += 10;
      h.spts += 5;
      h.tpts += 5;
    },
    army: () => {
      const a = s().hero.army;
      a.spear += 30;
      a.archer += 20;
      a.horse += 20;
    },
    heal: () => {
      const h = s().hero;
      h.hp = g.maxHp();
      h.energy = g.maxEnergy();
    },
    free: () => {
      if (!s().free) (g as unknown as { freeHero(e: boolean): void }).freeHero(false);
    },
    map: () => {
      s().explored.fill(1);
      g.view.fogDirty = true;
    },
    d1: () => day(1),
    d10: () => day(10),
    mongol: () => {
      const m = g.mongol();
      if (m.stage >= 2) return g.hud.toast("Moğol istilası zaten başladı", "info");
      m.stage = 1;
      m.due = g.dayOf().day;
      g.hud.toast("Moğollar birkaç saniye içinde yola çıkıyor", "bad");
    },
    rep: () => {
      const rep = s().rep as Record<string, number>;
      for (const k of Object.keys(rep)) rep[k] = 1500;
    },
  };
  const B = (id: string, label: string, on?: boolean) => `<button data-x="${id}" class="${on ? "on" : ""}">${label}</button>`;
  const render = () => {
    box.innerHTML = `
      <h4>Sürekli</h4><div class="r">${B("gold", "Sınırsız altın + kaynak", flags.gold)}${B("god", "Ölümsüz", flags.god)}${B("energy", "Sınırsız enerji", flags.energy)}</div>
      <h4>Kaynak</h4><div class="r">${B("g10k", "+10.000 altın")}${B("res", "+5000 odun/taş/yiyecek")}${B("mats", "+50 ruh · +10 parşömen")}</div>
      <h4>Kahraman</h4><div class="r">${B("lv1", "+1 seviye")}${B("lv5", "+5 seviye")}${B("pts", "+puanlar")}${B("army", "+70 asker")}${B("heal", "Can/enerji doldur")}${B("free", "Hürriyet")}</div>
      <h4>Dünya</h4><div class="r">${B("map", "Haritayı aç")}${B("d1", "+1 gün")}${B("d10", "+10 gün")}${B("mongol", "Moğol istilası")}${B("rep", "Tüm itibar 1500")}</div>
      <div class="st">Sv ${s().hero.lv} · ${Math.floor(s().res.gold)} altın · ${g.dayOf().day}. gün · ${s().free ? "hür" : "köle"}</div>`;
  };
  box.addEventListener("click", (e) => {
    const id = (e.target as HTMLElement).closest<HTMLElement>("[data-x]")?.dataset.x;
    if (!id) return;
    acts[id]?.();
    save();
    render();
  });
  const toggle = () => {
    box.classList.toggle("hidden");
    if (!box.classList.contains("hidden")) render();
  };
  btn.addEventListener("click", toggle);
  window.addEventListener("keydown", (e) => {
    if (e.key === "F9") {
      e.preventDefault();
      toggle();
    }
  });
  setInterval(() => {
    const st = s();
    if (flags.gold) {
      st.res.gold = Math.max(st.res.gold, 999_999);
      st.res.wood = Math.max(st.res.wood, 99_999);
      st.res.stone = Math.max(st.res.stone, 99_999);
      st.res.food = Math.max(st.res.food, 99_999);
    }
    if (flags.god) st.hero.hp = Math.max(st.hero.hp, g.maxHp());
    if (flags.energy) st.hero.energy = Math.max(st.hero.energy, g.maxEnergy());
    if (!box.classList.contains("hidden")) box.querySelector(".st")!.textContent = `Sv ${st.hero.lv} · ${Math.floor(st.res.gold)} altın · ${g.dayOf().day}. gün · ${st.free ? "hür" : "köle"}`;
  }, 250);
}
