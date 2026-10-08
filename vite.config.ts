import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    watch: { ignored: ["**/release/**", "**/playtest/**", "**/dist/**"] },
  },
  build: {
    outDir: "dist",
    assetsDir: "",
    assetsInlineLimit: 0,
    target: "es2020",
  },
});
