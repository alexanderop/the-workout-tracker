import { createApp } from "vue";
import "@fontsource-variable/inter";
import App from "./App.vue";
import { createWorkoutApp } from "./app/composition";
import "@form/ui/tokens.css";
import "./style.css";

const workouts = createWorkoutApp();
const app = createApp(App, { workouts });
app.onUnmount(() => workouts.close());
app.mount("#app");
if (import.meta.hot) import.meta.hot.dispose(() => app.unmount());
