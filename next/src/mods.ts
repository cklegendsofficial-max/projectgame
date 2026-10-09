import { addText, lang, type Lang } from "./i18n";
import { BUILDING_BY_ID, CITY_NAME, RES_NAME, UNITS } from "./game/data";
import { GOODS, SKILL_INFO, STAT_INFO } from "./game/rpg";
import { CONS_BY_ID } from "./game/crafting";
import { ORIGIN_BY_ID } from "./game/origins";
import { COMP_BY_ID } from "./game/story";
import { CODEX, CODEX_CATS, type CodexCat, type CodexEntry } from "./game/codex";
import { WEEK_THEMES, type WeekTheme } from "./game/weekly";
import { WR_FOES } from "./game/games";

export interface ModFile {
  file: string;
  text: string;
}

export interface ModInfo {
  id: string;
  name: string;
  version: string;
  author: string;
  file: string;
  on: boolean;
  changes: number;
  errors: string[];
}

interface ModJson {
  id?: string;
  name?: string;
  version?: string;
  author?: string;
  patch?: Record<string, Record<string, unknown>>;
  add?: { codex?: unknown[]; weekThemes?: unknown[] };
  text?: Partial<Record<Lang, Record<string, string>>>;
}

const LS_MODS = "kk_mods";
const LS_OFF = "kk_mods_off";
const MAX_BYTES = 512 * 1024;

const byId = <T extends { id: string }>(list: T[]): Record<string, T> => Object.fromEntries(list.map((x) => [x.id, x]));

/** Modların değiştirebildiği tablolar. Yalnızca var olan anahtarlar ve aynı türdeki alanlar değişebilir. */
const TABLES: Record<string, () => Record<string, unknown>> = {
  goods: () => GOODS,
  units: () => UNITS,
  buildings: () => BUILDING_BY_ID,
  cities: () => CITY_NAME,
  resources: () => RES_NAME,
  skills: () => SKILL_INFO,
  stats: () => STAT_INFO,
  consumables: () => CONS_BY_ID,
  origins: () => ORIGIN_BY_ID,
  companions: () => COMP_BY_ID,
  codex: () => byId(CODEX),
  weekThemes: () => byId(WEEK_THEMES),
  wrestlers: () => Object.fromEntries(WR_FOES.map((f, i) => [String(i), f])),
};

export const MOD_TABLES = Object.keys(TABLES);

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

function merge(dst: Record<string, unknown>, src: Record<string, unknown>, path: string, err: string[]): number {
  let n = 0;
  for (const [k, v] of Object.entries(src)) {
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
    const cur = dst[k];
    const p = `${path}.${k}`;
    if (cur === undefined) {
      err.push(`${p}: bilinmeyen alan`);
      continue;
    }
    if (typeof cur === "function") {
      err.push(`${p}: kod alanı değiştirilemez`);
      continue;
    }
    if (isObj(cur) && isObj(v)) {
      n += merge(cur, v, p, err);
      continue;
    }
    if (Array.isArray(cur) && Array.isArray(v) && v.every((x, i) => typeof x === typeof cur[i] && typeof x !== "object")) {
      dst[k] = v;
      n++;
      continue;
    }
    if (typeof cur !== typeof v || isObj(cur) || Array.isArray(cur)) {
      err.push(`${p}: ${typeof cur} bekleniyordu`);
      continue;
    }
    if (typeof v === "number" && !Number.isFinite(v)) {
      err.push(`${p}: geçersiz sayı`);
      continue;
    }
    if (typeof v === "string" && v.length > 4000) {
      err.push(`${p}: metin çok uzun`);
      continue;
    }
    dst[k] = v;
    n++;
  }
  return n;
}

const str = (v: unknown, max = 4000): v is string => typeof v === "string" && v.length > 0 && v.length <= max;

function addCodex(list: unknown[], mod: string, err: string[]): number {
  let n = 0;
  for (const raw of list) {
    if (!isObj(raw) || !str(raw.id, 40) || !str(raw.title, 80) || !str(raw.text) || !(String(raw.cat) in CODEX_CATS)) {
      err.push("add.codex: id, title, text ve geçerli cat (kultur/inanc/yer/yol) gerekir");
      continue;
    }
    const id = `${mod}:${raw.id}`;
    if (CODEX.some((c) => c.id === id)) continue;
    const en = Array.isArray(raw.en) && str(raw.en[0], 80) && str(raw.en[1]) ? ([raw.en[0], raw.en[1]] as [string, string]) : ([raw.title, raw.text] as [string, string]);
    const entry: CodexEntry = { id, cat: raw.cat as CodexCat, icon: str(raw.icon, 80) ? raw.icon : "scroll", title: raw.title, text: raw.text, en, hint: str(raw.hint, 200) ? raw.hint : "Mod içeriği.", open: () => true };
    CODEX.push(entry);
    n++;
  }
  return n;
}

