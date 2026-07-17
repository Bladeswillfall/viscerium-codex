import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { cleanSlug, slugToRoute } from '../src/lib/codex-paths.mjs';
import { compileTimelineRecords, TimelineCompilationError } from '../src/lib/timeline/compiler.mjs';
import { TIMELINE_IDS } from '../src/lib/timeline/core.mjs';
import { inferNoteType } from './note-inference.mjs';
import { loadVaultContent } from './content-manifest.mjs';
import { isMainModule } from './script-entry.mjs';

const siteRoot = process.cwd();
const outDir = path.resolve(siteRoot, 'src/data/timelines');
function slugFromRecord(record) {
  return record.relativePath
    .replace(/\.(md|mdx)$/i, '')
    .split('/')
    .map((segment) => cleanSlug(segment).replace(/\s+/g, '-'))
    .join('/');
}
export function reportTimelineError(error) {
  if (!(error instanceof TimelineCompilationError)) return false;
  console.error('Timeline validation failed:');
  for (const item of error.issues) console.error(`- ${item.sourcePath} [${item.field}] ${item.message}`);
  return true;
}

export async function generateTimelineData({ manifest, validateOnly = false } = {}) {
  const vault = manifest ?? await loadVaultContent();
  const records = [];

  for (const record of vault.records) {
    if (record.data.publish !== true || record.data.status !== 'canon') continue;
    const data = { ...record.data };
    data.type ||= inferNoteType(record.file, vault.rootDir);
    const slug = data.slug === 'index' ? 'index' : slugFromRecord(record);
    records.push({
      data,
      sourcePath: record.relativePath,
      href: slugToRoute(slug),
    });
  }

  const compiled = compileTimelineRecords(records);
  for (const warning of compiled.issues.filter((entry) => entry.severity === 'warning')) {
    console.warn(`${warning.sourcePath} [${warning.field}] ${warning.message}`);
  }

  if (validateOnly) {
    console.log(`Validated ${compiled.events.length} timeline event(s) and ${compiled.eras.length} era record(s).`);
    return compiled;
  }

  await fs.mkdir(outDir, { recursive: true });
  await Promise.all((await fg('*.json', { cwd: outDir, absolute: true })).map((file) => fs.rm(file, { force: true })));
  for (const id of TIMELINE_IDS) {
    await fs.writeFile(path.join(outDir, `${id}.json`), `${JSON.stringify(compiled.datasets[id], null, 2)}\n`, 'utf8');
  }
  await fs.writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(compiled.manifest, null, 2)}\n`, 'utf8');
  console.log(`Generated ${TIMELINE_IDS.length} timeline datasets from ${compiled.events.length} event(s) and ${compiled.eras.length} era record(s).`);
  return compiled;
}

if (isMainModule(import.meta.url)) {
  try {
    await generateTimelineData({ validateOnly: process.argv.includes('--validate-only') });
  } catch (error) {
    if (!reportTimelineError(error)) console.error(error);
    process.exitCode = 1;
  }
}
