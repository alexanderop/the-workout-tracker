import tokenReferences from "./token-references.mjs";
import fileSize from "./file-size.mjs";
import vue from "eslint-plugin-vue";
import { parse } from "@vue/compiler-sfc";
import {
  checkImport,
  getWorkspaces,
  importsFrom,
} from "../../scripts/check-boundaries.mjs";

const paletteClass =
  /(?:^|[\s:!])(?:bg|text|border|ring|fill|stroke|outline|divide|decoration|shadow|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})\b|(?:bg|text|border|ring|fill|stroke|outline|divide|decoration|shadow|from|via|to)-(?:black|white)\b/;
const rawColor =
  /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/i;
const colorFunctions = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
]);
const namedColors = new Set(
  "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(
    " ",
  ),
);
// Declarations whose lengths must come from the type, radius and spacing scales
// in packages/ui/src/tokens.css. Longhands such as padding-inline-start and
// border-start-start-radius are covered by the same patterns.
const scaleProperty =
  /^(?:font-size|border-radius|border-(?:top|bottom)-(?:left|right)-radius|border-(?:start|end)-(?:start|end)-radius|(?:grid-)?(?:row-|column-)?gap|padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?)$/;
const lengthLiteral = /(?<![\w.-])-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em)\b/gi;

// Remove var(...) and env(...) calls, including nested parentheses, so their
// fallbacks and safe-area offsets are not mistaken for literals.
function withoutReferences(value) {
  let out = "";
  for (let i = 0; i < value.length;) {
    const match = /^(?:var|env)\(/i.exec(value.slice(i));
    const previous = value[i - 1];
    if (match && !(previous && /[\w-]/.test(previous))) {
      let depth = 0;
      let j = i + match[0].length - 1;
      for (; j < value.length; j++) {
        if (value[j] === "(") depth++;
        else if (value[j] === ")" && --depth === 0) break;
      }
      i = j + 1;
      out += " ";
    } else out += value[i++];
  }
  return out;
}

// 0 and the 1px hairline are allowed; every other px, rem or em literal is not.
function scaleLiterals(value) {
  return (withoutReferences(value).match(lengthLiteral) ?? []).filter(
    (literal) =>
      !/^-?(?:0+(?:\.0*)?|\.0+|1(?:\.0*)?px)(?:px|rem|em)?$/i.test(literal),
  );
}

const meta = {
  type: "problem",
  schema: [],
  messages: {
    token:
      "Use a semantic color token; palette values belong in packages/ui/src/tokens.css.",
  },
};
export default {
  meta: { name: "design-policy" },
  processors: {
    styles: {
      preprocess(text, filename) {
        const { descriptor } = parse(text, { filename });
        return [
          text,
          ...descriptor.styles.map((style, index) => ({
            filename: `style-${index}.css`,
            text:
              text.slice(0, style.loc.start.offset).replace(/[^\n]/g, " ") +
              style.content,
          })),
        ];
      },
      postprocess([component, ...styles], filename) {
        return [
          ...vue.processors.vue.postprocess([component], filename),
          ...styles.flat(),
        ];
      },
    },
  },
  rules: {
    "token-references": tokenReferences,
    "file-size": fileSize,
    "template-colors": {
      meta,
      create(context) {
        const check = (node, value) => {
          if (
            typeof value === "string" &&
            (paletteClass.test(value) || rawColor.test(value))
          )
            context.report({ node, messageId: "token" });
        };
        return context.sourceCode.parserServices.defineTemplateBodyVisitor({
          VAttribute(node) {
            if (node.directive || !node.value) return;
            if (
              ["class", "style", "fill", "stroke", "color"].includes(
                node.key.name,
              )
            )
              check(node.value, node.value.value);
          },
          Literal(node) {
            let parent = node.parent;
            while (parent && parent.type !== "VAttribute")
              parent = parent.parent;
            const argument = parent?.key?.argument?.name;
            if (
              ["class", "style", "fill", "stroke", "color"].includes(argument)
            )
              check(node, node.value);
          },
        });
      },
    },
    "css-colors": {
      meta,
      create(context) {
        if (context.physicalFilename.endsWith("/packages/ui/src/tokens.css"))
          return {};
        const report = (node) => context.report({ node, messageId: "token" });
        return {
          Hash: report,
          Function(node) {
            if (colorFunctions.has(node.name.toLowerCase())) report(node);
          },
          "Declaration > Value Identifier"(node) {
            if (namedColors.has(node.name.toLowerCase())) report(node);
          },
        };
      },
    },
    "css-scales": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          scale:
            "Raw length {{literal}} in {{property}}. Use the type (--text-*), radius (--radius-*) or spacing (--space-*, --page-gutter-phone) tokens from packages/ui/src/tokens.css. 0, auto, percentages and the 1px hairline are allowed.",
        },
      },
      create(context) {
        if (context.physicalFilename.endsWith("/packages/ui/src/tokens.css"))
          return {};
        return {
          Declaration(node) {
            if (!scaleProperty.test(node.property.toLowerCase())) return;
            const [literal] = scaleLiterals(
              context.sourceCode.getText(node.value),
            );
            if (literal)
              context.report({
                node,
                messageId: "scale",
                data: { literal, property: node.property },
              });
          },
        };
      },
    },
    "css-imports": {
      meta: { type: "problem", schema: [], messages: { import: "{{detail}}" } },
      create(context) {
        const filename = context.physicalFilename;
        const workspaces = getWorkspaces();
        const owner = workspaces.find(({ directory }) =>
          filename.startsWith(directory + "/"),
        );
        if (!owner) return {};
        return {
          StyleSheet(node) {
            for (const specifier of importsFrom(
              context.sourceCode.text,
              "style.css",
            )) {
              const detail = checkImport(
                specifier,
                filename,
                owner,
                workspaces,
              );
              if (detail)
                context.report({ node, messageId: "import", data: { detail } });
            }
          },
        };
      },
    },
  },
};
