import {
  setTargetReps,
  type Command,
  type Inputs,
  type Transition,
} from "./commands";
import { ownRecord } from "./schemas";
import type {
  ActiveSession,
  CompletedSession,
  SessionExercise,
  Snapshot,
  WorkoutSet,
} from "./schemas";
import { sessionTotals } from "./session";

/** What the session-scoped transitions need from the reducer entry point. */
export type ReducerContext = {
  readonly snapshot: Snapshot;
  readonly inputs: Inputs;
  readonly reject: (message: string) => Transition;
  readonly unchanged: () => Transition;
  readonly changed: (next: Snapshot) => Transition;
  readonly selectedExercises: (
    ids: readonly string[],
  ) => SessionExercise[] | string;
};

export function reduceActive(
  context: ReducerContext,
  command: Exclude<
    Extract<Command, { sessionId: string }>,
    { type: "rename-completed" | "correct-completed" }
  >,
): Transition {
  const { snapshot, inputs, reject, unchanged, changed, selectedExercises } =
    context;
  if (command.type === "finish" && ownRecord(snapshot.completed, command.sessionId))
    return unchanged();
  const candidate = snapshot.active;
  if (!candidate || candidate.id !== command.sessionId)
    return reject("This workout is no longer active.");
  const active = candidate;
  const saveActive = (next: ActiveSession): Transition =>
    changed({ ...snapshot, active: next });
  switch (command.type) {
    case "rename":
      return saveActive({ ...active, name: command.name.trim() });
    case "discard":
      return changed({ ...snapshot, active: null });
    case "finish":
      return finishWorkout();
    case "stop-rest":
      return saveActive({ ...active, rest: null });
    case "add-exercise":
    case "add-exercises":
      return addExercises(command);
    case "remove-exercise":
    case "set-exercise-note":
    case "replace-exercise":
    case "configure-exercise":
    case "add-set":
    case "remove-set":
    case "set-entry":
    case "set-values":
    case "set-completed":
      return reduceExercise(command);
  }
  function finishWorkout(): Transition {
    if (!sessionTotals(active).completedSets)
      return reject("Complete at least one set before finishing.");
    const completed: CompletedSession = {
      id: active.id,
      status: "completed",
      name: active.name,
      startedAt: active.startedAt,
      finishedAt: Math.max(active.startedAt, inputs.at),
      exercises: active.exercises,
    };
    return changed({
      ...snapshot,
      active: null,
      completed: { ...snapshot.completed, [completed.id]: completed },
    });
  }
  function addExercises(
    request: Extract<Command, { type: "add-exercise" | "add-exercises" }>,
  ): Transition {
    const ids =
      request.type === "add-exercise"
        ? [request.exerciseId]
        : request.exerciseIds;
    if (active.exercises.length + ids.length > 50)
      return reject("A workout can contain up to 50 exercises.");
    const additions = selectedExercises(ids);
    if (typeof additions === "string") return reject(additions);
    return saveActive({
      ...active,
      exercises: [...active.exercises, ...additions],
    });
  }
  function reduceExercise(
    request: Extract<
      Command,
      {
        type:
          | "remove-exercise"
          | "configure-exercise"
          | "set-exercise-note"
          | "replace-exercise"
          | "add-set"
          | "remove-set"
          | "set-entry"
          | "set-values"
          | "set-completed";
      }
    >,
  ): Transition {
    const candidateExercise =
      request.type === "set-completed"
        ? active.exercises.find((row) =>
            row.sets.some((set) => set.id === request.setId),
          )
        : active.exercises.find((row) => row.id === request.exerciseId);
    if (!candidateExercise) return reject("Workout exercise was not found.");
    const exercise = candidateExercise;
    if (request.type === "remove-exercise") {
      if (active.exercises.length === 1)
        return reject(
          "A workout needs at least one exercise. Discard the workout instead.",
        );
      return saveActive({
        ...active,
        exercises: active.exercises.filter((row) => row.id !== exercise.id),
        rest: exercise.sets.some((set) => set.id === active.rest?.setId)
          ? null
          : active.rest,
      });
    }
    const saveExercise = (
      next: SessionExercise,
      rest = active.rest,
    ): Transition =>
      saveActive({
        ...active,
        rest,
        exercises: active.exercises.map((row) =>
          row.id === next.id ? next : row,
        ),
      });
    if (request.type === "set-exercise-note")
      return setExerciseNote(request.note);
    if (request.type === "replace-exercise")
      return replaceExercise(request.replacementExerciseId);
    if (request.type === "configure-exercise")
      return configureExercise(request);
    if (request.type === "add-set") return addSet(request);
    return updateSet(request);
    function setExerciseNote(noteInput: string): Transition {
      const { note: previousNote, ...withoutNote } = exercise;
      const note = noteInput.trim();
      if (note === (previousNote ?? "")) return unchanged();
      return saveExercise({ ...withoutNote, ...(note ? { note } : {}) });
    }
    function replaceExercise(replacementId: string): Transition {
      const replacement = ownRecord(snapshot.exercises, replacementId);
      if (!replacement) return reject("Exercise was not found.");
      if (replacement.id === exercise.exerciseId)
        return reject("Choose a different exercise.");
      const remaining = exercise.sets.filter((set) => !set.completed);
      const logged = exercise.sets.filter((set) => set.completed);
      if (!remaining.length)
        return reject("All sets are logged. Add another exercise instead.");
      if (logged.length && active.exercises.length >= 50)
        return reject("A workout can contain up to 50 exercises.");
      const next: SessionExercise = {
        id: inputs.id(),
        exerciseId: replacement.id,
        name: replacement.name,
        category: replacement.category,
        sets: remaining.map((set) => ({
          id: inputs.id(),
          weightKg: 0,
          reps: setTargetReps(set),
          targetReps: setTargetReps(set),
          completed: false,
        })),
      };
      return saveActive({
        ...active,
        exercises: active.exercises.flatMap((row) => {
          if (row.id !== exercise.id) return [row];
          return logged.length
            ? [{ ...exercise, sets: logged }, next]
            : [next];
        }),
        rest: remaining.some((set) => set.id === active.rest?.setId)
          ? null
          : active.rest,
      });
    }
    function configureExercise(
      configuration: Extract<Command, { type: "configure-exercise" }>,
    ): Transition {
      const logged = exercise.sets.filter((set) => set.completed).length;
      if (configuration.setCount < logged)
        return reject(
          "The set count cannot remove logged work. Clear a set explicitly first.",
        );
      let remaining = configuration.setCount - logged;
      const retained = exercise.sets
        .filter((set) => {
          if (set.completed) return true;
          return remaining-- > 0;
        })
        .map((set) => {
          if (set.completed || !configuration.values) return set;
          return {
            ...set,
            ...configuration.values,
            targetReps: configuration.values.reps,
          };
        });
      const previous = exercise.sets.at(-1);
      if (!previous) return reject("Exercise has no sets.");
      const values = configuration.values ?? {
        weightKg: previous.weightKg,
        reps: setTargetReps(previous),
      };
      while (retained.length < configuration.setCount)
        retained.push({
          id: inputs.id(),
          ...values,
          targetReps: values.reps,
          completed: false,
        });
      return saveExercise({ ...exercise, sets: retained });
    }
    function addSet(
      addition: Extract<Command, { type: "add-set" }>,
    ): Transition {
      const previous = exercise.sets.at(-1);
      if (!previous) return reject("Exercise has no sets.");
      const reps = addition.values?.reps ?? setTargetReps(previous);
      return saveExercise({
        ...exercise,
        sets: [
          ...exercise.sets,
          {
            id: inputs.id(),
            weightKg: addition.values?.weightKg ?? previous.weightKg,
            reps: reps,
            targetReps: reps,
            completed: false,
          },
        ],
      });
    }
    function updateSet(
      update: Extract<
        Command,
        { type: "remove-set" | "set-entry" | "set-values" | "set-completed" }
      >,
    ): Transition {
      const set = exercise.sets.find((row) => row.id === update.setId);
      if (!set) return reject("Set was not found.");
      if (update.type === "remove-set") {
        if (exercise.sets.length === 1)
          return reject("Keep at least one set per exercise.");
        return saveExercise(
          {
            ...exercise,
            sets: exercise.sets.filter((row) => row.id !== set.id),
          },
          active.rest?.setId === set.id ? null : active.rest,
        );
      }
      const nextSet = changedSet(set, update);
      if (!nextSet.completed && nextSet.reps === 0)
        return reject("Planned sets need at least one target repetition.");
      const rest = nextRest(set, nextSet);
      return saveExercise(
        {
          ...exercise,
          sets: exercise.sets.map((row) =>
            row.id === set.id ? nextSet : row,
          ),
        },
        rest,
      );
    }
    function nextRest(
      set: WorkoutSet,
      nextSet: WorkoutSet,
    ): ActiveSession["rest"] {
      let rest = active.rest;
      if (
        !set.completed &&
        nextSet.completed &&
        snapshot.settings.autoRest &&
        snapshot.settings.restSeconds > 0
      )
        rest = {
          setId: set.id,
          endsAt: inputs.at + snapshot.settings.restSeconds * 1000,
        };
      if (!nextSet.completed && rest?.setId === set.id) rest = null;
      return rest;
    }
  }
}

function changedSet(
  set: WorkoutSet,
  command: Extract<
    Command,
    { type: "set-entry" | "set-values" | "set-completed" }
  >,
): WorkoutSet {
  const target = setTargetReps(set);
  if (command.type === "set-completed")
    return {
      ...set,
      completed: command.completed,
      reps: command.completed ? set.reps : target,
    };
  if (command.type === "set-entry")
    return {
      ...set,
      weightKg: command.weightKg,
      reps: command.completed ? command.reps : target,
      targetReps: target,
      completed: command.completed,
    };
  return {
    ...set,
    weightKg: command.weightKg,
    reps: command.reps,
    targetReps: set.completed ? target : Math.max(1, command.reps),
  };
}
