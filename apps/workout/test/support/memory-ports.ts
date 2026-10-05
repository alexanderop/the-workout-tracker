import type { Snapshot } from "../../src/features/workouts/domain";
import type {
  DraftInput,
  SetDraft,
} from "../../src/features/workouts/domain/drafts";
import type {
  DraftJournal,
  LoadState,
  Result,
  WorkoutStorage,
} from "../../src/features/workouts/ports";

export function createMemoryStorage(initial: Snapshot) {
  let snapshot = initial;
  let closed = false;
  const listeners = new Set<(state: LoadState) => void>();
  const storage: WorkoutStorage = {
    async read() {
      if (closed) return { kind: "unavailable", message: "Storage is closed." };
      return { kind: "ready", snapshot };
    },
    async compareAndSave(expectedRevision, next): Promise<Result> {
      if (closed) return { kind: "unavailable", message: "Storage is closed." };
      if (snapshot.revision !== expectedRevision)
        return { kind: "conflict", snapshot };
      snapshot = next;
      for (const listener of listeners) listener({ kind: "ready", snapshot });
      return { kind: "saved", snapshot };
    },
    subscribe(listener) {
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
    },
    prune(snapshot) {
      const active = snapshot.active;
      drafts = drafts.filter(
        (draft) =>
          draft.revision >= snapshot.revision ||
          (active?.id === draft.sessionId &&
            active.exercises.some((exercise) =>
              exercise.sets.some((set) => set.id === draft.setId),
            )),
      );
    },
    recover(sessionId, setId) {
      return drafts.filter(
        (draft) => draft.sessionId === sessionId && draft.setId === setId,
      );
    },
    write(input: DraftInput) {
      if (input.revision < minimumRevision)
        throw new Error("This workout was deleted. Reload before editing.");
      const draft = { ...input, id: id(), writer: "memory-writer" };
      const key = JSON.stringify([input.sessionId, input.setId]);
      const previous = owned.get(key);
      drafts = drafts.filter((entry) => entry.id !== previous);
      owned.set(key, draft.id);
      drafts.push(draft);
      return draft;
    },
    consume(consumed) {
      const ids = new Set(consumed.map((draft) => draft.id));
      drafts = drafts.filter((draft) => !ids.has(draft.id));
    },
  };
  return { journal, current: () => drafts };
}
