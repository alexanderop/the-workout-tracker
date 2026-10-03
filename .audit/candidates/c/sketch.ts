export type Id = string
export type Revision = number
export type Exercise = Readonly<{ id: Id; name: string; custom: boolean }>
export type SetEntry = Readonly<{
  id: Id
  weightKg: number
  reps: number
  completed: boolean
}>
export type SessionExercise = Readonly<{
  id: Id
  exerciseId: Id
  name: string
  sets: readonly SetEntry[]
}>
export type Routine = Readonly<{
  id: Id
  name: string
  exercises: readonly SessionExercise[]
}>
type SessionBase = Readonly<{
  id: Id
  revision: Revision
  name: string
  startedAt: number
  exercises: readonly SessionExercise[]
}>
export type ActiveSession = SessionBase & Readonly<{
  status: 'active'
  rest: Readonly<{ setId: Id; endsAt: number }> | null
}>
export type FinishedSession = SessionBase & Readonly<{
  status: 'finished'
  finishedAt: number
}>
export type Session = ActiveSession | FinishedSession
export type Settings = Readonly<{ unit: 'kg'; restSeconds: number }>
export type Snapshot = Readonly<{
  active: ActiveSession | null
  history: readonly FinishedSession[]
  routines: readonly Routine[]
  exercises: readonly Exercise[]
  settings: Settings
}>
export type Issue =
  | Readonly<{ kind: 'conflict'; message: string }>
  | Readonly<{ kind: 'invalid'; message: string }>
  | Readonly<{ kind: 'storage'; message: string }>
  | Readonly<{ kind: 'not-found'; message: string }>
export type Result<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; issue: Issue }>
export type SetEdit = Readonly<{
  sessionId: Id
  revision: Revision
  setId: Id
  weightKg: number
  reps: number
  completed: boolean
}>
export type BackupPreview = Readonly<{ exercises: number; routines: number; sessions: number }>
export type Progress = Readonly<{
  sessions: number
  completedSets: number
  volumeKg: number
  bestByExercise: ReadonlyMap<Id, number>
}>
export interface WorkoutService {
  watch(receive: (snapshot: Result<Snapshot>) => void): () => void
  start(routineId: Id): Promise<Result<ActiveSession>>
  editSet(edit: SetEdit): Promise<Result<ActiveSession>>
  finish(sessionId: Id, revision: Revision): Promise<Result<FinishedSession>>
  saveRoutine(routine: Routine): Promise<Result<Routine>>
  addExercise(name: string): Promise<Result<Exercise>>
  saveSettings(settings: Settings): Promise<Result<Settings>>
  exportBackup(): Promise<Result<string>>
  previewBackup(json: string): Result<BackupPreview>
  replaceFromBackup(json: string): Promise<Result<Snapshot>>
}

interface WriteScope {
  getActive(): Promise<ActiveSession | null>
  getSession(id: Id): Promise<Session | undefined>
  putSession(session: Session): Promise<void>
  setActive(id: Id | null): Promise<void>
  getRoutine(id: Id): Promise<Routine | undefined>
  putRoutine(routine: Routine): Promise<void>
  putExercise(exercise: Exercise): Promise<void>
  getSettings(): Promise<Settings>
  putSettings(settings: Settings): Promise<void>
}
interface Storage {
  transaction<T>(body: (scope: WriteScope) => Promise<T>): Promise<T>
  watch(receive: (snapshot: Result<Snapshot>) => void): () => void
  exportBackup(): Promise<string>
  previewBackup(json: string): Result<BackupPreview>
  replaceFromBackup(json: string): Promise<Snapshot>
}
export function createWorkoutService(dependencies: Readonly<{
  storage: Storage
  now: () => number
  id: () => Id
}>): WorkoutService {
  throw new Error('not implemented')
}
export function updateSet(
  session: ActiveSession,
  edit: SetEdit,
  now: number,
  restSeconds: number,
): Result<ActiveSession> {
  throw new Error('not implemented')
}
export function finishSession(session: ActiveSession, now: number): Result<FinishedSession> {
  throw new Error('not implemented')
}
export function deriveProgress(history: readonly FinishedSession[]): Progress {
  throw new Error('not implemented')
}
