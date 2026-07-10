import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import fg from 'fast-glob';
import matter from 'gray-matter';
import siteConfig from '../site.config.mjs';
import { parseIconSpec } from '../src/lib/icon-spec.mjs';

const siteRoot = process.cwd();
const sourceDir = path.resolve(siteRoot, siteConfig.loreSourceDir);
const files = await fg('**/*.{md,mdx}', { cwd: sourceDir, absolute: true });
const requiredPublicFields = ['title', 'description'];
const iconFields = ['icon', 'sidebarIcon', 'titleIcon'];
const allowedStatuses = new Set(['canon']);
let failed = false;

function relative(file) {
  return path.relative(siteRoot, file).replace(/\\/g, '/');
}

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

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  const { data, content } = matter(raw);

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

if (failed) process.exit(1);
console.log(`Validated ${files.length} vault source note(s).`);
