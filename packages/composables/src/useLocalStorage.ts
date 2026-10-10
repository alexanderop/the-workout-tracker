import { shallowRef, type Ref } from "vue";
import type { Result, StandardSchemaV1 } from "@form/result";
import {
  readStorage,
  writeStorage,
  type StorageReadError,
  type StorageWriteError,
} from "./storage";
import { useEventListener } from "./useEventListener";

/**
 * A validated, JSON-encoded value kept in `localStorage` and synced across tabs.
 * `schema` is any synchronous Standard Schema, such as a Zod 4 schema.
 * Corrupt stored data is never overwritten by a read; `set` updates the
 * in-memory state first so the UI works even when saving fails.
 */
export function useLocalStorage<S extends StandardSchemaV1>(
  key: string,
  schema: S,
  {
    fallback,
    storage = () => window.localStorage,
  }: { fallback: StandardSchemaV1.InferOutput<S>; storage?: () => Storage },
): {
  state: Readonly<Ref<StandardSchemaV1.InferOutput<S>>>;
  readError: Readonly<Ref<StorageReadError | null>>;
  set: (
    next: StandardSchemaV1.InferOutput<S>,
  ) => Result<void, StorageWriteError>;
} {
  const state = shallowRef<StandardSchemaV1.InferOutput<S>>(fallback);
  const readError = shallowRef<StorageReadError | null>(null);

  function load() {
    readStorage(storage, key, schema).match({
      ok: (value) => {
        readError.value = null;
        state.value = value === undefined ? fallback : value;
      },
      err: (error) => {
        readError.value = error;
        state.value = fallback;
      },
    });
  }
  function set(next: StandardSchemaV1.InferOutput<S>) {
    state.value = next;
    const result = writeStorage(storage, key, next);
    if (result.isOk()) readError.value = null;
    return result;
  }
  function ownsEvent(event: StorageEvent) {
    try {
      return event.storageArea === storage();
    } catch {
      return false;
    }
  }

  load();
  useEventListener(window, "storage", (event) => {
    if (!ownsEvent(event)) return;
    if (event.key === key || event.key === null) load();
  });
  return { state, readError, set };
}
