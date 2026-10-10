import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { createWorkouts } from "../../src/features/workouts/application";
import { useWorkouts } from "../../src/features/workouts/ui/useWorkouts";
import { useCompletedWorkoutEditor } from "../../src/features/workouts/ui/useCompletedWorkoutEditor";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import { errorTag } from "../support/results";
import {
  createMemoryJournal,
  createMemoryStorage,
} from "../support/memory-ports";

function setup() {
  const factory = createWorkoutFactory("editor");
  const completed = factory.completedSession();
  const active = factory.activeSession();
  const memory = createMemoryStorage(
    factory.snapshot({ active, completed: { [completed.id]: completed } }),
  );
  const service = createWorkouts({
    storage: memory.storage,
    journal: createMemoryJournal(factory.id).journal,
    now: () => FIXED_NOW,
    id: factory.id,
  });
  const scope = effectScope();
  const editor = scope.run(() =>
    useCompletedWorkoutEditor(completed, useWorkouts(service)),
  )!;
  return { editor, service, scope, memory, completed, active };
}
describe("completed editor", () => {
  it("saves the name and logged values together while an active workout survives", async () => {
    const { editor, scope, memory, completed, active } = setup();
    try {
      editor.draft.value.name = "Corrected";
      editor.draft.value.sets[0]!.weightKg = "62.5";
      expect(editor.dirty.value).toBe(true);
      expect(await editor.save()).toBe(true);
      expect(memory.current().completed[completed.id]).toMatchObject({
        name: "Corrected",
        exercises: [{ sets: [{ weightKg: 62.5 }] }],
      });
      expect(memory.current().active).toEqual(active);
      expect(editor.dirty.value).toBe(false);
    } finally {
      scope.stop();
    }
  });
  it("retains invalid raw input and saves no partial change", async () => {
    const { editor, scope, memory } = setup();
    try {
      editor.draft.value.name = "Local name";
      editor.draft.value.sets[0]!.reps = "";
      expect(await editor.save()).toBe(false);
      expect(editor.draft.value).toMatchObject({
        name: "Local name",
        sets: [{ reps: "" }],
      });
      expect(editor.localError.value).toContain("whole reps");
      expect(memory.current().revision).toBe(0);
    } finally {
      scope.stop();
    }
  });
  it("does not overwrite or retry a draft after unrelated active data changes", async () => {
    const { editor, scope, service, memory, active } = setup();
    try {
      editor.draft.value.name = "Local name";
      await service.execute(
        { type: "rename", sessionId: active.id, name: "Active changed" },
        0,
      );
      expect(editor.state.value).toBe("conflict");
      expect(await editor.save()).toBe(false);
      expect(await editor.save()).toBe(false);
      expect(editor.draft.value.name).toBe("Local name");
      expect(memory.current().revision).toBe(1);
      editor.reload();
      expect(editor.draft.value.name).toBe("Previous workout");
      expect(editor.dirty.value).toBe(false);
      editor.draft.value.name = "Reviewed correction";
      expect(await editor.save()).toBe(true);
      expect(memory.current().active?.name).toBe("Active changed");
    } finally {
      scope.stop();
    }
  });
  it("keeps input after storage failure", async () => {
    const { editor, scope, service } = setup();
    try {
      editor.draft.value.name = "Keep me";
      service.close();
      expect(await editor.save()).toBe(false);
      expect(editor.draft.value.name).toBe("Keep me");
      expect(editor.dirty.value).toBe(true);
      expect(editor.localError.value).toContain("closed");
    } finally {
      scope.stop();
    }
  });
  it("retains deleted-target input and cannot recreate it", async () => {
    const { editor, scope, service, memory } = setup();
    try {
      editor.draft.value.name = "Copy me";
      await service.deleteAllData(0);
      expect(editor.state.value).toBe("missing");
      editor.reload();
      expect(editor.draft.value.name).toBe("Copy me");
      expect(await editor.save()).toBe(false);
      expect(memory.current().completed).toEqual({});
    } finally {
      scope.stop();
    }
  });
  it("application rejects a stale correction without changing the saved record", async () => {
    const { scope, service, memory, completed, active } = setup();
    try {
      await service.execute(
        { type: "rename", sessionId: active.id, name: "New active name" },
        0,
      );
      const result = await service.execute(
        {
          type: "correct-completed",
          sessionId: completed.id,
          name: "Stale",
          sets: [],
        },
        0,
      );
      expect(errorTag(result)).toBe("Conflict");
      expect(memory.current().completed[completed.id]).toEqual(completed);
      expect(memory.current().active?.name).toBe("New active name");
    } finally {
      scope.stop();
    }
  });
});
