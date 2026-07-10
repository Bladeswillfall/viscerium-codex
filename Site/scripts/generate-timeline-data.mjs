import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';
import siteConfig from '../site.config.mjs';
import { compileTimelineRecords, TimelineCompilationError } from '../src/lib/timeline/compiler.mjs';
import { TIMELINE_IDS } from '../src/lib/timeline/core.mjs';

const siteRoot = process.cwd();
const sourceDir = path.resolve(siteRoot, siteConfig.loreSourceDir);
const outDir = path.resolve(siteRoot, 'src/data/timelines');
const validateOnly = process.argv.includes('--validate-only');

function cleanSlug(slug) {
  return String(slug).trim().replace(/^\/+|\/+$/g, '').toLowerCase();
}

function slugFromFile(file) {
  const relative = path.relative(sourceDir, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
  return relative.split('/').map((segment) => cleanSlug(segment).replace(/\s+/g, '-')).join('/');
}

function route(slug) {
  return slug === 'index' ? '/' : `/${slug}/`;
}

const files = (await fg('**/*.{md,mdx}', { cwd: sourceDir, absolute: true })).sort();
const records = [];
for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  const { data } = matter(raw);
  if (data.publish !== true || data.status !== 'canon') continue;
  const slug = data.slug === 'index' ? 'index' : slugFromFile(file);
  records.push({
    data,
    sourcePath: path.relative(sourceDir, file).replace(/\\/g, '/'),
    href: route(slug),
  });
}

try {
  const compiled = compileTimelineRecords(records);
  for (const warning of compiled.issues.filter((entry) => entry.severity === 'warning')) {
    console.warn(`${warning.sourcePath} [${warning.field}] ${warning.message}`);
  }
  if (!validateOnly) {
    await fs.ensureDir(outDir);
    await Promise.all((await fg('*.json', { cwd: outDir, absolute: true })).map((file) => fs.remove(file)));
    for (const id of TIMELINE_IDS) {
      await fs.writeJson(path.join(outDir, `${id}.json`), compiled.datasets[id], { spaces: 2 });
    }
    await fs.writeJson(path.join(outDir, 'manifest.json'), compiled.manifest, { spaces: 2 });
    console.log(`Generated ${TIMELINE_IDS.length} timeline datasets from ${compiled.events.length} event(s) and ${compiled.eras.length} era record(s).`);
  } else {
    console.log(`Validated ${compiled.events.length} timeline event(s) and ${compiled.eras.length} era record(s).`);
  }
} catch (error) {
  if (error instanceof TimelineCompilationError) {
    console.error('Timeline validation failed:');
    for (const item of error.issues) console.error(`- ${item.sourcePath} [${item.field}] ${item.message}`);
    process.exit(1);
  }
  throw error;
}
