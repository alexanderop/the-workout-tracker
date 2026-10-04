import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: { include: ["vue", "@lucide/vue", "reka-ui"] },
  test: {
    include: ["test/**/*.test.ts"],
    exclude: ["test/**/*.visual.test.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
