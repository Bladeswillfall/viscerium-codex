import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('normal Codex pages remove the inherited main bottom padding without touching the homepage', () => {
  const footer = read('../src/components/StarlightFooter.astro');

  assert.match(
    footer,
    /:global\(body:not\(:has\(\.home-gateway\)\) \.codex-main-pane > main\)\s*\{[\s\S]*?padding-block-end:\s*0/,
  );
});

test('the Codex footer spans the viewport and owns its internal padding token', () => {
  const footer = read('../src/components/StarlightFooter.astro');

  assert.match(footer, /--ion-codex-footer-padding:\s*1rem/);
  assert.match(footer, /\.ion-codex-footer\s*\{[\s\S]*?inline-size:\s*100vw/);
  assert.match(footer, /padding:\s*var\(--ion-codex-footer-padding\)/);
  assert.match(footer, /margin-inline:\s*calc\(50% - 50vw\)/);
  assert.match(footer, /@supports \(width:\s*100dvw\)[\s\S]*?inline-size:\s*100dvw/);
  assert.match(footer, /margin-inline:\s*calc\(50% - 50dvw\)/);
});
