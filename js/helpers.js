// Reine Hilfsfunktionen: hängen NUR von ihren Argumenten ab (kein Zustand,
// keine DOM-Referenzen außer setText, das per id arbeitet). Dadurch gut
// testbar und ohne Seiteneffekte wiederverwendbar.

// ----- Zeit / Tag-Nacht -----

export function isNightTime(sunrise, sunset, timezone) {
    if (!sunrise || !sunset || !timezone) return false;
    try {
      const nowInCity = new Date().toLocaleTimeString("de-DE", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const sunriseTime = sunrise.includes("T")
        ? sunrise.split("T")[1]
        : sunrise;
      const sunsetTime = sunset.includes("T") ? sunset.split("T")[1] : sunset;
      return nowInCity < sunriseTime || nowInCity > sunsetTime;
    } catch (e) {
      return false;
    }
  }

export function isNightTimeForHour(timeStr, sunrise, sunset) {
    if (!sunrise || !sunset || !timeStr) return false;
    try {
      const hourTime = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
      const sunriseTime = sunrise.includes("T")
        ? sunrise.split("T")[1]
        : sunrise;
      const sunsetTime = sunset.includes("T") ? sunset.split("T")[1] : sunset;
      return hourTime < sunriseTime || hourTime > sunsetTime;
    } catch (e) {
      return false;
    }
  }

export function minutesUntil(iso) {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.round(diff / 60000));
  }

// ----- Wetter-Klassifizierung -----

  // Bestimmt anhand von Code, Temperatur, UV und Wind eine Warnstufe.
export function getWeatherAlert(code, tempC, uv, windKmh) {
    // Gewitter / schwere Schauer
    if ([95, 96, 99].includes(code))
      return { level: "severe", icon: "⛈️", label: "Gewitterwarnung" };
    if ([82].includes(code))
      return { level: "severe", icon: "🌧️", label: "Starkregen" };
    if ([75].includes(code))
      return { level: "warn", icon: "❄️", label: "Starker Schneefall" };
    // Hitze
    if (tempC != null && tempC >= 35)
      return { level: "severe", icon: "🥵", label: "Extreme Hitze" };
    if (tempC != null && tempC >= 30)
      return { level: "warn", icon: "🌡️", label: "Hitzewarnung" };
    // Strenger Frost
    if (tempC != null && tempC <= -10)
      return { level: "warn", icon: "🥶", label: "Strenger Frost" };
    // Sturm
    if (windKmh != null && windKmh >= 75)
      return { level: "severe", icon: "🌬️", label: "Sturm" };
    if (windKmh != null && windKmh >= 50)
      return { level: "warn", icon: "💨", label: "Windig" };
    // Sehr hohe UV-Belastung
    if (uv != null && uv >= 8)
      return { level: "warn", icon: "☀️", label: "Sehr hohe UV-Strahlung" };
    return null;
  }

  // Ordnet WMO-Codes einem animierten Hintergrund-Typ zu.
export function getWeatherAnimType(code) {
    if ([0, 1].includes(code)) return "clear";
    if ([2].includes(code)) return "partly";
    if ([3].includes(code)) return "cloudy";
    if ([45, 48].includes(code)) return "fog";
    if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) return "rain";
    if ([71, 73, 75].includes(code)) return "snow";
    if ([82, 95, 96, 99].includes(code)) return "thunder";
    return "clear";
  }

// ----- Luftqualität / Pollen / UV / Mond -----

  // Europäischer AQI: Kategorien nach offiziellen Schwellen (0–20 gut … 100+ extrem).
export function getAqiInfo(aqi) {
    if (aqi == null)
      return { cat: "–", catEn: "–", color: "var(--text-secondary)", pct: 0 };
    if (aqi <= 20)
      return { cat: "Gut", catEn: "Good", color: "#4caf50", pct: 12 };
    if (aqi <= 40)
      return { cat: "Ordentlich", catEn: "Fair", color: "#a3d900", pct: 30 };
    if (aqi <= 60)
      return { cat: "Mäßig", catEn: "Moderate", color: "#ffcf00", pct: 50 };
    if (aqi <= 80)
      return { cat: "Schlecht", catEn: "Poor", color: "#ff9800", pct: 70 };
    if (aqi <= 100)
      return {
        cat: "Sehr schlecht",
        catEn: "Very Poor",
        color: "#f44336",
        pct: 88,
      };
    return {
      cat: "Extrem schlecht",
      catEn: "Extremely Poor",
      color: "#9c27b0",
      pct: 100,
    };
  }

  // Pollen-Belastung (Körner/m³) grob in Stufen – CAMS-übliche Schwellen.
