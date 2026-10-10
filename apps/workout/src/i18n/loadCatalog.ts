import catalogUrls from "virtual:i18n-catalogs";
import { createCatalogLoader } from "./catalogLoader";
import type { Locale } from "./index";

/** The browser entry to the catalog files the build emitted. */
export const loadCatalog = createCatalogLoader(catalogUrls, (url) => fetch(url));

/**
 * The locale to start in: the wanted one, else English, else null when no
 * catalog could be read (offline before the first complete load).
 */
export async function startupLocale(wanted: Locale): Promise<Locale | null> {
  if (await loadCatalog(wanted)) return wanted;
  return (await loadCatalog("en")) ? "en" : null;
}
