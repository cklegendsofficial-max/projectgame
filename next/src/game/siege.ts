import { armySize, type Army } from "./data";

export type SiegeAct = "bombard" | "sap" | "starve" | "parley" | "raid";

export interface SiegeRun {
  city: string;
  day: number;
  wall0: number;
  breach: number;
  gar: Army;
  gar0: number;
  morale: number;
  relief: number;
  sap: number;
  engines: number;
  parleys: number;
  log: { t: string; cls: string }[];
}

export interface SiegeCtx {
  kar: number;
  renown: number;
  armyN: number;
  rnd: () => number;
}

export interface SiegeOut {
  loss: number;
  surrender?: boolean;
}

export const SIEGE_MAX_DAY = 14;

export const SIEGE_ACTS: { id: SiegeAct; name: string; icon: string; desc: string; en: [string, string] }[] = [
  { id: "bombard", name: "Surları döv", icon: "siege", desc: "Mancınık ve taş atıcılarla surda gedik aç. Mancınık varsa çok daha etkili.", en: ["Bombard the walls", "Open a breach with catapults and slingers. Much stronger with siege engines."] },
  { id: "sap", name: "Lağım kaz", icon: "b_tasocagi", desc: "Üç gecede surun altına tünel kaz; çökünce büyük gedik açılır. Fark edilirsen kazıcılar ölür.", en: ["Dig a sap", "Tunnel under the wall over three nights; its collapse opens a huge breach. If discovered, the diggers die."] },
  { id: "starve", name: "Kuşatıp beklet", icon: "food", desc: "Yolları kes, şehri aç bırak. Moral ve garnizon erir ama zaman yardım ordusunun lehine işler.", en: ["Blockade", "Cut the roads and starve the city. Morale and garrison erode, but time favors the relief army."] },
  { id: "parley", name: "Elçi gönder", icon: "scroll", desc: "Teslim olmalarını iste. Moral düştükçe, karizman ve şöhretin arttıkça şans büyür.", en: ["Send an envoy", "Demand surrender. The chance grows as their morale falls and your charisma and renown rise."] },
  { id: "raid", name: "Gece baskını", icon: "sk_golge", desc: "Atlılarla karanlıkta kapıya yüklen; garnizonu erit ama kayıp ver.", en: ["Night raid", "Strike the gate in the dark with riders; whittle the garrison but take losses."] },
];

const cut = (a: Army, f: number): number => {
  let n = 0;
  for (const k of Object.keys(a) as (keyof Army)[]) {
    const d = Math.round(a[k] * f);
    a[k] -= d;
    n += d;
  }
  return n;
};

export function newSiege(city: string, wall0: number, gar: Army, engines: number, rnd: () => number): SiegeRun {
  return { city, day: 1, wall0, breach: 0, gar: { ...gar }, gar0: armySize(gar), morale: 70, relief: 6 + Math.floor(rnd() * 4), sap: 0, engines, parleys: 0, log: [] };
}

export function siegeWall(r: SiegeRun): number {
  return Math.max(0, r.wall0 * (1 - r.breach / 100));
}

export function siegeGar(r: SiegeRun): Army {
  const k = 0.65 + 0.35 * (r.morale / 100);
  return { spear: Math.round(r.gar.spear * k), archer: Math.round(r.gar.archer * k), horse: Math.round(r.gar.horse * k) };
}

export function parleyChance(r: SiegeRun, c: SiegeCtx): number {
  return Math.max(0.03, Math.min(0.9, ((100 - r.morale) / 100) * 0.6 + c.kar * 0.015 + c.renown / 6000 - r.parleys * 0.1 - (r.breach < 20 ? 0.1 : 0)));
}

/** Bir kuşatma günü: eylem + gün sonu olayları. Senin kaybını döndürür. */
export function siegeDay(r: SiegeRun, act: SiegeAct, c: SiegeCtx): SiegeOut {
  const log = (t: string, cls = "") => r.log.unshift({ t: `${r.day}. gün: ${t}`, cls });
  let loss = 0;
  const rnd = c.rnd;
  if (act === "bombard") {
    const b = r.engines ? 14 * r.engines + rnd() * 10 : 4 + rnd() * 5;
    r.breach = Math.min(100, r.breach + b);
    r.morale = Math.max(0, r.morale - (r.engines ? 7 : 3));
    log(r.engines ? `Mancınıklar bütün gün taş yağdırdı; surda gedik büyüdü (+${Math.round(b)}%).` : `Taş atıcılar surları dövdü ama mancınıksız iş yavaş (+${Math.round(b)}%).`, "good");
  } else if (act === "sap") {
    if (rnd() < 0.2 + r.sap * 0.05) {
      loss = Math.max(1, Math.round(c.armyN * 0.05));
      r.sap = 0;
      log(`Lağım fark edildi! Kaynar zift döktüler, ${loss} kazıcı öldü.`, "bad");
    } else if (++r.sap >= 3) {
      r.sap = 0;
      r.breach = Math.min(100, r.breach + 40);
      r.morale = Math.max(0, r.morale - 15);
      cut(r.gar, 0.06);
      log("Lağım ateşlendi, bir burç gürültüyle çöktü! Surda koca bir gedik açıldı.", "good");
    } else log(`Kazıcılar surun altında ilerliyor (${r.sap}/3).`);
  } else if (act === "starve") {
    r.morale = Math.max(0, r.morale - (8 + Math.min(8, r.day * 0.6)));
    const d = cut(r.gar, 0.04);
    log(`Yollar kesildi; şehirde ekmek karneye bağlandı. ${d} savunmacı açlıktan düştü.`);
  } else if (act === "parley") {
    const p = parleyChance(r, c);
    r.parleys++;
    if (rnd() < p) {
      log("Şehrin ileri gelenleri anahtarları elçine teslim etti!", "good");
      return { loss: 0, surrender: true };
    }
    r.morale = Math.min(100, r.morale + 4);
    log(r.parleys >= 3 ? "Elçinin kulağını kesip geri yolladılar. Bir daha dinlemeyecekler gibi." : "Burçlardan güldüler: \"Surlarımız sağlam, ambarlarımız dolu!\"", "bad");
  } else if (act === "raid") {
    const d = cut(r.gar, 0.07 + rnd() * 0.05);
    loss = Math.max(1, Math.round(c.armyN * (0.02 + rnd() * 0.03)));
    r.morale = Math.max(0, r.morale - 5);
    log(`Gece baskını: ${d} savunmacı kılıçtan geçti, ${loss} askerini kaybettin.`, d > loss ? "good" : "bad");
  }
  r.relief--;
  if (r.relief === 0) {
    const add = Math.round(r.gar0 * 0.35);
    r.gar.spear += Math.round(add * 0.4);
    r.gar.archer += Math.round(add * 0.3);
    r.gar.horse += Math.round(add * 0.3);
    r.morale = Math.min(100, r.morale + 25);
    log(`Yardım ordusu kuşatmayı yardı! Şehre ${add} taze asker girdi.`, "bad");
  } else if (r.morale > 55 && rnd() < 0.22) {
    const l = Math.max(1, Math.round(c.armyN * 0.04));
    loss += l;
    cut(r.gar, 0.03);
    log(`Savunmacılar kapıdan çıkış yaptı; ${l} askerin düştü.`, "bad");
  } else if (r.morale < 35 && rnd() < 0.4) {
    const d = cut(r.gar, 0.06);
    log(`Gece surlardan ip sarkıtıp kaçtılar: ${d} savunmacı firar etti.`, "good");
  }
  r.day++;
  return { loss };
}
