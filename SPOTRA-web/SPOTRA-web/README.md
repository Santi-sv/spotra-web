# SPOTRA — web oficial (spotra.online)

> **13/10/2026 · Buscadores, idiomas, velocidad y seguridad.**
> - **Google ve la web completa.** `dist/boot.js` detecta a los buscadores (Google, Bing, etc.): para ellos no aparece la pantalla de bienvenida ni el recorrido animado y `site.js` no corre (el contenido es el mismo que ven las personas). Las personas siguen viendo todo igual.
> - **Una dirección por idioma:** `/` (español), `/pt/` (português), `/en/` (english), cada una con su título, descripción, canónica, `hreflang`, Open Graph y datos estructurados (Organization, WebSite, WebPage, WebApplication y FAQPage). Al cambiar de idioma en la página, la dirección acompaña (sin recargar).
> - **Fuentes propias** en `dist/assets/fonts/` (antes venían de Fontshare y Google Fonts y frenaban la carga). Clash Display y General Sans: ITF Free Font License; Archivo Black y Caveat: SIL Open Font License.
> - **Sin scripts en línea:** todo JavaScript sale de archivos propios (`boot.js`, `site.js`), así la política de seguridad (CSP) puede ser estricta. Si se agrega un `<script>` en línea o algo de otro sitio (fuentes, analíticas, videos), **hay que actualizar la CSP en Render** o se va a bloquear.
> - Favicon real (`favicon.ico`, `favicon-96.png`, `apple-touch-icon.png`), página `404.html`, logo liviano (`logo-320.webp`), un solo título principal (H1).
>
> **Cómo regenerar (lo hace Claude):** después de cambiar textos o estilos, desde `SPOTRA-web`:
> ```sh
> python3 scripts/build-static-bundles.py && python3 scripts/build-seo.py
> ```
> `build-seo.py` usa `dist/index.html` como plantilla y los textos de `dist/i18n.js` (los títulos y descripciones de Google son `meta.title` y `meta.description`), y escribe `dist/index.html`, `dist/pt/index.html`, `dist/en/index.html` y `dist/sitemap.xml`. **Nunca editar a mano `dist/pt/` ni `dist/en/`**: se pisan en la próxima generación. Necesita Node y BeautifulSoup 4.
>
> **Headers en Render** (Static Site `spotra-web` › Settings › Headers): HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy y caché de `/assets/*`, `/site.css` y `/site.js`. Valores exactos en `RENDER-HEADERS.md`.

# SPOTRA — paquete limpio de publicación

> **Ajustado el 9/10/2026 para publicar en `https://spotra.online`:** dominio definitivo en canónica, Open Graph, robots y sitemap; los 4 «Probar SPOTRA» van a `https://app.spotra.online/`; Privacidad y Términos apuntan a la app (y `privacidad.html` / `terminos.html` de la web redirigen ahí); enlaces viejos (`?listing=`, `?place=`, `?event=`, `?post=`, mails) e íconos instalados desde `spotra.online` pasan directo a la app; sección Marcas quitada (FAQ renumerada a 06); fondo de bienvenida en WebP (2,4 MB → 0,2 MB). Hosting: Render Static Site con el contenido de `dist/`.

Versión del proyecto local preparada el 9 de octubre de 2026.

## Qué contiene

- `dist/`: web lista para servir, imágenes utilizadas, animaciones, idiomas ES/PT/EN, tarjeta social, robots y sitemap.
- Los CSS y JavaScript originales dentro de `dist/`, además de `site.css` y `site.js`, que son los archivos agrupados que carga la página.
- `scripts/build-static-bundles.py`: reconstruye esos archivos y actualiza las versiones de caché.
- `checks/`: pruebas existentes del recorrido y los gestos.
- `docs/share-card.html`: fuente editable de la tarjeta social; la imagen exportada ya está en `dist/assets/spotra-share.jpg`.
- `PARA-CLAUDE.md`: instrucciones para integrar la web con el proyecto que tienes guardado en Claude.

Se excluyeron Git, configuración del hosting de ChatGPT, investigación, capturas de pruebas, prompts de generación, mockups externos y recursos sin referencias en el código. Los archivos originales permanecen en el proyecto local. Se conserva la licencia de los iconos SVG incorporados al HTML.

## Publicar

Es una landing estática HTML/CSS/JavaScript. No requiere npm, servidor de aplicación, base de datos ni variables de entorno para funcionar. Los archivos publicados deben ser los de `dist/`: en la raíz pública deben quedar `index.html`, `site.css`, `site.js`, `assets/`, `robots.txt` y `sitemap.xml`.

Si el hosting pide la carpeta de publicación, usa `dist`. Si permite servir directamente los archivos existentes, no hace falta un paso de compilación. Si se modifica CSS o JavaScript, ejecuta antes `python3 scripts/build-static-bundles.py` desde la raíz del paquete y publica `dist`.

Con FTP o un panel de archivos, sube el contenido de `dist/` a la carpeta pública del dominio. Los documentos, scripts y pruebas del paquete son para trabajar en el proyecto; no necesitan subirse a la carpeta pública.

## Ajustes del dominio y los enlaces

1. Decide la URL pública definitiva de esta landing. En `dist/index.html`, `dist/robots.txt` y `dist/sitemap.xml`, reemplaza todas las apariciones de `https://spotra-rider-launch.sam777-varela.chatgpt.site` por la URL base definitiva, sin barra final. Esto actualiza canónica, Open Graph, tarjeta social y sitemap. Estos enlaces todavía conservan el dominio anterior.
2. Los cuatro botones «Probar SPOTRA» actualmente apuntan a `https://spotra.onrender.com/` en `dist/index.html`. Confirma cuál será la URL real de la app y ajusta los cuatro `a[data-launch]` si cambia. Si landing y app comparten dominio, usa la ruta real de entrada a la app para evitar que el botón vuelva a esta misma landing.
3. Los enlaces legales del pie apuntan a `https://spotra.onrender.com/privacidad.html` y `https://spotra.onrender.com/terminos.html`. Mantén o cambia esos destinos según las páginas legales del proyecto final. Las páginas legales no están incluidas en este paquete.
4. La web usa fuentes externas de Fontshare y Google Fonts; deben poder cargar desde el navegador. La funcionalidad de la app corresponde al proyecto que ya tienes en Claude, al que esta landing enlaza.

El dominio de la landing y la URL de la app se ajustan por separado. No reemplaces indiscriminadamente todas las URLs del HTML. No se cambió el DNS ni se publicó nada al preparar este ZIP.

## Vista local y edición

Desde `SPOTRA-web`:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abre `http://127.0.0.1:4173/`. Para editar contenido y enlaces, usa `dist/index.html`. Para diseño y comportamiento, edita los CSS/JS originales y luego ejecuta:

```sh
python3 scripts/build-static-bundles.py
```

No edites únicamente `site.css` o `site.js`: son archivos generados y la próxima reconstrucción sobrescribe esos cambios.

Pruebas existentes, si tienes Node instalado:

```sh
node checks/route.test.cjs
node checks/touch.test.cjs
```

## Comprobación después de publicar

- Abre la URL pública en escritorio y móvil; recorre la bienvenida, los tres idiomas y las cuatro disciplinas.
- Recorre las secciones con SPOTRI y comprueba las imágenes y controles de pausa.
- Abre «Probar SPOTRA», privacidad y términos y confirma sus destinos.
- Revisa que no haya recursos con error 404 ni errores de JavaScript.
- Comprueba la URL canónica, la imagen social, `/robots.txt` y `/sitemap.xml` en el dominio definitivo.
