import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const srcDir = new URL('../src/', import.meta.url);
const tokensPath = new URL('../src/styles/color-tokens.css', import.meta.url);
const colorLiteral = /#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklab|oklch)\s*\(|color\s*\(\s*display-p3|(?<![-\w])(?:black|white)(?![-\w])/gi;

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const location = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
    return entry.isDirectory() ? sourceFiles(location) : [location];
  }));
  return files.flat();
}

test('authored colours live in the progressive token palette', async () => {
  const files = (await sourceFiles(srcDir)).filter(({ pathname }) => (
    pathname.endsWith('.css') || pathname.endsWith('.astro')
  ));
  const failures = [];

  for (const file of files) {
    if (file.href === tokensPath.href) continue;
    const source = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
    const css = file.pathname.endsWith('.astro')
      ? [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n')
      : source;

    for (const match of css.matchAll(colorLiteral)) {
      const line = css.slice(0, match.index).split('\n').length;
      failures.push(`${path.relative(srcDir.pathname, file.pathname)}:${line} ${match[0]}`);
    }
  }

  assert.deepEqual(failures, [], `Move colour literals into styles/color-tokens.css:\n${failures.join('\n')}`);

  const tokens = await readFile(tokensPath, 'utf8');
  assert.match(tokens, /#[\da-f]{3,8}\b/i, 'palette needs an sRGB fallback');
  assert.match(tokens, /@supports\s*\(color:\s*oklch\(/i, 'palette needs an OKLCH tier');
  assert.match(tokens, /@media\s*\(color-gamut:\s*p3\)/i, 'palette needs a P3 tier');
});

test('the approved palette owns page and navigation surfaces', async () => {
  const tokens = await readFile(tokensPath, 'utf8');

  for (const [name, value] of Object.entries({
    oled: '#000',
    ink: '#101010',
    deep: '#484137',
    mid: '#888070',
    light: '#c8bfa8',
  })) {
    assert.match(tokens, new RegExp(`--codex-palette-${name}:\\s*${value};`, 'i'));
  }

  assert.match(tokens, /--codex-page-bg:\s*var\(--codex-palette-ink\)/);
  assert.match(tokens, /--codex-nav-bg:\s*var\(--codex-palette-oled\)/);
  assert.match(tokens, /:root\[data-theme='light'\][\s\S]*--codex-page-bg:\s*var\(--codex-palette-mid\)/);
  assert.match(tokens, /@layer\s+ion/);
});

test('text and gamut variants derive from shared colour bases', async () => {
  const tokens = await readFile(tokensPath, 'utf8');

  assert.match(tokens, /--codex-text-base:\s*#a0a0a0;/i);
  assert.match(tokens, /--codex-text-base:\s*oklch\(70\.576%\s+0\s+0\);/i);
  assert.match(tokens, /:root\[data-theme='light'\][\s\S]*--codex-text-body:\s*#151515;/i);
  assert.match(tokens, /--sl-color-text:\s*var\(--codex-text-body\);/);
  assert.match(tokens, /--sl-color-gray-2:\s*var\(--codex-text-body\);/);
  assert.match(tokens, /--sl-color-gray-3:\s*var\(--codex-text-minor\);/);
  assert.match(
    tokens,
    /--codex-text-body:\s*oklch\(from var\(--codex-text-base\) calc\(1 - l - 0\.1\) c h\);/,
  );
  assert.match(tokens, /--codex-accent-soft:\s*oklch\(from var\(--codex-accent\)/);
  assert.match(tokens, /calc\(0\.019 \* var\(--codex-chroma-scale\)\)/);
  assert.match(
    tokens,
    /@media\s*\(color-gamut:\s*p3\)\s*{\s*:root\s*{\s*--codex-chroma-scale:\s*1\.15;\s*}\s*}/,
  );
});
