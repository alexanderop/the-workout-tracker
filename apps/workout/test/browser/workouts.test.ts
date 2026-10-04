import { openDexieWorkoutStorage } from "../../src/features/workouts/infrastructure";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";
import { initialSnapshot, type Snapshot } from "../../src/features/workouts";
import {
  createWorkouts,
  type LoadState,
  type Workouts,
} from "../../src/features/workouts";

const names: string[] = [];
const handles: Workouts[] = [];
function open(name = `form-test-${crypto.randomUUID()}`) {
  if (!names.includes(name)) names.push(name);
  const store = createWorkouts({
    storage: openDexieWorkoutStorage(name, initialSnapshot()),
    now: () => 10000,
    id: () => crypto.randomUUID(),
  });
  handles.push(store);
  return { store, name };
}
function ready(store: Workouts): Promise<Snapshot> {
  return new Promise((resolve, reject) => {
    const stop = store.subscribe((state) => {
      if (state.kind === "ready") {
        queueMicrotask(() => stop());
        resolve(state.snapshot);
      }
      if (state.kind === "recovery" || state.kind === "unavailable") {
        queueMicrotask(() => stop());
        reject(new Error(state.message));
      }
    });
  });
}
function backup(snapshot: Snapshot) {
  return JSON.stringify({ format: "form-workout", version: 1, snapshot });
}
async function logFirst(store: Workouts, snapshot: Snapshot) {
  const active = snapshot.active!;
  const exercise = active.exercises[0]!;
  return store.execute(
    {
      type: "set-entry",
      sessionId: active.id,
      exerciseId: exercise.id,
      setId: exercise.sets[0]!.id,
      weightKg: 60,
      reps: 8,
      completed: true,
    },
    snapshot.revision,
  );
}

afterEach(async () => {
  for (const handle of handles.splice(0)) handle.close();
  for (const name of names.splice(0)) await Dexie.delete(name);
});

