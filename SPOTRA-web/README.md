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
