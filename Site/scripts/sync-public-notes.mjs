import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';
import siteConfig from '../site.config.mjs';

const siteRoot = process.cwd();
const sourceDir = path.resolve(siteRoot, siteConfig.loreSourceDir);
const assetRoot = path.resolve(siteRoot, siteConfig.vaultAssetDir);
const outDir = path.resolve(siteRoot, 'src/content/docs');
const publicAssetDir = path.resolve(siteRoot, 'public/assets');
const requiredFields = ['title', 'description', 'slug', 'type'];

function cleanSlug(slug) {
  return String(slug).trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function route(slug) {
  return slug === 'index' ? '/' : `/${slug}/`;
}

function noteKey(input) {
  return String(input).trim().toLowerCase();
}

const files = await fg('**/*.{md,mdx}', { cwd: sourceDir, absolute: true });
const publicNotes = [];
const slugByName = new Map();
const warnings = [];

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  const parsed = matter(raw);
  if (parsed.data.publish !== true || parsed.data.status !== 'canon') continue;
  for (const field of requiredFields) {
    if (!parsed.data[field]) throw new Error(`Public note is missing required frontmatter "${field}": ${path.relative(siteRoot, file)}`);
  }
  const slug = cleanSlug(parsed.data.slug);
  if (publicNotes.some((note) => note.slug === slug)) throw new Error(`Duplicate published slug "${slug}" in ${path.relative(siteRoot, file)}`);
  const note = { file, parsed, slug };
  publicNotes.push(note);
  const basename = path.basename(file, path.extname(file));
  slugByName.set(noteKey(basename), slug);
  slugByName.set(noteKey(parsed.data.title), slug);
}

await fs.emptyDir(outDir);
await fs.ensureDir(publicAssetDir);

async function copyAsset(category, filename) {
  const source = path.join(assetRoot, category, filename);
  if (!(await fs.pathExists(source))) return null;
  const target = path.join(publicAssetDir, category.toLowerCase(), filename);
  await fs.ensureDir(path.dirname(target));
  await fs.copy(source, target);
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
  await fs.ensureDir(path.dirname(outFile));
  for (const field of ['image', 'headerImage']) {
    const value = parsed.data[field];
    if (!value || typeof value !== 'string') continue;
    if (value.startsWith('/assets/images/')) await copyAsset('Images', path.basename(value));
    if (value.startsWith('/assets/maps/')) await copyAsset('Maps', path.basename(value));
    if (!value.startsWith('/')) {
      const imageUrl = await copyAsset('Images', path.basename(value));
      const mapUrl = imageUrl ? null : await copyAsset('Maps', path.basename(value));
      parsed.data[field] = imageUrl ?? mapUrl ?? value;
    }
  }
  if (parsed.data.asset && parsed.data.type === 'image') await copyAsset('Images', parsed.data.asset);
  const content = await convertContent(parsed.content, file, parsed.data.title);
  await fs.writeFile(outFile, matter.stringify(content, parsed.data));
  console.log(`Published ${path.relative(sourceDir, file)} -> ${path.relative(outDir, outFile)}`);
}

for (const warning of [...new Set(warnings)]) console.warn(`Warning: ${warning}`);
console.log(`Synced ${publicNotes.length} public notes from Vault/Lore.`);
