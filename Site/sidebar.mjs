import fs from 'node:fs/promises';
import path from 'node:path';

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

function titleFromFrontmatter(raw) {
  const match = raw.match(/^---\n[\s\S]*?^title:\s*(.+?)\s*$/m);
  return match?.[1]?.replace(/^['\"]|['\"]$/g, '');
}

function sortSidebarEntries(entries) {
  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

function ensureGroup(groups, segment) {
  if (!groups.has(segment)) {
    groups.set(segment, { links: [], groups: new Map() });
  }
  return groups.get(segment);
}

function buildEntries(groups) {
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([segment, group]) => ({
    label: iconLabel(groupIcons[segment], labelFromSegment(segment)),
    items: [
      ...sortSidebarEntries(group.links),
      ...buildEntries(group.groups),
    ],
    collapsed: true,
  }));
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
      const title = titleFromFrontmatter(raw) ?? labelFromSegment(path.basename(id));
      if (id === 'index') {
        rootItems.unshift({ label: iconLabel('home', title), link: '/', badge: { text: 'Canon', variant: 'note' } });
        continue;
      }

      const segments = id.split('/');
      const link = `/${id}/`;
      if (segments.length === 1) {
        rootItems.push({ label: title, link });
        continue;
      }

      let group = ensureGroup(groups, segments[0]);
      for (const segment of segments.slice(1, -1)) {
        group = ensureGroup(group.groups, segment);
      }
      group.links.push({ label: title, link });
    }

    return [
      ...sortSidebarEntries(rootItems),
      ...buildEntries(groups),
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
