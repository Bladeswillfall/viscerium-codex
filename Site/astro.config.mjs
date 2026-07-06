import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import Icons from 'starlight-plugin-icons'
import UnoCSS from '@unocss/vite';
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
import { ion } from "starlight-ion-theme";

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
    UnoCSS(),
    Icons({
      sidebar: true,
      extractSafelist: true,
      starlight: {
      title: siteConfig.title,
      description: siteConfig.description,
      customCss: ['./src/styles/custom.css'],
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
          extractSafelist: true,
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
        Footer: './src/components/StarlightFooter.astro',
        PageSidebar: './src/components/CodexPageSidebar.astro',
      },
      editLink: {
        baseUrl: `${siteConfig.githubRepoUrl}/edit/main/Vault/Lore/`,
      },
      social: [{ icon: 'github', label: 'GitHub', href: siteConfig.githubRepoUrl }],
    }),
    sitemap(),
    UnoCSS(),
  ],
  vite: {
    plugins: [UnoCSS()],
  },
});
