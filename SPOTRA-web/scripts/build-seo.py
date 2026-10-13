"""SPOTRA web · páginas por idioma para buscadores (13/10/2026).

Correr DESPUÉS de build-static-bundles.py, desde la carpeta SPOTRA-web:
    python3 scripts/build-static-bundles.py && python3 scripts/build-seo.py

Toma dist/index.html como plantilla y genera:
  dist/index.html      (español,   https://spotra.online/)
  dist/pt/index.html   (português, https://spotra.online/pt/)
  dist/en/index.html   (english,   https://spotra.online/en/)
  dist/sitemap.xml     (las 3 direcciones, enlazadas entre sí)
Cada página trae su idioma ya escrito en el HTML (lo que lee Google), su título, descripción,
canónica, hreflang, Open Graph y datos estructurados (JSON-LD). Los textos salen de dist/i18n.js:
para cambiar un texto, cambiarlo en i18n.js (y en index.html) y volver a correr los dos scripts.
Necesita Node (para leer i18n.js) y BeautifulSoup 4.
"""
from pathlib import Path
import datetime
import json
import re
import subprocess

from bs4 import BeautifulSoup, Comment
from bs4.formatter import HTMLFormatter


class KeepOrder(HTMLFormatter):
    """HTML5 sin reordenar los atributos (BeautifulSoup los ordena alfabéticamente por defecto)."""
    def __init__(self):
        super().__init__(entity_substitution=HTMLFormatter.REGISTRY["minimal"].entity_substitution,
                         void_element_close_prefix=None, empty_attributes_are_booleans=True)

    def attributes(self, tag):
        return list(tag.attrs.items())

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SITE = "https://spotra.online"
APP = "https://app.spotra.online/"
INSTAGRAM = "https://www.instagram.com/spotra.ok"
EMAIL = "spotra.2026@gmail.com"

LANGS = {
    "es": {"path": "/", "html": "es-419", "hreflang": "es", "og": "es_LA"},
    "pt": {"path": "/pt/", "html": "pt-BR", "hreflang": "pt-BR", "og": "pt_BR"},
    "en": {"path": "/en/", "html": "en", "hreflang": "en", "og": "en_US"},
}
# Textos para redes (Open Graph) y datos estructurados que no están en i18n.js
COPY = {
    "es": {
        "og_title": "SPOTRA — Tu próxima sesión empieza aquí",
        "og_desc": "Hecho por la comunidad, para la comunidad. Encuentra spots, arma una sesión y conecta con riders de Latinoamérica.",
        "og_alt": "SPOTRA: Tu próxima sesión empieza aquí. SPOTRI sobre su skate en un skatepark nocturno.",
        "app_desc": "App web gratuita para riders de skate, BMX, rollers y scooter: mapa colaborativo de spots y skateparks, sesiones, eventos con ranking, foro y market de equipo usado.",
        "area": "Latinoamérica",
    },
    "pt": {
        "og_title": "SPOTRA — Sua próxima sessão começa aqui",
        "og_desc": "Feito pela comunidade, para a comunidade. Encontre spots, combine uma sessão e conecte-se com riders da América Latina.",
        "og_alt": "SPOTRA: Sua próxima sessão começa aqui. SPOTRI no skate em uma pista à noite.",
        "app_desc": "App web gratuito para riders de skate, BMX, patins e patinete: mapa colaborativo de spots e pistas, sessões, eventos com ranking, fórum e market de equipamento usado.",
        "area": "América Latina",
    },
    "en": {
        "og_title": "SPOTRA — Your next session starts here",
        "og_desc": "Made by the community, for the community. Find spots, set up a session and connect with riders across Latin America.",
        "og_alt": "SPOTRA: Your next session starts here. SPOTRI on his skateboard in a skatepark at night.",
        "app_desc": "Free web app for skate, BMX, roller and scooter riders: a collaborative map of spots and skateparks, sessions, events with rankings, a forum and a used-gear marketplace.",
        "area": "Latin America",
    },
}


