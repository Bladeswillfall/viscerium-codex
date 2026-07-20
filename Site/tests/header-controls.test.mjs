import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Starlight Pagefind and the owned header are explicitly enabled', () => {
  const config = read('../astro.config.mjs');

  assert.match(config, /pagefind:\s*true/);
  assert.match(config, /Header:\s*'\.\/src\/components\/CodexHeader\.astro'/);
  assert.match(config, /'\.\/src\/styles\/header-controls\.css'/);
});

test('the Codex header renders Starlight search and theme controls', () => {
  const header = read('../src/components/CodexHeader.astro');
  const headerCss = read('../src/styles/header-controls.css');

  assert.match(header, /import Search from 'virtual:starlight\/components\/Search'/);
  assert.match(header, /import ThemeSelect from 'virtual:starlight\/components\/ThemeSelect'/);
  assert.match(header, /shouldRenderSearch/);
  assert.match(header, /<Search \/>/);
  assert.match(header, /<ThemeSelect \/>/);
  assert.match(header, /data-codex-header-search/);
  assert.match(header, /data-codex-header-controls/);

  assert.match(header, /window\.matchMedia\('\(min-width: 800px\)'\)/);
  assert.match(header, /root\.toggleAttribute\('data-codex-wide-header', desktopQuery\.matches\)/);
  assert.match(header, /desktopQuery\.addEventListener\('change', runtime\.sync\)/);
  assert.match(header, /document\.addEventListener\('astro:page-load', runtime\.sync\)/);

  assert.match(headerCss, /\.codex-header-search button\[data-open-modal\]/);
  assert.match(headerCss, /html\[data-codex-wide-header\] \.codex-header-search/);
  assert.match(headerCss, /min-width:\s*14rem !important/);
  assert.match(headerCss, /> span\s*\{[\s\S]*display:\s*block !important/);
  assert.match(headerCss, /> kbd\s*\{[\s\S]*display:\s*flex !important/);
  assert.doesNotMatch(headerCss, /@media/);

  assert.match(headerCss, /\.codex-theme-control select/);
});

test('the Telescope plugin retains a visible top-ribbon mount', () => {
  const config = read('../astro.config.mjs');
  const header = read('../src/components/CodexHeader.astro');
  const headerCss = read('../src/styles/header-controls.css');

  assert.match(config, /starlightTelescope\(\)/);
  assert.match(header, /class="right-group codex-header-controls print:hidden"/);
  assert.match(header, /Starlight Telescope injects its custom element into `\.right-group`/);
  assert.match(headerCss, /\.codex-header telescope-search/);
  assert.match(headerCss, /\.codex-header \.telescope__trigger-btn/);
});

test('the top ribbon is visually flat, centred and free of GitHub branding', () => {
  const header = read('../src/components/CodexHeader.astro');
  const headerCss = read('../src/styles/header-controls.css');

  assert.doesNotMatch(header, /SocialIcons/);
  assert.doesNotMatch(header, /social-icons/);
  assert.doesNotMatch(headerCss, /linear-gradient/);
  assert.match(
    headerCss,
    /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(16rem,\s*34rem\)\s+minmax\(0,\s*1fr\)/
  );
  assert.match(headerCss, /\.codex-header-search\s*\{[\s\S]*justify-self:\s*center/);
  assert.match(headerCss, /\.codex-header-controls\s*\{[\s\S]*justify-self:\s*end/);
});

test('the complete header ribbon is borderless without removing focus indicators', () => {
  const headerCss = read('../src/styles/header-controls.css');

  assert.match(
    headerCss,
    /header\.header,[\s\S]*\.codex-header \*::after\s*\{[\s\S]*border:\s*0 !important;/
  );
  assert.doesNotMatch(headerCss, /border-color\s*:/);
  assert.match(headerCss, /:focus-visible[\s\S]*outline:\s*2px solid/);
});

test('theme controls are not duplicated inside the sidebar', () => {
  const sidebar = read('../src/components/IonSidebar.astro');

  assert.doesNotMatch(sidebar, /MobileMenuFooter/);
  assert.doesNotMatch(sidebar, /ThemeSelect/);
  assert.doesNotMatch(sidebar, /starlight-theme-select/);
});
