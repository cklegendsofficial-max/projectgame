import { audio } from "./audio";
import { lang } from "./i18n";
import { settings } from "./settings";

const synth: SpeechSynthesis | undefined = typeof window !== "undefined" ? window.speechSynthesis : undefined;
let voices: SpeechSynthesisVoice[] = [];
let current: SpeechSynthesisUtterance | null = null;

function loadVoices(): void {
  if (synth) voices = synth.getVoices();
}
loadVoices();
synth?.addEventListener?.("voiceschanged", loadVoices);

/** Dile uyan en iyi ses; yerel (offline) ve "Natural" sesler öne alınır. */
function voiceFor(l: string): SpeechSynthesisVoice | undefined {
  const list = voices.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(l));
  const score = (v: SpeechSynthesisVoice) => (/natural|neural|online/i.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0) + (/male|erkek|ahmet|tolga|guy|david/i.test(v.name) ? 1 : 0);
  return list.sort((a, b) => score(b) - score(a))[0];
}

export function canNarrate(): boolean {
  return !!synth && !!voiceFor(lang());
}

export function speaking(): boolean {
  return !!current;
}

function plain(html: string): string {
  const d = document.createElement("div");
  d.innerHTML = html.replace(/<br\s*\/?>/gi, ". ").replace(/<\/(p|div|li|h\d)>/gi, ". ");
  return (d.textContent ?? "")
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, "")
    .replace(/[+−-]?\d+\s*(TP|XP)\b/g, "")
    .replace(/\s*\.\s*(\.\s*)+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hush(): void {
  if (!synth) return;
  current = null;
  synth.cancel();
  audio.duck(false);
}

export function narrate(title: string, html: string): void {
  if (!synth) return;
  const l = lang();
  const v = voiceFor(l);
  if (!v) return;
  hush();
  const text = plain(`${title}. ${html}`).slice(0, 1400);
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = v;
  u.lang = v.lang;
  u.rate = l === "tr" ? 0.92 : 0.95;
  u.pitch = 0.82;
  u.volume = Math.min(1, 0.4 + settings.fx);
  const done = () => {
    if (current !== u) return;
    current = null;
    audio.duck(false);
  };
  u.onend = done;
  u.onerror = done;
  current = u;
  audio.duck(true);
  synth.speak(u);
}
