import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { degelSystemMap } from '../src/data/degel-system-map.mjs';

test('Degel map objects use lightweight WebP placeholder paths', () => {
  for (const object of degelSystemMap.objects) {
    assert.match(
      object.image,
      /^\/assets\/images\/degel-system\/[a-z0-9-]+\.webp$/,
      `${object.slug} should use a Degel System WebP asset`,
    );
  }
});

test('The Shards are Errack ring fortresses rather than an asteroid belt', () => {
  const errack = degelSystemMap.objects.find(({ slug }) => slug === 'degel-system/errack');
  const shards = degelSystemMap.objects.find(({ slug }) => slug === 'degel-system/the-shards');

  assert.ok(errack);
  assert.ok(shards);
  assert.equal(shards.kind, 'Planetary ring fortresses');
  assert.equal(shards.visual, 'ring');
  assert.equal(shards.x, errack.x);
  assert.equal(shards.y, errack.y);
  assert.equal(shards.mobileX, errack.mobileX);
  assert.equal(shards.mobileY, errack.mobileY);
});

test('placeholder materialization preserves replacement artwork', async () => {
  const materializer = await readFile(
    new URL('../scripts/materialize-degel-placeholders.mjs', import.meta.url),
    'utf8',
  );

  assert.match(materializer, /fs\.pathExists\(outputPath\)/);
  assert.match(materializer, /Buffer\.from\(base64, 'base64'\)/);

  for (const filename of [
    'degel.webp',
    'crucibus.webp',
    'errack.webp',
    'eye-of-vordr.webp',
    'eye-of-visi.webp',
    'the-shards.webp',
  ]) {
    assert.match(materializer, new RegExp(filename.replace('.', '\\.')));
  }
});
