import { describe, expect, it } from "vitest";
import { initialSnapshot } from "../../src/features/workouts";
import type { WorkoutStorage } from "../../src/features/workouts/ports";

export type StorageFixture = {
  readonly open: () => WorkoutStorage;
  readonly replaceRaw: (raw: unknown) => void | Promise<void>;
  readonly dispose: () => void | Promise<void>;
};

export function storageContract(name: string, create: () => StorageFixture) {
  describe(`${name} storage contract`, () => {
    const run = async (
      scenario: (fixture: StorageFixture) => Promise<void>,
    ) => {
      const fixture = create();
      try {
        await scenario(fixture);
      } finally {
        await fixture.dispose();
      }
    };
    it("initializes without overwriting data and restores after reopening", () =>
      run(async ({ open }) => {
        const first = open();
        expect(await first.read()).toEqual({
          kind: "ready",
          snapshot: initialSnapshot(),
        });
        const next = {
          ...initialSnapshot(),
          revision: 1,
          settings: { restSeconds: 120, autoRest: false },
        };
        expect(await first.compareAndSave(0, next)).toEqual({
          kind: "saved",
          snapshot: next,
        });
        first.close();
        expect(await open().read()).toEqual({ kind: "ready", snapshot: next });
      }));
    it("allows exactly one concurrent writer and rejects a stale no-op", () =>
      run(async ({ open }) => {
        const a = open();
        const b = open();
        await Promise.all([a.read(), b.read()]);
        const next = { ...initialSnapshot(), revision: 1 };
        const results = await Promise.all([
          a.compareAndSave(0, next),
          b.compareAndSave(0, next),
        ]);
        expect(results.map((result) => result.kind).sort()).toEqual([
          "conflict",
          "saved",
        ]);
        expect(await a.compareAndSave(0, initialSnapshot())).toEqual({
          kind: "conflict",
          snapshot: next,
        });
        expect(await b.read()).toEqual({ kind: "ready", snapshot: next });
      }));
    it("accepts exact no-ops but rejects hidden changes and revision jumps", () =>
      run(async ({ open }) => {
        const storage = open();
        expect((await storage.compareAndSave(0, initialSnapshot())).kind).toBe(
          "saved",
        );
        const changed = {
          ...initialSnapshot(),
          settings: { restSeconds: 200, autoRest: false },
        };
        expect((await storage.compareAndSave(0, changed)).kind).toBe("invalid");
        expect(
          (await storage.compareAndSave(0, { ...changed, revision: 2 })).kind,
        ).toBe("invalid");
        expect((await storage.compareAndSave(-1, changed)).kind).toBe(
          "invalid",
        );
        expect(await storage.read()).toEqual({
          kind: "ready",
          snapshot: initialSnapshot(),
        });
      }));
    it("rejects invalid candidates without changing saved data", () =>
      run(async ({ open }) => {
        const storage = open();
        const invalid = {
          ...initialSnapshot(),
          revision: 1,
          settings: { restSeconds: -1, autoRest: true },
        };
        expect((await storage.compareAndSave(0, invalid)).kind).toBe("invalid");
        expect(await storage.read()).toEqual({
          kind: "ready",
          snapshot: initialSnapshot(),
        });
      }));
    it("preserves corrupt data for recovery and refuses to overwrite it", () =>
      run(async ({ open, replaceRaw }) => {
        await open().read();
        const raw = { valuable: "legacy data" };
        await replaceRaw(raw);
        const storage = open();
        const current = await storage.read();
        expect(current.kind).toBe("recovery");
        if (current.kind !== "recovery") throw new Error("Expected recovery");
        expect(JSON.parse(current.rawExport).raw).toEqual(raw);
        expect(
          (
            await storage.compareAndSave(0, {
              ...initialSnapshot(),
              revision: 1,
            })
          ).kind,
        ).toBe("invalid");
        expect(await storage.read()).toEqual(current);
      }));
    it("does not let callers mutate stored snapshots", () =>
      run(async ({ open }) => {
        const storage = open();
        const candidate = {
          ...initialSnapshot(),
          revision: 1,
          settings: { restSeconds: 120, autoRest: false },
        };
        await storage.compareAndSave(0, candidate);
        candidate.settings.restSeconds = 200;
        const current = await storage.read();
        expect(current.kind).toBe("ready");
        if (current.kind !== "ready") throw new Error("Expected snapshot");
        expect(current.snapshot.settings.restSeconds).toBe(120);
      }));
    it("notifies other handles and resumes observation with current data", () =>
      run(async ({ open }) => {
        const a = open();
        const b = open();
        await Promise.all([a.read(), b.read()]);
        const revisions: number[] = [];
        const stop = a.subscribe((state) => {
          if (state.kind === "ready") revisions.push(state.snapshot.revision);
        });
        await b.compareAndSave(0, { ...initialSnapshot(), revision: 1 });
        await expect.poll(() => revisions).toContain(1);
        stop();
        await b.compareAndSave(1, { ...initialSnapshot(), revision: 2 });
        const resumed: number[] = [];
        const stopAgain = a.subscribe((state) => {
          if (state.kind === "ready") resumed.push(state.snapshot.revision);
        });
        await expect.poll(() => resumed).toContain(2);
        expect(revisions).not.toContain(2);
        stopAgain();
      }));
    it("closed handles reject writes and reads without closing other handles", () =>
      run(async ({ open }) => {
        const a = open();
        const b = open();
        await a.read();
        a.close();
        a.close();
        expect((await a.read()).kind).toBe("unavailable");
        expect(
          (await a.compareAndSave(0, { ...initialSnapshot(), revision: 1 }))
            .kind,
        ).toBe("unavailable");
        expect(await b.read()).toEqual({
          kind: "ready",
          snapshot: initialSnapshot(),
        });
        const states: string[] = [];
        a.subscribe((state) => states.push(state.kind));
        expect(states).toEqual(["unavailable"]);
      }));
  });
}
