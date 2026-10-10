import "@form/ui/tokens.css";
import "@form/ui/workout-theme.css";
import "@form/ui/styles.css";
import "./preview.css";

// Histoire marks a dark sandbox with a class; the tokens read data-theme.
const root = document.documentElement;
function syncTheme() {
  root.dataset.theme = root.classList.contains("dark") ? "dark" : "light";
}
syncTheme();
new MutationObserver(syncTheme).observe(root, {
  attributes: true,
  attributeFilter: ["class"],
});

import { defineSetupVue3 } from "@histoire/plugin-vue";
import StoryPreview from "./StoryPreview.vue";
export const setupVue3 = defineSetupVue3(({ addWrapper }) => {
  addWrapper(StoryPreview);
});
