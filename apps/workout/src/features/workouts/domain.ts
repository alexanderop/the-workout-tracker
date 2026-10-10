// Public domain API. Each concern lives in its own module under domain/.
export {
  exerciseSchema,
  routineSchema,
  settingsSchema,
  snapshotSchema,
  type ActiveSession,
  type CompletedSession,
  type Exercise,
  type Routine,
  type SessionExercise,
  type Settings,
  type Snapshot,
  type WorkoutSet,
} from "./domain/schemas";
export {
  commandSchema,
  setTargetReps,
  type Command,
  type Inputs,
  type Transition,
} from "./domain/commands";
export {
  acceptsCommand,
  commandPhases,
  initialSnapshot,
  remainingRestSeconds,
  routineFromSession,
  sessionTotals,
  workoutPhase,
  type WorkoutPhase,
} from "./domain/session";
export { reduceWorkout } from "./domain/reducer";
export { canonical } from "./domain/canonical";
export {
  ActiveWorkoutFinished,
  ActiveWorkoutInProgress,
  BackupTooLarge,
  BackupUnreadable,
  ConflictingRecord,
  InvalidBackup,
  mergeSnapshots,
  parseBackup,
  serializeBackup,
  type BackupError,
  type BackupMergeError,
  type BackupParseError,
} from "./domain/backup";
export {
  Conflict,
  DraftCleanupPending,
  InvalidChange,
  InvalidRevision,
  RecoveryRequired,
  SaveUnconfirmed,
  StorageClosed,
  StorageUnavailable,
  StoredDataUnreadable,
  type Invalid,
  type ReadError,
  type SaveError,
  type Unavailable,
} from "./domain/errors";
export { loadState, type LoadState } from "./domain/loadState";
