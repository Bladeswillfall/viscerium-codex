import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';

const siteRoot = process.cwd();
const sourceDir = path.resolve(siteRoot, process.env.LORE_SOURCE_DIR ?? '../Lore');
const outDir = path.resolve(siteRoot, 'src/content/docs');

function slugify(input) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9/]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/\/+/g, '/');
}

function cleanSlug(slug) {
  return slug.replace(/^\/|\/$/g, '');
}

const files = await fg('**/*.md', {
  cwd: sourceDir,
  absolute: true,
});

const publicFiles = [];
const slugByName = new Map();

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  const parsed = matter(raw);

  if (parsed.data.publish !== true || parsed.data.status !== 'canon') {
    continue;
  }

  if (!parsed.data.title) {
    throw new Error(`Missing required frontmatter "title" in ${file}`);
  }

  if (!parsed.data.description) {
    throw new Error(`Missing required frontmatter "description" in ${file}`);
  }

  const rel = path.relative(sourceDir, file).replace(/\\/g, '/');
  const noExt = rel.replace(/\.md$/, '');
  const slug = cleanSlug(parsed.data.slug ? parsed.data.slug : slugify(noExt));

  publicFiles.push({ file, parsed, slug });

  const basename = path.basename(noExt).toLowerCase();
  slugByName.set(basename, slug);
  slugByName.set(String(parsed.data.title).toLowerCase(), slug);
}

await fs.emptyDir(outDir);

function convertWikilinks(content) {
  return content.replace(/!?\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (match, target, alias) => {
    if (match.startsWith('!')) {
      return match; // Leave embedded images/files alone in V1.
    }

    const key = target.trim().toLowerCase();
    const slug = slugByName.get(key);
    const label = alias?.trim() || target.trim();

    if (!slug) {
      return label;
    }

    return `[${label}](/${slug}/)`;
  });
}

for (const { file, parsed, slug } of publicFiles) {
  const outFile = path.join(outDir, `${slug}.md`);
  await fs.ensureDir(path.dirname(outFile));

  const content = convertWikilinks(parsed.content);
  await fs.writeFile(outFile, matter.stringify(content, parsed.data));

  console.log(`Published ${path.relative(sourceDir, file)} -> ${path.relative(outDir, outFile)}`);
}

console.log(`Synced ${publicFiles.length} public notes.`);
