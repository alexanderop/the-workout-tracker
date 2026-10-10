import { Dexie } from "dexie";
import { afterEach, describe, expect, it } from "vitest";
import { openDexieWorkoutStorage } from "../../src/features/workouts/adapters/dexie";
import type { LoadState, WorkoutStorage } from "../../src/features/workouts/ports";
import { createWorkoutFactory } from "../support/factories";

const resources: { name: string; adapters: WorkoutStorage[] }[] = [];
function isolatedStorage() {
  const factory = createWorkoutFactory("browser");
  const initial = factory.snapshot();
  const name = `workout-test-${crypto.randomUUID()}`;
  const adapters = [openDexieWorkoutStorage(name, initial), openDexieWorkoutStorage(name, initial)];
  resources.push({ name, adapters });
  const [first, second] = adapters;
  if (!first || !second) throw new Error("Two storage connections are required.");
  return { first, second, initial, name, adapters };
}
describe("workout storage", () => {
  afterEach(async () => {
    for (const { name, adapters } of resources.splice(0)) {
      for (const adapter of adapters) adapter.close();
      await Dexie.delete(name);
    }
  });


  describe("real IndexedDB workout storage", () => {
    it("adds new built-in exercises on reopen without replacing existing journal data", async () => {
      const { first, second, initial, name, adapters } = isolatedStorage();
      const saved = { ...initial, revision: 1, settings: { autoRest: false, restSeconds: 30 } };
      await first.compareAndSave(0, saved);
      first.close();
      second.close();
      const exercise = { id: "new-built-in", name: "New machine", category: "Core", equipment: "EGYM", custom: false };
      const seed = { ...initial, exercises: { ...initial.exercises, [exercise.id]: exercise } };
      const reopened = openDexieWorkoutStorage(name, seed);
      adapters.push(reopened);
      const expected = { ...saved, revision: 2, exercises: { ...saved.exercises, [exercise.id]: exercise } };
      expect(await reopened.read()).toEqual({ kind: "ready", snapshot: expected });
      expect(await reopened.read()).toEqual({ kind: "ready", snapshot: expected });
      expect((await reopened.compareAndSave(1, saved)).kind).toBe("conflict");
    });

    it("reports stored invalid data for recovery and refuses writes without touching it", async () => {
      const factory = createWorkoutFactory("browser");
      const initial = factory.snapshot();
      const name = `workout-test-${crypto.randomUUID()}`;
      const raw = { revision: "not a number", completed: "broken" };
      const seed = new Dexie(name);
      seed.version(1).stores({ state: "" });
      await seed.table("state").put(raw, "snapshot");
      seed.close();
      const storage = openDexieWorkoutStorage(name, initial);
      resources.push({ name, adapters: [storage] });
      const state = await storage.read();
      expect(state.kind).toBe("recovery");
      if (state.kind !== "recovery") return;
      expect(JSON.parse(state.rawExport)).toEqual({ format: "form-workout-recovery", raw });
      expect((await storage.compareAndSave(0, { ...initial, revision: 1 })).kind).toBe("invalid");
      expect((await storage.compareAndSave(0, initial)).kind).toBe("invalid");
      const reopened = new Dexie(name);
      reopened.version(1).stores({ state: "" });
      expect(await reopened.table("state").get("snapshot")).toEqual(raw);
      reopened.close();
    });

    it("retries opening after a failed first open", async () => {
      const factory = createWorkoutFactory("browser");
      const initial = factory.snapshot();
      const name = `workout-test-${crypto.randomUUID()}`;
      // A newer database without the state store makes the first open fail.
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(name, 100);
        request.addEventListener("success", () => {
          request.result.close();
          resolve();
        });
        request.addEventListener("error", () =>
          reject(request.error ?? new Error("Could not open the database.")),
        );
      });
      const storage = openDexieWorkoutStorage(name, initial);
      resources.push({ name, adapters: [storage] });
      expect((await storage.read()).kind).toBe("unavailable");
      await Dexie.delete(name);
      expect(await storage.read()).toEqual({ kind: "ready", snapshot: initial });
    });

    it("allows only one concurrent writer to advance a revision", async () => {
      const { first, second, initial } = isolatedStorage();
      const next = { ...initial, revision: 1, settings: { autoRest: false, restSeconds: 30 } };
      const other = { ...next, settings: { autoRest: true, restSeconds: 90 } };
      const results = await Promise.all([first.compareAndSave(0, next), second.compareAndSave(0, other)]);
      expect(results.map((result) => result.kind).sort()).toEqual(["conflict", "saved"]);
      const saved = results.find((result) => result.kind === "saved");
      const conflict = results.find((result) => result.kind === "conflict");
      expect(saved?.snapshot.revision).toBe(1);
      expect([next.settings, other.settings]).toContainEqual(saved?.snapshot.settings);
      expect(conflict?.snapshot).toEqual(saved?.snapshot);
      expect(await first.read()).toEqual({ kind: "ready", snapshot: saved?.snapshot });
      expect(await second.read()).toEqual(await first.read());
    });

    it("rejects stale no-op writes without overwriting the current revision", async () => {
      const { first, second, initial } = isolatedStorage();
      const next = { ...initial, revision: 1, settings: { autoRest: false, restSeconds: 30 } };
      expect((await first.compareAndSave(0, next)).kind).toBe("saved");
      expect(await second.compareAndSave(0, initial)).toEqual({ kind: "conflict", snapshot: next });
      expect(await first.read()).toEqual({ kind: "ready", snapshot: next });
    });

    it("keeps committed data after closing and reopening a connection", async () => {
      const { first, second, initial, name, adapters } = isolatedStorage();
      const next = { ...initial, revision: 1 };
      await first.compareAndSave(0, next);
      first.close();
      expect((await first.read()).kind).toBe("unavailable");
      expect((await first.compareAndSave(1, next)).kind).toBe("unavailable");
      expect(await second.read()).toEqual({ kind: "ready", snapshot: next });
      second.close();
      const reopened = openDexieWorkoutStorage(name, initial);
      adapters.push(reopened);
      expect(await reopened.read()).toEqual({ kind: "ready", snapshot: next });
    });

    it("stops notifying an unsubscribed listener while active observers receive changes", async () => {
      const { first, second, initial } = isolatedStorage();
      const removed: LoadState[] = [];
      const active: LoadState[] = [];
      const unsubscribe = first.subscribe((state) => removed.push(state));
      const stop = second.subscribe((state) => active.push(state));
      await expect.poll(() => removed.some((state) => state.kind === "ready")).toBe(true);
      unsubscribe();
      const count = removed.length;
      await second.compareAndSave(0, { ...initial, revision: 1 });
      await expect.poll(() => active.some((state) => state.kind === "ready" && state.snapshot.revision === 1)).toBe(true);
      expect(removed).toHaveLength(count);
      stop();
    });
  });
});
