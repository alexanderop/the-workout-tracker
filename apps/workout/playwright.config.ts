import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "test/e2e/**/*.feature",
  steps: ["test/e2e/steps/*.ts", "test/e2e/fixtures.ts"],
  outputDir: ".test-generated",
});

// Both ports can be overridden so two checkouts can run the suite at once.
const appPort = process.env.E2E_PORT ?? "4197";
const updatePort = process.env.E2E_UPDATE_PORT ?? "4199";

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries: a retried pass would hide a flaky journey. Failed journeys keep
  // their trace and screenshot instead.
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${appPort}`,
    channel: "chrome",
    // Journeys run in English; language.feature opens German contexts itself.
    locale: "en-US",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chrome",
      // @updates journeys need the two-version server below.
      grepInvert: /@updates/,
    },
    {
      // Touch, mobile user agent and a real phone-sized viewport.
      name: "chrome-mobile",
      grep: /@mobile/,
      use: { ...devices["Pixel 7"], channel: "chrome" },
    },
    {
      // The test server holds one active version, so these run one at a time.
      name: "updates",
      grep: /@updates/,
      fullyParallel: false,
      use: { baseURL: `http://127.0.0.1:${updatePort}` },
    },
  ],
  webServer: [
    {
      command: `pnpm exec vite build && pnpm exec vite preview --host 127.0.0.1 --port ${appPort} --strictPort`,
      env: { VITE_BASE_PATH: "/" },
      url: `http://127.0.0.1:${appPort}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "node scripts/serve-e2e.mjs",
      env: { E2E_UPDATE_PORT: updatePort },
      url: `http://127.0.0.1:${updatePort}`,
      reuseExistingServer: false,
      timeout: 240_000,
    },
  ],
});
