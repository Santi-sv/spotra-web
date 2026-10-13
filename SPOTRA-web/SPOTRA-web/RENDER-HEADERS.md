# Headers de spotra.online en Render

Render › Static Site **spotra-web** › **Settings** › **Headers** › *Add Header* (una regla por fila).

| # | Path | Name | Value |
|---|------|------|-------|
| 1 | `/*` | `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| 2 | `/*` | `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests` |
| 3 | `/*` | `X-Frame-Options` | `DENY` |
| 4 | `/*` | `Referrer-Policy` | `strict-origin-when-cross-origin` |
| 5 | `/*` | `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` |
| 6 | `/*` | `Cross-Origin-Opener-Policy` | `same-origin` |
| 7 | `/assets/*` | `Cache-Control` | `public, max-age=2592000` |
| 8 | `/site.css` | `Cache-Control` | `public, max-age=31536000, immutable` |
| 9 | `/site.js` | `Cache-Control` | `public, max-age=31536000, immutable` |

Notas
- `X-Content-Type-Options: nosniff` ya lo pone Render.
- Caché de `/assets/*` = 30 días: si se **reemplaza** una imagen por otra con el **mismo nombre**, la gente puede seguir viendo la vieja hasta 30 días. Para cambiar una imagen, usar un nombre nuevo.
- `site.css` y `site.js` se piden con `?v=...` (cambia en cada versión), por eso pueden guardarse 1 año.
- La CSP solo permite archivos de spotra.online. Si se agrega algo de otro sitio (analíticas, videos, fuentes externas) o un `<script>` escrito dentro del HTML, hay que ampliarla o se bloquea.
- Más adelante (cuando todo esté estable unas semanas): agregar `; preload` a HSTS y anotarse en hstspreload.org.
