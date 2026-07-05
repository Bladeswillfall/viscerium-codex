export default {
  title: process.env.SITE_TITLE ?? 'Worldbuilding Codex',
  description:
    process.env.SITE_DESCRIPTION ??
    'A public worldbuilding codex published from an Obsidian vault.',
  site: process.env.SITE_URL ?? 'https://example.com',
  loreSourceDir: process.env.LORE_SOURCE_DIR ?? '../Vault/Lore',
};
