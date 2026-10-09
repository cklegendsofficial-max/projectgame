export type SongKind = "zafer" | "fetih" | "kagan" | "gazi" | "kan" | "biat" | "son" | "destan" | "tulpar" | "tore";

export interface Song {
  d: number;
  k: SongKind;
  title: string;
  lines: string[];
}

export interface SongCtx {
  name: string;
  foe?: string;
  place?: string;
}

export const SONG_MAX = 30;
export const SING_GOLD = 40;

type Tpl = (c: SongCtx) => { title: string; lines: string[] };

const SONGS: Record<SongKind, Tpl[]> = {
  zafer: [
    (c) => ({ title: `${c.foe} Yenildi`, lines: [`Bozkırda bir toz kalktı, güneş karardı,`, `${c.foe} ordusu yerden göğe yayıldı.`, `${c.name} atını sürdü, kılıcı parladı,`, `Akşam olmadan kurtlar ganimet paylaştı.`] }),
    (c) => ({ title: `${c.foe} Destanı`, lines: [`Kopuzum tel tel olsun, bu türkü yanık,`, `${c.foe} diye bir yiğit vardı, adı korkunç.`, `${c.name} karşısına çıktı, tuğu kanlı,`, `Şimdi ${c.foe} anılmaz, ${c.name} anılır.`] }),
  ],
  fetih: [
    (c) => ({ title: `${c.place} Kapıları`, lines: [`${c.place} surları gökle yarışırdı,`, `Taşına kartal konmaz, kapısı demirdi.`, `${c.name} geldi, mancınıklar konuştu,`, `Burçlarda şimdi bozkırın tuğu dalgalanır.`] }),
    (c) => ({ title: `${c.place} Düştü`, lines: [`Ağlama ${c.place}, sana bey geldi,`, `Atları kır, tuğu ak, sözü töreli.`, `Han kaçtı, kale açtı kapısını,`, `${c.name} dedi: "Halkım, korkma, ben geldim."`] }),
  ],
  kagan: [
    (c) => ({ title: `Ak Keçe`, lines: [`Beyler toplandı, ak keçe serildi,`, `Üç kez göğe kalktı, üç kez yere indi.`, `Gök Tengri bir ad verdi o gün bozkıra:`, `${c.name} Kağan! Dokuz boy ona eğildi.`] }),
  ],
  gazi: [
    (c) => ({ title: `${c.foe} İçin Ağıt`, lines: [`Kara toprak, sana bir yiğit verdik,`, `${c.foe}, kalkanı göğsünde, uyudu.`, `Atı boş döndü, eyeri kan içinde,`, `${c.name} yemin etti: "Adın yaşayacak."`] }),
    (c) => ({ title: `Düşen Alp`, lines: [`Ok yağmuru altında bir türkü söyledi,`, `${c.foe} geri dönmedi, ama geri durmadı.`, `Ozanlar sorar: "Nerede o yiğit?"`, `Bozkır cevap verir: "Rüzgârda, kanatta."`] }),
  ],
  kan: [
    (c) => ({ title: `Kan Davası Kapandı`, lines: [`${c.foe} yemin etmişti, kan istemişti,`, `Yıllarca izledi, gece gündüz bekledi.`, `${c.name} ile karşılaştı bir sabah,`, `Bozkır sustu; kan davası kapandı.`] }),
  ],
  biat: [
    (c) => ({ title: `${c.foe} Eğildi`, lines: [`${c.foe} tuğunu yere indirdi,`, `Kılıcını uzattı, kabzası öne.`, `${c.name} kaldırdı onu yerden:`, `"Kardeşim ol, düşmanım olma."`] }),
    (c) => ({ title: `${c.foe} Düştü`, lines: [`${c.foe} atından düştü, toz yuttu,`, `Tuğu kırıldı, obası dağıldı.`, `Bozkırda bir tuğ eksildi o gün,`, `${c.name} tuğu bir boy daha yükseldi.`] }),
  ],
  son: [
    (c) => ({ title: `Tengri Dağı`, lines: [`Dağın başında kar, karın üstünde kurt,`, `Kök Börü baktı, ${c.name} baktı.`, `Kut indi gökten, ${c.foe} oldu yolu,`, `Bu türkü bitmez, bozkır bitene dek.`] }),
  ],
  destan: [
    (c) => ({ title: `${c.foe}`, lines: [`Atalar anlatır, torunlar dinler:`, `${c.foe} karanlığı çöktü bir zaman.`, `${c.name} çıktı, demir zinciri kırdı,`, `Gün doğdu, göç yolları yeniden açıldı.`] }),
  ],
  tulpar: [
    (c) => ({ title: `Tulpar`, lines: [`${c.place} ahırında gök gürledi,`, `Kanatlı bir tay doğdu, yelesi alev.`, `${c.name} bindi, bozkır daraldı,`, `Rüzgâr bile ardından yetişemedi.`] }),
  ],
  tore: [
    (c) => ({ title: `Töreli Bey`, lines: [`Zengin de gelir otağa, yoksul da,`, `${c.name} terazisi eğilmez.`, `"${c.foe}" dendi, hüküm verildi,`, `Halk der: "Kut onda, töre onda."`] }),
  ],
};

