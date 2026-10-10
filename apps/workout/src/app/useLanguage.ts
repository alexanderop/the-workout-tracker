import { computed, inject, provide, ref, watch } from "vue";
import type { InjectionKey, Ref } from "vue";
import { useEventListener, useLocalStorage } from "@form/composables";
import type { StorageWriteError } from "@form/composables";
import type { Result } from "@form/result";
import { useLocaleSetter } from "../i18n";
import { loadCatalog } from "../i18n/loadCatalog";
import {
  languageSchema,
  languageStorageKey,
  resolveLocale,
  type Language,
} from "./language";

export type LanguageController = {
  readonly language: Readonly<Ref<Language>>;
  readonly setLanguage: (next: Language) => Result<void, StorageWriteError>;
  /** True while the chosen language's catalog could not be loaded. */
  readonly loadFailed: Readonly<Ref<boolean>>;
};

const languageKey: InjectionKey<LanguageController> = Symbol("Language");

/**
 * Owns the language choice: persists it, follows the browser while the choice
 * is `system`, loads the catalog before switching, and keeps <html lang> in
 * step. Call it once, in the app shell.
 */
export function useLanguage(): LanguageController {
  const { state: language, set: setLanguage } = useLocalStorage(
    languageStorageKey,
    languageSchema,
    { fallback: "system" },
  );
  const browserLanguages = ref(navigator.languages);
  useEventListener(window, "languagechange", () => {
    browserLanguages.value = navigator.languages;
  });
  const setLocale = useLocaleSetter();
  const locale = computed(() =>
    resolveLocale(language.value, browserLanguages.value),
  );
  const loadFailed = ref(false);
  watch(
    locale,
    async (next) => {
      const loaded = await loadCatalog(next);
      // A newer choice may have arrived while this catalog was loading.
      if (next !== locale.value) return;
      loadFailed.value = !loaded;
      if (!loaded) return;
      setLocale(next);
      document.documentElement.lang = next;
    },
    { immediate: true },
  );
  const controller = { language, setLanguage, loadFailed };
  provide(languageKey, controller);
  return controller;
}

export function useLanguageSetting(): LanguageController {
  const controller = inject(languageKey);
  if (!controller)
    throw new Error("Language settings require the application shell.");
  return controller;
}
