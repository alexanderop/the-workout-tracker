import { inject, provide } from "vue";
import type { InjectionKey, Ref } from "vue";
import type {
  useWorkoutWorkspace,
  WorkoutDialogs,
  WorkoutPage,
} from "../features/workouts/ui";

type InstallationCapability = {
  readonly installed: Readonly<Ref<boolean>>;
  readonly offlineReady: Readonly<Ref<boolean>>;
  readonly message: Readonly<Ref<string>>;
  readonly install: () => Promise<void>;
};

type WorkoutRouteContext = {
  readonly installation: InstallationCapability;
  readonly workspace: ReturnType<typeof useWorkoutWorkspace>;
  readonly dialogs: Readonly<
    Ref<Pick<
      InstanceType<typeof WorkoutDialogs>,
      | "startWorkout"
      | "editRoutine"
      | "showDetail"
      | "repeatWorkout"
      | "convertWorkout"
      | "openFinish"
      | "openPicker"
      | "showOptions"
      | "confirm"
      | "openCreateExercise"
    > | null>
  >;
  readonly workoutsHref: Readonly<Ref<string>>;
  readonly progressExercise: Ref<string>;
  readonly navigate: (page: WorkoutPage) => void;
  readonly selectWorkoutView: (view: "history" | "templates") => void;
};

const contextKey: InjectionKey<WorkoutRouteContext> = Symbol(
  "WorkoutRouteContext",
);

export function provideWorkoutRouteContext(context: WorkoutRouteContext): void {
  provide(contextKey, context);
}

export function useWorkoutRouteContext(): WorkoutRouteContext {
  const context = inject(contextKey);
  if (!context)
    throw new Error("Workout routes require the application workspace.");
  return context;
}
