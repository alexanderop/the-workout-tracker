import { z } from "zod";
import { readStorage } from "@form/composables";
import { matchLocale, supportedLocales, type Locale } from "../i18n";

/** `system` follows the browser; the others name a catalog in src/i18n. */
export const languages = ["system", ...supportedLocales] as const;
export type Language = (typeof languages)[number];
export const languageSchema = z.enum(languages);
export const languageStorageKey = "workout-language";

/** Languages are named in their own language so a reader can always find theirs. */
export const endonyms: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

/** The catalog a language choice selects. `system` follows the browser list. */
export function resolveLocale(
  language: Language,
  browserLanguages: readonly string[],
): Locale {
  return language === "system" ? matchLocale(browserLanguages) : language;
}

/**
 * The locale to start with, read before the app mounts so the first paint is
 * already in the right language. Missing or unreadable choices follow the browser.
 */
export function initialLocale(): Locale {
  const stored = readStorage(
    () => window.localStorage,
    languageStorageKey,
    languageSchema,
  );
  const language = stored.isOk() ? (stored.value ?? "system") : "system";
  return resolveLocale(language, navigator.languages);
}
