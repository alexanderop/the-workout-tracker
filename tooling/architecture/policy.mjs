import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  realpathSync,
} from "node:fs";
import { dirname, resolve, relative, sep } from "node:path";
import ts from "typescript";
import { parse } from "@vue/compiler-sfc";

export const featureDependencies = {};
// Pure ECMAScript packages that every layer except the entry points may use.
const pureLayers = new Set([
  "domain",
  "ports",
  "application",
  "adapters",
  "ui",
]);
const layers = {
  domain: ["domain"],
  ports: ["domain"],
  application: ["domain", "ports", "application"],
  adapters: ["domain", "ports", "adapters"],
  ui: ["domain", "application", "ui"],
  index: ["domain", "application"],
  infrastructure: ["adapters"],
};
const pure = new Set(["domain", "ports", "application"]);
// Pure layers may use only ECMAScript built-ins. Anything else that resolves
// to no declaration is ambient host state (DOM, Node, timers, Intl locale).
const builtins = new Set([
  "undefined",
  "NaN",
  "Infinity",
  "Object",
  "Function",
  "Array",
  "Number",
  "Boolean",
  "String",
  "Symbol",
  "BigInt",
  "Date",
  "Math",
  "JSON",
  "Promise",
  "RegExp",
  "Reflect",
  "Proxy",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "WeakRef",
  "FinalizationRegistry",
  "Error",
  "AggregateError",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  "Atomics",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "BigInt64Array",
  "BigUint64Array",
  "parseInt",
  "parseFloat",
  "isNaN",
  "isFinite",
  "encodeURI",
  "encodeURIComponent",
  "decodeURI",
  "decodeURIComponent",
]);
function inTypePosition(node) {
  for (let current = node.parent; current; current = current.parent)
    if (ts.isTypeNode(current) || ts.isHeritageClause(current)) return true;
  return false;
}
export function describe(file) {
  const normalized = file.split(sep).join("/");
  const match = normalized.match(/\/src\/features\/([^/]+)\/(.+)$/);
  if (!match) return null;
  const path = match[2].replace(/\.(?:[cm]?[jt]sx?|vue)$/, "");
  return { feature: match[1], layer: path.split("/")[0], path };
}
export function resolveImport(specifier, file) {
  if (specifier.startsWith(".")) {
    const target = resolve(dirname(file), specifier);
    const candidate = [
      target,
      target + ".ts",
      target + ".tsx",
      target + ".vue",
      resolve(target, "index.ts"),
    ].find((path) => existsSync(path) && statSync(path).isFile());
    return candidate ? realpathSync(candidate) : target;
  }
  const config = ts.findConfigFile(dirname(file), ts.sys.fileExists);
  if (!config) return null;
  const parsed = ts.getParsedCommandLineOfConfigFile(
    config,
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} },
  );
  if (!parsed) return null;
  const resolved = ts.resolveModuleName(
    specifier,
    file,
    parsed.options,
    ts.sys,
  ).resolvedModule;
  if (resolved && !resolved.isExternalLibraryImport)
    return resolved.resolvedFileName;
  for (const [alias, paths] of Object.entries(parsed.options.paths ?? {})) {
    const [prefix, suffix = ""] = alias.split("*");
    if (
      alias.includes("*")
        ? specifier.startsWith(prefix) && specifier.endsWith(suffix)
        : specifier === alias
    ) {
      const middle = specifier.slice(
        prefix.length,
        suffix ? -suffix.length : undefined,
      );
      return resolve(
        parsed.options.baseUrl ?? dirname(config),
        paths[0].replace("*", middle),
      );
    }
  }
  return null;
}
export function importViolation(
  file,
  specifier,
  dependencies = featureDependencies,
) {
  if (!file.split(sep).join("/").includes("/src/")) return null;
  const source = describe(file);
  const targetPath = resolveImport(specifier, file);
  // Feature UI reads text and number formats from the i18n entry point only.
  if (
    source?.layer === "ui" &&
    targetPath?.split(sep).join("/").endsWith("/src/i18n/index.ts")
  )
    return null;
  const target = targetPath && describe(targetPath);
  if (target) {
    if (!Object.hasOwn(layers, target.layer))
      return "Unknown feature layer; declare its architectural role.";
    if (!source) {
      const composition = file.endsWith("/src/app/composition.ts");
      if (
        target.path === "index" ||
        target.path === "ui" ||
        (composition && target.path === "infrastructure")
      )
        return null;
      return "Import the feature public API; adapter factories are reserved for app/composition.ts.";
    }
    if (source.feature !== target.feature) {
      if (target.path !== "index")
        return "Other features may only import the public index.";
      if (!(dependencies[source.feature] ?? []).includes(target.feature))
        return "Feature dependency is not explicitly allowed.";
      if (source.layer !== "application")
        return "Cross-feature dependencies belong in application workflows.";
      return null;
    }
    return layers[source.layer]?.includes(target.layer)
      ? null
      : `${source.layer} cannot import ${target.layer}; inject the required capability.`;
  }
  if (targetPath)
    return source
      ? "Feature code cannot import application wiring or unclassified source."
      : null;
  if (!source) {
    if (/^(?:dexie|@supabase\/|@aws-sdk\/|openai(?:\/|$))/.test(specifier))
      return "Vendor SDKs belong in their feature adapter.";
    return null;
  }
  if (!Object.hasOwn(layers, source.layer))
    return "Unknown feature layer; declare its architectural role.";
  if (specifier === "@form/result" && pureLayers.has(source.layer)) return null;
  if (specifier === "@form/composables" && source.layer !== "ui")
    return "Browser composables belong in the feature UI layer; inject browser capabilities elsewhere.";
  if (["domain", "application"].includes(source.layer) && specifier === "zod")
    return null;
  if (source.layer === "adapters") {
    if (specifier === "zod") return null;
    if (
      (specifier === "dexie" || specifier.startsWith("dexie/")) &&
      source.path === "adapters/dexie"
    )
      return null;
    return "Register this SDK and its owning adapter explicitly in the architecture policy.";
  }
  if (
    source.layer === "ui" &&
    /^(?:vue|@vueuse\/core|@form\/composables|@form\/ui(?:\/muscle-map-types)?|@lucide\/vue|lucide-vue-next|reka-ui)$/.test(
      specifier,
    )
  )
    return null;
  return `${source.layer} cannot import external dependency ${specifier}.`;
}
function scriptBlocks(code, file) {
  if (!file.endsWith(".vue")) return [{ content: code, offset: 0 }];
  const { descriptor, errors } = parse(code, { filename: file });
  if (errors.length)
    throw new Error("Cannot parse Vue source for architecture checks.");
  return [descriptor.script, descriptor.scriptSetup]
    .filter(Boolean)
    .map((block) => ({
      content: block.content,
      offset: block.loc.start.offset,
      src: block.src,
    }));
}
export function analyze(
  code,
  file,
  dependencies = featureDependencies,
  scriptOnly = false,
) {
  if (!file.split(sep).join("/").includes("/src/")) return [];
  const issues = [];
  const report = (message, position = 0) => issues.push({ message, position });
  const owner = describe(file);
  if (owner && !Object.hasOwn(layers, owner.layer))
    report("Unknown feature layer; declare its architectural role.");
  for (const block of scriptOnly
    ? [{ content: code, offset: 0 }]
    : scriptBlocks(code, file)) {
    if (block.src)
      report(
        "External Vue scripts are not permitted; keep imports visible in the component.",
      );
    const source = ts.createSourceFile(
      file + ".ts",
      block.content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const host = {
      getSourceFile: (name) => (name === source.fileName ? source : undefined),
      getDefaultLibFileName: () => "",
      writeFile() {},
      getCurrentDirectory: () => dirname(file),
      getDirectories: () => [],
      fileExists: (name) => name === source.fileName,
      readFile: () => undefined,
      getCanonicalFileName: (name) => name,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => "\n",
    };
    const checker = ts
      .createProgram([source.fileName], { noLib: true, noResolve: true }, host)
      .getTypeChecker();
    const check = (specifier, node) => {
      const error = importViolation(file, specifier, dependencies);
      if (error) report(error, block.offset + node.getStart(source));
    };
    const global = (node) => {
      if (!ts.isIdentifier(node)) return false;
      const symbol = ts.isShorthandPropertyAssignment(node.parent)
        ? checker.getShorthandAssignmentValueSymbol(node.parent)
        : checker.getSymbolAtLocation(node);
      return !symbol?.declarations?.length;
    };
    function visit(node) {
      if (
        owner &&
        ts.isMetaProperty(node) &&
        node.keywordToken === ts.SyntaxKind.ImportKeyword
      )
        report(
          "Feature code cannot use import.meta loaders; use explicit literal imports.",
          block.offset + node.getStart(source),
        );
      if (owner?.layer === "ports" && ts.isExportDeclaration(node)) {
        const clause = node.exportClause;
        if (!(
          node.isTypeOnly ||
          (clause &&
            ts.isNamedExports(clause) &&
            clause.elements.length > 0 &&
            clause.elements.every((element) => element.isTypeOnly))
        ))
          report(
            "Ports may only re-export domain types.",
            block.offset + node.getStart(source),
          );
      }
      if (
        owner?.layer === "ports" &&
        ts.isImportEqualsDeclaration(node) &&
        !node.isTypeOnly
      )
        report(
          "Ports may only import domain types.",
          block.offset + node.getStart(source),
        );
      if (owner?.layer === "ports" && ts.isImportDeclaration(node)) {
        const clause = node.importClause;
        const bindings = clause?.namedBindings;
        const typeOnly =
          clause?.isTypeOnly ||
          (!clause?.name &&
            bindings &&
            ts.isNamedImports(bindings) &&
            bindings.elements.length > 0 &&
            bindings.elements.every((element) => element.isTypeOnly));
        if (!typeOnly)
          report(
            "Ports may only import domain types.",
            block.offset + node.getStart(source),
          );
      }
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier
      )
        check(node.moduleSpecifier.text, node);
      if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference) &&
        node.moduleReference.expression
      )
        check(node.moduleReference.expression.text, node);
      if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      )
        check(node.argument.literal.text, node);
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) &&
            node.expression.text === "require"))
      ) {
        if (owner?.layer === "ports")
          report(
            "Ports cannot load runtime dependencies; use type-only imports.",
            block.offset + node.getStart(source),
          );
        const argument = node.arguments[0];
        if (
          !argument ||
          (!ts.isStringLiteral(argument) &&
            !ts.isNoSubstitutionTemplateLiteral(argument))
        )
          report(
            "Computed imports cannot be checked; use a literal import.",
            block.offset + node.getStart(source),
          );
        else check(argument.text, node);
      }
      if (pure.has(owner?.layer) && ts.isIdentifier(node) && global(node)) {
        const parent = node.parent;
        const property =
          (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
          (ts.isPropertyAssignment(parent) && parent.name === node) ||
          ts.isPropertySignature(parent) ||
          ts.isMethodDeclaration(parent) ||
          ts.isBindingElement(parent);
        if (!property && !inTypePosition(node)) {
          let forbidden = !builtins.has(node.text);
          if (node.text === "Date")
            forbidden =
              !(
                ts.isNewExpression(parent) &&
                parent.expression === node &&
                parent.arguments?.length > 0
              ) && !ts.isTypeReferenceNode(parent);
          if (node.text === "Math")
            forbidden = !(
              ts.isPropertyAccessExpression(parent) &&
              parent.expression === node &&
              parent.name.text !== "random"
            );
          if (forbidden)
            report(
              `Inject ${node.text} instead of accessing ambient effects in ${owner.layer}.`,
              block.offset + node.getStart(source),
            );
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return issues;
}
export function sourceFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(resolve(directory, entry.name))
      : /\.(?:[cm]?[jt]sx?|vue)$/.test(entry.name)
        ? [resolve(directory, entry.name)]
        : [],
  );
}
export function assertAcyclic(dependencies) {
  const active = new Set();
  const done = new Set();
  function visit(feature) {
    if (active.has(feature))
      throw new Error(`Feature dependency cycle involving ${feature}.`);
    if (done.has(feature)) return;
    active.add(feature);
    for (const dependency of dependencies[feature] ?? []) visit(dependency);
    active.delete(feature);
    done.add(feature);
  }
  Object.keys(dependencies).forEach(visit);
}
export function checkDirectory(directory) {
  assertAcyclic(featureDependencies);
  return sourceFiles(directory).flatMap((file) =>
    analyze(readFileSync(file, "utf8"), file).map(
      (issue) => `${relative(directory, file)}: ${issue.message}`,
    ),
  );
}
