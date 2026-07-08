import type {
  CalendarDateInput,
  CalendarDefinition,
  CalendarIntercalaryDay,
  CalendarMonth,
  CalendarObservance,
  CalendarSeason,
  ResolvedCalendarDate,
} from './types';
import { defaultCalendarId, getCalendar } from './registry';

const yearDayCache = new Map<string, number>();

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function padDay(day: number): string {
  return String(day).padStart(2, '0');
}

export function formatCalendarYear(year: number): string {
  return new Intl.NumberFormat('en-US').format(year);
}

export function isLeapYear(calendar: CalendarDefinition, year: number): boolean {
  if (!calendar.leapRule) return false;
  const remainder = calendar.leapRule.remainder ?? 0;
  return mod(year, calendar.leapRule.every) === remainder;
}

export function getMonth(calendar: CalendarDefinition, slug: string): CalendarMonth {
  const month = calendar.months.find((item) => item.slug === slug);
  if (!month) {
    throw new Error(`Unknown month '${slug}' in calendar '${calendar.id}'`);
  }
  return month;
}

export function getIntercalaryDay(calendar: CalendarDefinition, slug: string, year: number): CalendarIntercalaryDay {
  const day = calendar.intercalaryDays.find((item) => item.slug === slug);
  if (!day) {
    throw new Error(`Unknown intercalary day '${slug}' in calendar '${calendar.id}'`);
  }
  if (day.leapOnly && !isLeapYear(calendar, year)) {
    throw new Error(`${day.name} ${day.day} only exists in leap years for calendar '${calendar.id}'`);
  }
  return day;
}

export function getDaysInYear(calendar: CalendarDefinition, year: number): number {
  const key = `${calendar.id}:${year}`;
  const cached = yearDayCache.get(key);
  if (cached !== undefined) return cached;

  const monthDays = calendar.months.reduce((total, month) => total + month.days, 0);
  const intercalaryDays = calendar.intercalaryDays.filter((day) => !day.leapOnly || isLeapYear(calendar, year)).length;
  const total = monthDays + intercalaryDays;
  yearDayCache.set(key, total);
  return total;
}

export function getDaysBeforeYear(calendar: CalendarDefinition, year: number): number {
  if (year === calendar.epoch.year) return 0;

  let days = 0;
  if (year > calendar.epoch.year) {
    for (let currentYear = calendar.epoch.year; currentYear < year; currentYear += 1) {
      days += getDaysInYear(calendar, currentYear);
    }
  } else {
    for (let currentYear = year; currentYear < calendar.epoch.year; currentYear += 1) {
      days -= getDaysInYear(calendar, currentYear);
    }
  }
  return days;
}

export function getDayOfYear(calendar: CalendarDefinition, input: CalendarDateInput): number {
  if (input.intercalaryDay) {
    const intercalaryDay = getIntercalaryDay(calendar, input.intercalaryDay, input.year);
    const monthDays = calendar.months.reduce((total, month) => total + month.days, 0);
    const previousIntercalaryDays = calendar.intercalaryDays
      .filter((day) => !day.leapOnly || isLeapYear(calendar, input.year))
      .filter((day) => day.day < intercalaryDay.day).length;
    return monthDays + previousIntercalaryDays + 1;
  }

  if (!input.month || !input.day) {
    throw new Error(`Calendar date in '${calendar.id}' needs either month/day or intercalaryDay`);
  }

  const month = getMonth(calendar, input.month);
  if (input.day < 1 || input.day > month.days) {
    throw new Error(`Invalid day '${input.day}' for ${month.name}`);
  }

  const daysBeforeMonth = calendar.months
    .filter((item) => item.ordinal < month.ordinal)
    .reduce((total, item) => total + item.days, 0);

  return daysBeforeMonth + input.day;
}

export function toAbsoluteDay(input: CalendarDateInput): number {
  const calendar = getCalendar(input.calendar);
  const dayOfYear = getDayOfYear(calendar, input);
  return calendar.epoch.absoluteDay + getDaysBeforeYear(calendar, input.year) + (dayOfYear - 1);
}

function getSeasonForMonthDay(month: CalendarMonth, day: number): CalendarSeason {
  const segment = month.seasonSegments.find((item) => day >= item.start && day <= item.end);
  return segment?.season ?? 'unknown';
}

function getObservances(calendar: CalendarDefinition, input: CalendarDateInput): CalendarObservance[] {
  if (input.intercalaryDay) {
    return calendar.observances.filter((item) => item.intercalaryDay === input.intercalaryDay);
  }
  return calendar.observances.filter((item) => item.month === input.month && item.day === input.day);
}

function getAnchor(input: CalendarDateInput): string {
  if (input.intercalaryDay) return input.intercalaryDay;
  if (!input.month || !input.day) return 'unknown-date';
  return `${input.month}-${padDay(input.day)}`;
}

