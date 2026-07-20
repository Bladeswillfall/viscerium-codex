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

test('global Starlight styles remain separate because processing order is semantic', async () => {
  const config = await read('astro.config.mjs');
  const customCss = config.match(/customCss:\s*\[([\s\S]*?)\],\n\s*components:/)?.[1] ?? '';

  assert.doesNotMatch(customCss, /\.\/src\/styles\/codex\.css/);
  assert.match(customCss, /\.\/src\/styles\/ion-layers\.css/);
  assert.match(customCss, /\.\/src\/styles\/color-tokens\.css/);
  assert.match(customCss, /\.\/src\/styles\/graph\.css/);
  assert.match(customCss, /\.\/src\/styles\/layout\.css/);
});

test('the homepage imports one entrypoint and no inline global stylesheet', async () => {
  const homepage = await read('src/pages/index.astro');

  assert.match(homepage, /import ['"]\.\.\/styles\/homepage\.css['"]/);
  assert.doesNotMatch(homepage, /homepage-(?:base|content|responsive|reveal)\.css/);
  assert.doesNotMatch(homepage, /<style\s+is:global>/);
});

test('the homepage entrypoint preserves partial order and shell overrides', async () => {
  const homepage = await read('src/styles/homepage.css');

  assert.deepEqual(importedPartials(homepage), [
    'homepage-base.css',
    'homepage-content.css',
    'homepage-responsive.css',
    'homepage-reveal.css',
  ]);
  assert.match(homepage, /\.main-frame:has\(\.home-gateway\)/);
  assert.match(homepage, /padding-inline-start: var\(--codex-sidebar-overlay-width\) !important/);
});

test('the server-rendered timeline keeps its explicit stylesheet boundary', async () => {
  const timelineApp = await read('src/components/timeline/TimelineApp.astro');

  for (const stylesheet of [
    'chronos.css',
    'timeline-loading.css',
    'timeline-performance.css',
    'timeline-pages.css',
    'timeline-stacking.css',
    'timeline-viewport.css',
    'chronos-calendar-axis.css',
  ]) {
    assert.match(timelineApp, new RegExp(`styles/${stylesheet.replace('.', '\\.')}`));
  }
  assert.doesNotMatch(timelineApp, /styles\/timeline\.css/);
});

test('the hydrated timeline island imports one entrypoint', async () => {
  const island = await read('src/components/timeline/TimelineIsland.tsx');

  assert.match(island, /import ['"]\.\.\/\.\.\/styles\/timeline-island\.css['"]/);
  assert.doesNotMatch(island, /styles\/(?:timeline-chronicle|timeline-toolbar|timeline-buttons)\.css/);
});

test('the hydrated timeline entrypoint preserves its partial order', async () => {
  const timelineIsland = await read('src/styles/timeline-island.css');

  assert.deepEqual(importedPartials(timelineIsland), [
    'timeline-chronicle.css',
    'timeline-chronicle-layout.css',
    'timeline-toolbar.css',
    'timeline-toolbar-container.css',
    'timeline-buttons.css',
  ]);
});
