import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('primary timelines use a bounded responsive viewport with vertical scrolling', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const island = read('../src/components/timeline/TimelineIsland.tsx');
  const guard = read('../src/lib/timeline/viewport-option-guard.mjs');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-viewport\.css'/);
  assert.match(island, /installTimelineViewportOptionGuard\(root, options\.compact === true\)/);
  assert.match(guard, /const maximum = compact \? 512 : 672/);
  assert.match(guard, /window\.innerHeight \* viewportShare/);
  assert.match(guard, /options\.verticalScroll === true/);
  assert.match(guard, /height: `\$\{height\}px`/);
  assert.match(guard, /verticalScroll: true/);
  assert.match(guard, /canvas\.dataset\.vcVerticalScroll = 'true'/);
  assert.match(guard, /window\.addEventListener\('resize', handleResize/);
});

test('the compatibility proxy forwards every legacy option except the obsolete fixed height', () => {
  const renderer = read('../src/lib/timeline/renderer.mjs');

  assert.match(renderer, /const \{ height: _legacyFixedHeight, \.\.\.forwardedOptions \} = nextOptions/);
  assert.match(renderer, /return target\.setOptions\(forwardedOptions\)/);
  assert.doesNotMatch(renderer, /if \(isLegacyHostOptionPass\) return undefined/);
});

test('event hovercards are body-level, narrow, theme-aware and line-clamped', () => {
  const renderer = read('../src/lib/timeline/renderer.mjs');
  const sync = read('../src/lib/timeline/tooltip-canonical-sync.mjs');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(renderer, /function installTimelineHoverTooltip\(root, dataset\)/);
  assert.match(renderer, /tooltip\.className = 'vis-tooltip vc-timeline-hovercard'/);
  assert.match(renderer, /document\.body\.append\(tooltip\)/);
  assert.match(sync, /document\.elementsFromPoint\(x, y\)/);
  assert.match(sync, /root\.contains\(card\)/);
  assert.match(styles, /body > \.vc-timeline-hovercard[\s\S]*position: fixed !important/);
  assert.match(styles, /max-width: 18rem/);
  assert.match(styles, /:root\[data-theme='light'\] body > \.vc-timeline-hovercard/);
  assert.match(styles, /--vc-hovercard-bg: #151310f7/);
  assert.match(styles, /-webkit-line-clamp: 4/);
  assert.match(styles, /body > \.vis-tooltip:not\(\.vc-timeline-hovercard\)[\s\S]*display: none !important/);
});
