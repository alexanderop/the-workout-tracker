import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

export default defineConfig({
  testDir: defineBddConfig({
    features: "test/e2e/*.feature",
    steps: "test/e2e/*.steps.ts",
    outputDir: ".test-generated",
  }),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4181",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "pnpm exec vite preview --host 127.0.0.1 --port 4181 --strictPort",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
  },
});
