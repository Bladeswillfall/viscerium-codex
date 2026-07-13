import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the Astro island mounts the local Chronos renderer fork without host patches', () => {
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const entry = read('../src/lib/timeline/renderer.mjs');
  const renderer = read('../src/lib/timeline/chronos-native-renderer.mjs');
  const fork = read('../src/lib/chronos-fork/VisceriumChronosTimeline.mjs');

  assert.match(entry, /export \{ mountTimeline \} from '\.\/chronos-native-renderer\.mjs'/);
  assert.match(renderer, /VisceriumChronosTimeline/);
  assert.match(fork, /orientation: \{ axis: 'top', item: 'top' \}/);
  assert.match(fork, /groupHeightMode: 'fitItems'/);
  assert.match(fork, /rtl: false/);
  assert.match(fork, /#installCalendarAxis\(\)/);
  assert.match(fork, /this\.axis\.getTicks/);
  assert.match(fork, /setOptions\(\{ queue: queueOptions \}\)/);
  assert.doesNotMatch(entry, /ChronosTimeline\.prototype|_handleZoomWorkaround|Proxy\s*\(/);
  assert.doesNotMatch(renderer, /ChronosTimeline\.prototype|_handleZoomWorkaround|MutationObserver|ResizeObserver/);

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

test('the exact fictional-calendar axis and event rows share one stable fixed-height viewport', () => {
  const styles = read('../src/styles/timeline-viewport.css');
  const axisStyles = read('../src/styles/chronos-calendar-axis.css');
  const renderer = read('../src/lib/timeline/chronos-native-renderer.mjs');
  const fork = read('../src/lib/chronos-fork/VisceriumChronosTimeline.mjs');

  assert.match(styles, /block-size: 24rem/);
  assert.match(styles, /block-size: 22rem/);
  assert.match(styles, /min-height: 4\.5rem/);
  assert.match(styles, /> \.vis-timeline \{[\s\S]*block-size: 100% !important/);
  assert.match(renderer, /height: options\.compact \? '22rem' : '24rem'/);
  assert.doesNotMatch(fork, /delete this\.hostTimelineOptions\.height/);
  assert.match(fork, /maxHeight: '40rem'/);
  assert.match(axisStyles, /\.vc-timeline-canvas \.vis-time-axis[\s\S]*display: block/);
  assert.match(axisStyles, /\.vc-calendar-axis-layer/);
  assert.match(axisStyles, /\.vc-calendar-grid-line\.is-secondary/);
  assert.match(axisStyles, /\.vc-calendar-grid-line\.is-primary/);
  assert.match(fork, /topPanel\.appendChild\(axisLayer\)/);
  assert.match(fork, /centerPanel\.appendChild\(gridLayer\)/);
  assert.doesNotMatch(renderer, /data-vc-axis|vc-timeline-axis|axisTicks|renderAxis/);
  assert.doesNotMatch(styles, /vc-pinned-row-height|data-vc-adaptive-height/);
});
