import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('registers the official Preact renderer for Astro islands', () => {
  const packageJson = JSON.parse(read('../package.json'));
  const astroConfig = read('../astro.config.mjs');
  const tsconfig = JSON.parse(read('../tsconfig.json'));

  assert.equal(packageJson.dependencies['@astrojs/preact'], '6.0.1');
  assert.equal(packageJson.dependencies.preact, '10.29.7');
  assert.match(astroConfig, /import preact from '@astrojs\/preact'/);
  assert.match(astroConfig, /integrations:\s*\[\s*preact\(\)/);
  assert.equal(tsconfig.compilerOptions.jsx, 'react-jsx');
  assert.equal(tsconfig.compilerOptions.jsxImportSource, 'preact');
});

test('TimelineApp delegates browser behaviour to a client-loaded island', () => {
  const app = read('../src/components/timeline/TimelineApp.astro');

  assert.match(app, /import TimelineIsland from '\.\/TimelineIsland'/);
  assert.match(app, /<TimelineIsland[\s\S]*client:load/);
  assert.match(app, /fallbackEvents=\{fallbackEvents\}/);
  assert.doesNotMatch(app, /<script>|astro:page-load|__visceriumTimelineRuntime|application\/json/);
});

test('the Preact island owns Chronos mount and cleanup while retaining fallback content', () => {
  const island = read('../src/components/timeline/TimelineIsland.tsx');

  assert.match(island, /useEffect\(/);
  assert.match(island, /useRef<HTMLDivElement>/);
  assert.match(island, /await import\('\.\.\/\.\.\/lib\/timeline\/renderer\.mjs'\)/);
  assert.match(island, /cleanup = mountTimeline\(root, dataset, options\)/);
  assert.match(island, /return \(\) => \{[\s\S]*cleanup\?\.\(\)/);
  assert.match(island, /class="vc-timeline-fallback"/);
  assert.match(island, /fallbackRef\.current\.hidden = true/);
  assert.doesNotMatch(island, /astro:page-load|astro:before-swap|customElements|MutationObserver/);
});
