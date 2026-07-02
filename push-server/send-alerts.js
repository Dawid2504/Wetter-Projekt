// ============================================================
//  Weltinfos – Wetterwarnung + Morgen-Vorschau (GitHub Actions)
//  --------------------------------------------------------------
//  Zwei Aufgaben in einem Lauf:
//   A) WARNUNGEN – alle 3 Stunden. Prüft je Favoritenstadt die aktuelle
//      Lage und schickt bei einer Warnung einen Push (max. 1x pro Tag/Stufe).
//   B) MORGEN-VORSCHAU – einmal täglich um 7 Uhr LOKALER Zeit der Stadt.
//      Schickt je Favoritenstadt eine Tagesübersicht (Wetter, min/max, Regen).
//
//  Da der Workflow um 5:00 UND 6:00 UTC startet (für DE-Sommer/Winter),
//  entscheidet dieses Skript pro Stadt selbst, ob dort gerade ~7 Uhr ist.
//  Ein Dedup-Eintrag pro Tag verhindert Doppel-Vorschauen.
// ============================================================

import webpush from "web-push";

const {
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT,
  FIREBASE_DB_URL,
} = process.env;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !FIREBASE_DB_URL) {
  console.error("Fehlende Secrets. Bitte VAPID-Keys und FIREBASE_DB_URL setzen.");
  process.exit(1);
}

