import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const representativePages = {
  CITADEL: {
    file: '../src/content/docs/eras/citadel/events/the-galdyr-compact.md',
    style: 'e1',
  },
  SMOG: {
    file: '../src/content/docs/eras/smog/events/the-grey-armistice.md',
    style: 'e2',
  },
  NEARSIGHT: {
    file: '../src/content/docs/eras/nearsight/events/formation-of-astu.md',
    style: 'e3',
  },
  ENTROPY: {
    file: '../src/content/docs/eras/entropy/events/the-pathfinder-exodus.md',
    style: 'e4',
  },
};

test('the content sync maps era folders to generated eraStyle metadata', () => {
  const sync = read('../scripts/sync-public-notes.mjs');

  assert.match(sync, /\['citadel',\s*'e1'\]/);
  assert.match(sync, /\['smog',\s*'e2'\]/);
  assert.match(sync, /\['nearsight',\s*'e3'\]/);
  assert.match(sync, /\['entropy',\s*'e4'\]/);
  assert.match(sync, /setField\('eraStyle', generated\.eraStyle\)/);
  assert.match(sync, /eraStyle:\s*parsed\.data\.eraStyle/);
});

test('representative generated pages carry the hidden folder-derived eraStyle', () => {
  for (const [era, { file, style }] of Object.entries(representativePages)) {
    const page = read(file);

    assert.match(page, new RegExp(`era:\\s*${era}`), `${era} page should retain its inferred era`);
    assert.match(page, new RegExp(`eraStyle:\\s*${style}`), `${era} page should publish ${style}`);
    assert.match(page, new RegExp(`sourcePath:\\s*"Eras/${era}/`), `${era} page should originate in the matching Vault folder`);
  }
});

test('Starlight exposes generated eraStyle as a DOM data attribute', () => {
  const component = read('../src/components/CodexTwoColumnContent.astro');
  const schema = read('../src/content.config.ts');

  assert.match(schema, /eraStyle:\s*optionalString/);
  assert.match(component, /starlightRoute\.entry\.data\.eraStyle/);
  assert.match(component, /data-era-style=\{eraStyle\}/);
});

test('era palette application lives in the Codex ion layer and wins interactive link states', () => {
  const styles = read('../src/styles/era-styles.css');

  assert.doesNotMatch(styles, /@layer\s+starlight\.core/);
  assert.match(styles, /@layer\s+ion\s*\{/);
  assert.match(styles, /\[data-era-style='e1'\][\s\S]*--era-link:\s*var\(--era-e1-accent\)/);
  assert.match(styles, /\[data-era-style='e2'\][\s\S]*--era-link:\s*var\(--era-e2-accent\)/);
  assert.match(styles, /\[data-era-style='e3'\][\s\S]*--era-link:\s*var\(--era-e3-accent\)/);
  assert.match(styles, /\[data-era-style='e4'\][\s\S]*--era-link:\s*var\(--era-e4-accent\)/);
  assert.match(styles, /color:\s*var\(--era-link-hover\)\s*!important/);
});
