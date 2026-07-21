const env = process.env;
const siteUrl = env.SITE_URL ?? 'https://codex.viscerium.co.uk';

const webmentionUsername = env.PUBLIC_WEBMENTION_IO_USERNAME || 'codex.viscerium.co.uk';
const webmentionEndpoint =
  env.PUBLIC_WEBMENTION_ENDPOINT ||
  (webmentionUsername ? `https://webmention.io/${webmentionUsername}/webmention` : undefined);
const webmentionPingbackEndpoint =
  env.PUBLIC_WEBMENTION_PINGBACK_ENDPOINT ||
  (webmentionUsername ? `https://webmention.io/${webmentionUsername}/xmlrpc` : undefined);
const webmentionMaxMentions = Number.parseInt(env.PUBLIC_WEBMENTIONS_MAX ?? '24', 10);
const feedMaxItems = Number.parseInt(env.PUBLIC_FEED_MAX_ITEMS ?? '50', 10);
const ga4MeasurementId = env.PUBLIC_GA4_MEASUREMENT_ID ?? 'G-XXXXXXXXXX';

export default {
  title: env.SITE_TITLE ?? 'VISCERIUM',
  description: env.SITE_DESCRIPTION ?? 'The public worldbuilding codex for VISCERIUM.',
  site: siteUrl,
  loreSourceDir: env.LORE_SOURCE_DIR ?? '../Vault/Lore',
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
    apiEndpoint: env.PUBLIC_WEBMENTION_API_ENDPOINT || 'https://webmention.io/api/mentions.jf2',
    maxMentions: Number.isFinite(webmentionMaxMentions) ? webmentionMaxMentions : 24,
  },
  analytics: {
    ga4: {
      // Placeholder only: replace PUBLIC_GA4_MEASUREMENT_ID with the real GA4 ID and
      // set PUBLIC_GA4_ENABLED=1 when proper GA4 tracking is ready to go live.
      enabled: env.PUBLIC_GA4_ENABLED === '1' && ga4MeasurementId !== 'G-XXXXXXXXXX',
      measurementId: ga4MeasurementId,
    },
  },
  giscus: {
    repo: env.PUBLIC_GISCUS_REPO || 'Bladeswillfall/viscerium-codex',
    repoId: env.PUBLIC_GISCUS_REPO_ID || 'R_kgDOTOi09Q',
    category: env.PUBLIC_GISCUS_CATEGORY || 'General',
    categoryId: env.PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDOTOi09c4DAmpR',
    mapping: env.PUBLIC_GISCUS_MAPPING ?? 'pathname',
    reactions: env.PUBLIC_GISCUS_REACTIONS_ENABLED !== '0',
    inputPosition: env.PUBLIC_GISCUS_INPUT_POSITION ?? 'bottom',
    theme: {
      dark: env.PUBLIC_GISCUS_DARK_THEME ?? env.PUBLIC_GISCUS_THEME ?? 'noborder_dark',
      light: env.PUBLIC_GISCUS_LIGHT_THEME ?? `${siteUrl}/giscus-light.css?v=4`,
      auto: env.PUBLIC_GISCUS_AUTO_THEME ?? `${siteUrl}/giscus-auto.css?v=4`,
    },
    lazy: env.PUBLIC_GISCUS_LOADING !== 'eager',
  },
};