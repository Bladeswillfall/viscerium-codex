import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import starlightAutoSidebar from 'starlight-auto-sidebar';
import { starlightBasePath } from 'starlight-base-path';
import starlightGiscus from 'starlight-giscus';
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

const giscusPlugin = siteConfig.giscus.repo && siteConfig.giscus.repoId && siteConfig.giscus.category && siteConfig.giscus.categoryId
  ? starlightGiscus({
      repo: siteConfig.giscus.repo,
      repoId: siteConfig.giscus.repoId,
      category: siteConfig.giscus.category,
      categoryId: siteConfig.giscus.categoryId,
      mapping: 'pathname',
      reactions: true,
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      lazy: true,
    })
  : undefined;

export default defineConfig({
  site: siteConfig.site,
  integrations: [
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      customCss: [
        './vendor/starlight-ion-theme/styles/layers.css',
        './vendor/starlight-ion-theme/styles/theme.css',
        './vendor/starlight-ion-theme/styles/ec-theme.css',
        './src/styles/custom.css',
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
        ...(giscusPlugin ? [giscusPlugin] : []),
        starlightSiteGraph(),
      ],
      sidebar: await buildSidebar(),
      components: {
        Sidebar: './src/components/IonSidebar.astro',
        Footer: './src/components/StarlightFooter.astro',
        PageSidebar: './src/components/CodexPageSidebar.astro',
        PageTitle: './src/components/CodexPageTitle.astro',
      },
      editLink: {
        baseUrl: `${siteConfig.githubRepoUrl}/edit/main/Vault/Lore/`,
      },
      social: [{ icon: 'github', label: 'GitHub', href: siteConfig.githubRepoUrl }],
    }),
    sitemap(),
  ],
});
