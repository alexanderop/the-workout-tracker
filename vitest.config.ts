import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        plugins: [vue()],
        optimizeDeps: { include: ["vue", "@lucide/vue", "reka-ui"] },
        test: {
          name: "browser",
          include: ["test/browser/**/*.test.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
