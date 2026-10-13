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
  const earlier = exercise.sets.slice(0, index).filter((row) => row.completed);
  const source =
    earlier.at(-1) ??
    lastSet(lastExercisePerformance(completed, exercise.exerciseId), index);
  if (!source) return null;
  if (source.weightKg === set.weightKg && source.reps === set.reps) return null;
  return { weightKg: source.weightKg, reps: source.reps };
}
function lastSet(
  performance: ReturnType<typeof lastExercisePerformance>,
  index: number,
) {
  return performance?.sets[index] ?? performance?.sets.at(-1);
}
