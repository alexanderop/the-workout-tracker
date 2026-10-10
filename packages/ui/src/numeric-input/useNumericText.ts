import { computed } from "vue";
import { useUiText } from "../ui-text";
import { createNumericHint, pasteHint } from "./editing";
import type { NumericLimits } from "./editing";

/** The numeric editor's phrases and the hint built from them, in the app's language. */
export function useNumericText() {
  const uiText = useUiText();
  const text = computed(() => uiText.value.numeric);
  const hint = computed(() => createNumericHint(text.value));
  return {
    text,
    hint,
    pasteHint: (limits: NumericLimits) => pasteHint(limits, text.value),
  };
}
