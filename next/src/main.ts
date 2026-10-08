import "./style.css";
import { Application, CullerPlugin, extensions } from "pixi.js";
import { generate, H, W } from "./world/gen";
import { WorldView } from "./render/worldView";
import { Camera } from "./render/camera";
import { Game } from "./game/game";
import { Hud } from "./ui/hud";

async function boot(): Promise<void> {
  extensions.add(CullerPlugin);
  const host = document.getElementById("game")!;
  const app = new Application();
  await app.init({ resizeTo: host, background: "#1c120a", antialias: true, resolution: Math.min(2, window.devicePixelRatio || 1), autoDensity: true });
  host.appendChild(app.canvas);
  await new Promise((r) => setTimeout(r, 30));
  const t0 = performance.now();
  const world = generate();
  console.log("world gen ms", Math.round(performance.now() - t0));
  const cam = new Camera(app.canvas, W, H);
  const view = new WorldView(app, world);
  await view.load();
  const game = new Game(world, view, cam);
  const hud = new Hud(game);
  game.hud = hud;
  view.attachState(game);
  (window as unknown as { game: Game }).game = game;
  cam.fitMin();
  cam.onTap = (x, y) => game.tap(x, y);
  app.ticker.add((tk) => {
    const dt = Math.min(0.1, tk.deltaMS / 1000);
    game.update(dt);
    cam.update(dt, view.layer);
    view.update(dt, game, cam);
    hud.update();
  });
  window.addEventListener("resize", () => cam.fitMin());
  document.getElementById("loading")!.remove();
}

void boot();
