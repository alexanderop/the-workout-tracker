import type { CompletedSession, SessionExercise } from "../domain";

export function lastExercisePerformance(
  completed: Readonly<Record<string, CompletedSession>>,
  exerciseId: string,
) {
  const sessions = Object.values(completed).sort(
    (a, b) => b.finishedAt - a.finishedAt,
  );
  for (const session of sessions) {
    const sets = session.exercises
      .filter((exercise) => exercise.exerciseId === exerciseId)
      .flatMap((exercise) => exercise.sets.filter((set) => set.completed));
    if (sets.length) return { finishedAt: session.finishedAt, sets };
  }
  return null;
}

export type SetSuggestion = {
  readonly weightKg: number;
  readonly reps: number;
  /** `previous`: an earlier set of this workout; `lastTime`: history. */
  readonly source: "previous" | "lastTime";
};

/**
 * Values to offer for the unlogged set at `index`: the latest logged set
 * before it in this workout, else the same set (or the last one) of the
 * exercise last time. Only offered, never applied; null when there is
 * nothing to offer or the set already plans these values.
 */
export function suggestedSet(
  exercise: SessionExercise,
  index: number,
  completed: Readonly<Record<string, CompletedSession>>,
): SetSuggestion | null {
  const set = exercise.sets[index];
  if (!set || set.completed) return null;
  // The latest logged set before this one.
  const previous = exercise.sets
    .slice(0, index)
    .reverse()
    .find((row) => row.completed);
  const found = previous
    ? { values: previous, source: "previous" as const }
    : lastTime(completed, exercise.exerciseId, index);
  if (!found) return null;
  const { values, source } = found;
  if (values.weightKg === set.weightKg && values.reps === set.reps) return null;
  return { weightKg: values.weightKg, reps: values.reps, source };
}
function lastTime(
  completed: Readonly<Record<string, CompletedSession>>,
  exerciseId: string,
  index: number,
) {
  const sets = lastExercisePerformance(completed, exerciseId)?.sets;
  const values = sets?.[index] ?? sets?.at(-1);
  return values ? { values, source: "lastTime" as const } : null;
}
