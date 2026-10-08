import {
  commandSchema,
  setTargetReps,
  type Command,
  type Inputs,
  type Transition,
} from "./commands";
import { reduceActive, type ReducerContext } from "./activeReducer";
import {
  snapshotSchema,
  timestamp,
  type Routine,
  type SessionExercise,
  type Snapshot,
} from "./schemas";

export function reduceWorkout(
  snapshot: Snapshot,
  command: Command,
  inputs: Inputs,
): Transition {
  const parsed = commandSchema.safeParse(command);
  if (!parsed.success || !timestamp.safeParse(inputs.at).success)
    return { kind: "rejected", message: "Please check the entered values." };
  const reject = (message: string): Transition => ({
    kind: "rejected",
    message,
  });
  const unchanged = (): Transition => ({ kind: "unchanged", snapshot });
  const changed = (next: Snapshot): Transition => {
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return unchanged();
    const validated = snapshotSchema.safeParse({
      ...next,
      revision: snapshot.revision + 1,
    });
    return validated.success
      ? { kind: "changed", snapshot: validated.data }
      : reject(validated.error.issues[0]?.message ?? "Invalid workout change.");
  };
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
      const completed = snapshot.completed[command.sessionId];
      if (!completed) return reject("This completed workout was not found.");
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
  function correctCompleted(command: Extract<Command, { type: "correct-completed" }>): Transition {
      const completed = snapshot.completed[command.sessionId];
      if (!completed) return reject("This completed workout was not found.");
      const patches = new Map<string, (typeof command.sets)[number]>();
      for (const patch of command.sets) {
        const exercise = completed.exercises.find((row) => row.id === patch.exerciseId);
        const set = exercise?.sets.find((row) => row.id === patch.setId);
        if (!set) return reject("This set was not found in the completed workout.");
        if (!set.completed) return reject("Only logged sets can be corrected.");
        if (patches.has(patch.setId)) return reject("A set can only be corrected once.");
        patches.set(patch.setId, patch);
      }
      return changed({
        ...snapshot,
        completed: {
          ...snapshot.completed,
          [completed.id]: {
            ...completed,
            name: command.name?.trim() ?? completed.name,
            exercises: completed.exercises.map((exercise) => ({
              ...exercise,
              sets: exercise.sets.map((set) => {
                const patch = patches.get(set.id);
                return patch ? { ...set, weightKg: patch.weightKg, reps: patch.reps } : set;
              }),
            })),
          },
        },
      });
    }
  function repeatWorkout(
    command: Extract<Command, { type: "repeat" }>,
  ): Transition {
    if (snapshot.active) return reject("Finish your current workout first.");
    const source = snapshot.completed[command.completedId];
    if (!source) return reject("Workout was not found.");
    const id = inputs.id();
    if (snapshot.completed[id]) return reject("Workout ID already exists.");
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
    command: Extract<Command, { type: "start" | "start-selected" }>,
  ): Transition {
    if (snapshot.active) return reject("Finish your current workout first.");
    const routine = command.type === "start" ? snapshot.routines[command.routineId] : null;
    if (command.type === "start" && !routine) return reject("Routine was not found.");
    const sessionExercises = command.type === "start-selected"
      ? selectedExercises(command.exerciseIds)
      : routineExercises(routine);
    if (typeof sessionExercises === "string") return reject(sessionExercises);
    const id = inputs.id();
    if (snapshot.completed[id]) return reject("Workout ID already exists.");
    return changed({
      ...snapshot,
      active: {
        id,
        status: "active",
        name: routine?.name ?? "New workout",
        startedAt: inputs.at,
        exercises: sessionExercises,
        rest: null,
      },
    });
  }
  function routineExercises(
    routine: Routine | null | undefined,
  ): SessionExercise[] | string {
    const sessionExercises: SessionExercise[] = [];
    for (const row of routine?.exercises ?? []) {
      const exercise = snapshot.exercises[row.exerciseId];
      if (!exercise) return "Exercise was not found.";
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
  function selectedExercises(ids: readonly string[]): SessionExercise[] | string {
    const additions: SessionExercise[] = [];
    for (const exerciseId of ids) {
      const exercise = snapshot.exercises[exerciseId];
      if (!exercise) return "Exercise was not found.";
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
