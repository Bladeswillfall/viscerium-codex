import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const footer = read('../src/components/StarlightFooter.astro');
const layers = read('../src/styles/ion-layers.css');

test('normal Codex pages remove the inherited main bottom padding without touching the homepage', () => {
  assert.match(
    footer,
    /:global\(body:not\(:has\(\.home-gateway\)\) \.codex-main-pane > main\)\s*\{[\s\S]*?padding-block-end:\s*0/,
  );
});

test('article metadata stays on a raised deck while the navigation rail is a separate footer', () => {
  const deckStart = footer.indexOf('<div class="codex-page-deck">');
  const articleFooterStart = footer.indexOf('<div class="codex-site-footer sl-flex">');
  const revealFooterStart = footer.indexOf('<footer class="ion-codex-footer">');

  assert.ok(deckStart >= 0, 'expected a raised page-deck wrapper');
  assert.ok(articleFooterStart > deckStart, 'article metadata should remain inside the page deck');
  assert.ok(revealFooterStart > articleFooterStart, 'the reveal footer should follow the article deck');
  assert.match(footer, /\.codex-page-deck\s*\{[\s\S]*?position:\s*relative[\s\S]*?z-index:\s*2/);
  assert.match(footer, /\.codex-page-deck\s*\{[\s\S]*?background:\s*transparent/);
  assert.doesNotMatch(footer, /\.codex-page-deck\s*\{[\s\S]*?border-radius:/);
  assert.doesNotMatch(footer, /\.codex-page-deck\s*\{[\s\S]*?box-shadow:/);
});

test('the full raised deck surface follows the Codex query container rather than the viewport', () => {
  assert.match(
    layers,
    /body:not\(:has\(\.home-gateway\)\) \.codex-page-deck::before\s*\{[\s\S]*?inset-block:\s*0[\s\S]*?inset-inline-start:\s*0[\s\S]*?inline-size:\s*100cqw[\s\S]*?border-radius:\s*0 0 1\.25rem 1\.25rem[\s\S]*?background:\s*var\(--codex-page-bg\)[\s\S]*?box-shadow:/,
  );
  assert.doesNotMatch(layers, /\.codex-page-deck::before\s*\{[\s\S]*?inline-size:\s*100(?:d)?vw/);
  assert.doesNotMatch(layers, /\.codex-page-deck::before\s*\{[\s\S]*?translateX\(-50%\)/);
});

test('the Codex navigation footer uses literal overlap geometry and the same container width', () => {
  assert.match(footer, /--ion-codex-footer-padding:\s*2rem clamp\(1\.5rem, 3vw, 2\.125rem\) 1\.25rem/);
  assert.match(footer, /\.ion-codex-footer\s*\{[\s\S]*?position:\s*sticky[\s\S]*?bottom:\s*0[\s\S]*?z-index:\s*-1/);
  assert.match(footer, /\.ion-codex-footer\s*\{[\s\S]*?min-block-size:\s*7rem/);
  assert.match(footer, /\.ion-codex-footer\s*\{[\s\S]*?margin-top:\s*-20px/);
  assert.doesNotMatch(footer, /--ion-codex-footer-overlap/);
  assert.doesNotMatch(footer, /margin-top:\s*calc\(/);
  assert.match(footer, /\.ion-codex-footer\s*\{[\s\S]*?inline-size:\s*100cqw/);
  assert.match(footer, /padding:\s*var\(--ion-codex-footer-padding\)/);
  assert.match(footer, /margin-inline:\s*0/);
  assert.doesNotMatch(footer, /\.ion-codex-footer\s*\{[\s\S]*?inline-size:\s*100(?:d)?vw/);
  assert.doesNotMatch(footer, /margin-inline:\s*calc\(50% - 50(?:d)?vw\)/);
  assert.match(
    footer,
    /\.ion-codex-footer::before\s*\{[\s\S]*?inset-block-start:\s*2rem[\s\S]*?inline-size:\s*3\.375rem[\s\S]*?block-size:\s*0\.1875rem/,
  );
});

test('print and forced-colour modes disable the sticky reveal treatment', () => {
  assert.match(footer, /@media print, \(forced-colors: active\)[\s\S]*?\.ion-codex-footer\s*\{[\s\S]*?position:\s*static/);
  assert.match(footer, /@media print, \(forced-colors: active\)[\s\S]*?\.ion-codex-footer\s*\{[\s\S]*?z-index:\s*auto/);
  assert.match(footer, /@media print, \(forced-colors: active\)[\s\S]*?\.ion-codex-footer\s*\{[\s\S]*?margin-top:\s*0/);
  assert.match(layers, /@media print, \(forced-colors: active\)[\s\S]*?\.codex-page-deck::before\s*\{[\s\S]*?display:\s*none/);
});
