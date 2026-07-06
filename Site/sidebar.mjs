import fs from 'node:fs/promises';
import path from 'node:path';
const docsDir = new URL('./src/content/docs/', import.meta.url);

function compareEntries(a, b) {
  if (a.id === 'index') return -1;
  if (b.id === 'index') return 1;
  return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
}

export async function buildSidebar() {
  try {
    const files = await walk(docsDir.pathname);
    const entries = [];

    for (const file of files) {
      const rel = path.relative(docsDir.pathname, file).replace(/\\/g, '/');
      if (!rel.endsWith('.md') && !rel.endsWith('.mdx')) continue;
      const id = rel.replace(/\.(md|mdx)$/, '');
      const title = id;
      const link = id === 'index' ? '/' : `/${id}/`;
      entries.push({ id, title, link });
    }

    return entries.sort(compareEntries).map(({ link }) => ({ link }));
  } catch {
    return [{ link: '/' }];
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  entries.sort((a, b) => a.name.localeCompare(b.name));
  const files = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full;
  }));
  return files.flat();
}
