import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import compress from '@playform/compress';
import starlightAutoSidebar from 'starlight-auto-sidebar';
import { starlightBasePath } from 'starlight-base-path';
import starlightChangelogs, { makeChangelogsSidebarLinks } from 'starlight-changelogs';
import starlightHeadingBadges from 'starlight-heading-badges';
import { starlightIconsPlugin } from 'starlight-plugin-icons';
import starlightScrollToTop from 'starlight-scroll-to-top';
import starlightSidebarSwipe from 'starlight-sidebar-swipe';
import starlightTags from 'starlight-tags';
import starlightTelescope from 'starlight-telescope';
import starlightUiTweaks from 'starlight-ui-tweaks';
import { progressiveCssColors } from './plugins/progressive-css-colors.mjs';
import { buildSidebar } from './sidebar.mjs';
import siteConfig from './site.config.mjs';

const compressSourceAssets = process.env.CODEX_COMPRESS_SOURCE_ASSETS === '1';
const sourceAssetCompressor = compressSourceAssets
  ? compress({
      Path: ['../Vault/Assets'],
      CSS: false,
      HTML: false,
      JavaScript: false,
      JSON: false,
      SVG: false,
      Map: {
        Image: '**/*.{avif,gif,png,tiff,webp}',
      },
      Image: {
        sharp: {
          avif: {
            chromaSubsampling: '4:4:4',
            effort: 9,
            lossless: true,
          },
          gif: {
            effort: 10,
          },
          png: {
            compressionLevel: 9,
            palette: false,
          },
          tiff: {
            compression: 'lzw',
          },
          webp: {
            effort: 6,
            lossless: true,
          },
          sharp: {
            failOn: 'error',
            sequentialRead: true,
            unlimited: true,
          },
        },
      },
    })
  : undefined;

const feedHead = [
  {
    tag: 'link',
    attrs: {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: `${siteConfig.feeds?.title ?? siteConfig.title} RSS`,
      href: '/rss.xml',
    },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'alternate',
      type: 'application/atom+xml',
      title: `${siteConfig.feeds?.title ?? siteConfig.title} Atom`,
      href: '/atom.xml',
    },
  },
];

const webmentionHead = siteConfig.webmentions?.enabled
  ? [
      siteConfig.webmentions.endpoint
        ? {
            tag: 'link',
            attrs: {
              rel: 'webmention',
              href: siteConfig.webmentions.endpoint,
            },
          }
        : undefined,
      siteConfig.webmentions.pingbackEndpoint
        ? {
            tag: 'link',
            attrs: {
              rel: 'pingback',
              href: siteConfig.webmentions.pingbackEndpoint,
            },
          }
        : undefined,
    ].filter(Boolean)
  : [];

const fontAwesomeHead = [
  {
    tag: 'link',
    attrs: {
      rel: 'preconnect',
      href: 'https://cdnjs.cloudflare.com',
      crossorigin: 'anonymous',
    },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
      crossorigin: 'anonymous',
      referrerpolicy: 'no-referrer',
    },
  },
];

const faviconPath = '/favicons/viscerium-favicon.svg';

const faviconHead = [
  {
    tag: 'link',
    attrs: {
      rel: 'icon',
      type: 'image/svg+xml',
      href: faviconPath,
    },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'shortcut icon',
      href: faviconPath,
    },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'mask-icon',
      href: '/favicons/viscerium-mask.svg',
      color: '#0b0b0d',
    },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  },
  {
    tag: 'meta',
    attrs: {
      name: 'theme-color',
      content: '#0b0b0d',
    },
  },
];

const ga4MeasurementId = siteConfig.analytics?.ga4?.measurementId ?? 'G-XXXXXXXXXX';

// GA4 placeholder only. Keep disabled until PUBLIC_GA4_MEASUREMENT_ID is replaced
// with the real property ID and PUBLIC_GA4_ENABLED=1 is set in the deploy environment.
const ga4Head = siteConfig.analytics?.ga4?.enabled
  ? [
      {
        tag: 'script',
        attrs: {
          type: 'text/partytown',
          async: true,
          src: `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`,
        },
      },
      {
        tag: 'script',
        attrs: {
          type: 'text/partytown',
          id: 'ga4-init',
          'data-ga4-measurement-id': ga4MeasurementId,
        },
        content: `
          const measurementId = document
            .getElementById('ga4-init')
            .getAttribute('data-ga4-measurement-id');

          window.dataLayer = window.dataLayer || [];
          function gtag() {
            dataLayer.push(arguments);
          }

          gtag('js', new Date());
          gtag('config', measurementId);
        `,
      },
    ]
  : [];

const sidebar = [
  ...(await buildSidebar()),
  {
    label: '[history] Changelogs',
    collapsed: false,
    items: [
      ...makeChangelogsSidebarLinks([
        {
          type: 'latest',
          base: 'changelog',
          label: 'Latest changes',
        },
        {
          type: 'all',
          base: 'changelog',
          label: 'Version history',
        },
        {
          type: 'recent',
          base: 'changelog',
          count: 3,
        },
      ]),
    ],
  },
];

export default defineConfig({
  site: siteConfig.site,
  vite: {
    plugins: [progressiveCssColors()],
  },
  integrations: [
    preact(),
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      customCss: [
        './vendor/starlight-ion-theme/styles/layers.css',
        './vendor/starlight-ion-theme/styles/theme.css',
        './vendor/starlight-ion-theme/styles/ec-theme.css',
        './src/styles/typography.css',
        './src/styles/codex-ui.css',
        './src/styles/custom.css',
        './src/styles/navigation.css',
        './src/styles/graph.css',
        './src/styles/timelines.css',
        './src/styles/maps.css',
        './src/styles/calendar.css',
        './src/styles/category-index.css',
        './src/styles/support.css',
        './src/styles/layout.css',
        './src/styles/color-tokens.css',
        './src/styles/a11y.css',
        './src/styles/era-styles.css',
      ],
      components: {
        Sidebar: './src/components/IonSidebar.astro',
        Footer: './src/components/StarlightFooter.astro',
        PageSidebar: './src/components/CodexPageSidebar.astro',
        PageTitle: './src/components/CodexPageTitle.astro',
        TwoColumnContent: './src/components/CodexTwoColumnContent.astro',
      },
      editLink: {
        baseUrl: `${siteConfig.githubRepoUrl}/edit/main/Vault/Lore/`,
      },
      plugins: [
        starlightHeadingBadges(),
        starlightTags(),
        starlightChangelogs(),
        starlightBasePath(),
        starlightAutoSidebar(),
        starlightUiTweaks(),
        starlightIconsPlugin(),
        starlightScrollToTop(),
        starlightSidebarSwipe(),
        starlightTelescope(),
      ],
      sidebar,
      head: [...feedHead, ...webmentionHead, ...fontAwesomeHead, ...faviconHead, ...ga4Head],
      social: [{ icon: 'github', label: 'GitHub', href: siteConfig.githubRepoUrl }],
    }),
    sitemap(),
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    ...(sourceAssetCompressor ? [sourceAssetCompressor] : []),
    compress({
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
          sortClassName: false,
        },
      },
    }),
  ],
});
