import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { createWorkouts } from "../../src/features/workouts/application";
import {
  SAVED_MESSAGE_MS,
  useWorkouts,
} from "../../src/features/workouts/ui/useWorkouts";
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
      expect(workouts.notice.value).toMatchObject({
        kind: "failed",
        reload: true,
      });
      expect(workouts.message.value).toBe("");
      workouts.clearError();
      expect(workouts.notice.value).toEqual({ kind: "none" });
      workouts.fail("Local guidance");
      expect(workouts.notice.value).toMatchObject({
        kind: "failed",
        reload: false,
      });
    } finally {
      scope.stop();
    }
  });
});

/** A scheduler the test advances by hand. */
function manualClock() {
  let pending: { run: () => void; due: number; id: number }[] = [];
  let now = 0;
  let next = 0;
  return {
    after: (run: () => void, ms: number) => {
      const id = next++;
      pending.push({ run, due: now + ms, id });
      return () => {
        pending = pending.filter((entry) => entry.id !== id);
      };
    },
    advance(ms: number) {
      now += ms;
      const due = pending.filter((entry) => entry.due <= now);
      pending = pending.filter((entry) => entry.due > now);
      for (const entry of due) entry.run();
    },
    get pending() {
      return pending.length;
    },
  };
}

function mountWithClock() {
  const factory = createWorkoutFactory("lifetime");
  const memory = createMemoryStorage(factory.snapshot());
  const app = createWorkouts({
    storage: memory.storage,
    journal: createMemoryJournal(factory.id).journal,
    id: factory.id,
    now: () => FIXED_NOW,
  });
  const clock = manualClock();
  const scope = effectScope();
  return {
    clock,
    scope,
    workouts: scope.run(() => useWorkouts(app, t, clock.after))!,
  };
}

describe("save confirmation lifetime", () => {
  it("clears itself after its lifetime", () => {
    const { clock, scope, workouts } = mountWithClock();
    workouts.notify("Saved");
    clock.advance(SAVED_MESSAGE_MS - 1);
    expect(workouts.message.value).toBe("Saved");
    clock.advance(1);
    expect(workouts.message.value).toBe("");
    scope.stop();
  });

  it("restarts the lifetime when a newer confirmation replaces it", () => {
    const { clock, scope, workouts } = mountWithClock();
    workouts.notify("First");
    clock.advance(SAVED_MESSAGE_MS - 1);
    workouts.notify("Second");
    clock.advance(SAVED_MESSAGE_MS - 1);
    expect(workouts.message.value).toBe("Second");
    scope.stop();
  });

  it("does not clear an error that replaced the confirmation", () => {
    const { clock, scope, workouts } = mountWithClock();
    workouts.notify("Saved");
    workouts.fail("Failed");
    clock.advance(SAVED_MESSAGE_MS);
    expect(workouts.error.value).toBe("Failed");
    scope.stop();
  });

  it("ends on a route change unless it names the page being entered", () => {
    const { scope, workouts } = mountWithClock();
    workouts.notify("Saved on this device");
    workouts.enterPage("progress");
    expect(workouts.message.value).toBe("");
    workouts.notify("Workout saved", "workouts");
    workouts.enterPage("workouts");
    expect(workouts.message.value).toBe("Workout saved");
    workouts.enterPage("progress");
    expect(workouts.message.value).toBe("");
    scope.stop();
  });

  it("stops its timer with the scope", () => {
    const { clock, scope, workouts } = mountWithClock();
    workouts.notify("Saved");
    expect(clock.pending).toBe(1);
    scope.stop();
    expect(clock.pending).toBe(0);
  });
});
