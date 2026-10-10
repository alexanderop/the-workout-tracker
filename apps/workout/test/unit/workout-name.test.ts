import { computed, effectScope, ref, shallowRef } from "vue";
import { describe, expect, it } from "vitest";
import type { Snapshot } from "../../src/features/workouts/domain";
import { createWorkouts } from "../../src/features/workouts/application";
import { useWorkouts } from "../../src/features/workouts/ui/useWorkouts";
import { useWorkoutName } from "../../src/features/workouts/ui/useWorkoutName";
import { t } from "../../src/i18n/testing";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";
import {
  createMemoryJournal,
  createMemoryStorage,
} from "../support/memory-ports";

function setup() {
  const factory = createWorkoutFactory("name");
  const active = factory.activeSession({
    exercises: [
      factory.sessionExercise({ sets: [factory.set({ completed: true })] }),
    ],
  });
  const memory = createMemoryStorage(factory.snapshot({ active }));
  const app = createWorkouts({
    storage: memory.storage,
    journal: createMemoryJournal(factory.id).journal,
    id: factory.id,
    now: () => FIXED_NOW,
  });
  const scope = effectScope();
  const editor = scope.run(() => {
    const workouts = useWorkouts(app, t);
    return useWorkoutName({
      ...workouts,
      active: computed(() => workouts.snapshot.value?.active ?? null),
      t,
    });
  })!;
  return { editor, app, memory, active, scope };
}

