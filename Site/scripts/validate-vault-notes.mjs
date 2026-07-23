import path from 'node:path';
import process from 'node:process';
import { parseIconSpec } from '../src/lib/icon-spec.mjs';
import { loadVaultContent } from './content-manifest.mjs';
import { isMainModule } from './script-entry.mjs';

const siteRoot = process.cwd();
const requiredPublicFields = ['title', 'description'];
const iconFields = ['icon', 'sidebarIcon', 'titleIcon'];
const forbiddenActiveTag = /<\s*\/?\s*(?:script|iframe|object|embed|base)\b/i;
const inlineEventHandler = /<[^>]*\son[a-z][\w:-]*\s*=/i;
const unsafeUrlScheme = /(?:\b(?:href|src|action|formaction)\s*=\s*["']?\s*|\]\(\s*)(?:javascript:|data\s*:\s*text\/html)/i;
const remoteMdxModule = /^\s*(?:import\s+(?:[^'"\n]+\s+from\s+)?|export[^\n]*\s+from\s+)["'](?:https?:|data:|javascript:)/im;
const remoteDynamicImport = /\bimport\s*\(\s*["'](?:https?:|data:|javascript:)/i;

function relative(file) {
  return path.relative(siteRoot, file).replace(/\\/g, '/');
}

function executableSurface(content) {
  return String(content ?? '')
    .replace(/(`{3,}|~{3,})[\s\S]*?\1/g, '')
    .replace(/`[^`\n]*`/g, '');
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

  function validateActiveContent(content, file) {
    const surface = executableSurface(content);
    if (forbiddenActiveTag.test(surface)) {
      fail(`Published note contains a forbidden active HTML tag: ${relative(file)}`);
    }
    if (inlineEventHandler.test(surface)) {
      fail(`Published note contains an inline HTML event handler: ${relative(file)}`);
    }
    if (unsafeUrlScheme.test(surface)) {
      fail(`Published note contains a javascript: or data:text/html URL: ${relative(file)}`);
    }
    if (remoteMdxModule.test(surface) || remoteDynamicImport.test(surface)) {
      fail(`Published note imports executable MDX code from a remote URL: ${relative(file)}`);
    }
  }

  for (const { file, data, content } of manifest.records) {
    if (Object.hasOwn(data, 'publish')) {
      fail(`Lore note uses retired frontmatter "publish"; remove it and use status: published when public: ${relative(file)}`);
    }
    if (data.status === 'canon') {
      fail(`Lore note uses retired status: canon; use status: published when public: ${relative(file)}`);
      continue;
    }
    if (data.status !== 'published') continue;

    if (Object.hasOwn(data, 'slug')) {
      fail(`Published note routes are derived from file paths; remove frontmatter "slug": ${relative(file)}`);
    }

    for (const field of requiredPublicFields) {
      if (!data[field]) fail(`Published note is missing required frontmatter "${field}": ${relative(file)}`);
    }

    for (const field of iconFields) validateIcon(data[field], `frontmatter "${field}"`, file);

    for (const match of content.matchAll(/^\s{0,3}#{1,6}\s+\[icon:([^\]]+)\]/gim)) {
      validateIcon(match[1], 'heading shortcode', file);
    }

    validateActiveContent(content, file);
  }

  if (!failed) console.log(`Validated ${manifest.records.length} vault source note(s).`);
  return !failed;
}

if (isMainModule(import.meta.url)) {
  const valid = validateVaultNotes(await loadVaultContent());
  if (!valid) process.exitCode = 1;
}
