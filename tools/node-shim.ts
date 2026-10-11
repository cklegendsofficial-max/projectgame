// Tarayıcı modüllerini (state/platform) Node'da yükleyebilmek için asgari ortam.
const g = globalThis as unknown as Record<string, unknown>;
const mem = new Map<string, string>();
g.window ??= g;
g.localStorage ??= {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() {
    return mem.size;
  },
};
g.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
g.addEventListener ??= () => {};
g.document ??= { addEventListener() {}, documentElement: { style: { setProperty() {} } }, body: { classList: { toggle() {} } } };
