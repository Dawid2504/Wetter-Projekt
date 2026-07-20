// Animierte SVG-Wetter-Icons. Reine Funktion – nur Argumente, kein Zustand.
// Alle Icons nutzen currentColor + die Akzentfarbe und animieren per CSS.
export function svgWeatherIcon(code, isNight, size) {
    const cls = "wx-svg";
    const s = size || 1;
    const wrap = (inner, extra) =>
      `<span class="wx-icon ${extra || ""}" style="--wx-size:${s}em">` +
      `<svg viewBox="0 0 64 64" class="${cls}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg></span>`;

    const sun = (cx = 32, cy = 30, r = 12) => `
      <g class="wx-sun">
        <circle cx="${cx}" cy="${cy}" r="${r}" class="wx-sun-core"/>
        <g class="wx-rays" stroke-linecap="round">
          ${Array.from({ length: 8 })
            .map((_, i) => {
              const a = (i * Math.PI) / 4;
              const x1 = cx + Math.cos(a) * (r + 4);
              const y1 = cy + Math.sin(a) * (r + 4);
              const x2 = cx + Math.cos(a) * (r + 10);
              const y2 = cy + Math.sin(a) * (r + 10);
              return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
            })
            .join("")}
        </g>
      </g>`;

    const moon = `
      <g class="wx-moon">
        <path d="M40 16a16 16 0 1 0 8 30 20 20 0 0 1-8-30z"/>
      </g>`;

    const cloud = (extraCls = "", y = 0) => `
      <g class="wx-cloud ${extraCls}" transform="translate(0 ${y})">
        <path d="M22 44a10 10 0 0 1 .6-19.98A14 14 0 0 1 49 28a8 8 0 0 1-1 16z"/>
      </g>`;

    const stars = Array.from({ length: 5 })
      .map((_, i) => {
        const x = [10, 50, 18, 44, 32][i];
        const y = [14, 18, 40, 38, 10][i];
        return `<circle class="wx-star" cx="${x}" cy="${y}" r="1.4" style="animation-delay:${i * 0.4}s"/>`;
      })
      .join("");

    const rain = (drops = 3) =>
      `<g class="wx-rain" stroke-linecap="round">` +
      Array.from({ length: drops })
        .map(
          (_, i) =>
            `<line class="wx-drop" x1="${20 + i * 9}" y1="46" x2="${18 + i * 9}" y2="54" style="animation-delay:${i * 0.25}s"/>`,
        )
        .join("") +
      `</g>`;

    const snow = (flakes = 3) =>
      `<g class="wx-snow">` +
      Array.from({ length: flakes })
        .map(
          (_, i) =>
            `<circle class="wx-flake" cx="${21 + i * 9}" cy="50" r="2" style="animation-delay:${i * 0.4}s"/>`,
        )
        .join("") +
      `</g>`;

    const bolt = `<polygon class="wx-bolt" points="32,44 27,54 33,54 29,62 40,50 34,50 38,44"/>`;
    const fog = `<g class="wx-fog" stroke-linecap="round">
        <line x1="14" y1="40" x2="50" y2="40"/>
        <line x1="18" y1="46" x2="46" y2="46"/>
        <line x1="16" y1="52" x2="48" y2="52"/>
      </g>`;

    // Code-Zuordnung
    if ([0, 1].includes(code))
      return isNight ? wrap(moon + stars, "wx-night") : wrap(sun());
    if (code === 2)
      return isNight
        ? wrap(moon + cloud("wx-cloud-front", 4))
        : wrap(sun(38, 24, 8) + cloud("wx-cloud-front", 6));
    if (code === 3) return wrap(cloud("wx-cloud-solo"));
    if ([45, 48].includes(code)) return wrap(cloud("wx-cloud-solo", -4) + fog);
    if ([51, 53, 55, 61, 63, 80, 81].includes(code))
      return wrap(cloud("wx-cloud-solo", -6) + rain(3));
    if ([65, 82].includes(code))
      return wrap(cloud("wx-cloud-solo", -6) + rain(4));
    if ([71, 73, 75].includes(code))
      return wrap(cloud("wx-cloud-solo", -6) + snow(3));
    if ([95, 96, 99].includes(code))
      return wrap(cloud("wx-cloud-solo wx-cloud-dark", -6) + bolt + rain(2));
    return isNight ? wrap(moon + stars, "wx-night") : wrap(sun());
}
