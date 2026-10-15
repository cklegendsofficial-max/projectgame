import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    watch: { ignored: ["**/release/**", "**/playtest/**", "**/dist/**", "**/next/**"] },
  },
  build: {
    outDir: "dist",
    assetsDir: "",
    assetsInlineLimit: 0,
    target: "es2020",
  },
});
