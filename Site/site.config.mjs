const env = process.env;

export default {
  title: 'VISCERIUM',
  description: 'The public worldbuilding codex for VISCERIUM.',
  site: env.SITE_URL ?? 'https://viscerium-codex.pages.dev',
  loreSourceDir: '../Vault/Lore',
  vaultAssetDir: '../Vault/Assets',
  githubRepoUrl: 'https://github.com/Bladeswillfall/viscerium-codex',
  giscus: {
    repo: env.PUBLIC_GISCUS_REPO ?? 'Bladeswillfall/viscerium-codex',
    repoId: env.PUBLIC_GISCUS_REPO_ID,
    category: env.PUBLIC_GISCUS_CATEGORY ?? 'General',
    categoryId: env.PUBLIC_GISCUS_CATEGORY_ID,
    mapping: env.PUBLIC_GISCUS_MAPPING ?? 'pathname',
    strict: env.PUBLIC_GISCUS_STRICT ?? '0',
    reactionsEnabled: env.PUBLIC_GISCUS_REACTIONS_ENABLED ?? '1',
    emitMetadata: env.PUBLIC_GISCUS_EMIT_METADATA ?? '0',
    inputPosition: env.PUBLIC_GISCUS_INPUT_POSITION ?? 'bottom',
    theme: env.PUBLIC_GISCUS_THEME ?? 'noborder_dark',
    lang: env.PUBLIC_GISCUS_LANG ?? 'en',
    loading: env.PUBLIC_GISCUS_LOADING ?? 'lazy',
  },
};
