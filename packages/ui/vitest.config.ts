import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";

const browser = process.env.UI_BROWSER ?? "chromium";
if (browser !== "chromium" && browser !== "firefox" && browser !== "webkit") {
  throw new Error(`Unsupported UI_BROWSER: ${browser}`);
}

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: { include: ["vue", "@lucide/vue", "reka-ui"] },
  test: {
    fileParallelism: browser === "chromium",
    include: ["test/**/*.test.ts"],
    exclude: ["test/**/*.visual.test.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      locators: { exact: true },
      instances: [{ browser }],
    },
  },
});
