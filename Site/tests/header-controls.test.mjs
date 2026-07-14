import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Starlight Pagefind and the owned header are explicitly enabled', () => {
  const config = read('../astro.config.mjs');

  assert.match(config, /pagefind:\s*true/);
  assert.match(config, /Header:\s*'\.\/src\/components\/CodexHeader\.astro'/);
});

test('the Codex header renders the native search field and owned theme toggle', () => {
  const header = read('../src/components/CodexHeader.astro');
  const themeToggle = read('../src/components/CodexThemeToggle.astro');

  assert.match(header, /import Search from 'virtual:starlight\/components\/Search'/);
  assert.match(header, /import CodexThemeToggle from '\.\/CodexThemeToggle\.astro'/);
  assert.match(header, /shouldRenderSearch/);
  assert.match(header, /<Search \/>/);
  assert.match(header, /<CodexThemeToggle \/>/);
  assert.match(header, /data-codex-header-search/);
  assert.match(header, /data-codex-header-controls/);
  assert.match(header, /\.codex-header-search button\[data-open-modal\]/);
  assert.match(header, /min-width:\s*14rem/);

  assert.match(themeToggle, /data-codex-theme-toggle/);
  assert.match(themeToggle, /localStorage\.setItem\(storageKey, nextTheme\)/);
  assert.match(themeToggle, /document\.documentElement\.dataset\.theme = nextTheme/);
});

test('the Telescope plugin retains a visible top-ribbon mount', () => {
  const config = read('../astro.config.mjs');
  const header = read('../src/components/CodexHeader.astro');

  assert.match(config, /starlightTelescope\(\)/);
  assert.match(header, /class="right-group codex-header-controls print:hidden"/);
  assert.match(header, /Starlight Telescope injects its custom element into `\.right-group`/);
  assert.match(header, /\.codex-header telescope-search/);
  assert.match(header, /\.codex-header \.telescope__trigger-btn/);
});

test('theme controls are not duplicated inside the sidebar', () => {
  const sidebar = read('../src/components/IonSidebar.astro');

  assert.doesNotMatch(sidebar, /MobileMenuFooter/);
  assert.doesNotMatch(sidebar, /ThemeSelect/);
  assert.doesNotMatch(sidebar, /starlight-theme-select/);
});
