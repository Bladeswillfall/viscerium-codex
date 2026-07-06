import path from 'node:path';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';

import siteConfig from './site.config.mjs';

const siteRoot = process.cwd();
const sourceDir = path.resolve(siteRoot, siteConfig.loreSourceDir);

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

function labelFromFolder(folder) {
  return folder
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function buildSidebar() {
  if (!(await fs.pathExists(sourceDir))) {
    return [];
  }

  const files = await fg('**/*.md', {
    cwd: sourceDir,
    absolute: true,
  });

  const rootPages = [];
  const folders = new Map();

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = matter(raw);

    if (parsed.data.publish !== true || parsed.data.status !== 'canon') {
      continue;
    }

    const rel = path.relative(sourceDir, file).replace(/\\/g, '/');
    const parts = rel.split('/');

    if (parts.length === 1) {
      const slug = parsed.data.slug ? String(parsed.data.slug).replace(/^\/|\/$/g, '') : slugify(rel.replace(/\.md$/, ''));
      rootPages.push(slug === 'start-here' ? 'index' : slug);
      continue;
    }

    const folder = parts[0];
    const directory = slugify(folder);
    folders.set(folder, {
      label: labelFromFolder(folder),
      items: [{ autogenerate: { directory } }],
    });
  }

  const sidebar = [];

  if (rootPages.includes('index')) {
    sidebar.push({ label: 'Start Here', items: ['index'] });
  }

  for (const [, group] of [...folders].sort(([a], [b]) => a.localeCompare(b))) {
    sidebar.push(group);
  }

  return sidebar;
}
