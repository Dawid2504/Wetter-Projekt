document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('clocks-container');
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-btn');
  const showAllBtn = document.getElementById('show-all-btn');
  const statusMessage = document.getElementById('status-message');

  const allZones = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : ['Europe/Berlin', 'America/New_York', 'Asia/Tokyo', 'UTC'];

  console.log(`✅ ${allZones.length} Zeitzonen geladen`);

  const zoneCards = [];
  const fragment = document.createDocumentFragment();

  allZones.forEach(zone => {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.style.display = 'none';

    const searchText = zone.replace(/_/g, ' ').toLowerCase();
    card.dataset.search = searchText;

    const zoneName = document.createElement('div');
    zoneName.className = 'zone-name';
    zoneName.textContent = zone.replace(/_/g, ' ');
    zoneName.title = zone;

    const timeEl = document.createElement('div');
    timeEl.className = 'time';
    timeEl.textContent = '--:--:--';

    const dateEl = document.createElement('div');
    dateEl.className = 'date';
    dateEl.textContent = '...';

    card.append(zoneName, timeEl, dateEl);
    fragment.appendChild(card);
    zoneCards.push({ zone, card, timeEl, dateEl });
  });

  container.appendChild(fragment);
  console.log(`✅ ${zoneCards.length} Karten im DOM erstellt`);

  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  function updateClocks() {
    const now = new Date();
    for (const item of zoneCards) {
      if (item.card.style.display !== 'none') {
        try {
          item.timeEl.textContent = now.toLocaleTimeString('de-DE', { ...timeOptions, timeZone: item.zone });
          item.dateEl.textContent = now.toLocaleDateString('de-DE', { ...dateOptions, timeZone: item.zone });
        } catch (e) {
          item.timeEl.textContent = 'N/A';
        }
      }
    }
  }

  function applyFilter(query, showAllIfEmpty = false) {
    const term = query.toLowerCase().trim();
    let visibleCount = 0;

    zoneCards.forEach(item => {
      let show;
      if (term === '') {
        show = showAllIfEmpty;
      } else {
        show = item.card.dataset.search.includes(term);
      }
      item.card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    console.log(`🔍 Filter "${term}" → ${visibleCount} Treffer`);

    if (term === '' && !showAllIfEmpty) {
      statusMessage.innerHTML = 'Tippe etwas ein oder klicke auf "Alle anzeigen".';
    } else if (visibleCount === 0) {
      statusMessage.textContent = `Keine Zeitzonen für "${query}" gefunden.`;
    } else {
      statusMessage.textContent = `${visibleCount} Zeitzonen gefunden:`;
    }

    updateClocks();
  }

  function clearSearch() {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    applyFilter('', false);
    searchInput.focus();
  }

  searchInput.addEventListener('input', (e) => {
    clearBtn.classList.toggle('visible', e.target.value.length > 0);
    applyFilter(e.target.value, false);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchInput.blur(); }
    if (e.key === 'Escape') { clearSearch(); }
  });

  clearBtn.addEventListener('click', clearSearch);

  showAllBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    applyFilter('', true);
    searchInput.blur();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) searchInput.blur();
  });

  applyFilter('', false);
  setInterval(updateClocks, 1000);
});