# 🌍 Wetter weltweit

Eine schlanke Progressive Web App (PWA) für **aktuelle Wettervorhersagen, 7-Tage-Trends und Ortszeiten** von Städten weltweit – ganz ohne Framework, nur mit reinem HTML, CSS und JavaScript (ES-Module).

🔗 **Live:** [wetter.dawid-makowski.de](https://wetter.dawid-makowski.de)

---

## ✨ Features

- 🔍 **Städtesuche** mit Geocoding und automatischer Erweiterung der Städte-Datenbank
- 📍 **Standort-Erkennung** über die Browser-Geolocation
- ⭐ **Favoriten**, die lokal im Browser gespeichert werden
- 🕒 **Live-Ortszeit** für jede Stadt (synchronisierte Zeit)
- 🌡️ **Detailansicht** mit aktuellem Wetter, gefühlter Temperatur und Wetterbeschreibung
- 📈 **Temperaturverlauf** als Diagramm – umschaltbar zwischen Woche und Tag
- 📅 **7-Tage-Vorschau** und stündlicher Verlauf
- 🌬️ **Luftqualität (AQI), Pollenflug und Mondphase**
- 🌧️ **Live-Wetterkarte** mit Regen-, Wolken- und Wind-Ebenen (animiertes Radar)
- ☀️🌙 **Sonnen- & Mond-Tracker** sowie dynamische Wetter-Hintergründe
- 🌐 **Zweisprachig** (Deutsch / Englisch) und **°C / °F** umschaltbar
- 🌙 **Hell-/Dunkelmodus**
- 📱 **Installierbar als PWA** inkl. Service Worker (Offline-fähig) und Android-APK

---

## 🛠️ Technik

| Bereich        | Verwendung                                                      |
| -------------- | -------------------------------------------------------------- |
| Frontend       | Vanilla JavaScript (ES-Module), HTML5, modulares CSS           |
| Wetterdaten    | [Open-Meteo](https://open-meteo.com/)                          |
| Radar / Karte  | [RainViewer](https://www.rainviewer.com/), [Leaflet](https://leafletjs.com/), [OpenStreetMap](https://www.openstreetmap.org/) & [CARTO](https://carto.com/) |
| PWA            | Web App Manifest + Service Worker                              |
| Hosting        | GitHub Pages (eigene Domain via `CNAME`)                       |

---

## 📁 Projektstruktur

```
Uhr-Wetter-Projekt/
├── index.html               # Einstiegspunkt & Grundgerüst
├── manifest.webmanifest     # PWA-Manifest
├── sw.js                    # Service Worker (Offline-Caching)
├── style.css                # Bündelt die CSS-Module
├── css/                     # Modulares CSS (Karten, Hero, Radar, Modal, …)
├── js/
│   ├── main.js              # Interaktiver Kern (Rendering, Events, Detailansicht)
│   ├── state.js             # Zentraler Zustand
│   ├── config.js            # localStorage-Schlüssel
│   ├── time.js, units.js    # Zeit- & Einheiten-Helfer
│   ├── helpers.js           # Reine Hilfsfunktionen
│   ├── weather-icons.js     # SVG-Wettersymbole
│   └── data/                # Städte, Wettercodes (WMO), i18n-Texte
├── icons/                   # App-Icons (PWA / Apple / maskable)
└── app/                     # Android-APK zum Download
```

---

## 🚀 Lokal starten

Da die App ES-Module und `fetch` nutzt, sollte sie über einen lokalen Webserver ausgeliefert werden (nicht per Datei-Doppelklick):

```bash
# Mit Python
python -m http.server 8000

# oder mit Node
npx serve
```

Anschließend im Browser `http://localhost:8000` öffnen.

---

## 📊 Datenquellen & Attribution

- Wetterdaten bereitgestellt von **[Open-Meteo](https://open-meteo.com/)** & **[RainViewer](https://www.rainviewer.com/)**
- Kartenmaterial © **[OpenStreetMap](https://www.openstreetmap.org/copyright)**-Mitwirkende & **[CARTO](https://carto.com/attributions)**

---

## 👤 Autor

Entwickelt von **Dawid Makowski** — [dawid-makowski.de](https://dawid-makowski.de)

---

© Weltinfos – Wetter weltweit. Alle Rechte vorbehalten.
