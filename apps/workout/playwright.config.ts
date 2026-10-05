import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "test/e2e/**/*.feature",
  steps: ["test/e2e/steps/*.ts", "test/e2e/fixtures.ts"],
  outputDir: ".test-generated",
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4197",
    channel: "chrome",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      "pnpm exec vite build && pnpm exec vite preview --host 127.0.0.1 --port 4197 --strictPort",
    env: { VITE_BASE_PATH: "/" },
    url: "http://127.0.0.1:4197",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
