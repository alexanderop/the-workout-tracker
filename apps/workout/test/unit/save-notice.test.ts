import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { createWorkouts } from "../../src/features/workouts/application";
import { useWorkouts } from "../../src/features/workouts/ui/useWorkouts";
import { t } from "../../src/i18n/testing";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import {
  createMemoryJournal,
  createMemoryStorage,
} from "../support/memory-ports";

describe("save notice", () => {
  it("shows either a save confirmation or an error, never both", async () => {
    const factory = createWorkoutFactory("notice");
    const memory = createMemoryStorage(factory.snapshot());
    const app = createWorkouts({
      storage: memory.storage,
      journal: createMemoryJournal(factory.id).journal,
      id: factory.id,
      now: () => FIXED_NOW,
    });
    const scope = effectScope();
    try {
      const workouts = scope.run(() => useWorkouts(app, t))!;
      await Promise.resolve();
      const saved = await workouts.run({
        type: "settings",
        settings: { restSeconds: 30, autoRest: false },
      });
      expect(saved).not.toBeNull();
      expect(workouts.message.value).toBe(t("errors.failures.savedOnDevice"));
      await workouts.run(
        { type: "settings", settings: { restSeconds: 60, autoRest: false } },
        0,
      );
      expect(workouts.notice.value).toMatchObject({ kind: "failed", reload: true });
      expect(workouts.message.value).toBe("");
      workouts.clearError();
      expect(workouts.notice.value).toEqual({ kind: "none" });
      workouts.fail("Local guidance");
      expect(workouts.notice.value).toMatchObject({ kind: "failed", reload: false });
    } finally {
      scope.stop();
    }
  });
});
