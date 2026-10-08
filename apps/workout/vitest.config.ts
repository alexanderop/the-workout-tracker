import { defineConfig } from "vitest/config";
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
