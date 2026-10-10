import {
  sessionTotals,
  type CompletedSession,
  type SessionExercise,
} from "../domain";
// Numbers and dates are formatted with the active locale: see useFormat().
/** Clock-style minutes and seconds; the same in every language. */
export const duration = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, "0")}`;
export const isExerciseComplete = (exercise: SessionExercise) =>
  exercise.sets.every((set) => set.completed);
export const sessionMinutes = (session: CompletedSession) =>
  Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60000));

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
