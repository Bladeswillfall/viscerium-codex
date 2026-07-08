const env = process.env;

const webmentionUsername = env.PUBLIC_WEBMENTION_IO_USERNAME;
const webmentionEndpoint =
  env.PUBLIC_WEBMENTION_ENDPOINT ??
  (webmentionUsername ? `https://webmention.io/${webmentionUsername}/webmention` : undefined);
const webmentionPingbackEndpoint =
  env.PUBLIC_WEBMENTION_PINGBACK_ENDPOINT ??
  (webmentionUsername ? `https://webmention.io/${webmentionUsername}/xmlrpc` : undefined);
const webmentionMaxMentions = Number.parseInt(env.PUBLIC_WEBMENTIONS_MAX ?? '24', 10);
const feedMaxItems = Number.parseInt(env.PUBLIC_FEED_MAX_ITEMS ?? '50', 10);

export default {
  title: 'VISCERIUM',
  description: 'The public worldbuilding codex for VISCERIUM.',
  site: env.SITE_URL ?? 'https://viscerium-codex.pages.dev',
  loreSourceDir: '../Vault/Lore',
  vaultAssetDir: '../Vault/Assets',
  githubRepoUrl: 'https://github.com/Bladeswillfall/viscerium-codex',
  feeds: {
    title: env.PUBLIC_FEED_TITLE ?? 'VISCERIUM Codex',
    description: env.PUBLIC_FEED_DESCRIPTION ?? 'Latest public canon updates from the VISCERIUM codex.',
    language: env.PUBLIC_FEED_LANGUAGE ?? 'en',
    maxItems: Number.isFinite(feedMaxItems) ? feedMaxItems : 50,
  },
  webmentions: {
    enabled: env.PUBLIC_WEBMENTIONS_ENABLED !== '0' && Boolean(webmentionEndpoint),
    endpoint: webmentionEndpoint,
    pingbackEndpoint: webmentionPingbackEndpoint,
    apiEndpoint: env.PUBLIC_WEBMENTION_API_ENDPOINT ?? 'https://webmention.io/api/mentions.jf2',
    maxMentions: Number.isFinite(webmentionMaxMentions) ? webmentionMaxMentions : 24,
  },
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
