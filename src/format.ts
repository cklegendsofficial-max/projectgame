import { getLang } from "./i18n";
import type { Notation } from "./state";

const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "OcDc", "NoDc", "Vg"];

let notation: Notation = "suffix";

export function setNotation(n: Notation): void {
  notation = n;
}

export function fmt(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "∞";
  if (n < 0) return "-" + fmt(-n, decimals);
  if (n < 1000) {
    if (n < 10 && n % 1 !== 0) return n.toFixed(1);
    return Math.floor(n).toString();
  }
  const exp = Math.floor(Math.log10(n));
  if (notation === "sci" || exp >= SUFFIXES.length * 3) {
    return (n / Math.pow(10, exp)).toFixed(decimals) + "e" + exp;
  }
  const tier = Math.floor(exp / 3);
  const scaled = n / Math.pow(1000, tier);
  const d = scaled >= 100 ? Math.max(0, decimals - 2) : scaled >= 10 ? Math.max(0, decimals - 1) : decimals;
  return scaled.toFixed(d) + SUFFIXES[tier];
}

export function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "-";
  const [uh, um, us] = getLang() === "tr" ? ["sa", "dk", "sn"] : ["h", "m", "s"];
  if (seconds < 1) return seconds.toFixed(1) + us;
  if (seconds < 60) return Math.ceil(seconds) + us;
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}${uh} ${m.toString().padStart(2, "0")}${um}`;
  return `${m}${um} ${sec.toString().padStart(2, "0")}${us}`;
}
