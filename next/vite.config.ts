import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "",
    assetsInlineLimit: 0,
    target: "es2022",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/pixi.js") || id.includes("node_modules/@pixi")) return "pixi";
          if (id.includes("node_modules")) return "vendor";
          if (id.includes("/src/game/")) return "game";
          if (id.includes("/src/ui/")) return "ui";
        },
      },
    },
  },
  server: { watch: { ignored: ["**/dist/**", "**/playtest/**"] } },
});