function formatResolvedLabel(resolved: Omit<ResolvedCalendarDate, 'label' | 'shortLabel'>): Pick<ResolvedCalendarDate, 'label' | 'shortLabel'> {
  const year = formatCalendarYear(resolved.year);

  if (resolved.intercalaryDay) {
    const shortLabel = `${resolved.intercalaryDay.name} ${padDay(resolved.intercalaryDay.day)}, ${year}`;
    return {
      shortLabel,
      label: `${resolved.weekday}, ${shortLabel}`,
    };
  }

  const month = resolved.month;
  const day = resolved.day;
  if (!month || !day) {
    return {
      shortLabel: year,
      label: year,
    };
  }

  const shortLabel = `${day} ${month.name}, ${year}`;
  return {
    shortLabel,
    label: `${resolved.weekday}, ${shortLabel}`,
  };
}

export function fromAbsoluteDay(absoluteDay: number, calendarId = defaultCalendarId): CalendarDateInput {
  const calendar = getCalendar(calendarId);
  let year = calendar.epoch.year;
  let daysRemaining = absoluteDay - calendar.epoch.absoluteDay;

  if (daysRemaining >= 0) {
    while (daysRemaining >= getDaysInYear(calendar, year)) {
      daysRemaining -= getDaysInYear(calendar, year);
      year += 1;
    }
  } else {
    while (daysRemaining < 0) {
      year -= 1;
      daysRemaining += getDaysInYear(calendar, year);
    }
  }

  let dayOfYear = daysRemaining + 1;

  for (const month of calendar.months) {
    if (dayOfYear <= month.days) {
      return {
        calendar: calendar.id,
        year,
        month: month.slug,
        day: dayOfYear,
      };
    }
    dayOfYear -= month.days;
  }

  const visibleIntercalaryDays = calendar.intercalaryDays.filter((day) => !day.leapOnly || isLeapYear(calendar, year));
  const intercalaryDay = visibleIntercalaryDays[dayOfYear - 1];
  if (!intercalaryDay) {
    throw new Error(`Could not resolve absolute day ${absoluteDay} in calendar '${calendar.id}'`);
  }

  return {
    calendar: calendar.id,
    year,
    intercalaryDay: intercalaryDay.slug,
  };
}

export function resolveCalendarDate(input: CalendarDateInput): ResolvedCalendarDate {
  const calendar = getCalendar(input.calendar);
  const absoluteDay = toAbsoluteDay(input);
  const dayOfYear = getDayOfYear(calendar, input);
  const weekdayIndex = mod(
    calendar.weekdays.indexOf(calendar.epoch.weekday) + (absoluteDay - calendar.epoch.absoluteDay),
    calendar.weekdays.length,
  );
  const weekday = calendar.weekdays[weekdayIndex] ?? calendar.weekdays[0];
  const anchor = getAnchor(input);
  const href = `/calendar/${calendar.id}/#${anchor}`;

  const month = input.month ? getMonth(calendar, input.month) : undefined;
  const intercalaryDay = input.intercalaryDay ? getIntercalaryDay(calendar, input.intercalaryDay, input.year) : undefined;
  const season = intercalaryDay?.season ?? (month && input.day ? getSeasonForMonthDay(month, input.day) : 'unknown');
  const observances = getObservances(calendar, input);

  const partial = {
    calendar,
    source: input,
    absoluteDay,
    year: input.year,
    weekday,
    dayOfYear,
    season,
    observances,
    month,
    day: input.day,
    intercalaryDay,
    anchor,
    href,
  };

  return {
    ...partial,
    ...formatResolvedLabel(partial),
  };
}

export function resolveEquivalentDates(input: CalendarDateInput, calendarIds?: string[]): ResolvedCalendarDate[] {
  const absoluteDay = toAbsoluteDay(input);
  const displayCalendars = calendarIds && calendarIds.length > 0 ? calendarIds : input.displayCalendars;
  const ids = displayCalendars && displayCalendars.length > 0 ? displayCalendars : [input.calendar];

  return ids.map((calendarId) => resolveCalendarDate(fromAbsoluteDay(absoluteDay, calendarId)));
}

export function getCalendarYearDates(calendarId: string, year: number): ResolvedCalendarDate[] {
  const calendar = getCalendar(calendarId);
  const dates: CalendarDateInput[] = [];

  for (const month of calendar.months) {
    for (let day = 1; day <= month.days; day += 1) {
      dates.push({ calendar: calendar.id, year, month: month.slug, day });
    }
  }

  for (const day of calendar.intercalaryDays) {
    if (!day.leapOnly || isLeapYear(calendar, year)) {
      dates.push({ calendar: calendar.id, year, intercalaryDay: day.slug });
    }
  }

  return dates.map(resolveCalendarDate);
}
