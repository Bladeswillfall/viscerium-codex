import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const docsDir = new URL('./src/content/docs/', import.meta.url);

const defaultIcon = 'i-codex:scroll';
const groupIcons = {
  characters: 'i-codex:users',
  events: 'i-codex:sword',
  factions: 'i-codex:flag',
  images: 'i-codex:image',
  locations: 'i-codex:pin',
  maps: 'i-codex:map',
};

function iconForId(id) {
  if (id === 'index') return 'i-codex:home';
  return groupIcons[id.split('/')[0]] ?? defaultIcon;
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
        rootItems.unshift({ icon: iconForId(id), label: title, link: '/' });
        continue;
      }
      const [group, ...rest] = id.split('/');
      const link = `/${id}/`;
      if (rest.length === 0) {
        rootItems.push({ icon: iconForId(id), label: title, link });
        continue;
      }
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push({ icon: iconForId(id), label: title, link });
    }

    return [
      ...rootItems.sort((a, b) => a.label.localeCompare(b.label)),
      ...[...groups.entries()].sort().map(([group, items]) => ({
        icon: groupIcons[group] ?? defaultIcon,
        label: labelFromSegment(group),
        items: items.sort((a, b) => a.label.localeCompare(b.label)),
        collapsed: true,
      })),
    ];
  } catch {
    return [{ icon: iconForId('index'), label: 'Start Here', link: '/' }];
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
