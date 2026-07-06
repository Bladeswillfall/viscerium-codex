import { defineConfig, presetIcons } from 'unocss';
import { presetStarlightIcons } from 'starlight-plugin-icons/uno';

const icons = {
  home: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 2 12h3v8h6v-5h2v5h6v-8h3L12 3Z"/></svg>',
  scroll: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 3h10a3 3 0 0 1 3 3v13a2 2 0 0 1-2 2H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 14a2 2 0 0 0 0 4h11v-2H7a2 2 0 0 1 0-4h11V6a1 1 0 0 0-1-1H7a2 2 0 0 0-2 2v10.54A3.98 3.98 0 0 1 7 17Z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm8.5 0a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7ZM8 13c4.42 0 7 2.24 7 5v2H1v-2c0-2.76 2.58-5 7-5Zm8.5.5c3.67 0 5.5 1.9 5.5 4.25V20h-5v-2c0-1.6-.7-3.02-1.9-4.1.43-.25.9-.4 1.4-.4Z"/></svg>',
  sword: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.7 3.3a1 1 0 0 1 0 1.4l-8.48 8.49 2.12 2.12-1.41 1.42-2.12-2.12-1.42 1.41 2.12 2.12-1.41 1.42-2.12-2.12-3.54 3.53-1.41-1.41 3.53-3.54-2.12-2.12 1.42-1.41L8 14.6l1.41-1.42-2.12-2.12 1.42-1.41 2.12 2.12L19.3 3.3a1 1 0 0 1 1.4 0Z"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h12l-1 4 1 4H7v10H5V3Zm2 2v4h7.44l-.5-2 .5-2H7Z"/></svg>',
  image: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h16V7H4Zm3 8 3-4 2.25 3L14 12l3 3H7Zm10-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6a2.5 2.5 0 0 0 0 5.5Z"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m15 5 6-2v16l-6 2-6-2-6 2V5l6-2 6 2Zm-1 1.75-4-1.33v11.83l4 1.33V6.75Zm2 11.83 3-1V5.78l-3 1v11.8Zm-8-1.33V5.42l-3 1v11.8l3-.97Z"/></svg>',
};

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
    presetStarlightIcons(),
    presetIcons({
      collections: {
        codex: icons,
      },
    }),
  ],
});
