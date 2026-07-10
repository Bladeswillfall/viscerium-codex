export const TIMELINE_IDS = ['super', 'citadel', 'smog', 'nearsight', 'entropy'];
export const TIMELINE_KINDS = ['milestone', 'event', 'period'];
export const TIMELINE_RECORD_KINDS = [...TIMELINE_KINDS, 'era'];
export const IMPORTANCE_LEVELS = ['landmark', 'major', 'standard', 'minor', 'incidental'];
export const CERTAINTY_LEVELS = ['exact', 'approximate', 'disputed', 'legendary'];
export const EDITORIAL_OVERRIDES = ['auto', 'include', 'exclude'];
export const LANE_MODES = ['unified', 'lane', 'category'];
export const KNOWN_CATEGORY_TOKENS = {
  technology: 'technology',
  military: 'military',
  political: 'political',
  cultural: 'cultural',
  religious: 'religious',
  economic: 'economic',
  scientific: 'scientific',
  disaster: 'disaster',
  resonance: 'resonance',
  myrkild: 'myrkild',
  naranor: 'naranor',
  exploration: 'exploration',
  social: 'social',
  environmental: 'environmental',
};

const importanceRank = new Map(IMPORTANCE_LEVELS.map((value, index) => [value, index]));
const SYNTHETIC_EPOCH_MS = Date.UTC(2000, 0, 1);
const DAY_MS = 86_400_000;
const JS_DATE_LIMIT_MS = 8_640_000_000_000_000;

export function normalizeId(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeEraId(value) {
  return normalizeId(value).replace(/-/g, '');
}

export function normalizeArray(value, options = {}) {
  const input = value === undefined || value === null || value === '' ? [] : Array.isArray(value) ? value : [value];
  const result = input
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => options.ids ? normalizeId(item) : item);
  return [...new Set(result)];
}

export function stableEventId(sourcePath, title) {
  const base = normalizeId(sourcePath?.replace(/\.[^.]+$/, '') || title || 'event');
  return base || 'event';
}

export function isSuperTimelineEvent(importance, override = 'auto') {
  if (override === 'include') return true;
  if (override === 'exclude') return false;
  return importance === 'landmark' || importance === 'major';
}

export function eventOverlapsRange(event, startDay, endDay) {
  const eventEnd = event.absoluteEndDay ?? event.absoluteStartDay;
  return event.absoluteStartDay <= endDay && eventEnd >= startDay;
}

export function resolveEraMembership(absoluteStartDay, absoluteEndDay, eras) {
  const end = absoluteEndDay ?? absoluteStartDay;
  return eras
    .filter((era) => absoluteStartDay <= era.absoluteEndDay && end >= era.absoluteStartDay)
    .sort((a, b) => a.order - b.order)
    .map((era) => era.id);
}

export function compareTimelineEvents(left, right) {
  if (left.absoluteStartDay !== right.absoluteStartDay) return left.absoluteStartDay - right.absoluteStartDay;
  const importance = (importanceRank.get(left.importance) ?? 99) - (importanceRank.get(right.importance) ?? 99);
  if (importance !== 0) return importance;
  const order = (left.editorialOrder ?? 0) - (right.editorialOrder ?? 0);
  if (order !== 0) return order;
  const title = left.title.localeCompare(right.title, 'en', { sensitivity: 'base' });
  return title || left.id.localeCompare(right.id);
}

export function assertSyntheticDateRange(absoluteDay, originAbsoluteDay = 0) {
  if (!Number.isSafeInteger(absoluteDay)) throw new Error(`Absolute world-day must be a safe integer: ${absoluteDay}`);
  if (!Number.isSafeInteger(originAbsoluteDay)) throw new Error(`Synthetic origin must be a safe integer: ${originAbsoluteDay}`);
  const relativeDay = absoluteDay - originAbsoluteDay;
  if (!Number.isSafeInteger(relativeDay)) {
    throw new Error(`Absolute world-day ${absoluteDay} cannot be represented relative to ${originAbsoluteDay}`);
  }
  const milliseconds = SYNTHETIC_EPOCH_MS + relativeDay * DAY_MS;
  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > JS_DATE_LIMIT_MS) {
    throw new Error(`Absolute world-day ${absoluteDay} exceeds the safe synthetic JavaScript date range relative to ${originAbsoluteDay}`);
  }
  return milliseconds;
}

export function absoluteDayToSyntheticDate(absoluteDay, originAbsoluteDay = 0) {
  return new Date(assertSyntheticDateRange(absoluteDay, originAbsoluteDay));
}

