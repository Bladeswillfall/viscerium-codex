import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Starlight Pagefind and the clean-slate shell are explicitly enabled', () => {
  const config = read('../astro.config.mjs');

  assert.match(config, /pagefind:\s*true/);
  assert.match(config, /Header:\s*'\.\/src\/clean-slate\/VisceriumHeader\.astro'/);
  assert.match(config, /Footer:\s*'\.\/src\/clean-slate\/VisceriumFooter\.astro'/);
  assert.match(config, /'\.\/src\/clean-slate\/viscerium\.css'/);
});

test('the clean-slate header keeps native search and Telescope integration contracts', () => {
  const header = read('../src/clean-slate/VisceriumHeader.astro');

  assert.match(header, /import Search from 'virtual:starlight\/components\/Search'/);
  assert.match(header, /shouldRenderSearch/);
  assert.match(header, /<Search \/>/);
  assert.match(header, /data-vc-header-search/);
  assert.match(header, /data-codex-header-search/);
  assert.match(header, /class="right-group vc-header__controls codex-header-controls print:hidden"/);
  assert.match(header, /Starlight Telescope injects its trigger into `\.right-group`/);
  assert.doesNotMatch(header, /SocialIcons/);
  assert.doesNotMatch(header, /href=.*github\.com/i);
});

test('the aperture theme control is functional without the stock sun-moon treatment', () => {
  const header = read('../src/clean-slate/VisceriumHeader.astro');

  assert.match(header, /data-vc-theme-switch/);
  assert.match(header, /data-codex-theme-toggle/);
  assert.match(header, /vc-theme-switch__aperture/);
  assert.match(header, /localStorage\.setItem\(storageKey, nextTheme\)/);
  assert.match(header, /document\.documentElement\.dataset\.theme = nextTheme/);
  assert.match(header, /document\.addEventListener\('astro:page-load', runtime\.bind\)/);
  assert.doesNotMatch(header, /theme-icon--sun/);
  assert.doesNotMatch(header, /theme-icon--moon/);
  assert.doesNotMatch(header, /linear-gradient/);
});

test('the header exposes compatibility type tokens for specialist Codex features', () => {
  const header = read('../src/clean-slate/VisceriumHeader.astro');

  assert.match(header, /--vc-font-display:\s*var\(--vc-display\)/);
  assert.match(header, /--vc-font-body:\s*var\(--vc-body\)/);
  assert.match(header, /--vc-font-ui:\s*var\(--vc-ui\)/);
  assert.match(header, /--vc-font-mono:\s*var\(--vc-data\)/);
});
