// Design-system ratchet. Counts uses of patterns the design system replaces and
// fails when a file has more than its baseline allows. It follows the
// file-size approach: tooling/lint/design-baseline.json maps "file::rule" to the
// number of existing violations, a file without an entry may have none, and an
// entry may only go down.
//
//   node tooling/lint/design-ratchet.mjs            check (part of `pnpm lint`)
//   node tooling/lint/design-ratchet.mjs --update   lower entries to the current
//                                                   counts; never adds or raises
//
// Rule (configured in design-ratchet.config.mjs):
//   scales          raw px/rem/em in font-size, border-radius, gap, padding, margin
//
// The other design rules (native controls, legacy classes, BaseButton
// unstyled) reached zero and are blocking in eslint.config.mjs.
//
// A count above its baseline fails. A count below it also fails, so the headroom
// cannot be spent on new violations: run --update and commit the lower number.
// tooling/lint/ratchet.mjs rejects a baseline that is raised or gains entries.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const root = fileURLToPath(new URL("../../", import.meta.url));
const baselineFile = "tooling/lint/design-baseline.json";
const baselinePath = new URL(`../../${baselineFile}`, import.meta.url);

const ruleKeys = {
  "design/css-scales": "scales",
};

const update = process.argv.includes("--update");
const eslint = new ESLint({
  cwd: root,
  overrideConfigFile: fileURLToPath(
    new URL("./design-ratchet.config.mjs", import.meta.url),
  ),
  warnIgnored: false,
});
const results = await eslint.lintFiles([
  "apps/*/src/**/*.{vue,css}",
  "packages/*/src/**/*.{vue,css}",
]);

const counts = new Map();
const details = new Map();
const failures = [];
for (const result of results) {
  const file = relative(root, result.filePath);
  for (const message of result.messages) {
    const rule = ruleKeys[message.ruleId];
    if (!rule) {
      failures.push(
        `${file}:${message.line}: ${message.message} (${message.ruleId ?? "parse error"})`,
      );
      continue;
    }
    const key = `${file}::${rule}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    details.set(key, [
      ...(details.get(key) ?? []),
      `  ${file}:${message.line}  ${message.message}`,
    ]);
  }
}
if (failures.length) {
  console.error(["Design ratchet could not lint:", ...failures].join("\n"));
  process.exit(1);
}

const created = !existsSync(baselinePath);
const baseline = created
  ? Object.fromEntries([...counts].sort(([a], [b]) => a.localeCompare(b)))
  : JSON.parse(readFileSync(baselinePath, "utf8"));
const over = [];
const under = [];
for (const key of new Set([...counts.keys(), ...Object.keys(baseline)])) {
  const count = counts.get(key) ?? 0;
  const allowed = baseline[key] ?? 0;
  if (count > allowed) over.push({ key, count, allowed });
  else if (count < allowed) under.push({ key, count, allowed });
}

if (over.length) {
  console.error(
    [
      ...over.flatMap(({ key, count, allowed }) => [
        `${key}: ${count} violations, baseline allows ${allowed}.`,
        ...(details.get(key) ?? []),
      ]),
      "",
      "Use the design-system tokens and components (see the pattern catalog in docs/design.md).",
      `Do not raise ${baselineFile}.`,
    ].join("\n"),
  );
  process.exit(1);
}

if (update || created) {
  const next = Object.fromEntries(
    Object.entries(baseline)
      .map(([key, allowed]) => [key, Math.min(allowed, counts.get(key) ?? 0)])
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`);
  const total = Object.values(next).reduce((sum, count) => sum + count, 0);
  console.log(
    `${baselineFile}: ${created ? "created" : "updated"} (${Object.keys(next).length} entries, ${total} violations).`,
  );
  process.exit(0);
}

if (under.length) {
  console.error(
    [
      ...under.map(
        ({ key, count, allowed }) =>
          `${key}: down to ${count} from ${allowed}.`,
      ),
      "",
      `Lower the entries in ${baselineFile} so the limit ratchets down: node tooling/lint/design-ratchet.mjs --update`,
    ].join("\n"),
  );
  process.exit(1);
}
