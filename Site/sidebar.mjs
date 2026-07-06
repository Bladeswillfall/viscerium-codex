import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const docsDir = new URL('./src/content/docs/', import.meta.url);

const groupIcons = {
  characters: 'character',
  events: 'event',
  factions: 'faction',
  images: 'image',
  locations: 'location',
  maps: 'map',
};

function iconLabel(icon, label) {
  return icon ? `[${icon}] ${label}` : label;
}

function labelFromSegment(segment) {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function buildSidebar() {
  try {
    const files = await walk(docsDir.pathname);
    const groups = new Map();
    const rootItems = [];

    for (const file of files) {
      const rel = path.relative(docsDir.pathname, file).replace(/\\/g, '/');
      if (!rel.endsWith('.md') && !rel.endsWith('.mdx')) continue;
      const id = rel.replace(/\.(md|mdx)$/, '');
      const raw = await fs.readFile(file, 'utf8');
      const title = matter(raw).data.title ?? labelFromSegment(path.basename(id));
      if (id === 'index') {
        rootItems.unshift({ label: iconLabel('home', title), link: '/', badge: { text: 'Canon', variant: 'note' } });
        continue;
      }
      const [group, ...rest] = id.split('/');
      const link = `/${id}/`;
      if (rest.length === 0) {
        rootItems.push({ label: title, link });
        continue;
      }
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push({ label: title, link });
    }

    return [
      ...rootItems.sort((a, b) => a.label.localeCompare(b.label)),
      ...[...groups.entries()].sort().map(([group, items]) => ({
        label: iconLabel(groupIcons[group], labelFromSegment(group)),
        items: items.sort((a, b) => a.label.localeCompare(b.label)),
        collapsed: true,
      })),
    ];
  } catch {
    return [{ label: 'Start Here', link: '/' }];
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full;
  }));
  return files.flat();
}