export function syntheticDateToAbsoluteDay(date, originAbsoluteDay = 0) {
  if (!Number.isSafeInteger(originAbsoluteDay)) throw new Error(`Synthetic origin must be a safe integer: ${originAbsoluteDay}`);
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) throw new Error(`Invalid synthetic date: ${date}`);
  const relativeDay = Math.round((value.getTime() - SYNTHETIC_EPOCH_MS) / DAY_MS);
  const day = originAbsoluteDay + relativeDay;
  if (!Number.isSafeInteger(day)) throw new Error(`Synthetic date ${date} exceeds the safe absolute world-day range`);
  assertSyntheticDateRange(day, originAbsoluteDay);
  return day;
}

export function getZoomImportanceThreshold(spanDays) {
  if (spanDays > 5_000) return 'major';
  if (spanDays > 1_500) return 'standard';
  if (spanDays > 500) return 'minor';
  return 'incidental';
}

export function importanceIsVisible(importance, threshold) {
  return (importanceRank.get(importance) ?? 99) <= (importanceRank.get(threshold) ?? 99);
}

export function eventMatchesFilter(event, state, threshold = 'incidental') {
  if (!importanceIsVisible(event.importance, threshold)) return false;
  if (state.importance?.length && !state.importance.includes(event.importance)) return false;
  if (state.categories?.length && !state.categories.some((category) => event.categories.includes(category))) return false;
  if (state.eras?.length && !state.eras.some((era) => event.eras.includes(era))) return false;
  const search = String(state.search ?? '').trim().toLowerCase();
  if (!search) return true;
  const haystack = [
    event.title,
    event.description,
    ...event.categories,
    ...event.lanes,
    ...event.eras,
    ...event.factions,
    ...event.locations,
    ...event.participants,
    ...event.tags,
  ].join(' ').toLowerCase();
  return haystack.includes(search);
}

export function capTimelineGroups(values, maxGroups = 12) {
  const counts = new Map();
  for (const value of values.flat()) counts.set(value, (counts.get(value) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const visible = new Set(sorted.slice(0, maxGroups - 1).map(([value]) => value));
  return {
    visible,
    hasOther: sorted.length >= maxGroups,
    groupFor(value) {
      return visible.has(value) ? value : 'other';
    },
  };
}

export function parseTimelineUrlState(urlLike, options = {}) {
  const url = urlLike instanceof URL ? urlLike : new URL(String(urlLike), 'https://viscerium.invalid');
  const validCalendars = new Set(options.calendarIds ?? []);
  const requestedCalendar = url.searchParams.get('calendar');
  const calendar = requestedCalendar && (!validCalendars.size || validCalendars.has(requestedCalendar))
    ? requestedCalendar
    : options.fallbackCalendar;
  const lane = url.searchParams.get('lane');
  const laneMode = LANE_MODES.includes(lane) ? lane : options.fallbackLaneMode ?? 'unified';
  const split = (key) => [...new Set((url.searchParams.get(key) ?? '').split(',').map((item) => normalizeId(item)).filter(Boolean))];
  const parseInteger = (key) => {
    const raw = url.searchParams.get(key);
    if (raw === null || raw.trim() === '') return undefined;
    const value = Number(raw);
    return Number.isSafeInteger(value) ? value : undefined;
  };
  const importance = split('importance').filter((value) => IMPORTANCE_LEVELS.includes(value));
  return {
    calendar,
    selected: url.searchParams.get('event') || undefined,
    search: url.searchParams.get('q') ?? '',
    importance,
    categories: split('categories'),
    eras: split('eras'),
    laneMode,
    visibleStartDay: parseInteger('start'),
    visibleEndDay: parseInteger('end'),
  };
}

export function updateTimelineUrl(urlLike, state) {
  const url = urlLike instanceof URL ? new URL(urlLike) : new URL(String(urlLike), 'https://viscerium.invalid');
  const set = (key, value) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) url.searchParams.delete(key);
    else url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  };
  set('calendar', state.calendar);
  set('event', state.selected);
  set('q', state.search);
  set('importance', state.importance);
  set('categories', state.categories);
  set('eras', state.eras);
  set('lane', state.laneMode === 'unified' ? undefined : state.laneMode);
  set('start', Number.isSafeInteger(state.visibleStartDay) ? state.visibleStartDay : undefined);
  set('end', Number.isSafeInteger(state.visibleEndDay) ? state.visibleEndDay : undefined);
  return url;
}

export function chooseCalendar({ queryCalendar, storedCalendar, timelineDefault, globalDefault, calendarIds }) {
  const valid = new Set(calendarIds);
  return [queryCalendar, storedCalendar, timelineDefault, globalDefault].find((value) => value && valid.has(value)) ?? calendarIds[0];
}
