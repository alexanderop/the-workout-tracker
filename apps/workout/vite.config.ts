import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg", "apple-touch-icon.png"],
      manifest: {
        id: base,
        name: "The Workout Tracker",
        short_name: "Workout Tracker",
        description:
          "Plan workouts, log sets, and track your progress offline.",
        theme_color: "#141414",
        background_color: "#141414",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
