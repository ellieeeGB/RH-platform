import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Lightweight structural checks: resolve imports, catch orphan components and broken local docs.
const root = process.cwd();
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const files = ["src", "scripts", "tests"].flatMap(dir => walk(path.join(root, dir))).filter(file => /\.(tsx?|mjs)$/.test(file));
const edges = new Map();
const errors = [];
const relative = file => path.relative(root, file).split(path.sep).join("/");
for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const targets = [];
  function visit(node) {
    let specifier;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) specifier = node.moduleSpecifier.text;
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) specifier = node.arguments[0].text;
    if (specifier && (specifier.startsWith(".") || specifier.startsWith("@/"))) {
      const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule?.resolvedFileName;
      const asset = path.resolve(path.dirname(file), specifier);
      if (resolved) targets.push(path.resolve(resolved));
      else if (!fs.existsSync(asset)) errors.push(`${relative(file)}: unresolved import ${specifier}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  edges.set(file, targets);
}
const reachable = new Set();
function follow(file) {
  if (reachable.has(file)) return;
  reachable.add(file);
  (edges.get(file) ?? []).forEach(follow);
}
files.filter(file => /src\/app\/.*\/(page|layout|route|loading|error|not-found|template|default|global-error)\.tsx?$/.test(relative(file)) || /^src\/app\/(page|layout|not-found|global-error)\.tsx$/.test(relative(file))).forEach(follow);
for (const file of files) if (relative(file).startsWith("src/components/") && !reachable.has(file)) errors.push(`${relative(file)}: component module is unreachable from app routes`);
const docs = ["README.md", "CONTRIBUTING.md"].map(file => path.join(root, file)).concat(walk(path.join(root, "docs")).filter(file => file.endsWith(".md")));
for (const file of docs) {
  const body = fs.readFileSync(file, "utf8");
  for (const match of body.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1];
    if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(target)) continue;
    const local = decodeURIComponent(target.split(/[?#]/)[0]);
    if (local && !fs.existsSync(path.resolve(path.dirname(file), local))) errors.push(`${relative(file)}: broken local link ${target}`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Project structure verified: ${files.length} source files, ${docs.length} documents; component modules reachable.`);
