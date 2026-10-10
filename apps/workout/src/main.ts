import { createApp, h } from "vue";
import { createWorkoutRouter } from "./app/router";
import { createWebHashHistory } from "vue-router";
import { usePwa } from "./usePwa";
import App from "./App.vue";
import AppErrorBoundary from "./app/AppErrorBoundary.vue";
import { initialLocale } from "./app/language";
import { createAppI18n } from "./i18n";
import { startupLocale } from "./i18n/loadCatalog";
import { createWorkoutApp, createWorkoutDrafts } from "./app/composition";
import "@form/ui/tokens.css";
import "./style.css";
import {
  appearanceKey,
  browserAppearanceEnvironment,
  createAppearance,
} from "./app/appearance";

// Without a catalog there is no text to show, so the startup shell explains
// this once in both supported languages and the app stays unmounted.
function showMissingCatalog() {
  const message = document.querySelector(".startup-shell p");
  if (message)
    message.textContent =
      "Could not load. Reload to retry. · Laden fehlgeschlagen. Lade neu.";
}

async function start() {
  const history = createWebHashHistory(import.meta.env.BASE_URL);
  const router = createWorkoutRouter(history);
  // The router ignores hash and history events until its first navigation
  // finishes, so it starts while the catalog loads instead of after it.
  const [locale] = await Promise.all([
    startupLocale(initialLocale()),
    router.replace(history.location),
  ]);
  if (!locale) {
    showMissingCatalog();
    return;
  }
  const appearance = createAppearance(browserAppearanceEnvironment());
  const drafts = createWorkoutDrafts();
  const workouts = createWorkoutApp(drafts);
  const app = createApp({
    render: () =>
      h(AppErrorBoundary, null, {
        default: () =>
          h(App, {
            workouts,
            drafts,
            environment: { now: Date.now, useInstallation: usePwa },
          }),
      }),
  });
  app.provide(appearanceKey, appearance);
  app.onUnmount(() => {
    appearance.stop();
    workouts.close();
  });
  app.use(router).use(createAppI18n(locale));
  app.mount("#app");
  if (import.meta.hot) import.meta.hot.dispose(() => app.unmount());
}
void start();
