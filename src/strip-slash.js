"use strict";

// HTML void elements: they never have content or a closing tag.
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr", "keygen",
]);

// Raw-text / RCDATA elements: their content is never touched.
const RAW_TEXT = new Set(["script", "style", "textarea", "title"]);

const isNameChar = (c) => /[A-Za-z0-9\-_:.]/.test(c);

/**
 * Removes the trailing slash from HTML void elements (<img ... /> -> <img ...>).
 *
 * Leaves untouched: comments, <script>, <style>, <textarea>, <title>,
 * quoted attribute values and foreign elements such as SVG (<path />).
 * If the slash sits on its own line (multi-line tag), the line break and
 * indentation are kept, so `/>` simply becomes `>`.
 *
 * @param {string} html
 * @returns {string}
 */
function stripVoidSlash(html) {
  let out = "";
  let i = 0;
  const n = html.length;
  const lower = html.toLowerCase();

  while (i < n) {
    const lt = html.indexOf("<", i);
    if (lt === -1) { out += html.slice(i); break; }
    out += html.slice(i, lt);
    i = lt;

    // Comments
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      const stop = end === -1 ? n : end + 3;
      out += html.slice(i, stop); i = stop; continue;
    }
    // <!doctype>, <![CDATA[ ]]>, <?...?>
    if (html[i + 1] === "!" || html[i + 1] === "?") {
      const cdata = html.startsWith("<![CDATA[", i);
      const end = cdata ? html.indexOf("]]>", i) : html.indexOf(">", i);
      const stop = end === -1 ? n : end + (cdata ? 3 : 1);
      out += html.slice(i, stop); i = stop; continue;
    }
    // Closing tag or a stray "<"
    if (!/[A-Za-z]/.test(html[i + 1] || "")) { out += "<"; i++; continue; }

    // Opening tag: read its name
    let j = i + 1;
    while (j < n && isNameChar(html[j])) j++;
    const name = lower.slice(i + 1, j);

    // Walk the attributes, honouring quotes, up to the real ">"
    let k = j;
    let quote = null;
    while (k < n) {
      const c = html[k];
      if (quote) { if (c === quote) quote = null; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === ">") break;
      k++;
    }
    if (k >= n) { out += html.slice(i); break; }
    let tag = html.slice(i, k + 1); // includes ">"

    if (VOID_ELEMENTS.has(name)) {
      const m = /(\s*)\/(\s*)>$/.exec(tag);
      if (m) {
        const before = m[1];
        const keep = before.includes("\n") ? before : "";
        tag = tag.slice(0, m.index) + keep + ">";
      }
    }
    out += tag;
    i = k + 1;

    // Skip raw text up to its closing tag
    if (RAW_TEXT.has(name)) {
      const re = new RegExp("</" + name + "\\s*>", "ig");
      re.lastIndex = i;
      const m = re.exec(html);
      const stop = m ? m.index : n;
      out += html.slice(i, stop);
      i = stop;
    }
  }
  return out;
}

module.exports = { stripVoidSlash, VOID_ELEMENTS };
