import { readStorage, writeStorage } from "@form/composables";
import { z } from "zod";
import { createWorkouts, initialSnapshot, type DraftJournal } from "../features/workouts";
import {
  openDexieWorkoutStorage,
  createDraftJournal,
} from "../features/workouts/infrastructure";

const writerKey = "form-workout:draft-writer";
const sessionStorageOfTab = () => sessionStorage;

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
  // This tab's previous writer, so reloads keep the same input first.
  const remembered = readStorage(sessionStorageOfTab, writerKey, z.string());
  return createDraftJournal({
    storage: () => localStorage,
    id: () => crypto.randomUUID(),
    preferredWriter: remembered.isOk() ? remembered.value : undefined,
    rememberWriter: (writer) => {
      writeStorage(sessionStorageOfTab, writerKey, writer);
    },
  });
}
