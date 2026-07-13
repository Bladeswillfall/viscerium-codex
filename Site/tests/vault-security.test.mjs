import test from 'node:test';
import assert from 'node:assert/strict';
import { validateVaultNotes } from '../scripts/validate-vault-notes.mjs';

function manifest(content) {
  return {
    records: [{
      file: '/tmp/viscerium-security-fixture.md',
      data: {
        publish: true,
        status: 'canon',
        title: 'Security fixture',
        description: 'Validation fixture.',
      },
      content,
    }],
  };
}

function validateQuietly(content) {
  const originalError = console.error;
  const errors = [];
  console.error = (...values) => errors.push(values.join(' '));
  try {
    return { valid: validateVaultNotes(manifest(content)), errors };
  } finally {
    console.error = originalError;
  }
}

test('published notes allow inert examples inside code spans and fences', () => {
  const result = validateQuietly([
    'Ordinary lore text.',
    '',
    '`<script>alert(1)</script>`',
    '',
    '```html',
    '<iframe src="https://example.com"></iframe>',
    '```',
  ].join('\n'));

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('published notes reject active HTML and unsafe URL schemes', async (t) => {
  const cases = [
    ['script tag', '<script>alert(1)</script>'],
    ['iframe tag', '<iframe src="https://example.com"></iframe>'],
    ['inline event handler', '<img src="/safe.png" onerror="alert(1)">'],
    ['HTML javascript URL', '<a href="javascript:alert(1)">Open</a>'],
    ['Markdown javascript URL', '[Open](javascript:alert(1))'],
    ['HTML data document', '<a href="data:text/html,<script>alert(1)</script>">Open</a>'],
    ['remote MDX module', "import Widget from 'https://example.com/widget.js';"],
  ];

  for (const [name, content] of cases) {
    await t.test(name, () => {
      const result = validateQuietly(content);
      assert.equal(result.valid, false);
      assert.ok(result.errors.length > 0);
    });
  }
});
