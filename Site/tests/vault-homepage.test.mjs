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

  assert.equal(home.data.publish, undefined, 'Home must not carry the legacy publish boolean');
  assert.ok(home.data.cssclasses?.includes('viscerium-home'));
  assert.ok(appearance.enabledCssSnippets.includes('VISCERIUM Homepage'));
  assert.ok(appearance.enabledCssSnippets.includes('VISCERIUM Homepage responsive'));

  assert.ok(templater.enabled_templates_hotkeys.includes('Templates/Databases/New Story Entity.md'));
  assert.ok(templater.startup_templates.includes('Templates/_Startup/Open VISCERIUM Home.md'));

  assert.match(home.content, /vc-home-action-strip/);
  assert.match(home.content, /vc-home-recent-grid/);
  assert.match(home.content, /NEXT ACTIONS/);
  assert.match(home.content, /WRITING DESK/);
  assert.match(home.content, /CREATOR ACTIVITY/);
  assert.match(home.content, /System\/Creator Tasks/);
  assert.match(home.content, /activeProjectFile/);
  assert.match(home.content, /Creator Activity\.json/);
  assert.match(home.content, /vc-home-heatmap/);
  assert.match(home.content, /Create Story Entity/);
  assert.match(home.content, /Create New Story Entity/);
  assert.match(home.content, /viscerium-timelines:open-storyline-project-timeline/);
  assert.match(home.content, /viscerium-timelines:diagnose-storyline-integration/);
  assert.doesNotMatch(home.content, /dv\.table\(/);
});

test('homepage visual layer stays flat and keeps functional colour roles', async () => {
  const visualCss = await readText('.obsidian/snippets/VISCERIUM Homepage.css');

  assert.match(visualCss, /home-tasks/);
  assert.match(visualCss, /home-writingdesk/);
  assert.match(visualCss, /home-activity/);
  assert.match(visualCss, /vc-home-heatmap/);
  assert.match(visualCss, /border-left:/);
  assert.doesNotMatch(visualCss, /linear-gradient\(/);
  assert.doesNotMatch(visualCss, /radial-gradient\(/);
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

test('creator task hub uses ordinary Markdown tasks without introducing a task plugin', async () => {
  const taskHub = await readText('System/Creator Tasks.md');
  const plugins = await readJson('.obsidian/community-plugins.json');

  assert.match(taskHub, /dv\.taskList/);
  assert.match(taskHub, /ordinary Markdown checkboxes/i);
  assert.doesNotMatch(taskHub, /completion percentage/i);
  assert.ok(!plugins.includes('tasknotes'));
});

test('homepage startup records durable content-based creator activity before opening Home', async () => {
  const startup = await readText('Templates/_Startup/Open VISCERIUM Home.md');
  const ledger = await readJson('System/Data/Creator Activity.json');

  assert.equal(ledger.version, 1);
  assert.equal(typeof ledger.files, 'object');
  assert.equal(typeof ledger.days, 'object');
  assert.match(startup, /Creator Activity\.json/);
  assert.match(startup, /getMarkdownFiles\(\)/);
  assert.match(startup, /cachedRead\(file\)/);
  assert.match(startup, /hashText/);
  assert.match(startup, /previousHash\s*===\s*hash/);
  assert.match(startup, /localStorage\.getItem\(CACHE_KEY\)/);
  assert.match(startup, /localStorage\.setItem\(CACHE_KEY/);
  assert.match(startup, /Number\(localMtimes\[file\.path\]/);
  assert.match(startup, /isBaselineScan/);
  assert.match(startup, /!path\.startsWith\("System\/"\)/);
  assert.match(startup, /!path\.startsWith\("Templates\/"\)/);
  assert.match(startup, /recordCreatorActivity/);
  assert.match(startup, /workspace\.onLayoutReady\(async\s*\(\)\s*=>/);
  assert.match(startup, /await recordCreatorActivity\(\)/);
  assert.match(startup, /await openHome\(\)/);
  assert.match(startup, /mode:\s*"preview"/);
});
