import {
  sessionTotals,
  type CompletedSession,
  type SessionExercise,
} from "../domain";
import type { Format, Translate } from "../../../i18n";
// Numbers, dates and durations are formatted with the active locale: see
// useFormat().
/**
 * Clock-style minutes and seconds for live timers only (the session clock and
 * the rest countdown); the same in every language. A finished or elapsed
 * workout duration is `format.duration`, never this.
 */
export const clockTime = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, "0")}`;
export const isExerciseComplete = (exercise: SessionExercise) =>
  exercise.sets.every((set) => set.completed);
/** How long a completed workout took, in milliseconds. */
export const sessionDurationMs = (session: CompletedSession) =>
  session.finishedAt - session.startedAt;

/**
 * The inline summary of a completed workout, "24 min · 3 sets · 800 kg". Home,
 * History and the calendar list all show it, so they cannot drift apart.
 */
export function sessionMetaLine(
  session: CompletedSession,
  t: Translate,
  format: Format,
): string {
  const totals = sessionTotals(session);
  return t("workouts.metrics.line", {
    duration: format.duration(sessionDurationMs(session)),
    sets: t("workouts.metrics.sets", totals.completedSets),
    volume: `${format.number(totals.volumeKg)} ${t("workouts.metrics.kilograms")}`,
  });
}

export function download(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function trainingTotals(history: readonly CompletedSession[]) {
  return history.reduce(
    (sum, session) => {
      const totals = sessionTotals(session);
      return {
        workouts: sum.workouts + 1,
        sets: sum.sets + totals.completedSets,
        volume: sum.volume + totals.volumeKg,
      };
    },
    { workouts: 0, sets: 0, volume: 0 },
  );
}
