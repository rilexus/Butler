import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.join(__dirname, "src/renderer"),
  plugins: [react()],
  resolve: {
    alias: {
      "@ui": path.join(__dirname, "src/renderer/src/ui"),
      "@components": path.join(__dirname, "src/renderer/src/components"),
      "@hooks": path.join(__dirname, "src/renderer/src/hooks"),
      "@store": path.join(__dirname, "src/renderer/src/store"),
      "@pages": path.join(__dirname, "src/renderer/src/pages"),
      "@utils": path.join(__dirname, "src/renderer/src/utils"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: path.join(__dirname, "dist/renderer"),
    emptyOutDir: true,
  },
});
