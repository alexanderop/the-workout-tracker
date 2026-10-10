import type { Translate } from "../../i18n";
import { endonyms, type Language } from "../language";
import type { Appearance } from "../appearance";

/** Languages are named in their own language so a reader can always find theirs. */
export const languageLabel = (language: Language, t: Translate) =>
  language === "system" ? t("shell.language.system") : endonyms[language];

export const appearanceSummary = (
  { theme, accent }: Appearance,
  t: Translate,
) =>
  t("settings.appearance.summary", {
    theme: t(`shell.appearance.themes.${theme}`),
    accent: t(`shell.appearance.accents.${accent}`),
  });
