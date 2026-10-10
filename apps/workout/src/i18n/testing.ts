import { de } from "./de";
import { en } from "./en";
import { createAppI18n, registerCatalog, strictTranslator } from "./index";
export { createAppI18n };
import type { Locale } from "./index";

// Tests read the TypeScript catalogs directly instead of the built JSON files.
registerCatalog("en", en);
registerCatalog("de", de);

// Tests look text up by key, so a copy change never breaks a selector.
export const translator = (locale: Locale) =>
  strictTranslator(createAppI18n(locale).global.locale);

export const { t } = translator("en");
