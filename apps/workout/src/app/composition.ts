import { createWorkouts, initialSnapshot } from "../features/workouts";
import {
  openDexieWorkoutStorage,
  createDraftJournal,
} from "../features/workouts/infrastructure";

export function createWorkoutApp() {
  return createWorkouts({
    storage: openDexieWorkoutStorage("form-workout-v1", initialSnapshot()),
    now: Date.now,
    id: () => crypto.randomUUID(),
  });
}

export function createWorkoutDrafts() {
  let preferredWriter: string | undefined;
  try {
    preferredWriter =
      sessionStorage.getItem("form-workout:draft-writer") ?? undefined;
  } catch {}
  return createDraftJournal({
    storage: () => localStorage,
    id: () => crypto.randomUUID(),
    preferredWriter,
    rememberWriter: (writer) =>
      sessionStorage.setItem("form-workout:draft-writer", writer),
  });
}
