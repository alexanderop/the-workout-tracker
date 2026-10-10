import { computed, inject, provide } from "vue";
import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { MuscleRegion } from "./muscle-map/regions";

/** The numbers a numeric-input hint talks about. */
export type NumericRange = Readonly<{
  min: number;
  max: number;
  decimals: number;
  unit: string;
}>;

export type NumericText = Readonly<{
  cancel: string;
  suggestions: string;
  quickPick: string;
  tapToUse: string;
  editor: string;
  keypad: string;
  decimalPoint: string;
  backspace: string;
  /** The button that confirms the draft, named after the field. */
  confirm: (title: string) => string;
  /** The status text announced once a value is confirmed. */
  announce: (value: { title: string; value: number; unit: string }) => string;
  /** The accessible name of the button that opens the editor. */
  trigger: (value: {
    label: string;
    value: string | number;
    unit: string;
  }) => string;
  usePreset: (value: { value: number; unit: string }) => string;
  replace: string;
  ready: string;
  wholeNumber: (range: NumericRange) => string;
  fewerDecimals: (range: NumericRange) => string;
  value: (range: NumericRange) => string;
  pasteWhole: (range: NumericRange) => string;
  pasteDecimal: (range: NumericRange) => string;
}>;

type InstallText = Readonly<{
  installed: string;
  intro: string;
  install: string;
  opening: string;
  ios: readonly string[];
  android: readonly string[];
  browser: readonly string[];
  note: string;
}>;

type MuscleMapText = Readonly<{
  label: string;
  primary: string;
  supporting: string;
  notHighlighted: string;
  hint: string;
  front: string;
  back: string;
  regions: Readonly<Record<MuscleRegion, string>>;
}>;

/**
 * Every fixed phrase the components show. English is the default; an app
 * translates it once with `provideUiText`, so the package needs no i18n code.
 */
export type UiText = Readonly<{
  close: string;
  closeDialog: string;
  sheetOptions: (title: string) => string;
  numeric: NumericText;
  install: InstallText;
  muscleMap: MuscleMapText;
}>;

const inUnit = (unit: string) => (unit ? ` ${unit}` : "");
const rangeText = ({ min, max, unit }: NumericRange) =>
  `from ${min} to ${max}${inUnit(unit)}`;

export const defaultUiText: UiText = {
  close: "Close",
  closeDialog: "Close dialog",
  sheetOptions: (title) => `${title} options`,
  numeric: {
    cancel: "Cancel",
    suggestions: "Suggested values",
    quickPick: "Quick pick",
    tapToUse: "Tap to use",
    editor: "Number editor",
    keypad: "Numeric keypad",
    decimalPoint: "Decimal point",
    backspace: "Backspace",
    confirm: (title) => `Use ${title.toLowerCase()}`,
    announce: ({ title, value, unit }) =>
      `${title} set to ${value}${inUnit(unit)}`,
    trigger: ({ label, value, unit }) =>
      `${label}: ${value === "" ? "empty" : value}${inUnit(unit)}`,
    usePreset: ({ value, unit }) => `Use ${value}${inUnit(unit)}`,
    replace: "Type a new value to replace this one.",
    ready: "Ready when you are.",
    wholeNumber: (range) => `Enter a whole number ${rangeText(range)}.`,
    fewerDecimals: (range) =>
      `Enter a value with up to ${range.decimals} decimal ${range.decimals === 1 ? "place" : "places"} ${rangeText(range)}.`,
    value: (range) => `Enter a value ${rangeText(range)}.`,
    pasteWhole: ({ min, max }) => `Paste a whole number from ${min} to ${max}.`,
    pasteDecimal: ({ min, max, decimals }) =>
      `Paste a number with up to ${decimals} decimal places from ${min} to ${max}.`,
  },
  install: {
    installed: "The app is installed on this device.",
    intro:
      "Keep your journal close. Open it from your home screen and train offline after the first complete load.",
    install: "Install app",
    opening: "Opening installer…",
    ios: [
      "Open this page in Safari.",
      "Open Share, then choose Add to Home Screen.",
      "Confirm with Add.",
    ],
    android: [
      "Open your browser menu.",
      "Choose Install app or Add to Home screen, if available.",
      "Follow the browser instructions.",
    ],
    browser: [
      "Look for Install in the address bar or browser menu.",
      "If it is unavailable, try a browser that supports app installation.",
    ],
    note: "Your data stays in this browser. Installation is not a backup.",
  },
  muscleMap: {
    label: "Muscle map",
    primary: "Primary",
    supporting: "Supporting",
    notHighlighted: "Not highlighted",
    hint: "Choose a muscle below to locate it on the map.",
    front: "Front",
    back: "Back",
    regions: {
      chest: "Chest",
      shoulders: "Shoulders",
      biceps: "Biceps",
      triceps: "Triceps",
      forearms: "Forearms",
      abs: "Core",
      "upper-back": "Upper back",
      "lower-back": "Lower back",
      glutes: "Glutes",
      quads: "Quads",
      hamstrings: "Hamstrings",
      calves: "Calves",
    },
  },
};

const uiTextKey: InjectionKey<Readonly<Ref<UiText>>> = Symbol("UiText");

/** Translates every component below the caller. Pass a ref so a language change applies at once. */
export function provideUiText(text: Readonly<Ref<UiText>>): void {
  provide(uiTextKey, text);
}

export function useUiText(): ComputedRef<UiText> {
  const injected = inject(uiTextKey, null);
  return computed(() => injected?.value ?? defaultUiText);
}
