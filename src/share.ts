import mapUrl from "./assets/map.webp";
import { RELICS, heroPower } from "./army";
import { fmt } from "./format";
import { t } from "./i18n";
import type { GameState } from "./state";
import { heroUrl, iconUrl, showModal } from "./ui";
import { arenaRank } from "./warfare";

const SIZE = 1080;

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(img);
    img.src = src;
  });
}

function cover(g: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number): void {
  if (!img.naturalWidth) return;
  const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * k;
  const ih = img.naturalHeight * k;
  g.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
}

export async function renderShareCard(s: GameState): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const g = c.getContext("2d")!;
  const [map, face, ...relicImgs] = await Promise.all([load(mapUrl), load(heroUrl(s.hero?.look ?? 0)), ...RELICS.map((r) => load(iconUrl(r.icon)))]);

  cover(g, map, SIZE, SIZE);
  const shade = g.createLinearGradient(0, 0, 0, SIZE);
  shade.addColorStop(0, "rgba(20,10,4,0.55)");
  shade.addColorStop(0.45, "rgba(20,10,4,0.72)");
  shade.addColorStop(1, "rgba(20,10,4,0.92)");
  g.fillStyle = shade;
  g.fillRect(0, 0, SIZE, SIZE);

  g.strokeStyle = "#d9a441";
  g.lineWidth = 14;
  g.strokeRect(24, 24, SIZE - 48, SIZE - 48);
  g.strokeStyle = "rgba(255,224,138,0.5)";
  g.lineWidth = 3;
  g.strokeRect(46, 46, SIZE - 92, SIZE - 92);

  g.textAlign = "center";
  g.fillStyle = "#ffe08a";
  g.font = "bold 46px Georgia, serif";
  g.fillText(t("title").toUpperCase(), SIZE / 2, 118);
  g.fillStyle = "#f3e6c8";
  g.font = "italic 28px Georgia, serif";
  g.fillText(t("shareTagline"), SIZE / 2, 160);

  const cx = SIZE / 2;
  const cy = 330;
  const r = 130;
  g.save();
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.closePath();
  g.fillStyle = "#3a2412";
  g.fill();
  g.clip();
  if (face.naturalWidth) g.drawImage(face, cx - r, cy - r, r * 2, r * 2);
  g.restore();
  g.beginPath();
  g.arc(cx, cy, r + 6, 0, Math.PI * 2);
  g.strokeStyle = "#d9a441";
  g.lineWidth = 10;
  g.stroke();

  g.fillStyle = "#fff4d6";
  g.font = "bold 58px Georgia, serif";
  g.fillText(s.hero?.name ?? s.ruler.name, cx, 530);
  g.fillStyle = "#ffcf6a";
  g.font = "30px Georgia, serif";
  const house = s.house ? `${t("houseOf", { name: s.house.name })} · ` : "";
  g.fillText(`${house}${t("heroLevel", { n: s.hero?.level ?? 1 })} · ${t("genN", { n: s.ruler.gen })}`, cx, 576);

  const rank = arenaRank(s, Date.now());
  const stats: [string, string][] = [
    [t("shareRating"), `${s.arena.rating} (#${rank})`],
    [t("sharePower"), fmt(heroPower(s))],
    [t("shareNemesis"), `${s.stats.nemesisSlain}`],
    [t("shareForts"), `${s.fortsTaken.length}/4`],
    [t("shareTitans"), `${s.stats.titans}`],
    [t("shareEarned"), fmt(s.lifetimeEarned)],
  ];
  const colW = (SIZE - 160) / 3;
  stats.forEach(([label, val], k) => {
    const x = 80 + colW * (k % 3) + colW / 2;
    const y = 660 + Math.floor(k / 3) * 120;
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.fillRect(x - colW / 2 + 10, y - 50, colW - 20, 100);
    g.fillStyle = "#ffe08a";
    g.font = "bold 40px Georgia, serif";
    g.fillText(val, x, y + 4);
    g.fillStyle = "#d8c6a0";
    g.font = "22px Georgia, serif";
    g.fillText(label, x, y + 36);
  });

  const rs = 70;
  const gap = 14;
  const total = RELICS.length * rs + (RELICS.length - 1) * gap;
  RELICS.forEach((rel, k) => {
    const x = (SIZE - total) / 2 + k * (rs + gap);
    const y = 905;
    const owned = s.relics.includes(rel.id);
    g.globalAlpha = owned ? 1 : 0.22;
    g.filter = owned ? "none" : "grayscale(1) brightness(0.4)";
    const img = relicImgs[k];
    if (img.naturalWidth) g.drawImage(img, x, y, rs, rs);
    g.filter = "none";
    g.globalAlpha = 1;
  });
  g.fillStyle = "#d8c6a0";
  g.font = "22px Georgia, serif";
  g.fillText(`${t("relicsTitle")} ${s.relics.length}/${RELICS.length}`, cx, 1010);
  return c;
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    const next = line ? `${line} ${w}` : w;
    if (g.measureText(next).width > maxW && line) {
      out.push(line);
      line = w;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

export async function renderSagaCard(s: GameState, verses: string[]): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const g = c.getContext("2d")!;
  const [map, book] = await Promise.all([load(mapUrl), load(iconUrl("destan"))]);
  cover(g, map, SIZE, SIZE);
  g.fillStyle = "rgba(244,228,190,0.9)";
  g.fillRect(0, 0, SIZE, SIZE);
  g.strokeStyle = "#6b3f17";
  g.lineWidth = 14;
  g.strokeRect(24, 24, SIZE - 48, SIZE - 48);
  g.strokeStyle = "rgba(107,63,23,0.5)";
  g.lineWidth = 3;
  g.strokeRect(46, 46, SIZE - 92, SIZE - 92);
  if (book.naturalWidth) g.drawImage(book, SIZE / 2 - 70, 70, 140, 140);
  g.textAlign = "center";
  g.fillStyle = "#5a2d0c";
  g.font = "bold 50px Georgia, serif";
  g.fillText(t("sagaCardTitle", { name: s.hero?.name ?? s.ruler.name }), SIZE / 2, 262);
  g.font = "italic 26px Georgia, serif";
  g.fillStyle = "#7a4a22";
  g.fillText(`${s.house ? t("houseOf", { name: s.house.name }) + " · " : ""}${t("genN", { n: s.ruler.gen })}`, SIZE / 2, 302);
  g.font = "28px Georgia, serif";
  g.fillStyle = "#3b220e";
  let y = 370;
  for (const v of verses) {
    const lines = wrap(g, `“${v}”`, SIZE - 220);
    if (y + lines.length * 38 > SIZE - 110) break;
    for (const l of lines) {
      g.fillText(l, SIZE / 2, y);
      y += 38;
    }
    g.fillStyle = "#a0703a";
    g.fillText("✦", SIZE / 2, y + 6);
    g.fillStyle = "#3b220e";
    y += 52;
  }
  g.font = "italic 24px Georgia, serif";
  g.fillStyle = "#7a4a22";
  g.fillText(`— ${t("bardName")} · ${t("title")}`, SIZE / 2, SIZE - 76);
  return c;
}

