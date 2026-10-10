import { createApp, ref } from "vue";
import { createMemoryHistory } from "vue-router";
import "@fontsource-variable/inter";
import "@form/ui/tokens.css";
import "../style.css";
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
    install() {
      installOpen.value = true;
      return Promise.resolve();
    },
    async requestInstall() {},
    async updateServiceWorker() {},
  };
}
const nextId = () => `preview-new-${crypto.randomUUID()}`;
async function mountScenario(
  host: HTMLElement,
  id: ScenarioId,
): Promise<void> {
  const scenario = getScenario(id);
  const snapshot = snapshotSchema.parse(scenario.seed());
  const started = performance.now();
  const now = () => previewEpoch + Math.floor(performance.now() - started);
  const drafts = createMemoryDraftJournal(nextId);
  const workouts = createWorkouts({
    storage: createMemoryStorage(snapshot),
    journal: drafts,
    now,
    id: nextId,
  });
  const router = createWorkoutRouter(createMemoryHistory());
  const app = createApp(App, {
    workouts,
    drafts,
    initialExerciseSearch: scenario.initialExerciseSearch,
    environment: { now, useInstallation: usePreviewInstallation },
  });
  let disposed = false;
  // Reads the flag fresh: it changes while awaits are pending, which control-flow narrowing cannot see.
  const isDisposed = () => disposed;
  let mountStarted = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    window.removeEventListener("pagehide", onPageHide);
    try {
      if (mountStarted) app.unmount();
    } finally {
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
    if (isDisposed()) return;
    app.use(router);
    await router.isReady();
    if (isDisposed()) return;
    mountStarted = true;
    app.mount(host);
  } catch (error) {
    if (isDisposed()) return;
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
