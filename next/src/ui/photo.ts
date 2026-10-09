import type { Application } from "pixi.js";
import type { Game } from "../game/game";
import { audio } from "../audio";
import { t } from "../i18n";

interface PhotoFilter {
  id: string;
  name: string;
  css: string;
}

export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: "dogal", name: "Doğal", css: "" },
  { id: "altin", name: "Altın saat", css: "sepia(.3) saturate(1.35) hue-rotate(-10deg) brightness(1.08) contrast(1.05)" },
  { id: "sepya", name: "Eski defter", css: "sepia(.8) contrast(1.08) brightness(1.03)" },
  { id: "minyatur", name: "Minyatür", css: "saturate(1.75) contrast(1.12) brightness(1.05)" },
  { id: "gece", name: "Gece", css: "brightness(.6) saturate(.65) hue-rotate(195deg) contrast(1.2)" },
  { id: "ayaz", name: "Ayaz", css: "saturate(.5) brightness(1.12) contrast(1.06) hue-rotate(8deg)" },
  { id: "kara", name: "Kara-ak", css: "grayscale(1) contrast(1.25)" },
];

const FRAMES = ["Yok", "Altın", "Minyatür"];
const ZOOM_MAX = 2.6;

export class PhotoMode {
  on = false;
  private filter = 0;
  private vignette = true;
  private frame = 1;
  private caption = true;
  private bar: HTMLElement | null = null;
  private ov: HTMLElement | null = null;
  private zoomMax = 0;

