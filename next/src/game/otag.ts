import type { SeasonId } from "./seasons";

export interface Otag {
  x: number;
  y: number;
  herd: number;
  fest: string;
}

export type Zone = "yaylak" | "kislak";

export const OTAG_GOLD = 1200;
export const OTAG_WOOD = 300;
export const MOVE_FOOD = 80;
export const HERD_MAX = 600;
export const HERD_BUY = 20;
export const HERD_GOLD = 180;
export const REST_FOOD = 30;

export const ZONE_NAME: Record<Zone, string> = { yaylak: "Yaylak", kislak: "Kışlak" };
export const ZONE_DESC: Record<Zone, string> = {
  yaylak: "Kuzeyin serin dağ otlakları: yazın gür, kışın karla örtülü.",
  kislak: "Güneyin korunaklı ovaları: kışın sürüyü yaşatır, yazın kavrulur.",
};

const PASTURE: Record<Zone, Record<SeasonId, number>> = {
  yaylak: { bahar: 1.1, yaz: 1.5, guz: 1, kis: 0.25 },
  kislak: { bahar: 1, yaz: 0.6, guz: 1.1, kis: 1.3 },
};

export function zoneOf(y: number, h: number): Zone {
  return y < h * 0.45 ? "yaylak" : "kislak";
}

export function pasture(z: Zone, se: SeasonId): number {
  return PASTURE[z][se];
}

export function bestZone(se: SeasonId): Zone {
  return PASTURE.yaylak[se] >= PASTURE.kislak[se] ? "yaylak" : "kislak";
}
