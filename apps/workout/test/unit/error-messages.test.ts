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
import { de } from "../../src/i18n/de";
import { en } from "../../src/i18n/en";
import { t, translator } from "../../src/i18n/testing";
import {
  invalidChange,
  rejections,
  type RejectionCode,
} from "../../src/features/workouts/domain";
import { createWorkoutFactory } from "../support/factories";

const snapshot = createWorkoutFactory("messages").snapshot();
const isCode = (value: string): value is RejectionCode => value in rejections;

describe("failure messages", () => {
  it("offers a reload only for failures that a reload can resolve", () => {
    expect(describeFailure(new Conflict({ snapshot }), t)).toEqual({
      message: conflictMessage(t),
      reload: true,
    });
    expect(describeFailure(new StorageUnavailable(), t)).toEqual({
      message:
        "Your browser could not access workout storage. Try reopening this app.",
      reload: true,
    });
    expect(describeFailure(new StorageClosed(), t)).toEqual({
      message: "Workout storage is closed.",
      reload: true,
    });
    expect(describeFailure(new SaveUnconfirmed(), t)).toEqual({
      message:
        "Your browser could not confirm whether this change was saved. Reload before trying again.",
      reload: true,
    });
  });

  it("explains invalid changes without a reload", () => {
    expect(describeFailure(new RecoveryRequired(), t)).toEqual({
      message: "Stored data needs recovery. Export it before making changes.",
      reload: false,
    });
    expect(describeFailure(new InvalidRevision(), t)).toEqual({
      message: "Invalid workout revision.",
      reload: false,
    });
    expect(
      describeFailure(new InvalidChange({ message: "Name is required." }), t),
    ).toEqual({ message: "Name is required.", reload: false });
    expect(
      describeFailure(new DraftCleanupPending({ snapshot }), t).message,
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
    ].map((error) => describeFailure(error, t).message);
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
    expect(describeReadFailure(new StorageUnavailable(), t)).toContain(
      "could not access workout storage",
    );
    expect(describeReadFailure(new StorageClosed(), t)).toBe(
      "Workout storage is closed.",
    );
    expect(
      describeReadFailure(new StoredDataUnreadable({ rawExport: "{}" }), t),
    ).toContain("Export a recovery copy");
  });
});

describe("rejection messages", () => {
  const codes = Object.keys(rejections).filter(isCode).sort();

  it("keeps the domain table and both catalogs on the same codes", () => {
    expect(Object.keys(en.errors.rejections).sort()).toEqual(codes);
    expect(Object.keys(de.errors.rejections).sort()).toEqual(codes);
  });

  it("translates a rejection by its code, in each language", () => {
    for (const code of codes) {
      const error = invalidChange(code);
      expect(describeFailure(error, t).message).toBe(en.errors.rejections[code]);
      expect(describeFailure(error, translator("de").t).message).toBe(
        de.errors.rejections[code],
      );
    }
  });

  it("keeps the English fallback text of the domain table in the English catalog", () => {
    expect(en.errors.rejections).toEqual(rejections);
  });

  it("shows a raw schema message when no code is attached", () => {
    expect(
      describeFailure(new InvalidChange({ message: "Name is required." }), translator("de").t)
        .message,
    ).toBe("Name is required.");
  });
});
