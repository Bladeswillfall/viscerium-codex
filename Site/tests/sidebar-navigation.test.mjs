import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSidebar } from '../sidebar.mjs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('sidebar lists folders before articles at every level', async () => {
  const assertFoldersFirst = (entries) => {
    let foundArticle = false;

    for (const entry of entries) {
      if (entry.items) {
        assert.equal(foundArticle, false, `${entry.label} appears after an article`);
        assertFoldersFirst(entry.items);
      } else {
        foundArticle = true;
      }
    }
  };

  assertFoldersFirst(await buildSidebar());
});

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

test('sidebar toggle defaults closed, rebinds safely and tracks the desktop layout', () => {
  const footer = read('../src/components/StarlightFooter.astro');

  assert.match(footer, /aria-controls="starlight__sidebar"/);
  assert.match(footer, /aria-expanded="false"/);
  assert.match(footer, /aria-label="Show sidebar"/);
  assert.match(footer, /<span aria-hidden="true">☰<\/span>/);
  assert.match(footer, /document\.getElementById\('starlight__sidebar'\)/);
  assert.match(footer, /window\.matchMedia\('\(min-width: 800px\)'\)/);
  assert.match(footer, /root\.toggleAttribute\('data-codex-desktop-sidebar', hasDesktopSidebar\)/);
  assert.match(footer, /document\.addEventListener\('astro:page-load', runtime\.sync\)/);
  assert.match(footer, /desktopQuery\.addEventListener\('change', runtime\.sync\)/);
  assert.match(footer, /button\.dataset\.codexSidebarBound === 'true'/);
  assert.match(footer, /const stored = localStorage\.getItem\(storageKey\)/);
  assert.match(footer, /return stored === null \? true : stored === 'true'/);
  assert.match(footer, /catch \{\s*return true;\s*\}/);
  assert.match(footer, /localStorage\.setItem\(storageKey, String\(collapsed\)\)/);
});

test('homepage opts into the sidebar and preserves its rail clearance', () => {
  const homepage = read('../src/pages/index.astro');

  assert.match(homepage, /hasSidebar=\{true\}/);
  assert.match(homepage, /html\[data-codex-desktop-sidebar\]:not\(\.codex-sidebar-collapsed\) \.main-frame:has\(\.home-gateway\)/);
  assert.match(homepage, /padding-inline-start: var\(--codex-sidebar-overlay-width\) !important/);
});

test('mobile page table of contents is owned by the responsive runtime', () => {
  const footer = read('../src/components/StarlightFooter.astro');
  const navigation = read('../src/styles/navigation.css');

  assert.match(navigation, /@media \(min-width: 800px\)/);
  assert.match(navigation, /--sl-mobile-toc-height: 0rem/);
  assert.match(footer, /document\.getElementById\('starlight__on-this-page--mobile'\)/);
  assert.match(footer, /summary\?\.closest\('nav'\)/);
  assert.match(footer, /navigation\.style\.setProperty\('display', 'none', 'important'\)/);
  assert.match(footer, /navigation\.style\.removeProperty\('display'\)/);
  assert.match(footer, /new MutationObserver\(\(\) => runtime\.syncMobileToc\(\)\)/);
  assert.match(footer, /runtime\.mobileTocObserver\.observe\(document\.body, \{ childList: true, subtree: true \}\)/);
});
