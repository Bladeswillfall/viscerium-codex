import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const siteRoot = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, siteRoot), 'utf8');
}

function importedPartials(source) {
  return [...source.matchAll(/@import\s+['"]\.\/([^'"]+)['"];?/g)].map((match) => match[1]);
}

test('global styles are registered through the Codex entrypoint', async () => {
  const config = await read('astro.config.mjs');
  const customCss = config.match(/customCss:\s*\[([\s\S]*?)\],\n\s*components:/)?.[1] ?? '';

  assert.match(customCss, /\.\/src\/styles\/codex\.css/);
  assert.doesNotMatch(customCss, /\.\/src\/styles\/(?!codex\.css)[^'"\s]+\.css/);
});

test('the Codex entrypoint preserves the established global cascade', async () => {
  const source = await read('src/styles/codex.css');

  assert.deepEqual(importedPartials(source), [
    'ion-layers.css',
    'color-tokens.css',
    'ion-theme.css',
    'ion-expressive-code.css',
    'typography.css',
    'content-media.css',
    'codex-ui.css',
    'navigation.css',
    'header-controls.css',
    'graph.css',
    'timelines.css',
    'maps.css',
    'calendar.css',
    'category-index.css',
    'support.css',
    'layout.css',
    'a11y.css',
    'era-styles.css',
  ]);
});

test('feature pages import one stylesheet entrypoint', async () => {
  const homepage = await read('src/pages/index.astro');
  const timelineApp = await read('src/components/timeline/TimelineApp.astro');
  const timelineIsland = await read('src/components/timeline/TimelineIsland.tsx');

  assert.match(homepage, /import ['"]\.\.\/styles\/homepage\.css['"]/);
  assert.doesNotMatch(homepage, /homepage-(?:base|content|responsive|reveal)\.css/);
  assert.doesNotMatch(homepage, /<style\s+is:global>/);

  assert.match(timelineApp, /import ['"]\.\.\/\.\.\/styles\/timeline\.css['"]/);
  assert.doesNotMatch(timelineApp, /styles\/(?:chronos|timeline-|chronos-calendar-axis)/);
  assert.doesNotMatch(timelineIsland, /styles\/[^'"\s]+\.css/);
});

test('feature entrypoints retain their partial order', async () => {
  const homepage = await read('src/styles/homepage.css');
  const timeline = await read('src/styles/timeline.css');

  assert.deepEqual(importedPartials(homepage), [
    'homepage-base.css',
    'homepage-content.css',
    'homepage-responsive.css',
    'homepage-reveal.css',
  ]);

  assert.deepEqual(importedPartials(timeline), [
    'chronos.css',
    'timeline-loading.css',
    'timeline-performance.css',
    'timeline-pages.css',
    'timeline-stacking.css',
    'timeline-viewport.css',
    'chronos-calendar-axis.css',
    'timeline-chronicle.css',
    'timeline-chronicle-layout.css',
    'timeline-toolbar.css',
    'timeline-toolbar-container.css',
    'timeline-buttons.css',
  ]);
});
