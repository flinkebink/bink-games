import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "espree";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gamesRoot = path.join(root, "games");

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

const allFiles = await walk(gamesRoot);
const htmlFiles = allFiles.filter(file => file.endsWith(".html"));
const jsFiles = allFiles.filter(file => file.endsWith(".js"));

test("every published game has an index.html entry point", async () => {
  const gameDirectories = (await readdir(gamesRoot, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  const published = [];
  for (const name of gameDirectories) {
    const entry = path.join(gamesRoot, name, "index.html");
    try {
      await stat(entry);
      published.push(name);
    } catch { /* Source-only folders are not published games. */ }
  }
  assert.ok(published.length > 0, "No published games were found");
  for (const name of published) {
    assert.ok(htmlFiles.includes(path.join(gamesRoot, name, "index.html")), `${name} is missing its entry point`);
  }
});

for (const htmlFile of htmlFiles) {
  const relative = path.relative(root, htmlFile);
  test(`${relative}: has a valid HTML document and scripts`, async () => {
    const html = await readFile(htmlFile, "utf8");
    assert.match(html, /<!doctype html>/i, "Missing doctype");
    assert.match(html, /<html\b/i, "Missing html element");
    assert.match(html, /<\/html\s*>/i, "Missing closing html element");

    const gameDirectory = path.dirname(htmlFile);
    const scriptTags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
    for (let index = 0; index < scriptTags.length; index++) {
      const [, attributes, source] = scriptTags[index];
      const src = attributes.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
      if (src && !/^(https?:|\/\/|data:)/i.test(src)) {
        const target = src.startsWith("/") ? path.join(root, src.slice(1)) : path.resolve(gameDirectory, src);
        await stat(target);
      }
      if (source.trim()) {
        const module = /\btype\s*=\s*["']module["']/i.test(attributes);
        assert.doesNotThrow(() => parse(source, {
          ecmaVersion: "latest",
          sourceType: module ? "module" : "script",
        }), `Inline script ${index + 1} has invalid syntax`);
      }
    }
  });
}

for (const jsFile of jsFiles) {
  const relative = path.relative(root, jsFile);
  test(`${relative}: parses and resolves local imports`, async () => {
    const source = await readFile(jsFile, "utf8");
    assert.doesNotThrow(() => parse(source, {
      ecmaVersion: "latest",
      sourceType: "module",
    }));
    const imports = source.matchAll(/(?:\bfrom\s*|\bimport\s*)["'](\.{1,2}\/[^"']+)["']/g);
    for (const match of imports) {
      const target = path.resolve(path.dirname(jsFile), match[1]);
      await stat(target);
    }
  });
}
