import { defineConfig } from "histoire";
import { HstVue } from "@histoire/plugin-vue";
export default defineConfig({
  plugins: [HstVue()],
  routerMode: "hash",
  setupFile: "./src/histoire.setup.ts",
  theme: {
    title: "The Workout Tracker · Product design",
    defaultColorScheme: "dark",
  },
  defaultStoryProps: {
    autoPropsDisabled: true,
    layout: { type: "single", iframe: true },
  },
  responsivePresets: [
    { label: "Phone · narrow", width: 320, height: 640 },
    { label: "Phone · short", width: 390, height: 568 },
    { label: "Phone · tall", width: 390, height: 844 },
    { label: "Below 640", width: 639, height: 800 },
    { label: "At 640", width: 640, height: 800 },
    { label: "Sheet · bottom", width: 650, height: 800 },
    { label: "Sheet · centered", width: 651, height: 800 },
    { label: "Below 768", width: 767, height: 1024 },
    { label: "At 768", width: 768, height: 1024 },
    { label: "Desktop", width: 1280, height: 900 },
  ],
});
