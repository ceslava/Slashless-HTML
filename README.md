# Slashless HTML

**English** · [Español](#español)

An HTML formatter for VS Code that writes void elements **without the trailing slash**, the way HTML5 defines them.

```html
<!-- Other formatters -->
<img src="photo.jpg" alt="Photo" />
<br />

<!-- Slashless HTML -->
<img src="photo.jpg" alt="Photo">
<br>
```

It formats the whole document (indentation, line wrapping, attributes, embedded CSS and JavaScript) and writes `img`, `br`, `hr`, `input`, `meta`, `link`, `source`, `track`, `area`, `base`, `col`, `embed`, `param` and `wbr` without the slash. It never touches the content of `<script>`, `<style>`, `<textarea>`, comments, attribute values or SVG elements (such as `<path />`).

Works out of the box: no npm, no Node.js, nothing else to install.

## Why does this extension exist?

Some HTML elements **have no content and no closing tag**: the so-called *void elements* — `<img>`, `<br>`, `<input>`, `<meta>`, `<link>`…

The trailing slash (`<img ... />`) is a leftover from **XHTML**, where everything had to be closed as in XML. It is still everywhere because **JSX (React)** requires it and because **Prettier**, the most popular formatter, always adds it to HTML.

In **HTML5**, however, that slash:

- **does nothing**: the standard allows it on void elements, but browsers ignore it;
- **can cause bugs** with unquoted attributes: in `<img src=photo.jpg/>` the slash becomes part of the URL. That is why the W3C validator shows a notice when it finds one;
- **is confusing when learning HTML**, because it suggests those tags are "closed", which is not how HTML works.

**Prettier has no option to turn this off**, even though it has been requested for years ([prettier/prettier#5246](https://github.com/prettier/prettier/issues/5246)). Slashless HTML is simply another HTML formatter you can pick in VS Code: same clean, consistent output, minus the slash.

## Installation

**From the Marketplace:** search for **Slashless HTML** in the Extensions view.

**From a `.vsix` file:**

1. Open the **Extensions** view in VS Code (`Ctrl+Shift+X`, on Mac `Cmd+Shift+X`).
2. Click the **…** menu at the top of the view → **Install from VSIX…**
3. Pick the `slashless-html-x.y.z.vsix` file (available in [Releases](https://github.com/ceslava/slashless-html/releases)).

**First use:** when you open an HTML file, VS Code asks whether to use it as the HTML formatter: answer **Yes, use it**. If the question doesn't appear, open the Command Palette (`Ctrl+Shift+P`) and run **Slashless HTML: Use as the HTML formatter**.

You can also set it manually in `settings.json`:

```json
"[html]": {
  "editor.defaultFormatter": "ceslava.slashless-html"
}
```

From then on, **Format Document** (`Shift+Alt+F`, on Mac `Shift+Option+F`) and format on save work as usual. It only handles HTML, so it can live alongside any other formatter you use for CSS, JavaScript, etc.

## Configuration

No configuration is needed. If you want to tweak the output, it reads Prettier-style options (`printWidth`, `tabWidth`, `useTabs`, `singleAttributePerLine`, `bracketSameLine`…), in this order:

1. The project's `.prettierrc` (JSON format) or the `"prettier"` key in `package.json`, if present.
2. VS Code's `prettier.*` settings (e.g. `prettier.printWidth`).
3. The editor's tab size.

YAML configurations and `.js` config files (`prettier.config.js`) are not read.

The interface is available in English and Spanish, following VS Code's display language.

## How it works

Slashless HTML uses [Prettier](https://prettier.io) 3.8.1 as its formatting engine, bundled inside the extension, and then removes the trailing slash from void elements in the result.

## Development

```bash
npm test               # run the tests (no dependencies needed)
npm run package        # build the .vsix with @vscode/vsce
```

The formatting engine is vendored in `prettier/`. To update it:

```bash
npm install --no-save prettier@<version>
npm run vendor-prettier
```

## Author and credits

Created by **Cristian Eslava** — [ceslava.com](https://ceslava.com)

Formatting engine: [Prettier](https://prettier.io) (MIT license, © James Long and contributors). See `prettier/LICENSE.txt`.

License: [MIT](LICENSE).

---

## Español

[English](#slashless-html) · **Español**

Un formateador de HTML para VS Code que escribe los elementos vacíos **sin la barra final**, tal como los define HTML5.

```html
<!-- Otros formateadores -->
<img src="foto.jpg" alt="Foto" />
<br />

<!-- Slashless HTML -->
<img src="foto.jpg" alt="Foto">
<br>
```

Formatea el documento completo (sangría, saltos de línea, atributos, CSS y JavaScript incrustados) y escribe `img`, `br`, `hr`, `input`, `meta`, `link`, `source`, `track`, `area`, `base`, `col`, `embed`, `param` y `wbr` sin la barra. Nunca toca el contenido de `<script>`, `<style>`, `<textarea>`, los comentarios, los valores de los atributos ni los elementos SVG (por ejemplo, `<path />`).

Funciona tal cual: sin npm, sin Node.js y sin instalar nada más.

### ¿Por qué existe esta extensión?

En HTML hay elementos que **no tienen contenido ni etiqueta de cierre**: los llamados *elementos vacíos* (*void elements*), como `<img>`, `<br>`, `<input>`, `<meta>` o `<link>`.

La barra final (`<img ... />`) es una herencia de **XHTML**, donde todo tenía que cerrarse como en XML. Se sigue viendo por todas partes porque **JSX (React)** la exige y porque **Prettier**, el formateador más usado, la añade siempre en HTML.

Sin embargo, en **HTML5** esa barra:

- **no hace nada**: el estándar la permite en los elementos vacíos, pero los navegadores la ignoran;
- **puede dar problemas** con atributos sin comillas: en `<img src=foto.jpg/>` la barra pasa a formar parte de la URL. Por eso el validador del W3C muestra un aviso cuando la encuentra;
- **confunde al aprender HTML**, porque da a entender que esas etiquetas "se cierran", cuando en HTML no es así.

**Prettier no tiene ninguna opción para desactivarla**, aunque se lleva años pidiendo ([prettier/prettier#5246](https://github.com/prettier/prettier/issues/5246)). Slashless HTML es, sencillamente, un formateador de HTML más que puedes elegir en VS Code: el mismo resultado limpio y coherente, pero sin la barra.

### Instalación

**Desde el Marketplace:** busca **Slashless HTML** en el panel de Extensiones.

**Desde un archivo `.vsix`:**

1. En VS Code, abre el panel de **Extensiones** (`Ctrl+Shift+X`, en Mac `Cmd+Shift+X`).
2. Pulsa el menú **…** de la parte superior del panel → **Instalar desde VSIX…**
3. Elige el archivo `slashless-html-x.y.z.vsix` (disponible en [Releases](https://github.com/ceslava/slashless-html/releases)).

**Primer uso:** al abrir un archivo HTML, VS Code pregunta si quieres usarla como formateador de HTML: responde **Sí, usarla**. Si no aparece la pregunta, abre la paleta de comandos (`Ctrl+Shift+P`) y ejecuta **Slashless HTML: Usar como formateador de HTML**.

También puedes configurarlo a mano en `settings.json`:

```json
"[html]": {
  "editor.defaultFormatter": "ceslava.slashless-html"
}
```

A partir de ahí, **Dar formato al documento** (`Shift+Alt+F`, en Mac `Shift+Option+F`) y el formateo al guardar funcionan como siempre. Solo se encarga del HTML, así que puede convivir con cualquier otro formateador que uses para CSS, JavaScript, etc.

### Configuración

No necesita configuración. Si quieres ajustar el resultado, lee opciones al estilo de Prettier (`printWidth`, `tabWidth`, `useTabs`, `singleAttributePerLine`, `bracketSameLine`…), por este orden:

1. El archivo `.prettierrc` del proyecto (en formato JSON) o la clave `"prettier"` del `package.json`, si existen.
2. Los ajustes `prettier.*` de VS Code (por ejemplo, `prettier.printWidth`).
3. El tamaño de tabulación del editor.

No lee configuraciones en YAML ni en archivos `.js` (`prettier.config.js`).

La interfaz está en inglés y en español, según el idioma de VS Code.

### Cómo funciona

Slashless HTML usa [Prettier](https://prettier.io) 3.8.1 como motor de formateo, incluido dentro de la extensión, y después quita la barra final de los elementos vacíos en el resultado.

### Desarrollo

```bash
npm test               # ejecuta las pruebas (sin dependencias)
npm run package        # genera el .vsix con @vscode/vsce
```

El motor de formateo está incluido en la carpeta `prettier/`. Para actualizarlo:

```bash
npm install --no-save prettier@<versión>
npm run vendor-prettier
```

### Autoría y créditos

Creada por **Cristian Eslava** — [ceslava.com](https://ceslava.com)

Motor de formateo: [Prettier](https://prettier.io) (licencia MIT, © James Long y colaboradores). Ver `prettier/LICENSE.txt`.

Licencia: [MIT](LICENSE).
