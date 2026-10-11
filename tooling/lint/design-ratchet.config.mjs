// ESLint rules for the design-system ratchet (tooling/lint/design-ratchet.mjs).
// They are deliberately NOT part of eslint.config.mjs: the app still contains
// violations, so a blocking run would fail. The ratchet counts them per file and
// rule and lets the counts only go down. A rule that reaches zero moves into
// eslint.config.mjs, as native-controls, legacy-classes and unstyled did.
import css from "@eslint/css";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";
import design from "./design-policy.mjs";

export default [
  {
    files: ["**/*.vue"],
    plugins: { design },
    processor: "design/styles",
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, extraFileExtensions: [".vue"] },
    },
  },
  {
    files: ["**/*.css"],
    plugins: { css, design },
    language: "css/css",
    rules: { "design/css-scales": "error" },
  },
];
