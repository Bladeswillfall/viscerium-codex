import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import lucode from 'lucode-starlight';

import { buildSidebar } from './sidebar.mjs';
import siteConfig from './site.config.mjs';

export default defineConfig({
  site: siteConfig.site,
  integrations: [
    starlight({
      title: 'VISCERIUM Codex',
      description: 'The public worldbuilding codex for VISCERIUM.',
      customCss: ['./src/styles/custom.css'],
      sidebar: await buildSidebar(),
      plugins: [
        lucode({
          navLinks: [
            { label: 'Docs', link: '/guides/getting-started/' },
            { label: 'API', link: '/reference/plugin-api/' },
          ],
        }),
      ],
    }),
  ],
});
