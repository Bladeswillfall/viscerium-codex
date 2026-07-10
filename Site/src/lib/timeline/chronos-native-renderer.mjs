import { ChronosTimeline } from 'chronos-timeline-md';
import { DataSet, Timeline } from 'vis-timeline/standalone';
import { calendars, defaultCalendarId, formatAbsoluteDay } from '../calendar/runtime.mjs';
import {
  IMPORTANCE_LEVELS,
  absoluteDayToSyntheticDate as absoluteDayToSyntheticDateBase,
  chooseCalendar,
  eventMatchesFilter,
  getZoomImportanceThreshold,
  parseTimelineUrlState,
  syntheticDateToAbsoluteDay as syntheticDateToAbsoluteDayBase,
  updateTimelineUrl,
} from './core.mjs';
import { createChronosTimelineModel } from './chronos-adapter.mjs';

const importanceLabels = {
  landmark: 'Landmark',
  major: 'Major',
  standard: 'Standard',
  minor: 'Minor',
  incidental: 'Incidental',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cssToken(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}

function certaintyLabel(certainty) {
  if (certainty === 'approximate') return 'Approximate';
  if (certainty === 'disputed') return 'Disputed';
  if (certainty === 'legendary') return 'Legendary';
  return 'Exact';
}

function checkboxList(name, values, labels = {}) {
  return values
    .map((value) => `<label class="vc-timeline-check"><input type="checkbox" name="${name}" value="${escapeHtml(value)}"> <span>${escapeHtml(labels[value] ?? value)}</span></label>`)
    .join('');
}

function renderTemplate(dataset, options, instanceId) {
  const categories = [...new Set(dataset.events.flatMap((event) => event.categories))].sort();
  const eraOptions = dataset.id === 'super' ? dataset.eras.map((era) => era.id) : [];
  const detailsTitleId = `vc-timeline-detail-title-${instanceId}`;
  return `
    <section class="vc-timeline-app vc-chronos-powered vc-chronos-native${options.compact ? ' is-compact' : ''}" aria-label="${escapeHtml(dataset.title)}">
      <div class="vc-timeline-toolbar" role="toolbar" aria-label="VISCERIUM timeline controls">
        <label class="vc-timeline-field"><span>Calendar</span><select data-vc-calendar>${calendars.map((calendar) => `<option value="${calendar.id}">${escapeHtml(calendar.shortName ?? calendar.name)}</option>`).join('')}</select></label>
        <label class="vc-timeline-field vc-timeline-search"><span>Search</span><input data-vc-search type="search" autocomplete="off" placeholder="Search events"></label>
        <label class="vc-timeline-field"><span>Group view</span><select data-vc-lane><option value="unified">Unified</option><option value="lane">Declared lane</option><option value="category">Category</option></select></label>
        <div class="vc-timeline-actions">
          <button type="button" data-vc-prev aria-label="Previous event">← Event</button>
          <button type="button" data-vc-next aria-label="Next event">Event →</button>
          <button type="button" data-vc-zoom-out aria-label="Zoom out">−</button>
          <button type="button" data-vc-zoom-in aria-label="Zoom in">+</button>
          <button type="button" data-vc-reset>Reset view</button>
          <button type="button" data-vc-list aria-pressed="false">List view</button>
        </div>
      </div>
      ${options.showFilters ? `<details class="vc-timeline-filters" data-vc-filters><summary>Filters</summary><div class="vc-timeline-filter-grid"><fieldset><legend>Importance</legend>${checkboxList('importance', IMPORTANCE_LEVELS, importanceLabels)}</fieldset><fieldset><legend>Categories</legend>${categories.length ? checkboxList('categories', categories) : '<p>No categories.</p>'}</fieldset>${eraOptions.length ? `<fieldset><legend>Eras</legend>${checkboxList('eras', eraOptions)}</fieldset>` : ''}<div class="vc-timeline-filter-actions"><button type="button" data-vc-clear>Clear filters</button></div></div></details>` : ''}
      <div class="vc-era-strip" aria-label="Era ranges">${dataset.eras.map((era) => `<span class="vc-era-action era-${cssToken(era.id)}"><button type="button" data-vc-era="${escapeHtml(era.id)}">${escapeHtml(era.title)}</button><a href="${escapeHtml(era.href)}" aria-label="Open ${escapeHtml(era.title)} article">Article</a></span>`).join('')}</div>
      <div class="vc-timeline-stage">
        <div class="vc-timeline-axis" data-vc-axis aria-hidden="true"></div>
        <div class="vc-timeline-canvas vc-chronos-host" data-vc-canvas tabindex="0" aria-label="Interactive Chronos timeline. Use the list view for complete keyboard navigation."></div>
      </div>
      ${options.showMinimap ? `<details class="vc-timeline-minimap-wrap" data-vc-minimap-wrap open><summary>Overview</summary><div class="vc-timeline-minimap" data-vc-minimap aria-label="Timeline overview"></div></details>` : ''}
      <div class="vc-timeline-status" data-vc-status role="status" aria-live="polite"></div>
      <div class="vc-timeline-list" data-vc-list-panel hidden></div>
      <aside class="vc-timeline-details" data-vc-details hidden aria-labelledby="${detailsTitleId}">
        <button type="button" class="vc-timeline-detail-close" data-vc-close aria-label="Close event details">×</button>
        <div data-vc-detail-body></div>
      </aside>
      ${options.showLegend ? `<div class="vc-timeline-legend" aria-label="Timeline legend"><span class="importance-landmark">Landmark</span><span class="importance-major">Major</span><span class="importance-standard">Standard</span><span class="certainty-approximate">Approximate</span><span class="certainty-disputed">Disputed</span><span class="certainty-legendary">Legendary</span><span class="vc-chronos-credit">Native Chronos UI</span></div>` : ''}
    </section>`;
}

function axisTicks(startDay, endDay, count = 6) {
  const span = Math.max(1, endDay - startDay);
  const candidates = [1, 7, 28, 84, 182, 365, 730, 1_825, 3_650, 18_250, 36_500, 182_500];
  const raw = span / Math.max(2, count - 1);
  const step = candidates.find((candidate) => candidate >= raw) ?? Math.ceil(raw / 365) * 365;
  const first = Math.ceil(startDay / step) * step;
  const ticks = [];
  for (let day = first; day <= endDay; day += step) ticks.push(day);
  if (!ticks.length || ticks[0] > startDay + span * 0.2) ticks.unshift(startDay);
  return ticks;
}

function chronosSettings() {
  return {
    selectedLocale: 'en',
    align: 'left',
    clickToUse: false,
    roundRanges: true,
    useUtc: true,
    useAI: false,
    theme: {
      customClass: 'vc-chronos-core',
    },
  };
}

export function mountTimeline(root, dataset, suppliedOptions = {}) {
  if (!root) throw new Error('Timeline mount root is required.');
  if (!dataset?.id || !Array.isArray(dataset.events) || !Array.isArray(dataset.eras)) {
    throw new Error('Timeline dataset is malformed.');
  }

  const options = {
    defaultCalendar: suppliedOptions.defaultCalendar ?? dataset.defaultCalendar ?? defaultCalendarId,
    laneMode: suppliedOptions.laneMode ?? 'unified',
    showFilters: suppliedOptions.showFilters !== false,
    showMinimap: suppliedOptions.showMinimap !== false,
    showLegend: suppliedOptions.showLegend !== false,
    compact: suppliedOptions.compact === true,
    articleHandler: suppliedOptions.articleHandler,
  };
  const syntheticOriginDay = dataset.absoluteStartDay;
  const toSyntheticDate = (absoluteDay) => absoluteDayToSyntheticDateBase(absoluteDay, syntheticOriginDay);
  const fromSyntheticDate = (date) => syntheticDateToAbsoluteDayBase(date, syntheticOriginDay);
  const instanceId = Math.random().toString(36).slice(2, 10);
  root.innerHTML = renderTemplate(dataset, options, instanceId);
  root.dataset.enhanced = 'true';

  const canvas = root.querySelector('[data-vc-canvas]');
  const axis = root.querySelector('[data-vc-axis]');
  const status = root.querySelector('[data-vc-status]');
  const details = root.querySelector('[data-vc-details]');
  const detailBody = root.querySelector('[data-vc-detail-body]');
  const listPanel = root.querySelector('[data-vc-list-panel]');
  const calendarSelect = root.querySelector('[data-vc-calendar]');
  const searchInput = root.querySelector('[data-vc-search]');
  const laneSelect = root.querySelector('[data-vc-lane]');
  const minimapElement = root.querySelector('[data-vc-minimap]');
  const detailsTitleId = `vc-timeline-detail-title-${instanceId}`;
  const storageKey = 'viscerium.timeline.calendar';
  const calendarIds = calendars.map((calendar) => calendar.id);
  const currentUrl = new URL(window.location.href);
  const rawQueryCalendar = currentUrl.searchParams.get('calendar');
  const urlState = parseTimelineUrlState(currentUrl, {
    calendarIds,
    fallbackCalendar: options.defaultCalendar,
    fallbackLaneMode: options.laneMode,
  });
  let storedCalendar;
  try {
    storedCalendar = window.localStorage.getItem(storageKey);
  } catch {
    storedCalendar = undefined;
  }
  const state = {
    calendar: chooseCalendar({
      queryCalendar: rawQueryCalendar && calendarIds.includes(rawQueryCalendar) ? rawQueryCalendar : undefined,
      storedCalendar,
      timelineDefault: options.defaultCalendar,
      globalDefault: defaultCalendarId,
      calendarIds,
    }),
    selected: urlState.selected,
    search: urlState.search ?? '',
    importance: urlState.importance ?? [],
    categories: urlState.categories ?? [],
    eras: urlState.eras ?? [],
    laneMode: urlState.laneMode ?? options.laneMode,
    visibleStartDay: urlState.visibleStartDay,
    visibleEndDay: urlState.visibleEndDay,
  };

  calendarSelect.value = state.calendar;
  searchInput.value = state.search;
  laneSelect.value = state.laneMode;
  for (const name of ['importance', 'categories', 'eras']) {
    for (const input of root.querySelectorAll(`input[name="${name}"]`)) {
      input.checked = state[name].includes(input.value);
    }
  }

  const dateCache = new Map();
  const formatEventDate = (event) => {
    const key = `${state.calendar}:${event.id}:${event.precision}:${event.endPrecision ?? ''}`;
    if (dateCache.has(key)) return dateCache.get(key);
    const start = formatAbsoluteDay(event.absoluteStartDay, state.calendar, event.precision);
    const value = event.absoluteEndDay === undefined
      ? start
      : `${start} — ${formatAbsoluteDay(event.absoluteEndDay, state.calendar, event.endPrecision ?? event.precision)}`;
    dateCache.set(key, value);
    return value;
  };

  let currentThreshold = 'incidental';
  let filteredEvents = [...dataset.events];
  let selectedIndex = -1;

  const chronos = new ChronosTimeline({
    container: canvas,
    settings: chronosSettings(),
    callbacks: {
      setTooltip: (element, fallbackText) => {
        const itemElement = element.closest?.('[data-id]') ?? element;
        const id = itemElement?.getAttribute?.('data-id');
        const event = id ? dataset.events.find((entry) => entry.id === id) : undefined;
        element.setAttribute('title', event ? `${formatEventDate(event)} — ${event.description}` : fallbackText);
      },
    },
    cssRootClass: 'vc-chronos-core',
  });

  const initialModel = createChronosTimelineModel({
    dataset,
    events: filteredEvents,
    laneMode: state.laneMode,
    formatEventDate,
    visibleStartDay: state.visibleStartDay,
    visibleEndDay: state.visibleEndDay,
  });
  chronos.renderParsed(initialModel.parsed);
  const timeline = chronos.timeline;
  if (!timeline) throw new Error('Chronos did not create a timeline instance.');
  timeline.setOptions({
    maxHeight: options.compact ? '28rem' : '34rem',
    minHeight: '20rem',
    stack: true,
    stackSubgroups: true,
    groupHeightMode: 'fixed',
    showCurrentTime: false,
    horizontalScroll: true,
    verticalScroll: true,
    zoomKey: 'ctrlKey',
    zoomMin: 86_400_000,
    zoomMax: Math.max(86_400_000, (dataset.absoluteEndDay - dataset.absoluteStartDay + 365) * 86_400_000),
    selectable: true,
    multiselect: false,
    tooltip: { followMouse: true, overflowMethod: 'cap' },
  });

  let minimap;
  let minimapItems;
  if (minimapElement) {
    minimapItems = new DataSet();
    minimap = new Timeline(minimapElement, minimapItems, {
      height: '8rem',
      stack: false,
      showCurrentTime: false,
      showMajorLabels: false,
      showMinorLabels: false,
      selectable: false,
      moveable: false,
      zoomable: false,
      margin: { item: 2, axis: 0 },
    });
  }

  function refreshList() {
    listPanel.innerHTML = `<ol>${filteredEvents.map((event) => `<li><button type="button" data-vc-select-event="${escapeHtml(event.id)}"><span>${escapeHtml(formatEventDate(event))}</span><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(event.description)}</small></button></li>`).join('')}</ol>`;
    for (const button of listPanel.querySelectorAll('[data-vc-select-event]')) {
      button.addEventListener('click', () => selectEvent(button.dataset.vcSelectEvent, true));
    }
  }

  function refreshItems(force = false) {
    const windowRange = timeline.getWindow();
    const span = Math.max(1, fromSyntheticDate(windowRange.end) - fromSyntheticDate(windowRange.start));
    const threshold = getZoomImportanceThreshold(span);
    if (!force && threshold === currentThreshold) return;
    currentThreshold = threshold;
    filteredEvents = dataset.events.filter((event) => eventMatchesFilter(event, state, threshold));
    const model = createChronosTimelineModel({
      dataset,
      events: filteredEvents,
      laneMode: state.laneMode,
      formatEventDate,
      visibleStartDay: fromSyntheticDate(windowRange.start),
      visibleEndDay: fromSyntheticDate(windowRange.end),
    });
    timeline.setGroups(model.groups);
    timeline.setItems(model.items);
    status.textContent = `${filteredEvents.length} of ${dataset.events.length} events visible. Chronos hides lower-importance events at distant zoom levels.`;
    refreshList();
  }

  function renderAxis() {
    const range = timeline.getWindow();
    const startDay = fromSyntheticDate(range.start);
    const endDay = fromSyntheticDate(range.end);
    const span = Math.max(1, endDay - startDay);
    const ticks = axisTicks(startDay, endDay, window.innerWidth < 640 ? 3 : 6);
    axis.innerHTML = ticks.map((day) => {
      const left = Math.min(100, Math.max(0, ((day - startDay) / span) * 100));
      const precision = span > 3_000 ? 'year' : span > 180 ? 'month' : 'day';
      return `<span style="left:${left}%">${escapeHtml(formatAbsoluteDay(day, state.calendar, precision))}</span>`;
    }).join('');
    state.visibleStartDay = startDay;
    state.visibleEndDay = endDay;
    if (minimapItems) {
      minimapItems.update({
        id: 'viewport',
        start: range.start,
        end: range.end,
        type: 'range',
        content: '',
        className: 'vc-minimap-viewport',
      });
    }
  }

  function syncUrl() {
    const updated = updateTimelineUrl(window.location.href, state);
    window.history.replaceState({}, '', `${updated.pathname}${updated.search}${updated.hash}`);
  }

  function resetWindow() {
    const era = dataset.id === 'super' ? null : dataset.eras[0];
    const padding = era?.defaultViewport?.paddingDays ?? 30;
    const start = era?.defaultViewport?.startDay ?? dataset.absoluteStartDay - padding;
    const end = era?.defaultViewport?.endDay ?? dataset.absoluteEndDay + padding;
    timeline.setWindow(toSyntheticDate(start), toSyntheticDate(end), { animation: false });
  }

  function zoomEra(id) {
    const era = dataset.eras.find((item) => item.id === id);
    if (!era) return;
    const padding = era.defaultViewport?.paddingDays ?? 30;
    timeline.setWindow(
      toSyntheticDate(era.absoluteStartDay - padding),
      toSyntheticDate(era.absoluteEndDay + padding),
    );
  }

  function renderDetails(event) {
    if (!event) return;
    detailBody.innerHTML = `
      <p class="vc-detail-kicker">${escapeHtml(formatEventDate(event))}</p>
      <h2 id="${detailsTitleId}">${escapeHtml(event.title)}</h2>
      <p>${escapeHtml(event.description)}</p>
      <dl>
        <div><dt>Precision</dt><dd>${escapeHtml(event.precision)}</dd></div>
        <div><dt>Certainty</dt><dd>${escapeHtml(certaintyLabel(event.certainty))}</dd></div>
        <div><dt>Importance</dt><dd>${escapeHtml(importanceLabels[event.importance])}</dd></div>
        <div><dt>Categories</dt><dd>${escapeHtml(event.categories.join(', ') || 'Uncategorised')}</dd></div>
        <div><dt>Era</dt><dd>${escapeHtml(event.eras.join(', ') || 'Outside defined eras')}</dd></div>
        <div><dt>Factions</dt><dd>${escapeHtml(event.factions.join(', ') || '—')}</dd></div>
        <div><dt>Locations</dt><dd>${escapeHtml(event.locations.join(', ') || '—')}</dd></div>
        <div><dt>Participants</dt><dd>${escapeHtml(event.participants.join(', ') || '—')}</dd></div>
      </dl>
      <a class="vc-detail-link" href="${escapeHtml(event.href)}" data-vc-article data-source-path="${escapeHtml(event.sourcePath ?? '')}">Open full article</a>`;
    const article = detailBody.querySelector('[data-vc-article]');
    if (options.articleHandler) {
      article.addEventListener('click', (eventObject) => {
        eventObject.preventDefault();
        options.articleHandler(event);
      });
    }
    details.hidden = false;
  }

  function selectEvent(id, focusDetails = false) {
    const event = dataset.events.find((item) => item.id === id);
    if (!event) return;
    state.selected = event.id;
    selectedIndex = filteredEvents.findIndex((item) => item.id === event.id);
    timeline.setSelection([event.id], { focus: true, animation: true });
    renderDetails(event);
    syncUrl();
    if (focusDetails) details.querySelector('[data-vc-close]')?.focus();
  }

  function stepEvent(delta) {
    if (!filteredEvents.length) return;
    selectedIndex = selectedIndex < 0
      ? (delta > 0 ? 0 : filteredEvents.length - 1)
      : (selectedIndex + delta + filteredEvents.length) % filteredEvents.length;
    selectEvent(filteredEvents[selectedIndex].id, false);
  }

  function applyFilters() {
    state.search = searchInput.value;
    for (const name of ['importance', 'categories', 'eras']) {
      state[name] = [...root.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
    }
    refreshItems(true);
    syncUrl();
  }

  timeline.on('rangechanged', () => {
    renderAxis();
    refreshItems(false);
    syncUrl();
  });
  timeline.on('select', ({ items }) => {
    const id = items.find((item) => !String(item).startsWith('era:'));
    if (id) selectEvent(String(id), false);
  });
  timeline.on('click', ({ item }) => {
    if (typeof item === 'string' && item.startsWith('era:')) zoomEra(item.split(':')[1]);
  });
  if (minimap) minimap.on('click', ({ time }) => timeline.moveTo(time, { animation: true }));

  calendarSelect.addEventListener('change', () => {
    state.calendar = calendarSelect.value;
    dateCache.clear();
    try {
      window.localStorage.setItem(storageKey, state.calendar);
    } catch {
      // URL state remains available when storage is blocked.
    }
    const windowRange = timeline.getWindow();
    refreshItems(true);
    renderAxis();
    if (state.selected) renderDetails(dataset.events.find((event) => event.id === state.selected));
    timeline.setWindow(windowRange.start, windowRange.end, { animation: false });
    syncUrl();
  });
  searchInput.addEventListener('input', applyFilters);
  laneSelect.addEventListener('change', () => {
    state.laneMode = laneSelect.value;
    refreshItems(true);
    syncUrl();
  });
  for (const input of root.querySelectorAll('.vc-timeline-filters input')) input.addEventListener('change', applyFilters);
  root.querySelector('[data-vc-clear]')?.addEventListener('click', () => {
    searchInput.value = '';
    for (const input of root.querySelectorAll('.vc-timeline-filters input')) input.checked = false;
    applyFilters();
  });
  root.querySelector('[data-vc-prev]').addEventListener('click', () => stepEvent(-1));
  root.querySelector('[data-vc-next]').addEventListener('click', () => stepEvent(1));
  root.querySelector('[data-vc-zoom-in]').addEventListener('click', () => timeline.zoomIn(0.35));
  root.querySelector('[data-vc-zoom-out]').addEventListener('click', () => timeline.zoomOut(0.35));
  root.querySelector('[data-vc-reset]').addEventListener('click', resetWindow);
  root.querySelector('[data-vc-list]').addEventListener('click', (event) => {
    const visible = listPanel.hidden;
    listPanel.hidden = !visible;
    canvas.hidden = visible;
    axis.hidden = visible;
    event.currentTarget.setAttribute('aria-pressed', String(visible));
    event.currentTarget.textContent = visible ? 'Graph view' : 'List view';
  });
  root.querySelector('[data-vc-close]').addEventListener('click', () => {
    details.hidden = true;
    state.selected = undefined;
    timeline.setSelection([]);
    syncUrl();
  });
  for (const button of root.querySelectorAll('[data-vc-era]')) {
    button.addEventListener('click', () => zoomEra(button.dataset.vcEra));
  }

  if (minimapItems) {
    minimapItems.add([
      ...dataset.eras.map((era) => ({
        id: `mini-era:${era.id}`,
        start: toSyntheticDate(era.absoluteStartDay),
        end: toSyntheticDate(era.absoluteEndDay + 1),
        type: 'background',
        content: '',
        className: `vc-era-band era-${cssToken(era.id)}`,
      })),
      ...dataset.events.map((event) => ({
        id: `mini:${event.id}`,
        start: toSyntheticDate(event.absoluteStartDay),
        type: 'point',
        content: '',
        className: `vc-mini-event importance-${event.importance}`,
      })),
      {
        id: 'viewport',
        start: toSyntheticDate(dataset.absoluteStartDay),
        end: toSyntheticDate(dataset.absoluteEndDay),
        type: 'range',
        content: '',
        className: 'vc-minimap-viewport',
      },
    ]);
    minimap.setWindow(
      toSyntheticDate(dataset.absoluteStartDay),
      toSyntheticDate(dataset.absoluteEndDay),
      { animation: false },
    );
  }

  if (
    Number.isSafeInteger(state.visibleStartDay)
    && Number.isSafeInteger(state.visibleEndDay)
    && state.visibleStartDay < state.visibleEndDay
  ) {
    timeline.setWindow(
      toSyntheticDate(state.visibleStartDay),
      toSyntheticDate(state.visibleEndDay),
      { animation: false },
    );
  } else {
    resetWindow();
  }
  refreshItems(true);
  renderAxis();
  if (state.selected && dataset.events.some((event) => event.id === state.selected)) {
    selectEvent(state.selected, false);
  }

  return () => {
    chronos.destroy();
    minimap?.destroy();
    root.innerHTML = '';
  };
}
