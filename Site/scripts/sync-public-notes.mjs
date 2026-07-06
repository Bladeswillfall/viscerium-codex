import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import siteConfig from '../site.config.mjs';

const siteRoot = process.cwd();
const sourceDir = path.resolve(siteRoot, siteConfig.loreSourceDir);
const assetRoot = path.resolve(siteRoot, siteConfig.vaultAssetDir);
const outDir = path.resolve(siteRoot, 'src/content/docs');
const publicAssetDir = path.resolve(siteRoot, 'public/assets');
const requiredFields = ['title', 'description', 'type'];

function cleanSlug(slug) {
  return String(slug).trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function slugFromFile(file) {
  const rel = path.relative(sourceDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
  return rel.split('/').map((segment) => cleanSlug(segment).replace(/\s+/g, '-')).join('/');
}

function route(slug) {
  return slug === 'index' ? '/' : `/${slug}/`;
}

function noteKey(input) {
  return String(input).trim().toLowerCase();
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(raw, file) {
  if (!raw.startsWith('---\n')) throw new Error(`Missing frontmatter: ${path.relative(siteRoot, file)}`);
  const end = raw.indexOf('\n---', 4);
  if (end === -1) throw new Error(`Unclosed frontmatter: ${path.relative(siteRoot, file)}`);
  const frontmatter = raw.slice(4, end).trimEnd();
  const content = raw.slice(end + 4).replace(/^\r?\n/, '');
  const data = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][\w-]*):(?:\s*(.*))?$/);
    if (!match || match[2] === undefined) continue;
    data[match[1]] = parseScalar(match[2]);
  }
  return { data, frontmatter, content };
}

function stringifyFrontmatter(frontmatter, slug) {
  const lines = frontmatter.split(/\r?\n/);
  const slugIndex = lines.findIndex((line) => line.startsWith('slug:'));
  if (slugIndex === -1) lines.push(`slug: ${slug}`);
  else lines[slugIndex] = `slug: ${slug}`;
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
const warnings = [];

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  const parsed = parseFrontmatter(raw, file);
  if (parsed.data.publish !== true || parsed.data.status !== 'canon') continue;
  for (const field of requiredFields) {
    if (!parsed.data[field]) throw new Error(`Public note is missing required frontmatter "${field}": ${path.relative(siteRoot, file)}`);
  }
  const slug = parsed.data.slug === 'index' ? 'index' : slugFromFile(file);
  if (publicNotes.some((note) => note.slug === slug)) throw new Error(`Duplicate published route "${slug}" in ${path.relative(siteRoot, file)}`);
  const note = { file, parsed, slug };
  publicNotes.push(note);
  const basename = path.basename(file, path.extname(file));
  slugByName.set(noteKey(basename), slug);
  slugByName.set(noteKey(parsed.data.title), slug);
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function convertContent(content, currentFile, title) {
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
      converted = converted.replace(match[0], `![${filename}](${url})`);
    }
  }

  converted = converted.replace(new RegExp(`^#\\s+${escapeRegExp(title)}\\s*$`, 'im'), '').trimStart();

  return converted.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (match, target, alias) => {
    const label = alias?.trim() || target.trim();
    const slug = slugByName.get(noteKey(target));
    if (!slug) {
      warnings.push(`Unpublished or missing wikilink "${target.trim()}" in ${path.relative(sourceDir, currentFile)}`);
      return label;
    }
    return `[${label}](${route(slug)})`;
  });
}

for (const { file, parsed, slug } of publicNotes) {
  const extension = path.extname(file).toLowerCase() === '.mdx' ? '.mdx' : '.md';
  const outFile = path.join(outDir, `${slug}${extension}`);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  for (const field of ['image', 'headerImage']) {
    const value = parsed.data[field];
    if (!value || typeof value !== 'string') continue;
    if (value.startsWith('/assets/images/')) await copyAsset('Images', path.basename(value));
    if (value.startsWith('/assets/maps/')) await copyAsset('Maps', path.basename(value));
  }
  if (parsed.data.asset && parsed.data.type === 'image') await copyAsset('Images', parsed.data.asset);
  const content = await convertContent(parsed.content, file, parsed.data.title);
  await fs.writeFile(outFile, `${stringifyFrontmatter(parsed.frontmatter, slug)}${content}`);
  console.log(`Published ${path.relative(sourceDir, file)} -> ${path.relative(outDir, outFile)}`);
}

for (const warning of [...new Set(warnings)]) console.warn(`Warning: ${warning}`);
console.log(`Synced ${publicNotes.length} public notes from Vault/Lore.`);
