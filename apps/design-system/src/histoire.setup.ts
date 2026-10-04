import "@fontsource/inter";
import "@form/ui/tokens.css";
import "@form/ui/workout-theme.css";
import "@form/ui/styles.css";
import "./preview.css";

import { defineSetupVue3 } from "@histoire/plugin-vue";
import StoryPreview from "./StoryPreview.vue";
export const setupVue3 = defineSetupVue3(({ addWrapper }) => {
  addWrapper(StoryPreview);
});
