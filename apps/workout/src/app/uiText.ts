import { computed } from "vue";
import type { Ref } from "vue";
import { provideUiText } from "@form/ui";
import type { NumericRange, UiText } from "@form/ui";
import type { Locale, Translate } from "../i18n";

// The shared components bring no translations; the shell hands them these.
// Mid-sentence English words are lower case; German keeps its capitalised nouns.
const midSentence = (locale: Locale, word: string) =>
  locale === "en" ? word.toLowerCase() : word;

// Messages place the unit right after a number, so a missing unit adds nothing.
const spaced = (unit: string) => (unit ? ` ${unit}` : "");

function numericText(t: Translate, locale: Locale): UiText["numeric"] {
  // 1.1 in English, 1,1 in German: every number the editor speaks follows suit.
  const decimalSeparator = new Intl.NumberFormat(locale).format(1.1)[1] ?? ".";
  const num = (value: number) => String(value).replace(".", decimalSeparator);
  const range = ({ min, max, unit }: NumericRange) =>
    t("common.ui.numeric.range", {
      min: num(min),
      max: num(max),
      unit: spaced(unit),
    });
  return {
    cancel: t("common.ui.numeric.cancel"),
    suggestions: t("common.ui.numeric.suggestions"),
    quickPick: t("common.ui.numeric.quickPick"),
    tapToUse: t("common.ui.numeric.tapToUse"),
    editor: t("common.ui.numeric.editor"),
    keypad: t("common.ui.numeric.keypad"),
    decimalPoint: t("common.ui.numeric.decimalPoint"),
    decimalSeparator,
    backspace: t("common.ui.numeric.backspace"),
    confirm: (title) =>
      t("common.ui.numeric.confirm", { title: midSentence(locale, title) }),
    announce: ({ title, value, unit }) =>
      t("common.ui.numeric.announce", {
        title,
        value: num(value),
        unit: spaced(unit),
      }),
    trigger: ({ label, value, unit }) =>
      t("common.ui.numeric.trigger", {
        label,
        value: value === "" ? t("common.ui.numeric.empty") : value,
        unit: spaced(unit),
      }),
    usePreset: ({ value, unit }) =>
      t("common.ui.numeric.usePreset", {
        value: num(value),
        unit: spaced(unit),
      }),
    replace: t("common.ui.numeric.replace"),
    ready: t("common.ui.numeric.ready"),
    wholeNumber: (r) => t("common.ui.numeric.wholeNumber", { range: range(r) }),
    fewerDecimals: (r) =>
      t("common.ui.numeric.fewerDecimals", { range: range(r) }, r.decimals),
    value: (r) => t("common.ui.numeric.value", { range: range(r) }),
    pasteWhole: ({ min, max }) =>
      t("common.ui.numeric.pasteWhole", { min: num(min), max: num(max) }),
    pasteDecimal: ({ min, max, decimals }) =>
      t("common.ui.numeric.pasteDecimal", {
        min: num(min),
        max: num(max),
        decimals,
      }),
  };
}

function uiText(t: Translate, locale: Locale): UiText {
  return {
    close: t("common.ui.close"),
    closeDialog: t("common.ui.closeDialog"),
    sheetOptions: (title) => t("common.ui.sheetOptions", { title }),
    numeric: numericText(t, locale),
    install: {
      installed: t("common.ui.install.installed"),
      intro: t("common.ui.install.intro"),
      install: t("common.ui.install.install"),
      opening: t("common.ui.install.opening"),
      ios: [
        t("common.ui.install.ios.step1"),
        t("common.ui.install.ios.step2"),
        t("common.ui.install.ios.step3"),
      ],
      android: [
        t("common.ui.install.android.step1"),
        t("common.ui.install.android.step2"),
        t("common.ui.install.android.step3"),
      ],
      browser: [
        t("common.ui.install.browser.step1"),
        t("common.ui.install.browser.step2"),
      ],
      note: t("common.ui.install.note"),
    },
    muscleMap: {
      label: t("common.ui.muscleMap.label"),
      primary: t("common.ui.muscleMap.primary"),
      supporting: t("common.ui.muscleMap.supporting"),
      notHighlighted: t("common.ui.muscleMap.notHighlighted"),
      hint: t("common.ui.muscleMap.hint"),
      front: t("common.ui.muscleMap.front"),
      back: t("common.ui.muscleMap.back"),
      regions: {
        chest: t("common.ui.muscleMap.regions.chest"),
        shoulders: t("common.ui.muscleMap.regions.shoulders"),
        biceps: t("common.ui.muscleMap.regions.biceps"),
        triceps: t("common.ui.muscleMap.regions.triceps"),
        forearms: t("common.ui.muscleMap.regions.forearms"),
        abs: t("common.ui.muscleMap.regions.abs"),
        "upper-back": t("common.ui.muscleMap.regions.upperBack"),
        "lower-back": t("common.ui.muscleMap.regions.lowerBack"),
        glutes: t("common.ui.muscleMap.regions.glutes"),
        quads: t("common.ui.muscleMap.regions.quads"),
        hamstrings: t("common.ui.muscleMap.regions.hamstrings"),
        calves: t("common.ui.muscleMap.regions.calves"),
      },
    },
  };
}

/** Translates the shared components below the caller; call once in the shell. */
export function provideAppUiText(
  t: Translate,
  locale: Readonly<Ref<Locale>>,
): void {
  provideUiText(computed(() => uiText(t, locale.value)));
}
