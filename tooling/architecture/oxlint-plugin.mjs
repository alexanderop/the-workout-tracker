import { analyze } from "./policy.mjs";
export default {
  meta: { name: "architecture" },
  rules: {
    boundaries: {
      meta: {
        type: "problem",
        schema: [],
        messages: { violation: "{{message}}" },
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.filename ?? context.getFilename();
            const source = context.sourceCode ?? context.getSourceCode();
            for (const issue of analyze(source.text, filename, undefined, true))
              context.report({
                node,
                messageId: "violation",
                data: { message: issue.message },
              });
          },
        };
      },
    },
  },
};
