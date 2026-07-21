import test from 'node:test';
import assert from 'node:assert/strict';

test('site identity and lore source support environment overrides', async () => {
  const original = {
    SITE_TITLE: process.env.SITE_TITLE,
    SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
    LORE_SOURCE_DIR: process.env.LORE_SOURCE_DIR,
  };

  try {
    process.env.SITE_TITLE = 'Test Codex';
    process.env.SITE_DESCRIPTION = 'Test description';
    process.env.LORE_SOURCE_DIR = '../Test/Lore';
    const { default: config } = await import(`../site.config.mjs?test=${Date.now()}`);

    assert.equal(config.title, 'Test Codex');
    assert.equal(config.description, 'Test description');
    assert.equal(config.loreSourceDir, '../Test/Lore');
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
