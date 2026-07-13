import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the bounded canvas delegates row scrolling to the guarded vis-timeline instance', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const guard = read('../src/lib/timeline/viewport-guard.mjs');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-viewport\.css'/);
  assert.match(island, /prepareTimelineViewportGuard\(root\)/);
  assert.match(island, /viewportGuard\.restorePrototype\(\)/);
  assert.match(styles, /\.vc-timeline-app \.vc-timeline-canvas \{[\s\S]*block-size: clamp\(28rem, 58vh, 42rem\)/);
  assert.match(styles, /overflow: hidden/);
  assert.doesNotMatch(styles, /padding-block-end/);
  assert.doesNotMatch(styles, /vc-timeline-scroll-tail/);
  assert.match(styles, /\.vc-timeline-app\.is-compact \.vc-timeline-canvas[\s\S]*clamp\(22rem, 48vh, 32rem\)/);
  assert.match(guard, /const getCanvas = \(\) => root\.querySelector\('\[data-vc-canvas\]'\)/);
  assert.match(guard, /const canvas = getCanvas\(\);[\s\S]*Math\.max\(320, Math\.round\(canvas\?\.clientHeight \?\? 0\)\)/);
  assert.match(guard, /observeCanvas\(\);[\s\S]*applyViewportHeight\(timeline\)/);
  assert.match(guard, /height: `\$\{height\}px`/);
  assert.match(guard, /orientation: \{[\s\S]*axis: 'top',[\s\S]*item: 'top'/);
  assert.match(guard, /const isAdaptiveHeightPass/);
  assert.match(guard, /\^\\d\+px\$/);
  assert.match(guard, /const \{ height: _height, minHeight: _minHeight, \.\.\.forwarded \} = options/);
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
