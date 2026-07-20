import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('webmentions are omitted from the home landing page only', () => {
  const footer = read('../src/components/StarlightFooter.astro');

  assert.match(footer, /const isHomepage = Astro\.url\.pathname === '\/'/);
  assert.match(footer, /\{!isHomepage && <Webmentions \/>\}/);
  assert.doesNotMatch(footer, /^\s*<Webmentions \/>\s*$/m);
});
