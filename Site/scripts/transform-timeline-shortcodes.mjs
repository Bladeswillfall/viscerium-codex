import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { LANE_MODES, TIMELINE_IDS } from '../src/lib/timeline/core.mjs';

const siteRoot = process.cwd();
const docsDir = path.resolve(siteRoot, 'src/content/docs');
const componentPath = path.resolve(siteRoot, 'src/components/timeline/TimelineEmbed.astro');

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (String(value).toLowerCase() === 'true') return true;
  if (String(value).toLowerCase() === 'false') return false;
  return fallback;
}

function parseInlineSpec(id, spec) {
  const block = { timeline: id };
  for (const pair of String(spec ?? '').matchAll(/([a-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi)) {
    const key = pair[1].toLowerCase();
    const value = pair[2] ?? pair[3] ?? pair[4] ?? '';
    if (key === 'timeline') block.timeline = value;
    if (key === 'calendar') block.defaultCalendar = value;
    if (key === 'lane' || key === 'lanemode') block.laneMode = value;
    if (key === 'filters' || key === 'showfilters') block.showFilters = parseBoolean(value, true);
    if (key === 'minimap' || key === 'showminimap') block.showMinimap = parseBoolean(value, true);
    if (key === 'legend' || key === 'showlegend') block.showLegend = parseBoolean(value, true);
    if (key === 'compact') block.compact = parseBoolean(value, false);
  }
  return block;
}

function normalizeBlock(value) {
  if (!value || typeof value !== 'object') return null;
  if (!TIMELINE_IDS.includes(value.timeline)) return null;
  const laneMode = LANE_MODES.includes(value.laneMode) ? value.laneMode : 'unified';
  return {
    timeline: value.timeline,
    defaultCalendar: typeof value.defaultCalendar === 'string' ? value.defaultCalendar : undefined,
    laneMode,
    showFilters: parseBoolean(value.showFilters, true),
    showMinimap: parseBoolean(value.showMinimap, true),
    showLegend: parseBoolean(value.showLegend, true),
    compact: parseBoolean(value.compact, false),
  };
}

function relativeImport(file) {
  let relative = path.relative(path.dirname(file), componentPath).replace(/\\/g, '/');
  if (!relative.startsWith('.')) relative = `./${relative}`;
  return relative;
}

function warning(message) {
  const safe = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<aside className="codex-warning"><strong>Timeline shortcode warning:</strong> ${safe}</aside>`;
}

const files = (await fg('**/*.{md,mdx}', { cwd: docsDir, absolute: true })).sort();
for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  if (!/^\s*\[Timeline:[^\]]+\]\s*$/im.test(raw)) continue;
  const parsed = matter(raw);
  const blocks = parsed.data.timelineBlocks && typeof parsed.data.timelineBlocks === 'object' ? parsed.data.timelineBlocks : {};
  let used = false;
  let fence = null;
  const content = parsed.content.split(/\r?\n/).map((line) => {
    const fenceStart = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const end = line.match(fence.marker === '`' ? /^\s*`{3,}/ : /^\s*~{3,}/);
      if (end && end[0].trim().length >= fence.length) fence = null;
      return line;
    }
    if (fenceStart) {
      fence = { marker: fenceStart[1][0], length: fenceStart[1].length };
      return line;
    }
    const match = line.match(/^\s*\[Timeline:([^\]\s]+)(?:\s+([^\]]+))?\]\s*$/i);
    if (!match) return line;
    const id = match[1];
    const inline = parseInlineSpec(id, match[2]);
    const block = normalizeBlock(blocks[id]) ?? normalizeBlock(inline);
    if (!block) return warning(`No valid timeline block found for '${id}'.`);
    used = true;
    const props = [
      `timelineId=${JSON.stringify(block.timeline)}`,
      block.defaultCalendar ? `defaultCalendar=${JSON.stringify(block.defaultCalendar)}` : '',
      `laneMode=${JSON.stringify(block.laneMode)}`,
      `showFilters={${block.showFilters}}`,
      `showMinimap={${block.showMinimap}}`,
      `showLegend={${block.showLegend}}`,
      `compact={${block.compact}}`,
    ].filter(Boolean).join(' ');
    return `<TimelineEmbed ${props} />`;
  }).join('\n');

  if (!used) continue;
  const outFile = file.replace(/\.md$/i, '.mdx');
  const imported = `import TimelineEmbed from '${relativeImport(outFile)}';\n\n${content}`;
  await fs.writeFile(outFile, matter.stringify(imported, parsed.data));
  if (outFile !== file) await fs.remove(file);
  console.log(`Expanded timeline shortcode in ${path.relative(docsDir, outFile)}`);
}