function noPendingSave(): never {
  throw new Error("No pending save");
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
  it("keeps a reverted local name dirty when the saved name changed", async () => {
    const { editor, app, memory, active, scope } = setup();
    try {
      editor.text.value = "Local name";
      await app.execute(
        { type: "rename", sessionId: active.id, name: "Remote name" },
        0,
      );
      editor.text.value = "Morning workout";
      expect(editor.dirty.value).toBe(true);
      expect(editor.conflict.value).toBe(true);
      await app.execute(
        { type: "settings", settings: { restSeconds: 30, autoRest: false } },
        1,
      );
      expect(editor.text.value).toBe("Morning workout");
      expect(editor.conflict.value).toBe(true);
      await editor.keepMine();
      expect(memory.current().active?.name).toBe("Morning workout");
      expect(editor.dirty.value).toBe(false);
    } finally {
      scope.stop();
    }
  });
  it("adopts remote names when there is no local edit", async () => {
    const { editor, app, active, scope } = setup();
    try {
      await app.execute(
        { type: "rename", sessionId: active.id, name: "Remote name" },
        0,
      );
      expect(editor.text.value).toBe("Remote name");
      expect(editor.dirty.value).toBe(false);
    } finally {
      scope.stop();
    }
  });
  it("starts a new baseline after typing the current saved name", async () => {
    const { editor, app, memory, active, scope } = setup();
    try {
      editor.text.value = "Local name";
      await app.execute(
        { type: "rename", sessionId: active.id, name: "Remote name" },
        0,
      );
      editor.text.value = "Remote name";
      expect(editor.dirty.value).toBe(false);
      editor.text.value = "Next local name";
      expect(editor.conflict.value).toBe(false);
      await editor.save();
      expect(memory.current().active?.name).toBe("Next local name");
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

describe("detached workout names", () => {
  it("preserves remote-finished input and applies it only to the original workout", async () => {
    const { editor, app, memory, active, scope } = setup();
    try {
      editor.text.value = "My unsaved name";
      await app.execute({ type: "finish", sessionId: active.id }, 0);
      expect(editor.recoveries.value).toMatchObject([
        { sessionId: active.id, text: "My unsaved name", state: "ready" },
      ]);
      await app.execute({ type: "repeat", completedId: active.id }, 1);
      expect(editor.text.value).toBe("Morning workout");
      expect(editor.dirty.value).toBe(false);
      await editor.resolveRecovery(active.id, "save");
      expect(memory.current().completed[active.id]?.name).toBe(
        "My unsaved name",
      );
      expect(memory.current().active?.name).toBe("Morning workout");
      expect(editor.recoveries.value).toEqual([]);
    } finally {
      scope.stop();
    }
  });
  it("requires explicit conflict resolution after the completed name changes", async () => {
    const { editor, app, memory, active, scope } = setup();
    try {
      editor.text.value = "Local name";
      await app.execute(
        { type: "rename", sessionId: active.id, name: "Remote name" },
        0,
      );
      await app.execute({ type: "finish", sessionId: active.id }, 1);
      expect(editor.recoveries.value).toMatchObject([
        { text: "Local name", state: "conflict", savedName: "Remote name" },
      ]);
      await editor.resolveRecovery(active.id, "save");
      expect(memory.current().completed[active.id]?.name).toBe("Remote name");
      await editor.resolveRecovery(active.id, "keep-mine");
      expect(memory.current().completed[active.id]?.name).toBe("Local name");
    } finally {
      scope.stop();
    }
  });
  it("keeps text for a missing workout until explicitly discarded", async () => {
    const { editor, app, active, scope } = setup();
    try {
      editor.text.value = "Keep this text";
      await app.execute({ type: "discard", sessionId: active.id }, 0);
      expect(editor.recoveries.value).toMatchObject([
        { text: "Keep this text", state: "missing" },
      ]);
      await editor.resolveRecovery(active.id, "save");
      expect(editor.recoveries.value).toMatchObject([
        { text: "Keep this text", state: "missing" },
      ]);
      await editor.resolveRecovery(active.id, "discard");
      expect(editor.recoveries.value).toEqual([]);
    } finally {
      scope.stop();
    }
  });
});

describe("racing workout-name saves", () => {
  it("does not acknowledge a newer recovery when an older save completes", async () => {
    const factory = createWorkoutFactory("deferred-name");
    const active = factory.activeSession();
    const completed = factory.completedSession({
      id: active.id,
      name: active.name,
    });
    const snapshot = shallowRef<Snapshot>(factory.snapshot({ active }));
    let release: (saved: Snapshot) => void = noPendingSave;
    const scope = effectScope();
    const editor = scope.run(() =>
      useWorkoutName({
        snapshot: computed(() => snapshot.value),
        active: computed(() => snapshot.value.active),
        saving: ref(false),
        t,
        run: () =>
          new Promise<Snapshot>((resolve) => {
            release = resolve;
          }),
      }),
    )!;
    try {
      editor.text.value = "First recovery";
      snapshot.value = factory.snapshot({
        revision: 1,
        completed: { [active.id]: completed },
      });
      const pending = editor.resolveRecovery(active.id, "save");
      snapshot.value = factory.snapshot({ revision: 2, active });
      editor.text.value = "Newer recovery";
      snapshot.value = factory.snapshot({
        revision: 3,
        completed: { [active.id]: completed },
      });
      release(
        factory.snapshot({
          revision: 4,
          completed: { [active.id]: { ...completed, name: "First recovery" } },
        }),
      );
      await pending;
      expect(editor.recoveries.value).toMatchObject([
        { sessionId: active.id, text: "Newer recovery", state: "ready" },
      ]);
    } finally {
      scope.stop();
    }
  });

  it("does not offer recovery for a name that already reached the finished workout", async () => {
    const factory = createWorkoutFactory("phantom-name");
    const active = factory.activeSession();
    const snapshot = shallowRef<Snapshot>(factory.snapshot({ active }));
    let release: (saved: Snapshot | null) => void = noPendingSave;
    const scope = effectScope();
    const editor = scope.run(() =>
      useWorkoutName({
        snapshot: computed(() => snapshot.value),
        active: computed(() => snapshot.value.active),
        saving: ref(false),
        t,
        run: () =>
          new Promise<Snapshot | null>((resolve) => {
            release = resolve;
          }),
      }),
    )!;
    try {
      editor.text.value = "Renamed";
      const pending = editor.save();
      snapshot.value = factory.snapshot({
        revision: 2,
        completed: {
          [active.id]: factory.completedSession({
            id: active.id,
            name: "Renamed",
          }),
        },
      });
      release(null);
      await pending;
      expect(editor.recoveries.value).toEqual([]);
      expect(editor.issue.value).toBe("");
    } finally {
      scope.stop();
    }
  });
});
