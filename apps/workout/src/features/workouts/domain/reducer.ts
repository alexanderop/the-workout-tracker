import {
  commandSchema,
  setTargetReps,
  type Command,
  type Inputs,
  type Transition,
} from "./commands";
import { reduceActive, type ReducerContext } from "./activeReducer";
import { rejections, type RejectionCode } from "./errors";
import { acceptsCommand, workoutPhase } from "./session";
import {
  ownRecord,
  snapshotSchema,
  timestamp,
  type Routine,
  type SessionExercise,
  type Snapshot,
} from "./schemas";

const reject = (code: RejectionCode): Transition => ({
  kind: "rejected",
  code,
  message: rejections[code],
});

/** The caller names a selected start in its own language; English is the fallback. */
function startName(
  request: Extract<Command, { type: "start" | "start-selected" }>,
  routine: Routine | null | undefined,
): string {
  if (request.type === "start-selected" && request.name) return request.name;
  return routine?.name ?? "New workout";
}

export function reduceWorkout(
  snapshot: Snapshot,
  command: Command,
  inputs: Inputs,
): Transition {
  const parsed = commandSchema.safeParse(command);
  if (!parsed.success || !timestamp.safeParse(inputs.at).success)
    return reject("invalidValues");
  const unchanged = (): Transition => ({ kind: "unchanged", snapshot });
  const changed = (next: Snapshot): Transition => {
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return unchanged();
    const validated = snapshotSchema.safeParse({
      ...next,
      revision: snapshot.revision + 1,
    });
    if (validated.success) return { kind: "changed", snapshot: validated.data };
    const issue = validated.error.issues[0]?.message;
    return issue
      ? { kind: "rejected", message: issue }
      : reject("invalidWorkoutChange");
  };
  const phase = workoutPhase(snapshot);
  const finishedAlready =
    command.type === "finish" &&
    ownRecord(snapshot.completed, command.sessionId) !== undefined;
  if (!acceptsCommand(phase, command.type) && !finishedAlready)
    return reject(phase === "idle" ? "noLongerActive" : "finishCurrentFirst");
  const context: ReducerContext = {
    snapshot,
    inputs,
    reject,
    unchanged,
    changed,
    selectedExercises,
  };
  switch (command.type) {
    case "correct-completed":
      return correctCompleted(command);
    case "rename-completed": {
      const completed = ownRecord(snapshot.completed, command.sessionId);
      if (!completed) return reject("completedNotFound");
      return changed({
        ...snapshot,
        completed: {
          ...snapshot.completed,
          [completed.id]: { ...completed, name: command.name.trim() },
        },
      });
    }
    case "settings":
      return changed({ ...snapshot, settings: command.settings });
    case "save-routine":
      return changed({
        ...snapshot,
        routines: {
          ...snapshot.routines,
          [command.routine.id]: command.routine,
        },
      });
    case "save-exercise":
      return changed({
        ...snapshot,
        exercises: {
          ...snapshot.exercises,
          [command.exercise.id]: command.exercise,
        },
      });
    case "repeat":
      return repeatWorkout(command);
    case "start":
    case "start-selected":
      return startWorkout(command);
    case "rename":
    case "discard":
    case "finish":
    case "stop-rest":
    case "add-exercise":
    case "add-exercises":
    case "remove-exercise":
    case "set-exercise-note":
    case "replace-exercise":
    case "configure-exercise":
    case "add-set":
    case "remove-set":
    case "set-entry":
    case "set-values":
    case "set-completed":
      return reduceActive(context, command);
  }
  function correctCompleted(
    request: Extract<Command, { type: "correct-completed" }>,
  ): Transition {
    const completed = ownRecord(snapshot.completed, request.sessionId);
    if (!completed) return reject("completedNotFound");
    const patches = new Map<string, (typeof request.sets)[number]>();
    for (const patch of request.sets) {
      const exercise = completed.exercises.find(
        (row) => row.id === patch.exerciseId,
      );
      const set = exercise?.sets.find((row) => row.id === patch.setId);
      if (!set) return reject("setNotInCompleted");
      if (!set.completed) return reject("onlyLoggedCorrectable");
      if (patches.has(patch.setId)) return reject("setCorrectedOnce");
      patches.set(patch.setId, patch);
    }
    return changed({
      ...snapshot,
      completed: {
        ...snapshot.completed,
        [completed.id]: {
          ...completed,
          name: request.name?.trim() ?? completed.name,
          exercises: completed.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => {
              const patch = patches.get(set.id);
              return patch
                ? { ...set, weightKg: patch.weightKg, reps: patch.reps }
                : set;
            }),
          })),
        },
      },
    });
  }
  function repeatWorkout(
    request: Extract<Command, { type: "repeat" }>,
  ): Transition {
    const source = ownRecord(snapshot.completed, request.completedId);
    if (!source) return reject("workoutNotFound");
    const id = inputs.id();
    if (ownRecord(snapshot.completed, id)) return reject("workoutIdExists");
    return changed({
      ...snapshot,
      active: {
        id,
        status: "active",
        name: source.name,
        startedAt: inputs.at,
        rest: null,
        exercises: source.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          category: exercise.category,
          id: inputs.id(),
          sets: exercise.sets.map((set) => ({
            ...set,
            id: inputs.id(),
            completed: false,
            reps: setTargetReps(set),
            targetReps: setTargetReps(set),
          })),
        })),
      },
    });
  }
  function startWorkout(
    request: Extract<Command, { type: "start" | "start-selected" }>,
  ): Transition {
    const routine =
      request.type === "start"
        ? ownRecord(snapshot.routines, request.routineId)
        : null;
    if (request.type === "start" && !routine) return reject("routineNotFound");
    const sessionExercises =
      request.type === "start-selected"
        ? selectedExercises(request.exerciseIds)
        : routineExercises(routine);
    if (typeof sessionExercises === "string") return reject(sessionExercises);
    const id = inputs.id();
    if (ownRecord(snapshot.completed, id)) return reject("workoutIdExists");
    return changed({
      ...snapshot,
      active: {
        id,
        status: "active",
        name: startName(request, routine),
        startedAt: inputs.at,
        exercises: sessionExercises,
        rest: null,
      },
    });
  }
  function routineExercises(
    routine: Routine | null | undefined,
  ): SessionExercise[] | RejectionCode {
    const sessionExercises: SessionExercise[] = [];
    for (const row of routine?.exercises ?? []) {
      const exercise = ownRecord(snapshot.exercises, row.exerciseId);
      if (!exercise) return "exerciseNotFound";
      sessionExercises.push({
        id: inputs.id(),
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: row.sets.map((set) => ({
          id: inputs.id(),
          weightKg: set.weightKg,
          reps: set.reps,
          targetReps: set.reps,
          completed: false,
        })),
      });
    }
    return sessionExercises;
  }
  function selectedExercises(
    ids: readonly string[],
  ): SessionExercise[] | RejectionCode {
    const additions: SessionExercise[] = [];
    for (const exerciseId of ids) {
      const exercise = ownRecord(snapshot.exercises, exerciseId);
      if (!exercise) return "exerciseNotFound";
      additions.push({
        id: inputs.id(),
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: [
          {
            id: inputs.id(),
            weightKg: 0,
            reps: 8,
            targetReps: 8,
            completed: false,
          },
        ],
      });
    }
    return additions;
  }
}
