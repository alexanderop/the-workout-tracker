import { draftSchema, type DraftInput, type SetDraft } from "../domain/drafts";
import type { Snapshot } from "../domain";
import type { DraftJournal, DraftsDeletedErrorName } from "../ports";

type KeyValueStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "length"
>;
/** One marker updated in place; its value is the minimum draft revision. */
const deletedBeforeKey = "form-workout:drafts-deleted-before";
/** Earlier versions wrote one immutable key per deletion. Still honored. */
const legacyDeletedBeforePrefix = "form-workout:drafts-deleted-before:";
const prefix = "form-workout:draft:v1:";
const deletedName: DraftsDeletedErrorName = "DraftsDeletedError";
function draftsDeletedError() {
  const error = new Error("This workout was deleted. Reload before editing.");
  error.name = deletedName;
  return error;
}

/** Returns a non-negative revision, or null for malformed marker text. */
function markerRevision(text: string | null): number | null {
  if (text === null || !/^\d+$/.test(text)) return null;
  const revision = Number(text);
  return Number.isSafeInteger(revision) ? revision : null;
}
/** Whether the draft belongs to a set of a workout that has been finished. */
function finishedDraft(draft: SetDraft, snapshot: Snapshot): boolean {
  return (
    snapshot.completed[draft.sessionId]?.exercises.some((exercise) =>
      exercise.sets.some((set) => set.id === draft.setId),
    ) ?? false
  );
}
function obsoleteDraft(
  draft: SetDraft,
  snapshot: Snapshot,
  retained: ReadonlySet<string>,
): boolean {
  return (
    draft.revision < snapshot.revision &&
    (draft.sessionId !== snapshot.active?.id || !retained.has(draft.setId))
  );
}
const key = (draft: Pick<SetDraft, "id">) => prefix + draft.id;
/** Malformed markers are ignored rather than blocking every write. */
const minimumRevision = (storage: KeyValueStorage) => {
  let minimum = markerRevision(storage.getItem(deletedBeforeKey)) ?? 0;
  for (let i = 0; i < storage.length; i++) {
    const name = storage.key(i);
    if (!name?.startsWith(legacyDeletedBeforePrefix)) continue;
    const revision = markerRevision(
      name.slice(legacyDeletedBeforePrefix.length),
    );
    if (revision !== null) minimum = Math.max(minimum, revision);
  }
  return minimum;
};
const appKeys = (storage: KeyValueStorage, start: string) => {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const name = storage.key(i);
    if (name?.startsWith(start)) keys.push(name);
  }
  return keys;
};
const parseRecord = (raw: string | null): SetDraft | null => {
  if (!raw || raw.length > 3000) return null;
  try {
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};
/** Valid drafts stored under their own key, with that key. */
const records = (storage: KeyValueStorage) =>
  appKeys(storage, prefix).flatMap((name) => {
    const record = parseRecord(storage.getItem(name));
    return record && name === key(record) ? [{ name, record }] : [];
  });
export function createDraftJournal(deps: {
  storage: () => KeyValueStorage;
  id: () => string;
  preferredWriter?: string;
  rememberWriter?: (writer: string) => void;
}): DraftJournal {
  const writer = deps.id();
  const owned = new Map<string, SetDraft>();
  const preferredFirst = (a: SetDraft, b: SetDraft) =>
    Number(b.writer === deps.preferredWriter) -
    Number(a.writer === deps.preferredWriter);
  return {
    clearBefore(revision) {
      const storage = deps.storage();
      const minimum = Math.max(revision, minimumRevision(storage));
      storage.setItem(deletedBeforeKey, String(minimum));
      // The single marker now covers every legacy marker.
      for (const name of appKeys(storage, legacyDeletedBeforePrefix))
        storage.removeItem(name);
      for (const name of appKeys(storage, prefix)) {
        const record = parseRecord(storage.getItem(name));
        if (!record || record.revision < minimum) storage.removeItem(name);
      }
      owned.clear();
    },
    recover(sessionId, setId) {
      const storage = deps.storage();
      const minimum = minimumRevision(storage);
      return records(storage)
        .map(({ record }) => record)
        .filter(
          (record) =>
            record.sessionId === sessionId &&
            record.setId === setId &&
            record.revision >= minimum,
        )
        .sort(preferredFirst);
    },
    write(input: DraftInput) {
      const draft = draftSchema.parse({ ...input, writer, id: deps.id() });
      const storage = deps.storage();
      if (draft.revision < minimumRevision(storage)) throw draftsDeletedError();
      storage.setItem(key(draft), JSON.stringify(draft));
      if (draft.revision < minimumRevision(storage)) {
        storage.removeItem(key(draft));
        throw draftsDeletedError();
      }
      const identity = JSON.stringify([draft.sessionId, draft.setId]);
      const previous = owned.get(identity);
      owned.set(identity, draft);
      if (previous) storage.removeItem(key(previous));
      try {
        deps.rememberWriter?.(writer);
      } catch {}
      return draft;
    },
    prune(snapshot) {
      const storage = deps.storage();
      const minimum = minimumRevision(storage);
      const retained = new Set(
        snapshot.active?.exercises.flatMap((exercise) =>
          exercise.sets.map((set) => set.id),
        ) ?? [],
      );
      const finished: SetDraft[] = [];
      for (const { name, record } of records(storage)) {
        if (finishedDraft(record, snapshot)) {
          if (record.revision >= minimum) finished.push(record);
          continue;
        }
        if (obsoleteDraft(record, snapshot, retained)) storage.removeItem(name);
      }
      return finished.sort(preferredFirst);
    },
    consume(drafts) {
      const storage = deps.storage();
      for (const draft of drafts) storage.removeItem(key(draft));
    },
  };
}
