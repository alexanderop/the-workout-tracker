import { createWorkouts, initialSnapshot } from "../features/workouts";
import { openDexieWorkoutStorage } from "../features/workouts/infrastructure";

export function createWorkoutApp() {
  return createWorkouts({
    storage: openDexieWorkoutStorage("form-workout-v1", initialSnapshot()),
    now: Date.now,
    id: () => crypto.randomUUID(),
  });
}
