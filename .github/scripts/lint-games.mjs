import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ESLint } from "eslint";

const root = process.cwd();
const gamesRoot = path.join(root, "games");
const eslint = new ESLint({ overrideConfigFile: path.join(root, "eslint.config.js") });

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

const files = await walk(gamesRoot);
const jsFiles = files.filter(file => file.endsWith(".js"));
const htmlFiles = files.filter(file => file.endsWith(".html"));
const results = await eslint.lintFiles(jsFiles);
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  for (let index = 0; index < scripts.length; index++) {
    const [, attributes, source] = scripts[index];
    if (!source.trim()) continue;
    const virtualPath = path.join(path.dirname(htmlFile), `inline-script-${index + 1}.js`);
    const result = await eslint.lintText(source, { filePath: virtualPath });
    results.push(...result);
  }
}

const formatter = await eslint.loadFormatter("stylish");
const output = formatter.format(results);
if (output) process.stdout.write(output);
const errors = results.reduce((total, result) => total + result.errorCount, 0);
const warnings = results.reduce((total, result) => total + result.warningCount, 0);
console.log(`Linted ${jsFiles.length} JavaScript files and inline scripts in ${htmlFiles.length} game pages: ${errors} error(s), ${warnings} warning(s).`);
if (errors > 0) process.exitCode = 1;
