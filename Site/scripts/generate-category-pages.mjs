import path from 'node:path';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';

const execFileAsync = promisify(execFile);
const siteRoot = process.cwd();
const repoRoot = path.resolve(siteRoot, '..');
const docsDir = path.resolve(siteRoot, 'src/content/docs');
const loreRoot = 'Vault/Lore/';
const markdownExtensions = /\.(md|mdx)$/i;
const generatedSectionMarker = '<!-- generated-category-index -->';
const generatedSectionEndMarker = '<!-- /generated-category-index -->';

function cleanSlug(value) {
  return String(value ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function routeFor(slug) {
  return slug === 'index' ? '/' : `/${cleanSlug(slug)}/`;
}

function titleFromSegment(segment) {
  const known = new Map([
    ['citadel', 'CITADEL'],
    ['smog', 'SMOG'],
    ['nearsight', 'NEARSIGHT'],
    ['entropy', 'ENTROPY'],
    ['astu', 'ASTU'],
    ['tcsc', 'TCSC'],
  ]);
  const key = cleanSlug(segment);
  if (known.has(key)) return known.get(key);
  return key.replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function sourceRouteFromFile(file, data) {
  const relative = path.relative(docsDir, file).replace(/\\/g, '/').replace(markdownExtensions, '');
  return cleanSlug(data.slug || relative);
}

function asDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.valueOf()) ? null : date;
}

function entryDate(data) {
  return asDate(data.updated) ?? asDate(data.date) ?? asDate(data.published);
}

function escapeMarkdown(value) {
  return String(value).replace(/([\\`*_[\]<>])/g, '\\$1');
}

function generatedCategorySection(descendants, childCategories) {
  const lines = [generatedSectionMarker];

  if (childCategories.length > 0) {
    lines.push('## Subcategories', '');
    for (const child of childCategories) {
      lines.push(`- [${escapeMarkdown(child.title)}](${routeFor(child.slug)}) — ${child.count} public ${child.count === 1 ? 'page' : 'pages'}`);
    }
    lines.push('');
  }

  lines.push('## Pages in this category', '');
  for (const entry of descendants) {
    const type = entry.data.type && entry.data.type !== 'article' ? ` · ${escapeMarkdown(entry.data.type)}` : '';
    lines.push(`- [${escapeMarkdown(entry.data.title)}](${routeFor(entry.slug)})${type}`);
    if (entry.data.description) lines.push(`  ${escapeMarkdown(entry.data.description)}`);
  }

  if (descendants.length === 0) lines.push('_No public pages are currently available in this category._');
  lines.push('', generatedSectionEndMarker, '');
  return lines.join('\n');
}

function removeGeneratedCategorySection(content) {
  const start = content.indexOf(generatedSectionMarker);
  if (start === -1) return content.trimEnd();
  const end = content.indexOf(generatedSectionEndMarker, start);
  if (end === -1) return content.slice(0, start).trimEnd();
  return `${content.slice(0, start)}${content.slice(end + generatedSectionEndMarker.length)}`.trimEnd();
}

function addFrontmatterField(raw, key, value) {
  if (!value || new RegExp(`^${key}:`, 'm').test(raw)) return raw;
  const closing = raw.indexOf('\n---', 4);
  if (closing === -1) return raw;
  return `${raw.slice(0, closing)}\n${key}: ${JSON.stringify(value)}${raw.slice(closing)}`;
}

async function gitUpdatedDates() {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['log', '--format=@@%cI', '--name-only', '--', 'Vault/Lore'],
      { cwd: repoRoot, maxBuffer: 16 * 1024 * 1024 },
    );
    const updatedByPath = new Map();
    let currentDate;
    for (const rawLine of stdout.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (line.startsWith('@@')) {
        currentDate = line.slice(2).trim();
        continue;
      }
      if (!currentDate || !line.startsWith(loreRoot)) continue;
      const sourcePath = line.slice(loreRoot.length).replace(/\\/g, '/');
      if (!updatedByPath.has(sourcePath)) updatedByPath.set(sourcePath, currentDate);
    }
    return updatedByPath;
  } catch (error) {
    console.warn(`Could not read Git history for What's New dates: ${error.message}`);
    return new Map();
  }
}

const generatedFiles = (await fg('**/*.{md,mdx}', { cwd: docsDir, absolute: true })).sort();
const updatedBySourcePath = await gitUpdatedDates();
const entries = [];

for (const file of generatedFiles) {
  let raw = await fs.readFile(file, 'utf8');
  const parsed = matter(raw);
  if (parsed.data.publish !== true || parsed.data.status !== 'canon' || parsed.data.type === 'category') continue;

  if (!entryDate(parsed.data) && typeof parsed.data.sourcePath === 'string') {
    const updated = updatedBySourcePath.get(parsed.data.sourcePath.replace(/\\/g, '/'));
    if (updated) {
      raw = addFrontmatterField(raw, 'updated', updated);
      await fs.writeFile(file, raw, 'utf8');
      parsed.data.updated = updated;
    }
  }

  const slug = sourceRouteFromFile(file, parsed.data);
  if (!slug || slug === 'index') continue;
  entries.push({ file, slug, data: parsed.data });
}

const categories = new Map();
for (const entry of entries) {
  const segments = entry.slug.split('/').filter(Boolean);
  for (let depth = 1; depth < segments.length; depth += 1) {
    const slug = segments.slice(0, depth).join('/');
    if (!categories.has(slug)) {
      categories.set(slug, {
        slug,
        title: titleFromSegment(segments[depth - 1]),
      });
    }
  }
}

const entryBySlug = new Map(entries.map((entry) => [entry.slug, entry]));
const categoryList = [...categories.values()].sort((a, b) => a.slug.localeCompare(b.slug));

for (const category of categoryList) {
  const prefix = `${category.slug}/`;
  const descendants = entries
    .filter((entry) => entry.slug.startsWith(prefix))
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
  const childDepth = category.slug.split('/').length + 1;
  const childCategories = categoryList
    .filter((candidate) => candidate.slug.startsWith(prefix) && candidate.slug.split('/').length === childDepth)
    .map((candidate) => ({
      ...candidate,
      count: descendants.filter((entry) => entry.slug.startsWith(`${candidate.slug}/`)).length,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  const section = generatedCategorySection(descendants, childCategories);
  const existingEntry = entryBySlug.get(category.slug);

  if (existingEntry) {
    const raw = await fs.readFile(existingEntry.file, 'utf8');
    const parsed = matter(raw);
    const content = removeGeneratedCategorySection(parsed.content);
    await fs.writeFile(existingEntry.file, matter.stringify(`${content}\n\n${section}`, parsed.data), 'utf8');
    console.log(`Extended ${path.relative(docsDir, existingEntry.file)} with a generated category index.`);
    continue;
  }

  const outFile = path.join(docsDir, category.slug, 'index.md');
  const frontmatter = {
    title: category.title,
    description: `Index of public VISCERIUM pages in the ${category.title} category.`,
    publish: true,
    status: 'canon',
    slug: category.slug,
    type: 'category',
    pagefind: true,
    tableOfContents: false,
  };
  const intro = `Browse every public Codex page filed beneath **${category.title}**.`;
  await fs.ensureDir(path.dirname(outFile));
  await fs.writeFile(outFile, matter.stringify(`${intro}\n\n${section}`, frontmatter), 'utf8');
  console.log(`Generated category index ${path.relative(docsDir, outFile)}.`);
}

console.log(`Generated ${categoryList.length} category index page${categoryList.length === 1 ? '' : 's'}.`);
