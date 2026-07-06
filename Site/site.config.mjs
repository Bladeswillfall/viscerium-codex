export default {
  title: 'VISCERIUM',
  description: 'The public worldbuilding codex for VISCERIUM.',
  site: 'https://example.com',
  loreSourceDir: '../Vault/Lore',
  vaultAssetDir: '../Vault/Assets',
  githubRepoUrl: 'https://github.com/Bladeswillfall/viscerium-codex',
  giscus: {
    repo: process.env.PUBLIC_GISCUS_REPO,
    repoId: process.env.PUBLIC_GISCUS_REPO_ID,
    category: process.env.PUBLIC_GISCUS_CATEGORY,
    categoryId: process.env.PUBLIC_GISCUS_CATEGORY_ID,
  },
};
