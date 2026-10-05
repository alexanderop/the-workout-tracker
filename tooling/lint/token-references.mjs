import { readFileSync } from "node:fs";
import { parse } from "@vue/compiler-sfc";

function declarations(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/(--[\w-]+)\s*:/g)].map(
    (match) => match[1],
  );
}

function knownTokens(context) {
  const shared = ["tokens.css", "styles.css"].flatMap((file) =>
    declarations(
      readFileSync(
        new URL(`../../packages/ui/src/${file}`, import.meta.url),
        "utf8",
      ),
    ),
  );
  const source = context.sourceCode.text;
  let localCss = "";
  if (context.filename.endsWith(".vue"))
    localCss = parse(source)
      .descriptor.styles.map((style) => style.content)
      .join("\n");
  if (context.filename.endsWith(".css")) localCss = source;
  return new Set([...shared, ...declarations(localCss)]);
}

export default {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      unknown:
        'Unknown design token "{{token}}". Use a variable from packages/ui/src/tokens.css or declare a local CSS custom property in this stylesheet.',
    },
  },
  create(context) {
    const tokens = knownTokens(context);
    const check = (node, value) => {
      if (typeof value !== "string") return;
      // Require the closing delimiter so interpolated variable names are not
      // mistaken for statically known references. Dynamic names need review.
      for (const [, token] of value.matchAll(
        /var\(\s*(--[\w-]+)\s*(?=[,)])/g,
      )) {
        if (!tokens.has(token))
          context.report({ node, messageId: "unknown", data: { token } });
      }
      // Tailwind's CSS-variable shorthand, e.g. bg-(--ui-primary).
      for (const [, token] of value.matchAll(/-\((?:[\w-]+:)?(--[\w-]+)\)/g)) {
        if (!tokens.has(token))
          context.report({ node, messageId: "unknown", data: { token } });
      }
    };
    if (context.filename.endsWith(".css")) {
      return {
        Declaration(node) {
          check(node, context.sourceCode.getText(node));
        },
      };
    }
    const expressions = {
      Literal(node) {
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked);
      },
    };
    const services = context.sourceCode.parserServices;
    if (!services.defineTemplateBodyVisitor) return expressions;
    return services.defineTemplateBodyVisitor(
      {
        ...expressions,
        VAttribute(node) {
          if (!node.directive && node.value)
            check(node.value, node.value.value);
        },
      },
      expressions,
    );
  },
};
