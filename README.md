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
```

Set your real canonical URL in `Site/site.config.mjs` and `Site/astro.config.mjs` via the `site` value before production launch.

## GitHub template use

Create a new repository from this template, replace the example lore with your project, update `Site/site.config.mjs`, push to GitHub, then connect the repo to Cloudflare Pages.

## Optional community integrations

- giscus comments: create a giscus app setup, then add the generated script to a custom Starlight component. Do not commit secrets.
- Buttondown/newsletter: add your public form endpoint as an environment variable or documented placeholder.
- GA4/GTM and Cloudflare Web Analytics: add only public IDs through environment variables or Cloudflare settings.

## Collapsible GitHub comments

This template includes a collapsed **Page comments** section at the bottom of Starlight pages. It uses [giscus](https://giscus.app/) and is already configured for `Bladeswillfall/viscerium-codex` with the `Announcements` discussion category.

Current defaults:

```bash
PUBLIC_GISCUS_REPO=Bladeswillfall/viscerium-codex
PUBLIC_GISCUS_REPO_ID=R_kgDOTOi09Q
PUBLIC_GISCUS_CATEGORY=Announcements
PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOTOi09c4DAmpQ
PUBLIC_GISCUS_INPUT_POSITION=top
PUBLIC_GISCUS_THEME=noborder_dark
```

Actions for you:

1. Confirm **GitHub Discussions** is enabled for the repository.
2. Confirm the giscus GitHub app is installed for the repository.
3. If you fork this template, override the public giscus values in Cloudflare Pages environment variables or in a local `.env` file.
4. Do not commit private secrets. These giscus values are public identifiers, but environment overrides keep forks reusable.

## WorldAnvil/Wikipedia-style page layout actions

The Obsidian templates now include wiki-style infobox callouts and section headings. Recommended setup:

1. In Obsidian, enable the built-in **Templates** plugin and set the template folder to `Templates`.
2. Optional: install **Templater** if you want automatic dates, prompts, or generated slugs.
3. Optional: install **Dataview** for private dashboard/index notes inside `Vault/System/`; do not rely on Dataview output for published pages unless you also write the final content in Markdown.
4. Optional: install **Editing Toolbar** or **Advanced Tables** if you prefer visual table editing for wiki-style infoboxes.
5. Use the callout infobox in each template for Obsidian readability. Later, you can replace it with Astro MDX components for richer published layouts.
6. Keep canonical public fields in frontmatter so Astro can generate maps, timelines, graph data, and SEO safely.
