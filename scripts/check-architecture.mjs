import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkDirectory } from "../tooling/architecture/policy.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = checkDirectory(
  process.argv[2] ?? resolve(root, "apps/workout/src"),
);
if (errors.length) throw new Error(errors.join("\n"));
console.log("Feature architecture verified.");
