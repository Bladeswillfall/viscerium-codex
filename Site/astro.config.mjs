import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'VISCERIUM Codex',
      description: 'The public worldbuilding codex for VISCERIUM.',
      customCss: ['./src/styles/custom.css'],

      sidebar: [
        {
          label: 'Codex',
          items: [
            { slug: 'index' },
            { autogenerate: { directory: 'characters' } },
            { autogenerate: { directory: 'eras' } },
            { autogenerate: { directory: 'events' } },
            { autogenerate: { directory: 'factions' } },
            { autogenerate: { directory: 'locations' } },
          ],
        },
      ],
    }),
  ],
});
