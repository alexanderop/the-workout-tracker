import { Dexie } from "dexie";
import { openDexieWorkoutStorage } from "../../src/features/workouts/adapters/dexie";
import { describeWorkoutStorageContract } from "../support/storage-contract";

describeWorkoutStorageContract("IndexedDB", (initial) => {
  const name = `workout-contract-${crypto.randomUUID()}`;
  return {
    storage: openDexieWorkoutStorage(name, initial),
    dispose: () => Dexie.delete(name),
  };
});
