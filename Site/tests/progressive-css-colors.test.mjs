import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  convertValue,
  enhanceCssColors,
  progressiveCssColors,
} from '../plugins/progressive-css-colors.mjs';

async function collectFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolutePath));
    else if (/\.(?:astro|css)$/.test(entry.name)) files.push(absolutePath);
  }

  return files;
}

function extractStyleSources(filePath, source) {
  if (filePath.endsWith('.css')) return [source];
  return [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1]);
}

test('emits sRGB fallback followed by P3 and OKLCH support layers', () => {
  const source = '.card { color: #fff; background: rgba(184, 135, 70, .12); }';
  const result = enhanceCssColors(source);

  assert.match(result, /color: #fff/);
  assert.match(result, /@supports \(color: color\(display-p3 1 1 1\)\)/);
  assert.match(result, /color: color\(display-p3 1 1 1\)/);
  assert.match(result, /@supports \(color: oklch\(50% 0\.1 120\)\)/);
  assert.match(result, /color: oklch\(100% 0 0\)/);
  assert.ok(result.indexOf('display-p3') < result.lastIndexOf('oklch'));
});

test('enhances custom properties inside support-gated mirrored rules', () => {
  const result = enhanceCssColors(':root { --accent: #b88746; }');

  assert.match(result, /@supports \(color: color\(display-p3/);
  assert.match(result, /--accent: color\(display-p3/);
  assert.match(result, /@supports \(color: oklch/);
  assert.match(result, /--accent: oklch/);
});

test('upgrades gradients, shadows, named colours, and color-mix interpolation', () => {
  const input = 'linear-gradient(145deg, rgba(184,135,70,.12), white), 0 1rem 2rem #0003, color-mix(in srgb, #fff 50%, transparent)';
  const p3 = convertValue(input, 'p3');
  const perceptual = convertValue(input, 'oklch');

  assert.equal(p3.changed, true);
  assert.match(p3.value, /color\(display-p3/);
  assert.match(p3.value, /color-mix\(in display-p3/);
  assert.equal(perceptual.changed, true);
  assert.match(perceptual.value, /oklch/);
  assert.match(perceptual.value, /color-mix\(in oklch/);
});

test('does not rewrite URLs, currentColor, transparent, or variable names', () => {
  const input = 'url("icon-#fff.svg") currentColor transparent var(--white, white)';
  const result = convertValue(input, 'oklch');

  assert.match(result.value, /url\("icon-#fff\.svg"\)/);
  assert.match(result.value, /currentColor transparent/);
  assert.match(result.value, /var\(--white, oklch/);
  assert.doesNotMatch(result.value, /--oklch/);
});

test('uses authored OKLCH values to refine both modern tiers', () => {
  const source = `
    :root { --accent: #b88746; }
    @supports (color: oklch(50% .1 120)) {
      :root { --accent: oklch(65.8% .102 72.2); }
    }
  `;
  const result = enhanceCssColors(source);

  assert.match(result, /--accent: color\(display-p3 0\.69224 0\.53692 0\.31512\)/);
  const authored = result.lastIndexOf('--accent: oklch(65.8% .102 72.2)');
  const computed = result.lastIndexOf('--accent: oklch(65.825% 0.10178 72.153)');
  assert.ok(authored > computed);
});

test('plugin filters non-site and non-CSS modules', () => {
  const plugin = progressiveCssColors();

  assert.equal(plugin.transform('.x{color:#fff}', '/repo/node_modules/pkg/style.css'), null);
  assert.equal(plugin.transform('export default {}', '/repo/Site/src/file.js'), null);
  assert.ok(plugin.transform('.x{color:#fff}', '/repo/Site/src/styles/test.css'));
});

test('all authored CSS and Astro style blocks transform idempotently', async () => {
  const roots = [
    path.join(process.cwd(), 'src'),
    path.join(process.cwd(), 'vendor', 'starlight-ion-theme'),
  ];
  let sourceCount = 0;
  let enhancedCount = 0;

  for (const root of roots) {
    for (const filePath of await collectFiles(root)) {
      const source = await readFile(filePath, 'utf8');
      for (const styleSource of extractStyleSources(filePath, source)) {
        sourceCount += 1;
        const enhanced = enhanceCssColors(styleSource);
        assert.equal(
          enhanceCssColors(enhanced),
          enhanced,
          `Expected idempotent colour enhancement for ${path.relative(process.cwd(), filePath)}`,
        );
        if (enhanced !== styleSource) enhancedCount += 1;
      }
    }
  }

  assert.ok(sourceCount > 0, 'Expected authored CSS sources to be discovered');
  assert.ok(enhancedCount > 0, 'Expected at least one authored stylesheet to contain convertible colours');
});
