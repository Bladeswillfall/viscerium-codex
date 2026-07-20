import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('graph canvas colours are explicit, theme-aware and parser-safe', () => {
  const styles = read('../src/styles/graph.css');

  assert.match(styles, /:root,\s*:root\[data-theme='dark'\]\s*\{/);
  assert.match(styles, /:root\[data-theme='light'\]\s*\{/);
  assert.match(styles, /--slsg-node-color:\s*rgb\(var\(--vc-graph-node-rgb\)\)/);
  assert.match(styles, /--slsg-link-color:\s*rgb\(var\(--vc-graph-link-rgb\)\)/);
  assert.match(styles, /--slsg-label-color:\s*rgb\(var\(--vc-graph-text-rgb\)\)/);
  assert.match(styles, /--slsg-node-color-current:\s*rgb\(var\(--vc-graph-current-rgb\)\)/);
  assert.match(styles, /--slsg-node-color-tag:\s*rgb\(var\(--vc-graph-tag-rgb\)\)/);
  assert.doesNotMatch(styles, /--slsg-(?:node|link|label)[^:]*:\s*(?:oklch|oklab|color-mix)\(/);

  const layeredEnd = styles.lastIndexOf('\n}');
  const graphThemeStart = styles.indexOf("\n:root,\n:root[data-theme='dark']");
  assert.ok(graphThemeStart > layeredEnd - 8_000, 'graph theme overrides must remain after the component layer');
  assert.match(styles, /Keep these rules unlayered/);
});

test('site graph uses tags and native graph interactions', () => {
  const astroConfig = read('../astro.config.mjs');

  assert.match(astroConfig, /siteGraph\(\{[\s\S]*overridePageSidebar:\s*false/);
  assert.match(astroConfig, /graphConfig:\s*\{[\s\S]*tagRenderMode:\s*'node'/);
  assert.match(astroConfig, /renderArrows:\s*false/);
  assert.match(astroConfig, /enableDrag:\s*true/);
  assert.match(astroConfig, /enableZoom:\s*true/);
  assert.match(astroConfig, /enablePan:\s*true/);
  assert.match(astroConfig, /nodeCurrentStyle:\s*\{[\s\S]*shapeColor:\s*'nodeColorCurrent'/);
  assert.match(astroConfig, /tagDefaultStyle:\s*\{[\s\S]*shapeColor:\s*'nodeColorTag'/);
});
