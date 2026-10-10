import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  initialSnapshot,
  reduceWorkout,
  sessionTotals,
  setTargetReps,
  snapshotSchema,
  type ActiveSession,
  type Command,
  type CompletedSession,
  type SessionExercise,
  type Snapshot,
  type Transition,
  type WorkoutSet,
} from "../../src/features/workouts/domain";
import { createWorkoutFactory, FIXED_NOW } from "../support/factories";

// Random user sessions against the pure reducer. Each step picks its targets
// from the current snapshot, so most generated commands are reachable from the
// interface; stale or invalid ones exercise the rejection paths. On failure,
// fast-check shrinks the sequence to the shortest one that breaks a rule.

const CATALOG = Object.keys(initialSnapshot().exercises);

// Weights favour logging and editing, so journeys build up logged work before
// a finish or discard ends them.
const KINDS = [
  ["start-selected", 2],
  ["repeat", 1],
  ["rename", 1],
  ["add-exercises", 2],
  ["set-entry", 6],
  ["set-values", 4],
  ["set-completed", 6],
  ["add-set", 3],
  ["configure-exercise", 4],
  ["remove-set", 2],
  ["remove-exercise", 1],
  ["set-exercise-note", 1],
  ["replace-exercise", 3],
  ["finish", 1],
  ["discard", 1],
  ["stop-rest", 1],
  ["settings", 1],
] as const satisfies readonly (readonly [Command["type"], number])[];
type Kind = (typeof KINDS)[number][0];

const stepArbitrary = fc.record({
  kind: fc.oneof(
    ...KINDS.map(([kind, weight]) => ({
      arbitrary: fc.constant<Kind>(kind),
      weight,
    })),
  ),
  pick: fc.nat({ max: 999 }),
  other: fc.nat({ max: 999 }),
  weightKg: fc.integer({ min: 0, max: 400 }).map((halves) => halves / 2),
  reps: fc.integer({ min: 0, max: 20 }),
  completed: fc.boolean(),
  setCount: fc.integer({ min: 1, max: 5 }),
  advanceMs: fc.integer({ min: 0, max: 300_000 }),
});
type Step = typeof stepArbitrary extends fc.Arbitrary<infer T> ? T : never;
// Without an explicit size, fast-check keeps arrays to about ten items.
const journeyArbitrary = fc.array(stepArbitrary, {
  minLength: 1,
  maxLength: 60,
  size: "max",
});

function pick<T>(items: readonly T[], index: number): T | undefined {
  return items.length ? items[index % items.length] : undefined;
}

function pickExercises(start: number, count: number): string[] {
  return Array.from(
    { length: count },
    (_, offset) => CATALOG[(start + offset) % CATALOG.length]!,
  );
}

type Target = {
  readonly step: Step;
  readonly active: ActiveSession;
  readonly exercise: SessionExercise;
  readonly set: WorkoutSet;
};
type Context = {
  readonly step: Step;
  readonly start: Command;
  readonly source: CompletedSession | undefined;
  readonly active: ActiveSession | null;
  readonly target: Target | undefined;
};

function onActive(build: (active: ActiveSession, step: Step) => Command) {
  return ({ active, step, start }: Context) =>
    active ? build(active, step) : start;
}

function addExercises(active: ActiveSession, step: Step): Command {
  return {
    type: "add-exercises",
    sessionId: active.id,
    exerciseIds: pickExercises(step.other, 1 + (step.pick % 2)),
  };
}

function onSet(build: (target: Target) => Command) {
  return (context: Context) => {
    if (!context.active) return context.start;
    return context.target
      ? build(context.target)
      : addExercises(context.active, context.step);
  };
}

function ids({ active, exercise }: Target) {
  return { sessionId: active.id, exerciseId: exercise.id };
}

