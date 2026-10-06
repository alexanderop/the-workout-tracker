import type { CompletedSession } from "../domain";

export function lastExercisePerformance(
  completed: Readonly<Record<string, CompletedSession>>,
  exerciseId: string,
) {
  const sessions = Object.values(completed).sort((a, b) => b.finishedAt - a.finishedAt);
  for (const session of sessions) {
    const sets = session.exercises
      .filter((exercise) => exercise.exerciseId === exerciseId)
      .flatMap((exercise) => exercise.sets.filter((set) => set.completed));
    if (sets.length) return { finishedAt: session.finishedAt, sets };
  }
  return null;
}
