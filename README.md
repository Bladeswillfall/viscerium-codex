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
Environment variable: SITE_URL=https://your-production-domain.example
```

Set `SITE_URL` in Cloudflare Pages to your real canonical URL before production launch. The build falls back to `https://viscerium-codex.pages.dev` if it is unset.

## GitHub template use

Create a new repository from this template, replace the example lore with your project, update `Site/site.config.mjs`, push to GitHub, then connect the repo to Cloudflare Pages.

## Optional community integrations

- giscus comments: create a giscus app setup, then add the generated script to a custom Starlight component. Do not commit secrets.
- Buttondown/newsletter: add your public form endpoint as an environment variable or documented placeholder.
- GA4/GTM and Cloudflare Web Analytics: add only public IDs through environment variables or Cloudflare settings.

## Enable collapsible GitHub comments

This template includes a collapsed **Page comments** section at the bottom of Starlight pages. It uses [giscus](https://giscus.app/) and stays in placeholder mode until configured.

Actions for you:

1. Enable **GitHub Discussions** in your repository.
2. Install the giscus GitHub app for the repository.
3. Go to `https://giscus.app/` and choose your repository and discussion category.
4. Add these public environment variables in Cloudflare Pages and in a local `.env` file if needed:

```bash
PUBLIC_GISCUS_REPO=owner/repo
PUBLIC_GISCUS_REPO_ID=your_repo_id
PUBLIC_GISCUS_CATEGORY=General
PUBLIC_GISCUS_CATEGORY_ID=your_category_id
```

Do not commit secrets. These giscus values are public identifiers, but keeping them in environment variables makes the template reusable.
