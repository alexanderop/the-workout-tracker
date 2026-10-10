import { defaultUiText } from "../ui-text";
import type { NumericText } from "../ui-text";

/**
 * Calculator-style editing adapted from our workoutTracker numeric keypad.
 *
 * Values are non-negative: the keypad has no minus key and `validNumber`
 * rejects a sign, so `min` must be 0 or greater.
 */
export type NumericLimits = Readonly<{
  /** Smallest accepted value; non-negative. */
  min: number;
  max: number;
  decimals: number;
  presetStep: number;
}>;
export type NumericDraft = Readonly<{ text: string; fresh: boolean }>;

export function beginEditing(value: string | number): NumericDraft {
  return { text: String(value).replace(",", "."), fresh: true };
}

/** Shows a value with the locale's decimal mark; drafts and stored values keep ".". */
export function localizeNumber(
  value: string | number,
  separator: string,
): string {
  return String(value).replace(".", separator);
}

export function editNumber(
  draft: NumericDraft,
  key: string,
  limits: NumericLimits,
): NumericDraft {
  if (["Backspace", "Delete"].includes(key))
    return { text: draft.text.slice(0, -1), fresh: false };
  if (key === "." || key === ",") return appendDecimal(draft, limits);
  if (!/^\d$/.test(key)) return draft;
  const text = draft.fresh || draft.text === "0" ? key : draft.text + key;
  if (text.length > 64 || Number(text) > limits.max) return draft;
  if (exceedsPrecision(text, limits.decimals)) return draft;
  return { text, fresh: false };
}

/** Whether `text` has more fraction digits, or a point, than `decimals` allows. */
export function exceedsPrecision(text: string, decimals: number): boolean {
  const fraction = text.split(".")[1];
  if (fraction === undefined) return false;
  return decimals === 0 || fraction.length > decimals;
}

function appendDecimal(
  draft: NumericDraft,
  limits: NumericLimits,
): NumericDraft {
  if (!limits.decimals) return draft;
  if (draft.fresh || !draft.text) return { text: "0.", fresh: false };
  return draft.text.includes(".")
    ? draft
    : { text: `${draft.text}.`, fresh: false };
}

export function validNumber(
  text: string,
  limits: NumericLimits,
): number | null {
  if (!/^\d+(\.\d*)?$/.test(text)) return null;
  const value = Number(text);
  if (!Number.isFinite(value) || value < limits.min || value > limits.max)
    return null;
  if (exceedsPrecision(text, limits.decimals)) return null;
  return value;
}

/** Explains why a draft cannot be confirmed, or invites a replacement. */
export function createNumericHint(text: NumericText) {
  return (draft: NumericDraft, limits: NumericLimits, unit: string): string => {
    const range = { ...limits, unit };
    if (validNumber(draft.text, limits) !== null)
      return draft.fresh ? text.replace : text.ready;
    if (!limits.decimals) return text.wholeNumber(range);
    if (exceedsPrecision(draft.text, limits.decimals))
      return text.fewerDecimals(range);
    return text.value(range);
  };
}

export const numericHint = createNumericHint(defaultUiText.numeric);

export function pasteHint(
  limits: NumericLimits,
  text: NumericText = defaultUiText.numeric,
): string {
  const range = { ...limits, unit: "" };
  return limits.decimals ? text.pasteDecimal(range) : text.pasteWhole(range);
}

const maxStepDecimals = 10;

/** Decimal places needed to write `step` exactly, up to a fixed cap. */
function decimalPlaces(step: number): number {
  let places = 0;
  while (
    places < maxStepDecimals &&
    Math.abs(Math.round(step * 10 ** places) - step * 10 ** places) > 1e-9
  )
    places += 1;
  return places;
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

/**
 * Up to eight quick picks around `value`. Every preset is a multiple of
 * `presetStep` and representable with `decimals`: when the step is finer than
 * the precision allows (2.5 with whole numbers), the grid widens to the
 * smallest common multiple (5), so presets never round off the grid or repeat.
 */
export function numericPresets(
  value: string | number,
  limits: NumericLimits,
): number[] {
  if (!Number.isFinite(limits.presetStep) || limits.presetStep <= 0) return [];
  const scale = Math.max(decimalPlaces(limits.presetStep), limits.decimals);
  const step = Math.round(limits.presetStep * 10 ** scale);
  const unit = 10 ** (scale - limits.decimals);
  const grid = (step / greatestCommonDivisor(step, unit)) * unit;
  const at = (index: number) => (index * grid) / 10 ** scale;
  const parsed =
    validNumber(String(value).replace(",", "."), limits) ?? limits.min;
  const lowest = Math.ceil((limits.min * 10 ** scale) / grid - 1e-9);
  const highest = Math.floor((limits.max * 10 ** scale) / grid + 1e-9);
  const center = Math.round((parsed * 10 ** scale) / grid);
  const first = Math.max(lowest, Math.min(center - 3, highest - 7));
  const last = Math.min(highest, first + 7);
  const presets = Array.from(
    { length: Math.max(0, last - first + 1) },
    (_, i) => at(first + i),
  ).filter((preset) => validNumber(String(preset), limits) !== null);
  return [...new Set(presets)];
}

export function replaceNumber(
  text: string,
  limits: NumericLimits,
): NumericDraft | null {
  const normalized = text.trim().replace(",", ".");
  if (normalized.length > 64 || validNumber(normalized, limits) === null)
    return null;
  return { text: normalized, fresh: false };
}
