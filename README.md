# Obsidian → Astro Starlight Worldbuilding Codex Template

This repository is a beginner-friendly template for publishing a public worldbuilding codex from an Obsidian vault. Write lore in `Vault/`, mark finished public notes with frontmatter, and let the Astro/Starlight site in `Site/` build a static website for Cloudflare Pages.

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
Node version: 22.12.0
Environment variable: SITE_URL=https://your-production-domain.example
```

Set `SITE_URL` in Cloudflare Pages to your real canonical URL before production launch. The build falls back to `https://viscerium-codex.pages.dev` if it is unset.

## GitHub template use

Create a new repository from this template, replace the example lore with your project, update `Site/site.config.mjs`, push to GitHub, then connect the repo to Cloudflare Pages.

## Optional community integrations

- Unified page discussion: this template renders one **Page discussion** section at the bottom of every Starlight page from `Site/src/components/GiscusComments.astro`.
- Webmentions: the same section can display wider-web comments, replies, likes, reposts, bookmarks, and mentions collected by Webmention.io.
- giscus comments: GitHub Discussions still render in the same section, beneath wider-web responses, instead of becoming a competing second comment box.
- Buttondown/newsletter: add your public form endpoint as an environment variable or documented placeholder.
- GA4/GTM and Cloudflare Web Analytics: add only public IDs through environment variables or Cloudflare settings.

## Enable Webmentions

This template uses Webmention.io as the Webmention receiver/display API because it works cleanly with a static Cloudflare Pages site. Bridgy and Bridgy Fed can then be used as bridges that feed social/fediverse responses into Webmention.io.

Actions for you:

1. Set `SITE_URL` to the final canonical domain first.
2. Sign in to Webmention.io with that domain.
3. Add the required public environment variable in Cloudflare Pages and in a local `Site/.env` file if needed.
4. Redeploy the site so Starlight emits the `<link rel="webmention">` discovery tag in every page head.
5. Connect Bridgy classic if you want backfeed from existing social accounts, or Bridgy Fed if you want the site itself bridged into the fediverse/Bluesky-style networks.

Required variable:

```bash
PUBLIC_WEBMENTION_IO_USERNAME=your-domain.example
```

Optional variables:

```bash
PUBLIC_WEBMENTIONS_ENABLED=1
PUBLIC_WEBMENTIONS_MAX=24
PUBLIC_WEBMENTION_ENDPOINT=https://webmention.io/your-domain.example/webmention
PUBLIC_WEBMENTION_PINGBACK_ENDPOINT=https://webmention.io/your-domain.example/xmlrpc
PUBLIC_WEBMENTION_API_ENDPOINT=https://webmention.io/api/mentions.jf2
```

Set `PUBLIC_WEBMENTIONS_ENABLED=0` to hide the Webmention portion without removing the code.

## Enable collapsible GitHub comments

This template includes the GitHub Discussions portion inside the same **Page discussion** section. It uses [giscus](https://giscus.app/) and stays in visible setup-warning mode until configured.

Actions for you:

1. Enable **GitHub Discussions** in your repository.
2. Install the giscus GitHub app for the repository.
3. Go to `https://giscus.app/` and choose your repository and discussion category.
4. Add the required public environment variables in Cloudflare Pages and in a local `Site/.env` file if needed.

Required variables:

```bash
PUBLIC_GISCUS_REPO_ID=your_repo_id
PUBLIC_GISCUS_CATEGORY_ID=your_category_id
```

The repo and category names already default to this project and `General`, but you can override them:

```bash
PUBLIC_GISCUS_REPO=Bladeswillfall/viscerium-codex
PUBLIC_GISCUS_CATEGORY=General
```

Optional variables:

```bash
PUBLIC_GISCUS_MAPPING=pathname
PUBLIC_GISCUS_STRICT=0
PUBLIC_GISCUS_REACTIONS_ENABLED=1
PUBLIC_GISCUS_EMIT_METADATA=0
PUBLIC_GISCUS_INPUT_POSITION=bottom
PUBLIC_GISCUS_THEME=noborder_dark
PUBLIC_GISCUS_LANG=en
PUBLIC_GISCUS_LOADING=lazy
```

Do not commit secrets. These giscus and Webmention values are public identifiers, but keeping them in environment variables makes the template reusable.
