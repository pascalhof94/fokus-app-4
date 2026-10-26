/* Fokus App 4.0 — Service Worker
   4.0 · Paket 0: eigener Cache-Name (fokus4-…), Scope nur der Ordner dieses
   Repos (Registrierung mit scope './'). Network-first: online wird immer
   frisch geladen, offline kommt alles aus dem Cache. Fremde Caches werden
   nur entfernt, wenn sie mit fokus4- beginnen; Caches der App 3.8.1 (fokus-…)
   fasst dieser Worker nie an. */
'use strict';

const CACHE = 'fokus4-v4.0.0-4';   // Hotfix 19.1 · Build 43: Cache-Name hochgezählt
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './img/avatar-pascal.png',
  './img/avatar-s01.png', './img/avatar-s02.png', './img/avatar-s03.png', './img/avatar-s04.png', './img/avatar-s05.png',
  './img/avatar-s06.png', './img/avatar-s07.png', './img/avatar-s08.png', './img/avatar-s09.png', './img/avatar-s10.png',
  './img/avatar-s11.png', './img/avatar-s12.png', './img/avatar-s13.png', './img/avatar-s14.png', './img/avatar-s15.png',
  './img/avatar-s16.png', './img/avatar-s17.png', './img/avatar-s18.png', './img/avatar-s19.png', './img/avatar-s20.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf('fokus4-') === 0 && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 4.0 · Paket 3: nur die eigene Herkunft (die App selbst). Anfragen an den Dienst auf dem Mac mini (FSLive) gehen
  // am Worker vorbei; sie bekommen nie index.html als Ersatz.
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(hit => hit || caches.match('./index.html'))
      )
  );
});
