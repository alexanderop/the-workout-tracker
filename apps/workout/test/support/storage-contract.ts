import { afterEach, describe, expect, it } from "vitest";
import type { Snapshot } from "../../src/features/workouts/domain";
import type {
  LoadState,
  WorkoutStorage,
} from "../../src/features/workouts/ports";
import { createWorkoutFactory } from "./factories";

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
      expect(await storage.read()).toEqual({
        kind: "ready",
        snapshot: initial,
      });
    });

    it("saves a changed snapshot that advances the revision by one", async () => {
      const { storage, changed } = setup();
      const next = changed(1);
      expect(await storage.compareAndSave(0, next)).toEqual({
        kind: "saved",
        snapshot: next,
      });
      expect(await storage.read()).toEqual({ kind: "ready", snapshot: next });
    });

    it("returns a conflict with the current snapshot for a stale revision", async () => {
      const { storage, changed } = setup();
      const next = changed(1);
      await storage.compareAndSave(0, next);
      expect(await storage.compareAndSave(0, changed(1))).toEqual({
        kind: "conflict",
        snapshot: next,
      });
      expect(await storage.read()).toEqual({ kind: "ready", snapshot: next });
    });

    it("rejects a revision jump without writing", async () => {
      const { storage, initial, changed } = setup();
      expect((await storage.compareAndSave(0, changed(2))).kind).toBe(
        "invalid",
      );
      expect(await storage.read()).toEqual({
        kind: "ready",
        snapshot: initial,
      });
    });

    it("treats an identical snapshot at the same revision as a no-op", async () => {
      const { storage, initial } = setup();
      expect(await storage.compareAndSave(0, { ...initial })).toEqual({
        kind: "saved",
        snapshot: initial,
      });
      expect(await storage.read()).toEqual({
        kind: "ready",
        snapshot: initial,
      });
    });

    it("rejects changed content that keeps the same revision", async () => {
      const { storage, initial, changed } = setup();
      expect((await storage.compareAndSave(0, changed(0))).kind).toBe(
        "invalid",
      );
      expect(await storage.read()).toEqual({
        kind: "ready",
        snapshot: initial,
      });
    });

    it("rejects invalid snapshots and revisions", async () => {
      const { storage, initial } = setup();
      const broken = { ...initial, revision: -1 };
      expect((await storage.compareAndSave(0, broken)).kind).toBe("invalid");
      expect((await storage.compareAndSave(-1, initial)).kind).toBe("invalid");
      expect(await storage.read()).toEqual({
        kind: "ready",
        snapshot: initial,
      });
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
      expect((await storage.read()).kind).toBe("unavailable");
      expect((await storage.compareAndSave(0, changed(1))).kind).toBe(
        "unavailable",
      );
      const states: LoadState[] = [];
      storage.subscribe((state) => states.push(state));
      expect(states.map((state) => state.kind)).toEqual(["unavailable"]);
    });
  });
}
