import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('timeline height follows the lowest rendered event and retains vertical scrolling at the cap', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const renderer = read('../src/lib/timeline/renderer.mjs');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-viewport\.css'/);
  assert.match(renderer, /function installAdaptiveTimelineHeight\(root, timeline, compact = false\)/);
  assert.match(renderer, /querySelectorAll\('\.vis-foreground \.vis-item\.vc-timeline-item'\)/);
  assert.match(renderer, /const lowestEventBottom = eventItems\.reduce/);
  assert.match(renderer, /const desiredHeight = Math\.min\(maxHeight, naturalHeight\)/);
  assert.match(renderer, /const scrollable = naturalHeight > maxHeight/);
  assert.match(renderer, /height: `\$\{desiredHeight\}px`/);
  assert.match(renderer, /verticalScroll: true/);
  assert.match(renderer, /timeline\.on\('changed', scheduleMeasure\)/);
  assert.match(renderer, /new ResizeObserver\(scheduleMeasure\)/);
});

test('the compatibility proxy forwards every legacy option except the fixed canvas height', () => {
  const renderer = read('../src/lib/timeline/renderer.mjs');

  assert.match(renderer, /const \{ height: _legacyFixedHeight, \.\.\.forwardedOptions \} = nextOptions/);
  assert.match(renderer, /return target\.setOptions\(forwardedOptions\)/);
  assert.doesNotMatch(renderer, /if \(isLegacyHostOptionPass\) return undefined/);
});

test('event hovercards are body-level, narrow and line-clamped instead of clipped native tooltips', () => {
  const renderer = read('../src/lib/timeline/renderer.mjs');
  const styles = read('../src/styles/timeline-viewport.css');

  assert.match(renderer, /function installTimelineHoverTooltip\(root, dataset\)/);
  assert.match(renderer, /tooltip\.className = 'vis-tooltip vc-timeline-hovercard'/);
  assert.match(renderer, /document\.body\.append\(tooltip\)/);
  assert.match(renderer, /itemRect\.top - tooltipRect\.height - gap/);
  assert.match(renderer, /activeItem\.setAttribute\('aria-describedby', tooltipId\)/);
  assert.match(renderer, /const cleanupHoverTooltip = installTimelineHoverTooltip\(root, dataset\)/);
  assert.match(styles, /body > \.vc-timeline-hovercard[\s\S]*position: fixed !important/);
  assert.match(styles, /max-width: 20rem/);
  assert.match(styles, /-webkit-line-clamp: 4/);
  assert.match(styles, /body > \.vis-tooltip:not\(\.vc-timeline-hovercard\)[\s\S]*display: none !important/);
});
