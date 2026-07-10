import test from 'node:test';
import assert from 'node:assert/strict';
import { createChronosTimelineModel } from '../src/lib/timeline/chronos-adapter.mjs';
import { syntheticDateToAbsoluteDay } from '../src/lib/timeline/core.mjs';

function fixture() {
  const events = [
    {
      id: 'event-a',
      title: 'First event',
      description: 'A point event.',
      href: '/first/',
      absoluteStartDay: 10,
      precision: 'day',
      certainty: 'exact',
      kind: 'event',
      importance: 'major',
      categories: ['military'],
      lanes: ['okse-dominion'],
    },
    {
      id: 'event-b',
      title: 'Long event',
      description: 'A ranged event.',
      href: '/long/',
      absoluteStartDay: 20,
      absoluteEndDay: 25,
      precision: 'year',
      endPrecision: 'year',
      certainty: 'disputed',
      kind: 'period',
      importance: 'standard',
      categories: ['unmapped-category'],
      lanes: [],
    },
  ];

  return {
    id: 'super',
    title: 'Super timeline',
    absoluteStartDay: 0,
    absoluteEndDay: 100,
    events,
    eras: [
      {
        id: 'citadel',
        title: 'CITADEL',
        href: '/eras/citadel/',
        visualToken: 'e1',
        absoluteStartDay: 0,
        absoluteEndDay: 50,
      },
    ],
  };
}

test('adapts canonical events and era bands to a Chronos ParseResult', () => {
  const dataset = fixture();
  const model = createChronosTimelineModel({
    dataset,
    formatEventDate: (event) => `day ${event.absoluteStartDay}`,
  });

  assert.equal(model.groups.length, 1);
  assert.equal(model.groups[0].content, 'Chronology');
  assert.equal(model.parsed.groups, model.groups);
  assert.equal(model.parsed.markers.length, 0);
  assert.equal(model.parsed.flags.noToday, true);

  const first = model.items.find((item) => item.id === 'event-a');
  assert.equal(first.type, 'point');
  assert.equal(first.group, model.groups[0].id);
  assert.equal(syntheticDateToAbsoluteDay(first.start), 10);
  assert.match(first.className, /importance-major/);
  assert.match(first.title, /day 10/);

  const period = model.items.find((item) => item.id === 'event-b');
  assert.equal(period.type, 'range');
  assert.equal(syntheticDateToAbsoluteDay(period.start), 20);
  assert.equal(syntheticDateToAbsoluteDay(period.end), 26);
  assert.match(period.className, /category-unknown/);

  const era = model.items.find((item) => item.id.startsWith('era:citadel:'));
  assert.equal(era.type, 'background');
  assert.equal(syntheticDateToAbsoluteDay(era.start), 0);
  assert.equal(syntheticDateToAbsoluteDay(era.end), 51);
});

test('creates Chronos groups from declared lanes without changing chronology', () => {
  const dataset = fixture();
  const model = createChronosTimelineModel({
    dataset,
    laneMode: 'lane',
    formatEventDate: (event) => String(event.absoluteStartDay),
    visibleStartDay: 5,
    visibleEndDay: 30,
  });

  assert.deepEqual(model.groups.map((group) => group.content), ['okse dominion', 'Other / unassigned']);
  assert.equal(model.items.find((item) => item.id === 'event-a').group, model.groups[0].id);
  assert.equal(model.items.find((item) => item.id === 'event-b').group, model.groups[1].id);
  assert.equal(syntheticDateToAbsoluteDay(new Date(model.parsed.flags.defaultView.start)), 5);
  assert.equal(syntheticDateToAbsoluteDay(new Date(model.parsed.flags.defaultView.end)), 30);
  assert.equal(model.items.filter((item) => item.id.startsWith('era:citadel:')).length, 2);
});

test('requires a VISCERIUM date formatter rather than exposing synthetic dates', () => {
  assert.throws(
    () => createChronosTimelineModel({ dataset: fixture() }),
    /requires a date formatter/,
  );
});
