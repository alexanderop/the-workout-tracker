import { hasCatalog, registerCatalog } from "./index";
import type { Catalog, Locale } from "./index";

type Fetcher = (url: string) => Promise<Pick<Response, "ok" | "json">>;

// The files come from this build, so only their overall shape is checked:
// a tree of strings. A missing message shows its key instead of failing.
function isMessages(value: unknown): boolean {
  if (typeof value === "string") return true;
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  return Object.values(value).every(isMessages);
}
function isCatalog(value: unknown): value is Catalog {
  return typeof value === "object" && isMessages(value);
}

/**
 * Loads a locale's JSON catalog once and registers it. Resolves false, never
 * throws, when the file is missing, offline, or not a catalog; the caller
 * keeps the language it already shows.
 */
export function createCatalogLoader(
  urls: Readonly<Record<Locale, string>>,
  fetcher: Fetcher,
) {
  const pending = new Map<Locale, Promise<boolean>>();
  async function fetchCatalog(locale: Locale): Promise<boolean> {
    try {
      const response = await fetcher(urls[locale]);
      if (!response.ok) return false;
      const catalog: unknown = await response.json();
      if (!isCatalog(catalog)) return false;
      registerCatalog(locale, catalog);
      return true;
    } catch {
      return false;
    }
  }
  return function loadCatalog(locale: Locale): Promise<boolean> {
    if (hasCatalog(locale)) return Promise.resolve(true);
    const running = pending.get(locale);
    if (running) return running;
    const started = fetchCatalog(locale).finally(() => pending.delete(locale));
    pending.set(locale, started);
    return started;
  };
}
