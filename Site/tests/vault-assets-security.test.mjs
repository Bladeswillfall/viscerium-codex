import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { validateVaultAssets } from '../scripts/validate-vault-assets.mjs';

async function validateFixture(source, filename = 'fixture.svg') {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'viscerium-svg-security-'));
  const originalError = console.error;
  const errors = [];
  console.error = (...values) => errors.push(values.join(' '));

  try {
    await writeFile(path.join(rootDir, filename), source);
    const valid = await validateVaultAssets({ rootDir });
    return { valid, errors };
  } finally {
    console.error = originalError;
    await rm(rootDir, { recursive: true, force: true });
  }
}

test('SVG validation accepts ordinary vector markup', async () => {
  const result = await validateFixture(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <path d="M0 0h10v10H0z" />
    </svg>
  `);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('SVG validation rejects scriptable constructs', async (t) => {
  const cases = [
    ['script', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],
    ['foreignObject', '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>HTML</div></foreignObject></svg>'],
    ['event handler', '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>'],
    ['javascript URL', '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"></a></svg>'],
    ['HTML data URL', '<svg xmlns="http://www.w3.org/2000/svg"><a href="data:text/html,test"></a></svg>'],
  ];

  for (const [name, source] of cases) {
    await t.test(name, async () => {
      const result = await validateFixture(source);
      assert.equal(result.valid, false);
      assert.ok(result.errors.length > 0);
    });
  }
});

test('asset validation rejects content that does not match its extension', async () => {
  const result = await validateFixture('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'fixture.webp');

  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /does not match \.webp extension/);
});

test('asset validation accepts a matching WebP signature', async () => {
  const result = await validateFixture(
    Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]),
    'fixture.webp',
  );

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});
