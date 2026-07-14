import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Starlight Pagefind and the owned header are explicitly enabled', () => {
  const config = read('../astro.config.mjs');

  assert.match(config, /pagefind:\s*true/);
  assert.match(config, /Header:\s*'\.\/src\/components\/CodexHeader\.astro'/);
});

test('the Codex header renders native search and theme controls', () => {
  const header = read('../src/components/CodexHeader.astro');

  assert.match(header, /import Search from 'virtual:starlight\/components\/Search'/);
  assert.match(header, /import ThemeSelect from 'virtual:starlight\/components\/ThemeSelect'/);
  assert.match(header, /shouldRenderSearch/);
  assert.match(header, /<Search \/>/);
  assert.match(header, /<ThemeSelect \/>/);
  assert.match(header, /data-codex-header-search/);
  assert.match(header, /data-codex-header-controls/);
});

test('the Telescope plugin retains its stable desktop header mount', () => {
  const config = read('../astro.config.mjs');
  const header = read('../src/components/CodexHeader.astro');

  assert.match(config, /starlightTelescope\(\)/);
  assert.match(header, /class="right-group codex-header-controls print:hidden"/);
  assert.match(header, /Starlight Telescope injects its custom element into `\.right-group`/);
  assert.match(
    header,
    /@media \(min-width: 50rem\)[\s\S]*\.codex-header-controls\s*\{[\s\S]*display:\s*flex/
  );
});
