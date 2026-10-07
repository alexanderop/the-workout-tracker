import type { RouterHistory } from "vue-router";
import { experimental_createRouter } from "vue-router/experimental";
import { resolver, handleHotUpdate } from "vue-router/auto-resolver";

type WorkoutLocation = {
  readonly name?: unknown;
  readonly params: Readonly<Record<string, unknown>>;
};

/** Entering or leaving full History is a page-like transition within Workouts. */
export function crossesHistoryView(
  to: WorkoutLocation,
  from: WorkoutLocation,
): boolean {
  return (
    to.name === "workouts" &&
    from.name === "workouts" &&
    to.params.view !== from.params.view &&
    (to.params.view === "history" || from.params.view === "history")
  );
}

export function createWorkoutRouter(history: RouterHistory) {
  const router = experimental_createRouter({
    history,
    resolver,
    scrollBehavior(to, from, savedPosition) {
      if (to.path === from.path && !crossesHistoryView(to, from))
        return false;
      return savedPosition ?? { top: 0 };
    },
  });

  if (import.meta.hot) handleHotUpdate(router);
  return router;
}

declare module "vue-router" {
  interface TypesConfig {
    Router: ReturnType<typeof createWorkoutRouter>;
  }
}
