import { readdirSync, readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { parse } from "@vue/compiler-sfc";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inside = (parent, file) => {
  const path = relative(parent, file);
  return (
    path === "" ||
    (!path.startsWith(`..${sep}`) && path !== ".." && !path.startsWith(sep))
  );
};

export function checkImport(specifier, file, owner, workspaces) {
  if (specifier.startsWith(".")) {
    return inside(owner.directory, resolve(dirname(file), specifier))
      ? null
      : "Relative imports must stay inside their workspace";
  }
  if (specifier.startsWith("/") || specifier.startsWith("#"))
    return "Absolute paths and private aliases cannot bypass package exports";
  if (specifier.startsWith("node:") || builtinModules.includes(specifier))
    return null;
  if (specifier.startsWith("virtual:") && owner.kind === "apps") return null;
  const name = specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0];
  const target = workspaces.find(
    (workspace) => workspace.manifest.name === name,
  );
  const isSource = inside(resolve(owner.directory, "src"), file);
  const dependencies = {
    ...owner.manifest.dependencies,
    ...owner.manifest.peerDependencies,
    ...(!isSource ? owner.manifest.devDependencies : {}),
  };
  if (name !== owner.manifest.name && !(name in dependencies))
    return `Undeclared ${isSource ? "runtime " : ""}dependency: ${name}`;
  if (!target) return null;
  if (target.kind === "apps" && target !== owner)
    return "Applications cannot be imported by other workspaces";
  if (target !== owner && !dependencies[name]?.startsWith("workspace:"))
    return "Internal dependencies must use workspace: protocol";
  const subpath = specifier === name ? "." : `.${specifier.slice(name.length)}`;
  if (!Object.hasOwn(target.manifest.exports ?? {}, subpath))
    return `Not a public export of ${name}: ${subpath}`;
  return null;
}

export function importsFrom(code, filename) {
  if (filename.endsWith(".css")) {
    return [...code.matchAll(/@import\s+["']([^"']+)["']/g)].map(
      (match) => match[1],
    );
  }
  if (filename.endsWith(".vue")) {
    const { descriptor } = parse(code, { filename });
    return [descriptor.script, descriptor.scriptSetup, ...descriptor.styles]
      .filter(Boolean)
      .flatMap((block) => [
        ...(block.src ? [block.src] : []),
        ...importsFrom(
          block.content,
          block.type === "style" ? "style.css" : "script.ts",
        ),
      ]);
  }
  const source = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest,
    true,
  );
  const imports = [];
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    )
      imports.push(node.moduleSpecifier.text);
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    )
      imports.push(node.argument.literal.text);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    ) {
      const argument = node.arguments[0];
      if (
        !argument ||
        (!ts.isStringLiteral(argument) &&
          !ts.isNoSubstitutionTemplateLiteral(argument))
      )
        throw new Error(`${filename}: computed imports cannot be checked`);
      imports.push(argument.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return imports;
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      ["node_modules", "dist", "test-results", "playwright-report"].includes(
        entry.name,
      ) ||
      entry.name.startsWith(".")
    )
      return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory()
      ? files(path)
      : /\.(?:[cm]?[jt]s|vue|css)$/.test(path)
        ? [path]
        : [];
  });
}

function main() {
  const workspaces = ["apps", "packages"].flatMap((kind) =>
    readdirSync(resolve(root, kind), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const directory = resolve(root, kind, entry.name);
        return {
          kind,
          directory,
          manifest: JSON.parse(
            readFileSync(resolve(directory, "package.json"), "utf8"),
          ),
        };
      }),
  );
  const errors = [];
  for (const owner of workspaces) {
    for (const [name, version] of Object.entries({
      ...owner.manifest.dependencies,
      ...owner.manifest.devDependencies,
      ...owner.manifest.peerDependencies,
    })) {
      const target = workspaces.find(
        (workspace) => workspace.manifest.name === name,
      );
      if (
        target &&
        (target.kind === "apps" || !version.startsWith("workspace:"))
      )
        errors.push(
          `${owner.manifest.name}: invalid workspace dependency ${name}`,
        );
    }
    for (const file of files(owner.directory)) {
      for (const specifier of importsFrom(readFileSync(file, "utf8"), file)) {
        const error = checkImport(specifier, file, owner, workspaces);
        if (error)
          errors.push(`${relative(root, file)}: ${specifier}: ${error}`);
      }
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(
    `Package boundaries verified for ${workspaces.length} workspaces.`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
