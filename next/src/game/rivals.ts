import type { Army } from "./data";
import type { Good } from "./rpg";

export type RivalTrait = "hirsli" | "onurlu" | "kurnaz" | "comert";
export type RivalStatus = "peace" | "ally" | "war" | "vassal" | "dead";

export interface Rival {
  id: string;
  name: string;
  title: "Bey" | "Emir";
  icon: string;
  trait: RivalTrait;
  home: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  army: Army;
  lv: number;
  rel: number;
  status: RivalStatus;
  defeats: number;
  wait: number;
  req?: BeyReq;
  age?: number;
  heirs?: string[];
  gen?: number;
  wed?: boolean;
}

export type ReqKind = "camp" | "goods" | "foe" | "sefer";

export interface BeyReq {
  kind: ReqKind;
  camp?: number;
  good?: Good;
  n?: number;
  foe?: string;
  base?: number;
  city?: string;
  until: number;
  gold: number;
}

export const REQ_INFO: Record<ReqKind, { name: string; icon: string; days: number; line: string }> = {
  camp: { name: "Haramileri temizle", icon: "j_bandit", days: 3, line: "Topraklarımda haramiler at koşturuyor. Kampını dağıt, kardeşim." },
  goods: { name: "Erzak ve teçhizat", icon: "j_caravan", days: 3, line: "Ordum kışa hazırlanıyor; ambarlarım boş. Getirirsen karşılığını fazlasıyla öderim." },
  foe: { name: "Ortak düşman", icon: "swords", days: 4, line: "Bir bey tuğuma diş biliyor. Onun ordusunu dağıtırsan kan borcum olur." },
  sefer: { name: "Ortak sefer", icon: "siege", days: 5, line: "Atlarımız yan yana koşsun! O şehrin surlarına birlikte yürüyelim; askerlerim senin emrinde." },
};

export const REQ_GOODS: Good[] = ["deri", "demir", "pamuk", "hali", "baharat"];

export function reqGold(kind: ReqKind, lv: number): number {
  return kind === "camp" ? 160 + lv * 20 : kind === "foe" ? 320 + lv * 30 : kind === "sefer" ? 650 + lv * 40 : 0;
}

export const RIVAL_TRAITS: Record<RivalTrait, { name: string; desc: string; gift: number; war: number }> = {
  hirsli: { name: "Hırslı", desc: "Gücünü gördüğü an saldırır; zayıfı ezer, güçlüye diş biler.", gift: 0.7, war: 1.6 },
  onurlu: { name: "Onurlu", desc: "Sözünün eridir. Dostluğu zor kazanılır ama asla bozulmaz.", gift: 0.9, war: 0.6 },
  kurnaz: { name: "Kurnaz", desc: "Rüzgâr nereden eserse oradan yana. Hediyeyi sever, güveni azdır.", gift: 1.3, war: 1 },
  comert: { name: "Cömert", desc: "Sofrası açık, kesesi bol. Müttefiklerine armağan yollar.", gift: 1.1, war: 0.4 },
};

export const RIVAL_DEFS: { id: string; name: string; title: "Bey" | "Emir"; icon: string; trait: RivalTrait; home: string }[] = [
  { id: "cagri", name: "Çağrı", title: "Bey", icon: "lord_bey", trait: "hirsli", home: "merv" },
  { id: "sencer", name: "Sencer", title: "Emir", icon: "lord_emir", trait: "kurnaz", home: "bukhara" },
  { id: "inal", name: "İnal", title: "Bey", icon: "lord_bey", trait: "onurlu", home: "rey" },
  { id: "kutalmis", name: "Kutalmış", title: "Bey", icon: "lord_bey", trait: "comert", home: "tabriz" },
  { id: "bugra", name: "Buğra", title: "Emir", icon: "lord_emir", trait: "hirsli", home: "kashgar" },
];

export const STATUS_NAME: Record<RivalStatus, string> = { peace: "Barış", ally: "Müttefik", war: "Savaş", vassal: "Tabi", dead: "Öldü" };

export const RIVAL_LINES = {
  hello: ["Bozkır geniş ama iki tuğa dar gelir.", "Adını duydum. Bakalım şanın kılıcına yetişiyor mu?", "Atını sula, ama çadırıma yaklaşma.", "Yolumuz kesişti; kader mi, tesadüf mü?"],
  gift: ["Hediyen kabul edildi. Kesen bol olsun.", "Cömertlik beyler arasında unutulmaz.", "Bu armağanı hatırlayacağım."],
  refuse: ["Henüz sana güvenmiyorum.", "İttifak kan ister, hediye değil.", "Önce dostluğunu kanıtla."],
  war: ["Tuğlarımız çarpışacak!", "Bozkır ikimizi birden taşımaz.", "Seni atının ayakları altında çiğneyeceğim."],
  yield: ["Kılıcım kırıldı… biat ediyorum.", "Bugün sen kazandın. Tuğum senin tuğuna eğilir."],
};

export function oneOf<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

export function rivalArmy(lv: number): Army {
  const n = 10 + lv * 3;
  return { spear: Math.round(n * 0.4), archer: Math.round(n * 0.3), horse: Math.round(n * 0.3) };
}

export function rivalBoss(r: Rival) {
  const t = 2 + r.lv * 0.55;
  return { name: `${r.name} ${r.title}`, icon: r.icon, hp: Math.round(90 * Math.pow(t, 1.4)), atk: Math.round(5 * Math.pow(t, 1.25)), def: 2 + Math.round(t * 2.5) };
}

export function rivalName(r: Rival): string {
  return `${r.name} ${r.title}`;
}

export function tribute(r: Rival): number {
  return 40 + r.lv * 8;
}

export function giftCost(r: Rival): number {
  return 150 + r.lv * 25;
}
