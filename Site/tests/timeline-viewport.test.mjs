import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the bounded canvas routes real user input to viewport-ranked Chronos rows', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const adapter = read('../src/lib/timeline/chronos-adapter.mjs');
  const guard = read('../src/lib/timeline/viewport-guard.mjs');
  const rowScroll = read('../src/lib/timeline/row-scroll.mjs');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-viewport\.css'/);
  assert.match(island, /prepareTimelineViewportGuard\(root\)/);
  assert.match(island, /viewportGuard\.restorePrototype\(\)/);
  assert.match(island, /installTimelineRowScroll\(root\)/);
  assert.doesNotMatch(island, /installTimelineOuterScroll/);

  assert.match(styles, /\.vc-timeline-app \.vc-timeline-canvas \{[\s\S]*block-size: clamp\(28rem, 58vh, 42rem\)/);
  assert.match(styles, /overflow: hidden/);
  assert.match(styles, /> \.vis-timeline \{[\s\S]*max-block-size: 100%/);
  assert.match(styles, /\.vis-group:has\(\.vc-timeline-row-end-cap-item\)[\s\S]*block-size: 4\.5rem/);
  assert.match(styles, /\.vis-item\.vc-timeline-row-end-cap-item[\s\S]*block-size: 4\.5rem/);
  assert.doesNotMatch(styles, /padding-block-end:\s*1[02]rem/);

  assert.match(adapter, /STABLE_GROUP_ID_PREFIX = 'vc-timeline-group-'/);
  assert.match(adapter, /function orderGroupsForViewport\(/);
  assert.match(adapter, /metric\.active \|\|= overlaps/);
  assert.match(adapter, /function stabilizeParsedGroupIds\(parsed\)/);
  assert.match(adapter, /ROW_END_CAP_GROUP_ID = '__vc-timeline-row-end-cap__'/);
  assert.match(adapter, /ROW_END_CAP_ITEM_ID = '__vc-timeline-row-end-cap-item__'/);
  assert.match(adapter, /className: 'vc-timeline-row-end-cap-item'/);

  assert.match(guard, /STABLE_GROUP_ID_PATTERN = \/\^vc-timeline-group-/);
  assert.match(guard, /groupOrder: orderTimelineGroups/);
  assert.match(guard, /const getCanvas = \(\) => root\.querySelector\('\[data-vc-canvas\]'\)/);
  assert.match(guard, /height: `\$\{height\}px`/);
  assert.match(guard, /const isAdaptiveHeightPass/);

  assert.match(rowScroll, /SCROLLER_SELECTOR = '\.vis-panel\.vis-left\.vis-vertical-scroll'/);
  assert.match(rowScroll, /canvas\.addEventListener\('wheel', handleWheel, \{ capture: true, passive: false \}\)/);
  assert.match(rowScroll, /scroller\.scrollTop = target/);
  assert.match(rowScroll, /scroller\.dispatchEvent\(new Event\('scroll'/);
  assert.match(rowScroll, /event\.stopPropagation\(\)/);
  assert.match(rowScroll, /event\.preventDefault\(\)/);
  assert.match(rowScroll, /const firstTop = Math\.min/);
  assert.match(rowScroll, /firstTop - TOP_INSET/);
  assert.doesNotMatch(rowScroll, /createElement\('div'\)|ensureEndCap/);
});

test('the compatibility proxy forwards every legacy option except the obsolete fixed height', () => {
  const renderer = read('../src/lib/timeline/renderer.mjs');

  assert.match(renderer, /const \{ height: _legacyFixedHeight, \.\.\.forwardedOptions \} = nextOptions/);
  assert.match(renderer, /return target\.setOptions\(forwardedOptions\)/);
  assert.doesNotMatch(renderer, /if \(isLegacyHostOptionPass\) return undefined/);
});

test('the renderer owns one body-level hovercard and visible card text corrects recycled identity', () => {
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const renderer = read('../src/lib/timeline/renderer.mjs');
  const sync = read('../src/lib/timeline/tooltip-content-sync.mjs');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(renderer, /function installTimelineHoverTooltip\(root, dataset\)/);
  assert.match(renderer, /tooltip\.className = 'vis-tooltip vc-timeline-hovercard'/);
  assert.match(renderer, /document\.body\.append\(tooltip\)/);
  assert.match(renderer, /root\.addEventListener\('pointerover', handlePointerOver, true\)/);
  assert.match(island, /installTimelineTooltipContentSync\(root, dataset\)/);
  assert.match(sync, /const visibleText = normaliseVisibleText\(item\?\.textContent\)/);
  assert.match(sync, /tooltip\.querySelector\('\.vc-timeline-hovercard-title'\)\.textContent = event\.title/);
  assert.match(sync, /window\.requestAnimationFrame\(sync\)/);
  assert.match(styles, /body > \.vc-timeline-hovercard[\s\S]*position: fixed !important/);
  assert.match(styles, /max-width: 18rem !important/);
  assert.match(styles, /:root\[data-theme='light'\] body > \.vc-timeline-hovercard/);
  assert.match(styles, /background-color: var\(--vc-hovercard-bg\) !important/);
  assert.match(styles, /color: var\(--vc-hovercard-text\) !important/);
  assert.match(styles, /-webkit-line-clamp: 4/);
});
