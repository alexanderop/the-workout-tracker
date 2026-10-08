import { createWorkouts, initialSnapshot, type DraftJournal } from "../features/workouts";
import {
  openDexieWorkoutStorage,
  createDraftJournal,
} from "../features/workouts/infrastructure";

export function createWorkoutApp(journal: DraftJournal) {
  return createWorkouts({
    journal,
    storage: openDexieWorkoutStorage("form-workout-v1", initialSnapshot()),
    now: Date.now,
    id: () => crypto.randomUUID(),
    reportError: (context, error) => console.error(context, error),
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
