import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import siteConfig from './site.config.mjs';

export default defineConfig({
  site: siteConfig.site,
  integrations: [
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Codex',
          items: [{ autogenerate: { directory: '.' } }],
        },
      ],
    }),
  ],
});
