import { createApp } from "vue";
import { createWorkoutRouter } from "./app/router";
import { createWebHashHistory } from "vue-router";
import { usePwa } from "./usePwa";
import App from "./App.vue";
import { createWorkoutApp, createWorkoutDrafts } from "./app/composition";
import "@form/ui/tokens.css";
import "./style.css";
import {
  appearanceKey,
  browserAppearanceEnvironment,
  createAppearance,
} from "./app/appearance";

const appearance = createAppearance(browserAppearanceEnvironment());
const drafts = createWorkoutDrafts();
const workouts = createWorkoutApp(drafts);
const router = createWorkoutRouter(
  createWebHashHistory(import.meta.env.BASE_URL),
);
const app = createApp(App, {
  workouts,
  drafts,
  environment: { now: Date.now, useInstallation: usePwa },
});
app.provide(appearanceKey, appearance);
app.onUnmount(() => {
  appearance.stop();
  workouts.close();
});
app.use(router);
app.mount("#app");
if (import.meta.hot) import.meta.hot.dispose(() => app.unmount());
