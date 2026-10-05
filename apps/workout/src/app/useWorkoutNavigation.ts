import { computed, nextTick, onScopeDispose } from "vue";
import type { Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { WorkoutPage } from "../features/workouts/ui";

export function useWorkoutNavigation(
  message: Ref<string>,
  error: Ref<string>,
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
    if (page.value !== destination(next).name) message.value = "";
    focusedLink = event.currentTarget;
  }

  onScopeDispose(
    router.afterEach((to, from, failure) => {
      const link = focusedLink;
      focusedLink = null;
      if (failure) return;
      if (
        to.name === "workouts" &&
        from.name === "workouts" &&
        to.params.view !== "templates" &&
        to.params.view !== from.params.view &&
        (to.params.view === "history" || from.params.view === "history")
      ) {
        nextTick(focusMain).catch(reportNavigationError);
        return;
      }
      if (to.path === from.path || !link) return;
      nextTick(() => {
        if (document.activeElement === link) focusMain();
      }).catch(reportNavigationError);
    }),
  );

  function reportNavigationError() {
    error.value = "This page could not be opened. Please try again or reload.";
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
    if (page.value !== destination(next).name) message.value = "";
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
