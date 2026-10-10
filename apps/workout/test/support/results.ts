import type { Result } from "@form/result";

/** The tag of the error, or undefined for a success. */
export function errorTag(
  result: Result<unknown, { readonly name: string }>,
): string | undefined {
  return result.isErr() ? result.error.name : undefined;
}

/** The error of a result that must have failed. */
export function failure<E extends Error>(result: Result<unknown, E>): E {
  if (result.isOk()) throw new Error("Expected a failed result.");
  return result.error;
}

/** The value of a result that must have succeeded. */
export function success<T>(result: Result<T, unknown>): T {
  if (result.isErr()) throw new Error("Expected a successful result.");
  return result.value;
}
