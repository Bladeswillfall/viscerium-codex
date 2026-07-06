# Obsidian Setup

Open only the `Vault/` folder in Obsidian.

## Required setup

1. Enable Obsidian's built-in **Templates** core plugin.
2. Set the template folder location to `Templates`.
3. Write publishable lore in `Lore/`.
4. Keep drafts in `Drafts/`, private notes in `Private/`, and process notes in `System/`.
5. Put images in `Assets/Images/` and fictional map images in `Assets/Maps/`.

## WorldAnvil/Wikipedia-style writing workflow

The templates use a simple wiki-style shape:

- YAML frontmatter for machine-readable publishing fields.
- An Obsidian callout infobox near the top for quick reference while writing.
- A summary section first.
- Topic sections such as history, culture, relationships, geography, and related links.

This is intentionally plain Markdown so the vault remains portable. If you later want a more advanced published infobox, add an Astro/MDX component while keeping these Markdown templates usable in Obsidian.