const BUILDERS: Record<Kind, (context: Context) => Command> = {
  "start-selected": ({ start }) => start,
  repeat: ({ source, start }) =>
    source ? { type: "repeat", completedId: source.id } : start,
  settings: ({ step }) => ({
    type: "settings",
    settings: { restSeconds: step.reps * 15, autoRest: step.completed },
  }),
  rename: onActive((active, step) => ({
    type: "rename",
    sessionId: active.id,
    name: ` Session ${step.other} `,
  })),
  finish: onActive((active) => ({ type: "finish", sessionId: active.id })),
  discard: onActive((active) => ({ type: "discard", sessionId: active.id })),
  "stop-rest": onActive((active) => ({
    type: "stop-rest",
    sessionId: active.id,
  })),
  "add-exercises": onActive(addExercises),
  "set-entry": onSet((target) => ({
    type: "set-entry",
    ...ids(target),
    setId: target.set.id,
    weightKg: target.step.weightKg,
    reps: target.step.reps,
    completed: target.step.completed,
  })),
  "set-values": onSet((target) => ({
    type: "set-values",
    ...ids(target),
    setId: target.set.id,
    weightKg: target.step.weightKg,
    reps: target.step.reps,
  })),
  "set-completed": onSet(({ active, set, step }) => ({
    type: "set-completed",
    sessionId: active.id,
    setId: set.id,
    completed: step.completed,
  })),
  "add-set": onSet((target) => ({ type: "add-set", ...ids(target) })),
  "configure-exercise": onSet((target) => ({
    type: "configure-exercise",
    ...ids(target),
    setCount: target.step.setCount,
    ...(target.step.completed
      ? {
          values: {
            weightKg: target.step.weightKg,
            reps: target.step.reps + 1,
          },
        }
      : {}),
  })),
  "remove-set": onSet((target) => ({
    type: "remove-set",
    ...ids(target),
    setId: target.set.id,
  })),
  "remove-exercise": onSet((target) => ({
    type: "remove-exercise",
    ...ids(target),
  })),
  "set-exercise-note": onSet((target) => ({
    type: "set-exercise-note",
    ...ids(target),
    note: target.step.completed ? "  felt heavy  " : "",
  })),
  "replace-exercise": onSet((target) => ({
    type: "replace-exercise",
    ...ids(target),
    replacementExerciseId: pick(CATALOG, target.step.other)!,
  })),
};

function toCommand(snapshot: Snapshot, step: Step): Command {
  const active = snapshot.active;
  const exercise = active ? pick(active.exercises, step.pick) : undefined;
  const set = exercise ? pick(exercise.sets, step.other) : undefined;
  return BUILDERS[step.kind]({
    step,
    active,
    source: pick(Object.values(snapshot.completed), step.pick),
    start: {
      type: "start-selected",
      exerciseIds: pickExercises(step.pick, 1 + (step.other % 3)),
    },
    target:
      active && exercise && set ? { step, active, exercise, set } : undefined,
  });
}

function allSets(active: ActiveSession | null): WorkoutSet[] {
  return (active?.exercises ?? []).flatMap((exercise) => exercise.sets);
}

function loggedSets(active: ActiveSession | null): Map<string, WorkoutSet> {
  return new Map(
    allSets(active)
      .filter((set) => set.completed)
      .map((set) => [set.id, set]),
  );
}

function findExercise(snapshot: Snapshot, command: Command) {
  return "exerciseId" in command
    ? snapshot.active?.exercises.find((row) => row.id === command.exerciseId)
    : undefined;
}

// Sets a command may legitimately change or remove, besides adding new ones.
function touchedSetIds(snapshot: Snapshot, command: Command): Set<string> {
  if (command.type === "discard" || command.type === "finish")
    return new Set(allSets(snapshot.active).map((set) => set.id));
  if (command.type === "remove-exercise")
    return new Set(findExercise(snapshot, command)?.sets.map((set) => set.id));
  return "setId" in command ? new Set([command.setId]) : new Set();
}

const REST_COMMANDS = new Set<Command["type"]>([
  "set-entry",
  "set-completed",
  "remove-set",
  "remove-exercise",
  "replace-exercise",
  "stop-rest",
  "discard",
  "finish",
  "start-selected",
  "repeat",
]);

// Active-workout commands never alter history; finishing adds exactly one record.
function checkHistory(previous: Snapshot, command: Command, next: Snapshot) {
  for (const [id, record] of Object.entries(previous.completed))
    expect(next.completed[id]).toEqual(record);
  const added = Object.keys(next.completed).filter(
    (id) => !previous.completed[id],
  );
  const finished = command.type === "finish" ? previous.active : null;
  if (!finished) {
    expect(added).toEqual([]);
    return;
  }
  expect(added).toEqual([finished.id]);
  const record = next.completed[finished.id]!;
  expect(record.exercises).toEqual(finished.exercises);
  expect(sessionTotals(record)).toEqual(sessionTotals(finished));
  expect(sessionTotals(record).completedSets).toBeGreaterThan(0);
  expect(record.finishedAt).toBeGreaterThanOrEqual(record.startedAt);
}

