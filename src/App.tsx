import { useEffect, useRef, useState } from "react";
import "./style.css";
import { Application, CullerPlugin, extensions } from "pixi.js";
import { generate, H, W } from "./world/gen";
import { WorldView } from "./render/worldView";
import { Camera } from "./render/camera";
import { Game } from "./game/game";
import { Hud } from "./ui/hud";
import { applyUi, settings } from "./settings";
import { localizeData } from "./i18n-data";
import { t } from "./i18n";
import { cloudPull, cloudPush, deckDefaults, steam, steamPresence, steamStats, syncAchievements } from "./platform";
import { unlockedSet } from "./game/achievements";
import { loadMods } from "./mods";
import { PhotoMode } from "./ui/photo";

export function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadText, setLoadText] = useState<string>("Dünya yaratılıyor…");
  const gameRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let app: Application | null = null;
    const cleanups: (() => void)[] = [];

    async function bootGame() {
      try {
        extensions.add(CullerPlugin);
        deckDefaults();
        applyUi();
        const restored = cloudPull();
        if (restored) console.log("steam cloud restored", restored);
        document.documentElement.lang = settings.lang ?? "tr";
        localizeData();
        loadMods();

        const onContextMenu = (e: MouseEvent) => e.preventDefault();
        window.addEventListener("contextmenu", onContextMenu);
        cleanups.push(() => window.removeEventListener("contextmenu", onContextMenu));

        const host = gameRef.current;
        if (!host || disposed) return;

        app = new Application();
        await app.init({
          resizeTo: host,
          background: "#1c120a",
          antialias: !settings.eco,
          resolution: settings.eco ? 1 : Math.min(2, window.devicePixelRatio || 1),
          autoDensity: true,
        });

        if (disposed) {
          app.destroy(true, { children: true });
          return;
        }

        if (settings.eco) app.ticker.maxFPS = 30;
        host.appendChild(app.canvas);

        await new Promise((r) => setTimeout(r, 30));
        if (disposed) return;

        setLoadText("İpek Yolu ve beylikler dokunuyor…");
        const world = generate();
        const cam = new Camera(app.canvas, W, H);
        const view = new WorldView(app, world);
        await view.load();
        if (disposed) return;

        setLoadText("Kervanlar yola çıkıyor…");
        const game = new Game(world, view, cam);
        const hud = new Hud(game);
        game.hud = hud;
        view.attachState(game);
        (window as unknown as { game: Game }).game = game;

        if (import.meta.env.DEV) {
          void import("./ui/admin").then((m) => m.mountAdmin(game));
        }

        const photo = new PhotoMode(app, game);
        hud.photo = photo;
        cam.fitMin();
        cam.onTap = (x, y) => !photo.on && game.tap(x, y);

        app.ticker.add((tk) => {
          const dt = Math.min(0.1, tk.deltaMS / 1000);
          if (hud.menuOpen) hud.menuTick(dt);
          else if (!photo.on) {
            for (let i = hud.speed(); i > 0; i--) game.update(dt);
          }
          cam.update(dt, view.layer);
          view.update(dt, game, cam);
          hud.update();
        });

        const onResize = () => cam.fitMin();
        window.addEventListener("resize", onResize);
        cleanups.push(() => window.removeEventListener("resize", onResize));

        setLoading(false);

        if (steam) {
          syncAchievements(unlockedSet());
          const tick = () => {
            const s = game.s;
            const ch = game.chapter();
            steamPresence(`${s.hero.name} · ${t("Seviye")} ${s.hero.lv}${ch ? ` · ${ch.title}` : ""}`);
            steamStats({ level: s.hero.lv, renown: s.renown, kills: s.kills, profit: s.c.profit, conquests: s.c.conquests ?? 0 });
          };
          tick();
          const timer = setInterval(tick, 60_000);
          cleanups.push(() => clearInterval(timer));
          const onBeforeUnload = () => cloudPush(true);
          window.addEventListener("beforeunload", onBeforeUnload);
          cleanups.push(() => window.removeEventListener("beforeunload", onBeforeUnload));
        }
      } catch (err) {
        console.error("Game boot failure", err);
      }
    }

    bootGame();

    return () => {
      disposed = true;
      cleanups.forEach((c) => c());
      if (app) {
        try {
          app.destroy(true, { children: true });
        } catch (e) {
          console.warn("App destroy error", e);
        }
      }
    };
  }, []);

  return (
    <div id="kervan-root" style={{ width: "100%", height: "100%", position: "fixed", inset: 0, overflow: "hidden" }}>
      {loading && (
        <div id="loading">
          <div className="ld">
            <b>Kervan Krallık</b>
            <span>{loadText}</span>
            <i />
          </div>
        </div>
      )}
      <div id="game" ref={gameRef} />
      <div id="hud" ref={hudRef} />
    </div>
  );
}

export default App;
