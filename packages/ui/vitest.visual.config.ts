import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: { include: ["vue", "@lucide/vue", "reka-ui"] },
  test: {
    include: ["test/**/*.visual.test.ts"],
    setupFiles: ["test/visual.setup.ts"],
    browser: {
      enabled: true,
      provider: playwright({
        contextOptions: {
          reducedMotion: "reduce",
          locale: "en-US",
          timezoneId: "UTC",
          deviceScaleFactor: 1,
        },
      }),
      headless: true,
      instances: [{ browser: "chromium" }],
      expect: {
        toMatchScreenshot: {
          resolveScreenshotPath: ({ root, arg, ext }) =>
            resolve(root, "test/__screenshots__", `${arg}${ext}`),
          comparatorOptions: { allowedMismatchedPixels: 0 },
        },
      },
    },
  },
});
