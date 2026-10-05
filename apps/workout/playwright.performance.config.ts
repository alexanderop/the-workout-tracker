import { defineConfig } from "@playwright/test";

const base = process.env.VITE_BASE_PATH || "/the-workout-tracker/";

export default defineConfig({
  testDir: "test/performance",
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/performance", open: "never" }],
  ],
  use: {
    baseURL: `http://127.0.0.1:4198${base}`,
    channel: "chrome",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node ../../scripts/performance-vite.mjs serve",
    url: `http://127.0.0.1:4198${base}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