describe("browser IndexedDB workout persistence", () => {
  it("serializes competing instances and refuses stale writes", async () => {
    const { store, name } = open();
    const other = open(name).store;
    const [first, second] = await Promise.all([ready(store), ready(other)]);
    expect(first.revision).toBe(0);
    expect(second.revision).toBe(0);
    const results = await Promise.all([
      store.execute({ type: "start", routineId: "upper-body" }, 0),
      other.execute({ type: "start", routineId: "lower-body" }, 0),
    ]);
    expect(results.map((result) => result.kind).sort()).toEqual([
      "conflict",
      "saved",
    ]);
    const restored = await ready(open(name).store);
    expect(restored.revision).toBe(1);
    expect(restored.active).not.toBeNull();
    expect(
      (
        await other.execute(
          { type: "settings", settings: { restSeconds: 180, autoRest: false } },
          0,
        )
      ).kind,
    ).toBe("conflict");
  });

  it("recovers entered sets and the same rest deadline after closing and reopening", async () => {
    const { store, name } = open();
    await ready(store);
    const started = await store.execute(
      { type: "start", routineId: "upper-body" },
      0,
    );
    if (started.kind !== "saved") throw new Error("Could not start");
    const logged = await logFirst(store, started.snapshot);
    if (logged.kind !== "saved") throw new Error("Could not log");
    store.close();
    const restored = await ready(open(name).store);
    expect(restored.active?.exercises[0]?.sets[0]).toMatchObject({
      weightKg: 60,
      reps: 8,
      completed: true,
    });
    expect(restored.active?.rest).toEqual(logged.snapshot.active?.rest);
    expect(restored.active?.rest?.endsAt).toBe(100000);
  });

  it("finishes only once across retries and retains unfinished rows", async () => {
    const { store } = open();
    await ready(store);
    const started = await store.execute(
      { type: "start", routineId: "upper-body" },
      0,
    );
    if (started.kind !== "saved" || !started.snapshot.active)
      throw new Error("Could not start");
    const sessionId = started.snapshot.active.id;
    expect((await store.execute({ type: "finish", sessionId }, 1)).kind).toBe(
      "invalid",
    );
    const logged = await logFirst(store, started.snapshot);
    if (logged.kind !== "saved") throw new Error("Could not log");
    const finished = await store.execute(
      { type: "finish", sessionId },
      logged.snapshot.revision,
    );
    if (finished.kind !== "saved") throw new Error("Could not finish");
    const retried = await store.execute(
      { type: "finish", sessionId },
      finished.snapshot.revision,
    );
    if (retried.kind !== "saved") throw new Error("Could not retry");
    expect(retried.snapshot.revision).toBe(finished.snapshot.revision);
    expect(Object.keys(retried.snapshot.completed)).toEqual([sessionId]);
    expect(
      retried.snapshot.completed[sessionId]?.exercises[0]?.sets,
    ).toHaveLength(3);
  });

  it("merges backups additively, skips duplicates and keeps local settings", async () => {
    const { store } = open();
    await ready(store);
    const incoming = initialSnapshot();
    const custom = {
      id: "custom",
      name: "Cable row",
      category: "Back",
      custom: true,
    };
    const payload = backup({
      ...incoming,
      exercises: { ...incoming.exercises, custom },
      settings: { restSeconds: 300, autoRest: false },
    });
    const imported = await store.importBackup(payload, 0);
    if (imported.kind !== "saved") throw new Error("Could not import");
    expect(imported.snapshot.exercises.custom).toEqual(custom);
    expect(imported.snapshot.settings).toEqual({
      restSeconds: 90,
      autoRest: true,
    });
    const duplicate = await store.importBackup(
      payload,
      imported.snapshot.revision,
    );
    if (duplicate.kind !== "saved")
      throw new Error("Could not import duplicate");
    expect(duplicate.snapshot.revision).toBe(imported.snapshot.revision);
    expect(
      JSON.parse(await store.exportBackup()).snapshot.exercises.custom,
    ).toEqual(custom);
  });

  it("rejects a conflicting backup atomically without partially importing new records", async () => {
    const { store } = open();
    await ready(store);
    const changed = await store.execute(
      { type: "settings", settings: { restSeconds: 120, autoRest: true } },
      0,
    );
    if (changed.kind !== "saved") throw new Error("Could not save preferences");
    const original = changed.snapshot;
    const incoming = {
      ...original,
      exercises: {
        ...original.exercises,
        custom: {
          id: "custom",
          name: "New exercise",
          category: "Back",
          custom: true,
        },
        "bench-press": {
          id: "bench-press",
          name: "Conflict",
          category: "Chest",
          custom: false,
        },
      },
    };
    expect(
      (await store.importBackup(backup(incoming), original.revision)).kind,
    ).toBe("invalid");
    expect(JSON.parse(await store.exportBackup()).snapshot).toEqual(original);
    expect(
      (await store.importBackup('{"broken":', original.revision)).kind,
    ).toBe("invalid");
  });

  it("restores edited starter routines into a pristine install without trusting the backup revision", async () => {
    const source = open().store;
    const original = await ready(source);
    const routine = original.routines["upper-body"]!;
    const edited = await source.execute(
      { type: "save-routine", routine: { ...routine, name: "My upper day" } },
      0,
    );
    if (edited.kind !== "saved") throw new Error("Could not edit routine");
    await source.execute(
      { type: "settings", settings: { restSeconds: 300, autoRest: false } },
      edited.snapshot.revision,
    );
    const target = open().store;
    await ready(target);
    const imported = await target.importBackup(await source.exportBackup(), 0);
    if (imported.kind !== "saved") throw new Error("Could not restore backup");
    expect(imported.snapshot.routines["upper-body"]?.name).toBe("My upper day");
    expect(imported.snapshot.revision).toBe(1);
    expect(imported.snapshot.settings).toEqual({
      restSeconds: 90,
      autoRest: true,
    });
    const duplicate = await target.importBackup(await source.exportBackup(), 1);
    if (duplicate.kind !== "saved")
      throw new Error("Could not import duplicate");
    expect(duplicate.snapshot.revision).toBe(1);
  });

  it("rejects a second active workout and dangling backup references", async () => {
    const a = open().store;
    const b = open().store;
    await Promise.all([ready(a), ready(b)]);
    await a.execute({ type: "start", routineId: "upper-body" }, 0);
    await b.execute({ type: "start", routineId: "lower-body" }, 0);
    expect((await a.importBackup(await b.exportBackup(), 1)).kind).toBe(
      "invalid",
    );
    const incoming = initialSnapshot();
    expect(
      (
        await a.importBackup(
          backup({
            ...incoming,
            routines: {
              bad: {
                id: "bad",
                name: "Bad",
                description: "",
                exercises: [
                  { exerciseId: "missing", sets: 3, reps: 8, weightKg: 0 },
                ],
              },
            },
          }),
          1,
        )
      ).kind,
    ).toBe("invalid");
  });

  it("preserves corrupt data and provides a raw recovery export", async () => {
    const { store, name } = open();
    await ready(store);
    store.close();
    const direct = new Dexie(name);
    direct.version(1).stores({ state: "" });
    await direct
      .table("state")
      .put({ valuable: "unreadable legacy content" }, "snapshot");
    direct.close();
    const reopened = open(name).store;
    const state = await new Promise<LoadState>((resolve) => {
      const stop = reopened.subscribe((value) => {
        if (value.kind !== "loading") {
          queueMicrotask(() => stop());
          resolve(value);
        }
      });
    });
    expect(state.kind).toBe("recovery");
    if (state.kind !== "recovery") throw new Error("Expected recovery");
    expect(JSON.parse(state.rawExport).raw).toEqual({
      valuable: "unreadable legacy content",
    });
    expect(
      (await reopened.execute({ type: "start", routineId: null }, 0)).kind,
    ).toBe("invalid");
    expect(JSON.parse(await reopened.exportBackup()).raw).toEqual({
      valuable: "unreadable legacy content",
    });
  });

  it("notifies a subscribed instance about another instance commits", async () => {
    const { store, name } = open();
    const other = open(name).store;
    await Promise.all([ready(store), ready(other)]);
    const revisions: number[] = [];
    const stop = store.subscribe((state) => {
      if (state.kind === "ready") revisions.push(state.snapshot.revision);
    });
    await other.execute({ type: "start", routineId: null }, 0);
    await expect.poll(() => revisions).toContain(1);
    stop();
  });
});
