import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformCodexFormatting } from '../scripts/codex-formatting.mjs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the borderless shell override loads after layout and before accessibility rules', () => {
  const config = read('../astro.config.mjs');
  const layoutIndex = config.indexOf("'./src/styles/layout.css'");
  const borderlessIndex = config.indexOf("'./src/styles/borderless-shell.css'");
  const accessibilityIndex = config.indexOf("'./src/styles/a11y.css'");

  assert.ok(layoutIndex >= 0, 'layout.css must remain registered');
  assert.ok(borderlessIndex > layoutIndex, 'borderless-shell.css must override structural styles');
  assert.ok(accessibilityIndex > borderlessIndex, 'a11y.css must retain the final accessibility pass');
});

test('structural borders are removed without flattening article callouts', () => {
  const css = read('../src/styles/borderless-shell.css');

  assert.match(css, /border-width:\s*0 !important/);
  assert.match(css, /\.sl-markdown-content blockquote \*/);
  assert.match(css, /\.sl-markdown-content \.starlight-aside \*/);
  assert.match(css, /\.sl-markdown-content \.codex-warning \*/);
  assert.match(css, /@media \(forced-colors: active\)/);
});

test('the Okse Dominion source uses responsive two-column authoring blocks', () => {
  const source = read('../../Vault/Lore/Degel System/Okse Dominion.md');
  const columnBlocks = source.match(/^\[cols:1-1 gap=xl align=start\]$/gm) ?? [];

  assert.ok(columnBlocks.length >= 4, 'expected multiple editorial two-column sections');
  assert.match(source, /## History[\s\S]*\[cols:1-1 gap=xl align=start\]/);
  assert.match(source, /### Oil: The Black Gold of the Dominion[\s\S]*\[cols:1-1 gap=xl align=start\]/);

  const compiled = transformCodexFormatting(source, { jsx: true });
  assert.match(compiled, /className="[^"]*\bcx-cols\b[^"]*"/);
  assert.match(compiled, /"--cx-columns":"1fr 1fr"/);
});
