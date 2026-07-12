import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('timeline rows live inside a bounded vertically scrollable canvas', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-viewport\.css'/);
  assert.match(styles, /\.vc-timeline-app \.vc-timeline-canvas \{[\s\S]*block-size: clamp\(28rem, 58vh, 42rem\)/);
  assert.match(styles, /padding-block-end: 12rem/);
  assert.match(styles, /overflow-y: auto/);
  assert.match(styles, /overscroll-behavior: contain/);
  assert.match(styles, /\.vc-timeline-app\.is-compact \.vc-timeline-canvas[\s\S]*clamp\(22rem, 48vh, 32rem\)/);
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
