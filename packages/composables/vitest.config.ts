import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { goOfflineFor } from "./test/commands.ts";

export default defineConfig({
  test: {
    allowOnly: false,
    projects: [
      {
        extends: true,
        test: {
          name: "browser",
          include: ["test/**/*.browser.test.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: "chrome" } }),
            instances: [{ browser: "chromium" }],
            commands: { goOfflineFor },
          },
        },
      },
    ],
  },
});
