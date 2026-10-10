import { describe, expect, it } from "vitest";
import {
  ActiveWorkoutFinished,
  ActiveWorkoutInProgress,
  BackupTooLarge,
  BackupUnreadable,
  Conflict,
  ConflictingRecord,
  DraftCleanupPending,
  InvalidBackup,
  InvalidChange,
  InvalidRevision,
  RecoveryRequired,
  SaveUnconfirmed,
  StorageClosed,
  StorageUnavailable,
  StoredDataUnreadable,
} from "../../src/features/workouts/domain";
import {
  conflictMessage,
  describeFailure,
  describeReadFailure,
} from "../../src/features/workouts/ui/errorMessages";
import { createWorkoutFactory } from "../support/factories";

const snapshot = createWorkoutFactory("messages").snapshot();

describe("failure messages", () => {
  it("offers a reload only for failures that a reload can resolve", () => {
    expect(describeFailure(new Conflict({ snapshot }))).toEqual({
      message: conflictMessage,
      reload: true,
    });
    expect(describeFailure(new StorageUnavailable())).toEqual({
      message:
        "Your browser could not access workout storage. Try reopening this app.",
      reload: true,
    });
    expect(describeFailure(new StorageClosed())).toEqual({
      message: "Workout storage is closed.",
      reload: true,
    });
    expect(describeFailure(new SaveUnconfirmed())).toEqual({
      message:
        "Your browser could not confirm whether this change was saved. Reload before trying again.",
      reload: true,
    });
  });

  it("explains invalid changes without a reload", () => {
    expect(describeFailure(new RecoveryRequired())).toEqual({
      message: "Stored data needs recovery. Export it before making changes.",
      reload: false,
    });
    expect(describeFailure(new InvalidRevision())).toEqual({
      message: "Invalid workout revision.",
      reload: false,
    });
    expect(
      describeFailure(new InvalidChange({ message: "Name is required." })),
    ).toEqual({ message: "Name is required.", reload: false });
    expect(
      describeFailure(new DraftCleanupPending({ snapshot })).message,
    ).toBe(
      "Your workouts and preferences were deleted, but input drafts could not be cleared. Retry to finish deleting your data.",
    );
  });

  it("names what is wrong with a backup", () => {
    const messages = [
      new BackupTooLarge(),
      new BackupUnreadable(),
      new InvalidBackup(),
      new ConflictingRecord({ recordId: "workout-1" }),
      new ActiveWorkoutInProgress(),
      new ActiveWorkoutFinished(),
    ].map((error) => describeFailure(error).message);
    expect(messages).toEqual([
      "Backup is too large. The limit is 20 MB.",
      "This file is not valid JSON.",
      "This is not a valid workout backup.",
      "Backup contains a conflicting record (workout-1). No data was imported.",
      "Finish your current workout before importing another active workout.",
      "Backup conflicts with an active workout. No data was imported.",
    ]);
  });

  it("explains why the journal cannot be shown", () => {
    expect(describeReadFailure(new StorageUnavailable())).toContain(
      "could not access workout storage",
    );
    expect(describeReadFailure(new StorageClosed())).toBe(
      "Workout storage is closed.",
    );
    expect(
      describeReadFailure(new StoredDataUnreadable({ rawExport: "{}" })),
    ).toContain("Export a recovery copy");
  });
});
