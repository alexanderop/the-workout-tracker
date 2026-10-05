import type { CompletedSession, WorkoutSet } from "../domain";

type ExerciseProgress = {
  id: string;
  name: string;
  best: WorkoutSet;
  trend: { at: number; weight: number }[];
};

function isBetter(set: WorkoutSet, best: WorkoutSet): boolean {
  return (
    set.weightKg > best.weightKg ||
    (set.weightKg === best.weightKg && set.reps > best.reps)
  );
}

function addSession(
  exercises: Map<string, ExerciseProgress>,
  session: CompletedSession,
) {
  const sessionWeights = new Map<string, number>();
  for (const exercise of session.exercises) {
    for (const set of exercise.sets.filter(
      (item) => item.completed && item.reps > 0,
    )) {
      const progress = exercises.get(exercise.exerciseId);
      if (!progress) {
        exercises.set(exercise.exerciseId, {
          id: exercise.exerciseId,
          name: exercise.name,
          best: set,
          trend: [],
        });
      }
      if (progress && isBetter(set, progress.best)) {
        progress.best = set;
      }
      sessionWeights.set(
        exercise.exerciseId,
        Math.max(sessionWeights.get(exercise.exerciseId) ?? 0, set.weightKg),
      );
    }
  }
  for (const [id, weight] of sessionWeights) {
    exercises.get(id)?.trend.push({ at: session.finishedAt, weight });
  }
}

export function successfulProgress(
  history: readonly CompletedSession[],
): ExerciseProgress[] {
  const exercises = new Map<string, ExerciseProgress>();
  for (const session of history) addSession(exercises, session);
  return [...exercises.values()].map((exercise) => ({
    ...exercise,
    trend: exercise.trend.reverse().slice(-12),
  }));
}
