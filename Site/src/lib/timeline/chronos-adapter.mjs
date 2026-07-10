import { absoluteDayToSyntheticDate, capTimelineGroups, KNOWN_CATEGORY_TOKENS } from './core.mjs';

const UNIFIED_GROUP_ID = 1;

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

function groupLabel(value) {
  return value === 'other' ? 'Other / unassigned' : value.replace(/-/g, ' ');
}

function buildGroups(events, laneMode) {
  if (laneMode === 'unified') {
    return {
      groups: [{ id: UNIFIED_GROUP_ID, content: 'Chronology' }],
      groupFor: () => UNIFIED_GROUP_ID,
    };
  }

  const values = events.map((event) => laneMode === 'category' ? event.categories : event.lanes);
  const cap = capTimelineGroups(values.map((entry) => entry.length ? entry : ['other']), 12);
  const visible = [...cap.visible].filter((value) => value !== 'other');
  if (cap.hasOther || cap.visible.has('other')) visible.push('other');

  const ids = new Map([...new Set(visible)].map((value, index) => [value, index + 1]));
  const groups = [...ids].map(([value, id]) => ({
    id,
    content: escapeHtml(groupLabel(value)),
  }));

  if (!groups.length) {
    groups.push({ id: UNIFIED_GROUP_ID, content: 'Chronology' });
    return { groups, groupFor: () => UNIFIED_GROUP_ID };
  }

  return {
    groups,
    groupFor: (entry) => ids.get(cap.groupFor(entry)) ?? ids.get('other') ?? groups[0].id,
  };
}

function eventItem(event, laneMode, groupFor, formatEventDate) {
  const category = event.categories.find((value) => KNOWN_CATEGORY_TOKENS[value]) ?? 'unknown';
  const values = laneMode === 'category' ? event.categories : event.lanes;
  const item = {
    id: event.id,
    start: absoluteDayToSyntheticDate(event.absoluteStartDay),
    content: `<span class="vc-marker" aria-hidden="true"></span><span class="vc-item-title">${escapeHtml(event.title)}</span>`,
    cDescription: event.description,
    cLink: event.href,
    title: `${escapeHtml(formatEventDate(event))} — ${escapeHtml(event.description)}`,
    className: `vc-timeline-item importance-${event.importance} certainty-${event.certainty} category-${cssToken(category)}`,
    group: groupFor(values[0] ?? 'other'),
    data: event,
  };

  if (event.absoluteEndDay !== undefined) {
    item.end = absoluteDayToSyntheticDate(event.absoluteEndDay + 1);
    item.type = 'range';
  } else {
    item.type = event.kind === 'milestone' ? 'box' : 'point';
  }

  return item;
}

function eraItems(dataset, groups) {
  return dataset.eras.flatMap((era) => groups.map((group) => ({
    id: `era:${era.id}:${group.id}`,
    start: absoluteDayToSyntheticDate(era.absoluteStartDay),
    end: absoluteDayToSyntheticDate(era.absoluteEndDay + 1),
    type: 'background',
    group: group.id,
    className: `vc-era-band era-${cssToken(era.id)} ${cssToken(era.visualToken)}`,
    title: `${escapeHtml(era.title)} — use the era control to zoom`,
    content: '',
    data: { eraId: era.id },
  })));
}

export function createChronosTimelineModel({
  dataset,
  events = dataset?.events ?? [],
  laneMode = 'unified',
  formatEventDate,
  visibleStartDay,
  visibleEndDay,
}) {
  if (!dataset?.id || !Array.isArray(dataset.events) || !Array.isArray(dataset.eras)) {
    throw new Error('Timeline dataset is malformed.');
  }
  if (typeof formatEventDate !== 'function') {
    throw new Error('Chronos timeline adapter requires a date formatter.');
  }

  const { groups, groupFor } = buildGroups(events, laneMode);
  const startDay = Number.isSafeInteger(visibleStartDay) ? visibleStartDay : dataset.absoluteStartDay;
  const endDay = Number.isSafeInteger(visibleEndDay) ? visibleEndDay : dataset.absoluteEndDay;
  const start = absoluteDayToSyntheticDate(startDay);
  const end = absoluteDayToSyntheticDate(Math.max(startDay + 1, endDay));

  const items = [
    ...eraItems(dataset, groups),
    ...events.map((event) => eventItem(event, laneMode, groupFor, formatEventDate)),
  ];

  return {
    items,
    groups,
    parsed: {
      items,
      markers: [],
      groups,
      flags: {
        noToday: true,
        defaultView: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    },
  };
}
