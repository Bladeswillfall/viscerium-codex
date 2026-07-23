import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const vaultRoot = path.join(repoRoot, 'Vault');

async function read(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), 'utf8');
}

test('Capture Idea is registered as a direct Templater command', async () => {
  const config = JSON.parse(await read('Vault/.obsidian/plugins/templater-obsidian/data.json'));
  assert.ok(config.enabled_templates_hotkeys.includes('Templates/Capture Idea.md'));

  const template = await read('Vault/Templates/Capture Idea.md');
  assert.match(template, /Drafts\/Inbox/);
  assert.match(template, /type: creator-capture/);
  assert.match(template, /status: inbox/);
  assert.doesNotMatch(template, /development_level|publish: true|status: canon/);
});

test('Home exposes capture, continuity and story health entry points', async () => {
  const home = await read('Vault/Home.md');
  assert.match(home, /Create Capture Idea/);
  assert.match(home, /\[\[System\/Continuity Desk\|Continuity Desk\]\]/);
  assert.match(home, /\[\[System\/Writer Inbox\|Writer Inbox\]\]/);
  assert.match(home, /npm run doctor:stories/);
});

test('Continuity Desk remains derived from StoryLine rather than storing continuity data', async () => {
  const desk = await read('Vault/System/Continuity Desk.md');
  assert.match(desk, /activeProjectFile/);
  assert.match(desk, /Scenes\//);
  assert.match(desk, /scene frontmatter/);
  assert.doesNotMatch(desk, /writeFile|vault\.create|vault\.modify/);
});

test('Writer Inbox is a low-pressure capture surface', async () => {
  const inbox = await read('Vault/System/Writer Inbox.md');
  assert.match(inbox, /Capture now\. Worldbuild later\./);
  assert.match(inbox, /FROM "Drafts\/Inbox"/);
  assert.match(inbox, /no expectation that the inbox reaches zero/i);
});

test('deferred writing tooling stays explicitly deferred', async () => {
  const future = await read('Vault/System/Future Writing Tooling.md');
  for (const heading of [
    '## 5. Continue Writing',
    '## 6. Manuscript compilation / export',
    '## 7. Story-to-canon handoff',
    '## 8. Optional writing analytics and planning surfaces',
  ]) {
    assert.match(future, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(future, /deliberately \*\*deferred\*\*/i);
});

test('Story Doctor is part of the normal confidence suite', async () => {
  const pkg = JSON.parse(await read('Site/package.json'));
  assert.equal(pkg.scripts['doctor:stories'], 'node scripts/story-doctor.mjs');
  assert.match(pkg.scripts.test, /doctor:stories/);

  const workflow = await read('.github/workflows/checks.yml');
  assert.match(workflow, /npm run doctor:stories/);
});
