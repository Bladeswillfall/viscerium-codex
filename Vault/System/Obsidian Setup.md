# Obsidian Setup

Open only the `Vault/` folder in Obsidian.

## Required setup

1. Enable Obsidian's built-in **Templates** core plugin.
2. Enable Obsidian's built-in **Bases** core plugin. It is already enabled in the checked-in vault configuration.
3. Set the template folder location to `Templates`.
4. Write publishable lore in `Lore/`.
5. Keep drafts in `Drafts/`, private notes in `Private/`, and process notes and Bases in `System/`.
6. Put images in `Assets/Images/` and fictional map images in `Assets/Maps/`.

## WorldAnvil/Wikipedia-style writing workflow

The templates use a simple wiki-style shape:

- YAML frontmatter for machine-readable publishing fields and Bases.
- An Obsidian callout infobox near the top for quick reference while writing.
- A summary section first.
- Topic sections such as history, culture, relationships, geography, and related links.

Bases are authoring and browsing views over the same Markdown properties. Keep canonical information in the notes themselves rather than relying on view-only configuration.

This is intentionally plain Markdown so the vault remains portable. If you later want a more advanced published infobox or unit-card renderer, add an Astro/MDX component while keeping these Markdown templates usable in Obsidian.

Open only the `Vault/` folder in Obsidian. Use templates from `Vault/Templates/`. Put images in `Vault/Assets/Images/` and maps in `Vault/Assets/Maps/`.
