import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import starlightAutoSidebar from 'starlight-auto-sidebar';
import { starlightBasePath } from 'starlight-base-path';
import starlightHeadingBadges from 'starlight-heading-badges';
import { starlightIconsPlugin } from 'starlight-plugin-icons';
import starlightScrollToTop from 'starlight-scroll-to-top';
import starlightSidebarSwipe from 'starlight-sidebar-swipe';
import starlightSiteGraph from 'starlight-site-graph';
import starlightTags from 'starlight-tags';
import starlightTelescope from 'starlight-telescope';
import starlightUiTweaks from 'starlight-ui-tweaks';
import mdx from '@astrojs/mdx';
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

export default defineConfig({
  site: siteConfig.site,
  integrations: [
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      head: [...feedHead, ...webmentionHead],
      customCss: [
        './vendor/starlight-ion-theme/styles/layers.css',
        './vendor/starlight-ion-theme/styles/theme.css',
        './vendor/starlight-ion-theme/styles/ec-theme.css',
        './src/styles/typography.css',
        './src/styles/codex-ui.css',
        './src/styles/content-media.css',
        './src/styles/custom.css',
        './src/styles/calendar.css',
        './src/styles/layout-overrides.css',
      ],
      plugins: [
        starlightBasePath(),
        starlightTags({
          sidebar: {
            position: 'bottom',
            collapsed: true,
          },
        }),
        starlightTelescope(),
        starlightSidebarSwipe(),
        starlightIconsPlugin({
          codeblock: true,
          sidebar: true,
        }),
        starlightHeadingBadges(),
        starlightUiTweaks(),
        starlightScrollToTop(),
        starlightAutoSidebar(),
        starlightSiteGraph(),
      ],
      sidebar: await buildSidebar(),
      components: {
        Sidebar: './src/components/IonSidebar.astro',
        Footer: './src/components/StarlightFooter.astro',
        PageSidebar: './src/components/CodexPageSidebar.astro',
        PageTitle: './src/components/CodexPageTitle.astro',
        TwoColumnContent: './src/components/CodexTwoColumnContent.astro',
      },
      social: [{ icon: 'github', label: 'GitHub', href: siteConfig.githubRepoUrl }],
    }),
    mdx(),
    sitemap(),
  ],
});
