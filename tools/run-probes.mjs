import { spawnSync } from "node:child_process";

const list = process.argv.slice(2);
const bad = [];
for (const item of list) {
  const [name, mode = "desk", cls = "alp"] = item.split(":");
  const t0 = Date.now();
  const r = spawnSync("npx", ["tsx", `tools/kk-${name}-probe.ts`, mode, cls], { encoding: "utf8", shell: true, timeout: 300000 });
  const out = (r.stdout ?? "") + (r.stderr ?? "");
  const errLine = out.split("\n").find((l) => l.startsWith("errors:")) ?? "";
  const ok = r.status === 0 && /errors:\s*\[\]/.test(errLine);
  if (!ok) bad.push(name);
  console.log(`${ok ? "OK  " : "FAIL"} ${name} ${mode} ${cls} ${((Date.now() - t0) / 1000).toFixed(0)}s ${ok ? "" : (errLine || out.split("\n").filter((l) => /Error|error/.test(l)).slice(0, 4).join(" | "))}`);
}
console.log(bad.length ? `FAILED: ${bad.join(", ")}` : "ALL OK");
