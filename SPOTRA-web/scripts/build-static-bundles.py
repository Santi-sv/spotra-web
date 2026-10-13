"""Bundle the existing files in their approved cascade and execution order."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
css_files = [
    "fonts.css", "style.css", "product.css", "spotri.css", "languages.css", "journey.css",
    "rider-design.css", "mobile-story.css", "device.css", "desktop-polish.css",
    "controls.css", "seo.css",
]
js_files = [
    "journey-sprites.js", "journey-model.js", "i18n.js", "mobile-story.js",
    "app.js", "spotri.js", "journey.js",
]

def bundle(names, output, separator, wrap=None):
    content = separator.join(
        f"/* {name} */\n" + (dist / name).read_text() for name in names
    ) + "\n"
    if wrap:
        content = wrap[0] + content + wrap[1]
    (dist / output).write_text(content)
    return hashlib.sha256(content.encode()).hexdigest()[:12]

css_version = bundle(css_files, "site.css", "\n")
# Los buscadores (window.SPOTRA_BOT, lo decide boot.js) ven la página completa sin animaciones: site.js no corre para ellos.
js_version = bundle(js_files, "site.js", "\n;\n", ("/* SPOTRA web */\nif(!window.SPOTRA_BOT){\n", "}\n"))
index = dist / "index.html"
html = index.read_text()
html = re.sub(
    r'<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="/?(?:' + "|".join(
        re.escape(name) for name in css_files + ["site.css"]
    ) + r')(?:\?[^"]*)?"[^>]*>\n?', "", html,
)
html = html.replace("</head>", f'<link rel="stylesheet" href="/site.css?v={css_version}">\n</head>')
html = re.sub(
    r'<script\b[^>]*\bsrc="/?(?:' + "|".join(
        re.escape(name) for name in js_files + ["site.js"]
    ) + r')(?:\?[^"]*)?"[^>]*></script>\n?', "", html,
)
html = html.replace("</body>", f'<script src="/site.js?v={js_version}"></script>\n</body>')
index.write_text(html)
print(f"Bundled {len(css_files)} stylesheets and {len(js_files)} scripts; original source files retained.")
