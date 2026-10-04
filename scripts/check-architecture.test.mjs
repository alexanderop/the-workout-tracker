import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { analyze, assertAcyclic } from "../tooling/architecture/policy.mjs";

const file = (path) => `/project/apps/workout/src/${path}`;
const feature = (path) => file(`features/workouts/${path}`);
const violations = (code, path = "application.ts") =>
  analyze(code, feature(path));
test("layer matrix rejects SDKs, reverse imports, and re-export leaks", () => {
  for (const [path, code] of [
    ["domain.ts", 'import { ref } from "vue"'],
    ["ports.ts", 'import type { Table } from "dexie"'],
    ["ports.ts", 'import { Workout } from "./domain"'],
    ["application.ts", 'import "./adapters/dexie"'],
    ["index.ts", 'export * from "./adapters/dexie"'],
    [
      "ui/View.vue",
      '<script setup lang="ts">import "../adapters/dexie"</script>',
    ],
    ["adapters/other.ts", 'import "dexie"'],
    ["application.ts", 'type X = import("dexie").Table'],
    ["application.ts", 'const x = require("dexie")'],
    ["application.ts", 'import x = require("dexie")'],
    ["application.ts", 'import("./adapters/dexie")'],
    ["application.ts", "import(destination)"],
    ["ui/View.vue", '<script src="./hidden.ts"></script>'],
  ])
    assert.ok(violations(code, path).length, `${path}: ${code}`);
});
test("ports reject every supported runtime loading form and preserve type-only forms", () => {
  for (const code of [
    'export { reduceWorkout } from "./domain"',
    'export * from "./domain"',
    'const domain = await import("./domain")',
    'const domain = require("./domain")',
    'import domain = require("./domain")',
    'import { type Workout, reduceWorkout } from "./domain"',
    'export { type Workout, reduceWorkout } from "./domain"',
  ])
    assert.ok(violations(code, "ports.ts").length, code);
  for (const code of [
    'import type { Workout } from "./domain"',
    'import { type Workout } from "./domain"',
    'export type { Workout } from "./domain"',
    'export { type Workout } from "./domain"',
    'export type * from "./domain"',
    'type Workout = import("./domain").Workout',
    'import type domain = require("./domain")',
  ])
    assert.deepEqual(violations(code, "ports.ts"), [], code);
});
test("feature roles and import.meta cannot bypass import boundaries", () => {
  assert.ok(violations("export const x = 1", "misc.ts").length);
  for (const code of [
    'const adapters = import.meta.glob("./adapters/*.ts", { eager: true })',
    'const load = import.meta.glob; load("./adapters/*.ts")',
    'const { glob } = import.meta; glob("./adapters/*.ts")',
  ])
    assert.ok(violations(code).length, code);
});
test("permitted dependency directions remain usable", () => {
  for (const [path, code] of [
    ["domain.ts", 'import { z } from "zod"'],
    ["ports.ts", 'import type { Workout } from "./domain"'],
    ["application.ts", 'import type { Store } from "./ports"'],
    ["adapters/dexie.ts", 'import Dexie from "dexie"'],
    [
      "ui/View.vue",
      '<script setup lang="ts">import { ref } from "vue"; import type { Workout } from "../domain"</script>',
    ],
    ["index.ts", 'export * from "./application"'],
    ["infrastructure.ts", 'export * from "./adapters/dexie"'],
  ])
    assert.deepEqual(violations(code, path), [], `${path}: ${code}`);
  assert.deepEqual(
    analyze(
      'import "../features/workouts/infrastructure"',
      file("app/composition.ts"),
    ),
    [],
  );
  assert.ok(
    analyze(
      '<script setup>import "./features/workouts/infrastructure"</script>',
      file("App.vue"),
    ).length,
  );
});
test("cross-feature dependencies require public entry and explicit acyclic allowlist", () => {
  assert.ok(violations('import "../plans/index"').length);
  assert.deepEqual(
    analyze('import "../plans/index"', feature("application.ts"), {
      workouts: ["plans"],
    }),
    [],
  );
  assert.ok(
    analyze('import "../plans/domain"', feature("application.ts"), {
      workouts: ["plans"],
    }).length,
  );
  assert.throws(
    () => assertAcyclic({ workouts: ["plans"], plans: ["workouts"] }),
    /cycle/,
  );
  assert.doesNotThrow(() => assertAcyclic({ workouts: ["plans"] }));
});
test("ambient effects include aliases but distinguish scoped names and ordinary properties", () => {
  for (const code of [
    "Date.now()",
    "new Date()",
    "const clock = Date; clock.now()",
    "Math.random()",
    "const rng = Math; rng.random()",
    "const { random } = Math",
    'globalThis.fetch("/")',
    'fetch("/")',
    "const dependencies = { fetch }",
    "const save = localStorage",
    "crypto.randomUUID()",
    "setTimeout(work, 1)",
  ])
    assert.ok(violations(code, "domain.ts").length, code);
  for (const code of [
    "Math.max(1, 2)",
    'new Date("2026-01-01")',
    'const text = "fetch Date.now()"',
    "const x = { fetch: 1 }; x.fetch",
    "function work(fetch: () => void) { fetch() }",
    "function work(Math: { random(): number }) { Math.random() }",
    "type X = { fetch: string }",
  ])
    assert.deepEqual(violations(code, "domain.ts"), [], code);
});
test("configured aliases cannot bypass the same matrix", () => {
  const root = mkdtempSync(resolve(tmpdir(), "architecture-alias-"));
  try {
    mkdirSync(resolve(root, "src/features/workouts/adapters"), {
      recursive: true,
    });
    writeFileSync(
      resolve(root, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { baseUrl: ".", paths: { "@/*": ["src/*"] } },
      }),
    );
    writeFileSync(
      resolve(root, "src/features/workouts/adapters/dexie.ts"),
      "export {};",
    );
    assert.ok(
      analyze(
        'import "@/features/workouts/adapters/dexie"',
        resolve(root, "src/features/workouts/application.ts"),
      ).length,
    );
    assert.ok(
      analyze(
        'import "./adapters/../adapters/dexie"',
        resolve(root, "src/features/workouts/application.ts"),
      ).length,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test("installed Oxlint loads the real plugin for TypeScript and Vue; standalone check ignores disables", () => {
  const root = mkdtempSync(resolve(tmpdir(), "architecture-oxlint-"));
  try {
    const config = resolve(root, ".oxlintrc.json");
    writeFileSync(
      config,
      JSON.stringify({
        jsPlugins: [resolve("tooling/architecture/oxlint-plugin.mjs")],
        rules: { "architecture/boundaries": "error" },
      }),
    );
    for (const [name, code] of [
      ["application.ts", 'import "dexie";'],
      [
        "application.ts",
        'const adapters = import.meta.glob("./adapters/*.ts", { eager: true }); console.log(adapters);',
      ],
      ["ports.ts", 'export { reduceWorkout } from "./domain";'],
      [
        "ports.ts",
        'const domain = await import("./domain"); console.log(domain);',
      ],
      ["ui/View.vue", '<script setup lang="ts">import "dexie";</script>'],
    ]) {
      const target = resolve(root, "src/features/workouts", name);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, code);
      const result = spawnSync(
        resolve("node_modules/.bin/oxlint"),
        ["-c", config, target],
        { encoding: "utf8" },
      );
      assert.equal(result.status, 1, result.stdout + result.stderr);
      assert.match(result.stdout + result.stderr, /architecture.*boundaries/);
      writeFileSync(
        target,
        name.endsWith(".vue")
          ? '<script setup lang="ts">import { ref } from "vue"; console.log(ref(1));</script>'
          : "export const value = 1;",
      );
      const good = spawnSync(
        resolve("node_modules/.bin/oxlint"),
        ["-c", config, target],
        { encoding: "utf8" },
      );
      assert.equal(good.status, 0, good.stdout + good.stderr);
    }
    const target = resolve(root, "src/features/workouts/application.ts");
    writeFileSync(
      target,
      '/* oxlint-disable architecture/boundaries */\nimport "dexie";',
    );
    const discovered = spawnSync(resolve("node_modules/.bin/oxlint"), ["src"], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(discovered.status, 0, discovered.stdout + discovered.stderr);
    writeFileSync(target, 'import "dexie";');
    const nested = resolve(root, "src/features/workouts");
    const inherited = spawnSync(
      resolve("node_modules/.bin/oxlint"),
      ["application.ts"],
      {
        cwd: nested,
        encoding: "utf8",
      },
    );
    assert.equal(inherited.status, 1, inherited.stdout + inherited.stderr);
    assert.match(
      inherited.stdout + inherited.stderr,
      /architecture.*boundaries/,
    );
    writeFileSync(
      target,
      '/* oxlint-disable architecture/boundaries */\nimport "dexie";',
    );
    const check = spawnSync(
      process.execPath,
      ["scripts/check-architecture.mjs", resolve(root, "src")],
      { encoding: "utf8" },
    );
    assert.equal(check.status, 1);
    assert.match(check.stderr, /cannot import external dependency dexie/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
