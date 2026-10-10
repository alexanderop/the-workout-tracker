import { Result } from "@form/result";
import {
  DraftsDeleted,
  snapshotSchema,
  type Snapshot,
} from "../../src/features/workouts/domain";
import {
  createMemoryStorage as createPreviewStorage,
  finishedDraft,
} from "../../src/preview/memoryPorts";
import type {
  DraftInput,
  SetDraft,
} from "../../src/features/workouts/domain/drafts";
import type {
  DraftJournal,
  WorkoutStorage,
} from "../../src/features/workouts/ports";

/**
 * Tests use the same in-memory storage as product previews, so both enforce
 * the storage contract that `storage-contract.ts` also runs against Dexie.
 * `current` reports the latest persisted snapshot.
 */
export function createMemoryStorage(initial: Snapshot) {
  const base = createPreviewStorage(initial);
  let snapshot = snapshotSchema.parse(initial);
  const storage: WorkoutStorage = {
    ...base,
    async compareAndSave(expectedRevision, next) {
      const result = await base.compareAndSave(expectedRevision, next);
      if (result.isOk()) snapshot = result.value;
      return result;
    },
  };
  return { storage, current: () => snapshot };
}

export function createMemoryJournal(
  id: () => string,
  initial: readonly SetDraft[] = [],
) {
  let drafts = [...initial];
  let minimumRevision = 0;
  const owned = new Map<string, string>();
  const journal: DraftJournal = {
    clearBefore(revision) {
      minimumRevision = Math.max(minimumRevision, revision);
      drafts = drafts.filter((draft) => draft.revision >= minimumRevision);
      owned.clear();
      return Result.ok(undefined);
    },
    prune(snapshot) {
      const active = snapshot.active;
      const finished = drafts.filter((draft) => finishedDraft(draft, snapshot));
      drafts = drafts.filter(
        (draft) =>
          draft.revision >= snapshot.revision ||
          finished.includes(draft) ||
          (active?.id === draft.sessionId &&
            active.exercises.some((exercise) =>
              exercise.sets.some((set) => set.id === draft.setId),
            )),
      );
      return Result.ok(finished);
    },
    recover(sessionId, setId) {
      return Result.ok(
        drafts.filter(
          (draft) => draft.sessionId === sessionId && draft.setId === setId,
        ),
      );
    },
    write(input: DraftInput) {
      if (input.revision < minimumRevision)
        return Result.err(new DraftsDeleted());
      const draft = { ...input, id: id(), writer: "memory-writer" };
      const key = JSON.stringify([input.sessionId, input.setId]);
      const previous = owned.get(key);
      drafts = drafts.filter((entry) => entry.id !== previous);
      owned.set(key, draft.id);
      drafts.push(draft);
      return Result.ok(draft);
    },
    consume(consumed) {
      const ids = new Set(consumed.map((draft) => draft.id));
      drafts = drafts.filter((draft) => !ids.has(draft.id));
      return Result.ok(undefined);
    },
  };
  return { journal, current: () => drafts };
}
