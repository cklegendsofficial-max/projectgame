import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: { outDir: "dist", assetsDir: "", assetsInlineLimit: 0, target: "es2022" },
  server: { watch: { ignored: ["**/dist/**", "**/playtest/**"] } },
});
