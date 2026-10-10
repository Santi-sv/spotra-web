"""Bundle the existing files in their approved cascade and execution order."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
css_files = [
    "style.css", "product.css", "spotri.css", "languages.css", "journey.css",
    "rider-design.css", "mobile-story.css", "device.css", "desktop-polish.css",
    "controls.css",
]
js_files = [
    "journey-sprites.js", "journey-model.js", "i18n.js", "mobile-story.js",
    "app.js", "spotri.js", "journey.js",
]

def bundle(names, output, separator):
    content = separator.join(
        f"/* {name} */\n" + (dist / name).read_text() for name in names
    ) + "\n"
    (dist / output).write_text(content)
    return hashlib.sha256(content.encode()).hexdigest()[:12]

css_version = bundle(css_files, "site.css", "\n")
js_version = bundle(js_files, "site.js", "\n;\n")
index = dist / "index.html"
html = index.read_text()
html = re.sub(
    r'<link rel="stylesheet" href="(?:' + "|".join(
        re.escape(name) for name in css_files + ["site.css"]
    ) + r')(?:\?[^"]*)?">', "", html,
)
html = html.replace("</head>", f'<link rel="stylesheet" href="site.css?v={css_version}">\n</head>')
html = re.sub(
    r'<script src="(?:' + "|".join(
        re.escape(name) for name in js_files + ["site.js"]
    ) + r')(?:\?[^"]*)?"></script>', "", html,
)
html = html.replace("</body>", f'<script src="site.js?v={js_version}"></script>\n</body>')
index.write_text(html)
print(f"Bundled {len(css_files)} stylesheets and {len(js_files)} scripts; original source files retained.")