export function getPollenLevel(type, value) {
    if (value == null || value < 1)
      return { level: 0, de: "Keine", en: "None", color: "#4caf50" };
    // Gräser/Ambrosia sind reizstärker → niedrigere Schwellen
    const strong = ["grass_pollen", "ragweed_pollen"].includes(type);
    const t = strong ? [10, 30, 60] : [15, 50, 90];
    if (value < t[0])
      return { level: 1, de: "Gering", en: "Low", color: "#a3d900" };
    if (value < t[1])
      return { level: 2, de: "Mäßig", en: "Moderate", color: "#ffcf00" };
    if (value < t[2])
      return { level: 3, de: "Hoch", en: "High", color: "#ff9800" };
    return { level: 4, de: "Sehr hoch", en: "Very High", color: "#f44336" };
  }

export function getUvColor(uv) {
    if (uv === null || uv === undefined) return "var(--text-secondary)";
    if (uv <= 2) return "#4caf50";
    if (uv <= 5) return "#ffeb3b";
    if (uv <= 7) return "#ff9800";
    if (uv <= 10) return "#f44336";
    return "#9c27b0";
  }

  // ===== MONDPHASEN =====
  // Berechnet Phase (0..1), Beleuchtung (%) und Namen aus dem Datum.
  // Referenz: bekannter Neumond 2000-01-06 18:14 UTC, synodischer Monat 29.53059 Tage.
export function getMoonPhase(date) {
    const synodic = 29.53058867;
    const refNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
    const days = (date.getTime() - refNewMoon) / 86400000;
    let phase = (days % synodic) / synodic;
    if (phase < 0) phase += 1;
    // Beleuchtungsgrad (0 bei Neumond, 1 bei Vollmond)
    const illum = (1 - Math.cos(2 * Math.PI * phase)) / 2;

    const phases = [
      { max: 0.0333, icon: "🌑", de: "Neumond", en: "New Moon" },
      {
        max: 0.2166,
        icon: "🌒",
        de: "Zunehmende Sichel",
        en: "Waxing Crescent",
      },
      {
        max: 0.2833,
        icon: "🌓",
        de: "Zunehmender Halbmond",
        en: "First Quarter",
      },
      { max: 0.4666, icon: "🌔", de: "Zunehmender Mond", en: "Waxing Gibbous" },
      { max: 0.5333, icon: "🌕", de: "Vollmond", en: "Full Moon" },
      { max: 0.7166, icon: "🌖", de: "Abnehmender Mond", en: "Waning Gibbous" },
      {
        max: 0.7833,
        icon: "🌗",
        de: "Abnehmender Halbmond",
        en: "Last Quarter",
      },
      {
        max: 0.9666,
        icon: "🌘",
        de: "Abnehmende Sichel",
        en: "Waning Crescent",
      },
      { max: 1.0001, icon: "🌑", de: "Neumond", en: "New Moon" },
    ];
    const info = phases.find((p) => phase < p.max) || phases[phases.length - 1];
    return {
      phase: phase,
      illum: Math.round(illum * 100),
      waxing: phase < 0.5,
      icon: info.icon,
      de: info.de,
      en: info.en,
    };
  }

// ----- Geo / Formatierung -----

  // Entfernung zweier Koordinaten in km (Haversine).
export function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

export function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  }

export function degToCompass(deg) {
    const dirs = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

// ----- DOM-Mini-Helfer -----

  // Baut das Skeleton-Markup für die Detail-Wetteransicht.
export function buildDetailSkeleton() {
    return `
      <div class="wx-skeleton">
        <div class="sk-row sk-main">
          <div class="sk-circle"></div>
          <div class="sk-temp"></div>
        </div>
        <div class="sk-grid">
          <div class="sk-tile"></div><div class="sk-tile"></div>
          <div class="sk-tile"></div><div class="sk-tile"></div>
        </div>
      </div>`;
  }

export function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }
