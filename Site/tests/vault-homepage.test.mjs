import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const vaultRoot = path.join(repoRoot, 'Vault');

async function readText(relativePath) {
  return fs.readFile(path.join(vaultRoot, relativePath), 'utf8');
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

test('VISCERIUM Home remains creator-only and wired to its presentation/action dependencies', async () => {
  const home = matter(await readText('Home.md'));
  const appearance = await readJson('.obsidian/appearance.json');
  const templater = await readJson('.obsidian/plugins/templater-obsidian/data.json');

  assert.equal(home.data.publish, false);
  assert.ok(home.data.cssclasses?.includes('viscerium-home'));
  assert.ok(appearance.enabledCssSnippets.includes('VISCERIUM Homepage'));

  assert.ok(templater.enabled_templates_hotkeys.includes('Templates/New Story Entity.md'));
  assert.ok(templater.startup_templates.includes('Templates/_Startup/Open VISCERIUM Home.md'));

  assert.match(home.content, /Create Story Entity/);
  assert.match(home.content, /Create New Story Entity/);
  assert.match(home.content, /viscerium-timelines:open-storyline-project-timeline/);
  assert.match(home.content, /viscerium-timelines:diagnose-storyline-integration/);
});

test('homepage startup template opens Home through the workspace after layout is ready', async () => {
  const startup = await readText('Templates/_Startup/Open VISCERIUM Home.md');

  assert.match(startup, /getAbstractFileByPath\("Home\.md"\)/);
  assert.match(startup, /workspace\.onLayoutReady\(openHome\)/);
  assert.match(startup, /mode:\s*"preview"/);
});
