# VISCERIUM Codex

This repository publishes the public VISCERIUM worldbuilding codex from an Obsidian vault into an Astro/Starlight site. Write lore in `Vault/`, mark finished public notes with frontmatter, and let the Astro/Starlight site in `Site/` build the Codex.

The main Codex currently builds as a static Cloudflare Pages site. The private contact form has been deferred so the Pages deployment can stay simple and stable.

## Folder structure

- `Vault/` — open this folder in Obsidian. Your lore source lives here.
- `Vault/Lore/` — only public/canon notes from this folder are published.
- `Vault/Drafts/`, `Vault/Private/`, `Vault/System/`, `Vault/Templates/` — never published by the sync script.
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
slug: example/example-title
type: article
---
```

The build fails if a public note is missing `title`, `description`, `slug`, or `type`.

## Typography

The codex typography layer lives in `Site/src/styles/typography.css`.

- Display / H1 / site title: `Cinzel`
- Body prose: `Source Serif 4`
- UI, metadata, captions, tables, and lower headings: `IBM Plex Sans`
- Code, terminal fragments, and inline code: `IBM Plex Mono`
- Mathematical notation: MathJax CommonHTML output

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

Cards and callouts:

```md
[card:accent]
Card content.
[/card]

[note:title="Archivist note"]
Note content.
[/note]

[warning:title="Content warning"]
Warning content.
[/warning]

[lore:title="Recovered fragment"]
In-world quoted text.
[/lore]
```

Equation panel:

````md
[equation:title="Resonance decay model"]
```math
R(t)=R_0e^{-\lambda t}
```
[/equation]
````

Supported layout tags: `[cols]`, `[row]`, `[col]`, `[card]`, `[note]`, `[warning]`, `[lore]`, and `[equation]`.

## Mathematical notation

The codex loads MathJax on every Starlight page through `Site/src/components/CodexMath.astro`. Use GitHub-style TeX delimiters in articles:

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

Complex fenced equation:

````md
```math
\begin{aligned}
\mathcal{R}_{total}
  &= \sum_{i=1}^{n} \alpha_i \psi_i(t) \\
  &= \alpha_1 \psi_1(t) + \alpha_2 \psi_2(t) + \cdots + \alpha_n \psi_n(t)
\end{aligned}
```
````

## Local setup

```bash
cd Site
npm install
npm run sync
npm run dev
npm run build
```

Use `npm run dev:sync` when you want to sync notes and start the local site in one command.

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

- Unified page discussion: this template renders one **Page discussion** section at the bottom of every Starlight page from `Site/src/components/GiscusComments.astro`.
- Webmentions: the same section can display wider-web comments, replies, likes, reposts, bookmarks, and mentions collected by Webmention.io.
- giscus comments: GitHub Discussions still render in the same section, beneath wider-web responses, instead of becoming a competing second comment box.
- Ko-fi / Patreon / socials: placeholders live in `Site/src/config/supportLinks.mjs` and can be activated by adding real URLs.
- Sitemap: `@astrojs/sitemap` is installed and configured in `Site/astro.config.mjs`; it uses `siteConfig.site`, which is controlled by `SITE_URL`.
- Partytown: `@astrojs/partytown` is installed and configured in `Site/astro.config.mjs` with `dataLayer.push` forwarding for future GA4/GTM-style analytics.
- GA4/GTM and Cloudflare Web Analytics: add only public IDs through environment variables or Cloudflare settings.

## Site integrations and analytics placeholders

Installed Astro integrations are configured in `Site/astro.config.mjs`:

- `@astrojs/sitemap` generates the site map from the canonical `site` value. Set `SITE_URL` before production launch so generated URLs use the real domain.
- `@astrojs/partytown` moves supported third-party scripts off the main thread. It currently forwards `dataLayer.push` so the GA4 placeholder can work once it is properly enabled.

GA4 is intentionally placeholder-only. The code path exists, but it will not emit tracking scripts while the Measurement ID is still `G-XXXXXXXXXX`.

When proper GA4 tracking is ready, add the real public values in Cloudflare and local `Site/.env` files as needed:

```bash
PUBLIC_GA4_ENABLED=1
PUBLIC_GA4_MEASUREMENT_ID=G-REAL_MEASUREMENT_ID
```
