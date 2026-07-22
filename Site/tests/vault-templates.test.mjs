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

const publicSkeletons = [
  ['Templates/Character Template.md', 'character'],
  ['Templates/Faction Template.md', 'faction'],
  ['Templates/Location Template.md', 'location'],
  ['Templates/Event Template.md', 'event'],
  ['Templates/Era Template.md', 'era'],
  ['Templates/Map Template.md', 'map'],
  ['Templates/Image Metadata Template.md', 'image'],
  ['Templates/Timeline Template.md', 'timeline'],
  ['Templates/Chronos Timeline Template.md', 'timeline'],
];

const creatorTemplates = [
  'Templates/New Story Entity.md',
  'Templates/Add Storyteller Fields.md',
  'Templates/Myrkild Unit Profile.md',
  'Templates/_Internals/Story Entity Core.md',
  'Templates/_Startup/Open VISCERIUM Home.md',
];

test('publishable Lore skeletons start safe and avoid duplicate rendered chrome', async () => {
  for (const [relativePath, expectedType] of publicSkeletons) {
    const parsed = matter(await readText(relativePath));

    assert.equal(parsed.data.title, '{{title}}', `${relativePath} should derive title from the note filename`);
    assert.equal(parsed.data.publish, false, `${relativePath} must start unpublished`);
    assert.equal(parsed.data.status, 'draft', `${relativePath} must start as a draft`);
    assert.equal(parsed.data.type, expectedType, `${relativePath} should declare its semantic type`);
    assert.doesNotMatch(parsed.content, /^#\s+\{\{title\}\}/m, `${relativePath} should not duplicate the note/page title as a body H1`);
    assert.doesNotMatch(parsed.content, /^##\s+Comments\s*$/m, `${relativePath} should not create an empty duplicate comments section`);
    assert.doesNotMatch(parsed.content, /viscerium-sidebar|```dataviewjs/i, `${relativePath} should stay portable and not render the retired Obsidian infobox`);

    if (Object.hasOwn(parsed.data, 'tags')) {
      assert.ok(Array.isArray(parsed.data.tags), `${relativePath} tags should be an array, not YAML null`);
    }
    if (Object.hasOwn(parsed.data, 'related')) {
      assert.ok(Array.isArray(parsed.data.related), `${relativePath} related should be an array, not YAML null`);
    }
  }
});

test('creator-facing and internal Templater workflows remain present after the template audit', async () => {
  for (const relativePath of creatorTemplates) {
    const content = await readText(relativePath);
    assert.ok(content.trim().length > 0, `${relativePath} should not be empty`);
  }

  const wrapper = await readText('Templates/New Story Entity.md');
  const injector = await readText('Templates/Add Storyteller Fields.md');
  const core = await readText('Templates/_Internals/Story Entity Core.md');

  assert.match(wrapper, /Story Entity Core/);
  assert.match(injector, /processFrontMatter/);
  assert.match(core, /Stop when usable/);
});

test('Minimal owns ordinary article width without competing global width or infobox snippets', async () => {
  const minimal = await readJson('.obsidian/plugins/obsidian-minimal-settings/data.json');
  const appearance = await readJson('.obsidian/appearance.json');

  assert.equal(minimal.readableLineLength, true);
  assert.equal(minimal.lineWidth, 64);
  assert.equal(minimal.lineWidthWide, 76);
  assert.equal(minimal.maxWidth, 92);
  assert.ok(!appearance.enabledCssSnippets.includes('Readable line width'));
  assert.ok(!appearance.enabledCssSnippets.includes('Infobox sidebar'));

  const retired = [
    '.obsidian/snippets/Readable line width.css',
    '.obsidian/snippets/Infobox sidebar.css',
    'Views/viscerium-sidebar/view.js',
    'Views/viscerium-sidebar/view.css',
    'System/Dataview Sidebar Templates.md',
  ];

  for (const relativePath of retired) {
    await assert.rejects(fs.access(path.join(vaultRoot, relativePath)), undefined, `${relativePath} should remain retired`);
  }
});

test('era template never emits an unresolved custom template variable as a timeline shortcode', async () => {
  const era = await readText('Templates/Era Template.md');
  assert.doesNotMatch(era, /\[Timeline:\{\{eraId\}\}\]/);
  assert.match(era, /\[Timeline:<eraId>\]/);
});
