export async function callerUsage(workouts: Workouts, routineId: RoutineId, session: SessionView, setId: SetId) {
  const stop = workouts.watch({ page: 'today' }, result => render(result))
  await workouts.execute({ type: 'start', routineId })
  await workouts.execute({ type: 'set', sessionId: session.id, expectedRevision: session.revision, setId, weightKg: 60, reps: 8, completed: true })
  await workouts.execute({ type: 'finish', sessionId: session.id, expectedRevision: session.revision })
  stop()
}

type Id<Kind extends string> = string & { readonly __kind: Kind }
type SessionId = Id<'session'>
type RoutineId = Id<'routine'>
type ExerciseId = Id<'exercise'>
type SetId = Id<'set'>
type Revision = number & { readonly __kind: 'revision' }
type EpochMs = number & { readonly __kind: 'epoch-ms' }

type SetView = Readonly<{ id: SetId; exerciseId: ExerciseId; exerciseName: string; order: number; weightKg: number; reps: number; completed: boolean }>
type SessionBase = Readonly<{ id: SessionId; title: string; startedAt: EpochMs; revision: Revision; sets: readonly SetView[] }>
type SessionView = SessionBase & (
  | { readonly status: 'active'; readonly rest: null | Readonly<{ deadline: EpochMs; setId: SetId }> }
  | { readonly status: 'finished'; readonly finishedAt: EpochMs }
)
type RoutineStep = Readonly<{ exerciseId: ExerciseId; sets: number; targetReps: number; restSeconds: number }>
type RoutineView = Readonly<{ id: RoutineId; name: string; revision: Revision; steps: readonly RoutineStep[] }>
type ExerciseView = Readonly<{ id: ExerciseId; name: string; custom: boolean }>
type Settings = Readonly<{ unit: 'kg'; defaultRestSeconds: number }>
type HistoryRow = Readonly<{ id: SessionId; title: string; finishedAt: EpochMs; durationMs: number; completedSets: number; volumeKg: number }>
type ExerciseProgress = Readonly<{ exerciseId: ExerciseId; exerciseName: string; bestWeightKg: number; bestReps: number; points: readonly Readonly<{ at: EpochMs; volumeKg: number; bestWeightKg: number }>[] }>

type EditSession = Readonly<{ sessionId: SessionId; expectedRevision: Revision }>
type Command =
  | Readonly<{ type: 'start'; routineId: RoutineId | null }>
  | (EditSession & Readonly<{ type: 'set'; setId: SetId; weightKg: number; reps: number; completed: boolean }>)
  | (EditSession & Readonly<{ type: 'add-exercise'; exerciseId: ExerciseId }>)
  | (EditSession & Readonly<{ type: 'add-set'; afterSetId: SetId }>)
  | (EditSession & Readonly<{ type: 'remove-set'; setId: SetId }>)
  | (EditSession & Readonly<{ type: 'rest'; action: 'skip' | 'restart' }>)
  | (EditSession & Readonly<{ type: 'finish' }>)
  | Readonly<{ type: 'save-routine'; id: RoutineId | null; expectedRevision: Revision | null; name: string; steps: readonly RoutineStep[] }>
  | Readonly<{ type: 'create-exercise'; name: string }>
  | Readonly<{ type: 'settings'; settings: Settings }>

type Failure =
  | Readonly<{ kind: 'invalid'; message: string }>
  | Readonly<{ kind: 'conflict'; latest: SessionView | RoutineView }>
  | Readonly<{ kind: 'missing'; message: string }>
  | Readonly<{ kind: 'storage'; message: string }>
type Result<Value> = Readonly<{ ok: true; value: Value }> | Readonly<{ ok: false; error: Failure }>
type CommandResult = Readonly<{ ok: true; session?: SessionView; routine?: RoutineView; exercise?: ExerciseView }> | Readonly<{ ok: false; error: Failure }>

type Query =
  | Readonly<{ page: 'today' }>
  | Readonly<{ page: 'workouts' }>
  | Readonly<{ page: 'session'; id: SessionId }>
  | Readonly<{ page: 'history' }>
  | Readonly<{ page: 'progress' }>
  | Readonly<{ page: 'settings' }>
type PageView =
  | Readonly<{ page: 'today'; active: SessionView | null; routines: readonly RoutineView[] }>
  | Readonly<{ page: 'workouts'; routines: readonly RoutineView[]; exercises: readonly ExerciseView[] }>
  | Readonly<{ page: 'session'; session: SessionView | null }>
  | Readonly<{ page: 'history'; sessions: readonly HistoryRow[] }>
  | Readonly<{ page: 'progress'; exercises: readonly ExerciseProgress[] }>
  | Readonly<{ page: 'settings'; settings: Settings }>

export interface Workouts {
  execute(command: Command): Promise<CommandResult>
  watch(query: Query, receive: (result: Result<PageView>) => void): () => void
  exportBackup(): Promise<Result<Blob>>
  importBackup(json: string): Promise<Result<Readonly<{ importedSessions: number }>>>
  close(): void
}

export function createWorkouts(dependencies: Readonly<{ databaseName: string; now: () => number; newId: () => string }>): Workouts {
  throw new Error('not implemented')
}

function projectProgress(sessions: readonly Extract<SessionView, { status: 'finished' }>[]): readonly ExerciseProgress[] {
  throw new Error('not implemented')
}

function remainingRestMs(session: SessionView, now: EpochMs): number {
  throw new Error('not implemented')
}

function render(result: Result<PageView>): void {
  throw new Error('not implemented')
}
