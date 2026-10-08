import {
  snapshotSchema,
  draftSchema,
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
  const unavailable = {
    kind: "unavailable",
    message: "Preview storage is closed.",
  } as const;
  return {
    async read() {
      return closed ? unavailable : { kind: "ready", snapshot };
    },
    async compareAndSave(expectedRevision, next) {
      if (closed) return unavailable;
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
        return { kind: "invalid", message: "Invalid preview revision." };
      const parsed = snapshotSchema.safeParse(next);
      if (!parsed.success)
        return { kind: "invalid", message: "Invalid preview snapshot." };
      if (expectedRevision !== snapshot.revision)
        return { kind: "conflict", snapshot };
      const unchanged = parsed.data.revision === snapshot.revision;
      if (unchanged && JSON.stringify(parsed.data) === JSON.stringify(snapshot))
        return { kind: "saved", snapshot };
      if (parsed.data.revision !== snapshot.revision + 1)
        return {
          kind: "invalid",
          message: "Snapshot revisions must advance by one.",
        };
      snapshot = parsed.data;
      for (const listener of listeners) listener({ kind: "ready", snapshot });
      return { kind: "saved", snapshot };
    },
    subscribe(listener) {
      if (closed) {
        listener(unavailable);
        return () => {};
      }
      listeners.add(listener);
      listener({ kind: "ready", snapshot });
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

/** Same signal as the browser journal: a newer deletion obsoleted the draft. */
export function draftsDeletedError() {
  const error = new Error("This workout was deleted. Reload before editing.");
  error.name = "DraftsDeletedError";
  return error;
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
      return finished.map((draft) => draftSchema.parse(draft));
    },
    recover(sessionId, setId) {
      return drafts
        .filter(
          (draft) => draft.sessionId === sessionId && draft.setId === setId,
        )
        .map((draft) => draftSchema.parse(draft));
    },
    write(input) {
      if (input.revision < minimumRevision) throw draftsDeletedError();
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
      return draftSchema.parse(draft);
    },
    consume(consumed) {
      const ids = new Set(consumed.map((draft) => draft.id));
      drafts = drafts.filter((draft) => !ids.has(draft.id));
    },
  };
}
