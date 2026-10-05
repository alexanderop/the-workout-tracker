/** Calculator-style editing adapted from our workoutTracker numeric keypad. */
export type NumericLimits = Readonly<{
  min: number;
  max: number;
  decimals: number;
  presetStep: number;
}>;
export type NumericDraft = Readonly<{ text: string; fresh: boolean }>;

export function beginEditing(value: string | number): NumericDraft {
  return { text: String(value).replace(",", "."), fresh: true };
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

function exceedsPrecision(text: string, decimals: number): boolean {
  return (text.split(".")[1]?.length ?? 0) > decimals;
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

export function numericPresets(
  value: string | number,
  limits: NumericLimits,
): number[] {
  const parsed =
    validNumber(String(value).replace(",", "."), limits) ?? limits.min;
  const center = Math.round(parsed / limits.presetStep);
  const first = Math.max(Math.ceil(limits.min / limits.presetStep), center - 3);
  return Array.from({ length: 8 }, (_, index) =>
    Number(((first + index) * limits.presetStep).toFixed(limits.decimals)),
  ).filter((preset) => preset >= limits.min && preset <= limits.max);
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
