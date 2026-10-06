import {
  initialSnapshot,
  snapshotSchema,
  type Snapshot,
  type SessionExercise,
  type ActiveSession,
} from "../features/workouts";

export const previewEpoch = Date.UTC(2026, 9, 5, 10);
type Scenario = {
  readonly route:
    "/workouts" | "/exercises" | "/session" | "/progress" | "/settings";
  readonly seed: () => Snapshot;
  readonly initialExerciseSearch?: string;
  readonly view?: "templates";
};
function sessionExercises(
  prefix: string,
  logged: number,
  gain = 0,
): SessionExercise[] {
  const catalog = initialSnapshot().exercises;
  return ["bench-press", "row", "squat"].map((id, index) => {
    const exercise = catalog[id];
    if (!exercise) throw new Error(`Missing example exercise: ${id}`);
    return {
      id: `${prefix}-exercise-${index}`,
      exerciseId: id,
      name: exercise.name,
      category: exercise.category,
      sets: Array.from({ length: 3 }, (_, set) => ({
        id: `${prefix}-set-${index}-${set}`,
        weightKg: ({ "bench-press": 60, row: 20, squat: 80 }[id] ?? 0) + gain,
        reps: 8,
        targetReps: 8,
        completed: index * 3 + set < logged,
      })),
    };
  });
}
function history(): Snapshot {
  const completed = Object.fromEntries(
    Array.from({ length: 6 }, (_, index) => {
      const id = `example-history-${index}`;
      const startedAt = previewEpoch - (18 - index * 3) * 86400000;
      return [
        id,
        {
          id,
          name: "Full body",
          status: "completed" as const,
          startedAt,
          finishedAt: startedAt + 45 * 60000,
          exercises: sessionExercises(id, 9, index * 2.5),
        },
      ];
    }),
  );
  return snapshotSchema.parse({ ...initialSnapshot(), completed });
}
function templates(): Snapshot {
  return snapshotSchema.parse({
    ...history(),
    routines: {
      "example-template": {
        id: "example-template",
        name: "Full body",
        description: "Three movements, three sets each.",
        exercises: sessionExercises("template", 0).map((exercise) => ({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map((set) => ({
            weightKg: set.weightKg,
            reps: set.reps,
          })),
        })),
      },
    },
  });
}
function training(logged: number, resting = false): Snapshot {
  const active: ActiveSession = {
    id: "example-active",
    status: "active",
    name: "Full body",
    startedAt: previewEpoch - 12 * 60000,
    exercises: sessionExercises("active", logged),
    rest: resting
      ? { setId: "active-set-0-0", endsAt: previewEpoch + 90000 }
      : null,
  };
  return snapshotSchema.parse({ ...templates(), active });
}
export const scenarios = {
  "workouts.first-visit": { route: "/workouts", seed: initialSnapshot },
  "workouts.history": { route: "/workouts", seed: history },
  "workouts.templates": {
    route: "/workouts",
    seed: templates,
    view: "templates",
  },
  "workouts.active": { route: "/workouts", seed: () => training(2) },
  "exercises.all": { route: "/exercises", seed: initialSnapshot },
  "exercises.filtered": {
    route: "/exercises",
    seed: initialSnapshot,
    initialExerciseSearch: "Dumbbell",
  },
  "exercises.no-results": {
    route: "/exercises",
    seed: initialSnapshot,
    initialExerciseSearch: "No matching movement",
  },
  "training.ready": { route: "/session", seed: () => training(0) },
  "training.partial": { route: "/session", seed: () => training(4) },
  "training.resting": { route: "/session", seed: () => training(1, true) },
  "training.completed": { route: "/session", seed: () => training(9) },
  "progress.empty": { route: "/progress", seed: initialSnapshot },
  "progress.history": { route: "/progress", seed: history },
  "settings.default": { route: "/settings", seed: initialSnapshot },
  "flows.first-workout": { route: "/workouts", seed: initialSnapshot },
  "flows.repeat-workout": { route: "/workouts", seed: history },
  "flows.finish-review": { route: "/session", seed: () => training(9) },
} satisfies Record<string, Scenario>;
export type ScenarioId = keyof typeof scenarios;
function isScenarioId(input: unknown): input is ScenarioId {
  return typeof input === "string" && Object.hasOwn(scenarios, input);
}
export function parseScenarioId(input: unknown): ScenarioId {
  if (input === null) return "workouts.first-visit";
  if (isScenarioId(input)) return input;
  throw new Error("Unknown design example. Open an example from Histoire.");
}
export function getScenario(id: ScenarioId): Scenario {
  return scenarios[id];
}
