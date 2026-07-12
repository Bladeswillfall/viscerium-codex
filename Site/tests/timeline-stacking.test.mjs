import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the explicit year grid stays visible behind timeline event cards', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');
  const styles = read('../src/styles/timeline-stacking.css');

  assert.match(app, /import '\.\.\/\.\.\/styles\/timeline-stacking\.css'/);
  assert.match(styles, /\.vis-timeline > \.vis-panel\.vis-background[\s\S]*z-index:\s*0 !important/);
  assert.match(styles, /\.vis-timeline > \.vis-panel\.vis-center[\s\S]*z-index:\s*1 !important[\s\S]*background-color:\s*transparent !important/);
  assert.match(styles, /\.vis-panel\.vis-center > \.vis-content,[\s\S]*\.vis-content > \.vis-itemset[\s\S]*background-color:\s*transparent !important/);
  assert.match(styles, /\.vis-itemset > \.vis-background[\s\S]*z-index:\s*1 !important/);
  assert.match(styles, /\.vis-itemset > \.vis-foreground[\s\S]*z-index:\s*2 !important/);
  assert.match(styles, /\.vis-foreground \.vis-item\.vc-timeline-item[\s\S]*z-index:\s*3 !important/);
  assert.match(styles, /\.vis-item\.vc-timeline-item\.vis-selected[\s\S]*z-index:\s*5 !important/);
});
