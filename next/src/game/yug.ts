export interface Fallen {
  name: string;
  lv: number;
  kills: number;
  day: number;
  mourned?: boolean;
  warned?: boolean;
}

export interface Foe {
  name: string;
  kind: "nemesis" | "rival" | "boss";
  day: number;
  raised?: boolean;
}

export const YUG_FOOD = 40;
export const YUG_GOLD = 80;
export const YUG_LATE = 7;
export const BALBAL_STONE = 150;
export const BALBAL_GOLD = 60;
export const BALBAL_MAX = 12;
export const BALBAL_ARMY = 0.006;

export function yugCost(n: number): { food: number; gold: number } {
  return { food: YUG_FOOD * n, gold: YUG_GOLD + 30 * n };
}

export function balbalBonus(foes: Foe[]): number {
  return Math.min(BALBAL_MAX, foes.filter((f) => f.raised).length) * BALBAL_ARMY;
}

export const FOE_KIND: Record<Foe["kind"], [string, string]> = {
  nemesis: ["Can düşmanı", "Nemesis"],
  rival: ["Bey", "Bey"],
  boss: ["Efsanevi düşman", "Legendary foe"],
};
