import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the bounded outer canvas owns real row scrolling and initial framing', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const outerScroll = read('../src/lib/timeline/outer-scroll.mjs');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-viewport\.css'/);
  assert.match(island, /installTimelineOuterScroll\(root\)/);
  assert.doesNotMatch(island, /ViewportGuard|viewport-guard/);
  assert.match(styles, /\.vc-timeline-app \.vc-timeline-canvas \{[\s\S]*block-size: clamp\(28rem, 58vh, 42rem\)/);
  assert.match(styles, /overflow-y: auto/);
  assert.match(styles, /overscroll-behavior: contain/);
  assert.doesNotMatch(styles, /padding-block-end/);
  assert.doesNotMatch(styles, /max-block-size:\s*100%/);
  assert.match(styles, /> \.vis-timeline \{[\s\S]*min-block-size: 100%/);
  assert.match(styles, /\.vc-timeline-app\.is-compact \.vc-timeline-canvas[\s\S]*clamp\(22rem, 48vh, 32rem\)/);

  assert.match(outerScroll, /canvas\.addEventListener\('wheel', handleWheel, \{ capture: true, passive: false \}\)/);
  assert.match(outerScroll, /canvas\.scrollTop = next/);
  assert.match(outerScroll, /event\.preventDefault\(\);[\s\S]*event\.stopPropagation\(\)/);
  assert.match(outerScroll, /const firstTop = Math\.min/);
  assert.match(outerScroll, /firstTop - TOP_INSET/);
  assert.doesNotMatch(outerScroll, /scroll-tail|padding-block-end/);
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
