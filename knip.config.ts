import type { KnipConfig } from "knip";
import { parse } from "@vue/compiler-sfc";

function vueScripts(text: string) {
  const { descriptor } = parse(text);
  return [descriptor.script?.content, descriptor.scriptSetup?.content]
    .filter(Boolean)
    .join("\n");
}

const cssImports = /(?<=@)import\s+["'][^"']+["']/g;

function cssImportsAsModules(text: string) {
  return [...text.matchAll(cssImports)].join(";\n");
}

export default {
  compilers: { vue: vueScripts, css: cssImportsAsModules },
  workspaces: {
    ".": {
      entry: ["scripts/*.mjs", "tooling/**/*.mjs"],
      project: ["scripts/**", "tooling/**", "*.config.{js,ts}"],
    },
    "apps/workout": {
      entry: [
        "src/preview/main.ts",
        "src/startup.css",
        "src/app/route-params/*.ts",
        "playwright*.config.ts",
        "scripts/*.mjs",
        "test/e2e/steps/*.ts",
        "test/e2e/fixtures.ts",
        "test/performance/*.spec.ts",
      ],
      project: [
        "src/**/*.{ts,vue,css}",
        "test/**/*.ts",
        "scripts/**",
        "*.config.ts",
      ],
    },
    "apps/design-system": {
      entry: [
        "histoire.config.ts",
        "src/histoire.setup.ts",
        "src/**/*.story.vue",
      ],
      project: ["src/**/*.{ts,vue,css}", "*.config.ts"],
    },
    "packages/ui": {
      project: ["src/**/*.{ts,vue,css}", "test/**/*.{ts,vue}", "*.config.ts"],
    },
  },
} satisfies KnipConfig;
