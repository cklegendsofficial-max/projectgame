import { odds, type Champion } from "../next/src/game/battle";
import { army } from "../next/src/game/data";
import { kurganBoss, kurganGuard, campGarrison } from "../next/src/game/state";

const hero = (lv: number, skills: Champion["skills"] = []): Champion => {
  const atk = 6 + lv * 2.2;
  const hp = 60 + lv * 9;
  return { atk, def: 4 + lv * 1.5, hp, maxHp: hp, crit: 0.1, critMult: 1.8, dodge: 0, heal: 0, rage: false, firstStrike: false, skills };
};
const cases: [string, number, ReturnType<typeof army>][] = [
  ["lv3 solo", 3, army(0, 0, 0)],
  ["lv5 +10", 5, army(8, 2, 0)],
  ["lv8 +25", 8, army(15, 7, 3)],
  ["lv12 +45", 12, army(25, 12, 8)],
  ["lv16 +70", 16, army(35, 20, 15)],
];
import { FORT_GUARD, KARA_HAN, KASIM } from "../next/src/game/story";
for (const [lv, a] of [[5, army(8, 2, 0)], [6, army(15, 5, 2)], [12, army(50, 30, 20)], [15, army(60, 40, 25)], [18, army(70, 45, 35)], [22, army(90, 60, 45)]] as const) {
  const c = hero(lv, [{ name: "b", kind: "burst", pow: 1.1 + 0.15 * Math.min(9, lv - 3) }, { name: "s", kind: "shield", pow: 0.2 + 0.035 * Math.min(9, lv - 6) }]);
  c.atk *= lv >= 12 ? 1.6 : 1;
  console.log(`lv${lv} army ${a.spear + a.archer + a.horse}`, "kasim", Math.round(odds(a, 0.03 * lv, army(8, 4, 0), 0.1, c, KASIM) * 100), "fort", Math.round(odds(a, 0.03 * lv + 0.1, FORT_GUARD, 0.3, c, KARA_HAN) * 100));
}
for (const [name, lv, a] of cases) {
  const c = hero(lv, lv >= 3 ? [{ name: "b", kind: "burst", pow: 1.1 + 0.15 * Math.min(9, lv - 3) }] : []);
  const row = [1, 2, 3, 4, 5].map((t) => `${Math.round(odds(a, 0.03 * lv, kurganGuard(t), 0.1 * t, c, kurganBoss(t)) * 100)}`.padStart(4));
  const camps = [1, 2, 3, 4, 5].map((t) => `${Math.round(odds(a, 0.03 * lv, campGarrison(t), 0.1, c) * 100)}`.padStart(4));
  console.log(name.padEnd(10), "kurgan", row.join(""), " | camp", camps.join(""));
}
