import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { diagnoseStories } from '../scripts/story-doctor.mjs';

async function withVault(files, run) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'viscerium-story-doctor-'));
  try {
    for (const [relativePath, content] of Object.entries(files)) {
      const file = path.join(root, relativePath);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, content, 'utf8');
    }
    return await run(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

const project = `---\ntype: storyline\ntitle: Test Novel\n---\n`;

function scene(frontmatter = '', body = '') {
  return `---\ntype: scene\ntitle: Test Scene\n${frontmatter}---\n\n${body}\n`;
}

test('Story Doctor accepts optional chronology and resolved vault links', async () => {
  const result = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Scenes/Act 1/01 Test Scene.md': scene('sequence: 1\n', 'The scene occurs near [[Known Place]].'),
    'Lore/Known Place.md': '---\ntitle: Known Place\n---\n',
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));

  assert.equal(result.ok, true);
  assert.equal(result.sceneCount, 1);
  assert.equal(result.errors.length, 0);
  assert.equal(result.notices.some((item) => item.code === 'unresolved-story-link'), false);
});

test('Story Doctor validates storyDate only when it is supplied', async () => {
  const missing = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Scenes/01 Test Scene.md': scene('sequence: 1\n'),
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));
  assert.equal(missing.ok, true);

  const invalid = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Scenes/01 Test Scene.md': scene('storyDate: "not a VISCERIUM date"\n'),
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some((item) => item.code === 'story-date-invalid'));
});

test('Story Doctor rejects duplicate canonical chronology on a StoryLine scene', async () => {
  const result = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Scenes/01 Test Scene.md': scene('storyDate: "16 Sólmanuthur, 9250"\ncalendarDate: "9250-01-16"\n'),
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'duplicate-story-chronology'));
});

test('Story Doctor reports unresolved story wikilinks as notices rather than failures', async () => {
  const result = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Scenes/01 Test Scene.md': scene('', 'Someone mentions [[Future Character]].'),
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));

  assert.equal(result.ok, true);
  assert.ok(result.notices.some((item) => item.code === 'unresolved-story-link'));
});

test('Story Doctor notices duplicate scene ordering without treating it as creative failure', async () => {
  const result = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Scenes/01 First.md': scene('sequence: 1\n'),
    'Stories/Test Novel/Scenes/02 Second.md': scene('sequence: 1\n'),
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));

  assert.equal(result.ok, true);
  assert.ok(result.notices.some((item) => item.code === 'duplicate-story-order'));
});

test('Story Doctor accepts StoryLine corkboard scene notes under Notes without counting them as manuscript scenes', async () => {
  const result = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Scenes/01 Manuscript Scene.md': scene('sequence: 1\n'),
    'Stories/Test Novel/Notes/00-00 Untitled.md': scene('status: idea\ncorkboardNote: true\n', 'Scratch thought.'),
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));

  assert.equal(result.ok, true);
  assert.equal(result.sceneCount, 1);
  assert.equal(result.errors.some((item) => item.code === 'scene-folder'), false);
});

test('Story Doctor rejects scene notes outside the StoryLine Scenes folder when they are not corkboard notes', async () => {
  const result = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Loose Scene.md': scene('sequence: 1\n'),
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'scene-folder'));
});

test('Story Doctor surfaces malformed story frontmatter as an error', async () => {
  const result = await withVault({
    'Stories/Test Novel/Test Novel.md': project,
    'Stories/Test Novel/Scenes/Broken.md': '---\ntype: scene\ntitle: [broken\n---\n',
  }, (vaultRoot) => diagnoseStories({ vaultRoot }));

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === 'story-frontmatter'));
});
