/* SPOTRA web · arranque (se carga en <head>, antes que nada).
   1) La app vive en app.spotra.online: íconos viejos instalados desde spotra.online, enlaces
      compartidos (?listing= ?place= ?event= ?post= ?rider=) y enlaces de mails van directo a la app.
   2) Buscadores (Google, Bing, etc.): ven la web completa y en su idioma, sin la pantalla de
      bienvenida ni las animaciones (mismo contenido que ven las personas). site.js no corre para ellos. */
(function () {
  var l = location, h = l.hash;
  var ids = ' welcome contenido app app-map app-community app-profile spots eventos comunidad identidad preguntas ';
  var standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  var appQuery = /[?&](listing|place|event|post|rider|type|k)=/.test(l.search);
  var appHash = h.length > 1 && ids.indexOf(' ' + h.slice(1) + ' ') < 0;
  if (standalone || appQuery || appHash) {
    var path = /^\/(pt|en)\/?(index\.html)?$/.test(l.pathname) || l.pathname === '/index.html' ? '/' : l.pathname;
    l.replace('https://app.spotra.online' + path + l.search + h);
    return;
  }

  var bot = /bot|crawl|spider|slurp|google-inspectiontool|googleother|bingpreview|yandex|baidu|duckduck|applebot|petal|facebookexternalhit|embedly|semrush|ahrefs|mj12/i.test(navigator.userAgent || '');
  window.SPOTRA_BOT = bot;
  if (!bot) return;
  document.documentElement.classList.add('seo-mode');
  document.addEventListener('DOMContentLoaded', function () {
    var shell = document.getElementById('site-shell');
    var welcome = document.getElementById('welcome');
    if (shell) { shell.hidden = false; shell.inert = false; shell.removeAttribute('inert'); }
    if (welcome) welcome.hidden = true;
    document.body.classList.remove('welcome-open');
    var guide = document.getElementById('spotri-guide');
    if (guide) guide.hidden = true;
  });
})();
