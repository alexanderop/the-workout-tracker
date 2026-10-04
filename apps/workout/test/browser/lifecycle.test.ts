import Dexie from "dexie";
import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { initialSnapshot } from "../../src/features/workouts";
import { createWorkouts } from "../../src/features/workouts/application";
import { openDexieWorkoutStorage } from "../../src/features/workouts/adapters/dexie";
import { useWorkouts } from "../../src/features/workouts/ui/useWorkouts";
import type { LoadState } from "../../src/features/workouts/ports";

function revision(state: LoadState | undefined) {
  return state?.kind === "ready" ? state.snapshot.revision : undefined;
}

describe("workout subscription lifecycle", () => {
  it("disposes a consumer without closing the application-owned service", async () => {
    const name = `scope-${crypto.randomUUID()}`;
    const storage = openDexieWorkoutStorage(name, initialSnapshot());
    const app = createWorkouts({
      storage,
      now: () => 1000,
      id: () => "session",
    });
    const firstScope = effectScope();
    const secondScope = effectScope();
    try {
      const first = firstScope.run(() => useWorkouts(app))!;
      await expect.poll(() => first.snapshot.value?.revision).toBe(0);
      firstScope.stop();
      const second = secondScope.run(() => useWorkouts(app))!;
      await expect.poll(() => second.snapshot.value?.revision).toBe(0);
      expect(
        await app.execute(
          { type: "settings", settings: { autoRest: false, restSeconds: 120 } },
          0,
        ),
      ).toMatchObject({ kind: "saved" });
      await expect.poll(() => second.snapshot.value?.revision).toBe(1);
      expect(first.snapshot.value?.revision).toBe(0);
      expect(second.snapshot.value?.settings).toEqual({
        autoRest: false,
        restSeconds: 120,
      });
    } finally {
      firstScope.stop();
      secondScope.stop();
      app.close();
      await Dexie.delete(name);
    }
  });

  it("unsubscribes during initialization and starts a fresh observation", async () => {
    const name = `resubscribe-${crypto.randomUUID()}`;
    const storage = openDexieWorkoutStorage(name, initialSnapshot());
    const writer = openDexieWorkoutStorage(name, initialSnapshot());
    const stopped: LoadState[] = [];
    const active: LoadState[] = [];
    const stop = storage.subscribe((state) => stopped.push(state));
    stop();
    const unsubscribe = storage.subscribe((state) => active.push(state));
    try {
      await expect.poll(() => revision(active.at(-1))).toBe(0);
      const next = {
        ...initialSnapshot(),
        revision: 1,
        settings: { autoRest: false, restSeconds: 120 },
      };
      expect(await writer.compareAndSave(0, next)).toMatchObject({
        kind: "saved",
      });
      await expect.poll(() => revision(active.at(-1))).toBe(1);
      expect(stopped).toEqual([{ kind: "loading" }]);
      expect(active.at(-1)).toEqual({ kind: "ready", snapshot: next });
    } finally {
      unsubscribe();
      storage.close();
      writer.close();
      await Dexie.delete(name);
    }
  });

  it("does not emit after closing during initialization", async () => {
    const name = `close-${crypto.randomUUID()}`;
    const storage = openDexieWorkoutStorage(name, initialSnapshot());
    const states: LoadState[] = [];
    storage.subscribe((state) => states.push(state));
    storage.close();
    const control = openDexieWorkoutStorage(name, initialSnapshot());
    const observed: LoadState[] = [];
    const stop = control.subscribe((state) => observed.push(state));
    try {
      await expect.poll(() => revision(observed.at(-1))).toBe(0);
      const next = {
        ...initialSnapshot(),
        revision: 1,
        settings: { autoRest: false, restSeconds: 120 },
      };
      expect(await control.compareAndSave(0, next)).toMatchObject({
        kind: "saved",
      });
      await expect.poll(() => revision(observed.at(-1))).toBe(1);
      expect(states).toEqual([{ kind: "loading" }]);
      expect(await storage.read()).toMatchObject({ kind: "unavailable" });
    } finally {
      stop();
      control.close();
      await Dexie.delete(name);
    }
  });
});
