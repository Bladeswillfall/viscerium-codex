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
  calendarDayBoundaries,
  calendarMonthBoundaries,
  calendarWeekBoundaries,
  calendarYearBoundaries,
  createAdaptiveTimelineTicks,
  createTimelineYearGridItems,
  selectAdaptiveTimelineScale,
  selectCalendarYearTicks,
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

function primaryScaleForSpan(startDay, endDay, previousScaleKey) {
  return selectAdaptiveTimelineScale({
    startDay,
    endDay,
    calendarId: defaultCalendarId,
    width: 1_000,
    previousScaleKey,
  });
}

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

test('selects readable legacy year labels from exact calendar boundaries', () => {
  const startDay = yearStart(9267) + 90;
  const endDay = yearStart(9278) - 90;
  const boundaries = calendarYearBoundaries(startDay, endDay, defaultCalendarId);
  const ticks = selectCalendarYearTicks(startDay, endDay, defaultCalendarId, 6);
  const boundaryDays = new Map(boundaries.map(({ year, absoluteDay }) => [year, absoluteDay]));

  assert.deepEqual(ticks.map(({ year }) => year), [9268, 9270, 9272, 9274, 9276]);
  assert.ok(ticks.every(({ year, absoluteDay }) => boundaryDays.get(year) === absoluteDay));
});

test('chooses 1-2-5 year scales from actual viewport density', () => {
  const cases = [
    [8_000, 'year:1000', 'year:500'],
    [4_000, 'year:500', 'year:100'],
    [1_600, 'year:200', 'year:50'],
    [800, 'year:100', 'year:50'],
  ];

  for (const [visibleYears, primaryKey, secondaryKey] of cases) {
    const scale = primaryScaleForSpan(yearStart(1), yearStart(1 + visibleYears));
    assert.equal(scale.primary.key, primaryKey);
    assert.equal(scale.secondary?.key, secondaryKey);
  }
});

test('descends from years through calendar months, weeks and days', () => {
  const startDay = yearStart(1);
  const cases = [
    [yearStart(2), 'year:1', 'month:1'],
    [startDay + 250, 'month:1', 'week:1'],
    [startDay + 50, 'week:1', 'day:1'],
    [startDay + 8, 'day:1', undefined],
  ];

  for (const [endDay, primaryKey, secondaryKey] of cases) {
    const scale = primaryScaleForSpan(startDay, endDay);
    assert.equal(scale.primary.key, primaryKey);
    assert.equal(scale.secondary?.key, secondaryKey);
  }
});

test('uses hysteresis to prevent scale flicker around a zoom boundary', () => {
  const startDay = yearStart(1);
  const initial = primaryScaleForSpan(startDay, yearStart(801));
  const held = primaryScaleForSpan(startDay, yearStart(901), initial.primary.key);
  const promoted = primaryScaleForSpan(startDay, yearStart(1_401), initial.primary.key);

  assert.equal(initial.primary.key, 'year:100');
  assert.equal(held.primary.key, 'year:100');
  assert.equal(promoted.primary.key, 'year:200');
});

test('generates exact calendar boundaries for close zoom levels', () => {
  const startDay = yearStart(120);
  const endDay = yearStart(121) - 1;

  assert.equal(calendarMonthBoundaries(startDay, endDay, defaultCalendarId).length, 13);
  assert.equal(calendarWeekBoundaries(startDay, startDay + 49, defaultCalendarId).length, 8);
  assert.equal(calendarDayBoundaries(startDay, startDay + 7).length, 8);

  const ticks = createAdaptiveTimelineTicks({
    startDay,
    endDay,
    calendarId: defaultCalendarId,
    width: 1_000,
  });
  const primaryDays = new Set(ticks.primary.map(({ absoluteDay }) => absoluteDay));
  assert.ok(ticks.secondary.every(({ absoluteDay }) => !primaryDays.has(absoluteDay)));
});

test('supports negative years and retains exact legacy background item classes', () => {
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

test('the timeline island mounts one adaptive SVG grid on every timeline', () => {
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const grid = read('../src/lib/timeline/adaptive-time-grid.mjs');
  const styles = read('../src/styles/timeline-adaptive-grid.css');
  const app = read('../src/components/timeline/TimelineApp.astro');

  assert.match(island, /installAdaptiveTimelineGrid\(root, dataset\)/);
  assert.match(grid, /createAdaptiveTimelineTicks\(/);
  assert.match(grid, /data-vc-time-grid/);
  assert.match(grid, /vc-time-grid-secondary/);
  assert.match(grid, /vc-time-grid-primary/);
  assert.match(grid, /new MutationObserver\(scheduleRender\)/);
  assert.match(styles, /\.vc-timeline-year-grid[\s\S]*display: none !important/);
  assert.match(styles, /\.vc-time-grid-secondary/);
  assert.match(styles, /\.vc-time-grid-primary/);
  assert.match(app, /timeline-adaptive-grid\.css/);
});

test('the site axis labels use the same adaptive tick calculation as the grid', () => {
  const synchroniser = read('../src/lib/timeline/year-axis-sync.mjs');

  assert.match(synchroniser, /createAdaptiveTimelineTicks\(/);
  assert.match(synchroniser, /previousScaleKey/);
  assert.match(synchroniser, /ticks\.labelPrecision/);
  assert.match(synchroniser, /data-vc-axis-time-boundary/);
  assert.match(synchroniser, /data-vc-axis-scale/);
  assert.match(synchroniser, /data-vc-axis-absolute-day/);
});
