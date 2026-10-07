import { afterEach, describe, expect, it } from "vitest";
import { effectScope, ref, type EffectScope } from "vue";
import { createWorkouts } from "../../src/features/workouts/application";
import type { SetDraft } from "../../src/features/workouts/domain/drafts";
import type { DraftJournal } from "../../src/features/workouts/ports";
import { useWorkoutWorkspace } from "../../src/features/workouts/ui/useWorkoutWorkspace";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import { createMemoryJournal, createMemoryStorage } from "../support/memory-ports";

const scopes: EffectScope[] = [];
afterEach(() => {
  for (const scope of scopes.splice(0)) scope.stop();
});

function setup() {
  const factory = createWorkoutFactory("acknowledgement");
  const set = factory.set();
  const active = factory.activeSession({ exercises: [factory.sessionExercise({ sets: [set] })] });
  const storage = createMemoryStorage(factory.snapshot({ active }));
  const writers = [createMemoryJournal(factory.id), createMemoryJournal(factory.id)];
  const journal: DraftJournal = {
    write: writers[0]!.journal.write,
    recover: (sessionId, setId) => writers.flatMap(({ journal }) => journal.recover(sessionId, setId)),
    consume: (records) => writers.forEach(({ journal }) => journal.consume(records)),
    prune: (snapshot) => writers.forEach(({ journal }) => journal.prune(snapshot)),
    clearBefore: (revision) => writers.forEach(({ journal }) => journal.clearBefore(revision)),
  };
  let pendingWrite: Promise<void> | undefined;
  const service = createWorkouts({
    storage: {
      ...storage.storage,
      async compareAndSave(revision, snapshot) {
        await pendingWrite;
        return storage.storage.compareAndSave(revision, snapshot);
      },
    },
    journal,
    now: () => FIXED_NOW,
    id: factory.id,
  });
  const scope = effectScope();
  scopes.push(scope);
  const workspace = scope.run(() => useWorkoutWorkspace(service, journal, ref(FIXED_NOW)))!;
  return {
    workspace,
    storage,
    active,
    set,
    journal,
    writeElsewhere: (weight: string): SetDraft => {
      return writers[1]!.journal.write({ sessionId: active.id, setId: set.id, weight, reps: "8", revision: 0, base: set });
    },
    holdWrite: () => {
      const deferred = Promise.withResolvers<void>();
      pendingWrite = deferred.promise;
      return deferred.resolve;
    },
  };
}

describe("set draft acknowledgement", () => {
  it("requires review before logging when another writer has unobserved input", async () => {
    const { workspace, storage, set, active, journal, writeElsewhere } = setup();
    workspace.training.edit(set.id, { weight: "60" });
    writeElsewhere("70");

    await workspace.training.commit(set.id);

    expect(journal.recover(active.id, set.id).map((record) => record.weight)).toEqual(["60", "70"]);
    expect(storage.current().active?.exercises[0]?.sets[0]).toMatchObject({ weightKg: 40, completed: false });
    expect(workspace.training.pending.value[0]?.alternatives.map((record) => record.weight)).toEqual(["60", "70"]);

    workspace.training.keepInput(set.id);
    await workspace.training.commit(set.id);
    expect(storage.current().active?.exercises[0]?.sets[0]).toMatchObject({ weightKg: 60, completed: true });
    expect(journal.recover(active.id, set.id)).toEqual([]);
  });

  it("keeps records discovered during a pending save available for recovery", async () => {
    const { workspace, storage, set, active, journal, writeElsewhere, holdWrite } = setup();
    workspace.training.edit(set.id, { weight: "60" });
    const release = holdWrite();
    const saving = workspace.training.commit(set.id);
    writeElsewhere("70");
    expect(await workspace.training.run({ type: "finish", sessionId: active.id })).toBeNull();
    release();
    await saving;

    expect(storage.current().active?.exercises[0]?.sets[0]).toMatchObject({ weightKg: 60, completed: true });
    expect(journal.recover(active.id, set.id).map((record) => record.weight)).toEqual(["70"]);
    expect(await workspace.training.run({ type: "finish", sessionId: active.id })).toBeNull();
    expect(workspace.training.pending.value[0]?.weight).toBe("70");
    expect(workspace.training.pending.value[0]?.recoveredStale).toBe(true);
  });

  it("recovers input arriving during a save without another action discovering it", async () => {
    const { workspace, storage, set, active, journal, writeElsewhere, holdWrite } = setup();
    workspace.training.edit(set.id, { weight: "60" });
    const release = holdWrite();
    const saving = workspace.training.commit(set.id);
    writeElsewhere("70");
    release();
    await saving;

    expect(storage.current().active?.exercises[0]?.sets[0]).toMatchObject({ weightKg: 60, completed: true });
    expect(journal.recover(active.id, set.id).map((record) => record.weight)).toEqual(["70"]);
    expect(workspace.training.pending.value[0]?.weight).toBe("70");
    expect(workspace.training.pending.value[0]?.recoveredStale).toBe(true);
  });
});
