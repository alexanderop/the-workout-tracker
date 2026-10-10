import { Result } from "@form/result";
import {
  snapshotSchema,
  draftSchema,
  Conflict,
  DraftsDeleted,
  InvalidChange,
  InvalidRevision,
  loadState,
  StorageClosed,
  type Snapshot,
  type WorkoutStorage,
  type DraftJournal,
  type SetDraft,
  type LoadState,
} from "../features/workouts";

/** Each document owns one validated journal; it never accesses browser storage. */
export function createMemoryStorage(initial: Snapshot): WorkoutStorage {
  let snapshot = snapshotSchema.parse(initial);
  let closed = false;
  const listeners = new Set<(state: LoadState) => void>();
  const closedState = loadState(Result.err(new StorageClosed()));
  const ready = () => loadState(Result.ok(snapshot));
  return {
    async read() {
      return closed ? Result.err(new StorageClosed()) : Result.ok(snapshot);
    },
    async compareAndSave(expectedRevision, next) {
      if (closed) return Result.err(new StorageClosed());
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
        return Result.err(new InvalidRevision());
      const parsed = snapshotSchema.safeParse(next);
      if (!parsed.success)
        return Result.err(
          new InvalidChange({ message: "Invalid preview snapshot." }),
        );
      if (expectedRevision !== snapshot.revision)
        return Result.err(new Conflict({ snapshot }));
      const unchanged = parsed.data.revision === snapshot.revision;
      if (unchanged && JSON.stringify(parsed.data) === JSON.stringify(snapshot))
        return Result.ok(snapshot);
      if (parsed.data.revision !== snapshot.revision + 1)
        return Result.err(
          new InvalidChange({
            message: "Snapshot revisions must advance by one.",
          }),
        );
      snapshot = parsed.data;
      for (const listener of listeners) listener(ready());
      return Result.ok(snapshot);
    },
    subscribe(listener) {
      if (closed) {
        listener(closedState);
        return () => {};
      }
      listeners.add(listener);
      listener(ready());
      return () => {
        listeners.delete(listener);
      };
    },
    close() {
      closed = true;
      listeners.clear();
    },
  };
}

/** Drafts of a finished workout's set wait for explicit recovery. */
export function finishedDraft(draft: SetDraft, snapshot: Snapshot): boolean {
  return (
    snapshot.completed[draft.sessionId]?.exercises.some((exercise) =>
      exercise.sets.some((set) => set.id === draft.setId),
    ) ?? false
  );
}

export function createMemoryDraftJournal(id: () => string): DraftJournal {
  let drafts: SetDraft[] = [];
  let minimumRevision = 0;
  const owned = new Map<string, string>();
  return {
    clearBefore(revision) {
      minimumRevision = Math.max(minimumRevision, revision);
      drafts = drafts.filter((draft) => draft.revision >= minimumRevision);
      owned.clear();
      return Result.ok(undefined);
    },
    prune(snapshot) {
      const finished = drafts.filter((draft) => finishedDraft(draft, snapshot));
      drafts = drafts.filter(
        (draft) =>
          draft.revision >= snapshot.revision ||
          finished.includes(draft) ||
          (snapshot.active?.id === draft.sessionId &&
            snapshot.active.exercises.some((exercise) =>
              exercise.sets.some((set) => set.id === draft.setId),
            )),
      );
      return Result.ok(finished.map((draft) => draftSchema.parse(draft)));
    },
    recover(sessionId, setId) {
      return Result.ok(
        drafts
          .filter(
            (draft) => draft.sessionId === sessionId && draft.setId === setId,
          )
          .map((draft) => draftSchema.parse(draft)),
      );
    },
    write(input) {
      if (input.revision < minimumRevision)
        return Result.err(new DraftsDeleted());
      const draft = draftSchema.parse({
        ...input,
        id: id(),
        writer: "preview",
      });
      const key = JSON.stringify([input.sessionId, input.setId]);
      const previous = owned.get(key);
      drafts = drafts.filter((entry) => entry.id !== previous);
      owned.set(key, draft.id);
      drafts.push(draft);
      return Result.ok(draftSchema.parse(draft));
    },
    consume(consumed) {
      const ids = new Set(consumed.map((draft) => draft.id));
      drafts = drafts.filter((draft) => !ids.has(draft.id));
      return Result.ok(undefined);
    },
  };
}
