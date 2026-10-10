import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import thresholds from "./coverage-thresholds.json" with { type: "json" };

export default defineConfig({
  test: {
    allowOnly: false,
    // Unit coverage of the logic layers. Thresholds only go up; see
    // tooling/lint/ratchet.mjs.
    coverage: {
      provider: "v8",
      include: [
        "src/features/workouts/domain.ts",
        "src/features/workouts/domain/**/*.ts",
        "src/features/workouts/application.ts",
        "src/features/workouts/ui/*.ts",
      ],
      reporter: ["text-summary"],
      thresholds,
    },
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["test/unit/**/*.test.ts"],
        },
      },
      {
        plugins: [vue()],
        // Mirrors the build-time constant that vite.config.ts defines.
        define: { APP_VERSION: JSON.stringify("test-build") },
        test: {
          name: "browser",
          include: ["test/browser/**/*.test.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: "chrome" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
