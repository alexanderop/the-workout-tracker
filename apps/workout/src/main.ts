import { createApp } from "vue";
import "@fontsource-variable/inter";
import { router } from "./app/router";
import App from "./App.vue";
import { createWorkoutApp, createWorkoutDrafts } from "./app/composition";
import "@form/ui/tokens.css";
import "./style.css";

const workouts = createWorkoutApp();
const app = createApp(App, { workouts, drafts: createWorkoutDrafts() });
app.onUnmount(() => workouts.close());
app.use(router);
app.mount("#app");
if (import.meta.hot) import.meta.hot.dispose(() => app.unmount());
