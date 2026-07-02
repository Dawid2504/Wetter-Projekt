// ============================================================
//  Weltinfos – Service Worker
//  Zuständig für: Push-Empfang, Notification-Anzeige, Klick-Handling
//  Diese Datei MUSS im Wurzelverzeichnis liegen (neben index.html),
//  damit sie die gesamte Seite kontrollieren darf ("scope").
// ============================================================

const SW_VERSION = "v1";

// --- Installation / Aktivierung -----------------------------
// skipWaiting + clients.claim sorgen dafür, dass ein neuer
// Service Worker sofort übernimmt, statt auf einen Neustart zu warten.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// --- Push empfangen -----------------------------------------
// Der GitHub-Actions-Workflow schickt ein JSON mit title/body/url/tag.
// Falls das Payload mal leer/kaputt ist, zeigen wir einen Fallback.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Weltinfos", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Weltinfos – Wetterwarnung";
  const options = {
    body: data.body || "Es gibt eine neue Wetterwarnung.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    // tag verhindert, dass sich Warnungen für dieselbe Stadt stapeln
    tag: data.tag || "weltinfos-alert",
    renotify: true,
    // url wird beim Klick genutzt (siehe unten)
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- Klick auf die Benachrichtigung -------------------------
// Öffnet die App bei der betroffenen Stadt. Ist die App schon
// offen, wird das vorhandene Fenster fokussiert statt eins neu zu öffnen.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
