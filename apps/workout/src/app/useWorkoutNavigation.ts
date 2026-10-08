import { computed, inject, nextTick, onScopeDispose, provide } from "vue";
import type { InjectionKey } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { WorkoutPage } from "../features/workouts/ui";
import { crossesHistoryView } from "./router";

type PrepareLinkNavigation = (event: MouseEvent, next: WorkoutPage) => void;
const linkNavigationKey: InjectionKey<PrepareLinkNavigation> = Symbol(
  "PrepareLinkNavigation",
);

/** Lets a routed page's own links share the shell's focus management. */
export function useLinkNavigation(): PrepareLinkNavigation {
  const prepare = inject(linkNavigationKey);
  if (!prepare)
    throw new Error("Workout links require the application navigation.");
  return prepare;
}

export function useWorkoutNavigation(
  clearMessage: () => void,
  reportError: (message: string) => void,
  focusMain: () => void,
) {
  const route = useRoute();
  const router = useRouter();
  const page = computed(() => route.name);
  let focusedLink: EventTarget | null = null;

  function prepareLinkNavigation(event: MouseEvent, next: WorkoutPage) {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (page.value !== destination(next).name) clearMessage();
    focusedLink = event.currentTarget;
  }

  onScopeDispose(
    router.afterEach((to, from, failure) => {
      const link = focusedLink;
      focusedLink = null;
      if (failure) return;
      // Templates keeps focus with its dialog owner even when leaving History.
      if (
        crossesHistoryView(to, from) &&
        to.name === "workouts" &&
        to.params.view !== "templates"
      ) {
        nextTick(focusMain).catch(reportNavigationError);
        return;
      }
      if (to.path === from.path || !link) return;
      nextTick(() => {
        // A link removed by the navigation leaves focus on <body>.
        const focused = document.activeElement;
        if (!focused || focused === link || focused === document.body)
          focusMain();
      }).catch(reportNavigationError);
    }),
  );

  function reportNavigationError() {
    reportError("This page could not be opened. Please try again or reload.");
  }
  onScopeDispose(router.onError(reportNavigationError));

  function destination(next: WorkoutPage) {
    if (next === "today" || next === "history" || next === "workouts") {
      return {
        name: "workouts",
        params: { view: "home" },
      } as const;
    }
    return { name: next };
  }

  const workoutsHref = computed(
    () => router.resolve(destination("workouts")).href,
  );

  function navigate(next: WorkoutPage) {
    focusedLink = null;
    if (page.value !== destination(next).name) clearMessage();
    router.push(destination(next)).catch(reportNavigationError);
  }

  function selectWorkoutView(
    view: "home" | "history" | "templates",
    mode: "push" | "replace" = "push",
  ) {
    if (route.name !== "workouts") return;
    router[mode]({ name: "workouts", params: { view } }).catch(
      reportNavigationError,
    );
  }

  provide(linkNavigationKey, prepareLinkNavigation);

  return {
    page,
    workoutView: computed(() =>
      route.name === "workouts" ? route.params.view : undefined,
    ),
    destination,
    navigate,
    selectWorkoutView,
    workoutsHref,
    prepareLinkNavigation,
  };
}
