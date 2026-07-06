import { defineConfig, presetIcons } from 'unocss';

export default defineConfig({
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|html|mjs)($|\?)/,
      ],
    },
    filesystem: [
      'astro.config.mjs',
    ],
  },
  presets: [
    presetIcons(),
  ],
});