export async function openShareCard(s: GameState): Promise<void> {
  presentCard(s, await renderShareCard(s), `kervan-${(s.hero?.name ?? "hero").replace(/[^\w-]/g, "")}.png`, t("shareTitle"));
}

export async function openSagaCard(s: GameState, verses: string[]): Promise<void> {
  presentCard(s, await renderSagaCard(s, verses), "kervan-destan.png", t("sagaTitle"));
}

function presentCard(s: GameState, c: HTMLCanvasElement, file: string, title: string): void {
  const url = c.toDataURL("image/png");
  const canShare = typeof navigator.share === "function" && typeof navigator.canShare === "function";
  showModal(
    title,
    `<img class="sharePrev" src="${url}" alt=""><p class="muted small">${t("shareHint")}</p>`,
    [
      {
        label: t("shareDownload"),
        cls: canShare ? "secondary" : "primary",
        keepOpen: true,
        onClick: () => {
          const a = document.createElement("a");
          a.href = url;
          a.download = file;
          a.click();
        },
      },
      ...(canShare
        ? [
            {
              label: t("shareSend"),
              cls: "primary",
              keepOpen: true,
              onClick: () => {
                c.toBlob((b) => {
                  if (!b) return;
                  const f = new File([b], file, { type: "image/png" });
                  const data = { files: [f], title: t("title"), text: t("shareText", { name: s.hero?.name ?? "" }) };
                  if (navigator.canShare(data)) void navigator.share(data).catch(() => undefined);
                });
              },
            },
          ]
        : []),
      { label: t("close"), cls: "secondary" },
    ],
  );
}
