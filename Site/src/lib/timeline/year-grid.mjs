import {
  fromAbsoluteDay,
  getCalendar,
  getDaysBeforeYear,
} from '../calendar/runtime.mjs';

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
