import { initialSnapshot, snapshotSchema } from "../../src/features/workouts";
import type {
  LoadState,
  StorageState,
  WorkoutStorage,
} from "../../src/features/workouts/ports";

export function memoryDatabase() {
  let raw: unknown = initialSnapshot();
  const observers = new Set<() => void>();
  return {
    replaceRaw(value: unknown) {
      raw = structuredClone(value);
    },
    open(): WorkoutStorage {
      let closed = false;
      const listeners = new Set<(state: LoadState) => void>();
      const closedState = {
        kind: "unavailable",
        message: "Workout storage is closed.",
      } as const;
      const state = (): StorageState => {
        if (closed) return closedState;
        const parsed = snapshotSchema.safeParse(structuredClone(raw));
        return parsed.success
          ? { kind: "ready", snapshot: parsed.data }
          : {
              kind: "recovery",
              message: "Stored data needs recovery.",
              rawExport: JSON.stringify({
                format: "form-workout-recovery",
                raw,
              }),
            };
      };
      const notify = () => {
        for (const listener of listeners) listener(state());
      };
      observers.add(notify);
      return {
        async read() {
          return state();
        },
        async compareAndSave(expectedRevision, next) {
          if (closed) return closedState;
          if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
            return { kind: "invalid", message: "Invalid revision." };
          const current = state();
          if (current.kind !== "ready")
            return { kind: "invalid", message: "Stored data needs recovery." };
          if (current.snapshot.revision !== expectedRevision)
            return { kind: "conflict", snapshot: current.snapshot };
          const parsed = snapshotSchema.safeParse(next);
          if (!parsed.success)
            return { kind: "invalid", message: "Invalid snapshot." };
          if (parsed.data.revision === expectedRevision) {
            return JSON.stringify(parsed.data) ===
              JSON.stringify(current.snapshot)
              ? { kind: "saved", snapshot: current.snapshot }
              : {
                  kind: "invalid",
                  message: "Changed data needs a new revision.",
                };
          }
          if (parsed.data.revision !== expectedRevision + 1)
            return {
              kind: "invalid",
              message: "Revision must advance by one.",
            };
          raw = structuredClone(parsed.data);
          for (const observer of observers) observer();
          return { kind: "saved", snapshot: parsed.data };
        },
        subscribe(listener) {
          listener(state());
          if (!closed) listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        close() {
          closed = true;
          listeners.clear();
          observers.delete(notify);
        },
      };
    },
  };
}
