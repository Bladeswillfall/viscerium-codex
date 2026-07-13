import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the Astro island mounts one stable Chronos renderer without host observers', () => {
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const renderer = read('../src/lib/timeline/renderer.mjs');

  assert.match(renderer, /mountTimeline as mountNativeTimeline/);
  assert.match(renderer, /renderParsedWithStableTopOrientation/);
  assert.match(renderer, /orientation: \{[\s\S]*axis: 'top',[\s\S]*item: 'top'/);
  assert.match(renderer, /refreshGroupedLayoutWithoutZoom/);
  assert.match(renderer, /_handleZoomWorkaround = refreshGroupedLayoutWithoutZoom/);
  assert.match(renderer, /timeline\.redraw\?\.\(\)/);
  assert.match(renderer, /setWindow\(range\.start, range\.end, \{ animation: false \}\)/);
  assert.match(renderer, /_handleZoomWorkaround = originalZoomWorkaround/);
  assert.match(renderer, /makeTimelineSettersIdempotent/);
  assert.doesNotMatch(renderer, /Proxy\s*\(/);
  assert.doesNotMatch(renderer, /MutationObserver|ResizeObserver/);

  assert.match(island, /cleanup = mountTimeline\(root, dataset, options\)/);
  assert.doesNotMatch(island, /prepareTimelineViewportGuard/);
  assert.doesNotMatch(island, /installAdaptiveTimelineGrid/);
  assert.doesNotMatch(island, /installTimelineTooltipContentSync/);
  assert.doesNotMatch(island, /installCalendarYearAxisSync/);
});

test('unified chronology keeps one canonical Chronos group without host remounting', () => {
  const adapter = read('../src/lib/timeline/chronos-adapter.mjs');

  assert.match(adapter, /if \(laneMode === 'unified'\)[\s\S]*const chronology = \{ key: 'chronology', label: 'Chronology' \}/);
  assert.match(adapter, /groups: \[chronology\]/);
  assert.match(adapter, /groupFor: \(\) => chronology/);
  assert.match(adapter, /\{\$\{cleanChronosText\(group\.label\)/);
});

test('the viewport and overview are compact fixed-height surfaces', () => {
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(styles, /block-size: 24rem/);
  assert.match(styles, /block-size: 22rem/);
  assert.match(styles, /height: 2\.6rem/);
  assert.match(styles, /min-height: 4\.5rem/);
  assert.match(styles, /> \.vis-timeline \{[\s\S]*block-size: 100% !important/);
  assert.doesNotMatch(styles, /vc-pinned-row-height/);
  assert.doesNotMatch(styles, /vc-timeline-hovercard/);
  assert.doesNotMatch(styles, /data-vc-adaptive-height/);
});
