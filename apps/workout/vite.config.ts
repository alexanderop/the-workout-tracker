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

// The route chunk is a dynamic import, so the browser finds it only after the
// entry has run. index.html starts that download from the address hash
// instead; this lists the chunk URLs by route name for it.
function routeChunkFiles(): Plugin {
  let publicBase = "/";
  return {
    name: "route-chunk-files",
    configResolved(config) {
      publicBase = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        if (!context.bundle) return html;
        const files = Object.fromEntries(
          Object.keys(context.bundle).flatMap((name) => {
            const route = /\/(\w+)Route-[^/]+\.js$/.exec(name)?.[1];
            return route ? [[route.toLowerCase(), publicBase + name]] : [];
          }),
        );
        const script = `<script>window.__routeFiles=${JSON.stringify(files)};</script>`;
        return html.replace("</head>", `${script}</head>`);
      },
    },
  };
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
          // The startup file is deliberately one large chunk (see below).
          chunkSizeWarningLimit: 600,
          rolldownOptions: {
            output: {
              codeSplitting: {
                // Everything the entry needs to start goes into one file.
                // Automatic splitting spread it over seven small files that
                // were all requested at once, which cost more round trips on
                // a slow connection and compressed worse than one file.
                groups: [{ name: "app", tags: ["$initial"] }],
              },
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
      routeChunkFiles(),
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