def read_i18n():
    """Ejecuta las llamadas b(...) de i18n.js en Node y devuelve traducciones y vínculos."""
    src = (DIST / "i18n.js").read_text(encoding="utf-8")
    calls = "\n".join(l for l in src.splitlines() if l.startswith(" b("))
    js = (
        "const translations={},bindings=[];"
        "function b(key,selector,es,pt,en,kind='text'){translations[key]={es,pt,en};if(selector)bindings.push({key,selector,kind});}\n"
        + calls
        + "\nprocess.stdout.write(JSON.stringify({translations,bindings}));"
    )
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def absolutize(soup):
    """En /pt/ y /en/ los archivos tienen que pedirse desde la raíz (/assets/...)."""
    def fix(url):
        url = url.strip()
        if not url or url.startswith(("http:", "https:", "/", "#", "mailto:", "tel:", "data:")):
            return url
        return "/" + url
    for el in soup.find_all(True):
        for attr in ("src", "href", "data-src", "poster"):
            if el.has_attr(attr):
                el[attr] = fix(el[attr])
        for attr in ("srcset", "imagesrcset", "data-srcset"):
            if el.has_attr(attr):
                parts = []
                for item in el[attr].split(","):
                    bits = item.strip().split()
                    if bits:
                        bits[0] = fix(bits[0])
                        parts.append(" ".join(bits))
                el[attr] = ", ".join(parts)


def apply_bindings(soup, data, lang):
    missing = []
    for bnd in data["bindings"]:
        value = data["translations"][bnd["key"]][lang]
        try:
            elements = soup.select(bnd["selector"])
        except Exception:
            elements = []
        if not elements:
            missing.append(bnd["key"])
            continue
        for el in elements:
            if bnd["kind"] == "text":
                el.clear()
                el.append(value)
            elif bnd["kind"] == "html":
                el.clear()
                frag = BeautifulSoup(value, "html.parser")
                for node in list(frag.contents):
                    el.append(node)
            else:
                el[bnd["kind"]] = value
    return missing


def faq_items(soup):
    items = []
    for det in soup.select(".faq-list details"):
        q, a = det.find("summary"), det.find("p")
        if q and a:
            items.append((q.get_text(" ", strip=True), a.get_text(" ", strip=True)))
    return items


def json_ld(lang, data, soup):
    t = lambda k: data["translations"][k][lang]
    url = SITE + LANGS[lang]["path"]
    c = COPY[lang]
    graph = [
        {
            "@type": "Organization",
            "@id": SITE + "/#organization",
            "name": "SPOTRA",
            "url": SITE + "/",
            "logo": {"@type": "ImageObject", "url": SITE + "/assets/icon-512.png", "width": 512, "height": 512},
            "email": EMAIL,
            "sameAs": [INSTAGRAM],
        },
        {
            "@type": "WebSite",
            "@id": SITE + "/#website",
            "url": SITE + "/",
            "name": "SPOTRA",
            "inLanguage": [v["html"] for v in LANGS.values()],
            "publisher": {"@id": SITE + "/#organization"},
        },
        {
            "@type": "WebPage",
            "@id": url + "#webpage",
            "url": url,
            "name": t("meta.title"),
            "description": t("meta.description"),
            "inLanguage": LANGS[lang]["html"],
            "isPartOf": {"@id": SITE + "/#website"},
            "about": {"@id": APP + "#app"},
            "primaryImageOfPage": SITE + "/assets/spotra-share.jpg",
        },
        {
            "@type": "WebApplication",
            "@id": APP + "#app",
            "name": "SPOTRA",
            "url": APP,
            "description": c["app_desc"],
            "applicationCategory": "SportsApplication",
            "operatingSystem": "Web, iOS, Android",
            "browserRequirements": "Requires JavaScript. Requires HTML5.",
            "inLanguage": [v["html"] for v in LANGS.values()],
            "areaServed": c["area"],
            "image": SITE + "/assets/spotra-share.jpg",
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
            "publisher": {"@id": SITE + "/#organization"},
        },
    ]
    faq = faq_items(soup)
    if faq:
        graph.append({
            "@type": "FAQPage",
            "@id": url + "#faq",
            "inLanguage": LANGS[lang]["html"],
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in faq
            ],
        })
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=1)


MANAGED = [
    ("title", {}),
    ("meta", {"name": "description"}),
    ("meta", {"name": "robots"}),
    ("link", {"rel": "canonical"}),
    ("link", {"rel": "alternate"}),
    ("script", {"type": "application/ld+json"}),
]


