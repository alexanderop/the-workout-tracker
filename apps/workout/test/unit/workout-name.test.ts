import { computed, effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { createWorkouts } from "../../src/features/workouts/application";
import { useWorkouts } from "../../src/features/workouts/ui/useWorkouts";
import { useWorkoutName } from "../../src/features/workouts/ui/useWorkoutName";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import {
  createMemoryJournal,
  createMemoryStorage,
} from "../support/memory-ports";

function setup() {
  const factory = createWorkoutFactory("name");
  const active = factory.activeSession();
  const memory = createMemoryStorage(factory.snapshot({ active }));
  const app = createWorkouts({
    storage: memory.storage,
    journal: createMemoryJournal(factory.id).journal,
    id: factory.id,
    now: () => FIXED_NOW,
  });
  const scope = effectScope();
  const editor = scope.run(() => {
    const workouts = useWorkouts(app);
    return useWorkoutName({
      ...workouts,
      active: computed(() => workouts.snapshot.value?.active ?? null),
    });
  })!;
  return { editor, app, memory, active, scope };
}

describe("workout name editing", () => {
  it("preserves dirty text on a remote rename until an explicit choice", async () => {
    const { editor, app, active, scope } = setup();
    try {
      editor.text.value = "Local name";
      await app.execute(
        { type: "rename", sessionId: active.id, name: "Remote name" },
        0,
      );
      expect(editor.text.value).toBe("Local name");
      expect(editor.conflict.value).toBe(true);
      await editor.save();
      expect(editor.text.value).toBe("Local name");
      editor.useSaved();
      expect(editor.text.value).toBe("Remote name");
      expect(editor.dirty.value).toBe(false);
    } finally {
      scope.stop();
    }
  });
  it("saves after an unrelated revision without inventing a name conflict", async () => {
    const { editor, app, memory, scope } = setup();
    try {
      editor.text.value = "Local name";
      await app.execute(
        { type: "settings", settings: { restSeconds: 30, autoRest: false } },
        0,
      );
      expect(editor.conflict.value).toBe(false);
      await editor.save();
      expect(memory.current().active?.name).toBe("Local name");
      expect(memory.current().revision).toBe(2);
      expect(editor.dirty.value).toBe(false);
    } finally {
      scope.stop();
    }
  });
  it("explicitly keeps a local name against the latest saved revision", async () => {
    const { editor, app, memory, active, scope } = setup();
    try {
      editor.text.value = "Local name";
      await app.execute(
        { type: "rename", sessionId: active.id, name: "Remote name" },
        0,
      );
      await editor.keepMine();
      expect(memory.current().active?.name).toBe("Local name");
      expect(editor.conflict.value).toBe(false);
      expect(editor.dirty.value).toBe(false);
    } finally {
      scope.stop();
    }
  });
  it.each(["Newer name", "Morning workout"])(
    "retains newer typing %s when an earlier save completes",
    async (newerName) => {
      const { editor, memory, scope } = setup();
      try {
        editor.text.value = "First name";
        const saving = editor.save();
        editor.text.value = newerName;
        await saving;
        expect(memory.current().active?.name).toBe("First name");
        expect(editor.text.value).toBe(newerName);
        expect(editor.dirty.value).toBe(true);
        expect(editor.conflict.value).toBe(false);
      } finally {
        scope.stop();
      }
    },
  );
});
