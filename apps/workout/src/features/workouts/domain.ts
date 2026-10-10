// Public domain API. Each concern lives in its own module under domain/.
export {
  exerciseSchema,
  routineSchema,
  snapshotSchema,
  type ActiveSession,
  type CompletedSession,
  type Exercise,
  type Routine,
  type SessionExercise,
  type Snapshot,
  type WorkoutSet,
} from "./domain/schemas";
export {
  commandSchema,
  setTargetReps,
  type Command,
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
