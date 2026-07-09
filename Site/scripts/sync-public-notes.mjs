import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import matter from 'gray-matter';
import siteConfig from '../site.config.mjs';
import { transformCodexFormatting } from './codex-formatting.mjs';

const siteRoot = process.cwd();
const sourceDir = path.resolve(siteRoot, siteConfig.loreSourceDir);
const assetRoot = path.resolve(siteRoot, siteConfig.vaultAssetDir);
const outDir = path.resolve(siteRoot, 'src/content/docs');
const publicAssetDir = path.resolve(siteRoot, 'public/assets');
const calendarComponentPath = path.resolve(siteRoot, 'src/components/calendar/CalendarYear.astro');
const requiredFields = ['title', 'description'];
const typeByFolder = new Map([
  ['characters', 'character'],
  ['factions', 'faction'],
  ['locations', 'location'],
  ['events', 'event'],
  ['maps', 'map'],
  ['images', 'image'],
  ['eras', 'era'],
  ['timelines', 'timeline'],
  ['calendar', 'calendar'],
  ['demo', 'system'],
]);

function cleanSlug(slug) {
  return String(slug).trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function slugFromFile(file) {
  const rel = path.relative(sourceDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
  return rel.split('/').map((segment) => cleanSlug(segment).replace(/\s+/g, '-')).join('/');
}

function sourceSegments(file) {
  const rel = path.relative(sourceDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
  return rel.split('/').filter(Boolean);
}

function inferType(file) {
  const segments = sourceSegments(file).map((segment) => segment.toLowerCase());
  for (let index = segments.length - 2; index >= 0; index -= 1) {
    const type = typeByFolder.get(segments[index]);
    if (type) return type;
  }
  return typeByFolder.get(segments[0]) ?? 'article';
}

function inferEra(file) {
  const segments = sourceSegments(file);
  const eraIndex = segments.findIndex((segment) => segment.toLowerCase() === 'eras');
  return eraIndex >= 0 && segments[eraIndex + 1] ? segments[eraIndex + 1] : undefined;
}

function route(slug) {
  return slug === 'index' ? '/' : `/${slug}/`;
}

function noteKey(input) {
  return String(input).trim().toLowerCase();
}

function assetKey(input) {
  return path.basename(String(input).trim()).toLowerCase();
}

function isExternalUrl(value) {
  return typeof value === 'string' && /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function isPlainAssetFilename(value) {
  return typeof value === 'string' && value.trim() && !value.startsWith('/') && !isExternalUrl(value);
}

function parseFrontmatter(raw, file) {
  if (!raw.startsWith('---\n')) throw new Error(`Missing frontmatter: ${path.relative(siteRoot, file)}`);
  const end = raw.indexOf('\n---', 4);
  if (end === -1) throw new Error(`Unclosed frontmatter: ${path.relative(siteRoot, file)}`);
  const frontmatter = raw.slice(4, end).trimEnd();
  const parsed = matter(raw);
  return {
    data: parsed.data ?? {},
    frontmatter,
    content: parsed.content.replace(/^\r?\n/, ''),
  };
}

function stringifyFrontmatter(frontmatter, generated) {
  const lines = frontmatter.split(/\r?\n/);

  function setField(key, value) {
    if (value === undefined || value === null || value === '') return;
    const line = `${key}: ${value}`;
    const index = lines.findIndex((entry) => entry.startsWith(`${key}:`));
    if (index === -1) lines.push(line);
    else lines[index] = line;
  }

  setField('slug', generated.slug);
  setField('type', generated.type);
  setField('era', generated.era);
  setField('sourcePath', JSON.stringify(generated.sourcePath));

  return `---\n${lines.join('\n')}\n---\n\n`;
}

async function pathExists(file) {
  try {
    await fs.access(file, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function emptyDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full;
  }));
  return files.flat();
}

const files = (await walk(sourceDir)).filter((file) => /\.(md|mdx)$/i.test(file)).sort();
const publicNotes = [];
const slugByName = new Map();
const imageSlugByAsset = new Map();
const warnings = [];

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  const parsed = parseFrontmatter(raw, file);
  if (parsed.data.publish !== true || parsed.data.status !== 'canon') continue;
  const slug = parsed.data.slug === 'index' ? 'index' : slugFromFile(file);
  parsed.data.slug = slug;
  parsed.data.type ||= inferType(file);
  parsed.data.era ||= inferEra(file);
  for (const field of requiredFields) {
    if (!parsed.data[field]) throw new Error(`Public note is missing required frontmatter "${field}": ${path.relative(siteRoot, file)}`);
  }
  if (publicNotes.some((note) => note.slug === slug)) throw new Error(`Duplicate published route "${slug}" in ${path.relative(siteRoot, file)}`);
  const note = { file, parsed, slug };
  publicNotes.push(note);
  const basename = path.basename(file, path.extname(file));
  slugByName.set(noteKey(basename), slug);
  slugByName.set(noteKey(parsed.data.title), slug);
}

for (const note of publicNotes) {
  const asset = note.parsed.data.asset;
  if (note.parsed.data.type === 'image' && typeof asset === 'string' && asset.trim()) {
    imageSlugByAsset.set(assetKey(asset), note.slug);
  }
}

await emptyDir(outDir);
await fs.mkdir(publicAssetDir, { recursive: true });

async function copyAsset(category, filename) {
  const source = path.join(assetRoot, category, filename);
  if (!(await pathExists(source))) return null;
  const target = path.join(publicAssetDir, category.toLowerCase(), filename);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  return `/assets/${category.toLowerCase()}/${filename}`;
}

async function copyReferencedAsset(value) {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('/assets/images/')) return copyAsset('Images', path.basename(value));
  if (value.startsWith('/assets/maps/')) return copyAsset('Maps', path.basename(value));
  if (isPlainAssetFilename(value)) return copyAsset('Images', path.basename(value));
  return null;
}

function markdownImage(filename, url) {
  const image = `![${filename}](${url})`;
  const imageSlug = imageSlugByAsset.get(assetKey(filename));
  return imageSlug ? `[${image}](${route(imageSlug)})` : image;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasCalendarShortcodes(content) {
  return /^\s*\[Calendar:[^\]]+\]\s*$/im.test(content);
}

function normaliseEventLinks(links) {
  if (!links || typeof links !== 'object' || Array.isArray(links)) return undefined;
  const normalised = {};
  for (const [slug, value] of Object.entries(links)) {
    if (typeof value === 'string' && value.trim()) {
      normalised[slug] = value.trim();
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const href = typeof value.href === 'string' && value.href.trim() ? value.href.trim() : undefined;
      const article = typeof value.article === 'string' && value.article.trim() ? value.article.trim() : undefined;
      const label = typeof value.label === 'string' && value.label.trim() ? value.label.trim() : undefined;
      if (href || article) normalised[slug] = { href, article, label };
    }
  }
  return Object.keys(normalised).length > 0 ? normalised : undefined;
}

function normaliseCalendarBlock(block) {
  if (!block || typeof block !== 'object') return null;
  const calendar = typeof block.calendar === 'string' ? block.calendar : undefined;
  const year = block.year === undefined ? undefined : Number(block.year);
  if (!calendar) return null;
  if (year !== undefined && (!Number.isInteger(year) || year < 1)) return null;
  const eventLinks = normaliseEventLinks(block.eventLinks ?? block.observanceLinks ?? block.links);
  return eventLinks ? { calendar, year, eventLinks } : { calendar, year };
}

function parseInlineCalendarSpec(id, spec) {
  const block = { calendar: id };
  const pairs = [...String(spec ?? '').matchAll(/([a-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi)];
  for (const pair of pairs) {
    const key = pair[1].toLowerCase();
    const value = pair[2] ?? pair[3] ?? pair[4] ?? '';
    if (key === 'calendar') block.calendar = value;
    if (key === 'year') block.year = Number(value);
  }
  return normaliseCalendarBlock(block);
}

function mdxImportPath(outFile) {
  let relative = path.relative(path.dirname(outFile), calendarComponentPath).replace(/\\/g, '/');
  if (!relative.startsWith('.')) relative = `./${relative}`;
  return relative;
}

function calendarShortcodeWarning(message) {
  return [
    '<aside className="cx-callout cx-callout-warning">',
    '<p className="cx-callout-title">Calendar shortcode warning</p>',
    `<p>${message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
    '</aside>',
  ].join('\n');
}

function transformCalendarShortcodes(content, parsed, currentFile, outFile) {
  const calendarBlocks = parsed.data.calendarBlocks && typeof parsed.data.calendarBlocks === 'object'
    ? parsed.data.calendarBlocks
    : {};
  let used = false;
  let fence = null;

  const lines = String(content).split(/\r?\n/).map((line) => {
    const fenceStart = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const endPattern = fence.marker === '`' ? /^\s*`{3,}/ : /^\s*~{3,}/;
      const end = line.match(endPattern);
      if (end && end[0].trim().length >= fence.length) fence = null;
      return line;
    }
    if (fenceStart) {
      fence = { marker: fenceStart[1][0], length: fenceStart[1].length };
      return line;
    }

    const match = line.match(/^\s*\[Calendar:([^\]\s]+)(?:\s+([^\]]+))?\]\s*$/i);
    if (!match) return line;

    const id = match[1];
    const inlineSpec = match[2] ?? '';
    const block = normaliseCalendarBlock(calendarBlocks[id]) ?? parseInlineCalendarSpec(id, inlineSpec);
    if (!block) {
      warnings.push(`Unknown or invalid calendar shortcode "${id}" in ${path.relative(sourceDir, currentFile)}`);
      return calendarShortcodeWarning(`No valid calendar block found for ${id}. Add a calendarBlocks entry or use [Calendar:okse year=4].`);
    }

    used = true;
    const calendarId = JSON.stringify(block.calendar);
    const yearProp = block.year === undefined ? '' : ` year={${block.year}}`;
    const eventLinksProp = block.eventLinks ? ` eventLinks={${JSON.stringify(block.eventLinks)}}` : '';
    return `<CalendarYear calendarId={${calendarId}}${yearProp}${eventLinksProp} />`;
  });

  const output = lines.join('\n');
  if (!used) return { content: output, used: false };

  return {
    content: `import CalendarYear from '${mdxImportPath(outFile)}';\n\n${output}`,
    used: true,
  };
}

