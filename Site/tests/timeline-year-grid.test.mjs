import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  defaultCalendarId,
  getCalendar,
  getDaysInYear,
  toAbsoluteDay,
} from '../src/lib/calendar/runtime.mjs';
import {
  calendarYearBoundaries,
  createTimelineYearGridItems,
} from '../src/lib/timeline/year-grid.mjs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const calendar = getCalendar(defaultCalendarId);
const firstMonth = calendar.months[0].slug;
const yearStart = (year) => toAbsoluteDay({
  calendar: defaultCalendarId,
  year,
  month: firstMonth,
  day: 1,
});

test('returns every individual calendar-year boundary in a visible range', () => {
  const startDay = yearStart(120);
  const endDay = yearStart(124) - 1;
  const boundaries = calendarYearBoundaries(startDay, endDay, defaultCalendarId);

  assert.deepEqual(boundaries.map(({ year }) => year), [120, 121, 122, 123]);
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    assert.equal(
      boundaries[index + 1].absoluteDay - boundaries[index].absoluteDay,
      getDaysInYear(calendar, boundaries[index].year),
    );
  }
});

test('supports negative years and retains exact decade and century classes', () => {
  const startDay = yearStart(-101);
  const endDay = yearStart(1);
  const items = createTimelineYearGridItems({
    startDay,
    endDay,
    calendarId: defaultCalendarId,
    toSyntheticDate: (absoluteDay) => absoluteDay,
  });

  assert.equal(items.length, 103);
  assert.equal(items[0].id, `year-grid:${defaultCalendarId}:-101`);
  assert.match(items.find(({ data }) => data.year === -100).className, /is-century/);
  assert.match(items.find(({ data }) => data.year === -90).className, /is-decade/);
  assert.doesNotMatch(items.find(({ data }) => data.year === -89).className, /is-decade|is-century/);
  assert.ok(items.every((item) => item.type === 'background' && item.selectable === false));
});

test('the browser renderer mounts an explicit SVG grid and disables adaptive native divisions', () => {
  const renderer = read('../src/lib/timeline/renderer.mjs');
  const styles = read('../src/styles/timeline-pages.css');

  assert.match(renderer, /function installAnnualYearGrid\(root, dataset, timeline\)/);
  assert.match(renderer, /calendarYearBoundaries\(startDay, endDay, calendarId\)/);
  assert.match(renderer, /data-vc-year-grid/);
  assert.match(renderer, /timeline\.on\('rangechange', scheduleRender\)/);
  assert.match(renderer, /timeline\.on\('rangechanged', scheduleRender\)/);
  assert.match(styles, /\.vc-timeline-year-grid/);
  assert.match(styles, /\.vc-year-grid-annual/);
  assert.match(styles, /\.vc-year-grid-decade/);
  assert.match(styles, /\.vc-year-grid-century/);
  assert.match(styles, /\.vis-grid\.vis-vertical[\s\S]*transparent !important/);
});
