import type { Translate } from "../../../i18n";
import { duration } from "./presentation";

/** The rest timer line: remaining time, or that the rest is over. */
export function restLabel(remaining: number, t: Translate): string {
  return remaining > 0
    ? t("training.rest.remaining", { time: duration(remaining) })
    : t("training.rest.complete");
}

/** The upcoming set, or that every set is logged. */
export function nextSetLabel(
  next:
    | {
        exercise: { name: string; sets: readonly unknown[] };
        index: number;
      }
    | undefined,
  t: Translate,
): string {
  if (!next) return t("training.rest.allSetsLogged");
  return t("training.rest.nextSet", {
    exercise: next.exercise.name,
    set: next.index + 1,
    total: next.exercise.sets.length,
  });
}
