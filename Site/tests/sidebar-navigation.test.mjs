import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('desktop sidebar overlay targets one stable Starlight root', () => {
  const navigation = read('../src/styles/navigation.css');

  assert.match(navigation, /#starlight__sidebar\s*\{/);
  assert.match(navigation, /html\.codex-sidebar-collapsed #starlight__sidebar\s*\{/);
  assert.match(navigation, /#starlight__sidebar \.sidebar-pane\s*\{/);
  assert.doesNotMatch(navigation, /:is\(nav\.sidebar-print-hide, \.sidebar-pane\)/);
  assert.match(navigation, /pointer-events: none !important/);
  assert.match(navigation, /transform: translateX\(-110%\) !important/);
});

test('sidebar toggle rebinds safely after Astro page navigation', () => {
  const footer = read('../src/components/StarlightFooter.astro');

  assert.match(footer, /aria-controls="starlight__sidebar"/);
  assert.match(footer, /document\.getElementById\('starlight__sidebar'\)/);
  assert.match(footer, /document\.addEventListener\('astro:page-load', runtime\.sync\)/);
  assert.match(footer, /button\.dataset\.codexSidebarBound === 'true'/);
  assert.match(footer, /localStorage\.getItem\(storageKey\) === 'true'/);
  assert.match(footer, /localStorage\.setItem\(storageKey, String\(collapsed\)\)/);
});
