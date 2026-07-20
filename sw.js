/* Service Worker für "Wetter weltweit" */
const CACHE_VERSION = "wetter-v5";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",

  // CSS: Sammel-Datei + alle per @import geladenen Module
  "/style.css",
  "/css/base.css",
  "/css/search.css",
  "/css/cards.css",
  "/css/hero.css",
  "/css/detail.css",
  "/css/radar.css",
  "/css/footer.css",
  "/css/responsive.css",
  "/css/modal.css",
  "/css/sun-moon.css",
  "/css/weather-backgrounds.css",
  "/css/weather-icons.css",
  "/css/components.css",
  "/css/temp-chart.css",
  "/css/controls.css",
  "/css/extensions.css",

  // JS: Einstiegspunkt + alle importierten ES-Module
  "/js/main.js",
  "/js/state.js",
  "/js/config.js",
  "/js/units.js",
  "/js/time.js",
  "/js/weather-icons.js",
  "/js/helpers.js",
  "/js/data/cities.js",
  "/js/data/i18n.js",
  "/js/data/weather-codes.js",
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
