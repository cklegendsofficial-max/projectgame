import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const mode = process.argv[2] ?? "desk";
const out = `playtest/mod-${mode}`;
const sample = readFileSync(new URL("../next/electron/ornek-mod.json", import.meta.url), "utf8");
const bad = JSON.stringify({ id: "bozuk", name: "Bozuk Mod", patch: { goods: { ipek: { base: "pahalı", yok: 3 }, ejder: { base: 1 } }, uydurma: {} }, add: { codex: [{ id: "x" }] } });
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const vp = mode === "mob" ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: mode === "mob" ? 2 : 1, hasTouch: mode === "mob" });
const errs: string[] = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => (m.type() === "error" ? errs.push(m.text()) : m.text().startsWith("mods") && console.log("console:", m.text())));
await page.goto("http://localhost:5174/");
await page.evaluate(([a, b]) => {
  localStorage.clear();
  localStorage.setItem("kk_mods", JSON.stringify([{ file: "ornek-mod.json", text: a }, { file: "bozuk.json", text: b }]));
}, [sample, bad]);
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
const ev = <T = unknown>(fn: string) => page.evaluate(`(() => { const g = window.game; ${fn} })()`) as Promise<T>;
const dismiss = async () => {
  for (let k = 0; k < 10; k++) {
    if (!(await page.locator(".battle .bbox.story .btn").count())) break;
    await page.locator(".battle .bbox.story .btn").first().click();
    await page.waitForTimeout(200);
  }
};
await page.locator(`.ccard[data-c="alp"]`).click();
await page.locator(".cname .btn").click();
await dismiss();
await ev(`g.s.free = true; g.achT = 0;`);
await page.waitForTimeout(2500);
await ev(`g.hud.openHero(); g.hud.tab = "ayar"; g.hud.render();`);
await page.waitForTimeout(300);
const txt = (await page.locator(".panel .pb").innerText()).replace(/\s+/g, " ");
console.log("mods section:", txt.slice(txt.indexOf("Modlar"), txt.indexOf("Modlar") + 520));
await page.locator(".panel h3", { hasText: "Modlar" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}-1.png` });
const names: string[] = [];
for (let i = 0; i < 9; i++) {
  await ev(`g.hud.openPlace({ kind: "city", i: ${i} });`);
  await page.waitForTimeout(80);
  names.push((await page.locator(".panel h2").first().textContent()) ?? "");
}
console.log("cities:", names.join(" | "));
await ev(`g.hud.close?.();`);
await ev(`g.hud.openHero(); g.hud.tab = "bitig"; g.hud.render();`);
await page.waitForTimeout(300);
console.log("codex has mod page:", (await page.locator(".panel .pb").innerText()).includes("Kervanbaşı"));
console.log("bitig ids:", await ev(`return (g.s.bitig || []).filter((x) => x.includes(":")).join(",");`));
await ev(`g.hud.openHero(); g.hud.tab = "ayar"; g.hud.render();`);
await page.waitForTimeout(200);
await page.locator(".sslot", { hasText: "Bozuk Mod" }).locator(".btn.red").click();
await page.locator(".sslot", { hasText: "Pahalı İpek" }).locator(".btn").first().click();
await page.waitForTimeout(200);
await page.reload();
await page.waitForFunction(() => !document.getElementById("loading"), null, { timeout: 60000 });
await page.waitForTimeout(500);
await ev(`g.hud.openHero(); g.hud.tab = "ayar"; g.hud.render();`);
await page.waitForTimeout(300);
const t2 = (await page.locator(".panel .pb").innerText()).replace(/\s+/g, " ");
console.log("after toggle:", t2.slice(t2.indexOf("Modlar"), t2.indexOf("Modlar") + 200));
console.log("errors:", errs);
await browser.close();
