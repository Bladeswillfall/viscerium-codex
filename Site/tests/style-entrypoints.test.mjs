import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const siteRoot = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, siteRoot), 'utf8');
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

test('homepage reveal styles are merged into the final homepage stylesheet', async () => {
  const homepage = await read('src/pages/index.astro');
  const responsive = await read('src/styles/homepage-responsive.css');

  assert.match(homepage, /import ['"]\.\.\/styles\/homepage-base\.css['"]/);
  assert.match(homepage, /import ['"]\.\.\/styles\/homepage-content\.css['"]/);
  assert.match(homepage, /import ['"]\.\.\/styles\/homepage-responsive\.css['"]/);
  assert.doesNotMatch(homepage, /homepage-reveal\.css/);
  assert.match(responsive, /\.home-reveal\s*\{/);
  assert.match(responsive, /\.home-reveal--complete\s*\{/);
  assert.match(responsive, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.home-reveal/);
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