  constructor(private app: Application, private g: Game) {
    window.addEventListener(
      "keydown",
      (e) => {
        if (!this.on) return;
        const k = e.key.toLowerCase();
        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "+", "=", "-"].includes(k)) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        if (e.repeat) return;
        if (k === "escape" || k === "p") this.close();
        else if (k === " " || k === "enter") void this.snap();
        else if (k === "v") this.set(() => (this.vignette = !this.vignette));
        else if (k === "g") this.set(() => (this.frame = (this.frame + 1) % FRAMES.length));
        else if (k === "y") this.set(() => (this.caption = !this.caption));
        else if (/^[1-7]$/.test(k)) this.set(() => (this.filter = Number(k) - 1));
      },
      true,
    );
  }

  caption0(): string {
    const s = this.g.s;
    const ch = this.g.chapter();
    return `${s.hero.name} · ${t("Gün")} ${this.g.dayOf().day}${ch ? ` · ${ch.title}` : ""}`;
  }

  open(): void {
    if (this.on) return;
    this.on = true;
    this.g.cam.keys.clear();
    this.zoomMax = this.g.cam.maxZoom;
    this.g.cam.maxZoom = ZOOM_MAX;
    document.body.classList.add("photo");
    this.ov = document.createElement("div");
    this.ov.className = "photo-ov";
    this.bar = document.createElement("div");
    this.bar.className = "photobar";
    this.bar.addEventListener("pointerdown", (e) => e.stopPropagation());
    this.bar.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-p]");
      if (!b) return;
      audio.play("click");
      const [k, v] = b.dataset.p!.split(":");
      if (k === "f") this.set(() => (this.filter = Number(v)));
      else if (k === "v") this.set(() => (this.vignette = !this.vignette));
      else if (k === "g") this.set(() => (this.frame = (this.frame + 1) % FRAMES.length));
      else if (k === "y") this.set(() => (this.caption = !this.caption));
      else if (k === "z") this.g.cam.zoomBy(v === "in" ? 1.2 : 1 / 1.2);
      else if (k === "snap") void this.snap();
      else if (k === "x") this.close();
    });
    document.body.append(this.ov, this.bar);
    this.render();
  }

  close(): void {
    if (!this.on) return;
    this.on = false;
    this.g.cam.maxZoom = this.zoomMax || this.g.cam.maxZoom;
    this.g.cam.zoom = Math.min(this.g.cam.zoom, this.g.cam.maxZoom);
    this.app.canvas.style.filter = "";
    document.body.classList.remove("photo");
    this.bar?.remove();
    this.ov?.remove();
    this.bar = this.ov = null;
  }

  toggle(): void {
    if (this.on) this.close();
    else this.open();
  }

  private set(fn: () => unknown): void {
    fn();
    this.render();
  }

  private render(): void {
    if (!this.bar || !this.ov) return;
    this.app.canvas.style.filter = PHOTO_FILTERS[this.filter].css;
    this.ov.className = `photo-ov${this.vignette ? " vig" : ""} fr${this.frame}`;
    this.ov.innerHTML = this.caption ? `<div class="pcap"><b>Kervan Krallık</b><span>${this.caption0()}</span></div>` : "";
    const on = (b: boolean) => (b ? "on" : "");
    this.bar.innerHTML = `<div class="prow">${PHOTO_FILTERS.map((f, i) => `<button class="btn sm ${on(i === this.filter)}" data-p="f:${i}">${t(f.name)}</button>`).join("")}</div>
      <div class="prow"><button class="btn go" data-p="snap">${t("Çek")}</button><button class="btn sm red" data-p="x">✕</button><button class="btn sm ${on(this.vignette)}" data-p="v">${t("Gölgelik")}</button><button class="btn sm ${on(this.frame > 0)}" data-p="g">${t("Çerçeve")}: ${t(FRAMES[this.frame])}</button><button class="btn sm ${on(this.caption)}" data-p="y">${t("Yazı")}</button><button class="btn sm" data-p="z:out">−</button><button class="btn sm" data-p="z:in">+</button></div>
      <small class="dim">${t("Sürükle: kaydır · Tekerlek/çimdik: yakınlaş · 1-7 süzgeç · V gölgelik · G çerçeve · Y yazı · Boşluk çek · Esc çık")}</small>`;
  }

  /** Ekranı süzgeç, gölgelik, çerçeve ve yazıyla birlikte PNG olarak kaydeder. */
  async snap(): Promise<HTMLCanvasElement> {
    this.app.render();
    const src = this.app.canvas;
    const w = src.width;
    const h = src.height;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d")!;
    x.filter = PHOTO_FILTERS[this.filter].css || "none";
    x.drawImage(src, 0, 0);
    x.filter = "none";
    const k = w / Math.max(1, src.clientWidth || w);
    if (this.vignette) {
      const gr = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.6);
      gr.addColorStop(0, "rgba(0,0,0,0)");
      gr.addColorStop(1, "rgba(20,10,4,.6)");
      x.fillStyle = gr;
      x.fillRect(0, 0, w, h);
    }
    if (this.frame === 1) {
      x.strokeStyle = "#e8c88a";
      x.lineWidth = 3 * k;
      x.strokeRect(14 * k, 14 * k, w - 28 * k, h - 28 * k);
      x.lineWidth = 1 * k;
      x.strokeRect(20 * k, 20 * k, w - 40 * k, h - 40 * k);
    } else if (this.frame === 2) {
      const b = 22 * k;
      x.fillStyle = "#5a1f12";
      x.fillRect(0, 0, w, b);
      x.fillRect(0, h - b, w, b);
      x.fillRect(0, 0, b, h);
      x.fillRect(w - b, 0, b, h);
      x.fillStyle = "#e8c88a";
      for (let i = b; i < w - b; i += 18 * k) {
        x.beginPath();
        x.arc(i, b / 2, 3 * k, 0, Math.PI * 2);
        x.arc(i, h - b / 2, 3 * k, 0, Math.PI * 2);
        x.fill();
      }
      for (let i = b; i < h - b; i += 18 * k) {
        x.beginPath();
        x.arc(b / 2, i, 3 * k, 0, Math.PI * 2);
        x.arc(w - b / 2, i, 3 * k, 0, Math.PI * 2);
        x.fill();
      }
      x.strokeStyle = "#e8c88a";
      x.lineWidth = 2 * k;
      x.strokeRect(b, b, w - 2 * b, h - 2 * b);
    }
    if (this.caption) {
      const pad = (this.frame ? 36 : 18) * k;
      x.textBaseline = "bottom";
      x.shadowColor = "rgba(0,0,0,.8)";
      x.shadowBlur = 6 * k;
      x.fillStyle = "#ffe39a";
      x.font = `700 ${26 * k}px Georgia, serif`;
      x.fillText("Kervan Krallık", pad, h - pad - 22 * k);
      x.fillStyle = "#f4e6c6";
      x.font = `${16 * k}px Georgia, serif`;
      x.fillText(this.caption0(), pad, h - pad);
      x.shadowBlur = 0;
    }
    const flash = document.createElement("div");
    flash.className = "pflash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
    audio.play("click");
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
    if (blob) await this.save(blob);
    return c;
  }

  private async save(blob: Blob): Promise<void> {
    const name = `kervan-krallik-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`;
    const file = new File([blob], name, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (matchMedia("(pointer: coarse)").matches && nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Kervan Krallık" });
        return;
      } catch {
        /* share cancelled: fall back to download */
      }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
}
