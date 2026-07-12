import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the explicit year grid is stacked between era bands and event cards', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const renderer = read('../src/lib/timeline/renderer.mjs');
  const styles = read('../src/styles/timeline-stacking.css');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-stacking\.css'/);
  assert.match(renderer, /const itemset = centerPanel\?\.querySelector\('\.vis-itemset'\)/);
  assert.match(renderer, /itemset\.querySelector\(':scope > \[data-vc-year-grid\]'\)/);
  assert.match(renderer, /itemset\.append\(svg\)/);
  assert.doesNotMatch(renderer, /backgroundPanel\.append\(svg\)/);
  assert.match(styles, /\.vis-itemset > \.vis-background[\s\S]*z-index:\s*0 !important/);
  assert.match(styles, /\.vis-itemset > \.vc-timeline-year-grid[\s\S]*z-index:\s*1 !important/);
  assert.match(styles, /\.vis-itemset > \.vis-foreground[\s\S]*z-index:\s*2 !important/);
  assert.match(styles, /\.vis-foreground \.vis-item\.vc-timeline-item[\s\S]*z-index:\s*3 !important/);
  assert.match(styles, /\.vis-item\.vc-timeline-item\.vis-selected[\s\S]*z-index:\s*5 !important/);
});
