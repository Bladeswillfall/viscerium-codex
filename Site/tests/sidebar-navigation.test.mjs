import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('desktop sidebar collapse is owned by the clean-slate footer runtime', () => {
  const footer = read('../src/clean-slate/VisceriumFooter.astro');

  assert.match(footer, /aria-controls="starlight__sidebar"/);
  assert.match(footer, /document\.getElementById\('starlight__sidebar'\)/);
  assert.match(footer, /window\.matchMedia\('\(min-width: 800px\)'\)/);
  assert.match(footer, /root\.toggleAttribute\('data-codex-desktop-sidebar', hasDesktopSidebar\)/);
  assert.match(footer, /button\.dataset\.codexSidebarBound === 'true'/);
  assert.match(footer, /localStorage\.getItem\(storageKey\) === 'true'/);
  assert.match(footer, /localStorage\.setItem\(storageKey, String\(collapsed\)\)/);
  assert.match(footer, /visibility:\s*hidden/);
  assert.match(footer, /transform:\s*translateX\(-110%\)/);
  assert.match(footer, /pointer-events:\s*none/);
});

test('homepage opts into navigation and clears the open desktop rail', () => {
  const homepage = read('../src/pages/index.astro');
  const footer = read('../src/clean-slate/VisceriumFooter.astro');

  assert.match(homepage, /hasSidebar=\{true\}/);
  assert.match(homepage, /class="vc-home"/);
  assert.match(footer, /\.main-frame:has\(\.vc-home\)/);
  assert.match(footer, /padding-inline-start:\s*var\(--codex-sidebar-overlay-width\) !important/);
});

test('mobile page table of contents remains owned by the responsive runtime', () => {
  const footer = read('../src/clean-slate/VisceriumFooter.astro');

  assert.match(footer, /document\.getElementById\('starlight__on-this-page--mobile'\)/);
  assert.match(footer, /summary\?\.closest\('nav'\)/);
  assert.match(footer, /navigation\.style\.setProperty\('display', 'none', 'important'\)/);
  assert.match(footer, /navigation\.style\.removeProperty\('display'\)/);
  assert.match(footer, /new MutationObserver\(\(\) => runtime\.syncMobileToc\(\)\)/);
  assert.match(footer, /runtime\.mobileTocObserver\.observe\(document\.body, \{ childList: true, subtree: true \}\)/);
});

test('the clean-slate sidebar control avoids pill and glow defaults', () => {
  const footer = read('../src/clean-slate/VisceriumFooter.astro');

  assert.match(footer, /\.codex-sidebar-toggle\s*\{[\s\S]*border-radius:\s*0/);
  assert.match(footer, /\.codex-sidebar-toggle\s*\{[\s\S]*box-shadow:\s*none/);
  assert.doesNotMatch(footer, /border-radius:\s*999px/);
});
