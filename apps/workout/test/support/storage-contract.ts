import { Result } from "@form/result";
import { afterEach, describe, expect, it } from "vitest";
import type { Snapshot } from "../../src/features/workouts/domain";
import type {
  LoadState,
  WorkoutStorage,
} from "../../src/features/workouts/ports";
import { createWorkoutFactory } from "./factories";
import { errorTag, failure } from "./results";

export type OpenStorage = (initial: Snapshot) => {
  readonly storage: WorkoutStorage;
  readonly dispose?: () => Promise<void> | void;
};

/**
 * The `WorkoutStorage` contract from docs/architecture.md. Every adapter,
 * including the in-memory test and preview double, must pass it.
 */
export function describeWorkoutStorageContract(
  name: string,
  open: OpenStorage,
) {
  describe(`${name} storage contract`, () => {
    const disposals: (() => Promise<void> | void)[] = [];
    afterEach(async () => {
      for (const dispose of disposals.splice(0)) await dispose();
    });
    function setup() {
      const initial = createWorkoutFactory(name).snapshot();
      const opened = open(initial);
      disposals.push(() => opened.storage.close());
      if (opened.dispose) disposals.push(opened.dispose);
      const changed = (revision: number): Snapshot => ({
        ...initial,
        revision,
        settings: { autoRest: false, restSeconds: 30 + revision },
      });
      return { storage: opened.storage, initial, changed };
    }

    it("reads the initial snapshot", async () => {
      const { storage, initial } = setup();
      expect(await storage.read()).toEqual(Result.ok(initial));
    });

    it("saves a changed snapshot that advances the revision by one", async () => {
      const { storage, changed } = setup();
      const next = changed(1);
      expect(await storage.compareAndSave(0, next)).toEqual(Result.ok(next));
      expect(await storage.read()).toEqual(Result.ok(next));
    });

    it("returns a conflict with the current snapshot for a stale revision", async () => {
      const { storage, changed } = setup();
      const next = changed(1);
      await storage.compareAndSave(0, next);
      const conflict = failure(await storage.compareAndSave(0, changed(1)));
      expect(conflict).toMatchObject({ _tag: "Conflict", snapshot: next });
      expect(await storage.read()).toEqual(Result.ok(next));
    });

    it("rejects a revision jump without writing", async () => {
      const { storage, initial, changed } = setup();
      expect(errorTag(await storage.compareAndSave(0, changed(2)))).toBe(
        "InvalidChange",
      );
      expect(await storage.read()).toEqual(Result.ok(initial));
    });

    it("treats an identical snapshot at the same revision as a no-op", async () => {
      const { storage, initial } = setup();
      expect(await storage.compareAndSave(0, { ...initial })).toEqual(
        Result.ok(initial),
      );
      expect(await storage.read()).toEqual(Result.ok(initial));
    });

    it("rejects changed content that keeps the same revision", async () => {
      const { storage, initial, changed } = setup();
      expect(errorTag(await storage.compareAndSave(0, changed(0)))).toBe(
        "InvalidChange",
      );
      expect(await storage.read()).toEqual(Result.ok(initial));
    });

    it("rejects invalid snapshots and revisions", async () => {
      const { storage, initial } = setup();
      const broken = { ...initial, revision: -1 };
      expect(errorTag(await storage.compareAndSave(0, broken))).toBe(
        "InvalidChange",
      );
      expect(errorTag(await storage.compareAndSave(-1, initial))).toBe(
        "InvalidRevision",
      );
      expect(await storage.read()).toEqual(Result.ok(initial));
    });

    it("notifies subscribers of saved snapshots until they unsubscribe", async () => {
      const { storage, changed } = setup();
      const states: LoadState[] = [];
      const stop = storage.subscribe((state) => states.push(state));
      await storage.compareAndSave(0, changed(1));
      await expect
        .poll(() =>
          states.some(
            (state) => state.kind === "ready" && state.snapshot.revision === 1,
          ),
        )
        .toBe(true);
      stop();
      const count = states.length;
      await storage.compareAndSave(1, changed(2));
      expect(states).toHaveLength(count);
    });

    it("refuses reads, writes and subscriptions after closing", async () => {
      const { storage, changed } = setup();
      storage.close();
      expect(errorTag(await storage.read())).toBe("StorageClosed");
      expect(errorTag(await storage.compareAndSave(0, changed(1)))).toBe(
        "StorageClosed",
      );
      const states: LoadState[] = [];
      storage.subscribe((state) => states.push(state));
      expect(states).toMatchObject([
        { kind: "failed", error: { _tag: "StorageClosed" } },
      ]);
    });
  });
}
