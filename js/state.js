// Kleiner, geteilter Zustand für Sprache, Einheit und Zeit-Offset.
//
// Nur diese drei Werte werden modulübergreifend gelesen UND neu gesetzt
// (Sprach-/Einheiten-Umschaltung, Zeit-Synchronisation). Weil ein
// importiertes `let` in ES-Modulen von außen nicht neu zugewiesen werden
// darf, kapseln wir sie in einem Objekt: `state.lang = "en"` funktioniert,
// `lang = "en"` (importiert) würde nicht funktionieren.
//
// Der übrige, rein UI-/interaktive Zustand (aktive Stadt, Radar, Caches …)
// lebt weiterhin lokal in main.js.
import { LANG_KEY, UNIT_KEY } from "./config.js";

export const state = {
  lang: localStorage.getItem(LANG_KEY) === "en" ? "en" : "de",
  tempUnit: localStorage.getItem(UNIT_KEY) === "F" ? "F" : "C",
  timeOffset: 0,
};
