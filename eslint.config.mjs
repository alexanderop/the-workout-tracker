import { plugin as shadcn } from "@shadcn/lint";
import css from "@eslint/css";
import design from "./tooling/lint/design-policy.mjs";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tseslint from "typescript-eslint";
import oxlint from "eslint-plugin-oxlint";

export default [
  // The route map is generated; packages/result is a vendored library (see its README).
  { ignores: ["apps/workout/src/route-map.d.ts", "packages/result/**"] },
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  ...vue.configs["flat/essential"].map((config) => ({
    ...config,
    files: ["**/*.vue"],
  })),
  {
    files: ["**/*.vue"],
    plugins: { design, shadcn },
    processor: "design/styles",
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, extraFileExtensions: [".vue"] },
    },
    rules: {
      "design/template-colors": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": "error",
      "design/token-references": "error",
      "vue/multi-word-component-names": [
        "error",
        {
          ignores: ["App"],
        },
      ],
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        { registeredComponentsOnly: false },
      ],
      "vue/match-component-file-name": [
        "error",
        { extensions: ["vue"], shouldMatchCase: true },
      ],
      "vue/attribute-hyphenation": ["error", "always"],
      "vue/custom-event-name-casing": [
        "error",
        "kebab-case",
        { ignores: ["/^update:/"] },
      ],
      "vue/prefer-use-template-ref": "error",
      "vue/no-unused-properties": [
        "error",
        { groups: ["props", "data", "computed", "methods"] },
      ],
      "vue/no-unused-refs": "error",
      "vue/no-unused-emit-declarations": "error",
      "vue/require-explicit-slots": "error",
      "vue/max-template-depth": ["error", { maxDepth: 8 }],
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "vue/define-macros-order": [
        "error",
        { order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"] },
      ],
      "vue/no-undef-components": [
        "error",
        // Histoire registers its story components globally.
        { ignorePatterns: ["^Story$", "^Variant$", "^Hst[A-Z]"] },
      ],
      "vue/no-useless-v-bind": "error",
      "vue/prefer-true-attribute-shorthand": "error",
    },
  },
  {
    // App text comes from the message catalogs in apps/workout/src/i18n.
    files: ["apps/workout/src/**/*.vue"],
    rules: {
      "vue/no-bare-strings-in-template": [
        "error",
        {
          allowlist: [...'()[]{}<>,.:;!?&+-=*/#%|•·—–×…'.split(""), "kg"],
          // Text props on any element or component, not only native ones.
          attributes: {
            "/.+/": [
              "title",
              "aria-label",
              "aria-placeholder",
              "aria-roledescription",
              "aria-valuetext",
              "alt",
              "label",
              "legend",
              "description",
              "placeholder",
              "message",
              "error",
              "close-label",
              "dismiss-label",
              "skip-label",
            ],
          },
        },
      ],
    },
  },
  {
    files: ["**/*.story.vue"],
    rules: { "vue/multi-word-component-names": "off" },
  },
  {
    files: ["**/*.ts"],
    languageOptions: { parser: tseslint.parser },
    plugins: { shadcn, design },
    rules: {
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": "error",
      "design/token-references": "error",
    },
  },
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
  {
    files: ["**/*.vue"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          considerDefaultExhaustiveForUnions: false,
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    files: ["**/*.css"],
    plugins: { css, design },
    language: "css/css",
    rules: {
      "design/css-colors": "error",
      "design/css-imports": "error",
      "design/token-references": "error",
    },
  },
  {
    files: ["apps/*/src/**/*.{ts,vue}", "packages/*/src/**/*.{ts,vue}"],
    plugins: { design },
    rules: { "design/file-size": ["error", { max: 400 }] },
  },
];
