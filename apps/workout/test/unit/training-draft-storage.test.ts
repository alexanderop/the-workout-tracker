import { Result } from "@form/result";
import { afterEach, describe, expect, it } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue";
import { createWorkouts } from "../../src/features/workouts/application";
import {
  DraftStorageFailed,
  type Snapshot,
} from "../../src/features/workouts/domain";
import type { DraftJournal } from "../../src/features/workouts/ports";
import { useTrainingSession } from "../../src/features/workouts/ui/useTrainingSession";
import { t } from "../../src/i18n/testing";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import { success } from "../support/results";
import {
  createMemoryJournal,
  createMemoryStorage,
} from "../support/memory-ports";

const scopes: EffectScope[] = [];
function setup(recoveredWeight?: string) {
  const factory = createWorkoutFactory("draft-storage");
  const set = factory.set();
  const exercise = factory.sessionExercise({ sets: [set] });
  const active = factory.activeSession({ exercises: [exercise] });
  const initial = factory.snapshot({ active });
  const snapshot = ref<Snapshot | null>(initial);
  const saving = ref(false);
  const recovered = recoveredWeight
    ? [
        factory.draft({
          sessionId: active.id,
          setId: set.id,
          weight: recoveredWeight,
          writer: "other-tab",
        }),
      ]
    : [];
  const memory = createMemoryJournal(factory.id, recovered);
  const faults = { consume: false };
  const journal: DraftJournal = {
    ...memory.journal,
    consume(records) {
      if (faults.consume)
        return Result.err(
          new DraftStorageFailed({
            cause: new Error("The quota was exceeded."),
          }),
        );
      return memory.journal.consume(records);
    },
  };
  const storage = createMemoryStorage(initial);
  const service = createWorkouts({
    storage: storage.storage,
    journal,
    now: () => FIXED_NOW,
    id: factory.id,
  });
  const scope = effectScope();
  scopes.push(scope);
  const training = scope.run(() =>
    useTrainingSession({
      snapshot,
      saving,
      journal,
      t,
      async run(command, revision = snapshot.value?.revision ?? 0) {
        const result = await service.execute(command, revision);
        if (result.isErr()) return null;
        snapshot.value = result.value;
        await nextTick();
        return result.value;
      },
    }),
  );
  if (!training) throw new Error("The training controller was not created.");
  const row = () => {
    const current = training.rows.get(set.id);
    if (!current) throw new Error("The set row is missing.");
    return current;
  };
  return {
    factory,
    training,
    snapshot,
    saving,
    memory,
    faults,
    storage,
    active,
    exercise,
    set,
    row,
  };
}

describe("training draft storage", () => {
  afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop();
  });

  /** A training controller over a journal whose consume can be made to fail. */

  describe("given a set with input while another save is running", () => {
    it("should not reset the input to the saved values", () => {
      const { training, saving, memory, set, row } = setup();
      training.edit(set.id, { weight: "55" });
      saving.value = true;
      training.useSaved(set.id);
      expect(row().weight).toBe("55");
      expect(memory.current().map((draft) => draft.weight)).toEqual(["55"]);
    });

    it("should not choose a recovered draft", () => {
      const { training, saving, memory, active, set, row } = setup();
      const other = success(
        memory.journal.write({
          sessionId: active.id,
          setId: set.id,
          weight: "70",
          reps: "8",
          revision: 0,
          base: set,
        }),
      );
      saving.value = true;
      training.chooseDraft(set.id, other);
      expect(row().weight).toBe("40");
      expect(memory.current()).toEqual([other]);
    });
  });

  describe("given another tab wrote input for the last set", () => {
    it("should require review before adding a set", async () => {
      const { training, memory, storage, active, exercise, set } = setup();
      memory.journal.write({
        sessionId: active.id,
        setId: set.id,
        weight: "70",
        reps: "8",
        revision: 0,
        base: set,
      });
      await training.addSet(exercise.id);
      expect(storage.current().active?.exercises[0]?.sets).toHaveLength(1);
      expect(training.pending.value.map((pending) => pending.set.id)).toEqual([
        set.id,
      ]);
    });
  });

  describe("given the journal refuses a draft", () => {
    it("should ask for a reload when the workout data was deleted", () => {
      const { training, memory, set, row } = setup();
      memory.journal.clearBefore(5);
      training.edit(set.id, { weight: "55" });
      expect(row().storageIssue).toBe(
        "This workout's data was deleted in another tab. Reload before editing.",
      );
    });

    it("should report an older draft it could not clear without claiming the new one was lost", () => {
      const { training, memory, faults, set, row } = setup("55");
      expect(row().weight).toBe("55");
      faults.consume = true;
      training.edit(set.id, { weight: "60" });
      expect(row().storageIssue).toBe(
        "Draft saved, but older input could not be cleared on this device.",
      );
      expect(memory.current().map((draft) => draft.weight)).toEqual([
        "55",
        "60",
      ]);
      expect(row().weight).toBe("60");
      faults.consume = false;
      training.useSaved(set.id);
      expect(memory.current()).toEqual([]);
    });
  });

  describe("given a set with drafts is removed elsewhere", () => {
    // Revision 0 keeps the journal from pruning the draft, isolating acknowledgement.
    it("should report drafts it could not clear and retry on the next snapshot", async () => {
      const { factory, training, snapshot, memory, faults, active, set } =
        setup();
      training.edit(set.id, { weight: "55" });
      faults.consume = true;
      const other = factory.sessionExercise();
      snapshot.value = factory.snapshot({
        active: { ...active, exercises: [other] },
      });
      await nextTick();
      expect(training.rows.has(set.id)).toBe(false);
      expect(training.notice.value).toBe(
        "Saved, but input drafts of a removed set could not be cleared on this device. They are retried automatically.",
      );
      expect(memory.current().map((draft) => draft.weight)).toEqual(["55"]);
      faults.consume = false;
      snapshot.value = factory.snapshot({
        active: { ...active, exercises: [other], name: "Renamed" },
      });
      await nextTick();
      expect(memory.current()).toEqual([]);
    });
  });
});
