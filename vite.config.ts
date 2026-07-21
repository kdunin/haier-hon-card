import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/haier-hon-washing-machine-card.ts",
      formats: ["es"],
      fileName: () => "haier-hon-card.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    target: "es2021",
    minify: true,
    outDir: "dist",
    emptyOutDir: true,
  },
});
