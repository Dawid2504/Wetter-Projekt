// Zeit-Synchronisation gegen eine UTC-Zeit-API, damit die Uhren auch bei
// falsch gestellter Systemuhr stimmen. `now()` liefert die korrigierte Zeit.
import { state } from "./state.js";

export async function syncTime() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      "https://timeapi.io/api/time/current/zone?timeZone=UTC",
      {
        cache: "no-store",
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("API antwortet nicht");
    const data = await res.json();
    state.timeOffset = new Date(data.dateTime + "Z").getTime() - Date.now();
  } catch (err) {
    state.timeOffset = 0;
  }
}

export function now() {
  return new Date(Date.now() + state.timeOffset);
}
