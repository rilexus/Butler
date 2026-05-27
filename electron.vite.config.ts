import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, "src/main/index.ts") },
        output: {
          format: "es",
          entryFileNames: "[name].mjs",
          chunkFileNames: "[name]-[hash].mjs",
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, "src/preload/index.ts") },
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
          chunkFileNames: "[name]-[hash].js",
        },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, "src/renderer"),
    resolve: {
      alias: {
        "@ui": resolve(__dirname, "src/renderer/src/ui"),
        "@components": resolve(__dirname, "src/renderer/src/components"),
        "@hooks": resolve(__dirname, "src/renderer/src/hooks"),
        "@store": resolve(__dirname, "src/renderer/src/store"),
        "@pages": resolve(__dirname, "src/renderer/src/pages"),
        "@utils": resolve(__dirname, "src/renderer/src/utils"),
      },
    },
    server: {
      port: 5173,
    },
    build: {
      outDir: resolve(__dirname, "out/renderer"),
      emptyOutDir: true,
    },
  },
});
