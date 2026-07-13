import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the timeline island installs a scoped toolbar enhancement after existing behaviour', () => {
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const toolbar = read('../src/lib/timeline/toolbar-ui.mjs');
  const styles = read('../src/styles/timeline-toolbar.css');

  assert.match(island, /installTimelineToolbar/);
  assert.match(island, /import '\.\.\/\.\.\/styles\/timeline-toolbar\.css'/);
  assert.match(island, /const cleanupToolbar = installTimelineToolbar\(root\)/);
  assert.match(island, /cleanupToolbar\(\);[\s\S]*cleanupChronicle\(\);[\s\S]*cleanupHovercard\(\);[\s\S]*cleanupTimeline\(\);/);

  assert.match(toolbar, /root\.querySelector\('\.vc-timeline-toolbar'\)/);
  assert.match(toolbar, /toolbar\.dataset\.vcToolbarEnhanced = 'true'/);
  assert.match(toolbar, /createActionGroup\('Navigate'/);
  assert.match(toolbar, /createActionGroup\('Scale'/);
  assert.match(toolbar, /createActionGroup\('View'/);
  assert.match(toolbar, /Search titles, factions, locations…/);
  assert.match(toolbar, /Date system/);
  assert.match(toolbar, /Arrange rows/);
  assert.match(toolbar, /queueMicrotask\(\(\) => queueMicrotask\(syncViewButton\)\)/);
  assert.doesNotMatch(toolbar, /\.setWindow\(|\.redraw\(|\.setItems\(|\.setGroups\(|VisceriumChronosTimeline|from 'vis-timeline/);

  assert.match(styles, /\.vc-timeline-toolbar\.vc-timeline-toolbar-enhanced/);
  assert.match(styles, /\.vc-timeline-action-group/);
  assert.match(styles, /\.vc-timeline-command/);
  assert.match(styles, /@media \(max-width: 38rem\)/);
  assert.doesNotMatch(styles, /\.vis-(?:timeline|panel|item|group|label|time-axis)/);
});

test('toolbar buttons retain visible labels, icons and accessible names', () => {
  const toolbar = read('../src/lib/timeline/toolbar-ui.mjs');

  assert.match(toolbar, /vc-timeline-control-icon/);
  assert.match(toolbar, /vc-timeline-command-label/);
  assert.match(toolbar, /Select the previous matching event/);
  assert.match(toolbar, /Show a wider date range/);
  assert.match(toolbar, /Return to the default date range/);
  assert.match(toolbar, /Open chronicle reading view/);
  assert.match(toolbar, /Return to interactive graph view/);
  assert.match(toolbar, /setAttribute\('aria-label', title\)/);
  assert.match(toolbar, /setAttribute\('title', title\)/);
});
