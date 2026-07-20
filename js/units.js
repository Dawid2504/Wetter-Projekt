// Temperatur-Einheiten (°C / °F). Liest die gewählte Einheit aus dem
// geteilten state; die Umschaltung selbst passiert in main.js.
import { state } from "./state.js";

// Wandelt einen in °C gelieferten Wert in die aktuell gewählte Einheit um.
export function convTemp(celsius) {
  if (celsius == null || isNaN(celsius)) return celsius;
  return state.tempUnit === "F"
    ? Math.round((celsius * 9) / 5 + 32)
    : Math.round(celsius);
}

// Formatiert einen °C-Wert komplett (z. B. "21°C").
export function fmtTemp(celsius, withUnit = true) {
  if (celsius == null || isNaN(celsius))
    return "--°" + (withUnit ? state.tempUnit : "");
  return convTemp(celsius) + "°" + (withUnit ? state.tempUnit : "");
}
