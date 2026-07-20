import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import starlightChangelogs, { makeChangelogsSidebarLinks } from 'starlight-changelogs';
import starlightGiscus from 'starlight-giscus';
import starlightScrollToTop from 'starlight-scroll-to-top';
import starlightSidebarSwipe from 'starlight-sidebar-swipe';
import siteGraph from 'starlight-site-graph/integration';
import starlightTags from 'starlight-tags';
import starlightTelescope from 'starlight-telescope';
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
      color: '#000000',
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
      content: '#000000',
    },
  },
];

const ga4MeasurementId = siteConfig.analytics?.ga4?.measurementId ?? 'G-XXXXXXXXXX';
const ga4Enabled = siteConfig.analytics?.ga4?.enabled === true;
// GA4 placeholder only. Keep disabled until PUBLIC_GA4_MEASUREMENT_ID is replaced
// with the real property ID and PUBLIC_GA4_ENABLED=1 is set in the deploy environment.
const ga4Head = ga4Enabled
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
    label: '[event] Releases',
    collapsed: false,
    items: [
      ...makeChangelogsSidebarLinks([
        {
          type: 'latest',
          base: 'releases',
          label: 'Latest release',
        },
        {
          type: 'all',
          base: 'releases',
          label: 'All releases',
        },
      ]),
    ],
  },
];

export default defineConfig({
  site: siteConfig.site,
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  integrations: [
    preact(),
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      pagefind: true,
      customCss: [
        'katex/dist/katex.min.css',
        './src/styles/ion-layers.css',
        './src/styles/color-tokens.css',
        './src/styles/ion-theme.css',
        './src/styles/ion-expressive-code.css',
        './src/styles/typography.css',
        './src/styles/content-media.css',
        './src/styles/codex-ui.css',
        './src/styles/navigation.css',
        './src/styles/header-controls.css',
        './src/styles/graph.css',
        './src/styles/timelines.css',
        './src/styles/maps.css',
        './src/styles/calendar.css',
        './src/styles/category-index.css',
        './src/styles/support.css',
        './src/styles/layout.css',
        './src/styles/a11y.css',
        './src/styles/era-styles.css',
        'starlight-site-graph/styles/layers.css',
        'starlight-site-graph/styles/common.css',
        'starlight-site-graph/styles/starlight.css',
      ],
      components: {
        Header: './src/components/CodexHeader.astro',
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
        starlightTags({ onInlineTagsNotFound: 'create' }),
        starlightChangelogs(),
        starlightGiscus(siteConfig.giscus),
        starlightScrollToTop(),
        starlightSidebarSwipe(),
        starlightTelescope(),
      ],
      sidebar,
      head: [...feedHead, ...webmentionHead, ...faviconHead, ...ga4Head],
      social: [{ icon: 'github', label: 'GitHub', href: siteConfig.githubRepoUrl }],
    }),
    siteGraph({ starlight: true, overridePageSidebar: false }),
    sitemap(),
    mdx(),
    ...(ga4Enabled
      ? [
          partytown({
            config: {
              forward: ['dataLayer.push'],
            },
          }),
        ]
      : []),
  ],
});
