import { Result, TaggedError, type StandardSchemaV1 } from "@form/result";

export class StorageUnavailable extends TaggedError("StorageUnavailable")<{
  key: string;
}> {}
export class StoredValueInvalid extends TaggedError("StoredValueInvalid")<{
  key: string;
}> {}
export class StorageQuotaExceeded extends TaggedError("StorageQuotaExceeded")<{
  key: string;
}> {}

export type StorageReadError = StorageUnavailable | StoredValueInvalid;
export type StorageWriteError = StorageUnavailable | StorageQuotaExceeded;

/**
 * Validates a stored value with any Standard Schema library, such as Zod 4.
 * The schema must validate synchronously; an asynchronous result is treated as
 * invalid because storage reads are synchronous.
 */
function validate<S extends StandardSchemaV1>(
  schema: S,
  value: unknown,
  key: string,
): Result<StandardSchemaV1.InferOutput<S>, StoredValueInvalid> {
  const outcome = schema["~standard"].validate(value);
  if (outcome instanceof Promise || outcome.issues)
    return Result.err(new StoredValueInvalid({ key }));
  return Result.ok(outcome.value);
}

/**
 * Reads and validates a JSON value. A missing key is `ok(undefined)`.
 * `storage` is a getter because merely touching `window.localStorage`
 * throws when the browser blocks site data.
 */
export function readStorage<S extends StandardSchemaV1>(
  storage: () => Storage,
  key: string,
  schema: S,
): Result<StandardSchemaV1.InferOutput<S> | undefined, StorageReadError> {
  return Result.try({
    try: () => storage().getItem(key),
    catch: () => new StorageUnavailable({ key }),
  }).andThen((raw) => {
    if (raw === null) return Result.ok(undefined);
    return Result.try({
      try: (): unknown => JSON.parse(raw),
      catch: () => new StoredValueInvalid({ key }),
    }).andThen((json) => validate(schema, json, key));
  });
}

export function writeStorage(
  storage: () => Storage,
  key: string,
  value: unknown,
): Result<void, StorageWriteError> {
  return Result.try({
    try: () => {
      storage().setItem(key, JSON.stringify(value));
    },
    catch: (cause) =>
      cause instanceof DOMException && cause.name === "QuotaExceededError"
        ? new StorageQuotaExceeded({ key })
        : new StorageUnavailable({ key }),
  });
}
