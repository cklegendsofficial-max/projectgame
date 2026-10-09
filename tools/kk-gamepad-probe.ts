import { chromium } from "playwright-core";

const out = "playtest/gamepad";
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.addInitScript(`
  const pad = { axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), connected: true, id: "probe", index: 0, mapping: "standard" };
  window.__pad = pad;
  Object.defineProperty(navigator, "getGamepads", { value: () => [pad] });
`);
await page.goto("http://localhost:5174/");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; const p = window.__pad; ${fn} })()`) as Promise<T>;
const tap = async (i: number) => {
  await ev(`p.buttons[${i}].pressed = true; p.buttons[${i}].value = 1;`);
  await page.waitForTimeout(90);
  await ev(`p.buttons[${i}].pressed = false; p.buttons[${i}].value = 0;`);
  await page.waitForTimeout(150);
};
const focused = () => page.evaluate(`(() => {
  const el = document.querySelector(".padfocus");
  return el ? el.className.trim() + " | " + el.innerText.slice(0, 30).replace(/\\n/g, " ") : null;
})()`);
const dismiss = async () => {
  for (let k = 0; k < 10; k++) {
    if (!(await page.locator(".battle .bbox.story .btn").count())) break;
    await tap(0);
  }
};

await page.waitForTimeout(500);
console.log("csel focus:", await focused());
await tap(15);
console.log("csel right:", await focused());
await tap(0);
console.log("selected card:", await page.locator(".ccard.on").getAttribute("data-c"));
for (let k = 0; k < 4; k++) await tap(13);
console.log("csel down:", await focused());
await page.locator(".cname .btn").click();
await page.waitForTimeout(400);
await dismiss();
await page.waitForTimeout(400);
await dismiss();

await ev(`p.buttons[0].pressed = false;`);
const x0 = await ev<number>(`return g.cam.x;`);
await ev(`p.axes[0] = 1;`);
await page.waitForTimeout(700);
await ev(`p.axes[0] = 0;`);
await page.waitForTimeout(100);
console.log("pan dx:", Math.round((await ev<number>(`return g.cam.x;`)) - x0), "cross:", await page.locator(".padcross.on").count(), "body.pad:", await page.evaluate(() => document.body.classList.contains("pad")));
const z0 = await ev<number>(`return g.cam.zoom;`);
await tap(5);
console.log("rb zoom:", z0.toFixed(2), "->", (await ev<number>(`return g.cam.zoom;`)).toFixed(2));
await page.screenshot({ path: `${out}-1.png` });

await tap(9);
console.log("start -> panel:", await page.locator(".panel:not(.hidden)").count(), "tab:", await page.locator(".panel .tab.on").innerText());
await tap(5);
console.log("rb tab:", await page.locator(".panel .tab.on").innerText(), "focus:", await focused());
await tap(13);
await tap(13);
console.log("down focus:", await focused());
await page.screenshot({ path: `${out}-2.png` });
await tap(1);
console.log("b -> panel open:", await page.locator(".panel:not(.hidden)").count());

await ev(`g.s.res.gold = 300; const c = g.targetPos({kind:"capital"}); g.s.hero.x = c.x; g.s.hero.y = c.y; g.buyFreedom();`);
await page.waitForTimeout(600);
await dismiss();
await page.waitForTimeout(900);
await dismiss();
await ev(`g.hud.openArchery();`);
await page.waitForTimeout(400);
const a0 = await ev<number>(`return g.hud.archery.hud().arrows;`);
for (let k = 0; k < 3; k++) {
  await tap(0);
  await page.waitForTimeout(400);
}
console.log("archery arrows:", a0, "->", await ev<number>(`return g.hud.archery.hud().arrows;`));
await tap(1);
console.log("b -> archery:", await page.locator(".archery").count(), "lock:", await ev(`return g.battleLock;`));

await ev(`const h = g.s.hero; for (let a = 0; a < 6.28; a += 0.3) { const x = h.x + Math.cos(a) * 260, y = h.y + Math.sin(a) * 260; if (g.cellCost(x, y) !== Infinity && !g.pick(x, y)) { g.cam.flyTo(x, y, 0.8); break; } }`);
await page.waitForTimeout(1500);
await tap(0);
await page.waitForTimeout(300);
console.log("a on map -> hero moving:", await ev(`return { path: !!(g.s.hero.path && g.s.hero.path.length), target: g.target && g.target.kind, panel: g.hud.panelOpen(), lock: g.battleLock, cost: g.cellCost(g.cam.x, g.cam.y), toast: [...document.querySelectorAll(".toasts > *")].map((e) => e.innerText).slice(-2) };`));
console.log("errors:", errs);
await browser.close();
