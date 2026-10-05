import { describe, expect, it } from "vitest";
import { createWorkouts } from "../../src/features/workouts/application";
import type { Snapshot } from "../../src/features/workouts/domain";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
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
    expect(await app.execute(command, 0)).toMatchObject({
      kind: "conflict",
      snapshot: { revision: 1 },
    });
    expect(await app.execute(command, 1)).toMatchObject({
      kind: "saved",
      snapshot: { revision: 2 },
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
      ).kind,
    ).toBe("saved");
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
      ).kind,
    ).toBe("saved");
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
      (await app.execute({ type: "start", routineId: null }, 0)).kind,
    ).toBe("saved");
    const stale = await app.execute(
      { type: "settings", settings: { restSeconds: 30, autoRest: false } },
      0,
    );
    expect(stale).toMatchObject({
      kind: "conflict",
      snapshot: {
        revision: 1,
        active: { status: "active", startedAt: FIXED_NOW },
        settings: { restSeconds: 90, autoRest: true },
      },
    });
    expect(memory.current().revision).toBe(1);
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
    expect(changed.kind).toBe("saved");
    expect(noOp).toMatchObject({
      kind: "conflict",
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
    expect(result).toEqual({
      kind: "invalid",
      message: `Backup contains a conflicting record (${existing.id}). No data was imported.`,
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
    expect((await app.importBackup(backup, 0)).kind).toBe("saved");
    const repeated = await app.importBackup(backup, 1);
    expect(repeated).toMatchObject({
      kind: "saved",
      snapshot: { revision: 1, settings: { restSeconds: 15, autoRest: false } },
    });
    expect(memory.current().completed).toEqual({ [completed.id]: completed });
  });

  it("reports partial deletion when draft cleanup fails, and allows an explicit retry", async () => {
    const factory = createWorkoutFactory("delete");
    const active = factory.activeSession();
    const { dependencies, memory, drafts } = setup(
      factory.snapshot({ active, revision: 4 }),
    );
    const retainedDraft = dependencies.journal.write({
      sessionId: active.id,
      setId: active.exercises[0]!.sets[0]!.id,
      weight: "60",
      reps: "8",
      revision: 4,
      base: { weightKg: 40, reps: 8, targetReps: 8, completed: false },
    });
    let cleanupAvailable = false;
    const app = createWorkouts({
      ...dependencies,
      journal: {
        ...dependencies.journal,
        clearBefore(revision) {
          if (!cleanupAvailable) throw new Error("Draft storage unavailable");
          dependencies.journal.clearBefore(revision);
        },
      },
    });
    const partial = await app.deleteAllData(4);
    expect(partial).toMatchObject({
      kind: "cleanup-pending",
      snapshot: { revision: 5, active: null, completed: {} },
    });
    expect(drafts.current()).toEqual([retainedDraft]);
    cleanupAvailable = true;
    expect(await app.deleteAllData(4)).toMatchObject({
      kind: "conflict",
      snapshot: { revision: 5 },
    });
    expect(drafts.current()).toEqual([retainedDraft]);
    expect(await app.deleteAllData(5)).toMatchObject({
      kind: "saved",
      snapshot: { revision: 6, active: null },
    });
    expect(drafts.current()).toEqual([]);
    expect(memory.current().settings).toEqual({
      restSeconds: 90,
      autoRest: true,
    });
  });
});
