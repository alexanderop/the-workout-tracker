import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { relative } from "node:path";

const root = fileURLToPath(new URL("../../", import.meta.url));
const baselineFile = "tooling/lint/file-size-baseline.json";
// Files that were already over the limit, at their current size. An entry may
// only go down: growing past it fails, and shrinking requires lowering it.
const baseline = JSON.parse(
  readFileSync(new URL("./file-size-baseline.json", import.meta.url), "utf8"),
);

export default {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: { max: { type: "integer", minimum: 1 } },
        additionalProperties: false,
      },
    ],
    messages: {
      over: "This file has {{lines}} lines; the limit is {{limit}}. Split it into smaller modules.",
      shrank: `This file shrank to {{lines}} lines. Set its entry in ${baselineFile} to {{lines}}, or remove the entry once it is at most {{max}}, so the limit ratchets down.`,
    },
  },
  create(context) {
    const physical = context.physicalFilename ?? context.filename;
    // Vue processors lint style blocks as virtual files; count each file once.
    if (context.filename !== physical) return {};
    const max = context.options[0]?.max ?? 400;
    return {
      Program(node) {
        const lines = readFileSync(physical, "utf8").split("\n").length - 1;
        const allowed = baseline[relative(root, physical)];
        const limit = allowed ?? max;
        if (lines > limit)
          context.report({ node, messageId: "over", data: { lines, limit } });
        else if (allowed !== undefined && lines < allowed)
          context.report({ node, messageId: "shrank", data: { lines, max } });
      },
    };
  },
};
