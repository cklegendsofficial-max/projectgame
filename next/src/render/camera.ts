import type { Container } from "pixi.js";

export class Camera {
  x = 0;
  y = 0;
  zoom = 0.5;
  minZoom = 0.2;
  maxZoom = 1.6;
  private tx: number | null = null;
  private ty = 0;
  private tz = 0;
  private dragging = false;
  private moved = 0;
  private lx = 0;
  private ly = 0;
  private pinch = 0;
  private pointers = new Map<number, { x: number; y: number }>();
  onTap: (wx: number, wy: number) => void = () => {};
  keys = new Set<string>();
  pad = { x: 0, y: 0 };

  constructor(private el: HTMLElement, private worldW: number, private worldH: number) {
    el.addEventListener("pointerdown", (e) => this.down(e));
    window.addEventListener("pointermove", (e) => this.move(e));
    window.addEventListener("pointerup", (e) => this.up(e));
    window.addEventListener("pointercancel", (e) => this.up(e));
    el.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.zoomAt(e.offsetX, e.offsetY, Math.exp(-e.deltaY * 0.0015));
    }, { passive: false });
  }

  private cw = 0;
  private ch = 0;

  get w(): number {
    return this.cw || (this.cw = this.el.clientWidth);
  }

  get h(): number {
    return this.ch || (this.ch = this.el.clientHeight);
  }

  resized(): void {
    this.cw = this.el.clientWidth;
    this.ch = this.el.clientHeight;
  }

  fitMin(): void {
    this.resized();
    this.minZoom = Math.max(this.w / this.worldW, this.h / this.worldH);
    this.zoom = Math.max(this.zoom, this.minZoom);
  }

  toWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: this.x + (sx - this.w / 2) / this.zoom, y: this.y + (sy - this.h / 2) / this.zoom };
  }

  toScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: (wx - this.x) * this.zoom + this.w / 2, y: (wy - this.y) * this.zoom + this.h / 2 };
  }

  flyTo(x: number, y: number, z = this.zoom): void {
    this.tx = x;
    this.ty = y;
    this.tz = Math.min(this.maxZoom, Math.max(this.minZoom, z));
  }

  private zoomAt(sx: number, sy: number, f: number): void {
    const before = this.toWorld(sx, sy);
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * f));
    const after = this.toWorld(sx, sy);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
    this.tx = null;
    this.clamp();
  }

  private down(e: PointerEvent): void {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
    this.dragging = true;
    this.moved = 0;
    this.lx = e.clientX;
    this.ly = e.clientY;
  }

  private move(e: PointerEvent): void {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = this.el.getBoundingClientRect();
      if (this.pinch > 0) this.zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / this.pinch);
      this.pinch = d;
      this.moved = 99;
      return;
    }
    if (!this.dragging) return;
    const dx = e.clientX - this.lx;
    const dy = e.clientY - this.ly;
    this.moved += Math.abs(dx) + Math.abs(dy);
    this.lx = e.clientX;
    this.ly = e.clientY;
    if (this.moved > 6) {
      this.x -= dx / this.zoom;
      this.y -= dy / this.zoom;
      this.tx = null;
      this.clamp();
    }
  }

  private up(e: PointerEvent): void {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    if (this.pointers.size > 0) return;
    this.pinch = 0;
    if (this.dragging && this.moved <= 6) {
      const r = this.el.getBoundingClientRect();
      const p = this.toWorld(e.clientX - r.left, e.clientY - r.top);
      this.onTap(p.x, p.y);
    }
    this.dragging = false;
  }

  private clamp(): void {
    const hw = this.w / 2 / this.zoom;
    const hh = this.h / 2 / this.zoom;
    this.x = Math.max(hw, Math.min(this.worldW - hw, this.x));
    this.y = Math.max(hh, Math.min(this.worldH - hh, this.y));
  }

  zoomBy(f: number): void {
    this.zoomAt(this.w / 2, this.h / 2, f);
  }

  update(dt: number, layer: Container): void {
    const k = this.keys;
    if (k.size || this.pad.x || this.pad.y) {
      const sp = (720 * dt) / this.zoom;
      const dx = (k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0) + this.pad.x;
      const dy = (k.has("s") || k.has("arrowdown") ? 1 : 0) - (k.has("w") || k.has("arrowup") ? 1 : 0) + this.pad.y;
      if (dx || dy) {
        this.x += dx * sp;
        this.y += dy * sp;
        this.tx = null;
      }
    }
    if (this.tx !== null) {
      const k = 1 - Math.exp(-dt * 3.5);
      this.x += (this.tx - this.x) * k;
      this.y += (this.ty - this.y) * k;
      this.zoom += (this.tz - this.zoom) * k;
      if (Math.abs(this.tx - this.x) < 0.5 && Math.abs(this.tz - this.zoom) < 0.001) this.tx = null;
    }
    this.clamp();
    layer.scale.set(this.zoom);
    layer.position.set(this.w / 2 - this.x * this.zoom, this.h / 2 - this.y * this.zoom);
  }
}
