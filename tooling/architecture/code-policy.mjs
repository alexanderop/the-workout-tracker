import { basename } from "node:path";
import {
  checkImport,
  getWorkspaces,
  importsFrom,
} from "../../scripts/check-boundaries.mjs";

const workspaces = getWorkspaces();
const problem = (message) => ({
  type: "problem",
  schema: [],
  messages: { violation: message },
});
const functionTypes = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);
function countAwaits(node) {
  if (!node || typeof node.type !== "string" || functionTypes.has(node.type))
    return 0;
  let count = node.type === "AwaitExpression" ? 1 : 0;
  for (const [key, value] of Object.entries(node)) {
    if (key === "parent") continue;
    const children = Array.isArray(value) ? value : [value];
    for (const child of children)
      if (child && typeof child === "object") count += countAwaits(child);
  }
  return count;
}
export default {
  meta: { name: "code-policy" },
  rules: {
    "no-enums": {
      meta: problem("Use literal unions or as const objects instead of enums."),
      create: (context) => ({
        TSEnumDeclaration: (node) =>
          context.report({ node, messageId: "violation" }),
      }),
    },
    "early-return": {
      meta: problem("Use an early return or continue instead of else/else if."),
      create: (context) => ({
        IfStatement(node) {
          if (node.alternate)
            context.report({ node: node.alternate, messageId: "violation" });
        },
      }),
    },
    "workspace-imports": {
      meta: problem("{{detail}}"),
      create(context) {
        const filename = context.filename;
        const owner = workspaces.find(({ directory }) =>
          filename.startsWith(directory + "/"),
        );
        if (!owner) return {};
        return {
          Program(node) {
            for (const specifier of importsFrom(
              context.sourceCode.text,
              filename.endsWith(".vue") ? filename + ".ts" : filename,
            )) {
              const detail = checkImport(
                specifier,
                filename,
                owner,
                workspaces,
              );
              if (detail)
                context.report({
                  node,
                  messageId: "violation",
                  data: { detail: `${specifier}: ${detail}` },
                });
            }
          },
        };
      },
    },
    "one-effect-per-try": {
      meta: problem(
        "Wrap each awaited effect in its own try, so a failed read, change and write can be told apart.",
      ),
      create: (context) => ({
        TryStatement(node) {
          if (countAwaits(node.block) > 1)
            context.report({ node, messageId: "violation" });
        },
      }),
    },
    "composable-contract": {
      meta: problem(
        "A use* module must compose Vue state/lifecycle APIs or another composable; otherwise name it as a plain utility.",
      ),
      create(context) {
        if (!/^use[A-Z].*\.ts$/.test(basename(context.filename))) return {};
        const imports = new Set();
        let used = false;
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (node.importKind === "type") return;
            const reactiveLibrary =
              source === "vue" || source.startsWith("@vueuse/");
            for (const specifier of node.specifiers) {
              if (specifier.importKind === "type") continue;
              if (
                reactiveLibrary ||
                /^use[A-Z]/.test(specifier.imported?.name ?? "")
              )
                imports.add(specifier.local.name);
            }
          },
          CallExpression(node) {
            if (
              node.callee.type === "Identifier" &&
              imports.has(node.callee.name)
            )
              used = true;
          },
          "Program:exit"(node) {
            if (!used) context.report({ node, messageId: "violation" });
          },
        };
      },
    },
  },
};