function addThemes(list: unknown[], mod: string, err: string[]): number {
  let n = 0;
  for (const raw of list) {
    if (!isObj(raw) || !str(raw.name, 60) || !isObj(raw.score) || !Object.values(raw.score).every((v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1000)) {
      err.push("add.weekThemes: name ve sayısal score gerekir");
      continue;
    }
    const mods = isObj(raw.mods) ? Object.fromEntries(Object.entries(raw.mods).filter(([, v]) => typeof v === "number" && Math.abs(v) <= 0.3)) : {};
    const th: WeekTheme = {
      id: `${mod}:${str(raw.id, 40) ? raw.id : WEEK_THEMES.length}`,
      name: raw.name,
      en: str(raw.en, 60) ? raw.en : raw.name,
      icon: str(raw.icon, 80) ? raw.icon : "trophy",
      desc: str(raw.desc, 300) ? raw.desc : "",
      descEn: str(raw.descEn, 300) ? raw.descEn : str(raw.desc, 300) ? raw.desc : "",
      score: raw.score as WeekTheme["score"],
      mods,
    };
    WEEK_THEMES.push(th);
    n++;
  }
  return n;
}

export function applyMod(json: ModJson, file: string): ModInfo {
  const err: string[] = [];
  const id = str(json.id, 40) && /^[a-z0-9_-]+$/i.test(json.id) ? json.id : file.replace(/\.json$/i, "");
  let n = 0;
  if (isObj(json.patch)) {
    for (const [tab, rows] of Object.entries(json.patch)) {
      const get = TABLES[tab];
      if (!get) {
        err.push(`patch.${tab}: bilinmeyen tablo (${MOD_TABLES.join(", ")})`);
        continue;
      }
      if (!isObj(rows)) continue;
      const table = get();
      for (const [key, val] of Object.entries(rows)) {
        const row = table[key];
        if (row === undefined) {
          err.push(`patch.${tab}.${key}: böyle bir kayıt yok`);
          continue;
        }
        if (typeof row === "string") {
          if (str(val, 200)) {
            table[key] = val;
            n++;
          } else err.push(`patch.${tab}.${key}: metin bekleniyordu`);
          continue;
        }
        if (isObj(row) && isObj(val)) n += merge(row, val, `patch.${tab}.${key}`, err);
      }
    }
  }
  if (isObj(json.add)) {
    if (Array.isArray(json.add.codex)) n += addCodex(json.add.codex, id, err);
    if (Array.isArray(json.add.weekThemes)) n += addThemes(json.add.weekThemes, id, err);
  }
  if (isObj(json.text)) {
    for (const l of ["tr", "en"] as Lang[]) if (isObj(json.text[l])) n += addText(l, json.text[l] as Record<string, string>);
  }
  return { id, name: str(json.name, 80) ? json.name : id, version: str(json.version, 20) ? json.version : "", author: str(json.author, 60) ? json.author : "", file, on: true, changes: n, errors: err.slice(0, 20) };
}

interface ModBridge {
  dir: string;
  list(): ModFile[];
  open(): void;
}

export const modBridge = (window as unknown as { kkMods?: ModBridge }).kkMods ?? null;

export function storedMods(): ModFile[] {
  try {
    const r = JSON.parse(localStorage.getItem(LS_MODS) ?? "[]") as ModFile[];
    return Array.isArray(r) ? r.filter((m) => typeof m?.file === "string" && typeof m?.text === "string") : [];
  } catch {
    return [];
  }
}

export function offMods(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_OFF) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function toggleMod(id: string): void {
  const off = offMods();
  if (off.has(id)) off.delete(id);
  else off.add(id);
  localStorage.setItem(LS_OFF, JSON.stringify([...off]));
}

/** Tarayıcıda dosyadan yüklenen modu saklar. Hata varsa açıklamasını döner. */
export function storeMod(file: string, text: string): string | null {
  if (text.length > MAX_BYTES) return "Mod dosyası 512 KB'tan büyük olamaz.";
  try {
    const j = JSON.parse(text) as unknown;
    if (!isObj(j)) return "Mod bir JSON nesnesi olmalı.";
  } catch (e) {
    return `JSON okunamadı: ${(e as Error).message}`;
  }
  const list = storedMods().filter((m) => m.file !== file);
  list.push({ file, text });
  localStorage.setItem(LS_MODS, JSON.stringify(list));
  return null;
}

export function removeMod(file: string): void {
  localStorage.setItem(LS_MODS, JSON.stringify(storedMods().filter((m) => m.file !== file)));
}

export const loadedMods: ModInfo[] = [];

/** Bütün modları sırayla uygular. Oyun kurulmadan önce, dil çevirisinden sonra bir kez çağrılır. */
export function loadMods(): void {
  const files: (ModFile & { local: boolean })[] = [];
  try {
    for (const f of modBridge?.list() ?? []) files.push({ ...f, local: false });
  } catch {
    /* mod folder unreadable */
  }
  for (const f of storedMods()) files.push({ ...f, local: true });
  const off = offMods();
  for (const f of files.sort((a, b) => a.file.localeCompare(b.file))) {
    let json: ModJson;
    try {
      json = JSON.parse(f.text) as ModJson;
    } catch (e) {
      loadedMods.push({ id: f.file, name: f.file, version: "", author: "", file: f.file, on: false, changes: 0, errors: [`JSON: ${(e as Error).message}`] });
      continue;
    }
    const id = typeof json.id === "string" ? json.id : f.file.replace(/\.json$/i, "");
    if (off.has(id)) {
      loadedMods.push({ id, name: typeof json.name === "string" ? json.name : id, version: "", author: "", file: f.file, on: false, changes: 0, errors: [] });
      continue;
    }
    loadedMods.push(applyMod(json, f.file));
  }
  if (loadedMods.length) console.log("mods", loadedMods.map((m) => `${m.id}${m.on ? "" : " (off)"} ${m.changes}`).join(", "), lang());
}
