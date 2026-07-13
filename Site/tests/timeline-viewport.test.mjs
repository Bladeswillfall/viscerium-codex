import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the Astro island mounts the native renderer without host redraw machinery', () => {
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const renderer = read('../src/lib/timeline/renderer.mjs');

  assert.match(renderer, /export \{ mountTimeline \} from '\.\/chronos-native-renderer\.mjs'/);
  assert.doesNotMatch(renderer, /Proxy\s*\(/);
  assert.doesNotMatch(renderer, /MutationObserver/);
  assert.doesNotMatch(renderer, /ChronosTimeline\.prototype/);

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

test('the viewport is stable and does not pin or adapt Chronos internals', () => {
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(styles, /block-size: 34rem/);
  assert.match(styles, /block-size: 28rem/);
  assert.match(styles, /> \.vis-timeline \{[\s\S]*block-size: 100% !important/);
  assert.doesNotMatch(styles, /vc-pinned-row-height/);
  assert.doesNotMatch(styles, /vc-timeline-hovercard/);
  assert.doesNotMatch(styles, /data-vc-adaptive-height/);
});
