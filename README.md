# HTML sin barra

**English** · [Español](#español)

A VS Code extension that formats HTML with **Prettier**, with one single difference: void elements are written **without the trailing slash**.

```html
<!-- Regular Prettier -->
<img src="photo.jpg" alt="Photo" />
<br />

<!-- With this extension -->
<img src="photo.jpg" alt="Photo">
<br>
```

It affects `img`, `br`, `hr`, `input`, `meta`, `link`, `source`, `track`, `area`, `base`, `col`, `embed`, `param` and `wbr`. It never touches the content of `<script>`, `<style>`, `<textarea>`, comments, attribute values or SVG elements (such as `<path />`).

## Why does this extension exist?

Some HTML elements **have no content and no closing tag**: the so-called *void elements* — `<img>`, `<br>`, `<input>`, `<meta>`, `<link>`…

The trailing slash (`<img ... />`) is a leftover from **XHTML**, where everything had to be closed as in XML. It is still everywhere because **JSX (React)** requires it and because **Prettier always adds it** when formatting HTML.

In **HTML5**, however, that slash:

- **does nothing**: the standard allows it on void elements, but browsers ignore it;
- **can cause bugs** with unquoted attributes: in `<img src=photo.jpg/>` the slash becomes part of the URL. That is why the W3C validator shows a notice when it finds one;
- **is confusing when learning HTML**, because it suggests those tags are "closed", which is not how HTML works.

Prettier has no option to turn it off. This extension keeps everything good about Prettier and removes only that slash, so you write HTML the way the standard defines it.

## Installation

**From the Marketplace:** search for **HTML sin barra** in the Extensions view.

**From a `.vsix` file (no npm needed):**

1. Open the **Extensions** view in VS Code (`Ctrl+Shift+X`, on Mac `Cmd+Shift+X`).
2. Click the **…** menu at the top of the view → **Install from VSIX…**
3. Pick the `html-sin-barra-x.y.z.vsix` file (available in [Releases](https://github.com/ceslava/Prettier-no-HTML-slash/releases)).

**First use:** when you open an HTML file, VS Code asks whether to use it as the HTML formatter: answer **Yes, use it**. If the question doesn't appear, open the Command Palette (`Ctrl+Shift+P`) and run **HTML sin barra: Use as the HTML formatter**.

You can also set it manually in `settings.json`:

```json
"[html]": {
  "editor.defaultFormatter": "ceslava.html-sin-barra"
}
```

From then on, **Format Document** (`Shift+Alt+F`, on Mac `Shift+Option+F`) and format on save work as usual. You can keep the official Prettier extension installed: it will still format CSS, JavaScript, etc.

## Configuration

The extension bundles Prettier (no npm needed) and reads, in this order:

1. The project's `.prettierrc` (JSON format) or the `"prettier"` key in `package.json`, if present.
2. VS Code's `prettier.*` settings (e.g. `prettier.printWidth`).
3. The editor's tab size.

YAML configurations and `.js` config files (`prettier.config.js`) are not read.

The interface is available in English and Spanish, following VS Code's display language.

## Development

```bash
npm test               # run the tests (no dependencies needed)
npm run package        # build the .vsix with @vscode/vsce
```

Prettier is vendored in `prettier/`. To update it:

```bash
npm install --no-save prettier@<version>
npm run vendor-prettier
```

## Author and credits

Created by **Cristian Eslava** — [ceslava.com](https://ceslava.com)

Based on [Prettier](https://prettier.io) (MIT license, © James Long and contributors), which is bundled with the extension. See `prettier/LICENSE.txt`.

License: [MIT](LICENSE).

---

## Español

[English](#html-sin-barra) · **Español**

Extensión de VS Code que formatea HTML con **Prettier**, con una sola diferencia: los elementos vacíos se escriben **sin barra final**.

```html
<!-- Prettier normal -->
<img src="foto.jpg" alt="Foto" />
<br />

<!-- Con esta extensión -->
<img src="foto.jpg" alt="Foto">
<br>
```

Afecta a `img`, `br`, `hr`, `input`, `meta`, `link`, `source`, `track`, `area`, `base`, `col`, `embed`, `param` y `wbr`. Nunca toca el contenido de `<script>`, `<style>`, `<textarea>`, los comentarios, los valores de los atributos ni los elementos SVG (por ejemplo, `<path />`).

### ¿Por qué existe esta extensión?

En HTML hay elementos que **no tienen contenido ni etiqueta de cierre**: los llamados *elementos vacíos* (*void elements*), como `<img>`, `<br>`, `<input>`, `<meta>` o `<link>`.

La barra final (`<img ... />`) es una herencia de **XHTML**, donde todo tenía que cerrarse como en XML. Se sigue viendo por todas partes porque **JSX (React)** la exige y porque **Prettier la añade siempre** al formatear HTML.

Sin embargo, en **HTML5** esa barra:

- **no hace nada**: el estándar la permite en los elementos vacíos, pero los navegadores la ignoran;
- **puede dar problemas** con atributos sin comillas: en `<img src=foto.jpg/>` la barra pasa a formar parte de la URL. Por eso el validador del W3C muestra un aviso cuando la encuentra;
- **confunde al aprender HTML**, porque da a entender que esas etiquetas "se cierran", cuando en HTML no es así.

Prettier no tiene ninguna opción para desactivarla. Esta extensión mantiene todo lo bueno de Prettier y quita solo esa barra, para escribir HTML tal como lo define el estándar.

### Instalación

**Desde el Marketplace:** busca **HTML sin barra** en el panel de Extensiones.

**Desde un archivo `.vsix` (sin npm):**

1. En VS Code, abre el panel de **Extensiones** (`Ctrl+Shift+X`, en Mac `Cmd+Shift+X`).
2. Pulsa el menú **…** de la parte superior del panel → **Instalar desde VSIX…**
3. Elige el archivo `html-sin-barra-x.y.z.vsix` (disponible en [Releases](https://github.com/ceslava/Prettier-no-HTML-slash/releases)).

**Primer uso:** al abrir un archivo HTML, VS Code pregunta si quieres usarla como formateador de HTML: responde **Sí, usarla**. Si no aparece la pregunta, abre la paleta de comandos (`Ctrl+Shift+P`) y ejecuta **HTML sin barra: Usar como formateador de HTML**.

También puedes configurarlo a mano en `settings.json`:

```json
"[html]": {
  "editor.defaultFormatter": "ceslava.html-sin-barra"
}
```

A partir de ahí, **Dar formato al documento** (`Shift+Alt+F`, en Mac `Shift+Option+F`) y el formateo al guardar funcionan como siempre. Puedes dejar instalada la extensión oficial de Prettier: seguirá formateando CSS, JavaScript, etc.

### Configuración

La extensión incluye Prettier (no hace falta npm) y usa, por este orden:

1. El archivo `.prettierrc` del proyecto (en formato JSON) o la clave `"prettier"` del `package.json`, si existen.
2. Los ajustes `prettier.*` de VS Code (por ejemplo, `prettier.printWidth`).
3. El tamaño de tabulación del editor.

No lee configuraciones en YAML ni en archivos `.js` (`prettier.config.js`).

La interfaz está en inglés y en español, según el idioma de VS Code.

### Desarrollo

```bash
npm test               # ejecuta las pruebas (sin dependencias)
npm run package        # genera el .vsix con @vscode/vsce
```

Prettier está incluido en la carpeta `prettier/`. Para actualizarlo:

```bash
npm install --no-save prettier@<versión>
npm run vendor-prettier
```

### Autoría y créditos

Creada por **Cristian Eslava** — [ceslava.com](https://ceslava.com)

Basada en [Prettier](https://prettier.io) (licencia MIT, © James Long y colaboradores), que va incluido en la extensión. Ver `prettier/LICENSE.txt`.

Licencia: [MIT](LICENSE).
