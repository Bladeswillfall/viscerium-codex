import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const layers = read('../src/styles/ion-layers.css');
const footer = read('../src/components/StarlightFooter.astro');
const timeline = read('../src/styles/timeline-stacking.css');

test('the Codex defines explicit site-level stacking tiers', () => {
  assert.match(layers, /--codex-z-underlay:\s*-1/);
  assert.match(layers, /--codex-z-page:\s*0/);
  assert.match(layers, /--codex-z-surface:\s*1/);
  assert.match(layers, /--codex-z-navigation:\s*60/);
  assert.match(layers, /--codex-z-control:\s*1000/);
  assert.match(layers, /--codex-z-reveal:\s*9999/);
  assert.match(layers, /--codex-z-grain:\s*999999/);
});

test('the two-column shell contains local stacking and normal page surfaces cover the footer', () => {
  assert.match(
    layers,
    /\.codex-two-column-content\s*\{[\s\S]*?position:\s*relative[\s\S]*?isolation:\s*isolate[\s\S]*?z-index:\s*var\(--codex-z-page\)/,
  );

  assert.match(
    layers,
    /body:not\(:has\(\.home-gateway\)\) \.codex-main-pane > main > \.content-panel,[\s\S]*?background-color:\s*var\(--codex-page-bg\)/,
  );

  assert.match(layers, /\.codex-page-deck\s*\{[\s\S]*?z-index:\s*var\(--codex-z-surface\)/);
  assert.match(layers, /\.ion-codex-footer\s*\{[\s\S]*?z-index:\s*var\(--codex-z-underlay\)/);
});

test('the footer keeps the proven literal overlap while using the shared underlay tier', () => {
  assert.match(footer, /\.ion-codex-footer\s*\{[\s\S]*?z-index:\s*-1/);
  assert.match(footer, /\.ion-codex-footer\s*\{[\s\S]*?margin-top:\s*-20px/);
  assert.doesNotMatch(footer, /margin-top:\s*calc\(/);
});

test('timeline z-indexes remain local ordering values inside the page stacking surface', () => {
  assert.match(timeline, /\.vis-background\s*\{[\s\S]*?z-index:\s*0\s*!important/);
  assert.match(timeline, /\.vis-foreground\s*\{[\s\S]*?z-index:\s*2\s*!important/);
  assert.match(timeline, /\.vc-timeline-item\s*\{[\s\S]*?z-index:\s*3\s*!important/);
});
