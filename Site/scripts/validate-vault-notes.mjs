import path from 'node:path';
import process from 'node:process';
import { parseIconSpec } from '../src/lib/icon-spec.mjs';
import { loadVaultContent } from './content-manifest.mjs';
import { isMainModule } from './script-entry.mjs';

const siteRoot = process.cwd();
const requiredPublicFields = ['title', 'description'];
const iconFields = ['icon', 'sidebarIcon', 'titleIcon'];
const allowedStatuses = new Set(['canon']);

function relative(file) {
  return path.relative(siteRoot, file).replace(/\\/g, '/');
}

export function validateVaultNotes(manifest) {
  let failed = false;

  function fail(message) {
    console.error(message);
    failed = true;
  }

  function validateIcon(spec, label, file) {
    if (spec === undefined || spec === null || spec === '') return;
    if (typeof spec !== 'string' || !parseIconSpec(spec)) {
      fail(`Invalid ${label} icon specification in ${relative(file)}: ${JSON.stringify(spec)}`);
    }
  }

  for (const { file, data, content } of manifest.records) {
    if (data.publish !== true) continue;

    if (!allowedStatuses.has(data.status)) {
      fail(`Published note must use status: canon: ${relative(file)}${data.status ? ` (found status: ${data.status})` : ''}`);
      continue;
    }

    for (const field of requiredPublicFields) {
      if (!data[field]) fail(`Published note is missing required frontmatter "${field}": ${relative(file)}`);
    }

    for (const field of iconFields) validateIcon(data[field], `frontmatter "${field}"`, file);

    for (const match of content.matchAll(/^\s{0,3}#{1,6}\s+\[icon:([^\]]+)\]/gim)) {
      validateIcon(match[1], 'heading shortcode', file);
    }
  }

  if (!failed) console.log(`Validated ${manifest.records.length} vault source note(s).`);
  return !failed;
}

if (isMainModule(import.meta.url)) {
  const valid = validateVaultNotes(await loadVaultContent());
  if (!valid) process.exitCode = 1;
}
