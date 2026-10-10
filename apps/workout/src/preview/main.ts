import { useEventListener } from "@form/composables";
import { computed, createApp, ref } from "vue";
import { createMemoryHistory } from "vue-router";
import "@form/ui/tokens.css";
import "../style.css";
import {
  appearanceKey,
  browserAppearanceEnvironment,
  createAppearance,
} from "../app/appearance";
import App from "../App.vue";
import { initialLocale } from "../app/language";
import { createAppI18n, strictTranslator, useTranslation } from "../i18n";
import { startupLocale } from "../i18n/loadCatalog";
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

// One instance for the page: every mounted scenario and the error text share it.
const i18n = createAppI18n((await startupLocale(initialLocale())) ?? "en");

function usePreviewInstallation(): Installation {
  const { t } = useTranslation();
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
    reloadReady: ref(false),
    installMessage: computed(() => t("shell.install.unavailable")),
    install() {
      installOpen.value = true;
      return Promise.resolve();
    },
    async requestInstall() {},
    async updateServiceWorker() {},
  };
}
const nextId = () => `preview-new-${crypto.randomUUID()}`;
async function mountScenario(host: HTMLElement, id: ScenarioId): Promise<void> {
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
  // Reads the flag fresh: it changes while awaits are pending, which control-flow narrowing cannot see.
  const isDisposed = () => disposed;
  let mountStarted = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    stopPageHide();
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
  const stopPageHide = useEventListener(window, "pagehide", onPageHide);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  try {
    await router.push(
      scenario.view
        ? { name: "workouts", params: { view: scenario.view } }
        : scenario.route,
    );
    if (isDisposed()) return;
    app.use(router).use(i18n);
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
      : strictTranslator(i18n.global.locale).t("shell.previewError");
}
