import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Loreforge Codex',
      description: 'A public worldbuilding codex generated from an Obsidian vault.',
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
