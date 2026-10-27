// Tests without dependencies: node test/run.js
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Module = require("module");
const { formatHtml } = require("../src/format.js");
const { stripVoidSlash } = require("../src/strip-slash.js");

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// --- stripVoidSlash -------------------------------------------------------
test("removes slash from void elements", () => {
  assert.strictEqual(stripVoidSlash('<img src="a" />'), '<img src="a">');
  assert.strictEqual(stripVoidSlash("<br />"), "<br>");
  assert.strictEqual(stripVoidSlash('<IMG SRC="a"/>'), '<IMG SRC="a">');
});

test("keeps line break when slash is on its own line", () => {
  assert.strictEqual(stripVoidSlash('<input\n  a="1"\n/>'), '<input\n  a="1"\n>');
});

test("does not touch SVG, comments, attributes or raw text", () => {
  const s = '<svg><path d="M0 0" /></svg><!-- <br /> --><p title="<br />">x</p>' +
    '<script>let a = "<br />";</script><style>a::after{content:"<br/>"}</style>' +
    "<textarea><br /></textarea><title>a <br/></title>";
  assert.strictEqual(stripVoidSlash(s), s);
});

// --- formatHtml -----------------------------------------------------------
const SAMPLE = `<!doctype html><html><head><meta charset=utf-8><title>a <br/> b</title>
<link rel=stylesheet href=a.css><style>a::after{content:"<br/>"}</style>
<script>let x="<img src=a />";if(a<b){}</script></head><body><!-- <hr /> -->
<img src="a.jpg" alt="x /> y"><br><input type=text name=n placeholder="Escribe aquí tu nombre completo por favor" required>
<svg><path d="M0 0"/></svg><textarea><br/></textarea><p onclick="f('<br/>')">Hola<br/>mundo</p>
<video><source src=a.mp4 type="video/mp4"></video><hr/></body></html>`;

test("formats a full document without void slashes", async () => {
  const out = await formatHtml(SAMPLE);
  const visible = out
    .replace(/<(script|style|textarea|title)[\s\S]*?<\/\1>|<!--[\s\S]*?-->/g, "")
    .replace(/"[^"]*"/g, '""');
  assert(!/<(img|br|hr|input|meta|link|source)\b[^>]*\/>/i.test(visible), out);
  assert(out.includes('let x = "<img src=a />"'));
  assert(out.includes('content: "<br/>"'));
  assert(out.includes("<textarea><br/></textarea>"));
  assert(out.includes("<!-- <hr /> -->"));
  assert(out.includes('alt="x /> y"'));
  assert(out.includes('<path d="M0 0" />'));
});

test("is idempotent", async () => {
  const once = await formatHtml(SAMPLE);
  assert.strictEqual(await formatHtml(once), once);
});

test("respects useTabs and endOfLine", async () => {
  const t = await formatHtml("<div><p>a</p><img src=a></div>", { useTabs: true });
  assert(t.includes('\t<img src="a">'), t);
  const c = await formatHtml("<div>\r\n<p>a</p><br>\r\n</div>", { endOfLine: "crlf" });
  assert(c.includes("<br>") && c.includes("\r\n"), JSON.stringify(c));
});

test("reports syntax errors", async () => {
  await assert.rejects(() => formatHtml("<div"));
});

// --- extension.js with a mocked VS Code API ---------------------------------
test("extension: registers commands, reads .prettierrc and sets default formatter", async () => {
  const state = { provider: null, cmds: {}, updates: [], msgs: [] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hsb-"));
  fs.writeFileSync(path.join(tmp, ".prettierrc"), '{ "tabWidth": 4 }');
  fs.mkdirSync(path.join(tmp, "web"));

  const vscode = {
    Range: class { constructor(a, b) { this.start = a; this.end = b; } },
    TextEdit: { replace: (range, newText) => ({ range, newText }) },
    ConfigurationTarget: { Global: 1 },
    l10n: { t: (s, ...a) => s.replace(/\{(\d+)\}/g, (_, i) => a[i]) },
    languages: { registerDocumentFormattingEditProvider: (_, p) => { state.provider = p; return { dispose() {} }; } },
    commands: { registerCommand: (id, f) => { state.cmds[id] = f; return { dispose() {} }; } },
    window: {
      showInformationMessage: async (...a) => { state.msgs.push(a); return a[1]; },
      showWarningMessage: async (...a) => { state.msgs.push(a); },
    },
    workspace: {
      getWorkspaceFolder: () => ({ uri: { fsPath: tmp } }),
      getConfiguration: (section) => ({
        inspect: (k) => section === "prettier"
          ? { globalValue: k === "printWidth" ? 40 : undefined }
          : (k === "[html]" ? { globalValue: { "editor.tabSize": 4 } } : undefined),
        get: () => undefined,
        update: async (k, v, t) => state.updates.push([k, v, t]),
      }),
    },
  };
  const origLoad = Module._load;
  Module._load = function (req, ...rest) {
    return req === "vscode" ? vscode : origLoad.call(this, req, ...rest);
  };
  try {
    delete require.cache[require.resolve("../src/extension.js")];
    const ext = require("../src/extension.js");
    const store = {};
    ext.activate({ subscriptions: [], globalState: { get: (k) => store[k], update: async (k, v) => { store[k] = v; } } });
    await new Promise((r) => setTimeout(r, 20));

    const pkg = require("../package.json");
    for (const c of pkg.contributes.commands) assert(state.cmds[c.command], "missing command " + c.command);
    assert.deepStrictEqual(state.updates[0][1], {
      "editor.tabSize": 4, "editor.defaultFormatter": `${pkg.publisher}.${pkg.name}`,
    });

    const text = '<div><p>hola</p><img src="a.jpg" alt="una foto bastante larga"><br></div>';
    const doc = { uri: { scheme: "file", fsPath: path.join(tmp, "web/index.html") }, getText: () => text, positionAt: (o) => o };
    const [edit] = await state.provider.provideDocumentFormattingEdits(doc, { tabSize: 2, insertSpaces: true });
    assert.strictEqual(edit.newText,
      '<div>\n    <p>hola</p>\n    <img\n        src="a.jpg"\n        alt="una foto bastante larga"\n    ><br>\n</div>\n');

    const bad = { ...doc, getText: () => "<div" };
    assert.strictEqual((await state.provider.provideDocumentFormattingEdits(bad, {})).length, 0);
    assert(/could not format/.test(state.msgs.at(-1)[0]));
  } finally {
    Module._load = origLoad;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("l10n: every runtime string has a Spanish translation", () => {
  const src = fs.readFileSync(path.join(__dirname, "../src/extension.js"), "utf8");
  const keys = [...src.matchAll(/l10n\.t\(\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`));
  const es = require("../l10n/bundle.l10n.es.json");
  assert.deepStrictEqual(keys.filter((k) => !(k in es)), []);
  const en = require("../package.nls.json");
  const esNls = require("../package.nls.es.json");
  assert.deepStrictEqual(Object.keys(esNls).sort(), Object.keys(en).sort());
});

(async () => {
  let failed = 0;
  for (const { name, fn } of tests) {
    try { await fn(); console.log("✓", name); }
    catch (e) { failed++; console.error("✗", name, "\n ", e.message); }
  }
  console.log(failed ? `\n${failed} failed` : `\nAll ${tests.length} tests passed`);
  process.exit(failed ? 1 : 0);
})();