def build(template, data, lang):
    soup = BeautifulSoup(template, "html.parser")
    t = lambda k: data["translations"][k][lang]
    info, c = LANGS[lang], COPY[lang]
    url = SITE + info["path"]
    soup.html["lang"] = info["html"]
    soup.html["data-page-lang"] = lang

    missing = apply_bindings(soup, data, lang)
    # Textos que la página pone con JavaScript (sin vínculo en i18n.js): dejarlos ya escritos en el idioma
    for el in soup.select("#story-pause, #journey-pause"):
        el.clear(); el.append(t("motion.pause"))
    menu = soup.select_one(".menu-toggle")
    if menu: menu["aria-label"] = t("menu.open")
    group = soup.select_one(".welcome-languages")
    if group: group["aria-label"] = {"es": "Idioma", "pt": "Idioma", "en": "Language"}[lang]
    for opt in soup.select("#language-select option"):
        if opt.get("value") == lang: opt["selected"] = ""
        elif opt.has_attr("selected"): del opt["selected"]
    for btn in soup.select("[data-language-choice]"):
        btn["aria-pressed"] = "true" if btn.get("data-language-choice") == lang else "false"
    absolutize(soup)

    head = soup.head
    for name, attrs in MANAGED:
        for el in head.find_all(name, attrs=attrs):
            el.decompose()
    for el in head.find_all("meta"):
        prop = el.get("property", "") or el.get("name", "")
        if prop.startswith(("og:", "twitter:")):
            el.decompose()
    for node in head.find_all(string=lambda s: isinstance(s, Comment) and "seo" in s):
        node.extract()

    def tag(tag_name, **attrs):
        el = soup.new_tag(tag_name)
        for k, v in attrs.items():
            el[k.replace("_", "-")] = v
        return el

    block = [Comment(" seo: generado por scripts/build-seo.py ")]
    title = soup.new_tag("title"); title.string = t("meta.title"); block.append(title)
    block.append(tag("meta", name="description", content=t("meta.description")))
    block.append(tag("meta", name="robots", content="index, follow, max-image-preview:large"))
    block.append(tag("link", rel="canonical", href=url))
    for code, other in LANGS.items():
        block.append(tag("link", rel="alternate", hreflang=other["hreflang"], href=SITE + other["path"]))
    block.append(tag("link", rel="alternate", hreflang="x-default", href=SITE + "/"))
    og = [
        ("og:type", "website"), ("og:site_name", "SPOTRA"), ("og:locale", info["og"]),
    ] + [("og:locale:alternate", o["og"]) for k, o in LANGS.items() if k != lang] + [
        ("og:title", c["og_title"]), ("og:description", c["og_desc"]), ("og:url", url),
        ("og:image", SITE + "/assets/spotra-share.jpg"), ("og:image:type", "image/jpeg"),
        ("og:image:width", "1200"), ("og:image:height", "630"), ("og:image:alt", c["og_alt"]),
    ]
    for prop, content in og:
        el = soup.new_tag("meta"); el["property"] = prop; el["content"] = content; block.append(el)
    for name, content in [
        ("twitter:card", "summary_large_image"), ("twitter:title", c["og_title"]),
        ("twitter:description", c["og_desc"]), ("twitter:image", SITE + "/assets/spotra-share.jpg"),
        ("twitter:image:alt", c["og_alt"]),
    ]:
        block.append(tag("meta", name=name, content=content))
    ld = soup.new_tag("script"); ld["type"] = "application/ld+json"; ld.string = json_ld(lang, data, soup); block.append(ld)
    block.append(Comment(" /seo "))

    anchor = head.find("script", src="/boot.js") or head.find("meta", attrs={"name": "viewport"})
    for el in reversed(block):
        anchor.insert_after(el)
    for el in block:
        if not isinstance(el, Comment):
            el.insert_before("\n")
    html = soup.decode(formatter=KeepOrder())
    html = re.sub(r"\n[ \t]*(?:\n[ \t]*)+", "\n", html)   # sin líneas vacías acumuladas (idempotente)
    if not html.lstrip().lower().startswith("<!doctype"):
        html = "<!doctype html>\n" + html
    return html, missing


def sitemap():
    today = datetime.date.today().isoformat()
    rows = []
    for lang, info in LANGS.items():
        alts = "".join(
            f'\n    <xhtml:link rel="alternate" hreflang="{o["hreflang"]}" href="{SITE}{o["path"]}"/>' for o in LANGS.values()
        ) + f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE}/"/>'
        rows.append(f"  <url>\n    <loc>{SITE}{info['path']}</loc>\n    <lastmod>{today}</lastmod>{alts}\n  </url>")
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            + "\n".join(rows) + "\n</urlset>\n")


def main():
    data = read_i18n()
    template = (DIST / "index.html").read_text(encoding="utf-8")
    for lang, info in LANGS.items():
        html, missing = build(template, data, lang)
        out = DIST / info["path"].strip("/") / "index.html" if info["path"] != "/" else DIST / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print(f"{lang}: {out.relative_to(ROOT)} ({len(html)//1024} KB)" + (f" · sin destino en el HTML (los crea JS): {', '.join(missing)}" if missing else ""))
    (DIST / "sitemap.xml").write_text(sitemap(), encoding="utf-8")
    print("sitemap.xml: 3 direcciones")


if __name__ == "__main__":
    main()
