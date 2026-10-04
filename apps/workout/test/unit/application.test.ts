import { describe, expect, it } from "vitest";
import { createWorkouts } from "../../src/features/workouts/application";
import { initialSnapshot } from "../../src/features/workouts";
import type {
  StorageState,
  WorkoutStorage,
} from "../../src/features/workouts/ports";
import { memoryDatabase } from "../support/memory-storage";

const settings = {
  type: "settings",
  settings: { autoRest: false, restSeconds: 120 },
} as const;
function service(storage: WorkoutStorage) {
  let sequence = 0;
  return createWorkouts({
    storage,
    now: () => 1000,
    id: () => `test-${++sequence}`,
  });
}

describe("workout application", () => {
  it.each(["read", "compareAndSave"] as const)(
    "preserves saved data when %s fails",
    async (operation) => {
      const database = memoryDatabase();
      const storage = database.open();
      const app = service({
        ...storage,
        [operation]: async () => {
          throw new Error("Storage disconnected");
        },
      });
      expect(await app.execute(settings, 0)).toMatchObject({
        kind: "unavailable",
      });
      expect(await storage.read()).toEqual({
        kind: "ready",
        snapshot: initialSnapshot(),
      });
      app.close();
    },
  );

  it.each([false, true])(
    "returns the rival commit during compare-and-save (unchanged command: %s)",
    async (noop) => {
      const database = memoryDatabase();
      const storage = database.open();
      const rival = service(database.open());
      const app = service({
        ...storage,
        async compareAndSave(expected, next) {
          expect(await rival.execute(settings, 0)).toMatchObject({
            kind: "saved",
          });
          return storage.compareAndSave(expected, next);
        },
      });
      const command = noop
        ? ({ type: "settings", settings: initialSnapshot().settings } as const)
        : ({ type: "start", routineId: null } as const);
      const expected = {
        ...initialSnapshot(),
        revision: 1,
        settings: settings.settings,
      };
      expect(await app.execute(command, 0)).toEqual({
        kind: "conflict",
        snapshot: expected,
      });
      expect(await storage.read()).toEqual({
        kind: "ready",
        snapshot: expected,
      });
      app.close();
      rival.close();
    },
  );

  it("merges a backup once while preserving local records and settings", async () => {
    const source = service(memoryDatabase().open());
    const imported = {
      id: "imported",
      name: "Cable row",
      category: "Back",
      custom: true,
    };
    expect(
      await source.execute({ type: "save-exercise", exercise: imported }, 0),
    ).toMatchObject({ kind: "saved" });
    const backup = await source.exportBackup();
    const storage = memoryDatabase().open();
    const target = service(storage);
    const local = {
      id: "local",
      name: "Press",
      category: "Chest",
      custom: true,
    };
    expect(
      await target.execute({ type: "save-exercise", exercise: local }, 0),
    ).toMatchObject({ kind: "saved" });
    expect(await target.execute(settings, 1)).toMatchObject({ kind: "saved" });
    const expected = {
      ...initialSnapshot(),
      revision: 3,
      settings: settings.settings,
      exercises: { ...initialSnapshot().exercises, local, imported },
    };
    expect(await target.importBackup(backup, 2)).toEqual({
      kind: "saved",
      snapshot: expected,
    });
    expect(await target.importBackup(backup, 3)).toEqual({
      kind: "saved",
      snapshot: expected,
    });
    expect(await storage.read()).toEqual({ kind: "ready", snapshot: expected });
    source.close();
    target.close();
  });

  it("does not commit a pending operation after the application closes", async () => {
    const storage = memoryDatabase().open();
    const read = Promise.withResolvers<StorageState>();
    const entered = Promise.withResolvers<void>();
    const app = service({
      ...storage,
      read() {
        entered.resolve();
        return read.promise;
      },
      close() {},
    });
    const result = app.execute(settings, 0);
    await entered.promise;
    app.close();
    read.resolve({ kind: "ready", snapshot: initialSnapshot() });
    expect(await result).toMatchObject({ kind: "unavailable" });
    expect(await storage.read()).toEqual({
      kind: "ready",
      snapshot: initialSnapshot(),
    });
    storage.close();
  });
});
