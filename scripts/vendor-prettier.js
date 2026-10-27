#!/usr/bin/env node
// Copies the Prettier files the extension needs into ./prettier.
//
// Usage:
//   npm install --no-save prettier@<version>
//   npm run vendor-prettier
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
let src;
try {
  src = path.dirname(require.resolve("prettier/package.json", { paths: [root] }));
} catch {
  console.error("Prettier not found. Run: npm install --no-save prettier@<version>");
  process.exit(1);
}

const dest = path.join(root, "prettier");
const files = [
  ["standalone.js", "standalone.js"],
  ["plugins/html.js", "plugins/html.js"],
  ["plugins/postcss.js", "plugins/postcss.js"],
  ["plugins/babel.js", "plugins/babel.js"],
  ["plugins/estree.js", "plugins/estree.js"],
  ["LICENSE", "LICENSE.txt"],
  ["THIRD-PARTY-NOTICES.md", "THIRD-PARTY-NOTICES.md"],
];

fs.rmSync(dest, { recursive: true, force: true });
for (const [from, to] of files) {
  const target = path.join(dest, to);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(src, from), target);
}

const version = require(path.join(src, "package.json")).version;
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.prettierVersion = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`Prettier ${version} copied to ./prettier`);
