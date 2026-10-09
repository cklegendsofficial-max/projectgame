/** Standart eşleme: 0 A · 1 B · 2 X · 3 Y · 4 LB · 5 RB · 6 LT · 7 RT · 8 Geri · 9 Başlat · 12-15 D-pad */
export type PadButton = "a" | "b" | "x" | "y" | "lb" | "rb" | "back" | "start" | "l3";

const BTN: [number, PadButton][] = [[0, "a"], [1, "b"], [2, "x"], [3, "y"], [4, "lb"], [5, "rb"], [8, "back"], [9, "start"], [10, "l3"]];
const DEAD = 0.22;
const REPEAT_FIRST = 0.35;
const REPEAT_NEXT = 0.12;

export interface PadHooks {
  /** Odak gezintisinin yapılacağı katman; null ise harita modundayız. */
  scope(): HTMLElement | null;
  /** Okçuluk oyunu sürüyorsa true; A ok atar. */
  shooting(): boolean;
  shoot(): void;
  press(b: PadButton, ui: boolean): void;
  pan(x: number, y: number): void;
  zoom(f: number): void;
}

type Dir = "up" | "down" | "left" | "right";

export class Gamepad {
  private prev = new Set<PadButton>();
  private held: { dir: Dir | null; t: number; next: number } = { dir: null, t: 0, next: 0 };
  private focus: HTMLElement | null = null;
  private focusIdx = 0;
  private last = 0;
  private lastScope: HTMLElement | null = null;
  private active = false;
  private cross: HTMLElement;

  constructor(root: HTMLElement, private hooks: PadHooks) {
    this.cross = document.createElement("div");
    this.cross.className = "padcross";
    root.appendChild(this.cross);
    window.addEventListener("pointerdown", () => this.setActive(false));
    window.addEventListener("gamepadconnected", () => this.setActive(true));
    window.addEventListener("gamepaddisconnected", () => {
      if (!this.pad()) this.setActive(false);
    });
    const loop = (t: number): void => {
      const dt = this.last ? Math.min(0.1, (t - this.last) / 1000) : 0;
      this.last = t;
      this.poll(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  get on(): boolean {
    return this.active;
  }

  private pad(): globalThis.Gamepad | null {
    if (!navigator.getGamepads) return null;
    for (const p of navigator.getGamepads()) if (p && p.connected) return p;
    return null;
  }

  private setActive(v: boolean): void {
    if (this.active === v) return;
    this.active = v;
    document.body.classList.toggle("pad", v);
    if (!v) this.blur();
  }

  private poll(dt: number): void {
    const p = this.pad();
    if (!p) return;
    const ax = (i: number): number => {
      const v = p.axes[i] ?? 0;
      return Math.abs(v) < DEAD ? 0 : (v - Math.sign(v) * DEAD) / (1 - DEAD);
    };
    const down = (i: number): boolean => !!p.buttons[i]?.pressed;
    const lx = ax(0), ly = ax(1), ry = ax(3);
    const lt = p.buttons[6]?.value ?? 0, rt = p.buttons[7]?.value ?? 0;
    const now = new Set<PadButton>();
    for (const [i, b] of BTN) if (down(i)) now.add(b);
    const dir: Dir | null = down(12) || ly < -0.6 ? "up" : down(13) || ly > 0.6 ? "down" : down(14) || lx < -0.6 ? "left" : down(15) || lx > 0.6 ? "right" : null;
    if (now.size || dir || lx || ly || ry || lt > 0.1 || rt > 0.1) this.setActive(true);

    const scope = this.hooks.scope();
    const shooting = this.hooks.shooting();
    if (scope !== this.lastScope) {
      this.blur();
      this.lastScope = scope;
    }
    if (scope) this.nav(scope, dir, dt);
    else {
      if (this.focus) this.blur();
      this.held.dir = null;
      if (!shooting) {
        const dx = lx || (down(15) ? 1 : 0) - (down(14) ? 1 : 0);
        const dy = ly || (down(13) ? 1 : 0) - (down(12) ? 1 : 0);
        this.hooks.pan(dx, dy);
        const z = -ry * 1.6 + (rt - lt) * 1.6;
        if (z) this.hooks.zoom(Math.exp(z * dt));
      }
    }
    this.cross.classList.toggle("on", this.active && !scope && !shooting);

    for (const b of now) {
      if (this.prev.has(b)) continue;
      if (b === "a" && scope) this.activate(scope);
      else if (b === "a" && shooting) this.hooks.shoot();
      else this.hooks.press(b, !!scope);
    }
    this.prev = now;
  }

  private items(scope: HTMLElement): HTMLElement[] {
    return [...scope.querySelectorAll<HTMLElement>("button, [data-a], input[type=range], .ccard")].filter((el) => {
      if (el.classList.contains("off") || (el as HTMLButtonElement).disabled) return false;
      if (el.parentElement?.closest("[data-a]")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }

  private nav(scope: HTMLElement, dir: Dir | null, dt: number): void {
    const list = this.items(scope);
    if (!list.length) return this.blur();
    if (!this.focus || !this.focus.isConnected || !list.includes(this.focus)) {
      const first = this.focusIdx || list.findIndex((el) => !el.classList.contains("x"));
      this.setFocus(list[Math.min(Math.max(0, first), list.length - 1)], list);
    }
    if (!dir) {
      this.held.dir = null;
      return;
    }
    if (this.held.dir === dir) {
      this.held.t += dt;
      if (this.held.t < this.held.next) return;
      this.held.next = this.held.t + REPEAT_NEXT;
    } else this.held = { dir, t: 0, next: REPEAT_FIRST };
    if (this.focus instanceof HTMLInputElement && (dir === "left" || dir === "right")) {
      const inp = this.focus;
      inp.value = String(Number(inp.value) + (dir === "right" ? 5 : -5));
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    const next = this.nearest(this.focus!, list, dir);
    if (next) this.setFocus(next, list);
  }

  private nearest(from: HTMLElement, list: HTMLElement[], dir: Dir): HTMLElement | null {
    const a = from.getBoundingClientRect();
    const ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best: HTMLElement | null = null;
    let score = Infinity;
    for (const el of list) {
      if (el === from) continue;
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - ax, dy = r.top + r.height / 2 - ay;
      const main = dir === "left" ? -dx : dir === "right" ? dx : dir === "up" ? -dy : dy;
      if (main <= 2) continue;
      const side = dir === "left" || dir === "right" ? Math.abs(dy) : Math.abs(dx);
      const s = main + side * 2.5;
      if (s < score) {
        score = s;
        best = el;
      }
    }
    return best;
  }

  private setFocus(el: HTMLElement, list: HTMLElement[]): void {
    this.focus?.classList.remove("padfocus");
    this.focus = el;
    this.focusIdx = list.indexOf(el);
    if (!this.active) return;
    el.classList.add("padfocus");
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  private blur(): void {
    this.focus?.classList.remove("padfocus");
    this.focus = null;
    this.focusIdx = 0;
  }

  private activate(scope: HTMLElement): void {
    const el = this.focus ?? this.items(scope)[0];
    if (!el || el instanceof HTMLInputElement) return;
    el.click();
  }
}
