"use strict";

const fs = require("fs");
const path = require("path");
const prettier = require("../prettier/standalone.js");
const plugins = [
  require("../prettier/plugins/html.js"),
  require("../prettier/plugins/postcss.js"),
  require("../prettier/plugins/babel.js"),
  require("../prettier/plugins/estree.js"),
];
const { stripVoidSlash } = require("./strip-slash.js");

// Prettier options accepted from configuration files and settings.
const OPTION_KEYS = [
  "printWidth", "tabWidth", "useTabs", "semi", "singleQuote", "quoteProps",
  "trailingComma", "bracketSpacing", "bracketSameLine", "arrowParens",
  "htmlWhitespaceSensitivity", "endOfLine", "singleAttributePerLine",
  "embeddedLanguageFormatting", "vueIndentScriptAndStyle", "objectWrap",
];

function pickOptions(obj) {
  const r = {};
  if (obj && typeof obj === "object") {
    for (const k of OPTION_KEYS) if (obj[k] !== undefined) r[k] = obj[k];
  }
  return r;
}

/**
 * Looks for a JSON `.prettierrc` / `.prettierrc.json`, or a "prettier" key in
 * package.json, walking up from the file's folder (stopping at `rootDir`).
 * Returns {} when nothing readable is found (e.g. YAML or prettier.config.js).
 */
function readProjectConfig(filePath, rootDir) {
  if (!filePath) return {};
  let dir = path.dirname(filePath);
  for (let n = 0; n < 50; n++) {
    for (const name of [".prettierrc", ".prettierrc.json"]) {
      const f = path.join(dir, name);
      if (fs.existsSync(f)) {
        try { return pickOptions(JSON.parse(fs.readFileSync(f, "utf8"))); }
        catch { return {}; }
      }
    }
    const pkg = path.join(dir, "package.json");
    if (fs.existsSync(pkg)) {
      try {
        const j = JSON.parse(fs.readFileSync(pkg, "utf8"));
        if (j.prettier && typeof j.prettier === "object") return pickOptions(j.prettier);
      } catch { /* ignore */ }
    }
    if (rootDir && path.resolve(dir) === path.resolve(rootDir)) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return {};
}

/**
 * Formats HTML with Prettier and removes the trailing slash from void elements.
 * @param {string} text
 * @param {object} options Prettier options
 * @returns {Promise<string>}
 */
async function formatHtml(text, options = {}) {
  const result = await prettier.format(text, { ...options, parser: "html", plugins });
  return stripVoidSlash(result);
}

module.exports = { formatHtml, readProjectConfig, pickOptions, OPTION_KEYS };
