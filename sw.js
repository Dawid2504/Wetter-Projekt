/* Service Worker für "Wetter weltweit" */
const CACHE_VERSION = "wetter-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
];

// Domains, die NIE gecacht werden (immer live) – Wetter-, Karten- und Bilddaten
const NETWORK_ONLY = [
  "open-meteo.com",
  "rainviewer.com",
  "basemaps.cartocdn.com",
  "tile.openstreetmap.org",
  "nominatim.openstreetmap.org",
  "unpkg.com", // Leaflet vom CDN – über Netz laden
];

// Beim Installieren: App-Shell cachen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

// Beim Aktivieren: alte Caches aufräumen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Live-Daten nie aus dem Cache bedienen
  if (NETWORK_ONLY.some((d) => url.hostname.includes(d))) {
    return; // Browser macht den normalen Netzwerk-Request
  }

  // Navigations-Anfragen: erst Netz, bei Offline die gecachte index.html
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/index.html")));
    return;
  }

  // Restliche eigene Dateien: erst Cache, dann Netz (und nachcachen)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
        }
        return res;
      });
    }),
  );
});
