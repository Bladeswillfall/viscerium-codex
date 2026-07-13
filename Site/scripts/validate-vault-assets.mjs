import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import fg from 'fast-glob';
import siteConfig from '../site.config.mjs';
import { isMainModule } from './script-entry.mjs';

const siteRoot = process.cwd();
const defaultAssetRoot = path.resolve(siteRoot, siteConfig.vaultAssetDir);
const unsafeSvgPatterns = [
  { label: 'script element', pattern: /<\s*script\b/i },
  { label: 'foreignObject element', pattern: /<\s*foreignObject\b/i },
  { label: 'inline event handler', pattern: /<[^>]*\son[a-z][\w:-]*\s*=/i },
  { label: 'javascript URL', pattern: /(?:href|xlink:href)\s*=\s*["']\s*javascript:/i },
  { label: 'HTML data URL', pattern: /(?:href|xlink:href)\s*=\s*["']\s*data\s*:\s*text\/html/i },
];

function relative(file) {
  return path.relative(siteRoot, file).replace(/\\/g, '/');
}

export async function validateVaultAssets({ rootDir = defaultAssetRoot } = {}) {
  const files = await fg('**/*.svg', {
    cwd: rootDir,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
  });
  let failed = false;

  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    for (const { label, pattern } of unsafeSvgPatterns) {
      if (!pattern.test(source)) continue;
      console.error(`SVG asset contains a forbidden ${label}: ${relative(file)}`);
      failed = true;
    }
  }

  if (!failed) console.log(`Validated ${files.length} SVG asset${files.length === 1 ? '' : 's'}.`);
  return !failed;
}

if (isMainModule(import.meta.url)) {
  const valid = await validateVaultAssets();
  if (!valid) process.exitCode = 1;
}
