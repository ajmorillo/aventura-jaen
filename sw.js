// Service worker: guarda todo el juego en el dispositivo para jugar sin conexión.
// VERSION y ARCHIVOS los reescribe tools/preparar-publicacion.mjs; no editar a mano.
const VERSION = 'aventura-3d45d31168';
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/album.js',
  'js/art.js',
  'js/avatar.js',
  'js/main.js',
  'js/motor.js',
  'js/mundos.js',
  'js/padres.js',
  'js/perfiles.js',
  'js/premios.js',
  'js/progreso.js',
  'js/sonido.js',
  'niveles/mundo1-mayor.json',
  'niveles/mundo1-peque.json',
  'niveles/mundo2-mayor.json',
  'niveles/mundo2-peque.json',
  'niveles/mundo3-mayor.json',
  'niveles/mundo3-peque.json',
  'niveles/mundo4-mayor.json',
  'niveles/mundo4-peque.json',
  'niveles/mundo5-mayor.json',
  'niveles/mundo5-peque.json',
  'iconos/apple-touch-icon.png',
  'iconos/favicon-32.png',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/icono-cuadrado.svg',
  'iconos/icono-maskable-512.png',
  'iconos/icono-maskable.svg',
  'iconos/icono.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Primero la copia guardada; si no está, la red (y se guarda para la próxima vez).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(guardada => guardada || fetch(e.request).then(resp => {
      if (resp.ok) {
        const copia = resp.clone();
        caches.open(VERSION).then(c => c.put(e.request, copia));
      }
      return resp;
    }).catch(() => caches.match('./index.html'))),
  );
});
