import {
  formatCalendarYear,
  fromAbsoluteDay,
  getCalendar,
  getIntercalaryDay,
  getMonth,
} from '../calendar/runtime.mjs';

function abbreviate(value, maximum = 7) {
  const text = String(value ?? '');
  return text.length <= maximum ? text : `${text.slice(0, maximum - 1)}.`;
}

function resolveAxisDate(absoluteDay, calendarId) {
  const input = fromAbsoluteDay(absoluteDay, calendarId);
  const calendar = getCalendar(calendarId);
  const year = formatCalendarYear(input.year);

  if (input.intercalaryDay) {
    const intercalary = getIntercalaryDay(calendar, input.intercalaryDay, input.year);
    return {
      input,
      year,
      monthName: intercalary.name,
      monthShort: abbreviate(intercalary.name),
      day: intercalary.day,
      intercalary: true,
    };
  }

  const month = getMonth(calendar, input.month);
  return {
    input,
    year,
    monthName: month.name,
    monthShort: abbreviate(month.name),
    day: input.day,
    intercalary: false,
  };
}

export function formatCalendarAxisLabel({
  absoluteDay,
  calendarId,
  scale,
  major = false,
}) {
  const resolved = resolveAxisDate(absoluteDay, calendarId);

  if (major) {
    if (scale === 'year') return '';
    if (scale === 'month') return resolved.year;
    if (scale === 'week' || scale === 'day' || scale === 'weekday') {
      return `${resolved.monthName}, ${resolved.year}`;
    }
    return `${resolved.day} ${resolved.monthName}, ${resolved.year}`;
  }

  if (scale === 'year') return resolved.year;
  if (scale === 'month') return resolved.monthShort;
  if (scale === 'week') return `${resolved.day} ${resolved.monthShort}`;
  if (scale === 'day' || scale === 'weekday') return String(resolved.day);
  return `${resolved.day} ${resolved.monthShort}`;
}

export function createCalendarAxisFormatter({
  getCalendarId,
  fromSyntheticDate,
}) {
  const format = (date, scale, major) => formatCalendarAxisLabel({
    absoluteDay: fromSyntheticDate(date),
    calendarId: getCalendarId(),
    scale,
    major,
  });

  return {
    formatMinorLabel: (date, scale) => format(date, scale, false),
    formatMajorLabel: (date, scale) => format(date, scale, true),
  };
}
