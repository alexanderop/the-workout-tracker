import { defaultExercises } from "./catalog";
import type { Command } from "./commands";
import { setTargetReps } from "./commands";
import type {
  ActiveSession,
  CompletedSession,
  Routine,
  Snapshot,
} from "./schemas";
export { sessionTotals } from "./schemas";

export function initialSnapshot(): Snapshot {
  return {
    revision: 0,
    exercises: Object.fromEntries(
      defaultExercises.map((exercise) => [exercise.id, exercise]),
    ),
    routines: {},
    active: null,
    completed: {},
    settings: { restSeconds: 90, autoRest: true },
  };
}

export function remainingRestSeconds(
  active: ActiveSession | null,
  at: number,
): number {
  return active?.rest
    ? Math.max(0, Math.ceil((active.rest.endsAt - at) / 1000))
    : 0;
}

/**
 * The workout lifecycle as a named phase. Rest stays a stored deadline; an
 * expired rest remains "resting" until it is dismissed or replaced.
 */
export type WorkoutPhase = "idle" | "training" | "resting";

export function workoutPhase(snapshot: Pick<Snapshot, "active">): WorkoutPhase {
  if (!snapshot.active) return "idle";
  return snapshot.active.rest ? "resting" : "training";
}

const anyPhase: readonly WorkoutPhase[] = ["idle", "training", "resting"];
const idlePhase: readonly WorkoutPhase[] = ["idle"];
const activePhases: readonly WorkoutPhase[] = ["training", "resting"];

/**
 * Which phases accept each command. `reduceWorkout` checks this table through
 * `acceptsCommand` before any transition runs and rejects commands outside
 * these phases; finishing an already completed session is the one idempotent
 * exception and returns the snapshot unchanged.
 */
export const commandPhases: Readonly<
  Record<Command["type"], readonly WorkoutPhase[]>
> = {
  settings: anyPhase,
  "save-routine": anyPhase,
  "save-exercise": anyPhase,
  "rename-completed": anyPhase,
  "correct-completed": anyPhase,
  start: idlePhase,
  "start-selected": idlePhase,
  repeat: idlePhase,
  rename: activePhases,
  discard: activePhases,
  finish: activePhases,
  "stop-rest": activePhases,
  "add-exercise": activePhases,
  "add-exercises": activePhases,
  "remove-exercise": activePhases,
  "set-exercise-note": activePhases,
  "replace-exercise": activePhases,
  "configure-exercise": activePhases,
  "add-set": activePhases,
  "remove-set": activePhases,
  "set-entry": activePhases,
  "set-values": activePhases,
  "set-completed": activePhases,
};

export function acceptsCommand(
  phase: WorkoutPhase,
  type: Command["type"],
): boolean {
  return commandPhases[type].includes(phase);
}

export function routineFromSession(
  session: CompletedSession,
  id: string,
): Routine {
  return {
    id,
    name: session.name,
    description: "",
    exercises: session.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets.map((set) => ({
        weightKg: set.weightKg,
        reps: setTargetReps(set),
      })),
    })),
  };
}
