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
          label: 'Start Here',
          items: ['index'],
        },
        {
          label: 'Characters',
          items: [{ autogenerate: { directory: 'characters' } }],
        },
        {
          label: 'Eras',
          items: [{ autogenerate: { directory: 'eras' } }],
        },
        {
          label: 'Events',
          items: [{ autogenerate: { directory: 'events' } }],
        },
        {
          label: 'Factions',
          items: [{ autogenerate: { directory: 'factions' } }],
        },
        {
          label: 'Locations',
          items: [{ autogenerate: { directory: 'locations' } }],
        },
      ],
    }),
  ],
});
