const base = process.env.VITE_BASE_PATH || "/the-workout-tracker/";

module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm performance:serve",
      startServerReadyPattern: "Local",
      url: ["workouts", "exercises"].map(
        // LHCI groups URLs without their hash. Keep each hash route's results
        // separate so a faster Workouts page cannot hide a slow catalog.
        (route) => `http://127.0.0.1:4198${base}?audit=${route}#/${route}`,
      ),
      numberOfRuns: 3,
      settings: {
        onlyCategories: ["performance"],
        formFactor: "mobile",
        throttlingMethod: "simulate",
        chromeFlags: process.env.CI ? "--no-sandbox" : "",
      },
    },
    assert: {
      aggregationMethod: "median",
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2750 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci/reports",
    },
  },
};
