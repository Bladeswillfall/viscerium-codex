import fs from 'node:fs/promises';
import path from 'node:path';
import { iconLabel } from './src/lib/icon-spec.mjs';

const docsDir = new URL('./src/content/docs/', import.meta.url);

const groupIcons = {
  calendar: 'fa-solid fa-calendar-days',
  characters: 'fa-solid fa-people-group',
  citadel: 'fa-solid fa-shield-halved',
  'degel-system': 'fa-solid fa-sun',
  demo: 'fa-solid fa-flask',
  entropy: 'fa-solid fa-atom',
  eras: 'fa-solid fa-hourglass-half',
  events: 'fa-solid fa-calendar-days',
  factions: 'fa-solid fa-flag',
  images: 'fa-regular fa-image',
  locations: 'fa-solid fa-location-dot',
  maps: 'fa-solid fa-map',
  nearsight: 'fa-solid fa-tower-broadcast',
  smog: 'fa-solid fa-industry',
};

function labelFromSegment(segment) {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function frontmatterValue(raw, key) {
  const match = raw.match(new RegExp(`^---\\n[\\s\\S]*?^${key}:\\s*(.+?)\\s*$`, 'm'));
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
      const title = frontmatterValue(raw, 'title') ?? labelFromSegment(path.basename(id));
      const slug = frontmatterValue(raw, 'slug') ?? id;
      const articleIcon = frontmatterValue(raw, 'sidebarIcon') ?? frontmatterValue(raw, 'icon');
      const link = slug === 'index' ? '/' : `/${slug.replace(/^\/+|\/+$/g, '')}/`;
      if (id === 'index') {
        rootItems.unshift({
          label: iconLabel(articleIcon ?? 'fa-solid fa-house', title),
          link: '/',
          badge: { text: 'Canon', variant: 'note' },
        });
        continue;
      }

      const segments = id.split('/');
      if (segments.length === 1) {
        rootItems.push({ label: iconLabel(articleIcon, title), link });
        continue;
      }

      let group = ensureGroup(groups, segments[0]);
      for (const segment of segments.slice(1, -1)) {
        group = ensureGroup(group.groups, segment);
      }
      group.links.push({
        label: iconLabel(articleIcon, segments.at(-1) === 'index' ? 'Overview' : title),
        link,
      });
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
