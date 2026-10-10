import { describe, expect, it } from "vitest";
import {
  initialSnapshot,
  snapshotSchema,
  type DraftInput,
} from "../../src/features/workouts";
import {
  createMemoryStorage,
  createMemoryDraftJournal,
} from "../../src/preview/memoryPorts";
import { scenarios, parseScenarioId } from "../../src/preview/scenarios";
import catalog from "../../src/preview/catalog.json";
import { errorTag } from "../support/results";

describe("design examples", () => {
  it("publishes only runnable examples with valid independent snapshots", () => {
    expect(catalog.map((entry) => entry.id).sort()).toEqual(
      Object.keys(scenarios).sort(),
    );
    for (const entry of catalog) {
      const scenario = scenarios[parseScenarioId(entry.id)];
      expect(snapshotSchema.safeParse(scenario.seed()).success).toBe(true);
      expect(scenario.seed()).not.toBe(scenario.seed());
    }
    expect(() => parseScenarioId("__proto__")).toThrow(
      "Unknown design example",
    );
    expect(parseScenarioId(null)).toBe("workouts.first-visit");
    expect(() => parseScenarioId("missing-example")).toThrow("Unknown design example");
  });

  it("enforces revisions, idempotence, subscriptions and closed storage", async () => {
    const seed = initialSnapshot();
    const storage = createMemoryStorage(seed);
    const other = createMemoryStorage(seed);
    const states: string[] = [];
    storage.subscribe((state) => states.push(state.kind));
    expect((await storage.compareAndSave(0, seed)).isOk()).toBe(true);
    expect(states).toEqual(["ready"]);
    expect(
      errorTag(
        await storage.compareAndSave(0, {
          ...seed,
          settings: { autoRest: false, restSeconds: 30 },
        }),
      ),
    ).toBe("InvalidChange");
    expect(errorTag(await storage.compareAndSave(-1, seed))).toBe(
      "InvalidRevision",
    );
    const changed = {
      ...seed,
      revision: 1,
      settings: { autoRest: false, restSeconds: 30 },
    };
    expect((await storage.compareAndSave(0, changed)).isOk()).toBe(true);
    expect(states).toEqual(["ready", "ready"]);
    expect(errorTag(await storage.compareAndSave(0, seed))).toBe("Conflict");
    expect(
      errorTag(await storage.compareAndSave(1, { ...changed, revision: 3 })),
    ).toBe("InvalidChange");
    expect(await other.read()).toMatchObject({
      status: "ok",
      value: { revision: 0 },
    });
    storage.close();
    expect(errorTag(await storage.read())).toBe("StorageClosed");
    expect(
      errorTag(await storage.compareAndSave(1, { ...changed, revision: 2 })),
    ).toBe("StorageClosed");
  });

  it("keeps later drafts when acknowledging an earlier edit and rejects deleted revisions", () => {
    let sequence = 0;
    const journal = createMemoryDraftJournal(() => `draft-${++sequence}`);
    const input: DraftInput = {
      sessionId: "session",
      setId: "set",
      weight: "60",
      reps: "8",
      revision: 0,
      base: { weightKg: 60, reps: 8, completed: false },
    };
    const first = journal.write(input);
    const second = journal.write({ ...input, weight: "65" });
    journal.consume([first]);
    expect(journal.recover("session", "set")).toEqual([second]);
    second.base.weightKg = 999;
    expect(journal.recover("session", "set")[0]?.base.weightKg).toBe(60);
    journal.clearBefore(1);
    expect(journal.recover("session", "set")).toEqual([]);
    expect(() => journal.write(input)).toThrow("deleted");
    journal.write({ ...input, revision: 2 });
    journal.prune({ ...initialSnapshot(), revision: 1 });
    expect(journal.recover("session", "set")).toHaveLength(1);
    journal.prune({ ...initialSnapshot(), revision: 3 });
    expect(journal.recover("session", "set")).toEqual([]);
  });
});
