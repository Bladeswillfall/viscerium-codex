import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';

import { buildSidebar } from './sidebar.mjs';
import siteConfig from './site.config.mjs';

export default defineConfig({
  site: siteConfig.site,
  integrations: [
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      customCss: ['./src/styles/custom.css'],
      sidebar: await buildSidebar(),
      components: {
        Footer: './src/components/StarlightFooter.astro',
      },
      editLink: {
        baseUrl: `${siteConfig.githubRepoUrl}/edit/main/Vault/Lore/`,
      },
      social: [{ icon: 'github', label: 'GitHub', href: siteConfig.githubRepoUrl }],
    }),
    sitemap(),
  ],
});
