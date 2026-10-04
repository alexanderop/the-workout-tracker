import css from "@eslint/css";
import design from "./tooling/lint/design-policy.mjs";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tseslint from "typescript-eslint";
import oxlint from "eslint-plugin-oxlint";

export default [
  { ignores: ["apps/workout/src/route-map.d.ts"] },
  ...vue.configs["flat/essential"].map((config) => ({
    ...config,
    files: ["**/*.vue"],
  })),
  {
    files: ["**/*.vue"],
    plugins: { design },
    processor: "design/styles",
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, extraFileExtensions: [".vue"] },
    },
    rules: {
      "design/template-colors": "error",
      "vue/multi-word-component-names": [
        "error",
        {
          ignores: [
            "App",
            "Button",
            "Input",
            "Textarea",
            "Switch",
            "Sheet",
            "Field",
          ],
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
    },
  },
  {
    files: ["**/*.story.vue"],
    rules: { "vue/multi-word-component-names": "off" },
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
    },
  },
  {
    files: ["**/*.css"],
    plugins: { css, design },
    language: "css/css",
    rules: { "design/css-colors": "error", "design/css-imports": "error" },
  },
];
