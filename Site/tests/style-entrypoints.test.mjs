import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const siteRoot = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, siteRoot), 'utf8');
}

function importedStyles(source) {
  return [...source.matchAll(/import\s+['"]\.\/([^'"]+)['"];?/g)].map((match) => match[1]);
}

test('global Starlight styles remain separate because processing order is semantic', async () => {
  const config = await read('astro.config.mjs');
  const customCss = config.match(/customCss:\s*\[([\s\S]*?)\],\n\s*components:/)?.[1] ?? '';

  assert.match(customCss, /\.\/src\/styles\/ion-layers\.css/);
  assert.match(customCss, /\.\/src\/styles\/color-tokens\.css/);
  assert.match(customCss, /\.\/src\/styles\/graph\.css/);
  assert.match(customCss, /\.\/src\/styles\/layout\.css/);
  assert.doesNotMatch(customCss, /\.\/src\/styles\/codex\.css/);
});

test('the homepage imports one style manifest', async () => {
  const homepage = await read('src/pages/index.astro');

  assert.match(homepage, /import ['"]\.\.\/styles\/homepage-styles['"]/);
  assert.doesNotMatch(homepage, /homepage-(?:base|content|responsive|reveal)\.css/);
  assert.match(homepage, /<style\s+is:global>/);
});

test('the homepage manifest preserves separate CSS modules in their established order', async () => {
  const manifest = await read('src/styles/homepage-styles.ts');

  assert.deepEqual(importedStyles(manifest), [
    'homepage-base.css',
    'homepage-content.css',
    'homepage-responsive.css',
    'homepage-reveal.css',
  ]);
});

test('timeline styles keep their tested Astro and Preact import boundaries', async () => {
  const timelineApp = await read('src/components/timeline/TimelineApp.astro');
  const timelineIsland = await read('src/components/timeline/TimelineIsland.tsx');

  assert.match(timelineApp, /styles\/timeline-loading\.css/);
  assert.match(timelineApp, /styles\/timeline-viewport\.css/);
  assert.match(timelineApp, /styles\/chronos-calendar-axis\.css/);
  assert.doesNotMatch(timelineApp, /styles\/timeline\.css/);

  assert.match(timelineIsland, /styles\/timeline-chronicle\.css/);
  assert.match(timelineIsland, /styles\/timeline-toolbar\.css/);
  assert.match(timelineIsland, /styles\/timeline-buttons\.css/);
  assert.doesNotMatch(timelineIsland, /styles\/timeline-island\.css/);
});
