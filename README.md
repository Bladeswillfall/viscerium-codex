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
