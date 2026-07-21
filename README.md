# VISCERIUM Codex

This repository publishes the public VISCERIUM worldbuilding codex from an Obsidian vault into an Astro/Starlight site. Write lore in `Vault/`, mark finished public notes with frontmatter, and let the Astro/Starlight site in `Site/` build the Codex.

The main Codex currently builds as a static Cloudflare Pages site. The private contact form has been deferred so the Pages deployment can stay simple and stable.

## Folder structure

- `Vault/` — open this folder in Obsidian. Your lore source lives here.
- `Vault/Lore/` — only public/canon notes from this folder are published.
- `Vault/Drafts/`, `Vault/Private/`, `Vault/Stories/`, `Vault/System/`, `Vault/Templates/` — never published by the sync script.
- `Vault/Stories/` — private/offline narrative projects. StoryLine uses this as its project root; story files remain Markdown/YAML and are never Codex sources.
- `Vault/Assets/Images/` and `Vault/Assets/Maps/` — source assets copied to `Site/public/assets/` when referenced.
- `Site/` — Astro + Starlight website. Do not manually edit `Site/src/content/docs/` because it is regenerated.

## Write a public note

Add this frontmatter to a Markdown note inside `Vault/Lore/`:

```yaml
---
title: Example Title
description: "A short SEO-safe page description."
publish: true
status: canon
type: article
---
```

The public route is derived from the note path relative to `Vault/Lore/`, so moving a note changes its URL. The build fails if a public note is missing `title` or `description`, or does not use `status: canon`.

## Typography

The codex typography layer lives in `Site/src/styles/typography.css`.

- Display / H1 / site title: `Cinzel`
- Body prose: `Source Serif 4`
- UI, metadata, captions, tables, and lower headings: `IBM Plex Sans`
- Code, terminal fragments, and inline code: `IBM Plex Mono`
- Mathematical notation: compile-time KaTeX output

## Codex formatting tags

The sync script supports a controlled set of BBCode-like tags for worldbuilding layouts. Tags must be written on their own lines. Normal Markdown tables, inline Markdown, and fenced code blocks are left alone.

Equal columns:

```md
[cols]
[col]
Left content.
[/col]

[col]
Right content.
[/col]
[/cols]
```

Unequal columns:

```md
[cols:2-1 gap=lg]
[col]
Wide main text.
[/col]

[col]
Narrow sidebar.
[/col]
[/cols]
```

Twelve-column responsive row:

```md
[row]
[col:12 md:8]
Main article body.
[/col]

[col:12 md:4]
Sidebar body.
[/col]
[/row]
```

Cards:

```md
[card:accent]
Card content.
[/card]
```

Use Starlight's native aside syntax for callouts:

```md
:::note[Archivist note]
Note content.
:::

:::caution[Content warning]
Warning content.
:::

:::note[Recovered fragment]
In-world quoted text.
:::

<!-- Legacy drafts using these forms are still converted during sync. -->
[note:title="Archivist note"]
Note content.
[/note]
```

Equation panel:

````md
[equation:title="Resonance decay model"]
$$
R(t)=R_0e^{-\lambda t}
$$
[/equation]
````

Supported layout tags: `[cols]`, `[row]`, `[col]`, `[card]`, and `[equation]`. Legacy `[note]`, `[warning]`, and `[lore]` tags compile to native Starlight asides.

## Mathematical notation

The Markdown pipeline renders math at build time with `remark-math`, `rehype-katex`, and KaTeX. Use GitHub-style TeX delimiters in articles:

Inline math:

```md
Resonance decay can be represented as $R(t)=R_0e^{-\lambda t}$.
```

Display math:

```md
$$
R(t)=R_0e^{-\lambda t}
$$
```

Complex display equation:

```md
$$
\begin{aligned}
\mathcal{R}_{total}
  &= \sum_{i=1}^{n} \alpha_i \psi_i(t) \\
  &= \alpha_1 \psi_1(t) + \alpha_2 \psi_2(t) + \cdots + \alpha_n \psi_n(t)
\end{aligned}
$$
```

## Local setup

```bash
cd Site
npm install
npm run sync
npm run dev
npm run build
```

Use `npm run dev:sync` when you want to sync notes and start the local site in one command.

## Compression

Use the checked-in Obsidian Image Converter preset to create WebP artwork before publishing. Astro and Vite build the static assets, and Cloudflare Pages handles transfer compression when serving them. The build does not mutate source images or maintain parallel `.gz`/`.br` files. See [`Site/COMPRESSION.md`](Site/COMPRESSION.md).

## Cloudflare Pages settings

```text
Root directory: Site
Build command: npm run build
Build output directory: dist
Node version: 24
Environment variable: SITE_URL=https://codex.viscerium.co.uk
```

Set `SITE_URL` in Cloudflare to the real canonical URL before production launch. The build falls back to `https://codex.viscerium.co.uk` if it is unset.

No committed Wrangler file is required for the current Pages deployment. Keep any Resend/Turnstile secrets out of the static site until the contact form is moved to a separate Worker endpoint.

## Optional community integrations

- Webmentions: `Site/src/components/Webmentions.astro` displays responses collected for `codex.viscerium.co.uk` by Webmention.io.
- giscus comments: `starlight-giscus` uses this repository's General GitHub Discussions category.
- Ko-fi / Patreon / socials: placeholders live in `Site/src/config/supportLinks.mjs` and can be activated by adding real URLs.
- Sitemap: `@astrojs/sitemap` is installed and configured in `Site/astro.config.mjs`; it uses `siteConfig.site`, which is controlled by `SITE_URL`.
- Partytown: `@astrojs/partytown` is installed and configured in `Site/astro.config.mjs` with `dataLayer.push` forwarding for future GA4/GTM-style analytics.
- GA4/GTM and Cloudflare Web Analytics: add only public IDs through environment variables or Cloudflare settings.

## Site integrations and analytics placeholders

Installed Astro integrations are configured in `Site/astro.config.mjs`:

- `@astrojs/sitemap` generates the site map from the canonical `site` value. Set `SITE_URL` before production launch so generated URLs use the real domain.
- `@astrojs/partytown` is enabled only with GA4 and moves that third-party script off the main thread.

GA4 is intentionally placeholder-only. The code path exists, but it will not emit tracking scripts while the Measurement ID is still `G-XXXXXXXXXX`.

When proper GA4 tracking is ready, add the real public values in Cloudflare and local `Site/.env` files as needed:

```bash
PUBLIC_GA4_ENABLED=1
PUBLIC_GA4_MEASUREMENT_ID=G-REAL-MEASUREMENT-ID
```