async function convertContent(content, currentFile, parsed, outFile, outputRequiresMdx) {
  let converted = content.replace(/^%%[\s\S]*?%%\s*/gm, '');
  const embeds = [...converted.matchAll(/!\[\[([^\]]+)\]\]/g)];
  for (const match of embeds) {
    const rawTarget = match[1].split('|')[0].trim();
    const filename = path.basename(rawTarget);
    let url = await copyAsset('Images', filename) ?? await copyAsset('Maps', filename) ?? await copyAsset('Documents', filename);
    if (!url) {
      warnings.push(`Missing embedded asset "${filename}" in ${path.relative(sourceDir, currentFile)}`);
      converted = converted.replace(match[0], `**Missing asset:** ${filename}`);
    } else {
      converted = converted.replace(match[0], markdownImage(filename, url));
    }
  }

  converted = converted.replace(new RegExp(`^#\\s+${escapeRegExp(parsed.data.title)}\\s*$`, 'im'), '').trimStart();

  converted = converted.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (match, target, alias) => {
    const label = alias?.trim() || target.trim();
    const slug = slugByName.get(noteKey(target));
    if (!slug) {
      warnings.push(`Unpublished or missing wikilink "${target.trim()}" in ${path.relative(sourceDir, currentFile)}`);
      return label;
    }
    return `[${label}](${route(slug)})`;
  });

  converted = transformCodexFormatting(converted, {
    jsx: outputRequiresMdx,
  });

  return transformCalendarShortcodes(converted, parsed, currentFile, outFile);
}

for (const { file, parsed, slug } of publicNotes) {
  const sourceIsMdx = path.extname(file).toLowerCase() === '.mdx';
  const shortcodeRequiresMdx = hasCalendarShortcodes(parsed.content);
  const extension = sourceIsMdx || shortcodeRequiresMdx ? '.mdx' : '.md';
  const outFile = path.join(outDir, `${slug}${extension}`);
  const sourcePath = path.relative(sourceDir, file).replace(/\\/g, '/');
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  for (const field of ['image', 'headerImage']) {
    await copyReferencedAsset(parsed.data[field]);
  }
  if (parsed.data.asset && parsed.data.type === 'image') await copyAsset('Images', parsed.data.asset);
  const result = await convertContent(parsed.content, file, parsed, outFile, extension === '.mdx');
  await fs.writeFile(outFile, `${stringifyFrontmatter(parsed.frontmatter, {
    slug,
    type: parsed.data.type,
    era: parsed.data.era,
    sourcePath,
  })}${result.content}`);
  console.log(`Published ${path.relative(sourceDir, file)} -> ${path.relative(outDir, outFile)}`);
}

if (warnings.length > 0) {
  console.warn('\nSync warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}
