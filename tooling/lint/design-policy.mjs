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
