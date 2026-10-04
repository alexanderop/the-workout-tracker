import { draftSchema, type DraftInput, type SetDraft } from "../domain/drafts";
import type { DraftJournal } from "../ports";

type KeyValueStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "length"
>;
const prefix = "form-workout:draft:v1:";
export function createDraftJournal(deps: {
  storage: () => KeyValueStorage;
  id: () => string;
  preferredWriter?: string;
  rememberWriter?: (writer: string) => void;
}): DraftJournal {
  const writer = deps.id();
  const key = (draft: Pick<SetDraft, "id">) => prefix + draft.id;
  const owned = new Map<string, SetDraft>();
  return {
    recover(sessionId, setId) {
      const storage = deps.storage();
      const records: SetDraft[] = [];
      for (let i = 0; i < storage.length; i++) {
        const name = storage.key(i);
        if (!name?.startsWith(prefix)) continue;
        const raw = storage.getItem(name);
        if (!raw || raw.length > 3000) continue;
        try {
          const result = draftSchema.safeParse(JSON.parse(raw));
          if (
            result.success &&
            result.data.sessionId === sessionId &&
            result.data.setId === setId
          )
            records.push(result.data);
        } catch {}
      }
      return records.sort(
        (a, b) =>
          Number(b.writer === deps.preferredWriter) -
          Number(a.writer === deps.preferredWriter),
      );
    },
    write(input: DraftInput) {
      const draft = draftSchema.parse({ ...input, writer, id: deps.id() });
      const storage = deps.storage();
      storage.setItem(key(draft), JSON.stringify(draft));
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
        try {
          const parsed = draftSchema.safeParse(JSON.parse(raw));
          if (
            parsed.success &&
            name === key(parsed.data) &&
            parsed.data.revision < snapshot.revision &&
            (parsed.data.sessionId !== snapshot.active?.id ||
              !retained.has(parsed.data.setId))
          )
            obsolete.push(name);
        } catch {}
      }
      for (const name of obsolete) storage.removeItem(name);
    },
    consume(drafts) {
      const storage = deps.storage();
      for (const draft of drafts) storage.removeItem(key(draft));
    },
  };
}
