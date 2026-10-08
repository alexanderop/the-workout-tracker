type Id = string

type WorkoutSet = Readonly<{
  id: Id
  weightKg: number
  reps: number
  completed: boolean
}>

type Exercise = Readonly<{ id: Id; name: string; category: string }>
type RoutineExercise = Readonly<{
  exerciseId: Id
  sets: readonly Readonly<{ weightKg: number; reps: number }>[]
}>
type Routine = Readonly<{ id: Id; name: string; exercises: readonly RoutineExercise[] }>
type SessionExercise = Readonly<{
  id: Id
  exerciseId: Id
  name: string
  sets: readonly WorkoutSet[]
}>
type Rest = Readonly<{ setId: Id; endsAt: number }>
type ActiveSession = Readonly<{
  id: Id
  status: 'active'
  name: string
  startedAt: number
  exercises: readonly SessionExercise[]
  rest: Rest | null
}>
type CompletedSession = Readonly<{
  id: Id
  status: 'completed'
  name: string
  startedAt: number
  finishedAt: number
  exercises: readonly SessionExercise[]
}>
type Settings = Readonly<{ unit: 'kg'; restSeconds: number }>
type Snapshot = Readonly<{
  revision: number
  exercises: Readonly<Record<Id, Exercise>>
  routines: Readonly<Record<Id, Routine>>
  active: ActiveSession | null
  completed: Readonly<Record<Id, CompletedSession>>
  settings: Settings
}>
type Command =
  | Readonly<{ type: 'start'; routineId: Id }>
  | Readonly<{ type: 'set-values'; sessionId: Id; exerciseId: Id; setId: Id; weightKg: number; reps: number }>
  | Readonly<{ type: 'set-completed'; sessionId: Id; setId: Id; completed: boolean }>
  | Readonly<{ type: 'add-set'; sessionId: Id; exerciseId: Id }>
  | Readonly<{ type: 'add-exercise'; sessionId: Id; exerciseId: Id }>
  | Readonly<{ type: 'finish'; sessionId: Id }>
  | Readonly<{ type: 'stop-rest'; sessionId: Id }>
  | Readonly<{ type: 'save-routine'; routine: Routine }>
  | Readonly<{ type: 'save-exercise'; exercise: Exercise }>
  | Readonly<{ type: 'settings'; settings: Settings }>

type Result =
  | Readonly<{ kind: 'saved'; snapshot: Snapshot }>
  | Readonly<{ kind: 'conflict'; snapshot: Snapshot }>
  | Readonly<{ kind: 'invalid'; message: string }>
  | Readonly<{ kind: 'unavailable'; message: string }>

type LoadState =
  | Readonly<{ kind: 'loading' }>
  | Readonly<{ kind: 'ready'; snapshot: Snapshot }>
  | Readonly<{ kind: 'recovery'; message: string; rawExport: string }>
  | Readonly<{ kind: 'unavailable'; message: string }>

type Inputs = Readonly<{ at: number; freshIds: readonly Id[] }>
type Transition =
  | Readonly<{ kind: 'changed'; snapshot: Snapshot }>
  | Readonly<{ kind: 'unchanged'; snapshot: Snapshot }>
  | Readonly<{ kind: 'rejected'; message: string }>

type Progress = Readonly<{
  completedWorkouts: number
  completedSets: number
  totalVolumeKg: number
  personalRecords: Readonly<Record<Id, Readonly<{ weightKg: number; reps: number; at: number }>>>
}>

type Workouts = Readonly<{
  execute(command: Command, expectedRevision: number): Promise<Result>
  subscribe(listener: (state: LoadState) => void): () => void
  exportBackup(): Promise<string>
  importBackup(json: string, expectedRevision: number): Promise<Result>
  close(): void
}>

export function openWorkouts(dependencies: Readonly<{
  databaseName: string
  now: () => number
  id: () => string
}>): Workouts {
  throw new Error('not implemented')
}

export function reduceWorkout(snapshot: Snapshot, command: Command, inputs: Inputs): Transition {
  throw new Error('not implemented')
}

export function deriveProgress(completed: Readonly<Record<Id, CompletedSession>>): Progress {
  throw new Error('not implemented')
}

export function remainingRestSeconds(active: ActiveSession, at: number): number {
  throw new Error('not implemented')
}

export type { Snapshot, LoadState, Command, Result, Workouts }
