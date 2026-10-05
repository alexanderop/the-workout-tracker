import { draftSchema, type DraftInput, type SetDraft } from "../domain/drafts";
import type { Snapshot } from "../domain";
import type { DraftJournal } from "../ports";

type KeyValueStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "length"
>;
const deletedBeforePrefix = "form-workout:drafts-deleted-before:";
const prefix = "form-workout:draft:v1:";
function obsoleteDraft(
  raw: string,
  name: string,
  snapshot: Snapshot,
  retained: ReadonlySet<string>,
): boolean {
  try {
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return false;
    const draft = parsed.data;
    return (
      name === prefix + draft.id &&
      draft.revision < snapshot.revision &&
      (draft.sessionId !== snapshot.active?.id || !retained.has(draft.setId))
    );
  } catch {
    return false;
  }
}
export function createDraftJournal(deps: {
  storage: () => KeyValueStorage;
  id: () => string;
  preferredWriter?: string;
  rememberWriter?: (writer: string) => void;
}): DraftJournal {
  const writer = deps.id();
  const key = (draft: Pick<SetDraft, "id">) => prefix + draft.id;
  const owned = new Map<string, SetDraft>();
  const minimumRevision = (storage: KeyValueStorage) => {
    let minimum = 0;
    for (let i = 0; i < storage.length; i++) {
      const name = storage.key(i);
      if (!name?.startsWith(deletedBeforePrefix)) continue;
      const revision = Number(name.slice(deletedBeforePrefix.length));
      if (!Number.isSafeInteger(revision) || revision < 0)
        throw new Error("Invalid draft deletion marker.");
      minimum = Math.max(minimum, revision);
    }
    return minimum;
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
  const preferredFirst = (a: SetDraft, b: SetDraft) =>
    Number(b.writer === deps.preferredWriter) -
    Number(a.writer === deps.preferredWriter);
  return {
    clearBefore(revision) {
      const storage = deps.storage();
      const minimum = Math.max(revision, minimumRevision(storage));
      storage.setItem(deletedBeforePrefix + minimum, "");
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const name = storage.key(i);
        if (name?.startsWith(prefix)) keys.push(name);
      }
      for (const name of keys) {
        const record = parseRecord(storage.getItem(name));
        if (!record || record.revision < minimum) storage.removeItem(name);
      }
      owned.clear();
    },
    recover(sessionId, setId) {
      const storage = deps.storage();
      const records: SetDraft[] = [];
      const minimum = minimumRevision(storage);
      for (let i = 0; i < storage.length; i++) {
        const name = storage.key(i);
        if (!name?.startsWith(prefix)) continue;
        const record = parseRecord(storage.getItem(name));
        if (
          record &&
          record.sessionId === sessionId &&
          record.setId === setId &&
          record.revision >= minimum
        )
          records.push(record);
      }
      return records.sort(preferredFirst);
    },
    write(input: DraftInput) {
      const draft = draftSchema.parse({ ...input, writer, id: deps.id() });
      const storage = deps.storage();
      if (draft.revision < minimumRevision(storage))
        throw new Error("This workout was deleted. Reload before editing.");
      storage.setItem(key(draft), JSON.stringify(draft));
      if (draft.revision < minimumRevision(storage)) {
        storage.removeItem(key(draft));
        throw new Error("This workout was deleted. Reload before editing.");
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
      const retained = new Set(
        snapshot.active?.exercises.flatMap((exercise) =>
          exercise.sets.map((set) => set.id),
        ) ?? [],
      );
      const obsolete: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const name = storage.key(i);
        if (!name?.startsWith(prefix)) continue;
        const raw = storage.getItem(name);
        if (!raw || raw.length > 3000) continue;
        if (obsoleteDraft(raw, name, snapshot, retained)) obsolete.push(name);
      }
      for (const name of obsolete) storage.removeItem(name);
    },
    consume(drafts) {
      const storage = deps.storage();
      for (const draft of drafts) storage.removeItem(key(draft));
    },
  };
}