// Logged work survives every command that does not explicitly target it, and
// confirming numbers never logs or unlogs a set.
function checkLoggedWork(previous: Snapshot, command: Command, next: Snapshot) {
  const touched = touchedSetIds(previous, command);
  const nextSets = new Map(allSets(next.active).map((set) => [set.id, set]));
  for (const [id, set] of loggedSets(previous.active))
    if (!touched.has(id)) expect(nextSets.get(id)).toEqual(set);
  if (command.type !== "set-values") return;
  const before = allSets(previous.active).find(
    (set) => set.id === command.setId,
  );
  expect(nextSets.get(command.setId)?.completed).toBe(before?.completed);
}

// Rest belongs to a logged set and only moves when logging changes.
function checkRest(previous: Snapshot, command: Command, next: Snapshot) {
  const rest = next.active?.rest;
  if (rest) expect(loggedSets(next.active).has(rest.setId)).toBe(true);
  if (!REST_COMMANDS.has(command.type))
    expect(rest).toEqual(previous.active?.rest);
}

// Starting or repeating creates fresh, unlogged work with new identities.
function checkStart(previous: Snapshot, command: Command, next: Snapshot) {
  if (command.type !== "start-selected" && command.type !== "repeat") return;
  expect(next.active?.rest).toBeNull();
  expect(loggedSets(next.active).size).toBe(0);
  const historyIds = new Set(
    Object.values(previous.completed).flatMap((session) => [
      session.id,
      ...session.exercises.flatMap((row) => [
        row.id,
        ...row.sets.map((set) => set.id),
      ]),
    ]),
  );
  for (const set of allSets(next.active))
    expect(historyIds.has(set.id)).toBe(false);
}

function findSet(snapshot: Snapshot, setId: string) {
  return allSets(snapshot.active).find((set) => set.id === setId);
}

// What an accepted edit must leave behind. These hold for "unchanged" results
// too, so a real edit that the reducer silently drops fails here.
function checkStored(command: Command, next: Snapshot) {
  if (command.type === "set-exercise-note") {
    // Notes are trimmed, and an empty note removes the field.
    const note = command.note.trim();
    expect(findExercise(next, command)?.note).toBe(note || undefined);
  }
  if (command.type === "rename")
    expect(next.active?.name).toBe(command.name.trim());
  if (command.type === "settings")
    expect(next.settings).toEqual(command.settings);
  if (command.type === "set-values")
    expect(findSet(next, command.setId)).toMatchObject({
      weightKg: command.weightKg,
      reps: command.reps,
    });
  if (command.type === "set-entry")
    expect(findSet(next, command.setId)).toMatchObject({
      weightKg: command.weightKg,
      completed: command.completed,
      ...(command.completed ? { reps: command.reps } : {}),
    });
}

function checkStep(
  previous: Snapshot,
  command: Command,
  transition: Transition,
): Snapshot {
  if (transition.kind === "rejected") return previous;
  checkStored(command, transition.snapshot);
  if (transition.kind !== "changed") return previous;
  const next = transition.snapshot;
  expect(snapshotSchema.safeParse(next).success).toBe(true);
  expect(next.revision).toBe(previous.revision + 1);
  checkHistory(previous, command, next);
  checkLoggedWork(previous, command, next);
  checkRest(previous, command, next);
  checkStart(previous, command, next);
  if (command.type === "configure-exercise")
    expect(findExercise(next, command)?.sets).toHaveLength(command.setCount);
  return next;
}

type Acceptance = (
  active: ActiveSession,
  exercise: SessionExercise | undefined,
) => boolean;

const always: Acceptance = () => true;

