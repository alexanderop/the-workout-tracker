import assert from "node:assert/strict";
import { test } from "node:test";
import { checkImport, importsFrom } from "./check-boundaries.mjs";

const ui = {
  kind: "packages",
  directory: "/repo/packages/ui",
  manifest: {
    name: "@form/ui",
    exports: { ".": "./src/index.ts", "./tokens.css": "./src/tokens.css" },
    peerDependencies: { vue: "^3.5.0" },
  },
};
const app = {
  kind: "apps",
  directory: "/repo/apps/workout",
  manifest: {
    name: "@form/workout",
    dependencies: { "@form/ui": "workspace:*" },
    devDependencies: { vitest: "*" },
  },
};
const workspaces = [app, ui];
const check = (
  specifier,
  owner = app,
  file = `${owner.directory}/src/main.ts`,
) => checkImport(specifier, file, owner, workspaces);

test("allows public exports and local imports", () => {
  for (const name of ["@form/ui", "@form/ui/tokens.css", "./domain"])
    assert.equal(check(name), null);
  assert.equal(check("vue", ui), null);
});
test("rejects cross-workspace paths, deep imports and undeclared dependencies", () => {
  for (const name of [
    "../../../packages/ui/src/Sheet.vue",
    "@form/ui/src/Sheet.vue",
    "dexie",
    "/repo/packages/ui/src/index.ts",
    "#ui",
  ])
    assert.ok(check(name));
  assert.ok(check("vitest"));
  assert.equal(
    check("vitest", app, "/repo/apps/workout/test/example.ts"),
    null,
  );
});
test("UI cannot depend on the application even when declared", () => {
  assert.ok(
    checkImport(
      "@form/workout",
      "/repo/packages/ui/src/index.ts",
      {
        ...ui,
        manifest: {
          ...ui.manifest,
          dependencies: { "@form/workout": "workspace:*" },
        },
      },
      workspaces,
    ),
  );
});
test("extracts imports from scripts, Vue and CSS including dynamic and type imports", () => {
  assert.deepEqual(
    importsFrom(
      'export { x } from "one"; import("two"); type T = import("three").T;',
      "example.ts",
    ),
    ["one", "two", "three"],
  );
  assert.deepEqual(
    importsFrom(
      '<script setup lang="ts">import { ref } from "vue";</script><style>@import "./tokens.css";</style>',
      "Example.vue",
    ),
    ["vue", "./tokens.css"],
  );
  assert.throws(() => importsFrom("import(variable)", "example.ts"));
});
