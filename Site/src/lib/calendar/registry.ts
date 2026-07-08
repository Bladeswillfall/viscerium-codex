import { okseCalendar } from '../../data/calendars/okse';
import type { CalendarDefinition } from './types';

export const calendars: CalendarDefinition[] = [okseCalendar];

export const defaultCalendarId = okseCalendar.id;

export function getCalendar(calendarId = defaultCalendarId): CalendarDefinition {
  const calendar = calendars.find((item) => item.id === calendarId);
  if (!calendar) {
    throw new Error(`Unknown calendar: ${calendarId}`);
  }
  return calendar;
}
