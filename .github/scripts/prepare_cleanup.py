from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = Path(__file__).with_name('apply_cleanup.py')
content = path.read_text(encoding='utf-8')
old = r'''replace_once(
    "Site/scripts/sync-public-notes.mjs",
    "  const rel = path.relative(sourceDir, file).replace(/\\\\/g, '/').replace(/\\.(md|mdx)$/i, '');",
    "  const rel = toPosixPath(path.relative(sourceDir, file)).replace(/\\.(md|mdx)$/i, '');",
)
'''
new = r'''replace_once(
    "Site/scripts/sync-public-notes.mjs",
    dedent(r\'\'\'
    function slugFromFile(file) {
      const rel = path.relative(sourceDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
      return rel.split('/').map((segment) => cleanSlug(segment).replace(/\s+/g, '-')).join('/');
    }
    \'\'\'),
    dedent(r\'\'\'
    function slugFromFile(file) {
      const rel = toPosixPath(path.relative(sourceDir, file)).replace(/\.(md|mdx)$/i, '');
      return rel.split('/').map((segment) => cleanSlug(segment).replace(/\s+/g, '-')).join('/');
    }
    \'\'\'),
)
'''.replace("r\\'\\'\\'", "r'''").replace("\\'\\'\\'", "'''")
count = content.count(old)
if count != 1:
    raise RuntimeError(f'Expected one ambiguous sync-public-notes replacement block, found {count}')
path.write_text(content.replace(old, new, 1), encoding='utf-8')

test_path = root / 'Site/tests/degel-system-assets.test.mjs'
test_content = test_path.read_text(encoding='utf-8')
old_test = r'''test('placeholder materialization preserves replacement artwork', async () => {
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
});'''
new_test = r'''test('Degel placeholder artwork is committed as valid WebP assets', async () => {
  for (const filename of [
    'degel.webp',
    'crucibus.webp',
    'errack.webp',
    'eye-of-vordr.webp',
    'eye-of-visi.webp',
    'the-shards.webp',
  ]) {
    const asset = await readFile(
      new URL(`../public/assets/images/degel-system/${filename}`, import.meta.url),
    );
    assert.ok(asset.length > 12, `${filename} should not be empty`);
    assert.equal(asset.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(asset.subarray(8, 12).toString('ascii'), 'WEBP');
  }
});'''
count = test_content.count(old_test)
if count != 1:
    raise RuntimeError(f'Expected one obsolete Degel materialization test, found {count}')
test_path.write_text(test_content.replace(old_test, new_test, 1), encoding='utf-8')

print('Prepared cleanup migration script.')
