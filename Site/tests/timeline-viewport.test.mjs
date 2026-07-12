import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('timeline rows live inside a bounded vertically scrollable canvas', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-viewport\.css'/);
  assert.match(styles, /\.vc-timeline-app \.vc-timeline-canvas \{[\s\S]*block-size: clamp\(28rem, 58vh, 42rem\)/);
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

test('event hovercards are body-level, narrow, theme-aware and line-clamped', () => {
  const renderer = read('../src/lib/timeline/renderer.mjs');
  const sync = read('../src/lib/timeline/tooltip-canonical-sync.mjs');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(renderer, /function installTimelineHoverTooltip\(root, dataset\)/);
  assert.match(renderer, /tooltip\.className = 'vis-tooltip vc-timeline-hovercard'/);
  assert.match(renderer, /document\.body\.append\(tooltip\)/);
  assert.match(sync, /document\.elementsFromPoint\(x, y\)/);
  assert.match(sync, /document\.addEventListener\('pointermove', handlePointerMove, true\)/);
  assert.match(sync, /root\.contains\(card\)/);
  assert.match(styles, /body > \.vc-timeline-hovercard[\s\S]*position: fixed !important/);
  assert.match(styles, /max-width: 18rem/);
  assert.match(styles, /:root\[data-theme='light'\] body > \.vc-timeline-hovercard/);
  assert.match(styles, /--vc-hovercard-bg: #151310f7/);
  assert.match(styles, /-webkit-line-clamp: 4/);
  assert.match(styles, /body > \.vis-tooltip:not\(\.vc-timeline-hovercard\)[\s\S]*display: none !important/);
});
