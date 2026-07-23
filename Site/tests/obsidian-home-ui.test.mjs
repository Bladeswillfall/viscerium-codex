import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const vaultRoot = path.join(repoRoot, 'Vault');

async function readText(relativePath) {
  return fs.readFile(path.join(vaultRoot, relativePath), 'utf8');
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

test('Iconic owns explorer folder icons without a competing CSS layer', async () => {
  const communityPlugins = await readJson('.obsidian/community-plugins.json');
  const appearance = await readJson('.obsidian/appearance.json');
  const iconic = await readJson('.obsidian/plugins/iconic/data.json');

  assert.ok(communityPlugins.includes('iconic'));
  assert.ok(!communityPlugins.includes('obsidian-icon-folder'));
  assert.equal(iconic.showAllFolderIcons, true);
  assert.ok(!appearance.enabledCssSnippets.includes('Folder icons'));
  await assert.rejects(fs.access(path.join(vaultRoot, '.obsidian/snippets/Folder icons.css')));
});

test('Home keeps DataviewJS lines at the code fence quote depth', async () => {
  const home = await readText('Home.md');
  const lines = home.split(/\r?\n/);
  let blocks = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^((?:>\s*)+)```dataviewjs\s*$/);
    if (!opening) continue;
    blocks += 1;
    const prefix = opening[1];
    let cursor = index + 1;
    for (; cursor < lines.length; cursor += 1) {
      if (lines[cursor] === `${prefix}\`\`\``) break;
      assert.ok(lines[cursor].startsWith(prefix), `DataviewJS line ${cursor + 1} escaped its callout depth`);
      const remainder = lines[cursor].slice(prefix.length);
      assert.ok(!remainder.startsWith('>'), `DataviewJS line ${cursor + 1} contains an accidental extra blockquote marker`);
    }
    assert.ok(cursor < lines.length, `DataviewJS block starting at line ${index + 1} is not closed`);
    index = cursor;
  }

  assert.ok(blocks >= 4, 'Home should retain its expected DataviewJS widgets');
});

test('Home grid callouts keep paired cards as siblings', async () => {
  const home = await readText('Home.md');
  const lines = home.split(/\r?\n/);

  for (const marker of ['home-writingdesk', 'home-stories', 'home-canon', 'home-glance']) {
    const index = lines.findIndex((line) => line.includes(`[!${marker}]`));
    assert.ok(index > 0, `Home should contain ${marker}`);
    assert.equal(lines[index - 1], '>', `${marker} should be separated by the outer grid quote only`);
  }
});

test('Home pinning targets whichever explorer container directly owns Home', async () => {
  const css = await readText('.obsidian/snippets/VISCERIUM Home file.css');
  assert.match(css, /:is\(\.nav-files-container, \.nav-folder-children\):has\(> \.nav-file > \.nav-file-title\[data-path="Home\.md"\]\)/);
  assert.doesNotMatch(css, /\.nav-folder\.mod-root\s*>\s*\.nav-folder-children/);
});
