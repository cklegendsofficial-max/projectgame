// Savaş dengesi: aynı karşılaşmayı farklı emir/yedek/arazi seçenekleriyle binlerce kez oynatır.
import { Sim, type Champion, type Field, type Order } from "../next/src/game/battle";
import type { Army } from "../next/src/game/data";

const N = Number(process.argv[2] ?? 2000);
const champ: Champion = { atk: 14, def: 4, hp: 120, maxHp: 120, crit: 0.1, critMult: 1.8, dodge: 0.05, heal: 0, rage: false, firstStrike: false, skills: [] } as unknown as Champion;

type Plan = { name: string; reserve: boolean; field: Field | null; orders: (r: number, s: Sim) => Order | undefined };
const plans: Plan[] = [
  { name: "emirsiz", reserve: false, field: null, orders: () => undefined },
  { name: "nara+kanat", reserve: false, field: null, orders: (r) => (r === 1 ? "nara" : r === 3 ? "kanat" : undefined) },
  { name: "yedek(oto)", reserve: true, field: null, orders: () => undefined },
  { name: "yedek@3", reserve: true, field: null, orders: (r) => (r === 3 ? "yedek" : undefined) },
  { name: "yedek@3+nara", reserve: true, field: null, orders: (r) => (r === 1 ? "nara" : r === 3 ? "yedek" : undefined) },
  { name: "bozkir", reserve: false, field: { ground: "bozkir", night: false }, orders: () => undefined },
  { name: "dag", reserve: false, field: { ground: "dag", night: false }, orders: () => undefined },
  { name: "dag gece", reserve: false, field: { ground: "dag", night: true }, orders: () => undefined },
];

const fights: { name: string; a: Army; b: Army; bb: number }[] = [
  { name: "denk 20v20", a: { spear: 8, archer: 6, horse: 6 }, b: { spear: 8, archer: 6, horse: 6 }, bb: 0.1 },
  { name: "zor 20v28", a: { spear: 8, archer: 6, horse: 6 }, b: { spear: 12, archer: 8, horse: 8 }, bb: 0.1 },
  { name: "büyük 60v60", a: { spear: 24, archer: 18, horse: 18 }, b: { spear: 24, archer: 18, horse: 18 }, bb: 0.15 },
];

for (const f of fights) {
  console.log(`\n== ${f.name}`);
  for (const p of plans) {
    let win = 0, lost = 0, rout = 0, rounds = 0;
    for (let i = 0; i < N; i++) {
      const s = new Sim(f.a, 0.1, f.b, f.bb, { ...champ }, null, p.field, p.reserve);
      let r = 0;
      while (!s.done()) s.step(p.orders(++r, s));
      const res = s.finish();
      if (res.win) win++;
      if (res.rout) rout++;
      lost += Object.values(res.lostA).reduce((a, b) => a + b, 0);
      rounds += res.rounds.length;
    }
    console.log(`${p.name.padEnd(14)} zafer %${((win / N) * 100).toFixed(1).padStart(5)}  kayıp ${(lost / N).toFixed(1).padStart(5)}  bozgun %${((rout / N) * 100).toFixed(0).padStart(3)}  tur ${(rounds / N).toFixed(1)}`);
  }
}
