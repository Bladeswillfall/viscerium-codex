import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');

function read(rel) {
  return fs.readFileSync(path.join(repo, rel), 'utf8');
}

test('StoryLine is rooted in the private Stories workspace', () => {
  const config = JSON.parse(read('Vault/.obsidian/plugins/storyline/data.json'));
  assert.equal(config.storyLineRoot, 'Stories');

  const plugins = JSON.parse(read('Vault/.obsidian/community-plugins.json'));
  assert.ok(plugins.includes('storyline'));
});

test('Codex source remains hard-gated to Lore', () => {
  const siteConfig = read('Site/site.config.mjs');
  assert.match(siteConfig, /loreSourceDir:\s*env\.LORE_SOURCE_DIR\s*\?\?\s*'\.\.\/Vault\/Lore'/);

  const plugin = read('Tools/obsidian-viscerium-timelines/main.ts');
  assert.match(plugin, /if \(!file\.path\.startsWith\('Lore\/'\)\) continue;/);
  assert.doesNotMatch(plugin, /compileVault[\s\S]*file\.path\.startsWith\('Stories\/'\)/);
});

test('StoryLine timeline uses an in-memory adapter instead of duplicate source fields', () => {
  const plugin = read('Tools/obsidian-viscerium-timelines/main.ts');
  const adapter = read('Site/src/lib/timeline/storyline-adapter.mjs');

  assert.match(plugin, /open-storyline-project-timeline/);
  assert.match(plugin, /buildStoryLineTimelineDataset/);
  assert.match(adapter, /parseStoryLineDate\(scene\.storyDate\)/);
  assert.doesNotMatch(adapter, /scene\.calendarDate/);
});
