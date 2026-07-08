/* Service Worker für Firebase Cloud Messaging
   Muss im Hauptordner liegen (neben index.html). */

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDaltO2FJJjTXxbXfM6MNhr6xmIzjVpmh4",
  authDomain: "wetter-push-c106c.firebaseapp.com",
  projectId: "wetter-push-c106c",
  storageBucket: "wetter-push-c106c.firebasestorage.app",
  messagingSenderId: "932619386336",
  appId: "1:932619386336:web:ab59e2a55f9dc84153bf85",
});

const messaging = firebase.messaging();

// Nachricht kommt an, während die Seite geschlossen ist
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Wetter weltweit";
  const options = {
    body: payload.notification?.body || "Neue Wetterinfo verfügbar.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: payload.data?.url || "/" },
  };
  self.registration.showNotification(title, options);
});

// Klick auf die Benachrichtigung öffnet die Seite
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
