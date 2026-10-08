import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import thresholds from "./coverage-thresholds.json" with { type: "json" };

export default defineConfig({
  plugins: [vue()],
  test: {
    allowOnly: false,
    // Unit coverage of the pure modules. Thresholds only go up; see
    // tooling/lint/ratchet.mjs.
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      reporter: ["text-summary"],
      thresholds,
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["test/**/*.test.ts"],
          exclude: ["test/**/*.browser.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["test/**/*.browser.test.ts"],
          setupFiles: ["test/support/browser-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: "chrome" } }),
            instances: [{ browser: "chromium" }],
            viewport: { width: 390, height: 844 },
          },
        },
      },
    ],
  },
});
