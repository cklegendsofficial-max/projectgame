const VOWELS = "aeıioöuüAEIİOÖUÜ";

export function gen(name: string): string {
  const v = [...name.toLocaleLowerCase("tr")].reverse().find((c) => VOWELS.includes(c)) ?? "a";
  const suf = "aı".includes(v) ? "ın" : "ei".includes(v) ? "in" : "ou".includes(v) ? "un" : "ün";
  return `${name}'${VOWELS.includes(name[name.length - 1]) ? "n" : ""}${suf}`;
}
