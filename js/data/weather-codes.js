// WMO-Wettercodes → Klartext (DE) und Pollen-Metadaten.

export const WMO_CODES = {
    0: "Klar",
    1: "Überwiegend klar",
    2: "Teilweise bewölkt",
    3: "Bewölkt",
    45: "Nebel",
    48: "Rauchnebel",
    51: "Leichter Nieselregen",
    53: "Mäßiger Nieselregen",
    55: "Starker Nieselregen",
    61: "Leichter Regen",
    63: "Mäßiger Regen",
    65: "Starker Regen",
    71: "Leichter Schneefall",
    73: "Mäßiger Schneefall",
    75: "Starker Schneefall",
    80: "Leichte Schauer",
    81: "Mäßige Schauer",
    82: "Starke Schauer",
    95: "Gewitter",
    96: "Gewitter mit Hagel",
    99: "Schweres Gewitter",
};

// Reihenfolge & Metadaten der Pollen-Arten (DE-relevant zuerst).
export const POLLEN_TYPES = [
    { key: "grass_pollen", icon: "🌾", de: "Gräser", en: "Grass" },
    { key: "birch_pollen", icon: "🌳", de: "Birke", en: "Birch" },
    { key: "alder_pollen", icon: "🌲", de: "Erle", en: "Alder" },
    { key: "mugwort_pollen", icon: "🌿", de: "Beifuß", en: "Mugwort" },
    { key: "ragweed_pollen", icon: "🍂", de: "Ambrosia", en: "Ragweed" },
    { key: "olive_pollen", icon: "🫒", de: "Olive", en: "Olive" },
];
