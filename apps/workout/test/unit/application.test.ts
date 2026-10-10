import { Result } from "@form/result";
import { describe, expect, it } from "vitest";
import { createWorkouts } from "../../src/features/workouts/application";
import { DraftStorageFailed, StorageUnavailable, type Snapshot } from "../../src/features/workouts/domain";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import { errorTag, failure, success } from "../support/results";
import {
  createMemoryJournal,
  createMemoryStorage,
} from "../support/memory-ports";

function setup(snapshot?: Snapshot) {
  const factory = createWorkoutFactory("application");
  const memory = createMemoryStorage(snapshot ?? factory.snapshot());
  const drafts = createMemoryJournal(factory.id);
  const dependencies = {
    storage: memory.storage,
    journal: drafts.journal,
    now: () => FIXED_NOW,
    id: factory.id,
  };
  return {
    factory,
    memory,
    drafts,
    dependencies,
    app: createWorkouts(dependencies),
  };
}

describe("workout application", () => {
  it("rejects stale creation before allocating a persistent identity", async () => {
    const { app, memory } = setup();
    await app.execute(
      { type: "settings", settings: { restSeconds: 30, autoRest: false } },
      0,
    );
    const command = {
      type: "create-exercise",
      exercise: {
        name: "Landmine press",
        category: "Shoulders",
        equipment: "Barbell",
      },
    } as const;
    expect(failure(await app.execute(command, 0))).toMatchObject({
      _tag: "Conflict",
      snapshot: { revision: 1 },
    });
    expect(await app.execute(command, 1)).toMatchObject({
      status: "ok",
      value: { revision: 2 },
    });
    expect(memory.current().exercises["application-1"]).toEqual({
      id: "application-1",
      name: "Landmine press",
      category: "Shoulders",
      equipment: "Barbell",
      custom: true,
    });
  });

  it("assigns persistent creation identities through the injected ID source", async () => {
    const { app, memory } = setup();
    expect(
      (
        await app.execute(
          {
            type: "create-exercise",
            exercise: {
              name: "Landmine press",
              category: "Shoulders",
              equipment: "Barbell",
            },
          },
          0,
        )
      ).isOk(),
    ).toBe(true);
    expect(memory.current().exercises["application-1"]).toEqual({
      id: "application-1",
      name: "Landmine press",
      category: "Shoulders",
      equipment: "Barbell",
      custom: true,
    });
    expect(
      (
        await app.execute(
          {
            type: "create-routine",
            routine: {
              name: "Press day",
              description: "",
              exercises: [
                {
                  exerciseId: "application-1",
                  sets: [{ weightKg: 20, reps: 10 }],
                },
              ],
            },
          },
          1,
        )
      ).isOk(),
    ).toBe(true);
    expect(memory.current().routines["application-2"]).toEqual({
      id: "application-2",
      name: "Press day",
      description: "",
      exercises: [
        { exerciseId: "application-1", sets: [{ weightKg: 20, reps: 10 }] },
      ],
    });
  });

  it("does not overwrite a change made after the caller's reviewed revision", async () => {
    const { app, memory } = setup();
    expect(
      (await app.execute({ type: "start-selected", exerciseIds: ["bench-press"] }, 0)).isOk(),
    ).toBe(true);
    const stale = await app.execute(
      { type: "settings", settings: { restSeconds: 30, autoRest: false } },
      0,
    );
    expect(failure(stale)).toMatchObject({
      _tag: "Conflict",
      snapshot: {
        revision: 1,
        active: { status: "active", startedAt: FIXED_NOW },
        settings: { restSeconds: 90, autoRest: true },
      },
    });
    expect(memory.current().revision).toBe(1);
  });

  it("commits exactly one complete workout when starts compete", async () => {
    const { app, memory } = setup();
    const command = { type: "start-selected" as const, exerciseIds: ["bench-press", "squat"] };
    const results = await Promise.all([app.execute(command, 0), app.execute(command, 0)]);
    expect(results.map((result) => errorTag(result) ?? "saved").sort()).toEqual(["Conflict", "saved"]);
    expect(memory.current().revision).toBe(1);
    expect(memory.current().active?.exercises.map((exercise) => exercise.exerciseId)).toEqual(["bench-press", "squat"]);
    const sets = memory.current().active?.exercises[0]?.sets;
    expect(sets).toHaveLength(1);
    expect(sets?.[0]).toMatchObject({ weightKg: 0, reps: 8, targetReps: 8, completed: false });
  });

  it("leaves no partial workout when selected creation cannot save", async () => {
    const { dependencies, memory } = setup();
    const app = createWorkouts({ ...dependencies, storage: {
      ...dependencies.storage,
      compareAndSave: () => Promise.resolve(Result.err(new StorageUnavailable())),
    } });
    expect(errorTag(await app.execute({ type: "start-selected", exerciseIds: ["bench-press"] }, 0))).toBe("StorageUnavailable");
    expect(memory.current().active).toBeNull();
    expect(memory.current().revision).toBe(0);
  });

  it("checks the revision even when a competing command would otherwise be a no-op", async () => {
    const { app, memory } = setup();
    const [changed, noOp] = await Promise.all([
      app.execute(
        { type: "settings", settings: { restSeconds: 30, autoRest: false } },
        0,
      ),
      app.execute(
        { type: "settings", settings: { restSeconds: 90, autoRest: true } },
        0,
      ),
    ]);
    expect(changed.isOk()).toBe(true);
    expect(failure(noOp)).toMatchObject({
      _tag: "Conflict",
      snapshot: { revision: 1, settings: { restSeconds: 30, autoRest: false } },
    });
    expect(memory.current().settings).toEqual({
      restSeconds: 30,
      autoRest: false,
    });
  });

  it("rejects all of an import when an existing ID has different content", async () => {
    const factory = createWorkoutFactory("backup");
    const existing = factory.exercise();
    const added = factory.exercise({ name: "New exercise" });
    const local = factory.snapshot({
      exercises: { ...factory.snapshot().exercises, [existing.id]: existing },
    });
    const { app, memory } = setup(local);
    const incoming = factory.snapshot({
      exercises: {
        ...local.exercises,
        [added.id]: added,
        [existing.id]: { ...existing, name: "Conflicting edit" },
      },
    });
    const result = await app.importBackup(
      JSON.stringify({
        format: "form-workout",
        version: 2,
        snapshot: incoming,
      }),
      0,
    );
    expect(failure(result)).toMatchObject({
      _tag: "ConflictingRecord",
      recordId: existing.id,
    });
    expect(memory.current()).toEqual(local);
  });

  it("merges compatible records once while preserving local settings", async () => {
    const factory = createWorkoutFactory("merge");
    const completed = factory.completedSession();
    const local = factory.snapshot({
      settings: { restSeconds: 15, autoRest: false },
    });
    const incoming = factory.snapshot({
      completed: { [completed.id]: completed },
    });
    const backup = JSON.stringify({
      format: "form-workout",
      version: 2,
      snapshot: incoming,
    });
    const { app, memory } = setup(local);
    expect((await app.importBackup(backup, 0)).isOk()).toBe(true);
    const repeated = await app.importBackup(backup, 1);
    expect(repeated).toMatchObject({
      status: "ok",
      value: { revision: 1, settings: { restSeconds: 15, autoRest: false } },
    });
    expect(memory.current().completed).toEqual({ [completed.id]: completed });
  });

  it("merges an active workout whose identity names an inherited object property", async () => {
    const factory = createWorkoutFactory("inherited");
    const completed = factory.completedSession();
    const local = factory.snapshot({ completed: { [completed.id]: completed } });
    const active = factory.activeSession({ id: "toString" });
    const backup = JSON.stringify({
      format: "form-workout",
      version: 2,
      snapshot: factory.snapshot({ active }),
    });
    const { app, memory } = setup(local);
    expect((await app.importBackup(backup, 0)).isOk()).toBe(true);
    expect(memory.current().active).toEqual(active);
  });

  it("reports partial deletion when draft cleanup fails, and allows an explicit retry", async () => {
    const factory = createWorkoutFactory("delete");
    const active = factory.activeSession();
    const { dependencies, memory, drafts } = setup(
      factory.snapshot({ active, revision: 4 }),
    );
    const retainedDraft = success(dependencies.journal.write({
      sessionId: active.id,
      setId: active.exercises[0]!.sets[0]!.id,
      weight: "60",
      reps: "8",
      revision: 4,
      base: { weightKg: 40, reps: 8, targetReps: 8, completed: false },
    }));
    let cleanupAvailable = false;
    const app = createWorkouts({
      ...dependencies,
      journal: {
        ...dependencies.journal,
        clearBefore(revision) {
          if (!cleanupAvailable) return Result.err(new DraftStorageFailed({ cause: new Error("Draft storage unavailable") }));
          return dependencies.journal.clearBefore(revision);
        },
      },
    });
    const partial = await app.deleteAllData(4);
    expect(failure(partial)).toMatchObject({
      _tag: "DraftCleanupPending",
      snapshot: { revision: 5, active: null, completed: {} },
    });
    expect(drafts.current()).toEqual([retainedDraft]);
    cleanupAvailable = true;
    expect(failure(await app.deleteAllData(4))).toMatchObject({
      _tag: "Conflict",
      snapshot: { revision: 5 },
    });
    expect(drafts.current()).toEqual([retainedDraft]);
    expect(await app.deleteAllData(5)).toMatchObject({
      status: "ok",
      value: { revision: 6, active: null },
    });
    expect(drafts.current()).toEqual([]);
    expect(memory.current().settings).toEqual({
      restSeconds: 90,
      autoRest: true,
    });
  });
});

describe("given a storage write that throws", () => {
  const settings = {
    type: "settings",
    settings: { restSeconds: 45, autoRest: false },
  } as const;

  it("reports saved when the write committed before throwing", async () => {
    const { memory, dependencies } = setup();
    const app = createWorkouts({
      ...dependencies,
      storage: {
        ...memory.storage,
        async compareAndSave(expectedRevision, next) {
          await memory.storage.compareAndSave(expectedRevision, next);
          throw new Error("Acknowledgement lost.");
        },
      },
    });
    expect(await app.execute(settings, 0)).toMatchObject({
      status: "ok",
      value: { revision: 1, settings: { restSeconds: 45 } },
    });
  });

  it("reports unavailable when nothing was written", async () => {
    const { memory, dependencies } = setup();
    const app = createWorkouts({
      ...dependencies,
      storage: {
        ...memory.storage,
        compareAndSave: () => Promise.reject(new Error("Quota exceeded.")),
      },
    });
    expect(errorTag(await app.execute(settings, 0))).toBe("StorageUnavailable");
    expect(memory.current().revision).toBe(0);
  });

  it("reports a failing change as invalid, not as a storage problem", async () => {
    const { dependencies } = setup();
    const app = createWorkouts({
      ...dependencies,
      id: () => {
        throw new Error("Identity source failed.");
      },
    });
    const result = await app.execute(
      {
        type: "create-exercise",
        exercise: { name: "Dip", category: "Chest", equipment: "Bodyweight" },
      },
      0,
    );
    expect(failure(result)).toMatchObject({
      _tag: "InvalidChange",
      message: "This change failed unexpectedly. Nothing was saved.",
    });
  });
});
