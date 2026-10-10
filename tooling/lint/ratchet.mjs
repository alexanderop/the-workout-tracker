// Quality limits may only tighten. Compares each limit file with a base Git
// revision and fails when a limit was loosened or an exception was added.
//
//   node tooling/lint/ratchet.mjs [base-ref]   (default: HEAD)
//
// The pre-commit hook compares the working tree with HEAD. CI compares a push
// with the commit it replaced, so a hook skipped with --no-verify still fails.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const base = process.argv[2] ?? "HEAD";

// "max": a larger value is looser. "min": a smaller value is looser.
// `newKeys: false` rejects added entries (each one is a new exception).
const limits = [
  {
    path: "tooling/lint/file-size-baseline.json",
    direction: "max",
    newKeys: false,
  },
  {
    path: "apps/workout/performance-budgets.json",
    direction: "max",
    newKeys: true,
  },
  {
    path: "apps/workout/coverage-thresholds.json",
    direction: "min",
    newKeys: true,
  },
  {
    path: "packages/ui/coverage-thresholds.json",
    direction: "min",
    newKeys: true,
  },
];

function previous(path) {
  try {
    const text = execFileSync("git", ["show", `${base}:${path}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const problems = [];
for (const { path, direction, newKeys } of limits) {
  const before = previous(path);
  if (!before) continue;
  if (!existsSync(new URL(path, `file://${root}`))) {
    problems.push(`${path}: the limit file was deleted.`);
    continue;
  }
  const after = JSON.parse(
    readFileSync(new URL(path, `file://${root}`), "utf8"),
  );
  for (const [key, value] of Object.entries(after)) {
    const old = before[key];
    if (old === undefined) {
      if (!newKeys)
        problems.push(
          `${path}: new exception "${key}". Split the file instead.`,
        );
      continue;
    }
    const looser = direction === "max" ? value > old : value < old;
    if (looser)
      problems.push(`${path}: "${key}" loosened from ${old} to ${value}.`);
  }
  if (direction === "min")
    for (const key of Object.keys(before))
      if (!(key in after))
        problems.push(`${path}: threshold "${key}" was removed.`);
  if (direction === "max" && newKeys)
    for (const key of Object.keys(before))
      if (!(key in after))
        problems.push(`${path}: budget "${key}" was removed.`);
}

if (problems.length) {
  console.error(
    [
      ...problems,
      "",
      "Limits only tighten. A deliberate loosening needs the repository owner's approval.",
    ].join("\n"),
  );
  process.exit(1);
}
