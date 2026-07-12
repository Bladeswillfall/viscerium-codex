import {
  fromAbsoluteDay,
  getCalendar,
  getDaysBeforeYear,
} from '../calendar/runtime.mjs';

const YEAR_TICK_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1_000, 2_000, 5_000, 10_000];

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

export function calendarYearBoundaries(startDay, endDay, calendarId) {
  if (!Number.isFinite(startDay) || !Number.isFinite(endDay) || startDay > endDay) return [];

  const calendar = getCalendar(calendarId);
  const firstYear = fromAbsoluteDay(Math.floor(startDay), calendarId).year;
  const lastYear = fromAbsoluteDay(Math.ceil(endDay), calendarId).year;
  const boundaries = [];

  for (let year = firstYear; year <= lastYear + 1; year += 1) {
    const absoluteDay = calendar.epoch.absoluteDay + getDaysBeforeYear(calendar, year);
    if (absoluteDay < startDay || absoluteDay > endDay) continue;
    boundaries.push({ year, absoluteDay });
  }

  return boundaries;
}

export function selectCalendarYearTicks(startDay, endDay, calendarId, maximumCount = 6) {
  const boundaries = calendarYearBoundaries(startDay, endDay, calendarId);
  const count = Math.max(2, Math.floor(Number(maximumCount) || 6));
  if (boundaries.length <= count) return boundaries;

  const firstYear = boundaries[0].year;
  const lastYear = boundaries.at(-1).year;
  const rawStep = Math.max(1, (lastYear - firstYear) / Math.max(1, count - 1));
  const step = YEAR_TICK_STEPS.find((candidate) => candidate >= rawStep)
    ?? Math.max(1, Math.ceil(rawStep / 10_000) * 10_000);
  const selected = boundaries.filter(({ year }) => positiveModulo(year, step) === 0);

  if (selected.length >= 2) return selected;
  return [boundaries[0], boundaries.at(-1)].filter((boundary, index, values) => (
    index === 0 || boundary.absoluteDay !== values[index - 1].absoluteDay
  ));
}

export function createTimelineYearGridItems({
  startDay,
  endDay,
  calendarId,
  toSyntheticDate,
}) {
  if (typeof toSyntheticDate !== 'function') {
    throw new TypeError('Timeline year grid requires a synthetic date converter.');
  }

  return calendarYearBoundaries(startDay, endDay, calendarId).map(({ year, absoluteDay }) => {
    const classNames = ['vc-year-grid-line'];
    if (year % 100 === 0) classNames.push('is-century');
    else if (year % 10 === 0) classNames.push('is-decade');

    return {
      id: `year-grid:${calendarId}:${year}`,
      start: toSyntheticDate(absoluteDay),
      end: toSyntheticDate(absoluteDay + 1),
      type: 'background',
      content: '',
      selectable: false,
      editable: false,
      className: classNames.join(' '),
      data: {
        kind: 'year-grid',
        year,
        absoluteDay,
      },
    };
  });
}
