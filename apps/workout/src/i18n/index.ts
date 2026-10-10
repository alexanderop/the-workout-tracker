import { computed, inject, ref } from "vue";
import type { App, InjectionKey, Ref } from "vue";
import type { en } from "./en";
import { createFormat } from "./format";

/**
 * A small typed message catalog in place of vue-i18n: the library alone would
 * spend the whole JavaScript budget (performance-budgets.json), and the app
 * needs only named values and plural forms. Messages use the same syntax:
 * `{name}` placeholders and `one | other` plural forms.
 *
 * The catalogs are data, not code: the build ships them as JSON files and
 * `loadCatalog` registers them (see catalogs.config.ts). English is the type
 * source here, never a runtime import.
 */
const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];
export { locales as supportedLocales };

// German and any later catalog must match en.ts key for key.
type Widen<T> = T extends string
  ? string
  : { readonly [K in keyof T]: Widen<T[K]> };
export type Catalog = Widen<typeof en>;

// Dotted paths to every string in the catalog.
type Paths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];
type MessageKey = Paths<typeof en>;

// The arguments a message needs, read from its English text: `{name}`
// placeholders become named values, and `a | b` plural forms need a count.
type At<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? At<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;
type Placeholders<S> = S extends `${string}{${infer Name}}${infer Rest}`
  ? Name | Placeholders<Rest>
  : never;
type Named<Names extends string> = Record<Names, string | number>;
type ArgsFor<S> = S extends `${string} | ${string}`
  ? [Exclude<Placeholders<S>, "n">] extends [never]
    ? [count: number]
    : [values: Named<Exclude<Placeholders<S>, "n">>, count: number]
  : [Placeholders<S>] extends [never]
    ? []
    : [values: Named<Placeholders<S>>];
type Args<K> = K extends MessageKey ? ArgsFor<At<typeof en, K>> : never;
export type Translate = <K extends MessageKey>(
  key: K,
  ...args: Args<K>
) => string;

type Values = Readonly<Record<string, string | number>>;
const catalogs: Partial<Record<Locale, Catalog>> = {};

/** Makes a locale's messages available to every translator. */
export function registerCatalog(locale: Locale, catalog: Catalog) {
  catalogs[locale] = catalog;
}

/** Drops every registered catalog; tests start each case from nothing. */
export function clearCatalogs() {
  for (const locale of locales) delete catalogs[locale];
}

export function hasCatalog(locale: Locale) {
  return catalogs[locale] !== undefined;
}

function find(catalog: unknown, key: string): string | undefined {
  let node = catalog;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = Reflect.get(node, part);
  }
  return typeof node === "string" ? node : undefined;
}

/** Two forms read `one | other`; three read `none | one | other`. */
function pluralForm(message: string, count: number): string {
  const forms = message.split(" | ");
  if (forms.length === 1) return message;
  if (forms.length === 2) return forms[count === 1 ? 0 : 1] ?? message;
  return forms[Math.min(count, 2)] ?? message;
}

function fill(message: string, values: Values): string {
  return message.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    return value === undefined ? placeholder : String(value);
  });
}

export function createAppI18n(initial: Locale = "en") {
  const locale = ref<Locale>(initial);
  return {
    global: { locale },
    install(app: App) {
      app.provide(i18nKey, locale);
    },
  };
}

const i18nKey: InjectionKey<Ref<Locale>> = Symbol("AppI18n");

// A message missing from a locale falls back to English, then to its key.
export function strictTranslator(locale: Readonly<Ref<Locale>>) {
  const translate: Translate = (key: string, ...args: readonly unknown[]) => {
    const [first, second] = args;
    const count = typeof first === "number" ? first : second;
    const values: Values =
      typeof first === "object" && first !== null
        ? Object.fromEntries(Object.entries(first))
        : {};
    const message =
      find(catalogs[locale.value], key) ?? find(catalogs.en, key) ?? key;
    if (typeof count !== "number") return fill(message, values);
    return fill(pluralForm(message, count), { n: count, count, ...values });
  };
  return { t: translate };
}

function useLocale(): Ref<Locale> {
  const locale = inject(i18nKey);
  if (!locale) throw new Error("Translations require the application shell.");
  return locale;
}

// Read-only locale: only useLocaleSetter may change the app language.
export function useTranslation() {
  const locale = useLocale();
  return { ...strictTranslator(locale), locale: computed(() => locale.value) };
}

// Numbers and dates in the active language. Feature UI formats; domain and
// application stay free of Intl.
export function useFormat() {
  const { locale } = useTranslation();
  return computed(() => createFormat(locale.value));
}

export function useLocaleSetter() {
  const locale = useLocale();
  return (next: Locale) => {
    locale.value = next;
  };
}

// The first supported language in the browser's preference list, else English.
export function matchLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0];
    const match = locales.find((locale) => locale === base);
    if (match) return match;
  }
  return "en";
}
