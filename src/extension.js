"use strict";

const vscode = require("vscode");
const { formatHtml, readProjectConfig, OPTION_KEYS } = require("./format.js");
const pkg = require("../package.json");

const EXTENSION_ID = `${pkg.publisher}.${pkg.name}`;
const ASKED_KEY = "askedToBeDefault";

/** "prettier.*" settings the user set in VS Code (official Prettier extension). */
function vscodePrettierOptions(uri) {
  const conf = vscode.workspace.getConfiguration("prettier", uri);
  const r = {};
  for (const k of OPTION_KEYS) {
    const info = conf.inspect(k);
    if (!info) continue;
    const v = info.workspaceFolderValue ?? info.workspaceValue ?? info.globalValue;
    if (v !== undefined) r[k] = v;
  }
  return r;
}

function optionsFor(document, editorOptions) {
  const base = {
    tabWidth: editorOptions ? editorOptions.tabSize : 2,
    useTabs: editorOptions ? !editorOptions.insertSpaces : false,
  };
  const folder = vscode.workspace.getWorkspaceFolder(document.uri);
  const project = document.uri.scheme === "file"
    ? readProjectConfig(document.uri.fsPath, folder && folder.uri.fsPath)
    : {};
  // Priority: project .prettierrc > VS Code prettier.* settings > editor
  return { ...base, ...vscodePrettierOptions(document.uri), ...project };
}

async function editsFor(document, editorOptions) {
  const text = document.getText();
  try {
    const result = await formatHtml(text, optionsFor(document, editorOptions));
    if (result === text) return [];
    const all = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
    return [vscode.TextEdit.replace(all, result)];
  } catch (err) {
    const msg = (err && err.message ? err.message : String(err)).split("\n")[0];
    vscode.window.showWarningMessage(vscode.l10n.t("HTML sin barra: could not format the file. {0}", msg));
    return [];
  }
}

async function setAsDefaultFormatter() {
  const conf = vscode.workspace.getConfiguration();
  const current = conf.inspect("[html]");
  const global = (current && current.globalValue) || {};
  await conf.update("[html]", { ...global, "editor.defaultFormatter": EXTENSION_ID },
    vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage(
    vscode.l10n.t("Done: HTML files will be formatted without the slash in <img>, <br>, <input>…"));
}

function isDefaultFormatter() {
  const c = vscode.workspace.getConfiguration("editor", { languageId: "html" });
  return c.get("defaultFormatter") === EXTENSION_ID;
}

async function askIfNeeded(context) {
  if (isDefaultFormatter() || context.globalState.get(ASKED_KEY)) return;
  await context.globalState.update(ASKED_KEY, true);
  const yes = vscode.l10n.t("Yes, use it");
  const answer = await vscode.window.showInformationMessage(
    vscode.l10n.t("Do you want “HTML sin barra” to format your HTML files?"),
    yes, vscode.l10n.t("Not now"));
  if (answer === yes) await setAsDefaultFormatter();
}

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      [{ language: "html" }],
      { provideDocumentFormattingEdits: (doc, opts) => editsFor(doc, opts) }
    ),
    vscode.commands.registerCommand("htmlSinBarra.setAsDefaultFormatter", setAsDefaultFormatter),
    vscode.commands.registerCommand("htmlSinBarra.formatDocument", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== "html") {
        vscode.window.showInformationMessage(vscode.l10n.t("Open an HTML file to format it."));
        return;
      }
      const edits = await editsFor(editor.document, editor.options);
      if (edits.length) {
        await editor.edit((b) => edits.forEach((e) => b.replace(e.range, e.newText)));
      }
    })
  );
  askIfNeeded(context);
}

function deactivate() {}

module.exports = { activate, deactivate };
