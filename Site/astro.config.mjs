import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import starlightAutoSidebar from 'starlight-auto-sidebar';
import { starlightBasePath } from 'starlight-base-path';
import starlightChangelogs, { makeChangelogsSidebarLinks } from 'starlight-changelogs';
import starlightHeadingBadges from 'starlight-heading-badges';
import { starlightIconsPlugin } from 'starlight-plugin-icons';
import starlightScrollToTop from 'starlight-scroll-to-top';
import starlightSidebarSwipe from 'starlight-sidebar-swipe';
import starlightSiteGraph from 'starlight-site-graph';
import starlightTags from 'starlight-tags';
import starlightTelescope from 'starlight-telescope';
import starlightUiTweaks from 'starlight-ui-tweaks';
import { buildSidebar } from './sidebar.mjs';
import siteConfig from './site.config.mjs';

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
  integrations: [
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      customCss: [
        './src/styles/typography.css',
        './src/styles/starlight-theme.css',
        './src/styles/sidebar-icons.css',
        './src/styles/sidebar-overlay.css',
        './src/styles/graph.css',
        './src/styles/timelines.css',
        './src/styles/maps.css',
        './src/styles/calendar.css',
        './src/styles/support.css',
      ],
      components: {
        PageFrame: './src/components/PageFrame.astro',
        PageTitle: './src/components/PageTitle.astro',
        TableOfContents: './src/components/RightSidebar.astro',
        Footer: './src/components/StarlightFooter.astro',
        LastUpdated: './src/components/LastUpdated.astro',
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
        starlightSiteGraph(),
        starlightIconsPlugin(),
        starlightScrollToTop(),
        starlightSidebarSwipe(),
        starlightTelescope(),
      ],
      sidebar,
      head: [...feedHead, ...webmentionHead, ...faviconHead, ...ga4Head],
    }),
    sitemap(),
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
});