export function compose(k: SongKind, c: SongCtx, d: number): Song {
  const pool = SONGS[k];
  const t = pool[Math.floor(Math.random() * pool.length)](c);
  return { d, k, ...t };
}

/** Okutulan destanların verdiği şöhret */
export function singRenown(n: number): number {
  return Math.min(25, 3 + n * 2);
}

// ---------- tamga ----------

export interface Tamga {
  shape: string;
  mark: string;
  color: string;
}

export const TAMGA_SHAPES: Record<string, { name: string; d: string }> = {
  catal: { name: "Çatal", d: "M50 88 L50 46 M24 16 L24 40 Q50 62 76 40 L76 16" },
  ok: { name: "Ok", d: "M50 88 L50 16 M30 36 L50 16 L70 36" },
  yay: { name: "Yay", d: "M32 14 Q84 50 32 86 M32 14 L32 86" },
  ay: { name: "Ay", d: "M70 22 A32 32 0 1 0 70 78" },
  halka: { name: "Halka", d: "M50 20 A30 30 0 1 1 49.9 20" },
  kapi: { name: "Kapı", d: "M24 86 L24 20 L76 20 L76 86" },
  dag: { name: "Dağ", d: "M16 84 L50 18 L84 84" },
  kanat: { name: "Kanat", d: "M16 22 L50 78 L84 22 M34 22 L50 50 L66 22" },
};

export const TAMGA_MARKS: Record<string, { name: string; d: string }> = {
  yok: { name: "Yalın", d: "" },
  nokta: { name: "Nokta", d: "M50 4 L50 5" },
  alt: { name: "Taban", d: "M26 95 L74 95" },
  yan: { name: "Kanatçık", d: "M4 52 L16 52 M84 52 L96 52" },
  hac: { name: "Haç", d: "M50 0 L50 12 M44 6 L56 6" },
};

export const TAMGA_COLORS: Record<string, string> = {
  altin: "#e8c25a",
  kizil: "#d23a2a",
  gok: "#4a8ad8",
  ak: "#f4ecd8",
  yesil: "#4aa060",
  mor: "#9a5ad0",
};

export const TAMGA_DEFAULT: Tamga = { shape: "catal", mark: "yok", color: "altin" };

export function tamgaSvg(t: Tamga, size = 48): string {
  const s = TAMGA_SHAPES[t.shape] ?? TAMGA_SHAPES.catal;
  const m = TAMGA_MARKS[t.mark] ?? TAMGA_MARKS.yok;
  const c = TAMGA_COLORS[t.color] ?? TAMGA_COLORS.altin;
  return `<svg class="tamga" width="${size}" height="${size}" viewBox="-6 -6 112 112"><path d="${s.d} ${m.d}" fill="none" stroke="#1a0d04" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="${s.d} ${m.d}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function tamgaCanvas(t: Tamga, size = 64): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const x = cv.getContext("2d")!;
  x.scale(size / 112, size / 112);
  x.translate(6, 6);
  const p = new Path2D(`${(TAMGA_SHAPES[t.shape] ?? TAMGA_SHAPES.catal).d} ${(TAMGA_MARKS[t.mark] ?? TAMGA_MARKS.yok).d}`);
  x.lineCap = "round";
  x.lineJoin = "round";
  x.strokeStyle = "#1a0d04";
  x.lineWidth = 15;
  x.stroke(p);
  x.strokeStyle = TAMGA_COLORS[t.color] ?? TAMGA_COLORS.altin;
  x.lineWidth = 9;
  x.stroke(p);
  return cv;
}