webpush.setVapidDetails(
  VAPID_SUBJECT || "mailto:kontakt@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

// Um welche lokale Stunde soll die Morgen-Vorschau kommen?
const MORNING_HOUR = 7;

// ---- Städte-Datenbank (IDs müssen zu deiner script.js passen) ----
// timezone wird für die "ist es lokal 7 Uhr?"-Prüfung gebraucht.
const CITY_DB = {
  aachen: { name: "Aachen", lat: 50.77, lon: 6.08, timezone: "Europe/Berlin" },
  berlin: { name: "Berlin", lat: 52.52, lon: 13.4, timezone: "Europe/Berlin" },
  munich: { name: "München", lat: 48.13, lon: 11.58, timezone: "Europe/Berlin" },
  hamburg: { name: "Hamburg", lat: 53.55, lon: 9.99, timezone: "Europe/Berlin" },
  frankfurt: { name: "Frankfurt", lat: 50.11, lon: 8.68, timezone: "Europe/Berlin" },
  london: { name: "London", lat: 51.51, lon: -0.13, timezone: "Europe/London" },
  paris: { name: "Paris", lat: 48.86, lon: 2.35, timezone: "Europe/Paris" },
  rome: { name: "Rom", lat: 41.9, lon: 12.5, timezone: "Europe/Rome" },
  madrid: { name: "Madrid", lat: 40.42, lon: -3.7, timezone: "Europe/Madrid" },
  amsterdam: { name: "Amsterdam", lat: 52.37, lon: 4.9, timezone: "Europe/Amsterdam" },
  vienna: { name: "Wien", lat: 48.21, lon: 16.37, timezone: "Europe/Vienna" },
  zurich: { name: "Zürich", lat: 47.37, lon: 8.54, timezone: "Europe/Zurich" },
  moscow: { name: "Moskau", lat: 55.75, lon: 37.62, timezone: "Europe/Moscow" },
  istanbul: { name: "Istanbul", lat: 41.01, lon: 28.98, timezone: "Europe/Istanbul" },
  newyork: { name: "New York", lat: 40.71, lon: -74.01, timezone: "America/New_York" },
  losangeles: { name: "Los Angeles", lat: 34.05, lon: -118.24, timezone: "America/Los_Angeles" },
  chicago: { name: "Chicago", lat: 41.88, lon: -87.63, timezone: "America/Chicago" },
  toronto: { name: "Toronto", lat: 43.65, lon: -79.38, timezone: "America/Toronto" },
  mexicocity: { name: "Mexiko-Stadt", lat: 19.43, lon: -99.13, timezone: "America/Mexico_City" },
  saopaulo: { name: "São Paulo", lat: -23.55, lon: -46.63, timezone: "America/Sao_Paulo" },
  buenosaires: { name: "Buenos Aires", lat: -34.6, lon: -58.38, timezone: "America/Argentina/Buenos_Aires" },
  tokyo: { name: "Tokio", lat: 35.68, lon: 139.69, timezone: "Asia/Tokyo" },
  beijing: { name: "Peking", lat: 39.9, lon: 116.4, timezone: "Asia/Shanghai" },
  shanghai: { name: "Shanghai", lat: 31.23, lon: 121.47, timezone: "Asia/Shanghai" },
  hongkong: { name: "Hong Kong", lat: 22.32, lon: 114.17, timezone: "Asia/Hong_Kong" },
  singapore: { name: "Singapur", lat: 1.35, lon: 103.82, timezone: "Asia/Singapore" },
  seoul: { name: "Seoul", lat: 37.57, lon: 126.98, timezone: "Asia/Seoul" },
  mumbai: { name: "Mumbai", lat: 19.08, lon: 72.88, timezone: "Asia/Kolkata" },
  delhi: { name: "Neu-Delhi", lat: 28.61, lon: 77.21, timezone: "Asia/Kolkata" },
  bangkok: { name: "Bangkok", lat: 13.75, lon: 100.5, timezone: "Asia/Bangkok" },
  dubai: { name: "Dubai", lat: 25.2, lon: 55.27, timezone: "Asia/Dubai" },
  sydney: { name: "Sydney", lat: -33.87, lon: 151.21, timezone: "Australia/Sydney" },
  melbourne: { name: "Melbourne", lat: -37.81, lon: 144.96, timezone: "Australia/Melbourne" },
  auckland: { name: "Auckland", lat: -36.85, lon: 174.76, timezone: "Pacific/Auckland" },
  cairo: { name: "Kairo", lat: 30.04, lon: 31.24, timezone: "Africa/Cairo" },
  capetown: { name: "Kapstadt", lat: -33.93, lon: 18.42, timezone: "Africa/Johannesburg" },
  lagos: { name: "Lagos", lat: 6.52, lon: 3.38, timezone: "Africa/Lagos" },
};

// Klartext für WMO-Wettercodes (Kurzform für Benachrichtigungen).
const WMO_TEXT = {
  0: "Klar", 1: "Überwiegend klar", 2: "Teilweise bewölkt", 3: "Bewölkt",
  45: "Nebel", 48: "Rauchnebel", 51: "Leichter Nieselregen", 53: "Nieselregen",
  55: "Starker Nieselregen", 61: "Leichter Regen", 63: "Regen", 65: "Starker Regen",
  71: "Leichter Schneefall", 73: "Schneefall", 75: "Starker Schneefall",
  80: "Leichte Schauer", 81: "Schauer", 82: "Starke Schauer",
  95: "Gewitter", 96: "Gewitter mit Hagel", 99: "Schweres Gewitter",
};

const WMO_ICON = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "❄️", 80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

// ---- Warnlogik: exakt aus deiner script.js übernommen ----
function getWeatherAlert(code, tempC, uv, windKmh) {
  if ([95, 96, 99].includes(code))
    return { level: "severe", icon: "⛈️", label: "Gewitterwarnung" };
  if ([82].includes(code))
    return { level: "severe", icon: "🌧️", label: "Starkregen" };
  if ([75].includes(code))
    return { level: "warn", icon: "❄️", label: "Starker Schneefall" };
  if (tempC != null && tempC >= 35)
    return { level: "severe", icon: "🥵", label: "Extreme Hitze" };
  if (tempC != null && tempC >= 30)
    return { level: "warn", icon: "🌡️", label: "Hitzewarnung" };
  if (tempC != null && tempC <= -10)
    return { level: "warn", icon: "🥶", label: "Strenger Frost" };
  if (windKmh != null && windKmh >= 75)
    return { level: "severe", icon: "🌬️", label: "Sturm" };
  if (windKmh != null && windKmh >= 50)
    return { level: "warn", icon: "💨", label: "Windig" };
  if (uv != null && uv >= 8)
    return { level: "warn", icon: "☀️", label: "Sehr hohe UV-Strahlung" };
  return null;
}

// Aktuelle Stunde (0-23) und Datum (YYYY-MM-DD) in einer beliebigen Zeitzone.
function localParts(timezone) {
  const now = new Date();
  const hour = parseInt(
    now.toLocaleString("en-US", { timeZone: timezone, hour: "2-digit", hour12: false }),
    10,
  );
  // Datum in der Zeitzone (für den Dedup-Schlüssel der Vorschau)
  const date = now.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
  return { hour, date };
}

// ---- Firebase-Helfer (reines REST) ----
async function fbGet(path) {
  const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`);
  if (!res.ok) throw new Error("Firebase GET fehlgeschlagen: " + res.status);
  return res.json();
}
async function fbPut(path, data) {
  await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
async function fbDelete(path) {
  await fetch(`${FIREBASE_DB_URL}/${path}.json`, { method: "DELETE" });
}

// ---- Wetter für eine Stadt holen (aktuell + Tageswerte) ----
async function fetchWeather(city) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
    `&current_weather=true` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max` +
    `&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  const cur = data.current_weather || {};
  const d = data.daily || {};
  return {
    code: cur.weathercode,
    temp: cur.temperature != null ? Math.round(cur.temperature) : null,
    wind: cur.windspeed != null ? Math.round(cur.windspeed) : null,
    uv: d.uv_index_max ? d.uv_index_max[0] : null,
    // Tageswerte für die Morgen-Vorschau
    dayCode: d.weathercode ? d.weathercode[0] : null,
    dayMax: d.temperature_2m_max ? Math.round(d.temperature_2m_max[0]) : null,
    dayMin: d.temperature_2m_min ? Math.round(d.temperature_2m_min[0]) : null,
    dayPrecip: d.precipitation_probability_max ? d.precipitation_probability_max[0] : null,
  };
}

// ---- Push senden + abgelaufene Abos aufräumen ----
async function sendPush(key, subscription, payloadObj) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payloadObj));
    return true;
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await fbDelete(`subscriptions/${key}`);
      console.log(`Abgelaufenes Abo entfernt: ${key}`);
    } else {
      console.warn(`Push-Fehler für ${key}:`, err.statusCode || err.message);
    }
    return false;
  }
}

// ---- Hauptablauf ----
async function main() {
  const subs = (await fbGet("subscriptions")) || {};
  const subKeys = Object.keys(subs);
  if (subKeys.length === 0) {
    console.log("Keine Abos vorhanden. Nichts zu tun.");
    return;
  }

  // Wetter pro Stadt nur einmal holen (Cache über alle Nutzer hinweg).
  const weatherCache = {};
  async function getCityWeather(cityId) {
    if (weatherCache[cityId] !== undefined) return weatherCache[cityId];
    const city = CITY_DB[cityId];
    if (!city) return (weatherCache[cityId] = null);
    try {
      const w = await fetchWeather(city);
      w.name = city.name;
      w.timezone = city.timezone;
      weatherCache[cityId] = w;
      return w;
    } catch (e) {
      console.warn("Wetter fehlgeschlagen für", cityId, e.message);
      return (weatherCache[cityId] = null);
    }
  }

  const todayUTC = new Date().toISOString().slice(0, 10);

  for (const key of subKeys) {
    const entry = subs[key];
    if (!entry || !entry.subscription) continue;
    const favorites = Array.isArray(entry.favorites) ? entry.favorites : [];
    if (favorites.length === 0) continue;

    for (const cityId of favorites) {
      const w = await getCityWeather(cityId);
      if (!w) continue;

      // ---------- A) WARNUNGEN ----------
      if (w.code != null) {
        const alert = getWeatherAlert(w.code, w.temp, w.uv, w.wind);
        if (alert) {
          const dedupPath = `sent/${key}/${cityId}`;
          let last = null;
          try { last = await fbGet(dedupPath); } catch (e) { last = null; }
          if (!(last && last.date === todayUTC && last.level === alert.level)) {
            const ok = await sendPush(key, entry.subscription, {
              title: `${alert.icon} ${alert.label} – ${w.name}`,
              body: `${w.name}: ${alert.label}. Aktuell ${w.temp != null ? w.temp + "°C" : "–"}.`,
              url: `/?city=${cityId}`,
              tag: `alert-${cityId}`,
            });
            if (ok) {
              await fbPut(dedupPath, { date: todayUTC, level: alert.level });
              console.log(`Warnung gesendet: ${alert.label} für ${w.name} an ${key}`);
            }
          }
        }
      }

      // ---------- B) MORGEN-VORSCHAU (7 Uhr lokal) ----------
      if (w.timezone) {
        const { hour, date: localDate } = localParts(w.timezone);
        if (hour === MORNING_HOUR) {
          const morningPath = `morning/${key}/${cityId}`;
          let lastMorning = null;
          try { lastMorning = await fbGet(morningPath); } catch (e) { lastMorning = null; }
          // Nur senden, wenn heute (lokal) noch nicht geschehen.
          if (!(lastMorning && lastMorning.date === localDate)) {
            const icon = WMO_ICON[w.dayCode] || "🌡️";
            const desc = WMO_TEXT[w.dayCode] || "Wetter";
            const rain = w.dayPrecip != null ? ` · Regen ${w.dayPrecip}%` : "";
            const range =
              w.dayMax != null && w.dayMin != null
                ? `${w.dayMin}° bis ${w.dayMax}°`
                : "";
            const ok = await sendPush(key, entry.subscription, {
              title: `${icon} Guten Morgen – ${w.name}`,
              body: `Heute: ${desc}, ${range}${rain}.`,
              url: `/?city=${cityId}`,
              tag: `morning-${cityId}`,
            });
            if (ok) {
              await fbPut(morningPath, { date: localDate });
              console.log(`Morgen-Vorschau gesendet für ${w.name} an ${key}`);
            }
          }
        }
      }
    }
  }

  console.log("Durchlauf abgeschlossen.");
}

main().catch((e) => {
  console.error("Unerwarteter Fehler:", e);
  process.exit(1);
});
