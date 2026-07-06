export default {
  title: 'Worldbuilding Codex',
  description: 'A reusable Obsidian-powered worldbuilding codex.',
  site: 'https://example.com',
  loreSourceDir: '../Vault/Lore',
  vaultAssetDir: '../Vault/Assets',
  githubRepoUrl: 'https://github.com/your-name/your-codex',
  giscus: {
    repo: process.env.PUBLIC_GISCUS_REPO,
    repoId: process.env.PUBLIC_GISCUS_REPO_ID,
    category: process.env.PUBLIC_GISCUS_CATEGORY,
    categoryId: process.env.PUBLIC_GISCUS_CATEGORY_ID,
  },
};
