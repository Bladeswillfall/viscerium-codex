import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
  const timelinePages = read('../src/styles/timeline-pages.css');

  assert.match(navigation, /html\[data-codex-desktop-sidebar\] #starlight__sidebar\s*\{/);
  assert.match(navigation, /visibility: visible/);
  assert.match(navigation, /html\[data-codex-desktop-sidebar\]\.codex-sidebar-collapsed #starlight__sidebar\s*\{/);
  assert.match(navigation, /visibility: hidden/);
  assert.match(navigation, /html:not\(\[data-codex-desktop-sidebar\]\) \.codex-sidebar-toggle/);
  assert.doesNotMatch(navigation, /:is\(nav\.sidebar-print-hide, \.sidebar-pane\)/);
  assert.doesNotMatch(
    navigation,
    /html\[data-codex-desktop-sidebar\]\.codex-sidebar-collapsed \.main-frame\s*\{[\s\S]*?padding-inline-start:\s*0/,
  );
  assert.match(
    timelinePages,
    /\.main-frame:has\(> \.codex-timeline-page\)\s*\{[\s\S]*?padding-inline:\s*clamp\(1rem, 2\.4vw, 3rem\)/,
  );
  assert.match(navigation, /pointer-events: none/);
  assert.match(navigation, /transform: translateX\(-110%\)/);
});

test('desktop sidebar toggle lives in the sticky header while the sidebar runtime rebinds safely', () => {
  const header = read('../src/components/CodexHeader.astro');
  const footer = read('../src/components/StarlightFooter.astro');
  const headerControls = read('../src/styles/header-controls.css');

  assert.match(header, /data-codex-sidebar-toggle/);
  assert.match(header, /aria-controls="starlight__sidebar"/);
  assert.match(header, /aria-expanded="false"/);
  assert.match(header, /aria-label="Show sidebar"/);
  assert.doesNotMatch(footer, /<button[\s\S]*?data-codex-sidebar-toggle/);
  assert.match(footer, /document\.querySelector\('\[data-codex-sidebar-toggle\]'\)/);
  assert.match(headerControls, /\.codex-header \.codex-sidebar-toggle\s*\{[\s\S]*?position:\s*static/);
  assert.match(headerControls, /\.codex-header \.title-wrapper\s*\{[\s\S]*?gap:\s*\.4rem/);
  assert.match(headerControls, /html\[data-codex-wide-header\] header\.header\s*\{[\s\S]*?position:\s*sticky !important/);
  assert.match(headerControls, /html\[data-codex-wide-header\] \.main-frame\s*\{[\s\S]*?padding-top:\s*var\(--sl-mobile-toc-height, 0rem\)/);

  assert.match(footer, /document\.getElementById\('starlight__sidebar'\)/);
  assert.match(footer, /window\.matchMedia\('\(min-width: 800px\)'\)/);
  assert.match(footer, /root\.toggleAttribute\('data-codex-desktop-sidebar', hasDesktopSidebar\)/);
  assert.match(footer, /document\.addEventListener\('astro:page-load', \(\) => runtime\.sync\(true\)\)/);
  assert.match(footer, /desktopQuery\.addEventListener\('change', \(\) => runtime\.sync\(true\)\)/);
  assert.match(footer, /setCollapsed\(button, resetCollapsed \|\| root\.classList\.contains\('codex-sidebar-collapsed'\)\)/);
  assert.match(footer, /runtime\.sync\(true\)/);
  assert.match(footer, /button\.dataset\.codexSidebarBound === 'true'/);
  assert.doesNotMatch(footer, /localStorage|viscerium-sidebar-collapsed/);
  assert.match(footer, /html:not\(\[data-codex-desktop-sidebar\]\) #starlight__sidebar/);
});

test('mobile header uses thresholded fixed reveal and hide states', () => {
  const header = read('../src/components/CodexHeader.astro');
  const headerControls = read('../src/styles/header-controls.css');

  assert.match(header, /const mobileRevealDistance = 64/);
  assert.match(header, /const mobileHideDistance = 36/);
  assert.match(header, /root\.toggleAttribute\('data-codex-mobile-header', !isDesktop\)/);
  assert.match(header, /root\.toggleAttribute\('data-codex-mobile-header-hidden', hidden && !desktopQuery\.matches\)/);
  assert.match(header, /direction !== runtime\.mobileScrollDirection/);
  assert.match(header, /runtime\.mobileScrollDistance \+= Math\.abs\(delta\)/);
  assert.match(header, /window\.addEventListener\('scroll', runtime\.onMobileScroll, \{ passive: true \}\)/);

  assert.match(headerControls, /html\[data-codex-mobile-header\] header\.header\s*\{[\s\S]*?position:\s*fixed !important/);
  assert.match(headerControls, /transition:\s*transform \.28s cubic-bezier\(\.22, \.61, \.36, 1\)/);
  assert.match(headerControls, /html\[data-codex-mobile-header\]\[data-codex-mobile-header-hidden\] header\.header\s*\{[\s\S]*?translateY\(calc\(-100% - 1px\)\)/);
  assert.doesNotMatch(headerControls, /html\[data-codex-mobile-header\] \.page\s*\{/);
});

test('mobile table of contents follows the auto-hiding header without changing its functionality', () => {
  const headerControls = read('../src/styles/header-controls.css');

  assert.match(
    headerControls,
    /html\[data-codex-mobile-header\] mobile-starlight-toc > nav\s*\{[\s\S]*?top:\s*calc\(var\(--sl-nav-height, 3\.5rem\) - 1px\) !important/,
  );
  assert.match(
    headerControls,
    /html\[data-codex-mobile-header\]\[data-codex-mobile-header-hidden\] mobile-starlight-toc > nav\s*\{[\s\S]*?top:\s*0 !important/,
  );
  assert.match(
    headerControls,
    /mobile-starlight-toc > nav\s*\{[\s\S]*?transition:\s*top \.28s cubic-bezier\(\.22, \.61, \.36, 1\)/,
  );
});

test('mobile sidebar controls follow the auto-hiding header without being covered', () => {
  const headerControls = read('../src/styles/header-controls.css');

  assert.match(
    headerControls,
    /html\[data-codex-mobile-header\] \.sidebar-pane::before\s*\{[\s\S]*?top:\s*var\(--sl-nav-height, 3\.5rem\)/,
  );
  assert.match(
    headerControls,
    /html\[data-codex-mobile-header\]\[data-codex-mobile-header-hidden\] \.sidebar-pane::before\s*\{[\s\S]*?top:\s*0/,
  );
});

test('retired sidebar compatibility artifacts stay absent', () => {
  const retired = [
    '../src/components/CodexSidebar.astro',
    '../src/components/CodexSidebarToggle.astro',
    '../src/components/SidebarMenuControls.astro',
    '../src/styles/sidebar.css',
    '../src/styles/sidebar-nav.css',
    '../src/styles/sidebar-controls.css',
    '../src/styles/sidebar-icons.css',
  ];

  for (const path of retired) assert.equal(existsSync(new URL(path, import.meta.url)), false, `${path} should stay retired`);
});
