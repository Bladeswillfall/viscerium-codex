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
  assert.ok(appearance.enabledCssSnippets.includes('VISCERIUM Homepage responsive'));

  assert.ok(templater.enabled_templates_hotkeys.includes('Templates/New Story Entity.md'));
  assert.ok(templater.startup_templates.includes('Templates/_Startup/Open VISCERIUM Home.md'));

  assert.match(home.content, /vc-home-action-strip/);
  assert.match(home.content, /vc-home-recent-grid/);
  assert.match(home.content, /Create Story Entity/);
  assert.match(home.content, /Create New Story Entity/);
  assert.match(home.content, /viscerium-timelines:open-storyline-project-timeline/);
  assert.match(home.content, /viscerium-timelines:diagnose-storyline-integration/);
  assert.doesNotMatch(home.content, /dv\.table\(/);
});

test('homepage responsive layer resets readable width and avoids fixed two-column overflow', async () => {
  const responsiveCss = await readText('.obsidian/snippets/VISCERIUM Homepage responsive.css');

  assert.match(responsiveCss, /--line-width-adaptive:\s*300em/);
  assert.match(responsiveCss, /markdown-preview-sizer\s*>\s*div/);
  assert.match(responsiveCss, /repeat\(auto-fit,\s*minmax\(min\(100%,\s*22rem\),\s*1fr\)\)/);
  assert.match(responsiveCss, /@container\s+viscerium-home/);
  assert.match(responsiveCss, /metadata-container/);
  assert.doesNotMatch(responsiveCss, /repeat\(2,\s*minmax\(340px,\s*1fr\)\)/);
});

test('homepage control deck remains compact and pane-responsive', async () => {
  const responsiveCss = await readText('.obsidian/snippets/VISCERIUM Homepage responsive.css');

  assert.match(responsiveCss, /vc-home-action-strip/);
  assert.match(responsiveCss, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(responsiveCss, /vc-home-action-create/);
  assert.match(responsiveCss, /vc-home-action-stories/);
  assert.match(responsiveCss, /vc-home-recent-grid/);
  assert.match(responsiveCss, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*12\.5rem\),\s*1fr\)\)/);
  assert.match(responsiveCss, /@container\s+viscerium-home\s*\(max-width:\s*34rem\)/);
});

test('homepage startup template opens Home through the workspace after layout is ready', async () => {
  const startup = await readText('Templates/_Startup/Open VISCERIUM Home.md');

  assert.match(startup, /getAbstractFileByPath\("Home\.md"\)/);
  assert.match(startup, /workspace\.onLayoutReady\(openHome\)/);
  assert.match(startup, /mode:\s*"preview"/);
});
