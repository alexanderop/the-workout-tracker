import { resolve } from "node:path";
import { createServer, type Plugin } from "vite";

/**
 * Ships the message catalogs as JSON files instead of JavaScript. The catalogs
 * are about 19 kB of gzipped text, and the JavaScript budget
 * (performance-budgets.json) sums every script the build emits, so a lazily
 * loaded script would not help. The TypeScript catalogs under src/i18n stay the
 * single typed source: this plugin evaluates them at build time and emits one
 * JSON asset per locale. `virtual:i18n-catalogs` exports their URLs.
 */
const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];
const moduleId = "virtual:i18n-catalogs";
const resolvedId = `\0${moduleId}`;

async function evaluate(root: string): Promise<Record<Locale, string>> {
  const server = await createServer({
    configFile: false,
    root,
    logLevel: "silent",
    appType: "custom",
    server: { middlewareMode: true, ws: false },
    optimizeDeps: { noDiscovery: true },
  });
  try {
    const entries = await Promise.all(
      locales.map(async (locale) => {
        const loaded: Record<string, unknown> = await server.ssrLoadModule(
          resolve(root, `src/i18n/${locale}.ts`),
        );
        const catalog = loaded[locale];
        if (catalog === undefined)
          throw new Error(`src/i18n/${locale}.ts must export ${locale}.`);
        return [locale, JSON.stringify(catalog)] as const;
      }),
    );
    return { en: "", de: "", ...Object.fromEntries(entries) };
  } finally {
    await server.close();
  }
}

export function catalogs(): Plugin {
  let root = process.cwd();
  let serving = false;
  let base = "/";
  let cache: Promise<Record<Locale, string>> | undefined;
  const read = () => {
    cache ??= evaluate(root);
    return cache;
  };
  return {
    name: "i18n-catalogs",
    configResolved(config) {
      root = config.root;
      serving = config.command === "serve";
      base = config.base;
    },
    resolveId: (id) => (id === moduleId ? resolvedId : undefined),
    async load(id) {
      if (id !== resolvedId) return undefined;
      const json = await read();
      if (serving) {
        // The dev server serves the same fetch path from data URLs.
        const urls = locales.map(
          (locale) =>
            `${locale}: "data:application/json;charset=utf-8,${encodeURIComponent(json[locale])}"`,
        );
        return `export default { ${urls.join(", ")} };`;
      }
      const urls = locales.map((locale) => {
        const reference = this.emitFile({
          type: "asset",
          name: `${locale}.json`,
          source: json[locale],
        });
        return `${locale}: import.meta.ROLLUP_FILE_URL_${reference}`;
      });
      return `export default { ${urls.join(", ")} };`;
    },
    configureServer(server) {
      const changed = (file: string) => {
        if (!file.includes("/src/i18n/")) return;
        cache = undefined;
        const module = server.moduleGraph.getModuleById(resolvedId);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("change", changed);
    },
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        if (!context.bundle) return html;
        // index.html preloads the file for the language it starts in.
        const files = Object.fromEntries(
          locales.map((locale) => [
            locale,
            Object.keys(context.bundle ?? {}).find((name) =>
              name.includes(`/${locale}-`) && name.endsWith(".json"),
            ),
          ]),
        );
        const script = `<script>window.__catalogBase=${JSON.stringify(base)};window.__catalogFiles=${JSON.stringify(files)};</script>`;
        return html.replace("</head>", `${script}</head>`);
      },
    },
  };
}
