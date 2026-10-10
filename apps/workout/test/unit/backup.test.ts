import { describe, expect, it } from "vitest";
import {
  backupLimits,
  mergeSnapshots,
  parseBackup,
  serializeBackup,
} from "../../src/features/workouts/domain/backup";
import { createWorkoutFactory } from "../support/factories";
import { errorTag, failure, success } from "../support/results";

describe("backup files", () => {
  it("round-trips a snapshot through its JSON text", () => {
    const snapshot = createWorkoutFactory("round-trip").snapshot({ revision: 3 });
    expect(success(parseBackup(serializeBackup(snapshot)))).toEqual(snapshot);
  });

  it("names why a file is not a backup", () => {
    const snapshot = createWorkoutFactory("invalid").snapshot();
    expect(errorTag(parseBackup("x".repeat(backupLimits.characters + 1)))).toBe(
      "BackupTooLarge",
    );
    expect(errorTag(parseBackup("{ not json"))).toBe("BackupUnreadable");
    expect(errorTag(parseBackup(JSON.stringify({ format: "other" })))).toBe(
      "InvalidBackup",
    );
    expect(
      errorTag(
        parseBackup(
          JSON.stringify({ format: "form-workout", version: 1, snapshot }),
        ),
      ),
    ).toBe("InvalidBackup");
  });
});

describe("backup merging", () => {
  it("keeps the local snapshot and revision when nothing is new", () => {
    const factory = createWorkoutFactory("same");
    const local = factory.snapshot({
      completed: { c: factory.completedSession({ id: "c" }) },
    });
    expect(success(mergeSnapshots(local, local))).toBe(local);
  });

  it("restores a backup into a pristine journal and advances its revision", () => {
    const factory = createWorkoutFactory("pristine");
    const completed = factory.completedSession();
    const local = factory.snapshot();
    const merged = success(
      mergeSnapshots(
        local,
        factory.snapshot({ completed: { [completed.id]: completed } }),
      ),
    );
    expect(merged).toMatchObject({
      revision: local.revision + 1,
      completed: { [completed.id]: completed },
      settings: local.settings,
    });
  });

  it("refuses a second, different active workout", () => {
    const factory = createWorkoutFactory("active");
    const kept = factory.completedSession();
    const local = factory.snapshot({
      completed: { [kept.id]: kept },
      active: factory.activeSession(),
    });
    const incoming = factory.snapshot({
      completed: { [kept.id]: kept },
      active: factory.activeSession(),
    });
    expect(errorTag(mergeSnapshots(local, incoming))).toBe(
      "ActiveWorkoutInProgress",
    );
  });

  it("refuses a backup that already finished the local active workout", () => {
    const factory = createWorkoutFactory("finished");
    const active = factory.activeSession();
    const local = factory.snapshot({ active });
    const incoming = factory.snapshot({
      completed: { [active.id]: factory.completedSession({ id: active.id }) },
    });
    expect(failure(mergeSnapshots(local, incoming))._tag).toBe(
      "ActiveWorkoutFinished",
    );
  });

  it("names the first record whose content differs", () => {
    const factory = createWorkoutFactory("record");
    const existing = factory.completedSession();
    const local = factory.snapshot({ completed: { [existing.id]: existing } });
    const incoming = factory.snapshot({
      completed: { [existing.id]: { ...existing, name: "Edited elsewhere" } },
    });
    expect(failure(mergeSnapshots(local, incoming))).toMatchObject({
      _tag: "ConflictingRecord",
      recordId: existing.id,
    });
  });
});
