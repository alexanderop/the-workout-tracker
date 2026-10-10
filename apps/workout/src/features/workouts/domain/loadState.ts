import type { Result } from "@form/result";
import type { ReadError } from "./errors";
import type { Snapshot } from "./schemas";

/** What the interface shows while it observes confirmed storage. */
export type LoadState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly snapshot: Snapshot }
  | { readonly kind: "failed"; readonly error: ReadError };

export function loadState(result: Result<Snapshot, ReadError>): LoadState {
  return result.isOk()
    ? { kind: "ready", snapshot: result.value }
    : { kind: "failed", error: result.error };
}
