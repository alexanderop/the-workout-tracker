import {
  initialSnapshot,
  snapshotSchema,
  type ActiveSession,
  type CompletedSession,
  type Exercise,
  type SessionExercise,
  type Snapshot,
  type WorkoutSet,
} from "../../src/features/workouts/domain";
import type { SetDraft } from "../../src/features/workouts/domain/drafts";

export const FIXED_NOW = 1_800_000_000_000;

export function createWorkoutFactory(seed = "workout") {
  let sequence = 0;
  const id = () => `${seed}-${++sequence}`;
  const set = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({
    id: id(),
    weightKg: 40,
    reps: 8,
    targetReps: 8,
    completed: false,
    ...overrides,
  });
  const exercise = (overrides: Partial<Exercise> = {}): Exercise => ({
    id: id(),
    name: "Custom press",
    category: "Chest",
    equipment: "Barbell",
    custom: true,
    ...overrides,
  });
  const sessionExercise = (
    overrides: Partial<SessionExercise> = {},
  ): SessionExercise => ({
    id: id(),
    exerciseId: "bench-press",
    name: "Bench press",
    category: "Chest",
    sets: [set()],
    ...overrides,
  });
  const activeSession = (
    overrides: Partial<ActiveSession> = {},
  ): ActiveSession => ({
    id: id(),
    name: "Morning workout",
    status: "active",
    startedAt: FIXED_NOW,
    exercises: [sessionExercise()],
    rest: null,
    ...overrides,
  });
  const completedSession = (
    overrides: Partial<CompletedSession> = {},
  ): CompletedSession => ({
    id: id(),
    name: "Previous workout",
    status: "completed",
    startedAt: FIXED_NOW - 3_600_000,
    finishedAt: FIXED_NOW,
    exercises: [sessionExercise({ sets: [set({ completed: true })] })],
    ...overrides,
  });
  const snapshot = (overrides: Partial<Snapshot> = {}): Snapshot =>
    snapshotSchema.parse({ ...initialSnapshot(), ...overrides });
  const draft = (overrides: Partial<SetDraft> = {}): SetDraft => ({
    id: id(),
    writer: seed,
    sessionId: id(),
    setId: id(),
    weight: "45",
    reps: "8",
    revision: 0,
    base: { weightKg: 40, reps: 8, targetReps: 8, completed: false },
    ...overrides,
  });
  return {
    id,
    set,
    exercise,
    sessionExercise,
    activeSession,
    completedSession,
    snapshot,
    draft,
  };
}
