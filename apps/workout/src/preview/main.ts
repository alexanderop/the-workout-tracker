import { createApp, ref } from "vue";
import { createMemoryHistory } from "vue-router";
import "@form/ui/tokens.css";
import "../style.css";
import {
  appearanceKey,
  browserAppearanceEnvironment,
  createAppearance,
} from "../app/appearance";
import App from "../App.vue";
import { createWorkoutRouter } from "../app/router";
import type { Installation } from "../app/environment";
import { createWorkouts, snapshotSchema } from "../features/workouts";
import { createMemoryDraftJournal, createMemoryStorage } from "./memoryPorts";
import {
  getScenario,
  parseScenarioId,
  previewEpoch,
  type ScenarioId,
} from "./scenarios";

function usePreviewInstallation(): Installation {
  const installOpen = ref(false);
  return {
    installOpen,
    installing: ref(false),
    canInstall: ref(false),
    platform: "browser",
    online: ref(true),
    installed: ref(false),
    offlineReady: ref(false),
    needRefresh: ref(false),
    installMessage: ref("Installation is unavailable in this design example."),
    async install() {
      installOpen.value = true;
    },
    async requestInstall() {},
    async updateServiceWorker() {},
  };
}
async function mountScenario(
  host: HTMLElement,
  id: ScenarioId,
): Promise<void> {
  const scenario = getScenario(id);
  const snapshot = snapshotSchema.parse(scenario.seed());
  const started = performance.now();
  const now = () => previewEpoch + Math.floor(performance.now() - started);
  const nextId = () => `preview-new-${crypto.randomUUID()}`;
  const drafts = createMemoryDraftJournal(nextId);
  const workouts = createWorkouts({
    storage: createMemoryStorage(snapshot),
    journal: drafts,
    now,
    id: nextId,
  });
  const appearance = createAppearance(browserAppearanceEnvironment());
  const router = createWorkoutRouter(createMemoryHistory());
  const app = createApp(App, {
    workouts,
    drafts,
    initialExerciseSearch: scenario.initialExerciseSearch,
    environment: { now, useInstallation: usePreviewInstallation },
  });
  app.provide(appearanceKey, appearance);
  let disposed = false;
  let mountStarted = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    window.removeEventListener("pagehide", onPageHide);
    try {
      if (mountStarted) app.unmount();
    } finally {
      appearance.stop();
      workouts.close();
    }
  }
  function onPageHide(event: PageTransitionEvent) {
    // A cached document resumes with its existing app when navigating back.
    if (!event.persisted) dispose();
  }
  window.addEventListener("pagehide", onPageHide);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  try {
    await router.push(
      scenario.view
        ? { name: "workouts", params: { view: scenario.view } }
        : scenario.route,
    );
    if (disposed) return;
    app.use(router);
    await router.isReady();
    if (disposed) return;
    mountStarted = true;
    app.mount(host);
  } catch (error) {
    if (disposed) return;
    dispose();
    throw error;
  }
}
const host = document.getElementById("app");
if (!host) throw new Error("Missing preview root.");
try {
  const scenario = parseScenarioId(
    new URL(window.location.href).searchParams.get("scenario"),
  );
  await mountScenario(host, scenario);
} catch (error) {
  host.textContent =
    error instanceof Error
      ? error.message
      : "This example could not be opened.";
}
