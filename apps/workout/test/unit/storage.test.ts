import { storageContract } from "../contracts/storage.contract";
import { memoryDatabase } from "../support/memory-storage";
import type { WorkoutStorage } from "../../src/features/workouts/ports";

storageContract("memory", () => {
  const database = memoryDatabase();
  const handles: WorkoutStorage[] = [];
  return {
    open() {
      const handle = database.open();
      handles.push(handle);
      return handle;
    },
    replaceRaw: database.replaceRaw,
    dispose() {
      for (const handle of handles) handle.close();
    },
  };
});