// Commands the domain contract allows. A rejection here means validation is
// hiding a broken transition instead of the user's change being applied.
function mustAccept(snapshot: Snapshot, command: Command): boolean {
  if (command.type === "settings") return true;
  const active = snapshot.active;
  if (!active || !("sessionId" in command) || command.sessionId !== active.id)
    return false;
  const rules: Partial<Record<Command["type"], Acceptance>> = {
    rename: always,
    discard: always,
    "stop-rest": always,
    "set-exercise-note": always,
    "remove-exercise": () => active.exercises.length > 1,
    "set-completed": always,
    finish: () => sessionTotals(active).completedSets > 0,
    "set-values": (_, exercise) =>
      "reps" in command &&
      (command.reps > 0 ||
        exercise?.sets.find(
          (set) => "setId" in command && set.id === command.setId,
        )?.completed === true),
    "set-entry": () =>
      command.type === "set-entry" && (command.completed || command.reps > 0),
    "add-set": (_, exercise) => (exercise?.sets.length ?? 30) < 30,
    "remove-set": (_, exercise) => (exercise?.sets.length ?? 1) > 1,
    "configure-exercise": (_, exercise) =>
      command.type === "configure-exercise" &&
      command.setCount >=
        (exercise?.sets.filter((set) => set.completed).length ?? 0),
    "add-exercises": () =>
      command.type === "add-exercises" &&
      active.exercises.length + command.exerciseIds.length <= 50,
  };
  return (
    rules[command.type]?.(active, findExercise(snapshot, command)) ?? false
  );
}

function runJourney(steps: readonly Step[]) {
  const factory = createWorkoutFactory("prop");
  let snapshot = initialSnapshot();
  let at = FIXED_NOW;
  for (const step of steps) {
    at += step.advanceMs;
    const command = toCommand(snapshot, step);
    const transition = reduceWorkout(snapshot, command, { at, id: factory.id });
    const refused =
      mustAccept(snapshot, command) && transition.kind === "rejected";
    expect({ type: command.type, refused }).toEqual({
      type: command.type,
      refused: false,
    });
    snapshot = checkStep(snapshot, command, transition);
  }
}

const MIN_UNDO_RUNS = 100;

function replay(steps: readonly Step[], id: () => string): Snapshot {
  let snapshot = initialSnapshot();
  for (const step of steps) {
    const transition = reduceWorkout(snapshot, toCommand(snapshot, step), {
      at: FIXED_NOW,
      id,
    });
    if (transition.kind === "changed") snapshot = transition.snapshot;
  }
  return snapshot;
}

function applyChanged(snapshot: Snapshot, command: Command, id: () => string) {
  const transition = reduceWorkout(snapshot, command, { at: FIXED_NOW, id });
  expect(transition.kind).toBe("changed");
  return transition.kind === "changed" ? transition.snapshot : snapshot;
}

// Hundreds of generated journeys take several seconds on CI with coverage
// instrumentation; the default 5s timeout would make the suite flaky.
const PROPERTY_TIMEOUT_MS = 60_000;

describe("given random workout journeys", () => {
  it(
    "should accept valid commands, keep history and preserve logged work",
    () => {
      fc.assert(fc.property(journeyArbitrary, runJourney), { numRuns: 300 });
    },
    PROPERTY_TIMEOUT_MS,
  );

  it(
    "should log any unlogged set with entered values and restore its target when undone",
    () => {
      let exercised = 0;
      fc.assert(
        fc.property(
          journeyArbitrary,
          fc.nat(),
          stepArbitrary,
          (steps, choice, entry) => {
            const factory = createWorkoutFactory("undo");
            const snapshot = replay(steps, factory.id);
            const active = snapshot.active;
            const set = pick(
              allSets(active).filter((row) => !row.completed),
              choice,
            );
            const exercise = active?.exercises.find((row) =>
              row.sets.some((candidate) => candidate.id === set?.id),
            );
            if (!active || !set || !exercise) return;
            exercised += 1;
            const target = { sessionId: active.id, setId: set.id };
            const logged = applyChanged(
              snapshot,
              {
                type: "set-entry",
                ...target,
                exerciseId: exercise.id,
                weightKg: entry.weightKg,
                reps: entry.reps,
                completed: true,
              },
              factory.id,
            );
            const undone = applyChanged(
              logged,
              { type: "set-completed", ...target, completed: false },
              factory.id,
            );
            expect(
              allSets(undone.active).find((row) => row.id === set.id),
            ).toEqual({
              ...set,
              weightKg: entry.weightKg,
              reps: setTargetReps(set),
              targetReps: setTargetReps(set),
            });
            expect(undone.active?.rest?.setId).not.toBe(set.id);
          },
        ),
        { numRuns: 200 },
      );
      // Journeys without an unlogged set skip the check; most must reach it.
      expect(exercised).toBeGreaterThanOrEqual(MIN_UNDO_RUNS);
    },
    PROPERTY_TIMEOUT_MS,
  );
});
