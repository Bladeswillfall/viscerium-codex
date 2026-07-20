import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('article headings use the shared Era Spine hierarchy without new colours', () => {
  const typography = read('../src/styles/typography.css');
  const start = typography.indexOf('In-article Era Spine hierarchy');
  const end = typography.indexOf('/* Compose headings', start);
  const hierarchy = typography.slice(start, end);

  assert.ok(start >= 0 && end > start, 'expected a dedicated Era Spine hierarchy');
  assert.match(hierarchy, /\.sl-markdown-content h1\s*\{[\s\S]*font-size:\s*clamp/);
  assert.match(hierarchy, /\.sl-markdown-content h2\s*\{[\s\S]*padding-inline-start:\s*1rem[\s\S]*font-family:\s*var\(--vc-font-display\)/);
  assert.match(hierarchy, /\.sl-markdown-content h2::before\s*\{[\s\S]*background:\s*var\(--era-heading-accent, var\(--sl-color-accent-high\)\)[\s\S]*clip-path:\s*polygon/);
  assert.match(hierarchy, /\.sl-markdown-content h3\s*\{[\s\S]*color:\s*var\(--era-heading-accent, var\(--sl-color-accent-high\)\)[\s\S]*text-transform:\s*uppercase/);
  assert.match(hierarchy, /\.sl-markdown-content h4\s*\{[\s\S]*font-family:\s*var\(--vc-font-body\)[\s\S]*font-style:\s*italic/);
  assert.match(hierarchy, /\.sl-markdown-content h5\s*\{[\s\S]*font-family:\s*var\(--vc-font-ui\)[\s\S]*text-transform:\s*uppercase/);
  assert.match(hierarchy, /\.sl-markdown-content h6\s*\{[\s\S]*color:\s*var\(--sl-color-gray-4\)/);
  assert.doesNotMatch(hierarchy, /#[\da-f]{3,8}|rgb\(|hsl\(|oklch\(|color-mix\(/i);
});

test('era styles provide existing accents without restoring the old underline or ornament', () => {
  const eraStyles = read('../src/styles/era-styles.css');

  assert.match(eraStyles, /--era-heading-accent:\s*var\(--era-e1-heading\)/);
  assert.match(eraStyles, /--era-heading-accent:\s*var\(--era-e2-heading\)/);
  assert.match(eraStyles, /--era-heading-accent:\s*var\(--era-e3-heading\)/);
  assert.match(eraStyles, /--era-heading-accent:\s*var\(--era-e4-heading\)/);
  assert.match(eraStyles, /:is\(h2, h3\) > \.codex-heading-icon/);
  assert.doesNotMatch(eraStyles, /border-block-end|era-heading-ornament/);
});
