import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('desktop sidebar overlay uses an explicit unlayered state', () => {
  const navigation = read('../src/styles/navigation.css');

  assert.match(navigation, /html\[data-codex-desktop-sidebar\] #starlight__sidebar\s*\{/);
  assert.match(navigation, /visibility: visible/);
  assert.match(navigation, /html\[data-codex-desktop-sidebar\]\.codex-sidebar-collapsed #starlight__sidebar\s*\{/);
  assert.match(navigation, /visibility: hidden/);
  assert.match(navigation, /html:not\(\[data-codex-desktop-sidebar\]\) \.codex-sidebar-toggle/);
  assert.doesNotMatch(navigation, /:is\(nav\.sidebar-print-hide, \.sidebar-pane\)/);
  assert.match(navigation, /pointer-events: none/);
  assert.match(navigation, /transform: translateX\(-110%\)/);
});

test('sidebar toggle rebinds safely and tracks the desktop layout', () => {
  const footer = read('../src/components/StarlightFooter.astro');

  assert.match(footer, /aria-controls="starlight__sidebar"/);
  assert.match(footer, /document\.getElementById\('starlight__sidebar'\)/);
  assert.match(footer, /window\.matchMedia\('\(min-width: 800px\)'\)/);
  assert.match(footer, /root\.toggleAttribute\('data-codex-desktop-sidebar', hasDesktopSidebar\)/);
  assert.match(footer, /document\.addEventListener\('astro:page-load', runtime\.sync\)/);
  assert.match(footer, /desktopQuery\.addEventListener\('change', runtime\.sync\)/);
  assert.match(footer, /button\.dataset\.codexSidebarBound === 'true'/);
  assert.match(footer, /localStorage\.getItem\(storageKey\) === 'true'/);
  assert.match(footer, /localStorage\.setItem\(storageKey, String\(collapsed\)\)/);
});
