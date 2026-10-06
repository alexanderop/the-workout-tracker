import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: process.env.DESIGN_BASE_PATH ?? "/",
  plugins: [vue()],
  server: {
    strictPort: true,
    fs: {
      allow: [fileURLToPath(new URL("../../", import.meta.url))],
    },
    proxy: {
      "/product-preview": {
        target: "http://127.0.0.1:4187",
        ws: true,
      },
    },
  },
});
