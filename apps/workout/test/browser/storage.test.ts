import Dexie from "dexie";
import { storageContract } from "../contracts/storage.contract";
import { initialSnapshot } from "../../src/features/workouts";
import { openDexieWorkoutStorage } from "../../src/features/workouts/infrastructure";
import type { WorkoutStorage } from "../../src/features/workouts/ports";

storageContract("IndexedDB", () => {
  const name = `form-contract-${crypto.randomUUID()}`;
  const handles: WorkoutStorage[] = [];
  return {
    open() {
      const handle = openDexieWorkoutStorage(name, initialSnapshot());
      handles.push(handle);
      return handle;
    },
    async replaceRaw(raw) {
      const database = new Dexie(name);
      database.version(1).stores({ state: "" });
      try {
        await database.table("state").put(raw, "snapshot");
      } finally {
        database.close();
      }
    },
    async dispose() {
      for (const handle of handles) handle.close();
      await Dexie.delete(name);
    },
  };
});
