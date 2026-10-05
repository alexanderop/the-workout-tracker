import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    allowOnly: !process.env.CI,
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
