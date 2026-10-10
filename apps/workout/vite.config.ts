import { defineConfig, type Plugin } from "vite";
import { fileURLToPath } from "node:url";
import VueRouter from "vue-router/vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { catalogs } from "./catalogs.config";

const base = process.env.VITE_BASE_PATH ?? "/";
// Identifies the build in the error-recovery diagnostics and, as a meta tag,
// to the update journey. Release builds may set VITE_APP_VERSION.
const appVersion = process.env.VITE_APP_VERSION ?? "development";
function previewBase(command: string) {
  return command === "serve" ? "/product-preview/" : "./";
}

export default defineConfig(({ mode, command }) => {
  const preview = mode === "design-preview";
  return {
    base: preview ? previewBase(command) : base,
    define: { APP_VERSION: JSON.stringify(appVersion) },
    server: preview ? { strictPort: true, hmr: { port: 4187 } } : undefined,
    build: preview
      ? {
          outDir: "dist-preview",
          rolldownOptions: {
            input: fileURLToPath(new URL("./preview.html", import.meta.url)),
          },
        }
      : {
          assetsInlineLimit(filePath) {
            if (filePath.endsWith(".webp")) return false;
            return undefined;
          },
          rolldownOptions: {
            output: {
              // Code that several lazy routes and the entry use lives in one
              // shared chunk instead of a chain of small ones. Each chunk is
              // compressed on its own, so fewer chunks ship fewer bytes. Routes
              // such as Settings stay lazy.
              codeSplitting: { groups: [{ name: "shared", minShareCount: 2 }] },
            },
          },
        },
    plugins: [
      ...(preview
        ? [
            {
              name: "design-preview-entry",
              configureServer(server) {
                server.middlewares.use((request, response, next) => {
                  const url = new URL(request.url ?? "/", "http://localhost");
                  const entryPaths = [
                    "/",
                    "/index.html",
                    "/product-preview/",
                    "/product-preview/index.html",
                  ];
                  if (!entryPaths.includes(url.pathname)) {
                    next();
                    return;
                  }
                  response.writeHead(302, {
                    Location: `/product-preview/preview.html${url.search}`,
                  });
                  response.end();
                });
              },
            } satisfies Plugin,
          ]
        : []),
      VueRouter({
        routesFolder: "src/pages",
        dts: "src/route-map.d.ts",
        experimental: { paramParsers: { dir: "src/app/route-params" } },
      }),
      vue(),
      tailwindcss(),
      catalogs(),
      {
        name: "build-version-meta",
        transformIndexHtml: () => [
          {
            tag: "meta",
            attrs: { name: "build-version", content: appVersion },
            injectTo: "head",
          },
        ],
      } satisfies Plugin,
      ...(!preview
        ? [
            VitePWA({
              registerType: "prompt",
              includeAssets: ["icon.svg", "apple-touch-icon.png"],
              manifest: {
                id: base,
                name: "The Workout Tracker",
                short_name: "Workout Tracker",
                description:
                  "Plan workouts, log sets, and track your progress offline.",
                theme_color: "#f2f1ec",
                background_color: "#f2f1ec",
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
                skipWaiting: false,
                globPatterns: [
                  "**/*.{js,css,html,ico,png,webp,svg,woff2,json}",
                ],
                navigateFallback: `${base}index.html`,
                cleanupOutdatedCaches: true,
              },
            }),
          ]
        : []),
    ],
  };
});
